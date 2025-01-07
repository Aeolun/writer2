import type {
  ContentNode,
  InventoryAction,
  PlotpointAction,
  Scene,
  SceneParagraph,
} from "@writer/shared";
import shortUUID from "short-uuid";
import { createStore } from "solid-js/store";
import { appendNode, removeNode, updateNode, insertNode, findParent } from "./tree";

import { removeEntityFromEmbeddingsCache } from "../embeddings/load-story-to-embeddings";

const scenesStateDefault = {
  scenes: {},
};
export const [scenesState, setScenesState] = createStore<{
  scenes: Record<string, Scene>;
}>(scenesStateDefault);

export const resetScenesState = () => {
  setScenesState("scenes", {});
};

export const createScene = (chapterId: string, beforeId?: string) => {
  const newScene = {
    id: shortUUID.generate(),
    type: "scene" as const,
    name: "New Scene",
    children: [],
    isOpen: true,
  };

  setScenesState("scenes", newScene.id, {
    id: newScene.id,
    title: newScene.name,
    summary: "",
    modifiedAt: Date.now(),
    characterIds: [],
    words: 0,
    paragraphs: [],
    plot_point_actions: [],
    text: "",
  } satisfies Scene);
  insertNode(newScene, chapterId, beforeId);

  return newScene;
};

export const updateSelectedSceneParagraph = (sceneId: string, paragraphId: string) => {
  setScenesState("scenes", sceneId, "selectedParagraph", paragraphId);
};

export const updateSceneData = (sceneId: string, data: Partial<Scene>) => {
  // if we're messing with something that touches all paragraphs, remove the whole shizzle from the cache
  for(const paragraph of scenesState.scenes[sceneId]?.paragraphs ?? []) {
    removeEntityFromEmbeddingsCache(`paragraph/${paragraph.id}`);
  }
  
  if (data.title) {
    updateNode(sceneId, {
      name: data.title,
    });
  }
  setScenesState("scenes", sceneId, {
    ...data,
    modifiedAt: Date.now(),
  });
};

export const updateSceneCursor = (sceneId: string, cursor: number) => {
  setScenesState("scenes", sceneId, "cursor", cursor);
};

export const updateSceneSelectedParagraph = (
  sceneId: string,
  paragraphId: string,
) => {
  setScenesState("scenes", sceneId, "selectedParagraph", paragraphId);
};

export const getWordCount = (
  text: string | ContentNode,
): {
  words: number;
  characters: number;
} => {
  if (typeof text === "string") {
    return {
      words: text.split(" ").length,
      characters: text.length,
    };
  }
  let characterCount = 0;
  const wordCount = text.content.reduce((acc, node) => {
    return (
      acc +
      (node.content?.reduce((acc, textNode) => {
        characterCount += textNode.text.length;
        return acc + textNode.text.split(" ").length;
      }, 0) ?? 0)
    );
  }, 0);
  return {
    words: wordCount,
    characters: characterCount,
  };
};

export const splitScene = (sceneId: string, paragraphId: string) => {
  const scene = scenesState.scenes[sceneId];
  if (!scene) {
    throw new Error(`Scene ${sceneId} not found`);
  }

  const paragraphIndex = scene.paragraphs.findIndex(
    (p) => p.id === paragraphId,
  );
  if (paragraphIndex === -1) {
    throw new Error(`Paragraph ${paragraphId} not found in scene ${sceneId}`);
  }

  const parentNode = findParent(sceneId);

  if (!parentNode) {
    throw new Error(`Scene ${sceneId} has no parent`);
  }

  const newSceneId = shortUUID.generate();
  const newSceneParagraphs = scene.paragraphs.slice(paragraphIndex);
  const oldSceneParagraphs = scene.paragraphs.slice(0, paragraphIndex);

  setScenesState("scenes", sceneId, {
    paragraphs: oldSceneParagraphs,
    words: oldSceneParagraphs.reduce((acc, p) => acc + (p.words ?? 0), 0),
    hasAI: oldSceneParagraphs.some((p) => p.state === "ai"),
    modifiedAt: Date.now(),
  });

  setScenesState("scenes", newSceneId, {
    id: newSceneId,
    title: `${scene.title} (Part 2)`,
    words: newSceneParagraphs.reduce((acc, p) => acc + (p.words ?? 0), 0),
    hasAI: newSceneParagraphs.some((p) => p.state === "ai"),
    paragraphs: newSceneParagraphs,
    plot_point_actions: [],
    text: "",
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Scene);

  appendNode(
    {
      id: newSceneId,
      type: "scene",
      name: `${scene.title} (Part 2)`,
      isOpen: true,
    },
    parentNode.id,
  );
};

export const updateSceneParagraphData = (
  sceneId: string,
  paragraphId: string,
  data: Partial<SceneParagraph>,
) => {
  const dataToUpdate = { ...data };
  const currentParagraph = scenesState.scenes[sceneId].paragraphs.find(
    (p) => p.id === paragraphId,
  );
  if (!currentParagraph) {
    throw new Error(`Paragraph ${paragraphId} not found in scene ${sceneId}`);
  }

  // Handle text changes and character counting
  if (data.text) {
    const newCounts = getWordCount(data.text);
    const currentCounts = getWordCount(currentParagraph.text);
    dataToUpdate.words = newCounts.words;

    // Initialize character counts if they don't exist
    if (currentParagraph.aiCharacters === undefined) {
      currentParagraph.aiCharacters = currentParagraph.state === "ai" ? currentCounts.characters : 0;
    }
    if (currentParagraph.humanCharacters === undefined) {
      currentParagraph.humanCharacters = currentParagraph.state === "ai" ? 0 : currentCounts.characters;
    }

    // Calculate the change in characters
    const characterDifference = newCounts.characters - currentCounts.characters;

    if (characterDifference >= 0) {
      // Adding characters - always counts as human characters
      dataToUpdate.humanCharacters = (currentParagraph.humanCharacters ?? 0) + characterDifference;
      dataToUpdate.aiCharacters = currentParagraph.aiCharacters ?? 0;
    } else {
      // Removing characters - first reduce AI characters if they exist
      const remainingAiChars = Math.max(0, (currentParagraph.aiCharacters ?? 0) + characterDifference);
      const aiCharactersReduced = (currentParagraph.aiCharacters ?? 0) - remainingAiChars;
      const remainingDifference = characterDifference + aiCharactersReduced;

      dataToUpdate.aiCharacters = remainingAiChars;
      dataToUpdate.humanCharacters = Math.max(0, (currentParagraph.humanCharacters ?? 0) + remainingDifference);
    }

    // Change to draft only when human edits exceed AI content
    if (dataToUpdate.humanCharacters && dataToUpdate.aiCharacters && 
        dataToUpdate.humanCharacters > dataToUpdate.aiCharacters) {
      dataToUpdate.state = "draft";
    }
  }

  // Handle state changes
  if (data.state && data.state !== currentParagraph.state) {
    const currentCounts = getWordCount(currentParagraph.text);
    if (data.state === "ai") {
      dataToUpdate.aiCharacters = currentCounts.characters;
      dataToUpdate.humanCharacters = 0;
    } else {
      dataToUpdate.humanCharacters = currentCounts.characters;
      dataToUpdate.aiCharacters = 0;
    }
  }

  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    dataToUpdate,
  );

  if (data.text) {
    const allWords = scenesState.scenes[sceneId].paragraphs
      .map((p) => p.words)
      .reduce((acc, words) => (acc ?? 0) + (words ?? 0), 0);
    const hasAi = scenesState.scenes[sceneId].paragraphs.some(
      (p) => p.state === "ai",
    );
    removeEntityFromEmbeddingsCache(`paragraph/${paragraphId}`);
    setScenesState(
      "scenes",
      sceneId,
      () =>
        ({
          modifiedAt: Date.now(),
          words: allWords,
          hasAI: hasAi,
        }) satisfies Partial<Scene>,
    );
  }
};

export const removePlotpointFromSceneParagraph = (
  sceneId: string,
  paragraphId: string,
  plotpointId: string,
) => {
  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    "plot_point_actions",
    (actions) => actions?.filter((a) => a.plot_point_id !== plotpointId),
  );
};

export const addPlotpointActionToSceneParagraph = (
  sceneId: string,
  paragraphId: string,
  plotpoint: PlotpointAction,
) => {
  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    "plot_point_actions",
    (actions) => [...(actions ?? []), plotpoint],
  );
};

export const removeInventoryFromSceneParagraph = (
  sceneId: string,
  paragraphId: string,
  itemId: string,
) => {
  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    "inventory_actions",
    (actions) => actions?.filter((a) => a.item_name !== itemId),
  );
};

export const addInventoryActionToSceneParagraph = (
  sceneId: string,
  paragraphId: string,
  inventory: InventoryAction,
) => {
  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    "inventory_actions",
    (actions) => [...(actions ?? []), inventory],
  );
};

export const moveParagraphUp = (sceneId: string, paragraphId: string) => {
  removeEntityFromEmbeddingsCache(`paragraph/${paragraphId}`);
  setScenesState("scenes", sceneId, "paragraphs", (p) => {
    const index = p.findIndex((p) => p.id === paragraphId);
    if (index === -1) return p;
    return [
      ...p.slice(0, index - 1),
      p[index],
      p[index - 1],
      ...p.slice(index + 1),
    ];
  });
};

export const moveParagraphDown = (sceneId: string, paragraphId: string) => {
  removeEntityFromEmbeddingsCache(`paragraph/${paragraphId}`);
  setScenesState("scenes", sceneId, "paragraphs", (p) => {
    const index = p.findIndex((p) => p.id === paragraphId);
    if (index === -1) return p;
    return [
      ...p.slice(0, index),
      p[index + 1],
      p[index],
      ...p.slice(index + 2),
    ];
  });
};

export const removeSceneParagraph = (sceneId: string, paragraphId: string) => {
  removeEntityFromEmbeddingsCache(`paragraph/${paragraphId}`);
  setScenesState("scenes", sceneId, "paragraphs", (p) => {
    return p.filter((p) => p.id !== paragraphId);
  });
};

export const createSceneParagraph = (
  sceneId: string,
  paragraph: SceneParagraph,
  afterParagraphId?: string,
) => {
  let insertIndex = scenesState.scenes[sceneId].paragraphs.length;
  if (afterParagraphId) {
    const afterParagraph = scenesState.scenes[sceneId].paragraphs.find(
      (p) => p.id === afterParagraphId,
    );
    if (afterParagraph) {
      insertIndex =
        scenesState.scenes[sceneId].paragraphs.indexOf(afterParagraph) + 1;
    }
  }
  if (paragraph.state === "ai") {
    paragraph.aiCharacters = getWordCount(paragraph.text).characters;
  } else {
    paragraph.humanCharacters = getWordCount(paragraph.text).characters;
  }

  setScenesState("scenes", sceneId, "paragraphs", (p) => [
    ...(p ?? []).slice(0, insertIndex),
    paragraph,
    ...(p ?? []).slice(insertIndex),
  ]);
  const words = getWordCount(paragraph.text);
  setScenesState("scenes", sceneId, (s) => {
    return {
      cursor: 0,
      words: (s.words ?? 0) + (words.words ?? 0),
      selectedParagraph: paragraph.id,
    };
  });
};

export const deleteScene = (sceneId: string) => {
  // Remove all paragraphs from the embeddings cache
  for (const paragraph of scenesState.scenes[sceneId]?.paragraphs ?? []) {
    removeEntityFromEmbeddingsCache(`paragraph/${paragraph.id}`);
  }
  // @ts-expect-error: this is a valid way to delete
  setScenesState("scenes", sceneId, undefined);
  removeNode(sceneId);
};

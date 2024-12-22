import type {
  ContentNode,
  InventoryAction,
  PlotpointAction,
  Scene,
  SceneParagraph,
} from "@writer/shared";
import shortUUID from "short-uuid";
import { createStore } from "solid-js/store";
import { appendNode, removeNode, updateNode, insertNode } from "./tree";
import { removeEntityFromEmbeddingsCache } from "../embeddings/load-story-to-embeddings";

export const [scenesState, setScenesState] = createStore<{
  scenes: Record<string, Scene>;
}>({
  scenes: {},
});

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

export const updateSceneParagraph = (sceneId: string, paragraphId: string) => {
  setScenesState("scenes", sceneId, "selectedParagraph", paragraphId);
};

export const updateSceneData = (sceneId: string, data: Partial<Scene>) => {
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

export const getWordCount = (text: string | ContentNode) => {
  if (typeof text === "string") {
    return text.split(" ").length;
  }
  return text.content.reduce((acc, node) => {
    return (
      acc +
      (node.content?.reduce((acc, textNode) => {
        return acc + textNode.text.split(" ").length;
      }, 0) ?? 0)
    );
  }, 0);
};

export const updateSceneParagraphData = (
  sceneId: string,
  paragraphId: string,
  data: Partial<SceneParagraph>,
) => {
  const dataToUpdate = { ...data };
  if (data.text) {
    dataToUpdate.words = getWordCount(data.text);
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
    console.log("hasAi", hasAi);
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

  setScenesState("scenes", sceneId, "paragraphs", (p) => [
    ...(p ?? []).slice(0, insertIndex),
    paragraph,
    ...(p ?? []).slice(insertIndex),
  ]);
  const words = getWordCount(paragraph.text);
  setScenesState("scenes", sceneId, (s) => {
    return {
      cursor: 0,
      words: (s.words ?? 0) + (words ?? 0),
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

export const splitScene = (sceneId: string, paragraphId: string) => {
  const scene = scenesState.scenes[sceneId];
  const paragraphIndex = scene.paragraphs.findIndex(
    (p) => p.id === paragraphId,
  );
  if (paragraphIndex === -1) return;

  const newSceneId = shortUUID.generate();
  const newParagraphs = scene.paragraphs.slice(paragraphIndex);
  const remainingParagraphs = scene.paragraphs.slice(0, paragraphIndex);

  // Remove embeddings for all paragraphs that will be in the new scene
  // since their sceneId will change
  for (const paragraph of newParagraphs) {
    removeEntityFromEmbeddingsCache(`paragraph/${paragraph.id}`);
  }

  setScenesState("scenes", sceneId, "paragraphs", remainingParagraphs);
  setScenesState("scenes", newSceneId, {
    id: newSceneId,
    title: "Split scene",
    words: newParagraphs.reduce((acc, p) => acc + (p.words ?? 0), 0),
    hasAI: newParagraphs.some((p) => p.state === "ai"),
    paragraphs: newParagraphs,
    plot_point_actions: [],
    text: "",
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Scene);

  appendNode(
    { id: newSceneId, type: "scene", name: "Split scene", isOpen: true },
    sceneId,
  );
};

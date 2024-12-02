import {
  ContentNode,
  InventoryAction,
  PlotpointAction,
  Scene,
  SceneParagraph,
} from "@writer/shared";
import shortUUID from "short-uuid";
import { createStore } from "solid-js/store";
import { appendNode, removeNode, updateNode } from "./tree";
import { removeEntityFromEmbeddingsCache } from "../embeddings/load-story-to-embeddings";

export const [scenesState, setScenesState] = createStore<{
  scenes: Record<string, Scene>;
}>({
  scenes: {},
});

export const createScene = (parentId: string) => {
  const id = shortUUID.generate();
  setScenesState("scenes", id, {
    id,
    title: "New scene",
    words: 0,
    hasAI: false,
    paragraphs: [],
    plot_point_actions: [],
    text: "",
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Scene);
  appendNode({ id, type: "scene", name: "New scene", isOpen: true }, parentId);
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
  setScenesState("scenes", sceneId, (s) => {
    return {
      cursor: 0,
      selectedParagraph: paragraph.id,
    };
  });
};

export const deleteScene = (sceneId: string) => {
  // @ts-expect-error: this is a valid way to delete
  setScenesState("scenes", sceneId, undefined);
  removeNode(sceneId);
};

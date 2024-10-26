import {
  InventoryAction,
  PlotpointAction,
  Scene,
  SceneParagraph,
} from "@writer/shared";
import { createStore } from "solid-js/store";

export const [scenesState, setScenesState] = createStore<{
  scenes: Record<string, Scene>;
}>({
  scenes: {},
});

export const updateSceneParagraph = (sceneId: string, paragraphId: string) => {
  setScenesState("scenes", sceneId, "selectedParagraph", paragraphId);
};

export const updateSceneData = (sceneId: string, data: Partial<Scene>) => {
  setScenesState("scenes", sceneId, data);
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

export const updateSceneParagraphData = (
  sceneId: string,
  paragraphId: string,
  data: Partial<SceneParagraph>,
) => {
  setScenesState(
    "scenes",
    sceneId,
    "paragraphs",
    (p) => p.id === paragraphId,
    data,
  );
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
export const createSceneParagraph = (
  sceneId: string,
  paragraph: SceneParagraph,
) => {
  setScenesState("scenes", sceneId, "paragraphs", (p) => [
    ...(p ?? []),
    paragraph,
  ]);
};

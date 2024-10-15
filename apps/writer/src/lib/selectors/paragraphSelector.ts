import { createSelector } from "reselect";
import type { SceneParagraph } from "../../../../shared/src/schema.ts";
import type { RootState } from "../store";

export const paragraphSelector = createSelector(
  [
    (state: RootState) => state.story.scene,
    (state: RootState, sceneId: string) => sceneId,
    (state: RootState, sceneId: string, paragraphId: string) => paragraphId,
  ],
  (scenes, sceneId, paragraphId): SceneParagraph | undefined => {
    return scenes[sceneId].paragraphs.find((p) => p.id === paragraphId);
  },
);

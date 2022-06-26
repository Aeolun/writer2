import { RootState } from "../store";
import { createSelector } from "reselect";
import { selectedChapterSelector } from "./selectedChapterSelector";

export const selectedSceneSelector = createSelector(
  [
    (state: RootState) => state.story.scenes,
    (state: RootState) => state.base.currentScene,
  ],
  (scenes, currentScene) => {
    return currentScene ? scenes[currentScene] : undefined;
  }
);

import { RootState } from "../store";
import {createSelector} from "reselect";
import {scenesSelector} from "./scenesSelector";

export const chapterScenesSelector = (chapterId: string) => createSelector((state: RootState) => {
  return state.story.chapter[chapterId].scenes;
}, scenesSelector, (chapterScenes, scenes) => {
  return chapterScenes.map((sceneId) => scenes[sceneId]);
});

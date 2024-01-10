import { RootState } from "../store";
import {createSelector} from "reselect";

export const scenesSelector = createSelector((state: RootState) => {
  return state.story.scene;
}, (scenes) => {
  return scenes
});

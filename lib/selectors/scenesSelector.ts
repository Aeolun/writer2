import { RootState } from "../store";

export const scenesSelector = (state: RootState) => {
  return state.story.scene;
};

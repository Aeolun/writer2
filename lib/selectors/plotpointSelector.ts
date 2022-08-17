import { RootState } from "../store";
import { createSelector } from "reselect";
import { selectedChapterSelector } from "./selectedChapterSelector";

export const plotpointSelector = createSelector(
  [(state: RootState) => state.story.plotPoints],
  (plotpoints) => {
    return plotpoints;
  }
);

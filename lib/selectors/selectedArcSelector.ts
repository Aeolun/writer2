import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectedArcSelector = createSelector(
  [
    (state: RootState) => state.story.arcs,
    (state: RootState) => state.base.currentArc,
  ],
  (arcs, currentArc) => {
    return currentArc ? arcs[currentArc] : undefined;
  }
);

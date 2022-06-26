import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectedChapterSelector = createSelector(
  [
    (state: RootState) => state.story.chapters,
    (state: RootState) => state.base.currentChapter,
  ],
  (chapters, currentChapter) => {
    return currentChapter ? chapters[currentChapter] : undefined;
  }
);

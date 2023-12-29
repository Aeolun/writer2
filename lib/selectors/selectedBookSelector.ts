import { RootState } from "../store";
import { createSelector } from "reselect";

export const selectedBookSelector = createSelector(
  [
    (state: RootState) => state.story.books,
    (state: RootState) => state.base.currentBook,
  ],
  (books, currentBook) => {
    return currentBook ? books[currentBook] : undefined;
  }
);

import { RootState } from "../store";
import { createSelector } from "reselect";
import {Arc, Book, Scene, Chapter} from "../../lib/slices/story";

type Response =
  | { id: string; type: 'arc'; data: Arc}
  | { id: string; type: 'chapter'; data: Chapter}
  | { id: string; type: 'scene'; data: Scene}
  | { id: string; type: 'book'; data: Book}

export const selectedObjectSelector = createSelector(
  [
    (state: RootState) => state.base.currentId,
    (state: RootState) => state.base.selectedEntity,
    (state: RootState) => state.story
  ],
  (currentId, type, story): Response | undefined => {
    return (type && currentId && story[type][currentId] ? {
      id: currentId,
      type,
      data: story[type][currentId]
    } : undefined) as unknown as Response | undefined;
  }
);

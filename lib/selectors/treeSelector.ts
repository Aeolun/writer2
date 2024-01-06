import {RootState} from "../store";
import {createSelector} from "reselect";
import {selectedObjectSelector} from "./selectedObjectSelector";
import {Arc, Book, Chapter, Scene} from "../slices/story";

export const treeSelector = createSelector([(state: RootState) => state.story, selectedObjectSelector], (story, selectedObject) => {
  if (!selectedObject) {
    return {
      scene: undefined,
      chapter: undefined,
      arc: undefined,
      book: undefined,
    }
  }

  let fill: ('arc' | 'book' | 'scene' | 'chapter')[] = [];
  switch(selectedObject?.type) {
    case "arc":
      fill = ['arc', 'book']
      break;
    case "book":
      fill = ['book']
      break;
    case "chapter":
      fill = ['chapter', 'arc', 'book']
      break;
    case "scene":
      fill = ['scene', 'chapter', 'arc', 'book']
      break;
  }

  const returnObject: {
    scene: Scene | undefined,
    chapter: Chapter | undefined,
    arc: Arc | undefined,
    book: Book | undefined,
  } = {
    scene: undefined,
    chapter: undefined,
    arc: undefined,
    book: undefined,
  }
  let currentObject = selectedObject.data;
  while(fill.length > 0) {
    const type = fill.shift();
    if (!type) {
      break;
    }
    // @ts-expect-error
    returnObject[type] = story[type][currentObject.id]
    const parentType = fill[0]
    if (parentType && currentObject.parent_id) {
      currentObject = story[parentType][currentObject.parent_id]
    }
  }

  return returnObject
})
import { resetVectorStore } from "../embeddings/embedding-store";
import { arcsStore, resetArcsStore, setArcsStore } from "../stores/arcs";
import { resetBooksStore, setBooksStore } from "../stores/books";
import { resetChaptersState, setChaptersState } from "../stores/chapters";
import { resetCharactersState, setCharactersState } from "../stores/characters";
import { resetItems, setItems, setItemsState } from "../stores/items";
import { resetLanguageStore, setLanguageStore } from "../stores/language-store";
import { resetPlotpoints, setPlotpoints } from "../stores/plot-points";
import {
  getWordCount,
  resetScenesState,
  setScenesState,
} from "../stores/scenes";
import {
  resetStoryState,
  setStory,
  setStoryState,
  unloadStory,
} from "../stores/story";
import { resetTreeState, setTree, setTreeState } from "../stores/tree";

export const unloadFromState = () => {
  resetArcsStore();
  resetCharactersState();
  resetChaptersState();
  resetScenesState();
  resetBooksStore();
  resetItems();
  resetPlotpoints();
  resetLanguageStore();
  resetTreeState();
  resetStoryState();

  // clean up the embeddings store too
  resetVectorStore();
};

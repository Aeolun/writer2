import { setArcsStore } from "../stores/arcs";
import { setCharactersState } from "../stores/characters";
import { setChaptersState } from "../stores/chapters";
import { setScenesState } from "../stores/scenes";
import { setStory, setStoryState } from "../stores/story";
import { setBooksStore } from "../stores/books";
import { setItems } from "../stores/items";
import { setPlotpoints } from "../stores/plot-points";
import { setLanguageStore } from "../stores/language-store";
import { setTree } from "../stores/tree";
import { setLocationsState } from "../stores/locations";

export const unloadState = () => {
  setArcsStore({
    arcs: {},
  });
  setCharactersState({
    characters: {},
  });
  setChaptersState({
    chapters: {},
  });
  setScenesState({
    scenes: {},
  });
  setBooksStore({
    books: {},
  });
  setItems({});
  setPlotpoints({
    plotPoints: {},
  });
  setLocationsState({
    locations: {},
  });
  setLanguageStore({
    languages: {
      languages: {},
    },
  });
  setTree([]);
  setStoryState({
    storyLoaded: false,
    expectedLastModified: 0,
    story: undefined,
  });
};

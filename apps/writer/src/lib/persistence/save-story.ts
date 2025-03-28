import { PersistedStory, SavePayload, saveSchema } from "@writer/shared";
import { saveProject } from "./save-project";
import { storyState } from "../stores/story";
import { charactersState } from "../stores/characters";
import { plotpoints } from "../stores/plot-points";
import { scenesState } from "../stores/scenes";
import { booksStore } from "../stores/books";
import { arcsStore } from "../stores/arcs";
import { chaptersState } from "../stores/chapters";
import { items } from "../stores/items";
import { treeState } from "../stores/tree";
import { languageStore } from "../stores/language-store";
import { setLastSaveAt, uiState } from "../stores/ui";
import { addNotification } from "../stores/notifications";
import { unwrap } from "solid-js/store";
import { locationsState } from "../stores/locations";

export const saveStory = async (withAutosave = false) => {
  if (!storyState.story || !storyState.openPath) {
    addNotification({
      title: "No story or open path",
      message: "You must have an open path to be able to auto save a story.",
      type: "error",
    });
    return;
  }

  const story = unwrap(storyState).story;
  console.log("story", story);
  if (!story?.id) {
    throw new Error("Story has no id");
  }
  const storyData: SavePayload = {
    story: {
      ...story,
      characters: unwrap(charactersState).characters,
      plotPoints: unwrap(plotpoints).plotPoints,
      scene: unwrap(scenesState).scenes,
      book: unwrap(booksStore).books,
      arc: unwrap(arcsStore).arcs,
      locations: unwrap(locationsState).locations,
      chapter: unwrap(chaptersState).chapters,
      item: unwrap(items).items,
      structure: unwrap(treeState).structure,
    },
    language: unwrap(languageStore.languages),
    newAutosave: withAutosave,
    changesSince: unwrap(uiState).lastSaveAt,
    expectedLastModified: unwrap(storyState).expectedLastModified,
  };

  const persisted = saveSchema.parse(storyData);

  if (
    Object.keys(treeState.structure).length > 0 &&
    Object.keys(scenesState.scenes).length === 0 &&
    Object.keys(booksStore.books).length === 0
  ) {
    addNotification({
      title: "No scenes or books",
      message:
        "Maybe something went wrong, tree has items, but books and scenes do not.",
      type: "error",
    });
    return;
  }

  const openPath = storyState.openPath;
  if (!openPath) {
    return;
  }

  await saveProject(openPath, persisted);

  setLastSaveAt(Date.now());
};

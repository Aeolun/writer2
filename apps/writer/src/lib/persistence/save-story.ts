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

export const saveStory = async (withAutosave = false) => {
  if (!storyState.story || !storyState.openPath) {
    addNotification({
      title: "No story or open path",
      message: "You must open a story before saving.",
      type: "error",
    });
    return;
  }

  const storyData: SavePayload = {
    story: {
      ...unwrap(storyState).story,
      characters: unwrap(charactersState).characters,
      plotPoints: unwrap(plotpoints).plotPoints,
      scene: unwrap(scenesState).scenes,
      book: unwrap(booksStore).books,
      arc: unwrap(arcsStore).arcs,
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
    Object.keys(scenesState.scenes).length === 0 &&
    Object.keys(booksStore.books).length === 0
  ) {
    addNotification({
      title: "No scenes or books",
      message: "You must create at least one scene or one book before saving.",
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
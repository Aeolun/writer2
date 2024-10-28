import { PersistedStory, saveSchema } from "@writer/shared";
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

export const saveStory = async () => {
  if (!storyState.story) {
    return;
  }

  const storyData: PersistedStory = {
    story: {
      ...storyState.story,
      characters: charactersState.characters,
      plotPoints: plotpoints.plotPoints,
      scene: scenesState.scenes,
      book: booksStore.books,
      arc: arcsStore.arcs,
      chapter: chaptersState.chapters,
      item: items.items,
      structure: treeState.structure,
    },
    language: {
      languages: languageStore.languages.languages,
    },
  };

  const persisted = saveSchema.parse(storyData);

  const openPath = storyState.openPath;
  if (!openPath) {
    return;
  }

  await saveProject(openPath, persisted);
};

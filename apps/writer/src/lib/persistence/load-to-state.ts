import type { PersistedStory } from "@writer/shared";
import { getWordCount } from "../stores/scenes";
import { setArcsStore } from "../stores/arcs";
import { setCharactersState } from "../stores/characters";
import { setChaptersState } from "../stores/chapters";
import { setScenesState } from "../stores/scenes";
import { setStory } from "../stores/story";
import { setBooksStore } from "../stores/books";
import { setItems } from "../stores/items";
import { setPlotpoints } from "../stores/plot-points";
import { setLanguageStore } from "../stores/language-store";
import { setTree } from "../stores/tree";

export const loadToState = async (savedStory: PersistedStory) => {
  setArcsStore({
    arcs: savedStory.story.arc,
  });
  setCharactersState({
    characters: savedStory.story.characters,
  });
  setChaptersState({
    chapters: savedStory.story.chapter,
  });
  const scenesToSet = { ...savedStory.story.scene };
  for (const sceneId of Object.keys(scenesToSet)) {
    let sceneWords = 0;
    for (const paragraph of scenesToSet[sceneId].paragraphs) {
      paragraph.words = getWordCount(paragraph.text);
      sceneWords += paragraph.words;
    }
    scenesToSet[sceneId].words = sceneWords;
  }
  setScenesState({
    scenes: scenesToSet,
  });
  setBooksStore({
    books: savedStory.story.book,
  });
  setItems(savedStory.story.item ?? {});
  setPlotpoints({
    plotPoints: savedStory.story.plotPoints,
  });
  setCharactersState({
    characters: savedStory.story.characters,
  });
  setLanguageStore({
    languages: savedStory.language,
  });
  setTree(savedStory.story.structure);
  setStory(savedStory.story);
};

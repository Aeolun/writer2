import { Chapter } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [chaptersState, setChaptersState] = createStore<{
  chapters: Record<string, Chapter>;
}>({
  chapters: {},
});

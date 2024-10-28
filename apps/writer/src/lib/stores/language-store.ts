import { Language } from "@writer/shared";
import { createStore } from "solid-js/store";

export const [languageStore, setLanguageStore] = createStore<{
  languages: Record<string, Language>;
}>({
  languages: {},
});

import { createStore } from "solid-js/store";
import { Store } from "@tauri-apps/plugin-store";
import { findPathToNode } from "./tree";
import type { Node } from "@writer/shared";

export type StorySummary = {
  name: string;
};

export interface UIState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentId?: string;
  selectedEntity?: "book" | "arc" | "chapter" | "scene";
  selectionPath?: Node[];
  selectedLanguage?: string;
  aiPopupOpen: boolean;
  showInventory: boolean;
  signinPopupOpen: boolean;
  saving: boolean;
  stories?: StorySummary[];
  syncing: boolean;
}

const initialState: UIState = {
  stories: [],
  aiPopupOpen: false,
  signinPopupOpen: false,
  showInventory: false,
  saving: false,
  syncing: false,
};

export const [uiState, setUIState] = createStore(initialState);

export const store = new Store("global-settings.bin");

export const setSelectedEntity = (
  entity: "book" | "arc" | "chapter" | "scene",
  id: string,
) => {
  const path = findPathToNode(id);
  console.log("path", path);
  setUIState(() => ({
    selectedEntity: entity,
    currentId: id,
    selectionPath: path,
  }));
};
export const setStories = (stories: StorySummary[]) =>
  setUIState("stories", stories);
export const setShowInventory = (show: boolean) =>
  setUIState("showInventory", show);
export const setAiPopupOpen = (open: boolean) =>
  setUIState("aiPopupOpen", open);
export const setSigninPopupOpen = (open: boolean) =>
  setUIState("signinPopupOpen", open);
export const setSelectedLanguage = (language?: string) =>
  setUIState("selectedLanguage", language);
export const setSaving = (saving: boolean) => setUIState("saving", saving);
export const setSyncing = (syncing: boolean) => setUIState("syncing", syncing);
export const setSelectedImageChapter = (chapter: string) =>
  setUIState("selectedImageChapter", chapter);
export const setImagePath = (path: string) => setUIState("imagePath", path);
export const setCurrentId = (id?: string) => setUIState("currentId", id);

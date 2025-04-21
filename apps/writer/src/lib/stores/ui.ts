import type { PersistedStory, Node } from "@writer/shared";
import { createStore } from "solid-js/store";
import { findPathToNode } from "./tree";
import type { DifferenceResult } from "@writer/shared";

export type StorySummary = {
  name: string;
};

interface ImportDialogState {
  open: boolean;
  running: boolean;
  chapters: { id: number; title: string; imported: boolean }[];
  complete: boolean;
}

export interface UIState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentId?: string;
  selectedEntity?: "book" | "arc" | "chapter" | "scene";
  selectionPath?: Node[];
  selectedLanguage?: string;
  aiPopupOpen: boolean;
  aiPrompt?: string;
  aiOpenTab?: number;
  aiResponseHistory?: string[];
  showInventory: boolean;
  lastGenerationUsage?: Record<string, number>;
  signinPopupOpen: boolean;
  saving: boolean;
  lastSaveAt?: number;
  stories?: StorySummary[];
  syncing: boolean;
  uploading: boolean;
  plotPointViewMode: "grid" | "table";
  importDialog: ImportDialogState;
  loadingFromServer: boolean;
  lastFocus: string | null;
  showLoadFromServerConflictDialog: boolean;
  serverStoryDataForConfirmation: PersistedStory | null;
  syncState: DifferenceResult | null;
  showSyncStatusDialog: boolean;
  lastKnownServerUpdate: number | null;
}

export const uiStateDefault: UIState = {
  stories: [],
  aiPopupOpen: false,
  signinPopupOpen: false,
  showInventory: false,
  saving: false,
  syncing: false,
  uploading: false,
  plotPointViewMode: "grid",
  lastGenerationUsage: undefined,
  lastSaveAt: undefined,
  importDialog: {
    open: false,
    running: false,
    chapters: [],
    complete: false,
  },
  loadingFromServer: false,
  lastFocus: null,
  showLoadFromServerConflictDialog: false,
  serverStoryDataForConfirmation: null,
  selectionPath: [],
  syncState: null,
  showSyncStatusDialog: false,
  lastKnownServerUpdate: null,
};

export const [uiState, setUIState] = createStore<UIState>(uiStateDefault);

export const setSelectedEntity = (
  entity: "book" | "arc" | "chapter" | "scene",
  id: string,
) => {
  const path = findPathToNode(id);
  console.log("path", path, entity, id);
  setUIState(() => ({
    selectedEntity: entity,
    currentId: id,
    selectionPath: path,
  }));
};

export const setLastGenerationUsage = (usage: Record<string, number>) =>
  setUIState("lastGenerationUsage", usage);
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
export const setUploading = (uploading: boolean) =>
  setUIState("uploading", uploading);
export const setLastSaveAt = (lastSaveAt?: number) =>
  setUIState("lastSaveAt", lastSaveAt);
export const setSelectedImageChapter = (chapter: string) =>
  setUIState("selectedImageChapter", chapter);
export const setImagePath = (path: string) => setUIState("imagePath", path);
export const setCurrentId = (id?: string) => setUIState("currentId", id);
export const addAiResponse = (response: string) =>
  setUIState("aiResponseHistory", (prev) => [
    response,
    ...(prev ?? []).slice(0, 9),
  ]);
export const setAiPrompt = (prompt: string) => setUIState("aiPrompt", prompt);
export const setAiOpenTab = (tab: number) => setUIState("aiOpenTab", tab);
export const setImportDialogOpen = (open: boolean) =>
  setUIState("importDialog", "open", open);
export const setImportDialogChapters = (
  chapters: {
    id: number;
    title: string;
    imported: boolean;
  }[],
) => setUIState("importDialog", "chapters", chapters);
export const setImportDialogChapterImported = (id: number) =>
  setUIState("importDialog", "chapters", (i) => i?.id === id, "imported", true);
export const setImportDialogRunning = (running: boolean) =>
  setUIState("importDialog", "running", running);
export const setImportDialogComplete = (complete: boolean) =>
  setUIState("importDialog", "complete", complete);
export const setPlotPointViewMode = (mode: "grid" | "table") =>
  setUIState("plotPointViewMode", mode);
export const setLoadingFromServer = (loading: boolean) =>
  setUIState("loadingFromServer", loading);
export const setShowLoadFromServerConflictDialog = (show: boolean) =>
  setUIState("showLoadFromServerConflictDialog", show);
export const setServerStoryForConfirmation = (story: PersistedStory | null) =>
  setUIState("serverStoryDataForConfirmation", story);
export const setLastFocus = (lastFocus: string | null) =>
  setUIState({ lastFocus });

// Setter for the new sync state
export const setSyncState = (state: DifferenceResult | null) => {
  console.log("Setting sync state:", state);
  setUIState("syncState", state);
};

// Setter for the new dialog state
export const setShowSyncStatusDialog = (show: boolean) => {
  setUIState("showSyncStatusDialog", show);
};

export const setLastKnownServerUpdate = (timestamp: number | null) =>
  setUIState("lastKnownServerUpdate", timestamp);

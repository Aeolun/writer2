import { type Draft, type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type StorySummary = {
  name: string;
};

export interface GlobalState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentId?: string;
  openPath?: string;
  expectedLastModified?: number;
  selectedEntity?: "book" | "arc" | "chapter" | "scene";
  selectedLanguage?: string;
  storyLoaded: boolean;
  aiPopupOpen: boolean;
  aiBackend: "google" | "openai" | "claude";
  saving: boolean;
  stories?: StorySummary[];
  syncing: boolean;
  isDirty: boolean;
}

const initialState: GlobalState = {
  storyLoaded: false,
  stories: [],
  aiBackend: "openai",
  aiPopupOpen: false,
  saving: false,
  syncing: false,
  isDirty: false,
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStories: (state, action: PayloadAction<StorySummary[]>) => {
      state.stories = action.payload;
    },
    setAiPopupOpen: (state, action: PayloadAction<boolean>) => {
      state.aiPopupOpen = action.payload;
    },
    setExpectedLastModified: (
      state: Draft<GlobalState>,
      action: PayloadAction<number>,
    ) => {
      state.expectedLastModified = action.payload;
    },
    setSelectedLanguage: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>,
    ) => {
      state.selectedLanguage = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setSelectedImageChapter: (state, action: PayloadAction<string>) => {
      state.selectedImageChapter = action.payload;
    },
    setStoryLoaded: (state, action: PayloadAction<boolean>) => {
      state.storyLoaded = action.payload;
    },
    setOpenPath: (state, action: PayloadAction<string>) => {
      state.openPath = action.payload;
    },
    setSelectedEntity: (
      state: Draft<GlobalState>,
      action: PayloadAction<"book" | "arc" | "chapter" | "scene">,
    ) => {
      state.selectedEntity = action.payload;
    },
    setImagePath: (
      state: Draft<GlobalState>,
      action: PayloadAction<string>,
    ) => {
      state.imagePath = action.payload;
    },
    setAiBackend: (
      state: Draft<GlobalState>,
      action: PayloadAction<"google" | "openai" | "claude">,
    ) => {
      state.aiBackend = action.payload;
    },
    setCurrentId: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>,
    ) => {
      state.currentId = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const globalActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

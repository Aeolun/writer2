import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export type StorySummary = {
  name: string
}

export interface GlobalState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentBook?: string;
  currentArc?: string;
  currentChapter?: string;
  currentScene?: string;
  selectedEntity?: 'book' | 'arc' | 'chapter' | 'scene';
  storyLoaded: boolean;
  stories?: StorySummary[];
}

const initialState: GlobalState = {
  storyLoaded: false,
  stories: []
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStories: (state, action: PayloadAction<StorySummary>) => {
      state.stories = action.payload
    },
    setSelectedImageChapter: (state, action: PayloadAction<string>) => {
      state.selectedImageChapter = action.payload;
    },
    setStoryLoaded: (state, action: PayloadAction<boolean>) => {
      state.storyLoaded = action.payload;
    },
    setSelectedEntity: (
      state: Draft<GlobalState>,
      action: PayloadAction<'book' | 'arc' | 'chapter' | 'scene'>
    ) => {
      state.selectedEntity = action.payload;
    },
    setImagePath: (
      state: Draft<GlobalState>,
      action: PayloadAction<string>
    ) => {
      state.imagePath = action.payload;
    },
    setCurrentChapter: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentChapter = action.payload;
    },
    setCurrentBook: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentBook = action.payload;
    },
    setCurrentArc: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentArc = action.payload;
    },
    setCurrentScene: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentScene = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const globalActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

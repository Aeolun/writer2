import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentChapter?: number;
  currentScene?: number;
  storyLoaded: boolean;
}

const initialState: GlobalState = {
  storyLoaded: false,
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setSelectedImageChapter: (state, action: PayloadAction<string>) => {
      state.selectedImageChapter = action.payload;
    },
    setStoryLoaded: (state, action: PayloadAction<boolean>) => {
      state.storyLoaded = action.payload;
    },
    setImagePath: (
      state: Draft<GlobalState>,
      action: PayloadAction<string>
    ) => {
      state.imagePath = action.payload;
    },
    setCurrentChapter: (
      state: Draft<GlobalState>,
      action: PayloadAction<number | undefined>
    ) => {
      state.currentChapter = action.payload;
    },
    setCurrentScene: (
      state: Draft<GlobalState>,
      action: PayloadAction<number | undefined>
    ) => {
      state.currentScene = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const globalActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

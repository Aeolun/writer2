import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export type StorySummary = {
  name: string
}

export interface GlobalState {
  selectedImageChapter?: string;
  imagePath?: string;
  currentId?: string;
  selectedEntity?: 'book' | 'arc' | 'chapter' | 'scene';
  storyLoaded: boolean;
  saving: boolean;
  stories?: StorySummary[];
}

const initialState: GlobalState = {
  storyLoaded: false,
  stories: [],
  saving: false,
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStories: (state, action: PayloadAction<StorySummary>) => {
      state.stories = action.payload
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
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
    setCurrentId: (
      state: Draft<GlobalState>,
      action: PayloadAction<string | undefined>
    ) => {
      state.currentId = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const globalActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

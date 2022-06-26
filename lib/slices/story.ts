import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";

export interface Character {
  id: number;
  picture: string;
  name: string;
  summary: string;
  age: string;
}

export interface Chapter {
  id: number;
  title: string;
  summary: string;
  sort_order: number;
  start_date: string;
  scenes: number[];
}

export interface Scene {
  id: number;
  title: string;
  summary: string;
  text: string;
  sort_order: number;
  plot_point_actions: {
    plot_point_id: number;
    action: string;
  }[];
}

export interface PlotPoint {
  id: number;
  summary: string;
  title: string;
}

export interface StoryState {
  characters: Record<number, Character>;
  chapters: Record<number, Chapter>;
  plotPoints: Record<number, PlotPoint>;
  scenes: Record<number, Scene>;
  counters: {
    characterSequence: number;
    chapterSequence: number;
    sceneSequence: number;
    plotPointSequence: number;
  };
}

const initialState: StoryState = {
  chapters: {},
  characters: {},
  plotPoints: {},
  scenes: {},
  counters: {
    characterSequence: 0,
    chapterSequence: 0,
    sceneSequence: 0,
    plotPointSequence: 0,
  },
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStory: (state, action: PayloadAction<StoryState>) => {
      Object.keys(action.payload).forEach((key) => {
        const storyKey = key as keyof StoryState;

        //@ts-expect-error
        state[storyKey] = action.payload[storyKey];
      });
    },
    createScene: (state, action: PayloadAction<{ chapterId: number }>) => {
      const newId = state.counters.sceneSequence;
      state.counters.sceneSequence++;
      state.scenes[newId] = {
        id: newId,
        title: "New Scene",
        summary: "",
        plot_point_actions: [],
        text: "",
        sort_order: 0,
      };
      state.chapters[action.payload.chapterId].scenes.push(newId);
    },
    deleteScene: (
      state,
      action: PayloadAction<{
        sceneId: number;
        chapterId: number;
      }>
    ) => {
      state.chapters[action.payload.chapterId].scenes = state.chapters[
        action.payload.chapterId
      ].scenes.filter((sId) => sId !== action.payload.sceneId);
      delete state.scenes[action.payload.sceneId];
    },
    updateScene: (state, action: PayloadAction<Partial<Scene>>) => {
      const id = action.payload.id;
      if (id) {
        const keys = Object.keys(action.payload);
        keys.forEach((key) => {
          //@ts-expect-error
          if (state.scenes[id][key] != action.payload[key]) {
            //@ts-expect-error
            state.scenes[id][key] = action.payload[key];
          }
        });
      }
    },
    updateChapter: (state, action: PayloadAction<Partial<Chapter>>) => {
      if (action.payload.id) {
        state.chapters[action.payload.id] = {
          ...state.chapters[action.payload.id],
          ...action.payload,
        };
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const storyActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

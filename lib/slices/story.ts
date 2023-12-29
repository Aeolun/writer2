import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import short from 'short-uuid';

export interface Character {
  id: string;
  picture: string;
  name: string;
  summary: string;
  age: string;
}

export interface Book {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
  start_date: string;
  arcs: string[];
}

export interface Arc {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
  start_date: string;
  chapters: string[];
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
  start_date: string;
  scenes: string[];
}

export interface Scene {
  id: string;
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
  id: string;
  summary: string;
  title: string;
}

export interface StoryState {
  name?: string;
  settings?: {
    mangaChapterPath?: string;
  }
  characters: Record<string, Character>;
  books: Record<string, Book>;
  arcs: Record<string, Arc>;
  chapters: Record<string, Chapter>;
  plotPoints: Record<string, PlotPoint>;
  scenes: Record<string, Scene>;
}

const initialState: StoryState = {
  name: undefined,
  chapters: {},
  books: {},
  arcs: {},
  characters: {},
  plotPoints: {},
  scenes: {},
};

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStory: (state, action: PayloadAction<StoryState>) => {
      for(const key in action.payload) {
        const storyKey = key as keyof StoryState;

        //@ts-expect-error
        state[storyKey] = action.payload[storyKey];
      }

    },
    newStory: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    unload: (state) => {
      return initialState;
    },
    setSetting(state: Draft<StoryState>, action: PayloadAction<{key: string, value: string}>) {
      if(!state.settings) {
        state.settings = {};
      }
      if (state.settings) {
        state.settings[action.payload.key] = action.payload.value;
      }
    },
    createChapter: (state, action: PayloadAction<{ arcId: string }>) => {
      const newId = short.generate().toString();
      state.chapters[newId] = {
        id: newId,
        title: "New Chapter",
        summary: "",
        scenes: [],
        sort_order: 0,
        start_date: "",
      };
    },
    createBook: (state) => {
      const newId = short.generate().toString();
      state.books[newId] = {
        id: newId,
        title: "New Book",
        summary: "",
        arcs: [],
        sort_order: 0,
        start_date: "",
      };
    },
    createArc: (state, action: PayloadAction<{ bookId: string }>) => {
      const newId = short.generate().toString();
      state.arcs[newId] = {
        id: newId,
        title: "New Arc",
        summary: "",
        chapters: [],
        sort_order: 0,
        start_date: "",
      };
    },
    createScene: (state, action: PayloadAction<{ chapterId: string }>) => {
      const newId = short.generate().toString();
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
        sceneId: string;
        chapterId: string;
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
        for(const key of keys) {
          //@ts-expect-error
          if (state.scenes[id][key] !== action.payload[key]) {
            //@ts-expect-error
            state.scenes[id][key] = action.payload[key];
          }
        };
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
    updateArc: (state, action: PayloadAction<Partial<Arc>>) => {
      if (action.payload.id) {
        state.arcs[action.payload.id] = {
          ...state.arcs[action.payload.id],
          ...action.payload,
        };
      }
    },
    updateBook: (state, action: PayloadAction<Partial<Book>>) => {
      if (action.payload.id) {
        state.books[action.payload.id] = {
          ...state.books[action.payload.id],
          ...action.payload,
        };
      }
    },
    deletePlotPoint: (
      state,
      action: PayloadAction<{
        plotpointId: number;
      }>
    ) => {
      delete state.plotPoints[action.payload.plotpointId];
    },
    createPlotPoint: (state, action: PayloadAction<{}>) => {
      const newId = short.generate().toString();
      state.plotPoints[newId] = {
        id: newId,
        summary: "",
        title: "",
      };
    },
    updatePlotpoint: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        summary?: string;
      }>
    ) => {
      state.plotPoints[action.payload.id] = {
        ...state.plotPoints[action.payload.id],
        ...action.payload,
      };
    },
    addPlotPointToScene: (
      state,
      action: PayloadAction<{
        sceneId: string;
        plotpointId: number;
        action: string;
      }>
    ) => {
      state.scenes[action.payload.sceneId].plot_point_actions.push({
        plot_point_id: action.payload.plotpointId,
        action: action.payload.action,
      });
    },
    removePlotPointFromScene: (
      state,
      action: PayloadAction<{
        sceneId: string;
        plotpointId: number;
        action: string;
      }>
    ) => {
      state.scenes[action.payload.sceneId].plot_point_actions = state.scenes[
        action.payload.sceneId
      ].plot_point_actions.filter((i) => {
        return (
          i.plot_point_id !== action.payload.plotpointId &&
          i.action !== action.payload.action
        );
      });
    },
  },
});

// Action creators are generated for each case reducer function
export const storyActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

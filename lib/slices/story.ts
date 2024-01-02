import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import short from 'short-uuid';

export interface Character {
  id: string;
  picture: string;
  name: string;
  summary: string;
  age: string;
}

export type TreeData = {
  id: string;
  title: string;
  open: boolean;
  parent_id?: string;
  sort_order: number;
  extra?: string;
}

export interface Book extends TreeData {
  summary: string;
  start_date: string;
  arcs: string[];
}

export interface Arc extends TreeData {
  summary: string;
  start_date: string;
  chapters: string[];
}

export interface Chapter extends TreeData {
  summary: string;
  start_date: string;
  scenes: string[];
}

export interface Scene extends TreeData {
  summary: string;
  text: string;
  plot_point_actions: {
    plot_point_id: string;
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
  book: Record<string, Book>;
  arc: Record<string, Arc>;
  chapter: Record<string, Chapter>;
  plotPoints: Record<string, PlotPoint>;
  scene: Record<string, Scene>;
}

const initialState: StoryState = {
  name: undefined,
  chapter: {},
  book: {},
  arc: {},
  characters: {},
  plotPoints: {},
  scene: {},
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
    toggleTreeItem: (state, action: PayloadAction<{id: string}>) => {
      const id = action.payload.id;
      if (id) {
        const keys = ['book', 'arc', 'chapter', 'scene'];
        for(const key of keys) {
          const stateKey = key as 'book' | 'arc' | 'chapter' | 'scene';
          if (state[stateKey][id]) {
            state[stateKey][id].open = !state[stateKey][id].open;
          }
        };
      }
    },
    deleteTreeItem: (state, action: PayloadAction<{id: string}>) => {
      const id = action.payload.id;
      if (id) {
        const keys = ['book', 'arc', 'chapter', 'scene'];
        for(const key of keys) {
          const stateKey = key as 'book' | 'arc' | 'chapter' | 'scene';
          // remove from parent if it exists
          if (state[stateKey][id]) {
            if (stateKey === 'arc') {
              const bookId = state[stateKey][id].parent_id;
              if (bookId) {
                state.book[bookId].arcs = state.book[bookId].arcs.filter((arcId) => {
                  return arcId !== id;
                });
              }
            }
            if (stateKey === 'chapter') {
              const arcId = state[stateKey][id].parent_id;
              if (arcId) {
                state.arc[arcId].chapters = state.arc[arcId].chapters.filter((chapterId) => {
                  return chapterId !== id;
                });
              }
            }
            if (stateKey === 'scene') {
              const chapterId = state[stateKey][id].parent_id;
              if (chapterId) {
                state.chapter[chapterId].scenes = state.chapter[chapterId].scenes.filter((sceneId) => {
                  return sceneId !== id;
                });
              }
            }
            delete state[stateKey][id];
          }
        };
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
      const highestSortOrder = Object.values(state.chapter).reduce((acc, chapter) => {
        if (chapter.sort_order > acc) {
          return chapter.sort_order;
        }
        return acc;
      }, 0);
      state.chapter[newId] = {
        id: newId,
        title: "New Chapter",
        summary: "",
        scenes: [],
        open: false,
        sort_order: highestSortOrder+1,
        parent_id: action.payload.arcId,
        start_date: "",
      };
      state.arc[action.payload.arcId].chapters.push(newId);
    },
    createBook: (state) => {
      const newId = short.generate().toString();
      const highestSortOrder = Object.values(state.chapter).reduce((acc, chapter) => {
        if (chapter.sort_order > acc) {
          return chapter.sort_order;
        }
        return acc;
      }, 0);
      state.book[newId] = {
        id: newId,
        title: "New Book",
        summary: "",
        arcs: [],
        open: false,
        sort_order: highestSortOrder+1,
        parent_id: undefined,
        start_date: "",
      };
    },
    createArc: (state, action: PayloadAction<{ bookId: string }>) => {
      const newId = short.generate().toString();
      const highestSortOrder = Object.values(state.chapter).reduce((acc, chapter) => {
        if (chapter.sort_order > acc) {
          return chapter.sort_order;
        }
        return acc;
      }, 0);
      state.arc[newId] = {
        id: newId,
        title: "New Arc",
        summary: "",
        chapters: [],
        open: false,
        sort_order: highestSortOrder+1,
        parent_id: action.payload.bookId,
        start_date: "",
      };
      state.book[action.payload.bookId].arcs.push(newId);
    },
    createScene: (state, action: PayloadAction<{ chapterId: string }>) => {
      const newId = short.generate().toString();
      const highestSortOrder = Object.values(state.chapter).reduce((acc, chapter) => {
        if (chapter.sort_order > acc) {
          return chapter.sort_order;
        }
        return acc;
      }, 0);
      state.scene[newId] = {
        id: newId,
        title: "New Scene",
        summary: "",
        plot_point_actions: [],
        open: false,
        text: "",
        sort_order: highestSortOrder+1,
        parent_id: action.payload.chapterId,
      };
      state.chapter[action.payload.chapterId].scenes.push(newId);
    },
    sortItem: (state, action: PayloadAction<{ id: string; kind: 'scene' | 'arc' | 'book' | 'chapter'; direction: 'up' | 'down' }>) => {
      const id = action.payload.id;
      const kind = action.payload.kind;
      const direction = action.payload.direction;
      if (id) {
        if (state[kind][id]) {
          // find sorted items and then switch
          const sortedItems = Object.values(state[kind]).filter((item) => {
            return item.parent_id === state[kind][id].parent_id;
          }).sort((a, b) => {
            return a.sort_order - b.sort_order;
          });
          const currentIndex = sortedItems.findIndex((item) => {
            return item.id === id;
          });
          const currentSortOrder = sortedItems[currentIndex].sort_order;
          console.log(currentIndex, currentSortOrder, sortedItems.length);
          if (direction === 'up') {
            if (currentIndex > 0) {
              sortedItems[currentIndex].sort_order = sortedItems[currentIndex - 1].sort_order;
              sortedItems[currentIndex - 1].sort_order = currentSortOrder;
            }
          } else {
            if (currentIndex < sortedItems.length - 1) {
              sortedItems[currentIndex].sort_order = sortedItems[currentIndex + 1].sort_order;
              sortedItems[currentIndex + 1].sort_order = currentSortOrder;
            }
          }
        } else {
          throw new Error('Invalid id');
        }
      }
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
        state.chapter[action.payload.id] = {
          ...state.chapter[action.payload.id],
          ...action.payload,
        };
      }
    },
    updateArc: (state, action: PayloadAction<Partial<Arc>>) => {
      if (action.payload.id) {
        state.arc[action.payload.id] = {
          ...state.arc[action.payload.id],
          ...action.payload,
        };
      }
    },
    updateBook: (state, action: PayloadAction<Partial<Book>>) => {
      if (action.payload.id) {
        state.book[action.payload.id] = {
          ...state.book[action.payload.id],
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
        plotpointId: string;
        action: string;
      }>
    ) => {
      state.scene[action.payload.sceneId].plot_point_actions.push({
        plot_point_id: action.payload.plotpointId,
        action: action.payload.action,
      });
    },
    removePlotPointFromScene: (
      state,
      action: PayloadAction<{
        sceneId: string;
        plotpointId: string;
        action: string;
      }>
    ) => {
      state.scene[action.payload.sceneId].plot_point_actions = state.scene[
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

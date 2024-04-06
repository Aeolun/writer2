import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import short from 'short-uuid';
import {Arc, Book, Chapter, Character, PlotPoint, Scene, Story} from "../persistence";

const initialState: Story = {
  name: undefined,
  chapter: {},
  structure: [],
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
    setStory: (state, action: PayloadAction<Story>) => {

      action.payload.structure = [];

      for(const key in action.payload) {
        const storyKey = key as keyof Story;
        if (storyKey === 'structure') {
          continue;
        }

        if (storyKey === 'scene') {
          for(const scene of Object.values(action.payload[storyKey])) {
            scene.paragraphs = scene.text.split('\n\n').map((text: string) => {
              return {
                id: short.generate().toString(),
                text,
                state: 'draft',
                modifiedAt: new Date().toISOString(),
                comments: [],
                plot_point_actions: [],
              };
            })
          }
        }
        if (storyKey === 'book') {
          for(const book of Object.values(action.payload[storyKey])) {
            const arcsChildren = book.arcs.map((arcId) => {
                return action.payload.arc[arcId];
            }).sort((a, b) => {
                return a.sort_order - b.sort_order;
            }).map((arc) => {

                const chapters = arc.chapters.map((chapterId) => {
                    return action.payload.chapter[chapterId];
                }).sort((a, b) => {
                    return a.sort_order - b.sort_order;
                }).map((chapter) => {
                    const scenes = chapter.scenes.map((sceneId) => {
                        return action.payload.scene[sceneId];
                    }).sort((a, b) => {
                    return a.sort_order - b.sort_order;
                    }).map((scene) => {
                        return {
                            id: scene.id,
                            name: scene.title,
                            type: 'scene',
                            isOpen: false,
                        };
                    });

                    return {
                        id: chapter.id,
                        name: chapter.title,
                        type: 'chapter',
                        isOpen: false,
                        children: scenes,
                    };
                });
                return {
                  id: arc.id,
                  name: arc.title,
                  type: 'arc',
                  isOpen: false,
                  children: chapters,
                };
            });
            state.structure.push({
                id: book.id,
                name: book.title,
                type: 'book',
                isOpen: false,
                children: arcsChildren,
            })
          }
        }

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
    setSetting(state: Draft<StoryState>, action: PayloadAction<{key:  keyof StoryState['settings'], value: string}>) {
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
      const highestSortOrder = Object.values(state.book).reduce((acc, book) => {
        if (book.sort_order > acc) {
          return book.sort_order;
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
      const highestSortOrder = Object.values(state.arc).reduce((acc, arc) => {
        if (arc.sort_order > acc) {
          return arc.sort_order;
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
      const highestSortOrder = Object.values(state.scene).reduce((acc, scene) => {
        if (scene.sort_order > acc) {
          return scene.sort_order;
        }
        return acc;
      }, 0);
      console.log('highestSortOrder', highestSortOrder)
      state.scene[newId] = {
        id: newId,
        title: "New Scene",
        summary: "",
        plot_point_actions: [],
        paragraphs: [],
        cursor: 0,
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

          let newSortOrder = currentSortOrder;
          let otherItemId = '';

          if (direction === 'up') {
            if (currentIndex > 0) {
              newSortOrder = sortedItems[currentIndex - 1].sort_order;
              otherItemId = sortedItems[currentIndex - 1].id;
            }
          } else {
            if (currentIndex < sortedItems.length - 1) {
              newSortOrder = sortedItems[currentIndex + 1].sort_order;
              otherItemId = sortedItems[currentIndex + 1].id;
            }
          }
          console.log({id, otherItemId, currentIndex, currentSortOrder, newSortOrder, sortedItems: sortedItems.map(i => i.id+' '+i.sort_order)});
          state[kind][id].sort_order = newSortOrder;
          state[kind][otherItemId].sort_order = currentSortOrder;
        } else {
          throw new Error('Invalid id');
        }
      }
    },
    updateSceneParagraph: (state, action: PayloadAction<{
        sceneId: string;
        paragraphId: string;
        text: string;
        }>) => {
        const scene = state.scene[action.payload.sceneId];
        if (scene) {
            const paragraph = scene.paragraphs?.find((p) => {
            return p.id === action.payload.paragraphId;
            });
            if (paragraph) {
            paragraph.text = action.payload.text;
            }
        }
    },
    updateScene: (state, action: PayloadAction<Partial<Scene>>) => {
      const id = action.payload.id as keyof typeof state.scene;
      if (id) {
        const keys = Object.keys(action.payload);
        for(const key of keys) {
          const writableKey = key as keyof Scene;
          const obj = state.scene[id]
          if (obj[writableKey] !== action.payload[writableKey]) {
            // @ts-ignore
            obj[writableKey] = action.payload[writableKey];
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
    createCharacter: (state, action: PayloadAction<{}>) => {
      const newId = short.generate().toString();
      state.characters[newId] = {
        id: newId,
        name: "New character",
        summary: "",
        picture: "",
        age: "",
        isProtagonist: false,
      };
    },
    updateCharacter: (
      state,
      action: PayloadAction<Partial<Character>>
    ) => {
      if (action.payload.id) {
        state.characters[action.payload.id] = {
          ...state.characters[action.payload.id],
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

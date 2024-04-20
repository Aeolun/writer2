import { type Draft, type PayloadAction, createSlice } from "@reduxjs/toolkit";
import short from "short-uuid";
import type {
  Arc,
  Book,
  Chapter,
  Character,
  Node,
  Scene,
  SceneParagraph,
  Story,
} from "../persistence";

const initialState: Story = {
  name: undefined,
  modifiedTime: Date.now(),
  chapter: {},
  structure: [],
  book: {},
  arc: {},
  characters: {},
  plotPoints: {},
  scene: {},
};

function addItemToStructure(
  structure: Array<any>,
  parentId: string | undefined,
  item: Node,
  index?: number,
  depth = 0,
) {
  if (depth > 4) {
    return;
  }
  const parent = structure.find((i) => {
    return i.id === parentId;
  });
  if (parent) {
    if (index !== undefined) {
      parent.children.splice(index, 0, item);
    } else {
      parent.children.push(item);
    }
    return;
  }

  for (const i in structure) {
    const node = structure[i];
    if (node.children) {
      addItemToStructure(node.children, parentId, item, index, depth + 1);
    }
  }
}

function removeItemFromStructure(
  structure: Array<any>,
  id: string,
  depth = 0,
): Node | undefined {
  if (depth > 4) {
    return;
  }
  for (let i = 0; i < structure.length; i++) {
    const node = structure[i];
    if (node.id === id) {
      const item = structure[i];
      structure.splice(i, 1);
      return item;
    }
    if (node.children) {
      const item = removeItemFromStructure(node.children, id, depth + 1);
      if (item) {
        return item;
      }
    }
  }
}

export const globalSlice = createSlice({
  name: "base",
  initialState,
  reducers: {
    setStory: (state, action: PayloadAction<Story>) => {
      for (const key in action.payload) {
        const storyKey = key as keyof Story;
        // if (storyKey === 'structure') {
        //   continue;
        // }

        // if (storyKey === 'scene') {
        //   for(const scene of Object.values(action.payload[storyKey])) {
        //     scene.paragraphs = scene.paragraphs || [];
        //   }
        // }
        // if (storyKey === 'book') {
        //   for(const book of Object.values(action.payload[storyKey])) {
        //     const arcsChildren = book.arcs.map((arcId) => {
        //         return action.payload.arc[arcId];
        //     }).sort((a, b) => {
        //         return a.sort_order - b.sort_order;
        //     }).map((arc) => {
        //
        //         const chapters = arc.chapters.map((chapterId) => {
        //             return action.payload.chapter[chapterId];
        //         }).sort((a, b) => {
        //             return a.sort_order - b.sort_order;
        //         }).map((chapter) => {
        //             const scenes = chapter.scenes.map((sceneId) => {
        //                 return action.payload.scene[sceneId];
        //             }).sort((a, b) => {
        //             return a.sort_order - b.sort_order;
        //             }).map((scene) => {
        //                 return {
        //                     id: scene.id,
        //                     name: scene.title,
        //                     type: 'scene',
        //                     isOpen: false,
        //                 };
        //             });
        //
        //             return {
        //                 id: chapter.id,
        //                 name: chapter.title,
        //                 type: 'chapter',
        //                 isOpen: false,
        //                 children: scenes,
        //             };
        //         });
        //         return {
        //           id: arc.id,
        //           name: arc.title,
        //           type: 'arc',
        //           isOpen: false,
        //           children: chapters,
        //         };
        //     });
        //     state.structure.push({
        //         id: book.id,
        //         name: book.title,
        //         type: 'book',
        //         isOpen: false,
        //         children: arcsChildren,
        //     })
        //   }
        // }

        //@ts-expect-error
        state[storyKey] = action.payload[storyKey];
      }
    },
    toggleTreeItem: (state, action: PayloadAction<{ id: string }>) => {},
    newStory: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    unload: (state) => {
      return initialState;
    },
    setSetting(
      state: Draft<Story>,
      action: PayloadAction<{
        key: "mangaChapterPath" | "aiInstructions";
        value: string;
      }>,
    ) {
      if (!state.settings) {
        state.settings = {};
      }
      if (state.settings) {
        state.modifiedTime = Date.now();
        state.settings[action.payload.key] = action.payload.value;
      }
    },
    createChapter: (state, action: PayloadAction<{ arcId: string }>) => {
      const newId = short.generate().toString();
      state.chapter[newId] = {
        id: newId,
        title: "New Chapter",
        summary: "",
        start_date: "",
      };
      state.modifiedTime = Date.now();
      addItemToStructure(state.structure, action.payload.arcId, {
        id: newId,
        name: "New Chapter",
        type: "chapter",
        isOpen: false,
        children: [],
      });
    },
    createBook: (state) => {
      const newId = short.generate().toString();
      state.book[newId] = {
        id: newId,
        title: "New Book",
        summary: "",
        start_date: "",
      };
      state.modifiedTime = Date.now();
      addItemToStructure(state.structure, undefined, {
        id: newId,
        name: "New Book",
        type: "book",
        isOpen: false,
        children: [],
      });
    },
    createArc: (state, action: PayloadAction<{ bookId: string }>) => {
      const newId = short.generate().toString();
      state.arc[newId] = {
        id: newId,
        title: "New Arc",
        summary: "",
        start_date: "",
      };
      state.modifiedTime = Date.now();
      addItemToStructure(state.structure, action.payload.bookId, {
        id: newId,
        name: "New Arc",
        type: "arc",
        isOpen: false,
        children: [],
      });
    },
    createScene: (state, action: PayloadAction<{ chapterId: string }>) => {
      const newId = short.generate().toString();

      state.scene[newId] = {
        id: newId,
        title: "New Scene",
        summary: "",
        words: 0,
        hasAI: false,
        posted: false,
        plot_point_actions: [],
        cursor: 0,
        paragraphs: [],
        text: "",
      };
      state.modifiedTime = Date.now();
      addItemToStructure(state.structure, action.payload.chapterId, {
        id: newId,
        name: "New Scene",
        type: "scene",
        isOpen: false,
      });
    },
    deleteScene: (state, action: PayloadAction<{ sceneId: string }>) => {
      delete state.scene[action.payload.sceneId];
      state.modifiedTime = Date.now();
      removeItemFromStructure(state.structure, action.payload.sceneId);
    },
    createSceneParagraph: (
      state,
      action: PayloadAction<{ sceneId: string; afterParagraphId: string }>,
    ) => {
      const newId = short.generate().toString();
      const afterParagraph = state.scene[
        action.payload.sceneId
      ].paragraphs.findIndex((p) => {
        return p.id === action.payload.afterParagraphId;
      });
      state.modifiedTime = Date.now();
      state.scene[action.payload.sceneId].paragraphs.splice(
        afterParagraph + 1,
        0,
        {
          id: newId,
          text: "",
          state: "draft",
          modifiedAt: new Date().toISOString(),
          comments: [],
          plot_point_actions: [],
        },
      );
      // set selected paragraph to new one
      state.scene[action.payload.sceneId].selectedParagraph = newId;
      state.scene[action.payload.sceneId].cursor = 0;
    },
    moveItem: (
      state,
      action: PayloadAction<{ id: string; parentId: string; index: number }>,
    ) => {
      const item = removeItemFromStructure(state.structure, action.payload.id);
      if (item) {
        addItemToStructure(
          state.structure,
          action.payload.parentId,
          item,
          action.payload.index,
        );
      }
      state.modifiedTime = Date.now();
    },
    deleteSceneParagraph: (
      state,
      action: PayloadAction<{ sceneId: string; paragraphId: string }>,
    ) => {
      const paragraphIndex = state.scene[
        action.payload.sceneId
      ].paragraphs.findIndex((p) => {
        return p.id === action.payload.paragraphId;
      });
      if (
        state.scene[action.payload.sceneId].paragraphs[paragraphIndex].text ===
        ""
      ) {
        state.scene[action.payload.sceneId].paragraphs.splice(
          paragraphIndex,
          1,
        );
      }
      state.modifiedTime = Date.now();
    },
    updateSceneParagraph: (
      state,
      action: PayloadAction<{
        sceneId: string;
        paragraphId: string;
        text?: string;
        extraLoading?: boolean;
        state?: SceneParagraph["state"];
        extra?: string;
      }>,
    ) => {
      const scene = state.scene[action.payload.sceneId];
      if (scene) {
        const paragraph = scene.paragraphs?.find((p) => {
          return p.id === action.payload.paragraphId;
        });
        if (action.payload.state === "ai") {
          scene.hasAI = true;
        } else {
          scene.hasAI = scene.paragraphs.some((p) => p.state === "ai");
        }
        scene.words = scene.paragraphs.reduce((acc, p) => {
          return acc + p.text.split(" ").length;
        }, 0);
        if (paragraph) {
          if (action.payload.text !== undefined) {
            paragraph.text = action.payload.text;
          }
          if (action.payload.extraLoading !== undefined) {
            paragraph.extraLoading = action.payload.extraLoading;
          }
          if (action.payload.state) {
            paragraph.state = action.payload.state;
          } else if (
            action.payload.text &&
            ["revise", "ai"].includes(paragraph.state)
          ) {
            paragraph.state = "draft";
          }
          if (action.payload.extra !== undefined) {
            console.log("setting extra");
            paragraph.extra = action.payload.extra;
          }
          paragraph.modifiedAt = new Date().toISOString();
          state.modifiedTime = Date.now();
        }
      }
    },
    updateScene: (state, action: PayloadAction<Partial<Scene>>) => {
      const id = action.payload.id as keyof typeof state.scene;
      if (id) {
        const keys = Object.keys(action.payload);
        for (const key of keys) {
          const writableKey = key as keyof Scene;
          const obj = state.scene[id];
          if (obj[writableKey] !== action.payload[writableKey]) {
            // @ts-ignore
            obj[writableKey] = action.payload[writableKey];
          }
        }
        state.modifiedTime = Date.now();
      }
    },
    updateChapter: (state, action: PayloadAction<Partial<Chapter>>) => {
      if (action.payload.id) {
        state.chapter[action.payload.id] = {
          ...state.chapter[action.payload.id],
          ...action.payload,
        };
        state.modifiedTime = Date.now();
      }
    },
    updateArc: (state, action: PayloadAction<Partial<Arc>>) => {
      if (action.payload.id) {
        state.arc[action.payload.id] = {
          ...state.arc[action.payload.id],
          ...action.payload,
        };
        state.modifiedTime = Date.now();
      }
    },
    updateBook: (state, action: PayloadAction<Partial<Book>>) => {
      if (action.payload.id) {
        state.book[action.payload.id] = {
          ...state.book[action.payload.id],
          ...action.payload,
        };
        state.modifiedTime = Date.now();
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
      state.modifiedTime = Date.now();
    },
    updateCharacter: (state, action: PayloadAction<Partial<Character>>) => {
      if (action.payload.id) {
        state.characters[action.payload.id] = {
          ...state.characters[action.payload.id],
          ...action.payload,
        };
        state.modifiedTime = Date.now();
      }
    },
    removeCharacter: (state, action: PayloadAction<string>) => {
      delete state.characters[action.payload];
      state.modifiedTime = Date.now();
    },
    deletePlotPoint: (
      state,
      action: PayloadAction<{
        plotpointId: string;
      }>,
    ) => {
      delete state.plotPoints[action.payload.plotpointId];
      state.modifiedTime = Date.now();
    },
    createPlotPoint: (state, action: PayloadAction<{}>) => {
      const newId = short.generate().toString();
      state.plotPoints[newId] = {
        id: newId,
        summary: "",
        title: "",
      };
      state.modifiedTime = Date.now();
    },
    updatePlotpoint: (
      state,
      action: PayloadAction<{
        id: string;
        title?: string;
        summary?: string;
      }>,
    ) => {
      state.plotPoints[action.payload.id] = {
        ...state.plotPoints[action.payload.id],
        ...action.payload,
      };
      state.modifiedTime = Date.now();
    },
    addPlotPointToSceneParagraph: (
      state,
      action: PayloadAction<{
        sceneId: string;
        paragraphId: string;
        plotpointId: string;
        action: string;
      }>,
    ) => {
      const p = state.scene[action.payload.sceneId].paragraphs.find((p) => {
        return p.id === action.payload.paragraphId;
      });

      if (
        p &&
        !p.plot_point_actions.some((i) => {
          return i.plot_point_id === action.payload.plotpointId;
        })
      ) {
        p.plot_point_actions.push({
          plot_point_id: action.payload.plotpointId,
          action: action.payload.action,
        });
        state.modifiedTime = Date.now();
      }
    },
    addPlotPointToScene: (
      state,
      action: PayloadAction<{
        sceneId: string;
        plotpointId: string;
        action: string;
      }>,
    ) => {
      state.scene[action.payload.sceneId].plot_point_actions.push({
        plot_point_id: action.payload.plotpointId,
        action: action.payload.action,
      });
      state.modifiedTime = Date.now();
    },
    removePlotPointFromSceneParagraph: (
      state,
      action: PayloadAction<{
        sceneId: string;
        paragraphId: string;
        plotpointId: string;
        action: string;
      }>,
    ) => {
      const p = state.scene[action.payload.sceneId].paragraphs.find((p) => {
        return p.id === action.payload.paragraphId;
      });
      if (p) {
        p.plot_point_actions = p?.plot_point_actions.filter((i) => {
          return (
            i.plot_point_id !== action.payload.plotpointId &&
            i.action !== action.payload.action
          );
        });
        state.modifiedTime = Date.now();
      }
    },
    removePlotPointFromScene: (
      state,
      action: PayloadAction<{
        sceneId: string;
        plotpointId: string;
        action: string;
      }>,
    ) => {
      state.scene[action.payload.sceneId].plot_point_actions = state.scene[
        action.payload.sceneId
      ].plot_point_actions.filter((i) => {
        return (
          i.plot_point_id !== action.payload.plotpointId &&
          i.action !== action.payload.action
        );
      });
      state.modifiedTime = Date.now();
    },
  },
});

// Action creators are generated for each case reducer function
export const storyActions = globalSlice.actions;

export const reducer = globalSlice.reducer;

import type { Chapter } from "@writer/shared";
import { createStore } from "solid-js/store";
import {
  appendNode,
  findNode,
  removeNode,
  insertNode,
  updateNode,
} from "./tree";
import shortUUID from "short-uuid";

const chaptersStateDefault = {
  chapters: {},
};
export const [chaptersState, setChaptersState] = createStore<{
  chapters: Record<string, Chapter>;
}>(chaptersStateDefault);

export const resetChaptersState = () => {
  setChaptersState("chapters", {});
};

export const createChapter = (arcId: string, beforeId?: string) => {
  const newChapter = {
    id: shortUUID.generate(),
    type: "chapter" as const,
    name: "New Chapter",
    children: [],
    isOpen: true,
  };

  setChaptersState("chapters", newChapter.id, {
    id: newChapter.id,
    title: newChapter.name,
    summary: "",
    modifiedAt: Date.now(),
  } satisfies Chapter);
  insertNode(newChapter, arcId, beforeId);
  return newChapter;
};

export const deleteChapter = (id: string) => {
  // check if there are any scenes in this chapter
  const scenes = findNode(id)?.children?.filter((c) => c.type === "scene");
  if (scenes && scenes.length > 0) {
    alert("Remove all scenes first");
    return;
  }
  removeNode(id);
  // @ts-expect-error: this is a valid way to delete
  setChaptersState("chapters", id, undefined);
};

export const updateChapter = (id: string, chapter: Partial<Chapter>) => {
  setChaptersState("chapters", id, {
    ...chapter,
    modifiedAt: Date.now(),
  });
  if (chapter.title) {
    updateNode(id, { name: chapter.title as string });
  }
};

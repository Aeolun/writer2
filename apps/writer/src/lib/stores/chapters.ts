import { Chapter } from "@writer/shared";
import { createStore } from "solid-js/store";
import { appendNode, findNode, removeNode } from "./tree";
import shortUUID from "short-uuid";

export const [chaptersState, setChaptersState] = createStore<{
  chapters: Record<string, Chapter>;
}>({
  chapters: {},
});

export const createChapter = (parentId: string) => {
  const id = shortUUID.generate();
  setChaptersState("chapters", id, {
    id,
    title: "New chapter",
  });
  appendNode(
    { id, type: "chapter", name: "New chapter", isOpen: true },
    parentId,
  );
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
  setChaptersState("chapters", id, chapter);
};

import { treeState } from "../tree";
import { getWordCount, scenesState } from "../scenes";
import { contentSchemaToHtml } from "../../persistence/content-schema-to-html";

export type SortedChapterHeaderObject = {
  type: "chapter_header";
  text: string;
};

export type SortedBreakObject = {
  type: "break";
  text: string;
};

export type SortedParagraphObject = {
  type: "paragraph";
  text: string;
  sceneId: string;
  posted: boolean;
  state: string;
  paragraphId: string;
  plotpointIds: string[];
};

export type SortedSummaryObject = {
  type: "summary";
  words: number;
  aiWords: number;
  books: number;
  chapters: number;
  scenes: number;
};

export type SortedBookObject =
  | SortedChapterHeaderObject
  | SortedBreakObject
  | SortedParagraphObject
  | SortedSummaryObject;

export const sortedObjects = (rootId?: string) => {
  const stats = {
    words: 0,
    aiWords: 0,
    books: 0,
    chapters: 0,
    scenes: 0,
  };

  const objects: SortedBookObject[] = [];
  let currentlySelected = 0;

  // Use the structure from treeState
  for (const bookNode of treeState.structure) {
    if (bookNode.id === rootId || rootId === undefined) {
      currentlySelected++;
    }

    if (currentlySelected > 0) {
      stats.books++;
    }
    for (const arcNode of bookNode.children ?? []) {
      if (
        arcNode.id === rootId ||
        rootId === undefined ||
        currentlySelected > 0
      ) {
        currentlySelected++;
      }

      for (const chapterNode of arcNode.children ?? []) {
        if (
          chapterNode.id === rootId ||
          rootId === undefined ||
          currentlySelected > 0
        ) {
          currentlySelected++;
        }
        if (currentlySelected > 0) {
          stats.chapters++;
          objects.push({
            type: "chapter_header",
            text: chapterNode.name,
          });
        }
        for (
          let index = 0;
          index < (chapterNode.children?.length ?? 0);
          index++
        ) {
          const scene = chapterNode.children?.[index];
          if (!scene) continue;

          if (
            scene.id === rootId ||
            rootId === undefined ||
            currentlySelected > 0
          ) {
            currentlySelected++;
          }

          if (currentlySelected > 0) {
            stats.scenes++;
            const sceneData = scenesState.scenes[scene.id];
            for (const paragraph of sceneData.paragraphs) {
              stats.words +=
                paragraph.state === "ai" ? 0 : getWordCount(paragraph.text);
              stats.aiWords +=
                paragraph.state === "ai" ? getWordCount(paragraph.text) : 0;
              objects.push({
                type: "paragraph",
                text:
                  typeof paragraph.text === "string"
                    ? paragraph.text
                    : contentSchemaToHtml(paragraph.text),
                sceneId: scene.id,
                state: paragraph.state,
                posted: sceneData.posted ?? false,
                paragraphId: paragraph.id,
                plotpointIds:
                  paragraph.plot_point_actions?.map((p) => p.plot_point_id) ??
                  [],
              });
            }
            if (index !== (chapterNode.children?.length ?? 0) - 1) {
              objects.push({
                type: "break",
                text: "",
              });
            }
          }
          if (currentlySelected > 0) {
            currentlySelected--;
          }
        }
        if (currentlySelected > 0) {
          currentlySelected--;
        }
      }
      if (currentlySelected > 0) {
        currentlySelected--;
      }
    }
    if (currentlySelected > 0) {
      currentlySelected--;
    }
  }

  objects.unshift({
    type: "summary",
    ...stats,
  });

  return objects;
};

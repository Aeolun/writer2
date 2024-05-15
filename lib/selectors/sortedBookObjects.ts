import { createSelector } from "reselect";
import { arcSelector } from "./arcSelector";
import { bookSelector } from "./bookSelector";
import { chaptersSelector } from "./chapterSelector";
import { scenesSelector } from "./scenesSelector";
import { selectedObjectSelector } from "./selectedObjectSelector";
import { structureSelector } from "./structureSelector";

export type SortedBookObject =
  | {
      type: "chapter_header" | "break";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
      sceneId: string;
      posted: boolean;
      state: string;
      paragraphId: string;
    }
  | {
      type: "summary";
      words: number;
      aiWords: number;
      books: number;
      chapters: number;
      scenes: number;
    };

export const sortedBookObjects = createSelector(
  structureSelector,
  bookSelector,
  arcSelector,
  chaptersSelector,
  scenesSelector,
  selectedObjectSelector,
  (structure, book, arcs, chapters, scenes, selected) => {
    if (!selected) return;

    const stats = {
      words: 0,
      aiWords: 0,
      books: 0,
      chapters: 0,
      scenes: 0,
    };

    const objects: SortedBookObject[] = [];
    let currentlySelected = 0;
    // transform structure into a flat list of objects
    for (const book of structure) {
      if (book.id === selected.id) {
        currentlySelected++;
      }

      if (currentlySelected > 0) {
        stats.books++;
      }
      for (const arc of book.children ?? []) {
        if (arc.id === selected.id || currentlySelected > 0) {
          currentlySelected++;
        }

        for (const chapter of arc.children ?? []) {
          if (chapter.id === selected.id || currentlySelected > 0) {
            currentlySelected++;
          }
          if (currentlySelected > 0) {
            stats.chapters++;
            objects.push({
              type: "chapter_header",
              text: chapter.name,
            });
          }
          for (
            let index = 0;
            index < (chapter.children?.length ?? 0);
            index++
          ) {
            const scene = chapter.children?.[index];
            if (!scene) continue;

            if (scene.id === selected.id || currentlySelected > 0) {
              currentlySelected++;
            }

            if (currentlySelected > 0) {
              stats.scenes++;
              for (const paragraph of scenes[scene.id].paragraphs) {
                stats.words +=
                  paragraph.state === "ai"
                    ? 0
                    : paragraph.text.split(" ").length;
                stats.aiWords +=
                  paragraph.state === "ai"
                    ? paragraph.text.split(" ").length
                    : 0;
                objects.push({
                  type: "paragraph",
                  text: paragraph.text,
                  sceneId: scene.id,
                  state: paragraph.state,
                  posted: scenes[scene.id].posted ?? false,
                  paragraphId: paragraph.id,
                });
              }
              if (index !== (chapter.children?.length ?? 0) - 1) {
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
  },
);

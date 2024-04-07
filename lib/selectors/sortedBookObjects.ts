import {createSelector} from "reselect";
import {bookSelector} from "./bookSelector";
import {selectedObjectSelector} from "./selectedObjectSelector";
import {arcSelector} from "./arcSelector";
import {chaptersSelector} from "./chapterSelector";
import {scenesSelector} from "./scenesSelector";
import {structureSelector} from "./structureSelector";

export const sortedBookObjects = createSelector(structureSelector, bookSelector, arcSelector, chaptersSelector, scenesSelector, selectedObjectSelector, (structure, book, arcs, chapters, scenes, selected) => {
    if (!selected) return;

    const stats = {
        words: 0,
        books: 0,
        chapters: 0,
        scenes: 0
    }

    const objects: ({
        type: 'chapter_header' | 'break'
        text: string
    } | {
        type: 'paragraph'
        text: string
        sceneId: string
        state: string
        paragraphId: string
    } | {
        type: 'summary'
        words: number
        books: number
        chapters: number
        scenes: number
    })[] = []
    // transform structure into a flat list of objects
    for (const book of structure) {
        stats.books++
        for(const arc of book.children ?? []) {
            for (const chapter of arc.children ?? []) {
                stats.chapters++
                objects.push({
                    type: 'chapter_header',
                    text: chapter.name
                })
                for (let index = 0; index < (chapter.children?.length ?? 0); index++) {
                    const scene = chapter.children?.[index]
                    if (!scene) continue;

                    stats.scenes++
                    for(const paragraph of scenes[scene.id].paragraphs) {
                        stats.words += paragraph.text.split(' ').length
                        objects.push({
                            type: 'paragraph',
                            text: paragraph.text,
                            sceneId: scene.id,
                            state: paragraph.state,
                            paragraphId: paragraph.id
                        })
                    }
                    if (index !== (chapter.children?.length ?? 0) - 1) {
                        objects.push({
                            type: 'break',
                            text: ''
                        })
                    }
                }
            }
        }
    }
    objects.unshift({
        type: 'summary',
        ...stats
    })

    return objects
})
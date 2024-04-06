import {createSelector} from "reselect";
import {bookSelector} from "./bookSelector";
import {selectedObjectSelector} from "./selectedObjectSelector";
import {arcSelector} from "./arcSelector";
import {chaptersSelector} from "./chapterSelector";
import {scenesSelector} from "./scenesSelector";

export const sortedBookScenes = createSelector(bookSelector, arcSelector, chaptersSelector, scenesSelector, selectedObjectSelector, (book, arcs, chapters, scenes, selected) => {
    if (!selected) return;

    const sceneText: string[] = []
    const bookArcs = book[selected.id].arcs.map(arc => arcs[arc])
    bookArcs.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).forEach(arc => {
        const arcChapters = arc.chapters.map(chapter => chapters[chapter])
        arcChapters.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).forEach(chapter => {
            const chapterScenes = chapter.scenes.map(scene => scenes[scene])
            chapterScenes.sort((a, b) => { return a.sort_order > b.sort_order ? 1 : -1 }).forEach(scene => {
                sceneText.push(scene.text)
            })
        })
    })

    return sceneText
})
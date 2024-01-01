import sqlite from "better-sqlite3";
import { Chapter, Scene, StoryState } from "./lib/slices/story";
import * as fs from "fs";

const lite = new sqlite("./manga.sqlite");

const story: StoryState = {
  chapter: {},
  characters: {},
  plotPoints: {},
  scene: {},
  counters: {
    chapterSequence: 0,
    sceneSequence: 0,
    plotPointSequence: 0,
    characterSequence: 0,
  },
};

const query = (sql: string, parameters?: any[]) => {
  return lite.prepare(sql).all(...(parameters ?? []));
};

const chapters = query("SELECT * FROM chapter");

chapters.forEach((chapter) => {
  const newChapterObject: Chapter = {
    summary: chapter.summary ?? "",
    id: chapter.id,
    start_date: chapter.start_date,
    sort_order: chapter.priority ?? chapter.id,
    title: chapter.title,
    scenes: [],
  };
  if (chapter.id > story.counters.chapterSequence) {
    story.counters.chapterSequence = chapter.id + 1;
  }

  const scenes = query("SELECT * FROM scene WHERE chapter_id = ?", [
    chapter.id,
  ]);

  scenes.forEach((scene) => {
    const newSceneObject: Scene = {
      id: scene.id,
      title: scene.title ?? "Scene " + scene.id,
      sort_order: scene.priority ?? scene.id,
      summary: scene.summary ?? "",
      text: "",
      plot_point_actions: [],
    };
    if (newSceneObject.id > story.counters.sceneSequence) {
      story.counters.sceneSequence = scene.id + 1;
    }

    const stories = query(
      "SELECT * FROM story WHERE chapter = ? AND scene = ?",
      [chapter.id, scene.id]
    );
    const plotPointActions = query(
      "SELECT * FROM plot_point_action WHERE chapter = ? AND scene = ?",
      [chapter.id, scene.id]
    );

    stories.forEach((storyRow) => {
      newSceneObject.text += storyRow.summary + "\n\n";
    });
    plotPointActions.forEach((ppa) => {
      newSceneObject.plot_point_actions.push({
        plot_point_id: ppa.plot_point_id,
        action: ppa.action,
      });
    });

    story.scene[newSceneObject.id] = newSceneObject;
    newChapterObject.scenes.push(newSceneObject.id);
  });

  story.chapter[newChapterObject.id] = newChapterObject;
});

const characters = query("SELECT * FROM character");

characters.forEach((char) => {
  story.characters[char.id] = {
    id: char.id,
    name: char.name ?? "",
    summary: char.summary ?? "",
    age: char.age ?? "",
    picture: char.picture,
  };
  if (char.id > story.counters.characterSequence) {
    story.counters.characterSequence = char.id + 1;
  }
});

const plotPoint = query("SELECT * FROM plot_point");

plotPoint.forEach((point) => {
  story.plotPoints[point.id] = {
    id: point.id,
    summary: point.summary ?? "",
    title: point.title ?? "",
  };
  if (point.id > story.counters.plotPointSequence) {
    story.counters.plotPointSequence = point.id + 1;
  }
});

console.log(story);
fs.writeFileSync("./story.json", JSON.stringify(story));

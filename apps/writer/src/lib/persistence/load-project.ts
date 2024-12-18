import { path } from "@tauri-apps/api";
import { readDir, readTextFile, stat, exists } from "@tauri-apps/plugin-fs";
import {
  type Node,
  type PersistedStory,
  entities,
  languageEntities,
  persistedSchema,
} from "@writer/shared";
import short from "short-uuid";
import { setArcsStore } from "../stores/arcs";
import {
  setExpectedLastModified,
  setOpenPath,
  setStory,
} from "../stores/story";
import { setCharactersState } from "../stores/characters";
import { setTree } from "../stores/tree";
import { setChaptersState } from "../stores/chapters";
import { getWordCount, setScenesState } from "../stores/scenes";
import { setPlotpoints } from "../stores/plot-points";
import { setItems } from "../stores/items";
import { setLanguageStore } from "../stores/language-store";
import { setBooksStore } from "../stores/books";
import { loadToState } from "./load-to-state";

export const loadProject = async (projectPath: string) => {
  const indexPath = await path.join(projectPath, "index.json");
  const story = await readTextFile(indexPath);
  const storyStat = await stat(indexPath);

  const storyData = JSON.parse(story);
  if (!storyData.story.id) {
    storyData.story.id = short.generate().toString();
  }

  for (const entity of entities) {
    delete storyData.story[entity];

    try {
      storyData.story[entity] = {};
      const entityPath = await path.join(projectPath, entity);
      if (await exists(entityPath)) {
        const entityFiles = await readDir(entityPath);
        for (const entityId of entityFiles
          .filter((file) => !file.name.startsWith("."))
          .map((file) => file.name.replace(".json", ""))) {
          const entityFile = await path.join(entityPath, `${entityId}.json`);
          const entityData = await readTextFile(entityFile);
          storyData.story[entity][entityId] = JSON.parse(entityData.toString());
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  for (const languageEntity of languageEntities) {
    if (storyData.language) {
      delete storyData.language[languageEntity];
      storyData.language[languageEntity] = {};
      const languageEntityPath = await path.join(projectPath, languageEntity);
      if (await exists(languageEntityPath)) {
        const languageEntityFiles = await readDir(languageEntityPath);
        for (const languageEntityId of languageEntityFiles.map((name) =>
          name.name.replace(".json", ""),
        )) {
          const entityPath = await path.join(
            languageEntityPath,
            `${languageEntityId}.json`,
          );
          const languageEntityData = await readTextFile(entityPath);
          storyData.language[languageEntity][languageEntityId] = JSON.parse(
            languageEntityData.toString(),
          );
        }
      }
    }
  }

  let savedStory: PersistedStory;
  try {
    savedStory = persistedSchema.parse(storyData);
  } catch (error) {
    console.log(error);
    throw new Error("Story does not match schema and cannot be loaded.");
  }

  const ids: string[] = [];
  const getIdFromTreeObject = (node: Node) => {
    ids.push(node.id);
    if (node.children) {
      for (const child of node.children) {
        getIdFromTreeObject(child);
      }
    }
  };
  for (const node of savedStory.story.structure) {
    getIdFromTreeObject(node);
  }
  // trash all entities that don't have a corresponding id in the structure
  for (const entity of ["book", "arc", "chapter", "scene"] as const) {
    if (savedStory.story[entity]) {
      for (const id of Object.keys(savedStory.story[entity])) {
        if (!ids.includes(id)) {
          delete savedStory.story[entity][id];
        }
      }
    }
  }

  // const storyObject = await db.query.storyTable.findFirst({
  //   where: eq(storyTable.name, savedStory.story.name),
  // });
  // if (!storyObject) {
  //   await db.insert(storyTable).values({
  //     id: short.generate().toString(),
  //     name: savedStory.story.name,
  //   });
  // }

  loadToState(savedStory);
  setOpenPath(projectPath);
  setExpectedLastModified(storyStat.mtime?.getTime() ?? 0);

  return savedStory;
};

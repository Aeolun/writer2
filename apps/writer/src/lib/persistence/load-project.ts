import { path } from "@tauri-apps/api";
import { readDir, readTextFile, stat } from "@tauri-apps/plugin-fs";
import {
  type Node,
  type PersistedStory,
  entities,
  languageEntities,
  persistedSchema,
} from "@writer/shared";
import short from "short-uuid";
import { globalActions } from "../slices/global.ts";
import { languageActions } from "../slices/language.ts";
import { storyActions } from "../slices/story.ts";
import { store } from "../store.ts";

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
      const entityFiles = await readDir(entityPath);
      for (const entityId of entityFiles
        .filter((file) => !file.name.startsWith("."))
        .map((file) => file.name.replace(".json", ""))) {
        const entityFile = await path.join(entityPath, `${entityId}.json`);
        const entityData = await readTextFile(entityFile);
        storyData.story[entity][entityId] = JSON.parse(entityData.toString());
      }
    } catch (error) {
      console.error(error);
    }
  }

  for (const languageEntity of languageEntities) {
    delete storyData.language[languageEntity];
    storyData.language[languageEntity] = {};
    const languageEntityPath = await path.join(projectPath, languageEntity);
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
      node.children.forEach(getIdFromTreeObject);
    }
  };
  savedStory.story.structure.forEach(getIdFromTreeObject);
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

  store.dispatch(storyActions.setStory(savedStory.story));
  store.dispatch(globalActions.setOpenPath(projectPath));
  store.dispatch(
    globalActions.setExpectedLastModified(storyStat.mtime?.getTime() ?? 0),
  );
  if (savedStory.language) {
    store.dispatch(languageActions.setLanguages(savedStory.language));
  }

  return savedStory;
};

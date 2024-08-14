import {path} from "@tauri-apps/api";
import {readDir, readTextFile, stat} from "@tauri-apps/plugin-fs";
import {eq} from "drizzle-orm";
import short from "short-uuid";
import {db} from "../../db";
import {storyTable} from "../../db/schema.ts";
import {entities, languageEntities, persistedSchema, type PersistedStory,} from "@writer/shared";
import {globalActions} from "../slices/global.ts";
import {languageActions} from "../slices/language.ts";
import {storyActions} from "../slices/story.ts";
import {store} from "../store.ts";

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

    storyData.story[entity] = {};
    const entityPath = await path.join(projectPath, entity);
    const entityFiles = await readDir(entityPath);
    for (const entityId of entityFiles.map((file) =>
      file.name.replace(".json", ""),
    )) {
      const entityFile = await path.join(entityPath, `${entityId}.json`);
      const entityData = await readTextFile(entityFile);
      storyData.story[entity][entityId] = JSON.parse(entityData.toString());
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

  const storyObject = await db.query.storyTable.findFirst({
    where: eq(storyTable.name, savedStory.story.name),
  });
  if (!storyObject) {
    await db.insert(storyTable).values({
      id: short.generate().toString(),
      name: savedStory.story.name,
    });
  }

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

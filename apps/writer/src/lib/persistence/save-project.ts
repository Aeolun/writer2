import { path } from "@tauri-apps/api";
import {
  mkdir,
  readDir,
  readTextFile,
  remove,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import {
  type SavePayload,
  entities,
  languageEntities,
  saveSchema,
} from "../persistence.ts";
import { globalActions } from "../slices/global.ts";
import { store } from "../store.ts";

export const saveProject = async (projectPath: string, data: SavePayload) => {
  try {
    store.dispatch(globalActions.setSaving(true));

    const validatedBody = saveSchema.parse(data);
    const newAutosave = validatedBody.newAutosave;

    const storyFile = await path.join(projectPath, "index.json");
    const story = await readTextFile(storyFile);

    const currentDateTime = new Date().toISOString();
    const storyAutoSavePath = await path.join(projectPath, "autosave");
    const autoSavePath = await path.join(storyAutoSavePath, currentDateTime);

    if (newAutosave) {
      // TODO: Re-enable autosave
      // await mkdir(autoSavePath, { recursive: true });
      // await copyFile(projectPath, autoSavePath, {
      //   recursive: true,
      //   filter: (source: string, destination: string) => {
      //     return (
      //       !source.includes(`${req.query.story as string}/data`) &&
      //       !source.includes(`${req.query.story as string}/.git`)
      //     );
      //   },
      // });
      //
      // // delete the oldest autosaves in storyAutoSavePath
      // const allAutoSaveFiles = await fs.readdir(storyAutoSavePath);
      // const allAutoSavePaths = allAutoSaveFiles.map((file) =>
      //   path.join(storyAutoSavePath, file),
      // );
      // const allAutoSaveStats = await Promise.all(
      //   allAutoSavePaths.map((file) => fs.stat(file)),
      // );
      // const allAutoSaveStatsMap = allAutoSaveStats.map((stat, index) => ({
      //   stat,
      //   index,
      // }));
      // allAutoSaveStatsMap.sort(
      //   (a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime(),
      // );
      // const allAutoSaveStatsMapPaths = allAutoSaveStatsMap.map(
      //   (file) => allAutoSavePaths[file.index],
      // );
      //
      // const allAutoSaveStatsMapPathsToDelete = allAutoSaveStatsMapPaths.slice(
      //   0,
      //   -8,
      // );
      // await Promise.all(
      //   allAutoSaveStatsMapPathsToDelete.map((file) =>
      //     fs.rm(file, { recursive: true }),
      //   ),
      // );
    }

    const currentFileStat = await stat(storyFile);
    // console.log(
    //   "expected",
    //   validatedBody.expectedLastModified,
    //   "actual",
    //   currentFileStat.mtime?.getTime(),
    // );
    if (
      currentFileStat.mtime?.getTime() !== validatedBody.expectedLastModified
    ) {
      throw new Error(
        "Conflict during save. Existing file is newer than the saved one.",
      );
    }

    // get story from db based on name
    // let storyObject: StoryTable | undefined;
    // try {
    //   storyObject = await db.query.storyTable.findFirst({
    //     where: eq(storyTable.name, validatedBody.story.name),
    //   });
    // } catch (error) {
    //   console.error("Error finding story", error);
    // }

    // if (!storyObject) {
    //   throw new Error("Story not found");
    // }

    // save the tree
    // const saveTree = async (
    //   entity: Node,
    //   parentId: string | undefined,
    //   sortOrder: number | undefined,
    // ) => {
    //   await db
    //     .insert(treeEntity)
    //     .values({
    //       id: entity.id,
    //       storyId: storyObject.id,
    //       parentId: parentId,
    //       sortOrder: sortOrder,
    //       title: entity.name,
    //       kind: entity.type,
    //       summary: validatedBody.story[entity.type][entity.id].summary,
    //     })
    //     .onConflictDoUpdate({
    //       target: treeEntity.id,
    //       set: {
    //         parentId: parentId,
    //         title: entity.name,
    //         sortOrder: sortOrder,
    //         summary: validatedBody.story[entity.type][entity.id].summary,
    //       },
    //     });
    //   if (entity.type === "scene") {
    //     await db
    //       .insert(scene)
    //       .values([
    //         {
    //           treeEntityId: entity.id,
    //           sceneJson: JSON.stringify(
    //             validatedBody.story[entity.type][entity.id],
    //           ),
    //         },
    //       ])
    //       .onConflictDoUpdate({
    //         target: scene.treeEntityId,
    //         set: {
    //           sceneJson: JSON.stringify(
    //             validatedBody.story[entity.type][entity.id],
    //           ),
    //         },
    //       });
    //   }
    //   let childIndex = 0;
    //   for (const child of entity.children ?? []) {
    //     await saveTree(child, entity.id, childIndex);
    //     childIndex++;
    //   }
    // };
    // try {
    //   await Promise.all(
    //     validatedBody.story.structure.map((node) => {
    //       return saveTree(node, undefined, undefined);
    //     }),
    //   );
    // } catch (error) {
    //   console.error("Error saving tree", error);
    // }

    // save the rest of the entities
    // try {
    //   await Promise.all(
    //     Object.values(validatedBody.story.plotPoints).map((plotPoint) => {
    //       return db
    //         .insert(plotpoint)
    //         .values({
    //           id: plotPoint.id,
    //           storyId: storyObject.id,
    //           summary: plotPoint.summary,
    //           name: plotPoint.title,
    //         })
    //         .onConflictDoUpdate({
    //           target: plotpoint.id,
    //           set: {
    //             name: plotPoint.title,
    //             summary: plotPoint.summary,
    //           },
    //         });
    //     }),
    //   );
    // } catch (error) {
    //   console.error("Error saving plotpoints", error);
    // }

    // try {
    //   await Promise.all(
    //     Object.values(validatedBody.story.characters).map((character) => {
    //       return db
    //         .insert(characterSchema)
    //         .values({
    //           id: character.id,
    //           storyId: storyObject.id,
    //           summary: character.summary,
    //           name: character.name,
    //           age: character.age,
    //           picture: character.picture,
    //           isProtagonist: character.isProtagonist ? "1" : "0",
    //         })
    //         .onConflictDoUpdate({
    //           target: characterSchema.id,
    //           set: {
    //             name: character.name,
    //             summary: character.summary,
    //             isProtagonist: character.isProtagonist ? "1" : "0",
    //             picture: character.picture,
    //             age: character.age,
    //           },
    //         });
    //     }),
    //   );
    // } catch (error) {
    //   console.error("Error saving characters", error);
    // }

    for (const entity of entities) {
      const entityPath = await path.join(projectPath, entity);
      await mkdir(entityPath, { recursive: true });
      for (const entityId of Object.keys(validatedBody.story[entity])) {
        const sceneData = validatedBody.story[entity][entityId];
        const entityFile = await path.join(
          projectPath,
          entity,
          `${entityId}.json`,
        );
        await writeTextFile(entityFile, JSON.stringify(sceneData, null, 2));
      }
      // remove entities that do not exist any more
      const entitiesPath = await path.join(projectPath, entity);
      const allFiles = await readDir(entitiesPath);
      const allKeys = Object.keys(validatedBody.story[entity]).map(
        (key) => `${key}.json`,
      );
      for (const file of allFiles) {
        if (!allKeys.includes(file.name)) {
          const allKey = await path.join(projectPath, entity, file.name);
          await remove(allKey);
        }
      }
      delete validatedBody.story[entity];
    }

    for (const languageEntity of languageEntities) {
      const languagePath = await path.join(projectPath, languageEntity);
      await mkdir(languagePath, { recursive: true });
      for (const languageEntityId of Object.keys(
        validatedBody.language[languageEntity],
      )) {
        const languageData =
          validatedBody.language[languageEntity][languageEntityId];
        const entityFile = await path.join(
          projectPath,
          languageEntity,
          `${languageEntityId}.json`,
        );
        await writeTextFile(entityFile, JSON.stringify(languageData, null, 2));
      }
      // @ts-expect-error: not sure why complain here
      delete validatedBody.language[languageEntity];
    }

    await writeTextFile(
      storyFile,
      JSON.stringify(
        {
          story: validatedBody.story,
          language: validatedBody.language,
        },
        null,
        2,
      ),
    );

    const newFileStat = await stat(storyFile);
    // console.log("new last modified", newFileStat.mtime?.getTime());

    if (newFileStat.mtime) {
      store.dispatch(
        globalActions.setExpectedLastModified(newFileStat.mtime.getTime()),
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    store.dispatch(globalActions.setSaving(false));
  }
};

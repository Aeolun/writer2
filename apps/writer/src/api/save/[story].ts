import path from "path";
import { eq } from "drizzle-orm";
import * as fs from "fs/promises";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { db } from "../../../lib/drizzle";
import {
  type StoryTable,
  character as characterSchema,
  plotpoint,
  scene,
  storyTable,
  treeEntity,
} from "../../../lib/drizzle/schema";
import {
  type Node,
  entities,
  languageEntities,
  saveSchema,
} from "../../../lib/persistence";
import { type WriterSession, authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session: WriterSession | null = await getServerSession(
    req,
    res,
    authOptions,
  );
  if (!session?.owner) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const validatedBody = saveSchema.parse(req.body);
    const newAutosave = validatedBody.newAutosave;

    const savePath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      `${req.query.story as string}`,
    );

    const currentDateTime = new Date().toISOString();
    const storyAutoSavePath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      "autosave",
      `${req.query.story as string}`,
    );
    const autoSavePath = path.join(storyAutoSavePath, currentDateTime);

    if (newAutosave) {
      await fs.mkdir(autoSavePath, { recursive: true });
      await fs.cp(savePath, autoSavePath, {
        recursive: true,
        filter: (source: string, destination: string) => {
          return (
            !source.includes(`${req.query.story as string}/data`) &&
            !source.includes(`${req.query.story as string}/.git`)
          );
        },
      });

      // delete the oldest autosaves in storyAutoSavePath
      const allAutoSaveFiles = await fs.readdir(storyAutoSavePath);
      const allAutoSavePaths = allAutoSaveFiles.map((file) =>
        path.join(storyAutoSavePath, file),
      );
      const allAutoSaveStats = await Promise.all(
        allAutoSavePaths.map((file) => fs.stat(file)),
      );
      const allAutoSaveStatsMap = allAutoSaveStats.map((stat, index) => ({
        stat,
        index,
      }));
      allAutoSaveStatsMap.sort(
        (a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime(),
      );
      const allAutoSaveStatsMapPaths = allAutoSaveStatsMap.map(
        (file) => allAutoSavePaths[file.index],
      );

      const allAutoSaveStatsMapPathsToDelete = allAutoSaveStatsMapPaths.slice(
        0,
        -8,
      );
      await Promise.all(
        allAutoSaveStatsMapPathsToDelete.map((file) =>
          fs.rm(file, { recursive: true }),
        ),
      );
    }

    const indexPath = path.join(savePath, "index.json");
    const currentFileStat = await fs.stat(indexPath);
    console.log(
      "expected",
      validatedBody.expectedLastModified,
      "actual",
      currentFileStat.mtime.getTime(),
    );
    if (
      currentFileStat.mtime.getTime() !== validatedBody.expectedLastModified
    ) {
      res.status(409).json({
        message: "Conflict",
        updated: currentFileStat.mtime,
      });
      return;
    }

    // get story from db based on name
    let storyObject: StoryTable | undefined;
    try {
      storyObject = await db.query.storyTable.findFirst({
        where: eq(storyTable.name, req.query.story as string),
      });
    } catch (error) {
      console.error("Error finding story", error);
    }

    if (!storyObject) {
      res.status(404).json({
        message: "Story not found",
      });
      return;
    }

    // save the tree
    const saveTree = async (
      entity: Node,
      parentId: string | undefined,
      sortOrder: number,
    ) => {
      await db
        .insert(treeEntity)
        .values({
          id: entity.id,
          storyId: storyObject.id,
          parentId: parentId,
          sortOrder: sortOrder,
          title: entity.name,
          kind: entity.type,
          summary: validatedBody.story[entity.type][entity.id].summary,
        })
        .onConflictDoUpdate({
          target: treeEntity.id,
          set: {
            parentId: parentId,
            title: entity.name,
            sortOrder: sortOrder,
            summary: validatedBody.story[entity.type][entity.id].summary,
          },
        });
      if (entity.type === "scene") {
        await db
          .insert(scene)
          .values({
            treeEntityId: entity.id,
            sceneJson: validatedBody.story[entity.type][entity.id],
          })
          .onConflictDoUpdate({
            target: scene.treeEntityId,
            set: {
              sceneJson: validatedBody.story[entity.type][entity.id],
            },
          });
      }
      let childIndex = 0;
      for (const child of entity.children ?? []) {
        await saveTree(child, entity.id, childIndex);
        childIndex++;
      }
    };
    try {
      await Promise.all(
        validatedBody.story.structure.map((node) => {
          return saveTree(node, undefined);
        }),
      );
    } catch (error) {
      console.error("Error saving tree", error);
    }

    // save the rest of the entities
    try {
      await Promise.all(
        Object.values(validatedBody.story.plotPoints).map((plotPoint) => {
          return db
            .insert(plotpoint)
            .values({
              id: plotPoint.id,
              storyId: storyObject.id,
              summary: plotPoint.summary,
              name: plotPoint.title,
            })
            .onConflictDoUpdate({
              target: plotpoint.id,
              set: {
                name: plotPoint.title,
                summary: plotPoint.summary,
              },
            });
        }),
      );
    } catch (error) {
      console.error("Error saving plotpoints", error);
    }

    try {
      await Promise.all(
        Object.values(validatedBody.story.characters).map((character) => {
          return db
            .insert(characterSchema)
            .values({
              id: character.id,
              storyId: storyObject.id,
              summary: character.summary,
              name: character.name,
              age: character.age,
              picture: character.picture,
              isProtagonist: character.isProtagonist,
            })
            .onConflictDoUpdate({
              target: plotpoint.id,
              set: {
                name: character.name,
                summary: character.summary,
                isProtagonist: character.isProtagonist,
                picture: character.picture,
                age: character.age,
              },
            });
        }),
      );
    } catch (error) {
      console.error("Error saving characters", error);
    }

    for (const entity of entities) {
      await fs.mkdir(path.join(savePath, entity), { recursive: true });
      for (const entityId of Object.keys(validatedBody.story[entity])) {
        const sceneData = validatedBody.story[entity][entityId];
        await fs.writeFile(
          savePath + "/" + entity + "/" + entityId + ".json",
          JSON.stringify(sceneData, null, 2),
        );
      }
      // remove entities that do not exist any more
      const allFiles = await fs.readdir(path.join(savePath, entity));
      const allKeys = Object.keys(validatedBody.story[entity]).map(
        (key) => key + ".json",
      );
      for (const file of allFiles) {
        if (!allKeys.includes(file)) {
          await fs.unlink(path.join(savePath, entity, file));
        }
      }
      delete validatedBody.story[entity];
    }

    for (const languageEntity of languageEntities) {
      await fs.mkdir(path.join(savePath, languageEntity), { recursive: true });
      for (const languageEntityId of Object.keys(
        validatedBody.language[languageEntity],
      )) {
        const languageData =
          validatedBody.language[languageEntity][languageEntityId];
        await fs.writeFile(
          savePath + "/" + languageEntity + "/" + languageEntityId + ".json",
          JSON.stringify(languageData, null, 2),
        );
      }
      // @ts-expect-error: not sure why complain here
      delete validatedBody.language[languageEntity];
    }

    // @ts-expect-error: needs to be required everywhere except save
    delete validatedBody.expectedLastModified;
    await fs.writeFile(indexPath, JSON.stringify(validatedBody, null, 2));

    const storyPath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      `${req.query.story as string}`,
    );

    const newFileStat = await fs.stat(indexPath);
    console.log("new last modified", newFileStat.mtime.getTime());
    res.status(200).json({
      lastModified: newFileStat.mtime.getTime(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}

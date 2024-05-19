import path from "path";
import * as fs from "fs/promises";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import {
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

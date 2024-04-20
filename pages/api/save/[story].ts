import path from "path";
import * as fs from "fs/promises";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { simpleGit } from "simple-git";
import { entities, saveSchema } from "../../../lib/persistence";
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

    const savePath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      `${req.query.story as string}`,
    );
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
      delete validatedBody.story[entity];
    }

    await fs.writeFile(indexPath, JSON.stringify(validatedBody, null, 2));

    const storyPath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      `${req.query.story as string}`,
    );
    const remotes = await simpleGit({
      baseDir: storyPath,
    }).status();
    const newFileStat = await fs.stat(indexPath);
    console.log("new last modified", newFileStat.mtime.getTime());
    res.status(200).json({
      isClean: remotes.isClean(),
      lastModified: newFileStat.mtime.getTime(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
}

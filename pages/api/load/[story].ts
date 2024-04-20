import path from "path";
import fs from "fs/promises";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { simpleGit } from "simple-git";
import {
  type Story,
  entities,
  languageEntities,
} from "../../../lib/persistence";
import { type WriterSession, authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Story | string>,
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
  console.log(session.owner);
  const storyPath = path.join(
    process.env.DATA_PATH || "",
    session.owner,
    `${req.query.story as string}`,
  );
  const git = simpleGit({
    baseDir: storyPath,
  });

  const status = await git.status();
  let stashed = false;
  if (!status.isClean()) {
    stashed = true;
    await git.stash();
  }
  const remotes = await git
    .remote([
      "set-url",
      "origin",
      `https://${session.owner}:${session.github_access_token}@github.com/${session.owner}/${req.query.story}.git`,
    ])
    .pull();

  if (stashed) {
    await git.stash(["pop"]);
  }

  console.log(remotes);

  const story = await fs.readFile(path.join(storyPath, "index.json"));
  const storyInfo = await fs.stat(path.join(storyPath, "index.json"));

  const storyData = JSON.parse(story.toString());

  for (const entity of entities) {
    delete storyData.story[entity];

    storyData.story[entity] = {};
    const entityPath = path.join(storyPath, entity);
    const entityFiles = await fs.readdir(entityPath);
    for (const entityId of entityFiles.map((file) =>
      file.replace(".json", ""),
    )) {
      const entityData = await fs.readFile(
        path.join(entityPath, entityId + ".json"),
      );
      storyData.story[entity][entityId] = JSON.parse(entityData.toString());
    }
  }

  for (const languageEntity of languageEntities) {
    delete storyData.language[languageEntity];
    storyData.language[languageEntity] = {};
    const languageEntityPath = path.join(storyPath, languageEntity);
    const languageEntityFiles = await fs.readdir(languageEntityPath);
    for (const languageEntityId of languageEntityFiles.map((name) =>
      name.replace(".json", ""),
    )) {
      const languageEntityData = await fs.readFile(
        path.join(languageEntityPath, languageEntityId + ".json"),
      );
      storyData.language[languageEntity][languageEntityId] = JSON.parse(
        languageEntityData.toString(),
      );
    }
  }

  res.status(200).json({
    ...storyData,
    lastModified: storyInfo.mtime.getTime(),
  });
}

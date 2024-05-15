// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { simpleGit } from "simple-git";
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
  if (!session?.owner || !session?.github_access_token) {
    res.status(401).send("Unauthorized");
    return;
  }

  try {
    const storyPath = path.join(
      process.env.DATA_PATH || "",
      session.owner,
      `${req.query.story as string}`,
    );
    const remotes = await simpleGit({
      baseDir: storyPath,
    })
      .add("*")
      .commit("feat: story updated")
      .remote([
        "set-url",
        "origin",
        `https://${session.owner}:${session.github_access_token}@github.com/${session.owner}/${req.query.story}.git`,
      ])
      .push();

    res.status(200).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error,
    });
  }
}

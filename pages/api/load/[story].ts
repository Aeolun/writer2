import fs from "fs";
import path from "path";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Story } from "../../../lib/persistence";
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

  const story = fs.readFileSync(
    path.join(
      process.env.DATA_PATH ?? "",
      session.owner,
      req.query.story as string,
      "index.json",
    ),
  );

  res.status(200).json(JSON.parse(story.toString()));
}

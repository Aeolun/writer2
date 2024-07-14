import path from "path";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import short from "short-uuid";
import { db } from "../../../lib/drizzle";
import { storyTable } from "../../../lib/drizzle/schema";
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

  res.status(200).json({
    ...storyData,
    lastModified: storyInfo.mtime.getTime(),
  });
}

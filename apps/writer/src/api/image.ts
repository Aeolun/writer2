import path from "path";
import fs from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { type WriterSession, authOptions } from "./auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("loading image", req.query);
  const session: WriterSession | null = await getServerSession(
    req,
    res,
    authOptions,
  );
  if (!session?.owner) {
    res.status(401).send("Unauthorized");
    return;
  }

  const imagePath = req.query.path as string;
  const storyPath = req.query.story as string;
  if (!imagePath) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const finalImagePath = path.join(
    process.env.DATA_PATH ?? "",
    session.owner,
    storyPath,
    "data",
    imagePath,
  );
  try {
    await fs.stat(finalImagePath);
  } catch (error) {
    console.log("cant find", finalImagePath);
  }
  console.log("loading", finalImagePath);
  try {
    const image = await fs.readFile(finalImagePath);

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.end(image);
  } catch (error) {
    res.statusCode = 500;
    res.end();
  }
};
export default handler;

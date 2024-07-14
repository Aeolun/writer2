import fs from "node:fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const file = req.query.file as string;
  console.log(file);

  try {
    const buffer = await fs.readFile(`audio/${file}`);
    res.status(200).setHeader("content-type", "audio/mpeg").send(buffer);
    return;
  } catch (e) {
    res.status(404).send("File not found");
  }
}

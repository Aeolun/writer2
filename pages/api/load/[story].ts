// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof story>
) {
  const story = fs.readFileSync(
    path.join(process.env.DATA_PATH ?? "", req.query.story as string, 'index.json')
  );

  res.status(200).json(JSON.parse(story.toString()));
}

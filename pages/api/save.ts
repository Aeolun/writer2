// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  fs.writeFileSync(
    path.join(process.env.DATA_PATH || "", "story.json"),
    JSON.stringify(req.body)
  );

  res.status(200).json({});
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  fs.writeFileSync(
    path.join(process.env.DATA_PATH || "", `${req.body.name}.json`),
    JSON.stringify(req.body, null, 2)
  );

  res.status(200).json({});
}

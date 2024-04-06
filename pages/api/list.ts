// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {glob} from "glob";
import { join } from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{name: string}[]>
) {
  const story = await glob(
    join('*/index.json'),
  {
    cwd: process.env.DATA_PATH ?? '.'
  });

  res.status(200).json(story.map((i) => {
    return {
      name: i.replace('/index.json', '')
    }
  }));
}

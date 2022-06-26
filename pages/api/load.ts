// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import story from "../../story.json";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<typeof story>
) {
  res.status(200).json(story);
}

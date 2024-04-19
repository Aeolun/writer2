import { join } from "path";
import { glob } from "glob";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { type WriterSession, authOptions } from "./auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ name: string }[] | string>,
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

  const story = await glob(join("*/index.json"), {
    cwd: join(process.env.DATA_PATH ?? ".", session.owner),
  });

  res.status(200).json(
    story.map((i) => {
      return {
        name: i.replace("/index.json", ""),
      };
    }),
  );
}

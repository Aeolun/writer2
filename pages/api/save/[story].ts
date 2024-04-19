import * as fs from "fs";
import path from "path";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { saveSchema } from "../../../lib/persistence";
import { type WriterSession, authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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

  try {
    const validatedBody = saveSchema.parse(req.body);

    fs.writeFileSync(
      path.join(
        process.env.DATA_PATH || "",
        session.owner,
        `${req.query.story as string}`,
        "index.json",
      ),
      JSON.stringify(validatedBody, null, 2),
    );

    res.status(200).json({});
  } catch (error) {
    res.status(500).json(error);
  }
}

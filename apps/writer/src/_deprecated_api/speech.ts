import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const text = req.body.text;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
  });

  const speechFile = `${req.body.text
    .substring(0, 20)
    .replaceAll(/[^0-9a-zA-Z]+/g, "-")}-${createHash("sha256")
    .update(text)
    .digest("hex")}.mp3`;

  let buffer: Buffer | undefined = undefined;
  try {
    buffer = await fs.readFile(`audio/${speechFile}`);
  } catch (e) {
    const result = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });

    buffer = Buffer.from(await result.arrayBuffer());
    await fs.mkdir("audio", { recursive: true });
    await fs.writeFile(`audio/${speechFile}`, buffer);
  }

  if (!buffer) {
    res.status(500).send("Failed to generate speech");
    return;
  }
  res.status(200).json({
    url: `/api/speech/${speechFile}`,
  });
}

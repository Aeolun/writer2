import fs from "fs/promises";
import path from 'path'
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("loading image", req.query)
  let imagePath = req.query.path as string;
  let storyPath = req.query.story as string;
  if (!imagePath) {
    res.statusCode = 404;
    res.end();
    return;
  }

  try {
    await fs.stat(path.join(process.env.DATA_PATH ?? "", storyPath, imagePath))

    imagePath = path.join(process.env.DATA_PATH ?? "", storyPath, imagePath)

  } catch(error) {
    console.log('cant find', path.join(process.env.DATA_PATH ?? "", storyPath, imagePath))
  }
  console.log("loading", imagePath)
  try {
    const image = await fs.readFile(imagePath)

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.end(image);

    } catch(error) {
    res.statusCode = 500;
    res.end();
  }
};
export default handler;

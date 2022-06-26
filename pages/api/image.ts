import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const path = req.query.path as string;

  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end();
        resolve(true);
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "image/jpeg");
        res.end(data);
        resolve(true);
      }
    });
  });
};
export default handler;

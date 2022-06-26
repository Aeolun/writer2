// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import dirtree from "directory-tree";
import { TreeNode } from "../../lib/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = process.env.IMAGE_PATH;
  const tree = dirtree(path || "");

  var collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  const sorter = (node: TreeNode) => {
    if (node.children) {
      node.children.sort((a, b) => {
        return collator.compare(a.name, b.name);
      });
      node.children.forEach((sub) => sorter(sub));
    }
  };
  if (tree) {
    sorter(tree);
  }

  res.status(200).json(tree);
}

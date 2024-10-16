import { createHash } from "crypto";

export const getAssetUrl = (
  ownerId: number,
  storyId: string,
  filePath: string,
) => {
  const hash = createHash("sha256").update(filePath).digest("hex");
  return `https://team.wtf/upload/${ownerId}/${storyId}/${hash}.png`;
};

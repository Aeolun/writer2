import { protectedProcedure } from "../trpc.js";
import { prisma } from "../prisma.js";
import { getStoryAssetUrl } from "../util/get-asset-url.js";
import { storycardFields } from "../lib/storycard-fields.js";

export const getUserStories = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.authenticatedUser.id;

  const userStories = await prisma.story.findMany({
    where: { ownerId: userId },
    select: storycardFields,
  });

  return userStories.map((story) => ({
    ...story,
    coverArtAsset: getStoryAssetUrl(
      story.ownerId,
      story.id,
      story.coverArtAsset,
    ),
  }));
});

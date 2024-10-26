import { protectedProcedure } from "../trpc";
import { prisma } from "../prisma";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const getUserStories = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.authenticatedUser.id;

  const userStories = await prisma.story.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      summary: true,
      coverArtAsset: true,
      coverColor: true,
      coverTextColor: true,
      ownerId: true,
      royalRoadId: true,
      pages: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
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

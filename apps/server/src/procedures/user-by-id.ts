import { publicProcedure } from "../trpc";
import z from "zod";
import { prisma } from "../prisma";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const userById = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async (opts) => {
    const { input } = opts;

    // Retrieve the user with the given ID
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: input.id,
      },
      include: {
        ownedStories: {
          select: {
            id: true,
            name: true,
            pages: true,
            coverArtAsset: true,
          },
          where: {
            published: true,
          },
        },
      },
    });
    return {
      ...user,
      ownedStories: user.ownedStories.map((story) => ({
        ...story,
        coverArtAsset: getStoryAssetUrl(
          input.id,
          story.id,
          story.coverArtAsset,
        ),
      })),
    };
  });

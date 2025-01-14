import { publicProcedure } from "../trpc.js";
import z from "zod";
import { prisma } from "../prisma.js";
import { getStoryAssetUrl } from "../util/get-asset-url.js";
import { storycardFields } from "../lib/storycard-fields.js";

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
          select: storycardFields,
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

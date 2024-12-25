import { z } from "zod";
import { publicProcedure } from "../trpc";
import { prisma } from "../prisma";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const listRandomStories = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(10),
    }),
  )
  .query(async ({ input }) => {
    const { limit } = input;

    const storiesCount = await prisma.story.count();
    const randomStoryIndex = Math.max(
      Math.floor(Math.random() * (storiesCount - limit)),
      0,
    );

    const stories = await prisma.story.findMany({
      select: {
        id: true,
        name: true,
        summary: true,
        coverArtAsset: true,
        coverColor: true,
        coverTextColor: true,
        royalRoadId: true,
        wordsPerWeek: true,
        pages: true,
        status: true,
        ownerId: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
      // this works fine as long as we don't have millions of stories...
      skip: randomStoryIndex,
      take: limit,
    });

    return {
      stories: stories.map((s) => {
        const coverArtAsset = getStoryAssetUrl(
          s.ownerId,
          s.id,
          s.coverArtAsset,
        );

        return {
          ...s,
          coverArtAsset: coverArtAsset,
        };
      }),
    };
  });

import { z } from "zod";
import { publicProcedure } from "../trpc";
import { prisma } from "../prisma";
import { createHash } from "node:crypto";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const listStories = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(500).optional().default(10),
      cursor: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { limit, cursor } = input;

    const stories = await prisma.story.findMany({
      select: {
        id: true,
        name: true,
        summary: true,
        coverArtAsset: true,
        coverColor: true,
        coverTextColor: true,
        royalRoadId: true,
        pages: true,
        ownerId: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
      take: limit + 1,
      where: {
        id: cursor ? { gte: cursor } : undefined,
      },
      orderBy: {
        id: "asc",
      },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (stories.length > limit) {
      const nextItem = stories.pop();
      nextCursor = nextItem!.id;
    }

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
      nextCursor,
    };
  });

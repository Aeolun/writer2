import { z } from "zod";
import { publicProcedure } from "../trpc";
import { prisma } from "../prisma";
import { createHash } from "node:crypto";

export const listStories = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      cursor: z.string().uuid().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { limit, cursor } = input;

    const stories = await prisma.story.findMany({
      take: limit + 1,
      where: {
        id: cursor ? { gt: cursor } : undefined,
      },
      include: {
        owner: {
          select: {
            name: true,
            id: true,
          },
        },
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
        const hash = createHash("sha256").update(s.coverArtAsset).digest("hex");
        const coverArtAsset = `https://team.wtf/upload/${s.ownerId}/${s.id}/${hash}.png`;

        return {
          ...s,
          coverArtAsset: coverArtAsset,
        };
      }),
      nextCursor,
    };
  });

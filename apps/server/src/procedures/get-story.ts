import { protectedProcedure, publicProcedure } from "../trpc.js";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { getStoryAssetUrl } from "../util/get-asset-url.js";
import { TRPCError } from "@trpc/server";

export const getStory = protectedProcedure
  .input(z.object({ storyId: z.string() }))
  .query(async ({ ctx, input }) => {
    const story = await prisma.story.findUnique({
      where: { id: input.storyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        books: {
          where: { nodeType: "story" },
          include: {
            chapters: {
              where: { nodeType: "story", publishedOn: { lte: new Date() } },
              include: {
                scenes: {
                  where: { nodeType: "story" },
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!story) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Story not found",
      });
    }

    return story;
  });

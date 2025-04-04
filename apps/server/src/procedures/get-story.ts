import { protectedProcedure, publicProcedure } from "../trpc.js";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { getStoryAssetUrl } from "../util/get-asset-url.js";

export const getStory = publicProcedure
  .input(z.object({ storyId: z.string() }))
  .query(async ({ input }) => {
    const { storyId } = input;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        books: {
          orderBy: { sortOrder: "asc" },
          include: {
            chapters: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                publishedOn: true,
                sortOrder: true,
              },
              where: {
                publishedOn: {
                  lte: new Date(),
                },
              },
            },
          },
          where: {
            chapters: {
              some: {
                publishedOn: {
                  lte: new Date(),
                },
              },
            },
          },
        },
      },
    });

    if (!story) {
      throw new Error("Story not found");
    }

    return {
      id: story.id,
      name: story.name,
      coverArtAsset: getStoryAssetUrl(
        story.ownerId,
        story.id,
        story.coverArtAsset,
      ),
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      pages: story.pages,
      owner: story.owner,
      books: story.books.map((book) => ({
        id: book.id,
        name: book.name,
        coverArtAsset: book.coverArtAsset,
        spineArtAsset: book.spineArtAsset,
        pages: book.pages,
        sortOrder: book.sortOrder,
        chapters: book.chapters,
      })),
    };
  });

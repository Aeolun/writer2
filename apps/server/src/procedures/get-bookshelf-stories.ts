import { protectedProcedure } from "../trpc";
import { prisma } from "../prisma";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const getBookshelfStories = protectedProcedure.query(
  async ({ ctx }) => {
    const userId = ctx.authenticatedUser.id;

    const bookshelfStories = await prisma.bookShelfStory.findMany({
      where: { ownerId: userId },
      include: {
        story: {
          select: {
            id: true,
            name: true,
            coverArtAsset: true,
            pages: true,
            ownerId: true,
          },
        },
      },
    });

    return bookshelfStories.map((bookshelfStory) => ({
      id: bookshelfStory.story.id,
      name: bookshelfStory.story.name,
      coverArtAsset: getStoryAssetUrl(
        bookshelfStory.story.ownerId,
        bookshelfStory.story.id,
        bookshelfStory.story.coverArtAsset,
      ), // Updated line
      pages: bookshelfStory.story.pages,
    }));
  },
);

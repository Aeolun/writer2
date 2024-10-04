import { persistedSchema } from "@writer/shared";
import { protectedProcedure } from "../trpc";
import { prisma } from "../prisma";

export const uploadStory = protectedProcedure
  .input(persistedSchema)
  .mutation(async ({ input, ctx }) => {
    const story = await prisma.story.findFirst({
      where: {
        id: input.story.id,
        ownerId: ctx.accessKey.ownerId,
      },
    });

    if (!story) {
      const result = await prisma.story.create({
        data: {
          id: input.story.id,
          ownerId: ctx.accessKey.ownerId,
          name: input.story.name,
          coverArtAsset: "",
        },
      });

      return result.updatedAt;
    }

    const result = await prisma.story.update({
      where: {
        id: input.story.id,
      },
      data: {
        name: input.story.name,
      },
    });
    return result.updatedAt;
  });

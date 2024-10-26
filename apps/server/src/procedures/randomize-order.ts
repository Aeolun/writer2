import { adminProcedure } from "../trpc";
import { prisma } from "../prisma";
import { z } from "zod";
import { getStoryAssetUrl } from "../util/get-asset-url";

export const randomizeOrder = adminProcedure.mutation(async () => {
  const stories = await prisma.story.findMany({
    select: {
      id: true,
    },
  });

  for (const story of stories) {
    const randomOrder = Math.floor(Math.random() * 1000000);
    await prisma.story.update({
      where: { id: story.id },
      data: { sortOrder: randomOrder },
    });
  }
});

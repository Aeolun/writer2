import { protectedProcedure } from "../trpc";
import z from "zod";

export const downloadStory = protectedProcedure
  .input(
    z.object({
      storyId: z.string(),
      lastUpdate: z.string().datetime(),
    }),
  )
  .mutation(async ({ ctx, input }) => {});

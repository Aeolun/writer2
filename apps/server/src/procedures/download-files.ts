import { protectedProcedure } from "../trpc";
import z from "zod";

export const downloadFiles = protectedProcedure
  .input(
    z.object({
      storyId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {});

import { protectedProcedure } from "../trpc.js";
import z from "zod";

export const downloadFiles = protectedProcedure
  .input(
    z.object({
      storyId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {});

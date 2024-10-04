import { publicProcedure } from "../trpc";
import z from "zod";
import { prisma } from "../prisma";

export const userById = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async (opts) => {
    const { input } = opts;

    // Retrieve the user with the given ID
    const user = await prisma.user.findFirstOrThrow({
      where: input,
    });
    return user;
  });

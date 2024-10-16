import { prisma } from "../prisma";
import { protectedProcedure } from "../trpc";

export const sessionSignout = protectedProcedure.mutation(async ({ ctx }) => {
  await prisma.session.delete({
    where: {
      id: ctx.token,
    },
  });
});

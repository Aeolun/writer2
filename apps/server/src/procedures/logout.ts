import { prisma } from "../prisma";
import { protectedProcedure } from "../trpc";

export const logout = protectedProcedure.mutation(async ({ ctx }) => {
  await prisma.accessKey.delete({
    where: {
      key: ctx.token,
    },
  });
});

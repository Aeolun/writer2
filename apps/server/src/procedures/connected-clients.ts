import { prisma } from "../prisma";
import { protectedProcedure } from "../trpc";

export const connectedClients = protectedProcedure.query(async ({ ctx }) => {
  const key = prisma.accessKey.findMany({
    where: {
      owner: {
        id: ctx.accessKey.ownerId,
      },
    },
  });
});

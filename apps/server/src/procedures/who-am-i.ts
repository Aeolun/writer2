import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";

export const whoAmI = publicProcedure.query(async (opts) => {
  if (!opts.ctx.token) {
    throw new Error("No token provided");
  }

  const accessToken = await prisma.accessKey.findFirst({
    where: {
      key: opts.ctx.token,
    },
    include: {
      owner: true,
    },
  });

  if (!accessToken) {
    return null;
  }

  return accessToken.owner;
});

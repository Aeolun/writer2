import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";

export const whoAmI = publicProcedure.query(async (opts) => {
  console.log("whoAmI", opts);
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

  const session = await prisma.session.findFirst({
    where: {
      id: opts.ctx.token,
    },
    include: {
      owner: true,
    },
  });

  if (!accessToken && !session) {
    return null;
  }

  return accessToken?.owner ?? session?.owner;
});

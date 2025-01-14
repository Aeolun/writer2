import { prisma } from "../prisma.js";
import { publicProcedure } from "../trpc.js";
import { createHash } from "node:crypto";
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
      validUntil: {
        gt: new Date(),
      },
    },
    include: {
      owner: true,
    },
  });

  if (!accessToken && !session) {
    return null;
  }

  const owner = accessToken?.owner ?? session?.owner;

  const sha256Email = createHash("sha256")
    .update(owner?.email ?? "")
    .digest("hex");

  if (!owner) {
    return null;
  }
  return {
    ...owner,
    avatarUrl: `https://gravatar.com/avatar/${sha256Email}`,
  };
});

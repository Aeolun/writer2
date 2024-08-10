import { TRPCError, initTRPC } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { prisma } from "./prisma";
import { AccessKey } from "@prisma/client";

const createContext = (
  opts: CreateHTTPContextOptions,
): {
  token: string | undefined;
} => {
  return {
    token: opts.req.headers.authorization?.replace("Bearer ", ""),
  };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createContext>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(async (opts) => {
  const accessToken = await prisma.accessKey.findFirst({
    where: {
      key: opts.ctx.token,
    },
  });

  if (!accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource.",
    });
  }

  const accessKey = await prisma.accessKey.update({
    where: {
      key: opts.ctx.token,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  const result = await opts.next({
    ctx: {
      accessKey: accessKey,
    },
  });
  return result;
});

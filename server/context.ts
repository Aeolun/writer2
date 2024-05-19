import type * as trpc from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (opts?: CreateNextContextOptions) => {
  const req = opts?.req;
  const res = opts?.res;

  /**
   * Uses faster "unstable_getServerSession" in next-auth v4 that avoids
   * a fetch request to /api/auth.
   * This function also updates the session cookie whereas getSession does not
   * Note: If no req -> SSG is being used -> no session exists (null)
   * @link https://github.com/nextauthjs/next-auth/issues/1535
   */
  // const session = opts && (await getServerSession(opts, nextAuthOptions));
  const session = req && res && (await getServerSession(req, res, authOptions));

  // for API-response caching see https://trpc.io/docs/caching
  return {
    req,
    res,
    session,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

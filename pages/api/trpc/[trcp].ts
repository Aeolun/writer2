import * as trpcNext from "@trpc/server/adapters/next";
import { createContext } from "../../../server/context";
import { appRouter } from "../../../server/router";
// export API handler
// @link https://trpc.io/docs/v11/server/adapters
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
});
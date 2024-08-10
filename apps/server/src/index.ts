import {
  createHTTPServer,
  CreateHTTPContextOptions,
} from "@trpc/server/adapters/standalone";
import cors from "cors";
import { AppRouter, appRouter } from "./router.ts";

export type { AppRouter };

createHTTPServer({
  router: appRouter,
  middleware: cors(),
  createContext(options: CreateHTTPContextOptions) {
    return {
      token: options.req.headers.authorization?.replace("Bearer ", ""),
    };
  },
}).listen(2022, () => {
  console.log("Server is running on http://localhost:2022");
});

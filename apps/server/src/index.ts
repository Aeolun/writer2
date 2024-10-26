import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { AppRouter, appRouter } from "./router.ts";
import { createContext } from "./trpc.ts";
// import OAuth2Server, { Request, Response } from "@node-oauth/oauth2-server";
// import authModel from "./auth-model.ts";

export type { AppRouter };
export * from "@prisma/client";

const fastify = Fastify({
  bodyLimit: 10485760, // Set the payload limit to 10 MB (10 * 1024 * 1024 bytes)
});

fastify.register(cors, {
  // Add your CORS options here if needed
  origin: "*",
});

fastify.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext: createContext,
    onError: (opts) => {
      console.log(opts);
    },
  },
});

// const oauth = new OAuth2Server({
//   model: authModel,
//   accessTokenLifetime: 3600,
//   allowBearerTokensInQueryString: true,
// });

// // Middleware to handle token requests
// fastify.post("/oauth/token", async (req, reply) => {
//   const request = new Request(req.raw);
//   const response = new Response(reply.raw);

//   try {
//     const token = await oauth.token(request, response);
//     reply.send(token);
//   } catch (err) {
//     reply.code(err.code || 500).send(err);
//   }
// });

// fastify.get("/oauth/authorize", async (req, reply) => {
//   const request = new Request(req.raw);
//   const response = new Response(reply.raw);

//   try {
//     const authorization = await oauth.authorize(request, response);
//     reply.send(authorization);
//   } catch (err) {
//     reply.code(err.code || 500).send(err);
//   }
// });

fastify.listen({ port: 2022, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}`);
});

"use server";

import { httpBatchLink, createTRPCClient } from "@trpc/client";
import { isServer } from "solid-js/web";
import type { AppRouter } from "@writer/server";
import { getUserSessionQuery } from "./session";

const processEnv =
  (globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {};

const internalTrpcBase =
  processEnv.READER_TRPC_URL ?? "http://localhost:2022";

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

const resolveBrowserTrpcBase = () => {
  if (typeof window === "undefined") {
    return normalizeBaseUrl(internalTrpcBase);
  }

  if (window.location.host.includes("localhost")) {
    return normalizeBaseUrl(internalTrpcBase);
  }

  return "https://writer.serial-experiments.com";
};

const buildTrpcUrl = (base: string) => `${normalizeBaseUrl(base)}/trpc`;

// We'll need to properly type this with the actual AppRouter type
// from the server, but for now we'll use any
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: isServer
        ? buildTrpcUrl(internalTrpcBase)
        : buildTrpcUrl(resolveBrowserTrpcBase()),
      async headers() {
        "use server";
        const userSession = await getUserSessionQuery();
        const token = userSession?.token;

        return {
          Authorization: token ? `Bearer ${token}` : "",
        };
      },
    }),
  ],
});

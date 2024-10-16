import { httpBatchLink } from "@trpc/client";
import { createTRPCClient } from "@trpc/client";
import { CreateTRPCClient, createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@writer/server";
import { settingsStore } from "../global-settings-store.ts";

// Create a TRPC React client
export const trpcReact = createTRPCReact<AppRouter>();

export let trpc: CreateTRPCClient<AppRouter>;
export let batchLink: ReturnType<typeof httpBatchLink>;

export const reloadTrpc = () => {
  return settingsStore.get<string>("server-url").then((url) => {
    const baseUrl = url ?? "https://writer.serial-experiments.com";
    console.log("creating client");
    batchLink = httpBatchLink({
      url: `${baseUrl}`,
      // You can pass any HTTP headers you wish here
      async headers() {
        const token = await settingsStore.get("client-token");

        return token
          ? {
              authorization: `Bearer ${token}`,
            }
          : {};
      },
    });

    trpc = createTRPCClient<AppRouter>({
      links: [batchLink],
    });
  });
};

reloadTrpc();

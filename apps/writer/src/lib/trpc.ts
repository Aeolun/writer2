import { httpBatchLink } from "@trpc/client";
import { createTRPCClient } from "@trpc/client";
import type { AppRouter } from "@writer/server";
import { settingsStore } from "../global-settings-store.ts";

export let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;

export const reloadTrpc = () => {
  return settingsStore.get<string>("server-url").then((url) => {
    const baseUrl = url ?? "https://writer.serial-experiments.com";
    console.log("creating client");
    trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/v11/ssr
           **/
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
        }),
      ],
    });
  });
};

reloadTrpc();

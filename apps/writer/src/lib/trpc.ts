import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@writer/server";
import { settingsState } from "./stores/settings";

export let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;
export let batchLink: ReturnType<typeof httpBatchLink>;

export const reloadTrpc = (passedServerUrl?: string) => {
  let serverUrl = passedServerUrl ?? settingsState.serverUrl;
  if (!serverUrl) {
    serverUrl = "https://writer.serial-experiments.com/trpc";
  }
  console.log("creating client", serverUrl);
  batchLink = httpBatchLink({
    url: `${serverUrl}`,
    // You can pass any HTTP headers you wish here
    async headers() {
      const token = settingsState.clientToken;

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
};

reloadTrpc();

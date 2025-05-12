import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { join } from "node:path";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": join(process.cwd(), "src"),
      },
    },
    ssr: {
      noExternal: ["@writer/shared"],
    },
    server: {
      port: 3333,
    },
  },
});

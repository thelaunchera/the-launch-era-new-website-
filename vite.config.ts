import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: "/",
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      failOnError: true,
    },
  },
});

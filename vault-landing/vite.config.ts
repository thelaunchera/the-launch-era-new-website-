import { defineConfig } from "vite";

export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    minify: "esbuild",
    outDir: process.env.VAULT_OUT_DIR || "../public/guias/mina-assets",
    emptyOutDir: false,
    lib: { entry: "src/main.tsx", formats: ["es"], fileName: () => "landing.js", cssFileName: "landing" },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
      output: {
        chunkFileNames: "[name].js",
        manualChunks(id) {
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return "motion";
        },
      },
    },
  },
});

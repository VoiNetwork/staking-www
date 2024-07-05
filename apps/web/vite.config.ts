import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: "/",
  server: {
    port: 6006,
  },
  plugins: [nodePolyfills(), react()],
  build: {
    outDir: "dist",
  },
});

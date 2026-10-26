import { defineConfig, defaultExclude } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: [...defaultExclude, "tests/e2e/**"],
  },
  oxc: false,
  esbuild: {
    jsx: "automatic" as any,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

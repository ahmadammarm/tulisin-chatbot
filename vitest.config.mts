import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tests": fromRoot("./tests"),
      "@": fromRoot("./src"),
      // `server-only` throws outside a React Server environment; tests run in plain Node.
      "server-only": fromRoot("./tests/helpers/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

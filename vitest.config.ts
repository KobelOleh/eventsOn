import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    // All files share one real Postgres database.
    fileParallelism: false,
    // next-auth imports "next/server" without an extension, which Node ESM
    // cannot resolve; inlining lets Vite resolve it, so the real Auth.js
    // error classes can be used in the sign-in tests.
    server: { deps: { inline: [/next-auth/, /@auth\/core/] } },
  },
});

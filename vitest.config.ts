import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    reporters: ["verbose", "html", "json"],
    outputFile: {
      html: "./tests/results/index.html",
      json: "./tests/results/results.json",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/**", "dist/**", "**/*.test.ts", "**/*.spec.ts", "test-usage.mjs"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})

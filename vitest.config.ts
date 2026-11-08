import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    include: [
      "src/test/unit/**/*.test.{js,jsx}",
      "src/test/integration/**/*.test.{js,jsx}",
    ],
    maxWorkers: 2,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/test/**"],
      thresholds: { statements: 90, branches: 80, functions: 85, lines: 90 },
    },
  },
});

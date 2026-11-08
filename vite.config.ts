import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const headers = Object.fromEntries(
  readFileSync(new URL("./public/_headers", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.startsWith("  "))
    .map((line) => {
      const delimiter = line.indexOf(":");
      return [
        line.slice(0, delimiter).trim(),
        line.slice(delimiter + 1).trim(),
      ];
    }),
);

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "e2e" && basicSsl()],
  preview: { headers: mode === "e2e" ? headers : undefined },
}));

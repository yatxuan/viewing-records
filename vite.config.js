import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "viewing-records";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : "./",
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(rootDir, "index.html"),
        detail: resolve(rootDir, "detail.html"),
        edit: resolve(rootDir, "edit.html"),
        admin: resolve(rootDir, "admin.html"),
      },
    },
  },
});

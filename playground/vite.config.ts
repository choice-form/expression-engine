import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/expression-engine/", // 改为主仓库名称
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
})

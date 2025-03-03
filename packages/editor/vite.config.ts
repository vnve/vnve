import path from "path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api/llm/openai": {
        target: "https://api.openai.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/openai/, ""),
      },
      "/api/llm/deepseek": {
        target: "https://api.deepseek.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/deepseek/, ""),
      },
      "/api/llm/ark": {
        target: "https://ark.cn-beijing.volces.com/api/v3",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm\/ark/, ""),
      },
      "/api/tts/ark": {
        target: "https://openspeech.bytedance.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts\/ark/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    splitVendorChunkPlugin(),
  ],
});

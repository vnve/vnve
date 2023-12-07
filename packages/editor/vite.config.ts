import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vnve/",
  // build: {
  //   rollupOptions: {
  //     external: ["@vnve/core"],
  //     output: {
  //       paths: {
  //         "@vnve/core":
  //           "https://registry.npmmirror.com/@vnve/core/latest/files/dist/core.js",
  //       },
  //     },
  //   },
  // },
  plugins: [
    react(),
    Icons({
      compiler: "jsx",
      jsx: "react",
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    VitePWA({
      manifest: {
        name: "VNVE",
        short_name: "VNVE",
        description: "Visual Novel Video Editor",
        theme_color: "#319795",
        background_color: "#319795",
        icons: [
          {
            src: "/vnve/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,webp,jpg,png,mp3,wav}"],
      },
    }),
    splitVendorChunkPlugin(),
  ],
});

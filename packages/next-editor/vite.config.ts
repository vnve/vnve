import path from "path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/next/",
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
    // VitePWA({
    //   manifest: {
    //     name: "VNVE",
    //     short_name: "VNVE",
    //     description: "Visual Novel Video Editor",
    //     theme_color: "#319795",
    //     background_color: "#319795",
    //     icons: [
    //       {
    //         src: "/next/logo.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    // }),
    splitVendorChunkPlugin(),
  ],
});

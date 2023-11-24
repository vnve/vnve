import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vnve/",
  plugins: [
    react(),
    Icons({
      compiler: "jsx",
      jsx: "react",
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    VitePWA(),
  ],
});

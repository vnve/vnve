import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "template",
      fileName: "template",
    },
    rollupOptions: {
      external: ["@vnve/core"],
      output: {
        globals: {
          "@vnve/core": "VNVE",
        },
      },
    },
    sourcemap: process.env.OPEN_SOURCEMAP ? true : false,
  },
  plugins: [dts({ rollupTypes: true })],
});

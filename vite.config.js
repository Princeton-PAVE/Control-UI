import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    // "/api": {
    //   target: "0.0.0.0",
    //   changeOrigin: true,
    //   rewrite: (path) => path.replace(/^\/api/, ""),
    // },
  },
});

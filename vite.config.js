import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    port: 8000,
    // "/api": {
    //   target: "0.0.0.0",
    //   changeOrigin: true,
    //   rewrite: (path) => path.replace(/^\/api/, ""),
    // },
  },
});

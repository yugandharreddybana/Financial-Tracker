import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt"],
      manifest: {
        name: "FinanceTracker",
        short_name: "FinanceTracker",
        description: "Personal finance, budgets, goals and carbon footprint in one place.",
        theme_color: "#4f46e5",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        // All /api/* calls go to the Node middleware first.
        // Node handles: /api/ai, /api/receipt, /api/exchange-rates, /api/subscriptions
        // Everything else is proxied by Node straight through to Java (port 8080)
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

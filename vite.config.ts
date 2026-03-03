// =====================================================
// File: vite.config.ts
// =====================================================
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

function devPlaceholderPlugin(): Plugin {
  return {
    name: "dev-placeholder-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        const match = url.match(/^\/api\/placeholder\/(\d+)\/(\d+)(\?.*)?$/);
        if (!match) return next();

        const w = Math.max(1, Number(match[1]) || 32);
        const h = Math.max(1, Number(match[2]) || 32);

        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
          `<rect width="100%" height="100%" fill="#e5e7eb"/>` +
          `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.max(
            8,
            Math.floor(Math.min(w, h) / 4)
          )}" fill="#6b7280">${w}x${h}</text>` +
          `</svg>`;

        res.statusCode = 200;
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.end(svg);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devPlaceholderPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
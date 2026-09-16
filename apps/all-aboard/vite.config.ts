import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "all-aboard-mock-api",
      configureServer(server) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (req.url?.startsWith("/api/all-aboard")) {
            const eventName = process.env.ALL_ABOARD_EVENT || "Alchm Convergence";

            if (req.method === "GET") {
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  ok: true,
                  event: eventName,
                  source: `all-aboard:${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                  destinations: [
                    {
                      key: "kitchen",
                      label: "alchm.kitchen",
                      tagline: "Culinary Sanctum & Gastronomy — cook by the sky over your head.",
                      href: process.env.ALCHM_KITCHEN_URL || "https://alchm.kitchen",
                      configured: true,
                      element: "fire",
                      accentColor: "#ef4444",
                      badge: "Culinary Sanctum",
                    },
                    {
                      key: "agents",
                      label: "agents.alchm.kitchen",
                      tagline: "Planetary Agents — autonomous intelligence council attuned to your chart.",
                      href: process.env.ALCHM_AGENTS_URL || "https://agents.alchm.kitchen",
                      configured: true,
                      element: "mercury",
                      accentColor: "#38bdf8",
                      badge: "Planetary Intelligence",
                    },
                    {
                      key: "pentacles",
                      label: "pentacles.alchm.kitchen",
                      tagline: "Pentacles Arena — celestial deck battles & SpacetimeDB multiplayer state.",
                      href: process.env.ALCHM_PENTACLES_URL || "https://pentacles.alchm.kitchen",
                      configured: true,
                      element: "pentacle",
                      accentColor: "#fbbf24",
                      badge: "Celestial Arena",
                    },
                  ],
                })
              );
              return;
            }

            if (req.method === "POST") {
              let body = "";
              req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
              req.on("end", () => {
                try {
                  const payload = body ? JSON.parse(body) : {};
                  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : null;
                  if (!email || !email.includes("@")) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ ok: false, message: "Invalid email address." }));
                    return;
                  }

                  const name = typeof payload.name === "string" ? payload.name.trim() : null;
                  const source = payload.source || `all-aboard:convergence`;
                  const event = payload.event || eventName;

                  const [local, domain] = email.split("@");
                  const masked = local.length <= 2 ? `${local[0]}***@${domain}` : `${local[0]}***${local[local.length - 1]}@${domain}`;
                  console.log(`[all-aboard-kiosk] capture email=${masked} name=${name || "anon"} source=${source} event=${event}`);

                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      ok: true,
                      allOk: true,
                      alreadyKnown: false,
                      welcomeEmail: true,
                      results: [
                        { key: "kitchen", label: "alchm.kitchen", status: "created", detail: "enrolled in celestial kitchen" },
                        { key: "agents", label: "agents.alchm.kitchen", status: "created", detail: "attuned with planetary council" },
                        { key: "pentacles", label: "pentacles.alchm.kitchen", status: "created", detail: "registered in SpacetimeDB arena" },
                      ],
                    })
                  );
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, message: err?.message || "Server error" }));
                }
              });
              return;
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5175,
  },
});

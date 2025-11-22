import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { validator } from "hono/validator";
import { fetchImageSchema } from "./schema.js";
import z from "zod";

const app = new Hono();

app.use("/*", cors());

// Fetch image through VPN
app.get(
  "/image",
  validator("query", (value, c) => {
    const parsed = fetchImageSchema.safeParse(value);

    if (!parsed.success) {
      return c.text(z.prettifyError(parsed.error), 400);
    }

    return parsed.data;
  }),
  async (c) => {
    const { imageUrl } = c.req.valid("query");

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: new URL(imageUrl).origin,
        },
      });

      if (!response.ok) {
        return c.text(`Failed to fetch: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      return c.body(arrayBuffer, 200, {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      });
    } catch (error) {
      return c.text(`Error: ${error}`, 500);
    }
  }
);

app.get("/health", (c) => c.json({ status: "OK" }));

serve(
  {
    fetch: app.fetch,
    port: 3003,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

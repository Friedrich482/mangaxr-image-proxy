import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors());

// Fetch image through VPN
app.post("/fetch-image", async (c) => {
  const { imageUrl } = await c.req.json();

  if (!imageUrl) {
    return c.json({ error: "imageUrl is required" }, 400);
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: new URL(imageUrl).origin,
      },
    });

    if (!response.ok) {
      return c.json({
        error: `Failed to fetch: ${response.statusText}`,
        statusCode: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return c.json({
      data: base64,
      contentType,
      size: arrayBuffer.byteLength,
    });
  } catch (error) {
    return c.json({ error: error }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3003,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

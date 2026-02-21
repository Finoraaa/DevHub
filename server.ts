import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Scrape Open Graph data
  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DevResourceHub/1.0)",
        },
        timeout: 5000,
      });

      const $ = cheerio.load(response.data);
      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        $('meta[name="title"]').attr("content");
      const description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content");
      const image =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content");
      const siteName = $('meta[property="og:site_name"]').attr("content");

      res.json({
        title: title?.trim(),
        description: description?.trim(),
        image: image,
        siteName: siteName,
        url: url,
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to scrape URL" });
    }
  });

  // Auth Callback Handler
  app.get("/auth/callback", (req, res) => {
    res.send(`
      <html>
        <head><title>Authenticating...</title></head>
        <body>
          <script>
            if (window.opener) {
              // Send the full URL including the hash fragment back to the main window
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS',
                url: window.location.href 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Completing authentication... Please wait.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

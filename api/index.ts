import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(express.json());

// API: Scrape Open Graph data
app.post("/api/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DevHub/1.0)",
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

export default app;

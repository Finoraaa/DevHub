import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./api/index"; // Vercel API'mizi içe aktar

async function startDevServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  // Vite middleware'ini Express'e ekle
  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
  });
}

startDevServer();

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

app.use(cors({ origin: [process.env.FRONTEND_URL || "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Rate limiters
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: "Too many AI requests, please try again in a minute." } });
const subsLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: "Too many subscription requests, please try again later." } });

// Node-handled routes (custom logic stays here)
app.use("/api/ai", aiLimiter, require("./routes/ai"));
app.use("/api/receipt", require("./routes/receipt"));
app.use("/api/exchange-rates", require("./routes/exchangeRates"));
app.use("/api/subscriptions", subsLimiter, require("./routes/subscriptions"));

// Catch-all: proxy every other /api/* request straight through to Java Spring Boot.
// changeOrigin: false - keeps the original Origin header so Java CORS accepts it.
// The Authorization: Bearer token from the frontend is forwarded untouched.
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: false,   // preserve original Origin so Java CORS allows it
    on: {
      proxyReq: (proxyReq, req) => {
        // Ensure Authorization header is explicitly forwarded
        const auth = req.headers["authorization"];
        if (auth) proxyReq.setHeader("Authorization", auth);
        console.log(`[Proxy] ${req.method} ${req.url} → ${BACKEND_URL}${req.url}`);
      },
      error: (err, req, res) => {
        console.error(`[Proxy Error] ${req.method} ${req.url} →`, err.message);
        res.status(502).json({ error: "Backend unavailable", detail: err.message });
      },
    },
  })
);

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`✅ Middleware running on http://localhost:${PORT} → proxying /api/* to ${BACKEND_URL}`));

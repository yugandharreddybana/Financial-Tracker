require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const app = express();
const PORT     = process.env.PORT        || 4000;
const BACKEND  = process.env.BACKEND_URL  || "http://localhost:8080";
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Global ───────────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND, credentials: true }));

// ─── Node-only routes (with body parsing scoped to them) ──────────────────────
const nodeRouter = express.Router();
nodeRouter.use(express.json({ limit: "10mb" }));

const aiLimiter   = rateLimit({ windowMs: 60_000, max: 20,  message: { error: "Too many AI requests." } });
const subsLimiter = rateLimit({ windowMs: 60_000, max: 10,  message: { error: "Too many subscription requests." } });

nodeRouter.use("/ai",             aiLimiter,   require("./routes/ai"));
nodeRouter.use("/receipt",                     require("./routes/receipt"));
nodeRouter.use("/exchange-rates",              require("./routes/exchangeRates"));
nodeRouter.use("/subscriptions",  subsLimiter, require("./routes/subscriptions"));

app.use("/api", nodeRouter);

// ─── Java catch-all proxy using axios (no hanging, no stream issues) ──────────
// Reads raw body as Buffer so nothing is parsed/consumed before forwarding.
app.use("/api", express.raw({ type: "*/*", limit: "20mb" }), async (req, res) => {
  const url = `${BACKEND}${req.originalUrl}`;

  // Forward all original headers, override Origin so Java CORS always passes
  const headers = {
    ...req.headers,
    host: new URL(BACKEND).host,
    origin: FRONTEND,
  };
  // Remove headers that would confuse axios / Java
  delete headers["content-length"]; // axios recalculates this

  console.log(`[\u2192 Java] ${req.method} ${req.originalUrl}`);

  try {
    const response = await axios({
      method:  req.method,
      url,
      headers,
      data:    req.body && req.body.length ? req.body : undefined,
      responseType: "arraybuffer",
      validateStatus: () => true, // forward ANY status code (including 4xx/5xx)
      timeout: 30000,
    });

    // Forward Java's response headers back to the browser
    Object.entries(response.headers).forEach(([k, v]) => {
      if (k.toLowerCase() !== "transfer-encoding") res.setHeader(k, v);
    });
    res.status(response.status).send(Buffer.from(response.data));
  } catch (err) {
    console.error(`[Proxy Error] ${req.method} ${req.originalUrl}:`, err.message);
    res.status(502).json({ error: "Backend unavailable", detail: err.message });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.listen(PORT, () =>
  console.log(`\u2705 Middleware :${PORT} | Node: /api/ai /api/receipt /api/exchange-rates /api/subscriptions | Everything else \u2192 ${BACKEND}`)
);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: [process.env.FRONTEND_URL || "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "10mb" }));

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: "Too many AI requests, please try again in a minute." } });

app.use("/api/ai", aiLimiter, require("./routes/ai"));
app.use("/api/receipt", require("./routes/receipt"));
app.use("/api/exchange-rates", require("./routes/exchangeRates"));

const subscriptionsLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: "Too many subscription requests, please try again later." } });

app.use("/api/subscriptions", subscriptionsLimiter, require("./routes/subscriptions"));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`✅ Middleware running on http://localhost:${PORT}`));

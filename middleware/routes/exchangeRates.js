const express = require("express");
const router = express.Router();

// Static fallback rates (in production, fetch from exchangerate-api.com or similar)
const RATES = {
  EUR: 1, USD: 1.08, GBP: 0.86, INR: 89.5, JPY: 163.2, CAD: 1.47, AUD: 1.65,
  CHF: 0.96, CNY: 7.84, AED: 3.97, NGN: 1680, BRL: 5.54, MXN: 18.6, ZAR: 20.3,
  SGD: 1.46, HKD: 8.44, SEK: 11.4, NOK: 11.6, DKK: 7.46, PLN: 4.27, TRY: 34.8,
  KES: 140, THB: 39.2, MYR: 5.12, IDR: 17200, ILS: 3.97, HUF: 391,
};

router.get("/", (req, res) => {
  const base = (req.query.base || "EUR").toUpperCase();
  const baseRate = RATES[base] || 1;
  const converted = Object.fromEntries(Object.entries(RATES).map(([k, v]) => [k, Number((v / baseRate).toFixed(6))]));
  res.json({ base, rates: converted, timestamp: new Date().toISOString() });
});

module.exports = router;

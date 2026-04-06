const express = require("express");
const router = express.Router();

// Receipt OCR endpoint — extracts amount, date, description from base64 image
router.post("/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided" });

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      // Mock response for demo
      return res.json({
        source: "mock",
        amount: 24.99,
        description: "Grocery Store",
        date: new Date().toISOString().split("T")[0],
        category: "Food & Dining",
      });
    }

    const OpenAI = require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: 'Extract from this receipt: total amount, date, merchant name. Return JSON: {"amount": number, "description": "merchant name", "date": "YYYY-MM-DD", "category": "Food & Dining|Transport|Shopping|Entertainment|Health|Utilities|Other"}'
        }, {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
        }],
      }],
      response_format: { type: "json_object" },
    });
    res.json({ source: "openai", ...JSON.parse(r.choices[0].message.content) });
  } catch (err) {
    console.error("Receipt scan error:", err.message);
    res.status(500).json({ error: "Receipt scan failed" });
  }
});

module.exports = router;

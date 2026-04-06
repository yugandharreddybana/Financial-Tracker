const express = require("express");
const router = express.Router();

let openaiClient = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
  const OpenAI = require("openai");
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("✅ OpenAI client initialised");
} else {
  console.log("ℹ️  No OpenAI key — using mock AI responses");
}

const askGpt = async (prompt) => {
  const r = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 600,
  });
  return JSON.parse(r.choices[0].message.content);
};

router.post("/insights", async (req, res) => {
  try {
    const { totalExpense, totalIncome, expenses } = req.body;
    if (!openaiClient) {
      return res.json({
        source: "mock",
        insights: [
          "🍽️ Food & Dining is your top expense — meal prepping could save €150/month",
          "🚗 Transport costs are 18% above average for your income bracket",
          "📈 Your savings rate improved 4% compared to last month — great progress!",
          "⚡ Utility spending spikes on weekends — consider energy-saving habits",
        ],
      });
    }
    const topCats = (expenses || []).slice(0, 6).map((e) => `${e.category}: €${e.amount}`).join(", ");
    const prompt = `You are a personal finance advisor. Analyse these spending patterns and give exactly 4 specific, actionable insights in JSON format.
Income: €${totalIncome}, Total Expenses: €${totalExpense}
Top spending categories: ${topCats}
Return JSON: {"insights": ["insight1", "insight2", "insight3", "insight4"]}
Each insight should be 1-2 sentences, specific, and start with an emoji.`;
    const data = await askGpt(prompt);
    res.json({ source: "openai", ...data });
  } catch (err) {
    console.error("AI insights error:", err.message);
    res.status(500).json({ error: "AI service error", details: err.message });
  }
});

router.post("/savings-tips", async (req, res) => {
  try {
    const { totalExpense, totalIncome, expenses } = req.body;
    if (!openaiClient) {
      return res.json({
        source: "mock",
        tips: [
          "💰 Set up an automatic transfer of 20% of your salary on payday",
          "🛍️ Use the 48-hour rule before any purchase over €50",
          "📱 Audit subscriptions monthly — average person wastes €45/month on unused services",
          "🍳 Cooking at home 3 extra days per week saves approximately €200/month in Dublin",
        ],
      });
    }
    const prompt = `You are a personal finance coach. Give exactly 4 personalised, actionable savings tips.
Monthly income: €${totalIncome}, Monthly expenses: €${totalExpense}, Savings rate: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
Return JSON: {"tips": ["tip1", "tip2", "tip3", "tip4"]}
Each tip should be practical, specific, and start with an emoji. Tailor advice to someone living in Ireland.`;
    const data = await askGpt(prompt);
    res.json({ source: "openai", ...data });
  } catch (err) {
    console.error("Savings tips error:", err.message);
    res.status(500).json({ error: "AI service error", details: err.message });
  }
});


router.post("/monthly-review", async (req, res) => {
  try {
    const { summary } = req.body || {};
    if (!openaiClient) {
      return res.json({
        source: "mock",
        highlights: [
          "📈 You maintained a positive savings rate over this period.",
          "🍽️ Dining and groceries remain your largest discretionary categories.",
        ],
        improvements: [
          "🧾 Set a hard weekly cap on takeaways and eating out.",
          "📅 Schedule a monthly money review to adjust budgets before overspending.",
        ],
      });
    }
    const { from, to, totalIncome, totalExpenses, netSavings, savingsRate, topCategories, largestTransactions } = summary || {};
    const catLines = (topCategories || []).map(
      (c) => `${c.categoryName}: €${c.amount} (${c.percentage}%)`
    ).join("\n");
    const txLines = (largestTransactions || []).map(
      (t) => `${t.date} — ${t.description} (${t.type}) €${t.amount} in ${t.categoryName}`
    ).join("\n");

    const prompt = `You are a friendly personal finance coach living in Ireland.

Review period: ${from} to ${to}.
Income: €${totalIncome}, Expenses: €${totalExpenses}, Net: €${netSavings}, Savings rate: ${savingsRate}%.
Top spending categories:
${catLines}
Largest transactions:
${txLines}

Return a JSON object of the form {"highlights": ["..."], "improvements": ["..."]}.
- "highlights" = 2-4 short bullet-style sentences starting with an emoji, focusing on what went well.
- "improvements" = 3-5 short sentences starting with an emoji, with concrete suggestions for next month.`;

    const data = await askGpt(prompt);
    res.json({ source: "openai", ...data });
  } catch (err) {
    console.error("Monthly review AI error:", err.message);
    res.status(500).json({ error: "AI service error" });
  }
});

router.post("/carbon-insights", async (req, res) => {
  try {
    const { totalCo2Kg, byCategory } = req.body;
    if (!openaiClient) {
      return res.json({
        source: "mock",
        tips: [
          "🚌 Switching to public transport for your daily commute reduces CO₂ by up to 70%",
          "🛒 Buying local and seasonal produce cuts food-related emissions by 30%",
          "💻 Choosing digital entertainment over physical goods eliminates packaging waste",
          "🌱 Set a monthly CO₂ budget of 50kg alongside your spending budget",
        ],
      });
    }
    const topCats = (byCategory || []).slice(0, 4).map((c) => `${c.name}: ${c.co2Kg}kg`).join(", ");
    const prompt = `You are a sustainability advisor. Total CO₂ this month: ${totalCo2Kg}kg. Top categories: ${topCats}.
Give 4 specific tips to reduce carbon footprint from spending. Return JSON: {"tips": ["tip1","tip2","tip3","tip4"]}. Each tip starts with an emoji.`;
    const data = await askGpt(prompt);
    res.json({ source: "openai", ...data });
  } catch (err) {
    res.status(500).json({ error: "AI service error" });
  }
});

module.exports = router;

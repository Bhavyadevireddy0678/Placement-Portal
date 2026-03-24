const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: message,
      }),
    });
    const embedData = await embedRes.json();
    const embedding = embedData.data[0].embedding;

    const { data: chunks } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: 4,
    });

    const context =
      chunks?.map((c) => c.content).join("\n\n") || "No relevant info found.";

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: `You are a helpful placement assistant for students. Answer questions about job descriptions, companies, placement rules, eligibility, and FAQs using only the context below. If the answer is not in the context, say "I don't have that information, please contact the placement cell."

Context:
${context}`,
        messages: [{ role: "user", content: message }],
      }),
    });

    const claudeData = await claudeRes.json();
    res.json({ answer: claudeData.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Something went wrong. Please try again." });
  }
});

module.exports = router;

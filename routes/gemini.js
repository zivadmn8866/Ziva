import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: { text: prompt } })
      }
    );

    const data = await result.json();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

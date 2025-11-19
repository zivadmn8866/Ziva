// api/gemini.js

import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });

    const client = new GoogleGenerativeAI({ apiKey: key });

    const model = client.getModel
      ? client.getModel({ model: "models/text-bison-001" })
      : client;

    const result =
      (await model.generate?.({
        content: [{ role: "user", text: prompt }],
      })) || { error: "SDK method mismatch; update needed" };

    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("gemini endpoint error:", err);
    res.status(500).json({ error: err.message });
  }
}

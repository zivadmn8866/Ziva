// api/gemini.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta2/models";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    // choose the model you want
    const model = "text-bison-001"; // or another available model

    // REST call to Google Generative Language
    const url = `${BASE_URL}/${model}:generate?key=${encodeURIComponent(apiKey)}`;

    const body = {
      prompt: {
        text: String(prompt)
      },
      // adjust safety, temperature, tokens, etc. as needed
      temperature: 0.2,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Generative API error:", resp.status, text);
      return res.status(500).json({ error: "Generative API error", detail: text });
    }

    const data = await resp.json();
    // For text-bison style responses look at data.candidates etc. Adapt as needed.
    return res.status(200).json({ success: true, result: data });
  } catch (err: any) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

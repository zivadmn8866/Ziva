// api/gemini.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    // Generative Language REST endpoint (model: text-bison-001)
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${encodeURIComponent(key)}`;

    const body = {
      prompt: {
        text: String(prompt)
      },
      // optional: set temperature / max output tokens etc
      // temperature: 0.2,
      // maxOutputTokens: 256
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Generative API error:", r.status, txt);
      return res.status(502).json({ error: "Generative API error", status: r.status, body: txt });
    }

    const data = await r.json();
    // data has the model output; shape depends on API version (e.g. .candidates[0].output or .output...).
    return res.status(200).json({ success: true, result: data });
  } catch (err: any) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

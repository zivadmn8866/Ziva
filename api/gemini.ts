// api/gemini.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Defensive parsing (Vercel may pass req.body as string)
  let body = req.body ?? {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const prompt = String(body.prompt ?? "");
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

  try {
    const model = "models/text-bison-001"; // change if needed
    // Google Generative Language REST endpoint
    const url = `https://generativelanguage.googleapis.com/v1/${model}:generate?key=${apiKey}`;

    const payload = {
      prompt: { text: prompt }
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      // return upstream error body for debugging
      return res.status(502).json({ error: "Upstream error", status: r.status, body: text });
    }

    const json = JSON.parse(text);
    return res.status(200).json({ success: true, result: json });
  } catch (err: any) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

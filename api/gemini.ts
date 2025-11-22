// api/gemini.ts (example using fetch to call Generative API directly)
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt } = req.body ?? {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY env var" });

  try {
    // Replace the URL & body shape below with the exact Google Generative REST API format from docs
    const url = "https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate"; // example
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}` // or `key=${key}` depending on Google API
      },
      body: JSON.stringify({ prompt: { text: String(prompt) } })
    });

    const json = await resp.json();
    return res.status(200).json({ success: true, result: json });
  } catch (err: any) {
    console.error("generative rest error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

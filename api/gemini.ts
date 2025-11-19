// api/gemini.ts
// Serverless endpoint for Vercel (Node). Keeps GEMINI_API_KEY server-side.
// Place at: /api/gemini.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    // Initialize the client server-side only
    const client = new GoogleGenerativeAI({ apiKey: key });

    // Preferred SDK call: try model.generate if available; fallback to client.generate shape.
    const model = (client as any).getModel ? (client as any).getModel({ model: "models/text-bison-001" }) : client;

    // SDKs differ slightly. Try a couple common call shapes and return the raw result.
    let result: any;

    if (model?.generate) {
      result = await model.generate({
        content: [{ role: "user", text: String(prompt) }],
      });
    } else if ((client as any).generate) {
      // fallback shape
      result = await (client as any).generate({
        model: "models/text-bison-001",
        input: String(prompt),
      });
    } else {
      return res.status(500).json({ error: "GenAI SDK method not found; adapt api/gemini.ts for your SDK version." });
    }

    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
}

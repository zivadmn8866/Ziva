// /api/gemini.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body ?? {};
    const prompt = typeof body === "string" ? JSON.parse(body).prompt : body.prompt;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });

    // dynamically import the SDK to avoid ESM load errors at module init
    const genaiMod = await import("@google/generativeai").catch((e) => {
      console.error("dynamic import error:", e);
      throw new Error("Failed to import generative SDK: " + String(e));
    });

    // The SDK surface may differ by version; attempt commonly used calls:
    const { GoogleGenerativeAI } = genaiMod as any;
    if (!GoogleGenerativeAI) {
      console.error("Generative SDK not found in module");
      return res.status(500).json({ error: "Generative SDK not found" });
    }

    const client = new GoogleGenerativeAI({ apiKey: key });

    // try to call model.generate or client.generate depending on SDK
    let result: any;
    if (typeof (client as any).getModel === "function") {
      // older/newer patterns may expose getModel
      const model = await (client as any).getModel?.({ model: "models/text-bison-001" });
      if (model?.generate) {
        result = await model.generate({ content: [{ role: "user", text: String(prompt) }] });
      } else if ((client as any).generate) {
        // fallback to client.generate
        result = await (client as any).generate?.({
          model: "models/text-bison-001",
          input: String(prompt),
        });
      } else {
        throw new Error("No generate() method found on model or client");
      }
    } else if ((client as any).generate) {
      result = await (client as any).generate?.({
        model: "models/text-bison-001",
        input: String(prompt),
      });
    } else {
      throw new Error("GenAI SDK does not expose generate methods (SDK mismatch)");
    }

    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error("api/gemini error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

// api/gemini.ts  (temporary debug handler)
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("ENTER /api/gemini", { method: req.method });
  console.log("RAW BODY:", req.body);
  console.log("ENV GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
  // echo back headers too
  return res.status(200).json({
    ok: true,
    method: req.method,
    headers: req.headers,
    body: req.body,
    gemini_key_present: !!process.env.GEMINI_API_KEY
  });
}

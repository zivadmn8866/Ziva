// src/services/geminiService.ts
// Client-side: calls your serverless /api/gemini proxy.
// Replace existing client code that imported @google/genai directly.

type GenAIResult = any; // SDK result shape varies; we'll return the raw object

export async function generateServiceDescription(serviceName: string): Promise<GenAIResult> {
  const prompt = `Generate a creative one-sentence description for a salon service named "${serviceName}".`;

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to generate description");

  // return the SDK raw result; you can extract text from it with extractGeneratedText()
  return json.result;
}

/**
 * Helper: try to extract text from common SDK shapes.
 * Call extractGeneratedText(result) in your UI to get a readable string.
 */
export function extractGeneratedText(result: any): string | null {
  if (!result) return null;

  // Common shape 1: result.output[0].content[0].text
  try {
    const c1 = result.output?.[0]?.content?.[0]?.text;
    if (c1) return String(c1);
  } catch {}

  // Common shape 2: result.candidates[0].output_text or candidates[0].content
  try {
    const c2 = result.candidates?.[0]?.output_text ?? result.candidates?.[0]?.content;
    if (c2) return String(c2);
  } catch {}

  // Common shape 3: result.responses[0].text
  try {
    const c3 = result.responses?.[0]?.text;
    if (c3) return String(c3);
  } catch {}

  // If it's a simple string-like return (some SDKs)
  if (typeof result === "string") return result;

  // As a last resort, stringify a human-readable part
  try {
    return JSON.stringify(result).slice(0, 1000);
  } catch {
    return null;
  }
}

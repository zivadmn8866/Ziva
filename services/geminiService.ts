// services/geminiService.ts (client-side)
// Calls your serverless proxy at /api/gemini

export async function generateServiceDescription(serviceName: string) {
  const prompt = `Generate a creative one-sentence description for a salon service named "${serviceName}".`;

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Failed to generate description");

  // The server returns the SDK result object; extract text depending on SDK response shape.
  // Example: if result.candidates[0].output or result.output[0].content etc.
  // For now return the whole result so you can inspect in client:
  return json.result;
}

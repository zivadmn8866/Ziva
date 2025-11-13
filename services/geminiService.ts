// services/geminiService.ts
// Client-side service that calls the serverless proxy at /api/gemini

export async function generateServiceDescription(serviceName: string): Promise<string> {
  // Build payload according to the Gemini REST shape your server expects.
  // Example payload — adjust to your server/proxy expectations:
  const payload = {
    // the proxy forwards this JSON body to the Gemini REST endpoint
    // adapt fields to whatever your serverless proxy & Google endpoint expect
    prompt: `Generate a creative, one-sentence description for a salon service named "${serviceName}"`,
    // if your proxy expects the full generateContent shape, change accordingly
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Gemini proxy error:', res.status, text);
    throw new Error(`Gemini proxy error: ${res.status} ${text}`);
  }

  const data = await res.json();
  // adapt this to how your server returns Gemini response
  // If the proxy returns raw Gemini generateContent response, extract text accordingly
  // Example fallback:
  if (typeof data === 'string') return data;
  if (data?.output_text) return data.output_text;
  if (data?.candidates?.[0]?.content) return data.candidates[0].content;
  // If your proxy returns a different shape, update the logic above.

  return JSON.stringify(data);
}

// services/geminiService.ts (client-side)
export async function generateServiceDescription(serviceName: string): Promise<string> {
  const payload = {
    prompt: `Generate a creative one-sentence description for a salon service named "${serviceName}"`,
    // adapt if your server expects a different body structure
  };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error: ${res.status} ${text}`);
  }
  const data = await res.json();
  // adapt this to the response shape your proxy returns
  if (data?.output_text) return data.output_text;
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

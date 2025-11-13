// api/gemini.js
// Serverless proxy that forwards POST bodies to the Gemini REST endpoint.
// Make sure GEMINI_API_URL and GEMINI_API_KEY are set in Vercel env.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const GEMINI_API_URL =
      process.env.GEMINI_API_URL ||
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    if (!GEMINI_API_URL) {
      return res.status(500).json({ error: 'GEMINI_API_URL is not configured' });
    }

    // choose query key or bearer
    const url =
      process.env.GEMINI_API_KEY && !process.env.USE_BEARER
        ? `${GEMINI_API_URL}?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
        : GEMINI_API_URL;

    const headers = { 'Content-Type': 'application/json' };
    if (process.env.GEMINI_API_KEY && process.env.USE_BEARER) {
      headers.Authorization = `Bearer ${process.env.GEMINI_API_KEY}`;
    }

    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await apiRes.json();
      return res.status(apiRes.status).json(data);
    } else {
      const text = await apiRes.text();
      return res.status(apiRes.status).send(text);
    }
  } catch (err) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: 'Proxy error', details: err?.message || String(err) });
  }
}

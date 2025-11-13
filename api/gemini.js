// api/gemini.js
// Serverless proxy for Gemini / GenAI REST endpoint.
// Place this file at /api/gemini.js in a Vercel project.

module.exports = async (req, res) => {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    // Replace with your actual endpoint or set GEMINI_API_URL env var.
    // Example (Google GenAI): https://generativelanguage.googleapis.com/v1beta/models/...
    const GEMINI_API_URL =
      process.env.GEMINI_API_URL || 'https://YOUR_GEMINI_ENDPOINT_HERE';

    if (!GEMINI_API_URL) {
      return res
        .status(500)
        .json({ error: 'GEMINI_API_URL is not configured' });
    }

    // Choose whether the API requires an API key in query or a Bearer token.
    // Common patterns:
    // 1) Query param: ?key=API_KEY
    // 2) Authorization header: Bearer API_KEY
    //
    // Adjust below according to your provider's docs.

    // Example: use API key as query param if GEMINI_API_KEY is set
    const url =
      process.env.GEMINI_API_KEY && !process.env.USE_BEARER
        ? `${GEMINI_API_URL}?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
        : GEMINI_API_URL;

    // If the provider expects a Bearer token, set USE_BEARER=1 and GEMINI_API_KEY to the token.
    const headers = {
      'Content-Type': 'application/json',
    };
    if (process.env.GEMINI_API_KEY && process.env.USE_BEARER) {
      headers['Authorization'] = `Bearer ${process.env.GEMINI_API_KEY}`;
    }

    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Try to parse JSON; if it's not JSON, return text
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
    return res
      .status(500)
      .json({ error: 'Proxy error', details: err?.message || String(err) });
  }
};

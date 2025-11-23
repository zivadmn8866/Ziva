// server/index.js
import express from "express";
import fetch from "node-fetch"; // if node < 18 use node-fetch; Render uses newer Node usually
import admin from "firebase-admin";

const app = express();
app.use(express.json());

// ===== FIREBASE / FIRESTORE init =====
// Provide FIREBASE_SERVICE_ACCOUNT as base64-encoded JSON in Render env (see instructions below)
const svcBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";
if (!svcBase64) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var");
} else {
  try {
    const json = JSON.parse(Buffer.from(svcBase64, "base64").toString("utf-8"));
    admin.initializeApp({
      credential: admin.credential.cert(json),
    });
    console.log("Firebase admin initialized.");
  } catch (err) {
    console.error("Failed to initialize firebase admin:", err);
  }
}
const db = admin.firestore ? admin.firestore() : null;

// ===== Simple health / test route =====
app.get("/health", (req, res) => res.json({ ok: true }));

// ===== GEMINI (Generative) endpoint =====
// Expects: POST /api/gemini  { "prompt": "text..." }
app.post("/api/gemini", async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { prompt } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const key = process.env.GOOGLE_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GOOGLE_API_KEY env var" });

    // Call Google Generative REST API (replace model if needed)
    const url = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate?key=${encodeURIComponent(
      key
    )}`;

    const body = {
      // A minimal request shape accepted by the REST endpoint
      prompt: {
        text: String(prompt),
      },
      maxOutputTokens: 256,
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Generative API error:", r.status, text);
      return res.status(502).json({ error: "Generative API error", status: r.status, body: text });
    }

    const json = await r.json();

    // Return full JSON; client can inspect fields. Also try to extract a simple text candidate.
    let extracted = null;
    // Several response shapes are used by the API; try a few common ones:
    if (json?.candidates && json.candidates.length) {
      extracted = json.candidates[0];
    } else if (json?.output && Array.isArray(json.output)) {
      extracted = json.output;
    } else if (json?.data) {
      extracted = json.data;
    }

    return res.status(200).json({ success: true, raw: json, extracted });
  } catch (err) {
    console.error("/api/gemini error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// ===== SAVE CHAT to Firestore =====
// Expect: POST /api/saveChat   { "prompt": "...", "response": "..." }
app.post("/api/saveChat", async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { prompt, response: chatResponse } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    if (!db) return res.status(500).json({ error: "Firestore not initialized" });

    const docRef = await db.collection("chats").add({
      prompt,
      response: chatResponse ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("saveChat error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// ===== Start server for Render =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

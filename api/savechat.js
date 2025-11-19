// api/saveChat.js
// Serverless endpoint to persist chat documents to MongoDB.
// Configure MONGODB_URI in Vercel env vars (never commit credentials).

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri, {});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, response } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    await client.connect();
    const db = client.db("ziva"); // change DB name if you want
    const col = db.collection("chats");

    const doc = { prompt, response, createdAt: new Date() };
    await col.insertOne(doc);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("saveChat error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

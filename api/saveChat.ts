// api/saveChat.ts
// Serverless endpoint to persist chat documents to MongoDB.
// Place at: /api/saveChat.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
if (!uri) console.warn("Warning: MONGODB_URI not set in env");

declare global {
  // allow global caching across invocations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var _mongoClientPromise: any;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, response } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const client = await clientPromise;
    const db = client.db("ziva"); // optional: change DB name
    const col = db.collection("chats");

    const doc = { prompt, response: response ?? null, createdAt: new Date() };
    await col.insertOne(doc);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("saveChat error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

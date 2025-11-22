// api/saveChat.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
  global._mongoClientPromise = clientPromise;
} else {
  clientPromise = global._mongoClientPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // defensive parse
  let body = req.body ?? {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  try {
    const { prompt, response } = body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const client = await clientPromise;
    const db = client.db("ziva");
    const col = db.collection("chats");

    await col.insertOne({ prompt, response: response ?? null, createdAt: new Date() });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("saveChat error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

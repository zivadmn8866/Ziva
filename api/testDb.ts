// api/testDb.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

// Reuse cached client in Vercel serverless
let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient && cachedClient.topology?.isConnected()) {
    return cachedClient;
  }

  const client = new MongoClient(uri, { maxPoolSize: 10 });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ ok: false, error: "Missing MONGODB_URI environment variable" });
  }

  try {
    const client = await getClient();
    const db = client.db("ziva_test");
    const col = db.collection("ping");

    if (req.method === "POST") {
      const doc = {
        testing: true,
        time: new Date(),
        userAgent: req.headers["user-agent"] || null,
      };
      const result = await col.insertOne(doc);
      return res.status(200).json({ ok: true, insertedId: result.insertedId });
    }

    // GET: Return last inserted document
    const last = await col.find().sort({ time: -1 }).limit(1).toArray();
    return res.status(200).json({ ok: true, last: last[0] || null });

  } catch (err: any) {
    console.error("MongoDB test error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

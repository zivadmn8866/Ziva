// api/testDb.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
}

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient && cachedClient.isConnected && cachedClient.topology) {
    return cachedClient;
  }
  const client = new MongoClient(uri as string);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await getClient();
    const db = client.db('ziva'); // change db name if you prefer
    // Ping:
    const ping = await db.admin().ping();
    // Insert test doc on POST:
    if (req.method === 'POST') {
      const col = db.collection('testcollection');
      const doc = { createdAt: new Date(), body: req.body || { test: true } };
      const r = await col.insertOne(doc);
      return res.status(200).json({ ok: true, insertedId: r.insertedId, ping });
    }
    // Default GET response:
    return res.status(200).json({ ok: true, ping });
  } catch (err: any) {
    console.error('mongo error', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}

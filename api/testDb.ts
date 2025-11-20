// api/testDb.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) console.error('MONGODB_URI not set');

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri as string);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await getClient();
    const db = client.db('ziva'); // change if you want another DB name
    const ping = await db.admin().ping();

    if (req.method === 'POST') {
      const collection = db.collection('testcollection');
      const r = await collection.insertOne({ createdAt: new Date(), body: req.body || {} });
      return res.status(200).json({ ok: true, insertedId: r.insertedId, ping });
    }

    return res.status(200).json({ ok: true, ping });
  } catch (err: any) {
    console.error('Mongo error', err);
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}

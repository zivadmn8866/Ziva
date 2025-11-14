// api/saveChat.ts
import { MongoClient } from 'mongodb';
import { VercelRequest, VercelResponse } from '@vercel/node';

const client = new MongoClient(process.env.MONGODB_URI!);
// Use a connection pattern that reuses the client across invocations in serverless

export default async function(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await client.connect();
    const db = client.db('myDatabase');
    const col = db.collection('chats');
    const doc = { prompt: req.body.prompt, response: req.body.response, createdAt: new Date() };
    await col.insertOne(doc);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

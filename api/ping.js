import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ ok: false, message: "MONGODB_URI not set" });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    // ping the server
    await client.db().command({ ping: 1 });
    return res.status(200).json({ ok: true, message: "MongoDB ping successful" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  } finally {
    await client.close();
  }
}

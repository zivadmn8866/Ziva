// api/saveChat.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
declare global {
  // allow client reuse between lambda invocations
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

  // --- debug logs to inspect what Vercel receives ---
  console.log("saveChat headers:", JSON.stringify(req.headers));
  try {
    let body: any = req.body;
    console.log("saveChat initial req.body (type):", typeof body);

    if (typeof body === "string") {
      console.log("saveChat raw string body:", body);
      try {
        body = JSON.parse(body);
        console.log("saveChat parsed body from string:", JSON.stringify(body));
      } catch (e) {
        console.error("saveChat JSON.parse failed:", (e as Error).message);
        return res.status(400).json({ error: "Invalid JSON (could not parse body string)" });
      }
    } else {
      // it's already an object (or null)
      console.log("saveChat body object:", JSON.stringify(body));
    }

    const { prompt, response } = body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const client = await clientPromise;
    const db = client.db("ziva");
    const col = db.collection("chats");

    await col.insertOne({ prompt, response: response ?? null, createdAt: new Date() });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("save

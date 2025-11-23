// api/saveChat.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

const FIREBASE_SA_ENV = process.env.FIREBASE_SERVICE_ACCOUNT || "";

function initFirebase() {
  if (!admin.apps.length) {
    if (!FIREBASE_SA_ENV) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
    const serviceAccount = JSON.parse(FIREBASE_SA_ENV);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.firestore();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, response } = req.body ?? {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const db = initFirebase();
    const docRef = await db.collection("chats").add({
      prompt,
      response: response ?? null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err: any) {
    console.error("saveChat error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

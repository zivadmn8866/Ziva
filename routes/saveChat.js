import express from "express";
import admin from "firebase-admin";

const router = express.Router();

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

router.post("/", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const ref = await db.collection("chats").add({
      prompt,
      response: response || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("SaveChat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import admin from "firebase-admin";

// Load base64 from environment
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  console.error("❌ Missing SERVICE_ACCOUNT_BASE64 in environment variables.");
  process.exit(1);
}

// Decode base64 → JSON
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Example API route
app.get("/", (req, res) => {
  res.send("Ziva backend running ✔");
});

// Example protected route with Firestore
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from "express";
import admin from "firebase-admin";

const base64 = process.env.SERVICE_ACCOUNT_BASE64;
if (!base64) {
  console.error("❌ SERVICE_ACCOUNT_BASE64 missing");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

app.get("/test", (req, res) => res.send("Firebase Admin Working!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

import express from "express";
import cors from "cors";
import geminiRoute from "./routes/gemini.js";
import saveChatRoute from "./routes/saveChat.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Ziva backend running"));

// mount routes
app.use("/api/gemini", geminiRoute);
app.use("/api/saveChat", saveChatRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server listening on port", PORT));

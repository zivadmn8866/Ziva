// server/index.js
import express from "express";
import cors from "cors";

console.log("DEBUG: Starting server...");
console.log("DEBUG: CWD =", process.cwd());

const app = express();
app.use(cors());
app.use(express.json());

// Basic root route
app.get("/", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// health-check for Render
app.get("/healthz", (req, res) => {
  res.send("ok");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

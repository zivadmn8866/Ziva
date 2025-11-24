import React from "react";

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Ziva frontend</h1>
      <p>Frontend deployed on Vercel. Backend base: {import.meta.env.VITE_API_BASE}</p>
    </div>
  );
}

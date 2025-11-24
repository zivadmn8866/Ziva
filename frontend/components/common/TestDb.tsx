// components/common/TestDb.tsx
import React, { useState } from "react";

export default function TestDb() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePing() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch("/api/testDb");
      const json = await r.json();
      setResult(json);
    } catch (err: any) {
      setError(err.message || String(err));
    }

    setLoading(false);
  }

  async function handleInsert() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const r = await fetch("/api/testDb", { method: "POST" });
      const json = await r.json();
      setResult(json);
    } catch (err: any) {
      setError(err.message || String(err));
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6, marginTop: 20 }}>
      <h3>MongoDB Test Panel</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={handlePing} disabled={loading}>Ping Database</button>
        <button onClick={handleInsert} disabled={loading}>Insert Test Document</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <pre style={{ color: "red" }}>{error}</pre>}
      {result && (
        <pre style={{
          background: "#f4f4f4",
          padding: 10,
          borderRadius: 4,
          whiteSpace: "pre-wrap"
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

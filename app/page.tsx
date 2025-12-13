"use client";

import { useState } from "react";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function startJob() {
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl })
    });
    const data = await res.json();
    setJob(data);
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${data.id}`);
      const updated = await res.json();
      if (!updated || !updated.logs) return;
      setJob(updated);
      if (updated.status === "done" || updated.status === "failed") {
        clearInterval(interval);
      }
    }, 1000);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Bug Hunter & Auto Fixer</h1>

      <input
        placeholder="https://github.com/user/repo"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ width: "400px", padding: 8 }}
      />

      <button onClick={startJob} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? "Starting..." : "Start Scan"}
      </button>

      {job?.logs && (
  <pre style={{ marginTop: 20, background: "#111", color: "#0f0", padding: 12 }}>
    {job.logs.join("\n")}
  </pre>
)}

    </main>
  );
}

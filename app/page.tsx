"use client";

import { useEffect, useState } from "react";

type JobStatus = "created" | "running" | "success" | "failed" | "terminated";

type Job = {
  id: string;
  repoUrl: string;
  status: JobStatus;
  logs: string[];
  createdAt: string;
  patch?: string;
  prUrl?: string; // New field
  kestraUrl?: string; // New field
};


export default function Home() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/heysujal/sample-eslint.git");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  async function startJob() {
    // ... (rest of startJob is unchanged)
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl })
    });
    const data = await res.json();
    setJob(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!job?.id) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${job.id}`);
      if (!res.ok) return;

      const updated = await res.json();
      setJob(updated);

      if (updated.status === "success" || updated.status === "failed" || updated.status === "terminated") {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [job?.id]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Bug Hunter & Auto Fixer (Vercel + Render + Kestra + Cline)</h1>

      <input
        placeholder="https://github.com/user/repo"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ width: "400px", padding: 8 }}
      />

      <button onClick={startJob} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? "Starting..." : "Start Scan"}
      </button>

      {job?.id && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 10 }}>
            Job Status: 
            <span style={{ color: job.status === 'success' ? 'green' : job.status === 'failed' ? 'red' : 'orange', marginLeft: 10 }}>
              {job.status.toUpperCase()}
            </span>
          </h3>
          {job.kestraUrl && (
            <p>
              <a href={job.kestraUrl} target="_blank" rel="noopener noreferrer">View Live Kestra Execution</a>
            </p>
          )}

          {job.prUrl && (
            <div style={{ padding: 10, background: '#e6ffed', border: '1px solid #00c427' }}>
              🎉 **Autonomous Fix Complete!** PR Opened for CodeRabbit Review: 
              <a href={job.prUrl} target="_blank" rel="noopener noreferrer">
                {job.prUrl}
              </a>
            </div>
          )}
        </div>
      )}


      {job?.logs && (
        <pre style={{ marginTop: 20, background: "#111", color: "#0f0", padding: 12, maxHeight: '400px', overflowY: 'scroll' }}>
          {job.logs.join("\n")}
        </pre>
      )}

      {/* You can remove the patch section if you don't extract it from Kestra outputs */}
      {job?.patch && (
        <div>
          <h4>Proposed Patch:</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {job.patch}
          </pre>
        </div>
      )}

    </main>
  );
}
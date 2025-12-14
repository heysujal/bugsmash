"use client";

import { useState, useEffect, useCallback } from "react";
// Define a simple type for the PR data we care about
interface PullRequest {
  id: number;
  title: string;
  html_url: string;
  created_at: string;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
}

export default function Home() {
  const DEFAULT_REPO = "https://github.com/heysujal/sample-eslint";
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [showStatus, setShowStatus] = useState(false);
  const [recentPrs, setRecentPrs] = useState<PullRequest[]>([]);
  const [prLoading, setPrLoading] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);

  // --- PR Fetching Logic ---
  const fetchRecentPrs = useCallback(async (url: string) => {
    if (!url || !url.includes('github.com')) {
      setRecentPrs([]);
      return;
    }
    
    setPrLoading(true);
    setPrError(null);
    setRecentPrs([]);

    try {
      const response = await fetch("/api/prs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecentPrs(data.prs);
      } else {
        setPrError(`Could not fetch PRs: ${data.error}`);
      }
    } catch (error) {
      setPrError("Failed to fetch PR data.");
      console.error(error);
    } finally {
      setPrLoading(false);
    }
  }, []);

  // Fetch PRs whenever the repo URL changes (with a debounce for better UX)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRecentPrs(repoUrl);
    }, 500); // Debounce time

    return () => clearTimeout(handler);
  }, [repoUrl, fetchRecentPrs]);

  // --- Workflow Trigger Logic (Simplified for brevity) ---
  async function triggerWorkflow() {
    // ... (Your existing triggerWorkflow logic remains largely the same)
    if (!repoUrl) {
      alert("Please enter a repository URL");
      return;
    }

    setLoading(true);
    setShowStatus(true);
    setStatus("Sending request to GitHub Actions...");
    setProgress(10);

    try {
        // ... (Your API call to /api/trigger)
        const response = await fetch("/api/trigger", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoUrl }),
        });

        const data = await response.json();

        if (data.success) {
            // Simplified progress simulation
            const viewLink = 'https://github.com/heysujal/bugsmash/actions'; // Placeholder for the actual workflow URL
            setStatus(`✅ Workflow triggered! <a href="${viewLink}" class="text-blue-400 hover:text-blue-300 underline" target="_blank">View Progress →</a>`);
            setProgress(100);
        } else {
            setStatus(`❌ Error: ${data.error}`);
            setProgress(100);
        }
    } catch (error) {
        setStatus("❌ Failed to trigger workflow. Try manually from GitHub Actions.");
        setProgress(100);
    }

    setTimeout(() => {
        setLoading(false);
        fetchRecentPrs(repoUrl); // Refresh PRs after triggering
    }, 3000);
  }


  // --- UI Component Start ---
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-7xl font-extrabold mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            BugSmash 🤖
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The Autonomous CI Pipeline: AI Agent Fixes Code, You Review the PR.
          </p>
          <div className="text-md text-gray-400 max-w-2xl mx-auto space-x-4">
            <span className="inline-block px-3 py-1 bg-gray-800 rounded-full">Powered by Cline AI</span>
            <span className="inline-block px-3 py-1 bg-gray-800 rounded-full">Model: Gemini 2.5 Flash</span>
            <span className="inline-block px-3 py-1 bg-gray-800 rounded-full">Deployed on Vercel</span>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: TRIGGER & STATUS */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Interactive Trigger Section */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-purple-500/30 shadow-xl">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-purple-300">
                <span>⚡</span>
                <span>Trigger Autonomous Fixer</span>
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Repository URL (Must be Public)
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-purple-500 focus:border-purple-500 transition shadow-inner"
                  placeholder="e.g., https://github.com/username/repo-with-lint-issues"
                />
              </div>

              <button
                onClick={triggerWorkflow}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-lg font-extrabold text-lg transition duration-300 ease-in-out shadow-lg tracking-wide ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-purple-400/50 hover:from-blue-400"
                }`}
              >
                {loading ? "⏳ Workflow in progress..." : "🚀 Start Bug Fix Pipeline"}
              </button>

              {showStatus && (
                <div className="mt-6">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-xl ${loading ? 'animate-spin' : status.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {loading ? '⚙️' : status.startsWith('✅') ? '✅' : '❌'}
                      </div>
                      <span className="font-semibold text-gray-400">Pipeline Status:</span>
                      <span
                        className={`font-mono text-sm ${status.startsWith('❌') ? 'text-red-400' : 'text-blue-400'}`}
                        dangerouslySetInnerHTML={{ __html: status }}
                      />
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* How It Works - Visual Flow */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-blue-500/30 shadow-xl">
              <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">The Autonomous Flow</h2>
              
              <div className="relative flex justify-between items-start text-center">
                  {/* Flow Diagram Replacement */}
                  <div className="flex flex-col items-center w-1/4">
                      <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-3 shadow-md">1</div>
                      <h3 className="font-bold text-lg mb-1">Analyze</h3>
                      <p className="text-gray-400 text-sm">ESLint & Cline ingest data.</p>
                  </div>
                  <div className="mt-6 w-1/4 h-1 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
                  <div className="flex flex-col items-center w-1/4">
                      <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-3 shadow-md">2</div>
                      <h3 className="font-bold text-lg mb-1">Fix & Commit</h3>
                      <p className="text-gray-400 text-sm">Gemini AI edits files locally.</p>
                  </div>
                  <div className="mt-6 w-1/4 h-1 bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse"></div>
                  <div className="flex flex-col items-center w-1/4">
                      <div className="bg-pink-600 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-3 shadow-md">3</div>
                      <h3 className="font-bold text-lg mb-1">PR & Deploy</h3>
                      <p className="text-gray-400 text-sm">GitHub PR is created.</p>
                  </div>
              </div>

            </div>
          </div>
          
          {/* RIGHT COLUMN: RECENT FIXES */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-8 border border-pink-500/30 shadow-xl min-h-[400px]">
              <h2 className="text-3xl font-bold mb-6 text-pink-300">Recent AI Fixes</h2>
              
              {prLoading && (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin text-4xl mb-4 mx-auto">⚙️</div>
                  Fetching {repoUrl.split('/').pop()} PRs...
                </div>
              )}

              {prError && (
                <div className="text-red-400 p-4 border border-red-600 rounded-lg bg-red-900/30">
                  {prError}
                </div>
              )}
              
              {!prLoading && !prError && recentPrs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No recent bot fixes found for this repository.
                </div>
              )}

              <div className="space-y-4">
                {recentPrs.map((pr) => (
                  <a
                    key={pr.id}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-pink-500/70 transition shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-sm ${pr.state === 'open' ? 'text-green-400' : 'text-red-400'}`}>
                        {pr.state === 'open' ? '🟢 OPEN' : '🔴 CLOSED/MERGED'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(pr.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-medium text-gray-300 mb-1 leading-snug">
                       {pr.title}
                    </div>
                    <div className="text-xs text-gray-500">
                        @{pr.user.login}
                    </div>
                  </a>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Tech Stack Footer */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-medium text-gray-500 mb-4">
            Built with Modern Tools for Professional Automation
          </h3>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="bg-gray-800 px-6 py-2 rounded-lg border border-gray-700 text-gray-300">
              <span className="font-semibold">Next.js (Vercel)</span>
            </div>
            <div className="bg-gray-800 px-6 py-2 rounded-lg border border-gray-700 text-gray-300">
              <span className="font-semibold">GitHub Actions (CI)</span>
            </div>
            <div className="bg-gray-800 px-6 py-2 rounded-lg border border-gray-700 text-gray-300">
              <span className="font-semibold">Cline AI</span>
            </div>
            <div className="bg-gray-800 px-6 py-2 rounded-lg border border-gray-700 text-gray-300">
              <span className="font-semibold">Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 border-t border-gray-800 pt-8">
          <a
            href="https://github.com/heysujal/bugsmash"
            className="hover:text-purple-400 transition"
          >
            View Source on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/heysujal/sample-eslint");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [showStatus, setShowStatus] = useState(false);

  async function triggerWorkflow() {
    if (!repoUrl) {
      alert("Please enter a repository URL");
      return;
    }

    setLoading(true);
    setShowStatus(true);
    setStatus("Sending request to GitHub Actions...");
    setProgress(10);

    try {
      const response = await fetch("/api/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate progress
        const steps = [
          { text: "Workflow triggered successfully!", progress: 30 },
          { text: "Cloning repository...", progress: 50 },
          { text: "Running ESLint & Cline AI...", progress: 70 },
          { text: "Generating fixes...", progress: 90 },
          { text: "Check GitHub Actions for progress", progress: 100 },
        ];

        for (let i = 0; i < steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus(steps[i].text);
          setProgress(steps[i].progress);
        }

        setStatus(
          '✅ Workflow started! <a href="https://github.com/heysujal/bugsmash/actions" class="text-blue-400 hover:text-blue-300 underline" target="_blank">View Progress →</a>'
        );
      } else {
        setStatus(`❌ Error: ${data.error}`);
        setProgress(100);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus(
        "❌ Failed to trigger workflow. Try manually from GitHub Actions."
      );
      setProgress(100);
    }

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="text-7xl mb-4 animate-bounce">🤖</div>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            BugSmash
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Autonomous Bug Fixing with AI Agents
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Powered by Cline AI • Deployed on Vercel • Running on Gemini 2.5
            Flash
          </p>
        </div>

        {/* Interactive Trigger Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/30 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span>⚡</span>
            <span>Trigger Bug Fixer</span>
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              placeholder="https://github.com/username/repo"
            />
          </div>

          <button
            onClick={triggerWorkflow}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {loading ? "⏳ Triggering workflow..." : "🚀 Start Autonomous Bug Fix"}
          </button>

          {showStatus && (
            <div className="mt-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin">⚙️</div>
                  <span className="font-semibold">Status:</span>
                  <span
                    className="text-blue-400"
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

        {/* How It Works */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="font-bold text-xl mb-2">Analyze</h3>
              <p className="text-gray-400">
                Cline AI scans your code with ESLint and identifies issues
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="font-bold text-xl mb-2">Generate Fixes</h3>
              <p className="text-gray-400">
                Gemini AI generates intelligent fixes for detected issues
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="font-bold text-xl mb-3">Create PR</h3>
              <p className="text-gray-400">
                Automatically commits fixes and opens a pull request
              </p>
            </div>
          </div>
        </div>

        {/* Recent Fixes */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-6">Recent Fixes</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-400">
                  ✓ sample-eslint
                </span>
                <span className="text-sm text-gray-500">2 minutes ago</span>
              </div>
              <div className="text-sm text-gray-400">
                Fixed 4 ESLint issues • Removed unused variables • Added
                semicolons
              </div>
              <a
                href="https://github.com/heysujal/sample-eslint/pulls"
                className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                View PR →
              </a>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-400 mb-6">
            Powered By
          </h3>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
              <span className="font-semibold">🤖 Cline AI</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
              <span className="font-semibold">▲ Vercel</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
              <span className="font-semibold">✨ Gemini 2.5</span>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-700">
              <span className="font-semibold">⚙️ GitHub Actions</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <a
            href="https://github.com/heysujal/bugsmash"
            className="hover:text-purple-400 transition"
          >
            View Source on GitHub →
          </a>
        </div>
      </div>
    </div>
  );
}
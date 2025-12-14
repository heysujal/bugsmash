"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface PullRequest {
  id: number
  title: string
  html_url: string
  created_at: string
  state: "open" | "closed"
  user: {
    login: string
  }
}

export default function Home() {
  const DEFAULT_REPO = "https://github.com/heysujal/sample-eslint"
  const [repoUrl, setRepoUrl] = useState(DEFAULT_REPO)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [showStatus, setShowStatus] = useState(false)
  const [recentPrs, setRecentPrs] = useState<PullRequest[]>([])
  const [prLoading, setPrLoading] = useState(false)
  const [prError, setPrError] = useState<string | null>(null)

  const fetchRecentPrs = useCallback(async (url: string) => {
    if (!url || !url.includes("github.com")) {
      setRecentPrs([])
      return
    }

    setPrLoading(true)
    setPrError(null)
    setRecentPrs([])

    try {
      const response = await fetch("/api/prs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      })

      const data = await response.json()

      if (response.ok) {
        setRecentPrs(data.prs || [])
      } else {
        setPrError(`Could not fetch PRs: ${data.error}`)
      }
    } catch (error) {
      setPrError("Failed to fetch PR data.")
      console.error(error)
    } finally {
      setPrLoading(false)
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRecentPrs(repoUrl)
    }, 500)

    return () => clearTimeout(handler)
  }, [repoUrl, fetchRecentPrs])

  async function triggerWorkflow() {
    if (!repoUrl) {
      alert("Please enter a repository URL")
      return
    }

    setLoading(true)
    setShowStatus(true)
    setStatus("Sending request to GitHub Actions...")
    setProgress(10)

    try {
      const response = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      })

      const data = await response.json()

      if (data.success) {
        const viewLink = "https://github.com/heysujal/bugsmash/actions"
        setStatus(`✓ Workflow triggered successfully`)
        setProgress(100)
      } else {
        setStatus(`✗ Error: ${data.error}`)
        setProgress(100)
      }
    } catch (error) {
      setStatus("✗ Failed to trigger workflow. Try manually from GitHub Actions.")
      setProgress(100)
    }

    setTimeout(() => {
      setLoading(false)
      fetchRecentPrs(repoUrl)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {/* Hero Section */}
        <header className="mb-20 text-center">
          <h1 className="mb-6 text-balance text-6xl font-bold leading-none tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            BugSmash
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-pretty text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            Autonomous CI pipeline powered by AI. Your agent analyzes, fixes code issues, and creates pull requests
            automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Cline AI
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Gemini 2.5 Flash
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Deployed on Vercel
            </Badge>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left Column: Trigger & Status */}
          <div className="space-y-8 lg:col-span-2">
            {/* Trigger Card */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Trigger Autonomous Fixer</h2>
              </div>

              <div className="mb-6 space-y-2">
                <label htmlFor="repo-url" className="block text-sm font-medium text-foreground">
                  Repository URL
                </label>
                <Input
                  id="repo-url"
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="h-12 text-base"
                />
                <p className="text-sm text-muted-foreground">Must be a public GitHub repository</p>
              </div>

              <Button onClick={triggerWorkflow} disabled={loading} size="lg" className="w-full text-base font-semibold">
                {loading ? (
                  <>
                    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Workflow in progress
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Start Bug Fix Pipeline
                  </>
                )}
              </Button>

              {showStatus && (
                <div className="mt-6 space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${loading ? "animate-pulse" : ""}`}>
                      {loading ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : status.startsWith("✓") ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">Pipeline Status</p>
                      <p className="text-sm text-muted-foreground">{status}</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">How It Works</h2>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Analyze</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    ESLint scans your code and AI ingests all issues
                  </p>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Fix & Commit</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Gemini AI intelligently edits files and commits changes
                  </p>
                </div>

                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Create PR</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Automated pull request ready for your review
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Fixes */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">Recent AI Fixes</h2>

              {prLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading pull requests...</p>
                </div>
              )}

              {prError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {prError}
                </div>
              )}

              {!prLoading && !prError && recentPrs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mb-4 h-12 w-12 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">No bot fixes found for this repository</p>
                </div>
              )}

              <div className="space-y-3">
                {recentPrs.map((pr) => (
                  <a
                    key={pr.id}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-accent"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge variant={pr.state === "open" ? "default" : "secondary"} className="text-xs">
                        {pr.state === "open" ? "Open" : "Closed"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pr.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">{pr.title}</h3>
                    <p className="text-xs text-muted-foreground">by @{pr.user.login}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 text-center">
          <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">Powered By</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Next.js", "GitHub Actions", "Cline AI", "Gemini 2.5 Flash"].map((tech) => (
              <div
                key={tech}
                className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center">
          <a
            href="https://github.com/heysujal/bugsmash"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            View Source on GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}

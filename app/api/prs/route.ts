import { type NextRequest, NextResponse } from "next/server"

const GITHUB_API_URL = "https://api.github.com/repos"

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required." }, { status: 400 })
    }

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL format." }, { status: 400 })
    }

    const [, owner, repoName] = match
    const apiUrl = `${GITHUB_API_URL}/${owner}/${repoName}/pulls?state=all&per_page=10`

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    }

    if (process.env.GITHUB_PAT_FOR_PR_FETCH) {
      headers["Authorization"] = `token ${process.env.GITHUB_PAT_FOR_PR_FETCH}`
    }

    const response = await fetch(apiUrl, { headers })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: `GitHub API Error: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status },
      )
    }

    const prs = await response.json()

    const botPrs = prs.filter(
      (pr: any) =>
        pr.user.login === "BugHunter-Bot" ||
        pr.title.toLowerCase().includes("auto-fix") ||
        pr.title.toLowerCase().includes("eslint"),
    )

    return NextResponse.json({ prs: botPrs.slice(0, 5) })
  } catch (error) {
    console.error("[v0] PR Fetch Error:", error)
    return NextResponse.json({ error: "Failed to communicate with GitHub API." }, { status: 500 })
  }
}

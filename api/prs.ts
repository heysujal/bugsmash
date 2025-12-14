import { NextApiRequest, NextApiResponse } from 'next';

const GITHUB_API_URL = 'https://api.github.com/repos';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required.' });
  }

  // Extract owner and repoName from the URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid GitHub repository URL format.' });
  }

  const [, owner, repoName] = match;
  const apiUrl = `${GITHUB_API_URL}/${owner}/${repoName}/pulls?state=all&per_page=5`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_PAT_FOR_PR_FETCH}`, // Use your secured token
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Handle rate limits or 404
      const errorData = await response.json();
      return res.status(response.status).json({ error: `GitHub API Error: ${response.statusText}`, details: errorData });
    }

    const prs = await response.json();

    // Filter for PRs created by your bot, or just return all recent PRs
    const botPrs = prs.filter((pr: any) => 
      pr.user.login === 'BugHunter-Bot' || // Assuming your bot has its own user
      pr.title.includes('Auto-fix: ESLint issues')
    );

    return res.status(200).json({ prs: botPrs.slice(0, 3) }); // Return top 3 filtered PRs

  } catch (error) {
    console.error('PR Fetch Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with GitHub API.' });
  }
}
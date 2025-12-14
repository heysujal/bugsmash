// Vercel Serverless Function to trigger GitHub Actions workflow

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  try {
    // Trigger GitHub Actions workflow
    const response = await fetch(
      'https://api.github.com/repos/heysujal/bugsmash/actions/workflows/bug-fixer.yml/dispatches',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            repo_url: repoUrl
          }
        })
      }
    );

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Workflow triggered successfully',
        repoUrl
      });
    } else {
      const error = await response.text();
      return res.status(response.status).json({
        success: false,
        error: 'Failed to trigger workflow',
        details: error
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
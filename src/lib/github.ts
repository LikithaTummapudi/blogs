import fs from 'node:fs/promises';
import path from 'node:path';

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'LikithaTummapudi';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'blogs';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_FALLBACK_TOKEN = process.env.GITHUB_TOKEN || '';

/**
 * Gets the best token available (user OAuth token or server PAT fallback)
 */
function resolveToken(userToken?: string): string {
  return userToken || GITHUB_FALLBACK_TOKEN;
}

/**
 * Gets file metadata and sha from GitHub repository
 */
export async function getGitHubFile(filePath: string, userToken?: string): Promise<{
  sha: string;
  content: string;
} | null> {
  const token = resolveToken(userToken);
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Likitha-Personal-Blog-Admin',
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const content = Buffer.from(data.content || '', 'base64').toString('utf-8');
    return { sha: data.sha, content };
  } catch (err) {
    console.error(`Failed to fetch GitHub file ${filePath}:`, err);
    return null;
  }
}

/**
 * Commits a file (creates or updates) in the GitHub repository and syncs to local disk if running locally
 */
export async function commitFileToRepo(
  filePath: string,
  content: string | Buffer,
  commitMessage: string,
  userToken?: string
): Promise<{ success: boolean; error?: string }> {
  const token = resolveToken(userToken);
  const isBuffer = Buffer.isBuffer(content);
  const base64Content = isBuffer
    ? content.toString('base64')
    : Buffer.from(content as string, 'utf-8').toString('base64');

  // 1. If running in local environment, also write to local filesystem for instant preview
  try {
    const localPath = path.resolve(process.cwd(), filePath);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    if (isBuffer) {
      await fs.writeFile(localPath, content);
    } else {
      await fs.writeFile(localPath, content as string, 'utf-8');
    }
  } catch (err) {
    console.warn('Could not write to local filesystem (expected on read-only serverless):', err);
  }

  // 2. Commit to GitHub repository
  if (!token) {
    console.warn('No GitHub token available. File was written to local filesystem only.');
    return { success: true };
  }

  try {
    // Check if file already exists to obtain sha for update
    const existing = await getGitHubFile(filePath, token);

    const body: Record<string, any> = {
      message: commitMessage,
      content: base64Content,
      branch: GITHUB_BRANCH,
    };

    if (existing?.sha) {
      body.sha = existing.sha;
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Likitha-Personal-Blog-Admin',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || 'GitHub API error' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to commit to GitHub' };
  }
}

/**
 * Deletes a file from the GitHub repository and local filesystem
 */
export async function deleteFileFromRepo(
  filePath: string,
  commitMessage: string,
  userToken?: string
): Promise<{ success: boolean; error?: string }> {
  const token = resolveToken(userToken);

  // 1. Delete locally if possible
  try {
    const localPath = path.resolve(process.cwd(), filePath);
    await fs.unlink(localPath);
  } catch (err) {
    // Ignore if not present locally
  }

  // 2. Delete from GitHub
  if (!token) {
    return { success: true };
  }

  try {
    const existing = await getGitHubFile(filePath, token);
    if (!existing?.sha) {
      return { success: true };
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Likitha-Personal-Blog-Admin',
        },
        body: JSON.stringify({
          message: commitMessage,
          sha: existing.sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || 'Failed to delete on GitHub' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error deleting file' };
  }
}

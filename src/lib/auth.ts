import crypto from 'node:crypto';

export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'LikithaTummapudi').toLowerCase();
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'likitha-blog-editorial-secret-key-2026';

export interface AdminUser {
  username: string;
  name: string;
  avatar_url: string;
  github_token: string;
}

/**
 * Returns GitHub OAuth Authorization URL
 */
export function getGitHubAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo read:user user:email',
    state: crypto.randomBytes(16).toString('hex'),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges OAuth authorization code for GitHub access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string | null> {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing in environment');
    return null;
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error('Failed to exchange GitHub code for token:', err);
    return null;
  }
}

/**
 * Fetches authenticated GitHub user profile
 */
export async function getGitHubUserProfile(token: string): Promise<{
  login: string;
  name: string;
  avatar_url: string;
} | null> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Likitha-Personal-Blog-Admin',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch GitHub user:', err);
    return null;
  }
}

/**
 * Signs and creates a session cookie string
 */
export function createSessionCookie(user: AdminUser): string {
  const payload = JSON.stringify({
    ...user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const base64Payload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(base64Payload);
  const signature = hmac.digest('base64url');

  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and parses session cookie
 */
export function verifySessionCookie(cookieValue?: string): AdminUser | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;

  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(base64Payload);
  const expectedSig = hmac.digest('base64url');

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const raw = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const data = JSON.parse(raw);

    if (data.expiresAt && data.expiresAt < Date.now()) {
      return null;
    }

    if (data.username?.toLowerCase() !== ADMIN_USERNAME) {
      return null;
    }

    return {
      username: data.username,
      name: data.name || data.username,
      avatar_url: data.avatar_url || '',
      github_token: data.github_token || '',
    };
  } catch {
    return null;
  }
}

/**
 * Checks if request is from authorized admin
 */
export function getAuthenticatedUser(request: Request): AdminUser | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (!match) return null;

  return verifySessionCookie(match[1]);
}

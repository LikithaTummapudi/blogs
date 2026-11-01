export const prerender = false;

import type { APIRoute } from 'astro';
import {
  ADMIN_USERNAME,
  exchangeCodeForToken,
  getGitHubUserProfile,
  createSessionCookie,
} from '../../../lib/auth';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectUri = `${url.origin}/api/auth/callback`;

  if (!code) {
    return new Response('Missing authorization code from GitHub', { status: 400 });
  }

  // 1. Exchange code for access token
  const token = await exchangeCodeForToken(code, redirectUri);
  if (!token) {
    return new Response('Failed to authenticate with GitHub. Check your GITHUB_CLIENT_SECRET.', { status: 500 });
  }

  // 2. Fetch authenticated GitHub user
  const profile = await getGitHubUserProfile(token);
  if (!profile) {
    return new Response('Failed to retrieve GitHub user profile.', { status: 500 });
  }

  // 3. Restrict access strictly to LikithaTummapudi
  if (profile.login.toLowerCase() !== ADMIN_USERNAME) {
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Access Denied — 403 Forbidden</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF7F2; color: #1A1918; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #FFFFFF; border: 1px solid #E7E2D8; border-radius: 16px; padding: 40px; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          h1 { color: #C2593F; font-size: 24px; margin-bottom: 12px; }
          p { color: #5A554F; font-size: 14px; line-height: 1.6; }
          a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #1A1918; color: #FAF7F2; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>403 — Unauthorized Account</h1>
          <p>You authenticated as <strong>@${profile.login}</strong>.</p>
          <p>This private blog administration portal is restricted exclusively to <strong>@${ADMIN_USERNAME}</strong>.</p>
          <a href="/">Return to Public Website</a>
        </div>
      </body>
      </html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // 4. Issue signed admin session cookie
  const sessionToken = createSessionCookie({
    username: profile.login,
    name: profile.name || profile.login,
    avatar_url: profile.avatar_url,
    github_token: token,
  });

  const isProd = import.meta.env.PROD;
  const cookieString = `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; ${isProd ? 'Secure;' : ''}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': cookieString,
    },
  });
};

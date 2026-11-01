export const prerender = false;

import type { APIRoute } from 'astro';
import { getGitHubAuthUrl } from '../../../lib/auth';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
  const githubAuthUrl = getGitHubAuthUrl(redirectUri);

  return redirect(githubAuthUrl);
};

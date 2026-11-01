export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const user = getAuthenticatedUser(request);

  if (!user) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

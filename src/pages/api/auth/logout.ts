export const prerender = false;

import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ redirect }) => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
};

export const prerender = false;

import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request }) => {
  const isProd = import.meta.env?.PROD ?? (process.env.NODE_ENV === 'production');
  const clearCookie = `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${isProd ? 'Secure;' : ''}`;

  const acceptHeader = request.headers.get('accept') || '';
  if (acceptHeader.includes('application/json')) {
    return new Response(JSON.stringify({ success: true, redirect: '/admin' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie,
      },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': clearCookie,
    },
  });
};

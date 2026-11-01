export const prerender = false;

import type { APIRoute } from 'astro';
import {
  ADMIN_USERNAME,
  createSessionCookie,
  verifyAdminPassword,
  SESSION_DURATION_SECONDS,
} from '../../../lib/auth';
import { siteConfig } from '../../../config/site';

export const POST: APIRoute = async ({ request }) => {
  try {
    let password = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await request.json();
      password = data.password || '';
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      password = (formData.get('password') as string) || '';
    }

    if (!password) {
      return new Response(JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Incorrect admin password. Please try again.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create 30-day session cookie
    const sessionToken = createSessionCookie(
      {
        username: ADMIN_USERNAME,
        name: siteConfig.author.name,
        avatar_url: siteConfig.author.avatar,
      },
      SESSION_DURATION_SECONDS
    );

    const isProd = import.meta.env?.PROD ?? (process.env.NODE_ENV === 'production');
    const expiresDate = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toUTCString();
    const cookieHeader = `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}; Expires=${expiresDate}; ${isProd ? 'Secure;' : ''}`;

    return new Response(
      JSON.stringify({
        success: true,
        redirect: '/admin',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error during authentication' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

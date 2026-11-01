export const prerender = false;

import type { APIRoute } from 'astro';
import { unsubscribeByToken } from '../../lib/supabase';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/unsubscribe?status=invalid');
  }

  const result = await unsubscribeByToken(token);

  if (result.success) {
    return redirect('/unsubscribe?status=success');
  } else {
    return redirect(`/unsubscribe?status=error&message=${encodeURIComponent(result.error || 'Failed to unsubscribe')}`);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await unsubscribeByToken(token);

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

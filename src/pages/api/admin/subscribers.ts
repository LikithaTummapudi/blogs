export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/auth';
import { getActiveSubscriberCount } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const count = await getActiveSubscriberCount();
  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

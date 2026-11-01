export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/auth';
import { deleteFileFromRepo } from '../../../lib/github';

export const POST: APIRoute = async ({ request }) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { slug } = await request.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), { status: 400 });
    }

    const filePath = `src/content/blogs/${slug}.md`;
    const result = await deleteFileFromRepo(
      filePath,
      `refactor(blog): remove article "${slug}"`,
      user.github_token
    );

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error || 'Failed to delete file' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

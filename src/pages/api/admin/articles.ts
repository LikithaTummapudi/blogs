export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/auth';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Basic frontmatter parser for local filesystem articles
 */
function parseFrontmatter(raw: string): { data: Record<string, any>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const yamlStr = match[1];
  const body = match[2];
  const data: Record<string, any> = {};

  const lines = yamlStr.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    else if (val === 'true') val = true as any;
    else if (val === 'false') val = false as any;
    else if (val.startsWith('[') && val.endsWith(']')) {
      try {
        val = JSON.parse(val.replace(/'/g, '"'));
      } catch {
        val = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) as any;
      }
    }

    data[key] = val;
  }

  return { data, body };
}

export const GET: APIRoute = async ({ request }) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const blogsDir = path.resolve(process.cwd(), 'src/content/blogs');
    let files: string[] = [];

    try {
      files = await fs.readdir(blogsDir);
    } catch {
      // Directory may be empty or not yet created
      files = [];
    }

    const articles = [];

    for (const file of files) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');
      const raw = await fs.readFile(path.join(blogsDir, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);

      articles.push({
        slug,
        title: data.title || slug,
        description: data.description || '',
        category: data.category || 'General',
        tags: Array.isArray(data.tags) ? data.tags : [],
        coverImage: data.coverImage || '',
        featured: !!data.featured,
        draft: !!data.draft,
        pubDate: data.pubDate || new Date().toISOString().split('T')[0],
        content: body,
      });
    }

    // Sort newest first
    articles.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

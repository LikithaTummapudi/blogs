import { getCollection, type CollectionEntry } from 'astro:content';
import { calculateReadingTime } from './readingTime';
import { siteConfig } from '../config/site';

export type BlogPost = CollectionEntry<'blogs'>;

export interface PostWithMeta extends BlogPost {
  readingTime: string;
}

/**
 * Returns all published blog posts sorted by date (newest first).
 * In production, draft posts are excluded.
 */
export async function getAllBlogs(): Promise<PostWithMeta[]> {
  const isProd = import.meta.env?.PROD ?? (process.env.NODE_ENV === 'production');
  const posts = await getCollection('blogs', ({ data }) => {
    return isProd ? !data.draft : true;
  });

  return posts
    .map((post) => ({
      ...post,
      readingTime: calculateReadingTime(post.body),
    }))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Returns the featured article or the latest article if none is flagged as featured.
 */
export async function getFeaturedBlog(): Promise<PostWithMeta | null> {
  const blogs = await getAllBlogs();
  if (blogs.length === 0) return null;

  const featured = blogs.find((b) => b.data.featured);
  return featured || blogs[0];
}

/**
 * Returns all unique categories with post counts and siteConfig metadata.
 */
export async function getAllCategories(): Promise<
  Array<{ name: string; slug: string; description: string; count: number; color: string }>
> {
  const blogs = await getAllBlogs();
  const counts: Record<string, number> = {};

  for (const blog of blogs) {
    const cat = blog.data.category;
    counts[cat] = (counts[cat] || 0) + 1;
  }

  // Combine with defined siteConfig categories
  const mapped = siteConfig.categories.map((c) => ({
    ...c,
    count: counts[c.name] || 0,
  }));

  // Also include any categories present in markdown that might not be in config
  for (const [catName, count] of Object.entries(counts)) {
    if (!mapped.some((m) => m.name.toLowerCase() === catName.toLowerCase())) {
      mapped.push({
        name: catName,
        slug: slugify(catName),
        description: `Articles and notes on ${catName}.`,
        count,
        color: 'charcoal',
      });
    }
  }

  return mapped;
}

/**
 * Returns all unique tags with post counts.
 */
export async function getAllTags(): Promise<Array<{ name: string; count: number }>> {
  const blogs = await getAllBlogs();
  const counts: Record<string, number> = {};

  for (const blog of blogs) {
    for (const tag of blog.data.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Returns related posts for an article based on category and tags.
 */
export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[],
  limit: number = 3
): Promise<PostWithMeta[]> {
  const blogs = await getAllBlogs();
  const others = blogs.filter((b) => b.slug !== currentSlug);

  const scored = others.map((post) => {
    let score = 0;
    if (post.data.category === category) score += 3;
    for (const tag of tags) {
      if (post.data.tags.includes(tag)) score += 1;
    }
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Helper to turn strings into URL-safe slugs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Format a Date object into an elegant publication date string (e.g. "October 24, 2026").
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

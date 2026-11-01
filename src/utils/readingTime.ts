/**
 * Calculates estimated reading time for an article.
 * @param content Raw markdown string
 * @param wordsPerMinute Average words read per minute (default 200)
 * @returns Human-readable reading time string (e.g. "5 min read")
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): string {
  if (!content) return '1 min read';

  // Strip HTML tags and markdown formatting for cleaner word count
  const cleanContent = content
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#*`_~]/g, '')
    .trim();

  const words = cleanContent.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return `${minutes} min read`;
}

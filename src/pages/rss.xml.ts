import rss from '@astrojs/rss';
import { getAllBlogs } from '@utils/content';
import { siteConfig } from '@config/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blogs = await getAllBlogs();

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ? context.site.toString() : siteConfig.url,
    items: blogs.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blogs/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>en-us</language>`,
  });
}

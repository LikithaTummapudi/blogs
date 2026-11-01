export const prerender = false;

import type { APIRoute } from 'astro';
import { getAuthenticatedUser } from '../../../lib/auth';
import { commitFileToRepo } from '../../../lib/github';
import {
  getAllActiveSubscribers,
  hasNotificationBeenSent,
  recordNotificationSent,
} from '../../../lib/supabase';
import { sendNewArticleNotification } from '../../../lib/resend';
import { slugify } from '../../../utils/content';

export const POST: APIRoute = async ({ request }) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      title,
      description,
      category,
      tags = [],
      coverImage: providedCoverImage,
      coverImageData, // base64 string if new image uploaded
      coverImageName,
      featured = false,
      draft = false,
      pubDate,
      content,
    } = data;

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Title and content are required' }), { status: 400 });
    }

    // Clean slug
    const cleanSlug = slugify(data.slug || title);
    if (!cleanSlug) {
      return new Response(JSON.stringify({ error: 'Invalid title or slug' }), { status: 400 });
    }

    let finalCoverImage = providedCoverImage || '';

    // 1. Handle Cover Image Upload if provided as base64
    if (coverImageData) {
      const extension = (coverImageName || 'cover.png').split('.').pop() || 'png';
      const safeImageFileName = `${cleanSlug}.${extension}`;
      const repoImagePath = `public/images/blogs/${safeImageFileName}`;

      const buffer = Buffer.from(coverImageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      await commitFileToRepo(
        repoImagePath,
        buffer,
        `upload(image): add cover for ${title}`,
        user.github_token
      );

      finalCoverImage = `/images/blogs/${safeImageFileName}`;
    }

    // 2. Format Publication Date
    const formattedDate = pubDate ? pubDate.split('T')[0] : new Date().toISOString().split('T')[0];

    // 3. Construct Frontmatter
    const tagsArray = Array.isArray(tags)
      ? tags.map((t: string) => t.trim()).filter(Boolean)
      : String(tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const safeTitle = title.replace(/"/g, '\\"');
    const safeDesc = (description || '').replace(/"/g, '\\"');
    const safeCategory = (category || 'General').replace(/"/g, '\\"');

    const markdownOutput = `---
title: "${safeTitle}"
description: "${safeDesc}"
pubDate: ${formattedDate}
category: "${safeCategory}"
tags: ${JSON.stringify(tagsArray)}
coverImage: "${finalCoverImage}"
coverAlt: "${safeTitle}"
featured: ${featured ? 'true' : 'false'}
draft: ${draft ? 'true' : 'false'}
author: "Likitha Tummapudi"
---

${content}
`;

    // 4. Commit Markdown file to GitHub repository (and local disk)
    const repoFilePath = `src/content/blogs/${cleanSlug}.md`;
    const actionName = draft ? 'save draft' : 'publish article';
    const commitResult = await commitFileToRepo(
      repoFilePath,
      markdownOutput,
      `feat(blog): ${actionName} "${title}"`,
      user.github_token
    );

    if (!commitResult.success) {
      return new Response(JSON.stringify({ error: commitResult.error || 'Failed to save to repository' }), { status: 500 });
    }

    // 5. Send Email Notifications to Active Subscribers (only if published, not draft)
    let notifiedCount = 0;
    if (!draft) {
      const alreadyNotified = await hasNotificationBeenSent(cleanSlug);
      if (!alreadyNotified) {
        const activeSubscribers = await getAllActiveSubscribers();
        if (activeSubscribers.length > 0) {
          const emailRes = await sendNewArticleNotification(
            {
              title,
              description: description || '',
              category: category || 'General',
              slug: cleanSlug,
              coverImage: finalCoverImage,
            },
            activeSubscribers
          );
          notifiedCount = emailRes.sentCount;
          await recordNotificationSent(cleanSlug, title, notifiedCount);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        slug: cleanSlug,
        draft,
        notifiedCount,
        coverImage: finalCoverImage,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error in /api/admin/publish:', err);
    return new Response(JSON.stringify({ error: err.message || 'Server error publishing article' }), { status: 500 });
  }
};

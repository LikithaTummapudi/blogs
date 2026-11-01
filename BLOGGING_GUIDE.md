# 📝 Weekly Blogging & Publishing Guide

Welcome to your weekly publishing handbook! This guide provides everything you need to write, preview, and publish weekly articles to **Chronicles & Code** in under 5 minutes—without editing any website code.

The website uses **Astro Content Collections**. When you add a new Markdown file to the `src/content/blogs/` directory, the website automatically:
- Renders the new article at `/blogs/your-file-name/`.
- Places it at the top of the Homepage and the All Blogs archive.
- Recalculates reading time automatically.
- Updates category counts, tag filters, and global search index.
- Refreshes your RSS feed (`/rss.xml`) and sitemap (`/sitemap-index.xml`).

---

## 🚀 Quick Step-by-Step Publishing Workflow

### Step 1: Create a New Markdown File
Navigate to `src/content/blogs/` and create a new file named with your article title in lowercase separated by hyphens (kebab-case):

```bash
src/content/blogs/my-weekly-article.md
```

> **Naming Rule**: Keep filenames lowercase and use hyphens instead of spaces (e.g., `understanding-cache-locality.md`). The filename becomes your article's public URL: `https://your-site.vercel.app/blogs/understanding-cache-locality`.

---

### Step 2: Add Frontmatter Metadata
Every blog post **must** start with a metadata block enclosed between two `---` lines. Copy and paste this block at the very top of your file:

```markdown
---
title: "Your Engaging Article Title Goes Here"
description: "A concise 1-2 sentence summary of what this article covers and what the reader will learn."
pubDate: 2026-11-08
category: "Computer Science"
tags: ["Algorithms", "Data Structures", "Performance"]
coverImage: "/images/blogs/transformers.svg"
coverAlt: "Descriptive caption for the cover image"
featured: false
draft: false
author: "Likitha Tummapudi"
---
```

#### Frontmatter Fields Reference:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `title` | String | The main headline displayed on the article and cards. | `"Understanding Raft Consensus"` |
| `description` | String | A summary for cards, search results, and Google SEO. | `"A visual guide to leader election..."` |
| `pubDate` | Date (`YYYY-MM-DD`) | Publication date. Used to sort articles (newest first). | `2026-11-08` |
| `updatedDate` | Date (Optional) | If you revise the article later, add this line. | `2026-11-15` |
| `category` | String | Must match one of your categories (see list below). | `"Computer Science"` |
| `tags` | Array of strings | Keywords for search and filtering. | `["Distributed Systems", "Raft"]` |
| `coverImage` | String (Path) | Path to an image in `public/images/blogs/` or external URL. | `"/images/blogs/raft.svg"` |
| `coverAlt` | String (Optional) | Caption and accessible description of the cover image. | `"Raft State Machine Diagram"` |
| `featured` | Boolean (`true`/`false`)| If `true`, prominently highlights this post on the homepage. | `false` |
| `draft` | Boolean (`true`/`false`)| If `true`, visible **only** during local dev; hidden in production! | `false` |
| `author` | String | Author name. | `"Likitha Tummapudi"` |

#### Available Categories:
- `Technology`
- `Artificial Intelligence`
- `Machine Learning`
- `Programming`
- `Computer Science`
- `Learning & Experiences`
- `Projects & Experiments`

*(You can also use custom categories—the website will automatically detect and create archive pages for them!)*

---

### Step 3: Add a Cover Image

Place your image inside the `public/images/blogs/` directory:
```
public/
  images/
    blogs/
      my-cover-image.png   (or .svg, .jpg, .webp)
```
In your frontmatter, set:
```yaml
coverImage: "/images/blogs/my-cover-image.png"
```
> **Recommended aspect ratio**: `16:9` (e.g., 1200x675 or 800x450).

---

### Step 4: Write Your Markdown Content

Write standard Markdown underneath the frontmatter block. The website supports rich typography and technical formatting:

- **Headings**: Use `## Heading 2` and `### Heading 3` (these automatically generate the sticky Table of Contents!).
- **Math**: Render LaTeX equations using `$...$` inline or `$$...$$` on its own line.
- **Code Blocks**: Specify the language for syntax highlighting and copy-to-clipboard buttons:
  ````markdown
  ```python
  def calculate_loss(y_pred, y_true):
      return ((y_pred - y_true) ** 2).mean()
  ```
  ````
- **Callouts / Quotes**:
  ```markdown
  > "Writing code is easy; building resilient systems is an art."
  ```
- **Tables**:
  ```markdown
  | Metric | Before | After |
  | :--- | :--- | :--- |
  | Latency | 120ms | 14ms |
  ```

---

### Step 5: Preview Your Article Locally

Before publishing, preview your new article in your browser:

1. Open your terminal in the project directory:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:4321](http://localhost:4321) in your browser.
3. Check the homepage (your new post should appear at the top), click into your article, test the Table of Contents, code blocks, and search bar.

---

### Step 6: Publish to GitHub & Vercel

When you are ready to publish for your mentor:

```bash
git add .
git commit -m "feat: publish weekly blog on Raft consensus"
git push origin main
```

**What happens next?**
1. GitHub receives your commit.
2. Vercel automatically detects the push, runs `npm run build`, and deploys your updated website in ~30 seconds.
3. Your mentor can immediately visit your live URL and read your latest publication!

---

## 📋 Reusable Weekly Post Template

Copy the snippet below whenever you begin a new weekly post:

```markdown
---
title: "Article Title: A Clear Subtitle"
description: "A compelling summary of the technical problem, experiments conducted, and key takeaways."
pubDate: 2026-11-08
category: "Programming"
tags: ["Architecture", "System Design", "Guide"]
coverImage: "/images/blogs/transformers.svg"
coverAlt: "Technical architecture diagram"
featured: false
draft: false
author: "Likitha Tummapudi"
---

A brief opening paragraph setting the context. Why is this topic important? What problem does it solve? What sparked your curiosity to explore it this week?

---

## 1. Problem Statement & Background

Explain the fundamental challenge. Why do traditional approaches fall short?

> "Key insight or memorable quote summarizing the conceptual leap."

### Core Architectural Invariants
- First principle or system constraint.
- Second trade-off or boundary.

---

## 2. Technical Breakdown & Code Implementation

Walk through the code step-by-step:

```typescript
export function executeOperation(input: string): boolean {
  console.log("Processing input:", input);
  return true;
}
```

Explain what the code achieves, how memory or performance is impacted, and why this design was chosen.

---

## 3. Comparison & Trade-Offs

| Approach | Latency | Memory Footprint | Operational Complexity |
| :--- | :--- | :--- | :--- |
| **Naive Method** | High | Low | Minimal |
| **Optimized Pattern** | Sub-millisecond | Bounded | Moderate |

---

## 4. Retrospective & Mentor Discussion Points

Reflect on what you learned this week:
- What surprised you during testing?
- What questions remain open for mentor review?
- What will you build or explore next week?
```

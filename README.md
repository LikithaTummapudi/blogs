# 🏛️ Chronicles & Code — Premium Personal Blogging Website

> A sophisticated, editorial-style personal technical publication crafted for weekly engineering syntheses, deep-dive explorations, and mentor reviews.

Built with **Astro 4**, **TypeScript**, and **Tailwind CSS**. Designed with an editorial aesthetic featuring warm ivory backgrounds, rich serif headings, monospace code accents, instant client search, sticky table of contents, and automatic weekly publishing via Markdown content collections.

---

## 🌟 Key Features

- **Editorial Visual Identity**: Warm parchment background (`#FAF7F2`), deep charcoal typography, subtle borders, and earthy terracotta/sage accents.
- **Weekly Markdown Publishing Workflow**: Publish new articles by creating a single Markdown file in `src/content/blogs/`. No application code modifications required.
- **Reading Experience**:
  - Sticky interactive Table of Contents with active scroll-spy.
  - Top reading progress indicator bar.
  - Syntax highlighted code blocks with one-click copy buttons.
  - Next/Previous article navigation and related post recommendations.
  - Social sharing links and reader feedback prompts.
- **Discovery & Navigation**:
  - Global real-time search modal (`Ctrl+K` or `⌘K`) indexing titles, descriptions, categories, and tags.
  - Dedicated `/blogs` archive with real-time interactive search and category/tag pills.
  - Taxonomy pages for Categories (`/categories/[category]`) and Tags (`/tags/[tag]`).
- **Performance & Production Architecture**:
  - 100% static HTML generation for sub-second page loads.
  - Automatic RSS feed generation at `/rss.xml`.
  - Automatic XML Sitemap generation at `/sitemap-index.xml`.
  - Full OpenGraph and Twitter card metadata for social sharing previews.
  - Fully responsive mobile drawer navigation and fluid typography.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Astro](https://astro.build/) (Static Site Generation) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + `@tailwindcss/typography` |
| **Syntax Highlighting** | [Shiki](https://shiki.style/) (`github-dark-dimmed` theme) |
| **Typography** | Newsreader (Serif), Plus Jakarta Sans (Sans-serif), JetBrains Mono (Code) |
| **SEO & Feeds** | `@astrojs/sitemap`, `@astrojs/rss`, robots.txt |
| **Deployment Target** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```
blogs/
├── BLOGGING_GUIDE.md             # Beginner-friendly weekly publishing handbook
├── README.md                     # Project documentation & deployment guide
├── astro.config.mjs              # Astro configuration (integrations, sitemap, Shiki)
├── tailwind.config.mjs           # Editorial color palette, serif fonts, typography
├── tsconfig.json                 # Strict TypeScript configuration & path aliases
├── package.json                  # Scripts and dependencies
├── public/
│   ├── favicon.svg               # Site icon
│   ├── robots.txt                # Search engine crawler instructions
│   └── images/
│       ├── avatar.svg            # Author profile avatar
│       └── blogs/                # 16:9 cover illustrations
│           ├── transformers.svg
│           ├── api-resilience.svg
│           └── rust-memory.svg
└── src/
    ├── config/
    │   └── site.ts               # Global site metadata, author bio, social links
    ├── content/
    │   ├── config.ts             # Zod schema validation for blog frontmatter
    │   └── blogs/                # Markdown articles
    │       ├── demystifying-transformers-attention.md
    │       ├── designing-resilient-rest-apis.md
    │       └── ninety-days-with-rust.md
    ├── components/
    │   ├── Header.astro          # Sticky navbar with search & newsletter triggers
    │   ├── MobileMenu.astro      # Mobile slide-out drawer
    │   ├── Footer.astro          # Editorial footer with dynamic copyright year
    │   ├── Hero.astro            # Homepage headline and intro
    │   ├── FeaturedPost.astro    # Magazine-style featured post
    │   ├── PostCard.astro        # Responsive blog card with hover states
    │   ├── CategoryBadge.astro   # Color-coded topic badge
    │   ├── TableOfContents.astro # Sticky scroll-spy table of contents
    │   ├── ReadingProgress.astro # Viewport top reading progress bar
    │   ├── SearchModal.astro     # Client-side instant search modal (Ctrl+K)
    │   ├── NewsletterModal.astro # Newsletter modal with email confirmation
    │   └── BackToTop.astro       # Floating smooth scroll to top button
    ├── layouts/
    │   ├── BaseLayout.astro      # Master HTML shell, SEO, fonts, scripts
    │   └── BlogPostLayout.astro  # Single article reading experience
    ├── pages/
    │   ├── index.astro           # Homepage
    │   ├── 404.astro             # Custom 404 page
    │   ├── about.astro           # Personal About page
    │   ├── rss.xml.ts            # RSS feed generator
    │   ├── blogs/
    │   │   ├── index.astro       # Complete All Blogs directory with filters
    │   │   └── [slug].astro      # Dynamic article reader
    │   ├── categories/
    │   │   ├── index.astro       # Categories directory
    │   │   └── [category].astro  # Category archive
    │   └── tags/
    │       └── [tag].astro       # Tag archive
    ├── styles/
    │   └── global.css            # Typography imports, code copy styles
    └── utils/
        ├── readingTime.ts        # Word count & reading time calculation
        └── content.ts            # Query helpers, draft filters, related posts
```

---

## ⚡ Quick Start & Development

### 1. Prerequisites
Ensure you have Node.js (version 18 or newer) and npm installed:
```bash
node -v
npm -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser. Live reloading is enabled—any edit to your Markdown files or components will update the browser immediately.

### 4. Build for Production
To test the production build and verify static generation:
```bash
npm run build
```
This compiles the entire website into the `dist/` directory.

### 5. Preview the Production Build Locally
```bash
npm run preview
```

---

## ✍️ How to Publish a Blog Weekly

Refer to the complete, beginner-friendly [BLOGGING_GUIDE.md](./BLOGGING_GUIDE.md) for full details.

In short:
1. Create `src/content/blogs/your-article-title.md`.
2. Add the frontmatter block (`title`, `description`, `pubDate`, `category`, `tags`, `coverImage`).
3. Write your Markdown content.
4. Push to GitHub:
   ```bash
   git add .
   git commit -m "feat: publish weekly blog on [Topic]"
   git push origin main
   ```
Your Vercel deployment will automatically rebuild and publish the article within seconds!

---

## 🚀 Deploying to Vercel

### Option A: Deploy via GitHub (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of personal publication website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and log in (or sign up with GitHub).
3. Click **"Add New..."** &rarr; **"Project"**.
4. Select your GitHub repository.
5. Vercel will automatically detect **Astro** as the framework preset:
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live on a `*.vercel.app` URL within 1 minute!

### Option B: Deploy via Vercel CLI
If you have the Vercel CLI installed:
```bash
npx vercel
```
Follow the interactive prompts to link your account and deploy.

---

## ⚙️ Personalizing Your Information

To customize author details, links, or bio:
1. Open `src/config/site.ts`.
2. Update:
   - `author.name`: Your full name
   - `author.role`: Your title or degree
   - `author.bio`: Your personal intro
   - `author.academic`: Your academic degree and college
   - `social.github`: Your GitHub profile link
   - `social.linkedin`: Your LinkedIn profile link
   - `social.twitter`: Your X/Twitter link
   - `url`: Your production Vercel domain (e.g., `https://my-blog.vercel.app`)
3. Update `src/pages/about.astro` with your specific course highlights and personal stories.

---

## 📄 License
MIT © 2026. Free to use, adapt, and build upon.

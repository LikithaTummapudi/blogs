# 🏛️ Chronicles & Code — Likitha Tummapudi's Personal Publication

> A sophisticated, editorial-style personal technical publication crafted for deep-dive computer science explorations, machine learning retrospectives, and academic research syntheses.

Built with **Astro 4 (Hybrid Rendering)**, **TypeScript**, **Tailwind CSS**, **Supabase**, and **Resend**. Featuring an editorial aesthetic with warm ivory backgrounds, rich serif headings, monospace code accents, an authenticated private `/admin` publishing dashboard with live Markdown preview, and real transactional email subscriptions.

---

## 🌟 Key Features

- **Editorial Visual Identity**: Warm parchment background (`#FAF7F2`), deep charcoal typography, subtle borders, and earthy terracotta/sage accents.
- **Dual Publishing Workflows**:
  - **Browser Admin Dashboard (`/admin`)**: Password-protected editorial portal with 30-day persistent session. Features a split-pane live Markdown preview, category/tag selectors, cover image upload, draft support, and commits directly to GitHub via the GitHub Contents API.
  - **Local Git Commits**: Write standard Markdown files in `src/content/blogs/` with frontmatter and push to GitHub.
- **Database-Backed Email Subscriptions**:
  - Real reader newsletter subscriptions powered by **Supabase**.
  - Branded editorial transactional welcome emails via **Resend**.
  - Automated broadcast notifications to active subscribers whenever a new article is published from `/admin`.
  - Secure 1-click tokenized unsubscribe mechanism at `/unsubscribe?token=...`.
- **Reading Experience**:
  - Sticky interactive Table of Contents with active scroll-spy.
  - Viewport top reading progress indicator bar.
  - Syntax-highlighted code blocks with one-click copy buttons.
  - Next/Previous article navigation and related post recommendations.
  - Social sharing links and reader feedback prompts.
- **Discovery & Taxonomy**:
  - Global real-time search modal (`Ctrl+K` or `⌘K`) indexing titles, descriptions, categories, and tags.
  - Dedicated `/blogs` archive with live interactive search and category/tag pills.
  - Clean taxonomy pages for Categories (`/categories/[category]`) and Tags (`/tags/[tag]`).
  - Graceful editorial empty states ("*No stories yet. Something interesting is coming.*") until articles are published.
- **Performance & Production Architecture**:
  - **Astro Hybrid Rendering**: 100% pre-rendered static HTML for public pages (sub-second TTFB), combined with serverless API routes (`/api/*`) and `/admin` running on Vercel Functions.
  - Automatic XML Sitemap generation at `/sitemap-index.xml`.
  - Full OpenGraph and Twitter card metadata for social sharing previews.
  - Fully responsive mobile drawer navigation and fluid typography.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Astro 4](https://astro.build/) (`output: 'hybrid'`) |
| **Serverless Adapter** | [`@astrojs/vercel/serverless`](https://docs.astro.build/en/guides/integrations-guide/vercel/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL for email subscribers) |
| **Transactional Email**| [Resend](https://resend.com/) (Welcome & new post broadcast emails) |
| **Admin Authentication**| Password Authentication (`ADMIN_PASSWORD`, 30-day session) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + `@tailwindcss/typography` |
| **Syntax Highlighting** | [Shiki](https://shiki.style/) (`github-dark-dimmed` theme) |
| **Typography** | Newsreader (Serif), Plus Jakarta Sans (Sans-serif), JetBrains Mono (Code) |
| **Deployment Target** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```
blogs/
├── .env.example                  # Documented environment variable template
├── BLOGGING_GUIDE.md             # Beginner-friendly publishing handbook
├── README.md                     # Project documentation & deployment guide
├── astro.config.mjs              # Astro configuration (hybrid output, Vercel adapter, sitemap, Shiki)
├── tailwind.config.mjs           # Editorial color palette, serif fonts, typography
├── tsconfig.json                 # Strict TypeScript configuration & path aliases
├── package.json                  # Scripts and dependencies
├── public/
│   ├── favicon.svg               # Site icon
│   ├── robots.txt                # Search engine crawler instructions
│   └── images/
│       ├── avatar.svg            # Author profile avatar
│       └── blogs/                # Cover illustrations uploaded via admin or local
└── src/
    ├── config/
    │   └── site.ts               # Author bio, contact links, taxonomy definitions
    ├── content/
    │   ├── config.ts             # Zod schema validation for blog frontmatter
    │   └── blogs/                # Markdown articles (git-tracked)
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
    │   ├── NewsletterModal.astro # Real Supabase newsletter signup modal
    │   └── BackToTop.astro       # Floating smooth scroll to top button
    ├── layouts/
    │   ├── BaseLayout.astro      # Master HTML shell, SEO, fonts, scripts
    │   └── BlogPostLayout.astro  # Single article reading experience
    ├── lib/
    │   ├── auth.ts               # GitHub OAuth verification & signed session cookies
    │   ├── github.ts             # GitHub Contents API commit/update/delete engine
    │   ├── resend.ts             # Resend transactional emails & broadcast notifications
    │   └── supabase.ts           # Supabase client & subscriber database helpers
    ├── pages/
    │   ├── index.astro           # Editorial Homepage
    │   ├── 404.astro             # Custom 404 page
    │   ├── about.astro           # Personal About page (Likitha Tummapudi)
    │   ├── unsubscribe.astro     # 1-click unsubscribe confirmation page
    │   ├── admin/
    │   │   └── index.astro       # Private publishing portal & live Markdown editor
    │   ├── api/
    │   │   ├── subscribe.ts      # Newsletter subscription endpoint
    │   │   ├── unsubscribe.ts    # Unsubscribe API handler
    │   │   ├── auth/             # GitHub OAuth flow (github, callback, logout, user)
    │   │   └── admin/            # Articles management, publish, and delete endpoints
    │   ├── blogs/
    │   │   ├── index.astro       # All Blogs directory with filters
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

## ⚡ Quick Start & Local Development

### 1. Prerequisites
Ensure you have Node.js (version 18 or 20+ recommended) and npm installed:
```bash
node -v
npm -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials (see the [Configuration & Environment Variables](#-configuration--environment-variables) section below).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

### 5. Build for Production
To test the production build and verify hybrid static/serverless compilation:
```bash
npm run build
```

---

## 🗄️ Supabase Setup (Subscribers Database)

1. Create a free account at [Supabase](https://supabase.com/) and create a new project.
2. In your Supabase Dashboard, open the **SQL Editor** and run the following migration script:

```sql
-- Create subscribers table
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' not null check (status in ('active', 'unsubscribed')),
  token text unique not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create sent notifications log table
create table if not exists sent_notifications (
  id uuid default gen_random_uuid() primary key,
  article_slug text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  recipient_count integer not null default 0
);

-- Optimize queries with indexes
create index if not exists idx_subscribers_email on subscribers(email);
create index if not exists idx_subscribers_token on subscribers(token);
create index if not exists idx_sent_notifications_slug on sent_notifications(article_slug);
```

3. Navigate to **Project Settings** &rarr; **API** to copy:
   - `Project URL` &rarr; Set as `SUPABASE_URL` in `.env`
   - `service_role key` (secret) &rarr; Set as `SUPABASE_SERVICE_ROLE_KEY` in `.env`

---

## ✉️ Resend Setup (Transactional Emails)

1. Create a free account at [Resend](https://resend.com/).
2. Go to **API Keys** and generate a new key with full sending access.
3. Add the key to `.env` as `RESEND_API_KEY`.
4. Configure `EMAIL_FROM`:
   - **For Testing / Initial Setup**: You can use Resend's default test sender:
     ```env
     EMAIL_FROM="Likitha Tummapudi <onboarding@resend.dev>"
     ```
   - **For Production with Custom Domain**: Go to **Domains** in the Resend dashboard, add your domain, configure the DNS records (DKIM, SPF), and update:
     ```env
     EMAIL_FROM="Likitha Tummapudi <newsletter@yourdomain.com>"
     ```

---

## 🔐 Admin Authentication (Password-Protected)

The `/admin` dashboard and all article management endpoints are protected server-side with a secure password and 30-day signed session cookies.

- **Environment Variable**: `ADMIN_PASSWORD`
- **Initial Password**: `LikithaLucky#1`
- **Session Duration**: 30 days (persists across browser restarts via HttpOnly signed cookie)

### Where to configure `ADMIN_PASSWORD`:
1. **Local Development**:
   Set `ADMIN_PASSWORD=LikithaLucky#1` (or your preferred password) in your root `.env` file.
2. **Production on Vercel**:
   Go to your project on Vercel &rarr; **Settings** &rarr; **Environment Variables**, and add:
   - Key: `ADMIN_PASSWORD`
   - Value: `LikithaLucky#1` (or your custom password)
   - Environments: **Production**, **Preview**, **Development**

---

## ✍️ Publishing Articles

### Workflow A: Through the Private `/admin` Portal (Recommended)
1. Navigate to `/admin` in your browser.
2. Enter your admin password (`LikithaLucky#1` initially) and click **Continue to Admin**.
3. In the admin dashboard:
   - Click **+ New Article**.
   - Fill in Title, Excerpt / Description, Category, Tags, and Cover Image (or upload one directly from your machine).
   - Write your post in the Markdown editor and preview it live side-by-side.
   - Choose whether to save as **Draft** or **Publish Now**.
   - Check **"Send email notification to active subscribers"** to automatically broadcast a branded editorial newsletter to all registered readers upon publication.
4. Click **Publish Article**. The file will be committed directly to your GitHub repository at `src/content/blogs/<slug>.md`. Vercel will automatically rebuild and deploy within 1–2 minutes!

### Workflow B: Direct Git Commits
You can also publish directly from your code editor:
1. Create a `.md` file inside `src/content/blogs/your-post-slug.md`.
2. Add the frontmatter:
   ```markdown
   ---
   title: "Your Article Title"
   description: "A compelling summary of the article."
   pubDate: 2026-11-01
   category: "Machine Learning"
   tags: ["Machine Learning", "Python", "Research"]
   coverImage: "/images/blogs/your-image.svg"
   featured: false
   draft: false
   ---

   Your Markdown content starts here...
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "feat: publish new article on [Topic]"
   git push origin main
   ```

---

## 🚀 Deploying to Vercel

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: publish functional blog with admin portal and email subscriptions"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import your `blogs` repository.
4. Vercel will auto-detect Astro with the `@astrojs/vercel` adapter.
5. In the **Environment Variables** section, add all variables from `.env.example`:
   - `SITE_URL` = `https://your-domain.vercel.app`
   - `GITHUB_CLIENT_ID` = `...`
   - `GITHUB_CLIENT_SECRET` = `...`
   - `ADMIN_USERNAME` = `LikithaTummapudi`
   - `SESSION_SECRET` = `...`
   - `GITHUB_REPO_OWNER` = `LikithaTummapudi`
   - `GITHUB_REPO_NAME` = `blogs`
   - `GITHUB_BRANCH` = `main`
   - `GITHUB_TOKEN` = `...` *(Personal Access Token with `repo` scope)*
   - `SUPABASE_URL` = `...`
   - `SUPABASE_SERVICE_ROLE_KEY` = `...`
   - `RESEND_API_KEY` = `...`
   - `EMAIL_FROM` = `Likitha Tummapudi <newsletter@yourdomain.com>`
6. Update your GitHub OAuth App's **Authorization callback URL** to match your production domain:
   `https://your-domain.vercel.app/api/auth/callback`
7. Click **Deploy**. Your site is now live!

---

## 📄 License
MIT © 2026 Likitha Tummapudi. All rights reserved.

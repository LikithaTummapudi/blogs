export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  tagline: string;
  url: string;
  author: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    academic: string;
    location: string;
    email: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  nav: Array<{
    title: string;
    href: string;
  }>;
  categories: Array<{
    name: string;
    slug: string;
    description: string;
    color: string;
  }>;
}

export const siteConfig: SiteConfig = {
  name: 'Chronicles & Code',
  title: 'Chronicles & Code — Technical Journal & Explorations',
  description: 'An editorial publication exploring computer science, systems programming, AI/ML, and the engineering craft.',
  tagline: 'Ideas, Experiments & Everything In Between',
  url: 'https://my-editorial-blog.vercel.app',
  author: {
    name: 'Alex Rivera', // Easily customizable placeholder
    role: 'Computer Science Scholar & Software Engineer',
    bio: 'Passionate about distributed systems, machine learning fundamentals, and writing clear, principled code. Documenting weekly discoveries and lessons learned.',
    avatar: '/images/avatar.svg',
    academic: 'B.Tech in Computer Science & Engineering',
    location: 'Bangalore, India',
    email: 'alex.rivera@example.com',
  },
  social: {
    github: 'https://github.com/example-user',
    linkedin: 'https://linkedin.com/in/example-user',
    twitter: 'https://x.com/example-user',
  },
  nav: [
    { title: 'Home', href: '/' },
    { title: 'All Blogs', href: '/blogs' },
    { title: 'Categories', href: '/categories' },
    { title: 'About', href: '/about' },
  ],
  categories: [
    {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'Foundations of modern AI, LLMs, attention mechanisms, and neural architectures.',
      color: 'terracotta',
    },
    {
      name: 'Programming',
      slug: 'programming',
      description: 'API design, software architecture patterns, type systems, and pragmatic code.',
      color: 'sage',
    },
    {
      name: 'Learning & Experiences',
      slug: 'learning-experiences',
      description: 'Weekly reflections, deep dives into new languages, and engineering retrospectives.',
      color: 'amberGold',
    },
    {
      name: 'Computer Science',
      slug: 'computer-science',
      description: 'Core data structures, algorithms, operating system internals, and theory.',
      color: 'charcoal',
    },
    {
      name: 'Projects & Experiments',
      slug: 'projects-experiments',
      description: 'Hands-on prototypes, side quests, performance benchmarks, and labs.',
      color: 'terracotta',
    },
  ],
};

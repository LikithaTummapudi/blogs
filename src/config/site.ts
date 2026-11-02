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
    email: string;
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
  title: 'Chronicles & Code — Likitha Tummapudi',
  description: 'An editorial publication exploring computer science, systems, machine learning, and personal engineering journeys by Likitha Tummapudi.',
  tagline: 'Ideas, Experiments & Everything In Between',
  url: 'https://my-editorial-blog.vercel.app',
  author: {
    name: 'Likitha Tummapudi',
    role: 'Computer Science Undergraduate & Software Developer',
    bio: 'Pursuing B.Tech in CSE at VIT-AP University (2024–2028, CGPA: 9.14). Passionate about software development, AI, machine learning, and quantum computing.',
    avatar: '/images/avatar.svg',
    academic: 'B.Tech in Computer Science and Engineering — VIT-AP University (2024–2028)',
    location: 'Andhra Pradesh, India',
    email: 'likitha.tummapudi1@gmail.com',
  },
  social: {
    github: 'https://github.com/LikithaTummapudi',
    linkedin: 'https://www.linkedin.com/in/likithatummapudi/',
    email: 'mailto:likitha.tummapudi1@gmail.com',
  },
  nav: [
    { title: 'Home', href: '/' },
    { title: 'All Blogs', href: '/blogs' },
    { title: 'Categories', href: '/categories' },
    { title: 'About', href: '/about' },
  ],
  categories: [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Emerging tech, modern software paradigms, and industry developments.',
      color: 'charcoal',
    },
    {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'Foundations of AI, neural networks, language models, and practical implementations.',
      color: 'terracotta',
    },
    {
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'Predictive modeling, data preprocessing, regression, classification, and benchmarks.',
      color: 'terracotta',
    },
    {
      name: 'Programming',
      slug: 'programming',
      description: 'Clean code, architecture patterns, object-oriented design, and languages.',
      color: 'sage',
    },
    {
      name: 'Computer Science',
      slug: 'computer-science',
      description: 'Data structures, algorithms, DBMS, operating systems, and core fundamentals.',
      color: 'charcoal',
    },
    {
      name: 'Learning & Experiences',
      slug: 'learning-experiences',
      description: 'Personal reflections, study roadmaps, academic insights, and growth milestones.',
      color: 'amberGold',
    },
    {
      name: 'Projects & Experiments',
      slug: 'projects-experiments',
      description: 'Hands-on applications, machine learning prototypes, and research explorations.',
      color: 'terracotta',
    },
  ],
};

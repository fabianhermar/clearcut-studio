import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPostMetadata {
  title: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  date: string;
  category: string;
  summary: string;
  image: string;
}

export interface BlogPost {
  slug: string;
  metadata: BlogPostMetadata;
  content: string;
  readingTime: number;
}

const contentDirectory = path.resolve(process.cwd(), 'content', 'blog');
const ALLOWED_LANGS = new Set(['es', 'en']);
const VALID_SLUG_REGEX = /^[a-z0-9-]+$/i;

// Calculate reading time based on 200 words per minute
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const trimmed = text.trim();
  if (!trimmed) return 1;
  const numberOfWords = trimmed.split(/\s+/g).length;
  return Math.max(1, Math.ceil(numberOfWords / wordsPerMinute));
}

export function getBlogPosts(lang: string): BlogPost[] {
  if (!ALLOWED_LANGS.has(lang)) {
    return [];
  }

  const langDirectory = path.resolve(contentDirectory, lang);
  if (!langDirectory.startsWith(contentDirectory + path.sep)) {
    return [];
  }
  
  if (!fs.existsSync(langDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(langDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.resolve(langDirectory, fileName);
      if (!fullPath.startsWith(langDirectory + path.sep)) {
        return null;
      }
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      return {
        slug,
        metadata: matterResult.data as BlogPostMetadata,
        content: matterResult.content,
        readingTime: calculateReadingTime(matterResult.content),
      };
    })
    .filter((post): post is BlogPost => post !== null);

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    if (new Date(a.metadata.date) < new Date(b.metadata.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getBlogPost(lang: string, slug: string): BlogPost | null {
  if (!ALLOWED_LANGS.has(lang) || !VALID_SLUG_REGEX.test(slug)) {
    return null;
  }

  const langDirectory = path.resolve(contentDirectory, lang);
  const fullPath = path.resolve(langDirectory, `${slug}.md`);

  if (!fullPath.startsWith(langDirectory + path.sep)) {
    return null;
  }
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    slug,
    metadata: matterResult.data as BlogPostMetadata,
    content: matterResult.content,
    readingTime: calculateReadingTime(matterResult.content),
  };
}

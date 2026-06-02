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

const contentDirectory = path.join(process.cwd(), 'content', 'blog');

// Calculate reading time based on 200 words per minute
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const numberOfWords = text.split(/\s/g).length;
  return Math.ceil(numberOfWords / wordsPerMinute);
}

export function getBlogPosts(lang: string): BlogPost[] {
  const langDirectory = path.join(contentDirectory, lang);
  
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
      const fullPath = path.join(langDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      return {
        slug,
        metadata: matterResult.data as BlogPostMetadata,
        content: matterResult.content,
        readingTime: calculateReadingTime(matterResult.content),
      };
    });

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
  const fullPath = path.join(contentDirectory, lang, `${slug}.md`);
  
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

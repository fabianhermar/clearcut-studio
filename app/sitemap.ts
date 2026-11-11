import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://studio.fabianh.me";
const LOCALES = ["es", "en"] as const;
const STATIC_ROUTES = [
  "",
  "/pricing",
  "/about",
  "/brand",
  "/privacy",
  "/terms",
  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LOCALES) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE_URL}/${lang}${route}`,
        lastModified: now,
        changeFrequency: route === "" || route === "/blog" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : route === "/blog" ? 0.8 : 0.7,
        alternates: {
          languages: {
            es: `${BASE_URL}/es${route}`,
            en: `${BASE_URL}/en${route}`,
          },
        },
      });
    }

    const posts = getBlogPosts(lang);
    for (const post of posts) {
      const postDate = post.metadata.date ? new Date(post.metadata.date) : now;
      entries.push({
        url: `${BASE_URL}/${lang}/blog/${post.slug}`,
        lastModified: isNaN(postDate.getTime()) ? now : postDate,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  }

  return entries;
}

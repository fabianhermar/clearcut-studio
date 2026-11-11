import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://studio.fabianh.me/sitemap.xml",
    host: "https://studio.fabianh.me",
  };
}

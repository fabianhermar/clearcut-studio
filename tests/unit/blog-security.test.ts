import { describe, it, expect } from "vitest";
import { getBlogPosts, getBlogPost } from "@/lib/blog";

describe("blog loader & path traversal security", () => {
  it("loads Spanish and English blog posts sorted by date descending", () => {
    const esPosts = getBlogPosts("es");
    const enPosts = getBlogPosts("en");

    expect(esPosts.length).toBeGreaterThan(0);
    expect(enPosts.length).toBeGreaterThan(0);

    for (const post of [...esPosts, ...enPosts]) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/i);
      expect(post.metadata.title.length).toBeGreaterThan(3);
      expect(post.readingTime).toBeGreaterThanOrEqual(1);
    }

    for (let i = 1; i < esPosts.length; i++) {
      expect(new Date(esPosts[i - 1].metadata.date).getTime()).toBeGreaterThanOrEqual(
        new Date(esPosts[i].metadata.date).getTime()
      );
    }
  });

  it("loads known articles by exact lang and slug", () => {
    const post = getBlogPost("es", "como-eliminar-fondos");
    expect(post).not.toBeNull();
    expect(post?.slug).toBe("como-eliminar-fondos");
    expect(post?.content.length).toBeGreaterThan(50);
  });

  it("blocks path traversal and invalid locale attacks (CWE-22)", () => {
    expect(getBlogPosts("../..")).toEqual([]);
    expect(getBlogPosts("es/../../")).toEqual([]);
    expect(getBlogPosts("fr")).toEqual([]);

    expect(getBlogPost("es", "../../README")).toBeNull();
    expect(getBlogPost("es", "../en/how-to-remove-backgrounds")).toBeNull();
    expect(getBlogPost("../..", "README")).toBeNull();
    expect(getBlogPost("es", "foo/bar")).toBeNull();
    expect(getBlogPost("es", "foo\\bar")).toBeNull();
    expect(getBlogPost("es", "como-eliminar-fondos\0")).toBeNull();
    expect(getBlogPost("es", "non-existent-slug-xyz")).toBeNull();
  });
});

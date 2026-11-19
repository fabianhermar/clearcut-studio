import { describe, it, expect } from "vitest";
import {
  STUDIO_TOOLS,
  UPCOMING_TOOLS,
  ALL_STUDIO_TOOLS,
  resolveToolSlug,
  getToolBySlug,
} from "@/lib/tools-catalog";

describe("tools-catalog", () => {
  it("contains 7 active production tools with unique slugs and complete ES/EN copy", () => {
    expect(STUDIO_TOOLS).toHaveLength(7);

    const slugs = new Set<string>();
    const aliases = new Set<string>();

    for (const tool of STUDIO_TOOLS) {
      expect(slugs.has(tool.slug)).toBe(false);
      slugs.add(tool.slug);

      for (const alias of tool.aliases) {
        expect(aliases.has(alias)).toBe(false);
        aliases.add(alias);
      }

      expect(tool.comingSoon).toBeFalsy();
      expect(tool.formats.length).toBeGreaterThan(0);
      expect(tool.es.name.length).toBeGreaterThan(2);
      expect(tool.es.shortName.length).toBeGreaterThan(2);
      expect(tool.es.description.length).toBeGreaterThan(10);
      expect(tool.en.name.length).toBeGreaterThan(2);
      expect(tool.en.shortName.length).toBeGreaterThan(2);
      expect(tool.en.description.length).toBeGreaterThan(10);
    }
  });

  it("marks all upcoming Studio Lab tools as comingSoon", () => {
    expect(UPCOMING_TOOLS.length).toBeGreaterThan(0);
    for (const tool of UPCOMING_TOOLS) {
      expect(tool.comingSoon).toBe(true);
    }
    expect(ALL_STUDIO_TOOLS.length).toBe(STUDIO_TOOLS.length + UPCOMING_TOOLS.length);
  });

  it("resolves valid tool slugs and aliases case-insensitively", () => {
    expect(resolveToolSlug("background-remover")).toBe("background-remover");
    expect(resolveToolSlug("  BG-REMOVER  ")).toBe("background-remover");
    expect(resolveToolSlug("optimizer")).toBe("image-optimizer");
    expect(resolveToolSlug("exif")).toBe("exif-stripper");
    expect(resolveToolSlug("gradient")).toBe("gradient-extractor");
    expect(resolveToolSlug("favicon")).toBe("favicon-generator");
    expect(resolveToolSlug("aspect-ratio")).toBe("aspect-ratio-fitter");
    expect(resolveToolSlug("ai-image-streamer")).toBe("ai-image-streamer");
    expect(resolveToolSlug("ai-studio")).toBe("ai-image-streamer");
  });

  it("returns null for null, empty, unknown, unimplemented, or malicious slugs", () => {
    expect(resolveToolSlug(null)).toBeNull();
    expect(resolveToolSlug("")).toBeNull();
    expect(resolveToolSlug("nonexistent-tool")).toBeNull();
    expect(resolveToolSlug("magic-eraser")).toBeNull();
    expect(resolveToolSlug("../../etc/passwd")).toBeNull();
    expect(resolveToolSlug("<script>alert(1)</script>")).toBeNull();
  });

  it("returns tool metadata via getToolBySlug with safe fallback", () => {
    expect(getToolBySlug("image-optimizer").slug).toBe("image-optimizer");
    expect(getToolBySlug("exif-stripper").slug).toBe("exif-stripper");
  });
});

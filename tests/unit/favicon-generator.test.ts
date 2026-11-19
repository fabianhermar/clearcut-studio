import { describe, it, expect } from "vitest";
import {
  normalizePublicPath,
  resolveAssetUrl,
  encodePngsToIco,
  buildWebManifest,
  buildHtmlHeadCode,
  buildNextjsMetadataCode,
  buildBrowserConfigXml,
} from "@/components/favicon-generator/generator";
import { DEFAULT_FAVICON_SETTINGS } from "@/components/favicon-generator/types";

describe("favicon-generator engine", () => {
  it("normalizes custom public paths cleanly without double slashes", () => {
    expect(normalizePublicPath("")).toBe("/");
    expect(normalizePublicPath("/")).toBe("/");
    expect(normalizePublicPath("favicon")).toBe("/favicon/");
    expect(normalizePublicPath("/assets/icons")).toBe("/assets/icons/");
    expect(normalizePublicPath("///static//icons///")).toBe("/static/icons/");
    expect(normalizePublicPath("https://cdn.example.com/icons")).toBe(
      "https://cdn.example.com/icons/"
    );

    expect(resolveAssetUrl("/favicon/", "favicon.ico")).toBe("/favicon/favicon.ico");
    expect(resolveAssetUrl("/", "site.webmanifest")).toBe("/site.webmanifest");
  });

  it("encodes valid multi-resolution binary .ICO headers and PNG payloads", () => {
    const fake16 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2]);
    const fake32 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 3, 4, 5, 6]);
    const ico = encodePngsToIco([
      { size: 16, pngBytes: fake16 },
      { size: 32, pngBytes: fake32 },
    ]);

    const view = new DataView(ico.buffer);
    // ICONDIR header
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type = ICO
    expect(view.getUint16(4, true)).toBe(2); // 2 images

    // First entry (16x16)
    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(7)).toBe(16);
    expect(view.getUint32(14, true)).toBe(fake16.byteLength);
    expect(view.getUint32(18, true)).toBe(6 + 2 * 16);

    // Second entry (32x32)
    expect(view.getUint8(22)).toBe(32);
    expect(view.getUint8(23)).toBe(32);
    expect(view.getUint32(30, true)).toBe(fake32.byteLength);
    expect(view.getUint32(34, true)).toBe(6 + 2 * 16 + fake16.byteLength);
  });

  it("builds a valid W3C site.webmanifest with custom path and maskable icon", () => {
    const manifest = buildWebManifest({
      ...DEFAULT_FAVICON_SETTINGS,
      appName: "ClearCut App",
      shortName: "ClearCut",
      path: "/assets/favicons",
      themeColor: "#1e40ff",
      manifestBackgroundColor: "#0c0e12",
      display: "standalone",
      startUrl: "/app",
    });

    expect(manifest.name).toBe("ClearCut App");
    expect(manifest.short_name).toBe("ClearCut");
    expect(manifest.start_url).toBe("/app");
    expect(manifest.theme_color).toBe("#1e40ff");
    expect(manifest.background_color).toBe("#0c0e12");
    expect(manifest.icons).toHaveLength(3);
    expect(manifest.icons[0].src).toBe("/assets/favicons/web-app-manifest-192x192.png");
    expect(manifest.icons[2].purpose).toBe("maskable");
  });

  it("generates escaped HTML <head>, Next.js metadata, and browserconfig.xml", () => {
    const settings = {
      ...DEFAULT_FAVICON_SETTINGS,
      appName: 'App "Test" <script>',
      shortName: 'Short "App"',
      path: "/static/ico/",
      includeWindowsTile: true,
    };

    const html = buildHtmlHeadCode(settings, true);
    expect(html).toContain('href="/static/ico/favicon.ico"');
    expect(html).toContain('href="/static/ico/favicon-dark-32x32.png"');
    expect(html).toContain('media="(prefers-color-scheme: dark)"');
    expect(html).toContain('href="/static/ico/apple-touch-icon.png"');
    expect(html).toContain('href="/static/ico/site.webmanifest"');
    expect(html).toContain('content="Short &quot;App&quot;"');
    expect(html).not.toContain("<script>");

    const nextjs = buildNextjsMetadataCode(settings, true);
    expect(nextjs).toContain('manifest: "/static/ico/site.webmanifest"');
    expect(nextjs).toContain("apple-touch-icon.png");

    const xml = buildBrowserConfigXml(settings);
    expect(xml).toContain('src="/static/ico/mstile-150x150.png"');
  });
});

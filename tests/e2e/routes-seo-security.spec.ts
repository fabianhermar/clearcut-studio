import { test, expect } from "@playwright/test";

test.describe("Routes, Blog, SEO & Security Headers", () => {
  test("renders corporate and legal pages cleanly with a single <main> landmark", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const routes = [
      "/es/pricing",
      "/es/about",
      "/es/brand",
      "/es/privacy",
      "/es/terms",
      "/en/pricing",
      "/en/about",
      "/en/brand",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Expected 200 on ${route}`).toBe(200);
      await expect(page.locator("main")).toHaveCount(1);
    }

    await page.goto("/es/pricing");
    await expect(page.locator("#pricing")).toContainText("PLAN 01 // ESTUDIO LOCAL");
    await expect(page.locator("#pricing")).toContainText(
      "Transparencia Técnica y Procesamiento Futuro"
    );
    await expect(page.locator("#pricing")).not.toContainText("☕");

    expect(pageErrors).toEqual([]);
  });

  test("renders Blog index and articles in ES and EN cleanly", async ({ page }) => {
    const blogRoutes = [
      "/es/blog",
      "/es/blog/como-eliminar-fondos",
      "/es/blog/optimizacion-avanzada",
      "/en/blog",
      "/en/blog/how-to-remove-backgrounds",
    ];

    for (const route of blogRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), `Expected 200 on ${route}`).toBe(200);
      await expect(page.locator("main")).toHaveCount(1);
    }
  });

  test("enforces hardened HTTP security headers and hides X-Powered-By", async ({
    request,
  }) => {
    const res = await request.get("/es");
    expect(res.status()).toBe(200);

    const headers = res.headers();
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["cross-origin-embedder-policy"]).toBe("require-corp");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("geolocation=()");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("blocks path traversal probes on dynamic blog routes", async ({ request }) => {
    const probes = [
      "/es/blog/..%2F..%2FREADME",
      "/es/blog/..%2F..%2FLICENSE",
      "/es/blog/non-existent-article-404",
    ];

    for (const probe of probes) {
      const res = await request.get(probe);
      expect(res.status(), `Expected 404 for ${probe}`).toBe(404);
    }
  });

  test("serves valid robots.txt and sitemap.xml", async ({ request }) => {
    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    expect(await robotsRes.text()).toContain("Sitemap: https://studio.fabianh.me/sitemap.xml");

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    expect(await sitemapRes.text()).toContain("https://studio.fabianh.me/es");
  });
});

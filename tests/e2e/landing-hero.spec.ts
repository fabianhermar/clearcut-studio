import { test, expect } from "@playwright/test";

test.describe("Landing Page & Optical Bench Hero", () => {
  test("renders Spanish landing page cleanly with zero uncaught errors and valid Header/Catalog", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/es");
    await expect(page).toHaveTitle(/ClearCut Studio/i);

    // Header brand hygiene
    const header = page.locator("header").first();
    await expect(header).not.toContainText("Local-First Web Studio");
    await expect(header).toContainText("Precios");

    // Optical Bench accessible slider supports keyboard inspection
    const slider = page.getByRole("slider").first();
    await expect(slider).toBeVisible();
    await slider.focus();
    await page.keyboard.press("ArrowRight");

    // Tools Catalog shows both active and upcoming Studio Lab tools
    const toolsSection = page.locator("#tools");
    await expect(toolsSection).toBeVisible();
    await expect(toolsSection).toContainText("Framed");
    await expect(toolsSection).toContainText("Próximamente");

    expect(pageErrors, `Unexpected uncaught page errors: ${pageErrors.join("; ")}`).toEqual([]);
  });

  test("switches all 6 interactive Hero lenses via tabs and keyboard shortcuts 1-6", async ({
    page,
  }) => {
    await page.goto("/es");

    // Lens 01 default + Peel All + Split toggle
    await expect(page.getByText("LENS 01 // ALPHA // NEURAL CUTOUT")).toBeVisible();
    await page.getByRole("button", { name: /SPLIT/i }).click();
    await page.getByRole("button", { name: /REVELAR TODO/i }).click();
    await expect(page.getByRole("button", { name: /VER ORIGINAL/i })).toBeVisible();

    // Switch via keyboard keys 2..6
    await page.keyboard.press("2");
    await expect(page.getByText("LENS 02 // WASM // LIBAVIF 2× LOUPE")).toBeVisible();
    await page.getByRole("button", { name: /Q55 · ULTRA/i }).click();
    await expect(page.getByText("AVIF · 198 KB (-92%)")).toBeVisible();

    await page.keyboard.press("3");
    await expect(page.getByText("LENS 03 // EXIF // PRIVACY X-RAY")).toBeVisible();
    await expect(page.getByText("4 FUGAS EXIF")).toBeVisible();

    await page.keyboard.press("4");
    await expect(page.getByText("LENS 04 // FRAME // NO-CROP FITTER")).toBeVisible();
    await page.getByRole("button", { name: "16:9", exact: true }).click();
    await expect(page.getByText("RATIO 16:9 · 1920 × 1080 PX")).toBeVisible();

    await page.keyboard.press("5");
    await expect(page.getByText("LENS 05 // CHROMA // LIVE COLORIMETER")).toBeVisible();
    await expect(page.getByRole("button", { name: /COPIAR CSS/i })).toBeVisible();

    await page.keyboard.press("6");
    await expect(page.getByText("LENS 06 // PWA // MULTI-SURFACE ICONS")).toBeVisible();
    await page.getByRole("button", { name: /DARK TAB/i }).click();
    await expect(page.getByRole("button", { name: /LIGHT TAB/i })).toBeVisible();
  });

  test("renders English landing page cleanly with localized Hero copy", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("header").first()).toContainText("Pricing");
    await expect(page.getByText("CLEARCUT // LOCAL OPTICAL BENCH")).toBeVisible();
    await expect(page.getByText("06 // LENS SELECTOR")).toBeVisible();
  });

  test("supports mobile viewport (390px) cleanly with zero horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/es");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    // Open and close mobile menu drawer
    const menuButton = page.getByRole("button", { name: "Abrir menú" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole("button", { name: "Cerrar menú" })).toBeVisible();
  });
});

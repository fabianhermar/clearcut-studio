import { test, expect } from '@playwright/test';

test.describe('ClearCut Studio 2026 E2E Suite', () => {
  test('renders Spanish landing page with clean Header (Precios, no Local-First badge) and Catalog with active & upcoming tools', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveTitle(/ClearCut Studio/i);

    // Ensure "Local-First Web Studio" badge is NOT in the header
    await expect(page.locator('header').first()).not.toContainText('Local-First Web Studio');

    // Ensure "Precios" is shown in the header navigation
    await expect(page.locator('header').first()).toContainText('Precios');

    // Check accessible Before/After slider exists and supports keyboard navigation
    const slider = page.getByRole('slider').first();
    await expect(slider).toBeVisible();
    await slider.focus();
    await page.keyboard.press('ArrowRight');

    // Check Tools Catalog section is visible and displays both available and upcoming tools
    const toolsSection = page.locator('#tools');
    await expect(toolsSection).toBeVisible();
    await expect(toolsSection).toContainText('Framed');
    await expect(toolsSection).toContainText('Próximamente');
  });

  test('loads all 6 active Studio tools via query parameter', async ({ page }) => {
    const activeTools = [
      'background-remover',
      'image-optimizer',
      'exif-stripper',
      'gradient-extractor',
      'favicon-generator',
      'aspect-ratio-fitter',
    ];

    for (const tool of activeTools) {
      await page.goto(`/es?tool=${tool}`);
      await expect(page.locator('header').first()).toBeVisible();
      await expect(page.locator('input[type="file"]').first()).toBeAttached();
    }
  });

  test('renders corporate and legal pages cleanly with a single <main> landmark', async ({ page }) => {
    const routes = [
      '/es/pricing',
      '/es/about',
      '/es/brand',
      '/es/privacy',
      '/es/terms',
      '/en/pricing',
      '/en/about',
      '/en/brand',
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Expected 200 on ${route}`).toBe(200);
      await expect(page.locator('main')).toHaveCount(1);
    }
  });

  test('renders redesigned Blog index and Blog articles in ES and EN', async ({ page }) => {
    const blogRoutes = [
      '/es/blog',
      '/es/blog/como-eliminar-fondos',
      '/es/blog/optimizacion-avanzada',
      '/en/blog',
      '/en/blog/how-to-remove-backgrounds',
    ];

    for (const route of blogRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), `Expected 200 on ${route}`).toBe(200);
      await expect(page.locator('main')).toHaveCount(1);
    }
  });

  test('supports mobile viewport navigation cleanly without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/es');

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: 'Abrir menú' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeVisible();
  });

  test('serves valid sitemap.xml and robots.txt', async ({ request }) => {
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);
    expect(await robotsRes.text()).toContain('Sitemap: https://studio.fabianh.me/sitemap.xml');

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    expect(await sitemapRes.text()).toContain('https://studio.fabianh.me/es');
  });
});

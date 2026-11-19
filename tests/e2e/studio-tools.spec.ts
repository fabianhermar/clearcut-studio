import { test, expect } from "@playwright/test";

test.describe("Studio Tools E2E Workflows", () => {
  test("loads all 6 active Studio tools via query parameter with file input ready", async ({
    page,
  }) => {
    const activeTools = [
      "background-remover",
      "image-optimizer",
      "exif-stripper",
      "gradient-extractor",
      "favicon-generator",
      "aspect-ratio-fitter",
    ];

    for (const tool of activeTools) {
      await page.goto(`/es?tool=${tool}`);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator('input[type="file"]').first()).toBeAttached();
    }
  });

  test("launches Image Optimizer directly from the Hero when uploading a local file on Lens 02", async ({
    page,
  }) => {
    await page.goto("/es");
    await page.getByRole("tab", { name: /Optimizar Imagen/i }).click();

    const heroFileInput = page.locator('main input[type="file"]').first();
    await heroFileInput.setInputFiles("public/demos/cat.jpg");

    await expect(page.getByText("CÓDEC DE SALIDA")).toBeVisible();
    await expect(page.getByText("TELEMETRÍA DE ARCHIVO")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Descargar/i }).first()
    ).toBeEnabled({ timeout: 20000 });
  });

  test("opens Darkroom post-processing editor workspace in image-optimizer when loading a local file", async ({
    page,
  }) => {
    await page.goto("/es?tool=image-optimizer");
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("public/demos/cat.jpg");

    await expect(page.getByText("CÓDEC DE SALIDA")).toBeVisible();
    await expect(page.getByText("TELEMETRÍA DE ARCHIVO")).toBeVisible();
    await expect(
      page.getByRole("slider", { name: /Comparar imagen optimizada y original/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Descargar/i }).first()
    ).toBeEnabled({ timeout: 20000 });
  });

  test("loads a real photo in EXIF Stripper, Aspect Ratio Fitter, Gradient Extractor, and Favicon Generator", async ({
    page,
  }) => {
    // 1. EXIF Stripper — verify Forensic Studio, tabs, JSON report & filename anonymizer
    await page.goto("/es?tool=exif-stripper");
    await page.locator('input[type="file"]').first().setInputFiles("public/demos/car.jpg");
    await expect(page.getByText(/VERIFICADO \/\/ 0 METADATOS EXIF/i)).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("tab", { name: /Informe Técnico/i }).click();
    await expect(page.locator("pre")).toContainText('"verified_clean_output": true');
    await page.getByRole("tab", { name: /Exportar/i }).click();
    await expect(page.getByText(/Anonimizar nombre de archivo/i)).toBeVisible();

    // 2. Aspect Ratio Fitter — test 3D perspective, free custom ratio, 4-color Mesh gradient & new frames
    await page.goto("/es?tool=aspect-ratio-fitter");
    await page.locator('input[type="file"]').first().setInputFiles("public/demos/coffee.jpg");
    await expect(page.getByRole("button", { name: /Descargar|Exportar/i }).first()).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: /LIBRE/i }).click();
    await expect(page.getByText(/PROPORCIÓN LIBRE/i)).toBeVisible();
    await page.getByRole("button", { name: "135%", exact: true }).click();
    await page.getByRole("button", { name: /3D Izq/i }).click();
    await page.getByRole("tab", { name: /Fondo/i }).click();
    await page.getByRole("button", { name: /Degradado/i }).click();
    await page.getByRole("button", { name: "Mesh", exact: true }).click();
    await page.getByRole("button", { name: /Añadir color/i }).click();
    await page.getByRole("button", { name: /Añadir color/i }).click();
    await expect(page.getByText("COLORES (4/4)")).toBeVisible();
    await expect(page.getByRole("button", { name: /Añadir color/i })).toBeDisabled();
    await page.getByRole("tab", { name: /Marcos/i }).click();
    await page.getByRole("button", { name: /Editorial Suizo/i }).click();

    // 3. Gradient Extractor — verify modes (Linear, Mesh), UI Card context, and live Code Studio
    await page.goto("/es?tool=gradient-extractor");
    await page.locator('input[type="file"]').first().setInputFiles("public/demos/shoes.jpg");
    await expect(page.getByText(/linear-gradient/i).first()).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: /Mesh Orgánico/i }).click();
    await expect(page.getByText(/mesh-gradient/i).first()).toBeVisible();
    await page.getByRole("button", { name: /TARJETA UI/i }).click();
    await expect(page.getByText("Vista previa en tarjeta UI")).toBeVisible();
    await page.getByRole("tab", { name: /Código CSS/i }).click();
    await page.getByRole("button", { name: /Tailwind v4/i }).click();
    await expect(page.locator("pre")).toContainText("--color-chroma-1:");

    // 4. Favicon Generator — full interactive previews, custom path, live <head> & ZIP generation
    await page.goto("/es?tool=favicon-generator");
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles("public/favicon/favicon-96x96.png");
    await expect(page.getByText("iPhone · iOS Home Screen")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Android Adaptive & PWA")).toBeVisible();

    // Customize public path and verify live <head> metadata updates
    await page.getByRole("tab", { name: /Rutas/i }).click();
    await page.getByLabel(/Ruta pública/i).fill("/assets/icons/");
    await page.getByRole("tab", { name: /Código <head>/i }).click();
    await expect(page.locator("pre")).toContainText("/assets/icons/favicon.ico");
    await expect(page.locator("pre")).toContainText("/assets/icons/site.webmanifest");

    // Generate ZIP bundle and verify modal opens with generated file list
    await page.getByRole("button", { name: /Generar \.ZIP/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /Descargar favicons\.zip/i })).toBeVisible();
  });

  test("opens AI Streaming Studio (ai-image-streamer), navigates sidebar modules, resizes demo batch, and opens Google Drive connect dialog", async ({
    page,
  }) => {
    await page.goto("/es?tool=ai-image-streamer");
    await expect(page.getByText(/BYOK \/\/ STREAMING AI/i)).toBeVisible();
    await expect(page.getByText(/Genera Lotes de Imágenes en Streaming/i)).toBeVisible();

    // Open grouped Model Selector and verify provider/family sections
    await page.getByRole("button", { name: /Nano Banana 2/i }).click();
    await expect(page.getByText(/01 \/\/ Google · Nano Banana/i)).toBeVisible();
    await expect(page.getByText(/OpenAI · GPT Image/i)).toBeVisible();
    await expect(page.getByText(/Black Forest Labs · FLUX/i)).toBeVisible();
    await expect(page.getByText(/ByteDance · Seedream/i)).toBeVisible();
    await expect(page.getByText(/Midjourney · Custom API/i)).toBeVisible();
    await page.keyboard.press("Escape");

    // Switch to Session Library and load the 4 demo assets
    await page.getByRole("button", { name: /Sesión Local/i }).first().click();
    await page.getByRole("button", { name: /Cargar Lote Demo \(4\)/i }).click();
    await expect(page.getByText("Editorial feline portrait sample")).toBeVisible({ timeout: 15000 });

    // Select all and verify batch download / Drive dock appears
    await page.getByRole("button", { name: /Seleccionar todo \(4\)/i }).click();
    await expect(page.getByText(/4 seleccionados/i)).toBeVisible();

    // Try saving batch to Drive without Google account -> opens Google Drive connection modal
    await page.getByRole("button", { name: /Guardar en Drive/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Conecta tu cuenta de Google/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancelar/i }).click();

    // Navigate to Resize Images and process a batch resize
    await page.getByRole("button", { name: /Redimensionar/i }).first().click();
    await expect(page.getByText(/Selecciona Imágenes a Redimensionar/i)).toBeVisible();
    await page.getByRole("button", { name: /Redimensionar \d+ Im/i }).click();
    await expect(page.getByText(/Resultados Listos para Descargar/i)).toBeVisible({ timeout: 15000 });

    // Navigate to Edit Image, Edit Video, Video IA, Audio IA, and API Keys Vault
    await page.getByRole("button", { name: /Editar Imagen/i }).first().click();
    await expect(page.getByText(/Laboratorio Óptico \(Local\)/i)).toBeVisible();

    await page.getByRole("button", { name: /Editar Video/i }).first().click();
    await expect(page.getByText(/Editor de Video y Extractor de Fotogramas/i)).toBeVisible();

    await page.getByRole("button", { name: /Video IA/i }).first().click();
    await expect(page.getByText(/Generador de Video con IA/i)).toBeVisible();

    await page.getByRole("button", { name: /Audio & Voz IA/i }).first().click();
    await expect(page.getByText(/Estudio de Audio, Voz y Efectos IA/i)).toBeVisible();

    await page.getByRole("button", { name: /Bóveda API Keys/i }).first().click();
    await expect(page.getByText(/Crea tu Contraseña Maestra de la Bóveda/i)).toBeVisible();

    // Create Master Password and initialize AES-256 encrypted vault
    await page.locator("#vault-master-password").fill("ClearCut#Vault2026");
    await page.locator("#vault-confirm-password").fill("ClearCut#Vault2026");
    await page.getByRole("button", { name: /Crear Bóveda Cifrada \(AES-256\)/i }).click();

    await expect(page.getByText(/Bóveda Cifrada de API Keys y Proveedores IA/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Google AI Studio (Gemini)")).toBeVisible();
    await expect(page.getByText("OpenAI (ChatGPT)")).toBeVisible();
    await expect(page.getByText("xAI Grok")).toBeVisible();
    await expect(page.getByText("Black Forest Labs (Flux)")).toBeVisible();

    // Encrypt a Gemini key and verify localStorage holds ZERO plaintext
    const testSecret = "AIzaSyTestEncryptedKey9988";
    await page.locator("#key-gemini").fill(testSecret);
    await page.getByRole("button", { name: /Cifrar/i }).first().click();
    await expect(page.getByText(/••••••••••••••••9988/)).toBeVisible({ timeout: 10000 });

    const rawStorage = await page.evaluate(() =>
      (window.localStorage.getItem("clearcut_ai_vault_encrypted_v2") || "") +
      (window.localStorage.getItem("clearcut_ai_vault_runtime_v2") || "")
    );
    expect(rawStorage).toContain("AES-GCM-256");
    expect(rawStorage).not.toContain(testSecret);

    // Attempting to reveal saved key must prompt for Master Password permission
    await page.getByTitle(/Ver llave/i).first().click();
    await expect(page.getByText(/PERMISO DE SEGURIDAD/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancelar/i }).click();

    // Lock the Vault and verify saved Gemini key STILL works in Imágenes por Lotes without unlocking!
    await page.getByRole("button", { name: /Bloquear Bóveda/i }).click();
    await expect(page.getByText(/Desbloquea tu Bóveda de API Keys/i)).toBeVisible();
    await page.getByRole("button", { name: /Imágenes por Lotes/i }).first().click();
    await expect(page.getByText(/1\/8 Activas · Protegida/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Añadir Key de Gemini/i })).toHaveCount(0);

    // Sidebar Google Drive card remains anchored in viewport (independent of main scroll)
    const sidebarDriveCard = page.locator("aside").getByText("GOOGLE DRIVE", { exact: true });
    await expect(sidebarDriveCard).toBeInViewport();
  });
});

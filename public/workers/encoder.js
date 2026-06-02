/**
 * Image Encoder Web Worker
 *
 * This file lives in /public/workers/ and is served as a STATIC file.
 * It is NOT processed by Next.js / Turbopack — it runs natively in the browser.
 *
 * Architecture (same as Squoosh):
 *   Main thread → postMessage({ id, format, pixelData, width, height, quality })
 *   Worker → loads WASM encoder from /public/wasm/ on first use
 *   Worker → encodes image → postMessage({ id, success, buffer, mimeType })
 */

// ─── Encoder module cache ─────────────────────────────────────────────────────
const moduleCache = {};

async function loadModule(wasmJsPath) {
  if (moduleCache[wasmJsPath]) return moduleCache[wasmJsPath];

  const { default: factory } = await import(wasmJsPath);
  // factory() returns a promise that resolves to the Emscripten module instance
  const mod = await factory({ noInitialRun: true });
  moduleCache[wasmJsPath] = mod;
  return mod;
}

// ─── AVIF (libavif) ──────────────────────────────────────────────────────────
// quality: 0–100 (100 = best/largest, 0 = worst/smallest)
async function encodeAvif(pixelData, width, height, quality) {
  const mod = await loadModule('/wasm/avif_enc.js');

  const options = {
    quality:       Math.max(0, Math.min(100, quality)),
    qualityAlpha:  -1,   // -1 = same as quality
    denoiseLevel:  0,
    tileColsLog2:  0,
    tileRowsLog2:  0,
    speed:         8,    // 0 slowest/best, 10 fastest — 8 is fast with good results
    subsample:     1,    // YUV 4:2:0
    chromaDeltaQ:  false,
    sharpness:     0,
    tune:          0,
    enableSharpYUV: false,
    bitDepth:      8,
    lossless:      false,
  };

  const result = mod.encode(pixelData, width, height, options);
  if (!result) throw new Error('AVIF encoding returned null');
  return { buffer: result.buffer, mimeType: 'image/avif' };
}

// ─── WebP (libwebp) ───────────────────────────────────────────────────────────
// quality: 0–100
async function encodeWebP(pixelData, width, height, quality) {
  const mod = await loadModule('/wasm/webp_enc.js');

  const options = {
    quality:            Math.max(0, Math.min(100, quality)),
    target_size:        0,
    target_PSNR:        0,
    method:             4,     // compression effort 0–6
    sns_strength:       50,
    filter_strength:    60,
    filter_sharpness:   0,
    filter_type:        1,
    partitions:         0,
    segments:           4,
    pass:               1,
    show_compressed:    0,
    preprocessing:      0,
    autofilter:         0,
    partition_limit:    0,
    alpha_compression:  1,
    alpha_filtering:    1,
    alpha_quality:      100,
    lossless:           0,
    exact:              0,
    image_hint:         0,
    emulate_jpeg_size:  0,
    thread_level:       0,
    low_memory:         0,
    near_lossless:      100,
    use_delta_palette:  0,
    use_sharp_yuv:      0,
  };

  const result = mod.encode(pixelData, width, height, options);
  if (!result) throw new Error('WebP encoding returned null');
  return { buffer: result.buffer, mimeType: 'image/webp' };
}

// ─── JPEG (MozJPEG) ───────────────────────────────────────────────────────────
// quality: 0–100
async function encodeMozJpeg(pixelData, width, height, quality) {
  const mod = await loadModule('/wasm/mozjpeg_enc.js');

  const options = {
    quality:                  Math.max(0, Math.min(100, quality)),
    baseline:                 false,
    arithmetic:               false,
    progressive:              true,
    optimize_coding:          true,
    smoothing:                0,
    color_space:              3,    // YCbCr
    quant_table:              3,    // JPEG Annex K
    trellis_multipass:        false,
    trellis_opt_zero:         false,
    trellis_opt_table:        false,
    trellis_loops:            1,
    auto_subsample:           true,
    chroma_subsample:         2,
    separate_chroma_quality:  false,
    chroma_quality:           Math.max(0, Math.min(100, quality)),
  };

  const result = mod.encode(pixelData, width, height, options);
  if (!result) throw new Error('JPEG encoding returned null');
  return { buffer: result.buffer, mimeType: 'image/jpeg' };
}

// ─── Message handler ─────────────────────────────────────────────────────────
self.onmessage = async (e) => {
  const { id, format, pixelData, width, height, quality } = e.data;

  try {
    const pixels = new Uint8Array(pixelData); // reconstruct from transferred buffer
    let result;

    switch (format) {
      case 'avif':
        result = await encodeAvif(pixels, width, height, quality);
        break;
      case 'webp':
        result = await encodeWebP(pixels, width, height, quality);
        break;
      case 'jpeg':
        result = await encodeMozJpeg(pixels, width, height, quality);
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }

    // Transfer buffer back (zero-copy)
    self.postMessage({ id, success: true, buffer: result.buffer, mimeType: result.mimeType }, [result.buffer]);

  } catch (err) {
    self.postMessage({ id, success: false, error: err.message || String(err) });
  }
};

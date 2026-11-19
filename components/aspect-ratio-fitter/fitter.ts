import { AspectRatioSettings, AspectRatioType } from "./types";

export const PRESET_RATIOS: Record<Exclude<AspectRatioType, "original" | "custom">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
  "16:9": 16 / 9,
  "3:2": 3 / 2,
  "4:3": 4 / 3,
  "21:9": 21 / 9,
  "2:3": 2 / 3,
};

/**
 * Pure helper to resolve the numeric target aspect ratio (width / height) or null for "original".
 */
export function resolveTargetRatio(
  ratio: AspectRatioType,
  customWidth: number,
  customHeight: number
): number | null {
  if (ratio === "original") return null;
  if (ratio === "custom") {
    const w = Math.max(1, Number(customWidth) || 1);
    const h = Math.max(1, Number(customHeight) || 1);
    return w / h;
  }
  return PRESET_RATIOS[ratio] ?? null;
}

/**
 * Pure helper to compute bounded target canvas dimensions for a source image and ratio.
 */
export function calculateCanvasDimensions(
  srcWidth: number,
  srcHeight: number,
  ratio: AspectRatioType,
  customWidth: number,
  customHeight: number,
  maxDim = 2400
): { width: number; height: number } {
  const safeW = Math.max(1, srcWidth);
  const safeH = Math.max(1, srcHeight);
  let targetWidth = safeW;
  let targetHeight = safeH;

  const targetRatio = resolveTargetRatio(ratio, customWidth, customHeight);

  if (targetRatio !== null) {
    const imgRatio = safeW / safeH;
    if (imgRatio > targetRatio) {
      targetWidth = safeW;
      targetHeight = safeW / targetRatio;
    } else {
      targetHeight = safeH;
      targetWidth = safeH * targetRatio;
    }
  }

  if (targetWidth > maxDim || targetHeight > maxDim) {
    const s = Math.min(maxDim / targetWidth, maxDim / targetHeight);
    targetWidth *= s;
    targetHeight *= s;
  }

  return {
    width: Math.max(1, Math.round(targetWidth)),
    height: Math.max(1, Math.round(targetHeight)),
  };
}

/**
 * Pure helper to clamp and normalize gradient colors (min 2, max 4).
 */
export function normalizeGradientColors(colors: string[]): string[] {
  const valid = colors.filter((c) => typeof c === "string" && c.trim().length > 0).slice(0, 4);
  if (valid.length === 0) return ["#1e40ff", "#0c0e12"];
  if (valid.length === 1) return [valid[0], "#0c0e12"];
  return valid;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  overscan = 1
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasW / canvasH;
  let drawW = canvasW * overscan;
  let drawH = canvasH * overscan;

  if (canvasRatio > imgRatio) {
    drawH = drawW / imgRatio;
  } else {
    drawW = drawH * imgRatio;
  }

  const dx = (canvasW - drawW) / 2;
  const dy = (canvasH - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

/**
 * Renders a 2-to-4 color gradient backdrop in Linear, Radial, Conic, or Organic Mesh mode.
 */
function renderGradientBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: AspectRatioSettings
) {
  const colors = normalizeGradientColors(settings.gradientColors);
  const mode = settings.gradientMode;

  if (mode === "mesh") {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, w, h);
    const anchors = [
      [0.16, 0.2],
      [0.85, 0.18],
      [0.8, 0.84],
      [0.18, 0.82],
    ];
    colors.forEach((hex, idx) => {
      const [ax, ay] = anchors[idx % anchors.length];
      const cx = w * ax;
      const cy = h * ay;
      const radius = Math.max(w, h) * 0.68;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, hex);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
    return;
  }

  if (mode === "radial") {
    const grad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      0,
      w * 0.5,
      h * 0.45,
      Math.max(w, h) * 0.72
    );
    const denom = Math.max(1, colors.length - 1);
    colors.forEach((c, idx) => grad.addColorStop(idx / denom, c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (mode === "conic" && typeof ctx.createConicGradient === "function") {
    const grad = ctx.createConicGradient(
      ((settings.gradientAngle - 90) * Math.PI) / 180,
      w / 2,
      h / 2
    );
    const denom = colors.length;
    colors.forEach((c, idx) => grad.addColorStop(idx / denom, c));
    grad.addColorStop(1, colors[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Default: Linear
  const rad = ((settings.gradientAngle - 90) * Math.PI) / 180;
  const diag = Math.sqrt(w * w + h * h) / 2;
  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createLinearGradient(
    cx - Math.cos(rad) * diag,
    cy - Math.sin(rad) * diag,
    cx + Math.cos(rad) * diag,
    cy + Math.sin(rad) * diag
  );
  const denom = Math.max(1, colors.length - 1);
  colors.forEach((c, idx) => grad.addColorStop(idx / denom, c));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Projects a 2D foreground canvas onto a transparent output canvas with true 3D perspective
 * (rotateX, rotateY, rotateZ, offsetZ) using a lightweight WebGL quad shader.
 * Returns null if WebGL is unavailable so caller falls back cleanly to Canvas 2D.
 */
function renderWebGL3DQuad(
  sourceCanvas: HTMLCanvasElement,
  outW: number,
  outH: number,
  centerX: number,
  centerY: number,
  cardW: number,
  cardH: number,
  rotateXDeg: number,
  rotateYDeg: number,
  rotateZDeg: number,
  offsetZ: number
): HTMLCanvasElement | null {
  try {
    const glCanvas = document.createElement("canvas");
    glCanvas.width = outW;
    glCanvas.height = outH;
    const gl = glCanvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    if (!gl) return null;

    const vsSrc = `
      attribute vec2 aPos;
      attribute vec2 aUv;
      uniform mat4 uMvp;
      varying vec2 vUv;
      void main() {
        vUv = aUv;
        gl_Position = uMvp * vec4(aPos, 0.0, 1.0);
      }
    `;
    const fsSrc = `
      precision mediump float;
      uniform sampler2D uTex;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(uTex, vUv);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    if (!prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    const hw = cardW / 2;
    const hh = cardH / 2;
    // Quad vertices in pixel space centered at (0, 0), Y-up
    const verts = new Float32Array([
      -hw, -hh, 0, 1,
       hw, -hh, 1, 1,
      -hw,  hh, 0, 0,
       hw,  hh, 1, 0,
    ]);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "aPos");
    const aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);

    // Build column-major 4x4 MVP matrix
    const rx = (rotateXDeg * Math.PI) / 180;
    const ry = (rotateYDeg * Math.PI) / 180;
    const rz = (-rotateZDeg * Math.PI) / 180;

    const mul = (a: number[], b: number[]) => {
      const r = new Array(16).fill(0);
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          r[col * 4 + row] =
            a[0 * 4 + row] * b[col * 4 + 0] +
            a[1 * 4 + row] * b[col * 4 + 1] +
            a[2 * 4 + row] * b[col * 4 + 2] +
            a[3 * 4 + row] * b[col * 4 + 3];
        }
      }
      return r;
    };

    const cx = Math.cos(rx), sx = Math.sin(rx);
    const cy = Math.cos(ry), sy = Math.sin(ry);
    const cz = Math.cos(rz), sz = Math.sin(rz);

    const matRx = [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1];
    const matRy = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1];
    const matRz = [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    const focal = Math.max(outW, outH) * 1.45;
    const zShift = (offsetZ / 100) * focal * 0.72;
    const tx = centerX - outW / 2;
    const ty = outH / 2 - centerY;
    const tz = -focal + zShift;

    const matT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];

    // Perspective projection matching exact pixel scale at z = -focal
    const near = 10;
    const far = focal * 6;
    const sxProj = (2 * focal) / outW;
    const syProj = (2 * focal) / outH;
    const matProj = [
      sxProj, 0, 0, 0,
      0, syProj, 0, 0,
      0, 0, -(far + near) / (far - near), -1,
      0, 0, (-2 * far * near) / (far - near), 0,
    ];

    const rot = mul(matRz, mul(matRy, matRx));
    const modelView = mul(matT, rot);
    const mvp = mul(matProj, modelView);

    gl.viewport(0, 0, outW, outH);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "uMvp"), false, new Float32Array(mvp));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    return glCanvas;
  } catch {
    return null;
  }
}

/**
 * Renders the complete framed & 3D-positioned composition onto Canvas 2D and returns Data URL.
 */
export async function processFittedImage(
  imageSrc: string,
  settings: AspectRatioSettings,
  maxDim = 2160
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(imageSrc);
  const bgImg =
    settings.backgroundType === "image" && settings.backgroundImageSrc
      ? await loadImage(settings.backgroundImageSrc).catch(() => null)
      : null;

  const { width: targetWidth, height: targetHeight } = calculateCanvasDimensions(
    img.width,
    img.height,
    settings.ratio,
    settings.customWidth,
    settings.customHeight,
    maxDim
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. RENDER BACKDROP
  if (settings.backgroundType === "color") {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundType === "gradient") {
    renderGradientBackdrop(ctx, targetWidth, targetHeight, settings);
  } else if (settings.backgroundType === "blur") {
    ctx.save();
    const scaledBlur = Math.round(
      (settings.blurAmount / 1000) * Math.max(targetWidth, targetHeight)
    );
    ctx.filter = `blur(${scaledBlur}px)`;
    drawCoverImage(ctx, img, targetWidth, targetHeight, 1.12);
    ctx.restore();
    if (settings.backdropDim > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${settings.backdropDim / 100})`;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
  } else if (settings.backgroundType === "image" && bgImg) {
    ctx.save();
    if (settings.blurAmount > 0) {
      const scaledBlur = Math.round(
        (settings.blurAmount / 1200) * Math.max(targetWidth, targetHeight)
      );
      ctx.filter = `blur(${scaledBlur}px)`;
    }
    drawCoverImage(ctx, bgImg, targetWidth, targetHeight, settings.blurAmount > 0 ? 1.08 : 1);
    ctx.restore();
    if (settings.backdropDim > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${settings.backdropDim / 100})`;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // 2. COMPUTE FOREGROUND & FRAME DIMENSIONS
  const minSide = Math.min(targetWidth, targetHeight);
  const scaleMultiplier = settings.scale / 100;
  const fitRatio = Math.min(targetWidth / img.width, targetHeight / img.height);
  const fgWidth = img.width * fitRatio * scaleMultiplier;
  const fgHeight = img.height * fitRatio * scaleMultiplier;
  const cornerRadius = (settings.borderRadius / 1000) * minSide;

  let padTop = 0;
  let padRight = 0;
  let padBottom = 0;
  let padLeft = 0;
  let frameFill = settings.frameColor;

  switch (settings.frameStyle) {
    case "gallery": {
      const b = minSide * 0.032;
      padTop = padRight = padBottom = padLeft = b;
      break;
    }
    case "museum": {
      const b = minSide * 0.052;
      padTop = padRight = padBottom = padLeft = b;
      break;
    }
    case "polaroid": {
      const s = minSide * 0.032;
      padTop = padRight = padLeft = s;
      padBottom = minSide * 0.13;
      break;
    }
    case "film": {
      padLeft = padRight = minSide * 0.05;
      padTop = padBottom = minSide * 0.025;
      frameFill = "#0c0e12";
      break;
    }
    case "window": {
      padTop = minSide * 0.048;
      padRight = padBottom = padLeft = minSide * 0.008;
      frameFill = "#181c26";
      break;
    }
    case "browser": {
      padTop = minSide * 0.064;
      padRight = padBottom = padLeft = minSide * 0.01;
      frameFill = "#151923";
      break;
    }
    case "glass": {
      const b = minSide * 0.026;
      padTop = padRight = padBottom = padLeft = b;
      frameFill = "rgba(255, 255, 255, 0.2)";
      break;
    }
    case "neon": {
      const b = minSide * 0.014;
      padTop = padRight = padBottom = padLeft = b;
      frameFill = "#0c0e12";
      break;
    }
    case "editorial": {
      const s = minSide * 0.034;
      padTop = padRight = padLeft = s;
      padBottom = minSide * 0.088;
      break;
    }
    default:
      break;
  }

  const cardW = fgWidth + padLeft + padRight;
  const cardH = fgHeight + padTop + padBottom;
  const outerRadius =
    settings.frameStyle === "polaroid" ||
    settings.frameStyle === "film" ||
    settings.frameStyle === "museum"
      ? Math.max(4, minSide * 0.008)
      : cornerRadius + (settings.frameStyle !== "none" ? minSide * 0.012 : 0);

  // 3. BUILD FRAMED CARD ON AN OFFSCREEN CANVAS (enables clean 3D perspective & shadows!)
  const glowPad = settings.frameStyle === "neon" ? Math.round(minSide * 0.06) : 4;
  const cardCanvas = document.createElement("canvas");
  cardCanvas.width = Math.max(2, Math.ceil(cardW + glowPad * 2));
  cardCanvas.height = Math.max(2, Math.ceil(cardH + glowPad * 2));
  const fctx = cardCanvas.getContext("2d");
  if (!fctx) throw new Error("Failed to get foreground 2d context");
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = "high";

  const ox = glowPad;
  const oy = glowPad;

  // Draw frame body
  if (settings.frameStyle !== "none") {
    fctx.save();
    if (settings.frameStyle === "neon") {
      fctx.shadowColor = settings.frameColor === "#ffffff" ? "#1e40ff" : settings.frameColor;
      fctx.shadowBlur = minSide * 0.045;
    }
    drawRoundedRectPath(fctx, ox, oy, cardW, cardH, outerRadius);
    fctx.fillStyle = frameFill;
    fctx.fill();
    fctx.restore();

    // Frame-specific architectural details
    if (settings.frameStyle === "glass") {
      fctx.save();
      drawRoundedRectPath(fctx, ox + 1, oy + 1, cardW - 2, cardH - 2, outerRadius);
      fctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      fctx.lineWidth = Math.max(1.5, minSide * 0.003);
      fctx.stroke();
      fctx.restore();
    } else if (settings.frameStyle === "neon") {
      const neonCol = settings.frameColor === "#ffffff" ? "#1e40ff" : settings.frameColor;
      fctx.save();
      drawRoundedRectPath(fctx, ox + 1.5, oy + 1.5, cardW - 3, cardH - 3, outerRadius);
      fctx.strokeStyle = neonCol;
      fctx.lineWidth = Math.max(2.5, minSide * 0.0045);
      fctx.stroke();
      fctx.restore();
    } else if (settings.frameStyle === "museum") {
      // Double inner bevel hairline
      const inset = padLeft * 0.42;
      fctx.save();
      drawRoundedRectPath(
        fctx,
        ox + inset,
        oy + inset,
        cardW - inset * 2,
        cardH - inset * 2,
        Math.max(2, outerRadius * 0.5)
      );
      fctx.strokeStyle = "rgba(12, 14, 18, 0.22)";
      fctx.lineWidth = Math.max(1.5, minSide * 0.0022);
      fctx.stroke();
      fctx.restore();
    } else if (settings.frameStyle === "window" || settings.frameStyle === "browser") {
      const dotR = Math.max(3, minSide * 0.0085);
      const dotY = oy + padTop / 2;
      const startX = ox + padTop * 0.42;
      const gap = dotR * 3.1;
      ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
        fctx.beginPath();
        fctx.arc(startX + i * gap, dotY, dotR, 0, Math.PI * 2);
        fctx.fillStyle = col;
        fctx.fill();
      });

      if (settings.frameStyle === "browser") {
        // Sleek URL pill in the center of the browser bar
        const pillW = Math.min(cardW * 0.46, minSide * 0.42);
        const pillH = padTop * 0.52;
        const pillX = ox + (cardW - pillW) / 2;
        const pillY = oy + (padTop - pillH) / 2;
        drawRoundedRectPath(fctx, pillX, pillY, pillW, pillH, pillH / 2);
        fctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        fctx.fill();
        fctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        fctx.font = `600 ${Math.max(9, Math.round(pillH * 0.45))}px ui-monospace, monospace`;
        fctx.textAlign = "center";
        fctx.textBaseline = "middle";
        fctx.fillText("clearcut.studio", pillX + pillW / 2, pillY + pillH / 2);
      }
    } else if (settings.frameStyle === "film") {
      const holeW = padLeft * 0.42;
      const holeH = holeW * 1.35;
      const step = holeH * 1.9;
      const count = Math.max(3, Math.floor((cardH - padTop * 2) / step));
      const startY = oy + (cardH - count * step + (step - holeH)) / 2;
      fctx.fillStyle = "rgba(255,255,255,0.24)";
      for (let i = 0; i < count; i++) {
        const y = startY + i * step;
        drawRoundedRectPath(fctx, ox + (padLeft - holeW) / 2, y, holeW, holeH, 2);
        fctx.fill();
        drawRoundedRectPath(
          fctx,
          ox + cardW - padRight + (padRight - holeW) / 2,
          y,
          holeW,
          holeH,
          2
        );
        fctx.fill();
      }
    } else if (settings.frameStyle === "editorial") {
      // Swiss poster bottom caption metadata strip
      const isDarkFrame = settings.frameColor.toLowerCase() === "#0c0e12" || settings.frameColor.toLowerCase() === "#1e2330";
      fctx.fillStyle = isDarkFrame ? "rgba(255,255,255,0.68)" : "rgba(12,14,18,0.62)";
      const fontSize = Math.max(10, Math.round(minSide * 0.017));
      fctx.font = `700 ${fontSize}px ui-monospace, monospace`;
      fctx.textBaseline = "middle";
      const textY = oy + padTop + fgHeight + padBottom / 2;
      fctx.textAlign = "left";
      fctx.fillText("EXP // 01", ox + padLeft, textY);
      fctx.textAlign = "right";
      fctx.fillText("CLEARCUT ATELIER", ox + cardW - padRight, textY);
    }
  }

  // Draw clipped foreground image inside the card
  const innerRadius =
    settings.frameStyle === "none"
      ? cornerRadius
      : settings.frameStyle === "window" || settings.frameStyle === "browser"
      ? Math.max(2, cornerRadius * 0.45)
      : Math.max(0, cornerRadius * 0.3);

  fctx.save();
  drawRoundedRectPath(fctx, ox + padLeft, oy + padTop, fgWidth, fgHeight, innerRadius);
  fctx.clip();
  fctx.drawImage(img, ox + padLeft, oy + padTop, fgWidth, fgHeight);
  fctx.restore();

  // 4. COMPOSITE CARD ONTO MAIN CANVAS WITH 3D PERSPECTIVE (X, Y, Z) + ELEVATION SHADOW
  const centerX = targetWidth / 2 + (settings.offsetX / 100) * targetWidth;
  const centerY = targetHeight / 2 + (settings.offsetY / 100) * targetHeight;
  const has3D =
    settings.rotateX !== 0 ||
    settings.rotateY !== 0 ||
    settings.rotateZ !== 0 ||
    settings.offsetZ !== 0;

  const zBoost = 1 + (settings.offsetZ / 100) * 0.45;
  const shadowBlur =
    (settings.shadowIntensity / 100) * (minSide * 0.085) * Math.max(0.55, zBoost);
  const shadowOffsetY =
    (settings.shadowIntensity / 100) * (minSide * 0.028) * Math.max(0.55, zBoost) +
    (settings.rotateX / 35) * (minSide * 0.02);
  const shadowOffsetX = -(settings.rotateY / 35) * (minSide * 0.035);
  const shadowAlpha = (settings.shadowIntensity / 100) * 0.52;

  ctx.save();
  if (settings.shadowIntensity > 0) {
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;
  }

  if (has3D) {
    const projected = renderWebGL3DQuad(
      cardCanvas,
      targetWidth,
      targetHeight,
      centerX,
      centerY,
      cardCanvas.width,
      cardCanvas.height,
      settings.rotateX,
      settings.rotateY,
      settings.rotateZ,
      settings.offsetZ
    );

    if (projected) {
      ctx.drawImage(projected, 0, 0);
    } else {
      // Seamless Canvas 2D fallback (rotateZ + Z-depth scale + tilt foreshortening)
      const depthScale = Math.max(0.45, 1 + (settings.offsetZ / 100) * 0.72);
      const sx = Math.cos((settings.rotateY * Math.PI) / 180) * depthScale;
      const sy = Math.cos((settings.rotateX * Math.PI) / 180) * depthScale;
      ctx.translate(centerX, centerY);
      ctx.rotate((settings.rotateZ * Math.PI) / 180);
      ctx.scale(sx, sy);
      ctx.drawImage(cardCanvas, -cardCanvas.width / 2, -cardCanvas.height / 2);
    }
  } else {
    ctx.drawImage(cardCanvas, centerX - cardCanvas.width / 2, centerY - cardCanvas.height / 2);
  }
  ctx.restore();

  // 5. EXPORT
  const mime =
    settings.backgroundType === "transparent" || settings.exportFormat === "png"
      ? "image/png"
      : settings.exportFormat === "webp"
      ? "image/webp"
      : "image/jpeg";

  const dataUrl = canvas.toDataURL(mime, 0.92);
  return { dataUrl, width: targetWidth, height: targetHeight };
}

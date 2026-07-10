"use client";

import React, { forwardRef, useRef, useEffect, useState } from "react";
import { FramedSettings } from "./types";
import {
  IPhoneFrame,
  IPhoneSEFrame,
  AndroidFrame,
  IPadFrame,
  AndroidTabFrame,
  BrowserFrame,
  MacOSFrame,
} from "./device-frames";
import { HD_MOCKUPS } from "./hd-mockups";

interface FrameCanvasProps {
  imageSrc: string;
  settings: FramedSettings;
}

// ─── Filter overlay ────────────────────────────────────────────────────────────
function FilterOverlay({ effect }: { effect: FramedSettings["filterEffect"] }) {
  if (effect === "none") return null;
  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 10,
    borderRadius: "inherit",
  };
  if (effect === "noise") {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      />
    );
  }
  if (effect === "grain") {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          opacity: 0.14,
          mixBlendMode: "multiply",
        }}
      />
    );
  }
  if (effect === "vignette") {
    return (
      <div
        style={{
          ...base,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.68) 100%)",
        }}
      />
    );
  }
  return null;
}

// ─── Shadow builder ────────────────────────────────────────────────────────────
function buildShadow(settings: FramedSettings): string {
  if (settings.shadowType === "none") return "none";
  const opacity = settings.shadow / 100;
  const rgb = hexToRgb(settings.shadowColor || "#000000");
  const o = (mul: number) => Math.min(1, opacity * mul);

  if (settings.shadowType === "spread") {
    return `0 ${settings.shadow / 3}px ${settings.shadow * 2}px rgba(${rgb},${o(0.8)})`;
  }
  if (settings.shadowType === "hug") {
    return `0 ${settings.shadow / 5}px ${settings.shadow}px rgba(${rgb},${o(1)})`;
  }
  if (settings.shadowType === "bottom") {
    return `0 ${settings.shadow}px ${settings.shadow * 1.5}px -${settings.shadow / 3}px rgba(${rgb},${o(0.9)})`;
  }
  return "none";
}

function hexToRgb(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "0,0,0";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return isNaN(r) || isNaN(g) || isNaN(b) ? "0,0,0" : `${r},${g},${b}`;
}

// ─── HD Mockup Renderer ────────────────────────────────────────────────────────
// Measures the *actual* rendered size of the device PNG (which may be smaller
// than its container due to object-fit:contain) and positions the user's
// screenshot overlay with pixel-perfect coordinates — exactly like shots.so.
interface HdMockupRendererProps {
  mockup: import("./hd-mockups").HDMockup;
  imageSrc: string;
  transform: string;
  shadow: string;
  filterEffect: FramedSettings["filterEffect"];
}

function HdMockupRenderer({ mockup, imageSrc, transform, shadow, filterEffect }: HdMockupRendererProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [rect, setRect] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const measure = () => {
      if (!el.naturalWidth) return;
      // The image uses object-fit:contain inside a flexible container.
      // We read the *rendered* pixel size directly from the DOM element.
      setRect({ w: el.offsetWidth, h: el.offsetHeight });
    };

    // Measure after the image loads
    if (el.complete) measure();
    el.addEventListener("load", measure);

    // Re-measure whenever the element resizes (zoom, window resize, etc.)
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      el.removeEventListener("load", measure);
      ro.disconnect();
    };
  }, [mockup.image]);

  const { screen } = mockup;

  // Compute pixel coordinates from % values relative to the rendered image size
  const overlayStyle: React.CSSProperties | null = rect
    ? {
        position: "absolute",
        top:    rect.h * (screen.top    / 100),
        left:   rect.w * (screen.left   / 100),
        width:  rect.w * (screen.width  / 100),
        height: rect.h * (screen.height / 100),
        // radius is a % of the screen width (matches how border-radius % works on a non-square box)
        borderRadius: (rect.w * (screen.width / 100)) * (screen.radius / 100),
        overflow: "hidden",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
        zIndex: 2,
      }
    : null;

  return (
    <div
      style={{
        position: "relative",
        transform,
        transformStyle: "preserve-3d",
        transition: "transform 0.2s ease",
        filter: shadow !== "none" ? `drop-shadow(${shadow.split(",")[0]})` : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* User screenshot — rendered first (below device frame) */}
      {overlayStyle && (
        <div style={{ ...overlayStyle, zIndex: 1 }}>
          <img
            src={imageSrc}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <FilterOverlay effect={filterEffect} />
        </div>
      )}

      {/* Device PNG — renders on top, its bezels naturally mask the screenshot */}
      <img
        ref={imgRef}
        src={mockup.image}
        alt={mockup.name}
        style={{
          maxWidth: "100%",
          maxHeight: "80vh",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
          position: "relative",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ─── Canvas ────────────────────────────────────────────────────────────────────
export const FrameCanvas = forwardRef<HTMLDivElement, FrameCanvasProps>(
  ({ imageSrc, settings }, ref) => {
    const isTransparent = settings.background === "transparent";
    const shadow = buildShadow(settings);

    // Aspect ratio CSS
    let aspectRatioStyle: string | undefined;
    if (settings.aspectRatio !== "auto") {
      aspectRatioStyle = settings.aspectRatio.replace(":", "/");
    }

    // Transform: offset → tilt → zoom
    const transform = [
      settings.offsetX !== 0 || settings.offsetY !== 0
        ? `translate(${settings.offsetX}px, ${settings.offsetY}px)`
        : "",
      `scale(${settings.zoom / 100})`,
      settings.tiltX !== 0 ? `rotateX(${settings.tiltX}deg)` : "",
      settings.tiltY !== 0 ? `rotateY(${settings.tiltY}deg)` : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Frame style
    const isDeviceMobile = ["iphone-14", "iphone-15-pro", "iphone-se", "android"].includes(
      settings.frameStyle
    );
    const isDeviceTablet = ["ipad", "android-tab"].includes(settings.frameStyle);
    const isDevice = isDeviceMobile || isDeviceTablet;
    const isBrowser = settings.frameStyle === "browser";
    const isMacos = settings.frameStyle === "macos";
    const isHdMockup = settings.frameStyle === "hd";
    const selectedHdMockup = isHdMockup ? HD_MOCKUPS.find((m) => m.id === settings.hdMockupId) : null;
    const isStandard = !isDevice && !isBrowser && !isMacos && !isHdMockup;

    // Standard frame styles
    let stdStyle: React.CSSProperties = {
      boxShadow: shadow,
      borderRadius: settings.rounded,
      overflow: "hidden",
      position: "relative",
      transition: "all 0.2s ease",
    };

    if (settings.frameStyle === "glass-light") {
      stdStyle = {
        ...stdStyle,
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: `${shadow !== "none" ? shadow + "," : ""} inset 0 1px 0 rgba(255,255,255,0.7)`,
      };
    } else if (settings.frameStyle === "glass-dark") {
      stdStyle = {
        ...stdStyle,
        background: "rgba(10,15,30,0.55)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `${shadow !== "none" ? shadow + "," : ""} inset 0 1px 0 rgba(255,255,255,0.06)`,
      };
    } else if (settings.frameStyle === "outline") {
      stdStyle = { ...stdStyle, border: "1px solid rgba(0,0,0,0.12)" };
    } else if (settings.frameStyle === "border") {
      stdStyle = {
        ...stdStyle,
        border: "9px solid rgba(255,255,255,0.95)",
        boxShadow: `${shadow !== "none" ? shadow + "," : ""} 0 0 0 1px rgba(0,0,0,0.08)`,
      };
    }

    const imageEl = (
      <img
        src={imageSrc}
        alt="Preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          padding:
            settings.frameStyle === "glass-light" || settings.frameStyle === "glass-dark" ? 8 : 0,
          borderRadius:
            settings.frameStyle === "glass-light" || settings.frameStyle === "glass-dark"
              ? Math.max(0, settings.rounded - 4)
              : 0,
        }}
      />
    );

    const innerScreenWidth = isDeviceMobile ? 260 : 320;

    return (
      <div
        ref={ref}
        style={{
          background: isTransparent ? "transparent" : settings.background,
          padding: settings.padding,
          aspectRatio: aspectRatioStyle,
          perspective: "1200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "background 0.3s ease, padding 0.2s ease",
          width: "100%",
        }}
      >
        {/* ── HD Mockup frames ── */}
        {isHdMockup && selectedHdMockup && (
          <HdMockupRenderer
            mockup={selectedHdMockup}
            imageSrc={imageSrc}
            transform={transform}
            shadow={shadow}
            filterEffect={settings.filterEffect}
          />
        )}

        {/* ── Device frames ── */}
        {isDevice && (
          <div
            style={{
              transform,
              transformStyle: "preserve-3d",
              transition: "transform 0.2s ease",
              filter:
                shadow !== "none"
                  ? `drop-shadow(${shadow.split(",")[0]})`
                  : undefined,
            }}
          >
            {settings.frameStyle === "iphone-15-pro" && (
              <IPhoneFrame screenWidth={innerScreenWidth} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </IPhoneFrame>
            )}
            {settings.frameStyle === "iphone-14" && (
              <IPhoneFrame screenWidth={innerScreenWidth} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </IPhoneFrame>
            )}
            {settings.frameStyle === "iphone-se" && (
              <IPhoneSEFrame screenWidth={220} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </IPhoneSEFrame>
            )}
            {settings.frameStyle === "android" && (
              <AndroidFrame screenWidth={240} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </AndroidFrame>
            )}
            {settings.frameStyle === "ipad" && (
              <IPadFrame screenWidth={320} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </IPadFrame>
            )}
            {settings.frameStyle === "android-tab" && (
              <AndroidTabFrame screenWidth={320} color={settings.deviceColor}>
                <img src={imageSrc} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </AndroidTabFrame>
            )}
          </div>
        )}

        {/* ── Browser frame ── */}
        {isBrowser && (
          <div
            style={{
              transform,
              transformStyle: "preserve-3d",
              maxWidth: "100%",
              transition: "transform 0.2s ease",
            }}
          >
            <BrowserFrame
              rounded={settings.rounded}
              shadow={shadow}
              url={settings.browserUrl || "yourapp.com"}
            >
              <div style={{ position: "relative" }}>
                {imageEl}
                <FilterOverlay effect={settings.filterEffect} />
              </div>
            </BrowserFrame>
          </div>
        )}

        {/* ── macOS frame ── */}
        {isMacos && (
          <div
            style={{
              transform,
              transformStyle: "preserve-3d",
              maxWidth: "100%",
              transition: "transform 0.2s ease",
            }}
          >
            <MacOSFrame 
              rounded={settings.rounded} 
              shadow={shadow}
              url={settings.browserUrl || "yourapp.com"}
            >
              <div style={{ position: "relative" }}>
                {imageEl}
                <FilterOverlay effect={settings.filterEffect} />
              </div>
            </MacOSFrame>
          </div>
        )}

        {/* ── Standard frames ── */}
        {isStandard && (
          <div
            style={{
              ...stdStyle,
              transform,
              transformStyle: "preserve-3d",
              maxWidth: "100%",
              transition: "all 0.2s ease",
            }}
          >
            {imageEl}
            <FilterOverlay effect={settings.filterEffect} />
          </div>
        )}
      </div>
    );
  }
);
FrameCanvas.displayName = "FrameCanvas";

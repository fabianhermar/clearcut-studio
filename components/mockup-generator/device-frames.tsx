"use client";

import React from "react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
interface ScreenProps {
  children: React.ReactNode;
  width: number;
  height: number;
  radius?: number;
}

function Screen({ children, width, height, radius = 0 }: ScreenProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        background: "#000",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

// ─── iPhone 15 Pro ────────────────────────────────────────────────────────────
export function IPhoneFrame({
  children,
  screenWidth = 260,
  color = "black",
}: {
  children: React.ReactNode;
  screenWidth?: number;
  color?: "black" | "white";
}) {
  const isBlack = color === "black";
  const screenHeight = Math.round(screenWidth * (19.5 / 9));
  const bezelH = Math.round(screenWidth * 0.045);
  const bezelTop = Math.round(screenWidth * 0.045);
  const bezelBottom = Math.round(screenWidth * 0.06);
  const totalW = screenWidth + bezelH * 2;
  const totalH = screenHeight + bezelTop + bezelBottom;
  const bodyRadius = Math.round(totalW * 0.145);
  const screenRadius = Math.round(totalW * 0.118);
  const btnColor = isBlack ? "#333" : "#c8c8c8";
  const bodyBase = isBlack ? "#1c1c1e" : "#f2f2f7";
  const bodyLight = isBlack ? "#2c2c2e" : "#ffffff";
  const bodyDark = isBlack ? "#141416" : "#dadadf";

  return (
    <div
      style={{
        position: "relative",
        width: totalW,
        height: totalH,
        borderRadius: bodyRadius,
        background: `linear-gradient(145deg, ${bodyLight} 0%, ${bodyBase} 35%, ${bodyDark} 100%)`,
        boxShadow: isBlack
          ? `0 0 0 0.5px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.06), 0 4px 6px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.6), 0 40px 100px rgba(0,0,0,0.3)`
          : `0 0 0 0.5px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.18), 0 40px 80px rgba(0,0,0,0.08)`,
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          top: bezelTop,
          left: bezelH,
          borderRadius: screenRadius,
          overflow: "hidden",
          width: screenWidth,
          height: screenHeight,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
          background: "#000",
        }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {children}
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: screenWidth * 0.31,
              height: 11,
              background: "#000",
              borderRadius: 999,
              zIndex: 20,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
            }}
          />
          {/* Screen shine */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
              pointerEvents: "none",
              zIndex: 5,
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>

      {/* Silent toggle */}
      <div
        style={{
          position: "absolute",
          left: -2.5,
          top: "18%",
          width: 3,
          height: 18,
          background: `linear-gradient(to right, ${btnColor}, ${isBlack ? "#444" : "#bbb"})`,
          borderRadius: "2px 0 0 2px",
        }}
      />
      {/* Volume up */}
      <div
        style={{
          position: "absolute",
          left: -2.5,
          top: "27%",
          width: 3,
          height: 30,
          background: `linear-gradient(to right, ${btnColor}, ${isBlack ? "#444" : "#bbb"})`,
          borderRadius: "2px 0 0 2px",
        }}
      />
      {/* Volume down */}
      <div
        style={{
          position: "absolute",
          left: -2.5,
          top: "38%",
          width: 3,
          height: 30,
          background: `linear-gradient(to right, ${btnColor}, ${isBlack ? "#444" : "#bbb"})`,
          borderRadius: "2px 0 0 2px",
        }}
      />
      {/* Power button */}
      <div
        style={{
          position: "absolute",
          right: -2.5,
          top: "30%",
          width: 3,
          height: 52,
          background: `linear-gradient(to left, ${btnColor}, ${isBlack ? "#444" : "#bbb"})`,
          borderRadius: "0 2px 2px 0",
        }}
      />

      {/* Bottom pill */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(bezelBottom * 0.38),
          left: "50%",
          transform: "translateX(-50%)",
          width: screenWidth * 0.34,
          height: 4,
          background: isBlack ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)",
          borderRadius: 999,
        }}
      />

      {/* Body rim highlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: bodyRadius,
          boxShadow: isBlack
            ? "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.08)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── iPhone SE (classic) ──────────────────────────────────────────────────────
export function IPhoneSEFrame({
  children,
  screenWidth = 220,
  color = "black",
}: {
  children: React.ReactNode;
  screenWidth?: number;
  color?: "black" | "white";
}) {
  const isBlack = color === "black";
  const screenHeight = Math.round(screenWidth * (16 / 9));
  const bezelH = Math.round(screenWidth * 0.055);
  const bezelTop = Math.round(screenWidth * 0.16);
  const bezelBottom = Math.round(screenWidth * 0.16);
  const totalW = screenWidth + bezelH * 2;
  const totalH = screenHeight + bezelTop + bezelBottom;
  const bodyRadius = Math.round(totalW * 0.12);
  const bodyBase = isBlack ? "#1c1c1e" : "#f5f5f5";
  const bodyLight = isBlack ? "#2a2a2c" : "#ffffff";

  return (
    <div
      style={{
        position: "relative",
        width: totalW,
        height: totalH,
        borderRadius: bodyRadius,
        background: `linear-gradient(145deg, ${bodyLight} 0%, ${bodyBase} 60%)`,
        boxShadow: isBlack
          ? `0 0 0 0.5px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.3)`
          : `0 0 0 0.5px rgba(0,0,0,0.15), 0 20px 60px rgba(0,0,0,0.18)`,
        flexShrink: 0,
      }}
    >
      {/* Speaker grill - top */}
      <div
        style={{
          position: "absolute",
          top: bezelTop * 0.28,
          left: "50%",
          transform: "translateX(-50%)",
          width: screenWidth * 0.28,
          height: 5,
          background: isBlack ? "#333" : "#ddd",
          borderRadius: 4,
        }}
      />
      {/* Front camera */}
      <div
        style={{
          position: "absolute",
          top: bezelTop * 0.55,
          left: "50%",
          transform: "translateX(-50%)",
          width: 7,
          height: 7,
          background: isBlack ? "#252528" : "#c8c8cc",
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.5)",
        }}
      />

      {/* Screen */}
      <div
        style={{
          position: "absolute",
          top: bezelTop,
          left: bezelH,
          width: screenWidth,
          height: screenHeight,
          overflow: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </div>

      {/* Home button */}
      <div
        style={{
          position: "absolute",
          bottom: bezelBottom * 0.28,
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(bezelBottom * 0.72),
          height: Math.round(bezelBottom * 0.72),
          borderRadius: "50%",
          background: isBlack
            ? "linear-gradient(145deg, #333, #1a1a1a)"
            : "linear-gradient(145deg, #e8e8e8, #d0d0d0)",
          boxShadow: isBlack
            ? "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 0 0 1px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      />

      {/* Left side button */}
      <div
        style={{
          position: "absolute",
          left: -2.5,
          top: "30%",
          width: 3,
          height: 40,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "2px 0 0 2px",
        }}
      />
    </div>
  );
}

// ─── Android ──────────────────────────────────────────────────────────────────
export function AndroidFrame({
  children,
  screenWidth = 240,
  color = "black",
}: {
  children: React.ReactNode;
  screenWidth?: number;
  color?: "black" | "white";
}) {
  const isBlack = color === "black";
  const screenHeight = Math.round(screenWidth * (20 / 9));
  const bezelH = Math.round(screenWidth * 0.035);
  const bezelTop = Math.round(screenWidth * 0.038);
  const bezelBottom = Math.round(screenWidth * 0.042);
  const totalW = screenWidth + bezelH * 2;
  const totalH = screenHeight + bezelTop + bezelBottom;
  const bodyRadius = Math.round(totalW * 0.1);
  const screenRadius = Math.round(totalW * 0.078);
  const bodyBase = isBlack ? "#18181b" : "#f4f4f5";
  const bodyLight = isBlack ? "#27272a" : "#ffffff";

  return (
    <div
      style={{
        position: "relative",
        width: totalW,
        height: totalH,
        borderRadius: bodyRadius,
        background: `linear-gradient(145deg, ${bodyLight} 0%, ${bodyBase} 60%)`,
        boxShadow: isBlack
          ? `0 0 0 0.5px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.3)`
          : `0 0 0 0.5px rgba(0,0,0,0.12), 0 20px 60px rgba(0,0,0,0.15)`,
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          top: bezelTop,
          left: bezelH,
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {children}
        {/* Punch-hole camera */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            background: "#0a0a0a",
            borderRadius: "50%",
            zIndex: 20,
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.06)",
          }}
        />
        {/* Screen shine */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </div>

      {/* Power button */}
      <div
        style={{
          position: "absolute",
          right: -2.5,
          top: "28%",
          width: 3,
          height: 42,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "0 2px 2px 0",
        }}
      />
      {/* Volume */}
      <div
        style={{
          position: "absolute",
          left: -2.5,
          top: "35%",
          width: 3,
          height: 52,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "2px 0 0 2px",
        }}
      />

      {/* Nav pill */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(bezelBottom * 0.42),
          left: "50%",
          transform: "translateX(-50%)",
          width: screenWidth * 0.36,
          height: 4,
          background: isBlack ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
          borderRadius: 999,
        }}
      />
    </div>
  );
}

// ─── iPad ─────────────────────────────────────────────────────────────────────
export function IPadFrame({
  children,
  screenWidth = 320,
  color = "black",
}: {
  children: React.ReactNode;
  screenWidth?: number;
  color?: "black" | "white";
}) {
  const isBlack = color === "black";
  const screenHeight = Math.round(screenWidth * (4 / 3));
  const bezelH = Math.round(screenWidth * 0.055);
  const bezelV = Math.round(screenWidth * 0.065);
  const totalW = screenWidth + bezelH * 2;
  const totalH = screenHeight + bezelV * 2;
  const bodyRadius = Math.round(totalW * 0.055);
  const screenRadius = Math.round(totalW * 0.035);
  const bodyBase = isBlack ? "#1c1c1e" : "#f5f5f5";
  const bodyLight = isBlack ? "#2c2c2e" : "#ffffff";

  return (
    <div
      style={{
        position: "relative",
        width: totalW,
        height: totalH,
        borderRadius: bodyRadius,
        background: `linear-gradient(145deg, ${bodyLight} 0%, ${bodyBase} 60%)`,
        boxShadow: isBlack
          ? `0 0 0 0.5px rgba(255,255,255,0.1), 0 20px 70px rgba(0,0,0,0.55), 0 50px 100px rgba(0,0,0,0.2)`
          : `0 0 0 0.5px rgba(0,0,0,0.12), 0 20px 70px rgba(0,0,0,0.18)`,
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          top: bezelV,
          left: bezelH,
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
        }}
      >
        {children}
        {/* Shine */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      </div>

      {/* Face ID bar (top center) */}
      <div
        style={{
          position: "absolute",
          top: bezelV * 0.4,
          left: "50%",
          transform: "translateX(-50%)",
          width: screenWidth * 0.18,
          height: 5,
          background: isBlack ? "#333" : "#ddd",
          borderRadius: 4,
        }}
      />

      {/* Power button (top right edge) */}
      <div
        style={{
          position: "absolute",
          top: -2.5,
          right: "25%",
          height: 3,
          width: 40,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "2px 2px 0 0",
        }}
      />

      {/* Volume buttons (right side) */}
      {[0.3, 0.42].map((top, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            right: -2.5,
            top: `${top * 100}%`,
            width: 3,
            height: 40,
            background: isBlack ? "#333" : "#d0d0d0",
            borderRadius: "0 2px 2px 0",
          }}
        />
      ))}
    </div>
  );
}

// ─── Android Tablet ───────────────────────────────────────────────────────────
export function AndroidTabFrame({
  children,
  screenWidth = 320,
  color = "black",
}: {
  children: React.ReactNode;
  screenWidth?: number;
  color?: "black" | "white";
}) {
  const isBlack = color === "black";
  const screenHeight = Math.round(screenWidth * (16 / 10));
  const bezelH = Math.round(screenWidth * 0.04);
  const bezelV = Math.round(screenWidth * 0.06);
  const totalW = screenWidth + bezelH * 2;
  const totalH = screenHeight + bezelV * 2;
  const bodyRadius = Math.round(totalW * 0.06);
  const screenRadius = Math.round(totalW * 0.03);
  const bodyBase = isBlack ? "#18181b" : "#f4f4f5";

  return (
    <div
      style={{
        position: "relative",
        width: totalW,
        height: totalH,
        borderRadius: bodyRadius,
        background: isBlack
          ? `linear-gradient(145deg, #27272a 0%, ${bodyBase} 60%)`
          : `linear-gradient(145deg, #fff 0%, ${bodyBase} 60%)`,
        boxShadow: isBlack
          ? `0 0 0 0.5px rgba(255,255,255,0.08), 0 20px 70px rgba(0,0,0,0.6)`
          : `0 0 0 0.5px rgba(0,0,0,0.12), 0 20px 70px rgba(0,0,0,0.18)`,
        flexShrink: 0,
      }}
    >
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          top: bezelV,
          left: bezelH,
          width: screenWidth,
          height: screenHeight,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {children}
        {/* Punch-hole camera */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 8,
            height: 8,
            background: "#0a0a0a",
            borderRadius: "50%",
            zIndex: 20,
          }}
        />
      </div>

      {/* Power + Volume */}
      <div
        style={{
          position: "absolute",
          top: -2.5,
          right: "20%",
          width: 36,
          height: 3,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "2px 2px 0 0",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -2.5,
          right: "32%",
          width: 56,
          height: 3,
          background: isBlack ? "#333" : "#d0d0d0",
          borderRadius: "2px 2px 0 0",
        }}
      />
    </div>
  );
}

// ─── Browser ──────────────────────────────────────────────────────────────────
export function BrowserFrame({
  children,
  rounded = 12,
  shadow = "none",
  url = "yourapp.com",
}: {
  children: React.ReactNode;
  rounded?: number;
  shadow?: string;
  url?: string;
}) {
  // Normalize URL display
  const displayUrl = url.replace(/^https?:\/\//, "");
  const isHttps = !url.startsWith("http://");

  return (
    <div
      style={{
        borderRadius: rounded,
        boxShadow: shadow,
        overflow: "hidden",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        maxWidth: "100%",
        flexShrink: 0,
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          background: "#eef0f4",
          borderBottom: "1px solid #d8dde6",
          padding: "8px 12px 0",
          display: "flex",
          alignItems: "flex-end",
          gap: 0,
          flexShrink: 0,
        }}
      >
        {/* Window controls */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, marginRight: 12 }}>
          {[["#ef4444", "#dc2626"], ["#f59e0b", "#d97706"], ["#22c55e", "#16a34a"]].map(([base, dark], i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${base}, ${dark})`,
                boxShadow: `0 0 0 0.5px rgba(0,0,0,0.15)`,
              }}
            />
          ))}
        </div>
        {/* Active tab */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "8px 8px 0 0",
            padding: "6px 16px 8px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#374151",
            minWidth: 140,
            maxWidth: 220,
            border: "1px solid #e2e8f0",
            borderBottom: "1px solid #f8fafc",
            marginBottom: -1,
          }}
        >
          {/* Favicon dot */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: "system-ui, sans-serif", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayUrl}
          </span>
          <div style={{ width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, flexShrink: 0 }}>
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        {/* New tab (+) */}
        <div
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
            color: "#6b7280",
            fontSize: 16,
            cursor: "default",
          }}
        >
          +
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          background: "#f8fafc",
          borderBottom: "1px solid #e8ecf0",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Nav arrows */}
        <div style={{ display: "flex", gap: 4 }}>
          {["←", "→"].map((arrow, i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: i === 0 ? "#374151" : "#9ca3af",
                cursor: "default",
              }}
            >
              {arrow}
            </div>
          ))}
          {/* Refresh */}
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              cursor: "default",
            }}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13.5 8A5.5 5.5 0 0 1 3 11.5m-.5-7A5.5 5.5 0 0 1 13 4.5" strokeLinecap="round" />
              <path d="M2.5 1.5v3h3M13.5 14.5v-3h-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            background: "#eef0f4",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isHttps ? (
            <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="#22c55e" strokeWidth="1.5">
              <rect x="2" y="7" width="12" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="11" height="11" fill="#f59e0b">
              <path d="M8 1a2.5 2.5 0 0 0-2.5 2.5V6H4v8h8V6h-1.5V3.5A2.5 2.5 0 0 0 8 1zm0 1.5A1 1 0 0 1 9 3.5V6H7V3.5A1 1 0 0 1 8 2.5z" />
            </svg>
          )}
          <span
            style={{
              fontSize: 11,
              color: "#374151",
              fontFamily: "system-ui, sans-serif",
              flex: 1,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {isHttps ? "https://" : "http://"}
            {displayUrl}
          </span>
        </div>

        {/* Extensions area */}
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "#eef0f4",
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ─── macOS ────────────────────────────────────────────────────────────────────
export function MacOSFrame({
  children,
  rounded = 12,
  shadow = "none",
  url = "yourapp.com",
}: {
  children: React.ReactNode;
  rounded?: number;
  shadow?: string;
  url?: string;
}) {
  const displayUrl = url.replace(/^https?:\/\//, "");
  return (
    <div
      style={{
        borderRadius: rounded,
        boxShadow: shadow,
        overflow: "hidden",
        background: "#1d2027",
        border: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "100%",
        flexShrink: 0,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: "linear-gradient(to bottom, #2d3240, #252a35)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7 }}>
          {[["#ff5f57", "#e0443c"], ["#febc2e", "#dfa424"], ["#28c840", "#20a832"]].map(([base, dark], i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${base}, ${dark})`,
                boxShadow: `0 0 0 0.5px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1)`,
              }}
            />
          ))}
        </div>
        {/* Window title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "#8b93a7",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: 50,
          }}
        >
          {displayUrl}
        </div>
      </div>
      {/* Content */}
      <div style={{ position: "relative" }}>
        {children}
        {/* Subtle shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

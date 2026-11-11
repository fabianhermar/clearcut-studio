"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BrandToken {
  name: string;
  roleEs: string;
  roleEn: string;
  hex: string;
  rgb: string;
}

const BRAND_TOKENS: BrandToken[] = [
  {
    name: "Studio Blue (Primary)",
    roleEs: "Acción principal y acento de marca",
    roleEn: "Primary action & brand accent",
    hex: "#2563EB",
    rgb: "rgb(37, 99, 235)",
  },
  {
    name: "Studio Blue Hover",
    roleEs: "Estado activo / hover principal",
    roleEn: "Primary active / hover state",
    hex: "#1D4ED8",
    rgb: "rgb(29, 78, 216)",
  },
  {
    name: "Slate Ink (Foreground)",
    roleEs: "Texto principal y titulares",
    roleEn: "Primary text & headings",
    hex: "#0F172A",
    rgb: "rgb(15, 23, 42)",
  },
  {
    name: "Slate Muted",
    roleEs: "Texto secundario y etiquetas",
    roleEn: "Secondary text & labels",
    hex: "#475569",
    rgb: "rgb(71, 85, 105)",
  },
  {
    name: "Canvas Alabaster",
    roleEs: "Fondo general de la aplicación",
    roleEn: "General application background",
    hex: "#F8FAFC",
    rgb: "rgb(248, 250, 252)",
  },
  {
    name: "Pure Surface",
    roleEs: "Superficies, paneles y tarjetas",
    roleEn: "Surfaces, panels & cards",
    hex: "#FFFFFF",
    rgb: "rgb(255, 255, 255)",
  },
  {
    name: "Hairline Border",
    roleEs: "Bordes y divisores estructurales",
    roleEn: "Structural borders & dividers",
    hex: "#E2E8F0",
    rgb: "rgb(226, 232, 240)",
  },
  {
    name: "Verification Emerald",
    roleEs: "Estado de éxito y privacidad local",
    roleEn: "Success state & local privacy badge",
    hex: "#15803D",
    rgb: "rgb(21, 128, 61)",
  },
  {
    name: "Alert Crimson",
    roleEs: "Errores y advertencias críticas",
    roleEn: "Errors & critical warnings",
    hex: "#B91C1C",
    rgb: "rgb(185, 28, 28)",
  },
];

export function BrandSwatches({ lang = "es" }: { lang?: string }) {
  const isEs = lang === "es";
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {BRAND_TOKENS.map((token) => {
        const isCopied = copiedHex === token.hex;
        return (
          <div
            key={token.hex}
            className="p-4 rounded-2xl bg-card border border-border shadow-2xs flex flex-col justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-xl border border-slate-300 shadow-2xs shrink-0"
                style={{ backgroundColor: token.hex }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm text-foreground truncate">
                  {token.name}
                </p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {isEs ? token.roleEs : token.roleEn}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-foreground">
                  {token.hex}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {token.rgb}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(token.hex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-border/60 border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isEs ? "Copiado" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{isEs ? "Copiar HEX" : "Copy HEX"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

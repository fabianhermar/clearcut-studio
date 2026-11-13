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
    name: "Paper Atelier (Background)",
    roleEs: "Fondo editorial cálido de estudio",
    roleEn: "Warm editorial studio paper background",
    hex: "#F4F3EF",
    rgb: "rgb(244, 243, 239)",
  },
  {
    name: "Pure Surface (Card)",
    roleEs: "Superficies arquitectónicas y paneles",
    roleEn: "Architectural panels & card surfaces",
    hex: "#FFFFFF",
    rgb: "rgb(255, 255, 255)",
  },
  {
    name: "Obsidian Darkroom",
    roleEs: "Visores ópticos de alto contraste",
    roleEn: "High-contrast darkroom viewports",
    hex: "#0C0E12",
    rgb: "rgb(12, 14, 18)",
  },
  {
    name: "Optical Cobalt (Primary)",
    roleEs: "Acción principal y acento técnico",
    roleEn: "Primary action & engineering accent",
    hex: "#1E40FF",
    rgb: "rgb(30, 64, 255)",
  },
  {
    name: "Cobalt Active (Hover)",
    roleEs: "Estado activo y pulsación",
    roleEn: "Primary active & hover state",
    hex: "#1632CC",
    rgb: "rgb(22, 50, 204)",
  },
  {
    name: "Signal Vermilion (Accent)",
    roleEs: "Indicadores ópticos y Studio Lab",
    roleEn: "Optical reticles & Studio Lab accent",
    hex: "#FF4D00",
    rgb: "rgb(255, 77, 0)",
  },
  {
    name: "Ink Charcoal (Foreground)",
    roleEs: "Tipografía principal y titulares",
    roleEn: "Primary typography & headings",
    hex: "#111318",
    rgb: "rgb(17, 19, 24)",
  },
  {
    name: "Hairline Stone (Border)",
    roleEs: "Retícula suiza y separadores finos",
    roleEn: "Swiss grid hairlines & dividers",
    hex: "#DCDAD0",
    rgb: "rgb(220, 218, 208)",
  },
  {
    name: "Verification Teal",
    roleEs: "Estado verificado y privacidad local",
    roleEn: "Verified state & local privacy badge",
    hex: "#0F766E",
    rgb: "rgb(15, 118, 110)",
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
    <div className="rounded-3xl border border-border bg-card overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {BRAND_TOKENS.map((token) => {
        const isCopied = copiedHex === token.hex;
        return (
          <div
            key={token.hex}
            className="p-5 sm:p-6 border-b border-r border-border flex flex-col justify-between gap-5 hover:bg-muted/25 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-xl border border-border shadow-2xs shrink-0"
                style={{ backgroundColor: token.hex }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-heading font-bold text-sm text-foreground truncate">
                  {token.name}
                </p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                  {isEs ? token.roleEs : token.roleEn}
                </p>
              </div>
            </div>

            <div className="pt-3.5 border-t border-border/80 flex items-center justify-between gap-2">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background hover:bg-muted border border-border text-xs font-mono font-semibold text-foreground transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                    <span>{isEs ? "Copiado" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                    <span>{isEs ? "Copiar" : "Copy"}</span>
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

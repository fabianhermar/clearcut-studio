"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, SunMoon, Type, RotateCcw } from "lucide-react";

export function AccessibilityTools({ lang }: { lang: string }) {
  const [fontSize, setFontSize] = useState<number>(1); // 0 = base, 1 = lg, 2 = xl, 3 = 2xl
  const [highContrast, setHighContrast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isEs = lang === "es";

  const t = {
    increase: isEs ? "Aumentar texto" : "Increase text",
    decrease: isEs ? "Reducir texto" : "Decrease text",
    contrast: isEs ? "Alto contraste" : "High contrast",
    reset: isEs ? "Restablecer lectura" : "Reset reading view",
    tools: isEs ? "Opciones de lectura" : "Reading options",
  };

  useEffect(() => {
    const article = document.getElementById("article-content");
    if (!article) return;

    article.classList.remove("prose-base", "prose-lg", "prose-xl", "prose-2xl");

    if (fontSize === 0) article.classList.add("prose-base");
    if (fontSize === 1) article.classList.add("prose-lg");
    if (fontSize === 2) article.classList.add("prose-xl");
    if (fontSize === 3) article.classList.add("prose-2xl");

    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    return () => {
      document.documentElement.classList.remove("high-contrast");
    };
  }, [fontSize, highContrast]);

  return (
    <>
      {highContrast && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .high-contrast body {
            background-color: #000 !important;
            color: #fff !important;
          }
          .high-contrast article, .high-contrast header, .high-contrast main, .high-contrast .bg-card, .high-contrast .bg-background {
            background-color: #000 !important;
          }
          .high-contrast .prose {
             color: #fff !important;
          }
          .high-contrast h1, .high-contrast h2, .high-contrast h3, .high-contrast h4, .high-contrast strong, .high-contrast b {
             color: #fde047 !important;
          }
          .high-contrast a, .high-contrast .text-primary {
             color: #38bdf8 !important;
             text-decoration: underline !important;
          }
          .high-contrast p, .high-contrast li, .high-contrast span {
             color: #f1f5f9 !important;
          }
          .high-contrast .border, .high-contrast .border-border {
             border-color: #fde047 !important;
          }
        `,
          }}
        />
      )}

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 items-end">
        {isOpen && (
          <div className="bg-card shadow-lg border border-border rounded-2xl p-2 flex flex-col gap-1 min-w-[210px]">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1 font-heading">
              {t.tools}
            </div>
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.min(prev + 1, 3))}
              className="px-3 py-2 rounded-xl hover:bg-muted text-foreground transition-colors flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer font-accent"
              title={t.increase}
            >
              <span className="flex items-center gap-2.5">
                <ZoomIn className="w-4 h-4 text-primary" />
                {t.increase}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">A+</span>
            </button>
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.max(prev - 1, 0))}
              className="px-3 py-2 rounded-xl hover:bg-muted text-foreground transition-colors flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer font-accent"
              title={t.decrease}
            >
              <span className="flex items-center gap-2.5">
                <ZoomOut className="w-4 h-4 text-primary" />
                {t.decrease}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">A-</span>
            </button>
            <div className="h-px bg-border my-0.5" />
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-2 rounded-xl transition-colors flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer font-accent ${
                highContrast
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-foreground"
              }`}
              title={t.contrast}
            >
              <span className="flex items-center gap-2.5">
                <SunMoon className="w-4 h-4" />
                {t.contrast}
              </span>
              <span className="font-mono text-[10px] opacity-80">
                {highContrast ? "ON" : "OFF"}
              </span>
            </button>
            {(fontSize !== 1 || highContrast) && (
              <button
                type="button"
                onClick={() => {
                  setFontSize(1);
                  setHighContrast(false);
                }}
                className="px-3 py-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer font-accent"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.reset}</span>
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-md transition-all border text-xs font-semibold cursor-pointer font-accent ${
            isOpen
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-card text-foreground border-border hover:border-primary/40"
          }`}
          aria-label={t.tools}
          aria-expanded={isOpen}
          title={t.tools}
        >
          <Type className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">{t.tools}</span>
        </button>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, SunMoon, Type } from "lucide-react";

export function AccessibilityTools({ lang }: { lang: string }) {
  const [fontSize, setFontSize] = useState<number>(1); // 0 = base, 1 = lg, 2 = xl, 3 = 2xl
  const [highContrast, setHighContrast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const t = {
    increase: lang === 'es' ? "Aumentar texto" : "Increase text",
    decrease: lang === 'es' ? "Reducir texto" : "Decrease text",
    contrast: lang === 'es' ? "Alto contraste" : "High contrast",
    tools: lang === 'es' ? "Accesibilidad" : "Accessibility",
  };

  useEffect(() => {
    const article = document.getElementById("article-content");
    if (!article) return;

    // Reset classes
    article.classList.remove("prose-base", "prose-lg", "prose-xl", "prose-2xl");
    
    // Apply new font size class
    if (fontSize === 0) article.classList.add("prose-base");
    if (fontSize === 1) article.classList.add("prose-lg");
    if (fontSize === 2) article.classList.add("prose-xl");
    if (fontSize === 3) article.classList.add("prose-2xl");

    // Handle Contrast
    if (highContrast) {
       document.documentElement.classList.add("high-contrast");
    } else {
       document.documentElement.classList.remove("high-contrast");
    }
  }, [fontSize, highContrast]);

  return (
    <>
      {/* Dynamic styles for High Contrast */}
      {highContrast && (
        <style dangerouslySetInnerHTML={{__html: `
          .high-contrast body {
            background-color: #000 !important;
            color: #fff !important;
          }
          .high-contrast article, .high-contrast header, .high-contrast main, .high-contrast .bg-white, .high-contrast .bg-slate-50 {
            background-color: #000 !important;
          }
          .high-contrast .prose {
             color: #fff !important;
          }
          .high-contrast h1, .high-contrast h2, .high-contrast h3, .high-contrast h4, .high-contrast strong, .high-contrast b {
             color: #ffff00 !important;
          }
          .high-contrast a, .high-contrast .text-primary {
             color: #00ffff !important;
             text-decoration: underline !important;
          }
          .high-contrast .text-slate-500, .high-contrast .text-slate-600, .high-contrast .text-slate-900 {
             color: #eeeeee !important;
          }
          .high-contrast .border, .high-contrast .border-slate-100 {
             border-color: #ffff00 !important;
          }
        `}} />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {isOpen && (
          <div className="bg-white shadow-2xl border border-slate-200 rounded-2xl p-2 flex flex-col gap-1 backdrop-blur-md animate-in slide-in-from-bottom-2">
            <button
              onClick={() => setFontSize(prev => Math.min(prev + 1, 3))}
              className="p-3 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-3"
              title={t.increase}
              aria-label={t.increase}
            >
              <ZoomIn className="w-5 h-5" />
              <span className="text-sm font-semibold">{t.increase}</span>
            </button>
            <button
              onClick={() => setFontSize(prev => Math.max(prev - 1, 0))}
              className="p-3 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-3"
              title={t.decrease}
              aria-label={t.decrease}
            >
              <ZoomOut className="w-5 h-5" />
              <span className="text-sm font-semibold">{t.decrease}</span>
            </button>
            <div className="h-px bg-slate-200 mx-2 my-1" />
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-3 rounded-xl transition-colors flex items-center gap-3 ${
                highContrast 
                  ? "bg-slate-900 text-white" 
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              title={t.contrast}
              aria-label={t.contrast}
            >
              <SunMoon className="w-5 h-5" />
              <span className="text-sm font-semibold">{t.contrast}</span>
            </button>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-lg transition-colors border ${isOpen ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          aria-label={t.tools}
          title={t.tools}
        >
          <Type className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}

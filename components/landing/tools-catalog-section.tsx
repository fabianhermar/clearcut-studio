"use client";

import { useState } from "react";
import { ArrowUpRight, ShieldCheck, Sparkles, Cpu, Clock, CloudLightning } from "lucide-react";
import {
  STUDIO_TOOLS,
  UPCOMING_TOOLS,
  ALL_STUDIO_TOOLS,
  type ToolCategory,
  type ToolSlug,
} from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";

interface ToolsCatalogSectionProps {
  lang?: string;
  onSelectTool: (slug: ToolSlug) => void;
}

type FilterMode = "all" | "available" | "upcoming" | ToolCategory;

const CATEGORY_LABELS: Record<ToolCategory, { es: string; en: string }> = {
  core: {
    es: "IA y Compresión",
    en: "AI & Compression",
  },
  "privacy-compression": {
    es: "Privacidad y Formatos",
    en: "Privacy & Formats",
  },
  "design-social": {
    es: "Diseño y Recursos Web",
    en: "Design & Web Assets",
  },
};

export function ToolsCatalogSection({ lang = "es", onSelectTool }: ToolsCatalogSectionProps) {
  const isEn = lang === "en";
  const [activeFilter, setActiveFilter] = useState<FilterMode>("all");

  const filteredTools = (() => {
    if (activeFilter === "all") return ALL_STUDIO_TOOLS;
    if (activeFilter === "available") return STUDIO_TOOLS;
    if (activeFilter === "upcoming") return UPCOMING_TOOLS;
    return ALL_STUDIO_TOOLS.filter((tool) => tool.category === activeFilter);
  })();

  const filterTabs: Array<{ id: FilterMode; label: string }> = [
    {
      id: "all",
      label: isEn ? `All Suite (${ALL_STUDIO_TOOLS.length})` : `Toda la suite (${ALL_STUDIO_TOOLS.length})`,
    },
    {
      id: "available",
      label: isEn
        ? `Available now (${STUDIO_TOOLS.length})`
        : `Disponibles (${STUDIO_TOOLS.length})`,
    },
    {
      id: "upcoming",
      label: isEn
        ? `In testing & Coming soon (${UPCOMING_TOOLS.length})`
        : `Próximamente (${UPCOMING_TOOLS.length})`,
    },
    { id: "core", label: isEn ? CATEGORY_LABELS.core.en : CATEGORY_LABELS.core.es },
    {
      id: "privacy-compression",
      label: isEn
        ? CATEGORY_LABELS["privacy-compression"].en
        : CATEGORY_LABELS["privacy-compression"].es,
    },
    {
      id: "design-social",
      label: isEn
        ? CATEGORY_LABELS["design-social"].en
        : CATEGORY_LABELS["design-social"].es,
    },
  ];

  return (
    <section id="tools" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? "Complete Tool Suite" : "Catálogo de herramientas"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground tracking-tight">
              {isEn
                ? "Specialized image tools engineered for precision"
                : "Herramientas especializadas diseñadas con precisión"}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mt-3 leading-relaxed">
              {isEn
                ? "Use our 6 active browser-based tools immediately, or explore upcoming tools currently in testing—including batch utilities, mockups, and real-time streaming AI image generation."
                : "Utiliza al instante nuestras 6 herramientas activas en el navegador y descubre las próximas utilidades en fase de prueba — incluyendo generación de imágenes con IA en streaming (2, 4, 6 u 8 imágenes), mockups y procesamiento por lotes."}
            </p>
          </div>

          {/* Filter Pills */}
          <div
            role="tablist"
            aria-label={isEn ? "Filter tools by category" : "Filtrar herramientas por categoría"}
            className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-muted border border-border self-start"
          >
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTools.map((tool) => {
            const copy = isEn ? tool.en : tool.es;
            const execBadge = isEn ? tool.executionBadge.en : tool.executionBadge.es;
            const isComingSoon = Boolean(tool.comingSoon);
            const isFeatured =
              tool.featured && !isComingSoon && (activeFilter === "all" || activeFilter === "available");

            return (
              <article
                key={tool.slug}
                aria-disabled={isComingSoon ? "true" : undefined}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-150 ${
                  isComingSoon
                    ? "bg-muted/35 border-border/80 opacity-85"
                    : isFeatured
                    ? "md:col-span-2 border-primary/25 bg-gradient-to-br from-card via-card to-primary/[0.03] hover:border-primary/40 hover:shadow-md"
                    : "bg-background border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Badges */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                        isComingSoon
                          ? "bg-card text-muted-foreground border-border"
                          : isFeatured
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-primary border-border group-hover:bg-primary/10 group-hover:border-primary/20"
                      }`}
                    >
                      <ToolIcon slug={tool.slug} className="w-5 h-5" />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {tool.featured && !isComingSoon && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          {isEn ? "Featured" : "Principal"}
                        </span>
                      )}

                      {isComingSoon ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            tool.isCloudAi
                              ? "bg-blue-500/10 text-blue-800 border-blue-500/20"
                              : "bg-slate-200/80 text-slate-700 border-slate-300/80"
                          }`}
                        >
                          {tool.isCloudAi ? (
                            <CloudLightning className="w-3 h-3 text-blue-700" aria-hidden="true" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-600" aria-hidden="true" />
                          )}
                          {execBadge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                          {execBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {copy.tagline}
                    </span>
                    <h3
                      className={`text-xl font-bold font-heading text-foreground mt-0.5 transition-colors ${
                        isComingSoon ? "" : "group-hover:text-primary"
                      }`}
                    >
                      {isComingSoon ? (
                        <span>{copy.name}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectTool(tool.slug)}
                          className="text-left focus:outline-none after:absolute after:inset-0 cursor-pointer"
                        >
                          {copy.name}
                        </button>
                      )}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {copy.description}
                  </p>
                </div>

                {/* Bottom Bar: Formats & CTA */}
                <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono text-muted-foreground truncate">
                      {tool.formats.join(" · ")}
                    </span>
                  </div>

                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-slate-200/70 px-2.5 py-1 rounded-md shrink-0">
                      {isEn ? "Coming soon" : "Próximamente"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform shrink-0">
                      {copy.cta}
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

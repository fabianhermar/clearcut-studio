"use client";

import { useState } from "react";
import { ArrowUpRight, Clock, CloudLightning } from "lucide-react";
import {
  STUDIO_TOOLS,
  UPCOMING_TOOLS,
  type ToolCategory,
  type ToolSlug,
} from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";

interface ToolsCatalogSectionProps {
  lang?: string;
  onSelectTool: (slug: ToolSlug) => void;
}

type FilterMode = "all" | "available" | "upcoming" | ToolCategory;

function ToolSchematicPreview({ slug, isEn }: { slug: ToolSlug; isEn: boolean }) {
  switch (slug) {
    case "background-remover":
      return (
        <div className="mt-5 rounded-xl border border-border bg-[#0c0e12] p-3.5 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2.5">
            <span>LAYER // ONNX-SEG</span>
            <span className="text-emerald-400">ALPHA READY</span>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="h-16 rounded-lg overflow-hidden border border-[#242936] relative">
              <img
                src="/demos/demo-original.png"
                alt="Original"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/70 text-white px-1 rounded">
                SRC
              </span>
            </div>
            <div className="h-16 rounded-lg border border-[#242936] checkerboard-dark flex items-center justify-center relative">
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#1e40ff] bg-[#1e40ff]/20" />
              <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/70 text-slate-300 px-1 rounded">
                MASK
              </span>
            </div>
            <div className="h-16 rounded-lg overflow-hidden border border-[#242936] checkerboard-dark relative">
              <img
                src="/demos/demo-processed.avif"
                alt="Alpha cutout"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 text-[9px] font-mono bg-[#1e40ff] text-white px-1 rounded">
                PNG
              </span>
            </div>
          </div>
        </div>
      );

    case "image-optimizer":
      return (
        <div className="mt-5 rounded-xl border border-border bg-[#0c0e12] p-3.5 text-white">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-3">
            <span>WORKER // LIBAVIF + LIBWEBP</span>
            <span className="text-[#ff4d00] font-semibold">-90% DELTA</span>
          </div>
          <div className="space-y-2.5 font-mono text-[11px]">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>ORIGINAL.PNG</span>
                <span>2,410 KB</span>
              </div>
              <div className="h-2 rounded-full bg-[#1e2330] overflow-hidden">
                <div className="h-full w-full bg-slate-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white mb-1">
                <span className="text-emerald-400">OUTPUT.AVIF</span>
                <span className="text-emerald-400 font-bold">245 KB</span>
              </div>
              <div className="h-2 rounded-full bg-[#1e2330] overflow-hidden">
                <div className="h-full w-[14%] bg-[#1e40ff] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      );

    case "exif-stripper":
      return (
        <div className="mt-4 rounded-lg border border-border bg-[#faf9f5] p-2.5 font-mono text-[10px] space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>GPS_LAT</span>
            <span className="line-through text-red-700/80">19.4326° N</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>CAMERA</span>
            <span className="line-through text-red-700/80">SONY A7IV</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/70 text-emerald-800 font-semibold">
            <span>STATUS</span>
            <span>{isEn ? "CLEAN PIXELS" : "0 METADATOS"}</span>
          </div>
        </div>
      );

    case "aspect-ratio-fitter":
      return (
        <div className="mt-4 rounded-lg border border-border bg-[#faf9f5] p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 border-2 border-foreground rounded-xs flex items-center justify-center text-[8px] font-mono font-bold">
              1:1
            </div>
            <div className="w-5 h-7 border border-primary bg-primary/10 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-primary">
              4:5
            </div>
            <div className="w-8 h-5 border border-muted-foreground rounded-xs flex items-center justify-center text-[8px] font-mono text-muted-foreground">
              16:9
            </div>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">NO CROP</span>
        </div>
      );

    case "gradient-extractor":
      return (
        <div className="mt-4 rounded-lg border border-border bg-[#faf9f5] p-2.5 space-y-2">
          <div className="grid grid-cols-5 gap-1 h-4 rounded overflow-hidden">
            <span className="bg-[#0c0e12]" />
            <span className="bg-[#1e40ff]" />
            <span className="bg-[#60a5fa]" />
            <span className="bg-[#ff4d00]" />
            <span className="bg-[#f4f3ef]" />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>#1E40FF</span>
            <span>linear-gradient(...)</span>
          </div>
        </div>
      );

    case "favicon-generator":
      return (
        <div className="mt-4 rounded-lg border border-border bg-[#faf9f5] p-2.5 space-y-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-md px-2 py-1">
            <span className="w-3 h-3 rounded-xs bg-primary shrink-0" />
            <span className="text-[10px] font-mono text-foreground truncate">
              studio.app · 16px · 32px
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>ICO + APPLE</span>
            <span>MANIFEST.ZIP</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function ToolsCatalogSection({ lang = "es", onSelectTool }: ToolsCatalogSectionProps) {
  const isEn = lang === "en";
  const [activeFilter, setActiveFilter] = useState<FilterMode>("all");

  const featuredTools = STUDIO_TOOLS.filter((t) => t.featured);
  const utilityTools = STUDIO_TOOLS.filter((t) => !t.featured);

  const showActive = activeFilter === "all" || activeFilter === "available";
  const showUpcoming = activeFilter === "all" || activeFilter === "upcoming";

  const filteredByCategory =
    activeFilter !== "all" && activeFilter !== "available" && activeFilter !== "upcoming"
      ? [...STUDIO_TOOLS, ...UPCOMING_TOOLS].filter((t) => t.category === activeFilter)
      : null;

  const filterTabs: Array<{ id: FilterMode; label: string }> = [
    {
      id: "all",
      label: isEn ? "All Suite" : "Toda la suite",
    },
    {
      id: "available",
      label: isEn ? `Active (${STUDIO_TOOLS.length})` : `Activas (${STUDIO_TOOLS.length})`,
    },
    {
      id: "upcoming",
      label: isEn
        ? `Studio Lab (${UPCOMING_TOOLS.length})`
        : `Próximamente (${UPCOMING_TOOLS.length})`,
    },
    {
      id: "core",
      label: isEn ? "AI & Compression" : "IA y Compresión",
    },
    {
      id: "design-social",
      label: isEn ? "Design & Web" : "Diseño y Web",
    },
  ];

  return (
    <section id="tools" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Swiss Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-8 border-b border-border">
          <div className="max-w-2xl">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-primary mb-3">
              01 // {isEn ? "STUDIO WORKBENCH" : "CATÁLOGO DEL ESTUDIO"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-heading text-foreground tracking-[-0.03em] leading-[1.05]">
              {isEn
                ? "Specialized image tools engineered for precision"
                : "Herramientas especializadas diseñadas con precisión"}
            </h2>
          </div>

          {/* Segmented Architectural Filter */}
          <div
            role="tablist"
            aria-label={isEn ? "Filter tools by category" : "Filtrar herramientas por categoría"}
            className="flex flex-wrap gap-1 p-1 rounded-full bg-card border border-border self-start shadow-2xs"
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#0c0e12] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filtered View */}
        {filteredByCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border bg-card rounded-2xl overflow-hidden shadow-2xs">
            {filteredByCategory.map((tool, index) => {
              const copy = isEn ? tool.en : tool.es;
              const isComingSoon = Boolean(tool.comingSoon);
              return (
                <article
                  key={tool.slug}
                  className={`relative p-6 sm:p-8 border-r border-b border-border flex flex-col justify-between transition-colors ${
                    isComingSoon ? "bg-[#faf9f5] opacity-80" : "bg-card hover:bg-[#faf9f5]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          isComingSoon
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-emerald-500/10 text-emerald-900 border-emerald-600/20"
                        }`}
                      >
                        {isEn ? tool.executionBadge.en : tool.executionBadge.es}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-heading text-foreground mb-2">
                      {isComingSoon ? (
                        copy.name
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectTool(tool.slug)}
                          className="text-left hover:text-primary transition-colors after:absolute after:inset-0 cursor-pointer"
                        >
                          {copy.name}
                        </button>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {copy.description}
                    </p>
                  </div>
                  <div className="pt-5 mt-6 border-t border-border/70 flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">
                      {tool.formats.join(" · ")}
                    </span>
                    <span
                      className={`font-semibold inline-flex items-center gap-1 ${
                        isComingSoon ? "text-muted-foreground" : "text-primary"
                      }`}
                    >
                      {isComingSoon ? (isEn ? "Soon" : "Pronto") : copy.cta}
                      {!isComingSoon && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active Tools Showcase */}
            {showActive && (
              <div className="space-y-6">
                {/* Row 1: Two Featured Flagship Tools with Live Schematics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredTools.map((tool, idx) => {
                    const copy = isEn ? tool.en : tool.es;
                    return (
                      <article
                        key={tool.slug}
                        className="group relative bg-card border border-border hover:border-primary/50 rounded-2xl p-6 sm:p-8 transition-all tactile-surface flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-primary">
                                0{idx + 1}
                              </span>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                                {copy.tagline}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-900 border border-emerald-600/20 font-semibold">
                              {isEn ? tool.executionBadge.en : tool.executionBadge.es}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground group-hover:text-primary transition-colors mb-2.5 tracking-tight">
                            <button
                              type="button"
                              onClick={() => onSelectTool(tool.slug)}
                              className="text-left focus:outline-none after:absolute after:inset-0 cursor-pointer"
                            >
                              {copy.name}
                            </button>
                          </h3>

                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {copy.description}
                          </p>

                          <ToolSchematicPreview slug={tool.slug} isEn={isEn} />
                        </div>

                        <div className="pt-5 mt-6 border-t border-border flex items-center justify-between gap-3">
                          <span className="text-xs font-mono text-muted-foreground">
                            {tool.formats.join(" · ")}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {copy.cta}
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Row 2: 4 Utility Tools in Swiss Hairline Architectural Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-border rounded-2xl overflow-hidden bg-card tactile-surface divide-y md:divide-y-0 md:divide-x divide-border">
                  {utilityTools.map((tool, idx) => {
                    const copy = isEn ? tool.en : tool.es;
                    return (
                      <article
                        key={tool.slug}
                        className="group relative p-6 flex flex-col justify-between bg-card hover:bg-[#faf9f5] transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="font-mono text-xs font-bold text-primary">
                              0{idx + 3}
                            </span>
                            <ToolIcon
                              slug={tool.slug}
                              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                            />
                          </div>

                          <h3 className="text-lg font-bold font-heading text-foreground group-hover:text-primary transition-colors mb-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectTool(tool.slug)}
                              className="text-left focus:outline-none after:absolute after:inset-0 cursor-pointer"
                            >
                              {copy.shortName}
                            </button>
                          </h3>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {copy.description}
                          </p>

                          <ToolSchematicPreview slug={tool.slug} isEn={isEn} />
                        </div>

                        <div className="pt-4 mt-5 border-t border-border/70 flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {tool.formats.slice(0, 3).join(" · ")}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                            <span>{isEn ? "Open" : "Abrir"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Studio Lab: In Testing & Upcoming Tools */}
            {showUpcoming && (
              <div className="rounded-2xl border border-[#242936] bg-[#0c0e12] text-white p-6 sm:p-8 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#242936]">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-[#ff4d00] mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00]" />
                      <span>STUDIO LAB // {isEn ? "IN TESTING & ROADMAP" : "EN PRUEBAS Y PRÓXIMAMENTE"}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                      {isEn
                        ? "Upcoming engines in active development"
                        : "Próximas herramientas en fase de prueba e integración"}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-[#14171f] border border-[#242936] px-3 py-1.5 rounded-full self-start sm:self-auto">
                    {UPCOMING_TOOLS.length} {isEn ? "modules queued" : "módulos en desarrollo"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {UPCOMING_TOOLS.map((tool) => {
                    const copy = isEn ? tool.en : tool.es;
                    return (
                      <div
                        key={tool.slug}
                        aria-disabled="true"
                        className={`p-4 rounded-xl border flex flex-col justify-between select-none ${
                          tool.isCloudAi
                            ? "bg-[#141926] border-[#2d3b66]"
                            : "bg-[#14171f] border-[#242936]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <ToolIcon
                              slug={tool.slug}
                              className={`w-4 h-4 ${
                                tool.isCloudAi ? "text-[#60a5fa]" : "text-slate-400"
                              }`}
                            />
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                tool.isCloudAi
                                  ? "bg-[#1e40ff]/25 text-[#93c5fd] border border-[#1e40ff]/40"
                                  : "bg-[#1f2430] text-slate-300"
                              }`}
                            >
                              {tool.isCloudAi ? (
                                <CloudLightning className="w-2.5 h-2.5" />
                              ) : (
                                <Clock className="w-2.5 h-2.5" />
                              )}
                              {isEn ? "Soon" : "Pronto"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold font-heading text-white mb-1">
                            {copy.shortName}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                            {copy.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 truncate">
                          {tool.formats.join(" · ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

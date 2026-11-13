"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Info,
  Layers,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import {
  STUDIO_TOOLS,
  UPCOMING_TOOLS,
  type StudioTool,
  type ToolSlug,
} from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";

interface HeaderProps {
  onSelectTool?: (slug: ToolSlug) => void;
  onStartBackgroundRemover?: () => void;
  onStartOptimizer?: () => void;
  onStartMockupGenerator?: () => void;
  onStartFaviconGenerator?: () => void;
  onStartAspectRatioFitter?: () => void;
  onStartGradientExtractor?: () => void;
  onStartExifStripper?: () => void;
  onStartBatchWatermarker?: () => void;
  dict?: any;
  lang?: string;
}

export function Header({
  onSelectTool,
  onStartBackgroundRemover,
  onStartOptimizer,
  onStartMockupGenerator,
  onStartFaviconGenerator,
  onStartAspectRatioFitter,
  onStartGradientExtractor,
  onStartExifStripper,
  onStartBatchWatermarker,
  dict,
  lang = "es",
}: HeaderProps) {
  const pathname = usePathname();
  const isEs = lang === "es";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const pricingLabel = dict?.header?.pricing || (isEs ? "Precios" : "Pricing");
  const soonLabel = dict?.common?.comingSoon || (isEs ? "Pronto" : "Soon");

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsToolsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsToolsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const switchLanguage = (newLang: string) => {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLang;
    window.location.href = segments.join("/") + window.location.search;
  };

  const handleToolTrigger = (e: React.MouseEvent, tool: StudioTool) => {
    if (tool.comingSoon) {
      e.preventDefault();
      return;
    }

    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);

    if (onSelectTool) {
      e.preventDefault();
      onSelectTool(tool.slug);
      return;
    }

    const legacyMap: Partial<Record<ToolSlug, (() => void) | undefined>> = {
      "background-remover": onStartBackgroundRemover,
      "image-optimizer": onStartOptimizer,
      "mockup-generator": onStartMockupGenerator,
      "favicon-generator": onStartFaviconGenerator,
      "aspect-ratio-fitter": onStartAspectRatioFitter,
      "gradient-extractor": onStartGradientExtractor,
      "exif-stripper": onStartExifStripper,
      "batch-watermarker": onStartBatchWatermarker,
    };

    const handler = legacyMap[tool.slug];
    if (handler) {
      e.preventDefault();
      handler();
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#f4f3ef]/88 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href={`/${lang}`}
              className="flex items-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="ClearCut Studio — Inicio"
            >
              <img
                src="/logos/ClearCut-logo.avif"
                alt="ClearCut Studio"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation — Architectural Studio Pill Rail */}
          <nav
            aria-label={isEs ? "Navegación principal" : "Main navigation"}
            className="hidden md:flex items-center gap-0.5 bg-card/80 border border-border rounded-full px-1.5 py-1 shadow-soft"
          >
            {/* Tools Mega Menu Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsToolsOpen(true)}
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={isToolsOpen}
                aria-haspopup="true"
                onClick={() => setIsToolsOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors font-accent cursor-pointer ${
                  isToolsOpen
                    ? "bg-foreground text-white"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>{isEs ? "Herramientas" : "Tools"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    isToolsOpen ? "rotate-180" : "opacity-65"
                  }`}
                />
              </button>

              {isToolsOpen && (
                <div className="absolute left-0 top-full pt-3 w-[740px] lg:w-[880px] z-50">
                  <div className="bg-card border border-border rounded-2xl shadow-medium overflow-hidden grid grid-cols-12">
                    {/* Left Column: Active Studio Tools (6) */}
                    <div className="col-span-6 p-5 border-r border-border">
                      <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-border/70">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                          01 // {isEs ? "Disponibles ahora" : "Available now"}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-900 bg-emerald-500/12 border border-emerald-600/20 px-2 py-0.5 rounded-full font-semibold">
                          {STUDIO_TOOLS.length} {isEs ? "activas" : "active"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {STUDIO_TOOLS.map((tool, idx) => {
                          const copy = isEs ? tool.es : tool.en;
                          return (
                            <Link
                              key={tool.slug}
                              href={`/${lang}/?tool=${tool.slug}`}
                              onClick={(e) => handleToolTrigger(e, tool)}
                              className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-background transition-colors border border-transparent hover:border-border"
                            >
                              <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div className="w-8 h-8 rounded-lg bg-foreground text-white flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                <ToolIcon slug={tool.slug} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-foreground font-heading group-hover:text-primary transition-colors truncate">
                                    {copy.shortName}
                                  </span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <p className="text-[11px] text-muted-foreground font-accent truncate">
                                  {copy.tagline}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Studio Lab / Testing & Upcoming */}
                    <div className="col-span-6 p-5 bg-[#faf9f5] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-border/70">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            02 // {isEs ? "Studio Lab · Pruebas" : "Studio Lab · Testing"}
                          </span>
                          <span className="text-[10px] font-mono text-foreground bg-muted border border-border px-2 py-0.5 rounded-full uppercase font-semibold">
                            {soonLabel}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {UPCOMING_TOOLS.map((tool) => {
                            const copy = isEs ? tool.es : tool.en;
                            return (
                              <div
                                key={tool.slug}
                                aria-disabled="true"
                                className="flex items-start gap-2.5 p-2 rounded-xl bg-card/60 border border-border/60 opacity-75 select-none cursor-not-allowed"
                              >
                                <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                                  <ToolIcon slug={tool.slug} className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-foreground font-heading truncate">
                                      {copy.shortName}
                                    </span>
                                  </div>
                                  <span className="inline-block text-[9px] font-mono uppercase text-muted-foreground mt-0.5">
                                    {soonLabel}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-border flex items-center justify-between px-1">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {isEs
                            ? "Lanzamientos progresivos"
                            : "Progressive releases"}
                        </span>
                        <Link
                          href={`/${lang}/#tools`}
                          onClick={() => setIsToolsOpen(false)}
                          className="text-xs font-bold text-primary hover:underline font-accent"
                        >
                          {isEs ? "Explorar catálogo →" : "Explore catalog →"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`/${lang}/#tools`}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors font-accent"
            >
              {isEs ? "Catálogo" : "Catalog"}
            </Link>

            <Link
              href={`/${lang}/blog`}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors font-accent ${
                pathname?.includes("/blog")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              Blog
            </Link>

            <Link
              href={`/${lang}/about`}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors font-accent ${
                pathname?.includes("/about")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              {isEs ? "Acerca de" : "About"}
            </Link>

            <Link
              href={`/${lang}/pricing`}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors font-accent ${
                pathname?.includes("/pricing")
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              {pricingLabel}
            </Link>
          </nav>

          {/* Right Controls: Language Switcher + Tactile Primary CTA + Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div
              role="group"
              aria-label={isEs ? "Selector de idioma" : "Language selector"}
              className="flex bg-card border border-border p-0.5 rounded-full font-mono text-[11px] shadow-2xs"
            >
              <button
                type="button"
                onClick={() => switchLanguage("es")}
                aria-current={lang === "es" ? "true" : undefined}
                className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  lang === "es"
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                aria-current={lang === "en" ? "true" : undefined}
                className={`px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>

            {/* Tactile Studio Action */}
            <Link
              href={`/${lang}/?tool=background-remover`}
              onClick={(e) => handleToolTrigger(e, STUDIO_TOOLS[0])}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#0c0e12] hover:bg-primary text-white text-xs sm:text-sm font-semibold rounded-full transition-all tactile-button font-accent"
            >
              <span>{isEs ? "Abrir Estudio" : "Open Studio"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? isEs
                    ? "Cerrar menú"
                    : "Close menu"
                  : isEs
                  ? "Abrir menú"
                  : "Open menu"
              }
              className="md:hidden p-2 rounded-full text-foreground bg-card hover:bg-muted border border-border transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card shadow-medium max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  {isEs
                    ? `Herramientas Disponibles (${STUDIO_TOOLS.length})`
                    : `Available Tools (${STUDIO_TOOLS.length})`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STUDIO_TOOLS.map((tool, idx) => {
                  const copy = isEs ? tool.es : tool.en;
                  return (
                    <Link
                      key={tool.slug}
                      href={`/${lang}/?tool=${tool.slug}`}
                      onClick={(e) => handleToolTrigger(e, tool)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted border border-border transition-colors"
                    >
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-foreground text-white flex items-center justify-center shrink-0">
                        <ToolIcon slug={tool.slug} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-foreground font-heading truncate">
                          {copy.shortName}
                        </div>
                        <div className="text-xs text-muted-foreground font-accent truncate">
                          {copy.tagline}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                  {isEs ? "Studio Lab · Próximamente" : "Studio Lab · Coming soon"}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full uppercase">
                  {soonLabel}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {UPCOMING_TOOLS.slice(0, 6).map((tool) => {
                  const copy = isEs ? tool.es : tool.en;
                  return (
                    <div
                      key={tool.slug}
                      aria-disabled="true"
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/60 opacity-70 select-none"
                    >
                      <ToolIcon slug={tool.slug} className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-foreground font-heading truncate">
                        {copy.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                {isEs ? "Navegación" : "Navigation"}
              </div>
              <div className="grid grid-cols-2 gap-2 font-accent text-sm">
                <Link
                  href={`/${lang}/blog`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted text-foreground font-medium"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Blog</span>
                </Link>
                <Link
                  href={`/${lang}/about`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted text-foreground font-medium"
                >
                  <Info className="w-4 h-4 text-primary" />
                  <span>{isEs ? "Acerca de" : "About"}</span>
                </Link>
                <Link
                  href={`/${lang}/brand`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted text-foreground font-medium"
                >
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{isEs ? "Marca" : "Brand"}</span>
                </Link>
                <Link
                  href={`/${lang}/pricing`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted text-foreground font-medium"
                >
                  <Tag className="w-4 h-4 text-primary" />
                  <span>{pricingLabel}</span>
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/${lang}/?tool=background-remover`}
                onClick={(e) => handleToolTrigger(e, STUDIO_TOOLS[0])}
                className="w-full py-3 px-4 bg-[#0c0e12] hover:bg-primary text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 tactile-button font-accent"
              >
                <span>
                  {isEs ? "Abrir Estudio Ahora" : "Open Studio Now"}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

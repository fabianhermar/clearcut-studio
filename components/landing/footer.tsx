"use client";

import Link from "next/link";
import { STUDIO_TOOLS, UPCOMING_TOOLS, ToolSlug } from "@/lib/tools-catalog";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

interface FooterProps {
  dict?: any;
  lang?: string;
  onSelectTool?: (slug: ToolSlug) => void;
}

export function Footer({ dict, lang = "es", onSelectTool }: FooterProps) {
  const isEs = lang === "es";
  const soonLabel = dict?.common?.comingSoon || (isEs ? "Pronto" : "Soon");
  const pricingLabel = dict?.header?.pricing || (isEs ? "Precios" : "Pricing");

  return (
    <footer className="bg-darkroom text-darkroom-foreground border-t border-white/10 pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Verifiable Privacy Statement */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-5">
            <Link href={`/${lang}`} className="inline-block">
              <img
                src="/logos/ClearCut-logo.avif"
                alt="ClearCut Studio"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-slate-400 font-accent max-w-sm leading-relaxed">
              {isEs
                ? "ClearCut Studio es un estudio web de precisión para procesar, optimizar y preparar imágenes directamente en tu navegador mediante WebAssembly y Canvas API."
                : "ClearCut Studio is a precision web studio for processing, optimizing, and preparing images directly inside your browser via WebAssembly and the Canvas API."}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>
                {isEs
                  ? "LOCAL ON-DEVICE · SIN MARCAS DE AGUA"
                  : "LOCAL ON-DEVICE · NO WATERMARKS"}
              </span>
            </div>
          </div>

          {/* Column 1: Available Tools */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {isEs ? "01 // Disponibles" : "01 // Available"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-slate-300">
              {STUDIO_TOOLS.map((tool) => {
                const copy = isEs ? tool.es : tool.en;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={`/${lang}/?tool=${tool.slug}`}
                      onClick={(e) => {
                        if (onSelectTool) {
                          e.preventDefault();
                          onSelectTool(tool.slug);
                        }
                      }}
                      className="hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span>{copy.shortName}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 2: In Testing & Upcoming Tools */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {isEs ? "02 // Studio Lab" : "02 // Studio Lab"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-slate-400">
              {UPCOMING_TOOLS.slice(0, 6).map((tool) => {
                const copy = isEs ? tool.es : tool.en;
                return (
                  <li key={tool.slug} className="flex items-center justify-between gap-2 max-w-[230px]">
                    <span className="truncate">{copy.shortName}</span>
                    <span className="font-mono text-[9px] uppercase bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                      {soonLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Resources, Company & Legal */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {isEs ? "03 // Proyecto" : "03 // Project"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-slate-300">
              <li>
                <Link href={`/${lang}/blog`} className="hover:text-white transition-colors">
                  {isEs ? "Blog y Artículos" : "Blog & Articles"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-white transition-colors">
                  {isEs ? "Acerca de nosotros" : "About us"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-white transition-colors">
                  {pricingLabel}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/brand`} className="hover:text-white transition-colors">
                  {isEs ? "Manifiesto y Marca" : "Manifesto & Brand"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-white transition-colors">
                  {isEs ? "Política de Privacidad" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-white transition-colors">
                  {isEs ? "Términos de Uso" : "Terms of Use"}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:soporte@clearcut.studio"
                  className="hover:text-white transition-colors"
                >
                  {isEs ? "Soporte y Contacto" : "Support & Contact"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="font-mono text-xs text-slate-400">
            &copy; {new Date().getFullYear()}{" "}
            {isEs
              ? "ClearCut Studio. Todos los derechos reservados."
              : "ClearCut Studio. All rights reserved."}
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <p className="flex items-center gap-2 flex-wrap font-accent">
              <span>
                {isEs ? "Diseñado y desarrollado por" : "Designed and developed by"}
              </span>
              <a
                href="https://fabianh.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-accent font-semibold inline-flex items-center gap-1"
              >
                <img
                  src="/logos/fh-logo.svg"
                  alt="Fabian Herrera"
                  className="h-5 w-auto shrink-0 align-middle brightness-0 invert"
                />
              </a>
              <span>{isEs ? "con la asistencia de" : "with the assistance of"}</span>
              <a
                href="https://antigravity.google"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-white hover:text-accent align-middle"
              >
                <img
                  src="/logos/antigravity-wordmark.svg"
                  alt="Google Antigravity"
                  className="h-4 w-auto shrink-0 align-middle brightness-0 invert"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

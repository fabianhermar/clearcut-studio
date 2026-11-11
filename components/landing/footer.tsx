"use client";

import Link from "next/link";
import { STUDIO_TOOLS, UPCOMING_TOOLS, ToolSlug } from "@/lib/tools-catalog";
import { ShieldCheck } from "lucide-react";

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
    <footer className="py-16 px-4 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand & Verifiable Privacy Statement */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <Link href={`/${lang}`} className="inline-block">
              <img
                src="/logos/ClearCut-logo.avif"
                alt="ClearCut Studio"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground font-accent max-w-sm leading-relaxed">
              {isEs
                ? "ClearCut Studio es un estudio web de herramientas para procesar, optimizar y preparar imágenes directamente en tu navegador mediante WebAssembly y Canvas API."
                : "ClearCut Studio is a web toolkit for processing, optimizing, and preparing images directly inside your browser via WebAssembly and the Canvas API."}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium font-accent">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isEs
                  ? "Procesamiento local en tu dispositivo · Sin marcas de agua"
                  : "Local on-device processing · No watermarks"}
              </span>
            </div>
          </div>

          {/* Column 1: Available Tools */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
              {isEs ? "Herramientas Disponibles" : "Available Tools"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-muted-foreground">
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
                      className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{copy.shortName}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 2: In Testing & Upcoming Tools */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
              {isEs ? "En Pruebas y Próximamente" : "In Testing & Coming Soon"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-muted-foreground">
              {UPCOMING_TOOLS.slice(0, 6).map((tool) => {
                const copy = isEs ? tool.es : tool.en;
                return (
                  <li key={tool.slug} className="flex items-center gap-2 opacity-75">
                    <span>{copy.shortName}</span>
                    <span className="text-[9px] uppercase bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {soonLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Resources, Company & Legal */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
              {isEs ? "Proyecto y Legal" : "Project & Legal"}
            </h3>
            <ul className="space-y-2.5 text-sm font-accent text-muted-foreground">
              <li>
                <Link href={`/${lang}/blog`} className="hover:text-primary transition-colors">
                  {isEs ? "Blog y Artículos" : "Blog & Articles"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-primary transition-colors">
                  {isEs ? "Acerca de nosotros" : "About us"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-primary transition-colors">
                  {pricingLabel}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/brand`} className="hover:text-primary transition-colors">
                  {isEs ? "Manifiesto y Marca" : "Manifesto & Brand"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-primary transition-colors">
                  {isEs ? "Política de Privacidad" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-primary transition-colors">
                  {isEs ? "Términos de Uso" : "Terms of Use"}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:soporte@clearcut.studio"
                  className="hover:text-primary transition-colors"
                >
                  {isEs ? "Soporte y Contacto" : "Support & Contact"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground font-accent">
            &copy; {new Date().getFullYear()}{" "}
            {isEs
              ? "ClearCut Studio. Todos los derechos reservados."
              : "ClearCut Studio. All rights reserved."}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 flex-wrap font-accent">
              <span>
                {isEs
                  ? "Diseñado y desarrollado por"
                  : "Designed and developed by"}
              </span>
              <a
                href="https://fabianh.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary font-semibold inline-flex items-center gap-1"
              >
                <img
                  src="/logos/fh-logo.svg"
                  alt="Fabian Herrera"
                  className="h-5 w-auto shrink-0 align-middle"
                />
              </a>
              <span>{isEs ? "con la asistencia de" : "with the assistance of"}</span>
              <a
                href="https://antigravity.google"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-foreground hover:text-primary align-middle"
              >
                <img
                  src="/logos/antigravity-wordmark.svg"
                  alt="Google Antigravity"
                  className="h-4 w-auto shrink-0 align-middle"
                />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

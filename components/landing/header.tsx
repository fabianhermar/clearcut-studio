"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  Zap, 
  Eraser, 
  ShieldAlert,
  BookOpen,
  Info,
  Layers,
  Menu,
  Crop,
  FileCode,
  Files,
  Palette,
  Monitor,
  AppWindow,
  ImagePlus,
  Paintbrush,
  Maximize,
  Stamp,
  Aperture,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface HeaderProps {
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

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon?: React.ReactNode; comingSoon?: boolean }
>(({ className, title, children, icon, comingSoon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group flex select-none gap-3 space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
            comingSoon ? "opacity-60 cursor-not-allowed hover:bg-transparent" : "",
            className
          )}
          {...props}
          onClick={(e) => {
            if (comingSoon) {
              e.preventDefault();
            } else if (props.onClick) {
              props.onClick(e);
            }
          }}
        >
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-900 group-hover:bg-white group-hover:text-primary transition-colors border border-slate-200">
              {icon}
            </div>
          )}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm font-bold leading-none text-slate-900 font-heading">
              {title}
              {comingSoon && (
                <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
              )}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-slate-500 font-accent mt-1">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function Header({ onStartBackgroundRemover, onStartOptimizer, onStartMockupGenerator, onStartFaviconGenerator, onStartAspectRatioFitter, onStartGradientExtractor, onStartExifStripper, onStartBatchWatermarker, dict, lang = "en" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);

  const t = dict?.header || {
    features: "Features",
    howItWorks: "How it works",
    about: "About us",
    pricing: "Pricing",
    optimizerBtn: "Optimizer",
    startBtn: "Start for free"
  };

  const dt = dict?.footer || {
    products: "Products",
    productsBg: "Background Remover",
    productsOpt: "Image Optimizer",
    productsCrop: "Crop & Upscale",
    productsSvg: "SVG Optimizer",
    productsMagicEraser: "Magic Eraser",
    productsExif: "EXIF Stripper",
    productsConverter: "Bulk HEIC Converter",
    productsColor: "Color Palette Generator",
    company: "Company",
    companyAbout: "About us",
    companyBrand: "The Project & Brand",
  };

  const switchLanguage = (newLang: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLang;
    window.location.href = segments.join('/') + window.location.search;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href={`/${lang}`}>
              <img src="/logos/ClearCut-logo.avif" alt="ClearCut" className="h-24 w-auto -ml-2" />
            </Link>
          </div>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-accent">{dt.products}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[650px] md:grid-cols-2 lg:w-[900px] lg:grid-cols-3">
                      <ListItem
                        href={`/${lang}/?tool=background-remover`}
                        title={dt.productsBg}
                        icon={<ImageIcon className="h-5 w-5" />}
                        onClick={(e) => {
                          if (onStartBackgroundRemover) {
                            e.preventDefault();
                            onStartBackgroundRemover();
                          }
                        }}
                      >
                        {lang === 'es' ? 'Elimina fondos al instante con IA.' : 'Remove backgrounds instantly with AI.'}
                      </ListItem>
                      <ListItem
                        href={`/${lang}/?tool=optimizer`}
                        title={dt.productsOpt}
                        icon={<Zap className="h-5 w-5" />}
                        onClick={(e) => {
                          if (onStartOptimizer) {
                            e.preventDefault();
                            onStartOptimizer();
                          }
                        }}
                      >
                        {lang === 'es' ? 'Comprime imágenes sin perder calidad.' : 'Compress images without losing quality.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="Framed"
                        icon={<Monitor className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Generador de mockups y marcos.' : 'Mockup and device framer.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsMagicEraser}
                        icon={<Eraser className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Borra objetos no deseados.' : 'Erase unwanted objects.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsCrop}
                        icon={<Crop className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Recorta y mejora imágenes.' : 'Crop and upscale images.'}
                      </ListItem>
                      <ListItem
                        href={`/${lang}/?tool=favicon-generator`}
                        title="Favicon Generator"
                        icon={<AppWindow className="h-5 w-5" />}
                        onClick={(e) => {
                          if (onStartFaviconGenerator) {
                            e.preventDefault();
                            onStartFaviconGenerator();
                          }
                        }}
                      >
                        {lang === 'es' ? 'Genera favicons y assets PWA.' : 'Generate favicons & PWA assets.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="Aspect Ratio Fitter"
                        icon={<Maximize className="h-5 w-5" />}
                        onClick={(e) => {
                          e.preventDefault();
                          onStartAspectRatioFitter?.();
                        }}
                      >
                        {lang === 'es' ? 'Adapta fotos para redes sociales.' : 'Adapt images for any social media platform instantly.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="RAW Converter"
                        icon={<Aperture className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Visor y conversor de fotos RAW.' : 'RAW photo viewer & converter.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsConverter}
                        icon={<Files className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Convierte HEIC por lotes.' : 'Batch convert HEIC.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="Responsive Images"
                        icon={<ImagePlus className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Generador masivo de srcset.' : 'Batch srcset generator.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsSvg}
                        icon={<FileCode className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Optimiza gráficos vectoriales.' : 'Optimize vector graphics.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="Gradient Extractor"
                        icon={<Palette className="h-5 w-5" />}
                        onClick={(e) => {
                          e.preventDefault();
                          onStartGradientExtractor?.();
                        }}
                      >
                        {lang === 'es' ? 'Extrae gradientes CSS de imágenes.' : 'Extract CSS gradients from images.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsColor}
                        icon={<Palette className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Extrae paletas de colores.' : 'Extract color palettes.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title="Batch Watermarker"
                        icon={<Stamp className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Pon marcas de agua masivamente.' : 'Apply watermarks in bulk.'}
                      </ListItem>
                      <ListItem
                        href={`/${lang}/?tool=exif-stripper`}
                        title={dt.productsExif}
                        icon={<ShieldAlert className="h-5 w-5" />}
                        onClick={(e) => {
                          if (onStartExifStripper) {
                            e.preventDefault();
                            onStartExifStripper();
                          }
                        }}
                      >
                        {lang === 'es' ? 'Limpia metadatos ocultos.' : 'Clean hidden metadata.'}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-accent">{lang === 'es' ? 'Recursos' : 'Resources'}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-3 p-4 md:w-[400px]">
                      <ListItem
                        href={`/${lang}/blog`}
                        title="Blog"
                        icon={<BookOpen className="h-5 w-5" />}
                      >
                        {lang === 'es' ? 'Noticias, guías y tutoriales.' : 'News, guides and tutorials.'}
                      </ListItem>
                      <ListItem
                        href={`/${lang}/about`}
                        title={dt.companyAbout}
                        icon={<Info className="h-5 w-5" />}
                      >
                        {lang === 'es' ? 'Conoce a nuestro equipo.' : 'Meet our team.'}
                      </ListItem>
                      <ListItem
                        href={`/${lang}/brand`}
                        title={dt.companyBrand}
                        icon={<Layers className="h-5 w-5" />}
                      >
                        {lang === 'es' ? 'Nuestra identidad y misión.' : 'Our identity and mission.'}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "font-accent")}>
                    <Link href={`/${lang}/#how-it-works`}>
                      {t.howItWorks}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "font-accent")}>
                    <Link href={`/${lang}/pricing`}>
                      {t.pricing}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher */}
            <div className="flex bg-muted/50 p-1 rounded-lg mr-2 font-accent text-xs">
              <button 
                onClick={() => switchLanguage('en')}
                className={`px-2 py-1 rounded-md transition-colors ${lang === 'en' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                EN
              </button>
              <button 
                onClick={() => switchLanguage('es')}
                className={`px-2 py-1 rounded-md transition-colors ${lang === 'es' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                ES
              </button>
            </div>

            {/* Mobile Menu Toggle (Only visible on small screens) */}
            <div className="md:hidden flex items-center">
               <button>
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
               >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>

            {/* Main CTA button */}
            {onStartBackgroundRemover ? (
              <button>
                onClick={onStartBackgroundRemover}
                className="hidden sm:inline-flex px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors shadow-sm font-accent"
              >
                {t.startBtn}
              </button>
            ) : (
              <Link
                href={`/${lang}`}
                className="hidden sm:inline-flex px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors shadow-sm font-accent"
              >
                {t.startBtn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-6 flex flex-col gap-6">

            {/* Products (Mobile) */}
            <div className="space-y-3">
              <button
                onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                className="w-full flex items-center justify-between font-heading font-semibold text-foreground px-2 py-1"
              >
                {dt.products}
                {isMobileProductsOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {isMobileProductsOpen && (
                <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-slate-100 ml-2">
                  <Link
                    href={`/${lang}/?tool=background-remover`}
                    onClick={(e) => {
                      if (onStartBackgroundRemover) {
                        e.preventDefault();
                        onStartBackgroundRemover();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <ImageIcon className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">{dt.productsBg}</span>
                  </Link>
                  <Link
                    href={`/${lang}/?tool=optimizer`}
                    onClick={(e) => {
                      if (onStartOptimizer) {
                        e.preventDefault();
                        onStartOptimizer();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <Zap className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">{dt.productsOpt}</span>
                  </Link>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Monitor className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">Framed</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Eraser className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">{dt.productsMagicEraser}</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Crop className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">{dt.productsCrop}</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <Link
                    href={`/${lang}/?tool=favicon-generator`}
                    onClick={(e) => {
                      if (onStartFaviconGenerator) {
                        e.preventDefault();
                        onStartFaviconGenerator();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <AppWindow className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">Favicon Generator</span>
                  </Link>
                  <Link
                    href={`/${lang}/?tool=aspect-ratio`}
                    onClick={(e) => {
                      if (onStartAspectRatioFitter) {
                        e.preventDefault();
                        onStartAspectRatioFitter();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <Maximize className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">Aspect Ratio Fitter</span>
                  </Link>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Aperture className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">RAW Converter</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Files className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">{dt.productsConverter}</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <ImagePlus className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">Responsive Images</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <FileCode className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">{dt.productsSvg}</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <Link
                    href={`/${lang}/?tool=gradient-extractor`}
                    onClick={(e) => {
                      if (onStartGradientExtractor) {
                        e.preventDefault();
                        onStartGradientExtractor();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <Paintbrush className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">Gradient Extractor</span>
                  </Link>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Palette className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">{dt.productsColor}</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                    <Stamp className="h-5 w-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-500 flex-1">Batch Watermarker</span>
                    <span className="text-[9px] uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">Soon</span>
                  </div>
                  <Link
                    href={`/${lang}/?tool=exif-stripper`}
                    onClick={(e) => {
                      if (onStartExifStripper) {
                        e.preventDefault();
                        onStartExifStripper();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <ShieldAlert className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-900">{dt.productsExif}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Resources & Links (Mobile) */}
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-foreground px-2">{lang === 'es' ? 'Recursos' : 'Resources'}</h4>
              <div className="flex flex-col gap-1">
                <Link href={`/${lang}/blog`} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">Blog</Link>
                <Link href={`/${lang}/about`} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">{dt.companyAbout}</Link>
                <Link href={`/${lang}/brand`} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">{dt.companyBrand}</Link>
                <Link href={`/${lang}/#how-it-works`} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">{t.howItWorks}</Link>
                <Link href={`/${lang}/pricing`} onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">{t.pricing}</Link>
              </div>
            </div>

            {/* CTA Mobile */}
            <div className="pt-4 border-t border-border">
              {onStartBackgroundRemover ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStartBackgroundRemover();
                  }}
                  className="w-full px-5 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors shadow-sm font-accent flex justify-center"
                >
                  {t.startBtn}
                </button>
              ) : (
                <Link
                  href={`/${lang}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-5 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-colors shadow-sm font-accent flex justify-center"
                >
                  {t.startBtn}
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}

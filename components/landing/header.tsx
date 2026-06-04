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
import React from "react";
import { 
  Image as ImageIcon, 
  Zap, 
  Eraser, 
  ShieldAlert,
  BookOpen,
  Info,
  Layers,
  Menu
} from "lucide-react";

interface HeaderProps {
  onStartBackgroundRemover?: () => void;
  onStartOptimizer?: () => void;
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

export function Header({ onStartBackgroundRemover, onStartOptimizer, dict, lang = "en" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

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
    productsMagicEraser: "Magic Eraser",
    productsExif: "EXIF Stripper",
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
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                        title={dt.productsMagicEraser}
                        icon={<Eraser className="h-5 w-5" />}
                        comingSoon
                      >
                        {lang === 'es' ? 'Borra objetos no deseados.' : 'Erase unwanted objects.'}
                      </ListItem>
                      <ListItem
                        href="#"
                        title={dt.productsExif}
                        icon={<ShieldAlert className="h-5 w-5" />}
                        comingSoon
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
               <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                  <Menu className="w-6 h-6" />
               </button>
            </div>

            {/* Main CTA button */}
            {onStartBackgroundRemover ? (
              <button
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
    </nav>
  );
}

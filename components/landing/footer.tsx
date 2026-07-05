import Link from "next/link";

interface FooterProps {
  dict?: any;
  lang?: string;
}

export function Footer({ dict, lang = "en" }: FooterProps) {
  const t = dict?.footer || {
    desc: "ClearCut Studio is a free and private suite for image editing and optimization. All processing is done locally in your browser.",
    products: "Products",
    productsBg: "Background Remover",
    productsOpt: "Image Optimizer",
    productsCrop: "Crop & Upscale",
    company: "Company",
    companyAbout: "About us",
    companyBrand: "The Project & Brand",
    companySupport: "Support & Contact",
    legal: "Legal",
    legalPrivacy: "Privacy Policy",
    legalTerms: "Terms & Conditions",
    rights: "ClearCut Studio. All rights reserved.",
    madeBy: "Designed and developed with ♥ by",
    withHelp: ", with the help of"
  };

  const c = dict?.common || { comingSoon: "Soon" };

  return (
    <footer className="py-12 px-4 border-t border-border bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand & Logo */}
          <div className="col-span-2 md:col-span-2">
            <Link href={`/${lang}`} className="inline-block mb-4">
              <img src="/logos/ClearCut-logo.avif" alt="ClearCut" className="h-24 w-auto -ml-4" />
            </Link>
            <p className="text-sm text-muted-foreground font-accent max-w-sm">
              {t.desc}
            </p>
          </div>

          {/* Product Links */}
          <div className="col-span-1 space-y-4">
            <h4 className="font-heading font-semibold text-foreground">{t.products}</h4>
            <ul className="space-y-3 text-sm font-accent text-muted-foreground">
              <li>
                <Link href={`/${lang}/?tool=background-remover`} className="hover:text-primary transition-colors">{t.productsBg}</Link>
              </li>
              <li>
                <Link href={`/${lang}/?tool=optimizer`} className="hover:text-primary transition-colors">{t.productsOpt}</Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  Framed <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsCrop || t.productsCrop} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsSvg || (lang === 'es' ? 'Optimizador de SVG' : 'SVG Optimizer')} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsMagicEraser || (lang === 'es' ? 'Borrador Mágico' : 'Magic Eraser')} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsExif || (lang === 'es' ? 'Borrador de Metadatos' : 'EXIF Stripper')} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsConverter || (lang === 'es' ? 'Convertidor Masivo HEIC' : 'Bulk HEIC Converter')} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {dict?.footer?.productsColor || (lang === 'es' ? 'Generador de Paletas' : 'Color Palette Generator')} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Generador de Favicons' : 'Favicon Generator'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Imágenes Responsivas' : 'Responsive Images'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Extractor de Gradientes' : 'Gradient Extractor'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Adaptador para Redes' : 'Aspect Ratio Fitter'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Marca de Agua Masiva' : 'Batch Watermarker'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 opacity-50 cursor-not-allowed">
                  {lang === 'es' ? 'Visor y Conversor RAW' : 'RAW Converter'} <span className="text-[10px] uppercase bg-muted text-foreground px-1.5 py-0.5 rounded font-bold">{c.comingSoon}</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1 space-y-4">
            <h4 className="font-heading font-semibold text-foreground">{t.company}</h4>
            <ul className="space-y-3 text-sm font-accent text-muted-foreground">
              <li>
                <Link href={`/${lang}/blog`} className="hover:text-primary transition-colors">{lang === 'es' ? 'Blog' : 'Blog'}</Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-primary transition-colors">{t.companyAbout}</Link>
              </li>
              <li>
                <Link href={`/${lang}/pricing`} className="hover:text-primary transition-colors">{dict?.header?.pricing || 'Pricing'}</Link>
              </li>
              <li>
                <Link href={`/${lang}/brand`} className="hover:text-primary transition-colors">{t.companyBrand}</Link>
              </li>
              <li>
                <a href="mailto:soporte@clearcut.studio" className="hover:text-primary transition-colors">{t.companySupport}</a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="font-heading font-semibold text-foreground">{t.legal}</h4>
            <ul className="space-y-3 text-sm font-accent text-muted-foreground">
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-primary transition-colors">{t.legalPrivacy}</Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-primary transition-colors">{t.legalTerms}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground font-accent">
            &copy; {new Date().getFullYear()} {t.rights}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5 whitespace-nowrap flex-wrap font-accent">
              <span>{t.madeBy}</span>
              <a href="https://fabianh.me" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">
                <img src="/logos/fh-logo.svg" alt="FabianH" className="h-6 w-auto shrink-0 align-middle" />
              </a>
              <span>{t.withHelp}</span>
              <a href="https://antigravity.google" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline align-middle">
                <img src="/logos/antigravity-wordmark.svg" alt="Antigravity" className="h-5 w-auto shrink-0 align-middle" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

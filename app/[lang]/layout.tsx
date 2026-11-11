import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  minimumScale: 1,
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "ClearCut Studio — Suite de Herramientas Web para Imágenes",
    template: "%s",
  },
  description:
    "Estudio de herramientas web para imágenes: elimina fondos con IA local, comprime a WebP/AVIF, limpia metadatos EXIF, extrae paletas CSS y genera favicons sin subir tus archivos.",
  keywords:
    "eliminar fondo, remover fondo, fondo transparente, background remover, optimizador de imágenes, webp, avif, limpiar exif, generador de favicons, extraer colores, clearcut studio",
  metadataBase: new URL("https://studio.fabianh.me"),
  alternates: {
    canonical: "/es",
    languages: {
      es: "/es",
      en: "/en",
      "x-default": "/es",
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/favicon/site.webmanifest",
  applicationName: "ClearCut Studio",
  appleWebApp: {
    title: "ClearCut Studio",
  },
  openGraph: {
    type: "website",
    title: "ClearCut Studio — Suite de Herramientas Web para Imágenes",
    description:
      "Elimina fondos con IA WebAssembly, optimiza imágenes a WebP/AVIF, borra metadatos EXIF y edita activos visuales directamente en tu navegador.",
    url: "https://studio.fabianh.me",
    images: [
      {
        url: "https://res.cloudinary.com/dvjzjasfg/image/upload/v1780438455/CleanCut-OpenGraph_oabyky.png",
        width: 1280,
        height: 720,
        alt: "ClearCut Studio — Suite de Herramientas Web para Imágenes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearCut Studio — Suite de Herramientas Web para Imágenes",
    description:
      "Elimina fondos con IA WebAssembly, optimiza imágenes a WebP/AVIF y protege tu privacidad procesando en tu navegador.",
    images: [
      "https://res.cloudinary.com/dvjzjasfg/image/upload/v1780438455/CleanCut-OpenGraph_oabyky.png",
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  return (
    <html lang={lang} className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-accent text-foreground bg-[#f8fafc] selection:bg-blue-600/15 selection:text-blue-700">
        <div className="flex-1 flex flex-col">{children}</div>

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "x11tb0aspc");
          `}
        </Script>
      </body>
    </html>
  );
}

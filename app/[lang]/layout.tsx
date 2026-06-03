import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClearCut Studio - Elimina Fondos de Imágenes con IA",
  description: "Elimina el fondo de tus imágenes automáticamente con inteligencia artificial y optimiza su tamaño. Totalmente local y privado.",
  keywords: "eliminar fondo, remover fondo, fondo transparente, background remover, background eraser, background editor, inteligencia artificial, IA, AI, edición de imágenes, image editing, optimizador, image optimizer",
  metadataBase: new URL("https://studio.fabianh.me"),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/es",
      "en": "/en",
      "x-default": "/en"
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180" }
    ]
  },
  manifest: "/favicon/site.webmanifest",
  applicationName: "ClearCut Studio",
  appleWebApp: {
    title: "ClearCut Studio",
  },
  openGraph: {
    type: "website",
    title: "ClearCut Studio - Elimina Fondos de Imágenes con IA",
    description: "Elimina el fondo de tus imágenes automáticamente con inteligencia artificial y optimiza su tamaño. Totalmente local y privado.",
    url: "https://studio.fabianh.me",
    images: [
      {
        url: "https://res.cloudinary.com/dvjzjasfg/image/upload/v1780438455/CleanCut-OpenGraph_oabyky.png",
        width: 1280,
        height: 720,
        alt: "ClearCut Studio - Elimina Fondos de Imágenes con IA",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearCut Studio - Elimina Fondos de Imágenes con IA",
    description: "Elimina el fondo de tus imágenes automáticamente con inteligencia artificial y optimiza su tamaño. Totalmente local y privado.",
    images: ["https://res.cloudinary.com/dvjzjasfg/image/upload/v1780438455/CleanCut-OpenGraph_oabyky.png"],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`scroll-smooth ${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-accent text-foreground selection:bg-primary/20 selection:text-primary">
        <main className="flex-1 flex flex-col">
          {children}
        </main>

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
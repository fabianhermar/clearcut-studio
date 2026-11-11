import { getDictionary, Locale } from "@/lib/dictionaries";
import HomeClient from "./home-client";
import { Suspense } from "react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === "es";

  const title = isEs
    ? "ClearCut Studio — Suite de Herramientas Web para Imágenes en el Navegador"
    : "ClearCut Studio — Browser-First Image Tools & Creative Studio";

  const description = isEs
    ? "Elimina fondos con IA WebAssembly, optimiza imágenes a WebP/AVIF, borra metadatos EXIF, extrae paletas CSS, genera favicons y crea mockups directamente en tu navegador sin subir archivos a servidores."
    : "Remove image backgrounds with WebAssembly AI, compress to WebP/AVIF, strip EXIF metadata, extract CSS gradients, generate favicons, and build mockups directly in your browser without uploading files to external servers.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        es: "/es",
        en: "/en",
        "x-default": "/es",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://studio.fabianh.me/${lang}`,
      siteName: "ClearCut Studio",
      locale: isEs ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-sm font-medium text-slate-600">
          Loading ClearCut Studio...
        </div>
      }
    >
      <HomeClient dict={dict} lang={lang as Locale} />
    </Suspense>
  );
}

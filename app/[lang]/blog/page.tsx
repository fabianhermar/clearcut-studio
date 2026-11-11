import { Suspense } from "react";
import { getBlogPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogFilters } from "@/components/blog/blog-filters";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Blog y Recursos Técnicos | ClearCut Studio"
      : "Blog & Technical Resources | ClearCut Studio",
    description: isEs
      ? "Guías técnicas sobre optimización de imágenes (AVIF, WebP), privacidad EXIF, WebAssembly en el navegador y diseño de producto."
      : "Technical guides on image optimization (AVIF, WebP), EXIF privacy, in-browser WebAssembly, and product design.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/blog`,
      languages: {
        es: "https://studio.fabianh.me/es/blog",
        en: "https://studio.fabianh.me/en/blog",
      },
    },
  };
}

export default async function BlogListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const isEs = lang === "es";

  const allPosts = getBlogPosts(lang);

  if (allPosts.length === 0) {
    return (
      <main className="min-h-screen pt-20 pb-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-20 bg-card rounded-2xl shadow-2xs border border-border">
            <h1 className="text-2xl font-bold text-foreground font-heading mb-2">
              {isEs ? "No hay artículos publicados aún" : "No articles published yet"}
            </h1>
            <p className="text-muted-foreground">
              {isEs
                ? "Vuelve más tarde para leer nuestras guías técnicas."
                : "Check back soon for our technical guides."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const categoriesSet = new Set<string>();
  allPosts.forEach((post) => {
    if (post.metadata.category) categoriesSet.add(post.metadata.category);
  });
  const categories = Array.from(categoriesSet);

  const categoryFilter =
    typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : null;
  const sortFilter =
    typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";
  const searchQuery =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.toLowerCase() : null;

  const isFiltering = Boolean((categoryFilter && categoryFilter !== "All") || searchQuery);

  let filteredPosts = [...allPosts];

  if (categoryFilter && categoryFilter !== "All") {
    filteredPosts = filteredPosts.filter((p) => p.metadata.category === categoryFilter);
  }

  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.metadata.title.toLowerCase().includes(searchQuery) ||
        p.metadata.summary.toLowerCase().includes(searchQuery)
    );
  }

  if (sortFilter === "oldest") {
    filteredPosts.reverse();
  }

  const heroPost = allPosts[0];
  const gridPosts = isFiltering
    ? filteredPosts
    : filteredPosts.filter((p) => p.slug !== heroPost.slug);

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Studio Editorial Header Banner */}
      <section className="studio-grid border-b border-border pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-2xs text-xs font-semibold text-primary mb-4 font-accent">
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {isEs
                    ? "Publicación Técnica y Notas de Producto"
                    : "Technical Publication & Product Notes"}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 font-heading tracking-tight leading-[1.1]">
                {isEs
                  ? "Ingeniería de imagen, rendimiento web y diseño digital"
                  : "Image engineering, web performance, and digital design"}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-accent">
                {isEs
                  ? "Guías prácticas sobre formatos de próxima generación (AVIF, WebP), procesamiento local con WebAssembly, privacidad de metadatos y novedades de ClearCut Studio."
                  : "Practical guides on next-generation formats (AVIF, WebP), local WebAssembly processing, metadata privacy, and ClearCut Studio updates."}
              </p>
            </div>

            {/* Quick Studio Stats / Pillar Badges */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-card border border-border shadow-2xs text-xs font-mono text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>
                  {allPosts.length} {isEs ? "artículos publicados" : "published articles"}
                </span>
              </div>
              <Link
                href={`/${lang}/?tool=background-remover`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs font-accent"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEs ? "Ir al Estudio" : "Go to Studio"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Featured Hero Post when not filtering */}
        {!isFiltering && heroPost && <BlogHero post={heroPost} lang={lang} />}

        {/* Filters and Search Area */}
        <Suspense fallback={<div className="h-16 mb-10 rounded-2xl bg-card border border-border" />}>
          <BlogFilters categories={categories} lang={lang} totalCount={allPosts.length} />
        </Suspense>

        {/* Grid of Posts */}
        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridPosts.map((post) => (
              <BlogCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl shadow-2xs border border-border">
            <p className="text-muted-foreground text-sm font-accent mb-4">
              {isEs
                ? "No se encontraron artículos que coincidan con esos criterios."
                : "No articles matched those search criteria."}
            </p>
            <Link
              href={`/${lang}/blog`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors font-accent"
            >
              {isEs ? "Ver todos los artículos" : "View all articles"}
            </Link>
          </div>
        )}

        {/* Bottom Studio Tools CTA Banner */}
        <section className="mt-20 bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-accent">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>
                {isEs
                  ? "Ejecución 100% en tu navegador"
                  : "100% In-Browser Execution"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              {isEs
                ? "Aplica lo aprendido directamente con nuestras herramientas"
                : "Put these guides into practice with our live studio tools"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-accent leading-relaxed">
              {isEs
                ? "Recorta fondos con IA, comprime tus activos web a AVIF y WebP o elimina metadatos ocultos EXIF gratis y sin subir archivos."
                : "Remove backgrounds with AI, compress your web assets to AVIF and WebP, or strip hidden EXIF metadata for free without uploading files."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`/${lang}/?tool=background-remover`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs font-accent"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>{isEs ? "Eliminar Fondo con IA" : "AI Background Remover"}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/${lang}/?tool=image-optimizer`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-background hover:bg-muted border border-border text-foreground text-xs sm:text-sm font-semibold transition-colors font-accent"
            >
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>{isEs ? "Optimizador AVIF/WebP" : "AVIF/WebP Optimizer"}</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

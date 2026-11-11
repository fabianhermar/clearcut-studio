import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { STUDIO_TOOLS } from "@/lib/tools-catalog";
import { ToolIcon } from "@/components/studio/tool-icon";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyUrlButton } from "@/components/blog/copy-url-button";
import { AccessibilityTools } from "@/components/blog/accessibility-tools";
import { BlogCard } from "@/components/blog/blog-card";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  ArrowUpRight,
  Sparkles,
  Calendar,
  List,
  ShieldCheck,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = getBlogPost(lang, slug);
  if (!post) {
    return { title: "ClearCut Studio Blog" };
  }
  return {
    title: `${post.metadata.title} | ClearCut Studio`,
    description: post.metadata.summary,
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/blog/${slug}`,
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      type: "article",
      publishedTime: post.metadata.date,
      images: post.metadata.image ? [{ url: post.metadata.image }] : undefined,
    },
  };
}

function extractHeadings(markdown: string): string[] {
  const lines = markdown.split("\n");
  const headings: string[] = [];
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match && match[1]) {
      headings.push(match[1].replace(/[*_`#]/g, "").trim());
    }
  }
  return headings;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const isEs = lang === "es";
  const post = getBlogPost(lang, slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);

  const relatedPosts = getBlogPosts(lang)
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const locale = isEs ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "dd MMMM yyyy", { locale });
  const backText = isEs ? "Volver al índice del blog" : "Back to blog index";
  const readTimeText = isEs ? "min de lectura" : "min read";

  return (
    <main className="flex-1 bg-background pb-24">
      <article className="min-h-screen">
        {/* Studio Editorial Article Header */}
        <header className="studio-grid border-b border-border pt-10 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb & Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors shadow-2xs font-accent"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{backText}</span>
              </Link>

              <CopyUrlButton title={isEs ? "Copiar enlace" : "Copy link"} />
            </div>

            <div className="max-w-4xl">
              {/* Category, Date & Reading Time */}
              <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
                <span className="px-3 py-1 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
                  {post.metadata.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <time dateTime={post.metadata.date}>{formattedDate}</time>
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground font-mono">
                  <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  {post.readingTime} {readTimeText}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-5 font-heading leading-[1.12] tracking-tight">
                {post.metadata.title}
              </h1>

              {/* Article Lead Summary */}
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed mb-8 font-accent">
                {post.metadata.summary}
              </p>

              {/* Author Card Strip */}
              <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-2xs">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                  {post.metadata.authorAvatar ? (
                    <Image
                      src={post.metadata.authorAvatar}
                      alt={post.metadata.author}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold font-heading text-base">
                      {post.metadata.author.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-sm font-bold text-foreground font-heading">
                    {post.metadata.author}
                  </span>
                  <span className="text-xs text-muted-foreground font-accent">
                    {post.metadata.authorRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main 2-Column Editorial Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left/Main Column (8 cols): Cover Image + Markdown Body */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Image */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xs border border-border bg-muted">
                <Image
                  src={post.metadata.image}
                  alt={post.metadata.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>

              {/* Markdown Reading Surface */}
              <div
                id="article-content"
                className="bg-card border border-border rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xs prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-foreground prose-a:text-primary prose-a:font-semibold hover:prose-a:text-primary-hover prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-code:font-mono prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-img:rounded-xl prose-img:border prose-img:border-border"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>

              {/* Bottom Article CTA Banner */}
              <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isEs ? "Pruébalo en tu navegador" : "Try it in your browser"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {isEs
                      ? "Lleva estas técnicas a la práctica en ClearCut Studio"
                      : "Put these techniques into practice in ClearCut Studio"}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-lg font-accent">
                    {isEs
                      ? "Elimina fondos con IA, comprime en AVIF/WebP o limpia metadatos EXIF localmente y sin costo."
                      : "Remove backgrounds with AI, compress into AVIF/WebP, or strip EXIF metadata locally and for free."}
                  </p>
                </div>
                <Link
                  href={`/${lang}/?tool=background-remover`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-2xs font-accent"
                >
                  <span>{isEs ? "Abrir Estudio" : "Open Studio"}</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right Sticky Sidebar (4 cols): Table of Contents + Live Tools */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              {/* Article Outline / Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground font-heading mb-4 pb-3 border-b border-border">
                    <List className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>{isEs ? "Contenido del artículo" : "In this article"}</span>
                  </div>
                  <ol className="space-y-2.5 text-xs sm:text-sm font-accent text-muted-foreground">
                    {headings.map((heading, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-snug">
                        <span className="font-mono text-[11px] text-primary font-semibold mt-0.5 shrink-0">
                          {String(idx + 1).padStart(2, "0")}.
                        </span>
                        <span className="text-foreground/90 font-medium">{heading}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Direct Studio Tools Launcher Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                    {isEs ? "Herramientas del Estudio" : "Studio Tools"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                    Local
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-accent mb-4 leading-relaxed">
                  {isEs
                    ? "Abre cualquiera de nuestras utilidades directamente en tu navegador:"
                    : "Launch any of our utilities directly inside your browser:"}
                </p>
                <div className="space-y-2">
                  {STUDIO_TOOLS.slice(0, 4).map((tool) => {
                    const copy = isEs ? tool.es : tool.en;
                    return (
                      <Link
                        key={tool.slug}
                        href={`/${lang}/?tool=${tool.slug}`}
                        className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background hover:bg-muted border border-border transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                            <ToolIcon slug={tool.slug} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground font-heading truncate group-hover:text-primary transition-colors">
                              {copy.shortName}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-accent truncate">
                              {copy.tagline}
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-14 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary font-accent block mb-1">
                  {isEs ? "Sigue explorando" : "Keep reading"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                  {isEs ? "Artículos relacionados" : "Related articles"}
                </h2>
              </div>
              <Link
                href={`/${lang}/blog`}
                className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover font-accent"
              >
                {isEs ? "Ver todos →" : "View all →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((rel) => (
                <BlogCard key={rel.slug} post={rel} lang={lang} />
              ))}
            </div>
          </section>
        )}

        <AccessibilityTools lang={lang} />
      </article>
    </main>
  );
}

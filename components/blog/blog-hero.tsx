import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowUpRight, Clock, Sparkles, Calendar } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogHeroProps {
  post: BlogPost;
  lang: string;
}

export function BlogHero({ post, lang }: BlogHeroProps) {
  const isEs = lang === "es";
  const locale = isEs ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "dd MMM yyyy", { locale });
  const readTimeText = isEs ? "min de lectura" : "min read";

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group block w-full mb-12 focus-visible:outline-2 focus-visible:outline-primary rounded-2xl"
    >
      <article className="grid grid-cols-1 lg:grid-cols-12 bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200">
        {/* Left Column: Featured Cover Image */}
        <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] overflow-hidden bg-muted border-b lg:border-b-0 lg:border-r border-border">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-card/95 backdrop-blur-xs text-primary border border-border shadow-2xs">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {isEs ? "Artículo Destacado" : "Featured Article"}
            </span>
          </div>
        </div>

        {/* Right Column: Editorial Metadata & Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-card">
          <div>
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold uppercase tracking-wider">
                {post.metadata.category}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground font-mono">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={post.metadata.date}>{formattedDate}</time>
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {post.readingTime} {readTimeText}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 font-heading leading-tight tracking-tight group-hover:text-primary transition-colors">
              {post.metadata.title}
            </h2>

            {/* Summary */}
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed mb-6 font-accent">
              {post.metadata.summary}
            </p>
          </div>

          {/* Author & CTA Row */}
          <div className="pt-5 border-t border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                {post.metadata.authorAvatar ? (
                  <Image
                    src={post.metadata.authorAvatar}
                    alt={post.metadata.author}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold font-heading text-sm">
                    {post.metadata.author.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground truncate font-heading">
                  {post.metadata.author}
                </div>
                <div className="text-xs text-muted-foreground truncate font-accent">
                  {post.metadata.authorRole}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white text-foreground text-xs font-semibold transition-colors shrink-0 font-accent">
              <span>{isEs ? "Leer guía" : "Read guide"}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

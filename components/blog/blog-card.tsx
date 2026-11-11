import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  lang: string;
}

export function BlogCard({ post, lang }: BlogCardProps) {
  const isEs = lang === "es";
  const locale = isEs ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "dd MMM yyyy", { locale });
  const readTimeText = isEs ? "min" : "min";

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group flex flex-col h-full focus-visible:outline-2 focus-visible:outline-primary rounded-2xl"
    >
      <article className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200">
        {/* Image Header */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted border-b border-border">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Top Bar Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground bg-card/95 backdrop-blur-xs rounded-md border border-border shadow-2xs">
              {post.metadata.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium text-foreground bg-card/95 backdrop-blur-xs rounded-md border border-border shadow-2xs">
              <Clock className="w-3 h-3 text-primary" aria-hidden="true" />
              {post.readingTime} {readTimeText}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5 text-xs font-mono text-muted-foreground">
              <time dateTime={post.metadata.date}>{formattedDate}</time>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2.5 line-clamp-2 group-hover:text-primary transition-colors font-heading leading-snug">
              {post.metadata.title}
            </h3>

            <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed font-accent">
              {post.metadata.summary}
            </p>
          </div>

          {/* Card Footer: Author + Read Arrow */}
          <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                {post.metadata.authorAvatar ? (
                  <Image
                    src={post.metadata.authorAvatar}
                    alt={post.metadata.author}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold font-heading text-xs">
                    {post.metadata.author.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate font-heading">
                  {post.metadata.author}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform shrink-0 font-accent">
              <span>{isEs ? "Leer" : "Read"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

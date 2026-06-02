import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
  lang: string;
}

export function BlogCard({ post, lang }: BlogCardProps) {
  const locale = lang === 'es' ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "dd MMM yyyy", { locale });
  const readTimeText = lang === 'es' ? 'min de lectura' : 'mins read';

  return (
    <Link href={`/${lang}/blog/${post.slug}`} className="group flex flex-col h-full">
      <article className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              {post.metadata.category}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 font-accent uppercase tracking-wide">
            <time dateTime={post.metadata.date}>
              {formattedDate}
            </time>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{post.readingTime} {readTimeText}</span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors font-heading leading-tight">
            {post.metadata.title}
          </h3>
          
          <p className="text-slate-600 mb-6 line-clamp-2 text-sm leading-relaxed flex-grow">
            {post.metadata.summary}
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
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
            <span className="text-sm font-bold text-slate-900">{post.metadata.author}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

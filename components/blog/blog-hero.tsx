import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogHeroProps {
  post: BlogPost;
  lang: string;
}

export function BlogHero({ post, lang }: BlogHeroProps) {
  const locale = lang === 'es' ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "MMM d, yyyy", { locale });

  return (
    <Link href={`/${lang}/blog/${post.slug}`} className="group block w-full mb-16">
      <article className="relative w-full aspect-[4/3] md:aspect-[2.2/1] rounded-[2rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
        {/* Background Image */}
        <Image
          src={post.metadata.image}
          alt={post.metadata.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient Overlay for Text Readability - Darker at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Read more Icon Top Right */}
        <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
           <ArrowUpRight className="w-6 h-6" />
        </div>

        {/* Content Container */}
        <div className="absolute inset-0 p-6 md:p-10 lg:p-12 flex flex-col justify-end">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            
            {/* Left side: Title, Summary, Author */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading leading-tight group-hover:text-primary-100 transition-colors">
                {post.metadata.title}
              </h2>
              
              <p className="text-slate-200 line-clamp-2 text-sm md:text-base mb-6 font-accent">
                {post.metadata.summary}
              </p>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
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
                <div className="flex flex-col text-white">
                  <span className="text-sm font-bold drop-shadow-sm">{post.metadata.author}</span>
                  <span className="text-xs text-slate-300 drop-shadow-sm flex items-center gap-1.5 font-accent">
                    {formattedDate} 
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Categories/Pills */}
            <div className="flex items-center gap-2 flex-wrap md:justify-end shrink-0 mt-4 md:mt-0">
               <span className="inline-block px-4 py-1.5 text-xs font-semibold text-white bg-transparent backdrop-blur-sm rounded-full border border-white/40 shadow-sm">
                  {post.metadata.category}
               </span>
            </div>
            
          </div>
        </div>
      </article>
    </Link>
  );
}

import { getBlogPost } from "@/lib/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { CopyUrlButton } from "@/components/blog/copy-url-button";
import { AccessibilityTools } from "@/components/blog/accessibility-tools";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ArrowLeft, Clock } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const post = getBlogPost(lang, slug);

  if (!post) {
    notFound();
  }

  const locale = lang === 'es' ? es : enUS;
  const formattedDate = format(new Date(post.metadata.date), "MMMM d, yyyy", { locale });
  const backText = lang === 'es' ? 'Volver al blog' : 'Back to blog';
  const readTimeText = lang === 'es' ? 'minutos de lectura' : 'min read';

  return (
    <article className="min-h-screen bg-white pt-24 pb-16">
      {/* Header section */}
      <header className="container mx-auto px-4 max-w-4xl pt-8 mb-10">
        <Link 
          href={`/${lang}/blog`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>
        
        <div className="flex items-center gap-3 mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <span className="text-primary font-semibold">{post.metadata.category}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <time dateTime={post.metadata.date} className="text-slate-500">
            {formattedDate}
          </time>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-4 h-4" />
            {post.readingTime} {readTimeText}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 font-heading leading-tight">
          {post.metadata.title}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
              {post.metadata.authorAvatar ? (
                <Image
                  src={post.metadata.authorAvatar}
                  alt={post.metadata.author}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold font-heading text-xl">
                  {post.metadata.author.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900">{post.metadata.author}</span>
              <span className="text-sm text-slate-500">{post.metadata.authorRole}</span>
            </div>
          </div>
          
          <CopyUrlButton title={lang === 'es' ? 'Copiar Enlace' : 'Copy URL'} />
        </div>
      </header>

      {/* Featured Image */}
      <div className="container mx-auto px-4 max-w-5xl mb-12">
        <div className="relative w-full aspect-[21/9] md:aspect-[2.5/1] rounded-[2rem] overflow-hidden shadow-md">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div id="article-content" className="prose prose-slate prose-lg max-w-none prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-xl transition-all duration-300">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>

      {/* Accessibility Tools (Floating) */}
      <AccessibilityTools lang={lang} />
    </article>
  );
}

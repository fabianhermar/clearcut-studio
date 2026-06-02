import { getBlogPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogFilters } from "@/components/blog/blog-filters";

export default async function BlogListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  
  // Get all posts
  const allPosts = getBlogPosts(lang);
  
  if (allPosts.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-700 font-heading mb-2">
              {lang === 'es' ? 'No hay artículos publicados aún' : 'No articles published yet'}
            </h2>
            <p className="text-slate-500">
              {lang === 'es' ? 'Vuelve más tarde para leer nuestras novedades.' : 'Check back later to read our news.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Categories extraction
  const categoriesSet = new Set<string>();
  allPosts.forEach(post => {
    if (post.metadata.category) categoriesSet.add(post.metadata.category);
  });
  const categories = Array.from(categoriesSet);

  // Sorting and Filtering logic
  const categoryFilter = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : null;
  const sortFilter = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.toLowerCase() : null;

  let filteredPosts = [...allPosts];

  if (categoryFilter && categoryFilter !== 'All') {
    filteredPosts = filteredPosts.filter(p => p.metadata.category === categoryFilter);
  }

  if (searchQuery) {
    filteredPosts = filteredPosts.filter(p => 
      p.metadata.title.toLowerCase().includes(searchQuery) ||
      p.metadata.summary.toLowerCase().includes(searchQuery)
    );
  }

  if (sortFilter === 'oldest') {
    filteredPosts.reverse();
  }

  // The Hero is always the absolute newest post, regardless of filters, 
  // UNLESS the user is actively searching for something specific, then maybe we hide the hero?
  // For now, let's keep the hero as the newest post.
  const heroPost = allPosts[0];
  
  // We remove the hero post from the grid IF we are NOT filtering, or if the hero post is in the filtered list.
  const gridPosts = filteredPosts.filter(p => p.slug !== heroPost.slug);

  const pillText = lang === 'es' ? 'Lee Nuestro Blog' : 'Read Our Blog';
  const title = lang === 'es' ? 'Explora Nuestros Recursos' : 'Browse Our Resources';
  const subtitle = lang === 'es' 
    ? 'Proveemos consejos y recursos de líderes de la industria. De verdad.' 
    : 'We provide tips and resources from industry leaders. For real.';

  return (
    <div className="min-h-screen pt-28 pb-24 bg-slate-50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-10">
          <span className="inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full mb-6">
            {pillText}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 font-heading tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl font-accent">
            {subtitle}
          </p>
        </div>

        {/* Featured Hero Post */}
        {(!searchQuery || heroPost.metadata.title.toLowerCase().includes(searchQuery)) && (
          <BlogHero post={heroPost} lang={lang} />
        )}

        {/* Filters and Search Area */}
        <BlogFilters categories={categories} lang={lang} />

        {/* Grid of Posts */}
        {gridPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {gridPosts.map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  lang={lang}
                />
              ))}
            </div>

            {/* Static Pagination */}
            <div className="mt-16 flex items-center justify-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50" disabled>
                &larr;
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm shadow-md">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50" disabled>
                &rarr;
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-slate-100">
             <p className="text-slate-500 font-accent">
               {lang === 'es' ? 'No se encontraron artículos con esos filtros.' : 'No articles found with those filters.'}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}

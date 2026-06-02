"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface BlogFiltersProps {
  categories: string[];
  lang: string;
}

export function BlogFilters({ categories, lang }: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "All";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const t = {
    all: lang === 'es' ? "Todos" : "All",
    searchPlaceholder: lang === 'es' ? "Buscar artículo..." : "Search blog..."
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="mb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4 border-b border-slate-200">
        
        {/* Categories (Tabs Style) */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => handleCategoryChange("All")}
            className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors relative top-[1px] ${
              currentCategory === "All" 
                ? "border-primary text-slate-900" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.all}
          </button>
          
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-colors relative top-[1px] ${
                currentCategory === cat 
                  ? "border-primary text-slate-900" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64 shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-accent shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        
      </div>
    </div>
  );
}

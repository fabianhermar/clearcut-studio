"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";

interface BlogFiltersProps {
  categories: string[];
  lang: string;
  totalCount?: number;
}

export function BlogFilters({ categories, lang, totalCount }: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEs = lang === "es";

  const currentCategory = searchParams.get("category") || "All";
  const currentSort = searchParams.get("sort") || "newest";
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const t = {
    all: isEs ? "Todos los temas" : "All topics",
    searchPlaceholder: isEs
      ? "Buscar por título, formato o tecnología..."
      : "Search by title, format, or topic...",
    clearSearch: isEs ? "Limpiar búsqueda" : "Clear search",
    newest: isEs ? "Más recientes" : "Newest first",
    oldest: isEs ? "Más antiguos" : "Oldest first",
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

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSort = currentSort === "newest" ? "oldest" : "newest";
    if (nextSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (currentQ === searchTerm) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="mb-10">
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Segmented Pills */}
        <div
          role="tablist"
          aria-label={isEs ? "Filtrar artículos por categoría" : "Filter articles by category"}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentCategory === "All"}
            onClick={() => handleCategoryChange("All")}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-accent ${
              currentCategory === "All"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t.all}
            {typeof totalCount === "number" && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded text-[11px] font-mono ${
                  currentCategory === "All"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {totalCount}
              </span>
            )}
          </button>

          {categories.map((cat) => {
            const active = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer font-accent ${
                  active
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 lg:w-72">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-accent"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label={t.clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSort}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors shrink-0 cursor-pointer font-accent"
            title={currentSort === "newest" ? t.newest : t.oldest}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="hidden sm:inline">
              {currentSort === "newest" ? t.newest : t.oldest}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

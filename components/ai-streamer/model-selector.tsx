"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, KeyRound, Search, Sparkles } from "lucide-react";
import {
  getProviderMeta,
  groupModelsByFamily,
  hasProviderKey,
} from "@/lib/ai-studio/providers";
import type { AiModelSpec, ApiKeyVault } from "@/lib/ai-studio/types";

interface ModelSelectorProps {
  models: AiModelSpec[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  vault: ApiKeyVault;
  onOpenApiVault?: () => void;
  lang?: string;
  align?: "left" | "right";
  fullWidth?: boolean;
}

export function ModelSelector({
  models,
  selectedModelId,
  onSelect,
  vault,
  onOpenApiVault,
  lang = "es",
  align = "right",
  fullWidth = false,
}: ModelSelectorProps) {
  const isEn = lang === "en";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];
  const selectedReady = selectedModel ? hasProviderKey(vault, selectedModel.provider) : false;
  const selectedProviderMeta = selectedModel ? getProviderMeta(selectedModel.provider) : null;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filteredModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.family.toLowerCase().includes(q) ||
        m.descriptionEs.toLowerCase().includes(q) ||
        m.descriptionEn.toLowerCase().includes(q)
    );
  }, [models, query]);

  const groups = useMemo(() => groupModelsByFamily(filteredModels), [filteredModels]);

  if (!selectedModel) return null;

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? "w-full" : "inline-block"}`}>
      {/* Trigger Pill */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`h-10 px-3.5 rounded-full bg-background hover:bg-muted/80 border transition-all inline-flex items-center justify-between gap-2.5 cursor-pointer ${
          open ? "border-primary ring-2 ring-primary/15" : "border-border"
        } ${fullWidth ? "w-full" : "max-w-[320px] sm:max-w-[380px]"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white"
            style={{
              backgroundColor: selectedReady
                ? "#0f766e"
                : selectedProviderMeta?.accentHex || "#94a3b8",
            }}
            title={
              selectedReady
                ? isEn
                  ? "API Key configured"
                  : "API Key configurada"
                : isEn
                ? "API Key required"
                : "Requiere API Key"
            }
          />
          <div className="min-w-0 text-left leading-tight">
            <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground truncate">
              {selectedModel.family}
            </div>
            <div className="text-xs font-bold font-heading text-foreground truncate">
              {selectedModel.name}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Grouped Dropdown Panel */}
      {open && (
        <div
          role="listbox"
          className={`absolute top-full mt-2 z-50 w-[min(92vw,440px)] bg-card border border-border rounded-2xl shadow-medium overflow-hidden ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-border bg-[#faf9f5] space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>
                  {isEn ? "Select Model by Provider" : "Seleccionar Modelo por Proveedor"}
                </span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {groups.length} {isEn ? "sections" : "secciones"} · {filteredModels.length}
              </span>
            </div>

            {models.length > 6 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    isEn
                      ? "Search Nano Banana, Flux, Seedream, Midjourney, Veo..."
                      : "Buscar Nano Banana, Flux, Seedream, Midjourney, Veo..."
                  }
                  className="w-full h-8 pl-8 pr-3 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Scrollable Provider Sections */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/80">
            {groups.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                {isEn ? "No matching models found." : "No se encontraron modelos con ese filtro."}
              </div>
            ) : (
              groups.map((group, groupIdx) => {
                const providerMeta = getProviderMeta(group.provider);
                const ready = hasProviderKey(vault, group.provider);

                return (
                  <div key={group.family} className="p-2.5 space-y-1">
                    {/* Sticky Section Header */}
                    <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: providerMeta.accentHex }}
                        />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-foreground truncate">
                          {String(groupIdx + 1).padStart(2, "0")} // {group.family}
                        </span>
                      </div>

                      {ready ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-800 border border-emerald-600/25 whitespace-nowrap shrink-0">
                          {isEn ? "KEY READY" : "KEY ACTIVA"}
                        </span>
                      ) : onOpenApiVault ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onOpenApiVault();
                          }}
                          className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ff4d00]/10 hover:bg-[#ff4d00]/20 text-[#b83700] border border-[#ff4d00]/25 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <KeyRound className="w-2.5 h-2.5" />
                          <span>+ {providerMeta.shortName}</span>
                        </button>
                      ) : null}
                    </div>

                    {/* Models inside this Section */}
                    <div className="space-y-0.5">
                      {group.models.map((model) => {
                        const isSelected = model.id === selectedModel.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              onSelect(model.id);
                              setOpen(false);
                              setQuery("");
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                              isSelected
                                ? "bg-[#0c0e12] text-white"
                                : "hover:bg-background text-foreground"
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold font-heading">
                                  {model.name}
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isSelected
                                      ? "bg-[#1e40ff] text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isEn ? model.badgeEn : model.badgeEs}
                                </span>
                                {model.featureTags?.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                      isSelected
                                        ? "border-white/20 text-slate-300"
                                        : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <p
                                className={`text-[11px] leading-snug ${
                                  isSelected ? "text-slate-300" : "text-muted-foreground"
                                }`}
                              >
                                {isEn ? model.descriptionEn : model.descriptionEs}
                              </p>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

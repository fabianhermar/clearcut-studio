"use client";

import { useRef, useState } from "react";
import { useFileDrop } from "@/hooks/use-file-drop";
import {
  Monitor,
  Smartphone,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Layers,
  Download,
  Palette,
} from "lucide-react";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (src: string) => void;
  onClose?: () => void;
}

const BENEFITS = [
  {
    icon: <Layers size={22} />,
    title: "Device Frames",
    desc: "iPhone, iPad, Android, Browser & macOS frames — no Figma needed.",
    color: "from-violet-500/15 to-purple-500/10",
    iconColor: "text-violet-600",
    border: "border-violet-200",
  },
  {
    icon: <Sparkles size={22} />,
    title: "Magic Presets",
    desc: "One-click presets that pick the perfect background, frame & shadow combo.",
    color: "from-amber-500/15 to-orange-500/10",
    iconColor: "text-amber-600",
    border: "border-amber-200",
  },
  {
    icon: <Palette size={22} />,
    title: "30+ Backgrounds",
    desc: "Mesh gradients, solid colors, and cinematic presets with filter effects.",
    color: "from-emerald-500/15 to-teal-500/10",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
  },
  {
    icon: <Download size={22} />,
    title: "Export HD",
    desc: "PNG, JPG or WebP at up to 3× resolution. Or copy straight to clipboard.",
    color: "from-sky-500/15 to-blue-500/10",
    iconColor: "text-sky-600",
    border: "border-sky-200",
  },
];

const PRESET_THUMBS = [
  { emoji: "🌌", label: "Cosmic", bg: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" },
  { emoji: "🌅", label: "Sunset", bg: "linear-gradient(135deg, #f093fb 0%, #fda085 100%)" },
  { emoji: "🌿", label: "Mint", bg: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)" },
  { emoji: "🌙", label: "Midnight", bg: "linear-gradient(to bottom, #0f0f0f, #1a0533)" },
  { emoji: "🍬", label: "Pastel", bg: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { emoji: "⚡", label: "Neon", bg: "linear-gradient(135deg, #0f0f0f 0%, #1a0533 100%)" },
];

export function UploadSection({ onFileSelect, onSampleSelect, onClose }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const { isDragging, handleDrop, handleDragOver, handleDragLeave } = useFileDrop(onFileSelect);

  return (
    <div className="min-h-screen bg-background text-foreground font-accent overflow-y-auto">

      {/* ── Nav bar ── */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Monitor size={14} />
            </div>
            <span className="font-bold text-sm text-foreground font-heading">Framed</span>
            <span className="text-[10px] uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold tracking-wide">
              Beta
            </span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-bold rounded-full hover:bg-foreground/90 transition-colors"
          >
            <ArrowRight size={13} />
            Start Creating
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
          <Sparkles size={12} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Mockup generator — No design skills needed</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading tracking-tight leading-[1.1] mb-6">
          Beautiful mockups,{" "}
          <span className="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            in seconds.
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
          Drop your screenshot or design. Choose a frame, background, and effects.
          Export at up to 3× resolution — for social media, websites, and presentations.
        </p>

        {/* ── Drop Zone ── */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative mx-auto max-w-2xl border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all group ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/3 hover:shadow-lg"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />

          {/* Animated upload icon */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all ${
              isDragging
                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                : "bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary/15"
            }`}
          >
            <ImageIcon size={36} strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-bold font-heading mb-2 text-foreground">
            {isDragging ? "Release to frame it 🎉" : "Drop your image here"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            or click anywhere in this box to browse files
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            {["PNG", "JPG", "WebP", "AVIF", "GIF"].map((ext) => (
              <span key={ext} className="px-3 py-1 bg-muted rounded-full border border-border font-medium">
                {ext}
              </span>
            ))}
            <span className="text-muted-foreground">· up to 10 MB</span>
          </div>
        </div>

        {/* ── Devices row ── */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Monitor size={14} />
            <span>macOS & Browser</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Smartphone size={14} />
            <span>iPhone & Android</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1.5">
            <Layers size={14} />
            <span>Custom frames</span>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading mb-3">Everything you need, nothing you don't</h2>
          <p className="text-muted-foreground">Professional-grade results without the learning curve.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${b.color} border ${b.border} overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <div className={`mb-4 ${b.iconColor}`}>{b.icon}</div>
              <h3 className="font-bold text-sm mb-2 text-foreground font-heading">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Magic Presets preview ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Magic Presets</span>
          </div>
          <h2 className="text-3xl font-bold font-heading mb-3">One click to beautiful</h2>
          <p className="text-muted-foreground text-sm">Curated combos of frame, background, shadow & effects.</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PRESET_THUMBS.map((p) => (
            <div
              key={p.label}
              className="group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className="aspect-square rounded-2xl flex items-center justify-center text-3xl mb-2 border border-white/10 group-hover:scale-105 transition-transform shadow-sm"
                style={{ background: p.bg }}
              >
                {p.emoji}
              </div>
              <p className="text-center text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {p.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-primary/8 to-violet-500/8 border border-primary/20 rounded-3xl p-12">
          <h2 className="text-4xl font-bold font-heading mb-4">Ready to frame it?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Drop your image and have a polished mockup in under 30 seconds.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-foreground text-background font-bold rounded-full hover:bg-foreground/90 transition-colors text-sm"
          >
            <ArrowRight size={16} />
            Start Creating — it's free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Framed is part of <a href="/" className="hover:text-foreground transition-colors font-semibold">ClearCut Studio</a></p>
      </footer>

    </div>
  );
}

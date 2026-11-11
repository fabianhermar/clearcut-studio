"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { resolveToolSlug, type ToolSlug } from "@/lib/tools-catalog";

const ToolLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-xs">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">
        Inicializando espacio de trabajo...
      </p>
    </div>
  </div>
);

const BackgroundRemoverApp = dynamic(
  () => import("@/components/background-remover/background-remover-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const ImageOptimizerApp = dynamic(
  () => import("@/components/image-optimizer/image-optimizer-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const MockupGeneratorApp = dynamic(
  () => import("@/components/mockup-generator/mockup-generator-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const FaviconGeneratorApp = dynamic(
  () => import("@/components/favicon-generator/favicon-generator-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const AspectRatioFitterApp = dynamic(
  () => import("@/components/aspect-ratio-fitter/aspect-ratio-fitter-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const GradientExtractorApp = dynamic(
  () => import("@/components/gradient-extractor/gradient-extractor-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const ExifStripperApp = dynamic(
  () => import("@/components/exif-stripper/exif-stripper-app"),
  { ssr: false, loading: ToolLoadingFallback }
);
const BatchWatermarkerApp = dynamic(
  () => import("@/components/batch-watermarker/batch-watermarker-app"),
  { ssr: false, loading: ToolLoadingFallback }
);

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { ToolsCatalogSection } from "@/components/landing/tools-catalog-section";
import { SampleImagesSection } from "@/components/landing/sample-images-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { OptimizerInfoSection } from "@/components/landing/optimizer-info-section";
import { AboutSection, CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { FaqSection } from "@/components/landing/faq-section";

export default function HomeClient({ dict, lang }: { dict: any; lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTool, setActiveTool] = useState<ToolSlug | null>(() =>
    resolveToolSlug(searchParams.get("tool"))
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comparisonPos, setComparisonPos] = useState(50);

  useEffect(() => {
    const resolved = resolveToolSlug(searchParams.get("tool"));
    setActiveTool(resolved);
  }, [searchParams]);

  const openTool = useCallback(
    (slug: ToolSlug, demoImage?: string | null) => {
      if (demoImage !== undefined) {
        setSelectedImage(demoImage);
      } else if (slug !== "background-remover") {
        setSelectedImage(null);
      }
      setActiveTool(slug);
      router.replace(`${pathname}?tool=${slug}`, { scroll: true });
    },
    [pathname, router]
  );

  const handleSelectDemo = (src: string) => {
    openTool("background-remover", src);
  };

  const handleClose = useCallback(() => {
    setActiveTool(null);
    setSelectedImage(null);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  if (activeTool === "background-remover") {
    return (
      <BackgroundRemoverApp
        initialImage={selectedImage || undefined}
        onClose={handleClose}
        dict={dict}
        lang={lang}
      />
    );
  }

  if (activeTool === "image-optimizer") {
    return <ImageOptimizerApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "mockup-generator") {
    return <MockupGeneratorApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "favicon-generator") {
    return <FaviconGeneratorApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "aspect-ratio-fitter") {
    return <AspectRatioFitterApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "gradient-extractor") {
    return <GradientExtractorApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "exif-stripper") {
    return <ExifStripperApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  if (activeTool === "batch-watermarker") {
    return <BatchWatermarkerApp onClose={handleClose} dict={dict} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header
        onSelectTool={(slug) => openTool(slug, null)}
        onStartBackgroundRemover={() => openTool("background-remover", null)}
        onStartOptimizer={() => openTool("image-optimizer", null)}
        onStartMockupGenerator={() => openTool("mockup-generator", null)}
        onStartFaviconGenerator={() => openTool("favicon-generator", null)}
        onStartAspectRatioFitter={() => openTool("aspect-ratio-fitter", null)}
        onStartGradientExtractor={() => openTool("gradient-extractor", null)}
        onStartExifStripper={() => openTool("exif-stripper", null)}
        onStartBatchWatermarker={() => openTool("batch-watermarker", null)}
        dict={dict}
        lang={lang}
      />
      <main id="main-content" className="flex-1">
        <HeroSection
          onStartApp={() => openTool("background-remover", null)}
          onStartOptimizer={() => openTool("image-optimizer", null)}
          onStartMockupGenerator={() => openTool("mockup-generator", null)}
          onSelectDemo={handleSelectDemo}
          comparisonPos={comparisonPos}
          setComparisonPos={setComparisonPos}
          dict={dict}
          lang={lang}
        />
        <ToolsCatalogSection
          lang={lang}
          onSelectTool={(slug) => openTool(slug, null)}
        />
        <SampleImagesSection
          onSelectDemo={handleSelectDemo}
          dict={dict}
          lang={lang}
        />
        <HowItWorksSection dict={dict} lang={lang} />
        <OptimizerInfoSection dict={dict} />
        <TestimonialsSection dict={dict} lang={lang} />
        <AboutSection dict={dict} lang={lang} />
        <FaqSection dict={dict} lang={lang} />
        <CtaSection
          onStartApp={() => openTool("background-remover", null)}
          onStartOptimizer={() => openTool("image-optimizer", null)}
          dict={dict}
          lang={lang}
        />
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { resolveToolSlug, type ToolSlug } from "@/lib/tools-catalog";
import BackgroundRemoverApp from "@/components/background-remover/background-remover-app";
import ImageOptimizerApp from "@/components/image-optimizer/image-optimizer-app";
import MockupGeneratorApp from "@/components/mockup-generator/mockup-generator-app";
import FaviconGeneratorApp from "@/components/favicon-generator/favicon-generator-app";
import AspectRatioFitterApp from "@/components/aspect-ratio-fitter/aspect-ratio-fitter-app";
import GradientExtractorApp from "@/components/gradient-extractor/gradient-extractor-app";
import ExifStripperApp from "@/components/exif-stripper/exif-stripper-app";
import BatchWatermarkerApp from "@/components/batch-watermarker/batch-watermarker-app";
import AiStreamerApp from "@/components/ai-streamer/ai-streamer-app";

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

function ToolQuerySync({ onSync }: { onSync: (slug: ToolSlug | null) => void }) {
  const searchParams = useSearchParams();
  const resolved = resolveToolSlug(searchParams.get("tool"));

  useEffect(() => {
    onSync(resolved);
  }, [resolved, onSync]);

  return null;
}

export default function HomeClient({
  dict,
  lang,
  initialTool = null,
}: {
  dict: any;
  lang: string;
  initialTool?: ToolSlug | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTool, setActiveTool] = useState<ToolSlug | null>(initialTool);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comparisonPos, setComparisonPos] = useState(50);

  const openTool = useCallback(
    (slug: ToolSlug, demoImage?: string | null) => {
      setSelectedFile(null);
      if (demoImage !== undefined) {
        setSelectedImage(demoImage);
      } else {
        setSelectedImage(null);
      }
      setActiveTool(slug);
      router.replace(`${pathname}?tool=${slug}`, { scroll: true });
    },
    [pathname, router]
  );

  const openToolWithFile = useCallback(
    (slug: ToolSlug, file: File) => {
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedImage(objectUrl);
      setActiveTool(slug);
      router.replace(`${pathname}?tool=${slug}`, { scroll: true });
    },
    [pathname, router]
  );

  const handleSelectDemo = (src: string) => {
    openTool("background-remover", src);
  };

  const handleClose = useCallback(() => {
    if (selectedImage && selectedImage.startsWith("blob:")) {
      URL.revokeObjectURL(selectedImage);
    }
    setActiveTool(null);
    setSelectedImage(null);
    setSelectedFile(null);
    router.replace(pathname, { scroll: false });
  }, [pathname, router, selectedImage]);

  const renderContent = () => {
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
      return (
        <ImageOptimizerApp
          initialFile={selectedFile}
          onClose={handleClose}
          dict={dict}
          lang={lang}
        />
      );
    }

    if (activeTool === "mockup-generator") {
      return <MockupGeneratorApp onClose={handleClose} dict={dict} lang={lang} />;
    }

    if (activeTool === "favicon-generator") {
      return (
        <FaviconGeneratorApp
          initialImage={selectedImage}
          onClose={handleClose}
          dict={dict}
          lang={lang}
        />
      );
    }

    if (activeTool === "aspect-ratio-fitter") {
      return (
        <AspectRatioFitterApp
          initialImage={selectedImage}
          onClose={handleClose}
          dict={dict}
          lang={lang}
        />
      );
    }

    if (activeTool === "gradient-extractor") {
      return (
        <GradientExtractorApp
          initialImage={selectedImage}
          onClose={handleClose}
          dict={dict}
          lang={lang}
        />
      );
    }

    if (activeTool === "exif-stripper") {
      return (
        <ExifStripperApp
          initialFile={selectedFile}
          onClose={handleClose}
          dict={dict}
          lang={lang}
        />
      );
    }

    if (activeTool === "batch-watermarker") {
      return <BatchWatermarkerApp onClose={handleClose} dict={dict} lang={lang} />;
    }

    if (activeTool === "ai-image-streamer") {
      return <AiStreamerApp onClose={handleClose} dict={dict} lang={lang} />;
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
            onSelectTool={(slug) => openTool(slug, null)}
            onLaunchToolWithFile={openToolWithFile}
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
  };

  return (
    <>
      <Suspense fallback={null}>
        <ToolQuerySync onSync={setActiveTool} />
      </Suspense>
      {renderContent()}
    </>
  );
}

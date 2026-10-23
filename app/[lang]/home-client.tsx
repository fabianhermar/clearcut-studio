"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ToolLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-accent animate-pulse">Cargando herramienta...</p>
    </div>
  </div>
);

const BackgroundRemoverApp = dynamic(() => import("@/components/background-remover/background-remover-app"), { ssr: false, loading: ToolLoadingFallback });
const ImageOptimizerApp = dynamic(() => import("@/components/image-optimizer/image-optimizer-app"), { ssr: false, loading: ToolLoadingFallback });
const MockupGeneratorApp = dynamic(() => import("@/components/mockup-generator/mockup-generator-app"), { ssr: false, loading: ToolLoadingFallback });
const FaviconGeneratorApp = dynamic(() => import("@/components/favicon-generator/favicon-generator-app"), { ssr: false, loading: ToolLoadingFallback });
const AspectRatioFitterApp = dynamic(() => import("@/components/aspect-ratio-fitter/aspect-ratio-fitter-app"), { ssr: false, loading: ToolLoadingFallback });
const GradientExtractorApp = dynamic(() => import("@/components/gradient-extractor/gradient-extractor-app"), { ssr: false, loading: ToolLoadingFallback });
const ExifStripperApp = dynamic(() => import("@/components/exif-stripper/exif-stripper-app"), { ssr: false, loading: ToolLoadingFallback });
const BatchWatermarkerApp = dynamic(() => import("@/components/batch-watermarker/batch-watermarker-app"), { ssr: false, loading: ToolLoadingFallback });

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SampleImagesSection } from "@/components/landing/sample-images-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { OptimizerInfoSection } from "@/components/landing/optimizer-info-section";
import { AboutSection, CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { FaqSection } from "@/components/landing/faq-section";

export type ActiveApp = "landing" | "remover" | "optimizer" | "mockup" | "favicon" | "aspect-ratio" | "gradient" | "exif" | "watermark";

export default function HomeClient({ dict, lang }: { dict: any; lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeApp, setActiveApp] = useState<ActiveApp | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comparisonPos, setComparisonPos] = useState(50);

  useEffect(() => {
    const tool = searchParams.get("tool");
    if (tool === "background-remover") setActiveApp("remover");
    else if (tool === "image-optimizer") setActiveApp("optimizer");
    else if (tool === "mockup-generator") setActiveApp("mockup");
    else if (tool === "favicon-generator") setActiveApp("favicon");
    else if (tool === "aspect-ratio-fitter") setActiveApp("aspect-ratio");
    else if (tool === "gradient-extractor") setActiveApp("gradient");
    else if (tool === "exif-stripper") setActiveApp("exif");
    else if (tool === "batch-watermarker") setActiveApp("watermark");
    else setActiveApp(null);
  }, [searchParams]);

  const handleSelectDemo = (src: string) => {
    setSelectedImage(src);
    setActiveApp("remover");
  };

  const handleStartBackgroundRemover = () => {
    setSelectedImage(null);
    setActiveApp("remover");
  };

  const handleStartOptimizer = () => {
    setActiveApp("optimizer");
  };

  const handleStartMockupGenerator = () => {
    setActiveApp("mockup");
  };

  const handleStartFaviconGenerator = () => {
    setActiveApp("favicon");
  };

  const handleStartAspectRatioFitter = () => {
    setActiveApp("aspect-ratio");
  };

  const handleStartGradientExtractor = () => {
    setActiveApp("gradient");
  };

  const handleStartExifStripper = () => {
    setActiveApp("exif");
  };

  const handleStartBatchWatermarker = () => {
    setActiveApp("watermark");
  };

  const handleClose = () => {
    setActiveApp(null);
    setSelectedImage(null);
    // Remove query params properly using Next.js router
    router.replace(pathname, { scroll: false });
  };

  if (activeApp === "remover") {
    return (
      <BackgroundRemoverApp
        initialImage={selectedImage || undefined}
        onClose={handleClose}
      />
    );
  }

  if (activeApp === "optimizer") {
    return <ImageOptimizerApp onClose={handleClose} />;
  }

  if (activeApp === "mockup") {
    return <MockupGeneratorApp onClose={handleClose} dict={dict} />;
  }

  if (activeApp === "favicon") {
    return <FaviconGeneratorApp onClose={handleClose} dict={dict} />;
  }

  if (activeApp === "aspect-ratio") {
    return <AspectRatioFitterApp onClose={handleClose} dict={dict} />;
  }

  if (activeApp === "gradient") {
    return <GradientExtractorApp onClose={handleClose} dict={dict} />;
  }

  if (activeApp === "exif") {
    return <ExifStripperApp onClose={handleClose} dict={dict} />;
  }

  if (activeApp === "watermark") {
    return <BatchWatermarkerApp onClose={handleClose} dict={dict} />;
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header
        onStartBackgroundRemover={handleStartBackgroundRemover}
        onStartOptimizer={handleStartOptimizer}
        onStartMockupGenerator={handleStartMockupGenerator}
        onStartFaviconGenerator={handleStartFaviconGenerator}
        onStartAspectRatioFitter={handleStartAspectRatioFitter}
        onStartGradientExtractor={handleStartGradientExtractor}
        onStartExifStripper={handleStartExifStripper}
        onStartBatchWatermarker={handleStartBatchWatermarker}
        dict={dict}
        lang={lang}
      />
      <HeroSection
        onStartApp={handleStartBackgroundRemover}
        onStartOptimizer={handleStartOptimizer}
        onStartMockupGenerator={handleStartMockupGenerator}
        onSelectDemo={handleSelectDemo}
        comparisonPos={comparisonPos}
        setComparisonPos={setComparisonPos}
        dict={dict}
      />
      <FeaturesSection dict={dict} />
      <OptimizerInfoSection dict={dict} />
      <SampleImagesSection onSelectDemo={handleSelectDemo} dict={dict} />
      <HowItWorksSection dict={dict} />
      <TestimonialsSection dict={dict} />
      <AboutSection dict={dict} />
      <FaqSection dict={dict} lang={lang} />
      <CtaSection 
        onStartApp={handleStartBackgroundRemover} 
        onStartOptimizer={handleStartOptimizer}
        dict={dict}
      />
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

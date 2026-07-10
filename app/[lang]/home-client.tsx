"use client";

import { useState, useEffect } from "react";
import BackgroundRemoverApp from "@/components/background-remover/background-remover-app";
import ImageOptimizerApp from "@/components/image-optimizer/image-optimizer-app";
import MockupGeneratorApp from "@/components/mockup-generator/mockup-generator-app";
import FaviconGeneratorApp from "@/components/favicon-generator/favicon-generator-app";
import AspectRatioFitterApp from "@/components/aspect-ratio-fitter/aspect-ratio-fitter-app";
import GradientExtractorApp from "@/components/gradient-extractor/gradient-extractor-app";
import ExifStripperApp from "@/components/exif-stripper/exif-stripper-app";
import BatchWatermarkerApp from "@/components/batch-watermarker/batch-watermarker-app";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SampleImagesSection } from "@/components/landing/sample-images-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { OptimizerInfoSection } from "@/components/landing/optimizer-info-section";
import { AboutSection, CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export type ActiveApp = "landing" | "remover" | "optimizer" | "mockup" | "favicon" | "aspect-ratio" | "gradient" | "exif" | "watermark";

export default function HomeClient({ dict, lang }: { dict: any; lang: string }) {
  const [activeApp, setActiveApp] = useState<ActiveApp | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comparisonPos, setComparisonPos] = useState(50);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("tool") === "background-remover") {
      setActiveApp("remover");
    }
    if (searchParams.get("tool") === "image-optimizer") {
      setActiveApp("optimizer");
    }
    if (searchParams.get("tool") === "mockup-generator") {
      setActiveApp("mockup");
    }
    if (searchParams.get("tool") === "favicon-generator") {
      setActiveApp("favicon");
    }
    if (searchParams.get("tool") === "aspect-ratio-fitter") {
      setActiveApp("aspect-ratio");
    }
    if (searchParams.get("tool") === "gradient-extractor") {
      setActiveApp("gradient");
    }
    if (searchParams.get("tool") === "exif-stripper") {
      setActiveApp("exif");
    }
    if (searchParams.get("tool") === "batch-watermarker") {
      setActiveApp("watermark");
    }
  }, []);

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
    // Remove query params
    window.history.replaceState({}, document.title, window.location.pathname);
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
      <CtaSection 
        onStartApp={handleStartBackgroundRemover} 
        onStartOptimizer={handleStartOptimizer}
        dict={dict}
      />
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

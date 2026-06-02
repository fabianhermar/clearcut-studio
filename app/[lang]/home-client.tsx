"use client";

import { useState } from "react";
import BackgroundRemoverApp from "@/components/background-remover/background-remover-app";
import ImageOptimizerApp from "@/components/image-optimizer/image-optimizer-app";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SampleImagesSection } from "@/components/landing/sample-images-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { OptimizerInfoSection } from "@/components/landing/optimizer-info-section";
import { AboutSection, CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

type ActiveApp = null | "background-remover" | "optimizer";

export default function HomeClient({ dict, lang }: { dict: any; lang: string }) {
  const [activeApp, setActiveApp] = useState<ActiveApp>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comparisonPos, setComparisonPos] = useState(50);

  const handleSelectDemo = (src: string) => {
    setSelectedImage(src);
    setActiveApp("background-remover");
  };

  const handleStartBackgroundRemover = () => {
    setSelectedImage(null);
    setActiveApp("background-remover");
  };

  const handleStartOptimizer = () => {
    setActiveApp("optimizer");
  };

  const handleClose = () => {
    setActiveApp(null);
    setSelectedImage(null);
  };

  if (activeApp === "background-remover") {
    return (
      <BackgroundRemoverApp
        initialImage={selectedImage || undefined}
        onClose={handleClose}
        dict={dict}
      />
    );
  }

  if (activeApp === "optimizer") {
    return <ImageOptimizerApp onClose={handleClose} dict={dict} />;
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header
        onStartBackgroundRemover={handleStartBackgroundRemover}
        onStartOptimizer={handleStartOptimizer}
        dict={dict}
        lang={lang}
      />
      <HeroSection
        onStartApp={handleStartBackgroundRemover}
        onStartOptimizer={handleStartOptimizer}
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

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs
      ? "Precios y Modelo Abierto | ClearCut Studio"
      : "Pricing & Open Model | ClearCut Studio",
    description: isEs
      ? "ClearCut Studio es 100% gratuito para todas sus herramientas locales. Conoce nuestro modelo abierto y cómo apoyar el proyecto."
      : "ClearCut Studio is 100% free for all local tools. Learn about our open model and how to support the project.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/pricing`,
      languages: {
        es: "https://studio.fabianh.me/es/pricing",
        en: "https://studio.fabianh.me/en/pricing",
      },
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 w-full flex flex-col justify-center">
        <PricingSection dict={dict} lang={lang} />
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}

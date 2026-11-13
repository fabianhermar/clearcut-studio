import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs ? "Precios | ClearCut Studio" : "Pricing | ClearCut Studio",
    description: isEs
      ? "ClearCut Studio es 100% gratis para procesamiento local. Conoce nuestro acceso libre, cómo apoyar el proyecto y el modelo futuro BYOK."
      : "ClearCut Studio is 100% free for local processing. Explore our free studio access, voluntary sponsorship, and upcoming BYOK transparency.",
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
    <div className="min-h-screen bg-background studio-grid flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-24 sm:pt-28 pb-24">
        <PricingSection dict={dict} lang={lang} />
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}

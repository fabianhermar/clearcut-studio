import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { PricingSection } from "@/components/landing/pricing-section";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Precios | ClearCut Studio" : "Pricing | ClearCut Studio",
    description: lang === "es" 
      ? "ClearCut Studio es 100% gratis. Conoce nuestros planes y cómo apoyarnos."
      : "ClearCut Studio is 100% free. Learn about our plans and how to support us."
  };
}

export default async function PricingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <main className="min-h-screen bg-background flex flex-col pt-16">
      <Header dict={dict} lang={lang} />
      <div className="flex-1 w-full flex flex-col justify-center">
        <PricingSection dict={dict} lang={lang} />
      </div>
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

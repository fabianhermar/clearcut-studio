import { getDictionary, Locale } from "@/lib/dictionaries";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <Header dict={dict} lang={lang} />
      {children}
      <Footer dict={dict} lang={lang} />
    </>
  );
}

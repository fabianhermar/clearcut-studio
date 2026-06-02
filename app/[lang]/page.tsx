import { getDictionary, Locale } from "@/lib/dictionaries";
import HomeClient from "./home-client";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  return <HomeClient dict={dict} lang={lang as Locale} />;
}

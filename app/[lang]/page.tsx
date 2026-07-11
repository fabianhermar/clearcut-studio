import { getDictionary, Locale } from "@/lib/dictionaries";
import HomeClient from "./home-client";
import { Suspense } from "react";

export default async function Home({ params }: { params: Promise<any> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient dict={dict} lang={lang as Locale} />
    </Suspense>
  );
}

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === "es";
  return {
    title: isEs ? "Términos de Uso — ClearCut Studio" : "Terms of Use — ClearCut Studio",
    description: isEs
      ? "Condiciones transparentes de uso de ClearCut Studio para proyectos personales y comerciales."
      : "Transparent terms of use for ClearCut Studio across personal and commercial projects.",
    alternates: {
      canonical: `https://studio.fabianh.me/${lang}/terms`,
      languages: {
        es: "https://studio.fabianh.me/es/terms",
        en: "https://studio.fabianh.me/en/terms",
      },
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          code: "01",
          title: "Uso permitido del servicio",
          body: "ClearCut Studio pone a tu disposición un conjunto de utilidades web gratuitas para editar, comprimir, convertir y preparar imágenes en tu propio navegador. Puedes utilizar los archivos exportados en proyectos personales, educativos o comerciales sin marcas de agua ni regalías.",
        },
        {
          code: "02",
          title: "Propiedad intelectual de tus archivos",
          body: "Conservas el 100% de los derechos de autor y titularidad sobre las fotografías e ilustraciones que proceses con nuestras herramientas. Al ejecutarse localmente en tu dispositivo, ClearCut Studio no adquiere licencia alguna sobre tus contenidos.",
        },
        {
          code: "03",
          title: "Responsabilidad del usuario",
          body: "Eres responsable de garantizar que cuentas con los derechos necesarios sobre las imágenes que editas y de verificar que los activos exportados cumplan con los requisitos técnicos de tu plataforma de destino.",
        },
        {
          code: "04",
          title: "Disponibilidad de funciones experimentales",
          body: "Algunas utilidades listadas en Studio Lab (marcadas como Pronto) se encuentran en fase de desarrollo o evaluación. Sus especificaciones pueden ajustarse antes de habilitarse en el estudio principal.",
        },
        {
          code: "05",
          title: "Contacto y soporte",
          body: "Si encuentras errores técnicos o deseas proponer mejoras de compatibilidad, puedes escribirnos a soporte@clearcut.studio.",
        },
      ]
    : [
        {
          code: "01",
          title: "Permitted Service Usage",
          body: "ClearCut Studio provides free browser-based utilities for editing, compressing, converting, and preparing visual assets. You may use exported outputs in personal, educational, and commercial projects without watermarks or royalties.",
        },
        {
          code: "02",
          title: "Ownership of Your Files",
          body: "You retain 100% of copyright and ownership over any images processed through our tools. Because processing stays local on your device, ClearCut Studio receives no license or claim over your files.",
        },
        {
          code: "03",
          title: "User Responsibility",
          body: "You remain responsible for ensuring you hold appropriate rights for the media you edit and for validating exported files before production deployment.",
        },
        {
          code: "04",
          title: "Experimental Studio Lab Modules",
          body: "Certain upcoming utilities listed in Studio Lab (marked Soon) remain in active testing and progressive rollout; specifications may evolve prior to general availability.",
        },
        {
          code: "05",
          title: "Support & Inquiries",
          body: "For bug reports or compatibility feedback, reach out to soporte@clearcut.studio.",
        },
      ];

  return (
    <div className="min-h-screen bg-background studio-grid flex flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="pb-10 mb-10 border-b border-border">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              {isEs ? "MARCO LEGAL // CONDICIONES" : "LEGAL // TERMS OF USE"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
              {isEs ? "Términos de Uso" : "Terms of Use"}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {isEs
                ? "Reglas claras, directas y sin letra pequeña sobre el uso de ClearCut Studio."
                : "Clear, direct rules with zero fine print governing the use of ClearCut Studio."}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden">
            {sections.map((sec) => (
              <section key={sec.code} className="p-6 sm:p-8 grid sm:grid-cols-12 gap-4 items-start">
                <span className="sm:col-span-2 font-mono text-xs font-bold text-primary pt-1">
                  TERM {sec.code}
                </span>
                <div className="sm:col-span-10 space-y-2">
                  <h2 className="font-heading font-bold text-xl text-foreground">
                    {sec.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-accent">
                    {sec.body}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}

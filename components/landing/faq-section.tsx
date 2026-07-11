"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqSectionProps {
  dict?: any;
  lang?: string;
}

export function FaqSection({ dict, lang = "en" }: FaqSectionProps) {
  const faqs = [
    {
      q: lang === "es" ? "¿ClearCut Studio es realmente 100% gratis?" : "Is ClearCut Studio really 100% free?",
      a: lang === "es"
        ? "Sí, nuestra suite es totalmente gratuita y no tiene muros de pago obligatorios ni anuncios molestos. Lo mantenemos así gracias a las donaciones voluntarias de la comunidad y a nuestra filosofía de procesamiento local, que elimina los altísimos costos de servidores en la nube."
        : "Yes, our suite is completely free and has no mandatory paywalls or annoying ads. We keep it this way thanks to voluntary community donations and our local processing philosophy, which eliminates huge cloud server costs."
    },
    {
      q: lang === "es" ? "¿Mis fotos o imágenes se suben a la nube?" : "Are my photos or images uploaded to the cloud?",
      a: lang === "es"
        ? "No. Tu privacidad es nuestra prioridad absoluta. Todo el procesamiento (como la eliminación de fondos o la optimización) ocurre localmente en tu dispositivo, directamente dentro de tu navegador web. Tus archivos nunca viajan a nuestros servidores."
        : "No. Your privacy is our absolute priority. All processing (like background removal or optimization) happens locally on your device, right inside your web browser. Your files never travel to our servers."
    },
    {
      q: lang === "es" ? "¿Qué pasará cuando agreguen herramientas avanzadas de IA?" : "What happens when you add advanced AI tools?",
      a: lang === "es"
        ? "Para funciones futuras que requieran una capacidad de cómputo inmensa (como la edición de IA generativa avanzada), adoptaremos un modelo híbrido. Para mantener la plataforma gratuita y rápida, integraremos soporte para APIs de terceros."
        : "For future features that require immense computational power (like advanced generative AI editing), we will adopt a hybrid model. To keep the platform free and fast, we will integrate support for third-party APIs."
    },
    {
      q: lang === "es" ? "¿Qué significa el Modelo BYOK (Trae tu propia API Key)?" : "What does the BYOK (Bring Your Own Key) Model mean?",
      a: lang === "es"
        ? "Significa que para usar herramientas pesadas de IA, te daremos la opción de conectar de forma segura tus propias credenciales de plataformas como ChatGPT, Gemini u otras IAs. Nosotros ponemos la interfaz profesional, y tú controlas el motor de procesamiento."
        : "It means that to use heavy AI tools, we will give you the option to securely connect your own credentials from platforms like ChatGPT, Gemini, or other AIs. We provide the professional interface, and you control the processing engine."
    },
    {
      q: lang === "es" ? "¿Por qué es mejor usar mi propia llave de API en lugar de pagarles una suscripción a ustedes?" : "Why is it better to use my own API key instead of paying you a subscription?",
      a: lang === "es"
        ? "1. Rendimiento sin bloqueos: Al procesar tareas masivas en la nube especializada en lugar de en tu PC local, evitas que tu computadora sufra sobrecalentamientos o buffers largos.\n\n2. Cero sobreprecios: En lugar de pagarnos una suscripción mensual cara para que nosotros paguemos a la IA, tú pagas directamente fracciones de centavo al proveedor por el consumo exacto que tienes."
        : "1. Zero hardware bottlenecks: By processing massive tasks in the specialized cloud instead of your local PC, you prevent your computer from overheating or suffering long buffers.\n\n2. No subscription markups: Instead of paying us an expensive monthly subscription so we can pay the AI, you pay fractions of a cent directly to the provider for your exact usage."
    },
    {
      q: lang === "es" ? "¿Hay algún límite en el número o tamaño de imágenes que puedo procesar?" : "Is there a limit on the number or size of images I can process?",
      a: lang === "es"
        ? "No hay límites artificiales ni créditos que comprar. Dado que el procesamiento ocurre localmente, tu único límite es la memoria RAM de tu computadora. Puedes procesar todas las imágenes que necesites sin preocuparte."
        : "There are no artificial limits or credits to buy. Since processing happens locally, your only limit is your computer's RAM. You can process as many images as you need without worrying."
    },
    {
      q: lang === "es" ? "¿Funciona bien en teléfonos móviles o tablets?" : "Does it work well on mobile phones or tablets?",
      a: lang === "es"
        ? "Actualmente el soporte para móviles es parcial y seguimos trabajando intensamente para lograr una compatibilidad completa. Aunque la interfaz se adapta a tu pantalla, para herramientas que requieren procesamiento local intenso de IA recomendamos fuertemente usar una computadora (PC/Mac) para evitar que el navegador móvil cierre la pestaña por falta de memoria."
        : "Currently, mobile support is partial and we are actively working to achieve full compatibility. Although the interface adapts to your screen, for tools that require intensive local AI processing, we strongly recommend using a computer (PC/Mac) to prevent the mobile browser from closing the tab due to lack of memory."
    },
    {
      q: lang === "es" ? "¿Qué pasa si me quedo sin internet mientras uso la herramienta?" : "What happens if I lose my internet connection while using the tool?",
      a: lang === "es"
        ? "¡La herramienta seguirá funcionando! Como procesamos los datos directamente en tu navegador mediante tecnología WebAssembly, una vez que la página haya cargado inicialmente, ya no dependes del internet para limpiar y editar tus imágenes."
        : "The tool will keep working! Since we process data directly in your browser using WebAssembly technology, once the page has initially loaded, you no longer rely on the internet to clean and edit your images."
    }
  ];

  return (
    <section className="py-24 bg-background relative border-t border-border overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left Column: Title & Desc */}
          <div className="sticky top-24">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-6 leading-tight">
              {lang === "es" ? "Preguntas Frecuentes" : "Frequently asked questions"}
            </h2>
            <p className="text-lg text-muted-foreground font-accent max-w-md">
              {lang === "es"
                ? "Explora las respuestas a las preguntas más comunes de nuestros usuarios sobre privacidad, costos y el futuro de ClearCut."
                : "Explore answers to the most common questions from our users about privacy, costs, and the future of ClearCut."}
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="w-full mt-4 md:mt-0">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-border/60"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold font-heading text-foreground hover:text-primary py-6 hover:no-underline group">
                    <span className="pr-4">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-accent leading-relaxed text-sm md:text-base pb-6 pr-8">
                    {faq.a.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i !== faq.a.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </div>
    </section>
  );
}

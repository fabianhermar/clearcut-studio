import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Términos y Condiciones | ClearCut Studio" : "Terms & Conditions | ClearCut Studio",
    description: lang === "es" 
      ? "Términos de servicio para el uso de las herramientas de ClearCut Studio."
      : "Terms of service for the use of ClearCut Studio tools."
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">
          {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
        </h1>
        <p className="text-muted-foreground font-accent mb-8">
          {isEs ? "Última actualización: Junio de 2026" : "Last updated: June 2026"}
        </p>
        
        <div className="prose prose-invert prose-lg font-accent text-muted-foreground">
          {isEs ? (
            <>
              <p>
                Al utilizar ClearCut Studio, aceptas estos términos y condiciones. Por favor, 
                léelos detenidamente antes de utilizar nuestras herramientas.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">1. Uso del Servicio</h2>
              <p>
                ClearCut Studio se proporciona como una herramienta web gratuita para uso personal 
                y comercial. No se requiere registro para utilizar las funciones principales de 
                eliminación de fondo u optimización de imágenes.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Limitación de Responsabilidad</h2>
              <p>
                Aunque nos esforzamos por ofrecer herramientas de la más alta calidad, las funcionalidades 
                impulsadas por inteligencia artificial y algoritmos de compresión pueden producir 
                resultados inesperados o cometer errores. El uso de la herramienta es bajo tu propio riesgo. 
                ClearCut Studio no se hace responsable por ninguna pérdida de datos, daños a la reputación 
                o pérdidas económicas que puedan derivarse del uso de imágenes procesadas en esta plataforma.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Derechos de Autor de las Imágenes</h2>
              <p>
                Tú mantienes todos los derechos de autor sobre las imágenes que procesas con ClearCut Studio. 
                Dado que todo el procesamiento se realiza de manera local en tu navegador, nosotros no 
                almacenamos, reclamamos propiedad ni utilizamos tus imágenes para ningún propósito.
              </p>
              <p>
                Es tu responsabilidad asegurarte de que tienes los derechos legales para modificar y 
                utilizar cualquier imagen que cargues en la herramienta.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Uso de APIs de Terceros (Modelo Híbrido)</h2>
              <p>
                Ciertas funcionalidades avanzadas de la plataforma (actuales o futuras) pueden requerir el uso de servicios de Inteligencia Artificial en la nube. Para estas herramientas, proporcionaremos la opción de usar tus propias credenciales de API (modelo BYOK).
              </p>
              <p>
                Al utilizar tus propias claves de API de terceros (como OpenAI, Google, etc.), aceptas que estás sujeto a los Términos de Servicio específicos de dichos proveedores. ClearCut Studio actúa únicamente como una interfaz y no se hace responsable por los cargos, facturación, bloqueos de cuenta o mal uso de dichas APIs externas.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">5. Disponibilidad del Servicio</h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o descontinuar temporal o permanentemente 
                cualquier parte del servicio en cualquier momento, con o sin previo aviso.
              </p>
            </>
          ) : (
            <>
              <p>
                By using ClearCut Studio, you agree to these terms and conditions. Please read them 
                carefully before using our tools.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">1. Use of Service</h2>
              <p>
                ClearCut Studio is provided as a free web tool for personal and commercial use. 
                No registration is required to use the core features of background removal or image optimization.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Limitation of Liability</h2>
              <p>
                Although we strive to offer the highest quality tools, AI-powered features and compression 
                algorithms can produce unexpected results or make mistakes. Use of the tool is at your own risk. 
                ClearCut Studio is not responsible for any data loss, reputational damage, or financial losses 
                that may result from the use of images processed on this platform.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Image Copyrights</h2>
              <p>
                You retain all copyrights to the images you process with ClearCut Studio. 
                Since all processing is done locally in your browser, we do not store, claim ownership of, 
                or use your images for any purpose.
              </p>
              <p>
                It is your responsibility to ensure that you have the legal rights to modify and 
                use any image you upload to the tool.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Use of Third-Party APIs (Hybrid Model)</h2>
              <p>
                Certain advanced features of the platform (current or future) may require the use of cloud-based Artificial Intelligence services. For these tools, we will provide the option to use your own API credentials (BYOK model).
              </p>
              <p>
                By using your own third-party API keys (such as OpenAI, Google, etc.), you agree that you are subject to the specific Terms of Service of those providers. ClearCut Studio acts solely as an interface and is not responsible for charges, billing, account blocks, or misuse of such external APIs.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">5. Service Availability</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue temporarily or permanently 
                any part of the service at any time, with or without prior notice.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

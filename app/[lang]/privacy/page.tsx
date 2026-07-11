import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Política de Privacidad | ClearCut Studio" : "Privacy Policy | ClearCut Studio",
    description: lang === "es" 
      ? "Nuestras políticas de privacidad. Tu privacidad es nuestra prioridad, todo se procesa localmente."
      : "Our privacy policy. Your privacy is our priority, everything is processed locally."
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">
          {isEs ? "Política de Privacidad" : "Privacy Policy"}
        </h1>
        <p className="text-muted-foreground font-accent mb-8">
          {isEs ? "Última actualización: Junio de 2026" : "Last updated: June 2026"}
        </p>
        
        <div className="prose dark:prose-invert prose-slate prose-lg max-w-none font-accent text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
          {isEs ? (
            <>
              <p>
                En ClearCut Studio, la privacidad no es solo una característica adicional, 
                sino el núcleo fundamental de cómo construimos nuestra plataforma.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">1. Procesamiento de Imágenes Local</h2>
              <p>
                Tanto nuestra herramienta de Eliminación de Fondos como el Optimizador de Imágenes 
                funcionan utilizando tecnologías ejecutadas enteramente dentro de tu navegador (como 
                WebAssembly y APIs nativas de Canvas). <strong>Tus imágenes nunca son enviadas a nuestros servidores.</strong>
              </p>
              <p>
                Cualquier procesamiento, edición o compresión de archivos se realiza usando el poder 
                de procesamiento de tu propio dispositivo. Por lo tanto, es técnicamente imposible 
                para nosotros acceder, ver o almacenar las imágenes que editas con ClearCut Studio.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Integración de APIs de Terceros (Modelo Híbrido)</h2>
              <p>
                Aunque nuestra promesa principal es el procesamiento local, el desarrollo de herramientas de Inteligencia Artificial Generativa altamente complejas requerirá de un modelo de procesamiento híbrido. Para mantener la plataforma gratuita y evitar que tu dispositivo sufra problemas de rendimiento, implementaremos un modelo "BYOK" (Trae tu propia clave de API).
              </p>
              <p>
                <strong>Privacidad de las APIs externas:</strong> El uso de estas APIs siempre será opcional y explícito. Te notificaremos claramente antes de que cualquier archivo o imagen deba abandonar tu dispositivo para ser procesado en la nube. Al utilizar tus propias credenciales (de plataformas como OpenAI o Google), el tratamiento de esos datos específicos estará sujeto exclusivamente a las políticas de privacidad del proveedor de la API que decidas conectar.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Recopilación de Datos Analíticos</h2>
              <p>
                Actualmente, ClearCut Studio no almacena cuentas de usuario ni requiere registro. 
                No recopilamos información personal identificable.
              </p>
              <p className="mt-4">
                <strong>Fines Estrictamente Profesionales:</strong> Utilizamos servicios de análisis web (específicamente Microsoft Clarity) con el único propósito de entender de forma anónima cómo interactúan los usuarios con nuestra página. Esto nos permite descubrir qué herramientas son más útiles, dónde se dificulta la navegación y cómo podemos mejorar la interfaz general. Estos datos de interacción son para uso interno exclusivo y no se venden ni se comparten con terceros para fines publicitarios.
              </p>
              <p className="mt-4">
                <strong>¿Cómo funciona esto y por qué tu privacidad está a salvo?</strong> Microsoft Clarity no graba tu pantalla 
                como un video, sino que registra coordenadas matemáticas (dónde se mueve el ratón o se hace clic) y la estructura 
                de la interfaz. Por defecto, esta herramienta enmascara datos sensibles. Toda la información se recopila de 
                manera disociada, no está vinculada a tu identidad y, lo más importante, <strong>jamás incluye, rastrea ni sube 
                las imágenes que procesas</strong>. El procesamiento de tus fotos ocurre en un entorno aislado dentro de tu 
                navegador (WebAssembly), totalmente fuera del alcance de cualquier herramienta de análisis. Tu privacidad visual 
                está garantizada en todo momento.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Cookies</h2>
              <p>
                Utilizamos tecnologías de almacenamiento local del navegador (como LocalStorage) 
                exclusivamente para recordar tus preferencias dentro de la herramienta, como los 
                parámetros de calidad o herramientas utilizadas recientemente.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">5. Cambios en esta política</h2>
              <p>
                ClearCut Studio se reserva el derecho de modificar esta política en el futuro 
                a medida que agreguemos nuevas funcionalidades. Sin embargo, nuestro compromiso con el 
                procesamiento de imágenes 100% local nunca cambiará.
              </p>
            </>
          ) : (
            <>
              <p>
                At ClearCut Studio, privacy is not just an added feature, but the fundamental 
                core of how we build our platform.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">1. Local Image Processing</h2>
              <p>
                Both our Background Remover and Image Optimizer work using technologies executed 
                entirely within your browser (such as WebAssembly and native Canvas APIs). 
                <strong>Your images are never sent to our servers.</strong>
              </p>
              <p>
                Any processing, editing, or file compression is performed using the processing 
                power of your own device. Therefore, it is technically impossible for us to access, 
                view, or store the images you edit with ClearCut Studio.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Third-Party API Integration (Hybrid Model)</h2>
              <p>
                Although our core promise is local processing, the development of highly complex Generative AI tools will require a hybrid processing model. To keep the platform free and prevent your device from suffering performance issues, we will implement a "BYOK" (Bring Your Own Key) model.
              </p>
              <p>
                <strong>External API Privacy:</strong> The use of these APIs will always be optional and explicit. We will clearly notify you before any file or image needs to leave your device to be processed in the cloud. By using your own credentials (from platforms like OpenAI or Google), the handling of that specific data will be strictly subject to the privacy policies of the API provider you choose to connect.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Analytics Data Collection</h2>
              <p>
                Currently, ClearCut Studio does not store user accounts or require registration. 
                We do not collect personally identifiable information.
              </p>
              <p className="mt-4">
                <strong>Strictly Professional Purposes:</strong> We use web analytics services (specifically Microsoft Clarity) with the sole purpose of anonymously understanding how users interact with our page. This allows us to discover which tools are most useful, where navigation becomes difficult, and how we can improve the overall interface. This interaction data is for exclusive internal use and is not sold or shared with third parties for advertising purposes.
              </p>
              <p className="mt-4">
                <strong>How does this work and why is your privacy safe?</strong> Microsoft Clarity does not record your screen 
                as a video. Instead, it logs mathematical coordinates (where the mouse moves or clicks) and interface structure. 
                By default, this tool masks sensitive data. All information is collected in a dissociated manner, is not 
                linked to your identity, and most importantly, <strong>never includes, tracks, or uploads the images you 
                process</strong>. Your photo processing occurs in an isolated environment within your browser (WebAssembly), 
                completely out of reach of any analytics tools. Your visual privacy is guaranteed at all times.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Cookies</h2>
              <p>
                We use browser local storage technologies (such as LocalStorage) exclusively to 
                remember your preferences within the tool, such as quality parameters or recently 
                used tools.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">5. Changes to this policy</h2>
              <p>
                ClearCut Studio reserves the right to modify this policy in the future as we add 
                new features. However, our commitment to 100% local image processing will never change.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

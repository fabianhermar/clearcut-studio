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
        
        <div className="prose prose-invert prose-lg font-accent text-muted-foreground">
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

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Recopilación de Datos Analíticos</h2>
              <p>
                Actualmente, ClearCut Studio no almacena cuentas de usuario ni requiere registro. 
                No recopilamos información personal identificable.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Cookies</h2>
              <p>
                Utilizamos tecnologías de almacenamiento local del navegador (como LocalStorage) 
                exclusivamente para recordar tus preferencias dentro de la herramienta, como los 
                parámetros de calidad o herramientas utilizadas recientemente.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Cambios en esta política</h2>
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

              <h2 className="text-foreground font-heading mt-10 mb-4">2. Analytics Data Collection</h2>
              <p>
                Currently, ClearCut Studio does not store user accounts or require registration. 
                We do not collect personally identifiable information.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">3. Cookies</h2>
              <p>
                We use browser local storage technologies (such as LocalStorage) exclusively to 
                remember your preferences within the tool, such as quality parameters or recently 
                used tools.
              </p>

              <h2 className="text-foreground font-heading mt-10 mb-4">4. Changes to this policy</h2>
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

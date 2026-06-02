import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Sobre nosotros | ClearCut Studio" : "About us | ClearCut Studio",
    description: lang === "es" 
      ? "Conoce más sobre la misión y el equipo detrás de ClearCut Studio."
      : "Learn more about the mission and team behind ClearCut Studio."
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">
          {isEs ? "Sobre nosotros" : "About Us"}
        </h1>
        <div className="prose prose-invert prose-lg font-accent text-muted-foreground">
          {isEs ? (
            <>
              <p>
                En ClearCut Studio, creemos que las herramientas de edición de imágenes de nivel profesional 
                deben ser accesibles para todos, sin comprometer la privacidad o la velocidad.
              </p>
              <p>
                Nuestra herramienta nació de una frustración común: la mayoría de los editores y 
                optimizadores en línea requieren suscripciones costosas, te obligan a subir tus imágenes 
                personales a servidores de terceros, o limitan artificialmente la calidad y el tamaño 
                de tus descargas.
              </p>
              <h2 className="text-foreground font-heading mt-12 mb-4">Nuestra Misión</h2>
              <p>
                Queremos democratizar la edición visual proporcionando herramientas impulsadas por 
                Inteligencia Artificial y WebAssembly que funcionen completa y enteramente en tu navegador.
              </p>
              <p>
                Al ejecutar el código de procesamiento de imágenes directamente en tu dispositivo, 
                garantizamos que tus fotos nunca abandonen tu computadora. Esto no solo significa 
                privacidad total, sino también cero tiempos de espera por subida y descarga de archivos.
              </p>
              <h2 className="text-foreground font-heading mt-12 mb-4">El Equipo</h2>
              <p>
                ClearCut Studio es diseñado y desarrollado con ♥ por Fabian Herrera, junto con la ayuda de la 
                herramienta Antigravity de Google. Nuestra meta es continuar iterando y agregando 
                nuevas funcionalidades poderosas, manteniendo la simplicidad y gratuidad que nos caracteriza.
              </p>
            </>
          ) : (
            <>
              <p>
                At ClearCut Studio, we believe that professional-grade image editing tools should be 
                accessible to everyone, without compromising privacy or speed.
              </p>
              <p>
                Our tool was born out of a common frustration: most online editors and optimizers 
                require expensive subscriptions, force you to upload personal images to third-party 
                servers, or artificially limit the quality and size of your downloads.
              </p>
              <h2 className="text-foreground font-heading mt-12 mb-4">Our Mission</h2>
              <p>
                We want to democratize visual editing by providing AI-powered and WebAssembly 
                tools that run completely and entirely in your browser.
              </p>
              <p>
                By executing the image processing code directly on your device, we guarantee that 
                your photos never leave your computer. This not only means total privacy but also 
                zero wait times for file uploads and downloads.
              </p>
              <h2 className="text-foreground font-heading mt-12 mb-4">The Team</h2>
              <p>
                ClearCut Studio is designed and developed with ♥ by Fabian Herrera, along with the help of 
                Google's Antigravity tool. Our goal is to continue iterating and adding powerful 
                new features, while maintaining the simplicity and free nature that characterizes us.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

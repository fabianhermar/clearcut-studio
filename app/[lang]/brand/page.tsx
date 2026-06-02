import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { getDictionary, Locale } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    title: lang === "es" ? "El Proyecto y Marca | ClearCut Studio" : "Project & Brand | ClearCut Studio",
    description: lang === "es" 
      ? "Conoce el manifiesto del proyecto, cómo apoyarnos y nuestros recursos de marca."
      : "Read the project manifesto, how to support us, and view our brand assets."
  };
}

export default async function BrandPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isEs = lang === "es";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header dict={dict} lang={lang} />
      <div className="flex-1 max-w-4xl mx-auto px-4 py-32 w-full">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-8">
          {isEs ? "El Proyecto y Marca" : "Project & Brand"}
        </h1>
        
        <div className="prose prose-invert prose-lg font-accent text-muted-foreground mb-16">
          <h2 className="text-foreground font-heading mt-8 mb-4">
            {isEs ? "Manifiesto del Desarrollador" : "Developer's Manifesto"}
          </h2>
          
          {isEs ? (
            <>
              <p>
                ClearCut Studio nació como un proyecto personal con una visión clara: demostrar que la web moderna 
                es lo suficientemente poderosa como para ejecutar herramientas gráficas avanzadas sin depender de 
                suscripciones abusivas o servidores remotos que comprometan la privacidad del usuario.
              </p>
              <p>
                <strong>Mi promesa es simple:</strong> ClearCut Studio será 100% gratuito para siempre. 
                No habrá muros de pago (paywalls), ni marcas de agua forzadas, ni límites diarios de uso. 
                Las herramientas principales (eliminación de fondos y optimización de imágenes) siempre 
                estarán disponibles para todos.
              </p>

              <h2 className="text-foreground font-heading mt-12 mb-4">¿Cómo financiar o apoyar el proyecto?</h2>
              <p>
                Mantener, diseñar y actualizar este proyecto requiere cientos de horas de trabajo y dedicación. 
                Aunque el procesamiento ocurre en tu navegador (lo que nos ahorra costos de servidores masivos), 
                aún existen costos asociados al dominio, diseño, alojamiento estático y, sobre todo, el tiempo de desarrollo.
              </p>
              <p>
                Si esta herramienta te ha ayudado en tu trabajo, te ha ahorrado dinero en suscripciones o simplemente 
                te encanta la iniciativa, puedes apoyar el proyecto directamente. Tu ayuda garantiza que ClearCut Studio 
                siga siendo libre, se mantenga actualizado y podamos desarrollar nuevas herramientas como 
                el próximo recortador y escalador de imágenes con IA.
              </p>
            </>
          ) : (
            <>
              <p>
                ClearCut Studio was born as a personal project with a clear vision: to prove that the modern web 
                is powerful enough to run advanced graphic tools without relying on abusive subscriptions or remote 
                servers that compromise user privacy.
              </p>
              <p>
                <strong>My promise is simple:</strong> ClearCut Studio will be 100% free forever. 
                There will be no paywalls, forced watermarks, or daily usage limits. 
                The core tools (background removal and image optimization) will always be available to everyone.
              </p>

              <h2 className="text-foreground font-heading mt-12 mb-4">How to fund or support the project?</h2>
              <p>
                Maintaining, designing, and updating this project requires hundreds of hours of work and dedication. 
                Although processing happens in your browser (saving us massive server costs), there are still 
                costs associated with domains, design, static hosting, and above all, development time.
              </p>
              <p>
                If this tool has helped you in your work, saved you money on subscriptions, or you just 
                love the initiative, you can support the project directly. Your help ensures that ClearCut Studio 
                remains free, stays updated, and allows us to develop new tools like the upcoming AI image 
                cropper and upscaler.
              </p>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 mb-16">
            <a 
              href="https://www.buymeacoffee.com/fabianhermar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105 hover:shadow-lg rounded-lg"
            >
              <img 
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
                alt="Buy Me a Coffee" 
                className="h-[60px] w-[217px]" 
              />
            </a>
            <a 
              href="https://github.com/sponsors" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex font-accent items-center justify-center gap-2 px-8 py-4 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-xl transition-all shadow-lg shadow-black/5 text-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              {isEs ? "Sponsor en GitHub" : "Sponsor on GitHub"}
            </a>
          </div>

          <hr className="border-border my-12" />

          <h2 className="text-foreground font-heading mt-8 mb-4">
            {isEs ? "Media Kit y Marca" : "Media Kit & Brand"}
          </h2>
          <p>
            {isEs 
              ? "Si deseas escribir sobre nosotros, puedes utilizar nuestros recursos de marca. Por favor, no modifiques las proporciones ni los colores corporativos."
              : "If you wish to write about us, you can use our brand assets. Please do not modify the proportions or corporate colors."
            }
          </p>
        </div>

        <h3 className="text-2xl font-bold font-heading text-foreground mb-6">
          {isEs ? "Logotipo Principal" : "Main Logo"}
        </h3>
        <div className="p-12 bg-card border border-border rounded-2xl flex items-center justify-center mb-12 shadow-medium">
          <img src="/logos/ClearCut-logo.avif" alt="ClearCut Studio Logo" className="h-32 w-auto" />
        </div>

        <h3 className="text-2xl font-bold font-heading text-foreground mb-6">
          {isEs ? "Colores Corporativos" : "Brand Colors"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
            <div className="w-16 h-16 rounded-lg shadow-sm" style={{ backgroundColor: "#3b82f6" }}></div>
            <div>
              <p className="font-heading font-semibold text-foreground">Primary Blue</p>
              <p className="font-accent text-sm text-muted-foreground">HEX: #3B82F6</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card">
            <div className="w-16 h-16 rounded-lg shadow-sm" style={{ backgroundColor: "#0f172a" }}></div>
            <div>
              <p className="font-heading font-semibold text-foreground">Dark Background</p>
              <p className="font-accent text-sm text-muted-foreground">HEX: #0F172A</p>
            </div>
          </div>
        </div>
      </div>
      <Footer dict={dict} lang={lang} />
    </main>
  );
}

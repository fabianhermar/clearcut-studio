import { Info } from "lucide-react";

export function ApiDisclaimer({ lang = "en" }: { lang?: string }) {
  return (
    <div className="bg-card border-2 border-border/80 rounded-2xl p-6 md:p-8 shadow-sm w-full">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg md:text-xl font-bold font-heading text-foreground mb-3">
            {lang === 'es'
              ? 'Transparencia Técnica y Procesamiento Futuro'
              : 'Technical Transparency & Future Processing'}
          </h4>
          <div className="space-y-4 text-sm md:text-base text-muted-foreground font-accent leading-relaxed">
            <p>
              {lang === 'es'
                ? 'Nuestra promesa principal es el procesamiento local (directamente en tu navegador) para garantizar máxima velocidad y privacidad absoluta. Sin embargo, estamos desarrollando herramientas de edición avanzadas impulsadas por Inteligencia Artificial que requieren una capacidad de cómputo inmensa, superando lo que un navegador puede manejar por sí solo.'
                : 'Our core promise is local processing (directly in your browser) to guarantee maximum speed and absolute privacy. However, we are developing advanced AI-powered editing tools that require immense computational power, exceeding what a browser can handle on its own.'}
            </p>
            <p>
              {lang === 'es'
                ? 'Para mantener la plataforma 100% gratuita y sin anuncios, adoptaremos un modelo híbrido para estas funciones pesadas:'
                : 'To keep the platform 100% free and ad-free, we will adopt a hybrid model for these heavy-duty features:'}
            </p>
            <ul className="list-disc pl-5 space-y-3 font-medium text-foreground/80 mt-2">
              <li>
                <strong className="text-foreground">{lang === 'es' ? 'Modelo BYOK (Trae tu propia API Key): ' : 'BYOK Model (Bring Your Own Key): '}</strong>
                {lang === 'es'
                  ? 'Te daremos la libertad de conectar de forma segura tus propias credenciales de plataformas como ChatGPT, Gemini, u otras IAs. Nosotros ponemos la interfaz profesional, tú controlas el motor.'
                  : 'We will give you the freedom to securely connect your own credentials from platforms like ChatGPT, Gemini, or other AIs. We provide the professional interface, you control the engine.'}
              </li>
              <li>
                <strong className="text-foreground">{lang === 'es' ? 'Rendimiento fluido sin bloqueos: ' : 'Zero hardware bottlenecks: '}</strong>
                {lang === 'es'
                  ? 'Al delegar tareas computacionales masivas a través de APIs, evitamos que tu computadora sufra sobrecalentamiento, bloqueos (lag) o tiempos de espera (buffers) prolongados intentando procesar modelos de IA gigantes localmente.'
                  : 'By offloading massive computational tasks via APIs, we prevent your computer from suffering overheating, freezing (lag), or prolonged buffering times trying to process giant AI models locally.'}
              </li>
              <li>
                <strong className="text-foreground">{lang === 'es' ? 'Cero sobreprecios: ' : 'No subscription markups: '}</strong>
                {lang === 'es'
                  ? 'En lugar de cobrarte una costosa suscripción mensual en ClearCut, al usar tu propia llave pagarás fracciones de centavo de dólar directamente al proveedor de la IA, solo por lo que realmente consumes.'
                  : 'Instead of charging you an expensive monthly subscription on ClearCut, by using your own key you will pay fractions of a cent directly to the AI provider, only for what you actually use.'}
              </li>
              <li>
                <strong className="text-foreground">{lang === 'es' ? 'Privacidad siempre en tu control: ' : 'Privacy always in your control: '}</strong>
                {lang === 'es'
                  ? 'El uso de APIs externas siempre será opcional y explícito. Te notificaremos siempre antes de que cualquier archivo deba salir de tu dispositivo para ser procesado en la nube.'
                  : 'The use of external APIs will always be optional and explicit. We will always notify you before any file needs to leave your device for cloud processing.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-muted p-6 text-muted-foreground/50">
        <WifiOff size={64} strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-3 font-accent">Estás sin conexión</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        No tienes conexión a internet en este momento. Sin embargo, si ya tenías la aplicación cargada en otra pestaña, ClearCut Studio puede seguir funcionando localmente en tu dispositivo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Reintentar conexión
      </button>
    </div>
  );
}

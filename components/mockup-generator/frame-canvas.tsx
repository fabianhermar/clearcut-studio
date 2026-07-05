import React, { forwardRef } from "react";
import { FramedSettings } from "./types";

interface FrameCanvasProps {
  imageSrc: string;
  settings: FramedSettings;
}

export const FrameCanvas = forwardRef<HTMLDivElement, FrameCanvasProps>(
  ({ imageSrc, settings }, ref) => {
    
    // Calcula el aspect ratio del contenedor principal
    let aspectRatioStyle = "auto";
    if (settings.aspectRatio !== "auto") {
      aspectRatioStyle = settings.aspectRatio.replace(":", "/");
    }

    const isTransparent = settings.background === "transparent";

    let baseShadow = "none";
    const opacity = settings.shadow / 100;
    
    if (settings.shadowType === "spread") {
      baseShadow = `0 ${settings.shadow / 2}px ${settings.shadow * 1.5}px rgba(0,0,0,${opacity})`;
    } else if (settings.shadowType === "hug") {
      baseShadow = `0 ${settings.shadow / 4}px ${settings.shadow / 2}px rgba(0,0,0,${opacity * 1.5})`;
    }

    // Estilos del marco basados en `frameStyle`
    let frameStyles: React.CSSProperties = {
      boxShadow: baseShadow,
      borderRadius: `${settings.rounded}px`,
      overflow: "hidden",
      position: "relative" as const,
    };

    if (settings.frameStyle === "glass-light") {
      frameStyles = {
        ...frameStyles,
        background: "rgba(255, 255, 255, 0.4)",
        boxShadow: `${baseShadow !== 'none' ? baseShadow + ',' : ''} inset 0 1px 0 rgba(255,255,255,0.6)`,
        backdropFilter: "blur(12px)", // Podría fallar en html-to-image pero lo intentamos para la vista
        border: "1px solid rgba(255,255,255,0.3)",
      };
    } else if (settings.frameStyle === "glass-dark") {
      frameStyles = {
        ...frameStyles,
        background: "rgba(0, 0, 0, 0.4)",
        boxShadow: `${baseShadow !== 'none' ? baseShadow + ',' : ''} inset 0 1px 0 rgba(255,255,255,0.1)`,
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
      };
    } else if (settings.frameStyle === "outline") {
      frameStyles = {
        ...frameStyles,
        boxShadow: "none",
        border: "1px solid rgba(0,0,0,0.1)",
      };
    } else if (settings.frameStyle === "border") {
      frameStyles = {
        ...frameStyles,
        boxShadow: baseShadow,
        border: "8px solid white",
      };
    }

    return (
      <div 
        ref={ref}
        className="flex items-center justify-center overflow-hidden transition-all duration-300 w-full"
        style={{ 
          background: isTransparent ? "transparent" : settings.background,
          padding: `${settings.padding}px`,
          aspectRatio: aspectRatioStyle,
          // Añadimos perspective al contenedor principal para que los hijos puedan tener tilt 3D
          perspective: "1200px"
        }}
      >
        <div 
          className="relative transition-all mx-auto flex flex-col"
          style={{
            ...frameStyles,
            transform: `scale(${settings.zoom / 100}) rotateX(${settings.tiltX}deg) rotateY(${settings.tiltY}deg)`,
            transformStyle: "preserve-3d",
            // Para que no se corte al inclinar, el width puede depender del padre
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {settings.frameStyle === "macos" && (
            <div 
              className="w-full h-8 flex items-center px-4 gap-2 bg-slate-800/90 border-b border-white/10 shrink-0"
            >
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          )}
          
          <img 
            src={imageSrc} 
            alt="Upload" 
            className="w-full h-full object-cover block"
            style={{
              // Si tiene glass, le damos un poco de padding a la imagen o la dejamos completa
              padding: (settings.frameStyle === "glass-light" || settings.frameStyle === "glass-dark") ? "8px" : "0",
              borderRadius: (settings.frameStyle === "glass-light" || settings.frameStyle === "glass-dark") ? `${settings.rounded}px` : "0",
            }}
          />
        </div>
      </div>
    );
  }
);
FrameCanvas.displayName = "FrameCanvas";

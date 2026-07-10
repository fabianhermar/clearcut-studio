// @ts-nocheck
import ColorThief from "colorthief";

export async function extractColors(imageSrc: string, count: number): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const colorThief = new ColorThief();
  
  // getPalette might return more or fewer colors depending on the image, we ask for `count`.
  // Note: ColorThief ignores white and black often, and sometimes returns fewer colors.
  const palette = colorThief.getPalette(img, Math.max(5, count)); 
  
  // We slice it to ensure we only get exactly the number requested if available
  const selectedColors = palette.slice(0, count);
  
  return selectedColors.map(([r, g, b]: number[]) => `rgb(${r}, ${g}, ${b})`);
}

export function generateGradientCSS(colors: string[], type: string, angle: number): string {
  if (colors.length === 0) return "none";
  if (colors.length === 1) return colors[0]; // fallback
  
  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
  } else {
    return `radial-gradient(circle, ${colors.join(", ")})`;
  }
}

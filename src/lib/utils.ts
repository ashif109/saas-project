import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorToHSL(color: string): string {
  if (typeof window === 'undefined') return '221.2 83.2% 53.3%'; // Default fallback

  const tempEl = document.createElement('div');
  tempEl.style.color = color;
  document.body.appendChild(tempEl);
  const rgbColor = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const rgbMatch = rgbColor.match(/\d+/g);
  if (!rgbMatch) return '221.2 83.2% 53.3%';

  const r = parseInt(rgbMatch[0]) / 255;
  const g = parseInt(rgbMatch[1]) / 255;
  const b = parseInt(rgbMatch[2]) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

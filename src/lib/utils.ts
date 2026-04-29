import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorToHSL(color: string): string {
  // Simple hex to RGB parser
  let r = 0, g = 0, b = 0;
  
  if (color.startsWith('#')) {
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16) / 255;
      g = parseInt(color[2] + color[2], 16) / 255;
      b = parseInt(color[3] + color[3], 16) / 255;
    } else {
      r = parseInt(color.slice(1, 3), 16) / 255;
      g = parseInt(color.slice(3, 5), 16) / 255;
      b = parseInt(color.slice(5, 7), 16) / 255;
    }
  } else if (color.startsWith('rgb')) {
    const rgbMatch = color.match(/\d+/g);
    if (rgbMatch) {
      r = parseInt(rgbMatch[0]) / 255;
      g = parseInt(rgbMatch[1]) / 255;
      b = parseInt(rgbMatch[2]) / 255;
    }
  } else {
    // Fallback for named colors or other formats
    return '221.2 83.2% 53.3%';
  }

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

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ColorBoxConvertService {
  /**
   * Converts an HSL color value to RGB.
   * h in [0, 360], s in [0, 1], l in [0, 1].
   * Returns [r, g, b] in [0, 255].
   */
  public hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4)),
    ];
  }

  /**
   * Converts HSL to hex string.
   * h in [0, 1], s in [0, 1], l in [0, 1].
   */
  public hslToHex(h: number, s: number, l: number): string {
    h = Math.max(0, Math.min(1, h));
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Converts hex string to HSL.
   * Returns { h: [0,360], s: [0,100], l: [0,100] }.
   */
  public hexToHsl(H: string): { h: number; s: number; l: number } {
    if (!H || typeof H !== 'string') {
      return { h: 0, s: 0, l: 0 };
    }

    const hex = H.startsWith('#') ? H : `#${H}`;

    let r: number;
    let g: number;
    let b: number;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    } else {
      return { h: 0, s: 0, l: 0 };
    }

    if (isNaN(r!) || isNaN(g!) || isNaN(b!)) {
      return { h: 0, s: 0, l: 0 };
    }

    r = r! / 255;
    g = g! / 255;
    b = b! / 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;

    let h = 0;
    let s = 0;
    let l = 0;

    l = (cmax + cmin) / 2;

    if (delta === 0) {
      h = 0;
      s = 0;
    } else {
      s = l > 0.5 ? delta / (2 - cmax - cmin) : delta / (cmax + cmin);

      if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;

      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return { h, s, l };
  }

  /**
   * Converts hex string to HSV.
   * Returns [h: [0,360], s: [0,1], v: [0,1]].
   */
  public hexToHsv(hex: string): [number, number, number] {
    const rgb = this.hexToRGB(hex);
    return this.rgbToHsv(rgb);
  }

  private hexToRGB(hex: string): [number, number, number] {
    if (!hex || typeof hex !== 'string') {
      return [0, 0, 0];
    }

    const h = hex.startsWith('#') ? hex : `#${hex}`;

    if (h.length !== 7) {
      return [0, 0, 0];
    }

    const r = parseInt(h.substring(1, 3), 16);
    const g = parseInt(h.substring(3, 5), 16);
    const b = parseInt(h.substring(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return [0, 0, 0];
    }

    return [r, g, b];
  }

  private rgbToHsv([r, g, b]: number[]): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (d !== 0) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s, v];
  }
}

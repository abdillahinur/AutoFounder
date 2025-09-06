// src/utils/contrast.ts
export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function relLum({ r, g, b }: RGB): number {
  const l = [r, g, b].map((v) => {
    const nv = v / 255;
    return nv <= 0.03928 ? nv / 12.92 : Math.pow((nv + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const L1 = relLum(hexToRgb(fgHex));
  const L2 = relLum(hexToRgb(bgHex));
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

export function pickBlackOrWhite(bgHex: string): { hex: string; tone: 'light' | 'dark'; ratio: number } {
  const white = '#FFFFFF';
  const black = '#000000';
  const cWhite = contrastRatio(white, bgHex);
  const cBlack = contrastRatio(black, bgHex);
  if (cWhite >= cBlack) return { hex: white, tone: 'light', ratio: cWhite };
  return { hex: black, tone: 'dark', ratio: cBlack };
}

// Best-effort tone from an image; returns 'light' (use white text) or 'dark' (use black text)
export async function estimateToneFromImage(url: string): Promise<'light' | 'dark' | null> {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;
    // Wait for decode; some browsers may reject decode for tainted images
    if (typeof img.decode === 'function') {
      await img.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('image load error'));
      });
    }

    const W = 48;
    const H = 48;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, W, H);
    const data = ctx.getImageData(0, 0, W, H).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += relLum({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
    const avg = sum / (data.length / 4);
    // bright background ⇒ choose dark text; dark background ⇒ choose light text
    return avg > 0.5 ? 'dark' : 'light';
  } catch (e) {
    return null;
  }
}

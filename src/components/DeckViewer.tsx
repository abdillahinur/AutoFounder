import React, { useEffect, useState } from 'react';
import type { Deck } from '../../utils/generateDeckJSON';
import { generatePitchDeckPPTX } from '../../utils/generatePitchDeckPPTX';

export default function DeckViewer({ deck }: { deck: Deck }) {
  const coverBg = (deck.metadata as any).coverBg || '/images/bg-cover-ai-infra-v1.png';
  const contentBg = (deck.metadata as any).contentBg || '/images/bg-content-ai-infra-v1.png';
  const explicitCoverTextColor = (deck.metadata as any).coverTextColor as string | undefined;
  const explicitContentTextColor = (deck.metadata as any).contentTextColor as string | undefined;

  // Hold computed luminance per-slide when bg is an image
  const [imgLuminances, setImgLuminances] = useState<Record<number, number | null>>({});

  // Helper: determine if a background string is a color we can parse (#rgb, #rrggbb, rgb(...)).
  function parseColorToLuminance(color: string): number | null {
    if (!color) return null;
    color = color.trim();

    // hex
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
      }
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const srgb = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
      const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
      return lum;
    }

    // rgb/rgba
    const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        const r = Number(parts[0]) / 255;
        const g = Number(parts[1]) / 255;
        const b = Number(parts[2]) / 255;
        if ([r, g, b].some((n) => Number.isNaN(n))) return null;
        const srgb = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
        const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
        return lum;
      }
    }

    return null; // unknown/non-parseable (likely an image URL)
  }

  // Given a background string (hex/rgb or image URL), decide whether to use light text.
  function shouldUseWhiteTextForBgFromLuminance(lum: number | null, preferForImage = false) {
    if (lum === null) return preferForImage;
    return lum < 0.179;
  }

  // Compute average color (luminance) of an image URL by drawing it to a small canvas.
  // This runs in the browser and updates `imgLuminances` per-slide index.
  useEffect(() => {
    deck.slides.forEach((_, i) => {
      const isCover = i === 0;
      const bg = isCover ? coverBg : contentBg;
      if (!bg) return;
      // skip if bg is a color value
      if (typeof bg === 'string' && (bg.startsWith('#') || bg.startsWith('rgb'))) return;
      // if we already computed for this index, skip
      if (imgLuminances[i] !== undefined) return;

      // load image and sample
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = bg;

      img.onload = () => {
        try {
          const w = 40;
          const h = 40;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('no-canvas');
          // draw centered and scaled-cover to capture representative pixels
          const iw = img.width;
          const ih = img.height;
          let sx = 0, sy = 0, sw = iw, sh = ih;
          const imgRatio = iw / ih;
          const targetRatio = w / h;
          if (imgRatio > targetRatio) {
            // image wider -> crop sides
            sw = ih * targetRatio;
            sx = (iw - sw) / 2;
          } else {
            // image taller -> crop top/bottom
            sh = iw / targetRatio;
            sy = (ih - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let p = 0; p < data.length; p += 4) {
            const alpha = data[p + 3] / 255;
            if (alpha < 0.2) continue; // ignore mostly transparent pixels
            r += data[p] * alpha;
            g += data[p + 1] * alpha;
            b += data[p + 2] * alpha;
            count += alpha;
          }
          if (count === 0) {
            setImgLuminances(prev => ({ ...prev, [i]: null }));
            return;
          }
          r = r / count / 255;
          g = g / count / 255;
          b = b / count / 255;
          const srgb = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
          const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
          setImgLuminances(prev => ({ ...prev, [i]: lum }));
        } catch (err) {
          // if cross-origin or other error, set null so fallback applies
          setImgLuminances(prev => ({ ...prev, [i]: null }));
        }
      };

      img.onerror = () => {
        setImgLuminances(prev => ({ ...prev, [i]: null }));
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.id, coverBg, contentBg]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{deck.metadata.startupName}</h1>
          <p className="text-sm text-gray-600">{deck.metadata.oneLiner}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => generatePitchDeckPPTX({ ...deck.metadata, coverBg, contentBg }, `${deck.slug}.pptx`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Download PPTX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deck.slides.map((s: any, i: number) => {
          const isCover = i === 0;
          const bg = isCover ? coverBg : contentBg;
          // If bg is color, compute luminance -> pick text color. If bg is image, prefer white for cover, dark for content.
          const preferWhiteForImage = isCover; // cover images usually need white text

          // Determine luminance: either parse color strings, or use cached image luminance
          // If explicit color hints are provided in metadata, prefer them
          if (isCover && explicitCoverTextColor) {
            // apply explicit color
            const useWhite = explicitCoverTextColor.toLowerCase() === '#ffffff' || explicitCoverTextColor.toLowerCase() === 'white';
            var useWhiteText = useWhite;
          } else if (!isCover && explicitContentTextColor) {
            const useWhite = explicitContentTextColor.toLowerCase() === '#ffffff' || explicitContentTextColor.toLowerCase() === 'white';
            var useWhiteText = useWhite;
          } else {
              const parsedLum = (typeof bg === 'string') ? parseColorToLuminance(bg) : null;
            const imgLum = imgLuminances[i] !== undefined ? imgLuminances[i] : null;
            const lumToUse = parsedLum !== null ? parsedLum : imgLum;
            var useWhiteText = shouldUseWhiteTextForBgFromLuminance(lumToUse, preferWhiteForImage);
          }

          // overlay: darker overlay when we use white text to increase contrast; light overlay when using dark text
          const overlayStyle = useWhiteText
            ? { backgroundColor: 'rgba(0,0,0,0.45)' }
            : { backgroundColor: 'rgba(255,255,255,0.12)' };

          const backgroundStyle: React.CSSProperties = (bg && typeof bg === 'string' && (bg.startsWith('#') || bg.startsWith('rgb')))
            ? { backgroundColor: bg }
            : {
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              };

          // If background is an image (not a color string), strengthen the overlay for contrast
          const isImageBg = !(bg && typeof bg === 'string' && (bg.startsWith('#') || bg.startsWith('rgb')));
          const finalOverlayStyle = isImageBg
            ? (useWhiteText ? { backgroundColor: 'rgba(0,0,0,0.62)' } : { backgroundColor: 'rgba(255,255,255,0.14)' })
            : overlayStyle;

          // Inline styles for text to guarantee contrast even if tailwind classes are overridden
          const textColor = useWhiteText ? '#ffffff' : '#0f172a'; // white or gray-900
          const titleShadow = useWhiteText ? '0 4px 18px rgba(0,0,0,0.65)' : '0 2px 6px rgba(255,255,255,0.28)';
          const bulletShadow = useWhiteText ? '0 2px 8px rgba(0,0,0,0.55)' : '0 1px 3px rgba(255,255,255,0.2)';

          return (
            <div
              key={i}
              className="aspect-video rounded-lg overflow-hidden relative shadow-sm"
              style={backgroundStyle}
            >
              <div className="absolute inset-0" style={finalOverlayStyle}></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-start">
                <h3
                  style={{ color: textColor, textShadow: titleShadow }}
                  className="text-lg font-semibold mb-3"
                >
                  {s.title}
                </h3>
                <div className="space-y-2">
                  {s.bullets.map((b: any, idx: number) => (
                    <div key={idx} className="text-sm" style={{ color: textColor, textShadow: bulletShadow }}>
                      • {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

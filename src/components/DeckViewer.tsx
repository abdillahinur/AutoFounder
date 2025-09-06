import React, { useState } from 'react';
import type { Deck } from '../../utils/generateDeckJSON';

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to fetch image as data URL', e);
    return null;
  }
}

export default function DeckViewer({ deck }: { deck: Deck }) {
  const [preparing, setPreparing] = useState(false);

  const title = (deck as any)?.metadata?.startupName || deck.slug || deck.id;

  const handleDownload = async () => {
    setPreparing(true);
    try {
      const PPTXModule = await import('pptxgenjs');
      const PPTX = (PPTXModule && (PPTXModule.default || PPTXModule)) as any;
      const pres = new PPTX();

      for (const s of deck.slides) {
        const slide = pres.addSlide();
        const heading = (s as any).title ?? (s as any).heading ?? '';
        if (heading) {
          slide.addText(heading, { x: 0.5, y: 0.4, w: '90%', h: 0.8, fontSize: 26, bold: true });
        }

        const bullets = Array.isArray((s as any).bullets) ? (s as any).bullets : [];
        if (bullets.length) {
          slide.addText(bullets.join('\n'), { x: 0.5, y: 1.4, w: '90%', h: 3.5, fontSize: 14 });
        }

        const imageUrl = (s as any).imageUrl ?? (s as any).image;
        if (imageUrl) {
          const dataUrl = await fetchImageAsDataUrl(imageUrl);
          if (dataUrl) {
            slide.addImage({ data: dataUrl, x: 6.0, y: 1.0, w: 3.0 });
          }
        }
      }

      const filenameSafe = `${String(title).replace(/[^a-z0-9\.\-_]/gi, '_')}-${deck.id}`;
      await pres.writeFile({ fileName: `${filenameSafe}.pptx` });
    } catch (e) {
      console.error('Failed to generate PPTX', e);
      // lightweight feedback
      try { alert('Failed to generate PPTX'); } catch (e) {}
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{(deck as any)?.metadata?.startupName ?? deck.slug}</h1>
          <p className="text-sm text-gray-600">{(deck as any)?.metadata?.oneLiner ?? ''}</p>
        </div>

        <div>
          <button
            onClick={handleDownload}
            disabled={preparing}
            className={`px-4 py-2 rounded-lg text-white ${preparing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {preparing ? 'Preparing…' : 'Download PPTX'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deck.slides.map((s: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 bg-white">
            {((s as any).imageUrl || (s as any).image) && (
              // show image if available
              <div className="mb-3">
                <img src={(s as any).imageUrl || (s as any).image} alt={(s as any).title || ''} className="w-full h-40 object-cover rounded" />
              </div>
            )}
            <h3 className="text-lg font-semibold mb-2">{(s as any).title ?? (s as any).heading ?? ''}</h3>
            {Array.isArray((s as any).bullets) && (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {(s as any).bullets.map((b: string, idx: number) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

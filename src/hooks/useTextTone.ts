import { useEffect, useState } from 'react';
import { estimateToneFromImage } from '../utils/contrast';

export function useTextTone(opts: { imageUrl?: string | null; fallback: 'light' | 'dark' }) {
  const { imageUrl, fallback } = opts;
  const [tone, setTone] = useState<'light' | 'dark'>(fallback);
  useEffect(() => {
    let ok = true;
    if (!imageUrl) { setTone(fallback); return; }
    estimateToneFromImage(imageUrl).then(t => { if (ok && t) setTone(t); }).catch(()=>{});
    return () => { ok = false; };
  }, [imageUrl, fallback]);
  return tone;
}

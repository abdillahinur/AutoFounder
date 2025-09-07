import { useEffect } from 'react';

export function useSlideHotkeys(enabled: boolean, fns: {
  next(): void; prev(): void; first?(): void; last?(): void; exit?(): void; toggleBlackout?(): void;
}) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['arrowright', 'pageup', ' '].includes(k)) { e.preventDefault(); fns.next(); }
      if (['arrowleft', 'pagedown'].includes(k))       { e.preventDefault(); fns.prev(); }
      if (k === 'home' && fns.first)                   { e.preventDefault(); fns.first!(); }
      if (k === 'end' && fns.last)                     { e.preventDefault(); fns.last!(); }
      if (k === 'escape' && fns.exit)                  { e.preventDefault(); fns.exit!(); }
      if (k === 'b' && fns.toggleBlackout)             { e.preventDefault(); fns.toggleBlackout!(); }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true } as any);
  }, [enabled, fns]);
}

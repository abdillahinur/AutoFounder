import { useCallback, useEffect, useState } from 'react';

export function useFullscreen<T extends HTMLElement>() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(async (el: T | null) => {
    if (!el) return;
    const anyEl = el as any;
    try {
      await (anyEl.requestFullscreen?.() ||
             anyEl.webkitRequestFullscreen?.() ||
             anyEl.msRequestFullscreen?.());
    } catch {}
  }, []);

  const exit = useCallback(async () => {
    const d: any = document;
    try {
      await (document.exitFullscreen?.() ||
             d.webkitExitFullscreen?.() ||
             d.msExitFullscreen?.());
    } catch {}
  }, []);

  useEffect(() => {
    const onChange = () => {
      const d: any = document;
      const active = !!(document.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener('fullscreenchange', onChange);
    // Safari/WebKit
    document.addEventListener('webkitfullscreenchange', onChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as any);
    };
  }, []);

  return { isFullscreen, enter, exit };
}

export default useFullscreen;

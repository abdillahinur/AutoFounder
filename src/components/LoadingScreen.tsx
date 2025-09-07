import { useEffect, useState } from 'react';

export default function LoadingScreen(): JSX.Element {
  const [msg, setMsg] = useState('Preparing your deck…');

  useEffect(() => {
    const bc = new BroadcastChannel('deck:announce');
    const onBC = (ev: MessageEvent) => {
      try {
        const { id, mode, payload } = ev.data || {};
        if (id) {
          if (mode === 'inline' && payload) location.hash = `#deckdata=${payload}`;
          else location.hash = `#deck=${id}`;
          // reload so the app boot logic runs again and mounts the DeckViewer
          setTimeout(() => { try { location.reload(); } catch (e) {} }, 60);
        }
      } catch (e) {
        // ignore malformed messages
      }
    };
    bc.addEventListener('message', onBC);

    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      try {
        const { type, id, mode, payload, step } = (ev.data || {}) as any;
        if (type === 'DECK_READY' && id) {
          if (mode === 'inline' && payload) location.hash = `#deckdata=${payload}`;
          else location.hash = `#deck=${id}`;
          // reload to trigger main boot to render DeckViewer
          setTimeout(() => { try { location.reload(); } catch (e) {} }, 60);
        }
        if (type === 'DECK_STATUS' && typeof step === 'string') {
          setMsg(step);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('message', onMsg);

    // Poll localStorage.getItem('deck:last') every 500ms for up to 10s
    let tries = 0;
    const maxTries = 20; // 20 * 500ms = 10s
    const poll = setInterval(() => {
      tries += 1;
      try {
        const id = localStorage.getItem('deck:last');
        if (id) {
          clearInterval(poll);
          location.hash = `#deck=${encodeURIComponent(id)}`;
          setTimeout(() => { try { location.reload(); } catch (e) {} }, 60);
        } else if (tries >= maxTries) {
          clearInterval(poll);
          setMsg('Still working… (slow network)');
        }
      } catch (e) {
        // ignore storage errors
      }
    }, 500);

    // After ~15s show a retry hint if nothing has happened
    const retryTimer = setTimeout(() => {
      setMsg('Taking longer than expected — try again or check your connection.');
    }, 15000);

    return () => {
      try { bc.close(); } catch (e) {}
      window.removeEventListener('message', onMsg);
      clearInterval(poll);
      clearTimeout(retryTimer);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-transparent" />
        <div className="text-sm text-neutral-600">{msg}</div>
      </div>
    </div>
  );
}

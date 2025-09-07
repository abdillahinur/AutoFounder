import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const root = createRoot(document.getElementById('root')!);

function urlSafeBase64Decode(input: string) {
  try {
    let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (e) {
    console.warn('Failed to decode base64 deckdata', e);
    return null;
  }
}

async function waitForBroadcastDeck(key: string, timeoutMs = 1200): Promise<any | null> {
  if (typeof BroadcastChannel === 'undefined') return null;
  return new Promise((resolve) => {
    let resolved = false;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(key);
      const onMsg = (ev: MessageEvent) => {
        if (resolved) return;
        resolved = true;
        try { channel?.close(); } catch (e) {}
        resolve(ev.data);
      };
      channel.addEventListener('message', onMsg);
    } catch (e) {
      resolve(null);
      return;
    }

    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try { channel?.close(); } catch (e) {}
      resolve(null);
    }, timeoutMs);
  });
}

async function boot() {
  const hash = window.location.hash || '';

  // 1) support inline deckdata in the URL: #deckdata=<base64>
  const mData = hash.match(/deckdata=([^&]+)/);
  if (mData) {
    try {
      const decoded = urlSafeBase64Decode(decodeURIComponent(mData[1]));
      if (decoded) {
        const deck = JSON.parse(decoded);
        const mod = await import('./components/DeckViewer');
        const DeckViewer = mod.default;
        root.render(
          <StrictMode>
            <DeckViewer deck={deck} initialPresent={/present=1/.test(hash)} />
          </StrictMode>
        );
        return;
      }
    } catch (e) {
      console.warn('Failed to parse deckdata from URL', e);
    }
  }

  // 2) support #investors=<base64> for investor matches
  const mInvestors = hash.match(/investors=([^&]+)/);
  if (mInvestors) {
    try {
      const decoded = urlSafeBase64Decode(decodeURIComponent(mInvestors[1]));
      if (decoded) {
        const deck = JSON.parse(decoded);
        const mod = await import('./components/InvestorsPage');
        const InvestorsPage = mod.default;
        root.render(
          <StrictMode>
            <InvestorsPage />
          </StrictMode>
        );
        return;
      }
    } catch (e) {
      console.warn('Failed to parse investors deckdata from URL', e);
    }
  }

  // 3) support #deck=<id> with localStorage + BroadcastChannel fallback
  const m = hash.match(/deck=([a-z0-9\-]+)/i);
  if (m) {
    const id = m[1];
    try {
      const raw = localStorage.getItem(`deck:${id}`);
      if (raw) {
        const deck = JSON.parse(raw);
        const mod = await import('./components/DeckViewer');
        const DeckViewer = mod.default;
        root.render(
          <StrictMode>
            <DeckViewer deck={deck} initialPresent={/present=1/.test(hash)} />
          </StrictMode>
        );
        return;
      }
    } catch (e) {
      console.warn('Failed to read deck from localStorage', e);
    }

    // wait briefly for BroadcastChannel message from the opener/tab that created the deck
    try {
      const maybe = await waitForBroadcastDeck(`deck:${id}`, 1200);
      if (maybe) {
        const deck = maybe;
        const mod = await import('./components/DeckViewer');
        const DeckViewer = mod.default;
        root.render(
          <StrictMode>
            <DeckViewer deck={deck} initialPresent={/present=1/.test(hash)} />
          </StrictMode>
        );
        return;
      }
    } catch (e) {
      console.warn('BroadcastChannel wait failed', e);
    }
  }

  // fallback: render the normal App
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();
import { useCallback } from 'react';

export type SlideInput = {
  heading: string;
  bullets?: string[];
  imageUrl?: string;
};

export type FormPayload = {
  title: string;
  slides: SlideInput[];
};

export type Deck = {
  id: string;
  createdAt: string;
  title: string;
  slides: SlideInput[];
  meta: Record<string, unknown>;
};

// Encode JSON -> URL-safe base64 (UTF-8 safe)
export function encodeDeckForUrl(deck: Deck): string {
  const json = JSON.stringify(deck);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(json);
  // btoa requires binary string; convert in chunks
  const CHUNK = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, i + CHUNK);
    binary += String.fromCharCode.apply(null, Array.from(slice) as any);
  }
  const b64 = btoa(binary);
  // URL-safe
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Try to persist deck to localStorage. Returns true on success, false on failure.
export function persistDeck(key: string, deck: Deck): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(deck));
    return true;
  } catch (e) {
    // Persistence blocked (private mode or quota)
    console.warn('persistDeck failed', e);
    return false;
  }
}

// Broadcast the deck on BroadcastChannel and close channel after ~1.5s
export function broadcastDeck(key: string, deck: Deck) {
  try {
    const channel = new BroadcastChannel(key);
    channel.postMessage(deck);
    setTimeout(() => {
      try { channel.close(); } catch (e) {}
    }, 1500);
  } catch (e) {
    // BroadcastChannel not supported or blocked
    console.warn('broadcastDeck failed', e);
  }
}

export function buildDeterministicDeck(payload: FormPayload): Deck {
  const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const deck: Deck = {
    id,
    createdAt,
    title: payload.title,
    slides: payload.slides.map((s) => ({
      heading: s.heading,
      bullets: s.bullets ?? [],
      imageUrl: s.imageUrl,
    })),
    meta: {
      version: 1,
      source: 'autofounder',
    },
  };
  return deck;
}

export function useGenerateDeck() {
  const generate = useCallback(async (payload: FormPayload, preopenedWindow?: Window | null): Promise<string> => {
    // Use provided pre-opened window if supplied; otherwise open placeholder synchronously
    const placeholder = preopenedWindow ?? window.open('about:blank', '_blank', 'noopener=false');

  // Try to enhance with Gemini (lazy import). If it fails, continue with original payload.
    let enhancedPayload: FormPayload = payload;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('../lib/ai/gemini');
      if (mod && typeof mod.enhanceDeckContent === 'function') {
        // gemini enhancer may return a record; coerce to FormPayload if possible
        // It's expected to produce { title, slides }
        const result = await mod.enhanceDeckContent(payload as any);
        if (result && typeof result === 'object' && 'title' in result && Array.isArray((result as any).slides)) {
          enhancedPayload = (result as unknown) as FormPayload;
        }
      }
    } catch (e) {
      // Enhancement unavailable; fall back to original
      console.warn('Gemini enhanceDeckContent unavailable or failed', e);
    }

    const deck = buildDeterministicDeck(enhancedPayload);
    const key = `deck:${deck.id}`;

    const persisted = persistDeck(key, deck);
    // Broadcast regardless so other tabs can pick it up immediately
    broadcastDeck(key, deck);

    // If persisted, navigate to #deck=<id>, else embed deck JSON into URL via base64
    const viewerUrl = persisted
      ? `${location.origin}/#deck=${deck.id}`
      : `${location.origin}/#deckdata=${encodeDeckForUrl(deck)}`;

    // Try to navigate the placeholder window; if that fails, open a new tab and close placeholder
    try {
      if (placeholder && !placeholder.closed) {
        placeholder.location.href = viewerUrl;
      } else {
        window.open(viewerUrl, '_blank');
      }
    } catch (e) {
      console.warn('Navigation of placeholder window failed, attempting fallback open', e);
      try {
        window.open(viewerUrl, '_blank');
      } catch (e2) {
        console.warn('Fallback window.open failed', e2);
      }
      try { placeholder?.close(); } catch (e3) {}
    }

    return deck.id;
  }, []);

  return { generate };
}

export default useGenerateDeck;

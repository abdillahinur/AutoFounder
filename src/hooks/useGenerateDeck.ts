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

    // Convert FormPayload to the format expected by AI enhancement
    const formData: Record<string, string> = {
      startupName: payload.title || '',
      oneLiner: payload.slides?.[0]?.bullets?.[0] || '',
      problem: payload.slides?.find(s => s.heading.toLowerCase().includes('problem'))?.bullets?.[0] || '',
      solution: payload.slides?.find(s => s.heading.toLowerCase().includes('solution'))?.bullets?.[0] || '',
      customer: payload.slides?.find(s => s.heading.toLowerCase().includes('customer'))?.bullets?.[0] || '',
      traction: payload.slides?.find(s => s.heading.toLowerCase().includes('traction'))?.bullets?.[0] || '',
      ask: payload.slides?.find(s => s.heading.toLowerCase().includes('ask'))?.bullets?.[0] || '',
      model: payload.slides?.find(s => s.heading.toLowerCase().includes('model'))?.bullets?.[0] || '',
      market: payload.slides?.find(s => s.heading.toLowerCase().includes('market'))?.bullets?.[0] || '',
      competition: payload.slides?.find(s => s.heading.toLowerCase().includes('competition'))?.bullets?.[0] || '',
      team: payload.slides?.find(s => s.heading.toLowerCase().includes('team'))?.bullets?.[0] || '',
      roadmap: payload.slides?.find(s => s.heading.toLowerCase().includes('roadmap'))?.bullets?.[0] || '',
      contact: payload.slides?.find(s => s.heading.toLowerCase().includes('contact'))?.bullets?.[0] || '',
    };

    // Try to enhance with Gemini (lazy import). If it fails, continue with original payload.
    let enhancedInput = formData;
    let slideHeaders: Record<string, string> = {};
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('../lib/ai/gemini');
      if (mod && typeof mod.enhanceDeckContent === 'function') {
        enhancedInput = await mod.enhanceDeckContent(formData);
        slideHeaders = await mod.generateSlideHeaders(formData);
        console.log('✅ Deck content enhanced successfully');
      }
    } catch (e) {
      // Enhancement unavailable; fall back to original
      console.warn('Gemini enhancement unavailable or failed', e);
    }

    // Create enhanced slides using AI-enhanced content
    const enhancedSlides = [
      { heading: enhancedInput.startupName || payload.title, bullets: [enhancedInput.oneLiner || ''] },
      { heading: slideHeaders.problem || 'Problem', bullets: enhancedInput.problem ? enhancedInput.problem.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.solution || 'Solution', bullets: enhancedInput.solution ? enhancedInput.solution.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.customer || 'Target Customer', bullets: enhancedInput.customer ? enhancedInput.customer.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.traction || 'Traction', bullets: enhancedInput.traction ? enhancedInput.traction.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.ask || 'Ask', bullets: enhancedInput.ask ? enhancedInput.ask.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.model || 'Business Model', bullets: enhancedInput.model ? enhancedInput.model.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.market || 'Market', bullets: enhancedInput.market ? enhancedInput.market.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.competition || 'Competition', bullets: enhancedInput.competition ? enhancedInput.competition.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.team || 'Team', bullets: enhancedInput.team ? enhancedInput.team.split('\n').filter(line => line.trim()) : [] },
      { heading: slideHeaders.roadmap || 'Roadmap', bullets: enhancedInput.roadmap ? enhancedInput.roadmap.split('\n').filter(line => line.trim()) : [] },
      { heading: 'Contact', bullets: enhancedInput.contact ? enhancedInput.contact.split('\n').filter(line => line.trim()) : [] },
    ].filter(slide => slide.bullets.length > 0);

    const enhancedPayload: FormPayload = {
      title: enhancedInput.startupName || payload.title,
      slides: enhancedSlides
    };

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

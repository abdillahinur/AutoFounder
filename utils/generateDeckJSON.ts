// Minimal deterministic deck JSON generator for demo flows
// Exports types and a generateDeckJSON(payload, opts?) function used by App and DeckViewer.

import type { Category, ThemeKey } from '../src/lib/categoryMap';

export type Slide = {
	title: string;
	bullets: string[];
	// Optional per-slide text tone; may be set later by the viewer/exporter
	textTone?: 'light' | 'dark';
};

export type ThemeConfig = { coverBg: string; contentBg: string; defaultText: 'light' | 'dark' };

export type Deck = {
	id: string;
	slug: string;
	createdAt: string;
	metadata: {
		startupName: string;
		oneLiner: string;
		coverBg?: string;
		contentBg?: string;
		coverTextColor?: string;
		contentTextColor?: string;
		[k: string]: any;
	};
	slides: Slide[];
	meta?: {
		category?: Category;
		theme?: ThemeKey;
		themeAssets?: ThemeConfig;
		textTone?: 'light' | 'dark';
	};
};

function simpleId() {
	return Math.random().toString(16).slice(2, 10) + Date.now().toString(16).slice(-6);
}

export function generateDeckJSON(
	payload: Record<string, string>,
	opts?: { category?: Category; theme?: ThemeKey; themeAssets?: ThemeConfig; textTone?: 'light' | 'dark' }
): Deck {
	const id = simpleId();
	const slug = (payload.startupName || 'startup').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id.slice(0, 8);
	const startupName = payload.startupName || 'Acme AI';
	const oneLiner = payload.oneLiner || 'AI-generated pitch deck for modern founders.';

	const metadata = {
		startupName,
		oneLiner,
		coverBg: payload.coverBg || '/images/bg-cover-ai-infra-v1.png',
		contentBg: payload.contentBg || '/images/bg-content-ai-infra-v1.png',
		coverTextColor: payload.coverTextColor || '#ffffff',
		contentTextColor: payload.contentTextColor || '#0f172a',
	};

	const slides: Slide[] = [
		{ title: `${startupName}`, bullets: [oneLiner] },
		{ title: 'Problem', bullets: ['Pain point 1', 'Pain point 2', 'Existing solutions are slow'] },
		{ title: 'Solution', bullets: ['Our AI product', 'Automates X', 'Saves time and money'] },
		{ title: 'Market', bullets: ['TAM: $5B', 'SAM: $1B'] },
		{ title: 'Business Model', bullets: ['SaaS subscription', 'Enterprise deals'] },
		{ title: 'Go-to-Market', bullets: ['Channels', 'Partnerships'] },
		{ title: 'Team', bullets: ['Founder', 'CTO', 'Advisors'] },
		{ title: 'Ask', bullets: ['$1M to 18 months growth'] },
	];

	const deck: Deck = {
		id,
		slug,
		createdAt: new Date().toISOString(),
		metadata,
		slides,
		meta: {},
	};

	if (opts) {
		deck.meta = deck.meta || {};
		if (opts.category) deck.meta.category = opts.category;
		if (opts.theme) deck.meta.theme = opts.theme;
		if (opts.themeAssets) deck.meta.themeAssets = opts.themeAssets;
		// Default deck-level text tone from opts or themeAssets; do not modify slide-level textTone here.
		deck.meta.textTone = opts.textTone ?? opts.themeAssets?.defaultText ?? (deck.meta.textTone as any) ?? 'dark';
	}

	return deck;
}

export default generateDeckJSON;

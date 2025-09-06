// Minimal deterministic deck JSON generator for demo flows
// Exports a Deck type and a generateDeckJSON(payload) function used by App and DeckViewer.

export type Slide = {
	title: string;
	bullets: string[];
};

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
};

function simpleId() {
	return Math.random().toString(16).slice(2, 10) + Date.now().toString(16).slice(-6);
}

export function generateDeckJSON(payload: Record<string, string>): Deck {
	const id = simpleId();
	const slug = (payload.startupName || 'startup').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id.slice(0,8);
	const startupName = payload.startupName || 'Acme AI';
	const oneLiner = payload.oneLiner || 'AI-generated pitch deck for modern founders.';

	const metadata = {
		startupName,
		oneLiner,
		coverBg: payload.coverBg || '/images/bg-cover-ai-infra-v1.png',
		contentBg: payload.contentBg || '/images/bg-content-ai-infra-v1.png',
		coverTextColor: payload.coverTextColor || '#ffffff',
		contentTextColor: payload.contentTextColor || '#0f172a'
	};

	const slides: Slide[] = [
		{ title: `${startupName}`, bullets: [oneLiner] },
		{ title: 'Problem', bullets: ['Pain point 1', 'Pain point 2', 'Existing solutions are slow'] },
		{ title: 'Solution', bullets: ['Our AI product', 'Automates X', 'Saves time and money'] },
		{ title: 'Market', bullets: ['TAM: $5B', 'SAM: $1B'] },
		{ title: 'Business Model', bullets: ['SaaS subscription', 'Enterprise deals'] },
		{ title: 'Go-to-Market', bullets: ['Channels', 'Partnerships'] },
		{ title: 'Team', bullets: ['Founder', 'CTO', 'Advisors'] },
		{ title: 'Ask', bullets: ['$1M to 18 months growth'] }
	];

	return {
		id,
		slug,
		createdAt: new Date().toISOString(),
		metadata,
		slides
	};
}

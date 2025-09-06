import { useCallback } from 'react';
import { classifyCategory } from '../lib/classify';
import type { Category, ThemeKey } from '../lib/categoryMap';

interface PresentationSection {
  title: string;
  duration: string;
  script: string;
  slideIndex: number;
}

async function generatePresentationScript(
  enhancedInput: Record<string, string>, 
  slideHeaders: Record<string, string>, 
  startupName: string
): Promise<PresentationSection[]> {
  const geminiKey = localStorage.getItem('gemini_api_key') || import.meta.env?.VITE_GEMINI_API_KEY;
  
  if (!geminiKey) {
    return generateBasicPresentationScript(enhancedInput, slideHeaders, startupName);
  }

  try {
    (globalThis as any).GEMINI_API_KEY = geminiKey;
    
    const { generateWithGemini } = await import('../lib/ai/gemini');
    
    const prompt = `You are a world-class presentation coach and storytelling expert. Create a compelling, narrative-driven pitch script that transforms dry slide content into an engaging story.

BUSINESS CONTEXT:
Company: ${startupName}
Core Value Prop: ${enhancedInput.oneLiner || 'AI-powered solution'}
Problem: ${enhancedInput.problem || 'Market inefficiency'}
Solution: ${enhancedInput.solution || 'Innovative approach'}
Market: ${enhancedInput.market || 'Large addressable market'}
Business Model: ${enhancedInput.model || 'Revenue streams'}
Traction: ${enhancedInput.traction || 'Early progress'}
Team: ${enhancedInput.team || 'Experienced team'}
Ask: ${enhancedInput.ask || 'Investment opportunity'}

CRITICAL INSTRUCTIONS:
1. **DON'T just repeat slide bullets** - Create original, compelling content that tells a story
2. **Use storytelling techniques** - Personal anecdotes, customer stories, analogies, industry insights
3. **Make it conversational** - Write as if speaking to investors, not reading a report
4. **Focus on general market data** - Use broad industry trends, not specific product metrics
5. **Create emotional hooks** - Start with something that grabs attention and builds investment
6. **Include speaking cues** - Add [pause], [gesture], [lean in], [smile] for delivery guidance
7. **AVOID fake metrics** - Don't invent specific numbers about this product's performance

EXAMPLE OF GOOD SCRIPT STYLE:
"Michael Jordan once said, 'I've failed over and over and over again in my life, and that is why I succeed.' [pause] But what if we could eliminate some of that failure through better training? [lean in] I'm [Name], founder of ${startupName}, and today I'm going to show you how we're revolutionizing basketball training with real-time feedback technology. [pause] The sports technology market is growing rapidly, with wearable devices becoming mainstream across athletics."

FORMAT: Return JSON array with complete, ready-to-deliver scripts for a 5-6 minute pitch.
Create ONE script section for EACH slide that will be generated. Base the script on the actual slide content provided above.

The slides will be generated in this order:
1. Title/Startup Name slide
2. Problem slide  
3. Solution slide
4. Target Customer slide
5. Traction slide
6. Ask slide
7. Business Model slide
8. Market slide
9. Competition slide
10. Team slide
11. Roadmap slide
12. Contact slide

Create a script section for each slide that exists in the content above. Use appropriate durations to keep total pitch under 6 minutes:
- Title slide: 30 seconds
- Problem/Solution: 60-90 seconds each
- Other slides: 30-45 seconds each

Return JSON array with script sections matching the actual slides that will be generated.

CRITICAL: 
- Return ONLY valid JSON array, no other text
- Each script must be a complete, ready-to-deliver paragraph
- Use storytelling techniques, not bullet points
- Include specific details and speaking cues
- Make it sound like a confident founder speaking to investors

EXAMPLE OUTPUT FORMAT:
[
  {
    "title": "Hook & Introduction",
    "duration": "1-2 minutes",
    "script": "Picture this: Sarah, a high school basketball coach, watches her star player miss 15 free throws in a row during the championship game. [pause] She knows his form is off, but she can't see what's happening in real-time. [lean in] That's the moment I realized we needed to solve this problem. I'm [Name], founder of ${startupName}, and today I'm going to show you how we're revolutionizing basketball training with real-time feedback technology.",
    "slideIndex": 0
  }
]`;

    const response = await generateWithGemini({ prompt });
    
    try {
      // Try to extract JSON from response if it has extra text
      let jsonResponse = response.trim();
      
      // Look for JSON array pattern
      const jsonMatch = jsonResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[0];
      }
      
      const script = JSON.parse(jsonResponse);
      return script;
    } catch (parseError) {
      return generateBasicPresentationScript(enhancedInput, slideHeaders, startupName);
    }
  } catch (error) {
    return generateBasicPresentationScript(enhancedInput, slideHeaders, startupName);
  }
}

function generateBasicPresentationScript(
  enhancedInput: Record<string, string>, 
  slideHeaders: Record<string, string>, 
  startupName: string
): PresentationSection[] {
  return [
    {
      title: "Opening & Introduction",
      duration: "1-2 minutes",
      script: `Good morning everyone. I'm excited to present ${startupName} to you today. ${enhancedInput.oneLiner || 'We have an innovative solution that addresses a critical market need.'} Let me walk you through our vision and how we plan to execute it.`,
      slideIndex: 0
    },
    {
      title: slideHeaders.problem || "The Problem",
      duration: "2-3 minutes", 
      script: `Let me start with the problem we're solving. ${enhancedInput.problem || 'Current solutions in the market are inadequate and create significant pain points for our target customers.'} This is a real problem that affects millions of people and costs businesses billions of dollars annually.`,
      slideIndex: 1
    },
    {
      title: slideHeaders.solution || "Our Solution",
      duration: "3-4 minutes",
      script: `Here's how we solve this problem. ${enhancedInput.solution || 'Our innovative approach combines cutting-edge technology with user-centered design to deliver a superior solution.'} We've built something that not only addresses the core problem but also provides additional value that our competitors can't match.`,
      slideIndex: 2
    },
    {
      title: slideHeaders.market || "Market Opportunity", 
      duration: "2-3 minutes",
      script: `The market opportunity is massive. ${enhancedInput.market || 'We are targeting a multi-billion dollar market that is growing rapidly.'} Our research shows strong demand and willingness to pay for solutions like ours. The timing is perfect for market entry.`,
      slideIndex: 3
    },
    {
      title: slideHeaders.model || "Business Model",
      duration: "2-3 minutes", 
      script: `Our business model is designed for scalability and profitability. ${enhancedInput.model || 'We generate revenue through multiple streams including subscriptions, enterprise deals, and partnerships.'} This diversified approach reduces risk and maximizes our revenue potential.`,
      slideIndex: 4
    },
    {
      title: slideHeaders.traction || "Traction & Progress",
      duration: "2-3 minutes",
      script: `We've already made significant progress. ${enhancedInput.traction || 'Our early results show strong product-market fit and growing user engagement.'} These metrics demonstrate that we're on the right track and ready to scale.`,
      slideIndex: 5
    },
    {
      title: slideHeaders.team || "Team",
      duration: "1-2 minutes",
      script: `Our team brings together the right combination of skills and experience. ${enhancedInput.team || 'We have deep domain expertise and proven track records in building successful companies.'} We're the right team to execute this vision.`,
      slideIndex: 6
    },
    {
      title: slideHeaders.ask || "The Ask",
      duration: "1-2 minutes",
      script: `We're seeking ${enhancedInput.ask || 'investment to accelerate our growth and expand our market reach.'} This funding will allow us to scale our team, enhance our product, and capture significant market share. We're looking for partners who share our vision and can help us achieve our ambitious goals.`,
      slideIndex: 7
    },
    {
      title: "Closing & Next Steps",
      duration: "1 minute",
      script: `Thank you for your time today. We're excited about the opportunity to work together and build something truly transformative. I'd love to answer any questions you have and discuss how we can move forward together.`,
      slideIndex: 8
    }
  ];
}

export type SlideInput = {
  heading: string;
  bullets?: string[];
  imageUrl?: string;
  textTone?: 'light' | 'dark';
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
  textTone: (s as any).textTone,
    })),
    meta: {
      version: 1,
      source: 'autofounder',
    },
  };
  return deck;
}

export function useGenerateDeck() {
  const generate = useCallback(async (
    payload: FormPayload,
    preopenedWindow?: Window | null,
    opts?: { category?: Category; theme?: ThemeKey; themeAssets?: any; textTone?: 'light'|'dark' }
  ): Promise<string> => {
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

    // Try to classify the enhanced payload to pick category/theme
    let deck = buildDeterministicDeck(enhancedPayload);
    try {
      const { category, theme, assets, confidence } = await classifyCategory(enhancedPayload as any);
      console.debug('category/theme', { category, theme, confidence });
      deck.meta = deck.meta || {};
      deck.meta.category = category;
      deck.meta.theme = theme;
      deck.meta.themeAssets = assets as any;
      deck.meta.textTone = (assets && (assets as any).defaultText) || deck.meta.textTone || 'dark';
    } catch (e) {
      console.warn('Classification failed, proceeding without theme metadata', e);
    }

    // Apply explicit overrides from caller if provided
    if (opts) {
      deck.meta = deck.meta || {};
      if (opts.category) deck.meta.category = opts.category;
      if (opts.theme) deck.meta.theme = opts.theme;
      if (opts.themeAssets) deck.meta.themeAssets = opts.themeAssets;
      if (opts.textTone) deck.meta.textTone = opts.textTone;
    }

    // Generate presentation script
    try {
      const presentationScript = await generatePresentationScript(enhancedInput, slideHeaders, enhancedPayload.title);
      
      // Store script in deck metadata for future use
      deck.meta = deck.meta || {};
      (deck.meta as any).presentationScript = presentationScript;
    } catch (error) {
      // Script generation failed, continue without script
    }

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

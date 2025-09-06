import type { FormPayload } from '../hooks/useGenerateDeck';
import type { Category, ThemeKey } from './categoryMap';
import { CATEGORY_KEYWORDS, CATEGORY_TO_THEME, THEME_ASSETS } from './categoryMap';

type ThemeConfig = { coverBg: string; contentBg: string; defaultText: 'light' | 'dark' };

// Heuristic classifier: score concatenated text against CATEGORY_KEYWORDS
export function heuristicClassify(input: FormPayload): { category: Category; confidence: number } {
  const textPieces: string[] = [];
  if (input.title) textPieces.push(input.title);
  for (const s of input.slides || []) {
    if (s.heading) textPieces.push(s.heading);
    if (s.bullets && Array.isArray(s.bullets)) textPieces.push(s.bullets.join('\n'));
  }
  const text = textPieces.join('\n').toLowerCase();

  const scores: Partial<Record<Category, number>> = {};
  for (const cat of Object.keys(CATEGORY_KEYWORDS) as Category[]) {
    scores[cat] = 0;
    const kws = CATEGORY_KEYWORDS[cat] || [];
    for (const kw of kws) {
      const low = kw.toLowerCase();
      // whole word match => +2
      const wholeWord = new RegExp(`\\b${low.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`);
      if (wholeWord.test(text)) {
        scores[cat]! += 2;
      } else if (text.includes(low)) {
        scores[cat]! += 1;
      }
    }
  }

  // Pick max
  let best: Category = 'other';
  let bestScore = -1;
  for (const [cat, sc] of Object.entries(scores) as [Category, number][]) {
    if (sc > bestScore) {
      best = cat;
      bestScore = sc;
    }
  }

  // Normalize confidence: if bestScore is 0, confidence is low
  const confidence = bestScore <= 0 ? 0.3 : Math.min(1, 0.2 + Math.tanh(bestScore / 10));

  return { category: best, confidence };
}

export function pickTheme(category: Category): { theme: ThemeKey; assets: ThemeConfig } {
  const theme = CATEGORY_TO_THEME[category] || CATEGORY_TO_THEME.other || 'minimal';
  const assets = THEME_ASSETS[theme];
  return { theme, assets };
}

// classifyCategory: try gemini classifier first (lazy), fallback to heuristic
export async function classifyCategory(input: FormPayload): Promise<{ category: Category; theme: ThemeKey; assets: ThemeConfig; confidence: number; via: 'heuristic' | 'gemini' }> {
  // Attempt to lazy-import a gemini classifier if present
  try {
    const mod = await import('./ai/gemini');
    if (mod && typeof (mod as any).geminiClassify === 'function') {
      try {
        const result = await (mod as any).geminiClassify(input);
        // Validate result
        if (result && typeof result === 'object' && 'category' in result && Array.isArray(Object.keys(CATEGORY_KEYWORDS))) {
          const cat = result.category as Category;
          if ((Object.keys(CATEGORY_KEYWORDS) as string[]).includes(cat)) {
            const { theme, assets } = pickTheme(cat);
            return { category: cat, theme, assets, confidence: Math.min(1, Number(result.confidence) || 0.8), via: 'gemini' };
          }
        }
      } catch (e) {
        console.warn('geminiClassify failed, falling back to heuristic', e);
      }
    }
  } catch (e) {
    // module not available; ignore
  }

  // Fallback: heuristic
  const h = heuristicClassify(input);
  const { theme, assets } = pickTheme(h.category);
  return { category: h.category, theme, assets, confidence: h.confidence, via: 'heuristic' };
}

export default {
  heuristicClassify,
  pickTheme,
  classifyCategory,
};

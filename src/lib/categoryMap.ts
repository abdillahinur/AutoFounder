export type Category =
  | 'fintech'
  | 'devtools'
  | 'consumer'
  | 'b2b_saas'
  | 'healthtech'
  | 'ai_infra'
  | 'marketplace'
  | 'edtech'
  | 'climate'
  | 'other';

export type ThemeKey = 'investor' | 'minimal' | 'bold' | 'clinical' | 'eco' | 'infra';

// Keywords to help auto-classify or tag a submission
export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  fintech: [
    'payments',
    'banking',
    'ledger',
    'lending',
    'neo-bank',
    'billing',
    'card',
    'crypto',
    'remittance',
  ],
  devtools: [
    'sdk',
    'api',
    'cli',
    'ci',
    'cd',
    'developer',
    'observability',
    'monitoring',
    'testing',
  ],
  consumer: ['social', 'creator', 'marketplace', 'mobile', 'app', 'ecommerce', 'lifestyle'],
  b2b_saas: ['crm', 'workflow', 'saas', 'enterprise', 'billing', 'ops', 'automation', 'erp'],
  healthtech: ['patient', 'clinic', 'telehealth', 'ehr', 'hc', 'HIPAA', 'medical', 'healthcare'],
  ai_infra: ['inference', 'embeddings', 'vector db', 'vector-db', 'mlops', 'model serving', 'gpu', 'accelerator'],
  marketplace: ['buyers', 'sellers', 'two-sided', 'listing', 'transactions', 'commissions'],
  edtech: ['learning', 'curriculum', 'school', 'teacher', 'student', 'lms', 'course'],
  climate: ['carbon', 'emissions', 'sustainability', 'renewable', 'cleantech', 'offsets'],
  other: ['other'],
};

// Map categories to presentation theme keys
export const CATEGORY_TO_THEME: Record<Category, ThemeKey> = {
  fintech: 'investor',
  devtools: 'minimal',
  consumer: 'bold',
  b2b_saas: 'investor',
  healthtech: 'clinical',
  ai_infra: 'infra',
  marketplace: 'investor',
  edtech: 'minimal',
  climate: 'eco',
  other: 'minimal',
};

// Theme assets and default text color suggestion (used by the viewer/exporter)
export const THEME_ASSETS: Record<ThemeKey, { coverBg: string; contentBg: string; defaultText: 'light' | 'dark' }> = {
  investor: {
  coverBg: '/images/bg-cover-fintech-v1.png',
  contentBg: '/images/bg-content-fintech-v1.png',
  defaultText: 'light',
  },
  minimal: {
  coverBg: '/images/bg-cover-devtools-v1.png',
  contentBg: '/images/bg-content-devtools-v1.png',
  defaultText: 'dark',
  },
  bold: {
  coverBg: '/images/bg-cover-consumer-v1.png',
  contentBg: '/images/bg-content-consumer-v1.png',
  defaultText: 'light',
  },
  clinical: {
  coverBg: '/images/bg-cover-healthtech-v1.png',
  contentBg: '/images/bg-content-healthtech-v1.png',
  defaultText: 'dark',
  },
  eco: {
  coverBg: '/images/bg-cover-climate-v1.png',
  contentBg: '/images/bg-content-climate-v1.png',
  defaultText: 'dark',
  },
  infra: {
  coverBg: '/images/bg-cover-ai-infra-v1.png',
  contentBg: '/images/bg-content-ai-infra-v1.png',
  defaultText: 'light',
  },
};

// Small helper: pick a theme for a free-text category hint
export function guessCategoryFromText(text: string): Category | null {
  const normalized = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) return cat;
    }
  }
  return null;
}

export default {
  CATEGORY_KEYWORDS,
  CATEGORY_TO_THEME,
  THEME_ASSETS,
  guessCategoryFromText,
};

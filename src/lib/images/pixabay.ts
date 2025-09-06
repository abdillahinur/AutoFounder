import { generateWithGemini } from '../ai/gemini';

// Pixabay API configuration
const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY || globalThis.localStorage?.getItem('pixabayKey');

export interface PixabayImage {
  id: number;
  webformatURL: string;
  previewURL: string;
  tags: string;
  user: string;
}

export interface PixabayResponse {
  hits: PixabayImage[];
  total: number;
  totalHits: number;
}

/**
 * Generate smart search queries using Gemini AI
 */
async function generateImageQuery(slideType: string, userInput: Record<string, string>): Promise<string> {
  try {
    const context = `Startup: ${userInput.startupName}
Problem: ${userInput.problem || 'Not specified'}
Solution: ${userInput.solution || 'Not specified'}
Target Customer: ${userInput.customer || 'Not specified'}`;

    const prompt = `Create a search query for finding relevant images for this pitch deck slide: "${slideType}". 
    
Context: ${context}

Return ONLY a simple, effective search query (2-4 words max) that would find relevant images. Examples:
- "startup team meeting"
- "business problem solving" 
- "market analysis chart"
- "technology innovation"
- "customer satisfaction"

Do not include quotes or explanations. Just the search query.`;

    const query = await generateWithGemini({ prompt, context });
    return query.trim().replace(/['"]/g, '');
  } catch (error) {
    console.error('Error generating image query:', error);
    // Fallback queries
    const fallbacks: Record<string, string> = {
      problem: 'business problem',
      solution: 'innovation technology',
      market: 'market analysis',
      business_model: 'business strategy',
      traction: 'growth chart',
      team: 'startup team',
      ask: 'investment funding'
    };
    return fallbacks[slideType] || 'business startup';
  }
}

/**
 * Search Pixabay for images
 */
async function searchPixabay(query: string): Promise<PixabayImage | null> {
  console.log('🔑 Checking Pixabay API key...');
  console.log('API Key found:', !!PIXABAY_API_KEY);
  console.log('API Key length:', PIXABAY_API_KEY?.length || 0);
  
  if (!PIXABAY_API_KEY) {
    console.warn('❌ Pixabay API key not found');
    console.log('Available env vars:', Object.keys(import.meta.env).filter(k => k.includes('PIXABAY')));
    return null;
  }

  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&category=business&min_width=800&per_page=3&safesearch=true`;
    console.log('🌐 Searching Pixabay with URL:', url.replace(PIXABAY_API_KEY, '***'));
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ Pixabay API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Pixabay API error: ${response.status}`);
    }

    const data: PixabayResponse = await response.json();
    console.log('📊 Pixabay response:', { totalHits: data.totalHits, hitsCount: data.hits?.length || 0 });
    
    if (data.hits && data.hits.length > 0) {
      console.log('✅ Found images:', data.hits[0].tags);
      return data.hits[0];
    }
    
    console.log('❌ No images found for query:', query);
    return null;
  } catch (error) {
    console.error('❌ Pixabay search error:', error);
    return null;
  }
}

/**
 * Check if an image is relevant to the slide content
 */
function isImageRelevant(image: PixabayImage, slideType: string, userInput: Record<string, string>): boolean {
  const tags = image.tags.toLowerCase();
  const startupName = userInput.startupName?.toLowerCase() || '';
  
  // Define relevance criteria for each slide type
  const relevanceCriteria: Record<string, string[]> = {
    problem: ['problem', 'issue', 'challenge', 'difficulty', 'struggle', 'pain', 'frustration'],
    solution: ['solution', 'innovation', 'technology', 'fix', 'improve', 'solve', 'breakthrough'],
    market: ['market', 'analysis', 'chart', 'graph', 'data', 'research', 'trend'],
    business_model: ['business', 'strategy', 'model', 'revenue', 'money', 'profit', 'plan'],
    traction: ['growth', 'success', 'chart', 'graph', 'metrics', 'achievement', 'progress'],
    team: ['team', 'people', 'meeting', 'collaboration', 'group', 'professionals'],
    ask: ['investment', 'funding', 'money', 'capital', 'investor', 'handshake', 'deal']
  };

  const criteria = relevanceCriteria[slideType] || [];
  
  // Check if image tags contain relevant keywords
  const hasRelevantTags = criteria.some(keyword => tags.includes(keyword));
  
  // Bonus points for startup-related terms
  const hasStartupTerms = ['startup', 'business', 'entrepreneur', 'innovation'].some(term => 
    tags.includes(term)
  );

  return hasRelevantTags || hasStartupTerms;
}

/**
 * Get a relevant image for a specific slide
 */
export async function getRelevantImage(slideType: string, userInput: Record<string, string>): Promise<PixabayImage | null> {
  console.log(`🖼️ Getting relevant image for slide: ${slideType}`);
  console.log('User input keys:', Object.keys(userInput));
  
  try {
    // Generate smart search query using Gemini
    const query = await generateImageQuery(slideType, userInput);
    console.log(`🔍 Searching for images with query: "${query}"`);
    
    // Search Pixabay
    const image = await searchPixabay(query);
    
    if (!image) {
      console.log(`❌ No images found for query: "${query}"`);
      return null;
    }

    // Check relevance
    const isRelevant = isImageRelevant(image, slideType, userInput);
    console.log(`🎯 Image relevance check: ${isRelevant ? 'PASS' : 'FAIL'}`);
    
    if (isRelevant) {
      console.log(`✅ Found relevant image: ${image.tags}`);
      return image;
    } else {
      console.log(`❌ Image not relevant enough: ${image.tags}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error getting relevant image:', error);
    return null;
  }
}

/**
 * Convert image URL to base64 for PowerPoint
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

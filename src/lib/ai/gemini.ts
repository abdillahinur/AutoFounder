import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  // Try global variable first (for browser localStorage)
  if ((globalThis as any).GEMINI_API_KEY) {
    return (globalThis as any).GEMINI_API_KEY;
  }
  // Try environment variable (for development)
  if (import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return '';
};

const genAI = new GoogleGenerativeAI(getApiKey());

export interface AIPrompt {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export async function generateWithGemini({ prompt, context, maxTokens = 1000 }: AIPrompt): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const fullPrompt = context 
      ? `${context}\n\n${prompt}`
      : prompt;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content with Gemini');
  }
}

export async function enhanceDeckContent(userInput: Record<string, string>): Promise<Record<string, string>> {
  const enhanced = { ...userInput };
  
  try {
    // Enhance problem statement
    if (userInput.problem) {
      const problemPrompt = `Make this problem statement into 3-4 diverse bullet points (max 8 words each). Each point should address a different aspect of the problem. Do NOT include asterisks (*) or bullet symbols. Just return plain text, one point per line:\n\n${userInput.problem}`;
      enhanced.problem = await generateWithGemini({ prompt: problemPrompt });
    }
    
    // Enhance solution
    if (userInput.solution) {
      const solutionPrompt = `Make this solution into 3-4 diverse bullet points (max 8 words each). Each point should highlight a different benefit or feature. Do NOT include asterisks (*) or bullet symbols. Just return plain text, one point per line:\n\n${userInput.solution}`;
      enhanced.solution = await generateWithGemini({ prompt: solutionPrompt });
    }
    
    // Generate market analysis if missing
    if (!userInput.market && userInput.problem && userInput.solution) {
      const marketPrompt = `Generate 3-4 diverse bullet points about market opportunity (max 8 words each) for: ${userInput.startupName}. Each point should cover different market aspects: size, growth, competition, opportunity. Do NOT include asterisks (*) or bullet symbols. Just return plain text, one point per line.`;
      enhanced.market = await generateWithGemini({ prompt: marketPrompt });
    }
    
    // Generate business model if missing
    if (!userInput.model && userInput.solution) {
      const modelPrompt = `Generate 3-4 diverse bullet points about revenue model (max 8 words each). Each point should cover different revenue streams or pricing strategies. Do NOT include asterisks (*) or bullet symbols. Just return plain text, one point per line.`;
      enhanced.model = await generateWithGemini({ prompt: modelPrompt });
    }
    
    // Enhance traction if provided
    if (userInput.traction && userInput.traction !== 'n/a') {
      const tractionPrompt = `Make this into 3-4 diverse bullet points (max 8 words each). Each point should highlight different metrics or achievements. Avoid repetition. Do NOT include asterisks (*) or bullet symbols. Just return plain text, one point per line:\n\n${userInput.traction}`;
      enhanced.traction = await generateWithGemini({ prompt: tractionPrompt });
    }
    
    // Generate team section if missing - but only if user provided some team info
    if (!userInput.team && userInput.startupName) {
      // Don't generate fake team members - just skip this section
      // Users should provide their own team information
      console.log('⚠️ No team information provided - skipping team generation');
    }
    
  } catch (error) {
    console.error('Error enhancing deck content:', error);
    // Return original input if AI fails
    return userInput;
  }
  
  return enhanced;
}

export async function generateSlideHeaders(userInput: Record<string, string>): Promise<Record<string, string>> {
  try {
    const context = `Startup: ${userInput.startupName}
Problem: ${userInput.problem || 'Not specified'}
Solution: ${userInput.solution || 'Not specified'}
Target Customer: ${userInput.customer || 'Not specified'}
Traction: ${userInput.traction || 'Not specified'}
Ask: ${userInput.ask || 'Not specified'}`;
    
    const prompt = `Generate compelling slide headers that logically connect to the content for this startup's pitch deck. Return only the headers, one per line, in this exact format:
Problem: [header that summarizes the core problem]
Solution: [header that describes the main solution]
Market: [header about market opportunity]
Business Model: [header about revenue model]
Traction: [header that summarizes key achievements]
Team: [header about team expertise]
Ask: [header that describes the funding request]

Make each header specific to this startup's content, avoid repetition, and ensure logical flow between slides. Keep headers under 6 words each.`;
    
    const response = await generateWithGemini({ prompt, context });
    const lines = response.split('\n').filter(line => line.trim());
    
    const headers: Record<string, string> = {};
    lines.forEach(line => {
      const [key, value] = line.split(': ');
      if (key && value) {
        headers[key.toLowerCase().replace(' ', '_')] = value.trim();
      }
    });
    
    return headers;
  } catch (error) {
    console.error('Error generating slide headers:', error);
    // Fallback to default headers
    return {
      problem: "The Problem",
      solution: "Our Solution",
      market: "Market Opportunity", 
      business_model: "Business Model",
      traction: "Traction & Metrics",
      team: "Our Team",
      ask: "The Ask"
    };
  }
}

import pptxgen from "pptxgenjs";
import { deckTemplates } from "../lib/deckTemplates";
import { enhanceDeckContent, generateSlideHeaders } from "../src/lib/ai/gemini";
import { getRelevantImage, imageUrlToBase64 } from "../src/lib/images/pixabay";

// Define a type for slide field metadata
interface SlideFieldMeta {
  placeholder?: string;
  position?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}

// Helper to split text into bullet points
function formatBulletPoints(text: string, defaultOptions: any): any[] {
  // Split by line breaks and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim());
  
  return lines.map((line) => {
    // Remove any asterisks or bullet symbols from the beginning of the line
    const cleanLine = line.trim().replace(/^[\*\•\-\+]\s*/, '');
    
    return {
      text: cleanLine,
      options: {
        ...defaultOptions,
        bullet: true, // Add bullet point
        indentLevel: 0
      }
    };
  });
}

// Generate and download a PowerPoint deck in the browser (no backend required)
export async function generatePitchDeckPPTX(userInput: Record<string, any>, outputFileName = "PitchDeck.pptx") {
  const pptx = new pptxgen();

  // Enhance content with AI if API key is available
  let enhancedInput: Record<string, any> = userInput;
  let slideHeaders: Record<string, string> = {};
  const geminiKey = localStorage.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log('🤖 Enhancing content with Gemini AI...');
      // Set the API key for this session if the helper expects it
      (globalThis as any).GEMINI_API_KEY = geminiKey;
      enhancedInput = await enhanceDeckContent(userInput);
      slideHeaders = await generateSlideHeaders(userInput);
      console.log('✅ Content enhanced successfully');
    } catch (error) {
      console.warn('⚠️ AI enhancement failed, using original content:', error);
      enhancedInput = userInput;
    }
  }

  // Use public paths for images so they work in the browser
  const coverBg = "/images/bg-cover-ai-infra-v1.png";
  const contentBg = "/images/bg-content-ai-infra-v1.png";

  // Cover slide
  const cover = deckTemplates.cover;
  const coverSlide = pptx.addSlide();
  coverSlide.background = { path: coverBg };
  // Defensive: check for field existence and use correct keys
  const coverStartupName = cover.fields.startupName;
  const coverOneLiner = cover.fields.oneLiner;
  coverSlide.addText(enhancedInput.startupName || coverStartupName?.placeholder || "[Startup Name]", {
    x: 1, y: 2, fontSize: coverStartupName?.fontSize || 40, bold: true, color: coverStartupName?.color || "#222222",
    align: "center", w: 8, h: 1
  });
  coverSlide.addText(enhancedInput.oneLiner || coverOneLiner?.placeholder || "[One-line Pitch]", {
    x: 1, y: 3, fontSize: coverOneLiner?.fontSize || 28, color: coverOneLiner?.color || "#888888",
    align: "center", w: 8, h: 1
  });

  // Content slides
  const slideOrder = [
    'problem',
    'solution',
    'market',
    'business_model',
    'traction',
    'team',
    'ask',
  ] as const;
  type SlideKey = typeof slideOrder[number];

  const defaultHeaders: Record<string, string> = {
    problem: 'The Problem',
    solution: 'Our Solution',
    market: 'Market Opportunity',
    business_model: 'Business Model',
    traction: 'Traction & Metrics',
    team: 'Our Team',
    ask: 'The Ask',
  };

  // Process slides with smart image integration
  for (const slideKey of slideOrder) {
    const tmpl = deckTemplates[slideKey as SlideKey];
    if (!tmpl) continue; // Defensive: skip if template missing
    
    const slide = pptx.addSlide();
    slide.background = { path: contentBg };

    const header = slideHeaders[slideKey] || defaultHeaders[slideKey as keyof typeof defaultHeaders];
    slide.addText(header, {
      x: 1, y: 0.5, fontSize: 32, color: "#2563eb", bold: true, w: 8, h: 0.8
    });
    
    // Try to get a relevant image for this slide
    let imageAdded = false;
    try {
      const relevantImage = await getRelevantImage(slideKey, enhancedInput);
      if (relevantImage) {
        const base64Image = await imageUrlToBase64(relevantImage.webformatURL);
        if (base64Image) {
          // Add image to the right side of the slide
          slide.addImage({
            data: base64Image,
            x: 6, y: 1.5, w: 3.5, h: 3,
            sizing: { type: 'contain', w: 3.5, h: 3 }
          });
          imageAdded = true;
          console.log(`✅ Added relevant image to ${slideKey} slide`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not add image to ${slideKey} slide:`, error);
    }
    
    // Adjust text width based on whether image was added
    const textWidth = imageAdded ? 4.5 : 8; // Narrower if image present
    
    Object.entries(tmpl.fields).forEach(([field, meta]) => {
      const m = meta as SlideFieldMeta;
      if (!m) return;
      
      const textContent = enhancedInput[field] || m.placeholder || `[${field}]`;
      const defaultTextOptions = {
        fontSize: m.fontSize || 24,
        color: m.color || "#444444",
        bold: m.fontWeight === "bold",
      };
      
      // Format as proper bullet points with markdown bold support
      const bulletPoints = formatBulletPoints(textContent, defaultTextOptions);
      
      slide.addText(bulletPoints, {
        x: 1, y: 1.5, w: textWidth, h: 4 // Adjust width based on image presence
      });
    });
  }

  // Download the file in the browser
  await pptx.writeFile({ fileName: outputFileName });
}

// Usage in a React component:
// import { generatePitchDeckPPTX } from "../utils/generatePitchDeckPPTX";
// generatePitchDeckPPTX(userInput, "PitchDeck.pptx");

import pptxgen from "pptxgenjs";
import type { SlideFormat } from "../src/constants/slide";

function applyLayout(pptx: any, fmt: SlideFormat) {
  // pptxgenjs uses named layouts
  pptx.layout = fmt === 'w4x3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';
}
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
  const fmt: SlideFormat = (userInput?.meta && (userInput.meta as any).slideFormat) || 'w16x9';
  applyLayout(pptx, fmt);

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
  // Prefer theme assets supplied by the caller (userInput.meta.themeAssets or userInput.themeAssets)
  const suppliedAssets = (userInput?.meta && (userInput.meta as any).themeAssets) || (userInput?.themeAssets);
  const defaultCover = "/images/bg-cover-ai-infra-v1.png";
  const defaultContent = "/images/bg-content-ai-infra-v1.png";
  const coverBg = suppliedAssets?.coverBg || defaultCover;
  const contentBg = suppliedAssets?.contentBg || defaultContent;

  const deckMetaTone = (userInput?.meta && (userInput.meta as any).textTone) || (userInput?.textTone) || (suppliedAssets && suppliedAssets.defaultText) || 'dark';

  // Cover slide
  const cover = deckTemplates.cover;
  const coverSlide = pptx.addSlide();
  // If a coverBg asset exists, use it as background; otherwise fallback to a soft color
  if (coverBg) {
    try { coverSlide.background = { path: coverBg }; } catch (e) { console.warn('pptx cover background failed', e); }
  } else {
    try { coverSlide.background = { color: 'FFFFFF' }; } catch (e) {}
  }
  // Defensive: check for field existence and use correct keys
  const coverStartupName = cover.fields.startupName;
  const coverOneLiner = cover.fields.oneLiner;
  // Centered cover layout; use theme text color for contrast
  // Determine cover slide tone: prefer explicit slide level tone if provided in userInput.slides[0]
  const coverSlideObj = (userInput?.slides && userInput.slides[0]) || null;
  const coverTone = (coverSlideObj && (coverSlideObj as any).textTone) ?? deckMetaTone ?? 'dark';
  const coverTextColor = coverTone === 'light' ? 'FFFFFF' : '000000';
  const coverOutline = { outline: { color: coverTone === 'light' ? '000000' : 'FFFFFF', size: 1 } };
  coverSlide.addText(enhancedInput.startupName || coverStartupName?.placeholder || "[Startup Name]", {
    x: 0.5, y: 1.8, fontSize: coverStartupName?.fontSize || 48, bold: true, color: coverTextColor, align: "center", w: 9, h: 1.6, ...coverOutline
  });
  coverSlide.addText(enhancedInput.oneLiner || coverOneLiner?.placeholder || "[One-line Pitch]", {
    x: 1, y: 3.2, fontSize: coverOneLiner?.fontSize || 28, color: coverTextColor, align: "center", w: 8, h: 1.2, ...coverOutline
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

  const header = slideHeaders[slideKey] || defaultHeaders[slideKey as keyof typeof defaultHeaders];
  // We'll only set the slide background if we don't add a content image below
    
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
    
  // If we didn't add an image, apply the themed content background
    if (!imageAdded) {
      if (contentBg) {
        try { slide.background = { path: contentBg }; } catch (e) { console.warn('pptx content background failed', e); }
      } else {
        try { slide.background = { color: 'FFFFFF' }; } catch (e) {}
      }
    }

  // Determine slide-level tone: try userInput.slides[index].textTone, else deck-level meta/theme
  const slideIndex = slideOrder.indexOf(slideKey);
  const slideObj = (userInput?.slides && userInput.slides[slideIndex]) || null;
  const tone = (slideObj && (slideObj as any).textTone) ?? deckMetaTone ?? 'dark';
  const TEXT = tone === 'light' ? 'FFFFFF' : '000000';
  const outline = { outline: { color: tone === 'light' ? '000000' : 'FFFFFF', size: 1 } };

  // Adjust text width based on whether image was added
    const textWidth = imageAdded ? 4.5 : 8; // Narrower if image present

    Object.entries(tmpl.fields).forEach(([field, meta]) => {
      const m = meta as SlideFieldMeta;
      if (!m) return;
      
      const textContent = enhancedInput[field] || m.placeholder || `[${field}]`;
      const defaultTextOptions = {
        fontSize: m.fontSize || 24,
        color: TEXT || (m.color || "#444444"),
        bold: m.fontWeight === "bold",
        ...outline,
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

import pptxgen from "pptxgenjs";
import { deckTemplates } from "../lib/deckTemplates";

// Define a type for slide field metadata
interface SlideFieldMeta {
  placeholder: string;
  position: string;
  fontSize: number;
  fontWeight?: string;
  color: string;
}

// Generate and download a PowerPoint deck in the browser (no backend required)
export function generatePitchDeckPPTX(userInput: Record<string, string>, outputFileName = "PitchDeck.pptx") {
  const pptx = new pptxgen();

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
  coverSlide.addText(userInput.startupName || coverStartupName?.placeholder || "[Startup Name]", {
    x: 1, y: 2, fontSize: coverStartupName?.fontSize || 40, bold: true, color: coverStartupName?.color || "#222",
    align: "center", w: 8, h: 1
  });
  coverSlide.addText(userInput.oneLiner || coverOneLiner?.placeholder || "[One-line Pitch]", {
    x: 1, y: 3, fontSize: coverOneLiner?.fontSize || 28, color: coverOneLiner?.color || "#888",
    align: "center", w: 8, h: 1
  });

  // Content slides
  const slideOrder = [
    "problem", "solution", "market", "business_model", "traction", "team", "ask"
  ] as const;
  type SlideKey = typeof slideOrder[number];
  slideOrder.forEach((slideKey) => {
    const tmpl = deckTemplates[slideKey as SlideKey];
    if (!tmpl) return; // Defensive: skip if template missing
    const slide = pptx.addSlide();
    slide.background = { path: contentBg };
    Object.entries(tmpl.fields).forEach(([field, meta], idx) => {
      const m = meta as SlideFieldMeta;
      // Defensive: skip if meta is undefined
      if (!m) return;
      slide.addText(userInput[field] || m.placeholder || `[${field}]`, {
        x: 1, y: 1 + idx, fontSize: m.fontSize || 24, color: m.color || "#444", bold: m.fontWeight === "bold", w: 8, h: 1
      });
    });
  });

  // Download the file in the browser
  pptx.writeFile({ fileName: outputFileName });
}

// Usage in a React component:
// import { generatePitchDeckPPTX } from "../utils/generatePitchDeckPPTX";
// generatePitchDeckPPTX(userInput, "PitchDeck.pptx");

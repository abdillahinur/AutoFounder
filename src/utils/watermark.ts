import type PptxGenJS from "pptxgenjs";

type TileOpts = {
  text?: string;
  cols?: number;   // e.g., 3
  rows?: number;   // e.g., 3
  rotateDeg?: number; // e.g., -30
  colorHex?: string;  // e.g., "BBBBBB"
  opacity?: number;   // 0..1 if supported by pptxgenjs, else ignore
  fontSize?: number;  // e.g., 28..40
};

// Adds a light, repeated watermark behind slide content.
// IMPORTANT: call this BEFORE adding your normal text so the deck content draws on top.
export function addTiledWatermark(
  slide: PptxGenJS.Slide,
  slideW: number,   // inches
  slideH: number,   // inches
  opts: TileOpts = {}
) {
  const {
    text = "AUTOFOUNDER — DEMO",
    cols = 3,
    rows = 3,
    rotateDeg = -30,
    colorHex = "BBBBBB",
    opacity = 0.18,
    fontSize = 36,
  } = opts;

  const cellW = slideW / cols;
  const cellH = slideH / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + cellW * 0.1;
      const y = r * cellH + cellH * 0.15;
      slide.addText(text, {
        x, y, w: cellW * 0.8, h: cellH * 0.7,
        align: "center",
        fontSize,
        color: colorHex,
        bold: true,
        rotate: rotateDeg,      // pptxgenjs supports rotation for text
        // If your version supports it, keep a subtle outline/shadow for readability:
        outline: { color: "FFFFFF", size: 0.5 },
        // Some versions support opacity on text fill; if not, keep the color light.
        // @ts-ignore
        opacity,
      } as any);
    }
  }
}

// (We pass slide width/height in inches so tiling works for 16:9 and 4:3.)

export type SlideFormat = 'w16x9' | 'w4x3';

export const SLIDE_FORMATS = {
  w16x9: { wIn: 10,   hIn: 5.625, ratio: 10 / 5.625, actualPx: { w: 960, h: 540 } }, // 96 CSS px/in
  w4x3:  { wIn: 10,   hIn: 7.5,   ratio: 10 / 7.5,   actualPx: { w: 960, h: 720 } },
} as const;

export function getFormat(fmt: SlideFormat = 'w16x9') { return SLIDE_FORMATS[fmt]; }

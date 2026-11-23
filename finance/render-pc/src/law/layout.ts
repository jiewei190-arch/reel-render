// law3d layout: EVERY screen-space number of the kit lives here, once per frame format. The compiler, the HUD and the
// gate (tools/law_build.mjs) read the layout of the recipe's format, so a new format is one more entry in LAYOUTS.
//   portrait   1080 x 1920 (Shorts), the default
//   landscape  1920 x 1080 (long-form, "format": "landscape": KIT_LAW3D.md "Long-form (landscape)")
export type Rect = { x: number; y: number; w: number; h: number }; // centre x/y, full w/h (px)
export type LawLayout = {
  id: "portrait" | "landscape";
  W: number; H: number;
  /** hook card: top edge, font size, max width (px) */
  hookTop: number; hookFs: number; hookMaxW: number;
  /** captions: centre y of the band, half band height for the gate, side margin, font size */
  capCentre: number; capHalf: number; capSide: number; capFs: number;
  /** cards (labels / exhibit tags / boards) stay inside this box; top moves down while the hook is up */
  safeTop: number; safeTopHook: number; safeBottom: number; safeX0: number; safeX1: number;
  /** the case-file card */
  caseCard: Rect;
  /** the verdict stamp (centre, font size of the big word) */
  verdict: { x: number; y: number; fs: number; maxW: number };
  /** the dollar counter / number board, by position */
  board: { w: number; h: number; left: number; right: number; top: number; fsValue: number; fsTitle: number };
  /** exhibit tag font size (the tag text; the label above it: exhibitLabelFs, default 34) */
  exhibitFs: number;
  exhibitLabelFs?: number;
  /** a subject's face should sit at this fraction of the height (camera presets) */
  face: { hook: number; close: number; medium: number; wide: number };
};

export const LAYOUTS: Record<"portrait" | "landscape", LawLayout> = {
  portrait: {
    id: "portrait", W: 1080, H: 1920,
    hookTop: 230, hookFs: 96, hookMaxW: 980,
    capCentre: 1350, capHalf: 105, capSide: 150, capFs: 84,
    safeTop: 250, safeTopHook: 560, safeBottom: 1195, safeX0: 50, safeX1: 1030,
    caseCard: { x: 540, y: 760, w: 860, h: 400 },
    verdict: { x: 540, y: 820, fs: 170, maxW: 980 },
    board: { w: 640, h: 270, left: 60, right: 60, top: 40, fsValue: 112, fsTitle: 40 },
    exhibitFs: 58,
    face: { hook: 0.46, close: 0.44, medium: 0.45, wide: 0.5 },
  },
  landscape: {
    // long-form (LONGFORM.md, src/longform/kit.tsx LF): the hook top centre at 70 px, lower-third captions centred at
    // 905 px (band +-72, 240 px side margins); cards stay above the band (safeBottom 800 < 833) and inside the frame
    id: "landscape", W: 1920, H: 1080,
    hookTop: 70, hookFs: 80, hookMaxW: 1500,
    capCentre: 905, capHalf: 72, capSide: 240, capFs: 60,
    safeTop: 60, safeTopHook: 250, safeBottom: 800, safeX0: 80, safeX1: 1840,
    caseCard: { x: 760, y: 598, w: 900, h: 400 },
    verdict: { x: 960, y: 480, fs: 170, maxW: 1600 },
    board: { w: 520, h: 250, left: 90, right: 90, top: 40, fsValue: 108, fsTitle: 44 },
    exhibitFs: 54, exhibitLabelFs: 44,
    face: { hook: 0.42, close: 0.42, medium: 0.44, wide: 0.48 },
  },
};
/** recipe.format "landscape" -> the landscape layout; everything else ("short", "long", undefined) is portrait */
export const layoutOf = (format?: string): LawLayout => (format === "landscape" ? LAYOUTS.landscape : LAYOUTS.portrait);

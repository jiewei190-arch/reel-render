// cyber3d LAYOUT: every screen-space number of the kit lives here, once per frame format, so the compiler, the HUD,
// the gate (tools/cyber_build.mjs) and the compositions all read the same values.
//   portrait   1080 x 1920 (Shorts; rendered and QA'd today)
//   landscape  1920 x 1080 (long-form, LONGFORM.md: recipe "format": "landscape", or "frame": "landscape" as an alias;
//              nothing else in the kit hard-codes a size)
// All values are px in the output frame. Cards, the hook and captions scale with `k` (portrait = 1).
export type FrameId = "portrait" | "landscape";
export type Rect = { x: number; y: number; w: number; h: number }; // centre x/y

export type Layout = {
  id: FrameId;
  W: number; H: number;
  /** text scale against the portrait design */
  k: number;
  hook: { top: number; fs: number; maxW: number; side: number };
  cap: { centre: number; side: number; fs: number; band: number; from: number };
  /** cards and labels stay inside this box (top moves down while the hook is up) */
  safe: { top: number; topHook: number; bottom: number; x0: number; x1: number };
  label: { fs: number };
  /** number boards (left / right / top) */
  board: { w: number; h: number; margin: number; giant: { w: number; h: number; titleFs: number; valueFs: number } };
  /** story devices */
  caseFile: Rect;
  money: Rect;
  checklist: Rect;
  countdown: Rect;
  alert: { banner: Rect; border: number };
};

const portrait: Layout = {
  id: "portrait", W: 1080, H: 1920, k: 1,
  hook: { top: 236, fs: 96, maxW: 980, side: 50 },
  cap: { centre: 1344, side: 150, fs: 80, band: 105, from: 1.0 },
  safe: { top: 250, topHook: 560, bottom: 1190, x0: 50, x1: 1030 },
  label: { fs: 50 },
  board: { w: 420, h: 250, margin: 60, giant: { w: 920, h: 430, titleFs: 56, valueFs: 210 } },
  caseFile: { x: 540, y: 820, w: 900, h: 560 },
  money: { x: 540, y: 1010, w: 860, h: 260 },
  checklist: { x: 540, y: 760, w: 920, h: 820 },
  countdown: { x: 540, y: 640, w: 640, h: 190 },
  alert: { banner: { x: 540, y: 1060, w: 760, h: 150 }, border: 46 },
};

// LONG-FORM (LONGFORM.md, src/longform/kit.tsx LF): the shared lower-third caption (centre 905, band +-72, 240 px side
// margins), the hook top centre at 70 px; every card and label stays inside the frame and above the caption band
// (safe.bottom 800 < 833). Text keeps its portrait size (k = 1): a 1080-tall frame shows it as large as a Short does.
const landscape: Layout = {
  id: "landscape", W: 1920, H: 1080, k: 1,
  hook: { top: 70, fs: 80, maxW: 1500, side: 120 },
  cap: { centre: 905, side: 240, fs: 60, band: 72, from: 0 },
  safe: { top: 90, topHook: 320, bottom: 800, x0: 60, x1: 1860 },
  label: { fs: 50 },
  board: { w: 420, h: 250, margin: 90, giant: { w: 1100, h: 400, titleFs: 52, valueFs: 190 } },
  caseFile: { x: 1370, y: 470, w: 900, h: 560 },
  money: { x: 1370, y: 560, w: 860, h: 260 },
  checklist: { x: 1350, y: 470, w: 920, h: 620 },
  countdown: { x: 1370, y: 450, w: 640, h: 190 },
  alert: { banner: { x: 1370, y: 600, w: 760, h: 150 }, border: 36 },
};

export const LAYOUTS: Record<FrameId, Layout> = { portrait, landscape };
/** the frame a recipe renders in: portrait unless it asks for landscape ("format" or "frame") */
export const frameOf = (r: { format?: string; frame?: string }): FrameId => (r.frame === "landscape" || r.format === "landscape" ? "landscape" : "portrait");
export const layoutOf = (r: { format?: string; frame?: string }): Layout => LAYOUTS[frameOf(r)];

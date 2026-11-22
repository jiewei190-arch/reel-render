// cyber3d LAYOUT: every screen-space number of the kit lives here, once per frame format, so the compiler, the HUD,
// the gate (tools/cyber_build.mjs) and the compositions all read the same values.
//   portrait   1080 x 1920 (Shorts; rendered and QA'd today)
//   landscape  1920 x 1080 (long-form; the numbers are ready, selected by recipe "format": "landscape" or
//              "frame": "landscape" once engine/longform lands; nothing else in the kit hard-codes a size)
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
  board: { w: number; h: number; margin: number };
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
  board: { w: 420, h: 250, margin: 60 },
  caseFile: { x: 540, y: 820, w: 900, h: 560 },
  money: { x: 540, y: 1010, w: 860, h: 260 },
  checklist: { x: 540, y: 760, w: 920, h: 820 },
  countdown: { x: 540, y: 640, w: 640, h: 190 },
  alert: { banner: { x: 540, y: 1060, w: 760, h: 150 }, border: 46 },
};

const landscape: Layout = {
  id: "landscape", W: 1920, H: 1080, k: 0.8,
  hook: { top: 70, fs: 84, maxW: 1500, side: 120 },
  cap: { centre: 900, side: 360, fs: 64, band: 80, from: 1.0 },
  safe: { top: 90, topHook: 300, bottom: 790, x0: 80, x1: 1840 },
  label: { fs: 42 },
  board: { w: 380, h: 220, margin: 90 },
  caseFile: { x: 1380, y: 520, w: 820, h: 500 },
  money: { x: 1380, y: 600, w: 760, h: 230 },
  checklist: { x: 1300, y: 500, w: 900, h: 700 },
  countdown: { x: 960, y: 360, w: 560, h: 160 },
  alert: { banner: { x: 960, y: 640, w: 680, h: 130 }, border: 36 },
};

export const LAYOUTS: Record<FrameId, Layout> = { portrait, landscape };
/** the frame a recipe renders in: portrait unless it asks for landscape ("format" or "frame") */
export const frameOf = (r: { format?: string; frame?: string }): FrameId => (r.frame === "landscape" || r.format === "landscape" ? "landscape" : "portrait");
export const layoutOf = (r: { format?: string; frame?: string }): Layout => LAYOUTS[frameOf(r)];

// biz3d layout: EVERY screen-space number of the kit lives here, one block per frame format, so a new format is one
// entry (the HUD, the label/board/device placement, the projection, the gate and the compositions all read it).
//   portrait   1080 x 1920 (Shorts) - the format built and tested today
//   landscape  1920 x 1080 (long-form) - wired through; recipes ask for it with "format": "landscape" (the same key
//              the engine/longform branch adds). Tune the numbers below when the first landscape recipe is reviewed.
export type BizFormatId = "portrait" | "landscape";
export type Rect = { x: number; y: number; w: number; h: number };

export type BizLayout = {
  id: BizFormatId;
  W: number;
  H: number;
  /** camera presets are authored for portrait; landscape scales the vertical fov by this (keeps the subject size) */
  fovK: number;
  /** presets' distances are multiplied by this (a wider frame can sit a little closer) */
  distK: number;
  hook: { top: number; fs: number; maxW: number; side: number };
  cap: { centre: number; band: number; side: number; fs: number; from: number };
  /** cards, boards and devices stay inside this box; top moves down below the hook while it shows */
  safe: { top: number; topHook: number; bottom: number; x0: number; x1: number };
  board: { w: number; h: number; margin: number; titleFs: number; valueFs: number };
  label: { fs: number };
  company: { w: number; h: number; nameFs: number; yearFs: number };
  decision: { y: number; fs: number; subFs: number; bar: number };
  counter: { y: number; w: number; h: number; fs: number; titleFs: number };
  worth: { y: number; w: number; h: number; fs: number; labelFs: number };
  tag: { fs: number };
};

export const LAYOUTS: Record<BizFormatId, BizLayout> = {
  portrait: {
    id: "portrait", W: 1080, H: 1920, fovK: 1, distK: 1,
    hook: { top: 236, fs: 98, maxW: 980, side: 50 },
    cap: { centre: 1344, band: 105, side: 170, fs: 82, from: 1.0 },
    safe: { top: 250, topHook: 560, bottom: 1190, x0: 50, x1: 1030 },
    board: { w: 420, h: 250, margin: 60, titleFs: 38, valueFs: 108 },
    label: { fs: 52 },
    company: { w: 760, h: 300, nameFs: 92, yearFs: 44 },
    decision: { y: 760, fs: 150, subFs: 64, bar: 150 },
    counter: { y: 700, w: 900, h: 330, fs: 150, titleFs: 44 },
    worth: { y: 640, w: 940, h: 560, fs: 96, labelFs: 40 },
    tag: { fs: 44 },
  },
  landscape: {
    id: "landscape", W: 1920, H: 1080, fovK: 0.62, distK: 1,
    hook: { top: 56, fs: 84, maxW: 1500, side: 120 },
    cap: { centre: 935, band: 70, side: 360, fs: 64, from: 1.0 },
    safe: { top: 60, topHook: 250, bottom: 840, x0: 80, x1: 1840 },
    board: { w: 420, h: 230, margin: 90, titleFs: 34, valueFs: 96 },
    label: { fs: 46 },
    company: { w: 760, h: 280, nameFs: 84, yearFs: 40 },
    decision: { y: 470, fs: 140, subFs: 58, bar: 110 },
    counter: { y: 430, w: 900, h: 300, fs: 136, titleFs: 40 },
    worth: { y: 450, w: 1200, h: 500, fs: 88, labelFs: 36 },
    tag: { fs: 40 },
  },
};
/** the layout of a recipe: "format": "landscape" picks landscape; anything else ("short", "long", "portrait", none) is portrait */
export const layoutOf = (format?: string): BizLayout => (format === "landscape" ? LAYOUTS.landscape : LAYOUTS.portrait);

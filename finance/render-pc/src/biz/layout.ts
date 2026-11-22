// biz3d layout: EVERY screen-space number of the kit lives here, one block per frame format, so a new format is one
// entry (the HUD, the label/board/device placement, the projection, the gate and the compositions all read it).
//   portrait   1080 x 1920 (Shorts) - the format built and tested today
//   landscape  1920 x 1080 (long-form, LONGFORM.md): the shared LF numbers of src/longform/kit.tsx - the lower-third
//              caption centre 905 (band +-72, 240 px side margins), the hook top-centre at 70; cards and labels stay
//              inside the frame and above the caption band. The lens follows the shared 16:9 rule (landscapeLens: the
//              vertical fov is kept, wider presets narrow a little), applied per preset in compile.ts.
import { LF } from "../longform/kit";

export type BizFormatId = "portrait" | "landscape";
export type Rect = { x: number; y: number; w: number; h: number };

export type BizLayout = {
  id: BizFormatId;
  W: number;
  H: number;
  hook: { top: number; fs: number; maxW: number; side: number };
  cap: { centre: number; band: number; side: number; fs: number; from: number };
  /** cards, boards and devices stay inside this box; top moves down below the hook while it shows */
  safe: { top: number; topHook: number; bottom: number; x0: number; x1: number };
  board: { w: number; h: number; margin: number; titleFs: number; valueFs: number; giant: { w: number; h: number; titleFs: number; valueFs: number } };
  label: { fs: number };
  company: { w: number; h: number; nameFs: number; yearFs: number };
  decision: { y: number; fs: number; subFs: number; bar: number };
  counter: { y: number; w: number; h: number; fs: number; titleFs: number };
  worth: { y: number; w: number; h: number; fs: number; labelFs: number };
  tag: { fs: number };
};

export const LAYOUTS: Record<BizFormatId, BizLayout> = {
  portrait: {
    id: "portrait", W: 1080, H: 1920,
    hook: { top: 236, fs: 98, maxW: 980, side: 50 },
    cap: { centre: 1344, band: 105, side: 170, fs: 82, from: 1.0 },
    safe: { top: 250, topHook: 560, bottom: 1190, x0: 50, x1: 1030 },
    board: { w: 420, h: 250, margin: 60, titleFs: 38, valueFs: 108, giant: { w: 920, h: 430, titleFs: 56, valueFs: 220 } },
    label: { fs: 52 },
    company: { w: 760, h: 300, nameFs: 92, yearFs: 44 },
    decision: { y: 760, fs: 150, subFs: 64, bar: 150 },
    counter: { y: 700, w: 900, h: 330, fs: 150, titleFs: 44 },
    worth: { y: 640, w: 940, h: 560, fs: 96, labelFs: 40 },
    tag: { fs: 44 },
  },
  landscape: {
    // LF (src/longform/kit.tsx): CAP_Y 905, CAP_HALF 72, CAP_SIDE 240, HOOK_TOP 70, HOOK_SIZE 80. Every font >= 32 px.
    id: "landscape", W: 1920, H: 1080,
    hook: { top: LF.HOOK_TOP, fs: LF.HOOK_SIZE, maxW: 1600, side: 160 },
    cap: { centre: LF.CAP_Y, band: LF.CAP_HALF, side: LF.CAP_SIDE, fs: 60, from: 1.0 },
    safe: { top: 60, topHook: 300, bottom: LF.CAP_Y - LF.CAP_HALF - 16, x0: 80, x1: 1840 },
    board: { w: 440, h: 230, margin: 110, titleFs: 36, valueFs: 96, giant: { w: 1100, h: 400, titleFs: 52, valueFs: 190 } },
    label: { fs: 46 },
    company: { w: 780, h: 260, nameFs: 84, yearFs: 42 },
    decision: { y: 262, fs: 140, subFs: 58, bar: 100 },
    counter: { y: 440, w: 900, h: 290, fs: 132, titleFs: 40 },
    worth: { y: 470, w: 1100, h: 470, fs: 84, labelFs: 36 },
    tag: { fs: 40 },
  },
};
/** the layout of a recipe: "format": "landscape" picks landscape; anything else ("short", "long", "portrait", none) is portrait */
export const layoutOf = (format?: string): BizLayout => (format === "landscape" ? LAYOUTS.landscape : LAYOUTS.portrait);

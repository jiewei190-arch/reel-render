// Shared LONG-FORM pieces (format "landscape", 1920x1080, LONGFORM.md) for every kit: the Block Money engine
// (src/fin/recipe/compile.tsx) and the law3d / biz3d / cyber3d / tech3d kits use the same chapter card, the same
// lower-third captions, the same 16:9 lens rule and the same caption band, so the five channels' long-form videos follow
// one set of rules. Pure helpers + two DOM components; no three.js, no assets.
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp } from "../blocky/motion";
import { EASE_OUT } from "../fin/lib/motion";
import type { At } from "../fin/recipe/types";

export { LowerThirdCaptions, chunkWords } from "../fin/lib/captions";
export type { CapChunk, CapWord } from "../fin/lib/captions";

/** long-form screen numbers (px at 1920x1080) */
export const LF = {
  W: 1920, H: 1080,
  /** lower-third caption: centre y, half of its 2-line band, how far it may move (down to CAP_MAX, up to CAP_MIN) */
  CAP_Y: 905, CAP_HALF: 72, CAP_MIN: 400, CAP_MAX: 940,
  /** the caption column is 1440 px wide (240 px side margins): faces outside it do not push the caption */
  CAP_SIDE: 240,
  /** captions are lower-third phrases of up to this many words (2 lines max) */
  CAP_WORDS: 7,
  /** the hook text: top centre */
  HOOK_TOP: 70, HOOK_SIZE: 80,
  /** the chapter title sting length (s) */
  CHAPTER_CARD_S: 2.6,
} as const;

/** a chapter starts on a word of the voice-over (recipe "chapters": [{ "title", "word" }]) */
export type ChapterSpec = { title: string; word: At };
/** a resolved chapter: t = the chapter word, card = when its title card plays (after the hook text has gone) */
export type ChapterR = { n: number; title: string; t: number; card: number;
  /** kits (law3d / biz3d / cyber3d, src/longform/polish.ts placeChapters): the card's top, its measured box and title size */
  top?: number; box?: { x0: number; x1: number; y0: number; y1: number }; fs?: number; fitOk?: boolean };

/** chapters -> seconds; throws on chapters out of order (the same rule as the Block Money compiler) */
export const resolveChapters = (specs: readonly ChapterSpec[] | undefined, at: (a: At | undefined, d?: number) => number, hookUntil: number): ChapterR[] => {
  const out = (specs ?? []).map((ch, i) => { const t = at(ch.word); return { n: i + 1, title: ch.title, t, card: Math.max(t, t < hookUntil ? hookUntil + 0.1 : t) }; });
  out.forEach((ch, i) => { if (i && ch.t <= out[i - 1].t) throw new Error(`recipe: chapter ${i + 1} "${ch.title}" starts at ${ch.t.toFixed(2)} s, not after chapter ${i}`); });
  return out;
};
/** each chapter card: a whoosh + an impact cue (story_mix.py library names) */
export const chapterCues = (chapters: readonly ChapterR[]) => chapters.flatMap((ch) => [{ t: ch.card - 0.25, sfx: "whoosh", db: -6 }, { t: ch.card + 0.05, sfx: "impact", db: -6 }]);
/** the chapter whose card is on screen at t */
export const chapterAt = (chapters: readonly ChapterR[], t: number) => chapters.find((x) => t >= x.card && t < x.card + LF.CHAPTER_CARD_S);

/** 16:9 lens rule (LONGFORM.md "How the frame adapts"): three.js keeps the VERTICAL fov, so a landscape frame at the
 *  portrait fov shows the same height and 3.2x the width. Close presets stay as framed; wider ones narrow the fov a
 *  little (and `wide` comes in 5 %) so set edges stay out of frame. [fov x, dist x] by preset name; the kits' extra
 *  presets follow the class they belong to. */
export const LANDSCAPE_LENS: Record<string, [number, number]> = {
  hookZoom: [1, 1], closeUp: [1, 1], slamZoom: [0.95, 1], pushIn: [0.95, 1], medium: [0.9, 1], whip: [0.9, 1], orbit: [0.9, 1],
  wide: [0.8, 0.95], splitScreen: [1.15, 1], povFirstPerson: [0.85, 1],
  // kit presets
  dolly: [0.9, 1], crane: [0.85, 0.95], topDown: [0.95, 1], flyThrough: [0.9, 1], explodeOrbit: [0.9, 1], overShoulder: [0.95, 1], screen: [1, 1], insert: [1, 1],
};
export const landscapeLens = (preset: string): [number, number] => LANDSCAPE_LENS[preset] ?? [0.9, 1];

export type FaceBand = { top: number; bot: number };
/** the lower-third caption centre for a shot (px at 1080 tall): CAP_Y unless a face (in the caption column) sits in the
 *  band; then the nearest free spot between CAP_MIN and CAP_MAX (a lower third only moves down a little or up to just
 *  over the face) */
export const lowerThirdY = (faces: readonly FaceBand[]): number => {
  const inBand = (o: FaceBand, y: number) => !(o.bot < y - LF.CAP_HALF || o.top > y + LF.CAP_HALF);
  const free = (y: number) => faces.every((o) => !inBand(o, y));
  if (free(LF.CAP_Y)) return LF.CAP_Y;
  const cand = [...faces.map((o) => o.bot + LF.CAP_HALF + 8), ...faces.map((o) => o.top - LF.CAP_HALF - 8)].filter((v) => v >= LF.CAP_MIN && v <= LF.CAP_MAX && free(v));
  return cand.length ? cand.reduce((b, v) => (Math.abs(v - LF.CAP_Y) < Math.abs(b - LF.CAP_Y) ? v : b)) : LF.CAP_Y;
};
/** does a face box touch the default lower-third band? */
export const inLowerThird = (o: FaceBand) => !(o.bot < LF.CAP_Y - LF.CAP_HALF || o.top > LF.CAP_Y + LF.CAP_HALF);
/** caption-safe framing for long-form: how far (as a fraction of the height) to raise a subject so the lowest face clears
 *  the band (0 when clear) */
export const liftNeeded = (faces: readonly FaceBand[]) => {
  const low = faces.filter(inLowerThird);
  if (!low.length) return 0;
  return Math.max(0, Math.max(...low.map((o) => o.bot)) - (LF.CAP_Y - LF.CAP_HALF - 10) + 8) / LF.H;
};

/** a chapter title sting: 2.6 s, a bar slides in from the left with "CHAPTER n" and the title, holds, slides out.
 *  `accent` / `edge` default to the Block Money look (yellow tab, red edge).
 *  `safe` (the law3d / biz3d / cyber3d kits, LONGFORM.md "Chapter cards"): the card never leaves the frame: it fades in
 *  with a short 60 px glide instead of sliding in from off screen (no clipped "PAIR OF" frames), the title is ONE line
 *  at the measured size `fs` (polish.ts chapterBox) and it sits at `top` (its own region, clear of boards and labels).
 *  Without `safe` the output is exactly as before (Block Money, tech3d). */
export const ChapterCard: React.FC<{ n: number; title: string; u: number; accent?: string; edge?: string; safe?: boolean; top?: number; fs?: number }> = ({ n, title, u, accent = "#ffd23a", edge = "#ff3b30", safe, top, fs }) => {
  if (u < 0 || u > LF.CHAPTER_CARD_S) return null;
  const inK = EASE_OUT(clamp(u / 0.35)), outK = EASE_OUT(clamp((u - (LF.CHAPTER_CARD_S - 0.35)) / 0.35));
  const x = safe ? -60 * (1 - inK) - 60 * outK : -1100 * (1 - inK) - 1300 * outK;
  const dim = 0.32 * inK * (1 - outK);
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(10,6,16,${dim})` }} />
      <div style={{ position: "absolute", left: 0, top: safe ? top ?? 330 : 330, transform: `translateX(${x}px)`, opacity: safe ? inK * (1 - outK) : 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ marginLeft: 120, padding: "6px 18px", background: accent, color: "#140c1c", fontFamily: "Poppins", fontWeight: 800, fontSize: 34, letterSpacing: 4, borderRadius: 8, ...(safe ? { whiteSpace: "nowrap" as const } : {}) }}>{`CHAPTER ${n}`}</div>
        <div style={{ marginTop: 14, padding: "18px 60px 22px 120px", background: "rgba(20,12,28,0.88)", borderRight: `14px solid ${edge}`, color: "#ffffff", fontFamily: "Poppins", fontWeight: 800, fontSize: safe ? fs ?? 96 : 96, lineHeight: 1.05, maxWidth: 1500, textTransform: "uppercase", ...(safe ? { whiteSpace: "nowrap" as const } : {}) }}>{title}</div>
      </div>
    </>
  );
};

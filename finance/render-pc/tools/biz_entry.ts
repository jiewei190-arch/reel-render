// bundled by tools/biz_build.mjs (esbuild, remotion/@react-three stubbed) to compile and QA biz3d recipes in node
export { compileBiz, labelSize, BIZ_CAMS } from "../src/biz/compile";
export { execHead, EXEC_POSES } from "../src/biz/exec";
export { boardFonts, hookLines, hookWidth } from "../src/biz/hud";
export { BIZ_HERO_KINDS } from "../src/biz/hero";
export { heroBox } from "../src/biz/props";
export { isHero };
export { layoutOf, LAYOUTS } from "../src/biz/layout";
export { BIZ_SET_IDS } from "../src/biz/sets";
import { BIZ_CAMS, compileBiz } from "../src/biz/compile";
import { hookLines, hookWidth } from "../src/biz/hud";
import { LAYOUTS } from "../src/biz/layout";
import { isHero } from "../src/biz/props";
import type { At, BizProp, BizRecipe, BizShot } from "../src/biz/types";

// ------------------------------------------------------------------ the clip adapter (tools/clip_short_kit.mjs)
// A biz3d Short cut from a (long-form) biz3d recipe. Every TIME field of the biz3d shot schema is re-timed; places
// (actor at / to, prop at, device pos, fx p) are never touched.
type Remap = (a: At | undefined, keepNeg?: boolean) => At | undefined;
type Obj = Record<string, unknown>;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

/** the shots re-timed for the clip being made (retimeRecipe re-frames them when the source is landscape) */
let pending: BizShot[] = [];
/** rewrite every At of one biz3d shot in place */
const retimeShot = (s: BizShot, remap: Remap) => {
  pending.push(s);
  const T = (o: Obj, k: string) => { if (o && o[k] !== undefined) o[k] = remap(o[k] as At); };
  T(s as unknown as Obj, "at");
  T(s.cam as unknown as Obj, "hit");
  for (const a of s.actors ?? []) { T(a as unknown as Obj, "from"); for (const q of a.then ?? []) T(q as unknown as Obj, "at"); }
  for (const p of s.props ?? []) T(p as unknown as Obj, "hit"); // a prop's `at` is a place
  for (const ac of s.actions ?? []) { const o = ac as unknown as Obj; T(o, "at"); T(o, "until"); T(o, "collapse"); }
  for (const d of s.devices ?? []) { const o = d as unknown as Obj; T(o, "at"); T(o, "until"); T(o, "land"); if (o.count) T(o.count as Obj, "land"); }
  if (s.fx) s.fx = s.fx.map((f) => (typeof f === "string" ? f : f.at !== undefined ? { ...f, at: remap(f.at) as At } : f));
  for (const q of s.sfx ?? []) T(q as unknown as Obj, "at");
  return s;
};

/** global props (recipe.props, with from / until) that overlap the segment, re-timed */
const retimeRecipe = (recipe: BizRecipe, remap: Remap, seg: { tA: number; end: number; end0: number; at: (a: At | undefined, d?: number) => number }) => {
  const props = (recipe.props ?? [])
    .filter((p) => seg.at(p.from, 0) < seg.end && seg.at(p.until, seg.end0 + 1) > seg.tA)
    .map((p) => {
      const q = JSON.parse(JSON.stringify(p));
      if (q.from !== undefined) q.from = remap(q.from);
      if (q.until !== undefined) q.until = remap(q.until);
      if (q.hit !== undefined) q.hit = remap(q.hit);
      return q;
    });
  // a landscape source frames for 16:9: its explicit cam.face (tuned to the lower third) and stamp `y` (px of a 1080-tall
  // frame) do not carry over to 9:16. The clip takes the portrait preset framing (caption-safe in this kit) and puts a
  // stamp under THE DECISION (y 1080, as the portrait demo) or at the portrait default.
  if (recipe.format === "landscape") {
    for (const s of pending) {
      delete s.cam.face;
      const decision = (s.devices ?? []).some((d) => d.do === "decision");
      for (const d of s.devices ?? []) if (d.do === "stamp") { if (decision) d.y = 1080; else delete d.y; }
      // THE DECISION card spans y 596-924 in portrait: keep the executive's head above it (as the portrait demo frames it)
      if (decision) { s.cam.face = 0.4; s.cam.dist = Math.round((s.cam.dist ?? BIZ_CAMS[s.cam.preset].dist) * 1.15 * 100) / 100; }
    }
  }
  pending = [];
  return props.length ? { props } : {};
};

/** the biz3d hook rule: <= 5 words, <= 2 lines that fit the portrait card, exactly one *accent* word (the stake when the
 *  text has a $ or a number, else the longest word) */
const hookText = (text: string) => {
  let w = String(text).replace(/\*/g, "").toUpperCase().trim().split(/\s+/).filter(Boolean).slice(0, 5);
  const pick = () => { const i = w.findIndex((x) => /[$\d]/.test(x)); return i >= 0 ? i : w.reduce((b, x, k) => (x.length > w[b].length ? k : b), 0); };
  const make = () => { const k = pick(); return w.map((x, j) => (j === k ? `*${x}*` : x)).join(" "); };
  let s = make();
  while (w.length > 1 && hookWidth(LAYOUTS.portrait, s) > LAYOUTS.portrait.hook.maxW) { const k = pick(); w = w.filter((_, j) => j !== (k === w.length - 1 ? 0 : w.length - 1)); s = make(); }
  return s;
};

/** a fresh frame-0 shot that passes the biz3d frame-0 gate and the opener rules (tools/frame0_hero.mjs): the executive
 *  seated at the head of the boardroom table, arms folded, a shrug + shake at 0.45 s (the acting beat and a camera
 *  hit), the hook text from frame 0, and in front of it the story's HERO PROP close-up (the first hero prop of the
 *  segment, else of the source recipe). With no hero prop in the source, the stake goes on a giant board at frame 0,
 *  and with no stake either, a letter carrying the hook as its headline. It cuts away at hookEnd (1.0 s). */
const hookShot = ({ recipe, src, hookText: ht, stake, hookEnd }: { recipe: BizRecipe; first: BizShot; src: BizShot; hookText: string; stake: string | null; set?: string; hookEnd: number }): BizShot => {
  const cast = Object.keys(recipe.cast);
  const who = (src.actors ?? []).find((a) => a.pose !== "walk")?.id ?? recipe.shots[0].actors?.[0]?.id ?? cast[0];
  const heroOf = (ps?: BizProp[]) => (ps ?? []).find((p) => isHero(p.kit));
  const srcHero = heroOf(src.props) ?? recipe.shots.map((s) => heroOf(s.props)).find(Boolean) ?? heroOf(recipe.props);
  const plain = ht.replace(/\*/g, "");
  const hero: BizProp | null = srcHero
    ? { id: "hero0", kit: srcHero.kit, label: srcHero.label, color: srcHero.color, lines: srcHero.lines, at: "tableTop:0,0,-2.35", scale: 0.8, spin: 8 }
    : !stake && !/[$€£]\d/.test(ht) ? { id: "hero0", kit: "letter", label: plain.slice(0, 40), at: "tableTop:0,0,-2.35", scale: 0.8 } : null;
  const shot: BizShot = {
    at: 0, set: "boardroom",
    note: `fresh hook card (tools/clip_short.mjs, biz3d adapter): "${plain}", ${hero ? `opens on the ${hero.kit} close-up` : "opens on the giant stake board"}, cuts away at ${hookEnd.toFixed(1)} s`,
    // a 2-line hook card reaches lower: sit the executive lower too (captions only start at 1.0 s, after this shot)
    cam: hero ? { preset: "hookZoom", target: "hero0", dist: 1.45, h: 0.12, face: hookLines(ht).length > 1 ? 0.6 : 0.52 } : { preset: "hookZoom", target: who, dist: 3.4, h: 0.35, face: 0.84 }, // under the giant board
    actors: [{ id: who, pose: "fold", at: "head", seated: true, then: [{ at: 0.45, pose: "shrug" }] }],
    fx: [{ fx: "shake", at: 0.45, gain: 0.8 }],
  };
  if (hero) shot.props = [hero];
  // the stake on screen by 0.5 s: in the hook text, else on the giant board (no hero prop) or a label on the prop
  // the board value: the stake word, with the hook's unit word folded in ("$50" + "MILLION" -> "$50M")
  const unit = /\bMILLION\b/i.test(plain) ? "M" : /\bBILLION\b/i.test(plain) ? "B" : /\bTHOUSAND\b/i.test(plain) ? "K" : "";
  // the money in the hook's accent word is the stake (line 1 can start on a year: "It was 2000")
  const acc = ht.match(/\*([^*]+)\*/)?.[1] ?? "";
  const stk = /[$€£]\d/.test(acc) ? acc : stake;
  const val = stk ? (/^[$€£]?\d[\d,.]*$/.test(stk) ? `${stk}${unit}` : stk.split(/\s+/).slice(0, 3).join(" ")).toUpperCase() : "";
  if (!hero && stk) shot.devices = [{ do: "board", size: "giant", title: "the stake", value: val, at: 0, until: hookEnd, tone: "red" }];
  else if (stake && !/[$\d]/.test(ht)) shot.actions = [{ do: "label", on: "hero0", text: stake.split(/\s+/).slice(0, 3).join(" "), at: 0.0, until: hookEnd, tone: "red" }];
  return shot;
};

export const clipAdapter = {
  compile: (recipe: BizRecipe, words: { w: string; t: number; end: number; turn?: number }[], vo?: number) => compileBiz(recipe, words as never, vo),
  retimeShot,
  retimeRecipe,
  hookText,
  hookShot,
  r3,
};
export { chunkWords as capChunkWords } from "../src/fin/lib/captions";
export { spokenAnchor, ANCHOR_LOOKBACK } from "../src/longform/polish";
export { LF } from "../src/longform/kit";

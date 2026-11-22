// bundled by tools/law_build.mjs (esbuild, remotion/@react-three stubbed) to compile and QA law3d recipes in node
export { compileLaw, project, LAW_CAMS } from "../src/law/compile";
export { figFace, figBoxes, FIG_POSES, FIG_FACES, ROLES } from "../src/law/cast";
export { hookLines, hookBox } from "../src/law/hud";
export { LF } from "../src/longform/kit";
export { spokenAnchor, ANCHOR_LOOKBACK } from "../src/longform/polish";
export { layoutOf, LAYOUTS } from "../src/law/layout";
export { KIT_IDS, KIT_BOX } from "../src/law/objects";
export { LAW_SET_IDS } from "../src/law/sets";

// ------------------------------------------------------------------ clip adapter (tools/clip_short_kit.mjs)
// A law3d Short cut out of a (long-form) law3d recipe: every `At` field of the shot schema is re-timed, places stay
// places (an actor's / prop's `at` and an actor's `to` are PLACES in law3d), and a fresh frame-0 hook shot is made
// that passes the law3d Shorts frame-0 gate (tools/law_build.mjs).
import { compileLaw as compileLawK } from "../src/law/compile";
import { hookBox as hookBoxK } from "../src/law/hud";
import { LAYOUTS as LAYOUTS_K } from "../src/law/layout";
import type { At, LawAction, LawFx, LawProp, LawRecipe, LawShot, Place } from "../src/law/types";
import type { Word } from "../src/fin/recipe/types";

type Remap = (a: At | undefined, keepNeg?: boolean) => At | undefined;
const isNum = (x: unknown): x is number => typeof x === "number";

const retimeShot = (s: LawShot, remap: Remap) => {
  s.at = remap(s.at) as At;
  if (s.cam?.hit !== undefined) s.cam.hit = remap(s.cam.hit);
  for (const a of s.actors ?? []) {
    if (a.from !== undefined) a.from = remap(a.from);
    if (a.then) a.then = a.then.map((q) => ({ ...q, at: remap(q.at) as At }));
  }
  for (const p of s.props ?? []) {
    if (p.hit !== undefined) p.hit = remap(p.hit);
    if (p.hits) p.hits = p.hits.map((h) => remap(h) as At);
  }
  if (s.actions) {
    s.actions = s.actions.map((ac) => {
      const o = { ...ac, at: remap(ac.at) as At } as LawAction & { until?: At; zeroAt?: At };
      if (o.until !== undefined) o.until = remap(o.until);
      if (o.zeroAt !== undefined) o.zeroAt = remap(o.zeroAt);
      const ol = o as { land?: At };
      if (ol.land !== undefined) ol.land = remap(ol.land);
      return o as LawAction;
    }).filter((o) => {
      // both ends before the segment collapse to 0 s: a device that ended before the clip starts is dropped
      const u = (o as { until?: At }).until;
      return !(isNum(o.at) && isNum(u) && u <= o.at);
    });
  }
  if (s.fx) s.fx = s.fx.map((f): LawFx => (typeof f === "string" ? f : f.at !== undefined ? { ...f, at: remap(f.at) } : f));
  if (s.sfx) s.sfx = s.sfx.map((q) => ({ ...q, at: remap(q.at) as At }));
};

/** global props (recipe.props): from / until are times; keep the ones that overlap the segment */
const retimeRecipe = (recipe: LawRecipe, remap: Remap, seg: { tA: number; tB: number; at: (a: At | undefined, d?: number) => number }) => {
  if (!recipe.props?.length) return {};
  const props = recipe.props
    .filter((p) => seg.at(p.from, 0) < seg.tB && seg.at(p.until, 1e9) > seg.tA)
    .map((p) => { const o = { ...p }; if (o.from !== undefined) o.from = remap(o.from); if (o.until !== undefined) o.until = remap(o.until); if (o.hit !== undefined) o.hit = remap(o.hit); if (o.hits) o.hits = o.hits.map((h) => remap(h) as At); return o; });
  return props.length ? { props } : {};
};

/** the law3d hook rule: <= 5 words, <= 2 lines that fit the portrait card, exactly one *gold* word (a $/number word, else
 *  the longest) */
const hookText = (raw: string) => {
  const L = LAYOUTS_K.portrait;
  let w = String(raw).replace(/\*/g, "").replace(/\s+/g, " ").trim().toUpperCase().split(" ").filter(Boolean).slice(0, 5);
  const make = (ws: string[]) => {
    let gi = ws.findIndex((x) => /[$\d]/.test(x));
    if (gi < 0) gi = ws.reduce((b, x, i) => (x.replace(/[^A-Z0-9]/g, "").length > ws[b].replace(/[^A-Z0-9]/g, "").length ? i : b), 0);
    return ws.map((x, i) => (i === gi ? `*${x}*` : x)).join(" ");
  };
  const fits = (x: string) => { const hb = hookBoxK(L, x); return hb.lines.length <= 2 && hb.textW <= L.hookMaxW; };
  for (; w.length > 1; w = w.slice(0, -1)) {
    const txt = make(w);
    if (fits(txt)) return txt;
    // the card's own split keeps 2 words on one line: try an explicit line break
    for (let k = 1; k < w.length; k++) { const parts = txt.split(" "); const two = `${parts.slice(0, k).join(" ")}\n${parts.slice(k).join(" ")}`; if (fits(two)) return two; }
  }
  return make(w);
};

/** add an offset to a place (an anchor "name[:x,y,z]" or [x, z] / [x, y, z]) */
const placeOff = (pl: Place, o: [number, number, number]): Place => {
  if (Array.isArray(pl)) { const v = pl.length === 2 ? [pl[0], 0, pl[1]] : [...pl]; return [v[0] + o[0], v[1] + o[1], v[2] + o[2]] as Place; }
  const [name, off] = String(pl).split(":");
  const b = off ? off.split(",").map(Number) : [0, 0, 0];
  const r = (x: number) => Math.round(x * 1000) / 1000;
  return `${name}:${r(b[0] + o[0])},${r(b[1] + o[1])},${r(b[2] + o[2])}`;
};
const HOOK_PROPS: [LawProp["kit"], number][] = [["pants", 0.5], ["money", 1.2], ["photo", 1.4], ["gavel", 1.0], ["paper", 0.8], ["folder", 0.7], ["newspaper", 0.6]];

/** the fresh frame-0 shot: a hookZoom on the segment's main person (smug, shocked at 0.45 s, with a shake), a small prop
 *  of the case floating by them (who + what), the stake on a counter when the hook has no number, until hookEnd */
const hookShot = ({ recipe, first, src, hookText: ht, stake, set, hookEnd }: { recipe: LawRecipe; first: LawShot; src: LawShot; hookText: string; stake: string | null; set?: string; hookEnd: number }): LawShot => {
  // a first source shot with a slam/whip landing before the hook cut: land it just after the cut instead
  if (isNum(first.cam?.hit) && first.cam.hit < hookEnd) first.cam.hit = Math.round((hookEnd + 0.12) * 1000) / 1000;
  // the person: the cast member seen in the most shots from the segment start on (ties: the earliest); their set
  const i0 = Math.max(0, recipe.shots.indexOf(src));
  let cur = recipe.shots[0].set ?? "courtroom";
  const setOf = recipe.shots.map((s) => (cur = s.set ?? cur));
  const pool = recipe.shots.map((s, i) => ({ s, i })).filter((x) => x.i >= i0 && (x.s.actors ?? []).some((a) => recipe.cast[a.id]?.role !== "juror"));
  const count = new Map<string, number>();
  for (const x of pool) for (const a of x.s.actors ?? []) count.set(a.id, (count.get(a.id) ?? 0) + 1);
  const who = [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const hit = pool.find((x) => (x.s.actors ?? []).some((a) => a.id === who));
  const shotSet = hit ? setOf[hit.i] : set ?? "courtroom";
  const act = hit ? hit.s.actors!.find((a) => a.id === who)! : null;
  const id = who ?? Object.keys(recipe.cast)[0];
  const at: Place = act ? act.at : "plaintiff";
  const sit = !!act?.sit;
  const kits = new Set(recipe.shots.slice(i0).flatMap((s) => (s.props ?? []).map((p) => p.kit)));
  const [kit, sc] = HOOK_PROPS.find(([k]) => kits.has(k)) ?? HOOK_PROPS[1];
  const off: [number, number, number] = sit ? [0.32, 0.78, 0.34] : [0.3, 1.12, 0.3];
  const hasStake = /[\d$?]/.test(ht.replace(/\*/g, ""));
  const shot: LawShot = {
    at: 0, set: shotSet as LawShot["set"], jury: hit?.s.jury ?? false,
    cam: { preset: "hookZoom", target: `${id}.face`, dist: 1.7, h: 0.05, az: -8 },
    actors: [{ id, pose: sit ? "talk" : "point", face: "smug", at, sit: sit || undefined, pointAt: sit ? undefined : "hookProp", then: [{ at: 0.45, face: "shocked" }] }],
    props: [{ id: "hookProp", kit, at: placeOff(at, off), s: sc, yaw: -15, motion: "float" }],
    fx: [{ fx: "shake", at: 0.45, gain: 0.6 }],
    caption: "off",
    note: `clip hook: ${ht.replace(/\*/g, "")}${stake ? ` / ${stake}` : ""}`,
  };
  // the stake on an exhibit tag under the hook card; the face sits a little lower so the tag never covers it
  if (stake && !hasStake) { shot.actions = [{ do: "exhibit", at: 0, until: hookEnd, label: "AT STAKE", text: stake }]; shot.cam.face = 0.52; shot.cam.dist = 1.7; }
  if (shot.actors![0].sit === undefined) delete shot.actors![0].sit;
  if (shot.actors![0].pointAt === undefined) delete shot.actors![0].pointAt;
  return shot;
};

export const clipAdapter = {
  compile: (recipe: LawRecipe, words: readonly Word[], vo?: number) => compileLawK(recipe, words, vo),
  retimeShot, retimeRecipe, hookText, hookShot,
};

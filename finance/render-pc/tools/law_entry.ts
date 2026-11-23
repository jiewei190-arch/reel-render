// bundled by tools/law_build.mjs (esbuild, remotion/@react-three stubbed) to compile and QA law3d recipes in node
export { compileLaw, project, LAW_CAMS } from "../src/law/compile";
export { figFace, figBoxes, figLimbs, armJoints, FIG_POSES, FIG_FACES, ROLES } from "../src/law/cast";
export { hookLines, hookBox } from "../src/law/hud";
export { LF } from "../src/longform/kit";
export { spokenAnchor, ANCHOR_LOOKBACK } from "../src/longform/polish";
export { layoutOf, LAYOUTS } from "../src/law/layout";
export { KIT_IDS, KIT_BOX, isLawHero, heroBox } from "../src/law/objects";
export { LAW_HERO_KINDS } from "../src/law/hero";
export { LAW_SET_IDS } from "../src/law/sets";

// ------------------------------------------------------------------ clip adapter (tools/clip_short_kit.mjs)
// A law3d Short cut out of a (long-form) law3d recipe: every `At` field of the shot schema is re-timed, places stay
// places (an actor's / prop's `at` and an actor's `to` are PLACES in law3d), and a fresh frame-0 hook shot is made
// that passes the law3d Shorts frame-0 gate (tools/law_build.mjs).
import { compileLaw as compileLawK } from "../src/law/compile";
import { hookBox as hookBoxK } from "../src/law/hud";
import { LAYOUTS as LAYOUTS_K } from "../src/law/layout";
import { LAW_HERO_BOX as LAW_HERO_BOX_K, LAW_HERO_KINDS as LAW_HERO_KINDS_K } from "../src/law/hero";
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
/** the hero prop that stands for a plain kit prop of the source (the frame-0 opener needs a HERO prop close-up) */
const HERO_FOR: Partial<Record<LawProp["kit"], LawProp["kit"]>> = { pants: "trousers", money: "cash", gavel: "bigGavel", paper: "contract", folder: "contract", photo: "frame", newspaper: "contract" };
const isHeroK = (k: string) => (LAW_HERO_KINDS_K as string[]).includes(k);

/** the fresh frame-0 shot, passing the law3d frame-0 gate and the opener rules (tools/frame0_hero.mjs): the story's HERO
 *  PROP close-up in front of the segment's main person (the first hero prop of the segment, else of the source recipe;
 *  with none, the hero that stands for its main plain prop: pants -> trousers, money -> cash ...), the person behind it
 *  facing the lens (smug, shocked at 0.45 s, with a shake), the stake on an exhibit tag when the hook has no number,
 *  until hookEnd */
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
  const heroOf = (ps?: LawProp[]) => (ps ?? []).find((p) => isHeroK(p.kit));
  const srcHero = recipe.shots.slice(i0).map((s) => heroOf(s.props)).find(Boolean) ?? recipe.shots.map((s) => heroOf(s.props)).find(Boolean) ?? heroOf(recipe.props);
  const [kit] = HOOK_PROPS.find(([k]) => kits.has(k)) ?? HOOK_PROPS[1];
  const hero: LawProp = srcHero
    ? { id: "hookProp", kit: srcHero.kit, label: srcHero.label, lines: srcHero.lines, color: srcHero.color, species: srcHero.species, variant: srcHero.variant, hair: srcHero.hair, bandage: srcHero.bandage, sale: srcHero.sale, photo: srcHero.photo, at: "" }
    : { id: "hookProp", kit: HERO_FOR[kit] ?? "cash", at: "" };
  for (const k of Object.keys(hero) as (keyof LawProp)[]) if (hero[k] === undefined) delete hero[k];
  // the reference-Short layout (KIT_LAW3D.md 5a): the hero floats on the person's right (where the pointing arm
  // reaches), a little toward the lens, its top level with the head; the lens aims between them, so the face sits
  // below the hook card and the prop fills >= 35 % of the height
  const SC = 0.62;
  hero.scale = SC;
  const tall = (LAW_HERO_BOX_K[hero.kit as keyof typeof LAW_HERO_BOX_K]?.h[1] ?? 0.4) * 2 * SC;
  hero.at = placeOff(at, [0.5, (sit ? 1.4 : 1.87) - tall, 0.75]);
  hero.yaw = 12; hero.spin = 8;
  const hasStake = /[\d$?]/.test(ht.replace(/\*/g, ""));
  const shot: LawShot = {
    at: 0, set: shotSet as LawShot["set"], jury: hit?.s.jury ?? false,
    cam: { preset: "hookZoom", target: placeOff(at, [0.3, sit ? 1.0 : 1.45, 0.45]), dist: 2.2, h: 0.12, az: 4, face: 0.6 },
    actors: [{ id, pose: sit ? "talk" : "point", face: "smug", at, sit: sit || undefined, pointAt: sit ? undefined : "hookProp", then: [{ at: 0.45, face: "shocked" }] }],
    props: [hero],
    fx: [{ fx: "shake", at: 0.45, gain: 0.6 }],
    caption: "off",
    note: `clip hook: ${ht.replace(/\*/g, "")}${stake ? ` / ${stake}` : ""}`,
  };
  // the stake on an exhibit tag under the hook card; the face sits a little lower so the tag never covers it
  if (stake && !hasStake) shot.actions = [{ do: "exhibit", at: 0, until: hookEnd, label: "AT STAKE", text: stake, on: "hookProp" }];
  if (shot.actors![0].sit === undefined) delete shot.actors![0].sit;
  if (shot.actors![0].pointAt === undefined) delete shot.actors![0].pointAt;
  return shot;
};

export const clipAdapter = {
  compile: (recipe: LawRecipe, words: readonly Word[], vo?: number) => compileLawK(recipe, words, vo),
  retimeShot, retimeRecipe, hookText, hookShot,
};
export { chunkWords as capChunkWords } from "../src/fin/lib/captions";

// cyber3d CLIP ADAPTER (tools/clip_short_kit.mjs): how tools/clip_short.mjs cuts a portrait Short out of a cyber3d
// recipe (usually a long-form landscape one). The kit knows its own time fields, its hook rule and its frame-0 gate:
//   retimeShot    every `At` of a shot: shot.at, cam.hit, BOLT from / then[].at, prop hit / then[].at / path times,
//                 actions at / until, boards at / until, fx at, sfx at. Places (`at` of a prop or BOLT, `to`, cam.to,
//                 route cities) are never touched.
//   retimeRecipe  the story devices (case file, money, countdown, alerts, checklist) and the global props that fall in
//                 the segment, re-timed; the rest are dropped
//   hookText      <= 5 words, <= 2 lines that fit the portrait hook card, exactly one *neon* word (the $ / number word)
//   hookShot      a fresh frame-0 shot that passes the kit's portrait gate and the frame-0 opener rules: the source's
//                 hero prop close-up, else the stake on a giant board over the hooded figure (or BOLT), else a document
//                 with the hook; a pose (face) change / shake at 0.45 s; cut at hookEnd
import type { At } from "../fin/recipe/types";
import { compileCyber, CYBER_CAMS, isCyberHero } from "./compile";
import { CYBER_HERO_BOX } from "./hero";
import type { CyberHeroKind } from "./hero";
import { hookBox } from "./hud";
import { LAYOUTS } from "./layout";
import type { Alert, BoltSpec, CaseFile, Checklist, Countdown, CyberProp, CyberRecipe, CyberShot, MoneyCounter } from "./types";

type Remap = (a: At | undefined, keepNeg?: boolean) => At | undefined;
type Seg = { tA: number; tB: number; off: number; end: number; end0: number; at: (a: At) => number };
type Obj = Record<string, unknown>;

const rt = (o: Obj | undefined, k: string, remap: Remap) => { if (o && o[k] !== undefined && o[k] !== null) o[k] = remap(o[k] as At); };
const rtProp = (p: CyberProp & { from?: unknown; until?: unknown }, remap: Remap, global = false) => {
  rt(p as Obj, "hit", remap);
  for (const x of p.then ?? []) rt(x as Obj, "at", remap);
  if (p.path) p.path = p.path.map(([t, pl]) => [remap(t) as At, pl]);
  // a GLOBAL prop's from/until are times; a route's from/to are cities (places): never times
  if (global) { rt(p as Obj, "from", remap); rt(p as Obj, "until", remap); }
};

/** the shots re-timed for the clip being made (retimeRecipe re-frames them when the source is landscape) */
let pending: CyberShot[] = [];
export const retimeShot = (s: CyberShot, remap: Remap) => {
  pending.push(s);
  rt(s as Obj, "at", remap);
  rt(s.cam as Obj, "hit", remap);
  for (const a of s.actors ?? []) { rt(a as Obj, "from", remap); for (const x of a.then ?? []) rt(x as Obj, "at", remap); }
  for (const p of s.props ?? []) rtProp(p, remap);
  for (const ac of s.actions ?? []) { rt(ac as Obj, "at", remap); rt(ac as Obj, "until", remap); }
  for (const b of s.boards ?? []) { rt(b as Obj, "at", remap); rt(b as Obj, "until", remap); }
  if (s.fx) s.fx = s.fx.map((f) => (typeof f === "string" ? f : f.at !== undefined ? { ...f, at: remap(f.at) as At } : f));
  for (const x of s.sfx ?? []) rt(x as Obj, "at", remap);
  return s;
};

/** the story devices and global props inside [tA, tB) of the source, re-timed (undefined = dropped from the clip) */
export const retimeRecipe = (r: CyberRecipe, remap: Remap, seg: Seg) => {
  const inSeg = (a: At) => { const t = seg.at(a); return t >= seg.tA - 1e-6 && t < seg.tB; };
  const dev = <T extends { at: At; until?: At }>(xs: T[] | undefined) => {
    const out = (xs ?? []).filter((x) => inSeg(x.at)).map((x) => { const y = JSON.parse(JSON.stringify(x)) as T; rt(y as Obj, "at", remap); rt(y as Obj, "until", remap); return y; });
    return out.length ? out : undefined;
  };
  let checklist: Checklist | undefined;
  if (r.checklist && inSeg(r.checklist.at)) {
    checklist = JSON.parse(JSON.stringify(r.checklist)) as Checklist;
    rt(checklist as Obj, "at", remap); rt(checklist as Obj, "until", remap);
    if (checklist.ticks) checklist.ticks = checklist.ticks.map((x) => remap(x) as At);
  }
  // a landscape source frames an email tile to fill a 16:9 frame; 9:16 shows about a third of that width, so a shot
  // aimed at an email tile pulls back (x2) in the clip (framing QA R3: the tile inside the frame)
  if (r.format === "landscape" || r.frame === "landscape") {
    for (const sh of pending) {
      const tg = typeof sh.cam.target === "string" ? sh.cam.target.split(".")[0] : "";
      if ((sh.props ?? []).some((p) => p.id === tg && p.kit === "email")) sh.cam.dist = Math.round((sh.cam.dist ?? CYBER_CAMS[sh.cam.preset].dist) * 2 * 100) / 100;
    }
  }
  pending = [];
  const props = (r.props ?? []).filter((p) => (p.from === undefined ? true : seg.at(p.from) < seg.tB) && (p.until === undefined ? true : seg.at(p.until) > seg.tA))
    .map((p) => { const q = JSON.parse(JSON.stringify(p)) as CyberProp & { from?: At; until?: At }; rtProp(q, remap, true); return q; });
  return {
    caseFile: dev<CaseFile>(r.caseFile), money: dev<MoneyCounter>(r.money), countdown: dev<Countdown>(r.countdown), alerts: dev<Alert>(r.alerts),
    checklist, props: props.length ? props : undefined,
  };
};

const P = LAYOUTS.portrait;
/** the kit's hook rule: <= 5 words, <= 2 lines inside the portrait card, exactly one *neon* word */
export const hookText = (text: string) => {
  let w = text.replace(/\*/g, "").replace(/\s+/g, " ").trim().toUpperCase().split(" ").filter(Boolean).slice(0, 5);
  if (!w.length) w = ["WATCH", "THIS"];
  while (w.length > 1 && hookBox(w.join(" "), P).textW > P.hook.maxW) w = w.slice(0, -1);
  const score = (x: string) => (/\$\s?\d/.test(x) ? 3 : /\d/.test(x) ? 2 : 0) + x.length / 100;
  const k = w.reduce((b, x, i) => (score(x) > score(w[b]) ? i : b), 0);
  return w.map((x, i) => (i === k ? `*${x}*` : x)).join(" ");
};

/** the fresh frame-0 shot (it passes the kit's portrait gate and the opener rules of tools/frame0_hero.mjs): the story's
 *  HERO PROP close-up in front of the inbox wall when the source has one (its first hero prop), else the stake on a
 *  GIANT board over the hooded figure (or BOLT) at frame 0, else a document carrying the hook; a pose / face change
 *  and a shake at 0.45 s; it cuts away at hookEnd */
export const hookShot = ({ recipe, first, src, hookText: ht, stake, set, hookEnd }: { recipe: CyberRecipe; first: CyberShot; src: CyberShot; hookText: string; stake: string | null; set?: string; hookEnd: number }): CyberShot => {
  // the first source shot now starts at hookEnd: a camera hit before it would be lost
  if (typeof first.cam.hit === "number" && first.cam.hit < hookEnd) first.cam.hit = Math.round((hookEnd + 0.12) * 1000) / 1000;
  const heroOf = (ps?: CyberProp[]) => (ps ?? []).find((p) => !!p.kit && isCyberHero(p.kit));
  const srcHero = heroOf(src.props) ?? recipe.shots.map((x) => heroOf(x.props)).find(Boolean) ?? heroOf(recipe.props);
  const plain = ht.replace(/\*/g, "");
  // the money in the hook's accent word is the stake ("THE *$100M* EMAIL"), else the stake word of line 1
  const acc = ht.match(/\*([^*]+)\*/)?.[1] ?? "";
  const stk = /[$€£]\d/.test(acc) ? acc : stake;
  const parts = stk ? stk.split(":").map((x) => x.trim()) : [];
  const giant = stk ? [{ title: parts.length > 1 && parts[0] ? parts[0] : "AT STAKE", at: 0, value: (parts.length > 1 ? parts.slice(1).join(":") : stk).toUpperCase(), size: "giant" as const, tone: "red" as const }] : undefined;
  const hero: CyberProp | null = srcHero && srcHero.kit ? { id: "hero0", kit: srcHero.kit, label: srcHero.label, lines: srcHero.lines, color: srcHero.color, at: "front", scale: 1, spin: 6 }
    : !stk ? { id: "hero0", kit: "doc", label: plain.slice(0, 40), at: "front" } : null;
  if (hero) {
    // sized and lifted so the prop's middle sits at 1.2 m and its height fills about half of the frame
    const k = hero.kit as CyberHeroKind, bx = CYBER_HERO_BOX[k], sc = Math.round(Math.min(1.4, 0.7 / (2 * bx.h[1]), 0.62 / (2 * bx.h[0])) * 100) / 100;
    hero.scale = sc;
    hero.at = `front:0,${Math.round((1.2 - bx.c[1] * sc) * 100) / 100},0`;
    return { at: 0, set: "inbox", note: `clip hook (clip_short): the ${k} close-up (a hero prop), a shake at 0.45 s`,
      cam: { preset: "hookZoom", target: "hero0", dist: 1.5, h: 0.08, az: 0, face: 0.5 }, props: [hero], fx: [{ fx: "shake", at: 0.45 }] };
  }
  const bolt = (src.actors ?? [])[0] as BoltSpec | undefined;
  if (bolt && !(src.props ?? []).some((p) => p.kit === "figure")) {
    return { at: 0, set: (set ?? src.set) as CyberShot["set"], note: "clip hook (clip_short): the stake on a giant board over BOLT, a face change at 0.45 s",
      cam: { preset: "hookZoom", target: `${bolt.id}.face`, dist: 2.6, face: 0.82 },
      actors: [{ id: bolt.id, pose: "shock", at: bolt.at, face: "worried", then: [{ at: 0.45, face: "shocked" }] }],
      boards: giant, fx: [{ fx: "shake", at: 0.45 }] };
  }
  const fig = (src.props ?? []).find((p) => p.kit === "figure");
  const yaw = fig ? fig.yaw ?? 0 : 180;
  return {
    at: 0, set: (fig ? set ?? src.set : "room") as CyberShot["set"], note: "clip hook (clip_short): the stake on a giant board over the hooded figure, a pose change at 0.45 s",
    cam: { preset: "hookZoom", target: "hk.head", dist: 2.6, h: 0.1, az: yaw + 75, face: 0.82 },
    props: [{ id: "hk", kit: "figure", at: fig ? fig.at : "seat", yaw, pose: "type", then: [{ at: 0.45, pose: "lean" }] }],
    boards: giant, fx: [{ fx: "shake", at: 0.45 }],
  };
};

export const clipAdapter = {
  compile: (r: CyberRecipe, words: Parameters<typeof compileCyber>[1], vo?: number) => compileCyber(r, words, vo),
  retimeShot, retimeRecipe, hookText, hookShot,
};

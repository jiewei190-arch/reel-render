// tech3d clip adapter (tools/clip_short.mjs -> tools/clip_short_kit.mjs): how a Short is cut out of a tech3d recipe
// (usually a landscape long-form one). The shared tool has already cut and re-timed the words; this file knows the
// kit's own time fields, its hook rule and its frame-0 card.
//   retimeShot      every `At` of a tech3d shot (places stay places: `at` / `to` on actors and props are PLACES)
//   retimeRecipe    the recipe-level props (from / until / hit / path keys)
//   hookText        <= 5 words, <= 2 lines of <= 14 characters, exactly one *orange* word, a question or a number
//   hookShot        a hookZoom on BOLT at 0 (shrug -> shock + shake at 0.45 s), an object in view, the stake board
import { HOVER } from "./bolt";
import { compileTech } from "./compile";
import { OBJECTS } from "./objects";
import { TECH_SETS } from "./sets";
import { hookLines } from "./hud";
import type { At, BoltSpec, Place, TechProp, TechRecipe, TechShot } from "./types";
import type { Word } from "../fin/recipe/types";

type Remap = (a: At | undefined, keepNeg?: boolean) => At | undefined;
type GProp = TechProp & { from?: At; until?: At; sets?: string[] };

const retimeProp = (p: TechProp, remap: Remap) => {
  if (p.hit !== undefined) p.hit = remap(p.hit) as At;
  // path keys keep negative times: the prop's motion before the clip still sets where it is at the clip's start
  if (p.path) p.path = p.path.map(([k, pl]) => [remap(k, true) as At, pl] as [At, Place]);
};

/** the hook rule of the kit's Shorts gate (tools/tech_build.mjs): a question word first, a "?" or a digit */
const Q = /\?|^(how|why|what|where|when|who|which)\b|\d/i;
const MAX_LINE = 14; // 100 px Poppins 800 in the 980 px hook card

export const clipAdapter = {
  compile: (recipe: TechRecipe, words: readonly Word[], vo?: number) => compileTech(recipe, words, vo),

  retimeShot: (s: TechShot, remap: Remap) => {
    s.at = remap(s.at) as At;
    if (s.cam.hit !== undefined) s.cam.hit = remap(s.cam.hit) as At;
    for (const a of s.actors ?? []) {
      if (a.from !== undefined) a.from = remap(a.from) as At;
      if (a.then) a.then = a.then.map((q) => ({ ...q, at: remap(q.at) as At }));
    }
    for (const p of s.props ?? []) retimeProp(p, remap);
    if (s.actions) s.actions = s.actions.map((ac) => ({ ...ac, at: remap(ac.at) as At, ...("until" in ac && ac.until !== undefined ? { until: remap(ac.until) as At } : {}) }));
    if (s.boards) s.boards = s.boards.map((b) => ({ ...b, at: remap(b.at) as At, ...(b.until !== undefined ? { until: remap(b.until) as At } : {}) }));
    if (s.fx) s.fx = s.fx.map((f) => (typeof f === "string" || f.at === undefined ? f : { ...f, at: remap(f.at) as At }));
    if (s.sfx) s.sfx = s.sfx.map((q) => ({ ...q, at: remap(q.at) as At }));
  },

  retimeRecipe: (recipe: TechRecipe, remap: Remap, seg: { tA: number; tB: number; off: number; end: number; at: (a: At | undefined, d?: number) => number }) => {
    const props = (recipe.props ?? [] as GProp[])
      .filter((p) => (p.until === undefined || seg.at(p.until) > seg.tA) && (p.from === undefined || seg.at(p.from) < seg.end))
      .map((p0) => {
        const p: GProp = JSON.parse(JSON.stringify(p0));
        if (p.from !== undefined) p.from = remap(p.from) as At;
        if (p.until !== undefined) p.until = remap(p.until) as At;
        retimeProp(p, remap);
        return p;
      });
    return props.length ? { props } : {};
  },

  hookText: (text: string) => {
    const orange0 = (/\*([^*]+)\*/.exec(text) ?? [])[1]?.trim().toUpperCase();
    let w = text.replace(/\*/g, "").toUpperCase().replace(/[^A-Z0-9$%°'?!,. -]/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 5);
    const fits = (ws: string[]) => hookLines(ws.join(" ")).every((l) => l.length <= MAX_LINE);
    while (w.length > 1 && !fits(w)) w = w.slice(0, -1);
    if (!Q.test(w.join(" "))) w[w.length - 1] = w[w.length - 1].replace(/[.,!]+$/, "") + "?";
    // exactly one orange word: the source's, if it survived, else the longest
    const bare = (x: string) => x.replace(/[?.,!]+$/, "");
    let k = orange0 ? w.findIndex((x) => bare(x) === orange0) : -1;
    if (k < 0) k = w.reduce((b, x, i) => (bare(x).length > bare(w[b]).length ? i : b), 0);
    const m = /^(.*?)([?.,!]*)$/.exec(w[k])!;
    w[k] = `*${m[1]}*${m[2]}`;
    return w.join(" ");
  },

  hookShot: ({ recipe, first, src, stake, set }: { recipe: TechRecipe; first: TechShot; src: TechShot; hookText: string; stake: string | null; set: string; hookEnd: number }): TechShot => {
    // BOLT: the source shot's, else the nearest shot in the same set that has BOLT in it (its place is valid in that set)
    let cur = recipe.shots[0].set ?? "studio";
    const sets = recipe.shots.map((s) => (cur = s.set ?? cur));
    const i0 = Math.max(0, recipe.shots.indexOf(src));
    const cand = recipe.shots.map((s, i) => ({ s, i })).filter((x) => sets[x.i] === set && (x.s.actors ?? []).length).sort((a, b) => Math.abs(a.i - i0) - Math.abs(b.i - i0) || b.i - a.i);
    const F = (src.actors ?? []).length ? src : cand[0]?.s;
    const objIn = (ps: TechProp[] | undefined) => (ps ?? []).filter((p) => p.obj).map((p) => { const q: TechProp = JSON.parse(JSON.stringify(p)); delete q.hit; if (q.motion !== "path" && q.motion !== "turntable") delete q.motion; return q; });
    const board = stake ? (() => { const [a, b] = stake.includes(":") ? stake.split(":").map((x) => x.trim()) : ["AT STAKE", stake]; return [{ title: a.split(/\s+/).slice(0, 3).join(" "), value: b, at: 0, pos: "top" as const }]; })() : [];
    const face = stake ? 0.62 : 0.47; // a stake board sits under the hook: BOLT's face goes lower in the frame
    const base = { at: 0, caption: "off", note: "clip_short hook card: BOLT close, the hook text, the stake by 0.5 s, shock at 0.45 s", fx: [{ fx: "shake" as const, at: 0.45, gain: 0.6 }], sfx: [{ at: 0.43, sfx: "impact", db: -4 }], boards: board };
    const actor = (a: BoltSpec, at: Place): BoltSpec => ({ id: a.id, pose: "shrug", face: "curious", at, then: [{ at: 0.45, pose: "shock", face: "shocked" }] });
    // the "what": the segment's cutaway object, scaled to ~1.5 m and set just behind BOLT, to one side, so frame 0 shows
    // BOLT close AND the thing the Short explains (the kit gate: BOLT >= 15 % and an object in view)
    const segObj = [src, first, ...recipe.shots.slice(i0)].flatMap((s) => s.props ?? []).find((p) => p.obj)?.obj ?? (recipe.props ?? []).find((p) => p.obj)?.obj ?? "smartphone";
    const hookObj = (floor: [number, number, number], azDeg: number): TechProp => {
      const def = OBJECTS[segObj] ?? OBJECTS.smartphone;
      const sc = Math.round((1.5 / (2 * Math.max(...def.half))) * 1000) / 1000;
      const az = (azDeg * Math.PI) / 180, back: [number, number] = [-Math.sin(az), -Math.cos(az)], side: [number, number] = [Math.cos(az), -Math.sin(az)];
      const y = floor[1] + HOVER - 0.15 - def.centre[1] * sc;
      const r3 = (v: number) => Math.round(v * 1000) / 1000;
      return { id: "hookObj", obj: segObj in OBJECTS ? segObj : "smartphone", at: [r3(floor[0] + 1.6 * back[0] + 0.75 * side[0]), r3(Math.max(0, y)), r3(floor[2] + 1.6 * back[1] + 0.75 * side[1])], yaw: Math.round(azDeg + 70), s: sc, motion: "turntable", spin: 20 };
    };
    const placeOf = (pl: Place, setId: string): [number, number, number] => {
      if (Array.isArray(pl)) return pl.length === 2 ? [pl[0], 0, pl[1]] : [pl[0], pl[1], pl[2]];
      const [nm, o] = pl.split(":");
      const a = TECH_SETS[setId as keyof typeof TECH_SETS].anchors[nm] ?? [0, 0, 0];
      const d = o ? o.split(",").map(Number) : [0, 0, 0];
      return [a[0] + d[0], a[1] + d[1], a[2] + d[2]];
    };
    if (F) {
      const A = F.actors![0];
      const az = typeof F.cam.target === "string" && F.cam.target.split(".")[0] === A.id ? F.cam.az ?? -15 : -15;
      const props = objIn(F.props).filter((p) => p.id !== "hookObj");
      return { ...base, set: set as TechShot["set"], ...(first.mood ?? F.mood ? { mood: first.mood ?? F.mood } : {}), cam: { preset: "hookZoom", target: A.id, az, dist: 2.0, face }, actors: [actor(A, A.at)], props: [...props, hookObj(placeOf(A.at, set), az)] };
    }
    // no BOLT in this set: the studio, BOLT front and centre, the segment's object behind it
    const id = Object.keys(recipe.cast)[0];
    return { ...base, set: "studio", cam: { preset: "hookZoom", target: id, az: -15, dist: 2.0, face }, actors: [actor({ id, pose: "shrug", at: "front" }, "front")], props: [hookObj(placeOf("front", "studio"), -15)] };
  },
};

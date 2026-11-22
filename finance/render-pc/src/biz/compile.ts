// The biz3d recipe compiler: BizRecipe + voice words -> shots with lenses, executive tracks, world state (stores lit or
// dark, cracks, drains, the chart draw, papers), label / tag / device layouts, the freeze-frame clock, the audio cue
// plan and the QA/gate data. A pure function of t, separate from the Block Money and tech3d compilers.
// All screen numbers come from layout.ts. "format": "landscape" (1920x1080 long-form, LONGFORM.md) adds the shared 16:9
// lens rule, caption-safe framing for the lower third, chapters (+ their cues) and a per-shot lower-third caption centre;
// every portrait path is unchanged.
import type { V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import { kickAt, kicked, pushK, whipK } from "../fin/lib/camera";
import type { Cam } from "../fin/lib/camera";
import { EASE_INOUT, EASE_OUT, EASE_PLACE, LEAD, prog } from "../fin/lib/motion";
import { makeAt } from "../fin/recipe/timing";
import { chapterCues, landscapeLens, LF, liftNeeded, lowerThirdY, resolveChapters } from "../longform/kit";
import type { ChapterR, FaceBand } from "../longform/kit";
import type { Word } from "../fin/recipe/types";
import { chartGeo } from "./chart";
import type { ChartGeo } from "./chart";
import { execBoxes, execChest, execHead, execState } from "./exec";
import type { ExecLook, ExecPose, ExecState, ExecTrack } from "./exec";
import { layoutOf } from "./layout";
import type { BizLayout, Rect } from "./layout";
import { SUITS } from "./palette";
import { heroLabelError } from "../library/hero";
import { BIZ_HERO_KINDS } from "./hero";
import { propBox, propCentre } from "./props";
import type { Placement, PropState } from "./props";
import { BIZ_SETS, PAPER_N, STORE_N, storeX } from "./sets";
import type { BizSet, BizSetId, WorldCtx } from "./sets";
import type { At, BizCam, BizDevice, BizProp, BizRecipe, BizShot, BizTarget, ExecSpec, Place, Tone } from "./types";

export const FPS = 30;
const D2R = Math.PI / 180;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const isV3 = (x: unknown): x is V3 => Array.isArray(x) && x.length === 3;
const easeOut3 = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const yawTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export type Box = { name: string; c: V3; h: V3 };
export type Lens = { a: number; b: number; subj: (t: number) => V3; off: V3; fov: (t: number) => number; face: number; push: number; roll: [number, number]; blur: number; posAt?: (t: number) => V3; rollAt?: (t: number) => number };
export type PropR = { key: string; spec: BizProp; a: number; b: number; hit: number; place: (t: number) => Placement; show: (t: number) => number; seed: number };
export type LabelR = { key: string; text: string; t0: number; t1: number; side: "left" | "right" | "auto"; tone: Tone; target: (t: number) => V3 };
export type DeviceR = { key: string; spec: BizDevice; t0: number; t1: number };
export type FxR = { fx: "shake" | "flash" | "debris"; at: number; p: (t: number) => V3; gain: number };
export type BizShotR = { id: string; a: number; b: number; set: BizSetId; spec: BizShot; lens: Lens; kicks: [number, number][]; execs: ExecTrack[]; props: PropR[]; labels: LabelR[]; devices: DeviceR[]; fx: FxR[]; paper: (i: number, t: number) => number };
export type Cue = { t: number; sfx: string; db?: number };
export type LabelBox = { key: string; text: string; tone: Tone; ax: number; ay: number; x: number; y: number; w: number; h: number; u: number; line: number };
export type TagBox = { key: string; text: string; x: number; y: number; w: number; h: number; u: number; tone: Tone };
/** a device on screen: kind, its rect, the in/out envelope u, the local time since it popped, and its computed text */
export type DeviceBox = Rect & { key: string; kind: BizDevice["do"]; spec: BizDevice; u: number; tau: number; value?: string; frac?: number; tone: Tone };

export type BizCompiled = {
  recipe: BizRecipe; slug: string; layout: BizLayout; duration: number; shots: BizShotR[]; words: readonly Word[]; chart?: ChartGeo;
  at: (a: At | undefined, d?: number) => number; hookUntil: number; hookAgain: number | null;
  shotAt: (t: number) => BizShotR;
  /** the world clock: equals t, except during a freeze-frame (THE DECISION), where it holds */
  sceneT: (t: number) => number;
  freezeAt: (t: number) => number;
  camAt: (t: number) => Cam;
  execsAt: (t: number) => ExecState[];
  placeOf: (p: PropR, t: number) => Placement;
  propState: (key: string, t: number) => PropState;
  world: (t: number) => WorldCtx;
  labelsAt: (t: number) => LabelBox[];
  tagsAt: (t: number) => TagBox[];
  devicesAt: (t: number) => DeviceBox[];
  qa: (t: number) => { execs: Box[]; props: Box[] };
  textsAt: (t: number) => string[];
  project: (cam: Cam, p: V3) => { x: number; y: number; k: number; z: number } | null;
  audio: { music: string; cues: Cue[] };
  /** "format": "landscape" (1920x1080 long-form) */
  landscape: boolean;
  /** landscape: chapters resolved to seconds ([] in portrait) */
  chapters: ChapterR[];
  /** landscape: the lower-third caption centre of a shot, px at 1080 tall (LF.CAP_Y unless a face sits in the band) */
  capY: (shot: BizShotR) => number;
  /** landscape: caption-safe framing, the shots whose subject was lifted (lens face fraction from -> to) */
  lifted: { id: string; from: number; to: number }[];
};

/** camera presets, authored for portrait (landscape applies landscapeLens per preset); every one keeps moving */
export const BIZ_CAMS = {
  hookZoom: { dist: 2.2, h: 0.1, fov: 40, face: 0.45, push: 0.05, blur: 1.6, roll: [-2, 0.5] as [number, number] },
  closeUp: { dist: 1.6, h: 0.05, fov: 38, face: 0.44, push: 0.06, blur: 1.8, roll: [0, 1.2] as [number, number] },
  medium: { dist: 3.4, h: 0.3, fov: 42, face: 0.45, push: 0.05, blur: 1.2, roll: [0, 1] as [number, number] },
  wide: { dist: 9.0, h: 2.6, fov: 48, face: 0.5, push: 0.03, blur: 0.6, roll: [0, 0.6] as [number, number] },
  slamZoom: { dist: 2.6, h: 0.2, fov: 42, face: 0.45, push: 0.05, blur: 1.3, roll: [0, 1.5] as [number, number] },
  pushIn: { dist: 3.2, h: 0.35, fov: 42, face: 0.45, push: 0, blur: 1.2, roll: [0, 1] as [number, number] },
  whip: { dist: 3.2, h: 0.3, fov: 46, face: 0.46, push: 0.05, blur: 1.0, roll: [4, 0] as [number, number] },
  orbit: { dist: 4.5, h: 1.0, fov: 42, face: 0.47, push: 0.02, blur: 1.0, roll: [0, 0] as [number, number] },
  dolly: { dist: 4.0, h: 0.6, fov: 42, face: 0.46, push: 0.01, blur: 1.1, roll: [0, 0] as [number, number] },
  crane: { dist: 6.0, h: 0.5, fov: 44, face: 0.48, push: 0, blur: 0.8, roll: [0, 0] as [number, number] },
  chartFly: { dist: 7.0, h: 2.2, fov: 50, face: 0.5, push: 0, blur: 0.4, roll: [0, 0] as [number, number] },
};

// ------------------------------------------------------------------ projection
export const projectIn = (L: BizLayout) => (cam: Cam, p: V3): { x: number; y: number; k: number; z: number } | null => {
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const nrm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = nrm(sub(cam.look, cam.pos));
  const r0 = nrm(cross(f, [0, 1, 0])), u0 = cross(r0, f);
  const ra = ((cam.roll ?? 0) * Math.PI) / 180;
  const r: V3 = [r0[0] * Math.cos(ra) + u0[0] * Math.sin(ra), r0[1] * Math.cos(ra) + u0[1] * Math.sin(ra), r0[2] * Math.cos(ra) + u0[2] * Math.sin(ra)];
  const u = cross(r, f);
  const d = sub(p, cam.pos), z = dot(d, f);
  if (z <= 0.05) return null;
  const k = L.H / 2 / Math.tan((cam.fov * Math.PI) / 360);
  return { x: L.W / 2 + (dot(d, r) / z) * k, y: L.H / 2 - (dot(d, u) / z) * k, k: k / z, z };
};
export const labelSize = (L: BizLayout, text: string) => ({ w: Math.round(text.length * 0.66 * L.label.fs + 64), h: Math.round(L.label.fs * 1.15 + 34) });
const rectsHit = (a: Rect, b: Rect, m = 14) => Math.abs(a.x - b.x) * 2 < a.w + b.w + 2 * m && Math.abs(a.y - b.y) * 2 < a.h + b.h + 2 * m;
export const resolveLook = (l: string | ExecLook, id: string): ExecLook => {
  if (typeof l !== "string") return l;
  const s = SUITS[l];
  if (!s) throw new Error(`recipe: cast "${id}" look "${l}" is not a suit preset (has: ${Object.keys(SUITS).join(", ")}) or a look object`);
  return { ...s };
};
/** the compact money format the devices use: $50M, $1.46B, $250B */
export const money = (v: number, prefix = "$") => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  const f = (x: number, u: string) => `${s}${prefix}${x >= 100 ? Math.round(x) : x >= 10 ? (Math.round(x * 10) / 10).toString() : (Math.round(x * 100) / 100).toString()}${u}`;
  if (a >= 1e12) return f(a / 1e12, "T");
  if (a >= 1e9) return f(a / 1e9, "B");
  if (a >= 1e6) return f(a / 1e6, "M");
  if (a >= 1e3) return f(a / 1e3, "K");
  return `${s}${prefix}${Math.round(a)}`;
};

// ------------------------------------------------------------------ the compiler
export const compileBiz = (recipe: BizRecipe, words: readonly Word[], voDuration?: number): BizCompiled => {
  if (recipe.kit !== "biz3d") throw new Error(`recipe ${recipe.slug}: kit must be "biz3d"`);
  const L = layoutOf(recipe.format);
  const LS = L.id === "landscape";
  if (recipe.chapters && !LS) throw new Error(`recipe ${recipe.slug}: "chapters" need "format": "landscape"`);
  const project = projectIn(L);
  const { at, lineEnd } = makeAt(words);
  const durS = recipe.duration ?? voDuration ?? Math.max(...words.map((w) => w.end)) + 0.8;
  const duration = Math.round(durS * FPS);
  const end = duration / FPS;
  const looks: Record<string, ExecLook> = Object.fromEntries(Object.entries(recipe.cast).map(([id, l]) => [id, resolveLook(l, id)]));
  const castIds = Object.keys(looks);
  const chart = recipe.chart ? chartGeo(recipe.chart) : undefined;
  const starts = recipe.shots.map((s) => at(s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1]) throw new Error(`recipe: shot ${i + 1} starts at ${a.toFixed(2)} s, not after shot ${i} (${starts[i - 1].toFixed(2)} s)`); });
  if (Math.abs(starts[0]) > 1e-6) throw new Error("recipe: the first shot must start at 0");
  const hookUntil = recipe.hook.until !== undefined ? at(recipe.hook.until) : lineEnd(1) + 0.25;
  const hookAgain = recipe.hook.again !== undefined ? at(recipe.hook.again) : null;

  // ---------------------------------------------------- freeze-frames (THE DECISION): the world clock holds
  const freezes: [number, number][] = [];
  for (const sp of recipe.shots) for (const d of sp.devices ?? []) if (d.do === "decision" && d.freeze !== false) { const t0 = at(d.at); freezes.push([t0, at(d.until, t0 + 1.6)]); }
  const sceneT = (t: number) => { for (const [a, b] of freezes) if (t >= a && t < b) return a; return t; };
  const freezeAt = (t: number) => { for (const [a, b] of freezes) if (t >= a && t < b) return EASE_OUT(prog(t, a, a + 0.12)) * clamp((b - t) / 0.12); return 0; };

  // ---------------------------------------------------- world timelines (across shots)
  const crackTL = new Map<string, { t0: number; dur: number; col: number | null }>();
  const drainTL = new Map<string, { t0: number; dur: number; to: number }[]>();
  const storeTL: { t0: number; on: boolean; delay: (i: number) => number; keep: number[] }[] = [];
  const drawTL: { t0: number; to: number; dur: number }[] = [];
  const flyDraw: { a: number; b: number; s: (t: number) => number }[] = [];

  let curSet: BizSetId = recipe.shots[0].set ?? "boardroom";
  const shots: BizShotR[] = [];
  const globalProps = (recipe.props ?? []).map((p) => ({ p, a: at(p.from, 0), b: at(p.until, end + 1) }));
  const chartAnchors = (): Record<string, V3> => {
    if (!chart) return {};
    let pk = 0;
    chart.pts.forEach((p, i) => { if (p[1] > chart.pts[pk][1]) pk = i; });
    return { start: chart.pts[0], peak: chart.pts[pk], end: chart.pts[chart.n - 1], mid: chart.at((chart.n - 1) / 2) };
  };
  const anchorsOf = (set: BizSet) => (set.id === "chart" ? { ...set.anchors, ...chartAnchors() } : set.anchors);
  const placeV = (pl: Place, set: BizSet, sid: string): V3 => {
    if (Array.isArray(pl)) return pl.length === 2 ? [pl[0], 0, pl[1]] : (pl as V3);
    const [name, off] = pl.split(":");
    const an = anchorsOf(set);
    const a = an[name];
    if (!a) throw new Error(`recipe ${sid}: no anchor "${name}" in set ${set.id} (has: ${Object.keys(an).join(", ")})`);
    const o: V3 = off ? (off.split(",").map(Number) as V3) : [0, 0, 0];
    return add(a, o);
  };

  recipe.shots.forEach((sp, i) => {
    curSet = sp.set ?? curSet;
    const set = BIZ_SETS[curSet];
    if (!set) throw new Error(`recipe: no set "${curSet}" (has: ${Object.keys(BIZ_SETS).join(", ")})`);
    if (curSet === "chart" && !chart) throw new Error(`recipe S${i + 1}: the chart set needs recipe.chart ({ "pts": [...] })`);
    const a = starts[i], b = i + 1 < starts.length ? starts[i + 1] : end;
    const id = `S${String(i + 1).padStart(2, "0")}`;
    // ---- props
    const props: PropR[] = [];
    const addProp = (spec: BizProp, pa: number, pb: number) => {
      const KITS = ["tower", "boxes", "cash", "disc", "envelope", "block", ...BIZ_HERO_KINDS];
      if (!spec.kit || !KITS.includes(spec.kit)) throw new Error(`recipe ${id}: prop "${spec.id}" needs "kit": one of ${KITS.join(", ")}${spec.kit ? ` (got "${spec.kit}")` : ""}`);
      const lerr = heroLabelError(spec.label, spec.kit);
      if (lerr) throw new Error(`recipe ${id}: prop "${spec.id}": ${lerr}`);
      if (spec.lines && (spec.lines.length > 7 || spec.lines.some((l) => typeof l !== "string" || l.length > 40))) throw new Error(`recipe ${id}: prop "${spec.id}": "lines" takes up to 7 strings of <= 40 characters`);
      const base = placeV(spec.at, set, id);
      const hit = at(spec.hit, a + 0.12);
      const s0 = spec.scale ?? spec.s ?? 1;
      const place = (t: number): Placement => {
        let p = base, yaw = (spec.yaw ?? 0) * D2R, s = s0;
        // a prop with "spin" and no motion turns slowly on the spot (the product showcase), from its first frame in
        // the shot, so its front (the label) faces "yaw" when the shot starts
        if (!spec.motion && spec.spin !== undefined) yaw += spec.spin * D2R * (t - pa);
        switch (spec.motion) {
          case "turntable": yaw += (spec.spin ?? 12) * D2R * t; break;
          case "bob": p = add(p, [0, 0.05 * Math.sin(t * 2.2), 0]); yaw += 0.08 * Math.sin(t * 0.9); break;
          case "popIn": s = s0 * (t < hit - 0.3 ? 0.001 : Math.max(0.001, EASE_PLACE(prog(t, hit - 0.3, hit)))); yaw += 0.1 * Math.sin(t * 1.1); break;
          case "dropIn": { const H = 2.2, u = clamp((t - (hit - 0.4)) / 0.4); p = add(p, [0, t < hit ? H * (1 - u * u) : 0.06 * Math.abs(Math.sin((t - hit) * 16)) * Math.exp(-(t - hit) * 6), 0]); break; }
        }
        return { p, yaw, s };
      };
      props.push({ key: spec.id, spec, a: pa, b: pb, hit, place, show: (t) => (spec.motion === "popIn" ? clamp((t - hit + 0.3) / 0.05) : 1), seed: 7 + spec.id.length * 13 + spec.id.charCodeAt(0) });
    };
    (sp.props ?? []).forEach((ps) => addProp(ps, a, b));
    globalProps.filter((g) => g.a < b && g.b > a && (!g.p.sets || g.p.sets.includes(curSet)) && !(sp.props ?? []).some((q) => q.id === g.p.id)).forEach((g) => addProp(g.p, Math.max(a, g.a), Math.min(b, g.b)));

    // ---- targets
    const execs: ExecTrack[] = [];
    const states = new Map<string, (t: number) => ExecState>();
    const targetFn = (tg: BizTarget): ((t: number) => V3) => {
      if (isV3(tg)) return () => tg;
      const [name, part] = tg.split(".");
      if (castIds.includes(name)) {
        return (t) => {
          const f = states.get(name);
          if (!f) throw new Error(`recipe ${id}: target "${tg}" but ${name} is not in this shot`);
          const st = f(sceneT(t));
          return part === "head" ? execHead(st).c : execChest(st);
        };
      }
      const pr = props.find((p) => p.key === name);
      if (pr) return (t) => propCentre(pr.spec, pr.place(sceneT(t)));
      if (tg === "chart" && chart) return () => { const c = chart.at((chart.n - 1) / 2); return [c[0], c[1] * 0.6, 0]; };
      const m = /^(chart|store):(-?[\d.]+)$/.exec(tg);
      if (m && m[1] === "chart" && chart) { const s = parseFloat(m[2]); return () => chart.at(s); }
      if (m && m[1] === "store") { const k = parseInt(m[2], 10); if (k < 0 || k >= STORE_N) throw new Error(`recipe ${id}: no store ${k} (0-${STORE_N - 1})`); return () => [storeX(k), 1.0, -2.2]; }
      const [an, off] = tg.split(":");
      const anchors = anchorsOf(set);
      if (anchors[an]) { const o = off ? (off.split(",").map(Number) as V3) : [0, 0, 0]; return () => add(anchors[an], o as V3); }
      throw new Error(`recipe ${id}: no target "${tg}" (cast: ${castIds.join(", ")}; props: ${props.map((p) => p.key).join(", ") || "none"}; anchors: ${Object.keys(anchors).join(", ")}${chart ? "; chart, chart:<i>" : ""}; store:<0-8>)`);
    };

    // ---- lens
    const c: BizCam = sp.cam;
    const P = BIZ_CAMS[c.preset];
    if (!P) throw new Error(`recipe ${id}: no camera preset "${c.preset}" (has: ${Object.keys(BIZ_CAMS).join(", ")})`);
    if (c.preset === "chartFly" && curSet !== "chart") throw new Error(`recipe ${id}: chartFly needs the chart set`);
    const camTarget = c.target ?? (c.preset === "chartFly" ? "chart" : "centre");
    let lensPos0: V3 = [0, 1.5, 6];
    for (const es of sp.actors ?? []) {
      if (!looks[es.id]) throw new Error(`recipe ${id}: actor "${es.id}" is not in cast`);
      execs.push(execTrack(es, a, b, set, id, at, placeV, targetFn, () => lensPos0, looks[es.id], recipe, words, c));
    }
    execs.forEach((tr) => states.set(tr.id, (t) => execState(tr, t)));
    const subj = targetFn(camTarget);
    const s0 = subj(a);
    // landscape: the shared 16:9 lens rule (keep the vertical fov; wider presets narrow it, `wide`-class come in a little)
    const [fk, dk] = LS ? landscapeLens(c.preset) : [1, 1];
    const az = (c.az ?? 0) * D2R, dist = LS ? c.dist ?? P.dist * dk : c.dist ?? P.dist, h = c.h ?? P.h;
    const off: V3 = [Math.sin(az) * dist, h, Math.cos(az) * dist];
    lensPos0 = add(s0, off);
    const hit = at(c.hit, a + 0.12);
    const fov0 = LS ? (c.fov ?? P.fov) * fk : c.fov ?? P.fov;
    let lens: Lens = { a, b, subj, off, fov: () => fov0, face: c.face ?? P.face, push: P.push, roll: c.roll ?? P.roll, blur: c.blur ?? P.blur };
    const span = (t: number) => clamp((t - a) / Math.max(0.3, b - a));
    switch (c.preset) {
      case "slamZoom": {
        const wide = LS ? 60 * fk : 60;
        lens.fov = (t) => (t < hit - 0.2 ? wide : t < hit ? wide + 1.8 * Math.sin((Math.PI * (t - hit + 0.2)) / 0.2) : lerp(wide, fov0, easeOut3((t - hit) / 0.12)) - 1.5 * clamp((t - hit - 0.12) / 2));
        break;
      }
      case "hookZoom": {
        const far: V3 = [off[0] * 1.3, off[1] * 1.15, off[2] * 1.3];
        lens.posAt = (t) => { const u = easeOut3((t - a) / 0.4); const q = lerpV(far, off, u); const k = 1 - P.push * Math.max(0, t - a - 0.4); return add(subj(t), [q[0] * k, q[1] * k, q[2] * k]); };
        break;
      }
      case "pushIn": lens.posAt = (t) => { const k = pushK(t, a, 0.003, 0.006, 35); return add(subj(t), [off[0] * k, off[1] * k, off[2] * k]); }; break;
      case "whip": { const s1 = subj; lens = { ...lens, posAt: (t) => add(s1(t), off), subj: (t) => { const q = s1(t), pp = add(q, off); return add(pp, rotY(sub(q, pp), 35 * D2R * whipK(t, a))); } }; break; }
      case "orbit": { const sw = (c.sweep ?? 40) * D2R; lens.posAt = (t) => add(subj(t), rotY(off, lerp(-sw / 2, sw / 2, EASE_INOUT(span(t))))); break; }
      case "dolly": {
        // a lateral track past the subject: parallax on everything in between
        const tr = c.sweep ?? 2.4, right = rotY([1, 0, 0], az);
        lens.posAt = (t) => { const d = lerp(-tr / 2, tr / 2, EASE_INOUT(span(t))); return add(add(subj(t), off), [right[0] * d, 0, right[2] * d]); };
        break;
      }
      case "crane": {
        // rises and pulls back, tilting down onto the subject
        lens.posAt = (t) => { const u = EASE_INOUT(span(t)); return add(subj(t), [off[0] * (1 + 0.25 * u), off[1] + 3.2 * u, off[2] * (1 + 0.25 * u)]); };
        break;
      }
      case "chartFly": {
        // THE SIGNATURE SHOT: ride along the chart line. The lens sits behind and beside the line point s(t) and looks
        // ahead along it, so a climb lifts the camera and a crash is a dive. The draw stays ahead of the lens.
        const g = chart!;
        const s0i = c.from ?? 0, s1i = c.to ?? g.n - 1, T = c.dur ?? b - a;
        const sAt = (t: number) => lerp(s0i, s1i, EASE_INOUT(clamp((t - a) / T)));
        const az2 = (c.az ?? 38) * D2R;
        const back = dist * Math.cos(az2), side = dist * Math.sin(az2);
        const smoothY = (s: number) => (g.at(s - 0.5)[1] + 2 * g.at(s)[1] + g.at(s + 0.5)[1]) / 4;
        lens.posAt = (t) => { const s = sAt(t), p = g.at(s); return [p[0] - back, smoothY(s) + h, p[2] + side]; };
        lens.subj = (t) => { const s = sAt(t); const q = g.at(s + 1.1); return [q[0], lerp(q[1], smoothY(s + 1.1), 0.5), 0]; };
        lens.rollAt = (t) => { const s = sAt(t), d = g.at(s + 0.6)[1] - g.at(s - 0.6)[1]; return clamp(-d * 2.2, -9, 9); };
        lens.fov = (t) => fov0 + 6 * Math.sin(Math.PI * clamp((t - a) / T));
        flyDraw.push({ a, b, s: (t) => sAt(t) + 1.9 });
        break;
      }
    }
    // ---- transitions: punch (default), whip, cut
    const tin = i === 0 ? "cut" : sp.in ?? (c.preset === "slamZoom" || c.preset === "whip" || c.preset === "chartFly" ? "cut" : "punch");
    const kicks: [number, number][] = [];
    if (c.preset === "slamZoom") kicks.push([hit, 1.2]);
    if (c.preset === "hookZoom") kicks.push([a + 0.38, 0.7]);
    if (tin === "punch") { const f0 = lens.fov; lens = { ...lens, fov: (t) => f0(t) + (LS ? 7 * fk : 7) * (1 - easeOut3((t - a) / 0.14)) }; kicks.push([a, 0.5]); }
    if (tin === "whip") {
      const s1 = lens.subj, p1 = lens.posAt ?? ((t: number) => add(s1(t), off));
      lens = { ...lens, posAt: p1, subj: (t) => { const q = s1(t), pp = p1(t); return add(pp, rotY(sub(q, pp), 32 * D2R * whipK(t, a))); } };
    }

    // ---- actions
    const labels: LabelR[] = [];
    let paperSlam: { t0: number; stagger: number } | null = null;
    for (const ac of sp.actions ?? []) {
      const t0 = at(ac.at);
      switch (ac.do) {
        case "crack": {
          const pr = props.find((p) => p.key === ac.on);
          if (!pr || pr.spec.kit !== "tower") throw new Error(`recipe ${id}: crack on "${ac.on}": no tower prop with that id in this shot`);
          crackTL.set(ac.on, { t0, dur: ac.dur ?? 0.9, col: ac.collapse !== undefined ? at(ac.collapse) : null });
          kicks.push([t0 + 0.05, 0.9]);
          if (ac.collapse !== undefined) kicks.push([at(ac.collapse) + 0.05, 1.4]);
          break;
        }
        case "dark": case "lit": {
          if (curSet !== "city") throw new Error(`recipe ${id}: "${ac.do}" on stores needs the city set`);
          const st = ac.stagger ?? 0.12, order = ac.order ?? "shuffle";
          const rank = Array.from({ length: STORE_N }, (_, k) => k).sort((x, y) => (order === "left" ? x - y : order === "right" ? y - x : hash(x + 3) - hash(y + 3)));
          storeTL.push({ t0, on: ac.do === "lit", delay: (k) => rank.indexOf(k) * st, keep: ac.keep ?? [] });
          break;
        }
        case "drain": {
          const pr = props.find((p) => p.key === ac.on);
          if (!pr || pr.spec.kit !== "cash") throw new Error(`recipe ${id}: drain on "${ac.on}": no cash prop with that id in this shot`);
          const l = drainTL.get(ac.on) ?? []; l.push({ t0, dur: ac.dur ?? 1.2, to: ac.to ?? 1 }); drainTL.set(ac.on, l);
          break;
        }
        case "draw": if (!chart) throw new Error(`recipe ${id}: draw needs recipe.chart`); drawTL.push({ t0, to: ac.to ?? chart.n - 1, dur: ac.dur ?? 1.5 }); break;
        case "slam": paperSlam = { t0, stagger: ac.stagger ?? 0.05 }; break;
        case "label": {
          const text = ac.text.toUpperCase();
          if (text.trim().split(/\s+/).length > 3) throw new Error(`recipe ${id}: label "${text}" has more than 3 words`);
          labels.push({ key: `${id}.${ac.on}.${labels.length}`, text, t0, t1: at(ac.until, b), side: ac.side ?? "auto", tone: ac.tone ?? "ink", target: targetFn(ac.on) });
          break;
        }
        default: throw new Error(`recipe ${id}: unknown action ${JSON.stringify(ac)}`);
      }
    }
    const order = Array.from({ length: PAPER_N - 1 }, (_, k) => k).sort((x, y) => hash(x + 11) - hash(y + 11));
    const ps = paperSlam;
    const paper = (k: number, t: number) => {
      if (!ps) return 1;
      const r = k >= PAPER_N - 1 ? PAPER_N - 1 + 3 : order.indexOf(k);
      return EASE_PLACE(prog(t, ps.t0 + r * ps.stagger, ps.t0 + r * ps.stagger + 0.32));
    };
    // ---- devices
    const devices: DeviceR[] = (sp.devices ?? []).map((d, k) => {
      const t0 = at(d.at);
      const dflt = d.do === "decision" ? t0 + 1.6 : d.do === "stamp" ? t0 + 1.4 : b;
      if (d.do === "board" && d.title.trim().split(/\s+/).length > 3) throw new Error(`recipe ${id}: board title "${d.title}" has more than 3 words`);
      return { key: `${id}.dev${k}`, spec: d, t0, t1: Math.min(at(d.until, dflt), end) };
    });
    for (const d of devices) { if (d.spec.do === "decision" || d.spec.do === "stamp") kicks.push([d.t0, 1.1]); }
    const fx: FxR[] = (sp.fx ?? []).map((f) => { const o = typeof f === "string" ? { fx: f } : f; return { fx: o.fx, at: at(o.at, hit), p: targetFn(o.p ?? camTarget), gain: o.gain ?? 1 }; });
    fx.filter((f) => f.fx === "shake").forEach((f) => kicks.push([f.at, 1.3 * f.gain]));
    props.filter((p) => p.spec.motion === "dropIn").forEach((p) => kicks.push([p.hit, 0.8]));
    shots.push({ id, a, b, set: curSet, spec: sp, lens, kicks, execs, props, labels, devices, fx, paper });
  });

  // ---------------------------------------------------- world state
  const propState = (key: string, t: number): PropState => {
    const cr = crackTL.get(key);
    const crack = cr ? clamp((t - cr.t0) / cr.dur) : 0;
    const collapse = cr && cr.col !== null ? EASE_INOUT(clamp((t - cr.col) / 1.0)) : 0;
    let drain = 0;
    for (const d of (drainTL.get(key) ?? []).slice().sort((x, y) => x.t0 - y.t0)) drain = lerp(drain, d.to, EASE_INOUT(clamp((t - d.t0) / d.dur)));
    return { crack, collapse, drain };
  };
  const storeOn = (k: number, t: number) => {
    let v = 1;
    for (const e of storeTL.slice().sort((x, y) => x.t0 - y.t0)) {
      if (e.keep.includes(k)) continue;
      const s = e.t0 + e.delay(k);
      if (t < s) break;
      if (e.on) v = Math.max(v, clamp((t - s) / 0.15));
      else v = t < s + 0.22 ? (Math.sin((t - s) * 95) > 0 ? 0.85 : 0.1) : 0;
    }
    return v;
  };
  const chartDraw = (t: number) => {
    if (!chart) return 0;
    let v = drawTL.length ? 0 : chart.n - 1;
    for (const d of drawTL.slice().sort((x, y) => x.t0 - y.t0)) if (t >= d.t0) v = lerp(v, d.to, EASE_INOUT(clamp((t - d.t0) / d.dur)));
    for (const f of flyDraw) if (t >= f.a && t < f.b) v = Math.max(v, f.s(t));
    return clamp(v, 0, chart.n - 1);
  };

  // ---------------------------------------------------- per-time helpers
  // binary search (long-form has hundreds of shots): the last shot with a - 1e-9 <= t, else the first
  const shotAt = (t: number) => {
    let lo = 0, hi = shots.length - 1, k = 0;
    while (lo <= hi) { const mid = (lo + hi) >> 1; if (t >= shots[mid].a - 1e-9) { k = mid; lo = mid + 1; } else hi = mid - 1; }
    return shots[k];
  };
  const camOf = (Ls: Lens, t: number): Cam => {
    const tau = Math.max(0, t - Ls.a);
    const subj = Ls.subj(t);
    const k = 1 - Ls.push * tau;
    let pos: V3 = Ls.posAt ? Ls.posAt(t) : add(subj, [Ls.off[0] * k, Ls.off[1] * k, Ls.off[2] * k]);
    // freeze-frame: the world holds but the lens keeps creeping in (no frame is ever still)
    let fr = 0;
    for (const [fa, fb] of freezes) if (t >= fa && t < fb) fr = EASE_INOUT(clamp((t - fa) / (fb - fa)));
    if (fr > 0) pos = lerpV(pos, subj, 0.1 * fr);
    const cam = aim(pos, subj, Ls.fov(t), Ls.face);
    const roll = lerp(Ls.roll[0], Ls.roll[1], clamp(tau / Math.max(0.01, Ls.b - Ls.a))) + (Ls.rollAt ? Ls.rollAt(t) : 0) + 2 * fr;
    return { ...cam, roll };
  };
  const camAt = (t: number) => { const s = shotAt(t); return kicked(camOf(s.lens, t), kickAt(t, s.kicks)); };
  const execsAt = (t: number) => { const ts = sceneT(t); return shotAt(t).execs.map((e) => execState(e, ts)); };
  const placeOf = (p: PropR, t: number) => p.place(sceneT(t));
  const world = (t: number): WorldCtx => {
    const ts = sceneT(t), s = shotAt(t);
    return { storeOn: (k) => storeOn(k, ts), chart, chartDraw: chartDraw(ts), paper: (k) => s.paper(k, ts), headline: s.spec.headline };
  };
  const qa = (t: number) => {
    const s = shotAt(t);
    const ex: Box[] = [];
    for (const st of execsAt(t)) ex.push(...execBoxes(st));
    const pr: Box[] = [...BIZ_SETS[s.set].blockers];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      const bx = propBox(p.spec, placeOf(p, t));
      if (bx) pr.push(bx);
    }
    return { execs: ex, props: pr };
  };
  const topAt = (t: number) => (t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain) ? L.safe.topHook : L.safe.top);

  // ---------------------------------------------------- devices: fixed layout slots (layout.ts)
  const deviceRect = (d: DeviceR, t: number): Rect => {
    const top = topAt(t), sp = d.spec;
    switch (sp.do) {
      case "company": { const { w, h } = L.company; const y = sp.pos === "low" ? L.safe.bottom - h / 2 - 10 : sp.pos === "mid" ? L.H * 0.42 : top + h / 2 + 10; return { x: L.W / 2, y, w, h }; }
      case "decision": { const h = L.decision.fs * 1.15 + (sp.sub ? L.decision.subFs * 1.5 : 0) + 60; return { x: L.W / 2, y: L.decision.y, w: L.W - 2 * L.safe.x0, h }; }
      case "counter": return { x: L.W / 2, y: Math.max(L.counter.y, top + L.counter.h / 2 + 10), w: L.counter.w, h: L.counter.h };
      case "worth": return { x: L.W / 2, y: Math.max(L.worth.y, top + L.worth.h / 2 + 10), w: L.worth.w, h: L.worth.h };
      case "stamp": { const fs = L.decision.fs * 0.85; const w = sp.text.length * fs * 0.72 + 120; return { x: L.W / 2, y: sp.y ?? L.H * 0.4, w, h: fs * 1.25 + 40 }; }
      case "board": {
        if (sp.size === "giant") { const g = L.board.giant; return { x: L.W / 2, y: top + 40 + g.h / 2, w: g.w, h: g.h }; }
        const { w, h, margin } = L.board; const pos = sp.pos ?? "right"; return { x: pos === "left" ? margin + w / 2 : pos === "top" ? L.W / 2 : L.W - margin - w / 2, y: top + 40 + h / 2, w, h };
      }
    }
  };
  const devicesAt = (t: number): DeviceBox[] => {
    const s = shotAt(t), out: DeviceBox[] = [];
    for (const d of s.devices) {
      if (t < d.t0 - LEAD || t >= d.t1) continue;
      // a card that starts at frame 0 is fully on at frame 0 (no fade-in ghost at 0.00 s: the frame-0 gate checks it)
      const u = (d.t0 <= 1e-6 ? 1 : clamp((t - d.t0 + LEAD) / 0.22)) * clamp((d.t1 - t) / 0.15);
      const r = deviceRect(d, t), sp = d.spec, tau = t - d.t0;
      let value: string | undefined, frac: number | undefined, tone: Tone = "ink";
      switch (sp.do) {
        case "counter": { const k = EASE_INOUT(prog(t, d.t0 + 0.15, d.t0 + 0.15 + (sp.dur ?? 1.6))); const v = lerp(sp.from, sp.to, k); value = money(v); frac = Math.abs(sp.from) > 0 ? v / Math.max(Math.abs(sp.from), Math.abs(sp.to)) : k; tone = sp.tone ?? (sp.to < sp.from ? "red" : "green"); break; }
        case "board": { const cc = sp.count; value = sp.value ?? ""; if (cc) { const v = lerp(cc.from, cc.to, EASE_OUT(prog(t, d.t0, d.t0 + (cc.dur ?? 1.0)))); value = `${cc.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: cc.decimals ?? 0, maximumFractionDigits: cc.decimals ?? 0 })}${cc.suffix ?? ""}`; } tone = sp.tone ?? "ink"; break; }
        case "worth": { frac = EASE_INOUT(prog(t, d.t0 + 0.5, d.t0 + 1.6)); value = `${Math.round(sp.b.value / Math.max(1, sp.a.value)).toLocaleString("en-US")}×`; tone = "green"; break; }
        case "company": tone = sp.tone ?? "ink"; break;
        case "stamp": tone = sp.tone ?? "red"; break;
        case "decision": tone = "red"; break;
      }
      out.push({ ...r, key: d.key, kind: sp.do, spec: sp, u, tau, value, frac, tone });
    }
    return out;
  };

  // ---------------------------------------------------- labels (placed once at pop-in) and chart tags
  const labelPlan = new Map<string, { dx: number; dy: number }>();
  const placeLabel = (Lb: LabelR, s: BizShotR): { dx: number; dy: number } => {
    const got = labelPlan.get(Lb.key);
    if (got) return got;
    const t = Math.min(Lb.t1 - 0.01, Lb.t0 + 0.05);
    const cam = camAt(t);
    const q = project(cam, Lb.target(t));
    const sz = labelSize(L, Lb.text);
    const top = topAt(t);
    const heads = execsAt(t).map((st) => { const f = execHead(st); const p = project(cam, f.c); return p ? { x: p.x, y: p.y, w: 2 * f.r * p.k + 100, h: 2 * f.r * p.k + 100 } : null; }).filter(Boolean) as Rect[];
    const others: Rect[] = s.labels.filter((o) => o.key !== Lb.key && o.t0 <= Lb.t0 && o.t1 > Lb.t0).map((o) => { const d = placeLabel(o, s); const qo = project(cam, o.target(t)); const so = labelSize(L, o.text); return qo ? { x: qo.x + d.dx, y: qo.y + d.dy, ...so } : null; }).filter(Boolean) as Rect[];
    for (const d of s.devices) if (d.t1 > Lb.t0 && d.t0 < Lb.t1) others.push(deviceRect(d, t));
    const ax = q?.x ?? L.W / 2, ay = q?.y ?? L.H * 0.47;
    const prefer = Lb.side === "left" ? -1 : Lb.side === "right" ? 1 : ax > L.W / 2 ? -1 : 1;
    const cands: { dx: number; dy: number }[] = [];
    for (const dy of [-200, -120, -280, 120, 200, -360, 280, 0]) for (const sd of [prefer, -prefer]) cands.push({ dx: sd * (sz.w / 2 + 90), dy });
    const clampC = (cc: { x: number; y: number }) => ({ x: clamp(cc.x, L.safe.x0 + sz.w / 2, L.safe.x1 - sz.w / 2), y: clamp(cc.y, top + sz.h / 2, L.safe.bottom - sz.h / 2) });
    let best = cands[0], bestScore = Infinity;
    cands.forEach((cd, k) => {
      const cc = clampC({ x: ax + cd.dx, y: ay + cd.dy });
      const box = { ...cc, ...sz };
      let score = k * 0.01 + Math.hypot(cc.x - (ax + cd.dx), cc.y - (ay + cd.dy)) * 0.002;
      if (heads.some((f) => rectsHit(box, f, 10))) score += 100;
      if (others.some((o) => rectsHit(box, o, 18))) score += 50;
      if (Math.abs(cc.x - ax) < sz.w / 2 + 10 && Math.abs(cc.y - ay) < sz.h / 2 + 10) score += 20;
      if (score < bestScore) { bestScore = score; best = { dx: cc.x - ax, dy: cc.y - ay }; }
    });
    labelPlan.set(Lb.key, best);
    return best;
  };
  const labelsAt = (t: number): LabelBox[] => {
    const s = shotAt(t), cam = camAt(t), top = topAt(t), out: LabelBox[] = [];
    for (const Lb of s.labels) {
      if (t < Lb.t0 - LEAD || t >= Lb.t1) continue;
      const q = project(cam, Lb.target(t));
      if (!q) continue;
      const d = placeLabel(Lb, s), sz = labelSize(L, Lb.text);
      const x = clamp(q.x + d.dx, L.safe.x0 + sz.w / 2, L.safe.x1 - sz.w / 2), y = clamp(q.y + d.dy, top + sz.h / 2, L.safe.bottom - sz.h / 2);
      const line = EASE_OUT(prog(t, Lb.t0 - LEAD, Lb.t0 + 0.16));
      const u = clamp((t - Lb.t0 - 0.06) / 0.28) * clamp((Lb.t1 - t) / 0.15);
      out.push({ key: Lb.key, text: Lb.text, tone: Lb.tone, ax: q.x, ay: q.y, x, y, ...sz, u, line: line * clamp((Lb.t1 - t) / 0.15) });
    }
    return out;
  };
  const tagsAt = (t: number): TagBox[] => {
    const s = shotAt(t);
    if (s.set !== "chart" || !chart) return [];
    const cam = camAt(t), draw = chartDraw(sceneT(t)), out: TagBox[] = [];
    for (const tg of chart.tags) {
      if (tg.i > draw + 1e-6) continue;
      const q = project(cam, add(chart.pts[tg.i], [0, 1.0, 0]));
      if (!q || q.z < 1.2) continue;
      const w = tg.text.length * 0.62 * L.tag.fs + 44, h = L.tag.fs * 1.2 + 18;
      if (q.x < L.safe.x0 + w / 2 || q.x > L.safe.x1 - w / 2 || q.y < topAt(t) + h / 2 || q.y > L.safe.bottom - h / 2) continue;
      const rising = tg.i === 0 || chart.rising(tg.i - 1);
      out.push({ key: `tag${tg.i}`, text: tg.text, x: q.x, y: q.y, w, h, u: clamp((draw - tg.i) / 0.25), tone: rising ? "green" : "red" });
    }
    return out;
  };
  const textsAt = (t: number) => {
    const out: string[] = [];
    if (t <= hookUntil) out.push(recipe.hook.text.replace(/\*/g, ""));
    for (const l of labelsAt(t)) if (l.u > 0.5) out.push(l.text);
    for (const d of devicesAt(t)) if (d.u > 0.5) out.push(`${d.kind} ${d.value ?? ""}`);
    return out;
  };

  // ---------------------------------------------------- audio cue plan (tools/story_mix.py format)
  const cues: Cue[] = [{ t: 0, sfx: recipe.sfx0 ?? "impact", db: -1 }];
  for (const s of shots) {
    const cp = s.spec.cam.preset;
    if (cp === "slamZoom") cues.push({ t: at(s.spec.cam.hit, s.a + 0.12) - 0.02, sfx: "impact", db: -1 });
    if (cp === "whip" || s.spec.in === "whip") cues.push({ t: s.a, sfx: "whoosh", db: -4 });
    if (cp === "chartFly") cues.push({ t: s.a + 0.05, sfx: "riser", db: -6 }, { t: s.a + 0.05, sfx: "whoosh", db: -5 });
    for (const ac of s.spec.actions ?? []) {
      const t0 = at(ac.at);
      if (ac.do === "crack") { cues.push({ t: t0, sfx: "crash", db: -4 }, { t: t0 + 0.1, sfx: "rumble", db: -6 }); if (ac.collapse !== undefined) cues.push({ t: at(ac.collapse), sfx: "boom", db: -2 }); }
      if (ac.do === "dark") cues.push({ t: t0, sfx: "fail", db: -8 });
      if (ac.do === "lit") cues.push({ t: t0, sfx: "chime", db: -10 });
      if (ac.do === "drain") cues.push({ t: t0, sfx: "coins", db: -8 });
      if (ac.do === "slam") cues.push({ t: t0, sfx: "paper", db: -4 }, { t: t0 + 0.9, sfx: "stamp", db: -6 });
      if (ac.do === "label") cues.push({ t: t0, sfx: "ding", db: -12 });
    }
    for (const d of s.devices) {
      const k = d.spec.do;
      if (k === "decision") cues.push({ t: d.t0, sfx: "stamp", db: -1 }, { t: d.t0 + 0.05, sfx: "suspense", db: -6 });
      if (k === "stamp") cues.push({ t: d.t0, sfx: "stamp", db: -2 });
      if (k === "company") cues.push({ t: d.t0, sfx: "pop", db: -8 });
      if (k === "counter") cues.push({ t: d.t0 + 0.1, sfx: (d.spec as { to: number; from: number }).to < (d.spec as { from: number }).from ? "fail" : "cash", db: -6 }, { t: d.t0 + 0.15, sfx: "tick", db: -10 });
      if (k === "worth") cues.push({ t: d.t0 + 0.5, sfx: "riser", db: -8 }, { t: d.t0 + 1.6, sfx: "cash", db: -4 });
      if (k === "board") cues.push({ t: d.t0, sfx: "ding", db: -10 });
    }
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "dropIn") cues.push({ t: p.hit - 0.02, sfx: "impact", db: 0 }, { t: p.hit, sfx: "thud", db: -2 });
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "popIn") cues.push({ t: p.hit - 0.1, sfx: "pop", db: -8 });
    for (const e of s.execs) for (const g of e.segs.slice(1)) if (g.pose === "slam") cues.push({ t: g.t0 + 0.31, sfx: "punch", db: -3 });
    for (const x of s.spec.sfx ?? []) cues.push({ t: at(x.at), sfx: x.sfx, db: x.db });
  }
  // ---------------------------------------------------- landscape: chapters (a whoosh + impact per card)
  const chapters = LS ? resolveChapters(recipe.chapters, at, hookUntil) : [];
  if (LS) cues.push(...chapterCues(chapters));
  cues.push({ t: end - 0.35, sfx: "whoosh", db: -2 });
  const audio = { music: recipe.music ?? "upbeat", cues: cues.filter((q) => q.t >= 0 && q.t < end).sort((x, y) => x.t - y.t) };

  // ---------------------------------------------------- landscape: caption-safe framing + the lower-third plan
  // A face in the caption column (240 px side margins) that lands in the lower-third band lifts the shot's subject
  // (its lens `face` fraction) just enough to clear it, unless the recipe sets cam.face; whatever is left over moves
  // the caption (lowerThirdY). Computed at compile time (nothing is baked into the gen file, as in portrait).
  const facesOf = (s: BizShotR): FaceBand[] => {
    const out: FaceBand[] = [];
    for (const u of [0.1, 0.3, 0.5, 0.7, 0.92]) {
      const tm = s.a + (s.b - s.a) * u, cam = camAt(tm);
      for (const st of s.execs.map((e) => execState(e, sceneT(tm)))) {
        const f = execHead(st), q = project(cam, f.c);
        if (!q || q.x < LF.CAP_SIDE || q.x > L.W - LF.CAP_SIDE) continue;
        const half = f.r * q.k;
        if (q.y + half > 0 && q.y - half < L.H) out.push({ top: q.y - half, bot: q.y + half });
      }
    }
    return out;
  };
  const lifted: { id: string; from: number; to: number }[] = [];
  const capPlan = new Map<string, number>();
  if (LS) {
    for (const s of shots) {
      if (typeof s.spec.cam.face === "number") continue;
      const f0 = s.lens.face;
      for (let it = 0; it < 4; it++) {
        const need = liftNeeded(facesOf(s));
        if (need <= 0 || s.lens.face <= 0.26 + 1e-3) break;
        s.lens.face = Math.max(0.26, s.lens.face - need);
      }
      if (s.lens.face !== f0) lifted.push({ id: s.id, from: f0, to: Math.round(s.lens.face * 1000) / 1000 });
    }
  }
  const capY = (s: BizShotR) => {
    if (!LS) return L.cap.centre;
    let y = capPlan.get(s.id);
    if (y === undefined) { y = lowerThirdY(facesOf(s)); capPlan.set(s.id, y); }
    return y;
  };

  return { recipe, slug: recipe.slug, layout: L, duration, shots, words, chart, at, hookUntil, hookAgain, shotAt, sceneT, freezeAt, camAt, execsAt, placeOf, propState, world, labelsAt, tagsAt, devicesAt, qa, textsAt, project, audio, landscape: LS, chapters, capY, lifted };
};

// ------------------------------------------------------------------ executive tracks
const execTrack = (es: ExecSpec, a: number, b: number, set: BizSet, sid: string, at: (x: At | undefined, d?: number) => number, placeV: (p: Place, s: BizSet, id: string) => V3,
  targetFn: (t: BizTarget) => (t: number) => V3, lensPos: () => V3, look: ExecLook, recipe: BizRecipe, words: readonly Word[], cam: BizCam): ExecTrack => {
  const p0 = placeV(es.at, set, sid), p1 = es.to ? placeV(es.to, set, sid) : p0;
  const t0 = at(es.from, a);
  const segs: { t0: number; pose: ExecPose }[] = [{ t0: Math.max(a, t0 - LEAD), pose: es.pose }];
  for (const x of es.then ?? []) segs.push({ t0: at(x.at) - LEAD, pose: x.pose });
  const lk = es.look;
  const lookFn = lk !== undefined && typeof lk !== "number" ? targetFn(lk) : null;
  const camT = typeof cam.target === "string" ? cam.target.split(".")[0] : "";
  const talkOn = recipe.talk !== "none" && (es.talk ?? camT === es.id);
  const pos = (t: number): V3 => lerpV(p0, p1, EASE_INOUT(clamp((t - a) / Math.max(0.3, b - a))));
  const seatYaw = es.seated && lk === undefined ? (Math.abs(p0[0]) > 0.5 ? (p0[0] < 0 ? Math.PI / 2 : -Math.PI / 2) : p0[2] < 0 ? 0 : Math.PI) : null;
  return {
    id: es.id, seed: 3 + es.id.length * 7 + es.id.charCodeAt(0), s: es.scale ?? 1, look, seated: !!es.seated,
    at: pos,
    yaw: (t) => {
      if (typeof lk === "number") return lk * D2R;
      if (seatYaw !== null) return seatYaw;
      const p = pos(t);
      if (lookFn) return yawTo(p, lookFn(t));
      if (es.to) { const d = sub(p1, p0); if (Math.hypot(d[0], d[2]) > 0.3) return Math.atan2(d[0], d[2]); }
      return yawTo(p, lensPos());
    },
    segs,
    talk: talkOn ? (t) => (words.some((w) => t >= w.t && t < w.end + 0.05) ? 1 : 0) : undefined,
  };
};

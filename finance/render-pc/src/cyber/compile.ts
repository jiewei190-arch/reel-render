// The cyber3d recipe compiler: CyberRecipe + voice words -> shots with lenses, figure and BOLT tracks, cutaway states,
// label / board / story-device layouts, glitch + alert events, the audio cue plan and the QA/gate data.
// A pure function of t. Forked from src/tech/compile.ts (same lens maths, the same cutaway timelines) so tech3d and
// Block Money can never change because of this kit. Every screen number comes from src/cyber/layout.ts.
import type { V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import { kickAt, kicked, pushK, whipK } from "../fin/lib/camera";
import type { Cam } from "../fin/lib/camera";
import { EASE_INOUT, EASE_OUT, EASE_PLACE, LEAD, prog } from "../fin/lib/motion";
import { visemeAt } from "../fin/lib/lipsync";
import { makeAt } from "../fin/recipe/timing";
import type { Word } from "../fin/recipe/types";
import { BOLT_R, boltBoxes, boltFace, boltState, HOVER } from "../tech/bolt";
import type { BoltFace, BoltPose, BoltState, BoltTrack } from "../tech/bolt";
import { cutBoxes, NO_CUT, objBox, partWorld } from "../tech/cutaway";
import type { CutState, ObjDef, Placement } from "../tech/cutaway";
import { figureBoxes, figureRig, figWorld } from "./figure";
import type { FigurePose, FigureRig, FigureTrack } from "./figure";
import { layoutOf } from "./layout";
import type { Layout } from "./layout";
import { CYBER_OBJECTS } from "./objects";
import { CYBER_SETS, geo, CITIES } from "./sets";
import type { CyberSet, CyberSetId } from "./sets";
import type { At, BoltSpec, CyberBoard, CyberCam, CyberProp, CyberRecipe, CyberShot, CyberTarget, Place } from "./types";

export const FPS = 30;
const D2R = Math.PI / 180;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const isV3 = (x: unknown): x is V3 => Array.isArray(x) && x.length === 3;
const easeOut3 = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const yawTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);

export type Box = { name: string; c: V3; h: V3 };
export type Lens = { a: number; b: number; subj: (t: number) => V3; off: V3; fov: (t: number) => number; face: number; push: number; roll: [number, number]; blur: number; posAt?: (t: number) => V3 };
export type PropR = { key: string; spec: CyberProp; a: number; b: number; hit: number; def?: ObjDef; place: (t: number) => Placement; show: (t: number) => number; fig?: FigureTrack };
export type LabelR = { key: string; text: string; t0: number; t1: number; side: "left" | "right" | "auto"; target: (t: number) => V3; shot: string; tone: "cyan" | "red" };
export type BoardR = { spec: CyberBoard; t0: number; t1: number };
export type FxR = { fx: "shake" | "sparks"; at: number; p: (t: number) => V3; gain: number };
export type CyberShotR = { id: string; a: number; b: number; set: CyberSetId; spec: CyberShot; lens: Lens; kicks: [number, number][]; bolts: BoltTrack[]; props: PropR[]; labels: LabelR[]; boards: BoardR[]; fx: FxR[]; tin: "glitch" | "punch" | "cut" | "whip" };
export type Cue = { t: number; sfx: string; db?: number };
export type LabelBox = { key: string; text: string; ax: number; ay: number; x: number; y: number; w: number; h: number; u: number; line: number; tone: "cyan" | "red" };
export type BoardBox = { title: string; value: string; x: number; y: number; w: number; h: number; u: number; tone: "cyan" | "magenta" | "red" };
/** a story device on screen at t: u = its in/out envelope (0..1) */
export type DeviceBox =
  | { kind: "case"; u: number; tau: number; x: number; y: number; w: number; h: number; name: string; year: string; amount: string; title: string; status: string }
  | { kind: "money"; u: number; tau: number; x: number; y: number; w: number; h: number; label: string; value: string; frac: number }
  | { kind: "check"; u: number; tau: number; x: number; y: number; w: number; h: number; title: string; items: { text: string; on: number }[] }
  | { kind: "count"; u: number; tau: number; x: number; y: number; w: number; h: number; label: string; value: string }
  | { kind: "alert"; u: number; tau: number; x: number; y: number; w: number; h: number; text: string };
/** a full-frame visual event: glitch transitions and alert washes (the safety check reads these) */
export type FlashEv = { kind: "glitch" | "alert"; t0: number; t1: number; peak: number };

export type CyberCompiled = {
  recipe: CyberRecipe; slug: string; duration: number; shots: CyberShotR[]; words: readonly Word[]; L: Layout;
  at: (a: At | undefined, d?: number) => number; hookUntil: number; hookAgain: number | null;
  shotAt: (t: number) => CyberShotR;
  camAt: (t: number) => Cam;
  boltsAt: (t: number) => BoltState[];
  figuresAt: (t: number) => { key: string; p: V3; yaw: number; s: number; rig: FigureRig }[];
  cutOf: (key: string, t: number) => CutState;
  placeOf: (p: PropR, t: number) => Placement;
  labelsAt: (t: number) => LabelBox[];
  boardsAt: (t: number) => BoardBox[];
  devicesAt: (t: number) => DeviceBox[];
  flashes: FlashEv[];
  /** glitch amount 0..1 at t (transition jitter) and the alert wash 0..1 */
  glitchAt: (t: number) => number;
  alertAt: (t: number) => number;
  qa: (t: number) => { bolts: Box[]; props: Box[] };
  textsAt: (t: number) => string[];
  audio: { music: string; cues: Cue[] };
};

/** camera presets: every one keeps moving */
export const CYBER_CAMS = {
  hookZoom: { dist: 1.8, h: 0.15, fov: 42, face: 0.45, push: 0.05, blur: 1.6, roll: [-2, 0.5] as [number, number] },
  closeUp: { dist: 1.4, h: 0.1, fov: 40, face: 0.45, push: 0.06, blur: 1.8, roll: [0, 1.2] as [number, number] },
  medium: { dist: 3.2, h: 0.4, fov: 46, face: 0.46, push: 0.05, blur: 1.0, roll: [0, 1] as [number, number] },
  wide: { dist: 8.0, h: 2.2, fov: 50, face: 0.5, push: 0.03, blur: 0.5, roll: [0, 0.6] as [number, number] },
  slamZoom: { dist: 2.6, h: 0.25, fov: 44, face: 0.46, push: 0.05, blur: 1.2, roll: [0, 1.5] as [number, number] },
  pushIn: { dist: 3.0, h: 0.4, fov: 44, face: 0.46, push: 0, blur: 1.1, roll: [0, 1] as [number, number] },
  whip: { dist: 3.0, h: 0.35, fov: 48, face: 0.46, push: 0.05, blur: 1.0, roll: [4, 0] as [number, number] },
  orbit: { dist: 4.0, h: 0.9, fov: 44, face: 0.47, push: 0.02, blur: 0.9, roll: [0, 0] as [number, number] },
  flyThrough: { dist: 6.0, h: 1.0, fov: 46, face: 0.47, push: 0, blur: 0.8, roll: [0, 3] as [number, number] },
  explodeOrbit: { dist: 6.5, h: 2.0, fov: 44, face: 0.47, push: 0, blur: 0.8, roll: [0, 0] as [number, number] },
  /** a slow sideways slide with a creep in (surveillance feel) */
  drift: { dist: 3.4, h: 0.6, fov: 44, face: 0.47, push: 0.025, blur: 1.0, roll: [-1, 1] as [number, number] },
  /** rises and tilts down onto the target (an establishing reveal of a map or a board) */
  crane: { dist: 5.0, h: 1.2, fov: 46, face: 0.5, push: 0.02, blur: 0.7, roll: [0, 0] as [number, number] },
};

// ------------------------------------------------------------------ projection (layout-sized)
export const project = (cam: Cam, p: V3, L: Layout): { x: number; y: number; k: number; z: number } | null => {
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
export const labelSize = (text: string, L: Layout) => ({ w: Math.round(text.length * 0.66 * L.label.fs + 64 * L.k), h: Math.round(L.label.fs * 1.15 + 34 * L.k) });
const rectsHit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, m = 14) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + 2 * m && Math.abs(a.y - b.y) * 2 < a.h + b.h + 2 * m;

const GLITCH_DUR = 0.22, GLITCH_PEAK = 0.55;
const ALERT_DUR = 1.1, ALERT_PEAK = 0.32;

// ------------------------------------------------------------------ the compiler
export const compileCyber = (recipe: CyberRecipe, words: readonly Word[], voDuration?: number): CyberCompiled => {
  if (recipe.kit !== "cyber3d") throw new Error(`recipe ${recipe.slug}: kit must be "cyber3d"`);
  const L = layoutOf(recipe);
  const { at: at0, lineEnd } = makeAt(words);
  // a bare number is SECONDS ("2013" = 2013 s): a spoken year must be anchored as a word with its line ("6:2013")
  const at = (a: At | undefined, d = 0): number => {
    if (typeof a === "string" && /^\d{3,}$/.test(a.trim())) throw new Error(`recipe: At "${a}" reads as ${a} seconds; to anchor the spoken word use "<line>:${a}" (e.g. "6:${a}")`);
    return at0(a, d);
  };
  const durS = recipe.duration ?? voDuration ?? Math.max(...words.map((w) => w.end)) + 0.8;
  const duration = Math.round(durS * FPS);
  const end = duration / FPS;
  const cast = recipe.cast ?? {};
  const castIds = Object.keys(cast);
  for (const [id, look] of Object.entries(cast)) if (look !== "BOLT") throw new Error(`recipe: cast "${id}" must be "BOLT" (cyber3d's only cast member; the hooded figure is a kit prop)`);
  const starts = recipe.shots.map((s) => at(s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1]) throw new Error(`recipe: shot ${i + 1} starts at ${a.toFixed(2)} s, not after shot ${i} (${starts[i - 1].toFixed(2)} s)`); });
  if (Math.abs(starts[0]) > 1e-6) throw new Error("recipe: the first shot must start at 0");
  const hookUntil = recipe.hook.until !== undefined ? at(recipe.hook.until) : lineEnd(1) + 0.25;
  const hookAgain = recipe.hook.again !== undefined ? at(recipe.hook.again) : null;
  const hookOn = (t: number) => t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain);
  const safeTop = (t: number) => (hookOn(t) ? L.safe.topHook : L.safe.top);

  type ExA = { t0: number; dur: number; to: number; stagger: number; parts: string[] | null };
  type SlA = { t0: number; dur: number; on: boolean; axis?: "x" | "y" | "z"; keep?: "neg" | "pos"; stop?: number };
  const exTL = new Map<string, ExA[]>(), slTL = new Map<string, SlA[]>(), hiTL = new Map<string, { part: string; t0: number; t1: number }[]>();
  const push = <T,>(m: Map<string, T[]>, k: string, v: T) => { const l = m.get(k) ?? []; l.push(v); m.set(k, l); };
  const cutCache = new Map<string, CutState>();
  const defByKey = new Map<string, ObjDef>();

  let curSet: CyberSetId = recipe.shots[0].set ?? "room";
  const shots: CyberShotR[] = [];
  const globalProps = (recipe.props ?? []).map((p) => ({ p, a: at(p.from, 0), b: at(p.until, end + 1) }));
  const defOf = (spec: CyberProp, sid: string): ObjDef | undefined => {
    if (!spec.obj) return undefined;
    const d = CYBER_OBJECTS[spec.obj];
    if (!d) throw new Error(`recipe ${sid}: no object "${spec.obj}" (has: ${Object.keys(CYBER_OBJECTS).join(", ")})`);
    return d;
  };
  const placeV = (pl: Place, set: CyberSet, sid: string): V3 => {
    if (Array.isArray(pl)) return pl.length === 2 ? [pl[0], 0, pl[1]] : (pl as V3);
    const [name, off] = pl.split(":");
    const a = set.anchors[name];
    if (!a) throw new Error(`recipe ${sid}: no anchor "${name}" in set ${set.id} (has: ${Object.keys(set.anchors).join(", ")})`);
    const o: V3 = off ? (off.split(",").map(Number) as V3) : [0, 0, 0];
    return add(a, o);
  };
  const glitches: FlashEv[] = [];

  recipe.shots.forEach((sp, i) => {
    curSet = sp.set ?? curSet;
    const set = CYBER_SETS[curSet];
    if (!set) throw new Error(`recipe: no set "${curSet}" (has: ${Object.keys(CYBER_SETS).join(", ")})`);
    const a = starts[i], b = i + 1 < starts.length ? starts[i + 1] : end;
    const id = `S${String(i + 1).padStart(2, "0")}`;
    const props: PropR[] = [];
    const addProp = (spec: CyberProp, pa: number, pb: number) => {
      const def = defOf(spec, id);
      if (!spec.obj && !spec.kit) throw new Error(`recipe ${id}: prop "${spec.id}" needs "obj" or "kit"`);
      if (spec.kit === "route") {
        for (const c of [spec.from ?? "", ...(spec.to ?? [])]) if (!CITIES[c]) throw new Error(`recipe ${id}: route "${spec.id}": no city "${c}" (has: ${Object.keys(CITIES).join(", ")})`);
        if (!spec.to?.length) throw new Error(`recipe ${id}: route "${spec.id}" needs "to": [cities]`);
      }
      const base = spec.kit === "route" ? geo(...CITIES[spec.from!]) : placeV(spec.at, set, id);
      const hit = at(spec.hit, a + 0.12);
      const keys = (spec.path ?? []).map(([kt, kp]) => ({ t: at(kt), p: placeV(kp, set, id) }));
      const s0 = spec.s ?? 1;
      const place = (t: number): Placement => {
        let p = base, yaw = (spec.yaw ?? 0) * D2R, s = s0;
        const pitch = (spec.pitch ?? 0) * D2R, roll = (spec.roll ?? 0) * D2R;
        switch (spec.motion) {
          case "turntable": yaw += (spec.spin ?? 12) * D2R * t; break;
          case "bob": p = add(p, [0, 0.05 * Math.sin(t * 2.0), 0]); yaw += 0.06 * Math.sin(t * 0.9); break;
          case "popIn": s = s0 * (t < hit - 0.3 ? 0.001 : Math.max(0.001, EASE_PLACE(prog(t, hit - 0.3, hit)))); break;
          case "dropIn": { const H = 2.2, u = clamp((t - (hit - 0.4)) / 0.4); p = add(p, [0, t < hit ? H * (1 - u * u) : 0.06 * Math.abs(Math.sin((t - hit) * 16)) * Math.exp(-(t - hit) * 6), 0]); break; }
          case "slideOut": { const u = EASE_PLACE(prog(t, hit, hit + 0.45)); p = add(p, [0, 0.02 * Math.sin(t * 1.4), 0.65 * u]); s = s0 * (1 + 0.18 * u); break; }
          case "path": {
            if (keys.length) {
              let k = 0;
              while (k < keys.length - 1 && t >= keys[k + 1].t) k++;
              const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
              const u = B.t > A.t ? EASE_INOUT(clamp((t - A.t) / (B.t - A.t))) : 0;
              p = lerpV(A.p, B.p, k === keys.length - 1 ? 0 : u);
            }
            break;
          }
        }
        return { p, yaw, s, pitch, roll };
      };
      if (def) defByKey.set(spec.id, def);
      let fig: FigureTrack | undefined;
      if (spec.kit === "figure") fig = { seed: 3 + spec.id.length * 5, segs: [{ t0: pa - 1, pose: spec.pose ?? "type" }, ...(spec.then ?? []).map((x) => ({ t0: at(x.at) - LEAD, pose: x.pose as FigurePose }))] };
      props.push({ key: spec.id, spec, a: pa, b: pb, hit, def, place, fig, show: (t) => (spec.motion === "popIn" ? clamp((t - hit + 0.3) / 0.05) : 1) });
    };
    (sp.props ?? []).forEach((ps) => addProp(ps, a, b));
    globalProps.filter((g) => g.a < b && g.b > a && (!g.p.sets || g.p.sets.includes(curSet)) && !(sp.props ?? []).some((q) => q.id === g.p.id)).forEach((g) => addProp(g.p, Math.max(a, g.a), Math.min(b, g.b)));

    const bolts: BoltTrack[] = [];
    const states = new Map<string, (t: number) => BoltState>();
    const targetFn = (tg: CyberTarget): ((t: number) => V3) => {
      if (isV3(tg)) return () => tg;
      const [name, part] = tg.split(".");
      if (castIds.includes(name)) {
        return (t) => {
          const f = states.get(name);
          if (!f) throw new Error(`recipe ${id}: target "${tg}" but ${name} is not in this shot`);
          const st = f(t);
          return part === "face" ? boltFace(st).c : [st.x, st.y, st.z];
        };
      }
      const pr = props.find((p) => p.key === name);
      if (pr) {
        if (pr.fig) { const fg = pr.fig; return (t) => { const pl = pr.place(t); const rig = figureRig(fg, t); return figWorld(pl.p, pl.yaw, pl.s, part === "hands" ? lerpV(rig.hand[0], rig.hand[1], 0.5) : part === "body" ? [0, rig.neck[1] * 0.75, 0.1] : rig.head); }; }
        if (part && pr.def) { const def = pr.def; return (t) => partWorld(def, pr.place(t), cutOf(pr.key, t), part); }
        if (pr.def) { const def = pr.def; return (t) => objBox(def, pr.place(t)).c; }
        if (pr.spec.kit === "email") return (t) => add(pr.place(t).p, [0, 0, 0.02]);
        return (t) => pr.place(t).p;
      }
      const [an, off] = tg.split(":");
      if (set.anchors[an]) { const o = off ? (off.split(",").map(Number) as V3) : [0, 0, 0]; return () => add(set.anchors[an], o as V3); }
      throw new Error(`recipe ${id}: no target "${tg}" (cast: ${castIds.join(", ") || "none"}; props: ${props.map((p) => p.key).join(", ") || "none"}; anchors: ${Object.keys(set.anchors).join(", ")})`);
    };

    // lens
    const c = sp.cam;
    const P = CYBER_CAMS[c.preset];
    if (!P) throw new Error(`recipe ${id}: no camera preset "${c.preset}" (has: ${Object.keys(CYBER_CAMS).join(", ")})`);
    const camTarget = c.target ?? "centre";
    let lensPos0: V3 = [0, 1.5, 6];
    for (const bs of sp.actors ?? []) {
      if (!cast[bs.id]) throw new Error(`recipe ${id}: actor "${bs.id}" is not in cast`);
      bolts.push(boltTrack(bs, a, b, set, id, at, placeV, targetFn, () => lensPos0, recipe, words, c));
    }
    bolts.forEach((tr) => states.set(tr.id, (t) => boltState(tr, t)));
    const subj = targetFn(camTarget);
    const s0 = subj(a);
    const az = (c.az ?? 0) * D2R, dist = c.dist ?? P.dist, h = c.h ?? P.h;
    const off: V3 = [Math.sin(az) * dist, h, Math.cos(az) * dist];
    lensPos0 = add(s0, off);
    const hit = at(c.hit, a + 0.12);
    let lens: Lens = { a, b, subj, off, fov: () => c.fov ?? P.fov, face: c.face ?? P.face, push: P.push, roll: c.roll ?? P.roll, blur: c.blur ?? P.blur };
    const fov0 = c.fov ?? P.fov;
    const span = Math.max(0.3, b - a);
    switch (c.preset) {
      case "slamZoom":
        lens.fov = (t) => (t < hit - 0.2 ? 60 : t < hit ? 60 + 1.8 * Math.sin((Math.PI * (t - hit + 0.2)) / 0.2) : lerp(60, fov0, easeOut3((t - hit) / 0.12)) - 1.5 * clamp((t - hit - 0.12) / 2));
        break;
      case "hookZoom": {
        const far: V3 = [off[0] * 1.3, off[1] * 1.15, off[2] * 1.3];
        lens.posAt = (t) => { const u = easeOut3((t - a) / 0.4); const q = lerpV(far, off, u); const k = 1 - P.push * Math.max(0, t - a - 0.4); return add(subj(t), scl(q, k)); };
        break;
      }
      case "pushIn": lens.posAt = (t) => add(subj(t), scl(off, pushK(t, a, 0.003, 0.006, 35))); break;
      case "whip": { const s1 = subj; lens = { ...lens, posAt: (t) => add(s1(t), off), subj: (t) => { const q = s1(t), pp = add(q, off); return add(pp, rotY(sub(q, pp), 35 * D2R * whipK(t, a))); } }; break; }
      case "orbit": { const sw = (c.sweep ?? 44) * D2R; lens.posAt = (t) => add(subj(t), rotY(off, lerp(-sw / 2, sw / 2, clamp((t - a) / span)))); break; }
      case "drift": {
        const sw = (c.sweep ?? 0.9);
        const side: V3 = [Math.cos(az), 0, -Math.sin(az)];
        lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / span)); const k = 1 - P.push * (t - a); return add(add(subj(t), scl(off, k)), scl(side, lerp(-sw / 2, sw / 2, u))); };
        break;
      }
      case "crane": {
        lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / span)); return add(subj(t), [off[0] * (1 - 0.15 * u), off[1] + lerp(0, dist * 0.55, u), off[2] * (1 - 0.15 * u)]); };
        break;
      }
      case "flyThrough": {
        const d1 = c.endDist ?? 0.9, T = c.dur ?? b - a;
        if (c.to) {
          const goal = placeV(c.to, set, id);
          lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / T)); return add(lerpV(add(s0, off), goal, u), [0, 0.03 * Math.sin(t * 2.1), 0]); };
          lens.subj = (t) => { const u = EASE_INOUT(clamp((t - a) / T)); return add(subj(t), [0, 0, lerp(0, goal[2] - s0[2], u * 0.6)]); };
        } else {
          lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / T)); const k = lerp(1, d1 / dist, u); const sw = rotY([off[0], off[1] * lerp(1, 0.35, u), off[2]], lerp(0, 18 * D2R, u)); return add(subj(t), scl(sw, k)); };
        }
        lens.fov = (t) => lerp(fov0, fov0 + 12, EASE_INOUT(clamp((t - a) / T)));
        break;
      }
      case "explodeOrbit": {
        const sw = (c.sweep ?? 80) * D2R;
        const tg = typeof camTarget === "string" ? camTarget.split(".")[0] : "";
        lens.posAt = (t) => {
          const pr = props.find((p) => p.key === tg);
          let ex = 0;
          if (pr?.def) { const cs = cutOf(pr.key, t); for (let k = 0; k < pr.def.parts.length; k++) ex = Math.max(ex, cs.ex(k)); }
          const v = rotY(off, lerp(-sw / 2, sw / 2, EASE_INOUT(clamp((t - a) / span))));
          return add(subj(t), scl(v, 1 + 0.25 * ex));
        };
        break;
      }
    }
    // transitions: glitch (default), punch, whip, cut
    const tin: CyberShotR["tin"] = i === 0 ? "cut" : sp.in ?? (c.preset === "slamZoom" || c.preset === "whip" ? "cut" : "glitch");
    const kicks: [number, number][] = [];
    if (c.preset === "slamZoom") kicks.push([hit, 1.2]);
    if (c.preset === "hookZoom") kicks.push([a + 0.38, 0.7]);
    if (tin === "punch" || tin === "glitch") { const f0 = lens.fov; const amp = tin === "punch" ? 7 : 4; lens = { ...lens, fov: (t) => f0(t) + amp * (1 - easeOut3((t - a) / 0.16)) }; kicks.push([a, tin === "punch" ? 0.5 : 0.35]); }
    if (tin === "glitch") glitches.push({ kind: "glitch", t0: a - 0.06, t1: a + GLITCH_DUR - 0.06, peak: GLITCH_PEAK });
    if (tin === "whip") {
      const s1 = lens.subj, p1 = lens.posAt ?? ((t: number) => add(s1(t), off));
      lens = { ...lens, posAt: p1, subj: (t) => { const q = s1(t), pp = p1(t); return add(pp, rotY(sub(q, pp), 32 * D2R * whipK(t, a))); } };
    }
    // actions
    const labels: LabelR[] = [];
    for (const ac of sp.actions ?? []) {
      const t0 = at(ac.at);
      const [pk, part] = ac.on.split(".");
      const pr = props.find((p) => p.key === pk);
      if (ac.do !== "label" && (!pr || !pr.def)) throw new Error(`recipe ${id}: action "${ac.do}" on "${ac.on}": no cutaway prop "${pk}" in this shot`);
      if (ac.do === "explode" || ac.do === "assemble") push(exTL, pk, { t0, dur: ac.dur ?? 0.75, to: ac.do === "assemble" ? 0 : ac.amount ?? 1, stagger: ac.stagger ?? 0.012, parts: ac.parts ?? null });
      if (ac.do === "slice" || ac.do === "unslice") push(slTL, pk, { t0, dur: ac.dur ?? 0.7, on: ac.do === "slice", axis: ac.axis, keep: ac.keep, stop: ac.stop });
      if (ac.do === "highlight") { if (!part) throw new Error(`recipe ${id}: highlight needs "<prop>.<part>"`); partWorld(pr!.def!, pr!.place(t0), NO_CUT, part); push(hiTL, pk, { part, t0, t1: at(ac.until, b) }); }
      if (ac.do === "label") {
        const def = pr?.def;
        const text = (ac.text ?? (def && part ? def.parts.find((q) => q.id === part)?.label : undefined) ?? "").toUpperCase();
        if (!text) throw new Error(`recipe ${id}: label on "${ac.on}" needs "text" (the part has no default label)`);
        if (text.trim().split(/\s+/).length > 3) throw new Error(`recipe ${id}: label "${text}" has more than 3 words`);
        labels.push({ key: `${id}.${ac.on}.${labels.length}`, text, t0, t1: at(ac.until, b), side: ac.side ?? "auto", target: targetFn(ac.on), shot: id, tone: ac.tone ?? "cyan" });
      }
    }
    const fx: FxR[] = (sp.fx ?? []).map((f) => { const o = typeof f === "string" ? { fx: f } : f; return { fx: o.fx, at: at(o.at, hit), p: targetFn(o.p ?? camTarget), gain: o.gain ?? 1 }; });
    fx.filter((f) => f.fx === "shake").forEach((f) => kicks.push([f.at, 1.3 * f.gain]));
    props.filter((p) => p.spec.motion === "dropIn").forEach((p) => kicks.push([p.hit, 0.8]));
    for (const ac of sp.actions ?? []) if (ac.do === "explode") kicks.push([at(ac.at) + 0.05, 0.6]);
    const boards = (sp.boards ?? []).map((bd) => ({ spec: bd, t0: at(bd.at), t1: at(bd.until, b) }));
    shots.push({ id, a, b, set: curSet, spec: sp, lens, kicks, bolts, props, labels, boards, fx, tin });
  });

  // ---------------------------------------------------- cutaway state (as tech3d)
  function cutOf(key: string, t: number): CutState {
    const ck = `${key}|${t.toFixed(5)}`;
    const got = cutCache.get(ck);
    if (got) return got;
    const exs = (exTL.get(key) ?? []).slice().sort((x, y) => x.t0 - y.t0);
    const sls = (slTL.get(key) ?? []).slice().sort((x, y) => x.t0 - y.t0);
    const his = hiTL.get(key) ?? [];
    const def = defByKey.get(key);
    const st: CutState = {
      ex: (i: number) => {
        if (!def || !exs.length) return 0;
        const pid = def.parts[i].id;
        let v = 0;
        for (const e of exs) {
          if (e.parts && !e.parts.includes(pid)) continue;
          const order = e.parts ? e.parts.indexOf(pid) : i;
          v = v + (e.to - v) * EASE_PLACE(clamp((t - e.t0 - order * e.stagger) / e.dur));
        }
        return v;
      },
      slice: null,
      glow: {},
    };
    if (def && sls.length) {
      let on = 0, pos = 0, sweep = 0;
      let axis = def.slice.axis, keep = def.slice.keep, stop = def.slice.stop;
      for (const s of sls) {
        if (t < s.t0) break;
        axis = s.axis ?? axis; keep = s.keep ?? keep; stop = s.stop ?? stop;
        const ax = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        const out = def.centre[ax] + (keep === "neg" ? 1 : -1) * def.half[ax] * 1.2;
        const cut = def.centre[ax] + stop * def.half[ax];
        const u = EASE_INOUT(clamp((t - s.t0) / s.dur));
        const raw = clamp((t - s.t0) / s.dur);
        sweep = raw < 1 ? 0.75 * Math.sin(Math.PI * Math.min(1, raw * 1.6)) ** 0.5 : Math.max(0.08, 0.75 * clamp(1 - (t - s.t0 - s.dur) / 0.4));
        if (s.on) { on = Math.max(on, clamp(u * 4)); pos = lerp(out, cut, u); } else { pos = lerp(cut, out, u); on = u >= 1 ? 0 : on; sweep = 1 - u; }
      }
      if (on > 0) st.slice = { on, pos, axis, keep, sweep: sweep * 0.6 };
    }
    for (const h of his) { const g = clamp((t - h.t0 + LEAD) / 0.15) * clamp((h.t1 - t) / 0.2); if (g > 0) st.glow[h.part] = Math.max(st.glow[h.part] ?? 0, g); }
    if (cutCache.size > 4000) cutCache.clear();
    cutCache.set(ck, st);
    return st;
  }

  // ---------------------------------------------------- per-time helpers
  const shotAt = (t: number) => { let s = shots[0]; for (const x of shots) if (t >= x.a - 1e-9) s = x; return s; };
  const camOf = (Ln: Lens, t: number): Cam => {
    const tau = Math.max(0, t - Ln.a);
    const subj = Ln.subj(t);
    const k = 1 - Ln.push * tau;
    const pos: V3 = Ln.posAt ? Ln.posAt(t) : add(subj, scl(Ln.off, k));
    const cam = aim(pos, subj, Ln.fov(t), Ln.face);
    return { ...cam, roll: lerp(Ln.roll[0], Ln.roll[1], clamp(tau / Math.max(0.01, Ln.b - Ln.a))) };
  };
  const camAt = (t: number) => { const s = shotAt(t); return kicked(camOf(s.lens, t), kickAt(t, s.kicks)); };
  const boltsAt = (t: number) => shotAt(t).bolts.map((b) => boltState(b, t));
  const placeOf = (p: PropR, t: number) => p.place(t);
  const figuresAt = (t: number) => shotAt(t).props.filter((p) => p.fig && t >= p.a && t < p.b).map((p) => { const pl = p.place(t); return { key: p.key, p: pl.p, yaw: pl.yaw, s: pl.s, rig: figureRig(p.fig!, t) }; });
  const qa = (t: number) => {
    const s = shotAt(t);
    const bolts: Box[] = [];
    for (const st of boltsAt(t)) bolts.push(...boltBoxes(st));
    const props: Box[] = [...CYBER_SETS[s.set].blockers];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      const pl = p.place(t);
      if (p.def) props.push(...cutBoxes(p.key, p.def, pl, cutOf(p.key, t)));
      else if (p.fig) props.push(...figureBoxes(p.key, pl.p, pl.yaw, pl.s, figureRig(p.fig, t)));
      else if (p.spec.kit === "block") { const z = p.spec.size ?? [0.5, 0.5, 0.5]; props.push({ name: p.key, c: [pl.p[0], pl.p[1] + (z[1] * pl.s) / 2, pl.p[2]], h: [(z[0] * pl.s) / 2, (z[1] * pl.s) / 2, (z[2] * pl.s) / 2] }); }
    }
    return { bolts, props };
  };

  // ---------------------------------------------------- boards (layout from L.board)
  function boardRect(bd: BoardR, t: number) {
    const top = safeTop(t);
    const { w, h, margin } = L.board, pos = bd.spec.pos ?? "right";
    return { x: pos === "left" ? margin + w / 2 : pos === "top" ? L.W / 2 : L.W - margin - w / 2, y: pos === "top" ? top + h / 2 : top + 40 * L.k + h / 2, w, h };
  }
  const boardsAt = (t: number): BoardBox[] => {
    const out: BoardBox[] = [];
    for (const bd of shotAt(t).boards) {
      if (t < bd.t0 - LEAD || t >= bd.t1) continue;
      const c = bd.spec.count;
      let value = bd.spec.value ?? "";
      if (c) { const v = lerp(c.from, c.to, EASE_OUT(prog(t, bd.t0, bd.t0 + (c.dur ?? 1.0)))); value = `${c.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: c.decimals ?? 0, maximumFractionDigits: c.decimals ?? 0 })}${c.suffix ?? ""}`; }
      out.push({ title: bd.spec.title.toUpperCase(), value, ...boardRect(bd, t), u: clamp((t - bd.t0 + LEAD) / 0.25) * clamp((bd.t1 - t) / 0.15), tone: bd.spec.tone ?? "cyan" });
    }
    return out;
  };

  // ---------------------------------------------------- story devices
  const env = (t: number, t0: number, t1: number, fin = 0.28, fout = 0.2) => clamp((t - t0 + LEAD) / fin) * clamp((t1 - t) / fout);
  const fmtNum = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const caseR = (recipe.caseFile ?? []).map((c) => ({ c, t0: at(c.at), t1: at(c.until, at(c.at) + 2.5) }));
  const moneyR = (recipe.money ?? []).map((m) => ({ m, t0: at(m.at), t1: at(m.until, at(m.at) + 2.5) }));
  const countR = (recipe.countdown ?? []).map((m) => ({ m, t0: at(m.at), t1: at(m.until, at(m.at) + 2.5) }));
  const checkR = recipe.checklist ? (() => { const k = recipe.checklist!; const t0 = at(k.at); return { k, t0, t1: at(k.until, end + 1), ticks: k.items.map((_, i) => (k.ticks?.[i] !== undefined ? at(k.ticks[i]) : t0 + 0.5 + i * 0.6)) }; })() : null;
  if (checkR && (checkR.k.items.length < 2 || checkR.k.items.length > 4)) throw new Error("recipe: checklist needs 2-4 items");
  if (checkR) for (const it of checkR.k.items) if (it.split(/\s+/).length > 5) throw new Error(`recipe: checklist item "${it}" has more than 5 words`);
  const alertsR = (recipe.alerts ?? []).map((a) => ({ a, t0: at(a.at), t1: at(a.at) + (a.dur ?? ALERT_DUR) }));
  const flashes: FlashEv[] = [...glitches, ...alertsR.map((x) => ({ kind: "alert" as const, t0: x.t0, t1: x.t1, peak: ALERT_PEAK }))].sort((p, q) => p.t0 - q.t0);
  const devicesAt = (t: number): DeviceBox[] => {
    const out: DeviceBox[] = [];
    for (const { c, t0, t1 } of caseR) if (t >= t0 - LEAD && t < t1) out.push({ kind: "case", u: env(t, t0, t1), tau: t - t0, ...L.caseFile, name: c.name.toUpperCase(), year: c.year, amount: c.amount, title: (c.title ?? "CASE FILE").toUpperCase(), status: (c.status ?? "").toUpperCase() });
    for (const { m, t0, t1 } of moneyR) if (t >= t0 - LEAD && t < t1) {
      const frac = EASE_INOUT(prog(t, t0 + 0.15, t0 + 0.15 + (m.dur ?? 1.6)));
      const v = lerp(m.from, m.to, frac);
      out.push({ kind: "money", u: env(t, t0, t1), tau: t - t0, ...L.money, label: (m.label ?? "BALANCE").toUpperCase(), value: `${m.prefix ?? "$"}${fmtNum(v, m.decimals ?? 0)}${m.suffix ?? ""}`, frac });
    }
    for (const { m, t0, t1 } of countR) if (t >= t0 - LEAD && t < t1) {
      const s = Math.max(0, m.from - Math.max(0, t - t0) * (m.rate ?? 1));
      const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = Math.floor(s % 60);
      out.push({ kind: "count", u: env(t, t0, t1), tau: t - t0, ...L.countdown, label: (m.label ?? "TIME LEFT").toUpperCase(), value: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}` });
    }
    if (checkR && t >= checkR.t0 - LEAD && t < checkR.t1) out.push({ kind: "check", u: env(t, checkR.t0, checkR.t1, 0.3), tau: t - checkR.t0, ...L.checklist, title: (checkR.k.title ?? "HOW TO SPOT IT").toUpperCase(), items: checkR.k.items.map((x, i) => ({ text: x.toUpperCase(), on: clamp((t - checkR.ticks[i] + LEAD) / 0.25) })) });
    for (const { a, t0, t1 } of alertsR) if (t >= t0 && t < t1) out.push({ kind: "alert", u: clamp((t - t0) / 0.12) * clamp((t1 - t) / 0.35), tau: t - t0, ...L.alert.banner, text: (a.text ?? "ALERT").toUpperCase() });
    return out;
  };
  const glitchAt = (t: number) => { let g = 0; for (const f of glitches) if (t >= f.t0 && t < f.t1) g = Math.max(g, f.peak * Math.sin(Math.PI * (t - f.t0) / (f.t1 - f.t0))); return g; };
  const alertAt = (t: number) => { let g = 0; for (const x of alertsR) if (t >= x.t0 && t < x.t1) g = Math.max(g, ALERT_PEAK * clamp((t - x.t0) / 0.15) * clamp((x.t1 - t) / 0.5)); return g; };
  /** rects of the big devices (labels avoid them) */
  const deviceRects = (t: number) => devicesAt(t).filter((d) => d.kind !== "alert" && d.u > 0.05).map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h }));

  // ---------------------------------------------------- labels: one card per label, placed once at its pop-in time
  const labelPlan = new Map<string, { dx: number; dy: number }>();
  const placeLabel = (Lb: LabelR, s: CyberShotR): { dx: number; dy: number } => {
    const got = labelPlan.get(Lb.key);
    if (got) return got;
    const t = Math.min(Lb.t1 - 0.01, Lb.t0 + 0.05);
    const cam = camAt(t);
    const q = project(cam, Lb.target(t), L);
    const sz = labelSize(Lb.text, L);
    const top = safeTop(t);
    const faces = boltsAt(t).map((st) => { const f = boltFace(st); const p = project(cam, f.c, L); return p ? { x: p.x, y: p.y, w: 2 * f.r * p.k + 120, h: 2 * f.r * p.k + 120 } : null; }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];
    const others = s.labels.filter((o) => o.key !== Lb.key && o.t0 <= Lb.t0 && o.t1 > Lb.t0).map((o) => { const d = placeLabel(o, s); const qo = project(camAt(t), o.target(t), L); const so = labelSize(o.text, L); return qo ? { x: qo.x + d.dx, y: qo.y + d.dy, ...so } : null; }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];
    for (const bd of s.boards) if (bd.t1 > Lb.t0 && bd.t0 < Lb.t1) others.push(boardRect(bd, t));
    others.push(...deviceRects(t));
    const ax = q?.x ?? L.W / 2, ay = q?.y ?? L.H / 2;
    const prefer = Lb.side === "left" ? -1 : Lb.side === "right" ? 1 : ax > L.W / 2 ? -1 : 1;
    const cands: { dx: number; dy: number }[] = [];
    for (const dy of [-200, -120, -280, 120, 200, -360, 280, 0]) for (const sd of [prefer, -prefer]) cands.push({ dx: sd * (sz.w / 2 + 90 * L.k), dy: dy * L.k });
    const clampC = (cc: { x: number; y: number }) => ({ x: clamp(cc.x, L.safe.x0 + sz.w / 2, L.safe.x1 - sz.w / 2), y: clamp(cc.y, top + sz.h / 2, L.safe.bottom - sz.h / 2) });
    let best = cands[0], bestScore = Infinity;
    cands.forEach((cd, k) => {
      const cc = clampC({ x: ax + cd.dx, y: ay + cd.dy });
      const box = { ...cc, ...sz };
      let score = k * 0.01 + Math.hypot(cc.x - (ax + cd.dx), cc.y - (ay + cd.dy)) * 0.002;
      if (faces.some((f) => rectsHit(box, f, 10))) score += 100;
      if (others.some((o) => rectsHit(box, o, 18))) score += 50;
      if (Math.abs(cc.x - ax) < sz.w / 2 + 10 && Math.abs(cc.y - ay) < sz.h / 2 + 10) score += 20;
      if (score < bestScore) { bestScore = score; best = { dx: cc.x - ax, dy: cc.y - ay }; }
    });
    labelPlan.set(Lb.key, best);
    return best;
  };
  const labelsAt = (t: number): LabelBox[] => {
    const s = shotAt(t);
    const cam = camAt(t);
    const out: LabelBox[] = [];
    const top = safeTop(t);
    for (const Lb of s.labels) {
      if (t < Lb.t0 - LEAD || t >= Lb.t1) continue;
      const q = project(cam, Lb.target(t), L);
      if (!q) continue;
      const d = placeLabel(Lb, s);
      const sz = labelSize(Lb.text, L);
      const x = clamp(q.x + d.dx, L.safe.x0 + sz.w / 2, L.safe.x1 - sz.w / 2), y = clamp(q.y + d.dy, top + sz.h / 2, L.safe.bottom - sz.h / 2);
      const line = EASE_OUT(prog(t, Lb.t0 - LEAD, Lb.t0 + 0.16));
      const u = clamp((t - Lb.t0 - 0.06) / 0.28) * clamp((Lb.t1 - t) / 0.15);
      out.push({ key: Lb.key, text: Lb.text, ax: q.x, ay: q.y, x, y, ...sz, u, line: line * clamp((Lb.t1 - t) / 0.15), tone: Lb.tone });
    }
    return out;
  };
  const textsAt = (t: number) => {
    const out: string[] = [];
    if (t <= hookUntil) out.push(recipe.hook.text.replace(/\*/g, ""));
    for (const l of labelsAt(t)) if (l.u > 0.5) out.push(l.text);
    for (const b of boardsAt(t)) if (b.u > 0.5) out.push(`${b.title} ${b.value}`);
    for (const d of devicesAt(t)) if (d.u > 0.5) out.push(d.kind === "case" ? `${d.title} ${d.name} ${d.year} ${d.amount}` : d.kind === "check" ? `${d.title} ${d.items.map((x) => x.text).join(" / ")}` : d.kind === "alert" ? d.text : `${d.label} ${d.value}`);
    return out;
  };

  // ---------------------------------------------------- audio cue plan (tools/story_mix.py format)
  const cues: Cue[] = [{ t: 0, sfx: recipe.sfx0 ?? "impact", db: -1 }];
  for (const s of shots) {
    if (s.spec.cam.preset === "slamZoom") cues.push({ t: at(s.spec.cam.hit, s.a + 0.12) - 0.02, sfx: "impact", db: -1 });
    if (s.tin === "whip" || s.spec.cam.preset === "whip") cues.push({ t: s.a, sfx: "whoosh", db: -4 });
    if (s.tin === "glitch") cues.push({ t: s.a - 0.04, sfx: "buzz", db: -14 });
    if (s.spec.cam.preset === "flyThrough") cues.push({ t: s.a + 0.05, sfx: "whoosh", db: -6 });
    for (const ac of s.spec.actions ?? []) {
      const t0 = at(ac.at);
      if (ac.do === "explode") cues.push({ t: t0, sfx: "whoosh", db: -3 }, { t: t0 + 0.05, sfx: "boom", db: -8 });
      if (ac.do === "assemble") cues.push({ t: t0, sfx: "whoosh", db: -5 }, { t: t0 + (ac.dur ?? 0.75), sfx: "thud", db: -6 });
      if (ac.do === "slice") cues.push({ t: t0, sfx: "whoosh", db: -6 });
      if (ac.do === "label") cues.push({ t: t0, sfx: "beep", db: -14 });
      if (ac.do === "highlight") cues.push({ t: t0, sfx: "ding", db: -10 });
    }
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "popIn") cues.push({ t: p.hit - 0.1, sfx: "whoosh", db: -8 });
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "slideOut") cues.push({ t: p.hit, sfx: "slide", db: -8 });
    for (const bd of s.boards) { cues.push({ t: bd.t0, sfx: "beep", db: -12 }); if (bd.spec.count) cues.push({ t: bd.t0 + (bd.spec.count.dur ?? 1), sfx: "ding", db: -9 }); }
    for (const x of s.spec.sfx ?? []) cues.push({ t: at(x.at), sfx: x.sfx, db: x.db });
  }
  for (const { t0 } of caseR) cues.push({ t: t0, sfx: "paper", db: -6 }, { t: t0 + 0.35, sfx: "punch", db: -8 });
  for (const { t0 } of moneyR) cues.push({ t: t0 + 0.15, sfx: "cash", db: -8 });
  for (const { t0 } of countR) cues.push({ t: t0, sfx: "clock", db: -10 });
  for (const { t0 } of alertsR) cues.push({ t: t0, sfx: "alarm", db: -9 });
  if (checkR) { cues.push({ t: checkR.t0, sfx: "whoosh", db: -8 }); checkR.ticks.forEach((tt) => cues.push({ t: tt, sfx: "ding", db: -10 })); }
  cues.push({ t: end - 0.35, sfx: "whoosh", db: -2 });
  const audio = { music: recipe.music ?? "upbeat", cues: cues.filter((q) => q.t >= 0 && q.t < end).sort((x, y) => x.t - y.t) };

  return { recipe, slug: recipe.slug, duration, shots, words, L, at, hookUntil, hookAgain, shotAt, camAt, boltsAt, figuresAt, cutOf, placeOf, labelsAt, boardsAt, devicesAt, flashes, glitchAt, alertAt, qa, textsAt, audio };
};

// ------------------------------------------------------------------ BOLT tracks (as tech3d)
const boltTrack = (bs: BoltSpec, a: number, b: number, set: CyberSet, sid: string, at: (x: At | undefined, d?: number) => number, placeV: (p: Place, s: CyberSet, id: string) => V3,
  targetFn: (t: CyberTarget) => (t: number) => V3, lensPos: () => V3, recipe: CyberRecipe, words: readonly Word[], cam: CyberCam): BoltTrack => {
  const p0 = placeV(bs.at, set, sid), p1 = bs.to ? placeV(bs.to, set, sid) : p0;
  const t0 = at(bs.from, a);
  const segs: { t0: number; pose: BoltPose; face?: BoltFace }[] = [{ t0: Math.max(a, t0 - LEAD), pose: bs.pose, face: bs.face }];
  const faces: { t0: number; face: BoltFace }[] = [];
  for (const x of bs.then ?? []) { const tt = at(x.at) - LEAD; if (x.pose) segs.push({ t0: tt, pose: x.pose, face: x.face }); else if (x.face) faces.push({ t0: tt, face: x.face }); }
  const look = bs.look;
  const lookFn = look !== undefined && typeof look !== "number" ? (() => { try { return targetFn(look); } catch { return null; } })() : null;
  const camT = typeof cam.target === "string" ? cam.target.split(".")[0] : "";
  const talkOn = recipe.talk !== "none" && (bs.talk ?? camT === bs.id);
  const ptT = bs.pointAt ?? (camT && camT !== bs.id ? cam.target : undefined);
  const ptFn = ptT !== undefined ? (() => { try { return targetFn(ptT); } catch { return null; } })() : null;
  const pos = (t: number): V3 => lerpV(p0, p1, EASE_INOUT(clamp((t - a) / Math.max(0.3, b - a))));
  return {
    id: bs.id, seed: 3 + bs.id.length * 7, s: bs.scale ?? 1, hover: bs.hover ?? HOVER, at: pos,
    yaw: (t) => { if (typeof look === "number") return look * D2R; const p = pos(t); return yawTo(p, lookFn ? lookFn(t) : lensPos()); },
    segs, faces,
    pointAt: ptFn ? (t) => ptFn(t) : () => lensPos(),
    talk: talkOn ? (t) => visemeAt(words, t) : undefined,
  };
};
export { BOLT_R };

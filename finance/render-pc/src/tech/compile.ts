// The tech3d recipe compiler: TechRecipe + voice words -> shots with lenses, BOLT tracks, cutaway states, label and
// board layouts, the audio cue plan and the QA/gate data. A pure function of t, like src/fin/recipe/compile.tsx, but
// separate from it, so the Block Money recipes can never change because of this kit.
import type { V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import { kickAt, kicked, pushK, whipK } from "../fin/lib/camera";
import type { Cam } from "../fin/lib/camera";
import { EASE_INOUT, EASE_OUT, EASE_PLACE, LEAD, prog } from "../fin/lib/motion";
import { visemeAt } from "../fin/lib/lipsync";
import { makeAt } from "../fin/recipe/timing";
import type { Word } from "../fin/recipe/types";
import { BOLT_R, boltBoxes, boltFace, boltState, HOVER } from "./bolt";
import type { BoltFace, BoltPose, BoltState, BoltTrack } from "./bolt";
import { cutBoxes, NO_CUT, objBox, partWorld } from "./cutaway";
import type { CutState, ObjDef, Placement } from "./cutaway";
import { OBJECTS } from "./objects";
import { TECH_SETS } from "./sets";
import type { TechSet, TechSetId } from "./sets";
import { chapterCues, landscapeLens, LF, liftNeeded, lowerThirdY, resolveChapters } from "../longform/kit";
import type { ChapterR, FaceBand } from "../longform/kit";
import { hookLines } from "./hud";
import type { At, BoltSpec, Place, TechBoard, TechCam, TechProp, TechRecipe, TechShot, TechTarget } from "./types";

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

export type Box = { name: string; c: V3; h: V3 };
export type Lens = { a: number; b: number; subj: (t: number) => V3; off: V3; fov: (t: number) => number; face: number; push: number; roll: [number, number]; blur: number; posAt?: (t: number) => V3; shutter: number };
export type PropR = { key: string; spec: TechProp; a: number; b: number; hit: number; def?: ObjDef; place: (t: number) => Placement; show: (t: number) => number };
export type LabelR = { key: string; text: string; t0: number; t1: number; side: "left" | "right" | "auto"; target: (t: number) => V3; shot: string };
export type BoardR = { spec: TechBoard; t0: number; t1: number };
export type FxR = { fx: "shake" | "flash" | "sparks"; at: number; p: (t: number) => V3; gain: number };
export type TechShotR = { id: string; a: number; b: number; set: TechSetId; spec: TechShot; lens: Lens; kicks: [number, number][]; bolts: BoltTrack[]; props: PropR[]; labels: LabelR[]; boards: BoardR[]; fx: FxR[] };
export type Cue = { t: number; sfx: string; db?: number };
export type LabelBox = { key: string; text: string; ax: number; ay: number; x: number; y: number; w: number; h: number; u: number; line: number };
export type BoardBox = { title: string; value: string; x: number; y: number; w: number; h: number; u: number };

export type TechCompiled = {
  recipe: TechRecipe; slug: string; duration: number; shots: TechShotR[]; words: readonly Word[];
  at: (a: At | undefined, d?: number) => number; hookUntil: number; hookAgain: number | null;
  shotAt: (t: number) => TechShotR;
  camAt: (t: number) => Cam;
  boltsAt: (t: number) => BoltState[];
  cutOf: (key: string, t: number) => CutState;
  placeOf: (p: PropR, t: number) => Placement;
  labelsAt: (t: number) => LabelBox[];
  boardsAt: (t: number) => BoardBox[];
  qa: (t: number) => { bolts: Box[]; props: Box[] };
  textsAt: (t: number) => string[];
  audio: { music: string; cues: Cue[] };
  /** "format": "landscape" (1920x1080 long-form, LONGFORM.md); portrait otherwise */
  landscape: boolean;
  /** the screen layout (portrait = the Shorts numbers, landscape = the long-form ones) */
  layout: TechLayout;
  /** landscape: chapters resolved to seconds (empty in portrait) */
  chapters: ChapterR[];
  /** landscape: the lower-third caption centre for a shot (px at 1080 tall) */
  capY: (s: TechShotR) => number;
  /** visual changes besides cuts (hits, kicks, cutaway moves, prop motions, BOLT pose/face changes, labels, boards, fx) */
  events: () => [number, string][];
};

/** camera presets (all keep moving: a push, an orbit, a slam creep, a fly-through) */
export const TECH_CAMS = {
  hookZoom: { dist: 2.0, h: 0.15, fov: 44, face: 0.42, push: 0.05, blur: 1.4, roll: [-2, 0.5] as [number, number] },
  closeUp: { dist: 1.5, h: 0.1, fov: 40, face: 0.42, push: 0.06, blur: 1.6, roll: [0, 1.2] as [number, number] },
  medium: { dist: 3.2, h: 0.4, fov: 46, face: 0.45, push: 0.05, blur: 1.0, roll: [0, 1] as [number, number] },
  wide: { dist: 8.0, h: 2.2, fov: 50, face: 0.5, push: 0.03, blur: 0.5, roll: [0, 0.6] as [number, number] },
  slamZoom: { dist: 2.6, h: 0.25, fov: 44, face: 0.45, push: 0.05, blur: 1.2, roll: [0, 1.5] as [number, number] },
  pushIn: { dist: 3.0, h: 0.4, fov: 44, face: 0.45, push: 0, blur: 1.1, roll: [0, 1] as [number, number] },
  whip: { dist: 3.0, h: 0.35, fov: 48, face: 0.46, push: 0.05, blur: 1.0, roll: [4, 0] as [number, number] },
  orbit: { dist: 4.0, h: 0.9, fov: 44, face: 0.47, push: 0.02, blur: 0.9, roll: [0, 0] as [number, number] },
  flyThrough: { dist: 6.0, h: 1.0, fov: 46, face: 0.47, push: 0, blur: 0.8, roll: [0, 3] as [number, number] },
  explodeOrbit: { dist: 6.5, h: 2.0, fov: 44, face: 0.47, push: 0, blur: 0.8, roll: [0, 0] as [number, number] },
};

// ------------------------------------------------------------------ projection (1080 x 1920)
export const project = (cam: Cam, p: V3, h = 1920, top = 0, w = 1080): { x: number; y: number; k: number; z: number } | null => {
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
  const k = h / 2 / Math.tan((cam.fov * Math.PI) / 360);
  return { x: w / 2 + (dot(d, r) / z) * k, y: top + h / 2 - (dot(d, u) / z) * k, k: k / z, z };
};
/** card size of a label at phone size (Poppins 800, uppercase) */
export const LABEL_FS = 54;
export const labelSize = (text: string) => ({ w: Math.round(text.length * 0.66 * LABEL_FS + 64), h: Math.round(LABEL_FS * 1.15 + 34) });
/** safe area for cards: below the hook (when shown), above the caption band, inside the frame and the right rail */
export const SAFE_TOP = 250, SAFE_TOP_HOOK = 560, SAFE_BOTTOM = 1190, SAFE_X0 = 50, SAFE_X1 = 1030;
/** the per-format screen layout: portrait = the numbers above (unchanged), landscape = the long-form numbers (LF):
 *  hook top-centre at 70, cards above the lower-third band (centre 905 +- 72), 60 px side margins */
export type TechLayout = { W: number; H: number; CX: number; AY0: number; SAFE_TOP: number; SAFE_TOP_HOOK: number; SAFE_BOTTOM: number; SAFE_X0: number; SAFE_X1: number; BOARD_W: number; BOARD_H: number; BOARD_M: number; HOOK_TOP: number; HOOK_FS: number };
export const PORTRAIT_LAYOUT: TechLayout = { W: 1080, H: 1920, CX: 540, AY0: 900, SAFE_TOP, SAFE_TOP_HOOK, SAFE_BOTTOM, SAFE_X0, SAFE_X1, BOARD_W: 400, BOARD_H: 250, BOARD_M: 60, HOOK_TOP: 236, HOOK_FS: 100 };
/** landscape: SAFE_TOP_HOOK is set per recipe from the hook's line count (below the hook card) */
export const landscapeLayout = (hookN: number): TechLayout => ({
  W: LF.W, H: LF.H, CX: LF.W / 2, AY0: 500, SAFE_TOP: 60, SAFE_TOP_HOOK: Math.round(LF.HOOK_TOP + hookN * LF.HOOK_SIZE * 1.04 + 52 + 30),
  SAFE_BOTTOM: LF.CAP_Y - LF.CAP_HALF - 14, SAFE_X0: 60, SAFE_X1: LF.W - 60, BOARD_W: 400, BOARD_H: 250, BOARD_M: 80, HOOK_TOP: LF.HOOK_TOP, HOOK_FS: LF.HOOK_SIZE,
});
const rectsHit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, m = 14) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + 2 * m && Math.abs(a.y - b.y) * 2 < a.h + b.h + 2 * m;

// ------------------------------------------------------------------ the compiler
export const compileTech = (recipe: TechRecipe, words: readonly Word[], voDuration?: number): TechCompiled => {
  if (recipe.kit !== "tech3d") throw new Error(`recipe ${recipe.slug}: kit must be "tech3d"`);
  const LS = recipe.format === "landscape";
  if (recipe.format !== undefined && recipe.format !== "short" && recipe.format !== "long" && !LS) throw new Error(`recipe: format "${recipe.format}" (use "short", "long" or "landscape")`);
  if (recipe.chapters && !LS) throw new Error('recipe: chapters need "format": "landscape"');
  const LY: TechLayout = LS ? landscapeLayout(hookLines(recipe.hook.text, true).length) : PORTRAIT_LAYOUT;
  const { at, lineEnd } = makeAt(words);
  const durS = recipe.duration ?? voDuration ?? Math.max(...words.map((w) => w.end)) + 0.8;
  const duration = Math.round(durS * FPS);
  const end = duration / FPS;
  const castIds = Object.keys(recipe.cast);
  for (const [id, look] of Object.entries(recipe.cast)) if (look !== "BOLT") throw new Error(`recipe: cast "${id}" must be "BOLT" (the tech3d kit has one mascot)`);
  const starts = recipe.shots.map((s) => at(s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1]) throw new Error(`recipe: shot ${i + 1} starts at ${a.toFixed(2)} s, not after shot ${i} (${starts[i - 1].toFixed(2)} s)`); });
  if (Math.abs(starts[0]) > 1e-6) throw new Error("recipe: the first shot must start at 0");
  const hookUntil = recipe.hook.until !== undefined ? at(recipe.hook.until) : lineEnd(1) + 0.25;
  const hookAgain = recipe.hook.again !== undefined ? at(recipe.hook.again) : null;

  // ---------------------------------------------------- cutaway timelines (per prop key, across all shots)
  type ExA = { t0: number; dur: number; to: number; stagger: number; parts: string[] | null };
  type SlA = { t0: number; dur: number; on: boolean; axis?: "x" | "y" | "z"; keep?: "neg" | "pos"; stop?: number };
  const exTL = new Map<string, ExA[]>(), slTL = new Map<string, SlA[]>(), hiTL = new Map<string, { part: string; t0: number; t1: number }[]>();
  const push = <T,>(m: Map<string, T[]>, k: string, v: T) => { const l = m.get(k) ?? []; l.push(v); m.set(k, l); };
  const cutCache = new Map<string, CutState>();
  const defByKey = new Map<string, ObjDef>();

  let curSet: TechSetId = recipe.shots[0].set ?? "studio";
  const shots: TechShotR[] = [];
  const globalProps = (recipe.props ?? []).map((p) => ({ p, a: at(p.from, 0), b: at(p.until, end + 1) }));
  const defOf = (spec: TechProp, sid: string): ObjDef | undefined => {
    if (!spec.obj) return undefined;
    const d = OBJECTS[spec.obj];
    if (!d) throw new Error(`recipe ${sid}: no object "${spec.obj}" (has: ${Object.keys(OBJECTS).join(", ")})`);
    return d;
  };

  const placeV = (pl: Place, set: TechSet, sid: string): V3 => {
    if (Array.isArray(pl)) return pl.length === 2 ? [pl[0], 0, pl[1]] : (pl as V3);
    const [name, off] = pl.split(":");
    const a = set.anchors[name];
    if (!a) throw new Error(`recipe ${sid}: no anchor "${name}" in set ${set.id} (has: ${Object.keys(set.anchors).join(", ")})`);
    const o: V3 = off ? (off.split(",").map(Number) as V3) : [0, 0, 0];
    return add(a, o);
  };

  recipe.shots.forEach((sp, i) => {
    curSet = sp.set ?? curSet;
    const set = TECH_SETS[curSet];
    if (!set) throw new Error(`recipe: no set "${curSet}" (has: ${Object.keys(TECH_SETS).join(", ")})`);
    const a = starts[i], b = i + 1 < starts.length ? starts[i + 1] : end;
    const id = `S${String(i + 1).padStart(2, "0")}`;
    // props
    const props: PropR[] = [];
    const addProp = (spec: TechProp, pa: number, pb: number) => {
      const def = defOf(spec, id);
      if (!spec.obj && !spec.kit) throw new Error(`recipe ${id}: prop "${spec.id}" needs "obj" or "kit"`);
      const base = placeV(spec.at, set, id);
      const hit = at(spec.hit, a + 0.12);
      const keys = (spec.path ?? []).map(([kt, kp]) => ({ t: at(kt), p: placeV(kp, set, id) }));
      const s0 = spec.s ?? 1;
      const place = (t: number): Placement => {
        let p = base, yaw = (spec.yaw ?? 0) * D2R, s = s0, pitch = (spec.pitch ?? 0) * D2R, roll = (spec.roll ?? 0) * D2R;
        switch (spec.motion) {
          case "turntable": yaw += (spec.spin ?? 12) * D2R * t; break;
          case "bob": p = add(p, [0, 0.07 * Math.sin(t * 2.2), 0]); yaw += 0.08 * Math.sin(t * 0.9); break;
          case "popIn": s = s0 * (t < hit - 0.3 ? 0.001 : Math.max(0.001, EASE_PLACE(prog(t, hit - 0.3, hit)))); yaw += 0.1 * Math.sin(t * 1.1); break;
          case "dropIn": { const H = 2.2, u = clamp((t - (hit - 0.4)) / 0.4); p = add(p, [0, t < hit ? H * (1 - u * u) : 0.06 * Math.abs(Math.sin((t - hit) * 16)) * Math.exp(-(t - hit) * 6), 0]); break; }
          case "path": {
            if (keys.length) {
              let k = 0;
              while (k < keys.length - 1 && t >= keys[k + 1].t) k++;
              const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
              const u = B.t > A.t ? clamp((t - A.t) / (B.t - A.t)) : 0;
              p = lerpV(A.p, B.p, k === keys.length - 1 ? 0 : u);
              const d = k === keys.length - 1 ? sub(keys[k].p, keys[Math.max(0, k - 1)].p) : sub(B.p, A.p);
              const hz = Math.hypot(d[0], d[2]);
              if (hz > 1e-3 && spec.yaw === undefined) yaw = Math.atan2(-d[2], d[0]);
              const gamma = Math.atan2(d[1], Math.max(1e-3, hz)); // flight-path angle (negative descending)
              // nose attitude: a few degrees above the path on approach; flare in the last 0.5 s of a leg that ends on the
              // ground; nose down on the runway
              let nose = (k === keys.length - 1 || B.p[1] < 0.05) && A.p[1] < 0.05 ? 0 : gamma + 5 * D2R;
              if (B.p[1] < 0.05 && A.p[1] >= 0.05) nose += 4 * D2R * clamp(1 - (B.t - t) / 0.5) ;
              roll += nose; // the object's front is +x: a nose-up turn is about local z
              pitch += (A.p[1] > 0.05 ? 1.6 : 0.2) * D2R * Math.sin(t * 1.7);
            }
            break;
          }
        }
        return { p, yaw, s, pitch, roll };
      };
      if (def) defByKey.set(spec.id, def);
      props.push({ key: spec.id, spec, a: pa, b: pb, hit, def, place, show: (t) => (spec.motion === "popIn" ? clamp((t - hit + 0.3) / 0.05) : 1) });
    };
    (sp.props ?? []).forEach((ps) => addProp(ps, a, b));
    globalProps.filter((g) => g.a < b && g.b > a && (!g.p.sets || g.p.sets.includes(curSet)) && !(sp.props ?? []).some((q) => q.id === g.p.id)).forEach((g) => addProp(g.p, Math.max(a, g.a), Math.min(b, g.b)));

    // targets: "bolt", "bolt.face", "<prop>", "<prop>.<part>", anchors, [x, y, z]
    const bolts: BoltTrack[] = [];
    const states = new Map<string, (t: number) => BoltState>();
    const targetFn = (tg: TechTarget): ((t: number) => V3) => {
      if (isV3(tg)) return () => tg;
      const [name, part] = tg.split(".");
      if (castIds.includes(name)) {
        return (t) => {
          const f = states.get(name);
          if (!f) throw new Error(`recipe ${id}: target "${tg}" but ${name} is not in this shot`);
          const st = f(t);
          if (part === "face") return boltFace(st).c;
          return [st.x, st.y, st.z];
        };
      }
      const pr = props.find((p) => p.key === name);
      if (pr) {
        if (part && pr.def) { const def = pr.def; return (t) => partWorld(def, pr.place(t), cutOf(pr.key, t), part); }
        if (pr.def) { const def = pr.def; return (t) => objBox(def, pr.place(t)).c; }
        return (t) => pr.place(t).p;
      }
      const [an, off] = tg.split(":");
      if (set.anchors[an]) { const o = off ? (off.split(",").map(Number) as V3) : [0, 0, 0]; return () => add(set.anchors[an], o as V3); }
      throw new Error(`recipe ${id}: no target "${tg}" (cast: ${castIds.join(", ")}; props: ${props.map((p) => p.key).join(", ") || "none"}; anchors: ${Object.keys(set.anchors).join(", ")})`);
    };

    // lens
    const c0 = sp.cam;
    const P0 = TECH_CAMS[c0.preset];
    if (!P0) throw new Error(`recipe ${id}: no camera preset "${c0.preset}" (has: ${Object.keys(TECH_CAMS).join(", ")})`);
    // landscape: keep the vertical fov, narrow the wider presets (LANDSCAPE_LENS [fov x, dist x])
    const lk = LS ? landscapeLens(c0.preset) : null;
    const P = lk ? { ...P0, fov: P0.fov * lk[0], dist: P0.dist * lk[1] } : P0;
    const c: TechCam = lk && c0.fov !== undefined ? { ...c0, fov: c0.fov * lk[0] } : c0;
    const SLAM0 = lk ? 60 * lk[0] : 60;
    const camTarget = c.target ?? "centre";
    // BOLT positions must exist before the lens can aim at them: build the tracks with a provisional yaw first
    let lensPos0: V3 = [0, 1.5, 6];
    for (const bs of sp.actors ?? []) {
      if (!recipe.cast[bs.id]) throw new Error(`recipe ${id}: actor "${bs.id}" is not in cast`);
      bolts.push(boltTrack(bs, a, b, set, id, at, placeV, targetFn, () => lensPos0, recipe, words, c));
    }
    bolts.forEach((tr) => states.set(tr.id, (t) => boltState(tr, t)));
    const subj = targetFn(camTarget);
    const s0 = subj(a);
    const az = (c.az ?? 0) * D2R, dist = c.dist ?? P.dist, h = c.h ?? P.h;
    const off: V3 = [Math.sin(az) * dist, h, Math.cos(az) * dist];
    lensPos0 = add(s0, off);
    const hit = at(c.hit, a + 0.12);
    let lens: Lens = { a, b, subj, off, fov: () => c.fov ?? P.fov, face: c.face ?? P.face, push: P.push, roll: c.roll ?? P.roll, blur: c.blur ?? P.blur, shutter: 0.35 };
    const fov0 = c.fov ?? P.fov;
    switch (c.preset) {
      case "slamZoom": {
        lens.fov = (t) => (t < hit - 0.2 ? SLAM0 : t < hit ? SLAM0 + 1.8 * Math.sin((Math.PI * (t - hit + 0.2)) / 0.2) : lerp(SLAM0, fov0, easeOut3((t - hit) / 0.12)) - 1.5 * clamp((t - hit - 0.12) / 2));
        break;
      }
      case "hookZoom": {
        const far: V3 = [off[0] * 1.3, off[1] * 1.15, off[2] * 1.3];
        lens.posAt = (t) => { const u = easeOut3((t - a) / 0.4); const q = lerpV(far, off, u); const k = 1 - P.push * Math.max(0, t - a - 0.4); return add(subj(t), [q[0] * k, q[1] * k, q[2] * k]); };
        break;
      }
      case "pushIn": lens.posAt = (t) => { const k = pushK(t, a, 0.003, 0.006, 35); return add(subj(t), [off[0] * k, off[1] * k, off[2] * k]); }; break;
      case "whip": { const s1 = subj; lens = { ...lens, shutter: 0.2, posAt: (t) => add(s1(t), off), subj: (t) => { const q = s1(t), pp = add(q, off); return add(pp, rotY(sub(q, pp), 35 * D2R * whipK(t, a))); } }; break; }
      case "orbit": { const sw = (c.sweep ?? 44) * D2R; lens.posAt = (t) => add(subj(t), rotY(off, lerp(-sw / 2, sw / 2, clamp((t - a) / Math.max(0.3, b - a))))); break; }
      case "flyThrough": {
        const d1 = c.endDist ?? 0.9, T = c.dur ?? b - a;
        lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / T)); const k = lerp(1, d1 / dist, u); const sw = rotY([off[0], off[1] * lerp(1, 0.35, u), off[2]], lerp(0, 18 * D2R, u)); return add(subj(t), [sw[0] * k, sw[1] * k, sw[2] * k]); };
        lens.fov = (t) => lerp(fov0, fov0 + 16, EASE_INOUT(clamp((t - a) / T)));
        break;
      }
      case "explodeOrbit": {
        const sw = (c.sweep ?? 80) * D2R;
        const tg = typeof camTarget === "string" ? camTarget.split(".")[0] : "";
        lens.posAt = (t) => {
          const pr = props.find((p) => p.key === tg);
          let ex = 0;
          if (pr?.def) { const cs = cutOf(pr.key, t); for (let k = 0; k < pr.def.parts.length; k++) ex = Math.max(ex, cs.ex(k)); }
          const k = 1 + 0.25 * ex;
          const v = rotY(off, lerp(-sw / 2, sw / 2, EASE_INOUT(clamp((t - a) / Math.max(0.3, b - a)))));
          return add(subj(t), [v[0] * k, v[1] * k, v[2] * k]);
        };
        break;
      }
    }
    // transitions: punch (default), whip, cut
    const tin = i === 0 ? "cut" : sp.in ?? (c.preset === "slamZoom" || c.preset === "whip" || c.preset === "flyThrough" ? "cut" : "punch");
    const kicks: [number, number][] = [];
    if (c.preset === "slamZoom") kicks.push([hit, 1.2]);
    if (c.preset === "hookZoom") kicks.push([a + 0.38, 0.7]);
    if (tin === "punch") { const f0 = lens.fov; lens = { ...lens, fov: (t) => f0(t) + 7 * (1 - easeOut3((t - a) / 0.14)) }; kicks.push([a, 0.5]); }
    if (tin === "whip") {
      const s1 = lens.subj, p1 = lens.posAt ?? ((t: number) => add(s1(t), off));
      lens = { ...lens, shutter: 0.2, posAt: p1, subj: (t) => { const q = s1(t), pp = p1(t); return add(pp, rotY(sub(q, pp), 32 * D2R * whipK(t, a))); } };
    }
    // actions
    const labels: LabelR[] = [];
    for (const ac of sp.actions ?? []) {
      const t0 = at(ac.at);
      const [pk, part] = ac.on.split(".");
      const pr = props.find((p) => p.key === pk);
      if (ac.do !== "label" && (!pr || !pr.def)) throw new Error(`recipe ${id}: action "${ac.do}" on "${ac.on}": no cutaway prop "${pk}" in this shot`);
      if (ac.do === "explode" || ac.do === "assemble") push(exTL, pk, { t0, dur: ac.dur ?? 0.75, to: ac.do === "assemble" ? 0 : ac.amount ?? 1, stagger: ac.stagger ?? 0.035, parts: ac.parts ?? null });
      if (ac.do === "slice" || ac.do === "unslice") push(slTL, pk, { t0, dur: ac.dur ?? 0.7, on: ac.do === "slice", axis: ac.axis, keep: ac.keep, stop: ac.stop });
      if (ac.do === "highlight") { if (!part) throw new Error(`recipe ${id}: highlight needs "<prop>.<part>"`); partWorld(pr!.def!, pr!.place(t0), NO_CUT, part); push(hiTL, pk, { part, t0, t1: at(ac.until, b) }); }
      if (ac.do === "label") {
        const def = pr?.def;
        const text = (ac.text ?? (def && part ? def.parts.find((q) => q.id === part)?.label : undefined) ?? "").toUpperCase();
        if (!text) throw new Error(`recipe ${id}: label on "${ac.on}" needs "text" (the part has no default label)`);
        if (text.trim().split(/\s+/).length > 3) throw new Error(`recipe ${id}: label "${text}" has more than 3 words`);
        labels.push({ key: `${id}.${ac.on}.${labels.length}`, text, t0, t1: at(ac.until, b), side: ac.side ?? "auto", target: targetFn(ac.on), shot: id });
      }
    }
    const fx: FxR[] = (sp.fx ?? []).map((f) => {
      const o = typeof f === "string" ? { fx: f } : f;
      return { fx: o.fx, at: at(o.at, hit), p: targetFn(o.p ?? camTarget), gain: o.gain ?? 1 };
    });
    fx.filter((f) => f.fx === "shake").forEach((f) => kicks.push([f.at, 1.3 * f.gain]));
    props.filter((p) => p.spec.motion === "dropIn").forEach((p) => kicks.push([p.hit, 0.8]));
    for (const ac of sp.actions ?? []) if (ac.do === "explode") kicks.push([at(ac.at) + 0.05, 0.6]);
    const boards = (sp.boards ?? []).map((bd) => ({ spec: bd, t0: at(bd.at), t1: at(bd.until, b) }));
    shots.push({ id, a, b, set: curSet, spec: sp, lens, kicks, bolts, props, labels, boards, fx });
  });

  // ---------------------------------------------------- cutaway state
  cutCache.clear();
  function cutOf(key: string, t: number): CutState {
    const ck = `${key}|${t.toFixed(5)}`;
    const hit = cutCache.get(ck);
    if (hit) return hit;
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
          const u = EASE_PLACE(clamp((t - e.t0 - order * e.stagger) / e.dur));
          v = v + (e.to - v) * u;
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
    for (const h of his) {
      const g = clamp((t - h.t0 + LEAD) / 0.15) * clamp((h.t1 - t) / 0.2);
      if (g > 0) st.glow[h.part] = Math.max(st.glow[h.part] ?? 0, g);
    }
    if (cutCache.size > 4000) cutCache.clear();
    cutCache.set(ck, st);
    return st;
  }

  // ---------------------------------------------------- per-time helpers
  /** the last shot with a <= t (+1e-9), else the first: a binary search (shot starts are strictly increasing), the same
   *  answer as the old linear scan, flat with the shot count (long-form has hundreds of shots) */
  const shotAt = (t: number) => {
    let lo = 0, hi = shots.length - 1;
    if (!(t >= shots[0].a - 1e-9)) return shots[0];
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (t >= shots[mid].a - 1e-9) lo = mid; else hi = mid - 1; }
    return shots[lo];
  };
  const camOf = (L: Lens, t: number): Cam => {
    const tau = Math.max(0, t - L.a);
    const subj = L.subj(t);
    const k = 1 - L.push * tau;
    const pos: V3 = L.posAt ? L.posAt(t) : add(subj, [L.off[0] * k, L.off[1] * k, L.off[2] * k]);
    const cam = aim(pos, subj, L.fov(t), L.face);
    return { ...cam, roll: lerp(L.roll[0], L.roll[1], clamp(tau / Math.max(0.01, L.b - L.a))) };
  };
  const camAt = (t: number) => { const s = shotAt(t); return kicked(camOf(s.lens, t), kickAt(t, s.kicks)); };
  const boltsAt = (t: number) => shotAt(t).bolts.map((b) => boltState(b, t));
  const placeOf = (p: PropR, t: number) => p.place(t);
  // projection in this format's frame
  const prj = (cam: Cam, p: V3) => project(cam, p, LY.H, 0, LY.W);
  // ---------------------------------------------------- long-form: chapters, caption-safe framing, the lower third
  const chapters = LS ? resolveChapters(recipe.chapters, at, hookUntil) : [];
  /** BOLT's screen faces in the caption column (x 240-1680) at 5 samples across a shot, as bands (px at 1080 tall) */
  const facesOf = (s: TechShotR): FaceBand[] => {
    const out: FaceBand[] = [];
    for (const u of [0.1, 0.3, 0.5, 0.7, 0.92]) {
      const tm = s.a + (s.b - s.a) * u;
      const cam = kicked(camOf(s.lens, tm), kickAt(tm, s.kicks));
      for (const tr of s.bolts) {
        const f = boltFace(boltState(tr, tm));
        const q = prj(cam, f.c);
        if (!q || q.x < LF.CAP_SIDE || q.x > LF.W - LF.CAP_SIDE) continue;
        const r = f.r * q.k;
        if (q.y + r > 0 && q.y - r < LF.H) out.push({ top: q.y - r, bot: q.y + r });
      }
    }
    return out;
  };
  if (LS) {
    // caption-safe framing (LONGFORM.md): lift a shot's subject (its face fraction) when BOLT's face lands in the
    // lower-third band, unless the recipe sets cam.face; computed here at compile time (nothing is baked)
    for (const s of shots) {
      if (typeof s.spec.cam.face === "number" || !s.bolts.length) continue;
      for (let it = 0; it < 4; it++) {
        const need = liftNeeded(facesOf(s));
        if (need <= 0 || s.lens.face <= 0.26 + 1e-3) break;
        s.lens.face = Math.max(0.26, s.lens.face - need);
      }
    }
  }
  const capPlan = new Map<string, number>();
  const capY = (s: TechShotR) => { let y = capPlan.get(s.id); if (y === undefined) { y = LS ? lowerThirdY(facesOf(s)) : LF.CAP_Y; capPlan.set(s.id, y); } return y; };
  const qa = (t: number) => {
    const s = shotAt(t);
    const bolts: Box[] = [];
    for (const st of boltsAt(t)) bolts.push(...boltBoxes(st));
    const props: Box[] = [...TECH_SETS[s.set].blockers];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      const pl = p.place(t);
      if (p.def) props.push(...cutBoxes(p.key, p.def, pl, cutOf(p.key, t)));
      else if (p.spec.kit === "block") { const z = p.spec.size ?? [0.5, 0.5, 0.5]; props.push({ name: p.key, c: [pl.p[0], pl.p[1] + (z[1] * pl.s) / 2, pl.p[2]], h: [(z[0] * pl.s) / 2, (z[1] * pl.s) / 2, (z[2] * pl.s) / 2] }); }
    }
    return { bolts, props };
  };

  // ---------------------------------------------------- labels: one card per label, placed once at its pop-in time
  const labelPlan = new Map<string, { dx: number; dy: number }>();
  const placeLabel = (L: LabelR, s: TechShotR): { dx: number; dy: number } => {
    const got = labelPlan.get(L.key);
    if (got) return got;
    const t = Math.min(L.t1 - 0.01, L.t0 + 0.05);
    const cam = camAt(t);
    const q = prj(cam, L.target(t));
    const sz = labelSize(L.text);
    const top = t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain) ? LY.SAFE_TOP_HOOK : LY.SAFE_TOP;
    const faces = boltsAt(t).map((st) => { const f = boltFace(st); const p = prj(cam, f.c); return p ? { x: p.x, y: p.y, w: 2 * f.r * p.k + 120, h: 2 * f.r * p.k + 120 } : null; }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];
    // earlier labels of this shot that are still up when this one pops
    const others = s.labels.filter((o) => o.key !== L.key && o.t0 <= L.t0 && o.t1 > L.t0).map((o) => { const d = placeLabel(o, s); const qo = prj(camAt(t), o.target(t)); const so = labelSize(o.text); return qo ? { x: qo.x + d.dx, y: qo.y + d.dy, ...so } : null; }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];
    for (const bd of s.boards) if (bd.t1 > L.t0 && bd.t0 < L.t1) { const bb = boardRect(bd, t); others.push(bb); }
    const ax = q?.x ?? LY.CX, ay = q?.y ?? LY.AY0;
    const prefer = L.side === "left" ? -1 : L.side === "right" ? 1 : ax > LY.CX ? -1 : 1;
    const cands: { dx: number; dy: number }[] = [];
    for (const dy of [-200, -120, -280, 120, 200, -360, 280, 0]) for (const sd of [prefer, -prefer]) cands.push({ dx: sd * (sz.w / 2 + 90), dy });
    const clampC = (c: { x: number; y: number }) => ({ x: clamp(c.x, LY.SAFE_X0 + sz.w / 2, LY.SAFE_X1 - sz.w / 2), y: clamp(c.y, top + sz.h / 2, LY.SAFE_BOTTOM - sz.h / 2) });
    let best = cands[0], bestScore = Infinity;
    cands.forEach((cd, k) => {
      const c = clampC({ x: ax + cd.dx, y: ay + cd.dy });
      const box = { ...c, ...sz };
      let score = k * 0.01 + Math.hypot(c.x - (ax + cd.dx), c.y - (ay + cd.dy)) * 0.002;
      if (faces.some((f) => rectsHit(box, f, 10))) score += 100;
      if (others.some((o) => rectsHit(box, o, 18))) score += 50;
      if (Math.abs(c.x - ax) < sz.w / 2 + 10 && Math.abs(c.y - ay) < sz.h / 2 + 10) score += 20; // never cover the part it names
      if (score < bestScore) { bestScore = score; best = { dx: c.x - ax, dy: c.y - ay }; }
    });
    labelPlan.set(L.key, best);
    return best;
  };
  const labelsAt = (t: number): LabelBox[] => {
    const s = shotAt(t);
    const cam = camAt(t);
    const out: LabelBox[] = [];
    const top = t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain) ? LY.SAFE_TOP_HOOK : LY.SAFE_TOP;
    for (const L of s.labels) {
      if (t < L.t0 - LEAD || t >= L.t1) continue;
      const q = prj(cam, L.target(t));
      if (!q) continue;
      const d = placeLabel(L, s);
      const sz = labelSize(L.text);
      const x = clamp(q.x + d.dx, LY.SAFE_X0 + sz.w / 2, LY.SAFE_X1 - sz.w / 2), y = clamp(q.y + d.dy, top + sz.h / 2, LY.SAFE_BOTTOM - sz.h / 2);
      const line = EASE_OUT(prog(t, L.t0 - LEAD, L.t0 + 0.16));
      const u = clamp((t - L.t0 - 0.06) / 0.28) * clamp((L.t1 - t) / 0.15);
      out.push({ key: L.key, text: L.text, ax: q.x, ay: q.y, x, y, ...sz, u, line: line * clamp((L.t1 - t) / 0.15) });
    }
    return out;
  };
  function boardRect(bd: BoardR, t: number) {
    const top = t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain) ? LY.SAFE_TOP_HOOK : LY.SAFE_TOP;
    const w = LY.BOARD_W, h = LY.BOARD_H, M = LY.BOARD_M, pos = bd.spec.pos ?? "right";
    return { x: pos === "left" ? M + w / 2 : pos === "top" ? LY.CX : LY.W - M - w / 2, y: pos === "top" ? top + h / 2 : top + 40 + h / 2, w, h };
  }
  const boardsAt = (t: number): BoardBox[] => {
    const s = shotAt(t);
    const out: BoardBox[] = [];
    const top = t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain) ? LY.SAFE_TOP_HOOK : LY.SAFE_TOP;
    for (const bd of s.boards) {
      if (t < bd.t0 - LEAD || t >= bd.t1) continue;
      const c = bd.spec.count;
      let value = bd.spec.value ?? "";
      if (c) { const v = lerp(c.from, c.to, EASE_OUT(prog(t, bd.t0, bd.t0 + (c.dur ?? 1.0)))); value = `${c.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: c.decimals ?? 0, maximumFractionDigits: c.decimals ?? 0 })}${c.suffix ?? ""}`; }
      void top;
      const { x, y, w, h } = boardRect(bd, t);
      out.push({ title: bd.spec.title.toUpperCase(), value, x, y, w, h, u: clamp((t - bd.t0 + LEAD) / 0.25) * clamp((bd.t1 - t) / 0.15) });
    }
    return out;
  };
  const textsAt = (t: number) => {
    const out: string[] = [];
    if (t <= hookUntil) out.push(recipe.hook.text.replace(/\*/g, ""));
    for (const l of labelsAt(t)) if (l.u > 0.5) out.push(l.text);
    for (const b of boardsAt(t)) if (b.u > 0.5) out.push(`${b.title} ${b.value}`);
    return out;
  };

  // ---------------------------------------------------- audio cue plan (tools/story_mix.py format)
  const cues: Cue[] = [{ t: 0, sfx: recipe.sfx0 ?? "impact", db: -1 }];
  for (const s of shots) {
    if (s.spec.cam.preset === "slamZoom") cues.push({ t: at(s.spec.cam.hit, s.a + 0.12) - 0.02, sfx: "impact", db: -1 });
    if (s.spec.cam.preset === "whip" || s.spec.in === "whip") cues.push({ t: s.a, sfx: "whoosh", db: -4 });
    if (s.spec.cam.preset === "flyThrough") cues.push({ t: s.a + 0.05, sfx: "whoosh", db: -5 });
    for (const ac of s.spec.actions ?? []) {
      const t0 = at(ac.at);
      if (ac.do === "explode") cues.push({ t: t0, sfx: "whoosh", db: -3 }, { t: t0 + 0.05, sfx: "boom", db: -8 });
      if (ac.do === "assemble") cues.push({ t: t0, sfx: "whoosh", db: -5 }, { t: t0 + (ac.dur ?? 0.75), sfx: "thud", db: -6 });
      if (ac.do === "slice") cues.push({ t: t0, sfx: "whoosh", db: -6 });
      if (ac.do === "label") cues.push({ t: t0, sfx: "ding", db: -12 });
      if (ac.do === "highlight") cues.push({ t: t0, sfx: "ding", db: -9 });
    }
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "dropIn") cues.push({ t: p.hit - 0.02, sfx: "impact", db: 0 }, { t: p.hit, sfx: "thud", db: -2 });
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "popIn") cues.push({ t: p.hit - 0.1, sfx: "whoosh", db: -8 });
    for (const bd of s.boards) { cues.push({ t: bd.t0, sfx: "ding", db: -10 }); if (bd.spec.count) cues.push({ t: bd.t0 + (bd.spec.count.dur ?? 1), sfx: "ding", db: -8 }); }
    for (const x of s.spec.sfx ?? []) cues.push({ t: at(x.at), sfx: x.sfx, db: x.db });
  }
  cues.push({ t: end - 0.35, sfx: "whoosh", db: -2 });
  if (LS) cues.push(...chapterCues(chapters));
  const audio = { music: recipe.music ?? "upbeat", cues: cues.filter((q) => q.t >= 0 && q.t < end).sort((x, y) => x.t - y.t) };

  // ---------------------------------------------------- visual-change events (the long-form pacing gate)
  const events = (): [number, string][] => {
    const ev: [number, string][] = [];
    for (const s of shots) {
      for (const [t] of s.kicks) ev.push([t, `${s.id} hit`]);
      for (const L of s.labels) ev.push([L.t0, `${s.id} label ${L.text}`]);
      for (const bd of s.boards) ev.push([bd.t0, `${s.id} board ${bd.spec.title}`]);
      for (const f of s.fx) ev.push([f.at, `${s.id} ${f.fx}`]);
      for (const ac of s.spec.actions ?? []) if (ac.do !== "label") ev.push([at(ac.at), `${s.id} ${ac.do} ${ac.on}`]);
      for (const p of s.props) {
        if (p.spec.motion === "popIn" || p.spec.motion === "dropIn") ev.push([p.hit, `${s.id} ${p.key} ${p.spec.motion}`]);
        if (p.spec.motion === "path") for (const [kt] of p.spec.path ?? []) ev.push([at(kt), `${s.id} ${p.key} path key`]);
      }
      for (const b of s.bolts) { b.segs.slice(1).forEach((g) => ev.push([g.t0, `${s.id} ${b.id} pose ${g.pose}`])); b.faces.forEach((g) => ev.push([g.t0, `${s.id} ${b.id} face ${g.face}`])); }
      if (s.spec.cam.preset === "explodeOrbit" || s.spec.cam.preset === "flyThrough") ev.push([s.a + (s.b - s.a) / 2, `${s.id} ${s.spec.cam.preset} move`]);
    }
    return ev.filter(([t]) => t >= 0 && t <= end).sort((x, y) => x[0] - y[0]);
  };

  return { recipe, slug: recipe.slug, duration, shots, words, at, hookUntil, hookAgain, shotAt, camAt, boltsAt, cutOf, placeOf, labelsAt, boardsAt, qa, textsAt, audio, landscape: LS, layout: LY, chapters, capY, events };
};

// ------------------------------------------------------------------ BOLT tracks
const boltTrack = (bs: BoltSpec, a: number, b: number, set: TechSet, sid: string, at: (x: At | undefined, d?: number) => number, placeV: (p: Place, s: TechSet, id: string) => V3,
  targetFn: (t: TechTarget) => (t: number) => V3, lensPos: () => V3, recipe: TechRecipe, words: readonly Word[], cam: TechCam): BoltTrack => {
  const p0 = placeV(bs.at, set, sid), p1 = bs.to ? placeV(bs.to, set, sid) : p0;
  const t0 = at(bs.from, a);
  const segs: { t0: number; pose: BoltPose; face?: BoltFace }[] = [{ t0: Math.max(a, t0 - LEAD), pose: bs.pose, face: bs.face }];
  const faces: { t0: number; face: BoltFace }[] = [];
  let lastPose = bs.pose;
  for (const x of bs.then ?? []) {
    const tt = at(x.at) - LEAD;
    if (x.pose) { segs.push({ t0: tt, pose: x.pose, face: x.face }); lastPose = x.pose; } else if (x.face) faces.push({ t0: tt, face: x.face });
  }
  void lastPose;
  const s = bs.scale ?? 1;
  const look = bs.look;
  const lookFn = look !== undefined && typeof look !== "number" ? (() => { try { return targetFn(look); } catch { return null; } })() : null;
  const camT = typeof cam.target === "string" ? cam.target.split(".")[0] : "";
  const talkOn = recipe.talk !== "none" && (bs.talk ?? camT === bs.id);
  const ptT = bs.pointAt ?? (camT && camT !== bs.id ? cam.target : undefined);
  const ptFn = ptT !== undefined ? (() => { try { return targetFn(ptT); } catch { return null; } })() : null;
  const pos = (t: number): V3 => lerpV(p0, p1, EASE_INOUT(clamp((t - a) / Math.max(0.3, b - a))));
  return {
    id: bs.id, seed: 3 + bs.id.length * 7, s, hover: bs.hover ?? HOVER,
    at: pos,
    yaw: (t) => {
      if (typeof look === "number") return look * D2R;
      const p = pos(t);
      if (lookFn) return yawTo(p, lookFn(t));
      const c = lensPos();
      return yawTo(p, c);
    },
    segs, faces,
    pointAt: ptFn ? (t) => ptFn(t) : (t) => lensPos(),
    talk: talkOn ? (t) => visemeAt(words, t) : undefined,
  };
};
export { BOLT_R };

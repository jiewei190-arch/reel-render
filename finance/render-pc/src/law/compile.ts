// The law3d recipe compiler: LawRecipe + voice words -> shots with lenses, figure tracks, prop motions, gavel strikes,
// the story devices (case-file card, EXHIBIT tags, verdict stamp, dollar counter) with their screen layout, the audio
// cue plan and the QA/gate data. A pure function of t, like src/tech/compile.ts, and separate from it.
// Every screen-space number comes from the format's layout (src/law/layout.ts).
import type { V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import { kickAt, kicked, pushK, whipK } from "../fin/lib/camera";
import type { Cam } from "../fin/lib/camera";
import { EASE_INOUT, EASE_OUT, EASE_PLACE, LEAD, prog } from "../fin/lib/motion";
import { visemeAt } from "../fin/lib/lipsync";
import { makeAt } from "../fin/recipe/timing";
import type { Word } from "../fin/recipe/types";
import { LF, chapterCues, landscapeLens, liftNeeded, lowerThirdY, resolveChapters } from "../longform/kit";
import { ANCHOR_LOOKBACK, MIN_SUB_PX, MIN_TEXT_PX, countPlan, countU, fitFs, placeChapters, spokenAnchor, textPx, widestDigits } from "../longform/polish";
import type { CountPlan, Fit } from "../longform/polish";
import type { ChapterR, FaceBand } from "../longform/kit";
import { figBoxes, figFace, figHead, figState } from "./cast";
import type { CastSpec, FigFace, FigPose, FigState, FigTrack } from "./cast";
import { layoutOf } from "./layout";
import type { LawLayout } from "./layout";
import { hookBox } from "./hud";
import { KIT_BOX, isLawHero } from "./objects";
import { HERO_PHOTOS, HERO_VARIANTS, LAW_HERO_KINDS, LAW_OWN_KINDS, STATUE_SPECIES } from "./hero";
import { isPackKind, packParamError } from "../props/pack";
import { heroLabelError } from "../library/hero";
import { LAW_SETS } from "./sets";
import type { LawSet, LawSetId } from "./sets";
import type { ActorSpec, At, LawAction, LawCam, LawProp, LawRecipe, LawShot, LawTarget, Place } from "./types";

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
export type Placement = { p: V3; yaw: number; pitch: number; roll: number; s: number };
export type PropR = { key: string; spec: LawProp; a: number; b: number; hit: number; hits: number[]; text?: string; held?: boolean; seed: number; place: (t: number) => Placement; show: (t: number) => number; strike: (t: number) => number };
export type FxR = { fx: "shake" | "flash" | "papers"; at: number; p: (t: number) => V3; gain: number };
export type DeviceR = { key: string; act: LawAction; t0: number; t1: number; target?: (t: number) => V3; zeroAt?: number;
  /** counters: the count window (lands on `to` by the anchor word's end, holds COUNT_HOLD before the cut / drain) */
  plan?: CountPlan; final?: string };
/** a device's measured text: font size per line and whether it fits its box at the minimum size (tools/polish_qa.mjs) */
export type DeviceFit = { key: string; shot: string; kind: string; lines: { what: string; fit: Fit; alt?: string }[] };
export type LawShotR = { id: string; a: number; b: number; set: LawSetId; spec: LawShot; lens: Lens; kicks: [number, number][]; figs: FigTrack[]; props: PropR[]; devices: DeviceR[]; fx: FxR[];
  /** landscape only: the lower-third caption centre (px at 1080 tall) and how far caption-safe framing lifted the shot */
  capY?: number; lift?: number };
export type Cue = { t: number; sfx: string; db?: number };
/** a story device on screen (DOM), in px of the format; u = 0..1 in/out */
export type DeviceBox = {
  key: string; kind: LawAction["do"]; x: number; y: number; w: number; h: number; u: number; age: number;
  label?: string; text?: string; sub?: string; title?: string; year?: string; place?: string; note?: string; value?: string; zero?: number;
  ax?: number; ay?: number; line?: number;
  /** measured font sizes (px) of the device's lines, by role (title / value / label / text / sub / meta / note) */
  fs?: Record<string, number>;
  /** counters: the final value text and whether the count has landed */
  final?: string; landed?: boolean;
};

export type LawCompiled = {
  recipe: LawRecipe; slug: string; layout: LawLayout; duration: number; shots: LawShotR[]; words: readonly Word[];
  at: (a: At | undefined, d?: number) => number; hookUntil: number; hookAgain: number | null;
  shotAt: (t: number) => LawShotR;
  camAt: (t: number) => Cam;
  figsAt: (t: number) => FigState[];
  devicesAt: (t: number) => DeviceBox[];
  qa: (t: number) => { figs: Box[]; props: Box[] };
  textsAt: (t: number) => string[];
  audio: { music: string; cues: Cue[] };
  /** long-form ("format": "landscape"): 1920x1080, chapters, lower-third captions */
  landscape: boolean;
  /** landscape: chapters resolved to seconds (t = the chapter word, card = when its title card plays); [] otherwise */
  chapters: ChapterR[];
  /** landscape: the face boxes (px) in the caption column of a shot, sampled across it */
  faceBands: (s: LawShotR) => FaceBand[];
  /** every device's measured text (text-fit rule) */
  fits: DeviceFit[];
  /** polish QA hooks (tools/polish_qa.mjs): the counters, a counter's shown value, every 2D card on screen, the set's
   *  face-hiding pieces, who is speaking */
  counters: CounterQ[];
  counterAt: (key: string, t: number) => { value: string; u: number; zero: number } | null;
  cardRectsAt: (t: number) => CardQ[];
  occludersAt: (t: number) => { name: string; c: V3; h: V3; yaw?: number }[];
  speakingAt: (t: number) => string[];
};
/** a counter for the polish QA: target, final text, the count window */
export type CounterQ = { key: string; shot: string; kind: string; title: string; target: number; decimals: number; final: string; t0: number; until: number; plan: CountPlan };
/** a 2D card on screen (px) */
export type CardQ = { label: string; x0: number; x1: number; y0: number; y1: number; landed: boolean };

/** camera presets (all keep moving: a push, an orbit, a dolly, a crane, a slam creep); `face` is a layout key */
export const LAW_CAMS = {
  hookZoom: { dist: 1.25, h: 0.05, fov: 40, face: "hook", push: 0.045, blur: 1.6, roll: [-2, 0.5] as [number, number] },
  closeUp: { dist: 1.15, h: 0.05, fov: 38, face: "close", push: 0.05, blur: 1.8, roll: [0, 1.2] as [number, number] },
  medium: { dist: 2.4, h: 0.25, fov: 42, face: "medium", push: 0.04, blur: 1.1, roll: [0, 0.8] as [number, number] },
  wide: { dist: 7.5, h: 1.8, fov: 50, face: "wide", push: 0.025, blur: 0.5, roll: [0, 0.6] as [number, number] },
  slamZoom: { dist: 1.6, h: 0.1, fov: 40, face: "close", push: 0.04, blur: 1.4, roll: [0, 1.5] as [number, number] },
  pushIn: { dist: 2.6, h: 0.3, fov: 42, face: "medium", push: 0, blur: 1.1, roll: [0, 1] as [number, number] },
  whip: { dist: 2.4, h: 0.25, fov: 44, face: "medium", push: 0.04, blur: 1.0, roll: [4, 0] as [number, number] },
  orbit: { dist: 3.2, h: 0.8, fov: 42, face: "medium", push: 0.015, blur: 0.9, roll: [0, 0] as [number, number] },
  dolly: { dist: 2.6, h: 0.35, fov: 42, face: "medium", push: 0.01, blur: 1.0, roll: [0, 0.5] as [number, number] },
  crane: { dist: 4.0, h: 0.6, fov: 44, face: "wide", push: 0.02, blur: 0.8, roll: [0, 0] as [number, number] },
  topDown: { dist: 0.55, h: 1.6, fov: 44, face: "medium", push: 0.03, blur: 0.9, roll: [0, 4] as [number, number] },
};

// ------------------------------------------------------------------ projection (the format's W x H)
export const project = (cam: Cam, p: V3, L: LawLayout): { x: number; y: number; k: number; z: number } | null => {
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
/** device card sizes (Poppins 800, uppercase), per layout */
/** measured (src/longform/polish.ts): the tag text shrinks to fit the safe width (never below 42 px: the gate fails it) */
export const exhibitFit = (L: LawLayout, label: string, text: string) => {
  const room = L.safeX1 - L.safeX0 - 80;
  return { text: fitFs(text.toUpperCase(), L.exhibitFs, room, 0, MIN_TEXT_PX), label: fitFs(label.toUpperCase(), L.exhibitLabelFs ?? 34, room - 44, 4, MIN_SUB_PX) };
};
export const exhibitSize = (L: LawLayout, label: string, text: string) => {
  const f = exhibitFit(L, label, text);
  return { w: Math.round(Math.max(f.text.w, f.label.w + 44) + 80), h: Math.round(L.exhibitFs * 1.15 + 36 + 52) };
};
/** the counter's text: title and value font sizes fitted to the board (the value at its widest while counting) */
export const counterFit = (L: LawLayout, w: number, title: string, widest: string, drain: boolean) => ({
  title: fitFs(title.toUpperCase(), L.board.fsTitle, w - 28, 2, MIN_SUB_PX),
  // the drain pulse scales the value 1.15x: leave room for it
  value: fitFs(widestDigits(widest), L.board.fsValue, (w - 40) / (drain ? 1.15 : 1), -2, MIN_TEXT_PX),
});
/** the counter's displayed text for a value */
export const counterText = (ac: Extract<LawAction, { do: "counter" }>, n: number) => {
  const s = ac.compact && Math.abs(n) >= 1e6 ? `${(n / 1e6).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M` : n.toLocaleString("en-US", { minimumFractionDigits: ac.decimals ?? 0, maximumFractionDigits: ac.decimals ?? 0 });
  return `${ac.prefix ?? ""}${s}${ac.suffix ?? ""}`;
};
export const boardSize = (L: LawLayout) => ({ w: L.board.w, h: L.board.h });
const rectsHit = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }, m = 14) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w + 2 * m && Math.abs(a.y - b.y) * 2 < a.h + b.h + 2 * m;
/** gavel strike curve: 0 rest .. 1 raised; up over 0.4 s before a hit, down in 0.12 s onto it, a small bounce */
export const strikeAt = (hits: number[], t: number) => {
  let v = 0;
  for (const h of hits) {
    if (t < h - 0.55 || t > h + 0.4) continue;
    if (t < h - 0.12) v = Math.max(v, EASE_INOUT(prog(t, h - 0.55, h - 0.14)));
    else if (t < h) v = Math.max(v, 1 - Math.pow(prog(t, h - 0.12, h), 2));
    else v = Math.max(v, 0.12 * Math.exp(-(t - h) * 10) * Math.abs(Math.sin((t - h) * 30)));
  }
  return v;
};

// ------------------------------------------------------------------ the compiler
export const compileLaw = (recipe: LawRecipe, words: readonly Word[], voDuration?: number): LawCompiled => {
  if (recipe.kit !== "law3d") throw new Error(`recipe ${recipe.slug}: kit must be "law3d"`);
  const L = layoutOf(recipe.format);
  const LS = recipe.format === "landscape";
  if (recipe.chapters && !LS) throw new Error(`recipe ${recipe.slug}: "chapters" need "format": "landscape"`);
  const { at, lineEnd } = makeAt(words);
  const durS = recipe.duration ?? voDuration ?? Math.max(...words.map((w) => w.end)) + 0.8;
  const duration = Math.round(durS * FPS);
  const end = duration / FPS;
  const castIds = Object.keys(recipe.cast);
  for (const [id, c] of Object.entries(recipe.cast)) if (!c || !c.role) throw new Error(`recipe: cast "${id}" needs a "role" (judge, plaintiff, defendant, lawyer, witness, bailiff, juror)`);
  const starts = recipe.shots.map((s) => at(s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1]) throw new Error(`recipe: shot ${i + 1} starts at ${a.toFixed(2)} s, not after shot ${i} (${starts[i - 1].toFixed(2)} s)`); });
  if (Math.abs(starts[0]) > 1e-6) throw new Error("recipe: the first shot must start at 0");
  const hookUntil = recipe.hook.until !== undefined ? at(recipe.hook.until) : lineEnd(1) + 0.25;
  const hookAgain = recipe.hook.again !== undefined ? at(recipe.hook.again) : null;
  const hookOn = (t: number) => t <= hookUntil + 0.2 || (hookAgain !== null && t >= hookAgain);

  let curSet: LawSetId = recipe.shots[0].set ?? "courtroom";
  const shots: LawShotR[] = [];
  const globalProps = (recipe.props ?? []).map((p) => ({ p, a: at(p.from, 0), b: at(p.until, end + 1) }));
  const placeV = (pl: Place, set: LawSet, sid: string): V3 => {
    if (Array.isArray(pl)) return pl.length === 2 ? [pl[0], 0, pl[1]] : (pl as V3);
    const [name, off] = pl.split(":");
    const a = set.anchors[name];
    if (!a) throw new Error(`recipe ${sid}: no anchor "${name}" in set ${set.id} (has: ${Object.keys(set.anchors).join(", ")})`);
    return add(a, off ? (off.split(",").map(Number) as V3) : [0, 0, 0]);
  };

  recipe.shots.forEach((sp, i) => {
    curSet = sp.set ?? curSet;
    const set = LAW_SETS[curSet];
    if (!set) throw new Error(`recipe: no set "${curSet}" (has: ${Object.keys(LAW_SETS).join(", ")})`);
    const a = starts[i], b = i + 1 < starts.length ? starts[i + 1] : end;
    const id = `S${String(i + 1).padStart(2, "0")}`;
    const c = sp.cam;
    const P = LAW_CAMS[c.preset];
    if (!P) throw new Error(`recipe ${id}: no camera preset "${c.preset}" (has: ${Object.keys(LAW_CAMS).join(", ")})`);
    const hit = at(c.hit, a + 0.12);
    // gavel strikes first: props and judges need them
    const gavelActs = (sp.actions ?? []).filter((x): x is Extract<LawAction, { do: "gavel" }> => x.do === "gavel").map((x) => ({ t: at(x.at), on: x.on }));
    const hitsFor = (key: string) => gavelActs.filter((g) => !g.on || g.on === key).map((g) => g.t);

    // props
    const props: PropR[] = [];
    const addProp = (spec: LawProp, pa: number, pb: number) => {
      if (!spec.kit || !KIT_BOX[spec.kit]) throw new Error(`recipe ${id}: prop "${spec.id}" needs a "kit" (has: ${Object.keys(KIT_BOX).join(", ")})`);
      if (isLawHero(spec.kit)) {
        const lerr = spec.kit === "contract" && spec.label !== undefined && !String(spec.label).trim() ? `label is empty: a contract needs its headline (blank paper is not allowed)` : heroLabelError(spec.label, spec.kit);
        if (lerr) throw new Error(`recipe ${id}: prop "${spec.id}": ${lerr}`);
        if (spec.lines && (!Array.isArray(spec.lines) || spec.lines.length > 7 || spec.lines.some((l) => typeof l !== "string" || l.length > 40))) throw new Error(`recipe ${id}: prop "${spec.id}": "lines" takes up to 7 strings of <= 40 characters`);
        if (spec.lines) { const bad = spec.lines.map((l) => heroLabelError(l.split(/\s+/).slice(0, 2).join(" ").slice(0, 14), spec.kit)).find((e) => e && /real brand/.test(e)); if (bad) throw new Error(`recipe ${id}: prop "${spec.id}" lines: ${bad}`); }
        if (spec.kit === "statue" && spec.species !== undefined && !(STATUE_SPECIES as string[]).includes(spec.species)) throw new Error(`recipe ${id}: prop "${spec.id}": "species" is one of ${STATUE_SPECIES.join(", ")} (got "${spec.species}")`);
        const vs = HERO_VARIANTS[spec.kit];
        if (spec.variant !== undefined && (!vs || !vs.includes(spec.variant))) throw new Error(`recipe ${id}: prop "${spec.id}": "variant" ${vs ? `is one of ${vs.join(", ")}` : `is for toy (doll, ball), food (burger, fries), chicken (hen, rooster) and shoe (sneaker, heel)`} (got "${spec.variant}")`);
        if (spec.kit === "frame" && spec.photo !== undefined && !HERO_PHOTOS.includes(spec.photo)) throw new Error(`recipe ${id}: prop "${spec.id}": a frame's "photo" is one of ${HERO_PHOTOS.join(", ")} (got "${spec.photo}")`);
        if (isPackKind(spec.kit) && !(LAW_OWN_KINDS as string[]).includes(spec.kit)) { const pe = packParamError(spec.kit, spec); if (pe) throw new Error(`recipe ${id}: prop "${spec.id}": ${pe}`); }
        else if (spec.holding !== undefined || spec.spots !== undefined || spec.screen !== undefined) throw new Error(`recipe ${id}: prop "${spec.id}": "holding" / "spots" / "screen" are props-pack params (src/props/pack.tsx); a ${spec.kit} takes none`);
      } else if (spec.label !== undefined || spec.lines !== undefined) throw new Error(`recipe ${id}: prop "${spec.id}": "label" / "lines" are for the hero props (${LAW_HERO_KINDS.join(", ")}); a ${spec.kit} takes "text"`);
      const base = placeV(spec.at, set, id);
      const phit = at(spec.hit, a + 0.12);
      const s0 = spec.scale ?? spec.s ?? 1;
      const from = spec.fromOff ?? [-2.4, 1.6, 1.4];
      const hits = [...(spec.hits ?? []).map((h) => at(h)), ...(spec.kit === "gavel" ? hitsFor(spec.id) : [])].sort((x, y) => x - y);
      let text = spec.text;
      if (spec.kit === "nameplate" && !text && spec.of) { const cs = recipe.cast[spec.of]; if (!cs) throw new Error(`recipe ${id}: nameplate "${spec.id}" of "${spec.of}": not in cast`); text = cs.plate ?? cs.role.toUpperCase(); }
      const place = (t: number): Placement => {
        let p = base, yaw = (spec.yaw ?? 0) * D2R, s = s0, pitch = (spec.pitch ?? 0) * D2R, roll = (spec.roll ?? 0) * D2R;
        // "spin" with no motion: the prop turns slowly on the spot from its first frame in the shot (its front faces
        // "yaw" when the shot starts), the hero-prop showcase (biz3d / cyber3d do the same)
        if (!spec.motion && spec.spin !== undefined) yaw += spec.spin * D2R * (t - pa);
        switch (spec.motion) {
          case "turntable": yaw += (spec.spin ?? 14) * D2R * t; break;
          case "bob": p = add(p, [0, 0.05 * Math.sin(t * 2.2), 0]); yaw += 0.08 * Math.sin(t * 0.9); break;
          case "float": p = add(p, [0.03 * Math.sin(t * 0.8), 0.06 * Math.sin(t * 1.6), 0]); yaw += 0.25 * Math.sin(t * 0.5); pitch += 0.12 * Math.sin(t * 1.1); break;
          case "popIn": s = s0 * (t < phit - 0.3 ? 0.001 : Math.max(0.001, EASE_PLACE(prog(t, phit - 0.3, phit)))); yaw += 0.06 * Math.sin(t * 1.1); break;
          case "dropIn": { const H = 1.6, u = clamp((t - (phit - 0.35)) / 0.35); p = add(p, [0, t < phit ? H * (1 - u * u) : 0.04 * Math.abs(Math.sin((t - phit) * 16)) * Math.exp(-(t - phit) * 6), 0]); break; }
          case "flyIn": {
            // paper flight: from the side, tumbling, a flutter that settles as it lands on `hit`
            const T = 0.6, u = clamp((t - (phit - T)) / T);
            const e = EASE_OUT(u);
            p = add(base, add(scl(from as V3, 1 - e), [0, 0.35 * Math.sin(Math.PI * e) * (1 - e) + (t > phit ? 0.015 * Math.exp(-(t - phit) * 8) * Math.sin((t - phit) * 25) : 0), 0]));
            yaw += (1 - e) * 2.4;
            pitch += (1 - e) * 0.9 * Math.sin(t * 13);
            roll += (1 - e) * 0.7 * Math.cos(t * 11);
            break;
          }
        }
        return { p, yaw, s, pitch, roll };
      };
      // a gavel that strikes with no judge figure in the shot is held by a robed forearm (never floats on its own)
      const held = spec.kit === "gavel" && hits.some((h) => h >= pa - 0.6 && h < pb + 0.3) && !(sp.actors ?? []).some((x) => recipe.cast[x.id]?.role === "judge");
      props.push({ key: spec.id, spec, a: pa, b: pb, hit: phit, hits, text, held, seed: 7 + spec.id.length * 13 + spec.id.charCodeAt(0), place, show: (t) => (spec.motion === "popIn" ? clamp((t - phit + 0.3) / 0.05) : spec.motion === "flyIn" ? (t >= phit - 0.6 ? 1 : 0) : 1), strike: (t) => strikeAt(hits, t) });
    };
    (sp.props ?? []).forEach((ps) => addProp(ps, a, b));
    globalProps.filter((g) => g.a < b && g.b > a && (!g.p.sets || g.p.sets.includes(curSet)) && !(sp.props ?? []).some((q) => q.id === g.p.id)).forEach((g) => addProp(g.p, Math.max(a, g.a), Math.min(b, g.b)));
    const propCentre = (pr: PropR, t: number): V3 => { const pl = pr.place(t); const bx = KIT_BOX[pr.spec.kit]; return add(pl.p, scl(rotY(bx.c, pl.yaw), pl.s)); };

    // targets
    const figs: FigTrack[] = [];
    const states = new Map<string, (t: number) => FigState>();
    const targetFn = (tg: LawTarget): ((t: number) => V3) => {
      if (isV3(tg)) return () => tg;
      const [name, part] = tg.split(".");
      if (castIds.includes(name)) {
        return (t) => {
          const f = states.get(name);
          if (!f) throw new Error(`recipe ${id}: target "${tg}" but ${name} is not in this shot`);
          const st = f(t);
          if (part === "face") return figFace(st).c;
          if (part === "head") return figHead(st);
          const hd = figHead(st);
          return [hd[0], hd[1] - 0.38 * st.s, hd[2]];
        };
      }
      const pr = props.find((p) => p.key === name);
      if (pr) return (t) => propCentre(pr, t);
      const [an, off] = tg.split(":");
      if (set.anchors[an]) { const o = off ? (off.split(",").map(Number) as V3) : [0, 0, 0]; return () => add(set.anchors[an], o as V3); }
      throw new Error(`recipe ${id}: no target "${tg}" (cast: ${castIds.join(", ")}; props: ${props.map((p) => p.key).join(", ") || "none"}; anchors: ${Object.keys(set.anchors).join(", ")})`);
    };

    // figures need the lens position for their default facing: provisional first
    let lensPos0: V3 = [0, 1.5, 6];
    for (const as of sp.actors ?? []) {
      const cs = recipe.cast[as.id];
      if (!cs) throw new Error(`recipe ${id}: actor "${as.id}" is not in cast (has: ${castIds.join(", ")})`);
      figs.push(figTrack(as, cs, a, b, set, id, at, placeV, targetFn, () => lensPos0, words, c, hitsFor(as.id)));
    }
    figs.forEach((tr) => states.set(tr.id, (t) => figState(tr, t)));

    // lens
    const camTarget = c.target ?? "centre";
    const subj = targetFn(camTarget);
    const s0 = subj(a);
    // 16:9 lens rule (LONGFORM.md): the vertical fov is kept; wider presets narrow it (and `wide`/`crane` come in a little)
    const lk = LS ? landscapeLens(c.preset) : null;
    const az = (c.az ?? 0) * D2R, dist = c.dist ?? (lk ? P.dist * lk[1] : P.dist), h = c.h ?? P.h;
    const off: V3 = c.preset === "topDown" ? [Math.sin(az) * dist, h, Math.cos(az) * dist] : [Math.sin(az) * dist, h, Math.cos(az) * dist];
    lensPos0 = add(s0, off);
    const faceK = c.face ?? L.face[P.face as keyof LawLayout["face"]];
    const fov0 = lk ? (c.fov ?? P.fov) * lk[0] : c.fov ?? P.fov;
    const slam0 = lk ? 62 * lk[0] : 62;
    let lens: Lens = { a, b, subj, off, fov: () => fov0, face: faceK, push: P.push, roll: c.roll ?? P.roll, blur: c.blur ?? P.blur };
    const span = Math.max(0.3, b - a);
    switch (c.preset) {
      case "slamZoom": lens.fov = (t) => (t < hit - 0.2 ? slam0 : t < hit ? slam0 + 1.8 * Math.sin((Math.PI * (t - hit + 0.2)) / 0.2) : lerp(slam0, fov0, easeOut3((t - hit) / 0.12)) - 1.5 * clamp((t - hit - 0.12) / 2)); break;
      case "hookZoom": {
        const far: V3 = [off[0] * 1.35, off[1] * 1.2 + 0.08, off[2] * 1.35];
        lens.posAt = (t) => { const u = easeOut3((t - a) / 0.4); const q = lerpV(far, off, u); const k = 1 - P.push * Math.max(0, t - a - 0.4); return add(subj(t), scl(q, k)); };
        break;
      }
      case "pushIn": lens.posAt = (t) => add(subj(t), scl(off, pushK(t, a, 0.003, 0.006, 35))); break;
      case "whip": { const s1 = subj; lens = { ...lens, posAt: (t) => add(s1(t), off), subj: (t) => { const q = s1(t), pp = add(q, off); return add(pp, rotY(sub(q, pp), 35 * D2R * whipK(t, a))); } }; break; }
      case "orbit": { const sw = (c.sweep ?? 36) * D2R; lens.posAt = (t) => add(subj(t), rotY(off, lerp(-sw / 2, sw / 2, EASE_INOUT(clamp((t - a) / span))))); break; }
      case "dolly": {
        const tr = c.sweep ?? 1.2;
        const right: V3 = [Math.cos(az), 0, -Math.sin(az)];
        lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / span)); return add(add(subj(t), scl(off, 1 - P.push * (t - a))), scl(right, lerp(-tr / 2, tr / 2, u))); };
        break;
      }
      case "crane": {
        const rise = c.sweep ?? 1.0;
        lens.posAt = (t) => { const u = EASE_INOUT(clamp((t - a) / span)); const q = scl(off, 1 - 0.12 * u); return add(subj(t), [q[0], q[1] + rise * u, q[2]]); };
        break;
      }
      case "topDown": {
        lens.posAt = (t) => { const u = clamp((t - a) / span); const q = rotY(off, 0.25 * u); return add(subj(t), [q[0], q[1] * (1 - 0.18 * EASE_INOUT(u)), q[2]]); };
        break;
      }
    }
    // transitions: punch (default), whip, cut
    const tin = i === 0 ? "cut" : sp.in ?? (c.preset === "slamZoom" || c.preset === "whip" ? "cut" : "punch");
    const kicks: [number, number][] = [];
    if (c.preset === "slamZoom") kicks.push([hit, 1.2]);
    if (c.preset === "hookZoom") kicks.push([a + 0.38, 0.7]);
    if (tin === "punch") { const f0 = lens.fov; lens = { ...lens, fov: (t) => f0(t) + 7 * (1 - easeOut3((t - a) / 0.14)) }; kicks.push([a, 0.5]); }
    if (tin === "whip") {
      const s1 = lens.subj, p1 = lens.posAt ?? ((t: number) => add(s1(t), off));
      lens = { ...lens, posAt: p1, subj: (t) => { const q = s1(t), pp = p1(t); return add(pp, rotY(sub(q, pp), 32 * D2R * whipK(t, a))); } };
    }
    // devices
    const devices: DeviceR[] = [];
    for (const ac of sp.actions ?? []) {
      const t0 = at(ac.at);
      if (ac.do === "gavel") { kicks.push([t0, 1.3]); continue; }
      const t1 = at(ac.until, b);
      if (t1 <= t0) throw new Error(`recipe ${id}: ${ac.do} at ${t0.toFixed(2)} s ends before it starts (${t1.toFixed(2)} s)`);
      if (ac.do === "exhibit" && ac.text.trim().split(/\s+/).length > 4) throw new Error(`recipe ${id}: exhibit text "${ac.text}" has more than 4 words`);
      if (ac.do === "verdict") { kicks.push([t0, 1.6]); if (ac.text.trim().split(/\s+/).length > 2) throw new Error(`recipe ${id}: verdict "${ac.text}" must be 1-2 words`); }
      const dr: DeviceR = { key: `${id}.${ac.do}.${devices.length}`, act: ac, t0, t1, target: ac.do === "exhibit" && ac.on ? targetFn(ac.on) : undefined, zeroAt: ac.do === "counter" && ac.zeroAt !== undefined ? at(ac.zeroAt) : undefined };
      if (ac.do === "counter") {
        // the count window: lands on `to` by the anchor word's end and holds before the cut / the drain (polish.ts)
        const until = Math.min(t1, b, dr.zeroAt ?? Infinity);
        let anchor: CountPlan["anchor"];
        if (ac.land !== undefined) { const tl = at(ac.land); const w = words.find((q) => Math.abs(q.t - tl) < 0.02); anchor = { w: w?.w ?? String(ac.land), t: tl, end: w ? w.end : tl, given: true }; }
        else if (ac.value === undefined) anchor = spokenAnchor(words, ac.to ?? 0, t0 - ANCHOR_LOOKBACK, until, ac.decimals ?? 0);
        dr.plan = ac.value !== undefined ? countPlan({ start: t0, dur: 0, until }) : countPlan({ start: t0, dur: ac.dur ?? 1.2, until, anchor });
        dr.final = ac.value ?? counterText(ac, ac.to ?? 0);
      }
      devices.push(dr);
    }
    const fx: FxR[] = (sp.fx ?? []).map((f) => {
      const o = typeof f === "string" ? { fx: f } : f;
      return { fx: o.fx, at: at(o.at, hit), p: targetFn(o.p ?? camTarget), gain: o.gain ?? 1 };
    });
    fx.filter((f) => f.fx === "shake").forEach((f) => kicks.push([f.at, 1.3 * f.gain]));
    props.filter((p) => p.spec.motion === "dropIn").forEach((p) => kicks.push([p.hit, 0.8]));
    props.filter((p) => p.spec.motion === "flyIn").forEach((p) => kicks.push([p.hit, 0.35]));
    shots.push({ id, a, b, set: curSet, spec: sp, lens, kicks, figs, props, devices, fx });
  });

  // ---------------------------------------------------- per-time helpers
  // binary search (long-form has hundreds of shots): the last shot with t >= a - 1e-9, else the first
  const shotAt = (t: number) => {
    let lo = 0, hi = shots.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (t >= shots[mid].a - 1e-9) lo = mid; else hi = mid - 1; }
    return shots[lo];
  };
  const camOf = (Ln: Lens, t: number): Cam => {
    const tau = Math.max(0, t - Ln.a);
    const subj = Ln.subj(t);
    const k = 1 - Ln.push * tau;
    const pos: V3 = Ln.posAt ? Ln.posAt(t) : add(subj, scl(Ln.off, k));
    const cam = aim(pos, subj, Ln.fov(t), Ln.face);
    return { ...cam, roll: lerp(Ln.roll[0], Ln.roll[1], clamp(tau / Math.max(0.01, Ln.b - Ln.a))) };
  };
  const camAt = (t: number) => { const s = shotAt(t); return kicked(camOf(s.lens, t), kickAt(t, s.kicks)); };
  const figsAt = (t: number) => shotAt(t).figs.map((f) => figState(f, t));
  const qa = (t: number) => {
    const s = shotAt(t);
    const figsB: Box[] = [];
    for (const st of figsAt(t)) figsB.push(...figBoxes(st));
    const propsB: Box[] = [...LAW_SETS[s.set].blockers];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.show(t) < 0.5) continue;
      const pl = p.place(t), bx = KIT_BOX[p.spec.kit];
      const c = add(pl.p, scl(rotY(bx.c, pl.yaw), pl.s));
      const cy = Math.abs(Math.cos(pl.yaw)), sy = Math.abs(Math.sin(pl.yaw));
      propsB.push({ name: p.key, c, h: [(bx.h[0] * cy + bx.h[2] * sy) * pl.s, bx.h[1] * pl.s, (bx.h[0] * sy + bx.h[2] * cy) * pl.s] });
    }
    return { figs: figsB, props: propsB };
  };

  // ---------------------------------------------------- long-form caption-safe framing (landscape only)
  // A shot whose face (inside the 1440 px caption column) lands in the lower-third band is lifted (its lens `face`
  // fraction, the target's height from the top) just enough to clear it, unless the recipe sets cam.face. Computed here
  // at compile time (law3d bakes nothing into the gen files); what is left moves the caption (lowerThirdY).
  const faceBands = (s: LawShotR): FaceBand[] => {
    const out: FaceBand[] = [];
    for (const u of [0.1, 0.3, 0.5, 0.7, 0.92]) {
      const tm = s.a + (s.b - s.a) * u;
      const cam = kicked(camOf(s.lens, tm), kickAt(tm, s.kicks));
      for (const f of s.figs) {
        const st = figState(f, tm);
        if (st.spec.role === "juror") continue;
        const fc = figFace(st), q = project(cam, fc.c, L);
        if (!q || q.x < LF.CAP_SIDE || q.x > L.W - LF.CAP_SIDE) continue;
        const half = fc.r * q.k;
        if (q.y + half > 0 && q.y - half < L.H) out.push({ top: q.y - half, bot: q.y + half });
      }
    }
    return out;
  };
  if (LS) for (const s of shots) {
    const f0 = s.lens.face;
    if (typeof s.spec.cam.face !== "number") {
      for (let it = 0; it < 4; it++) {
        const need = liftNeeded(faceBands(s));
        if (need <= 0 || s.lens.face <= 0.26 + 1e-3) break;
        s.lens.face = Math.max(0.26, s.lens.face - need);
      }
    }
    s.lift = f0 - s.lens.face;
    s.capY = lowerThirdY(faceBands(s));
  }

  // ---------------------------------------------------- devices: layout once per device (at its pop-in), then animate
  const plan = new Map<string, { x: number; y: number; w: number; h: number }>();
  // chapters are placed after the fixed devices (below); exhibit tags are laid out lazily, after that
  let chaptersPlacedV: ChapterR[] = [];
  const chaptersPlaced = () => chaptersPlacedV;
  const facesRects = (cam: Cam, t: number) => figsAt(t).filter((st) => st.spec.role !== "juror").map((st) => { const f = figFace(st); const p = project(cam, f.c, L); return p ? { x: p.x, y: p.y, w: 2 * f.r * p.k + 90, h: 2 * f.r * p.k + 90 } : null; }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];
  const rectOf = (d: DeviceR, s: LawShotR): { x: number; y: number; w: number; h: number } => {
    const got = plan.get(d.key);
    if (got) return got;
    const t = Math.min(d.t1 - 0.01, d.t0 + 0.05);
    const top = hookOn(t) ? L.safeTopHook : L.safeTop;
    const ac = d.act;
    let r: { x: number; y: number; w: number; h: number };
    if (ac.do === "verdict") { const f = fitFs(ac.text.toUpperCase(), L.verdict.fs, L.verdict.maxW - 104 - 40, 6, MIN_TEXT_PX); const w = Math.min(L.verdict.maxW, f.w + 104 + 40); r = { x: L.verdict.x, y: L.verdict.y, w, h: L.verdict.fs * 1.2 + (ac.sub ? 90 : 0) }; }
    else if (ac.do === "caseCard") r = { ...L.caseCard };
    else if (ac.do === "counter") {
      const { w, h } = boardSize(L), pos = ac.pos ?? "right";
      r = { x: pos === "left" ? L.board.left + w / 2 : pos === "right" ? L.W - L.board.right - w / 2 : L.W / 2, y: pos === "center" ? L.H * 0.42 : top + L.board.top + h / 2, w, h };
    } else if (ac.do === "exhibit") {
      const label = ac.label ?? "EXHIBIT A";
      const sz = exhibitSize(L, label, ac.text);
      const cam = camAt(t);
      const others = s.devices.filter((o) => o.key !== d.key && o.t0 <= d.t0 && o.t1 > d.t0).map((o) => rectOf(o, s));
      // the chapter cards on screen while the tag is (their own region; polish.ts placeChapters)
      for (const ch of chaptersPlaced()) if (ch.box && ch.card < d.t1 && ch.card + LF.CHAPTER_CARD_S > d.t0 - LEAD) others.push({ x: (ch.box.x0 + ch.box.x1) / 2, y: (ch.box.y0 + ch.box.y1) / 2, w: ch.box.x1 - ch.box.x0, h: ch.box.y1 - ch.box.y0 });
      const faces = facesRects(cam, t);
      const q = d.target ? project(cam, d.target(t), L) : null;
      const ax = q?.x ?? L.W / 2, ay = q?.y ?? top + sz.h / 2 + 30;
      const cands: { x: number; y: number }[] = [];
      if (!q) cands.push({ x: L.W / 2, y: top + sz.h / 2 + 30 }, { x: L.W / 2, y: L.safeBottom - sz.h / 2 - 20 });
      else for (const dy of [-260, -180, -340, 180, 260, -420, 340]) for (const dx of [0, -(sz.w / 2 + 40), sz.w / 2 + 40]) cands.push({ x: ax + dx, y: ay + dy });
      const cl = (p: { x: number; y: number }) => ({ x: clamp(p.x, L.safeX0 + sz.w / 2, L.safeX1 - sz.w / 2), y: clamp(p.y, top + sz.h / 2, L.safeBottom - sz.h / 2) });
      let best = cl(cands[0]), bs = Infinity;
      cands.forEach((cd, k) => {
        const p = cl(cd), box = { ...p, ...sz };
        let sc = k * 0.01 + Math.hypot(p.x - cd.x, p.y - cd.y) * 0.002;
        if (faces.some((f) => rectsHit(box, f, 10))) sc += 100;
        if (others.some((o) => rectsHit(box, o, 18))) sc += 50;
        if (q && Math.abs(p.x - ax) < sz.w / 2 + 10 && Math.abs(p.y - ay) < sz.h / 2 + 10) sc += 20;
        if (sc < bs) { bs = sc; best = p; }
      });
      r = { ...best, ...sz };
    } else r = { x: L.W / 2, y: L.H / 2, w: 1, h: 1 };
    plan.set(d.key, r);
    return r;
  };
  // long-form chapter cards get their own screen region (polish.ts placeChapters): the first top clear of the fixed devices
  // (counters, case card, verdict) on screen during the card; exhibit tags then avoid the card (exhibitAvoid)
  const chapters = LS ? placeChapters(resolveChapters(recipe.chapters, at, hookUntil), (c0, c1) => {
    const out: { x0: number; x1: number; y0: number; y1: number }[] = [];
    for (const s of shots) {
      if (s.b <= c0 || s.a >= c1) continue;
      for (const d of s.devices) if (d.act.do !== "exhibit" && d.t0 - LEAD < Math.min(c1, s.b) && Math.min(d.t1, s.b) > c0) { const r = rectOf(d, s); const tab = d.act.do === "caseCard" ? 46 : 0; out.push({ x0: r.x - r.w / 2, x1: r.x + r.w / 2, y0: r.y - r.h / 2 - tab, y1: r.y + r.h / 2 }); }
    }
    return out;
  }, LF.CHAPTER_CARD_S) : [];
  chaptersPlacedV = chapters;
  const devicesAt = (t: number): DeviceBox[] => {
    const s = shotAt(t);
    const cam = camAt(t);
    const out: DeviceBox[] = [];
    for (const d of s.devices) {
      if (t < d.t0 - LEAD || t >= d.t1) continue;
      const r = rectOf(d, s);
      // a card that starts at 0 is fully on at frame 0 (frame-0 opener rule F3: no fade-in ghost at 0.00 s)
      const u = (d.t0 <= 1e-6 ? 1 : clamp((t - d.t0 + LEAD) / 0.22)) * clamp((d.t1 - t) / 0.15);
      const ac = d.act, age = t - d.t0;
      const box: DeviceBox = { key: d.key, kind: ac.do, ...r, u, age };
      if (ac.do === "exhibit") {
        box.label = (ac.label ?? "EXHIBIT A").toUpperCase(); box.text = ac.text.toUpperCase();
        if (d.target) { const q = project(cam, d.target(t), L); if (q) { box.ax = q.x; box.ay = q.y; box.line = EASE_OUT(prog(t, d.t0 - LEAD, d.t0 + 0.16)) * clamp((d.t1 - t) / 0.15); } }
      }
      if (ac.do === "verdict") { box.text = ac.text.toUpperCase(); box.sub = ac.sub?.toUpperCase(); }
      if (ac.do === "caseCard") { box.title = ac.title.toUpperCase(); box.year = ac.year; box.place = ac.place?.toUpperCase(); box.note = ac.note?.toUpperCase(); }
      if (ac.do === "counter") {
        box.title = ac.title.toUpperCase();
        let v = ac.to ?? 0;
        if (ac.value === undefined) v = lerp(ac.from ?? 0, ac.to ?? 0, countU(t, d.plan!, EASE_OUT));
        let zero = 0;
        if (d.zeroAt !== undefined && t >= d.zeroAt - LEAD) { zero = clamp((t - d.zeroAt) / 0.5); v = lerp(v, 0, EASE_OUT(zero)); }
        box.zero = zero;
        box.value = ac.value !== undefined && zero === 0 ? ac.value : zero === 0 && t >= d.plan!.end ? d.final! : counterText(ac, v);
        box.final = d.final; box.landed = zero === 0 && t >= d.plan!.end;
      }
      box.fs = fitOf(d, r).fs;
      out.push(box);
    }
    return out;
  };
  // ---------------------------------------------------- text-fit: every device line measured once (polish.ts fitFs)
  const fitCache = new Map<string, { fs: Record<string, number>; lines: DeviceFit["lines"] }>();
  const fitOf = (d: DeviceR, r: { w: number }) => {
    const got = fitCache.get(d.key);
    if (got) return got;
    const ac = d.act, lines: DeviceFit["lines"] = [];
    const fs: Record<string, number> = {};
    const add = (role: string, what: string, f: Fit, alt?: string) => { fs[role] = f.fs; lines.push({ what, fit: f, alt }); };
    if (ac.do === "counter") {
      const widest = [ac.value, counterText(ac, ac.from ?? 0), d.final].filter(Boolean).reduce((a, x) => (textPx(widestDigits(x!), 100) > textPx(widestDigits(a!), 100) ? x : a))!;
      const f = counterFit(L, r.w, ac.title, widest, d.zeroAt !== undefined);
      add("title", "counter title", f.title, "move the detail into the voice-over"); add("value", "counter value", f.value, `use "compact": true ($54M)`);
    } else if (ac.do === "exhibit") {
      const f = exhibitFit(L, ac.label ?? "EXHIBIT A", ac.text);
      add("label", "exhibit label", f.label); add("text", "exhibit text", f.text, "split it into two tags");
    } else if (ac.do === "caseCard") {
      const room = r.w - 98;
      add("title", "case card title", fitFs(ac.title.toUpperCase(), 92, room, -1, MIN_TEXT_PX), "a short case name (\"PEARSON v. CHUNG\")");
      add("meta", "case card year / place", fitFs([ac.year, ac.place?.toUpperCase()].filter(Boolean).join("  ·  "), 52, room, 0, MIN_SUB_PX));
      if (ac.note) add("note", "case card note", fitFs(ac.note.toUpperCase(), 36, room, 0, MIN_SUB_PX));
    } else if (ac.do === "verdict") {
      add("text", "verdict", fitFs(ac.text.toUpperCase(), L.verdict.fs, L.verdict.maxW - 144, 6, MIN_TEXT_PX), "one word");
      if (ac.sub) add("sub", "verdict sub line", fitFs(ac.sub.toUpperCase(), 64, L.verdict.maxW, 0, MIN_TEXT_PX));
    }
    const v = { fs, lines };
    fitCache.set(d.key, v);
    return v;
  };
  const fits: DeviceFit[] = [];
  for (const s of shots) for (const d of s.devices) if (d.act.do !== "gavel") fits.push({ key: d.key, shot: s.id, kind: d.act.do, lines: fitOf(d, rectOf(d, s)).lines });
  // ---------------------------------------------------- polish QA hooks
  const counters: CounterQ[] = shots.flatMap((s) => s.devices.filter((d) => d.act.do === "counter" && d.act.value === undefined).map((d) => {
    const ac = d.act as Extract<LawAction, { do: "counter" }>;
    return { key: d.key, shot: s.id, kind: "counter", title: ac.title, target: ac.to ?? 0, decimals: ac.decimals ?? 0, final: d.final!, t0: d.t0, until: d.plan!.until, plan: d.plan! };
  }));
  const counterAt = (key: string, t: number) => { const d = devicesAt(t).find((x) => x.key === key); return d ? { value: d.value ?? "", u: d.u, zero: d.zero ?? 0 } : null; };
  const cardRectsAt = (t: number): CardQ[] => {
    const out: CardQ[] = devicesAt(t).filter((d) => d.u > 0.05).map((d) => {
      const tab = d.kind === "caseCard" ? 46 : 0, w = d.kind === "verdict" ? Math.min(d.w, L.verdict.maxW) : d.w;
      return { label: `${d.kind} "${d.text ?? d.title ?? d.value ?? ""}"`, x0: d.x - w / 2, x1: d.x + w / 2, y0: d.y - d.h / 2 - tab, y1: d.y + d.h / 2, landed: d.u >= 0.99 };
    });
    if (t <= hookUntil || (hookAgain !== null && t >= hookAgain)) { const hb = hookBox(L, recipe.hook.text); out.push({ label: "hook", x0: hb.x - hb.w / 2, x1: hb.x + hb.w / 2, y0: hb.y - hb.h / 2, y1: hb.y + hb.h / 2, landed: true }); }
    return out;
  };
  const occludersAt = (t: number) => { const st = LAW_SETS[shotAt(t).set]; return [...st.blockers, ...(st.occluders ?? [])]; };
  const speakingAt = (t: number) => { const s = shotAt(t); if (!words.some((w) => t >= w.t && t < w.end)) return []; return s.figs.filter((f) => f.talk).map((f) => f.id); };
  const textsAt = (t: number) => {
    const out: string[] = [];
    if (t <= hookUntil) out.push(recipe.hook.text.replace(/\*/g, ""));
    for (const d of devicesAt(t)) if (d.u > 0.5) out.push([d.label, d.text, d.title, d.value, d.year, d.place, d.sub].filter(Boolean).join(" "));
    return out;
  };

  // ---------------------------------------------------- audio cue plan (tools/story_mix.py format; library names only)
  const cues: Cue[] = [{ t: 0, sfx: recipe.sfx0 ?? "impact", db: -1 }];
  for (const s of shots) {
    if (s.spec.cam.preset === "slamZoom") cues.push({ t: at(s.spec.cam.hit, s.a + 0.12) - 0.02, sfx: "impact", db: -1 });
    if (s.spec.cam.preset === "whip" || s.spec.in === "whip") cues.push({ t: s.a, sfx: "whoosh", db: -4 });
    for (const ac of s.spec.actions ?? []) {
      const t0 = at(ac.at);
      if (ac.do === "gavel") cues.push({ t: t0 - 0.01, sfx: "impact", db: 0 }, { t: t0, sfx: "thud", db: -2 });
      if (ac.do === "verdict") cues.push({ t: t0 - 0.02, sfx: "impact", db: 0 }, { t: t0, sfx: "boom", db: -4 });
      if (ac.do === "exhibit") cues.push({ t: t0 - 0.08, sfx: "whoosh", db: -7 }, { t: t0, sfx: "ding", db: -9 });
      if (ac.do === "caseCard") cues.push({ t: t0 - 0.1, sfx: "whoosh", db: -6 }, { t: t0 + 0.05, sfx: "thud", db: -8 });
      if (ac.do === "counter") { cues.push({ t: t0, sfx: "ding", db: -10 }); if (ac.value === undefined) { const dv = s.devices.find((x) => x.act === ac); cues.push({ t: dv?.plan ? dv.plan.end : t0 + (ac.dur ?? 1.2), sfx: "ding", db: -7 }); } if (ac.zeroAt !== undefined) cues.push({ t: at(ac.zeroAt), sfx: "whoosh", db: -5 }); }
    }
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "flyIn") cues.push({ t: p.hit - 0.35, sfx: "whoosh", db: -8 });
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "dropIn") cues.push({ t: p.hit - 0.02, sfx: "impact", db: -2 }, { t: p.hit, sfx: "thud", db: -3 });
    for (const p of s.props) if (p.a === s.a && p.spec.motion === "popIn") cues.push({ t: p.hit - 0.1, sfx: "whoosh", db: -8 });
    for (const f of s.fx) if (f.fx === "papers") cues.push({ t: f.at, sfx: "whoosh", db: -4 });
    for (const x of s.spec.sfx ?? []) cues.push({ t: at(x.at), sfx: x.sfx, db: x.db });
  }
  if (LS) cues.push(...chapterCues(chapters));
  cues.push({ t: end - 0.35, sfx: "whoosh", db: -2 });
  const audio = { music: recipe.music ?? "suspense", cues: cues.filter((q) => q.t >= 0 && q.t < end).sort((x, y) => x.t - y.t) };

  return { recipe, slug: recipe.slug, layout: L, duration, shots, words, at, hookUntil, hookAgain, shotAt, camAt, figsAt, devicesAt, qa, textsAt, audio, landscape: LS, chapters, faceBands, fits, counters, counterAt, cardRectsAt, occludersAt, speakingAt };
};

// ------------------------------------------------------------------ figure tracks
const figTrack = (as: ActorSpec, cs: CastSpec, a: number, b: number, set: LawSet, sid: string, at: (x: At | undefined, d?: number) => number, placeV: (p: Place, s: LawSet, id: string) => V3,
  targetFn: (t: LawTarget) => (t: number) => V3, lensPos: () => V3, words: readonly Word[], cam: LawCam, hits: number[]): FigTrack => {
  const p0 = placeV(as.at, set, sid), p1 = as.to ? placeV(as.to, set, sid) : p0;
  const t0 = at(as.from, a);
  const segs: { t0: number; pose: FigPose; face?: FigFace }[] = [{ t0: Math.max(a, t0 - LEAD), pose: as.pose, face: as.face }];
  const faces: { t0: number; face: FigFace }[] = [];
  for (const x of as.then ?? []) {
    const tt = at(x.at) - LEAD;
    if (x.pose) segs.push({ t0: tt, pose: x.pose, face: x.face }); else if (x.face) faces.push({ t0: tt, face: x.face });
  }
  const look = as.look;
  const lookFn = look !== undefined && typeof look !== "number" ? targetFn(look) : null;
  const camT = typeof cam.target === "string" ? cam.target.split(".")[0] : "";
  const ptT = as.pointAt ?? (camT && camT !== as.id ? cam.target : undefined);
  const ptFn = ptT !== undefined ? targetFn(ptT) : null;
  const pos = (t: number): V3 => lerpV(p0, p1, EASE_INOUT(clamp((t - a) / Math.max(0.3, b - a))));
  const yawOf = (t: number) => {
    if (typeof look === "number") return look * D2R;
    const p = pos(t);
    if (lookFn) return yawTo(p, lookFn(t));
    return yawTo(p, lensPos());
  };
  const usesGavel = as.gavel ?? (cs.role === "judge" && (as.pose === "gavel" || (as.then ?? []).some((x) => x.pose === "gavel")));
  return {
    id: as.id, spec: cs, seed: 3 + as.id.length * 7 + as.id.charCodeAt(0), s: as.scale ?? 1, sit: !!as.sit,
    at: pos,
    yaw: yawOf,
    segs, faces,
    pointAt: ptFn ? (t) => ptFn(t) : (t) => lensPos(),
    talk: as.talk ? (t) => visemeAt(words, t) : undefined,
    hits, gavel: usesGavel,
    desk: deskFn(set, pos, yawOf, cs, as),
  };
};
/** the desk in front of a figure (Limb QA, src/law/cast.tsx overDesk): a set blocker whose top is between the hip and
 *  a little above the shoulder, whose near face is 0.1-0.9 m in front and which spans the figure's width. Returned in
 *  the hip's yawed frame at scale 1 (top height above the hip, near-face distance), or null */
const deskFn = (set: LawSet, pos: (t: number) => V3, yaw: (t: number) => number, cs: CastSpec, as: ActorSpec) => {
  if (!set.blockers.length) return undefined;
  const s = (as.scale ?? 1) * (cs.height ?? 1);
  const hip = (as.sit ? 0.5 : 0.92) * s;
  return (t: number): { y: number; z: number } | null => {
    const p = pos(t), yw = yaw(t), c = Math.cos(yw), sn = Math.sin(yw);
    let best: { y: number; z: number } | null = null;
    for (const b of set.blockers) {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity;
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
        const wx = b.c[0] + dx * b.h[0] - p[0], wz = b.c[2] + dz * b.h[2] - p[2];
        const lx = wx * c - wz * sn, lz = wx * sn + wz * c;
        x0 = Math.min(x0, lx); x1 = Math.max(x1, lx); z0 = Math.min(z0, lz);
      }
      const top = b.c[1] + b.h[1] - p[1] - hip;
      if (x1 < -0.3 * s || x0 > 0.3 * s || z0 < 0.1 * s || z0 > 0.9 * s || top < -0.05 * s || top > 0.75 * s) continue;
      if (!best || z0 < best.z * s) best = { y: top / s, z: z0 / s };
    }
    return best;
  };
};

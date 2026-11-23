// One engine for every finance Short. A Short = its plan.gen.ts (shots on words, captions, counter note) + a staging
// file: per shot a lens (subject + offset or a fixed position, fov, face height) and a set; actors (pure poses of t);
// story props (React of t); and the on-screen counter (pure of t). The shot is picked by the OUTPUT frame, so the
// motion-blur sub-frames of one frame never mix two shots. Captions use script.txt casing, keyed to the output frame.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { aim } from "../engine/core/rig";
import type { Cam } from "../engine/core/View";
import { View } from "../engine/core/View";
import { subFrame, useFonts } from "../engine/core/frame";
import { Blocky } from "../blocky/Blocky";
import type { Held, Look } from "../blocky/Blocky";
import { Blob } from "../blocky/Contact";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { lerp } from "../blocky/motion";
import { blinkAt, alive } from "../library/characters";
import { moodFor } from "../library/mood";
import { moodForShot } from "../blocky/mood";
import type { Chunk } from "../engine/core/captions";
import { FinCaptions, Hud } from "./Hud";
import type { HudState } from "./Hud";

export const FPS = 30;
export const PUSH = 0.1; // of the lens distance per second (style.md: 8-11 %/s)

export type PlanShot = { readonly id: string; readonly t: number; readonly end: number; readonly mood: string; readonly note: string; readonly scene: string; readonly anchor: string };
export type PlanCaption = { readonly text: string; readonly cased: string; readonly accent: readonly string[]; readonly frame: number };
export type Plan = { FPS: number; DURATION: number; SHOTS: readonly PlanShot[]; CAPTIONS: readonly PlanCaption[]; TAGS: readonly unknown[]; COUNTER: string };

export type SetName = "hall" | "retro" | "workshop" | "road" | "garden";
/** a lens: look at subj (may move with t); the lens sits at subj + off (or at pos), pushing in at PUSH (or push) */
/** fit: who must be in frame (bust = head and shoulders); the lens distance along `off` (and, without subj, the
 * subject point) is solved so they stay inside the frame (below the counter panel) until the end of the push-in */
export type Fit = { keys: string[]; bust?: boolean; extra?: V3[]; margin?: number };
export type Lens = { subj?: V3 | ((t: number) => V3); off?: V3; pos?: V3; fov: number; face: number; roll?: [number, number]; push?: number; set: SetName; shutter?: number; fit?: Fit };
export type Actor = { key: string; look: Look; pose: Pose; emotion: Emotion; s: number; held?: Held; chest?: React.ReactNode; seed: number };

export type ShortDef = {
  slug: string;
  comp: string; // composition id (PascalCase)
  plan: Plan;
  lenses: Record<string, Lens>;
  actors: (t: number, id: string) => Actor[];
  props: (t: number, id: string) => React.ReactNode;
  counter: (t: number, id: string) => HudState | null;
};

/** offset from yaw (deg, 0 = lens on +z looking toward -z), distance and height */
export const orbit = (yawDeg: number, dist: number, dy: number): V3 => {
  const a = (yawDeg * Math.PI) / 180;
  return [Math.sin(a) * dist, dy, Math.cos(a) * dist];
};
export const shotIndex = (plan: Plan, n: number) => {
  let i = 0;
  for (let k = 0; k < plan.SHOTS.length; k++) if (n >= Math.round(plan.SHOTS[k].t * FPS)) i = k;
  return i;
};
// ---- lens fitting (pure, cached per shot) ----
const TOP_SAFE = 0.235; // the counter panel covers the top ~22 %
const fitPoints = (def: ShortDef, id: string, t: number, fit: Fit): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  for (const a of def.actors(t, id)) {
    if (!fit.keys.includes(a.key)) continue;
    const p = a.pose, s = a.s;
    const headC = p.y + 0.70 * s; // (torso 2 U + gap + half head) * U, U = 0.27
    const side = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    const r = 0.3 * s;
    const ys = fit.bust ? [headC + 0.2 * s, p.y + 0.25 * s] : [headC + 0.2 * s, p.y - 0.54 * s];
    for (const y of ys) for (const k of [-1, 1]) pts.push(new THREE.Vector3(p.x, y, p.z).addScaledVector(side, k * r));
  }
  for (const e of fit.extra ?? []) pts.push(new THREE.Vector3(...e));
  return pts;
};
const fitCam = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 600);
const marginOf = (c: Cam, pts: THREE.Vector3[], margin: number) => {
  fitCam.fov = c.fov;
  fitCam.position.set(...c.pos);
  fitCam.up.set(0, 1, 0);
  fitCam.lookAt(...c.look);
  fitCam.updateProjectionMatrix();
  fitCam.updateMatrixWorld();
  let m = 9;
  for (const q of pts) {
    const cs = q.clone().applyMatrix4(fitCam.matrixWorldInverse);
    if (cs.z > -0.05) return -1;
    const v = q.clone().project(fitCam);
    const fx = (v.x + 1) / 2, fy = (1 - v.y) / 2;
    m = Math.min(m, fx - margin, 1 - margin - fx, fy - TOP_SAFE, 1 - margin - fy);
  }
  return m;
};
type Solved = { subj: V3; off: V3 };
const solved = new Map<string, Solved>();
const solve = (def: ShortDef, shot: PlanShot, L: Lens): Solved => {
  const key = `${def.slug}:${shot.id}`;
  const hit = solved.get(key);
  if (hit) return hit;
  const fit = L.fit!;
  const t0 = shot.t, t1 = Math.max(shot.t, shot.end - 1 / FPS);
  const p0 = fitPoints(def, shot.id, t0, fit), p1 = fitPoints(def, shot.id, t1, fit);
  let subj: V3;
  if (L.subj) subj = typeof L.subj === "function" ? L.subj(t0) : L.subj;
  else {
    const all = [...p0, ...p1];
    const lo = all.reduce((a, b) => a.clone().min(b)), hi = all.reduce((a, b) => a.clone().max(b));
    subj = [(lo.x + hi.x) / 2, (lo.y + hi.y) / 2, (lo.z + hi.z) / 2];
  }
  const dir = new THREE.Vector3(...L.off!).normalize();
  const push = L.push ?? PUSH;
  const ok = (d: number) => {
    for (const [t, pts] of [[t0, p0], [t1, p1]] as [number, THREE.Vector3[]][]) {
      const k = 1 - push * (t - t0);
      const pos: V3 = [subj[0] + dir.x * d * k, subj[1] + dir.y * d * k, subj[2] + dir.z * d * k];
      if (marginOf(aim(pos, subj, L.fov, L.face), pts, fit.margin ?? 0.04) < 0) return false;
    }
    return true;
  };
  let lo = 0.4, hi = 30;
  if (!ok(hi)) lo = hi;
  else for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (ok(m)) hi = m; else lo = m; }
  const d = hi;
  const r: Solved = { subj, off: [dir.x * d, dir.y * d, dir.z * d] };
  solved.set(key, r);
  return r;
};
export const camOfShot = (def: ShortDef, shot: PlanShot, t: number): Cam => {
  const L = def.lenses[shot.id];
  if (!L) throw new Error(`${def.slug}: no lens for ${shot.id}`);
  const tau = Math.max(0, t - shot.t);
  const fitted = L.fit && !L.pos ? solve(def, shot, L) : null;
  const subj: V3 = fitted ? fitted.subj : typeof L.subj === "function" ? L.subj(t) : L.subj!;
  const off: V3 | undefined = fitted ? fitted.off : L.off;
  const k = 1 - (L.push ?? PUSH) * tau;
  const pos: V3 = L.pos
    ? [subj[0] + (L.pos[0] - subj[0]) * k, subj[1] + (L.pos[1] - subj[1]) * k, subj[2] + (L.pos[2] - subj[2]) * k]
    : [subj[0] + off![0] * k, subj[1] + off![1] * k, subj[2] + off![2] * k];
  const c = aim(pos, subj, L.fov, L.face);
  const r = L.roll ?? [0, 1.2];
  return { ...c, roll: lerp(r[0], r[1], Math.min(1, tau / Math.max(0.3, shot.end - shot.t))) };
};

const INDOOR: Record<SetName, string> = { hall: "store", retro: "home", workshop: "store", road: "earth", garden: "earth" };
const moodOfShot = (def: ShortDef, shot: PlanShot, cam: Cam) => {
  const L = def.lenses[shot.id];
  const key = `${def.slug}:${shot.id}`;
  const set = INDOOR[L.set];
  if (set === "earth") return shot.mood === "whisper" ? moodFor("earth", key, cam, true) : moodForShot(key, cam);
  if (shot.mood === "ending" || L.set === "retro") return moodFor("store2", key, cam); // retro = warm gold (ids registered as ending)
  return moodFor(set, key, cam);
};

const chunksOf = (plan: Plan): (Chunk & { accent: string[] })[] => {
  const cs = plan.CAPTIONS;
  const end = plan.DURATION / FPS;
  return cs.map((c, i) => ({ words: [c.cased], accent: [...c.accent], a: c.frame / FPS, b: i + 1 < cs.length ? cs[i + 1].frame / FPS : end }));
};
/** the actors with the idle layer (never still) */
export const actorsAt = (def: ShortDef, t: number, id: string) => def.actors(t, id).map((a) => {
  const x = alive({ key: a.key, look: a.look, pose: a.pose, emotion: a.emotion, s: a.s, held: a.held, blinkSeed: a.seed }, t);
  return { ...a, pose: x.pose };
});

export const FinShort: React.FC<{ def: ShortDef; sub?: boolean; children?: React.ReactNode }> = ({ def, sub = false }) => {
  const ready = useFonts();
  const g = useCurrentFrame();
  const plan = def.plan;
  const n0 = sub ? Math.floor(g / 4) : g;
  const shot0 = plan.SHOTS[shotIndex(plan, n0)];
  const shutter = def.lenses[shot0.id]?.shutter ?? 0.35;
  const { n, fp } = sub ? subFrame(g, 4, shutter) : { n: g, fp: g };
  const t = fp / FPS;
  const shot = plan.SHOTS[shotIndex(plan, n)];
  const cam = camOfShot(def, shot, t);
  const mood = moodOfShot(def, shot, camOfShot(def, shot, shot.t));
  const L = def.lenses[shot.id];
  const outdoor = L.set === "road" || L.set === "garden";
  const tn = n / FPS; // captions + HUD keyed to the output frame (sharp)
  const actors = actorsAt(def, t, shot.id);
  const lastEnd = plan.CAPTIONS.length ? plan.DURATION / FPS - 0.25 : 0;
  const hud = def.counter(tn, shot.id);
  return (
    <AbsoluteFill style={{ background: outdoor ? "#6aa6f2" : "#1a1030" }}>
      <View mood={mood} cam={cam} t={t} blur={0} sky={outdoor}>
        {def.props(t, shot.id)}
        {actors.map((a) => (
          <group key={a.key}>
            <Blocky pose={a.pose} look={a.look} emotion={a.emotion} blink={blinkAt(t, a.seed)} held={a.held} chest={a.chest} scale={a.s} />
            <Blob p={[a.pose.x, 0, a.pose.z]} sx={0.75 * a.s} sz={0.55 * a.s} yaw={-a.pose.yaw} op={0.5} />
          </group>
        ))}
      </View>
      {ready && hud ? <Hud state={hud} t={tn} /> : null}
      {ready ? <FinCaptions chunks={chunksOf(plan)} t={tn} until={lastEnd} /> : null}
    </AbsoluteFill>
  );
};

/** a fitted lens: direction (yaw deg, elevation dy per m of distance), distance solved so `keys` (+ extra points) fit */
export const fitLens = (set: SetName, keys: string[], yaw: number, dy: number, o: { fov?: number; face?: number; bust?: boolean; subj?: V3; extra?: V3[]; shutter?: number; margin?: number } = {}): Lens => ({
  subj: o.subj, off: orbit(yaw, 1, dy), fov: o.fov ?? 50, face: o.face ?? 0.5, set, shutter: o.shutter,
  fit: { keys, bust: o.bust, extra: o.extra, margin: o.margin },
});
/** a manual lens: look at subj from yaw/dist/dy */
export const lens = (set: SetName, subj: V3, yaw: number, dist: number, dy: number, fov = 50, face = 0.45, extra: Partial<Lens> = {}): Lens => ({ subj, off: orbit(yaw, dist, dy), fov, face, set, ...extra });

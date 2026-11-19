// The shared Short engine for the Block Money finance Shorts. A Short = a list of FinShot (times from plan.gen.ts,
// a lens per shot) + a scene function (the whole world at time t, with the current shot for per-shot staging) + a
// counter function + captions. Same rules as the template: the shot is chosen by the OUTPUT frame (motion-blur
// sub-frames never mix shots), every shot pushes in, everything is a pure function of the frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Blocky } from "../blocky/Blocky";
import type { Held, Look } from "../blocky/Blocky";
import { lerp } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { subFrame, useFonts } from "../engine/core/frame";
import { aim } from "../engine/core/rig";
import { View } from "../engine/core/View";
import type { Cam } from "../engine/core/View";
import type { Chunk } from "../engine/core/captions";
import { alive, base, blinkAt } from "../library/characters";
import { moodFor, setMoodShots } from "../library/mood";
import { Caps, CornerTag, Counter } from "./hud";
import type { CounterState } from "./hud";

export const FPS = 30;
export const PUSH = 0.11;
export type MoodKey = "store" | "whisper" | "ending" | "earth" | "home";
export type FinShot = {
  id: string;
  a: number;
  b: number;
  /** subject point (may move with t) */
  subj: (t: number) => V3;
  /** lens = subject + off (scaled by the push) ... */
  off: V3;
  /** ... or a fixed lens position that pushes toward the subject */
  pos?: V3;
  fov: number;
  /** where the subject sits, fraction from the top of the frame */
  face: number;
  roll?: [number, number];
  push?: number;
  mood: MoodKey;
  /** outdoor shots draw the sky dome */
  sky?: boolean;
  /** depth-of-field blur px (wide 0.6, medium 1.4, close 2.4) */
  blur?: number;
  /** motion-blur shutter (fraction of a frame): 0.35 default, 0.2 for fast whole-body moves, 0.125 for big close slides */
  shutter?: number;
};

/** times from plan.gen.ts SHOTS + lens specs keyed by shot id */
export const buildShots = (plan: readonly { id: string; t: number; end: number }[], lens: Record<string, Omit<FinShot, "id" | "a" | "b">>): FinShot[] =>
  plan.map((p) => {
    const L = lens[p.id];
    if (!L) throw new Error(`no lens for ${p.id}`);
    return { id: p.id, a: p.t, b: p.end, ...L };
  });
export const shotIndexAt = (shots: FinShot[], n: number) => {
  let i = 0;
  for (let k = 0; k < shots.length; k++) if (n >= Math.round(shots[k].a * FPS)) i = k;
  return i;
};
export const camOf = (s: FinShot, t: number): Cam => {
  const tau = Math.max(0, t - s.a);
  const subj = s.subj(t);
  const k = 1 - (s.push ?? PUSH) * tau;
  const pos: V3 = s.pos
    ? [subj[0] + (s.pos[0] - subj[0]) * k, subj[1] + (s.pos[1] - subj[1]) * k, subj[2] + (s.pos[2] - subj[2]) * k]
    : [subj[0] + s.off[0] * k, subj[1] + s.off[1] * k, subj[2] + s.off[2] * k];
  const c = aim(pos, subj, s.fov, s.face);
  const r = s.roll ?? [0, 0];
  return { ...c, roll: lerp(r[0], r[1], Math.min(1, tau / Math.max(0.01, s.b - s.a))) };
};

/** an actor: Blocky + the idle layer (breathing, sway, drifting head, blinks) */
export const Act: React.FC<{ look: Look; pose: Pose; emotion: Emotion; s: number; t: number; seed: number; held?: Held; chest?: React.ReactNode; still?: boolean }> = ({ look, pose, emotion, s, t, seed, held, chest, still = false }) => {
  const a = still ? { pose } : alive({ key: String(seed), look, pose, emotion, s, blinkSeed: seed }, t);
  return <Blocky pose={a.pose} look={look} emotion={emotion} blink={blinkAt(t, seed)} held={held} chest={chest} scale={s} />;
};
export const stand = (x: number, z: number, yaw: number, s: number, o: Partial<Pose> = {}) => base(x, z, yaw, s, o);
export const yawTo = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);

export type FinSpec = {
  slug: string;
  shots: FinShot[];
  duration: number; // output frames
  chunks: Chunk[];
  /** hide captions after this time (s) */
  until: number;
  whisper: string[];
  ending: string[];
  /** the whole world at time t (shot = the current shot, tau = time inside it) */
  scene: (t: number, shot: FinShot, tau: number) => React.ReactNode;
  counter: (t: number, shot: FinShot, tau: number) => CounterState;
  tag?: (t: number, shot: FinShot) => string | null;
  bg?: string;
};

const moodOfShot = (spec: FinSpec, s: FinShot) => {
  const id = `${spec.slug}:${s.id}`;
  const cam = camOf(s, s.a);
  if (s.mood === "earth") return moodFor("earth", id, cam);
  if (s.mood === "home") return moodFor("home", id, cam);
  return moodFor("store2", id, cam);
};
let moodsFor = "";
const ensureMoods = (spec: FinSpec) => {
  if (moodsFor === spec.slug) return;
  setMoodShots(
    spec.shots.filter((s) => s.mood === "whisper").map((s) => `${spec.slug}:${s.id}`),
    spec.shots.filter((s) => s.mood === "ending").map((s) => `${spec.slug}:${s.id}`),
  );
  moodsFor = spec.slug;
};

/** one composition body for a FinSpec; sub = the motion-blur variant (SUB = 4 sub-frames per output frame) */
export const FinFilm: React.FC<{ spec: FinSpec; sub?: boolean; at?: number }> = ({ spec, sub = false, at }) => {
  const g = useCurrentFrame();
  useFonts();
  ensureMoods(spec);
  const f = at !== undefined ? at : g;
  const n0 = sub ? Math.floor(f / 4) : f;
  const shot0 = spec.shots[shotIndexAt(spec.shots, n0)];
  const { n, fp } = sub ? subFrame(f, 4, shot0.shutter ?? 0.35) : { n: f, fp: f };
  const shot = spec.shots[shotIndexAt(spec.shots, n)];
  // the shot's own time range: sub-frame time is clamped inside the shot (no peeking across the cut)
  const t = Math.min(Math.max(fp / FPS, shot.a), shot.b - 1e-4);
  const tau = t - shot.a;
  const cam = camOf(shot, t);
  const mood = moodOfShot(spec, shot);
  const tOut = n / FPS; // captions and counter key to the output frame (sharp text)
  const focus = shot.subj(t);
  return (
    <AbsoluteFill style={{ background: spec.bg ?? "#2a1f5a" }}>
      <View mood={mood} cam={cam} t={t} blur={shot.blur ?? 1.2} focus={focus} sky={shot.sky ?? false}>
        {spec.scene(t, shot, tau)}
      </View>
      <Counter state={spec.counter(tOut, shot, tOut - shot.a)} />
      <CornerTag text={spec.tag ? spec.tag(tOut, shot) : null} />
      <Caps chunks={spec.chunks} t={tOut} until={spec.until} />
    </AbsoluteFill>
  );
};
export const v3 = (x: number, y: number, z: number): V3 => [x, y, z];
export const dist = (a: V3, b: V3) => new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));

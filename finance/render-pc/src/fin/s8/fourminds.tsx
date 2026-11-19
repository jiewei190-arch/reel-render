// S8 four-money-minds: the STACKED-LANES Short (finance/shorts/four-money-minds/BRIEF.md + MAIN's update).
// One 3D world with four stages stacked vertically (SPENDER / SAVER / INVESTOR / DEBT KILLER), each a dark stage with a
// neon floor line, the cast member on the left, a little crowd of faceless grey HATERS on the right. One camera rides
// it like an elevator: wide -> push-in -> one lane at a time (~50 % of the frame, neighbours visible) -> wide for the
// "1 YEAR LATER" flip -> back down -> wide scoreboard. A 2D layer draws the title, lane labels and counters (projected
// from the lanes, clamped inside each lane with a 16 px margin), the calendar flip, the scoreboard, captions.
// Everything is a pure function of the frame. The composition is registered in src/fin/recipe/root.tsx (toolkit entry).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import type { Held, Look } from "../../blocky/Blocky";
import { geoOf, plastic, canvasTexture } from "../../blocky/mat";
import { clamp, hash, lerp } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { subFrame, useFonts } from "../../engine/core/frame";
import { mk, MOODS } from "../../engine/core/moods";
import type { MoodPreset } from "../../engine/core/moods";
import { View } from "../../engine/core/View";
import type { Cam } from "../../engine/core/View";
import { chunkWords, RecipeCaptions } from "../lib/captions";
import type { CapChunk, CapWord } from "../lib/captions";
import { base, facePoint, heldWorld, pop, SAVER, sit, SPENDER } from "../../library/characters";
import { Act } from "../core";
import { BillBrick, Coin } from "../props";
import {
  brickSlot, Coupon, COUPON_TEXT, Crown, DebtBoard, Envelope, FoodBag, FundBox, Hater, Headset, LineChart, MoneyHammer, SavingsJar, Shard, shardHome, SHARD, ShoeBox,
} from "./props";
import type { HaterPose } from "./props";

export const S8_FPS = 30;
export const S8_DURATION = 28.0;
export const S8_FRAMES = Math.round(S8_DURATION * S8_FPS);

// ------------------------------------------------------------------ cast
const FIN_PANTS = "#2a2a3a";
export const INVESTOR: Look = { skin: "#5ab4ff", hair: "#3a98f0", hairStyle: "antennae", shirt: "#1f78d6", pants: FIN_PANTS, shoes: "#f4f4f2", sole: "#7dffcf", accent: "#7dffcf", print: "bolt", cheeks: "none", eyeScale: 1.1, belt: "#123a78", cuffs: "#ffd23a", acc: { cap: ["#0f3a8a", "#ffd23a"] } };
export const DEBT_KILLER: Look = { skin: "#ff9a3a", hair: "#f08020", hairStyle: "antenna1", shirt: "#e8701a", pants: FIN_PANTS, shoes: "#f4f4f2", sole: "#ffd23a", accent: "#fff0a0", print: "star", cheeks: "none", eyeScale: 1.1, belt: "#7a3a0a", cuffs: "#ffd23a", acc: { headband: ["#ffffff", "#d62a2a"] } };

// ------------------------------------------------------------------ world layout
export const P = 2.08; // lane pitch (m)
export const SLAB = 0.18;
export const laneY = (i: number) => (3 - i) * P; // floor height of lane i (0 = top)
export const LANE_TOP = P - SLAB; // inside height above the floor
export const FRONT = 0.9; // floor front edge z
type LaneDef = { name: string; color: string; look: Look; x: number; signs: string[]; haters: [number, number][] };
const HATERS3: [number, number][] = [[0.95, -0.3], [1.4, 0.08], [1.85, -0.45]];
export const LANES: LaneDef[] = [
  { name: "SPENDER", color: "#ff3b3b", look: SPENDER, x: -1.5, signs: ["JUST BUY IT", "YOLO", "TREAT YOURSELF"], haters: HATERS3 },
  { name: "SAVER", color: "#2fe07a", look: SAVER, x: -1.5, signs: ["BORING", "YOU'LL MISS OUT", "CASH IS TRASH"], haters: HATERS3 },
  { name: "INVESTOR", color: "#3a9bff", look: INVESTOR, x: -1.5, signs: ["IT'LL CRASH", "SELL NOW!", "YOLO"], haters: HATERS3 },
  { name: "DEBT KILLER", color: "#ff8a1f", look: DEBT_KILLER, x: -1.15, signs: ["JUST BUY IT", "BORING", "YOLO", "MIN PAYMENT"], haters: [[0.95, -0.3], [1.4, 0.08], [1.85, -0.45], [1.6, -0.95]] },
];
const YAW0 = 0.55;
const ENV_X = (i: number) => LANES[i].x + (i === 3 ? 0.62 : 0.55);
const ENV_Z = 0.45;
const JAR_X = -0.55;
const BOX_X = -0.6;
const CHART_X = 0.15;
const BOARD_X = 0.05;
const SEAT_X = -0.75;

// ------------------------------------------------------------------ easing
export const ease = (u: number) => {
  const x = clamp(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));
export const decay = (t: number, a: number, k = 6) => (t < a ? 0 : Math.exp(-(t - a) * k));
export const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const lerpPose = (a: Pose, b: Pose, u: number): Pose => {
  const o = { ...a } as unknown as Record<string, number>;
  for (const k of Object.keys(b) as (keyof Pose)[]) {
    const av = (a[k] ?? 0) as number, bv = (b[k] ?? 0) as number;
    if (typeof bv === "number") o[k] = lerp(av, bv, u);
  }
  return o as unknown as Pose;
};
/** a ballistic arc from a to b over [t0, t1] with an apex `h` above the straight line */
export const arc = (a: V3, b: V3, t: number, t0: number, t1: number, h: number): V3 => {
  const u = clamp((t - t0) / (t1 - t0));
  const p = lerpV(a, b, u);
  return [p[0], p[1] + 4 * h * u * (1 - u), p[2]];
};
/** the loop reset: props and states fall back to the frame-0 state over 27.3-27.65 s */
const RESET = (t: number) => ease(seg(t, 27.3, 27.65));
const keep = (t: number) => 1 - RESET(t);

// ------------------------------------------------------------------ camera (the elevator)
export const FOV = 18;
export const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
export type CS = { cx: number; cy: number; hf: number };
export type CamMove = { at: number; dur: number; to: Partial<CS> };
// wide: the 4 lanes fill y 200-1650; push: lanes 0-2 fill y 200-1380; scoreboard: lanes fill y 205-1370 (captions below)
const W0: CS = { cx: 0.75, cy: 3.78, hf: 11.03 };
const W1: CS = { cx: 0.75, cy: 4.12, hf: 10.16 };
const W2: CS = { cx: 0.55, cy: 2.75, hf: 13.7 };
// focus: the lane band centred at y 810 (between the title band and the caption band)
const F = (i: number, cx = -0.45, hf = 5.3): CS => ({ cx, cy: laneY(i) + 0.44, hf });
const MOVES: CamMove[] = [
  { at: 1.0, dur: 0.4, to: W1 },
  { at: 2.0, dur: 0.45, to: F(0) },
  { at: 4.1, dur: 0.45, to: { cx: 0.55 } },
  { at: 4.95, dur: 0.4, to: { cx: -0.45 } },
  { at: 6.0, dur: 0.45, to: F(1) },
  { at: 7.85, dur: 0.45, to: { cx: 0.55 } },
  { at: 8.75, dur: 0.4, to: { cx: -0.45 } },
  { at: 10.0, dur: 0.45, to: F(2, -0.45) },
  { at: 11.75, dur: 0.4, to: W0 },
  { at: 13.2, dur: 0.42, to: F(2, -0.3) },
  { at: 15.2, dur: 0.42, to: { ...F(3, -0.35, 5.0), cy: laneY(3) + 1.49 } }, // the last lane sits low: no dead floor under it
  { at: 18.0, dur: 0.35, to: { cx: 0.2, hf: 6.0 } },
  { at: 19.05, dur: 0.35, to: { cx: 0.7 } },
  { at: 20.15, dur: 0.4, to: { cx: -0.25, hf: 5.6 } },
  { at: 21.1, dur: 0.4, to: W2 },
];
const SHAKES: [number, number][] = [[0, 1.0], [16.3, 0.45], [17.1, 0.7], [18.0, 1.5], [19.3, 0.9], [24.85, 0.35]];
/** the elevator camera for a list of moves (each eases from the previous state), shakes [t0, amplitude] and a start state */
export const makeCamAt = (moves: CamMove[], shakes: [number, number][], start: CS) => {
  const camState = (t: number): CS => {
    let s: CS = start;
    let last = 0;
    for (const m of moves) {
      if (t < m.at) break;
      const to = { ...s, ...m.to };
      const u = ease((t - m.at) / m.dur);
      s = { cx: lerp(s.cx, to.cx, u), cy: lerp(s.cy, to.cy, u), hf: lerp(s.hf, to.hf, u) };
      last = m.at + m.dur;
    }
    // a gentle continuous push between moves (never a dead frame), capped
    const drift = 1 - Math.min(0.04, 0.008 * Math.max(0, t - last));
    return { ...s, hf: s.hf * drift };
  };
  return (t: number): Cam => {
    const s = camState(t);
    const d = s.hf / 2 / TAN;
    let sx = 0, sy = 0;
    for (const [t0, a] of shakes) {
      if (t < t0 || t > t0 + 0.6) continue;
      const k = a * Math.exp(-(t - t0) * 8) * s.hf * 0.006;
      sx += k * Math.sin((t - t0) * 83 + t0);
      sy += k * Math.sin((t - t0) * 67 + 1.7 * t0);
    }
    const tilt = 0.05;
    return { pos: [s.cx + sx, s.cy + d * tilt + sy, d], look: [s.cx + sx, s.cy + sy, 0], fov: FOV, roll: 0 };
  };
};
export const camAt = makeCamAt(MOVES, SHAKES, W0);
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.02, 600);
export const project = (cam: Cam, p: V3): [number, number] => {
  projCam.fov = cam.fov;
  projCam.position.set(...cam.pos);
  projCam.up.set(0, 1, 0);
  projCam.lookAt(...cam.look);
  projCam.updateProjectionMatrix();
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

// ------------------------------------------------------------------ the mood: dark stage, neon floors
export const NEON: MoodPreset = (() => {
  const m = mk({
    note: "s8 neon lanes: dark stage, warm key from the front, cool rim",
    hemi: ["#6870c8", "#0a0612", 0.62], key: ["#fff1e0", 3.3, [0.38, 0.52, 1.0]], rim: ["#9fb0ff", 1.8, [-0.6, 0.5, -0.8]],
    fill: ["#8a90ff", 0.5, [-0.8, 0.25, 0.6]], prac: ["#ffd8a0", 0, "#fff0d0"], fog: ["#07060e", 0.0003],
    sky: MOODS.night.sky,
    toon: { shadowTint: [0.82, 0.84, 1.2], hiTint: [1.04, 1.02, 0.98], rimColor: "#cdd6ff" },
    grade: { exposure: 0.95, contrast: 1.12, saturation: 1.18, shadowTint: "#2a2a7a", highlightTint: "#fff0d8", gain: "#fbfbff" }, bloomTint: "#ffffff", ink: "#08060e",
    camFill: ["#dfe4ff", 0.4], cast: { rim: ["#cdd6ff", 1.8], fill: ["#ffe0c0", 0.6] },
  });
  return { ...m, post: { ...m.post, outline: { ...m.post.outline, fadeNear: 70, fadeFar: 140, widthPx: 2.6 }, bloom: { ...m.post.bloom, threshold: 1.0, strength: 0.7 }, vignette: { ...m.post.vignette, amount: 0.25 }, grade: { ...m.post.grade, lift: "#000000" } } };
})();

// ------------------------------------------------------------------ timeline data
// throws: [time, hater index, coupon text index]
const THROWS: [number, number, number][][] = [
  [[2.35, 0, 0], [3.05, 1, 1], [3.75, 0, 3], [4.45, 2, 2], [6.6, 1, 4], [8.8, 0, 0], [11.0, 2, 1], [13.4, 1, 3], [15.6, 0, 4], [17.8, 2, 0], [20.0, 1, 1]],
  [[2.9, 1, 2], [5.0, 0, 1], [6.9, 2, 0], [8.5, 1, 4], [10.6, 0, 3], [13.8, 2, 1], [16.4, 1, 0], [19.0, 0, 2]],
  [[3.4, 0, 1], [5.8, 2, 4], [8.0, 1, 0], [10.9, 0, 2], [14.3, 1, 3], [16.9, 2, 1], [19.5, 0, 4]],
  [[2.6, 1, 0], [4.9, 0, 3], [7.3, 2, 1], [9.6, 3, 4], [12.4, 1, 2], [14.8, 0, 0], [16.0, 2, 3], [17.2, 1, 1]],
];
// spender's buys: [time, price, item]
const BUYS: [number, number, string][] = [[2.9, 280, "SHOES"], [3.6, 350, "HEADSET"], [4.3, 120, "TAKEOUT"], [5.0, 250, "SNEAKERS"]];
const spenderLeft = (t: number) => 1000 - BUYS.filter(([b]) => t >= b).reduce((s, [, p]) => s + p, 0);
const DEPOSITS = [6.7, 7.5, 8.3, 9.1];
const CHART = [1000, 1025, 1050, 1035, 990, 930, 870, 900, 955, 1000, 1030, 1052, 1070];
const CHART_T0 = 13.65, CHART_T1 = 15.15;
const chartDraw = (t: number) => (t < CHART_T0 ? 0 : 12 * seg(t, CHART_T0, CHART_T1));
const chartValue = (t: number) => {
  const d = chartDraw(t);
  const k = Math.min(11, Math.floor(d));
  return lerp(CHART[k], CHART[k + 1], d - k);
};
const DIP_T = CHART_T0 + (6 / 12) * (CHART_T1 - CHART_T0);
const SWINGS: [number, number][] = [[15.75, 16.3], [16.6, 17.1], [17.35, 18.0]];
const SMASH = 18.0;
const GOLD_T0 = 18.6, GOLD_T1 = 19.15, PULSE = 19.3, FLIP = 19.75;
const CROWN_T = 24.62, CROWN_LAND = 24.85;
const LOOK_T = 26.2;
const SCORE_T = 21.55;

// ------------------------------------------------------------------ per-lane world
const Lane: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const L = LANES[i];
  const Y = laneY(i);
  // floor glow level (spender goes dark, debt killer flares)
  let glow = 1;
  if (i === 0) glow = lerp(1, 0.12, ease(seg(t, 5.55, 6.4))) * keep(t) + RESET(t) * 1;
  if (i === 3) glow = 1 + 2.6 * decay(t, SMASH, 1.6) + 1.8 * decay(t, PULSE, 2.2) + (t > CROWN_LAND ? 0.6 * decay(t, CROWN_LAND, 1.5) : 0);
  if (i === 2 && t > DIP_T - 0.15 && t < DIP_T + 0.55) glow = 1 + 0.5 * bump(t, DIP_T - 0.15, 0.7);
  const stripCol = i === 2 && bump(t, DIP_T - 0.15, 0.7) > 0.3 ? "#ff3030" : L.color;
  const glowTex = canvasTexture(`s8backglow|${L.color}`, 64, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, H, 0, 0);
    gr.addColorStop(0, L.color + "cc");
    gr.addColorStop(0.35, L.color + "33");
    gr.addColorStop(1, L.color + "00");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  });
  return (
    <group position={[0, Y, 0]}>
      {/* floor slab (its underside is the ceiling of the lane below) */}
      <mesh geometry={geoOf("s8slab", () => new THREE.BoxGeometry(34, SLAB, 2.6))} material={plastic("#0c0a12", { rough: 0.8 })} position={[0, -SLAB / 2, FRONT - 1.3]} receiveShadow />
      <mesh geometry={geoOf("s8floorTop", () => new THREE.PlaneGeometry(34, 2.6))} material={plastic("#121019", { rough: 0.55 })} position={[0, 0.001, FRONT - 1.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
      {/* the neon floor line on the front edge + a soft glow wash on the back wall */}
      <mesh geometry={geoOf("s8neon", () => new THREE.BoxGeometry(34, 0.045, 0.05))} material={plastic(stripCol, { emissive: stripCol, ei: 4.2 * glow })} position={[0, -0.03, FRONT + 0.01]} />
      <mesh geometry={geoOf("s8neon2", () => new THREE.BoxGeometry(34, 0.02, 0.02))} material={plastic(stripCol, { emissive: stripCol, ei: 2.8 * glow })} position={[0, 0.004, FRONT - 0.03]} />
      <mesh geometry={geoOf("s8back", () => new THREE.PlaneGeometry(34, LANE_TOP))} material={plastic("#06050b", { rough: 0.95 })} position={[0, LANE_TOP / 2, -1.68]} />
      <mesh geometry={geoOf("s8backGlow", () => new THREE.PlaneGeometry(34, LANE_TOP * 0.9))} material={plastic("#000000", { transparent: true, map: glowTex, emissive: "#ffffff", ei: 0, opacity: clamp(0.55 * glow, 0, 1) })} position={[0, LANE_TOP * 0.45, -1.66]} />
      <LaneStuff i={i} t={t} />
      {/* the spender's lane goes dark; the investor's flashes red at the dip */}
      {i === 0 ? <mesh geometry={geoOf("s8dim", () => new THREE.PlaneGeometry(34, P))} material={plastic("#05040a", { transparent: true, opacity: 0.74 * ease(seg(t, 5.55, 6.4)) * keep(t) })} position={[0, P / 2 - SLAB - 0.001, 1.25]} renderOrder={9} /> : null}
      {i === 2 ? <mesh geometry={geoOf("s8red", () => new THREE.PlaneGeometry(34, P))} material={plastic("#ff1a1a", { transparent: true, opacity: 0.2 * bump(t, DIP_T - 0.15, 0.7) })} position={[0, P / 2 - SLAB - 0.001, 1.25]} renderOrder={9} /> : null}
    </group>
  );
};

// ---------------- envelopes + the cash pop (all lanes, same beat)
const envDrop = (t: number) => {
  // falls 27.62 -> 28.0 (lands on the loop point = frame 0); squash right after the landing at 0
  if (t > 27.62) {
    const u = seg(t, 27.62, 28.0);
    return { y: 1.55 * (1 - u * u), sq: 0, s: 1 };
  }
  const sq = Math.exp(-t * 9) * Math.cos(t * 30);
  const gone = ease(seg(t, 1.45, 1.75));
  return { y: 0, sq, s: 1 - gone };
};
const envOpen = (t: number) => (t > 27.62 ? 0 : easeOut(seg(t, 1.05, 1.3)));

// ---------------- coupons thrown by the haters
const haterHand = (i: number, h: number, t: number): V3 => {
  const hp = haterPose(i, h, t);
  return [hp.x - 0.25, 1.05, hp.z + 0.15];
};
const Coupons: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const L = LANES[i];
  const out: React.ReactNode[] = [];
  THROWS[i].forEach(([T, h, k], n) => {
    if (t < T || t > T + 2.0) return;
    const a = haterHand(i, h, T);
    const hit: V3 = [L.x + 0.22, 0.85 - (i === 0 && T > 5.3 ? 0.25 : 0), 0.2];
    const rest: V3 = [L.x + 0.55 + 0.35 * hash(n + i * 7.1), 0.006, 0.35 + 0.25 * hash(n * 3.3 + i)];
    let p: V3, r: V3;
    if (t < T + 0.45) {
      p = arc(a, hit, t, T, T + 0.45, 0.35);
      const u = (t - T) * 14;
      r = [u * 0.7, u, u * 0.4];
    } else if (t < T + 0.85) {
      p = arc(hit, rest, t, T + 0.45, T + 0.85, 0.12);
      const u = (t - T) * 10;
      r = [u, u * 0.8, 0];
    } else {
      p = rest;
      r = [-Math.PI / 2, hash(n) * 3, 0];
    }
    const s = 1 - ease(seg(t, T + 1.55, T + 1.85));
    if (s > 0.01) out.push(<Coupon key={n} p={p} r={r} text={COUPON_TEXT[k]} s={1.25 * s} />);
  });
  return <>{out}</>;
};

// ---------------- haters
const haterPose = (i: number, h: number, t: number): HaterPose => {
  const L = LANES[i];
  const [x0, z0] = L.haters[h];
  const ph = h * 1.9 + i * 0.7;
  let x = x0, lean = 0, hop = 0;
  let throwArm = 0.15 + 0.05 * Math.sin(t * 2 + ph);
  // cheering bounce (taunting all the time)
  hop = 0.03 * Math.max(0, Math.sin(t * 6.2 + ph));
  const signWob0 = 0.12 * Math.sin(t * 5.1 + ph);
  let signLift = 0.15 * Math.max(0, Math.sin(t * 3.3 + ph));
  for (const [T, hh] of THROWS[i]) {
    if (hh !== h) continue;
    if (t > T - 0.3 && t < T + 0.45) {
      if (t < T) throwArm = lerp(0.15, -0.7, ease(seg(t, T - 0.3, T - 0.05)));
      else throwArm = lerp(2.0, 0.15, ease(seg(t, T + 0.08, T + 0.45))) * (t < T + 0.08 ? ease(seg(t, T - 0.02, T + 0.08)) : 1) + (t < T + 0.08 ? -0.7 * (1 - ease(seg(t, T - 0.02, T + 0.08))) : 0);
    }
  }
  // spender's buys: the haters cheer
  if (i === 0) for (const [b] of BUYS) hop += 0.12 * bump(t, b + 0.05, 0.35);
  // investor dip: they jump with SELL NOW!
  if (i === 2) {
    hop += 0.14 * bump(t, DIP_T - 0.1, 0.32) + 0.1 * bump(t, DIP_T + 0.25, 0.3);
    signLift += 0.5 * bump(t, DIP_T - 0.15, 0.7);
  }
  // debt killer's gold wall knocks them back
  let flip = 0;
  if (i === 3) {
    const u = easeOut(seg(t, PULSE + 0.02, PULSE + 0.4));
    const k = u * keep(t);
    x += 0.22 * k + 0.04 * h * k;
    lean = (1.0 * bump(t, PULSE + 0.02, 0.5) + 0.35 * u) * keep(t);
    hop += 0.25 * bump(t, PULSE + 0.02, 0.38);
    if (h === 1) flip = ease(seg(t, FLIP, FLIP + 0.3)) * keep(t);
    if (t > PULSE) {
      throwArm = 0.15;
      signLift = 0.1 * keep(t);
    }
  }
  // the scoreboard: the haters lose and run off to the right (back for the loop at 27.3 s)
  const flee = ease(seg(t, 21.15 + 0.08 * h, 21.7 + 0.08 * h)) * keep(t);
  x += 4.6 * flee;
  hop += 0.08 * Math.abs(Math.sin(t * 14)) * (flee > 0 && flee < 1 ? 1 : 0);
  return { x, z: z0, yaw: lerp(-0.6, -1.4, flee), lean, hop, throwArm, signLift, signWob: signWob0 * (i === 3 && t > PULSE ? 0.3 : 1), flip };
};

// ---------------- the characters
type Who = { pose: Pose; emotion: Emotion; held?: Held; extra?: React.ReactNode };
export const cashHeld = (s: number): Held => ({ side: "R", node: <BillBrick p={[0, -0.02, 0]} s={1.5 * s} r={[0, 0, 0]} />, tilt: [0, 0] });
const towardCam = (t: number) => ease(seg(t, LOOK_T, LOOK_T + 0.35)) * keep(t);
const standPose = (i: number, t: number, o: Partial<Pose> = {}): Pose => {
  const L = LANES[i];
  const yaw = lerp(YAW0, 0.05, towardCam(t));
  return base(L.x, 0, yaw, 1, { headPitch: 0.06, ...o });
};
/** frame-0 face: shock at the landing envelope, then happy; the same shock as the next envelope falls at the end */
const openingEmotion = (t: number): Emotion | null => (t < 0.38 || t > 27.68 ? "shock" : t < 1.5 ? "happy" : null);
const cashFly = (i: number, t: number, hand: V3): React.ReactNode => {
  if (t < 1.1 || t > 1.5) return null;
  const a: V3 = [ENV_X(i), 0.42, ENV_Z];
  const p = arc(a, hand, t, 1.1, 1.5, 0.35);
  return <BillBrick p={p} s={1.5} r={[0, (t - 1.1) * 10, 0]} />;
};

const spender = (t: number): Who => {
  const i = 0;
  let emo: Emotion = openingEmotion(t) ?? "love";
  const cash = t < 1.5 ? 0 : t < BUYS[0][0] ? 1 : spenderLeft(t) / 1000;
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.05 });
  // buying: thrust the cash forward on each buy
  let arm = 0.25;
  for (const [b] of BUYS) arm += 1.0 * pop(seg(t, b - 0.18, b + 0.32)) * (t < b + 0.6 ? 1 : 0) * (1 - seg(t, b + 0.32, b + 0.6));
  pose = { ...pose, armR: arm + 0.1 * bump(t, 1.4, 0.3), ant: t > 1.5 && t < 5.3 ? 0.6 : 0 };
  if (t > 2.4 && t < 5.3) pose.headYaw = 0.25 * Math.sin(t * 4.2);
  // flop onto the shoe boxes, broke
  const sitP = sit(SEAT_X, 0.0, lerp(0.5, 0.05, towardCam(t)), { y: 0.44 + 0.135, headPitch: 0.42, armL: 0.25, armR: 0.25, outL: 0.22, outR: 0.22, ant: -1, pitch: 0.12 });
  const sigh = Math.max(0, Math.sin(((t - 6.4) * Math.PI) / 2.0)) ** 6;
  sitP.headPitch += 0.12 * sigh - 0.3 * towardCam(t);
  sitP.y -= 0.02 * sigh;
  const flop = ease(seg(t, 5.3, 5.75)) * keep(t);
  if (flop > 0) {
    pose = lerpPose(pose, sitP, flop);
    if (flop < 1) pose.y += 0.18 * Math.sin(Math.PI * flop);
  }
  if (t > 5.15) emo = "sad";
  if (t > 27.68) emo = "shock";
  const hand = heldWorld(base(LANES[0].x, 0, YAW0, 1, { armR: 0.35 }), "R", 1, [0, 0.03, 0]);
  return { pose, emotion: emo, held: cash > 0.02 && t < 5.2 ? cashHeld(Math.max(0.3, cash)) : undefined, extra: cashFly(i, t, hand) };
};
const SpenderBuys: React.FC<{ t: number }> = ({ t }) => {
  const k = keep(t);
  if (k <= 0.001) return null;
  // landing spots: two shoe boxes stacked (the seat), the headset and the takeout bags beside them
  const items: { at: number; to: V3; node: (p: V3, r: V3, s: number) => React.ReactNode }[] = [
    { at: BUYS[0][0], to: [SEAT_X, 0, 0], node: (p, r, s) => <ShoeBox p={p} r={r} s={s} color="#ff7a1a" /> },
    { at: BUYS[1][0], to: [-0.2, 0, 0.18], node: (p, r, s) => <Headset p={p} r={r} s={s * 1.15} /> },
    { at: BUYS[2][0], to: [0.15, 0, 0.05], node: (p, r, s) => <><FoodBag p={p} r={r} s={s} /><FoodBag p={[p[0] + 0.24, p[1], p[2] - 0.1]} r={[r[0], r[1] + 0.4, r[2]]} s={s * 0.9} label="SNACKS" /></> },
    { at: BUYS[3][0], to: [SEAT_X, 0.22, 0], node: (p, r, s) => <ShoeBox p={p} r={r} s={s} color="#2fd0bd" /> },
  ];
  return (
    <>
      {items.map((it, n) => {
        if (t < it.at) return null;
        const from: V3 = [2.6, 1.1, 0.3];
        const T1 = it.at + 0.45;
        const p = t < T1 ? arc(from, it.to, t, it.at, T1, 0.3) : it.to;
        const spin = t < T1 ? (T1 - t) * 9 : 0;
        const land = decay(t, T1, 10) * Math.sin((t - T1) * 28) * (t > T1 ? 1 : 0);
        const s = (t < it.at + 0.12 ? 0.4 + 0.6 * seg(t, it.at, it.at + 0.12) : 1) * k;
        return <group key={n} scale={[1 + 0.12 * land, 1 - 0.15 * land, 1]}>{it.node(p, [0, spin * 0.6 + (n === 1 ? 0.3 : 0), spin * 0.25], s)}</group>;
      })}
    </>
  );
};

const saver = (t: number): Who => {
  const i = 1;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.04 });
  let arm = 0.3;
  for (const d of DEPOSITS) arm += 1.05 * pop(seg(t, d - 0.25, d + 0.25)) * (1 - seg(t, d + 0.25, d + 0.55)) * (t < d + 0.55 ? 1 : 0);
  // glances at the haters every ~2 s, unbothered; pushes the glasses at 9.6
  const glance = Math.max(0, Math.sin(((t - 2.2) * Math.PI) / 2.1)) ** 4;
  pose = { ...pose, armR: arm, headYaw: 0.45 * glance * (t < 26 ? 1 : 0), armL: 0.1 + 2.1 * bump(t, 9.55, 0.6) };
  if (t > 12.5 && t < 13.2) emo = "joy";
  if (t > 24.0 && t < 26.2) emo = "curious";
  if (t > 27.68) emo = "shock";
  const cashLeft = t < 1.5 ? 0 : 1 - DEPOSITS.filter((d) => t >= d).length / 4;
  const hand = heldWorld(base(LANES[i].x, 0, YAW0, 1, { armR: 0.35 }), "R", 1, [0, 0.03, 0]);
  return { pose, emotion: emo, held: cashLeft > 0.02 ? cashHeld(Math.max(0.35, cashLeft)) : undefined, extra: cashFly(i, t, hand) };
};
const jarFill = (t: number) => {
  let f = 0;
  DEPOSITS.forEach((d, n) => (f = lerp(f, (n + 1) * 0.18, easeOut(seg(t, d + 0.35, d + 0.5)))));
  f += 0.06 * easeOut(seg(t, 12.55, 13.0));
  return f * keep(t);
};
const SaverCoins: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  const handAt = (d: number) => heldWorld(base(LANES[1].x, 0, YAW0, 1, { armR: 1.3 }), "R", 1, [0, 0.05, 0]);
  DEPOSITS.forEach((d, n) => {
    if (t < d || t > d + 0.5) return;
    for (let c = 0; c < 3; c++) {
      const t0 = d + c * 0.04;
      const p = arc(handAt(d), [JAR_X + (c - 1) * 0.05, 0.62, 0.0], t, t0, t0 + 0.38, 0.32);
      if (t < t0) continue;
      const sink = t > t0 + 0.38 ? -0.3 * seg(t, t0 + 0.38, t0 + 0.5) : 0;
      out.push(<Coin key={`${n}_${c}`} p={[p[0], p[1] + sink, p[2]]} r={[(t - t0) * 12, 0, (t - t0) * 7]} s={1.7} />);
    }
  });
  return <>{out}</>;
};

const investor = (t: number): Who => {
  const i = 2;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.03 });
  // toss into the fund at 10.6, pat the box at 11.25; checks the chart every ~1.7 s before
  const toss = pop(seg(t, 10.4, 10.85)) * (1 - seg(t, 10.85, 11.15)) * (t < 11.15 ? 1 : 0);
  const pat = bump(t, 11.25, 0.45);
  const check = Math.max(0, Math.sin(((t - 2.0) * Math.PI) / 1.7)) ** 6 * (t < 10 ? 1 : 0);
  pose = { ...pose, armR: 0.3 + 1.1 * toss + 0.6 * pat, armL: 0.08 + 1.2 * check, headPitch: pose.headPitch + 0.25 * check };
  // the dip: shock, antennae up, holds steady; then joy at the recovery
  const dip = bump(t, DIP_T - 0.25, 0.85);
  if (dip > 0.05) {
    emo = "shock";
    pose = { ...pose, ant: 1, pitch: -0.08 * dip, armL: 0.08 + 0.6 * dip, armR: 0.3 + 0.6 * dip };
  }
  if (t > CHART_T1 - 0.1 && t < 17) {
    emo = "joy";
    pose = { ...pose, armL: 0.08 + 2.4 * bump(t, CHART_T1 - 0.1, 0.9), y: pose.y + 0.1 * bump(t, CHART_T1, 0.35) };
  }
  if (t > 27.68) emo = "shock";
  const hand = heldWorld(base(LANES[i].x, 0, YAW0, 1, { armR: 0.35 }), "R", 1, [0, 0.03, 0]);
  const extra: React.ReactNode[] = [cashFly(i, t, hand)];
  if (t > 10.55 && t < 11.0) {
    const from = heldWorld(base(LANES[i].x, 0, YAW0, 1, { armR: 1.3 }), "R", 1, [0, 0.05, 0]);
    extra.push(<BillBrick key="toss" p={arc(from, [BOX_X, 0.42, 0], t, 10.55, 11.0, 0.35)} s={1.5} r={[0, (t - 10.55) * 8, 0]} />);
  }
  return { pose, emotion: emo, held: t >= 1.5 && t < 10.55 ? cashHeld(1) : undefined, extra: <>{extra}</> };
};

const DK_REST = 0.35;
const dkArm = (t: number) => {
  let r = DK_REST;
  let pitch = 0;
  // idle: taps the hammer every 1.5 s (2-15.6 s)
  if (t > 2 && t < 15.6) r += 0.55 * Math.max(0, Math.sin(((t - 2) * Math.PI) / 0.75)) ** 3 * (Math.floor((t - 2) / 0.75) % 2 === 0 ? 1 : 0);
  SWINGS.forEach(([w, h], k) => {
    const up = k === 2 ? 2.45 : 2.35; // overhead, kept under the 1.9 m ceiling
    if (t >= w && t < h - 0.12) r = lerp(DK_REST, up, ease(seg(t, w, h - 0.14)));
    else if (t >= h - 0.12 && t < h) r = lerp(up, 1.0, ease(seg(t, h - 0.12, h)));
    else if (t >= h && t < h + 0.3) r = 1.0;
    else if (t >= h + 0.3 && t < h + 0.55) r = lerp(1.0, DK_REST, ease(seg(t, h + 0.3, h + 0.55)));
    if (t >= h - 0.12 && t < h + 0.35) pitch = 0.16 * (t < h ? seg(t, h - 0.12, h) : 1 - seg(t, h + 0.1, h + 0.35));
  });
  // celebrate (19.8-21.0): hammer overhead
  const cel = bump(t, 19.8, 1.25);
  if (cel > 0) r = lerp(r, 2.4, ease(cel * 2.2));
  return { r, pitch, cel };
};
const debtKiller = (t: number): Who => {
  const i = 3;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  const { r, pitch, cel } = dkArm(t);
  const smashYaw = lerp(YAW0, 1.05, ease(seg(t, 15.5, 15.75)) * (1 - ease(seg(t, 19.6, 19.9))));
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.02 });
  pose = { ...pose, yaw: lerp(smashYaw, 0.05, towardCam(t)), armR: r, pitch, armL: 0.15 + 2.5 * ease(cel * 2.2), y: pose.y + 0.12 * Math.max(0, Math.sin((t - 19.8) * 9)) * (cel > 0.2 ? 1 : 0) };
  if (t > 15.5 && t < SMASH) emo = "sly";
  if (t >= SMASH && t < 19.8) emo = "shock";
  if (t >= 19.8 && t < 21.3) emo = "joy";
  if (t > CROWN_LAND - 0.05 && t < LOOK_T) emo = "joy";
  if (t > 27.68) emo = "shock";
  const tilt0 = 1.5 - 1.17 * (r - 1.0);
  const hs = t < 1.5 ? 0 : 1 - ease(seg(t, 27.3, 27.5));
  const hand = heldWorld(base(LANES[i].x, 0, YAW0, 1, { armR: 0.35 }), "R", 1, [0, 0.03, 0]);
  const handlePop = pop(seg(t, 1.5, 1.85));
  return {
    pose,
    emotion: emo,
    held: hs > 0.01 ? { side: "R", node: <group scale={hs}><MoneyHammer s={1} glow={0.3 * decay(t, SWINGS[2][1], 3)} /></group>, tilt: [lerp(0, tilt0, Math.min(1, handlePop)), 0] } : undefined,
    extra: cashFly(i, t, hand),
  };
};
const crownPos = (t: number): { p: V3; s: number } | null => {
  if (t < CROWN_T) return null;
  const who = debtKiller(t);
  const f = facePoint(who.pose, 1);
  const top: V3 = [f[0], f[1] + 0.155, f[2]];
  const u = seg(t, CROWN_T, CROWN_LAND);
  const y = top[1] - 0.02 + 0.45 * (1 - u * u) + (t > CROWN_LAND ? 0.05 * decay(t, CROWN_LAND, 9) * Math.abs(Math.sin((t - CROWN_LAND) * 22)) : 0);
  const s = 1 - ease(seg(t, 27.3, 27.5));
  return s > 0.01 ? { p: [top[0], y, top[2]], s } : null;
};
const DebtStuff: React.FC<{ t: number }> = ({ t }) => {
  const nodes: React.ReactNode[] = [];
  const hits = SWINGS.map(([, h]) => h);
  const crack = t >= hits[1] ? 2 : t >= hits[0] ? 1 : 0;
  const shake = hits.reduce((s, h) => s + 0.06 * decay(t, h, 7) * Math.sin((t - h) * 40), 0);
  const back = ease(seg(t, 27.45, 27.75));
  if (t < SMASH) nodes.push(<DebtBoard key="board" p={[BOARD_X, 0, 0]} crack={crack} shake={shake} glow={1 + 1.5 * decay(t, hits[0], 4) + 1.5 * decay(t, hits[1], 4)} />);
  else if (back > 0) nodes.push(<group key="board2" position={[BOARD_X, 0, 0]} scale={back}><DebtBoard p={[0, 0, 0]} crack={0} /></group>);
  // shards: fly (18.0-18.6), home into the gold wall (18.6-19.15), the wall glows and pulses
  const k = keep(t);
  if (t >= SMASH && k > 0.01) {
    const wallX = BOARD_X;
    for (let n = 0; n < SHARD.cols * SHARD.rows; n++) {
      const h0 = shardHome(n);
      const home: V3 = [wallX + h0[0], h0[1], 0];
      const v: V3 = [0.9 + 1.5 * hash(n * 1.7), 1.3 + 1.7 * hash(n * 2.9 + 1), 0.5 + 0.9 * hash(n * 4.1 + 2)];
      const flyAt = (tt: number): V3 => {
        const tau = Math.min(tt, GOLD_T0) - SMASH;
        return [home[0] + v[0] * tau * 0.8, Math.min(1.62, Math.max(0.08, home[1] + v[1] * tau - 3.2 * tau * tau)), home[2] + v[2] * tau * 0.7];
      };
      const slot = brickSlot(n);
      const dst: V3 = [wallX + slot[0], slot[1], slot[2]];
      const u = ease(seg(t, GOLD_T0, GOLD_T1));
      const p = lerpV(flyAt(t), dst, u);
      const spin = (1 - u) * (t - SMASH) * (6 + 4 * hash(n));
      const gold = ease(seg(t, GOLD_T0 + 0.05, GOLD_T0 + 0.35));
      const glow = 0.8 * decay(t, PULSE, 3) + 0.4 * decay(t, GOLD_T1, 4) + 0.15 * Math.sin(t * 4 + n);
      nodes.push(<group key={`sh${n}`} scale={k}><Shard p={p} r={[spin, spin * 0.7, spin * 0.4]} gold={gold} glow={Math.max(0, glow)} /></group>);
    }
    // the shockwave ring on the floor
    if (t > PULSE && t < PULSE + 0.55) {
      const u = seg(t, PULSE, PULSE + 0.55);
      nodes.push(<mesh key="ring" geometry={geoOf("s8ring", () => new THREE.TorusGeometry(1, 0.03, 8, 64))} material={plastic("#ffd23a", { emissive: "#ffd23a", ei: 3, transparent: true, opacity: 1 - u })} position={[wallX, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4 + 3.2 * u, 0.4 + 3.2 * u, 1]} />);
    }
  }
  const c = crownPos(t);
  if (c) nodes.push(<Crown key="crown" p={c.p} s={c.s * 1.6} r={[0, 0.3, 0]} />);
  return <>{nodes}</>;
};

const WHO = [spender, saver, investor, debtKiller];
const LaneStuff: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const L = LANES[i];
  const who = WHO[i](t);
  const e = envDrop(t);
  return (
    <>
      <Act look={L.look} pose={who.pose} emotion={who.emotion} s={1} t={t} seed={i * 3 + 1} held={who.held} />
      {who.extra}
      {e.s > 0.01 ? <Envelope p={[ENV_X(i), e.y, ENV_Z]} open={envOpen(t)} sq={Math.max(0, e.sq)} s={e.s} /> : null}
      {L.haters.map((_, h) => (
        <Hater key={h} pose={haterPose(i, h, t)} sign={L.signs[h]} back={i === 3 && h === 1 ? "OK FINE" : undefined} col={h + i} />
      ))}
      <Coupons i={i} t={t} />
      {i === 0 ? <SpenderBuys t={t} /> : null}
      {i === 1 ? (
        <>
          <SavingsJar p={[JAR_X, 0, 0]} fill={jarFill(t)} gleam={0.8 * decay(t, 12.6, 2.5) + 0.35 * Math.max(0, Math.sin(((t - 9.8) * Math.PI) / 1.8)) ** 8 * (t > 9.8 && t < 21 ? 1 : 0)} />
          <SaverCoins t={t} />
        </>
      ) : null}
      {i === 2 ? (
        <>
          <FundBox p={[BOX_X, 0, 0]} lid={bump(t, 10.4, 0.75)} glow={0.6 * decay(t, 11.0, 3) + 0.4 * decay(t, CHART_T1, 2)} />
          <LineChart p={[CHART_X, 0, 0]} w={0.82} h={0.62} values={CHART} lo={820} hi={1110} draw={chartDraw(t) * keep(t)} redBelow={1000} flash={bump(t, DIP_T - 0.15, 0.7)} />
        </>
      ) : null}
      {i === 3 ? <DebtStuff t={t} /> : null}
    </>
  );
};

/** the whole world at time t */
const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* deep backdrop behind every lane */}
    <mesh geometry={geoOf("s8deep", () => new THREE.PlaneGeometry(80, 60))} material={plastic("#020205", { rough: 1 })} position={[0, 5, -1.75]} />
    {[0, 1, 2, 3].map((i) => (
      <Lane key={i} i={i} t={t} />
    ))}
    {/* the bottom slab under the last lane, and a cap over the top lane */}
    <mesh geometry={geoOf("s8cap", () => new THREE.BoxGeometry(34, 2.0, 2.6))} material={plastic("#16131f", { rough: 0.8 })} position={[0, laneY(0) + P - SLAB + 1.0, FRONT - 1.3]} />
  </>
);

// ------------------------------------------------------------------ 2D layer
export const FONT = "Poppins";
export const usd = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
type CounterView = { main: string; color: string; sub?: string; subColor?: string; pop: number; small?: string };
const counterOf = (i: number, t: number): CounterView => {
  if (i === 0) {
    const v = spenderLeft(t);
    const last = BUYS.filter(([b]) => t >= b).pop();
    const recent = last && t - last[0] < 1.1;
    return { main: usd(v), color: v === 0 ? "#ff4a4a" : "#ffffff", sub: recent ? `-$${last![1]} ${last![2]}` : undefined, subColor: "#ff6a6a", pop: last ? decay(t, last[0], 7) : 0 };
  }
  if (i === 1) {
    const u = ease(seg(t, 12.55, 13.05));
    const v = 1000 + 40 * u;
    return { main: usd(v), color: u > 0 ? "#5fff9a" : "#ffffff", sub: t > 12.55 && t < 21 ? "+$40 (4%)" : undefined, subColor: "#5fff9a", pop: decay(t, 13.05, 6) + (DEPOSITS.some((d) => t > d + 0.4 && t < d + 0.6) ? 0.4 : 0) };
  }
  if (i === 2) {
    if (t < CHART_T0) return { main: "$1,000", color: "#ffffff", pop: decay(t, 11.0, 7) };
    const v = chartValue(t);
    const done = t >= CHART_T1;
    return { main: usd(v), color: v < 1000 ? "#ff4a4a" : "#5fb4ff", sub: done ? "+$70 (7%)" : v < 1000 ? "DIP!" : undefined, subColor: v < 1000 ? "#ff6a6a" : "#5fb4ff", pop: bump(t, DIP_T - 0.1, 0.3) + decay(t, CHART_T1, 6) };
  }
  if (t < SMASH + 0.2) return { main: "$1,000", color: "#ffffff", pop: SWINGS.reduce((s, [, h]) => s + 0.6 * decay(t, h, 8), 0) };
  const u = ease(seg(t, SMASH + 0.2, 19.4));
  return { main: `+$${Math.round(220 * u)}`, color: "#ffd23a", small: "INTEREST AVOIDED", pop: decay(t, 19.4, 5) };
};
const SCORES = [
  { v: "$0", c: "#ff4a4a" },
  { v: "+$40", c: "#5fff9a" },
  { v: "+$70*", c: "#5fb4ff" },
  { v: "+$220", c: "#ffd23a" },
];
export const STROKE = (px: number, c = "#0a0712") => ({ WebkitTextStroke: `${px}px ${c}`, paintOrder: "stroke fill" as const });

const LaneHud: React.FC<{ i: number; t: number; cam: Cam }> = ({ i, t, cam }) => {
  if (t < 1.0) return null;
  const L = LANES[i];
  const Y = laneY(i);
  const [, yTop] = project(cam, [0, Y + LANE_TOP, 0]);
  const [, yBot] = project(cam, [0, Y - 0.02, FRONT]);
  const lanePx = yBot - yTop;
  const M = 16;
  // the visible part of the lane, kept clear of the title band (top) and the YouTube UI (bottom)
  const vTop = Math.max(yTop, 236) + M;
  const vBot = Math.min(yBot, capOn(t) ? 1372 : 1600) - M; // above the caption band while captions show
  const fadeIn = ease(seg(t, 1.0, 1.25)) * (1 - ease(seg(t, 27.62, 27.85)));
  const labelPx = clamp(lanePx * 0.105, 28, 52);
  const out: React.ReactNode[] = [];
  const fits = (h: number) => vBot - vTop >= h;
  const resetFade = 1 - ease(seg(t, 27.3, 27.45));
  if (fits(labelPx * 1.3))
    out.push(
      <div key="lbl" style={{ position: "absolute", left: M + 2, top: vTop, fontFamily: FONT, fontWeight: 800, fontSize: labelPx, lineHeight: 1.1, letterSpacing: 2, color: L.color, textShadow: `0 0 14px ${L.color}aa`, opacity: fadeIn, ...STROKE(labelPx * 0.08) }}>
        {L.name}
      </div>,
    );
  // scoreboard (big) after 21.55, counter before
  const sc = ease(seg(t, SCORE_T + i * 0.28, SCORE_T + i * 0.28 + 0.2));
  if (sc > 0 && t < 27.45) {
    const S = SCORES[i];
    const fs = clamp(lanePx * 0.36, 70, 130);
    const boxH = fs * 1.3;
    if (fits(boxH)) {
      const top = clamp((yTop + yBot) / 2 - boxH / 2 + lanePx * 0.04, vTop, vBot - boxH);
      const s = 0.6 + 0.4 * pop(seg(t, SCORE_T + i * 0.28, SCORE_T + i * 0.28 + 0.45));
      out.push(
        <div key="score" style={{ position: "absolute", right: M, top, height: boxH, display: "flex", alignItems: "center", padding: `0 ${fs * 0.28}px`, borderRadius: fs * 0.25, background: "rgba(10,8,20,0.82)", border: `4px solid ${S.c}`, boxShadow: `0 0 26px ${S.c}aa`, transform: `scale(${s * resetFade})`, transformOrigin: "right center", opacity: sc * resetFade }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: fs, color: S.c, textShadow: `0 0 18px ${S.c}aa`, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{S.v}</span>
        </div>,
      );
    }
    return <>{out}</>;
  }
  const c = counterOf(i, t);
  const fs = clamp(lanePx * 0.13, 30, 66);
  const smallPx = fs * 0.36;
  const subPx = fs * 0.5;
  const h = fs * 1.15 + (c.small ? smallPx * 1.3 : 0) + (c.sub ? subPx * 1.25 : 0) + 18;
  if (fits(h)) {
    const s = 1 + 0.12 * clamp(c.pop);
    out.push(
      <div key="ctr" style={{ position: "absolute", right: M, top: vTop, padding: `6px ${fs * 0.3}px 8px`, borderRadius: 16, background: "rgba(10,8,20,0.78)", border: `3px solid ${L.color}`, boxShadow: `0 0 18px ${L.color}88`, textAlign: "right", fontFamily: FONT, fontWeight: 800, transform: `scale(${s})`, transformOrigin: "right top", opacity: fadeIn * resetFade }}>
        {c.small ? <div style={{ fontSize: smallPx, color: "#ffe9a0", lineHeight: 1.2, letterSpacing: 1 }}>{c.small}</div> : null}
        <div style={{ fontSize: fs, color: c.color, lineHeight: 1.12, fontVariantNumeric: "tabular-nums" }}>{c.main}</div>
        {c.sub ? <div style={{ fontSize: subPx, color: c.subColor, lineHeight: 1.2 }}>{c.sub}</div> : null}
      </div>,
    );
  }
  return <>{out}</>;
};

/** "BORING = WINNER" banner over the debt killer once the crown lands */
const WinnerBanner: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  if (t < CROWN_LAND || t > 27.45) return null;
  const c = crownPos(t);
  if (!c) return null;
  const [x, y] = project(cam, [c.p[0] + 0.3, c.p[1] + 0.12, c.p[2]]);
  const u = pop(seg(t, CROWN_LAND, CROWN_LAND + 0.4));
  const w = 330;
  const left = clamp(x, 16, 1080 - 16 - w);
  return (
    <div style={{ position: "absolute", left, top: y - 26, width: w, textAlign: "left", whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: "#ffd23a", transform: `scale(${Math.max(0, u) * (1 - ease(seg(t, 27.3, 27.45)))})`, transformOrigin: "left center", textShadow: "0 0 18px #ffb020", ...STROKE(3) }}>
      BORING = WINNER
    </div>
  );
};

/** 1 YEAR LATER: a calendar card sweeps across every lane (12.0-13.2 s), flipping DAY 1 -> DAY 365 */
const YearFlip: React.FC<{ t: number }> = ({ t }) => {
  if (t < 11.95 || t > 13.25) return null;
  const inU = easeOut(seg(t, 11.95, 12.3));
  const outU = ease(seg(t, 12.9, 13.25));
  const x = 1080 * (1 - inU) - 1180 * outU;
  const flip = ease(seg(t, 12.08, 12.3));
  const W = 560, H = 430;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2 + x, top: 760, width: W, height: H, borderRadius: 34, background: "#fffaf0", boxShadow: "0 18px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.25)", overflow: "hidden", transform: `rotate(${-4 + 8 * outU}deg)` }}>
      <div style={{ height: 120, background: "#e0412b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#ffffff", letterSpacing: 2 }}>1 YEAR LATER</div>
      <div style={{ position: "relative", height: H - 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 112, color: "#16121c", whiteSpace: "nowrap", transform: `scaleY(${Math.abs(Math.cos(flip * Math.PI))})` }}>{flip < 0.5 ? "DAY 1" : "DAY 365"}</div>
      </div>
    </div>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const q = ease(seg(t, LOOK_T - 0.05, LOOK_T + 0.2)) * (1 - ease(seg(t, 27.6, 27.85)));
  const titleOp = 1 - q;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 240, background: "linear-gradient(#06050cee, #06050cbb 75%, #06050c00)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: "#ffffff", opacity: titleOp, ...STROKE(6) }}>
        $1,000 with <span style={{ color: "#ff3b3b", textShadow: "0 0 22px #ff3b3baa" }}>haters</span>
      </div>
      {q > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 58, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: q, transform: `scale(${0.85 + 0.15 * q})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "#ffd23a", textShadow: "0 0 20px #ffb020aa", ...STROKE(6) }}>WHICH ONE ARE YOU?</span>
        </div>
      ) : null}
      {q > 0 ? (
        <svg width={70} height={86} viewBox="0 0 70 86" style={{ position: "absolute", left: 505, top: 150 + 10 * Math.sin(t * 9), opacity: q }}>
          <path d="M22 4 H48 V46 H66 L35 82 L4 46 H22 Z" fill="#ffd23a" stroke="#0a0712" strokeWidth={5} strokeLinejoin="round" />
        </svg>
      ) : null}
      {t >= 1.0 ? (
        <div style={{ position: "absolute", left: 16, right: 16, top: q > 0 ? 1960 : 188, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 25, color: "#c9cbe0", letterSpacing: 0.5, opacity: ease(seg(t, 1.0, 1.3)) * (1 - ease(seg(t, 27.62, 27.85))) }}>
          EXAMPLE · 4% APY, 7%/YR* (CAN GO DOWN), 22% APR · NOT ADVICE
        </div>
      ) : null}
    </>
  );
};

// captions: the recipe Shorts' style (RecipeCaptions: bold caps, outline, the spoken word in red), VO words from
// finance/shorts/four-money-minds/vo/timings.json, 1-3 words, bottom centre, VO only, from 1.0 s (clean first second)
const VO_WORDS: CapWord[] = [
  ["Four", 0.1, 0.42], ["money", 0.58, 0.82], ["minds.", 0.9, 1.62], ["Same", 1.86, 2.1], ["thousand", 2.26, 2.5], ["dollar", 2.58, 2.82], ["bonus.", 2.9, 3.62],
  ["One", 21.5, 21.74], ["year", 21.9, 22.06], ["later.", 22.14, 22.62], ["In", 23.26, 23.34], ["this", 23.42, 23.5], ["example,", 23.58, 24.38],
  ["the", 24.46, 24.54], ["boring", 24.62, 25.02], ["one", 25.1, 25.26], ["won.", 25.34, 25.74], ["Which", 26.22, 26.38], ["one", 26.46, 26.54], ["are", 26.62, 26.7], ["you?", 26.82, 27.26],
].map(([w, t, end]) => ({ w: w as string, t: t as number, end: end as number }));
const CAPS: CapChunk[] = chunkWords(VO_WORDS, 2);
CAPS.forEach((c) => (c.hold = Math.min(c.hold, 27.3)));
const CAP_FROM = 1.0;
const capOn = (t: number) => t >= CAP_FROM && CAPS.some((c) => t >= c.start - 0.05 && t < c.hold);
export const CAPTION_CENTRE = 0.735;

// ------------------------------------------------------------------ the film
export const FourMindsFilm: React.FC<{ sub?: boolean }> = ({ sub = false }) => {
  const g = useCurrentFrame();
  useFonts();
  const { n, fp } = sub ? subFrame(g, 4, 0.4) : { n: g, fp: g };
  const t = fp / S8_FPS;
  const tOut = n / S8_FPS; // 2D layer keyed to the output frame (sharp text)
  const cam = camAt(t);
  const camOut = camAt(tOut);
  return (
    <AbsoluteFill style={{ background: "#06050c" }}>
      <View mood={NEON} cam={cam} t={t} blur={0} sky={false}>
        <World t={t} />
      </View>
      {[0, 1, 2, 3].map((i) => (
        <LaneHud key={i} i={i} t={tOut} cam={camOut} />
      ))}
      <WinnerBanner t={tOut} cam={camOut} />
      <YearFlip t={tOut} />
      <Title t={tOut} />
      <RecipeCaptions chunks={CAPS} t={tOut} hide={(x) => x < CAP_FROM} style={{ centre: CAPTION_CENTRE, size: 84 }} />
    </AbsoluteFill>
  );
};

/** SFX cues for the mix (tools/s8_mix.py reads them through tools/s8_cues.mjs) */
export const S8_CUES: { t: number; sfx: string; db: number }[] = [
  { t: 0.0, sfx: "impact", db: 0 },
  { t: 0.0, sfx: "thud", db: -3 },
  { t: 1.0, sfx: "whoosh", db: -8 },
  { t: 1.08, sfx: "paper", db: -6 },
  { t: 1.2, sfx: "pop", db: -6 },
  { t: 2.0, sfx: "swoosh", db: -8 },
  ...THROWS.flatMap((l, i) => l.map(([T]) => ({ t: T, sfx: "swoosh", db: -16 - (i === 0 ? 0 : 3) }))),
  ...BUYS.flatMap(([b]) => [{ t: b, sfx: "cash", db: -4 }, { t: b + 0.45, sfx: "thud", db: -9 }]),
  { t: 5.32, sfx: "fail", db: -8 },
  { t: 6.0, sfx: "swoosh", db: -8 },
  ...DEPOSITS.map((d) => ({ t: d + 0.38, sfx: "coins", db: -7 })),
  { t: 10.0, sfx: "swoosh", db: -8 },
  { t: 11.0, sfx: "thud", db: -6 },
  { t: 11.75, sfx: "whoosh", db: -5 },
  { t: 12.35, sfx: "paper", db: -5 },
  { t: 12.9, sfx: "whoosh", db: -7 },
  { t: 12.6, sfx: "sparkle", db: -10 },
  { t: 13.2, sfx: "swoosh", db: -8 },
  { t: DIP_T - 0.12, sfx: "fail", db: -6 },
  { t: CHART_T1, sfx: "success", db: -8 },
  { t: 15.2, sfx: "swoosh", db: -8 },
  { t: SWINGS[0][1], sfx: "thud", db: -2 },
  { t: SWINGS[0][1], sfx: "punch", db: -6 },
  { t: SWINGS[1][1], sfx: "thud", db: -1 },
  { t: SWINGS[1][1], sfx: "punch", db: -4 },
  { t: SWINGS[2][0], sfx: "riser", db: -10 },
  { t: SMASH, sfx: "glass", db: 0 },
  { t: SMASH, sfx: "boom", db: -2 },
  { t: SMASH, sfx: "impact", db: -3 },
  { t: GOLD_T0, sfx: "sparkle", db: -6 },
  { t: GOLD_T1, sfx: "metal", db: -9 },
  { t: PULSE, sfx: "boom", db: -4 },
  { t: PULSE + 0.05, sfx: "punch", db: -6 },
  { t: FLIP, sfx: "boing", db: -8 },
  { t: 19.4, sfx: "ding", db: -6 },
  { t: 21.1, sfx: "whoosh", db: -7 },
  ...[0, 1, 2, 3].map((i) => ({ t: SCORE_T + i * 0.28, sfx: "pop", db: -6 })),
  { t: CROWN_LAND, sfx: "ding", db: -2 },
  { t: CROWN_LAND, sfx: "sparkle", db: -8 },
  { t: LOOK_T, sfx: "pop", db: -8 },
  { t: 27.3, sfx: "swoosh", db: -9 },
];

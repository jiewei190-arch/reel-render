// S8b thousand-four-ways (finance/shorts/thousand-four-ways/BRIEF.md): $1,000 put in 4 places, Oct 2016 -> Oct 2026.
// The same stacked-lanes engine as S8 four-money-minds (fourminds.tsx): the same world layout, neon mood, elevator camera
// (makeCamAt), haters, coupons, envelopes, HUD style, captions and loop; only the story data and the lane actions are new.
// Each lane replays the 10 years in its own focus shot (the year ticker under the title follows the focused lane):
//   MATTRESS (red, Spender): $1,000 stays $1,000, but BUYS ticks $1,000 -> $716 (CPI); the bills shrink, the lane dims.
//   SAVINGS (green, Saver): bank box, tiny coin drips, $1,000 -> $1,021.
//   GOLD (gold, the Debt Killer rig recoloured): bars stack up to the ~$3,349 peak, then 2 bars fall off -> $2,918.
//   S&P 500 (blue, Investor): a line chart with the 2020 crash and the 2022 drop (red flashes), then -> $4,166; the payoff
//   (floor flare, gold confetti, haters knocked back, one sign flips to OK FINE).
// Scoreboard at 20.5 s, "WHICH ONE WOULD YOU PICK?" at 26.58 s ("Which"), loop back to frame 0.
// Data: finance/shorts/thousand-four-ways/sources.md. Endpoints and the gold peak are sourced; the in-between points
// that drive the animation are approximate (see RENDER_NOTES.md). No tickers, fund names or logos.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import type { Held, Look } from "../../blocky/Blocky";
import { geoOf, plastic, canvasTexture } from "../../blocky/mat";
import { clamp, hash, lerp } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { subFrame, useFonts } from "../../engine/core/frame";
import { View } from "../../engine/core/View";
import type { Cam } from "../../engine/core/View";
import { chunkWords, RecipeCaptions } from "../lib/captions";
import type { CapChunk, CapWord } from "../lib/captions";
import { base, heldWorld, pop, SAVER, sit, SPENDER } from "../../library/characters";
import { Act } from "../core";
import { BillBrick, Coin } from "../props";
import {
  arc, bump, cashHeld, DEBT_KILLER, decay, ease, easeOut, FONT, FRONT, INVESTOR, LANE_TOP, laneY, lerpPose, makeCamAt, NEON, P, project, seg, SLAB, STROKE, usd,
} from "./fourminds";
import type { CamMove, CS } from "./fourminds";
import { brickSlot, Bx, Coupon, Envelope, FundBox, Hater, LineChart, Shard } from "./props";
import type { HaterPose } from "./props";

export const S8B_FPS = 30;
export const S8B_DURATION = 28.3;
export const S8B_FRAMES = Math.round(S8B_DURATION * S8B_FPS);

// ------------------------------------------------------------------ data (sources.md)
// yearly knots at u = k/10 (end of Oct 2016 + k years); the gold peak (~Aug 2026) is at u = 0.983
const BUYS_K = [1000, 980, 956, 940, 928, 874, 811, 786, 766, 745, 716]; // 1000 * CPI(Oct 2016) / CPI(Oct year)
const SAV_K = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1008, 1013, 1017, 1021];
const GOLD_K: [number, number][] = [[0, 1000], [0.1, 997], [0.2, 958], [0.3, 1162], [0.4, 1457], [0.5, 1359], [0.6, 1246], [0.7, 1503], [0.8, 2080], [0.9, 3000], [0.983, 3349], [1, 2918]];
const SP_K: [number, number][] = [
  [0, 1000], [0.1, 1285], [0.2, 1380], [0.3, 1600], [0.325, 1675], [0.35, 1350], [0.4, 1720], [0.5, 2440], [0.525, 2530], [0.6, 1920], [0.7, 2260], [0.8, 3100], [0.9, 3740], [1, 4166],
];
const knots = (k: [number, number][], u: number) => {
  const x = clamp(u);
  for (let i = 0; i < k.length - 1; i++) if (x <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], (x - k[i][0]) / (k[i + 1][0] - k[i][0]));
  return k[k.length - 1][1];
};
const yearly = (k: number[], u: number) => knots(k.map((v, i) => [i / 10, v] as [number, number]), u);
const GOLD_PEAK = 3349;
const SP_SAMPLES = Array.from({ length: 41 }, (_, i) => knots(SP_K, i / 40));

// ------------------------------------------------------------------ cast + lanes
const GOLDBUG: Look = { ...DEBT_KILLER, skin: "#ffcf4a", hair: "#f0b020", shirt: "#d9a010", sole: "#ffffff", accent: "#fff4b0", belt: "#6a4a08", cuffs: "#ffffff" };
type LaneDef = { name: string; color: string; look: Look; x: number; signs: string[]; haters: [number, number][] };
const HATERS3: [number, number][] = [[0.95, -0.3], [1.4, 0.08], [1.85, -0.45]];
const LANES: LaneDef[] = [
  { name: "MATTRESS", color: "#ff3b3b", look: SPENDER, x: -1.5, signs: ["SAFE!", "BANKS ARE\nSCAMS", "CASH IS KING"], haters: HATERS3 },
  { name: "SAVINGS", color: "#2fe07a", look: SAVER, x: -1.5, signs: ["BORING", "0.06%?!", "SNOOZE"], haters: HATERS3 },
  { name: "GOLD", color: "#ffc21a", look: GOLDBUG, x: -1.5, signs: ["IT'S A ROCK", "SELL NOW!", "BUBBLE!"], haters: HATERS3 },
  { name: "S&P 500", color: "#3a9bff", look: INVESTOR, x: -1.5, signs: ["IT'LL CRASH", "GAMBLING", "TOLD YA", "SELL NOW!"], haters: [[0.95, -0.3], [1.4, 0.08], [1.85, -0.45], [1.6, -0.95]] },
];
const YAW0 = 0.55;
const ENV_X = (i: number) => LANES[i].x + 0.55;
const ENV_Z = 0.45;
const MAT_X = -0.42, MAT_H = 0.26;
const SEAT_X = -0.78;
const BANK_X = -0.6;
const STACK_X = -0.25;
const CHART_X = -0.25, CHART_W = 1.25;
const TAGS = ["LOL", "NOPE", "BOO", "MEH", "?!"];

// ------------------------------------------------------------------ timeline
const RUNS: [number, number][] = [[2.6, 4.9], [5.85, 8.2], [9.15, 12.1], [14.15, 18.6]];
const runU = (i: number, t: number) => seg(t, RUNS[i][0], RUNS[i][1]);
const MAT_STUFF = 2.45, MAT_SIT = 3.25, MAT_DIM = 5.0;
const SAV_TOSS = 5.85;
const GOLD_TOSS = 9.0, GOLD_DROP0 = 12.2, GOLD_DROP1 = 12.75;
const SP_TOSS = 14.0, PAYOFF = 18.7, KNOCK = 18.78, FLIP = 19.25;
const SCORE_T = 20.75, FLEE_T = 20.55;
const MATT_WORD = 21.86;
const LOOK_T = 26.55;
const RESET = (t: number) => ease(seg(t, 27.85, 28.12));
const keep = (t: number) => 1 - RESET(t);
const ENV_FALL = 28.3 - 0.38;

const uGold = (t: number) => (t < GOLD_DROP0 ? 0.983 * runU(2, t) : 0.983 + 0.017 * ease(seg(t, GOLD_DROP0, GOLD_DROP1)));
const goldValue = (t: number) => knots(GOLD_K, uGold(t));
const uSP = (t: number) => runU(3, t);
const spValue = (t: number) => knots(SP_K, uSP(t));
const savValue = (t: number) => yearly(SAV_K, runU(1, t));
const buyValue = (t: number) => yearly(BUYS_K, runU(0, t));
// red flashes on the S&P lane: the 2020 crash (u .325-.35) and the 2022 drop (u .525-.6)
const tAtU = (u: number) => lerp(RUNS[3][0], RUNS[3][1], u);
const CRASHES: [number, number][] = [[tAtU(0.325), tAtU(0.35)], [tAtU(0.525), tAtU(0.6)]];
const spFlash = (t: number) => Math.max(...CRASHES.map(([a, b]) => bump(t, a - 0.05, b - a + 0.5)));

// ------------------------------------------------------------------ camera
const W0: CS = { cx: 0.75, cy: 3.78, hf: 11.03 };
const W1: CS = { cx: 0.75, cy: 4.12, hf: 10.16 };
const W2: CS = { cx: 0.55, cy: 2.75, hf: 13.7 };
const F = (i: number, cx = -0.45, hf = 5.3): CS => ({ cx, cy: laneY(i) + 0.44, hf });
const MOVES: CamMove[] = [
  { at: 1.0, dur: 0.4, to: W1 },
  { at: 2.0, dur: 0.45, to: F(0) },
  { at: 3.85, dur: 0.4, to: { cx: 0.55 } },
  { at: 4.6, dur: 0.4, to: { cx: -0.45 } },
  { at: 5.4, dur: 0.45, to: F(1) },
  { at: 6.9, dur: 0.4, to: { cx: 0.55 } },
  { at: 7.65, dur: 0.4, to: { cx: -0.45 } },
  { at: 8.6, dur: 0.45, to: F(2) },
  { at: 10.5, dur: 0.4, to: { cx: 0.55 } },
  { at: 11.3, dur: 0.4, to: { cx: -0.3, hf: 5.8 } },
  { at: 13.5, dur: 0.42, to: { ...F(3, -0.35, 5.0), cy: laneY(3) + 1.49 } }, // the last lane sits low: no dead floor
  { at: 16.9, dur: 0.4, to: { cx: -0.2, hf: 5.6 } },
  { at: 18.45, dur: 0.35, to: { cx: 0.3, hf: 7.6, cy: laneY(3) + 2.55 } }, // pull back: investor, chart and the knocked-back haters (OK FINE) all in frame
  { at: 20.15, dur: 0.4, to: W2 },
];
const SHAKES: [number, number][] = [[0, 1.0], [GOLD_DROP0, 0.5], [CRASHES[0][0], 0.45], [CRASHES[1][0], 0.35], [PAYOFF, 1.4], [KNOCK, 0.6]];
const camAt = makeCamAt(MOVES, SHAKES, W0);

// ------------------------------------------------------------------ props new to this Short
const Mattress: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <Bx s={[1.15, MAT_H, 0.72]} p={[0, MAT_H / 2, 0]} c="#ece6f4" rough={0.8} round={0.25} />
    {[-0.36, -0.12, 0.12, 0.36].map((x) => (
      <Bx key={x} s={[0.035, MAT_H * 0.82, 0.73]} p={[x, MAT_H / 2, 0]} c="#7a8fd8" rough={0.8} shadow={false} round={0.3} />
    ))}
    <Bx s={[0.34, 0.1, 0.5]} p={[-0.36, MAT_H + 0.05, -0.05]} c="#ffffff" rough={0.85} round={0.4} />
  </group>
);
const GoldBar: React.FC<{ p: V3; r?: V3; s?: number; glow?: number }> = ({ p, r = [0, 0, 0], s = 1, glow = 0 }) => (
  <group scale={s}>
    <Shard p={p} r={r} gold={1} glow={glow} />
  </group>
);

// ------------------------------------------------------------------ lane shell
const Lane: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const L = LANES[i];
  const Y = laneY(i);
  let glow = 1;
  const dim = i === 0 ? 0.6 * ease(seg(t, MAT_DIM, MAT_DIM + 0.6)) * keep(t) : 0;
  if (i === 0) glow = lerp(1, 0.3, dim / 0.6) + 1.2 * bump(t, MATT_WORD - 0.1, 0.9);
  if (i === 2) glow = 1 + 0.6 * bump(t, GOLD_DROP0 - 0.05, 0.7) + 0.6 * decay(t, GOLD_TOSS + 0.4, 3);
  if (i === 3) glow = 1 + 0.5 * spFlash(t) + 2.6 * decay(t, PAYOFF, 1.4) + 1.6 * decay(t, KNOCK, 2.2);
  const red = (i === 2 ? bump(t, GOLD_DROP0 - 0.05, 0.7) : 0) + (i === 3 ? spFlash(t) : 0);
  const stripCol = red > 0.3 ? "#ff3030" : L.color;
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
      <mesh geometry={geoOf("s8slab", () => new THREE.BoxGeometry(34, SLAB, 2.6))} material={plastic("#0c0a12", { rough: 0.8 })} position={[0, -SLAB / 2, FRONT - 1.3]} receiveShadow />
      <mesh geometry={geoOf("s8floorTop", () => new THREE.PlaneGeometry(34, 2.6))} material={plastic("#121019", { rough: 0.55 })} position={[0, 0.001, FRONT - 1.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
      <mesh geometry={geoOf("s8neon", () => new THREE.BoxGeometry(34, 0.045, 0.05))} material={plastic(stripCol, { emissive: stripCol, ei: 4.2 * glow })} position={[0, -0.03, FRONT + 0.01]} />
      <mesh geometry={geoOf("s8neon2", () => new THREE.BoxGeometry(34, 0.02, 0.02))} material={plastic(stripCol, { emissive: stripCol, ei: 2.8 * glow })} position={[0, 0.004, FRONT - 0.03]} />
      <mesh geometry={geoOf("s8back", () => new THREE.PlaneGeometry(34, LANE_TOP))} material={plastic("#06050b", { rough: 0.95 })} position={[0, LANE_TOP / 2, -1.68]} />
      <mesh geometry={geoOf("s8backGlow", () => new THREE.PlaneGeometry(34, LANE_TOP * 0.9))} material={plastic("#000000", { transparent: true, map: glowTex, emissive: "#ffffff", ei: 0, opacity: clamp(0.55 * glow, 0, 1) })} position={[0, LANE_TOP * 0.45, -1.66]} />
      <LaneStuff i={i} t={t} />
      {i === 0 && dim > 0.001 ? <mesh geometry={geoOf("s8dim", () => new THREE.PlaneGeometry(34, P))} material={plastic("#05040a", { transparent: true, opacity: dim * (1 - 0.6 * bump(t, MATT_WORD - 0.1, 0.9)) })} position={[0, P / 2 - SLAB - 0.001, 1.25]} renderOrder={9} /> : null}
      {red > 0.001 ? <mesh geometry={geoOf("s8red", () => new THREE.PlaneGeometry(34, P))} material={plastic("#ff1a1a", { transparent: true, opacity: 0.2 * clamp(red) })} position={[0, P / 2 - SLAB - 0.001, 1.25]} renderOrder={9} /> : null}
    </group>
  );
};

// ---------------- envelopes (all lanes, same beat) - lands on frame 0 = the loop point
const envDrop = (t: number) => {
  if (t > ENV_FALL) {
    const u = seg(t, ENV_FALL, S8B_DURATION);
    return { y: 1.55 * (1 - u * u), sq: 0, s: 1 };
  }
  const sq = Math.exp(-t * 9) * Math.cos(t * 30);
  return { y: 0, sq, s: 1 - ease(seg(t, 1.45, 1.75)) };
};
const envOpen = (t: number) => (t > ENV_FALL ? 0 : easeOut(seg(t, 1.05, 1.3)));

// ---------------- haters + thrown tags
const THROWS: [number, number, number][][] = [
  [[2.3, 0, 0], [3.0, 1, 1], [3.7, 2, 2], [4.4, 0, 3], [6.6, 1, 4], [9.4, 2, 0], [12.6, 0, 1], [15.6, 1, 2], [18.2, 2, 3]],
  [[2.8, 1, 2], [5.2, 0, 0], [6.5, 2, 3], [7.3, 1, 1], [8.0, 0, 4], [10.9, 2, 2], [14.6, 0, 0], [17.6, 1, 3]],
  [[3.3, 0, 1], [6.0, 2, 4], [9.5, 1, 0], [10.3, 0, 2], [11.1, 2, 3], [11.8, 1, 4], [14.9, 0, 1], [17.9, 2, 0]],
  [[2.6, 1, 0], [5.0, 0, 3], [7.9, 2, 1], [11.4, 3, 4], [14.5, 1, 2], [15.3, 0, 0], [16.2, 2, 3], [17.0, 3, 1], [17.8, 1, 4]],
];
const haterPose = (i: number, h: number, t: number): HaterPose => {
  const [x0, z0] = LANES[i].haters[h];
  const ph = h * 1.9 + i * 0.7;
  let x = x0, lean = 0;
  let throwArm = 0.15 + 0.05 * Math.sin(t * 2 + ph);
  let hop = 0.03 * Math.max(0, Math.sin(t * 6.2 + ph));
  let signLift = 0.15 * Math.max(0, Math.sin(t * 3.3 + ph));
  for (const [T, hh] of THROWS[i]) {
    if (hh !== h || t < T - 0.3 || t > T + 0.45) continue;
    if (t < T) throwArm = lerp(0.15, -0.7, ease(seg(t, T - 0.3, T - 0.05)));
    else throwArm = lerp(2.0, 0.15, ease(seg(t, T + 0.08, T + 0.45))) * (t < T + 0.08 ? ease(seg(t, T - 0.02, T + 0.08)) : 1) + (t < T + 0.08 ? -0.7 * (1 - ease(seg(t, T - 0.02, T + 0.08))) : 0);
  }
  if (i === 0) hop += 0.12 * bump(t, MAT_STUFF + 0.3, 0.35) + 0.1 * bump(t, MAT_SIT + 0.2, 0.35); // SAFE! they cheer the mattress
  if (i === 2) {
    hop += 0.14 * bump(t, GOLD_DROP0, 0.32) + 0.1 * bump(t, GOLD_DROP0 + 0.35, 0.3);
    signLift += 0.5 * bump(t, GOLD_DROP0 - 0.05, 0.75);
  }
  let flip = 0;
  if (i === 3) {
    for (const [a] of CRASHES) {
      hop += 0.13 * bump(t, a, 0.32) + 0.09 * bump(t, a + 0.35, 0.3);
      signLift += 0.45 * bump(t, a - 0.05, 0.7);
    }
    const u = easeOut(seg(t, KNOCK + 0.02, KNOCK + 0.4));
    const k = u * keep(t);
    x += 0.22 * k + 0.04 * h * k;
    lean = (1.0 * bump(t, KNOCK + 0.02, 0.5) + 0.35 * u) * keep(t);
    hop += 0.25 * bump(t, KNOCK + 0.02, 0.38);
    if (h === 1) flip = ease(seg(t, FLIP, FLIP + 0.3)) * keep(t);
    if (t > KNOCK) {
      throwArm = 0.15;
      signLift = 0.1 * keep(t);
    }
  }
  const flee = ease(seg(t, FLEE_T + 0.08 * h, FLEE_T + 0.55 + 0.08 * h)) * keep(t);
  x += 4.6 * flee;
  hop += 0.08 * Math.abs(Math.sin(t * 14)) * (flee > 0 && flee < 1 ? 1 : 0);
  return { x, z: z0, yaw: lerp(-0.6, -1.4, flee), lean, hop, throwArm, signLift, signWob: 0.12 * Math.sin(t * 5.1 + ph) * (i === 3 && t > KNOCK ? 0.3 : 1), flip };
};
const Tags: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const L = LANES[i];
  const out: React.ReactNode[] = [];
  THROWS[i].forEach(([T, h, k], n) => {
    if (t < T || t > T + 2.0) return;
    const hp = haterPose(i, h, T);
    const a: V3 = [hp.x - 0.25, 1.05, hp.z + 0.15];
    const hit: V3 = [L.x + 0.22, 0.85 - (i === 0 && T > MAT_SIT ? 0.25 : 0), 0.2];
    const rest: V3 = [L.x + 0.55 + 0.35 * hash(n + i * 7.1), 0.006, 0.38 + 0.2 * hash(n * 3.3 + i)];
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
    if (s > 0.01) out.push(<Coupon key={n} p={p} r={r} text={TAGS[k]} s={1.25 * s} />);
  });
  return <>{out}</>;
};

// ---------------- the cast
type Who = { pose: Pose; emotion: Emotion; held?: Held; extra?: React.ReactNode };
const towardCam = (t: number) => ease(seg(t, LOOK_T, LOOK_T + 0.35)) * keep(t);
const standPose = (i: number, t: number, o: Partial<Pose> = {}): Pose => base(LANES[i].x, 0, lerp(YAW0, 0.05, towardCam(t)), 1, { headPitch: 0.06, ...o });
const openingEmotion = (t: number): Emotion | null => (t < 0.38 || t > ENV_FALL + 0.06 ? "shock" : t < 1.5 ? "happy" : null);
const handOf = (i: number, armR = 0.35) => heldWorld(base(LANES[i].x, 0, YAW0, 1, { armR }), "R", 1, [0, 0.03, 0]);
const cashFly = (i: number, t: number): React.ReactNode => {
  if (t < 1.1 || t > 1.5) return null;
  return <BillBrick p={arc([ENV_X(i), 0.42, ENV_Z], handOf(i), t, 1.1, 1.5, 0.35)} s={1.5} r={[0, (t - 1.1) * 10, 0]} />;
};
/** a toss of the held cash from the raised hand to `to` over [t0, t0 + 0.45] */
const toss = (i: number, t: number, t0: number, to: V3): React.ReactNode => {
  if (t < t0 || t > t0 + 0.45) return null;
  return <BillBrick p={arc(handOf(i, 1.3), to, t, t0, t0 + 0.45, 0.35)} s={1.5} r={[0, (t - t0) * 8, 0]} />;
};
const tossArm = (t: number, t0: number) => pop(seg(t, t0 - 0.2, t0 + 0.25)) * (1 - seg(t, t0 + 0.25, t0 + 0.55)) * (t < t0 + 0.55 ? 1 : 0);

const mattressGuy = (t: number): Who => {
  const i = 0;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.05 });
  pose = { ...pose, armR: 0.3 + 1.1 * tossArm(t, MAT_STUFF), pitch: 0.25 * bump(t, MAT_STUFF - 0.15, 0.6) };
  const bp = buyValue(t);
  const sitP = sit(SEAT_X, 0.05, lerp(0.5, 0.05, towardCam(t)), { y: MAT_H + 0.135, headPitch: 0.3, armL: 0.2, armR: 0.2, outL: 0.2, outR: 0.2, pitch: 0.08 });
  // looks down at the shrinking bills every ~1.6 s, then slumps as the buying power drops
  const look = Math.max(0, Math.sin(((t - 3.6) * Math.PI) / 1.6)) ** 6 * (t < 20 ? 1 : 0);
  sitP.headPitch += 0.25 * look + 0.25 * (1 - bp / 1000) / 0.284 - 0.45 * towardCam(t);
  const flop = ease(seg(t, MAT_SIT, MAT_SIT + 0.45)) * keep(t);
  if (flop > 0) {
    pose = lerpPose(pose, sitP, flop);
    if (flop < 1) pose.y += 0.18 * Math.sin(Math.PI * flop);
  }
  if (t > MAT_STUFF && t < 4.0) emo = "love";
  if (t > 4.0) emo = bp < 800 ? "sad" : "curious";
  if (t > MATT_WORD && t < 24) emo = "sad";
  if (t > ENV_FALL + 0.06) emo = "shock";
  return { pose, emotion: emo, held: t >= 1.5 && t < MAT_STUFF ? cashHeld(1) : undefined, extra: <>{cashFly(i, t)}{toss(i, t, MAT_STUFF, [MAT_X - 0.1, 0.05, 0.38])}</> };
};
const MattressStuff: React.FC<{ t: number }> = ({ t }) => {
  const k = keep(t);
  const stuffed = t >= MAT_STUFF + 0.45;
  const bp = buyValue(t) / 1000;
  const s = stuffed ? 1.5 * Math.pow(bp, 1.6) * k : 0; // the bills shrink with the buying power
  const lift = stuffed ? 0.06 * k * (0.5 + 0.5 * bp) : 0;
  return (
    <>
      <Mattress p={[MAT_X, lift, 0]} />
      {s > 0.01
        ? [-0.32, -0.08, 0.16].map((x, n) => <BillBrick key={n} p={[MAT_X + x, 0, 0.36 + 0.02 * n]} s={s} r={[0, 0.15 * (n - 1), 0]} />)
        : null}
    </>
  );
};

const saverGuy = (t: number): Who => {
  const i = 1;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.04 });
  const glance = Math.max(0, Math.sin(((t - 2.2) * Math.PI) / 2.1)) ** 4;
  pose = { ...pose, armR: 0.3 + 1.1 * tossArm(t, SAV_TOSS), headYaw: 0.45 * glance * (t < 26 ? 1 : 0), armL: 0.1 + 1.6 * bump(t, 8.25, 0.6) };
  if (t > 6.5 && t < 8.2) emo = "curious";
  if (t > 8.2 && t < 9.5) emo = "sly";
  if (t > ENV_FALL + 0.06) emo = "shock";
  return { pose, emotion: emo, held: t >= 1.5 && t < SAV_TOSS ? cashHeld(1) : undefined, extra: <>{cashFly(i, t)}{toss(i, t, SAV_TOSS, [BANK_X, 0.42, 0])}</> };
};
const DRIPS = Array.from({ length: 9 }, (_, n) => RUNS[1][0] + 0.45 + n * 0.22 + 0.05 * Math.sin(n * 2.3));
const BankStuff: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [<FundBox key="box" p={[BANK_X, 0, 0]} label={["BANK", "SAVINGS"]} cols={["#178a45", "#0d4a26", "#21a858", "#2fe07a"]} lid={bump(t, SAV_TOSS - 0.1, 0.75)} glow={0.5 * decay(t, SAV_TOSS + 0.45, 3) + 0.4 * decay(t, RUNS[1][1], 3)} />];
  DRIPS.forEach((d, n) => {
    if (t < d || t > d + 0.42) return;
    const u = seg(t, d, d + 0.38);
    const y = lerp(1.35, 0.46, u * u) - (t > d + 0.38 ? 0.1 : 0);
    out.push(<Coin key={n} p={[BANK_X + 0.08 * Math.sin(n * 1.7), y, 0.05]} r={[0.3, 0, (t - d) * 8]} s={1.0} />);
  });
  return <>{out}</>;
};

const goldGuy = (t: number): Who => {
  const i = 2;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.03 });
  const cheer = BAR_IN.reduce((s, b) => s + bump(t, b, 0.35), 0);
  const drop = bump(t, GOLD_DROP0 - 0.1, 1.0);
  pose = { ...pose, armR: 0.3 + 1.1 * tossArm(t, GOLD_TOSS), armL: 0.12 + 0.9 * clamp(cheer) + 0.8 * drop, y: pose.y + 0.05 * clamp(cheer) };
  if (t > GOLD_TOSS + 0.3 && t < GOLD_DROP0) emo = goldValue(t) > 2000 ? "joy" : "happy";
  if (drop > 0.05) {
    emo = "shock";
    pose = { ...pose, ant: 1, pitch: -0.08 * drop, armR: 0.3 + 0.7 * drop };
  }
  if (t > GOLD_DROP1 + 0.4 && t < 20) emo = "sly";
  if (t > ENV_FALL + 0.06) emo = "shock";
  return { pose, emotion: emo, held: t >= 1.5 && t < GOLD_TOSS ? cashHeld(1) : undefined, extra: <>{cashFly(i, t)}{toss(i, t, GOLD_TOSS, [STACK_X, 0.25, 0])}</> };
};
// bars: floor(value / 300); the time each bar arrives (and leaves at the drop) from scanning the frames
const BAR_SLOTS = [8, 9, 10, 11, 4, 5, 6, 7, 0, 1, 2, 3];
const barsAt = (t: number) => (t < GOLD_TOSS + 0.4 ? 0 : clamp(Math.floor(goldValue(t) / 300), 1, 12));
const BAR_IN: number[] = [];
const BAR_OUT: number[] = [];
for (let f = Math.floor(GOLD_TOSS * 30); f <= Math.ceil(GOLD_DROP1 * 30) + 2; f++) {
  const t = f / 30, n = barsAt(t), prev = barsAt((f - 1) / 30);
  for (let k = prev; k < n; k++) if (BAR_IN[k] === undefined) BAR_IN[k] = t;
  for (let k = n; k < prev; k++) BAR_OUT[k] = t;
}
const GoldStuff: React.FC<{ t: number }> = ({ t }) => {
  const k = keep(t);
  if (k < 0.01) return null;
  const out: React.ReactNode[] = [];
  BAR_IN.forEach((tin, n) => {
    if (t < tin) return;
    const slot = brickSlot(BAR_SLOTS[n]);
    const home: V3 = [STACK_X + slot[0], slot[1], slot[2]];
    const u = seg(t, tin, tin + 0.22);
    let p: V3 = [home[0], home[1] + 0.9 * (1 - u * u), home[2]];
    let r: V3 = [0, 0, 0];
    let s = k;
    const tout = BAR_OUT[n];
    if (tout !== undefined && t >= tout) {
      // falls off the top of the stack, tumbles to the floor towards the haters, then shrinks away
      const v = seg(t, tout, tout + 0.55);
      const dir = n % 2 ? 1 : 0.7;
      p = [home[0] + 0.75 * dir * v, Math.max(BRICK_H2, home[1] + 0.35 * v - 1.6 * v * v), home[2] + 0.25 * v];
      r = [0.8 * v, 0.6 * v, -2.4 * v * dir];
      s *= 1 - ease(seg(t, tout + 1.0, tout + 1.4));
      if (s < 0.01) return;
    }
    const land = decay(t, tin + 0.22, 12) * (t > tin + 0.22 ? 1 : 0);
    out.push(
      <group key={n} position={[0, 0, 0]} scale={[1, 1 - 0.1 * land, 1]}>
        <GoldBar p={p} r={r} s={s} glow={0.5 * decay(t, tin + 0.2, 4) + 0.12} />
      </group>,
    );
  });
  return <>{out}</>;
};
const BRICK_H2 = 0.1;

const spGuy = (t: number): Who => {
  const i = 3;
  let emo: Emotion = openingEmotion(t) ?? "happy";
  let pose = standPose(i, t, { headPitch: t < 1.1 ? 0.3 : 0.03 });
  const check = Math.max(0, Math.sin(((t - 2.0) * Math.PI) / 1.7)) ** 6 * (t < 13.5 ? 1 : 0);
  pose = { ...pose, armR: 0.3 + 1.1 * tossArm(t, SP_TOSS), armL: 0.08 + 1.2 * check, headPitch: pose.headPitch + 0.25 * check };
  const dip = Math.max(...CRASHES.map(([a, b]) => bump(t, a - 0.1, b - a + 0.6)));
  if (dip > 0.05) {
    emo = "shock";
    pose = { ...pose, ant: 1, pitch: -0.08 * dip, armL: 0.08 + 0.6 * dip, armR: 0.3 + 0.5 * dip };
  }
  const cel = bump(t, PAYOFF - 0.05, 1.5);
  if (cel > 0) {
    emo = "joy";
    pose = { ...pose, armL: 0.08 + 2.4 * ease(cel * 2), armR: 0.3 + 2.2 * ease(cel * 2), y: pose.y + 0.12 * Math.max(0, Math.sin((t - PAYOFF) * 9)) };
  }
  if (t > PAYOFF + 1.4 && t < 20.4) emo = "sly";
  if (t > ENV_FALL + 0.06) emo = "shock";
  return { pose, emotion: emo, held: t >= 1.5 && t < SP_TOSS ? cashHeld(1) : undefined, extra: <>{cashFly(i, t)}{toss(i, t, SP_TOSS, [CHART_X - CHART_W * 0.42, 0.75, 0.05])}</> };
};
const CONFETTI = Array.from({ length: 34 }, (_, n) => ({ v: [(hash(n * 1.3) - 0.35) * 2.4, 1.6 + 1.6 * hash(n * 2.1 + 1), 0.4 + 0.8 * hash(n * 3.7 + 2)] as V3, s: 0.05 + 0.04 * hash(n * 5.3), c: n % 3 === 0 ? "#fff0a0" : n % 3 === 1 ? "#ffd23a" : "#ffb020" }));
const SPStuff: React.FC<{ t: number }> = ({ t }) => {
  const k = keep(t);
  const draw = 40 * uSP(t) * k;
  const out: React.ReactNode[] = [
    <LineChart key="chart" p={[CHART_X, 0, 0]} w={CHART_W} h={0.74} values={SP_SAMPLES} lo={800} hi={4400} draw={draw} redBelow={0} redDrops flash={spFlash(t)} />,
  ];
  // the payoff: gold confetti burst from the top of the chart
  if (t > PAYOFF && t < PAYOFF + 1.8 && k > 0.01) {
    const o: V3 = [CHART_X + CHART_W * 0.4, 1.25, 0.1];
    CONFETTI.forEach((c, n) => {
      const tau = t - PAYOFF;
      const y = Math.max(0.03, o[1] + c.v[1] * tau - 4.0 * tau * tau);
      const k2 = 1 - ease(seg(t, PAYOFF + 1.3, PAYOFF + 1.8)); // shrinks away (opaque: a fade read as dark specks)
      if (k2 < 0.02) return;
      out.push(<Bx key={`c${n}`} s={[1.6 * c.s * k2, 0.8 * c.s * k2, 0.014]} p={[o[0] + c.v[0] * tau, Math.min(1.7, y), o[2] + c.v[2] * tau * 0.6]} r={[tau * 9 + n, tau * 7, tau * 5]} c={c.c} e={[c.c, 2.2]} shadow={false} />);
    });
  }
  if (t > KNOCK && t < KNOCK + 0.55) {
    const u = seg(t, KNOCK, KNOCK + 0.55);
    out.push(<mesh key="ring" geometry={geoOf("s8ring", () => new THREE.TorusGeometry(1, 0.03, 8, 64))} material={plastic("#ffd23a", { emissive: "#ffd23a", ei: 3, transparent: true, opacity: 1 - u })} position={[CHART_X, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.4 + 3.2 * u, 0.4 + 3.2 * u, 1]} />);
  }
  return <>{out}</>;
};

const WHO = [mattressGuy, saverGuy, goldGuy, spGuy];
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
      <Tags i={i} t={t} />
      {i === 0 ? <MattressStuff t={t} /> : null}
      {i === 1 ? <BankStuff t={t} /> : null}
      {i === 2 ? <GoldStuff t={t} /> : null}
      {i === 3 ? <SPStuff t={t} /> : null}
    </>
  );
};
const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <mesh geometry={geoOf("s8deep", () => new THREE.PlaneGeometry(80, 60))} material={plastic("#020205", { rough: 1 })} position={[0, 5, -1.75]} />
    {[0, 1, 2, 3].map((i) => (
      <Lane key={i} i={i} t={t} />
    ))}
    <mesh geometry={geoOf("s8cap", () => new THREE.BoxGeometry(34, 2.0, 2.6))} material={plastic("#16131f", { rough: 0.8 })} position={[0, laneY(0) + P - SLAB + 1.0, FRONT - 1.3]} />
  </>
);

// ------------------------------------------------------------------ 2D layer
type CounterView = { main: string; color: string; sub?: string; subColor?: string; pop: number; small?: string };
const counterOf = (i: number, t: number): CounterView => {
  if (i === 0) {
    const b = Math.round(buyValue(t));
    const on = t >= RUNS[0][0];
    return { main: "$1,000", color: "#ffffff", small: on ? "UNDER THE MATTRESS" : undefined, sub: on ? `BUYS: $1,000 → ${usd(b)}` : undefined, subColor: b < 1000 ? "#ff6a6a" : "#ffffff", pop: decay(t, RUNS[0][1], 6) };
  }
  if (i === 1) {
    const v = savValue(t);
    return { main: usd(v), color: t > RUNS[1][0] ? "#5fff9a" : "#ffffff", sub: t >= RUNS[1][1] ? "+$21 IN 10 YEARS" : undefined, subColor: "#5fff9a", pop: DRIPS.some((d) => t > d + 0.36 && t < d + 0.5) ? 0.35 : decay(t, RUNS[1][1], 6) };
  }
  if (i === 2) {
    const v = goldValue(t);
    const atPeak = t > GOLD_DROP0 - 0.5 && t < GOLD_DROP0;
    const after = t >= GOLD_DROP0 + 0.06;
    return {
      main: usd(v), color: after ? "#ff6a4a" : t > GOLD_TOSS ? "#ffd23a" : "#ffffff",
      small: after || atPeak ? `PEAK ${usd(GOLD_PEAK)}` : undefined,
      sub: after ? `-${usd(GOLD_PEAK - v)} FROM PEAK` : undefined, subColor: "#ff6a6a",
      pop: bump(t, GOLD_DROP0, 0.3) + decay(t, GOLD_DROP1, 6),
    };
  }
  const v = spValue(t);
  const u = uSP(t);
  const crash = u > 0.325 && u < 0.4 ? "2020 CRASH" : u > 0.525 && u < 0.64 ? "2022 DROP" : undefined;
  const done = t >= RUNS[3][1];
  return { main: usd(v), color: crash ? "#ff4a4a" : t > RUNS[3][0] ? "#5fb4ff" : "#ffffff", sub: crash ?? (done ? "DIVIDENDS REINVESTED" : undefined), subColor: crash ? "#ff6a6a" : "#9fd0ff", pop: spFlash(t) * 0.3 + decay(t, PAYOFF, 5) };
};
const SCORES = [
  { v: "$1,000", c: "#ff6a6a", sub: "BUYS $716" },
  { v: "$1,021", c: "#5fff9a" },
  { v: "$2,918", c: "#ffd23a" },
  { v: "$4,166*", c: "#5fb4ff", sub: "*DIVIDENDS REINVESTED" },
];

const LaneHud: React.FC<{ i: number; t: number; cam: Cam }> = ({ i, t, cam }) => {
  if (t < 1.0) return null;
  const L = LANES[i];
  const Y = laneY(i);
  const [, yTop] = project(cam, [0, Y + LANE_TOP, 0]);
  const [, yBot] = project(cam, [0, Y - 0.02, FRONT]);
  const lanePx = yBot - yTop;
  const M = 16;
  const vTop = Math.max(yTop, 236) + M;
  const vBot = Math.min(yBot, capOn(t) ? 1372 : 1600) - M;
  const fadeIn = ease(seg(t, 1.0, 1.25)) * (1 - ease(seg(t, ENV_FALL, ENV_FALL + 0.23)));
  const resetFade = 1 - ease(seg(t, 27.85, 28.0));
  const labelPx = clamp(lanePx * 0.105, 28, 52);
  const out: React.ReactNode[] = [];
  const fits = (h: number) => vBot - vTop >= h;
  if (fits(labelPx * 1.3))
    out.push(
      <div key="lbl" style={{ position: "absolute", left: M + 2, top: vTop, fontFamily: FONT, fontWeight: 800, fontSize: labelPx, lineHeight: 1.1, letterSpacing: 2, color: L.color, textShadow: `0 0 14px ${L.color}aa`, opacity: fadeIn, ...STROKE(labelPx * 0.08) }}>
        {L.name}
      </div>,
    );
  const sc = ease(seg(t, SCORE_T + i * 0.3, SCORE_T + i * 0.3 + 0.2));
  if (sc > 0 && t < 28.0) {
    const S = SCORES[i];
    const fs = clamp(lanePx * 0.34, 70, 120);
    const subPx = S.sub ? (i === 3 ? fs * 0.22 : fs * 0.34) : 0;
    const boxH = fs * 1.2 + (S.sub ? subPx * 1.3 : 0);
    if (fits(boxH)) {
      const top = clamp((yTop + yBot) / 2 - boxH / 2 + lanePx * 0.04, vTop, vBot - boxH);
      const s = 0.6 + 0.4 * pop(seg(t, SCORE_T + i * 0.3, SCORE_T + i * 0.3 + 0.45));
      const hl = i === 0 ? bump(t, MATT_WORD - 0.05, 1.1) : 0; // "the mattress money buys less"
      out.push(
        <div key="score" style={{ position: "absolute", right: M, top, height: boxH, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", padding: `0 ${fs * 0.28}px`, borderRadius: fs * 0.25, background: "rgba(10,8,20,0.82)", border: `4px solid ${S.c}`, boxShadow: `0 0 ${26 + 30 * hl}px ${S.c}aa`, transform: `scale(${s * resetFade * (1 + 0.08 * hl)})`, transformOrigin: "right center", opacity: sc * resetFade }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: fs, color: S.c, textShadow: `0 0 18px ${S.c}aa`, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{S.v}</span>
          {S.sub ? <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: subPx, color: i === 0 ? "#ff4a4a" : "#9fd0ff", lineHeight: 1.15, marginTop: 4 }}>{S.sub}</span> : null}
        </div>,
      );
    }
    return <>{out}</>;
  }
  const c = counterOf(i, t);
  const fs = clamp(lanePx * 0.13, 30, 66);
  const smallPx = fs * 0.36;
  const subPx = fs * 0.46;
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

/** the shared year ticker: 2016 -> 2026 for the lane in focus (each lane replays the 10 years) */
const tickerState = (t: number): { u: number; color: string } => {
  if (t >= 20.3) return { u: 1, color: "#ffffff" };
  for (let i = 3; i >= 0; i--) {
    if (t >= RUNS[i][0]) return { u: i === 2 ? (t < GOLD_DROP0 ? runU(2, t) * 0.983 : uGold(t)) : runU(i, t), color: LANES[i].color };
  }
  return { u: 0, color: "#ffffff" };
};
const Ticker: React.FC<{ t: number }> = ({ t }) => {
  if (t < 1.0) return null;
  const { u, color } = tickerState(t);
  const year = Math.floor(2016.83 + 10 * u + 1e-6); // calendar year (the window starts at the end of Oct 2016)
  const op = ease(seg(t, 1.0, 1.3)) * (1 - ease(seg(t, LOOK_T - 0.05, LOOK_T + 0.2)));
  if (op <= 0) return null;
  const W = 420;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 138, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: op, fontFamily: FONT, fontWeight: 800 }}>
      <span style={{ fontSize: 26, color: "#9a9cb8" }}>2016</span>
      <div style={{ position: "relative", width: W, height: 10, borderRadius: 5, background: "#2a2840" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 10, width: W * u, borderRadius: 5, background: color, boxShadow: `0 0 12px ${color}` }} />
        <div style={{ position: "absolute", left: clamp(W * u - 44, -10, W - 78), top: -15, width: 88, height: 40, borderRadius: 20, background: "#0a0812", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color, fontVariantNumeric: "tabular-nums" }}>{year}</div>
      </div>
      <span style={{ fontSize: 26, color: "#9a9cb8" }}>2026</span>
    </div>
  );
};

const FOOTNOTE = "HISTORICAL, OCT 2016-OCT 2026. PAST ≠ FUTURE. NOT ADVICE.";
const Title: React.FC<{ t: number }> = ({ t }) => {
  const q = ease(seg(t, LOOK_T - 0.05, LOOK_T + 0.2)) * (1 - ease(seg(t, 27.92, 28.15)));
  const past = bump(t, 24.4, 1.9); // "Past results aren't a promise": the footnote lights up
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 240, background: "linear-gradient(#06050cee, #06050cbb 75%, #06050c00)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 74, lineHeight: 1.1, color: "#ffffff", opacity: 1 - q, whiteSpace: "nowrap", ...STROKE(6) }}>
        $1,000 · <span style={{ color: "#ffd23a", textShadow: "0 0 22px #ffb020aa" }}>10 YEARS AGO</span>
      </div>
      {q > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", opacity: q, transform: `scale(${0.85 + 0.15 * q})`, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#ffd23a", textShadow: "0 0 20px #ffb020aa", ...STROKE(6) }}>WHICH ONE WOULD YOU PICK?</span>
        </div>
      ) : null}
      {q > 0 ? (
        <svg width={70} height={86} viewBox="0 0 70 86" style={{ position: "absolute", left: 505, top: 128 + 8 * Math.sin(t * 9), opacity: q }}>
          <path d="M22 4 H48 V46 H66 L35 82 L4 46 H22 Z" fill="#ffd23a" stroke="#0a0712" strokeWidth={5} strokeLinejoin="round" />
        </svg>
      ) : null}
      {t >= 1.0 ? (
        <div style={{ position: "absolute", left: 16, right: 16, top: q > 0.5 ? 1462 : 192, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 25 + 3 * past, color: past > 0.1 ? "#ffffff" : "#c9cbe0", letterSpacing: 0.5, opacity: ease(seg(t, 1.0, 1.3)) * (1 - ease(seg(t, ENV_FALL, ENV_FALL + 0.23))), ...STROKE(past * 3) }}>
          {FOOTNOTE}
        </div>
      ) : null}
    </>
  );
};

// captions: RecipeCaptions (bold caps, outline, spoken word in red), words from vo/timings.json, 1-2 words, from 1.0 s
const VO_WORDS: CapWord[] = [
  ["A", 0.1, 0.18], ["thousand", 0.26, 0.58], ["dollars,", 0.66, 1.54], ["ten", 1.62, 1.78], ["years", 1.86, 2.02], ["ago.", 2.1, 2.82], ["Four", 2.9, 3.06], ["different", 3.14, 3.38], ["places.", 3.46, 4.26],
  ["Ten", 20.5, 20.74], ["years", 20.86, 20.98], ["later,", 21.06, 21.7], ["the", 21.74, 21.78], ["mattress", 21.86, 22.18], ["money", 22.26, 22.42], ["buys", 22.5, 22.74], ["less", 22.9, 23.14],
  ["than", 23.18, 23.22], ["it", 23.3, 23.38], ["used", 23.46, 23.7], ["to.", 23.78, 23.94], ["Past", 24.42, 24.66], ["results", 24.74, 25.14], ["aren't", 25.22, 25.38], ["a", 25.42, 25.46], ["promise.", 25.54, 26.3],
  ["Which", 26.58, 26.66], ["one", 26.74, 26.9], ["would", 26.98, 27.06], ["you", 27.14, 27.22], ["pick?", 27.38, 27.86],
].map(([w, t, end]) => ({ w: w as string, t: t as number, end: end as number }));
const CAPS: CapChunk[] = chunkWords(VO_WORDS, 2);
CAPS.forEach((c) => (c.hold = Math.min(c.hold, 28.0)));
const CAP_FROM = 1.0;
const capOn = (t: number) => t >= CAP_FROM && CAPS.some((c) => t >= c.start - 0.05 && t < c.hold);

// ------------------------------------------------------------------ the film
export const ThousandFourWaysFilm: React.FC<{ sub?: boolean }> = ({ sub = false }) => {
  const g = useCurrentFrame();
  useFonts();
  const { n, fp } = sub ? subFrame(g, 4, 0.4) : { n: g, fp: g };
  const t = fp / S8B_FPS;
  const tOut = n / S8B_FPS;
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
      <Title t={tOut} />
      <Ticker t={tOut} />
      <RecipeCaptions chunks={CAPS} t={tOut} hide={(x) => x < CAP_FROM} style={{ centre: 0.735, size: 84 }} />
    </AbsoluteFill>
  );
};

/** VO segments for the music duck (tools/s8_mix.py) */
export const S8B_VO_SEGS: [number, number][] = [[0.0, 4.3], [20.4, 27.9]];
/** SFX cues for the mix (tools/s8_mix.py reads them through tools/s8_cues.mjs) */
export const S8B_CUES: { t: number; sfx: string; db: number }[] = [
  { t: 0.0, sfx: "impact", db: 0 },
  { t: 0.0, sfx: "thud", db: -3 },
  { t: 1.0, sfx: "whoosh", db: -8 },
  { t: 1.08, sfx: "paper", db: -6 },
  { t: 1.2, sfx: "pop", db: -6 },
  ...MOVES.slice(1).map((m) => ({ t: m.at, sfx: "swoosh", db: m.to.cy !== undefined ? -8 : -14 })),
  ...THROWS.flatMap((l, i) => l.map(([T]) => ({ t: T, sfx: "swoosh", db: -16 - (i === 0 ? 0 : 3) }))),
  // mattress: stuff, flop, the buying power ticks down
  { t: MAT_STUFF + 0.4, sfx: "paper", db: -4 },
  { t: MAT_SIT + 0.4, sfx: "thud", db: -6 },
  ...[3.4, 3.9, 4.4].map((x) => ({ t: x, sfx: "tick", db: -12 })),
  { t: 4.9, sfx: "fail", db: -9 },
  // savings: toss, coin drips, a tiny ding
  { t: SAV_TOSS + 0.4, sfx: "thud", db: -7 },
  ...DRIPS.map((d) => ({ t: d + 0.38, sfx: "coins", db: -14 })),
  { t: RUNS[1][1], sfx: "chime", db: -12 },
  // gold: toss, bars land, the drop
  { t: GOLD_TOSS + 0.4, sfx: "metal", db: -8 },
  ...BAR_IN.slice(3).map((b) => ({ t: b + 0.2, sfx: "metal", db: -11 })),
  { t: GOLD_DROP0 - 0.15, sfx: "riser", db: -12 },
  { t: GOLD_DROP0, sfx: "fail", db: -6 },
  ...BAR_OUT.filter((x) => x !== undefined).map((b) => ({ t: b + 0.35, sfx: "drop", db: -6 })),
  // S&P: toss, the crashes, the payoff
  { t: SP_TOSS + 0.4, sfx: "pop", db: -8 },
  ...CRASHES.map(([a]) => ({ t: a - 0.05, sfx: "fail", db: -6 })),
  { t: PAYOFF - 0.6, sfx: "riser", db: -10 },
  { t: PAYOFF, sfx: "success", db: -4 },
  { t: PAYOFF, sfx: "sparkle", db: -6 },
  { t: KNOCK, sfx: "boom", db: -4 },
  { t: KNOCK + 0.05, sfx: "punch", db: -6 },
  { t: FLIP, sfx: "boing", db: -8 },
  // scoreboard + end
  ...[0, 1, 2, 3].map((i) => ({ t: SCORE_T + i * 0.3, sfx: "pop", db: -6 })),
  { t: MATT_WORD, sfx: "buzz", db: -14 },
  { t: LOOK_T, sfx: "pop", db: -8 },
  { t: 27.85, sfx: "swoosh", db: -9 },
];

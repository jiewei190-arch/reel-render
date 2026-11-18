// ten-beats-thirty: "Ten years of saving can beat thirty." Two identical blocky garden plots under one sky, a jar column on
// a podium each, age signs. Times from src/shorts/ten_beats_thirty.plan.gen.ts. One sunny sky for the whole Short.
import React from "react";
import * as THREE from "three";
import { HoloTag, Sign } from "../library/props";
import { PENNY, SAVER, SPENDER, pop } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Look } from "../blocky/Blocky";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { geoOf, plastic, rbox } from "../blocky/mat";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/ten_beats_thirty.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { BigClock, ChartBoard, Coin, CoinStack, Ground, Label, Pedestal, Stamp } from "./props";
import SCRIPT from "./scripts/tenthirty";

// ------------------------------------------------------------------ layout (metres; y up, lens side = +z)
const XS = -1.5; // Saver's podium
const XP = 1.5; // Spender's podium
const POD_H = 0.75;
const P_SAVER: V3 = [-0.6, 0, 0.15];
const P_SPEND: V3 = [0.6, 0, 0.15];
const BOARD: V3 = [0, 0, 1.2];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const E = Object.fromEntries(PLAN.map((p) => [p.id, p.end])) as Record<string, number>;
const GREEN = "#5ff08a", RED = "#ff6a5f";

// ------------------------------------------------------------------ the money (7 %/yr, $200 at the start of each month)
const i7 = 0.07 / 12;
const fvDue = (m: number) => (200 * (Math.pow(1 + i7, m) - 1)) / i7 * (1 + i7);
const SAVER_35 = fvDue(120);
const SAVER_FIN = SAVER_35 * Math.pow(1 + i7, 360);
const SPEND_FIN = fvDue(360);
const rnd = (v: number) => Math.round(v);

const saverV = (t: number, id: string, tau: number): number => {
  if (t < T.S03 || id === "S23") return 0;
  if (id === "S03") return tau > 0.95 ? 200 : 0;
  if (id === "S04") return 200 * (1 + Math.min(2, Math.floor(tau / 0.45)));
  if (id === "S05") return lerp(600, SAVER_35, ss(0.05, 0.55, tau));
  if (t < T.S15) return SAVER_35;
  if (t < T.S18) return lerp(SAVER_35, SAVER_FIN, ss(T.S15, T.S17 + 0.7, t));
  return SAVER_FIN;
};
const spenderV = (t: number, id: string, tau: number): number => {
  if (t < T.S08 || id === "S23") return 0;
  if (id === "S08") return 200 * Math.min(5, Math.floor(tau / 0.3) + 1);
  if (id === "S09") return Math.round(lerp(1000, 72000, ss(0.05, 0.95, tau)) / 200) * 200;
  if (t < T.S15) return 72000;
  if (t < T.S19) return lerp(72000, SPEND_FIN, ss(T.S15, T.S18 + 0.2, t));
  return SPEND_FIN;
};
/** the fill height (m) of a jar column for a shown value (monotone: 24k < 35k < 72k < 245k < 283k) */
const fillOf = (v: number) => (v <= 0 ? 0 : 0.05 + 2.6 * Math.pow(v / 282600, 0.6));
const saverAge = (t: number, id: string, tau: number): string => {
  if (t < T.S03 || id === "S23") return "10 YRS";
  if (id === "S05") return tau > 0.3 ? "AGE 35" : "AGE 25";
  if (t < T.S05) return "AGE 25";
  if (t < T.S15) return "AGE 35";
  return "AGE 65";
};
const spenderAge = (t: number, id: string, tau: number): string => {
  if (t < T.S07 || id === "S23") return "30 YRS";
  if (id === "S09") return `AGE ${35 + 5 * Math.round(6 * ss(0.05, 0.9, tau))}`;
  if (t < T.S09) return "AGE 35";
  return "AGE 65";
};

// ------------------------------------------------------------------ shots (lenses)
const L = (o: Partial<FinShot> & Pick<FinShot, "subj" | "fov" | "face" | "mood">): Omit<FinShot, "id" | "a" | "b"> => ({ off: [0, 0, 3], sky: true, ...o });
const OPEN_POS: V3 = [0, 1.4, 5.0];
const OPEN_SUBJ: V3 = [0, 1.15, 0];
const PUSH23 = 0.04;
const k23 = 1 - PUSH23 * (E.S23 - T.S23);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: L({ subj: () => OPEN_SUBJ, pos: OPEN_POS, fov: 66, face: 0.42, mood: "earth", push: PUSH23, roll: [0, 0.6], blur: 0.9 }),
  S02: L({ subj: () => [-1.0, 1.3, 0], pos: [-0.2, 1.4, 5.3], fov: 60, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.0 }),
  S03: L({ subj: () => [-1.0, 1.15, 0.1], off: [0.4, 0.1, 3.0], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.3 }),
  S04: L({ subj: () => [-1.6, 1.1, 0.05], off: [0.5, 0.1, 2.3], fov: 48, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.8 }),
  S05: L({ subj: () => [-0.9, 1.15, 0.1], off: [0.3, 0.1, 3.1], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.0], blur: 1.3 }),
  S06: L({ subj: () => [-1.0, 0.95, 0.1], pos: [-0.4, 1.5, 5.0], fov: 58, face: 0.5, mood: "earth", roll: [0, -1.0], blur: 0.9 }),
  S07: L({ subj: () => [0.9, 1.15, 0.1], off: [-0.4, 0.1, 3.0], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.3 }),
  S08: L({ subj: () => [1.6, 1.1, 0.05], off: [-0.5, 0.1, 2.3], fov: 48, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.8 }),
  S09: L({ subj: () => [1.0, 1.25, 0], pos: [0.2, 1.5, 5.4], fov: 58, face: 0.5, mood: "earth", roll: [0, 1.2], blur: 1.0 }),
  S10: L({ subj: () => [XS, 1.1, 0.2], off: [0.4, 0.5, 3.7], fov: 50, face: 0.55, mood: "earth", roll: [0, -1.2], blur: 1.4 }),
  S11: L({ subj: () => [XP, 1.1, 0.2], off: [-0.4, 0.5, 3.7], fov: 50, face: 0.55, mood: "earth", roll: [0, 1.2], blur: 1.4 }),
  S12: L({ subj: () => [0, 1.15, BOARD[2]], pos: [0.2, 1.4, 4.9], fov: 52, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.2 }),
  S13: L({ subj: () => [0, 1.45, BOARD[2]], off: [0.1, 0.0, 2.5], fov: 44, face: 0.5, mood: "earth", roll: [0, 1.2], blur: 1.6 }),
  S14: L({ subj: () => [0, 1.3, 0], pos: [0, 1.7, 7.3], fov: 62, face: 0.5, mood: "earth", roll: [0, -1.0], blur: 0.8 }),
  S15: L({ subj: () => [0, 1.6, 0], pos: [0, 1.6, 8.0], fov: 64, face: 0.5, mood: "earth", roll: [0, 1.0], blur: 0.7 }),
  S16: L({ subj: () => [XS, 1.9, 0], pos: [-0.7, 0.4, 4.4], fov: 60, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 0.9 }),
  S17: L({ subj: () => [XS, 2.5, 0], off: [0.5, -0.1, 3.4], fov: 50, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.3 }),
  S18: L({ subj: () => [XP, 2.1, 0], off: [-0.5, -0.1, 3.4], fov: 50, face: 0.45, mood: "earth", roll: [0, -1.2], blur: 1.3 }),
  S19: L({ subj: () => [0, 1.25, 0.1], pos: [0, 1.5, 5.3], fov: 58, face: 0.5, mood: "earth", roll: [0, 1.0], blur: 1.0 }),
  S20: L({ subj: () => [0, 1.5, BOARD[2]], pos: [0.2, 1.55, 4.4], fov: 50, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.2 }),
  S21: L({ subj: () => [0, 1.5, BOARD[2]], off: [0.1, 0.0, 2.4], fov: 44, face: 0.5, mood: "earth", roll: [0, 1.2], blur: 1.6 }),
  S22: L({ subj: () => [XS + 0.2, 1.7, 0], pos: [-0.2, 1.7, 5.4], fov: 56, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 1.1 }),
  S23: L({
    subj: () => OPEN_SUBJ,
    pos: [OPEN_SUBJ[0] + (OPEN_POS[0] - OPEN_SUBJ[0]) / k23, OPEN_SUBJ[1] + (OPEN_POS[1] - OPEN_SUBJ[1]) / k23, OPEN_SUBJ[2] + (OPEN_POS[2] - OPEN_SUBJ[2]) / k23],
    fov: 66, face: 0.42, mood: "earth", push: PUSH23, roll: [0.6, 0], blur: 0.9,
  }),
};
export const TEN_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ props
/** a glass jar column of coins: the glass grows when the coins outgrow it */
const Column: React.FC<{ p: V3; fill: number; glow?: number; lift?: number; hue?: string }> = ({ p, fill, glow = 0, lift = 0, hue = "#ffd23a" }) => {
  const H = Math.max(0.5, fill * 1.06 + 0.04);
  return (
    <group position={[p[0], p[1] + lift, p[2]]}>
      <mesh geometry={geoOf("colGlass", () => new THREE.CylinderGeometry(0.22, 0.22, 1, 40, 1, true))} material={plastic("#9fd8ff", { rough: 0.1, transparent: true, opacity: 0.16 + 0.1 * glow, emissive: glow ? "#7dffb0" : undefined, ei: 0.5 * glow, side: THREE.DoubleSide })} position={[0, H / 2, 0]} scale={[1, H, 1]} renderOrder={3} />
      <mesh geometry={geoOf("colBase", () => new THREE.CylinderGeometry(0.235, 0.235, 0.04, 40))} material={plastic("#8c8fb8")} position={[0, 0.02, 0]} />
      <mesh geometry={geoOf("colLid", () => new THREE.CylinderGeometry(0.24, 0.24, 0.05, 40))} material={plastic("#e0a92a", { rough: 0.3 })} position={[0, H + 0.025, 0]} castShadow />
      <mesh geometry={geoOf("colKnob", () => new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16))} material={plastic("#c98f1c")} position={[0, H + 0.07, 0]} />
      {fill > 0.01 ? (
        <>
          <mesh geometry={geoOf("colFill", () => new THREE.CylinderGeometry(0.2, 0.2, 1, 36))} material={plastic(hue, { rough: 0.35, emissive: "#c88a10", ei: 0.18 + 0.5 * glow })} position={[0, 0.04 + fill / 2, 0]} scale={[1, fill, 1]} castShadow />
          {Array.from({ length: Math.min(14, Math.floor(fill / 0.12)) }, (_, k) => (
            <mesh key={k} geometry={geoOf("colGroove", () => new THREE.TorusGeometry(0.2, 0.006, 4, 30))} material={plastic("#a8761a")} position={[0, 0.1 + k * 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} />
          ))}
        </>
      ) : null}
      {glow > 0 ? <pointLight position={[0, Math.min(H, 1.2), 0.5]} color="#a0ffc0" intensity={1.4 * glow} distance={2.6} decay={2} /> : null}
    </group>
  );
};
const Bag: React.FC<{ p: V3; sc?: number }> = ({ p, sc = 1 }) => (
  <group position={p} scale={sc}>
    <mesh geometry={rbox(0.34, 0.42, 0.2, 0.03)} material={plastic("#ff5aa0", { rough: 0.5 })} position={[0, 0.21, 0]} castShadow />
    <mesh geometry={geoOf("bagHandle", () => new THREE.TorusGeometry(0.08, 0.012, 6, 16, Math.PI))} material={plastic("#fff4c8")} position={[0, 0.42, 0]} />
    <mesh geometry={rbox(0.12, 0.14, 0.1, 0.02)} material={plastic("#ffd23a")} position={[-0.07, 0.48, 0]} />
    <mesh geometry={rbox(0.1, 0.18, 0.08, 0.02)} material={plastic("#5ac8ff")} position={[0.07, 0.5, 0]} />
  </group>
);
const DeckChair: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh geometry={rbox(0.6, 0.06, 0.6, 0.02)} material={plastic("#2fd0bd")} position={[0, 0.3, 0]} castShadow />
    <mesh geometry={rbox(0.6, 0.6, 0.06, 0.02)} material={plastic("#2fd0bd")} position={[0, 0.62, -0.3]} rotation={[-0.25, 0, 0]} castShadow />
    {[-1, 1].map((s) => (
      <mesh key={s} geometry={rbox(0.05, 0.3, 0.05, 0.01)} material={plastic("#7a4a2a")} position={[s * 0.27, 0.15, 0.25]} />
    ))}
  </group>
);
const Plot: React.FC<{ x: number; flowers: number }> = ({ x, flowers }) => (
  <group position={[x, 0, -0.5]}>
    <mesh geometry={rbox(2.4, 0.12, 1.7, 0.03)} material={plastic("#6a4426", { rough: 0.9 })} position={[0, 0.06, 0]} receiveShadow castShadow />
    {Array.from({ length: 7 }, (_, i) => (
      <group key={i} position={[-1.0 + i * 0.33, 0.12, -0.5 + 0.3 * hash(i + flowers)]}>
        <mesh geometry={rbox(0.03, 0.22, 0.03, 0.008)} material={plastic("#3fae48")} position={[0, 0.11, 0]} />
        <mesh geometry={rbox(0.12, 0.1, 0.12, 0.03)} material={plastic(["#ff7aa8", "#ffd23a", "#7dd0ff", "#ffffff"][(i + flowers) % 3 === 0 ? 0 : (i + flowers) % 3])} position={[0, 0.26, 0]} />
      </group>
    ))}
  </group>
);
const Fence: React.FC = () => (
  <group position={[0, 0, -2.8]}>
    {Array.from({ length: 15 }, (_, i) => (
      <mesh key={i} geometry={rbox(0.16, 1.1, 0.1, 0.02)} material={plastic("#d6b88a", { rough: 0.7 })} position={[-5.6 + i * 0.8, 0.55, 0]} castShadow />
    ))}
    {[0.35, 0.8].map((y) => (
      <mesh key={y} geometry={rbox(12, 0.1, 0.06, 0.01)} material={plastic("#c0a070", { rough: 0.7 })} position={[0, y, 0.06]} />
    ))}
  </group>
);

// ------------------------------------------------------------------ the scene
const GREY: Look = { ...SPENDER, skin: "#b98480", hair: "#8d7d7d", shirt: "#8f3c3c" };
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const actors: React.ReactNode[] = [];
  const extras: React.ReactNode[] = [];
  const tease = id === "S02";
  const sV = tease ? SAVER_FIN * 0.55 : saverV(t, id, tau);
  const pV = tease ? 24000 : spenderV(t, id, tau);
  const loop = id === "S01" || id === "S23";
  const camYaw = (q: V3) => yawTo(q, [0, 0, 6]);
  const growGlow = id === "S14" ? 0.8 : id === "S15" || id === "S16" || id === "S17" || id === "S18" ? 0.6 : id === "S02" ? 0.8 : 0;

  // ---- Saver
  {
    let p = P_SAVER;
    let pose: Pose = { ...stand(p[0], p[2], camYaw(p) * 0.5 + 0.35, 1), armL: 0.12, armR: 0.12 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop || id === "S01") {
      pose = { ...pose, armR: 1.9, outR: 0.3 };
      held = { side: "R", node: <Coin p={[0, 0.1, 0]} r={[Math.PI / 2, 0, 0]} s={2.6} /> };
    } else if (id === "S03") {
      const d = ss(0.35, 0.8, tau);
      pose = { ...pose, armR: lerp(1.9, 1.5, d), outR: 0.35 };
      if (tau < 0.8) held = { side: "R", node: <Coin p={[0, 0.1, 0]} r={[Math.PI / 2, 0, 0]} s={2.6} /> };
      emo = "joy";
    } else if (id === "S05") {
      pose = { ...pose, armL: 0.9 + 0.5 * Math.sin(tau * 14), armR: 0.9 - 0.5 * Math.sin(tau * 14), outL: 0.3, outR: 0.3 };
      emo = "joy";
    } else if (id === "S06") {
      p = [-0.75, 0, 0.35];
      pose = { ...stand(p[0], p[2], 0.3, 1), legL: 1.45, legR: 1.45, y: stand(0, 0, 0, 1).y - 0.2, armL: 0.5, armR: 0.5, outL: 0.2, outR: 0.2 };
      emo = "happy";
    } else if (id === "S17") {
      pose = { ...pose, armR: 1.5 * ss(0.3, 0.8, tau), outR: 0.2 };
      emo = "joy";
    } else if (id === "S19" || id === "S18") {
      emo = "joy";
    } else if (id === "S22") {
      pose = { ...pose, armL: 2.6, armR: 2.6, outL: 0.3, outR: 0.3 };
      emo = "joy";
    }
    actors.push(<Act key="sav" look={SAVER} pose={pose} emotion={emo} s={1} t={t} seed={4} held={held} />);
    if (id === "S06") extras.push(<DeckChair key="chair" p={[-0.75, 0, 0.35]} />);
  }
  // ---- Spender
  {
    const p = P_SPEND;
    const old = id === "S09" || id === "S10" || id === "S11" || id === "S12" || id === "S13" || id === "S14";
    let pose: Pose = { ...stand(p[0], p[2], camYaw(p) * 0.5 - 0.35, 1), armL: 0.12, armR: 0.12 };
    let emo: Emotion = "sly";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    const bagHeld = t < T.S07 || id === "S23";
    if (bagHeld) held = { side: "R", node: <Bag p={[0, 0.0, 0]} sc={0.8} /> };
    if (id === "S01" || id === "S23") pose = { ...pose, armR: 0.5, outR: 0.15 };
    if (id === "S07") {
      const d = ss(0, 0.6, tau);
      pose = { ...pose, armR: lerp(0.5, 0.1, d), headPitch: 0.15 * d };
      extras.push(<Bag key="bag" p={[P_SPEND[0] + 0.55, 0, P_SPEND[2] + 0.1]} />);
      emo = "happy";
    } else if (t > T.S07 && t < E.S22 + 0.1) extras.push(<Bag key="bag" p={[P_SPEND[0] + 0.55, 0, P_SPEND[2] + 0.1]} />);
    if (id === "S08") {
      pose = { ...pose, armL: 1.5, outL: 0.25 };
      emo = "happy";
    }
    if (old) {
      pose = { ...pose, armL: id === "S09" ? 1.5 + 0.3 * Math.sin(tau * 12) : 0.12, ant: -0.4, headPitch: 0.1 };
      emo = id === "S11" ? "sly" : "happy";
    }
    if (id === "S19") {
      pose = { ...pose, ant: 1, headPitch: -0.12, headYaw: -0.5 * ss(0.3, 0.8, tau) };
      emo = "shock";
    }
    if (id === "S18") emo = "sad";
    if (id === "S15" || id === "S16" || id === "S17") emo = "curious";
    if (id === "S22") emo = "sad";
    actors.push(<Act key="spe" look={old ? GREY : SPENDER} pose={pose} emotion={emo} s={1} t={t} seed={2} held={held} />);
  }
  // ---- Penny delivers the coin bundles (S04 Saver's jar, S08 Spender's jar)
  if (id === "S04" || id === "S08") {
    const sv = id === "S04";
    const px = sv ? XS - 0.8 : XP + 0.8;
    const dir = sv ? 1 : -1;
    const pp: V3 = [px, 0, 0.35];
    const dt = sv ? 0.45 : 0.3;
    const k = Math.floor(tau / dt);
    const u = clamp((tau - k * dt) / 0.35);
    const pose: Pose = { ...stand(pp[0], pp[2], dir * 0.9 + 0.2 * (sv ? 1 : -1), 0.72), armR: sv ? 1.8 * ss(0, 0.5, u) : 0.2, armL: sv ? 0.2 : 1.8 * ss(0, 0.5, u), outL: sv ? 0.1 : 0.4, outR: sv ? 0.4 : 0.1 };
    actors.push(<Act key="pen" look={PENNY} pose={pose} emotion="joy" s={0.72} t={t} seed={1} />);
    if (u > 0.15 && u < 1) {
      const f = ss(0.15, 1, u);
      const from: V3 = [px + dir * 0.2, 1.0, pp[2]];
      const to: V3 = [sv ? XS : XP, POD_H + 0.6, 0];
      extras.push(<CoinStack key="bundle" p={[lerp(from[0], to[0], f), lerp(from[1], to[1], f) + 0.5 * Math.sin(Math.PI * f), lerp(from[2], to[2], f)]} n={8} s={1.7} />);
    }
  }
  if (id === "S03" && tau > 0.5 && tau < 0.95) {
    const f = ss(0.5, 0.95, tau);
    const from: V3 = [P_SAVER[0] - 0.4, 1.05, 0.2];
    extras.push(<CoinStack key="bundle" p={[lerp(from[0], XS, f), lerp(from[1], POD_H + 0.6, f) + 0.3 * Math.sin(Math.PI * f), lerp(from[2], 0, f)]} n={8} s={1.7} />);
  }
  // ---- coin stacks of deposits (S10-S19): 3 for the saver, 9 for the spender
  const showStacks = t >= T.S10 && t < E.S19;
  if (showStacks) {
    for (let k = 0; k < 3; k++) extras.push(<CoinStack key={`ss${k}`} p={[XS - 0.45 + k * 0.45, 0, 0.75]} n={34} s={1.6} seed={k} />);
    for (let k = 0; k < 9; k++) extras.push(<CoinStack key={`sp${k}`} p={[XP - 0.5 + (k % 3) * 0.5, 0, 0.55 + 0.4 * Math.floor(k / 3)]} n={34} s={1.6} seed={k + 5} />);
  }
  // ---- the "PUT IN" tags (S10, S11)
  const tags: React.ReactNode[] = [];
  if (id === "S10") tags.push(<Label key="tg" p={[XS, 1.85, 0.5]} text={["PUT IN", "$24,000"]} w={1.4} h={0.62} bg="#0f3a22" fg="#9fffc8" glow={0.1} />);
  if (id === "S11") tags.push(<Label key="tg" p={[XP, 1.85, 0.5]} text={["PUT IN", "$72,000"]} w={1.4} h={0.62} bg="#3a1414" fg="#ffb0a0" glow={0.1} />);
  // ---- the board between them (S12-S14 drop/draw, S20-S21 wobble, stamp)
  const boardOn = id === "S12" || id === "S13" || id === "S14" || id === "S20" || id === "S21";
  const stepVals = Array.from({ length: 12 }, (_, i) => 0.1 + 0.8 * ((Math.pow(1.07, i * 3) - 1) / (Math.pow(1.07, 33) - 1)));
  const drop = id === "S12" ? 3.2 * (1 - ss(0, 0.55, tau)) * (1 - ss(0, 0.55, tau)) : 0;
  const draw = id === "S12" ? 0 : id === "S13" ? ss(0.05, 1.05, tau) : 1;
  const wob = id === "S20" ? 1.4 : 0;
  // ---- the TIME crane (S22): the clock lifts the jar
  const crane = id === "S22";
  const lift = crane ? 0.9 * ss(0.1, 1.2, tau) : 0;
  return (
    <>
      <Ground grass="#6ccf55" />
      <Fence />
      <Label p={[0, 1.25, -2.72]} text={["HYPOTHETICAL: $200/MO · 7%/YR STEADY"]} w={2.4} h={0.36} bg="#fff4c8" fg="#16121c" />
      <Plot x={XS} flowers={1} />
      <Plot x={XP} flowers={2} />
      <Pedestal p={[XS, 0, 0]} h={POD_H} r={0.3} color="#a69bcf" ring="#1a8f80" />
      <Pedestal p={[XP, 0, 0]} h={POD_H} r={0.3} color="#a69bcf" ring="#b84038" />
      <Column p={[XS, POD_H, 0]} fill={fillOf(sV)} glow={growGlow} lift={lift} />
      <Column p={[XP, POD_H, 0]} fill={fillOf(pV)} glow={growGlow} />
      {/* age signs on posts over each plot */}
      {[XS, XP].map((x) => (
        <mesh key={x} geometry={rbox(0.1, 1.9, 0.1, 0.02)} material={plastic("#7a4a2a")} position={[x, 0.95, -1.3]} castShadow />
      ))}
      <Sign p={[XS, 1.95, -1.25]} text={saverAge(t, id, tau)} w={1.5} h={0.42} color="#7dffb0" bg="#0f3a22" />
      <Sign p={[XP, 1.95, -1.25]} text={spenderAge(t, id, tau)} w={1.5} h={0.42} color="#ff8a7a" bg="#3a1414" />
      {boardOn ? (
        <group position={[0, drop, 0]}>
          <ChartBoard p={BOARD} w={1.5} h={1.0} title="EXAMPLE 7%/YR · STEADY" values={stepVals} color="#5ff08a" draw={draw} wobble={wob} seed={Math.floor(t * 7)} board="#16301e" />
          <Label p={[BOARD[0], 0.55, BOARD[2] + 0.06]} text={["HYPOTHETICAL"]} w={1.0} h={0.16} bg="#fff4c8" fg="#16121c" />
          {id === "S21" ? <Stamp p={[BOARD[0], 1.45, BOARD[2] + 0.1]} text="NOT GUARANTEED" u={clamp((tau - 0.25) / 0.35)} w={1.3} /> : null}
        </group>
      ) : null}
      {crane ? (
        <group>
          <mesh geometry={rbox(0.14, 3.2, 0.14, 0.02)} material={plastic("#3a3f58")} position={[XS - 0.9, 1.6, -0.2]} />
          <mesh geometry={rbox(1.15, 0.12, 0.12, 0.02)} material={plastic("#3a3f58")} position={[XS - 0.35, 3.05, -0.2]} />
          <mesh geometry={rbox(0.04, 0.6, 0.04, 0.01)} material={plastic("#e8d8b8")} position={[XS, 2.85 - 0.1, -0.2]} />
          <BigClock p={[XS - 0.9, 2.55, -0.05]} s={0.9} hour={tau * 2} min={tau * 14} />
          <HoloTag p={[XS - 0.9, 3.55, 0]} text="TIME" t={t} w={0.9} />
        </group>
      ) : null}
      {id === "S17" ? <HoloTag p={[XS + 0.9, 1.9, 1.0]} text={`≈ ${usd(Math.round(SAVER_FIN / 100) * 100, false)}`} t={t} w={1.3} /> : null}
      {id === "S18" ? <HoloTag p={[XP - 0.9, 1.9, 1.0]} text={`≈ ${usd(Math.round(SPEND_FIN / 100) * 100, false)}`} t={t} w={1.3} /> : null}
      {tags}
      {extras}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const counter = (t: number, shot: FinShot, tau: number): CounterState => {
  const id = shot.id;
  const tease = id === "S02";
  const sV = tease ? 0 : saverV(t, id, tau);
  const pV = tease ? 0 : spenderV(t, id, tau);
  if (tease) return { lines: [{ text: "SAVER $ · · · ·", color: GREEN, size: 60 }, { text: "SPENDER $ · · · ·", color: RED, size: 46 }], accent: "#9fffc8" };
  const approx = id === "S05" || (t >= T.S06 && t < T.S15) ? "" : "";
  const big = id === "S17" ? usd(rnd(sV), false) : usd(rnd(sV), false);
  const lines = [
    { text: `SAVER ${approx}${id === "S05" && tau > 0.6 ? "≈ " : ""}${big}`, color: GREEN, size: 62 },
    { text: `SPENDER ${usd(rnd(pV), false)}`, color: RED, size: 50 },
  ];
  const popAt = id === "S04" ? clamp((tau % 0.45) / 0.2) : id === "S08" ? clamp((tau % 0.3) / 0.15) : id === "S17" ? clamp((tau - 0.4) / 0.3) : id === "S18" ? clamp((tau - 0.4) / 0.3) : 0;
  return { lines, pop: popAt, accent: "#9fffc8" };
};

export const TEN_SPEC: FinSpec = {
  slug: "ten-beats-thirty",
  shots: TEN_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "EXAMPLE 7%/YR",
  bg: "#8fd0ff",
};
export const _unused = { pop, SAVER_35 };

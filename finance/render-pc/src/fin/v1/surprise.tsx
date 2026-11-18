// FORMAT v1 story: surprise-bill. "Spender's car just broke, and this bill will follow him for two years."
// Want: Spender wants his car fixed. Trouble: $1,000, no savings: a card at 22 %, $50 a month (stated example). Open loop
// (~45 %): "And the worst part is still coming..." over a sealed FINAL TOTAL envelope. Twist (~70 %): 26 months, plus $257
// of interest; Saver pays the same bill from his emergency fund. Fed SHED 2025: 63 % could cover $400 with cash (or its
// equivalent). Ends on "Could you?" and loops to frame 0 (the bonnet bang).
import React from "react";
import { Jar } from "../../library/props";
import { LENDER, SAVER, SPENDER } from "../../library/characters";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import type { Look } from "../../blocky/Blocky";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/surprise_bill_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { BigBlock, ChartBoard, CoinStack, FlipCalendar, Ground, Label, PAL, Pedestal, Stamp, TollBooth } from "../props";
import { FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import { Car, Smoke } from "../f2kit";
import { actorBoxes, creep, Debris, HookText, shotsOf, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
/** story beat of a shot id: the shots added after the first plan map onto the beat they extend (S04 = reading the bill) */
const SEQ: Record<string, number> = { S04: 3.5, S19: 4, S20: 5, S21: 9, S22: 16, S23: 16 };
const seq = (id: string) => SEQ[id] ?? idx(id);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z; a sunny roadside)
const CAR: V3 = [0.2, 0, -0.7];
const CAR_YAW = 0.55;
const P_SP: V3 = [1.95, 0, 0.95];
const BOOTH: V3 = [3.7, 0, -1.3];
const P_LD: V3 = [2.8, 0, -0.05];
const P_SPB: V3 = [5.2, 0, -0.15]; // Spender at the booth slot (clear of the booth's rotated footprint)
const SLOT: V3 = [BOOTH[0] + 0.75 * Math.cos(-0.55) + 0.35 * Math.sin(-0.55), 1.05, BOOTH[2] - 0.75 * Math.sin(-0.55) + 0.35 * Math.cos(-0.55)];
const ENV: V3 = [2.35, 0, 0.35]; // the sealed FINAL TOTAL envelope on a pedestal
const CAL: V3 = [-0.9, 2.05, -2.6];
const P_SV: V3 = [-2.15, 0, 0.75];
const CAR2: V3 = [-3.45, 0, -1.6];
const JAR_P: V3 = [-2.9, 0, 0.2];
const BOARD: V3 = [0.9, 0, -3.25];
const rot = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const BONNET: V3 = [CAR[0] + rot([0, 0, 1.0], CAR_YAW)[0], 1.05, CAR[2] + rot([0, 0, 1.0], CAR_YAW)[2]];
const SCREEN: V3 = [CAR[0] + rot([0, 0, 0.5], CAR_YAW)[0], 1.0, CAR[2] + rot([0, 0, 0.5], CAR_YAW)[2]];

// key times
const tBang = 0.1; // the bonnet bang (frame 0 is just after: smoke, bill mid-air)
const tStick = 0.75;
const tTwo = W(1, "two");
const tSwipe = T("S05") + 0.3;
const tCoin = T("S06") + 0.15;
const tEnv = W(5, "plus");
const tPaid = T("S15") + 0.2;
const tPoint = T("S17") + 0.05;
/** the month the card route shows */
const monthAt = (t: number, i: number) => (i <= 6 ? 1 : i === 7 ? 6 : i === 8 || i === 9 ? 12 : i === 10 ? Math.round(12 + 14 * ss(T("S10"), T("S11") - 0.1, t)) : 26);

// ------------------------------------------------------------------ the flying bill (frame 0 already mid-air), stuck on the windscreen after
const billAt = (t: number): V3 => {
  const u = clamp((t + 0.15) / (tStick + 0.15));
  if (u >= 1) return [SCREEN[0], SCREEN[1] + 0.05, SCREEN[2] + 0.02];
  return [lerp(BONNET[0], SCREEN[0], u), lerp(BONNET[1], SCREEN[1] + 0.05, u) + 1.1 * Math.sin(Math.PI * u), lerp(BONNET[2], SCREEN[2] + 0.02, u)];
};

// ------------------------------------------------------------------ actors (shared by the scene and the clip check)
type Actor = { name: string; look: Look; pose: Pose; emo: Emotion; s: number; seed: number; held?: { side: "L" | "R"; node: React.ReactNode } };
const actorsAt = (i: number, t: number): Actor[] => {
  const out: Actor[] = [];
  const spAtCar = i <= 4 || i === 18;
  const spAtBooth = i >= 5 && i <= 12;
  if (spAtCar || spAtBooth) {
    const p = spAtCar ? P_SP : P_SPB;
    let pose: Pose = spAtCar
      ? { ...stand(p[0], p[2], yawTo(p, CAR) * 0.35 + yawTo(p, [1.0, 0, 5]) * 0.65, SC), armL: 0.3, armR: 0.3 }
      : { ...stand(p[0], p[2], yawTo(p, SLOT) * 0.45 + yawTo(p, [3.0, 0, 5]) * 0.55, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "curious";
    let held: Actor["held"];
    if (i === 1 || i === 18) {
      const fl = i === 1 ? ss(0, 0.2, t) : 0;
      pose = { ...pose, armL: lerp(0.5, 2.6, fl), armR: lerp(0.5, 2.6, fl), outL: 0.35 * fl, outR: 0.35 * fl, pitch: -0.14 * fl, headYaw: -0.25 * fl }; // flinch: hands up beside the head, away from the car
      emo = i === 1 ? "shock" : "curious";
      if (i === 18) pose = { ...pose, headPitch: 0.1 * Math.sin(t * 9) };
    }
    if (i === 2) { pose = { ...pose, armR: 1.2, outR: 0.4 }; emo = "shock"; }
    if (i === 3) { const s = ss(tTwo - 0.1, tTwo + 0.1, t); pose = { ...pose, armL: lerp(0.4, 2.3, s), armR: lerp(0.4, 2.3, s), outL: 0.8 * s, outR: 0.8 * s, ant: s }; emo = "shock"; }
    if (i === 4) { pose = { ...pose, armR: 1.3, outR: -0.05, headPitch: 0.25 }; emo = "sad"; }
    if (i === 5) { emo = "curious"; }
    if (i === 6) { pose = { ...pose, armR: lerp(1.0, 1.35, ss(tCoin - 0.2, tCoin, t)), outR: -0.05 }; emo = "curious"; }
    if (i === 7 || i === 8) { pose = { ...pose, armR: 1.25, headPitch: 0.15 }; emo = "sad"; }
    if (i === 9 || i === 10) { emo = "curious"; pose = { ...pose, headYaw: 0.3 }; }
    if (i === 11) { const s = ss(tEnv - 0.05, tEnv + 0.12, t); pose = { ...pose, armL: lerp(0.4, 2.2, s), armR: lerp(0.4, 2.2, s), outL: 0.8 * s, outR: 0.8 * s, ant: s }; emo = "shock"; }
    if (i === 12) { pose = { ...pose, armL: 0.05, armR: 0.05, headPitch: 0.35, ant: -1, pitch: 0.12 }; emo = "sad"; }
    out.push({ name: "Spender", look: SPENDER, pose, emo, s: SC, seed: 2, held });
  }
  if (i >= 5 && i <= 11) {
    let pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, [2.2, 0, 3]), 1.1), armL: 0.3, armR: 0.3 };
    if (i === 5) pose = { ...pose, armL: 1.3 + 0.2 * Math.sin(Math.min(1, (t - tSwipe) / 0.3) * Math.PI), outL: 0.2 };
    out.push({ name: "Lender", look: LENDER, pose, emo: i === 11 ? "sly" : "happy", s: 1.1, seed: 5 });
  }
  if (i >= 13 && i <= 17) {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, JAR_P) * 0.3 + yawTo(P_SV, [-1.2, 0, 5]) * 0.7, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 13) { pose = { ...pose, headYaw: -0.4 }; emo = "curious"; }
    if (i === 14) { pose = { ...pose, armL: 1.25 - 0.25 * Math.sin(t * 7), outL: 0.15 }; }
    if (i === 15) { pose = { ...pose, armL: 0.9, armR: 0.9, outL: 0.35 + 0.15 * Math.sin(t * 10), outR: 0.35 }; emo = "joy"; }
    if (i === 16) { pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, BOARD) * 0.5 + yawTo(P_SV, [0, 0, 5]) * 0.5, SC), armR: 1.6, outR: -0.1 }; emo = "happy"; }
    if (i === 17) { const s = ss(tPoint - 0.1, tPoint + 0.1, t); pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, [P_SV[0] + 0.3, 0, 5]), SC), armR: lerp(0.4, 1.55, s), outR: -0.05 }; emo = "sly"; }
    out.push({ name: "Saver", look: SAVER, pose, emo, s: SC, seed: 4 });
  }
  return out;
};

// ------------------------------------------------------------------ lenses
const face = (p: V3): V3 => [p[0], FACE - 0.05, p[2]];
const hook = creep([(CAR[0] + P_SP[0]) / 2 + 0.1, 0.95, (CAR[2] + P_SP[2]) / 2], [2.4, 1.0, 4.3], { fov: 56, face: 0.5, shake: shakeAt([tBang], 0.07) });
const LENS = {
  S01: hook,
  S02: creep([SCREEN[0], 1.05, SCREEN[2]], [SCREEN[0] + 0.6, 1.35, SCREEN[2] + 1.6], { fov: 44, face: 0.5 }),
  S03: { ...creep(face(P_SP), [P_SP[0] + 0.3, 1.32, P_SP[2] + 2.0], { face: 0.62, roll: [0, -3] }), fovAt: slam(tTwo, 50, 40, 0.14), shake: shakeAt([tTwo], 0.05) },
  S04: creep([(SCREEN[0] + P_SP[0]) / 2, 1.15, (SCREEN[2] + P_SP[2]) / 2], [P_SP[0] + 0.9, 1.55, P_SP[2] + 1.9], { fov: 50, face: 0.5 }),
  S19: creep([P_SP[0], 1.0, P_SP[2]], [P_SP[0] - 0.6, 1.3, P_SP[2] + 2.4], { face: 0.55 }),
  S20: creep([BOOTH[0], 2.35, BOOTH[2]], [BOOTH[0] + 0.4, 2.05, BOOTH[2] + 2.4], { fov: 46, face: 0.5, shake: shakeAt([T("S20") + 0.05], 0.03) }),
  S21: creep([ENV[0], 1.1, ENV[2]], [ENV[0] - 0.15, 1.25, ENV[2] + 1.1], { fov: 44, face: 0.5, mood: "whisper", push: 0.1, shake: (t: number) => 0.006 + 0.004 * Math.abs(Math.sin(t * 31)) }),
  S22: creep([BOARD[0] + 0.6, 1.35, BOARD[2]], [BOARD[0] + 0.9, 1.45, BOARD[2] + 1.7], { fov: 46, face: 0.5 }),
  S23: creep([BOARD[0], 1.3, BOARD[2]], [BOARD[0] - 0.6, 1.7, BOARD[2] + 3.8], { fov: 54, face: 0.5 }),
  S05: creep([(P_LD[0] + P_SPB[0]) / 2, 1.2, -0.6], [3.9, 1.6, 3.6], { fov: 56, face: 0.5, shake: shakeAt([tSwipe + 0.15], 0.02) }),
  S06: creep([SLOT[0], 1.1, SLOT[2]], [SLOT[0] + 0.5, 1.35, SLOT[2] + 1.2], { fov: 44, face: 0.5 }),
  S07: creep([CAL[0], CAL[1] - 0.1, CAL[2]], [CAL[0] + 0.3, 2.0, CAL[2] + 2.1], { fov: 46, face: 0.5 }),
  S08: creep([P_SPB[0], 1.3, P_SPB[2]], [P_SPB[0] - 1.0, 1.6, P_SPB[2] + 3.0], { fov: 54, face: 0.55 }),
  S09: creep([ENV[0], 1.15, ENV[2]], [ENV[0] - 0.4, 1.35, ENV[2] + 1.9], { fov: 46, face: 0.5, mood: "whisper", push: 0.12, shake: (t: number) => 0.004 + 0.003 * Math.abs(Math.sin(t * 29)) }),
  S10: creep([CAL[0], CAL[1] - 0.1, CAL[2]], [CAL[0] - 0.3, 2.0, CAL[2] + 2.1], { fov: 46, face: 0.5, mood: "whisper" }),
  S11: creep([ENV[0], 1.3, ENV[2]], [ENV[0] - 0.9, 1.5, ENV[2] + 2.6], { fov: 50, face: 0.5, mood: "whisper", fovAt: slam(tEnv, 56, 48, 0.1), shake: shakeAt([tEnv], 0.07) }),
  S12: { ...creep(face(P_SPB), [P_SPB[0] - 0.4, 1.3, P_SPB[2] + 2.0], { face: 0.62, mood: "whisper", roll: [0, 3] }), fovAt: slam(T("S12") + 0.05, 50, 42, 0.14), shake: shakeAt([T("S12") + 0.05], 0.04) },
  S13: creep([(P_SV[0] + CAR2[0]) / 2, 1.0, (P_SV[2] + CAR2[2]) / 2], [-1.2, 1.5, 3.6], { fov: 56, face: 0.5, mood: "ending" }),
  S14: creep([JAR_P[0], 1.1, JAR_P[2]], [JAR_P[0] + 0.4, 1.45, JAR_P[2] + 1.6], { fov: 46, face: 0.5, mood: "ending" }),
  S15: creep([P_SV[0] - 0.4, 1.05, P_SV[2] - 0.3], [P_SV[0] + 0.5, 1.45, P_SV[2] + 3.0], { fov: 54, face: 0.55, mood: "ending", shake: shakeAt([tPaid], 0.04) }),
  S16: creep([BOARD[0], 1.55, BOARD[2]], [BOARD[0] - 0.3, 1.7, BOARD[2] + 3.0], { fov: 52, face: 0.5 }),
  S17: { ...creep(face(P_SV), [P_SV[0] + 0.25, 1.32, P_SV[2] + 1.9], { face: 0.62 }), fovAt: slam(tPoint, 50, 40, 0.14), shake: shakeAt([tPoint], 0.04) },
  S18: hook,
};
export const SURPRISE_V1_SHOTS = shotsOf(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = seq(shot.id);
  void tau;
  const actors = actorsAt(i, t);
  const smoke = i <= 4 || i === 18 ? 1 : i <= 12 ? 0.4 : 0;
  const bang = i === 1 ? clamp((t - tBang + 0.1) / 0.5) : 0;
  const shakeCar = i === 18 ? 0.02 * Math.sin(t * 40) * ss(T("S18"), END, t) : 0;
  const month = monthAt(t, i);
  const envOpen = i >= 11 ? clamp((t - tEnv) / 0.25) + (i > 11 ? 1 : 0) : 0;
  const coinIn = i === 6 ? clamp((t - tCoin) / 0.4) : 0;
  const bar = shot.id === "S22" ? 0.63 * ss(shot.a + 0.05, shot.a + 0.7, t) : shot.id === "S16" ? 0.15 : 0.63;
  const jarFill = i === 14 ? 1 - 0.5 * ss(T("S14") + 0.1, T("S14") + 0.9, t) : i >= 15 ? 0.5 : 1;
  const billP = billAt(i === 1 ? t : 9);
  return (
    <>
      <Ground road roadW={3.2} />
      {/* Spender's car: the bonnet bang (frame 0), smoke, the bill stuck on the windscreen */}
      <group position={[shakeCar, 0, 0]}><Car p={CAR} yaw={CAR_YAW} color="#2a7de1" smoke={smoke} t={t} /></group>
      {i === 1 ? <Smoke p={BONNET} t={t * 2} k={1.6 - bang * 0.6} /> : null}
      {i === 1 ? <Debris p={BONNET} t={t} t0={tBang - 0.1} n={10} c={["#3a3f58", "#c8c8d4", "#ffd23a"]} y0={0} size={0.07} /> : null}
      {i <= 4 || i === 18 ? (
        <group position={billP} rotation={[0, CAR_YAW, i === 1 && t < tStick ? t * 9 : 0.05]}>
          <Label p={[0, 0, 0]} text={["$1,000", "DUE NOW"]} w={0.55} h={0.36} bg="#fff4c8" fg={PAL.debt} border={PAL.debt} />
        </group>
      ) : null}
      {i === 4 ? Array.from({ length: 1 }, (_, k) => <mesh key={k} position={[P_SP[0] - 0.55 + 0.4 * ((t * 0.7) % 1), 1.3 + 0.5 * ((t * 0.7) % 1), P_SP[2] + 0.35]}><boxGeometry args={[0.06, 0.03, 0.06]} /><meshStandardMaterial color="#c8c0b0" /></mesh>) : null}
      {i === 4 ? <Label p={[P_SP[0] - 0.75, 1.85, P_SP[2] + 0.1]} text={["NO SAVINGS"]} w={0.7} h={0.2} bg={PAL.night} fg="#ffd23a" /> : null}
      {/* the card booth, the slot, the 22 % sign */}
      <TollBooth p={BOOTH} yaw={-0.55} display={i >= 5 && i <= 12 ? [`MONTH ${month}`, "$50/MO"] : ["CARD", "22%"]} />
      {i >= 5 && i <= 12 ? <Label p={[BOOTH[0], 2.45 + (i === 5 ? 0.5 * (1 - easeOut(clamp((t - tSwipe) / 0.2))) : 0), BOOTH[2]]} r={[0, -0.55, 0]} text={["CARD 22% APR"]} w={1.1} h={0.24} bg={PAL.debt} fg="#fff4c8" /> : null}
      {i === 6 ? <CoinStack p={[SLOT[0] + 0.25 * (1 - coinIn), SLOT[1] + 0.25 * (1 - coinIn), SLOT[2] + 0.25 * (1 - coinIn)]} n={1} s={1.6} /> : null}
      {/* the rain cloud over the booth (S08) */}
      {i === 8 ? (
        <group position={[P_SPB[0], 2.35, P_SPB[2]]}>
          {[-0.25, 0, 0.25].map((x, k) => <mesh key={k} position={[x, 0.05 * k, 0]}><icosahedronGeometry args={[0.22, 1]} /><meshStandardMaterial color="#8a8fa8" flatShading /></mesh>)}
          {Array.from({ length: 8 }, (_, k) => <mesh key={`r${k}`} position={[-0.35 + 0.1 * k, -0.25 - ((t * 2 + hash(k)) % 1) * 0.5, 0.05]}><boxGeometry args={[0.012, 0.1, 0.012]} /><meshStandardMaterial color="#7fb8ff" /></mesh>)}
        </group>
      ) : null}
      {/* the FINAL TOTAL envelope: sealed and trembling (open loop), then it bursts (twist) */}
      <Pedestal p={ENV} h={0.85} r={0.3} ring="#c01818" />
      {i >= 5 && i <= 12 ? (
        <group position={[ENV[0], 1.05 + (i === 9 ? 0.02 * Math.sin(t * 40) : 0), ENV[2] + 0.05]} rotation={[0, -0.2, i === 9 ? 0.04 * Math.sin(t * 33) : 0]}>
          <BigBlock p={[0, -0.15, 0]} size={[0.55, 0.36, 0.04]} color={envOpen > 0 ? "#f0d0c0" : "#c01818"} text={envOpen > 0 ? "" : "FINAL TOTAL"} />
          {envOpen > 0 ? <Label p={[0, 0.1 + 0.35 * easeOut(clamp(envOpen)), 0.04]} text={["+$257", "INTEREST"]} w={0.62} h={0.36} bg="#fff4c8" fg={PAL.debt} border={PAL.debt} /> : null}
        </group>
      ) : null}
      {/* the month calendar on a post */}
      <mesh position={[CAL[0], 0.7, CAL[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <FlipCalendar p={CAL} title="MONTH" value={String(month)} prev={i === 10 && month > 12 ? String(month - 1) : undefined} flip={i === 10 ? (t * 9) % 1 : 1} sub="STILL PAYING" color={month >= 26 ? PAL.debt : undefined} />
      {/* Saver: same bill, the emergency fund, PAID */}
      <Car p={CAR2} yaw={-0.4} color="#2fb8a8" smoke={i === 13 || i === 14 ? 1 : 0} t={t} />
      {i === 13 || i === 14 ? <Label p={[CAR2[0] + 0.3, 1.65, CAR2[2] + 0.4]} text={["$1,000", "DUE NOW"]} w={0.55} h={0.36} bg="#fff4c8" fg={PAL.debt} border={PAL.debt} /> : null}
      <Pedestal p={JAR_P} h={0.72} r={0.26} ring={PAL.cash} />
      <group position={[JAR_P[0], 0.72, JAR_P[2]]} scale={1.5}>
        <Jar label={false}>
          <mesh position={[0, (0.34 * jarFill) / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * jarFill), 28]} />
            <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#c88a10" emissiveIntensity={0.25} />
          </mesh>
        </Jar>
      </group>
      <Label p={[JAR_P[0], 0.42, JAR_P[2] + 0.27]} text={["EMERGENCY", "FUND"]} w={0.46} h={0.24} bg={PAL.cash} fg="#fff4c8" />
      {i === 15 ? <Stamp p={[P_SV[0] + 0.85, 1.25, P_SV[2] + 0.5]} text="PAID: $1,000" u={clamp((t - tPaid + 0.1) / 0.25)} w={0.7} color={PAL.cash} /> : null}
      {/* the Fed survey board */}
      <ChartBoard p={BOARD} title="FED SURVEY 2025: A $400 SURPRISE" values={[]} w={2.0} h={1.3} />
      <Label p={[BOARD[0] - 0.45, 1.55, BOARD[2] + 0.06]} text={["63% COULD", "PAY IN CASH"]} w={0.95} h={0.5} bg="#16301e" fg="#7ee8a0" />
      <BigBlock p={[BOARD[0] + 0.6, 0.95, BOARD[2] + 0.08]} size={[0.4, Math.max(0.02, 1.0 * bar), 0.06]} color={PAL.cash} text={bar > 0.3 ? "63%" : ""} />
      {shot.id === "S23" ? <Label p={[BOARD[0], 0.55, BOARD[2] + 0.3]} text={["COULD YOU?"]} w={1.4} h={0.32} bg="#ffd23a" fg={PAL.ink} /> : null}
      {actors.map((a) => <Act key={a.name} look={a.look} pose={a.pose} emotion={a.emo} s={a.s} t={t} seed={a.seed} held={a.held} />)}
    </>
  );
};

// ------------------------------------------------------------------ QA
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
/** a rotated car (1.5 x 2.6 m body, 1.15 m tall) as one oriented box */
const carBoxes = (name: string, p: V3, yaw: number): Box[] => [{ name, c: [p[0], 0.58, p[2]], h: [0.76, 0.58, 1.32], yaw }];
export const SURPRISE_V1_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = SURPRISE_V1_SHOTS.find((s) => t >= s.a && t < s.b) ?? SURPRISE_V1_SHOTS[SURPRISE_V1_SHOTS.length - 1];
  const i = seq(sh.id);
  const actors = actorsAt(i, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const props: Box[] = [
    ...carBoxes("car", CAR, CAR_YAW), ...carBoxes("car2", CAR2, -0.4),
    box("boothHut", [BOOTH[0], 0.95, BOOTH[2]], [0.73, 0.95, 0.72]), box("boothSlot", [SLOT[0], 0.6, SLOT[2]], [0.2, 0.6, 0.2]), // the roof (y 1.9-2.15) is above every head box("envPedestal", [ENV[0], 0.45, ENV[2]], [0.32, 0.45, 0.32]),
    box("jarPedestal", [JAR_P[0], 0.5, JAR_P[2]], [0.28, 0.5, 0.28]), box("board", [BOARD[0], 1.2, BOARD[2]], [1.05, 1.2, 0.1]),
    box("calPost", [CAL[0], 1.3, CAL[2]], [0.68, 1.3, 0.1]),
  ];
  if (i <= 4 || i === 18) props.push(box("bill", billAt(i === 1 ? t : 9), [0.3, 0.2, 0.1]));
  if (i >= 5 && i <= 12) props.push(box("envelope", [ENV[0], 1.15, ENV[2] + 0.05], [0.32, 0.4, 0.06]));
  if (i === 15) props.push(box("paidStamp", [P_SV[0] + 0.85, 1.25, P_SV[2] + 0.5], [0.36, 0.11, 0.04]));
  if (i === 4) props.push(box("noSavings", [P_SP[0] - 0.75, 1.85, P_SP[2] + 0.1], [0.36, 0.11, 0.03]));
  return { actors, props };
};

const overlay = (t: number) => (
  <>
    <HookText text="A $1,000 BILL FOR 2 YEARS" t={t} until={lineEnd(1) + 0.25} />
    {t >= T("S18") ? <HookText text="A $1,000 BILL FOR 2 YEARS" t={t} until={99} /> : null}
    <WordCaption words={WORDS} t={t} />
  </>
);
export const SURPRISE_V1_SPEC: FinSpec = {
  slug: "surprise-bill",
  shots: SURPRISE_V1_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene,
  counter: () => null,
  tag: (t, s) => (seq(s.id) >= 5 && seq(s.id) <= 15 ? "EXAMPLE" : seq(s.id) === 16 || s.id === "S17" ? "FED SHED 2025" : null),
  bg: "#6aa6f2",
  overlay,
};
export const SURPRISE_V1_AUDIO: StoryAudio = {
  music: "tense",
  cues: [
    { t: 0, sfx: "boom", db: 0 }, { t: 0.02, sfx: "crash", db: -6 }, { t: 0.1, sfx: "gasp", db: -6 }, { t: tStick, sfx: "slide", db: -4 }, { t: tStick + 0.02, sfx: "paper", db: -6 },
    { t: tTwo - 0.02, sfx: "impact", db: -2 }, { t: T("S04") + 0.2, sfx: "squeak", db: -8 },
    { t: tSwipe, sfx: "beep", db: -6 }, { t: tSwipe + 0.1, sfx: "slide", db: -6 }, { t: tCoin + 0.3, sfx: "coins", db: -6 },
    { t: T("S07"), sfx: "tick", db: -6 }, { t: T("S08"), sfx: "rain", db: -8 }, { t: T("S08") + 0.1, sfx: "thunder", db: -10 },
    { t: T("S09"), sfx: "heartbeat", db: -4 }, { t: T("S09") + 0.1, sfx: "suspense", db: -8 },
    { t: T("S10"), sfx: "clock", db: -6 }, { t: tEnv - 0.02, sfx: "impact", db: 0 }, { t: tEnv + 0.02, sfx: "paper", db: -4 }, { t: T("S12") + 0.05, sfx: "fail", db: -4 },
    { t: T("S13"), sfx: "whoosh", db: -6 }, { t: T("S14") + 0.2, sfx: "coins", db: -4 }, { t: tPaid, sfx: "stamp", db: -2 }, { t: tPaid + 0.1, sfx: "success", db: -4 },
    { t: T("S16") + 0.1, sfx: "pop", db: -6 }, { t: tPoint, sfx: "impact", db: -6 },
    { t: END - 0.4, sfx: "rumble", db: -6 },
  ],
};

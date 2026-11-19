// FORMAT v1, style S2 RICH-VS-POOR (split screen): coffee-could-be. "Same five dollars a day. Spender buys a coffee. Saver
// saves it." TOP half = Spender's red cafe corner (a cup tower, a SPENT board); BOTTOM half = Saver's green vault (a jar,
// a SAVER board, a coin pile and a covered YEAR 30 board). The two boards race. Open loop (~44 %): "But wait till you see
// year thirty..." over the covered board. Twist (~72 %): the cloth flies off: about $186,000; Spender spent $54,750.
// Maths (sources.md): $1,825 a year as $152.08 at the start of each month, a made-up steady 7 % (FV of an annuity due):
// 1 yr = $1,825 put in; 10 yrs = $26,477; 30 yrs = $186,620 (VO "about 26,000", "about 186,000"); 30 x $1,825 = $54,750.
import React from "react";
import { SAVER, SPENDER } from "../../library/characters";
import { clamp, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import type { Look } from "../../blocky/Blocky";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/coffee_could_be_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { BigBlock, BigClock, CoinPile, Hall, Label, PAL } from "../props";
import { FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import type { Shot } from "../hooks";
import { actorBoxes, Coin3, creep, Debris, HookText, shotsOf, TallJar, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
/** story beat of a shot id: the shots added after the first plan map onto the beat they extend */
const SEQ: Record<string, number> = { S19: 2.5, S20: 3.5, S21: 4.5, S22: 5.5, S15: 6.5, S16: 7.5, S14: 8.5, S17: 11.5, S18: 13.5 };
const seq = (id: string) => SEQ[id] ?? idx(id);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const OX = 40; // Saver's vault sits 40 m along x from Spender's cafe
const P_SP: V3 = [0, 0, 0.25];
const COUNTER: V3 = [0.95, 0, -0.45]; // the cafe counter (coffee machine on top), Spender's left
const CUPS: V3 = [-0.95, 0, -0.35]; // the cup tower, Spender's right
const BOARD_SP: V3 = [0, 2.05, -1.25];
const P_SV: V3 = [OX, 0, 0.25];
const JAR: V3 = [OX - 0.8, 0, 0.5]; // the jar, at Saver's right hand (viewer's left)
const PILE: V3 = [OX + 0.85, 0, -0.75];
const B30: V3 = [OX + 0.85, 1.95, -1.05]; // the covered YEAR 30 board, above the pile
const BOARD_SV: V3 = [OX - 0.55, 2.05, -1.25];
const CLOCK: V3 = [OX - 0.15, 1.55, -0.6];
const fT = (dy = 0): V3 => [P_SP[0], FACE - 0.05 + dy, P_SP[2]];
const fB = (dy = 0): V3 => [P_SV[0], FACE - 0.05 + dy, P_SV[2]];
const off = (p: V3, d: V3): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];

// key times
const tSwap = 0.7; // frame 0: the faces change emotion
const tCoin = 0.35; // Saver's frame-0 coin lands in the jar
const tTag = W(2, "seven");
const tY1 = T("S04");
const tCups = T("S21");
const tSaved = W(3, "1825");
const tLoop = T("S06");
const tY10 = T("S07");
const tShrug = T("S08") + 0.1;
const tLaugh = T("S14") + 0.05;
const tReveal = T("S09") + 0.12;
const tBig = W(6, "186000");
const tTime = T("S12");
const tLoopShot = T("S18");

// years on the clock, and the two racing numbers
const yearsAt = (t: number) =>
  t < tY1 ? 0 : t < tY10 ? ss(tY1, tY1 + 0.6, t) : t < tReveal ? 1 + 9 * ss(tY10, tY10 + 0.6, t) : 10 + 20 * ss(tReveal, tBig, t);
const fv = (y: number) => { const i = 0.07 / 12, p = 1825 / 12, n = Math.round(y * 12); return n === 12 ? 1825 : p * ((1 + i) ** n - 1) / i * (1 + i); };
const money = (v: number) => "$" + Math.round(v).toLocaleString("en-US");
const savedText = (y: number) => (y < 0.01 ? "$5 A DAY" : Math.abs(y - 1) < 0.001 ? "$1,825" : Math.abs(y - 10) < 0.001 ? "≈ $26,000" : Math.abs(y - 30) < 0.001 ? "≈ $186,000" : money(Math.round(fv(y) / 50) * 50));
const spentText = (y: number) => (y < 0.01 ? "$5 A DAY" : money(Math.round((1825 * y) / 5) * 5));
const cupsAt = (y: number) => Math.round(365 * y);

// ------------------------------------------------------------------ actors (shared by the scene and the clip check)
type Actor = { name: string; look: Look; pose: Pose; emo: Emotion; s: number; seed: number; held?: { side: "L" | "R"; node: React.ReactNode } };
const Cup: React.FC = () => (
  <group>
    <mesh castShadow><cylinderGeometry args={[0.055, 0.045, 0.13, 20]} /><meshStandardMaterial color="#fffaf0" roughness={0.5} /></mesh>
    <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.057, 0.052, 0.04, 20]} /><meshStandardMaterial color="#d62a2a" roughness={0.5} /></mesh>
  </group>
);
const loopI = (i: number) => (i === 13.5 ? 1 : i);
const actorsAt = (iRaw: number, t: number): Actor[] => {
  const i = loopI(iRaw);
  const out: Actor[] = [];
  // ---- Spender (TOP)
  {
    let pose: Pose = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [0, 0, 5]), SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    let held: Actor["held"] = { side: "R", node: <Cup /> };
    if (i === 1) {
      const loop = iRaw === 13.5;
      pose = { ...pose, armR: 1.5, outR: -0.32, headPitch: -0.08 }; // the cup up at his mouth, mid-sip
      emo = loop ? "happy" : t < tSwap ? "joy" : "love"; // frame 0 joy -> love by 0.7 s
    }
    if (i === 2 || i === 2.5 || i === 3 || i === 3.5) { pose = { ...pose, armR: 1.2, outR: -0.15 }; emo = "joy"; }
    if (i === 4 || i === 4.5 || i === 5 || i === 5.5) { pose = { ...pose, armR: 1.1, outR: -0.1, headYaw: 0.3 }; emo = "happy"; }
    if (i === 6 || i === 6.5 || i === 7 || i === 7.5) { pose = { ...pose, headYaw: -0.45, armR: 0.8 }; emo = "curious"; } // peering over at Saver's side
    if (i === 8) { const u = ss(tShrug - 0.1, tShrug + 0.15, t); pose = { ...pose, armL: lerp(0.3, 0.9, u), armR: lerp(0.8, 0.9, u), outL: 0.6 * u, outR: 0.6 * u }; emo = "sly"; }
    if (i === 8.5) { pose = { ...pose, armR: 1.0, armL: 0.6, outL: 0.4, bob: -0.03 * Math.abs(Math.sin(t * 14)) }; emo = "joy"; }
    if (i === 9 || i === 10) { const s = ss(tReveal - 0.05, tReveal + 0.12, t); pose = { ...pose, armL: lerp(0.4, 2.2, s), armR: lerp(0.8, 2.2, s), outL: 0.8 * s, outR: 0.8 * s, ant: s }; emo = "shock"; held = s > 0.4 ? undefined : held; }
    if (i >= 11 && i <= 12) { pose = { ...pose, headPitch: 0.3, armL: 0.1, armR: 0.1, ant: -1 }; emo = "sad"; held = undefined; }
    if (i === 13) { pose = { ...pose, armR: 1.9, outR: 0.1 }; emo = "curious"; }
    out.push({ name: "Spender", look: SPENDER, pose, emo, s: SC, seed: 2, held });
  }
  // ---- Saver (BOTTOM)
  {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, [OX, 0, 5]), SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 1 || i === 2.5) { // the coin drop over the jar
      const t0 = iRaw === 13.5 ? T("S18") : i === 2.5 ? T("S19") : -0.2;
      const u = ss(t0, t0 + 0.4, t);
      pose = { ...pose, armR: lerp(1.25, 1.05, u), outR: 0.42, headYaw: 0.35 };
      emo = iRaw === 13.5 ? "happy" : i === 1 ? (t < tSwap ? "happy" : "joy") : "joy"; // frame 0 happy -> joy by 0.7 s
    }
    if (i === 3 || i === 3.5) { pose = { ...pose, armR: 0.9, outR: 0.4, headYaw: 0.3 }; emo = "sly"; }
    if (i === 5 || i === 5.5 || i === 7 || i === 7.5) { pose = { ...pose, armL: 1.5, outL: -0.1 }; emo = "happy"; }
    if (i === 6 || i === 6.5) { pose = { ...pose, headYaw: -0.4 }; emo = "curious"; }
    if (i === 9 || i === 10) { const s = ss(tReveal, tReveal + 0.2, t); pose = { ...pose, armL: lerp(0.3, 2.3, s), armR: lerp(0.3, 2.3, s), outL: 0.5 * s, outR: 0.5 * s }; emo = "joy"; }
    if (i === 11 || i === 11.5 || i === 12) { pose = { ...pose, armL: 1.6, outL: -0.15 }; emo = "sly"; }
    if (i === 13) { pose = { ...pose, armR: 1.55, outR: -0.2 }; emo = "sly"; } // points at the lens (you)
    out.push({ name: "Saver", look: SAVER, pose, emo, s: SC, seed: 4 });
  }
  return out;
};

// ------------------------------------------------------------------ lenses: TOP (plan) and BOTTOM (split)
const close = (f: V3, side = 1, o: Partial<Shot> = {}) => creep(f, off(f, [0.25 * side, 0.06, 1.0]), { fov: 48, face: 0.58, ...o });
const medium = (f: V3, side = 1, o: Partial<Shot> = {}) => creep([f[0] + 0.3 * side, 1.05, f[2] - 0.2], off(f, [0.7 * side, 0.3, 2.5]), { fov: 52, face: 0.55, ...o });
const wide = (c: V3, o: Partial<Shot> = {}) => creep(c, off(c, [0.3, 0.7, 3.9]), { fov: 56, face: 0.55, ...o });
const sh = shakeAt([tReveal, tBig], 0.05);
const cupsC: V3 = [CUPS[0], 0.75, CUPS[2]];
const TOP: Record<string, Shot> = {
  S01: creep(fT(-0.22), off(fT(-0.22), [0.22, 0.05, 1.3]), { fov: 50, face: 0.74 }),
  S02: medium(fT(), 1),
  S19: close(fT(), -1),
  S03: medium(fT(), -1),
  S20: close(fT(), 1),
  S04: wide([-0.3, 1.0, -0.2]),
  S21: { ...creep(cupsC, off(cupsC, [0.25, 0.25, 1.9]), { fov: 50, face: 0.5 }), shake: shakeAt([tCups + 0.1], 0.02) },
  S05: medium(fT(), 1),
  S22: close(fT(), -1),
  S06: { ...medium(fT(), -1), mood: "whisper", push: 0.12 },
  S15: { ...close(fT(), -1), mood: "whisper" },
  S07: wide([-0.3, 1.0, -0.2]),
  S16: medium(fT(), 1),
  S08: medium(fT(), -1),
  S14: { ...close(fT(), 1), fovAt: slam(tLaugh, 52, 46, 0.12) },
  S09: { ...close(fT(), -1), shake: sh },
  S10: { ...medium(fT(), 1), shake: sh },
  S11: medium(fT(), -1),
  S17: { ...creep(BOARD_SP, off(BOARD_SP, [0.2, -0.45, 2.3]), { fov: 50, face: 0.42 }) },
  S12: close(fT(), 1),
  S13: medium(fT(), 1),
  S18: creep(fT(-0.22), off(fT(-0.22), [0.22, 0.05, 1.3]), { fov: 50, face: 0.74 }),
};
const jarC: V3 = [JAR[0] + 0.05, 0.5, JAR[2]];
const coinLens = creep([(JAR[0] + P_SV[0]) / 2 + 0.05, FACE - 0.3, P_SV[2] + 0.2], [P_SV[0] + 0.25, FACE, P_SV[2] + 1.6], { fov: 54, face: 0.5 }); // frame 0: Saver's face + the coin over the jar
const b30C: V3 = [B30[0], B30[1] - 0.35, B30[2]];
const BOT: Record<string, Shot> = {
  S01: coinLens,
  S02: medium(fB(), -1),
  S19: creep(jarC, off(jarC, [-0.25, 0.35, 1.05]), { fov: 46, face: 0.5 }),
  S03: medium(fB(), -1),
  S20: creep([jarC[0], 0.75, jarC[2]], off(jarC, [-0.3, 0.45, 1.0]), { fov: 46, face: 0.5 }),
  S04: wide([OX, 1.1, -0.4]),
  S21: medium(fB(), 1),
  S05: creep(BOARD_SV, off(BOARD_SV, [0.15, -0.45, 2.3]), { fov: 50, face: 0.42 }),
  S22: { ...creep(BOARD_SV, off(BOARD_SV, [-0.1, -0.4, 2.0]), { fov: 48, face: 0.42 }), fovAt: slam(tSaved, 52, 46, 0.12) },
  S06: { ...creep(b30C, off(b30C, [-0.2, -0.2, 2.6]), { fov: 50, face: 0.45, mood: "whisper", push: 0.12 }), shake: (t: number) => 0.004 + 0.004 * Math.abs(Math.sin(t * 29)) },
  S15: { ...creep(b30C, off(b30C, [0.15, -0.3, 1.8]), { fov: 46, face: 0.45, mood: "whisper", push: 0.14 }), shake: (t: number) => 0.006 + 0.005 * Math.abs(Math.sin(t * 33)) },
  S07: wide([OX, 1.1, -0.4]),
  S16: creep(BOARD_SV, off(BOARD_SV, [0.15, -0.45, 2.3]), { fov: 50, face: 0.42 }),
  S08: medium(fB(), 1),
  S14: { ...creep(b30C, off(b30C, [-0.2, -0.2, 2.6]), { fov: 50, face: 0.45 }), shake: (t: number) => 0.006 + 0.004 * Math.abs(Math.sin(t * 31)) },
  S09: { ...wide([OX + 0.4, 1.2, -0.6]), shake: sh },
  S10: { ...creep(b30C, off(b30C, [-0.15, -0.35, 2.4]), { fov: 50, face: 0.45 }), fovAt: slam(tBig, 54, 46, 0.14), shake: sh },
  S11: medium(fB(), 1),
  S17: creep([OX + 0.15, 1.75, -0.95], [OX + 0.15, 1.4, 1.75], { fov: 54, face: 0.45 }),
  S12: creep(CLOCK, off(CLOCK, [0.1, -0.05, 1.6]), { fov: 50, face: 0.45 }),
  S13: close(fB(), -1),
  S18: coinLens,
};
export const COFFEE_V1_SHOTS = shotsOf(PLAN, TOP);
const BOT_SHOTS = shotsOf(PLAN, BOT);
const split = (s: FinShot): FinShot => BOT_SHOTS.find((b) => b.id === s.id) ?? BOT_SHOTS[0];

// ------------------------------------------------------------------ scene (one world: the cafe at x = 0, the vault at x = 40)
const CupTower: React.FC<{ n: number }> = ({ n }) => {
  // one cup on screen per ~30 real cups, stacked in columns of 10 (capped to what fits)
  const shown = Math.min(60, Math.max(2, Math.round(n / 30) + 2));
  return (
    <group position={CUPS}>
      {Array.from({ length: shown }, (_, k) => {
        const col = Math.floor(k / 10), row = k % 10;
        return <group key={k} position={[(col % 3) * 0.14 - 0.14, 0.065 + row * 0.12, -Math.floor(col / 3) * 0.14]}><Cup /></group>;
      })}
    </group>
  );
};
const scene = (t: number, shot: FinShot): React.ReactNode => {
  const iRaw = seq(shot.id);
  const actors = actorsAt(iRaw, t);
  const y = iRaw === 13.5 || iRaw === 1 ? 0 : yearsAt(t);
  const coinU = iRaw === 1 ? clamp((t + 0.2) / (tCoin + 0.2)) : iRaw === 2.5 ? clamp((t - T("S19")) / 0.45) : iRaw === 13.5 ? clamp((t - T("S18") - 0.3) / 0.5) : -1;
  const handC: V3 = [JAR[0] + 0.12, 1.05, JAR[2]];
  const tagU = iRaw >= 3.5 && iRaw < 13.5 ? (iRaw === 3.5 ? easeOut(clamp((t - tTag) / 0.2)) : 1) : 0;
  const cloth = iRaw >= 6 && iRaw < 9 ? 1 : iRaw === 9 ? 1 - clamp((t - tReveal) / 0.35) : iRaw > 9 && iRaw < 13.5 ? 0 : -1; // -1: no YEAR 30 board yet / after the loop
  const clothFly = iRaw === 9 ? clamp((t - tReveal) / 0.35) : 0;
  const pileH = iRaw >= 9 && iRaw < 13.5 ? (iRaw === 9 ? lerp(0.32, 1.25, easeOut(clamp((t - tReveal) / 0.6))) : 1.25) : iRaw >= 7 && iRaw < 9 ? 0.32 : iRaw >= 4 && iRaw < 7 ? 0.08 : 0;
  const b30Text = iRaw >= 9 && iRaw < 13.5 ? ["YEAR 30", savedText(y)] : ["YEAR 30", "?"];
  const cupFloor = iRaw >= 9.5 && iRaw < 13.5 ? true : iRaw === 9 && t > tReveal + 0.15;
  return (
    <>
      {/* ---- TOP: Spender's cafe corner */}
      <Hall W={7} back={-1.8} front={4} H={3.4} wall="#e88a5a" stripe="#ffd23a" floorA="#fff4e8" floorB="#f2dcc4" />
      <BigBlock p={COUNTER} size={[0.95, 0.95, 0.6]} color="#8a5a3a" text="CAFE" fg="#fff4c8" />
      <BigBlock p={[COUNTER[0] + 0.15, 0.95, COUNTER[2] - 0.05]} size={[0.38, 0.5, 0.34]} color="#3a3f58" text="" />
      <CupTower n={iRaw === 1 || iRaw === 13.5 ? 30 : Math.max(30, cupsAt(y))} />
      {iRaw >= 4 && iRaw < 13.5 ? <Label p={[CUPS[0], 1.55 + 0 * t, CUPS[2] + 0.15]} text={[`${cupsAt(y).toLocaleString("en-US")} CUPS`]} w={0.62} h={0.18} bg="#ffffff" fg="#d62a2a" /> : null}
      {iRaw === 1 || iRaw === 13.5 ? null : <Label p={BOARD_SP} text={["SPENDER SPENT", spentText(y)]} w={1.3} h={0.5} bg="#d62a2a" fg="#ffffff" />}{/* off in the frame-0 / loop close-ups: nothing behind the hook text */}
      {cupFloor ? <group position={[P_SP[0] + 0.32, 0.055, P_SP[2] + 0.42]} rotation={[0, 0.6, Math.PI / 2]}><Cup /></group> : null}
      {iRaw >= 11 && iRaw < 13.5 ? <Label p={[BOARD_SP[0], BOARD_SP[1] - 0.42, BOARD_SP[2] + 0.05]} text={["30 YEARS OF COFFEE"]} w={1.0} h={0.16} bg="#ffffff" fg="#16121c" /> : null}
      {/* ---- BOTTOM: Saver's vault */}
      <group position={[OX, 0, 0]}>
        <Hall W={7} back={-1.8} front={4} H={3.4} wall="#5fc48a" stripe="#ffd23a" floorA="#f0fff4" floorB="#d8f2e0" />
      </group>
      <TallJar p={JAR} fill={iRaw === 1 || iRaw === 13.5 ? 0.25 : 0.25 + 0.6 * Math.min(1, y / 10)} label="SAVED" r={0.2} h={0.56} color={PAL.cash} />
      {tagU > 0 ? <Label p={[JAR[0], 0.74 + 0.25 * (1 - tagU), JAR[2] + 0.22]} text={["7% A YEAR", "EXAMPLE"]} w={0.36 * (0.5 + 0.5 * tagU)} h={0.18 * (0.5 + 0.5 * tagU)} bg="#ffd23a" fg="#16121c" /> : null}
      {coinU >= 0 && coinU < 1 ? <Coin3 p={[lerp(handC[0], JAR[0], coinU), lerp(handC[1], 0.62, coinU * coinU), lerp(handC[2], JAR[2], coinU)]} r={[1.2 * coinU, 0, 0.3]} s={1.3} /> : null}
      <Label p={BOARD_SV} text={["SAVER", savedText(y)]} w={1.3} h={0.5} bg="#1f9e4f" fg="#ffffff" />
      {pileH > 0 ? <CoinPile p={PILE} r={Math.max(0.25, 0.7 * Math.min(1, pileH / 1.25) + 0.12)} h={pileH} coins={Math.round(30 + 70 * Math.min(1, pileH / 1.25))} /> : null}
      {iRaw === 9 ? <Debris p={[PILE[0], 0.4, PILE[2]]} t={t} t0={tReveal} n={16} c={["#f0c040", "#ffd23a", "#c8961c"]} y0={0} size={0.06} /> : null}
      {cloth >= 0 ? <Label p={B30} text={b30Text} w={1.05} h={0.5} bg={iRaw >= 9 ? "#ffd23a" : "#3a3f58"} fg={iRaw >= 9 ? "#16121c" : "#ffffff"} glow={iRaw >= 9 ? 0.2 : 0} /> : null}
      {cloth > 0 ? <BigBlock p={[B30[0] + 1.4 * clothFly, B30[1] - 0.3 + 1.2 * clothFly, B30[2] + 0.06]} size={[1.15, 0.62, 0.03]} r={[0, 0, 0.9 * clothFly]} color="#8a5ad0" text={clothFly > 0 ? "" : "YEAR 30"} fg="#ffffff" /> : null}
      {iRaw >= 6 && iRaw < 13.5 ? <BigBlock p={[B30[0], 0, B30[2] - 0.08]} size={[0.06, B30[1] - 0.25, 0.06]} color="#3a3f58" text="" /> : null}
      {iRaw >= 11 && iRaw < 13.5 ? <Label p={[OX + 0.15, 1.42, -0.95]} text={["PUT IN $54,750"]} w={0.78} h={0.18} bg="#ffffff" fg="#16121c" /> : null}
      {iRaw === 12 ? <BigClock p={CLOCK} s={0.55} hour={(t - tTime) * 40} min={(t - tTime) * 480} color={PAL.cash} /> : null}
      {iRaw === 12 ? <Label p={[CLOCK[0], CLOCK[1] - 0.42, CLOCK[2] + 0.05]} text={["TIME DID THE REST"]} w={0.82} h={0.16} bg="#ffd23a" fg="#16121c" /> : null}
      {actors.map((a) => <Act key={a.name} look={a.look} pose={a.pose} emotion={a.emo} s={a.s} t={t} seed={a.seed} held={a.held} />)}
    </>
  );
};

// ------------------------------------------------------------------ clip check (tools/story_qa.mjs)
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const COFFEE_V1_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const s = COFFEE_V1_SHOTS.find((x) => t >= x.a && t < x.b) ?? COFFEE_V1_SHOTS[COFFEE_V1_SHOTS.length - 1];
  const iRaw = seq(s.id);
  const actors = actorsAt(iRaw, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const y = iRaw === 13.5 || iRaw === 1 ? 0 : yearsAt(t);
  const props: Box[] = [
    box("counter", [COUNTER[0], 0.48, COUNTER[2]], [0.48, 0.48, 0.3]), box("machine", [COUNTER[0] + 0.15, 1.2, COUNTER[2] - 0.05], [0.19, 0.25, 0.17]),
    box("cups", [CUPS[0], 0.62, CUPS[2] - 0.1], [0.22, 0.62, 0.2]),
    box("jar", [JAR[0], 0.28, JAR[2]], [0.2, 0.28, 0.2]),
    box("boardSp", BOARD_SP, [0.65, 0.25, 0.02]), box("boardSv", BOARD_SV, [0.65, 0.25, 0.02]),
  ];
  const pileH = iRaw >= 9 && iRaw < 13.5 ? 1.25 : iRaw >= 7 ? 0.32 : iRaw >= 4 ? 0.08 : 0;
  if (pileH > 0) { const r = Math.max(0.25, 0.7 * Math.min(1, pileH / 1.25) + 0.12); props.push(box("pile", [PILE[0], pileH / 2, PILE[2]], [r * 0.8, pileH / 2, r * 0.8])); }
  if (iRaw >= 6 && iRaw < 13.5) props.push(box("b30", B30, [0.53, 0.25, 0.02]));
  if (iRaw >= 9.5 && iRaw < 13.5) props.push(box("cupFloor", [P_SP[0] + 0.32, 0.055, P_SP[2] + 0.42], [0.07, 0.055, 0.07]));
  if (iRaw === 12) props.push(box("clock", CLOCK, [0.28, 0.28, 0.05]));
  void y;
  return { actors, props };
};

// ------------------------------------------------------------------ overlay: hook text, the seam, captions on the seam
const overlay = (t: number) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 953, height: 14, background: "linear-gradient(90deg, #d62a2a, #ffd23a 50%, #1f9e4f)", boxShadow: "0 0 12px rgba(0,0,0,0.6)" }} />
    {t < lineEnd(1) + 0.25 || t >= tLoopShot ? <HookText text={"$5 COFFEE OR\n$186,000?"} size={92} top={70} t={t} until={99} /> : null}
    {t > lineEnd(1) + 0.3 && t < tLoopShot ? <div style={{ position: "absolute", right: 36, top: 36, padding: "6px 14px", borderRadius: 12, background: "rgba(255,244,200,0.94)", color: "#16121c", fontFamily: "Poppins", fontWeight: 800, fontSize: 26 }}>EXAMPLE · MADE-UP 7%</div> : null}
    <WordCaption words={WORDS} t={t} centre={0.5} />
  </>
);
export const COFFEE_V1_SPEC: FinSpec = {
  slug: "coffee-could-be",
  shots: COFFEE_V1_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene: (t, s) => scene(t, s),
  counter: () => null,
  tag: () => null,
  bg: "#16121c",
  overlay,
  split,
};
export const COFFEE_V1_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -10 }, { t: tCoin, sfx: "coins", db: -16 }, { t: tSwap, sfx: "pop", db: -12 }, // quiet under "five" (the hook word)
    { t: T("S19") + 0.4, sfx: "coins", db: -6 }, { t: tTag, sfx: "ding", db: -6 },
    { t: tY1, sfx: "tick", db: -6 }, { t: tCups + 0.1, sfx: "pop", db: -8 }, { t: tSaved - 0.02, sfx: "impact", db: -2 },
    { t: tLoop, sfx: "suspense", db: -6 }, { t: T("S15"), sfx: "heartbeat", db: -4 },
    { t: tY10, sfx: "tick", db: -6 }, { t: tShrug, sfx: "squeak", db: -8 }, { t: tLaugh, sfx: "laugh", db: -6 },
    { t: tReveal - 0.02, sfx: "boom", db: -2 }, { t: tReveal, sfx: "coins", db: -2 }, { t: tBig - 0.02, sfx: "impact", db: 0 }, { t: tBig + 0.05, sfx: "success", db: -4 },
    { t: T("S11") + 0.1, sfx: "fail", db: -6 }, { t: tTime, sfx: "clock", db: -6 },
    { t: END - 0.35, sfx: "whoosh", db: -2 },
  ],
};

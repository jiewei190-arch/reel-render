// FORMAT v1, style S2 RICH-VS-POOR: penny-doubles. "Saver took a penny that doubles daily. Spender took a million."
// SPLIT SCREEN (FinSpec.split): one world, two sets 40 m apart. TOP half = Spender's red vault ($1,000,000 in cash
// bricks, a fixed scoreboard); BOTTOM half = Saver's green mint (one penny that doubles every day; scoreboard + a coin
// pile whose VOLUME scales with the money). A DAY calendar in each half. Open loop (~50 %): "But watch the last five
// days..." (Saver's board covered by a cloth, the calendars start to flip). Twist (~57-75 %): the pile erupts, Saver
// pulls ahead on day 28, $5,368,709.12 on day 30. Ends on "you know who took the penny:" and loops to frame 0.
// Maths (sources.md): day d = $0.01 x 2^(d-1): 10 -> $5.12, 20 -> $5,242.88, 25 -> $167,772.16, 28 -> $1,342,177.28,
// 30 -> $5,368,709.12; day 30 alone adds $2,684,354.56 (half).
import React from "react";
import { SAVER, SPENDER } from "../../library/characters";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/penny_doubles_v1.plan.gen";
import { Act, camOf, stand } from "../core";
import type { FinShot, FinSpec } from "../core";
import { usd } from "../hud";
import { BillBrick, CoinPile, CoinStack, FlipCalendar, Hall, Label, PAL } from "../props";
import { FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import { actorBoxes, armPoint, Coin3, creep, Debris, Squash, sqAt, shotsOf, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";
import type { Shot } from "../hooks";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const OX = 40; // Saver's mint sits 40 m along x from Spender's vault
const P_SP: V3 = [0, 0, 0.2];
const P_SV: V3 = [OX - 0.35, 0, 0.2];
const CASH: V3 = [1.05, 0, -0.45]; // Spender's pallet of bricks (to his left on screen-right)
const PILE: V3 = [OX + 1.1, 0, -0.55]; // Saver's coin pile
const BOARD_Y = 2.05;
const BOARD_SP: V3 = [0, BOARD_Y, -1.45];
const BOARD_SV: V3 = [OX, BOARD_Y, -1.45];
const CAL_X = -1.35;

// ------------------------------------------------------------------ key times
const tPop = W(1, "doubles") + 0.12; // the penny pops into two coins
const tBoard = T("S03") + 0.08; // the $1,000,000 board slams down
const tCal = T("S04") + 0.05; // the calendars drop
const tLaugh = T("S06");
const tLoop = T("S10"); // "But watch the last five days..." (open loop)
const tErupt = W(5, "over") + 0.05; // the cloth flies off, coins erupt
const tAhead = W(5, "saver") ;
const tAval = W(6, "five") + 0.05; // day 30 avalanche
const tHalf = T("S17");
const tLoopShot = T("S19");

/** the day shown at time t (both calendars) */
const dayAt = (t: number): number => {
  const flip = (t0: number, a: number, b: number) => Math.round(lerp(a, b, ss(t0, t0 + 0.45, t)));
  if (t >= tLoopShot) return 1;
  if (t >= tAval - 0.1) return flip(tAval - 0.1, 28, 30);
  if (t >= T("S13")) return flip(T("S13"), 25, 28);
  if (t >= T("S11")) return flip(T("S11"), 20, 25);
  if (t >= T("S07")) return flip(T("S07"), 10, 20);
  if (t >= T("S05")) return flip(T("S05"), 2, 10);
  return t >= tPop ? 2 : 1;
};
const valueOf = (d: number) => 0.01 * Math.pow(2, d - 1);
/** pile height from the money (volume ~ value: h ~ cube root), capped so the pile never reaches Saver */
const pileH = (d: number) => (d < 15 ? 0 : Math.min(2.25, 2.25 * Math.cbrt(valueOf(d) / valueOf(30))));

// ------------------------------------------------------------------ actors (shared by the scene and the clip QA)
type ActorAt = { name: string; look: typeof SPENDER; pose: Pose; emo: Emotion; s: number; seed: number; chest?: React.ReactNode };
const reactTop = [tPop, tBoard, tLaugh, T("S11"), tErupt, tAhead, tAval, T("S18")];
const reactBot = [tPop, tCal, T("S10"), tErupt, tAhead, tAval, T("S18")];
const actorsAt = (i: number, t: number): ActorAt[] => {
  // ---- Spender (top)
  let sp: Pose = { ...stand(P_SP[0], P_SP[2], 0.15, SC), armL: 0.3, armR: 0.3, outL: 0.1, outR: 0.1 };
  let se: Emotion = "joy";
  let chest: React.ReactNode | undefined;
  if (i === 1 || i === 19) {
    const ph = Math.sin(t * 9);
    sp = { ...sp, armL: 2.5 + 0.2 * ph, armR: 2.5 - 0.2 * ph, outL: 0.45, outR: 0.45, bob: -0.04 * Math.abs(ph) };
  } else if (i === 2 || i === 3) {
    sp = { ...sp, armL: 1.05, armR: 1.05, outL: -0.12, outR: -0.12 };
    chest = <group position={[0, -0.15, 0.24]}><BillBrick p={[0, 0, 0]} s={2.4} /></group>;
    se = i === 3 ? "sly" : "joy";
  } else if (i === 4 || i === 5) {
    sp = { ...sp, armL: 0.95, armR: 0.95, outL: -0.25, outR: -0.25, headPitch: 0.08 };
    se = "sly";
  } else if (i === 6) {
    const lg = Math.abs(Math.sin((t - tLaugh) * 16));
    sp = { ...sp, armL: 0.7, outL: -0.1, armR: 1.3, outR: 0.25, headPitch: 0.25 - 0.1 * lg, bob: -0.03 * lg };
    se = "joy";
  } else if (i >= 7 && i <= 9) {
    sp = { ...sp, armL: 0.9, armR: 0.9, outL: -0.25, outR: -0.25, pitch: -0.08, headYaw: -0.25 };
    se = "sly";
  } else if (i === 10 || i === 11) {
    sp = { ...sp, headPitch: 0.25, headYaw: 0.15, armL: 0.35, armR: 0.35 };
    se = "curious";
  } else if (i >= 12 && i <= 15) {
    const d = i === 15 ? ss(tAhead - 0.05, tAhead + 0.15, t) : 0;
    sp = { ...sp, headPitch: 0.2, armL: lerp(0.4, 2.2, d), armR: lerp(0.4, 2.2, d), outL: 0.15 + 0.75 * d, outR: 0.15 + 0.75 * d, ant: 1 };
    se = "shock";
  } else if (i >= 16 && i <= 18) {
    sp = { ...sp, headPitch: 0.35 + 0.03 * Math.sin(t * 13), armL: 0.05, armR: 0.05, pitch: 0.12, ant: -1 };
    se = "sad";
  }
  // ---- Saver (bottom)
  let sv: Pose = { ...stand(P_SV[0], P_SV[2], -0.15, SC), armL: 0.3, armR: 0.3, outL: 0.1, outR: 0.1 };
  let ve: Emotion = "happy";
  if (i === 1 || i === 19) {
    sv = { ...sv, armR: 1.4, outR: -0.32, headPitch: -0.12 };
    ve = "curious";
  } else if (i === 2 || i === 3) {
    sv = { ...sv, armR: 1.15, outR: -0.32, headPitch: 0.25 };
    ve = t >= tPop ? "joy" : "curious";
  } else if (i === 4) {
    sv = { ...sv, armR: 1.15, outR: -0.32, headPitch: 0.15 };
    ve = "sly";
  } else if (i >= 5 && i <= 9) {
    sv = { ...sv, armL: 0.95, armR: 0.95, outL: -0.25, outR: -0.25 };
    ve = "happy";
  } else if (i === 10 || i === 11) {
    sv = { ...sv, armR: 2.3, outR: 0.35, headPitch: -0.2 };
    ve = "sly";
  } else if (i >= 12 && i <= 16) {
    const ph = Math.sin(t * 10);
    sv = { ...sv, armL: 2.55 + 0.1 * ph, armR: 2.55 - 0.1 * ph, outL: 0.45, outR: 0.45, bob: -0.04 * Math.abs(ph) };
    ve = "joy";
  } else if (i === 17 || i === 18) {
    sv = { ...sv, armL: 0.3, armR: 1.4, outR: 0.2, headPitch: 0.05 };
    ve = "happy";
  }
  return [
    { name: "Spender", look: SPENDER, pose: sp, emo: se, s: SC, seed: 2, chest },
    { name: "Saver", look: SAVER, pose: sv, emo: ve, s: SC, seed: 4 },
  ];
};

// ------------------------------------------------------------------ moving props (shared by the scene and the QA)
/** S01/S19: cash brick k tossed up and BACK (away from the lens and the head), landing behind Spender */
const tossPos = (k: number, t: number, t0: number): V3 | null => {
  const u = ((t - t0) * 0.9 + k / 4) % 1;
  if (t < t0) return null;
  const sx = k % 2 ? 0.35 : -0.35;
  return [P_SP[0] + sx * (1 + 0.6 * u), 1.75 + 1.6 * Math.sin(Math.PI * u), P_SP[2] - 0.35 - 0.9 * u];
};
/** the penny: flipping above Saver's raised hand (S01/S19), then on his palm (S02-S04) */
const pennyAt = (i: number, t: number, sv: Pose): V3[] => {
  const hand = armPoint(sv, "R", 1, SC);
  if (i === 1 || i === 19) {
    const u = ((t - (i === 19 ? tLoopShot : 0)) * 1.4) % 1;
    return [[hand[0], hand[1] + 0.24 + 0.5 * Math.sin(Math.PI * u), hand[2] + 0.12]]; // PC fix: the flip arc starts clear of the hand
  }
  if (i >= 2 && i <= 4) {
    const pop = ss(tPop, tPop + 0.15, t);
    // PC fix: the coins float clear above and in front of the palm (they sat inside the forearm)
    const y = hand[1] + 0.24, z = hand[2] + 0.14;
    return pop > 0 ? [[hand[0] - 0.09 * pop, y, z], [hand[0] + 0.09 * pop, y + 0.1 * Math.sin(Math.PI * pop), z]] : [[hand[0], y, z]];
  }
  return [];
};
/** S12: coins erupting out of the pile (up and back, away from Saver) */
const eruptPos = (k: number, t: number, t0: number, n: number): V3 | null => {
  const u = (t - t0 - (k % 6) * 0.03) / 0.9;
  if (u <= 0 || u >= 1) return null;
  const a = Math.PI * (1.0 + 1.0 * hash(k)); // backwards half (-z) + sides
  const r = 0.4 + 1.6 * easeOut(u) * (0.6 + 0.4 * hash(k + 3));
  const top = pileH(25);
  return [PILE[0] + 0.3 + Math.cos(a) * r * 0.5, Math.max(0.05, top + 0.2 + 2.2 * u - 3.0 * u * u), PILE[2] + Math.sin(a) * r * 0.7 - 0.2];
  void n;
};
/** S16: avalanche coins raining onto the pile top from above */
const avalPos = (k: number, t: number): V3 | null => {
  const u = ((t - tAval) * 0.9 + k / 18) % 1;
  if (t < tAval - 0.05 || t > T("S17") + 0.6) return null;
  const h = pileH(dayAt(t));
  return [PILE[0] + 0.5 * (hash(k) - 0.5), lerp(4.2, h + 0.1, u), PILE[2] + 0.4 * (hash(k + 5) - 0.5)];
};

// ------------------------------------------------------------------ lenses: TOP (plan) and BOTTOM (split)
const fT = (dy = 0): V3 => [P_SP[0], FACE - 0.05 + dy, P_SP[2]];
const fB = (dy = 0): V3 => [P_SV[0], FACE - 0.05 + dy, P_SV[2]];
const off = (p: V3, d: V3): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
const close = (f: V3, side = 1, o: Partial<Shot> = {}) => creep(f, off(f, [0.28 * side, 0.08, 0.95]), { fov: 46, face: 0.6, blur: 1.6, ...o });
const medium = (f: V3, side = 1, o: Partial<Shot> = {}) => creep([f[0] + 0.35 * side, 1.0, f[2] - 0.2], off(f, [0.75 * side, 0.3, 2.45]), { fov: 50, face: 0.55, ...o });
const wide = (c: V3, o: Partial<Shot> = {}) => creep(c, off(c, [0.4, 0.75, 3.7]), { fov: 56, face: 0.55, ...o });
const sh = shakeAt([tBoard, tErupt, tAval], 0.05);
const TOP: Record<string, Shot> = {
  S01: { ...close(fT(-0.05), 1, { fov: 50 }), shake: sh },
  S02: close(fT(-0.1), -1),
  S03: { ...medium(fT(), 1), fovAt: slam(tBoard, 56, 50, 0.12), shake: sh },
  S04: medium(fT(), -1),
  S05: medium(fT(), 1),
  S06: { ...close(fT(), -1), fovAt: slam(tLaugh, 52, 46, 0.12) },
  S07: medium(fT(), 1),
  S08: medium(fT(), -1),
  S09: close(fT(), 1),
  S10: { ...medium(fT(), -1), mood: "whisper" },
  S11: close(fT(), 1),
  S12: { ...close(fT(), -1), fovAt: slam(tErupt, 50, 44, 0.12) },
  S13: close(fT(), 1),
  S14: medium(fT(), -1),
  S15: { ...close(fT(), 1), fovAt: slam(tAhead, 52, 44, 0.14) },
  S16: { ...medium(fT(), -1), fovAt: slam(tAval, 56, 50, 0.12), shake: sh },
  S17: medium(fT(), 1),
  S18: close(fT(), -1),
  S19: { ...close(fT(-0.05), 1, { fov: 50 }) },
};
const pileC = (): V3 => [OX + 0.45, 1.0, -0.15];
const handAt = (i: number, t: number): V3 => armPoint(actorsAt(i, t)[1].pose, "R", 1, SC);
const pennyLens = (i: number, t: number, o: Partial<Shot> = {}): Shot => {
  const h = handAt(i, t), f = fB();
  const c: V3 = [(h[0] + f[0]) / 2, (h[1] + 0.25 + f[1]) / 2, (h[2] + f[2]) / 2];
  return creep(c, off(c, [-0.15, 0.05, 1.05]), { fov: 50, face: 0.5, blur: 1.8, ...o });
};
const mB = (c: V3, side = 1) => medium(c, side, { face: 0.55 });
const BOT: Record<string, Shot> = {
  S01: pennyLens(1, 0.1),
  S02: pennyLens(2, T("S02") + 0.3, { fov: 44 }),
  S03: mB(fB(), -1),
  S04: { ...mB(fB(), 1), shake: shakeAt([tCal + 0.1], 0.03) },
  S05: mB(fB(), -1),
  S06: mB(fB(), 1),
  S07: mB(pileC(), -1),
  S08: mB(pileC(), 1),
  S09: mB(fB(), -1),
  S10: creep([OX - 0.1, 1.55, -0.6], [OX + 0.5, 1.75, 2.6], { fov: 52, face: 0.5 }), // the covered board + Saver, readable (not dark)
  S11: creep([OX - 0.1, 1.55, -0.6], [OX - 0.7, 1.7, 2.5], { fov: 52, face: 0.5 }),
  S12: { ...wide([OX + 0.4, 1.2, -0.4], { face: 0.55 }), fovAt: slam(tErupt, 62, 54, 0.12), shake: sh },
  S13: wide([OX + 0.4, 1.4, -0.4], { face: 0.55 }),
  S14: mB([OX, 1.5, -0.7], 1),
  S15: close(fB(), -1, { face: 0.55 }),
  S16: { ...wide([OX + 0.4, 1.5, -0.5], { face: 0.55 }), fovAt: slam(tAval, 62, 54, 0.12), shake: sh },
  S17: mB(pileC(), 1),
  S18: close(fB(), -1, { face: 0.55 }),
  S19: pennyLens(19, T("S19") + 0.1),
};
export const PENNY2_SHOTS = shotsOf(PLAN, TOP);
const BOT_SHOTS = shotsOf(PLAN, BOT);
const split = (s: FinShot): FinShot => BOT_SHOTS.find((b) => b.id === s.id) ?? BOT_SHOTS[0];

// ------------------------------------------------------------------ scene
const Board: React.FC<{ p: V3; text: string; color: string; drop?: number; glow?: number }> = ({ p, text, color, drop = 0, glow = 0.35 }) => (
  <group position={[p[0], p[1] + drop, p[2]]}>
    <Label p={[0, 0, 0]} text={[text]} w={2.1} h={0.62} bg="#16121c" fg={color} border={color} glow={glow} />
  </group>
);
const scene = (t: number, shot: FinShot): React.ReactNode => {
  const i = idx(shot.id);
  const actors = actorsAt(i, t);
  const k = sqAt(t, reactTop), kb = sqAt(t, reactBot);
  const d = dayAt(t);
  const v = valueOf(d);
  const dim = i === 10 || i === 11;
  // the top board slams down at tBoard (S03) and stays; in S01-S02 it isn't up yet
  const boardDrop = t < tBoard ? 3 : 1.4 * (1 - easeOut(clamp((t - tBoard) / 0.14))) + 0.06 * Math.exp(-(t - tBoard) * 8) * Math.sin((t - tBoard) * 30);
  const calDrop = t < tCal ? 3 : 1.2 * (1 - easeOut(clamp((t - tCal) / 0.16)));
  // the cloth over Saver's board: up S09-S11, flies off at tErupt
  const cloth = i >= 10 && i <= 12 ? (t < tErupt ? 0 : (t - tErupt) / 0.5) : -1;
  const h = pileH(d) + (i === 16 || i === 17 ? 0 : 0);
  const props: React.ReactNode[] = [];
  if (i === 1 || i === 19) for (let q = 0; q < 4; q++) { const p = tossPos(q, t, i === 19 ? tLoopShot : 0); if (p) props.push(<BillBrick key={`tb${q}`} p={p} s={2.2} r={[t * 4 + q, t * 3, q]} />); }
  pennyAt(i, t, actors[1].pose).forEach((p, q) => props.push(<Coin3 key={`pn${q}`} p={p} r={[i === 1 || i === 19 ? t * 14 : Math.PI / 2, 0, 0.2]} s={i === 1 || i === 19 ? 1.6 : 1.25} />));
  if (i === 12 || i === 13) for (let q = 0; q < 26; q++) { const p = eruptPos(q, t, tErupt, 26); if (p) props.push(<Coin3 key={`er${q}`} p={p} r={[t * 9 + q, q, t * 6]} s={1.5} />); }
  if (i === 16 || i === 17) for (let q = 0; q < 18; q++) { const p = avalPos(q, t); if (p) props.push(<Coin3 key={`av${q}`} p={p} r={[t * 9 + q, q, t * 7]} s={1.5} />); }
  return (
    <>
      {/* ---- TOP: Spender's red vault */}
      <Hall W={10} back={-2.6} front={6} wall={dim ? "#5a2230" : "#a8323e"} stripe="#ffd23a" floorA="#f6e3cf" floorB="#e8cdb5" />
      <Board p={BOARD_SP} text="$1,000,000" color="#ffd23a" drop={boardDrop} />
      <Label p={[BOARD_SP[0], BOARD_Y + 0.5 + boardDrop, BOARD_SP[2]]} text={["SPENDER: TOOK A MILLION"]} w={1.6} h={0.2} bg="#ffd23a" fg="#16121c" />
      {Array.from({ length: 18 }, (_, q) => <BillBrick key={`c${q}`} p={[CASH[0] + 0.4 * (q % 3), 0.17 * Math.floor(q / 6), CASH[2] + 0.42 * (Math.floor(q / 3) % 2)]} s={2.4} />)}
      <FlipCalendar p={[CAL_X, 1.75 + calDrop, -1.7]} w={0.85} h={0.75} title="DAY" value={String(d)} sub="OF 30" />
      <Debris p={[BOARD_SP[0], 1.4, BOARD_SP[2] + 0.3]} t={t} t0={tBoard} n={10} y0={0} c={["#ffd23a", "#16121c"]} />
      {/* ---- BOTTOM: Saver's green mint */}
      <group position={[OX, 0, 0]}><Hall W={10} back={-2.6} front={6} wall={dim ? "#24704a" : "#2e8a52"} stripe="#ffd23a" floorA="#eaf6e6" floorB="#d4ead0" /></group>
      <Board p={BOARD_SV} text={usd(v)} color={d >= 28 ? "#7dffb0" : "#ffffff"} glow={d >= 28 ? 0.8 : 0.35} />
      <Label p={[BOARD_SV[0], BOARD_Y + 0.5, BOARD_SV[2]]} text={["SAVER: 1 PENNY, DOUBLED DAILY"]} w={1.9} h={0.2} bg="#7dffb0" fg="#16121c" />
      {cloth >= 0 && cloth < 1 ? <Label p={[BOARD_SV[0] + 1.2 * cloth, BOARD_Y + 0.02 + 2.2 * cloth, BOARD_SV[2] + 0.06 + 0.4 * cloth]} r={[0, 0, 0.8 * cloth]} text={["?????"]} w={2.25} h={0.72} bg="#6a6478" fg="#c8c4d4" /> : null}
      <FlipCalendar p={[OX + CAL_X, 1.75 + calDrop, -1.7]} w={0.85} h={0.75} title="DAY" value={String(d)} sub="OF 30" />
      {d >= 5 && d < 15 ? <CoinStack p={[PILE[0] - 0.3, 0, PILE[2] + 0.3]} n={Math.min(14, d)} s={1.4} /> : null}
      {h > 0 ? <CoinPile p={PILE} r={Math.max(0.3, 0.85 * Math.min(1, h / 2.25) + 0.15)} h={h} coins={Math.round(40 + 80 * Math.min(1, h / 2.25))} splitGlow={i === 17 ? 0.5 + 0.5 * Math.sin(t * 8) : 0} /> : null}
      {i === 17 ? <Label p={[PILE[0] - 0.1, 1.5, PILE[2] + 1.15]} text={["DAY 30 ALONE: +$2,684,354.56"]} w={1.5} h={0.24} bg={PAL.cash} fg="#fff4c8" glow={0.2} /> : null}
      <Debris p={[PILE[0], pileH(25) + 0.1, PILE[2]]} t={t} t0={tErupt} n={12} y0={0} c={["#f0c040", "#c8961c"]} />
      {props}
      <Squash p={P_SP} k={k}><Act look={actors[0].look} pose={actors[0].pose} emotion={actors[0].emo} s={SC} t={t} seed={2} chest={actors[0].chest} /></Squash>
      <Squash p={P_SV} k={kb}><Act look={actors[1].look} pose={actors[1].pose} emotion={actors[1].emo} s={SC} t={t} seed={4} /></Squash>
    </>
  );
};

// ------------------------------------------------------------------ QA (tools/story_qa.mjs)
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const PENNY2_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh0 = PENNY2_SHOTS.find((s) => t >= s.a && t < s.b) ?? PENNY2_SHOTS[PENNY2_SHOTS.length - 1];
  const i = idx(sh0.id);
  const as = actorsAt(i, t);
  const actors = as.flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const props: Box[] = [];
  if (i === 1 || i === 19) for (let q = 0; q < 4; q++) { const p = tossPos(q, t, i === 19 ? tLoopShot : 0); if (p && p[1] > 1.95) props.push(box(`toss${q}`, p, [0.17, 0.08, 0.1])); }
  if (i === 12 || i === 13) for (let q = 0; q < 26; q++) { const p = eruptPos(q, t, tErupt, 26); if (p) props.push(box(`erupt${q}`, p, [0.07, 0.07, 0.07])); }
  if (i === 16 || i === 17) for (let q = 0; q < 18; q++) { const p = avalPos(q, t); if (p) props.push(box(`aval${q}`, p, [0.07, 0.07, 0.07])); }
  pennyAt(i, t, as[1].pose).forEach((p, q) => props.push(box(`penny${q}`, p, [0.07, 0.07, 0.07])));
  const d = dayAt(t), h = pileH(d);
  if (h > 0) { const r = Math.max(0.3, 0.85 * Math.min(1, h / 2.25) + 0.15); props.push(box("pile", [PILE[0], h / 2, PILE[2]], [r * 0.8, h / 2, r * 0.8])); }
  props.push(box("cash", [CASH[0] + 0.4, 0.25, CASH[2] + 0.21], [0.62, 0.25, 0.4]));
  if (i === 17) props.push(box("day30Label", [PILE[0] - 0.1, 1.5, PILE[2] + 1.15], [0.75, 0.12, 0.05]));
  props.push(box("boardSp", BOARD_SP, [1.05, 0.31, 0.05]), box("boardSv", BOARD_SV, [1.05, 0.31, 0.05]));
  return { actors, props };
};

// ------------------------------------------------------------------ overlay: hook text, divider, captions on the divider
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const on = t < lineEnd(1) + 0.25 || t >= tLoopShot;
  if (!on) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 70, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 96, lineHeight: 1.0, color: "#ffd23a", textAlign: "center", WebkitTextStroke: "9px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.7)" }}>
        1 PENNY
        <br />
        <span style={{ color: "#ffffff" }}>vs </span>$1,000,000
      </div>
    </div>
  );
};
const overlay = (t: number) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 953, height: 14, background: "linear-gradient(90deg, #d62a2a, #ffd23a 50%, #1f9e4f)", boxShadow: "0 0 12px rgba(0,0,0,0.6)" }} />
    <Hook t={t} />
    {t > lineEnd(1) + 0.3 && t < tLoopShot ? <div style={{ position: "absolute", right: 36, top: 36, padding: "6px 14px", borderRadius: 12, background: "rgba(255,244,200,0.94)", color: "#16121c", fontFamily: "Poppins", fontWeight: 800, fontSize: 28 }}>THOUGHT EXPERIMENT</div> : null}
    <WordCaption words={WORDS} t={t} centre={0.5} />
  </>
);

export const PENNY2_SPEC: FinSpec = {
  slug: "penny-doubles",
  shots: PENNY2_SHOTS,
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

// ------------------------------------------------------------------ audio: upbeat bed from 0 s; SFX on impacts and payoffs
export const PENNY2_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -3 }, { t: 0.02, sfx: "coins", db: -8 },
    { t: tPop, sfx: "pop", db: -2 }, { t: tPop + 0.05, sfx: "ding", db: -8 },
    { t: tBoard - 0.02, sfx: "impact", db: 0 }, { t: tBoard, sfx: "thud", db: -4 },
    { t: tCal, sfx: "drop", db: -6 },
    { t: T("S05"), sfx: "tick", db: -6 }, { t: tLaugh + 0.05, sfx: "laugh", db: -6 },
    { t: T("S07"), sfx: "tick", db: -6 }, { t: W(3, "about"), sfx: "coins", db: -8 },
    { t: tLoop, sfx: "suspense", db: -6 }, { t: tLoop + 0.2, sfx: "riser", db: -10 },
    { t: T("S11"), sfx: "tick", db: -6 },
    { t: tErupt - 0.02, sfx: "boom", db: -2 }, { t: tErupt, sfx: "coins", db: -2 }, { t: tErupt + 0.05, sfx: "impact", db: -4 },
    { t: T("S13"), sfx: "tick", db: -6 }, { t: W(5, "one"), sfx: "cash", db: -4 },
    { t: tAhead, sfx: "success", db: -4 }, { t: tAhead + 0.1, sfx: "gasp", db: -6 },
    { t: tAval - 0.02, sfx: "crash", db: -2 }, { t: tAval, sfx: "coins", db: 0 }, { t: tAval + 0.05, sfx: "boom", db: -6 },
    { t: tHalf + 0.1, sfx: "sparkle", db: -6 },
    { t: T("S18") + 0.05, sfx: "chime", db: -6 },
    { t: END - 0.35, sfx: "whoosh", db: -2 },
  ],
};
void camOf;

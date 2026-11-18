// FORMAT v1 story: minimum-payment-trap. "Spender just bought a TV. He'll be paying for it for nineteen years."
// Want: Spender wants a big TV now. Trouble: $5,000 on a card at 22 %, and he pays only the minimum (interest + 1 % of the
// balance, the stated example). Twist: about 19 years and over $8,000 extra; Saver's flat $200 a month: under 3 years.
// Set: a bright ELECTRONICS store. Frame 0 = the TV mid-fall onto the counter (hook A v1). Times: plan.gen (word-anchored).
import React from "react";
import { SAVER, SPENDER } from "../../library/characters";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/minimum_payment_trap.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { CoinPile, FlipCalendar, Label, PAL, Stamp } from "../props";
import { Card, CT, Dust, FACE, P_SP, Reader, SC, Store, TOP, TV, easeOut, shakeAt, slam, slamPos } from "../hooks";
import { actorBoxes, Burst, burstHalf, burstPos, Coin3, creep, DebtBlock, HookText, PayBox, shotsOf, TallJar, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const RD: V3 = [CT[0] + 0.62, TOP, CT[2] + 0.3];
const CAL: V3 = [CT[0] - 0.75, TOP, CT[2] + 0.2];
const PB: V3 = [-2.05, 0, 0.05]; // pay-bill box
const P_PAY: V3 = [-1.35, 0, 0.6];
const IJ: V3 = [-4.0, 0, -2.4]; // the INTEREST jar (back-left corner, out of the block shots' sightlines)
const OB: V3 = [-1.5, 0, -2.35]; // the OWE block
const P_PUSH: V3 = [-3.12, 0, -2.3]; // PC fix: was -2.75: his hands went ~0.25 m into the block (face at x -2.42); now the palms land on it // at the block's LEFT side, pushing +x (in view past the pay box; clear of the jar and the block)
const P_LOOK: V3 = [-2.7, 0, -1.4]; // S12: watching the chip, right of the block
const WCAL: V3 = [1.7, 2.55, -3.44];
const PILE: V3 = [-3.35, 0, 0.35];
const P_SAD: V3 = [-1.45, 0, 1.25];
const P_SV: V3 = [2.75, 0, 0.35];
const SB: V3 = [3.45, 0, -1.45]; // Saver's block
const TAG_Y = TOP + 1.25;
const TV_Y0 = 1.95; // the TV's height at frame 0 (mid-fall, in frame under the hook text); the loop shot ends at the same height
const BILL: V3 = [-1.85, 1.95, 0.35]; // the MINIMUM DUE bill, pinned over the pay box

// key times
const tHit = 0.32; // the TV lands (already falling at frame 0)
const tSwipe = W(1, "tv") + 0.12;
const tBoom = T("S03") + 0.05;
const tNine = W(1, "nineteen");
const tTag = T("S05") + 0.12;
const tStamp = T("S06") + 0.15;
const tWrong = W(4, "wrong");
const tChip = T("S12") + 0.25;
const tYears0 = T("S14"), tYears1 = W(5, "later") + 0.18; // PC fix: lands on 19 by the end of "later" (was E(S14) - 0.05: still 13 on "later")
const tCrash = T("S15") + 0.15;
const tSv = T("S17") + 0.2;
const tBurst = T("S18") + 0.1;
const tDone = T("S19") + 0.1;
const tLoop = T("S22");

// ------------------------------------------------------------------ moving props (shared by the scene and the QA check)
/** S03: counter-calendar page k flies up and LEFT, away from Spender (who stands to the right of the counter) */
const pagePos = (k: number, t: number): V3 | null => {
  const u = (t - tBoom - k * 0.05) / 0.9;
  if (u <= 0 || u >= 1) return null;
  const a = Math.PI * (0.55 + 0.9 * hash(k)); // 99..261 deg: x offset <= 0
  const r = 0.25 + 2.0 * easeOut(u);
  return [CAL[0] + Math.cos(a) * r * 0.8, TOP + 0.6 + Math.abs(Math.sin(a)) * r * 0.6 + 0.4 * u, CAL[2] + 1.6 * u];
};
/** S04: YEAR pages raining in front of Spender's face: always >= 0.5 m in front of the head centre (head half depth 0.14) */
const rainPos = (k: number, t: number): V3 => {
  const u = ((t - tNine + 0.12) * 0.45 + k / 10) % 1;
  return [P_SP[0] - 0.6 + 1.2 * hash(k + 11), FACE + 0.9 - 1.6 * u, P_SP[2] + 0.5 + 0.4 * hash(k + 2)];
};
/** S10: coin k from the pay box: 7 into the INTEREST jar, 2 to the OWE block */
const splitPos = (k: number, t: number): V3 => {
  const coinU = clamp((t - tWrong + 0.1) / 0.6);
  const u = clamp(coinU * 1.2 - k * 0.03);
  const from: V3 = [PB[0] + 0.05, 1.45, PB[2] + 0.1];
  const to: V3 = k < 7 ? [IJ[0] + 0.2 * (hash(k) - 0.5), 1.4, IJ[2]] : [OB[0] + 0.7, 1.7, OB[2] + 0.45];
  return [lerp(from[0], to[0], u), lerp(from[1], to[1], u) + 1.0 * Math.sin(Math.PI * u), lerp(from[2], to[2], u)];
};
/** S15: coin k of the avalanche from the jar to the pile */
const crashPos = (k: number, t: number): V3 => {
  const crashU = clamp((t - tCrash + 0.25) / 0.45);
  const u = clamp(crashU * 1.3 - (k % 6) * 0.05);
  return [lerp(IJ[0], PILE[0] + 1.4 * (hash(k) - 0.5), u), Math.max(0.12, 1.7 + 0.8 * Math.sin(Math.PI * u) - 1.6 * u), lerp(IJ[2], PILE[2] + 0.8 * (hash(k + 2) - 0.5), u)];
};
const BURST_ARC: [number, number] = [Math.PI * 1.05, Math.PI * 1.95]; // Saver's block bursts backwards (-z) and to the sides, away from Saver

// ------------------------------------------------------------------ lenses
const spFace = (p: V3): V3 => [p[0], FACE - 0.05, p[2]];
const LENS = {
  S01: creep([CT[0] + 0.45, TOP + 0.4, CT[2] + 0.45], [1.5, 0.85, 3.9], { fovAt: slam(tHit, 60, 50, 0.12), shake: shakeAt([tHit], 0.06), face: 0.48 }),
  S02: creep([RD[0], TOP + 0.12, RD[2]], [RD[0] + 0.15, TOP + 0.5, RD[2] + 0.95], { fov: 42, shake: shakeAt([tSwipe + 0.12], 0.02), face: 0.55, blur: 1.4 }),
  S03: creep([CAL[0], TOP + 0.7, CAL[2]], [CAL[0] - 0.25, 1.5, 2.4], { fovAt: slam(tBoom, 58, 50, 0.1), shake: shakeAt([tBoom], 0.06), face: 0.5 }),
  S04: { ...creep(spFace(P_SP), [P_SP[0] - 0.2, 1.3, P_SP[2] + 1.25], { face: 0.42, blur: 1.6, roll: [0, -3] }), posAt: slamPos([P_SP[0] - 0.6, 1.4, P_SP[2] + 3.0], [P_SP[0] - 0.3, 1.32, P_SP[2] + 2.0], spFace(P_SP), T("S04"), 0.2), face: 0.62, fovAt: slam(tNine, 52, 42, 0.14), shake: shakeAt([tNine], 0.05) },
  S05: creep([CT[0] + 0.45, TOP + 0.6, CT[2] + 0.2], [0.9, 1.5, 3.3], { fovAt: slam(tTag, 56, 50, 0.1), shake: shakeAt([tTag + 0.05], 0.05), face: 0.5 }),
  S06: creep([0.05, 1.25, 1.0], [0.25, 1.4, 1.9], { fov: 40, shake: shakeAt([tStamp], 0.03), face: 0.5 }),
  S07: creep([P_PAY[0] - 0.3, 1.0, P_PAY[2] - 0.2], [-0.4, 1.45, 3.3], { face: 0.5 }),
  S08: creep(BILL, [BILL[0] + 0.25, BILL[1] - 0.1, BILL[2] + 1.6], { fov: 44, face: 0.5 }),
  S09: creep(spFace(P_PAY), [P_PAY[0] + 0.55, 1.35, P_PAY[2] + 1.9], { face: 0.6, roll: [0, 2] }),
  S10: creep([-2.4, 1.0, -0.5], [-0.6, 1.7, 3.6], { fovAt: slam(tWrong, 62, 54, 0.1), shake: shakeAt([tWrong], 0.07), face: 0.5 }),
  S11: creep([IJ[0], 0.95, IJ[2]], [IJ[0] + 1.1, 1.55, IJ[2] + 3.3], { face: 0.5, shake: shakeAt([T("S11") + 0.1], 0.03) }),
  S12: creep([OB[0] - 0.6, 1.05, OB[2] + 0.4], [-4.3, 1.6, 0.7], { face: 0.5, shake: shakeAt([tChip], 0.02) }),
  S13: creep([OB[0] - 0.8, 0.95, OB[2]], [-4.6, 1.45, -0.2], { fov: 56, face: 0.5, roll: [-2, 2] }),
  S14: creep([WCAL[0], WCAL[1] - 0.2, WCAL[2]], [WCAL[0] - 0.3, 2.1, WCAL[2] + 2.4], { fov: 48, face: 0.5, mood: "whisper" }),
  S15: creep([PILE[0] + 0.4, 0.9, PILE[2] - 0.6], [PILE[0] + 2.6, 1.7, PILE[2] + 3.2], { fov: 56, face: 0.5, mood: "whisper", fovAt: slam(tCrash, 62, 54, 0.1), shake: shakeAt([tCrash, tCrash + 0.35], 0.08) }),
  S16: { ...creep(spFace(P_SAD), [P_SAD[0] + 2.6, 1.25, P_SAD[2] + 1.65], { face: 0.6, mood: "whisper", roll: [0, 3] }), // PC fix: lens on his right: the coin pile / +$8,100 EXTRA behind him (was his head over PAY BILL and the OWE block)
    fovAt: slam(T("S16") + 0.05, 38, 31, 0.14), shake: shakeAt([T("S16") + 0.05], 0.04) },
  S17: creep([(P_SV[0] + SB[0]) / 2, 1.0, (P_SV[2] + SB[2]) / 2], [1.6, 1.5, 3.4], { face: 0.62, mood: "ending", shake: shakeAt([tSv], 0.05) }),
  S18: creep([(P_SV[0] + SB[0]) / 2 + 0.1, 1.0, (P_SV[2] + SB[2]) / 2], [2.0, 1.55, 3.9], { fov: 60, // PC fix: Saver + his block in frame (was the block alone: an empty wall)
    face: 0.5, mood: "ending", fovAt: slam(tBurst, 62, 54, 0.1), shake: shakeAt([tBurst], 0.07) }),
  S19: creep([P_SV[0] + 0.5, 1.2, P_SV[2] + 0.3], [P_SV[0] + 0.6, 1.4, P_SV[2] + 3.4], { face: 0.45, mood: "ending", shake: shakeAt([tDone], 0.04) }),
  S20: creep([P_SP[0] - 0.2, 1.05, P_SP[2] - 0.2], [P_SP[0] + 0.6, 1.3, P_SP[2] + 2.5], { face: 0.48 }),
  S21: { ...creep(spFace(P_SP), [P_SP[0] - 0.1, 1.28, P_SP[2] + 1.3], { face: 0.64, blur: 1.4 }), fovAt: slam(T("S21") + 0.05, 50, 36, 0.14), shake: shakeAt([T("S21") + 0.05], 0.04) },
  S22: creep([CT[0] + 0.45, TOP + 0.4, CT[2] + 0.45], [1.5, 0.85, 3.9], { fov: 60, face: 0.48 }), // the S01 lens before its slam (loop match)
};
export const MINTRAP_SHOTS = shotsOf(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  void tau;
  const dark = i >= 14 && i <= 16;
  // ---------- the TV: falls at frame 0 (and again at the loop), bounces, settles
  // on the loop shot the next TV is still coming down from above: at the last frame it reaches the frame-0 height
  const tt = i === 22 ? t - DURATION / 30 : t;
  const fall = clamp(tt / tHit);
  const ty = tt < 0 ? TV_Y0 - 2.6 * tt * 1.6 : tt < tHit ? lerp(TV_Y0, TOP, fall * fall) : TOP + 0.08 * Math.abs(Math.sin((tt - tHit) * 18)) * Math.exp(-(tt - tHit) * 7);
  const squash = tt >= tHit ? 1 - 0.12 * Math.exp(-(tt - tHit) * 12) : 1;
  const tvRot: V3 = [0, 0.25 + 0.5 * (1 - fall), tt < tHit ? 0.25 * (1 - fall) : 0];
  const tvAfter = i >= 2 && i <= 21;
  // ---------- Spender
  const actors: React.ReactNode[] = [];
  {
    let p = P_SP;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0.4, 0, 3]) * 0.7, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "joy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 1 || i === 22) {
      const cheer = 0.5 + 0.5 * Math.sin(t * 9);
      pose = { ...pose, armL: 2.6 + 0.2 * cheer, armR: 2.6 - 0.2 * cheer, outL: 0.4, outR: 0.4, bob: -0.04 * Math.abs(Math.sin(t * 9)) };
    }
    if (i === 2) { pose = { ...pose, armR: lerp(1.1, 1.3, clamp((t - tSwipe) / 0.25)), outR: lerp(0.2, 0.9, clamp((t - tSwipe) / 0.25)) }; emo = "sly"; }
    if (i === 3) { pose = { ...pose, headPitch: -0.2 }; emo = "curious"; }
    if (i === 4) { const d = ss(tNine - 0.05, tNine + 0.12, t); pose = { ...pose, armL: lerp(0.4, 2.2, d), armR: lerp(0.5, 2.2, d), outL: 0.9 * d, outR: 0.9 * d, pitch: -0.12 * d, headPitch: -0.15 * d + 0.03 * Math.sin(t * 31), ant: d }; emo = d > 0.2 ? "shock" : "curious"; }
    if (i === 5) { emo = t > tTag + 0.1 ? "shock" : "joy"; pose = { ...pose, ant: t > tTag ? 1 : 0, headYaw: -0.3 }; }
    if (i >= 7 && i <= 11) {
      p = P_PAY;
      pose = { ...stand(p[0], p[2], yawTo(p, PB) * 0.2 + yawTo(p, [-0.3, 0, 5]) * 0.8, SC), armL: 0.3, armR: 0.3 };
      if (i === 7) { pose = { ...pose, armR: 1.2 + 0.5 * Math.sin(Math.min(1, (t - T("S07")) / 0.5) * Math.PI), outR: 0.1 }; emo = "sly"; }
      if (i === 8) { pose = { ...pose, armR: 2.2, outR: 0.3, headPitch: -0.2 }; emo = "sly"; }
      if (i === 9) { pose = { ...pose, armR: 2.0, outR: 0.6, armL: 0.2, pitch: 0.12, sway: 0.08 * Math.sin(t * 3) }; emo = "sly"; }
      if (i === 10) { const s = ss(tWrong - 0.05, tWrong + 0.15, t); pose = { ...pose, armL: lerp(0.3, 2.3, s), armR: lerp(0.3, 2.3, s), outL: 0.8 * s, outR: 0.8 * s, ant: s, pitch: -0.1 * s }; emo = s > 0.3 ? "shock" : "sly"; }
      if (i === 11) { pose = { ...pose, headYaw: -0.6, armL: 1.5, outL: 0.7 }; emo = "shock"; }
    }
    if (i === 12) {
      p = P_LOOK;
      pose = { ...stand(p[0], p[2], yawTo(p, OB) * 0.3 + yawTo(p, [-4.3, 0, 0.7]) * 0.7, SC), armL: 0.9, armR: 0.9, outL: 0.3, outR: 0.3, ant: 1 };
      emo = "shock";
    }
    if (i === 13) {
      p = P_PUSH;
      const strain = 0.5 + 0.5 * Math.sin(t * 14);
      // pushing: arms forward, torso leans in; the hips stay at standing height so the soles stay on the floor
      pose = { ...stand(p[0], p[2], Math.PI / 2, SC), armL: 1.55, armR: 1.55, outL: 0.05, outR: 0.05, pitch: 0.3 + 0.05 * strain, legL: 0.3, legR: -0.25, bob: -0.03 * strain };
      emo = "shock";
    }
    if (i >= 14 && i <= 16) {
      p = P_SAD;
      const sink = i === 16 ? ss(T("S16"), T("S16") + 0.3, t) : 0.4;
      pose = { ...stand(p[0], p[2], yawTo(p, [0.2, 0, 5]), SC), armL: 0.05, armR: 0.05, headPitch: 0.25 + 0.2 * sink, ant: -1, pitch: 0.15 * sink, bob: -0.08 * sink };
      emo = "sad";
    }
    if (i === 20 || i === 21) {
      pose = { ...stand(p[0], p[2], yawTo(p, [0.6, 0, 5]), SC), armL: 1.0, armR: 1.0, outL: -0.1, outR: -0.1, headYaw: 0.15 * Math.sin(t * 7) };
      emo = "shock";
      if (i === 21) { pose = { ...pose, armR: 1.6, outR: -0.05, armL: 0.4 }; emo = "curious"; }
    }
    const show = !(i === 6 || i === 14 || i === 15 && false || (i >= 17 && i <= 19));
    if (show) actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={SC} t={t} seed={2} held={held} />);
  }
  // ---------- Saver (the $200 a month route)
  if (i >= 17 && i <= 19) {
    const slamA = i === 17 ? ss(tSv - 0.25, tSv, t) : 0;
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, SB) * 0.15 + yawTo(P_SV, [1.8, 0, 5]) * 0.85, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 17) pose = { ...pose, armR: lerp(2.6, 1.2, slamA), armL: lerp(2.6, 1.2, slamA), outR: 0.2, outL: 0.2, pitch: 0.15 * slamA };
    if (i === 18) emo = "joy";
    if (i === 19) { pose = { ...pose, armL: 2.6, armR: 2.6, outL: 0.45, outR: 0.45, bob: -0.05 * Math.abs(Math.sin(t * 10)) }; emo = "joy"; }
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={SC} t={t} seed={4} />);
  }
  // ---------- money state
  const coinU = i === 10 ? clamp((t - tWrong + 0.1) / 0.6) : 0;
  const jarFill = i < 10 ? 0.12 : i === 10 ? 0.12 + 0.18 * coinU : i <= 13 ? 0.32 : i === 14 ? 0.32 + 0.8 * clamp((t - tYears0) / (tYears1 - tYears0)) : 1.12;
  const jarGlow = i === 11 ? 0.6 + 0.4 * Math.sin(t * 20) : 0;
  const owe = i < 12 ? "$5,000" : i === 12 && t < tChip + 0.1 ? "$5,000" : "$4,950";
  const year = i < 14 ? 1 : i === 14 ? 1 + Math.min(18, Math.floor(19 * clamp((t - tYears0) / (tYears1 - tYears0)))) : 19;
  const crashU = i === 15 ? clamp((t - tCrash + 0.25) / 0.45) : i > 15 ? 1 : 0;
  const pile = i >= 15 && i <= 16 ? 0.4 + 0.9 * easeOut(crashU) : 0;
  const svBlock = i === 17 || (i === 18 && t < tBurst) ? 1 : 0;
  const burstU = i === 18 ? (t - tBurst) / 0.9 : i === 19 ? 1.2 + (t - T("S19")) : -1;
  return (
    <>
      <Store sign="ELECTRONICS" />
      {/* the TV (and its price tag) */}
      {i === 1 || i === 22 ? (
        <group position={[CT[0] - 0.05, ty, CT[2] - 0.05]} rotation={tvRot} scale={[1, squash, 1]}><TV p={[0, 0, 0]} /></group>
      ) : tvAfter ? (
        <group position={[CT[0] - 0.05, TOP, CT[2] - 0.05]} rotation={[0, 0.25, 0]}><TV p={[0, 0, 0]} on={dark ? 0.3 : 1} screen={dark ? ["STILL", "PAYING"] : ["BIG TV"]} screenBg={dark ? "#c01818" : "#ffd23a"} /></group>
      ) : null}
      {i === 1 ? <Dust p={[CT[0], TOP + 0.02, CT[2] + 0.1]} u={(tt - tHit) / 0.6} n={16} r={1.1} /> : null}
      {i >= 5 && i <= 21 ? (
        <group position={[CT[0] + 0.55, i === 5 ? lerp(TAG_Y + 1.4, TAG_Y, easeOut(clamp((t - T("S05")) / 0.14))) : TAG_Y, CT[2] + 0.12]} rotation={[0, 0.25, i === 5 ? 0.15 * Math.exp(-(t - tTag) * 6) * Math.sin((t - tTag) * 30) : 0.05]}>
          <Label p={[0, 0, 0]} text={["$5,000"]} w={0.62} h={0.3} bg={PAL.debt} fg="#fff4c8" glow={0.3} />
        </group>
      ) : null}
      <Reader p={RD} lit={i === 2 ? clamp((t - tSwipe) / 0.25) : 0} />
      {i === 2 ? <Card p={[RD[0] + lerp(-0.25, 0.25, easeOut(clamp((t - tSwipe) / 0.25))), TOP + 0.13, RD[2]]} r={[0, Math.PI / 2, 0]} s={1.2} /> : null}
      {/* the card close-up with the 22 % stamp (S06) */}
      {i === 6 ? (
        <group position={[0.05, 1.25, 1.0]}>
          <Card p={[0, 0, 0]} s={3.2} r={[0, 0, 0.08]} />
          <Stamp p={[0.05, -0.02, 0.05]} text="22% APR" u={clamp((t - tStamp + 0.12) / 0.25)} w={0.42} />
        </group>
      ) : null}
      {/* the counter calendar: explodes into YEAR pages (S03) */}
      {i <= 2 ? <FlipCalendar p={[CAL[0], TOP + 0.45, CAL[2]]} w={0.7} h={0.6} title="YEAR" value="1" /> : null}
      {i === 3 || i === 4 ? (
        <>
          <Dust p={[CAL[0], TOP + 0.6, CAL[2] + 0.1]} u={(t - tBoom) / 0.5} n={12} r={0.8} c="#fffaf0" />
          {Array.from({ length: 19 }, (_, k) => {
            const q = pagePos(k, t);
            if (!q) return null;
            const u = (t - tBoom - k * 0.05) / 0.9;
            return <Label key={k} p={q} text={["YEAR", String(k + 1)]} w={0.42} h={0.34} bg="#fffaf0" fg={k >= 17 ? "#c01818" : "#16121c"} r={[0.6 * Math.sin(u * 7 + k), 0.8 * Math.sin(u * 5 + k), 0.9 * Math.sin(u * 6 + k)]} />;
          })}
          {i === 4 ? Array.from({ length: 10 }, (_, k) => {
            const u = ((t - tNine + 0.12) * 0.45 + k / 10) % 1;
            return <Label key={`f${k}`} p={rainPos(k, t)} text={["YEAR", String(10 + (k % 10))]} w={0.3} h={0.24} bg="#fffaf0" fg="#c01818" r={[0.5 * Math.sin(u * 9 + k), 0.7 * Math.sin(u * 6 + k), 0.8 * Math.sin(u * 7 + k)]} />;
          }) : null}
        </>
      ) : null}
      {/* the pay box, the coin toss (S07), the split (S10) */}
      <PayBox p={PB} yaw={0.5} lit={i === 10 ? 0.8 : 0} />
      {i === 7 ? <Coin3 p={[lerp(P_PAY[0] - 0.25, PB[0] + 0.08, clamp((t - T("S07") - 0.2) / 0.5)), 1.35 + 0.5 * Math.sin(Math.PI * clamp((t - T("S07") - 0.2) / 0.5)), lerp(P_PAY[2] - 0.1, PB[2] + 0.12, clamp((t - T("S07") - 0.2) / 0.5))]} r={[t * 9, 0, t * 5]} s={1.4} /> : null}
      {i === 10 ? Array.from({ length: 9 }, (_, k) => <Coin3 key={k} p={splitPos(k, t)} r={[t * 9 + k, k, t * 6]} s={1.3} />) : null}
      {i >= 7 && i <= 9 ? <Label p={BILL} r={[0, 0.2, 0]} text={["MINIMUM DUE", "$142"]} w={0.62} h={0.34} bg="#fff4c8" fg={PAL.debt} border={PAL.debt} /> : null}
      {i === 10 ? <Label p={[PB[0] - 0.6, 2.05, PB[2] + 0.2]} r={[0, 0.3, 0]} text={["MOSTLY", "INTEREST"]} w={0.8} h={0.36} bg={PAL.debt} fg="#fff4c8" glow={0.1} /> : null}
      {/* the INTEREST jar and the OWE block */}
      <TallJar p={IJ} fill={jarFill} label="INTEREST" glow={jarGlow} />
      {i === 15 && crashU > 0 && crashU < 1 ? Array.from({ length: 24 }, (_, k) => <Coin3 key={k} p={crashPos(k, t)} r={[t * 9 + k, k, t * 7]} s={1.5} />) : null}
      {pile > 0 ? <CoinPile p={PILE} r={pile * 0.9} h={pile * 0.75} coins={90} /> : null}
      {i === 15 ? <Label p={[PILE[0] + 0.6, pile * 0.75 + 0.2, PILE[2] + 0.9]} r={[0, 0.35, 0]} text={["+$8,100", "EXTRA"]} w={0.9} h={0.42} bg={PAL.debt} fg="#fff4c8" glow={0.1} /> : null}
      <DebtBlock p={OB} text={["OWE", owe]} chip={i === 12 ? clamp((t - tChip) / 0.6) : 0} squash={i === 13 ? 0.15 * Math.abs(Math.sin(t * 14)) : 0} glow={i === 12 ? 0.25 : 0} />
      {/* the wall calendar: years race in the dark */}
      {i >= 17 && i <= 19 ? <FlipCalendar p={WCAL} title="YEAR" value="3" sub="$200 A MONTH" color={PAL.cash} /> : <FlipCalendar p={WCAL} title="YEAR" value={String(year)} prev={i === 14 && year > 1 ? String(year - 1) : undefined} flip={i === 14 ? (t * 9) % 1 : 1} sub={year >= 19 ? "STILL PAYING" : "PAYING THE MINIMUM"} color={year >= 19 ? "#c01818" : undefined} />}
      {/* Saver's route: $200 a month, block bursts, DONE under 3 years */}
      {svBlock ? <DebtBlock p={SB} size={[1.4, 1.4, 0.9]} text={["OWE", "$5,000"]} squash={ss(tSv - 0.05, tSv + 0.05, t) - ss(tSv + 0.1, tSv + 0.3, t)} /> : null}
      {i === 17 || i === 18 ? <Label p={[SB[0] + 0.75, 1.55 + 1.2 * (1 - ss(tSv - 0.3, tSv, t)), SB[2] + 0.55]} text={["$200/MO"]} w={0.8} h={0.28} bg={PAL.cash} fg="#fff4c8" glow={0.1} /> : null}
      <Burst p={SB} u={burstU} n={22} r={2.0} arc={BURST_ARC} />
      {i === 19 ? <Stamp p={[P_SV[0] + 0.8, 0.78, P_SV[2] + 0.9]} text="DONE: UNDER 3 YEARS" u={clamp((t - tDone + 0.1) / 0.25)} w={0.62} color={PAL.cash} r={[0, 0, -0.06]} /> : null}
      {/* cobwebs in the dark years */}
      {dark ? <Label p={[CT[0] - 0.65, TOP + 1.15, CT[2] + 0.1]} r={[0, 0.25, 0.3]} text={["~ ~ ~"]} w={0.4} h={0.14} bg="#e8e4f0" fg="#9a96a8" /> : null}
      {actors}
    </>
  );
};


// ------------------------------------------------------------------ QA (tools/story_qa.mjs): every frame, props vs the actors' head/torso boxes
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const MINTRAP_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = MINTRAP_SHOTS.find((s) => t >= s.a && t < s.b) ?? MINTRAP_SHOTS[MINTRAP_SHOTS.length - 1];
  const i = idx(sh.id);
  const actors: Box[] = [];
  const sp = i >= 7 && i <= 11 ? P_PAY : i === 12 ? P_LOOK : i === 13 ? P_PUSH : i >= 14 && i <= 16 ? P_SAD : P_SP;
  if (!(i === 6 || (i >= 17 && i <= 19))) actors.push(...actorBoxes("Spender", sp));
  if (i >= 17 && i <= 19) actors.push(...actorBoxes("Saver", P_SV));
  if (i === 13) actors.push({ name: "Spender.hands", c: [P_PUSH[0] + 0.58, 1.0, P_PUSH[2]], h: [0.1, 0.12, 0.26] }); // PC: palms at ~0.68 m forward (arms 1.55 + lean): contact, not inside
  const props: Box[] = [];
  if (i === 3 || i === 4) for (let k = 0; k < 19; k++) { const q = pagePos(k, t); if (q) props.push(box(`page${k}`, q, [0.22, 0.22, 0.22])); }
  if (i === 4) for (let k = 0; k < 10; k++) props.push(box(`rain${k}`, rainPos(k, t), [0.16, 0.16, 0.16]));
  if (i === 10) for (let k = 0; k < 9; k++) props.push(box(`coin${k}`, splitPos(k, t), [0.09, 0.09, 0.09]));
  if (i === 15) for (let k = 0; k < 24; k++) props.push(box(`crash${k}`, crashPos(k, t), [0.11, 0.11, 0.11]));
  const bu = i === 18 ? (t - tBurst) / 0.9 : i === 19 ? 1.2 + (t - T("S19")) : -1;
  if (bu > 0 && bu < 1.6) for (let k = 0; k < 22; k++) { const q = burstPos(SB, bu, k, 22, 2.0, BURST_ARC); const hs = burstHalf(k); props.push(box(`cube${k}`, [q[0], Math.max(hs, q[1]), q[2]], [hs, hs, hs])); }
  if (i >= 5 && i <= 21) props.push(box("tag$5000", [CT[0] + 0.55, TAG_Y, CT[2] + 0.12], [0.32, 0.16, 0.08]));
  if (i >= 7 && i <= 9) props.push(box("bill", BILL, [0.32, 0.18, 0.08]));
  if (i === 10) props.push(box("mostlyInterest", [PB[0] - 0.6, 2.05, PB[2] + 0.2], [0.42, 0.19, 0.12]));
  if (i === 19) props.push(box("doneStamp", [P_SV[0] + 0.8, 0.78, P_SV[2] + 0.9], [0.31, 0.1, 0.05])); // PC fix: off his raised arm / the burst
  if (i === 17 || i === 18) props.push(box("$200", [SB[0] + 0.75, 1.55, SB[2] + 0.55], [0.41, 0.15, 0.05]));
  if (i === 1 || i === 2 || i >= 20) props.push(box("TV", [CT[0] - 0.05, TOP + 0.5, CT[2] - 0.05], [0.78, 0.5, 0.2]));
  props.push(box("payBox", [PB[0], 0.75, PB[2]], [0.32, 0.75, 0.24]), box("jar", [IJ[0], 0.8, IJ[2]], [0.46, 0.8, 0.46]), box("oweBlock", [OB[0], 0.9, OB[2]], [0.92, 0.9, 0.52]), box("counter", [CT[0], 0.48, CT[2]], [1.06, 0.48, 0.41]));
  if (i >= 15 && i <= 16) props.push(box("pile", [PILE[0], 0.5, PILE[2]], [1.15, 0.5, 1.15]));
  if (i === 15) props.push(box("extraLabel", [PILE[0] + 0.6, 1.2, PILE[2] + 0.9], [0.46, 0.22, 0.06])); // PC fix: S16 drops the sign (antenna overlapped it on the slam)
  if (i === 17 || i === 18) props.push(box("saverBlock", [SB[0], 0.7, SB[2]], [0.72, 0.7, 0.47]));
  return { actors, props };
};

// ------------------------------------------------------------------ overlay: hook text from frame 0 (and on the loop shot)
const overlay = (t: number) => (
  <>
    <HookText text="19 YEARS TO PAY OFF A TV" t={t} until={lineEnd(1) + 0.25} />
    {t >= tLoop ? <HookText text="19 YEARS TO PAY OFF A TV" t={t} until={99} /> : null}
    <WordCaption words={WORDS} t={t} />
  </>
);

export const MINTRAP_SPEC: FinSpec = {
  slug: "minimum-payment-trap",
  shots: MINTRAP_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene,
  counter: () => null,
  tag: (t, s) => (idx(s.id) >= 5 && idx(s.id) <= 19 ? "EXAMPLE" : null),
  bg: "#6a5ae8",
  overlay,
};

// ------------------------------------------------------------------ audio: upbeat bed from 0 s, SFX on impacts and payoffs
export const MINTRAP_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -2 }, { t: tHit - 0.02, sfx: "impact", db: 0 }, { t: tHit, sfx: "thud", db: -2 }, { t: tHit + 0.04, sfx: "crash", db: -10 },
    { t: tSwipe + 0.02, sfx: "slide", db: -2 }, { t: tSwipe + 0.22, sfx: "beep", db: -6 }, { t: tSwipe + 0.3, sfx: "cash", db: -2 },
    { t: tBoom - 0.02, sfx: "boom", db: -3 }, { t: tBoom + 0.05, sfx: "paper", db: -4 },
    { t: tNine - 0.02, sfx: "impact", db: 0 }, { t: tNine + 0.05, sfx: "gasp", db: -6 },
    { t: tTag, sfx: "thud", db: -2 }, { t: tStamp, sfx: "stamp", db: -2 },
    { t: T("S07") + 0.2, sfx: "pop", db: -8 }, { t: T("S08"), sfx: "paper", db: -8 }, { t: T("S09") + 0.05, sfx: "ding", db: -8 },
    { t: tWrong - 0.03, sfx: "buzz", db: -2 }, { t: tWrong + 0.05, sfx: "coins", db: -4 }, { t: T("S11") + 0.1, sfx: "metal", db: -8 },
    { t: tChip + 0.3, sfx: "drop", db: -8 }, { t: T("S13") + 0.1, sfx: "rumble", db: -8 },
    { t: tYears0, sfx: "clock", db: -6 }, { t: tYears0 + 0.05, sfx: "tick", db: -8 },
    { t: tCrash - 0.05, sfx: "crash", db: 0 }, { t: tCrash, sfx: "coins", db: -2 }, { t: tCrash + 0.3, sfx: "thud", db: -4 },
    { t: T("S16") + 0.05, sfx: "fail", db: -4 },
    { t: tSv - 0.02, sfx: "punch", db: 0 }, { t: tBurst - 0.02, sfx: "boom", db: -2 }, { t: tBurst + 0.05, sfx: "crash", db: -6 },
    { t: tDone, sfx: "stamp", db: -2 }, { t: tDone + 0.1, sfx: "success", db: -4 },
    { t: T("S21") + 0.04, sfx: "impact", db: -4 },
    { t: DURATION / 30 - 0.35, sfx: "whoosh", db: -2 },
  ],
};

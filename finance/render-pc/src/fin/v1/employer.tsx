// FORMAT v1, style S3 POV-YOU: employer-match. "POV: your boss just offered you 1,500 dollars of free money."
// The lens is YOU, seated at your desk; the boss (TELLER) talks across the desk to the lens, Spender sits at the next desk.
// Want: free money from a match. Trouble: Spender skips it. Open loop (~59 %): "Then the first statements arrive..." over
// two sealed STATEMENT envelopes. Twist (~74 %): yours: $3,000 + $1,500 from your boss; Spender's: $0. Hedge: plans
// differ, some make you wait to keep it (vesting). Loops to frame 0 (the boss leaning in with the card).
import React from "react";
import { SPENDER, TELLER } from "../../library/characters";
import { clamp, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import type { Look } from "../../blocky/Blocky";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/employer_match_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { BigBlock, CoinStack, Hall, Label, PAL } from "../props";
import { FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import { actorBoxes, Coin3, creep, Debris, HookText, shotsOf, TallJar, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
/** story beat of a shot id: the shots added after the first plan map onto the beat they extend */
const SEQ: Record<string, number> = { S17: 2, S18: 3, S19: 7, S20: 8, S21: 12 };
const seq = (id: string) => SEQ[id] ?? idx(id);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; the lens = you, seated at +z)
const DESK: V3 = [0, 0, 0.15]; // your desk (the boss stands behind it)
const DESK_H = 0.75;
const P_B: V3 = [0, 0, -0.85]; // the boss
const DESK2: V3 = [2.3, 0, 0.18]; // Spender's desk
const P_SP: V3 = [2.3, 0, -0.85];
const BIN: V3 = [3.15, 0, 0.1];
const YOU_EYE: V3 = [0, 1.18, 1.55]; // "you": seated eye height
const STK_Y: V3 = [-0.22, DESK_H, 0.32]; // your coin stack
const STK_B: V3 = [0.22, DESK_H, 0.32]; // the boss's stack
const JAR: V3 = [0.58, DESK_H, 0.22];
const PAY: V3 = [-0.5, DESK_H + 0.17, 0.1];
const BOARD: V3 = [0, 2.35, -2.45];
const ENV_Y: V3 = [-0.05, DESK_H + 0.15, 0.25]; // your STATEMENT envelope (standing)
const ENV_S: V3 = [DESK2[0], DESK_H + 0.15, DESK2[2] + 0.12];
const VEST: V3 = [-0.62, 1.62, -1.0]; // the PLANS DIFFER sign (on a stand, left of the boss)
const BFACE: V3 = [P_B[0], FACE - 0.02, P_B[2]];
const SFACE: V3 = [P_SP[0], FACE - 0.05, P_SP[2]];

// key times
const tWink = 0.62;
const tDrop = T("S04") + 0.1; // the boss's coins drop on his stack
const tToss = T("S08") + 0.25; // Spender tosses the form
const tEnv = T("S09") + 0.05; // the statements thud down
const tBurst = T("S11") + 0.05;
const tPlus = W(6, "plus");
const tZero = T("S13") + 0.08;

// the card the boss pushes at the lens (frame 0 and the loop shot): in front of his right hand, clear of his head box
const cardAt = (i: number, t: number): V3 => {
  const t0 = i === 16 ? T("S16") : 0;
  const u = easeOut(clamp((t - t0 + 0.25) / 0.6));
  return [0.26, FACE - 0.3, lerp(-0.35, -0.17, u)];
};
// the form Spender throws in the bin (S08)
const formAt = (t: number): V3 => {
  const u = clamp((t - tToss) / 0.45);
  return [lerp(P_SP[0] + 0.35, BIN[0], u), lerp(1.05, 0.62, u) + 0.5 * Math.sin(Math.PI * u), lerp(P_SP[2] + 0.5, BIN[2], u)];
};

// ------------------------------------------------------------------ actors (shared by the scene and the clip check)
type Actor = { name: string; look: Look; pose: Pose; emo: Emotion; s: number; seed: number };
const actorsAt = (i: number, t: number): Actor[] => {
  const out: Actor[] = [];
  // the boss, always behind your desk, facing you (the lens)
  {
    let pose: Pose = { ...stand(P_B[0], P_B[2], yawTo(P_B, YOU_EYE), SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 1 || i === 2 || i === 16) {
      const t0 = i === 16 ? T("S16") : 0;
      const lean = easeOut(clamp((t - t0 + 0.25) / 0.6));
      pose = { ...pose, pitch: 0.12 * lean, armR: 1.45, outR: 0.12, armL: 0.35 };
      emo = i === 16 ? "happy" : t < tWink ? "joy" : "sly"; // frame 0 joy -> sly by 0.62 s (an emotion change inside 1.5 s)
    }
    if (i === 3 || i === 4) { pose = { ...pose, armR: lerp(0.9, 1.25, ss(tDrop - 0.3, tDrop, t)), outR: 0.18 }; emo = "happy"; }
    if (i === 6) { pose = { ...pose, armL: 2.3, outL: 0.25, headYaw: 0.35 }; emo = "curious"; } // points up at the MATCH board
    if (i >= 9 && i <= 12) emo = i >= 11 ? "joy" : "sly";
    if (i === 14 || i === 15) { pose = { ...pose, armR: 1.75, outR: -0.1 + 0.18 * Math.sin(t * 14) }; emo = "curious"; } // finger wag
    out.push({ name: "Boss", look: TELLER, pose, emo, s: SC, seed: 6 });
  }
  // Spender at the next desk
  {
    let pose: Pose = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, YOU_EYE) * 0.6 + yawTo(P_SP, [P_SP[0], 0, 5]) * 0.4, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 8) { const u = ss(tToss - 0.25, tToss, t); pose = { ...pose, armR: lerp(0.4, 1.7, u) - 0.9 * ss(tToss, tToss + 0.3, t), outR: 0.35 }; emo = "sly"; }
    if (i === 9 || i === 10) emo = "curious";
    if (i === 13) { const s = ss(tZero - 0.05, tZero + 0.12, t); pose = { ...pose, armL: lerp(0.4, 2.2, s), armR: lerp(0.4, 2.2, s), outL: 0.8 * s, outR: 0.8 * s, ant: s }; emo = s > 0.3 ? "shock" : "curious"; }
    if (i >= 14) { pose = { ...pose, headPitch: 0.3, armL: 0.1, armR: 0.1, ant: -1 }; emo = "sad"; }
    out.push({ name: "Spender", look: SPENDER, pose, emo, s: SC, seed: 2 });
  }
  return out;
};

// ------------------------------------------------------------------ lenses (you are the camera: mostly from your seat)
const hook = creep(BFACE, [P_B[0] + 0.07, FACE + 0.02, P_B[2] + 1.08], { fov: 50, face: 0.6, push: 0.04, shake: shakeAt([0.02], 0.03) });
const LENS = {
  S01: hook,
  S02: creep([0.26, FACE - 0.3, -0.17], [0.2, FACE - 0.22, 0.5], { fov: 44, face: 0.55 }),
  S03: creep([0, DESK_H + 0.15, 0.3], [0, 1.32, 1.4], { fov: 50, face: 0.6 }),
  S04: creep([0.1, DESK_H + 0.06, 0.32], [0.15, 0.98, 0.88], { fov: 40, face: 0.55, shake: shakeAt([tDrop + 0.25], 0.02) }),
  S05: creep(PAY, [PAY[0] + 0.12, PAY[1] + 0.12, PAY[2] + 0.85], { fov: 44, face: 0.5 }),
  S06: creep([0, 1.95, -1.5], YOU_EYE, { fov: 54, face: 0.5 }),
  S07: creep([JAR[0], DESK_H + 0.3, JAR[2]], [JAR[0] - 0.15, 1.12, JAR[2] + 0.95], { fov: 44, face: 0.55 }),
  S08: creep(SFACE, [0.75, 1.22, 1.55], { fov: 46, face: 0.5 }),
  S09: creep([1.1, DESK_H + 0.2, 0.1], [0.35, 1.7, 2.6], { fov: 56, face: 0.55, mood: "whisper", shake: shakeAt([tEnv + 0.2], 0.04) }),
  S10: creep(ENV_Y, [ENV_Y[0] + 0.05, ENV_Y[1] + 0.12, ENV_Y[2] + 0.85], { fov: 46, face: 0.5, mood: "whisper", push: 0.12, shake: (t: number) => 0.005 + 0.004 * Math.abs(Math.sin(t * 31)) }),
  S11: creep([-0.12, DESK_H + 0.2, 0.25], [-0.1, 1.08, 1.05], { fov: 46, face: 0.5, shake: shakeAt([tBurst], 0.05) }),
  S12: { ...creep([0.15, DESK_H + 0.3, 0.25], [0.08, 1.12, 1.1], { fov: 50, face: 0.5 }), fovAt: slam(tPlus, 54, 46, 0.14), shake: shakeAt([tPlus], 0.06) },
  S13: creep([P_SP[0], 1.15, P_SP[2] + 0.3], [1.55, 1.3, 1.75], { fov: 50, face: 0.5, shake: shakeAt([tZero], 0.04) }),
  S14: creep([0, 1.3, -0.7], YOU_EYE, { fov: 52, face: 0.5 }),
  S15: creep(VEST, [VEST[0] + 0.15, VEST[1] - 0.05, VEST[2] + 1.3], { fov: 44, face: 0.5 }),
  S16: hook,
  S17: creep(BFACE, [P_B[0] - 0.2, FACE + 0.05, P_B[2] + 1.25], { fov: 48, face: 0.55 }),
  S18: creep(STK_Y, [STK_Y[0] - 0.08, DESK_H + 0.3, STK_Y[2] + 0.75], { fov: 44, face: 0.5 }),
  S19: creep([JAR[0], DESK_H + 0.45, JAR[2]], [JAR[0] + 0.1, DESK_H + 0.5, JAR[2] + 0.85], { fov: 44, face: 0.5 }),
  S20: creep(SFACE, [P_SP[0] - 0.3, FACE, P_SP[2] + 1.15], { fov: 48, face: 0.55 }),
  S21: creep([0.03, DESK_H + 0.17, 0.25], [0.03, 1.15, 1.4], { fov: 50, face: 0.5 }),
};
export const EMPLOYER_V1_SHOTS = shotsOf(PLAN, LENS);

// ------------------------------------------------------------------ set pieces
const Desk: React.FC<{ p: V3 }> = ({ p }) => (
  <group>
    <BigBlock p={[p[0], DESK_H - 0.06, p[2]]} size={[1.6, 0.06, 0.8]} color="#c8956a" text="" />
    {[-0.72, 0.72].map((dx) => <BigBlock key={dx} p={[p[0] + dx, 0, p[2]]} size={[0.08, DESK_H - 0.06, 0.7]} color="#a8754a" text="" />)}
  </group>
);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = seq(shot.id);
  void tau;
  const actors = actorsAt(i, t);
  const card = i === 1 || i === 2 || i === 16;
  const bossCoins = i < 4 ? 0 : i === 4 ? Math.round(3 * ss(tDrop, tDrop + 0.5, t)) : 3;
  const coinFall = i === 4 && t < tDrop + 0.5 ? clamp((t - tDrop + 0.2) / 0.5) : -1;
  const jarFill = i < 7 ? 0.1 : i === 7 ? lerp(0.1, 0.75, ss(T("S07") + 0.1, T("S07") + 0.9, t)) : 0.75;
  const envDown = i < 9 ? -1 : i === 9 ? clamp((t - tEnv + 0.25) / 0.25) : 1;
  const envY = (y: number) => (envDown < 0 ? -9 : y + 0.9 * (1 - envDown * envDown));
  const shake = i === 10 ? 0.012 * Math.sin(t * 41) : 0;
  const yoursOpen = i >= 11 && i <= 15 ? clamp((t - (i === 11 ? tBurst : 0)) / 0.15) : 0;
  const plus = i === 12 ? easeOut(clamp((t - tPlus) / 0.18)) : i >= 13 && i <= 15 ? 1 : 0;
  const zeroOpen = i === 13 ? clamp((t - tZero) / 0.15) : i === 14 || i === 15 ? 1 : 0;
  const form = i === 8 && t >= tToss && t < tToss + 0.45 ? formAt(t) : null;
  return (
    <>
      <Hall W={9} back={-2.6} front={4.5} H={3.6} wall="#7fb2f0" stripe="#ffd23a" floorA="#f4ecff" floorB="#e2d6fa" />
      <Desk p={DESK} />
      <Desk p={DESK2} />
      <BigBlock p={BIN} size={[0.34, 0.5, 0.34]} color="#5a6278" text="" />
      {i >= 3 && i <= 15 ? <Label p={BOARD} text={["MATCH: 50%", "UP TO 6% OF PAY"]} w={1.9} h={0.62} bg="#1f9e4f" fg="#ffffff" /> : null /* off in the frame-0 / loop close-ups: nothing behind the hook text */}
      <Label p={[2.3, 2.2, -2.45]} text={["PAYDAY"]} w={0.9} h={0.3} bg="#ffd23a" fg="#16121c" />
      {/* your desk: the match stacks, the pay label, your jar */}
      <CoinStack p={STK_Y} n={6} seed={1} />
      {bossCoins > 0 ? <CoinStack p={STK_B} n={bossCoins} seed={2} /> : null}
      {coinFall >= 0 ? <Coin3 p={[STK_B[0], lerp(1.15, DESK_H + 0.04 + 0.014 * bossCoins, coinFall * coinFall), STK_B[2]]} r={[0.3, 0, 0.2]} /> : null}
      {i >= 3 && i <= 4 ? <Label p={[STK_Y[0], DESK_H + 0.26, STK_Y[2] - 0.12]} text={["YOU"]} w={0.24} h={0.1} bg="#ffffff" fg="#16121c" /> : null}
      {i >= 3 && i <= 4 ? <Label p={[STK_B[0], DESK_H + 0.26, STK_B[2] - 0.12]} text={["BOSS"]} w={0.24} h={0.1} bg="#ffd23a" fg="#16121c" /> : null}
      <Label p={PAY} text={["PAY", "$50,000/YR"]} w={0.42} h={0.24} r={[-0.15, 0.25, 0]} bg="#ffffff" fg="#16121c" />
      <TallJar p={JAR} fill={jarFill} label="YOU" r={0.1} h={0.36} color={PAL.cash} />
      {i >= 7 && i <= 8 ? <Label p={[JAR[0], DESK_H + 0.46, JAR[2]]} text={["YOU: $3,000"]} w={0.4} h={0.12} bg="#1f9e4f" fg="#ffffff" /> : null}
      {/* Spender's form into the bin */}
      {form ? <Label p={form} text={["MATCH?"]} w={0.22} h={0.15} r={[0.4, 0.6 * t, 0.3]} bg="#ffffff" fg="#16121c" /> : null}
      {/* the card the boss pushes at you */}
      {card ? <Label p={cardAt(i, t)} text={["+$1,500", "A YEAR"]} w={0.36} h={0.2} r={[0, -0.1, 0]} bg="#1f9e4f" fg="#ffffff" glow={0.2} /> : null}
      {/* the two STATEMENT envelopes: sealed (open loop), then yours bursts, then Spender's */}
      {envDown >= 0 && yoursOpen < 1 ? <group position={[ENV_Y[0] + shake, envY(ENV_Y[1]), ENV_Y[2]]}><Label p={[0, 0, 0]} text={["STATEMENT", "YOU"]} w={0.34} h={0.22} bg="#f4ecdc" fg="#16121c" /></group> : null}
      {envDown >= 0 && zeroOpen < 1 ? <group position={[ENV_S[0] - shake, envY(ENV_S[1]), ENV_S[2]]}><Label p={[0, 0, 0]} text={["STATEMENT", "SPENDER"]} w={0.34} h={0.22} bg="#f4ecdc" fg="#16121c" /></group> : null}
      {yoursOpen > 0 ? <Label p={[ENV_Y[0] - 0.12, ENV_Y[1] + 0.02, ENV_Y[2]]} text={["YOURS", "$3,000"]} w={0.3 * (0.6 + 0.4 * yoursOpen)} h={0.2 * (0.6 + 0.4 * yoursOpen)} bg="#ffffff" fg="#16121c" /> : null}
      {plus > 0 ? <Label p={[ENV_Y[0] + 0.24, ENV_Y[1] + 0.02 + 0.4 * (1 - plus), ENV_Y[2] + 0.02]} text={["+$1,500", "FROM BOSS"]} w={0.32} h={0.2} bg="#1f9e4f" fg="#ffffff" glow={0.25} /> : null}
      {i === 11 ? <Debris p={[ENV_Y[0], ENV_Y[1], ENV_Y[2]]} t={t} t0={tBurst} n={10} c={["#f4ecdc", "#ffd23a", "#1f9e4f"]} y0={DESK_H + 0.02} size={0.04} /> : null}
      {zeroOpen > 0 ? <Label p={[ENV_S[0], ENV_S[1] + 0.02, ENV_S[2]]} text={["SPENDER'S", "$0"]} w={0.44 * (0.6 + 0.4 * zeroOpen)} h={0.3 * (0.6 + 0.4 * zeroOpen)} bg="#d62a2a" fg="#ffffff" /> : null}
      {/* the hedge: plans differ / vesting */}
      {i >= 14 && i <= 15 ? <Label p={VEST} text={["PLANS DIFFER", "SOME MAKE YOU", "WAIT TO KEEP IT"]} w={0.62} h={0.46} bg="#ffd23a" fg="#16121c" /> : null}
      {i >= 14 && i <= 15 ? <BigBlock p={[VEST[0], 0, VEST[2] - 0.05]} size={[0.06, VEST[1] - 0.23, 0.06]} color="#3a3f58" text="" /> : null}
      {actors.map((a) => <Act key={a.name} look={a.look} pose={a.pose} emotion={a.emo} s={a.s} t={t} seed={a.seed} />)}
    </>
  );
};

// ------------------------------------------------------------------ clip check (tools/story_qa.mjs)
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const EMPLOYER_V1_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = EMPLOYER_V1_SHOTS.find((s) => t >= s.a && t < s.b) ?? EMPLOYER_V1_SHOTS[EMPLOYER_V1_SHOTS.length - 1];
  const i = seq(sh.id);
  const actors = actorsAt(i, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const props: Box[] = [
    box("desk", [DESK[0], DESK_H - 0.03, DESK[2]], [0.8, 0.03, 0.4]), box("desk2", [DESK2[0], DESK_H - 0.03, DESK2[2]], [0.8, 0.03, 0.4]),
    box("bin", [BIN[0], 0.25, BIN[2]], [0.17, 0.25, 0.17]), box("jar", [JAR[0], DESK_H + 0.18, JAR[2]], [0.1, 0.18, 0.1]),
    box("pay", PAY, [0.21, 0.12, 0.03]),
  ];
  if (i === 1 || i === 2 || i === 16) props.push(box("card", cardAt(i, t), [0.18, 0.1, 0.01]));
  if (i === 8 && t >= tToss && t < tToss + 0.45) props.push(box("form", formAt(t), [0.11, 0.08, 0.05]));
  if (i >= 9) props.push(box("envYou", ENV_Y, [0.17, 0.11, 0.02]), box("envSp", ENV_S, [0.17, 0.11, 0.02]));
  if (i >= 14 && i <= 15) props.push(box("vest", VEST, [0.31, 0.23, 0.02]));
  return { actors, props };
};

const overlay = (t: number) => (
  <>
    <HookText text={"POV: YOUR BOSS\nOFFERS YOU $1,500"} size={92} top={250} t={t} until={lineEnd(1) + 0.25} />
    {t >= T("S16") ? <HookText text={"POV: YOUR BOSS\nOFFERS YOU $1,500"} size={92} top={250} t={t} until={99} /> : null}
    <WordCaption words={WORDS} t={t} />
  </>
);
export const EMPLOYER_V1_SPEC: FinSpec = {
  slug: "employer-match",
  shots: EMPLOYER_V1_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene,
  counter: () => null,
  tag: (_t, s) => (seq(s.id) >= 3 && seq(s.id) <= 13 ? "EXAMPLE" : null),
  bg: "#7fb2f0",
  overlay,
};
export const EMPLOYER_V1_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -4 }, { t: 0.05, sfx: "ding", db: -6 }, { t: tWink, sfx: "pop", db: -8 },
    { t: tDrop + 0.2, sfx: "coins", db: -4 }, { t: T("S06") + 0.1, sfx: "pop", db: -8 }, { t: T("S07") + 0.2, sfx: "coins", db: -6 },
    { t: tToss, sfx: "paper", db: -4 }, { t: tToss + 0.45, sfx: "thud", db: -8 }, { t: tToss + 0.5, sfx: "laugh", db: -10 },
    { t: tEnv + 0.2, sfx: "thud", db: -2 }, { t: T("S09") + 0.1, sfx: "suspense", db: -8 }, { t: T("S10"), sfx: "heartbeat", db: -4 },
    { t: tBurst, sfx: "paper", db: -2 }, { t: tPlus - 0.02, sfx: "impact", db: 0 }, { t: tPlus + 0.05, sfx: "success", db: -4 },
    { t: tZero, sfx: "fail", db: -4 }, { t: T("S14") + 0.1, sfx: "tick", db: -8 },
    { t: END - 0.4, sfx: "whoosh", db: -6 },
  ],
};

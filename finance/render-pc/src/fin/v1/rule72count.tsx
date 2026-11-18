// FORMAT v1, style S6 COUNTDOWN: rule-of-72. "Three things that double. Number one is the scary one."
// A blocky GAME-SHOW stage: podiums #3 #2 #1 (#1 behind a red curtain), a big board that slams in (72 / RATE = YEARS TO
// DOUBLE). #3: Saver's savings at 6% (~12 years). #2: 8% (~9). Open loop (~50 %): "And number one... wait till you see
// who's holding it" (spotlight on the trembling curtain). Twist (~62-80 %): the curtain DROPS on Spender and his card at
// 24% (~3 years if nothing's paid); his OWE block doubles. "Same maths, wrong side. A shortcut, not a promise." Loops.
// Maths: sources.md (72/6 = 12, 72/8 = 9, 72/24 = 3; the card line assumes no payments; hedged on screen).
import React from "react";
import { SAVER, SPENDER } from "../../library/characters";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/rule_of_72_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { Hall, Label, PAL, Stamp } from "../props";
import { B, Card, FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import type { Shot } from "../hooks";
import { actorBoxes, creep, DebtBlock, Debris, shotsOf, Squash, sqAt, TallJar, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const POD: Record<3 | 2 | 1, V3> = { 3: [-2.0, 0, -0.6], 2: [0, 0, -0.6], 1: [2.0, 0, -0.6] };
const POD_H = 0.9;
const P_HOST: V3 = [0.7, 0, 1.3]; // Spender at the front of the stage (S01-S02, S16)
const P_SP1: V3 = [2.0, 0, 0.35]; // Spender at #1 after the reveal
const P_SV3: V3 = [-2.85, 0, 0.05];
const P_SV2: V3 = [-0.85, 0, 0.05];
const P_SV14: V3 = [0.35, 0, 0.6];
const BOARD: V3 = [0, 2.75, -2.3];
const CURTAIN: V3 = [2.0, 1.2, 0.95];
const OWE: V3 = [3.45, 0, -0.45]; // PC: clear of his arm on screen when it doubles

// ------------------------------------------------------------------ key times
const tNum = W(1, "number") + 0.02; // "Number one is the scary one": shock
const tDiv = W(2, "divide") + 0.02; // the board slams in
const t12 = W(3, "about");
const t9 = W(4, "about");
const tOpen = T("S09");
const tReveal = T("S11"); // the curtain flies up
const t3 = W(6, "if");
const tDouble = W(6, "double") + 0.02; // the OWE block doubles
const tStamp = W(7, "shortcut");
const tLoopShot = T("S16");

// ------------------------------------------------------------------ actors (shared by the scene and the QA)
type ActorAt = { name: string; look: typeof SPENDER; pose: Pose; emo: Emotion; seed: number; held?: { side: "L" | "R"; node: React.ReactNode } };
const actorsAt = (i: number, t: number): ActorAt[] => {
  const out: ActorAt[] = [];
  // ---- Spender: host spot (S01, S02, S16), hidden behind the curtain (S03-S10), at #1 after the reveal
  if (i <= 2 || i === 16) {
    const tw = Math.sin(t * 7);
    let pose: Pose = { ...stand(P_HOST[0], P_HOST[2], yawTo(P_HOST, [0.4, 0, 5]), SC), armR: 1.7 + 0.12 * tw, outR: 0.15, armL: 0.35, outL: 0.1, headYaw: 0.1 };
    let emo: Emotion = "sly";
    if (i === 2) {
      const d = ss(tNum - 0.05, tNum + 0.12, t);
      pose = { ...pose, armL: lerp(0.35, 2.2, d), outL: 0.8 * d, armR: lerp(1.7, 2.2, d), outR: 0.15 + 0.6 * d, pitch: -0.1 * d, ant: d };
      emo = d > 0.2 ? "shock" : "sly";
    }
    out.push({ name: "Spender", look: SPENDER, pose, emo, seed: 2, held: { side: "R", node: <Card p={[0, 0.04, 0.05]} r={[0.3, 0, Math.PI / 2 + 0.3 * tw]} s={1.6} /> } });
  } else if (i >= 11) {
    const big = ss(tDouble - 0.02, tDouble + 0.12, t);
    let pose: Pose = { ...stand(P_SP1[0], P_SP1[2], yawTo(P_SP1, [1.6, 0, 5]), SC), armR: 1.2, outR: 0.2, armL: 0.3, outL: 0.1 };
    let emo: Emotion = "shock";
    if (i === 11 || i === 12) { const u = i === 11 ? ss(tReveal + 0.2, tReveal + 0.4, t) : 1; pose = { ...pose, armL: lerp(0.3, 1.9, u), outL: 0.1 + 0.5 * u, ant: u, pitch: -0.08 * u }; }
    if (i >= 13) { pose = { ...pose, headPitch: 0.3 * big, armL: 0.2, armR: 0.6, pitch: 0.12 * big, ant: -big }; emo = big > 0.3 ? "sad" : "shock"; }
    out.push({ name: "Spender", look: SPENDER, pose, emo, seed: 2, held: { side: "R", node: <Card p={[0, 0.04, 0.05]} r={[0.3, 0, Math.PI / 2]} s={1.6} /> } });
  }
  // ---- Saver: #3 (S05-S06), #2 (S07-S09), beside his jar (S14)
  const sv = i === 3 || i === 5 || i === 6 ? P_SV3 : i >= 7 && i <= 9 ? P_SV2 : i === 14 ? P_SV14 : null;
  if (sv) {
    let pose: Pose = { ...stand(sv[0], sv[2], yawTo(sv, [sv[0] + 0.4, 0, 5]), SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "happy";
    if (i === 6) { pose = { ...pose, armL: 2.5, armR: 2.5, outL: 0.4, outR: 0.4, bob: -0.04 * Math.abs(Math.sin(t * 10)) }; emo = "joy"; }
    if (i === 8) { pose = { ...pose, armL: 0.95, armR: 0.95, outL: -0.25, outR: -0.25, headYaw: 0.15 * Math.sin(t * 2) }; emo = "happy"; }
    if (i === 9) { pose = { ...pose, headYaw: -0.9, armR: 0.9, outR: 0.2 }; emo = "curious"; }
    if (i === 14) { pose = { ...pose, armL: 1.3, outL: 0.5 }; emo = "happy"; }
    out.push({ name: "Saver", look: SAVER, pose, emo, seed: 4 });
  }
  return out;
};

// ------------------------------------------------------------------ moving props
/** S01/S16: a big "#3" countdown card whipping across in front of the lens (far side of Spender, clear of him) */
const whipPos = (t: number, t0: number): V3 | null => {
  const u = (t - t0) / 0.8;
  if (u <= 0 || u >= 1) return null;
  return [P_HOST[0] + lerp(-1.6, 1.8, u), 1.9 + 0.25 * Math.sin(Math.PI * u), P_HOST[2] + 0.55];
};
const curtainY = (t: number) => (t < tReveal ? CURTAIN[1] : CURTAIN[1] + 4.5 * clamp((t - tReveal) / 0.28) ** 2); // flies UP and out of frame (never through the floor or Spender)
const boardText = (t: number): string[] => (t < t12 ? ["72 ÷ RATE", "= YEARS TO DOUBLE"] : t < t9 ? ["72 ÷ 6%", "≈ 12 YEARS"] : t < t3 ? ["72 ÷ 8%", "≈ 9 YEARS"] : ["72 ÷ 24%", "≈ 3 YEARS"]);

// ------------------------------------------------------------------ lenses
const fc = (p: V3): V3 => [p[0], FACE - 0.05, p[2]];
const L: Record<string, Shot> = {
  S01: creep(fc(P_HOST), [P_HOST[0] + 0.3, FACE + 0.05, P_HOST[2] + 1.0], { fov: 50, face: 0.55, blur: 1.4 }),
  S02: { ...creep(fc(P_HOST), [P_HOST[0] - 0.3, FACE + 0.02, P_HOST[2] + 0.95], { fov: 48, face: 0.55, blur: 1.6 }), fovAt: slam(tNum, 52, 44, 0.12), shake: shakeAt([tNum], 0.05) },
  S03: { ...creep([-0.9, 1.0, -0.3], [-0.6, 1.7, 7.6], { fov: 56, face: 0.62 }), mood: "store" },
  S04: { ...creep(BOARD, [0, 2.4, 2.4], { fov: 50, face: 0.5 }), fovAt: slam(tDiv, 56, 48, 0.1), shake: shakeAt([tDiv], 0.06) },
  S05: creep([-2.4, 1.05, -0.25], [-1.9, 1.6, 2.8], { fov: 54, face: 0.5 }),
  S06: creep([-2.4, 1.25, -0.3], [-3.0, 1.75, 2.5], { fov: 54, face: 0.5 }),
  S07: creep([-0.4, 1.05, -0.25], [0.1, 1.6, 2.8], { fov: 54, face: 0.5 }),
  S08: creep([-0.4, 1.25, -0.3], [-1.0, 1.75, 2.5], { fov: 54, face: 0.5 }),
  S09: { ...creep([1.6, 1.35, 0.3], [0.9, 1.6, 4.0], { fov: 52, face: 0.5 }), mood: "whisper" },
  S10: { ...creep([2.0, 1.45, 0.72], [2.25, 1.55, 2.1], { fov: 50, face: 0.5 }), mood: "whisper" },
  S11: { ...creep([2.4, 1.05, -0.2], [1.7, 1.65, 3.8], { fov: 56, face: 0.5 }), fovAt: slam(tReveal, 62, 54, 0.12), shake: shakeAt([tReveal], 0.07) },
  S12: { ...creep(BOARD, [0, 2.4, 2.4], { fov: 50, face: 0.5 }), fovAt: slam(t3, 54, 48, 0.1), shake: shakeAt([t3], 0.04) },
  // PC: S13 frames Spender AND the doubling OWE block
  S13: { ...creep([2.8, 0.95, -0.3], [2.4, 1.55, 3.3], { fov: 58, face: 0.5 }), fovAt: slam(tDouble, 58, 52, 0.12), shake: shakeAt([tDouble], 0.07) },
  S14: { ...creep([1.7, 1.0, -0.2], [1.7, 1.9, 6.6], { fov: 58, face: 0.5 }), mood: "store" },
  S15: { ...creep(BOARD, [0, 2.4, 2.4], { fov: 50, face: 0.5 }), shake: shakeAt([tStamp], 0.04) },
  S16: creep(fc(P_HOST), [P_HOST[0] + 0.3, FACE + 0.05, P_HOST[2] + 1.0], { fov: 50, face: 0.55, blur: 1.4 }),
};
export const R72_SHOTS = shotsOf(PLAN, L);

// ------------------------------------------------------------------ scene
const Podium: React.FC<{ n: 3 | 2 | 1; lit: number; rate: string | null }> = ({ n, lit, rate }) => {
  const p = POD[n];
  const c = n === 1 ? "#c01818" : "#2e8a52";
  return (
    <group position={p}>
      <B s={[1.1, POD_H, 0.7]} p={[0, POD_H / 2, 0]} c="#2a2440" e={lit > 0 ? [c, 0.25 * lit] : undefined} />
      <Label p={[0, POD_H * 0.55, 0.36]} text={[`#${n}`]} w={0.62} h={0.42} bg={lit > 0 ? c : "#3a3458"} fg="#ffd23a" glow={0.3 * lit} />
      {rate ? <Label p={[0, POD_H + 0.22, 0.2]} text={[rate]} w={0.62} h={0.3} bg="#fff4c8" fg={c} /> : null}
      {lit > 0 ? <pointLight position={[0, 2.6, 1.2]} color={n === 1 ? "#ff6a5f" : "#9fffc8"} intensity={1.6 * lit} distance={4} decay={2} /> : null}
    </group>
  );
};
const scene = (t: number, shot: FinShot): React.ReactNode => {
  const i = idx(shot.id);
  const actors = actorsAt(i, t);
  const k = sqAt(t, [tNum, tReveal, tDouble, T("S06")]);
  const dim = i === 9 || i === 10;
  const boardDrop = t < tDiv && i !== 16 && i > 3 ? 3 : i <= 3 || i === 16 ? 3 : 1.6 * (1 - easeOut(clamp((t - tDiv) / 0.14)));
  const showBoard = i >= 4 && i <= 15;
  const tremble = i === 9 || i === 10 ? 0.03 * Math.sin(t * 40) * (0.5 + 0.5 * Math.sin(t * 3)) : 0;
  const bulge = i === 10 ? 0.08 * (0.5 + 0.5 * Math.sin(t * 9)) : 0;
  const jarFill3 = i === 6 ? lerp(0.45, 0.9, ss(t12, t12 + 0.5, t)) : 0.45;
  const oweScale = i >= 13 ? lerp(1, 1.26, easeOut(clamp((t - tDouble) / 0.15))) : 1; // 1.26^3 = 2: the volume doubles
  const whip = i === 1 ? whipPos(t, 0.05) : i === 16 ? whipPos(t, tLoopShot + 0.1) : null;
  return (
    <>
      <Hall W={11} back={-3.0} front={7} wall={dim ? "#1e1640" : "#3a2a7a"} stripe="#ffd23a" floorA="#2a2448" floorB="#3a3260" />
      <Label p={[0, 3.75, -2.95]} text={["3 THINGS THAT DOUBLE"]} w={3.6} h={0.4} bg="#16121c" fg="#ffd23a" glow={0.5} />
      <Podium n={3} lit={i === 5 || i === 6 || i === 14 ? 1 : i === 3 ? 0.5 : 0} rate={i >= 5 ? "6%" : null} />
      <Podium n={2} lit={i === 7 || i === 8 ? 1 : i === 3 ? 0.5 : 0} rate={i >= 7 ? "8%" : null} />
      <Podium n={1} lit={i >= 11 ? 1 : i === 2 ? 0.5 + 0.5 * Math.sin(t * 20) : i === 3 ? 0.5 : 0} rate={i >= 11 ? "24%" : null} />
      {/* Saver's savings jar on #3 (S05-S06), on #2 (S07-S09), on the floor beside him (S14) */}
      {i >= 5 && i <= 9 ? <TallJar p={[(i <= 6 ? POD[3] : POD[2])[0], POD_H, -0.6]} fill={i <= 6 ? jarFill3 : 0.6} label="SAVINGS" r={0.22} h={0.6} color={PAL.cash} /> : null}
      {i === 14 ? <TallJar p={[-0.35, 0, 0.05]} fill={0.9} label="SAVINGS" r={0.3} h={0.9} color={PAL.cash} /> : null}
      {i === 6 ? <Stamp p={[-1.55, 1.95, -0.35]} text="x2" u={clamp((t - t12 - 0.3) / 0.25)} w={0.45} color={PAL.cash} /> : null}
      {i === 14 ? <><Stamp p={[-0.35, 1.25, 0.2]} text="x2" u={1} w={0.42} color={PAL.cash} /><Stamp p={[OWE[0], 1.55, OWE[2] + 0.4]} text="x2" u={1} w={0.42} /></> : null}
      {/* the curtain over #1: trembles in the open loop, drops on the reveal */}
      {i <= 11 && curtainY(t) < 6 ? (
        <group position={[CURTAIN[0] + tremble, curtainY(t), CURTAIN[2] + bulge]}>
          <B s={[1.6, 2.4, 0.06]} p={[0, 0, 0]} c="#a01020" rough={0.8} />
          <Label p={[0, 0.35, 0.04]} text={["#1"]} w={0.8} h={0.55} bg="#16121c" fg="#ff6a5f" glow={0.6 + (dim ? 0.4 * Math.sin(t * 6) : 0)} />
        </group>
      ) : null}
      {dim ? <spotLight position={[2.0, 4.2, 2.6]} target-position={[2.0, 1.2, 0.7]} angle={0.35} penumbra={0.5} intensity={6} color="#ffe6c0" /> : null}
      {/* the OWE block next to #1: doubles (volume x2) on "double" */}
      {i >= 11 ? (
        <group position={OWE} scale={[oweScale, oweScale, oweScale]}>
          <DebtBlock p={[0, 0, 0]} size={[0.9, 0.9, 0.6]} text={i >= 13 && t > tDouble ? ["OWE", "x2"] : ["OWE"]} squash={i === 13 ? 0.2 * Math.exp(-(t - tDouble) * 8) : 0} />
        </group>
      ) : null}
      {i === 13 ? <Stamp p={[OWE[0], 1.55, OWE[2] + 0.45]} text="x2" u={clamp((t - tDouble - 0.1) / 0.25)} w={0.42} /> : null}
      <Debris p={[OWE[0], 0.4, OWE[2] + 0.3]} t={t} t0={tDouble} n={10} y0={0} c={["#d62a2a", "#fff4c8"]} />
      <Debris p={[CURTAIN[0] - 0.9, 0.2, CURTAIN[2] + 0.2]} t={t} t0={tReveal + 0.05} n={10} y0={0} c={["#ffd23a", "#ff6a5f"]} />
      {/* the board */}
      {showBoard ? (
        <group position={[BOARD[0], BOARD[1] + boardDrop, BOARD[2]]}>
          <Label p={[0, 0, 0]} text={boardText(t)} w={2.3} h={1.0} bg="#16121c" fg="#ffffff" border="#ffd23a" glow={0.35} />
        </group>
      ) : null}
      {i === 15 ? <Stamp p={[BOARD[0], BOARD[1] - 0.05, BOARD[2] + 0.1]} text="SHORTCUT, NOT A PROMISE" u={clamp((t - tStamp + 0.05) / 0.25)} w={2.1} r={[0, 0, -0.08]} /> : null}
      {i === 2 ? <Label p={[P_HOST[0] - 0.9, 2.3, P_HOST[2] - 1.4]} text={["#1"]} w={0.7} h={0.5} bg={Math.sin(t * 20) > 0 ? "#c01818" : "#16121c"} fg="#ffd23a" glow={0.5} /> : null}
      {whip ? <Label p={whip} r={[0, 0, -0.3]} text={["#3"]} w={0.9} h={0.7} bg="#ffd23a" fg="#16121c" /> : null}
      {actors.map((a) => (
        <Squash key={a.name} p={[a.pose.x, 0, a.pose.z]} k={a.name === "Spender" ? k : sqAt(t, [T("S06")])}>
          <Act look={a.look} pose={a.pose} emotion={a.emo} s={SC} t={t} seed={a.seed} held={a.held} />
        </Squash>
      ))}
    </>
  );
};

// ------------------------------------------------------------------ QA (tools/story_qa.mjs)
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const R72_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = R72_SHOTS.find((s) => t >= s.a && t < s.b) ?? R72_SHOTS[R72_SHOTS.length - 1];
  const i = idx(sh.id);
  const actors = actorsAt(i, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], SC, a.pose));
  const props: Box[] = [];
  for (const n of [3, 2, 1] as const) props.push(box(`podium${n}`, [POD[n][0], POD_H / 2, POD[n][2]], [0.55, POD_H / 2, 0.35]));
  if (i <= 11 && curtainY(t) < 6) props.push(box("curtain", [CURTAIN[0], curtainY(t), CURTAIN[2]], [0.8, 1.2, 0.05]));
  if (i >= 11) { const s = i >= 13 && t > tDouble ? 1.26 : 1; props.push(box("owe", [OWE[0], 0.45 * s, OWE[2]], [0.45 * s, 0.45 * s, 0.3 * s])); }
  if (i === 14) props.push(box("jarFloor", [-0.35, 0.45, 0.05], [0.3, 0.45, 0.3]));
  const w = i === 1 ? whipPos(t, 0.05) : i === 16 ? whipPos(t, tLoopShot + 0.1) : null;
  if (w) props.push(box("whip3", w, [0.45, 0.35, 0.03]));
  if (i === 2) props.push(box("sign1", [P_HOST[0] - 0.9, 2.3, P_HOST[2] - 1.4], [0.35, 0.25, 0.03]));
  return { actors, props };
};

// ------------------------------------------------------------------ overlay: hook text (frame 0 and the loop), captions
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (!(t < lineEnd(1) + 0.25 || t >= tLoopShot)) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 80, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 74, lineHeight: 1.08, whiteSpace: "nowrap", color: "#ffd23a", textAlign: "center", WebkitTextStroke: "9px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.7)" }}>
        3 THINGS THAT DOUBLE
        <br />
        <span style={{ color: "#ff5a4f" }}>#1 IS THE SCARY ONE</span>
      </div>
    </div>
  );
};
const overlay = (t: number) => (
  <>
    <Hook t={t} />
    <WordCaption words={WORDS} t={t} />
  </>
);
export const R72_SPEC: FinSpec = {
  slug: "rule-of-72",
  shots: R72_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene: (t, s) => scene(t, s),
  counter: () => null,
  tag: (t, s) => (idx(s.id) >= 5 && idx(s.id) <= 15 ? "EXAMPLE RATES" : null),
  bg: "#3a2a7a",
  overlay,
};

// ------------------------------------------------------------------ audio
export const R72_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -2 }, { t: 0.05, sfx: "bell", db: -6 },
    { t: tNum, sfx: "alarm", db: -8 }, { t: tNum + 0.02, sfx: "impact", db: -4 },
    { t: tDiv - 0.02, sfx: "impact", db: 0 }, { t: tDiv, sfx: "thud", db: -4 },
    { t: T("S05"), sfx: "ding", db: -4 }, { t: t12 + 0.3, sfx: "stamp", db: -4 }, { t: t12 + 0.35, sfx: "coins", db: -8 },
    { t: T("S07"), sfx: "ding", db: -4 }, { t: t9, sfx: "slide", db: -10 },
    { t: tOpen, sfx: "suspense", db: -4 }, { t: tOpen + 0.2, sfx: "heartbeat", db: -8 }, { t: T("S10"), sfx: "riser", db: -6 },
    { t: tReveal - 0.02, sfx: "boom", db: -2 }, { t: tReveal + 0.25, sfx: "crash", db: -8 }, { t: tReveal + 0.1, sfx: "gasp", db: -8 },
    { t: t3, sfx: "impact", db: -4 },
    { t: tDouble - 0.02, sfx: "boom", db: -2 }, { t: tDouble, sfx: "thud", db: -2 }, { t: tDouble + 0.1, sfx: "stamp", db: -4 },
    { t: T("S14"), sfx: "whoosh", db: -6 },
    { t: tStamp, sfx: "stamp", db: -2 },
    { t: END - 0.35, sfx: "whoosh", db: -2 },
  ],
};
void hash;

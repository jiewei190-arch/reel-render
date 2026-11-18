// FORMAT v1, style S4 WOULD-YOU-RATHER: same-car-more. "Would you rather pay 926 a month, or just 453?"
// Frame 0: two identical red cars, price boards slamming down: $926/MO and $453/MO (hook text: $926 OR $453 A MONTH?).
// A 1-s PICK ONE pause, Spender grabs the $453 car; "453 means seven years, not three" (x 7 YRS stamps). Open loop (~50 %):
// "Wait till you see what's behind that door..." (a covered, glowing shed door). Twist (~70 %): the door bursts on the
// INTEREST furnace: $8,034 vs $3,347 (stated example: $30,000 at 7 %), "burns about 4,700 extra". Ends on the question
// and loops to frame 0.
import React from "react";
import { LENDER, SPENDER } from "../../library/characters";
import { clamp, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import type { Look } from "../../blocky/Blocky";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/same_car_more_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { BigBlock, BillBrick, CoinStack, Ground, Label, PAL, Stamp } from "../props";
import { FACE, Furnace, SC, easeOut, shakeAt, slam } from "../hooks";
import { Car } from "../f2kit";
import { actorBoxes, creep, Debris, HookText, shotsOf, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
/** story beat of a shot: the cuts added after the first plan map onto the beat they extend */
const SEQ: Record<string, number> = { S14: 1.5, S15: 3, S16: 5, S17: 7, S18: 10, S19: 8, S20: 5, S21: 8, S22: 10 }; // S19 = the door tease again, S20 = Spender with his pick
const seq = (id: string) => SEQ[id] ?? idx(id);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z; outdoor lot)
const CAR_A: V3 = [-1.35, 0, -1.2]; // the 3-year deal
const CAR_B: V3 = [1.55, 0, -1.2]; // the 7-year deal
const BOARD_Y = 2.25;
const P_SP: V3 = [3.25, 0, 0.45]; // Spender beside his pick (hands clear of the car)
const P_LD: V3 = [0.1, 0, 0.35]; // the seller, between the cars
const SHED: V3 = [-3.9, 0, -4.3];
const DOOR: V3 = [-3.9, 0, -3.28];
const FUR: V3 = [-3.9, 0, -2.3];
const P_F: V3 = [-2.5, 0, -1.3]; // Spender at the furnace
const TW1: V3 = [3.55, 0, -3.4];
const TW2: V3 = [4.55, 0, -3.4];

// key times
const tLand = 0.28; // the $453 board lands (frame 0: mid-drop)
const tPick = T("S04");
const tGrab = T("S05") + 0.15;
const tSeven = W(4, "seven"); // the stamps land on 'seven' (S17); S07 shows them landing the beat before
const tBurst = T("S09") + 0.3; // ~70 %: the twist is held to the '8,034' word
const tTower = T("S18") + 0.05;
const doorOpenAt = (i: number, t: number) => (i === 9 && t >= tBurst) || (i >= 10 && i <= 12);

// ------------------------------------------------------------------ the boards (frame 0: the $453 board is still dropping)
const boardY = (k: "A" | "B", t: number, i: number) => {
  if (i !== 1 && i !== 13) return BOARD_Y;
  const t0 = i === 13 ? T("S13") : 0;
  const land = k === "A" ? -0.1 : tLand;
  const u = clamp((t - t0 - land + 0.3) / 0.3);
  const bounce = t - t0 > land ? 0.06 * Math.abs(Math.sin((t - t0 - land) * 16)) * Math.exp(-(t - t0 - land) * 8) : 0;
  return lerp(BOARD_Y + 1.6, BOARD_Y, u * u) + bounce;
};

// ------------------------------------------------------------------ the brick toss (S11)
const PERIOD = 0.55;
const brickFrom: V3 = [P_F[0] - 0.55, 1.25, P_F[2] - 0.35];
const brickTo: V3 = [FUR[0] + 0.1, 0.72, FUR[2] + 0.62];
const brickAt = (t: number): V3 | null => {
  const u = ((((t + 0.3) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
  if (u > 0.95) return null;
  return [lerp(brickFrom[0], brickTo[0], u), lerp(brickFrom[1], brickTo[1], u) + 0.7 * Math.sin(Math.PI * u), lerp(brickFrom[2], brickTo[2], u)];
};

// ------------------------------------------------------------------ actors (shared by the scene and the clip check)
type Actor = { name: string; look: Look; pose: Pose; emo: Emotion; s: number; seed: number };
const actorsAt = (i: number, t: number): Actor[] => {
  const out: Actor[] = [];
  if (i >= 5 && i <= 7) {
    let pose: Pose = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, CAR_B) * 0.3 + yawTo(P_SP, [2.0, 0, 5]) * 0.7, SC), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "joy";
    if (i === 5) { const g = ss(tGrab - 0.15, tGrab + 0.1, t); pose = { ...pose, armL: lerp(0.3, 2.6, g), armR: lerp(0.3, 2.6, g), outL: 0.45 * g, outR: 0.45 * g, bob: -0.04 * g * Math.abs(Math.sin(t * 10)) }; }
    if (i === 6) { pose = { ...pose, armR: 1.4, outR: 0.3 }; emo = "love"; }
    if (i === 7) { const s = ss(tSeven - 0.05, tSeven + 0.15, t); pose = { ...pose, armL: lerp(0.3, 2.0, s), armR: lerp(0.3, 2.0, s), outL: 0.7 * s, outR: 0.7 * s, ant: s }; emo = s > 0.3 ? "shock" : "joy"; }
    out.push({ name: "Spender", look: SPENDER, pose, emo, s: SC, seed: 2 });
  }
  if (i === 11 || i === 12) {
    const ph = ((((t + 0.3) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
    const pose: Pose = { ...stand(P_F[0], P_F[2], yawTo(P_F, FUR) * 0.6 + 0.3, SC), armR: lerp(0.6, 2.0, Math.sin(Math.PI * ph)), outR: 0.3, armL: 0.8, outL: 0.2 };
    out.push({ name: "Spender", look: SPENDER, pose, emo: "sad", s: SC, seed: 2 });
  }
  if (i >= 6 && i <= 7) {
    const pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, P_SP) * 0.4 + yawTo(P_LD, [0, 0, 5]) * 0.6, 1.1), armL: 1.0, armR: 1.0, outL: -0.25, outR: -0.25 };
    out.push({ name: "Lender", look: LENDER, pose, emo: "sly", s: 1.1, seed: 5 });
  }
  return out;
};

// ------------------------------------------------------------------ lenses
const spFace = (p: V3): V3 => [p[0], FACE - 0.05, p[2]];
const both: V3 = [(CAR_A[0] + CAR_B[0]) / 2, 1.2, CAR_A[2]];
const hook = creep(both, [0.1, 1.7, 4.6], { fov: 58, face: 0.5, shake: shakeAt([tLand], 0.05) });
const LENS = {
  S01: hook,
  S02: creep([CAR_B[0], BOARD_Y, CAR_B[2]], [CAR_B[0] - 0.2, 2.0, CAR_B[2] + 2.4], { fov: 46, face: 0.5 }),
  S03: creep(both, [0.1, 1.9, 5.2], { fov: 58, face: 0.5 }),
  S04: creep(both, [0.1, 1.6, 4.4], { fov: 56, face: 0.5, push: 0.14 }),
  S05: creep([P_SP[0] - 0.4, 1.05, P_SP[2] - 0.4], [P_SP[0] - 0.6, 1.5, P_SP[2] + 3.0], { fov: 56, face: 0.5, shake: shakeAt([tGrab], 0.03) }),
  S06: creep([P_LD[0], 1.35, P_LD[2]], [P_LD[0] + 0.6, 1.45, P_LD[2] + 2.3], { face: 0.55 }),
  S07: creep(both, [0.1, 2.0, 4.0], { fov: 56, face: 0.45, shake: shakeAt([T("S07") + 0.1], 0.03) }),
  S14: creep([CAR_A[0], BOARD_Y, CAR_A[2]], [CAR_A[0] + 0.2, 2.0, CAR_A[2] + 2.4], { fov: 46, face: 0.5 }),
  S15: creep([both[0], 3.1, both[2]], [both[0], 2.7, both[2] + 2.6], { fov: 46, face: 0.5 }),
  S16: creep(spFace(P_SP), [P_SP[0] - 0.4, 1.35, P_SP[2] + 1.9], { face: 0.6 }),
  S17: { ...creep(spFace(P_SP), [P_SP[0] - 0.3, 1.32, P_SP[2] + 2.0], { face: 0.62, roll: [0, -3] }), fovAt: slam(tSeven, 52, 42, 0.14), shake: shakeAt([tSeven], 0.05) },
  S18: creep([TW2[0], 1.3, TW2[2]], [TW2[0] - 0.6, 0.6, TW2[2] + 3.0], { fov: 56, face: 0.42, mood: "whisper", shake: shakeAt([tTower], 0.06) }),
  S19: creep([DOOR[0], 0.7, DOOR[2]], [DOOR[0] - 0.6, 0.95, DOOR[2] + 3.1], { fov: 46, face: 0.5, mood: "whisper", shake: (t: number) => 0.008 + 0.006 * Math.abs(Math.sin(t * 29)) }),
  S20: creep([P_SP[0] - 0.2, 1.1, P_SP[2] - 0.3], [P_SP[0] - 1.4, 1.3, P_SP[2] + 2.4], { fov: 52, face: 0.5 }),
  S21: creep([DOOR[0], 1.25, DOOR[2]], [DOOR[0] + 0.5, 1.3, DOOR[2] + 3.3], { fov: 46, face: 0.5, mood: "whisper", push: 0.15, shake: (t: number) => 0.01 + 0.008 * Math.abs(Math.sin(t * 37)) }),
  S22: creep([TW1[0], 1.0, TW1[2]], [TW1[0] + 0.5, 0.8, TW1[2] + 2.4], { fov: 50, face: 0.45, mood: "whisper" }),
  S08: creep([DOOR[0], 1.2, DOOR[2]], [DOOR[0] + 1.2, 1.3, DOOR[2] + 3.8], { fov: 46, face: 0.5, push: 0.12, mood: "whisper", shake: (t: number) => 0.006 + 0.004 * Math.abs(Math.sin(t * 23)) }),
  S09: creep([DOOR[0] + 0.2, 1.1, DOOR[2] + 0.2], [DOOR[0] + 1.3, 2.5, DOOR[2] + 5.0], { fov: 60, face: 0.5, mood: "whisper", fovAt: slam(tBurst, 64, 56, 0.1), shake: shakeAt([tBurst], 0.08) }), // high over the furnace into the burst door (the wide lens had the cars in front; a right-side lens had a car in the foreground)
  S10: creep([(TW1[0] + TW2[0]) / 2, 1.3, TW1[2]], [4.0, 0.7, TW1[2] + 3.4], { fov: 56, face: 0.42, mood: "whisper", shake: shakeAt([tTower], 0.06) }),
  S11: creep([P_F[0] - 0.6, 1.0, P_F[2] - 0.4], [P_F[0] + 1.6, 1.5, P_F[2] + 2.3], { fov: 54, face: 0.5, mood: "whisper" }),
  S12: creep([FUR[0], 2.15, FUR[2] + 0.4], [FUR[0] + 0.6, 1.95, FUR[2] + 3.1], { fov: 52, face: 0.5, mood: "whisper", shake: shakeAt([T("S12") + 0.2], 0.04) }), // aimed high: the EXTRA label sits under the caption band
  S13: hook,
};
export const SAMECAR_SHOTS = shotsOf(PLAN, Object.fromEntries(Object.entries(LENS).map(([k, l]) => [k, { ...l, sky: true }]))); // outdoor: the sky dome on

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = seq(shot.id);
  void tau;
  const actors = actorsAt(i, t);
  const doorOpen = doorOpenAt(i, t); // S09 opens on the shaking closed door, the burst ~0.3 s in
  const fire = doorOpen;

  const burstU = i === 9 ? (t - tBurst) / 0.5 : 2;
  const t1 = i === 9 ? ss(tBurst + 0.2, tBurst + 0.6, t) : i >= 10 && i <= 12 ? 1 : 0;
  const t2 = i === 9 ? ss(tBurst + 0.2, tBurst + 0.6, t) * 0.45 : i === 10 ? 0.45 + 0.55 * easeOut(clamp((t - tTower) / 0.3)) : i >= 11 && i <= 12 ? 1 : 0; // S18 (beat 10) slams it up; S10 holds it
  const years = i >= 7 && i <= 12;
  const pick = i === 4 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  const brick = i === 11 || i === 12 ? brickAt(t) : null;
  return (
    <>
      <Ground road roadW={2.6} />
      {/* the two identical cars and their price boards */}
      <Car p={CAR_A} yaw={0} color={PAL.debt} t={t} />
      <Car p={CAR_B} yaw={0} color={PAL.debt} t={t} />
      {(["A", "B"] as const).map((k) => {
        const c = k === "A" ? CAR_A : CAR_B;
        return (
          <group key={k}>
            <mesh position={[c[0] + 0.95, BOARD_Y / 2, c[2] - 0.2]} castShadow><boxGeometry args={[0.1, BOARD_Y, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
            <group position={[c[0], boardY(k, t, i), c[2] - 0.2]}>
              <Label p={[0, 0, 0]} text={[k === "A" ? "$926/MO" : "$453/MO"]} w={1.4} h={0.5} bg={k === "A" ? "#2a6de1" : PAL.debt} fg="#ffffff" glow={k === "B" && i === 2 ? 0.5 : 0.15} />
              {years ? <Stamp p={[0.15, -0.42, 0.02]} text={k === "A" ? "x 3 YEARS" : "x 7 YEARS"} u={i === 7 ? clamp((t - tSeven + 0.1 + (k === "A" ? 0.15 : 0)) / 0.2) : 1} w={0.9} color={k === "A" ? "#2a6de1" : PAL.debt} /> : null}
            </group>
          </group>
        );
      })}
      {i === 1 || i === 13 ? <Debris p={[CAR_B[0], BOARD_Y - 0.3, CAR_B[2] - 0.1]} t={t} t0={(i === 13 ? T("S13") : 0) + tLand} n={8} c={["#ffd23a", "#ffffff"]} y0={0} size={0.06} /> : null}
      {i >= 3 && i <= 4 ? <Label p={[both[0], 3.15, both[2] - 0.2]} text={["SAME CAR · SAME 7%"]} w={2.4} h={0.32} bg="#fff4c8" fg={PAL.ink} /> : null}
      {i === 4 ? <Label p={[both[0], 0.55 + 0.03 * pick, 0.6]} text={["PICK ONE"]} w={1.4} h={0.4} bg="#ffd23a" fg={PAL.ink} glow={0.3 * pick} /> : null}
      {/* the shed: covered sign, glowing door (open loop), then the burst onto the furnace (twist) */}
      <BigBlock p={SHED} size={[2.6, 2.6, 2.0]} color="#8a8fa8" text="" />
      {doorOpen ? null : <BigBlock p={[DOOR[0], 0, DOOR[2] + 0.05]} size={[1.0, 2.0, 0.08]} color="#5a4a3a" text="" />}
      {i === 8 || (i === 9 && t < tBurst) ? <mesh position={[DOOR[0], 0.02, DOOR[2] + 0.35]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.1, 0.5]} /><meshStandardMaterial color="#ff7a1a" emissive="#ff5a00" emissiveIntensity={1.4 + 0.5 * Math.sin(t * 19)} transparent opacity={0.7} /></mesh> : null}
      {i === 8 || (i === 9 && t < tBurst) ? <pointLight position={[DOOR[0], 0.3, DOOR[2] + 0.4]} color="#ff8a3a" intensity={1.6 + 0.6 * Math.sin(t * 17)} distance={3} decay={2} /> : null}
      <Label p={[DOOR[0], 2.32, DOOR[2] + 0.06]} text={doorOpen ? ["INTEREST"] : ["? ? ?"]} w={1.2} h={0.3} bg={doorOpen ? "#c01818" : "#6a6a78"} fg="#ffffff" />
      {i === 9 ? <Debris p={[DOOR[0], 1.0, DOOR[2] + 0.1]} t={t} t0={tBurst} n={16} c={["#5a4a3a", "#8a6a4a", "#ffd23a"]} y0={0} size={0.12} /> : null}
      {i === 9 && burstU > 0 && burstU < 1 ? <BigBlock p={[DOOR[0] + 1.6 * burstU, Math.max(0.04, 1.4 * burstU - 1.8 * burstU * burstU), DOOR[2] + 1.8 * burstU]} size={[1.0, 2.0, 0.08]} r={[-1.3 * burstU, 0.6 * burstU, 0.4 * burstU]} color="#5a4a3a" text="" /> : null}
      {fire ? <Furnace p={FUR} t={t} heat={1} base={1.6} /> : null}
      {brick ? <BillBrick p={brick} s={2.0} r={[t * 5, t * 3, t * 2]} /> : null}
      {i === 11 || i === 12 ? <CoinStack p={[P_F[0] + 0.55, 0, P_F[2] - 0.55]} n={14} s={1.6} /> : null}
      {i === 12 ? <Label p={[FUR[0] + 0.1, 2.05, FUR[2] + 0.5]} text={["≈$4,700", "EXTRA"]} w={0.85} h={0.4} bg={PAL.debt} fg="#fff4c8" /> : null}
      {/* the interest towers */}
      {t1 > 0 ? <BigBlock p={TW1} size={[0.8, Math.max(0.05, 1.0 * t1), 0.6]} color="#2a6de1" text={t1 > 0.5 ? "$3,347" : ""} /> : null}
      {t2 > 0 ? <BigBlock p={TW2} size={[0.8, Math.max(0.05, 2.4 * t2), 0.6]} color={PAL.debt} text={t2 > 0.3 ? "$8,034" : ""} glow={0.15} /> : null}
      {t1 > 0.5 ? <Label p={[TW1[0], 0.15, TW1[2] + 0.35]} text={["3 YRS"]} w={0.6} h={0.16} bg="#fff4c8" fg={PAL.ink} /> : null}
      {t2 > 0.5 ? <Label p={[TW2[0], 0.15, TW2[2] + 0.35]} text={["7 YRS"]} w={0.6} h={0.16} bg="#fff4c8" fg={PAL.ink} /> : null}
      {actors.map((a) => <Act key={a.name} look={a.look} pose={a.pose} emotion={a.emo} s={a.s} t={t} seed={a.seed} />)}
    </>
  );
};

// ------------------------------------------------------------------ QA
const box = (name: string, c: V3, h: V3, yaw?: number): Box => ({ name, c, h, yaw });
export const SAMECAR_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = SAMECAR_SHOTS.find((s) => t >= s.a && t < s.b) ?? SAMECAR_SHOTS[SAMECAR_SHOTS.length - 1];
  const i = seq(sh.id);
  const actors = actorsAt(i, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const props: Box[] = [box("carA", [CAR_A[0], 0.58, CAR_A[2]], [0.76, 0.58, 1.32]), box("carB", [CAR_B[0], 0.58, CAR_B[2]], [0.76, 0.58, 1.32]), box("shed", [SHED[0], 1.3, SHED[2]], [1.3, 1.3, 1.0])];
  for (const c of [CAR_A, CAR_B]) props.push(box("boardPost", [c[0] + 0.95, BOARD_Y / 2, c[2] - 0.2], [0.06, BOARD_Y / 2, 0.06]), box("board", [c[0], boardY("B", t, i), c[2] - 0.2], [0.7, 0.25 + (i >= 7 && i <= 12 ? 0.3 : 0), 0.05]));
  if (doorOpenAt(i, t)) props.push(box("furnace", [FUR[0], 0.75, FUR[2]], [0.75, 0.75, 0.6]));
  const b = i === 11 || i === 12 ? brickAt(t) : null;
  if (b) props.push(box("brick", b, [0.2, 0.2, 0.2]));
  if (i === 11 || i === 12) props.push(box("coinStack", [P_F[0] + 0.55, 0.15, P_F[2] - 0.55], [0.12, 0.15, 0.12]));
  if (i >= 9 && i <= 12) props.push(box("tower1", [TW1[0], 0.5, TW1[2]], [0.4, 0.5, 0.3]), box("tower2", [TW2[0], 1.2, TW2[2]], [0.4, 1.2, 0.3]));
  if (i === 4) props.push(box("pickOne", [both[0], 0.55, 0.6], [0.7, 0.2, 0.05]));
  return { actors, props };
};

// ------------------------------------------------------------------ overlay, spec, audio
const overlay = (t: number) => (
  <>
    <HookText text="$926 OR $453 A MONTH?" t={t} until={lineEnd(2) + 0.2} />
    {t >= T("S13") ? <HookText text="$926 OR $453 A MONTH?" t={t} until={99} /> : null}
    <WordCaption words={WORDS} t={t} />
  </>
);
export const SAMECAR_SPEC: FinSpec = {
  slug: "same-car-more",
  shots: SAMECAR_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene,
  counter: () => null,
  tag: () => "EXAMPLE: $30,000 · 7%",
  bg: "#6aa6f2",
  overlay,
};
export const SAMECAR_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "whoosh", db: -4 }, { t: tLand - 0.02, sfx: "thud", db: 0 }, { t: tLand + 0.02, sfx: "metal", db: -8 },
    { t: T("S02"), sfx: "ding", db: -8 }, { t: T("S03") + 0.1, sfx: "slide", db: -6 },
    { t: tPick, sfx: "clock", db: -4 }, { t: tPick + 0.4, sfx: "tick", db: -6 },
    { t: tGrab, sfx: "success", db: -4 }, { t: T("S06") + 0.1, sfx: "laugh", db: -10 },
    { t: tSeven - 0.02, sfx: "stamp", db: -2 }, { t: tSeven + 0.15, sfx: "stamp", db: -4 }, { t: tSeven + 0.05, sfx: "gasp", db: -6 },
    { t: T("S08"), sfx: "rumble", db: -6 }, { t: T("S08") + 0.1, sfx: "suspense", db: -8 }, { t: T("S08") + 0.5, sfx: "knock", db: -8 },
    { t: tBurst - 0.02, sfx: "crash", db: 0 }, { t: tBurst, sfx: "fire", db: -2 }, { t: tBurst + 0.05, sfx: "boom", db: -4 },
    { t: tTower - 0.02, sfx: "impact", db: 0 }, { t: T("S11") + 0.25, sfx: "fire", db: -4 }, { t: T("S12") + 0.2, sfx: "fail", db: -6 },
    { t: T("S13"), sfx: "whoosh", db: -4 }, { t: END - 0.35, sfx: "whoosh", db: -6 },
  ],
};

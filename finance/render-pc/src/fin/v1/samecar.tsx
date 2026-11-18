// FORMAT v1 story: same-car-more (hook B, the INTEREST furnace). "This guy is about to pay 4,700 dollars... for nothing."
// Want: Spender wants a new $30,000 car (7 % APR, example). Trouble: 3 years is $926/mo; the seller offers 7 years at $453.
// Open loop (~50 %): "But wait till you see what's behind that door..." over a covered, glowing shed door. Twist (~70 %):
// the door bursts: the long loan's interest is $8,034, not $3,347: about $4,700 more, into the fire. Loops to frame 0.
import React from "react";
import { LENDER, SPENDER } from "../../library/characters";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import type { Look } from "../../blocky/Blocky";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/same_car_more_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { BigBlock, BillBrick, CoinStack, FlipCalendar, Ground, Label, PAL, Stamp } from "../props";
import { FACE, Furnace, SC, easeOut, shakeAt, slam } from "../hooks";
import { Car, Sheet } from "../f2kit";
import { actorBoxes, creep, Debris, HookText, shotsOf, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z; outdoor lot)
const CAR: V3 = [0.9, 0, -1.1];
const CAR2: V3 = [-1.7, 0, -1.3];
const SIGN: V3 = [2.45, 0, -2.1];
const P_SP: V3 = [-0.45, 0, 0.55];
const P_LD: V3 = [1.95, 0, 0.45];
const TABLE: V3 = [0.75, 0, 0.55];
const SHED: V3 = [-3.3, 0, -3.3];
const DOOR: V3 = [-3.3, 0, -2.28]; // door plane (shed front face z = -2.3)
const FUR: V3 = [-3.3, 0, -1.25]; // the furnace, in front of the shed door once it's open
const P_B: V3 = [-1.75, 0, -0.25]; // Spender at the furnace
const TW1: V3 = [2.75, 0, -2.6];
const TW2: V3 = [3.75, 0, -2.6];
const CALP: V3 = [0.0, 1.95, -2.7];

// key times
const tFor = W(1, "for");
const tTag = T("S04") + 0.12;
const tOuch = W(3, "ouch");
const tFlip = T("S07") + 0.35;
const tSign = T("S10") + 0.35;
const tBurst = T("S12") + 0.08;
const tTower = T("S13") + 0.05;
const fireOn = (i: number) => i <= 2 || i >= 12;

// ------------------------------------------------------------------ the brick toss (frame 0 already mid-air)
const PERIOD = 0.55;
const brickFrom: V3 = [P_B[0] - 0.55, 1.25, P_B[2] - 0.35]; // 0.3 m past his hand, toward the furnace
const brickTo: V3 = [FUR[0] + 0.1, 0.72, FUR[2] + 0.62]; // the furnace mouth
const brickAt = (t: number, t0: number): V3 | null => {
  const u = (((t - t0 + 0.3) % PERIOD) + PERIOD) % PERIOD / PERIOD;
  if (u > 0.95) return null;
  return [lerp(brickFrom[0], brickTo[0], u), lerp(brickFrom[1], brickTo[1], u) + 0.7 * Math.sin(Math.PI * u), lerp(brickFrom[2], brickTo[2], u)];
};

// ------------------------------------------------------------------ actors (one pose function: the scene AND the clip check use it)
type Actor = { name: string; look: Look; pose: Pose; emo: Emotion; s: number; seed: number; held?: { side: "L" | "R"; node: React.ReactNode } };
const actorsAt = (i: number, t: number): Actor[] => {
  const out: Actor[] = [];
  // Spender
  if (i <= 2 || i >= 15 && i !== 16 || (i >= 3 && i <= 10)) {
    let p = P_SP;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, CAR) * 0.35 + yawTo(p, [0, 0, 5]) * 0.65, SC), armL: 0.25, armR: 0.25 };
    let emo: Emotion = "happy";
    let held: Actor["held"];
    if (i <= 2 || i >= 15) {
      // at the furnace: tossing (frame 0 and the loop), realising on "for nothing"
      p = P_B;
      const real = i === 2 ? ss(tFor - 0.05, tFor + 0.15, t) : 0;
      const ph = ((((t + 0.3) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
      pose = { ...stand(p[0], p[2], lerp(yawTo(p, FUR) * 0.6 + 0.3, yawTo(p, [p[0] + 0.3, 0, p[2] + 3]), real), SC), armR: real > 0 ? lerp(0.6, 2.2, real) : lerp(0.6, 2.0, Math.sin(Math.PI * ph)), outR: 0.3 + 0.5 * real, armL: real > 0 ? lerp(0.6, 2.2, real) : 0.8, outL: 0.2 + 0.6 * real, pitch: -0.1 * real };
      emo = real > 0.3 ? "shock" : i === 15 ? "sad" : "joy";
    } else if (i === 3) { pose = { ...pose, armL: 0.6, armR: 0.6, outL: 0.2, outR: 0.2 }; emo = "love"; }
    else if (i === 4) { emo = "love"; }
    else if (i === 6) { const s = ss(tOuch - 0.1, tOuch + 0.1, t); pose = { ...pose, armL: lerp(0.3, 2.0, s), armR: lerp(0.3, 2.0, s), outL: 0.7 * s, outR: 0.7 * s, pitch: -0.15 * s, ant: s }; emo = "shock"; }
    else if (i === 8) { pose = { ...pose, armL: 2.6, armR: 2.6, outL: 0.45, outR: 0.45, bob: -0.04 * Math.abs(Math.sin(t * 10)) }; emo = "joy"; }
    else if (i === 10) {
      // the stamp comes down onto the sheet on the table (the hand stops ON the table top)
      const d = ss(tSign - 0.25, tSign, t);
      pose = { ...stand(p[0], p[2], yawTo(p, TABLE) * 0.7 + yawTo(p, [0, 0, 5]) * 0.3, SC), armR: lerp(1.9, 0.95, d), outR: 0.0 };
      emo = "sly";
    }
    out.push({ name: "Spender", look: SPENDER, pose, emo, s: SC, seed: 2, held });
  }
  // the seller (Lender)
  if (i >= 5 && i <= 10) {
    let pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, P_SP) * 0.45 + yawTo(P_LD, [0, 0, 5]) * 0.55, 1.1), armL: 0.3, armR: 0.3 };
    let emo: Emotion = "sly";
    let held: Actor["held"];
    if (i === 5 || i === 7) {
      const flip = i === 7 ? clamp((t - tFlip) / 0.2) : 0;
      pose = { ...pose, armR: 1.45, outR: 0.05 };
      const late = i === 7 && flip > 0.5;
      held = { side: "R", node: <group position={[0, 0.22, 0.06]} rotation={[0, i === 7 ? Math.PI * flip : 0, 0]}><Sheet lines={late ? ["7 YEARS", "$453/MO!"] : ["3 YEARS", "$926/MO"]} w={0.42} h={0.5} accent={late ? PAL.cash : PAL.debt} /></group> };
      emo = i === 7 ? "joy" : "happy";
    }
    if (i === 10) { pose = { ...pose, armL: 1.0, armR: 1.0, outL: -0.25, outR: -0.25 }; emo = "sly"; }
    out.push({ name: "Lender", look: LENDER, pose, emo, s: 1.1, seed: 5, held });
  }
  return out;
};

// ------------------------------------------------------------------ lenses
const spFace = (p: V3): V3 => [p[0], FACE - 0.05, p[2]];
const LENS = {
  S01: creep([FUR[0] + 0.85, 1.0, FUR[2] + 0.55], [0.6, 1.4, 2.6], { fov: 54, face: 0.5, shake: shakeAt([0.25], 0.03) }),
  S02: { ...creep(spFace(P_B), [P_B[0] + 0.7, 1.35, P_B[2] + 2.0], { face: 0.62, blur: 1.4, roll: [0, 3] }), fovAt: slam(tFor, 50, 38, 0.14), shake: shakeAt([tFor], 0.05) },
  S03: creep([CAR[0] - 0.4, 0.9, CAR[2] + 0.4], [-1.2, 1.6, 4.4], { fov: 54, face: 0.5 }),
  S04: creep([CAR[0] - 0.2, 1.05, CAR[2] + 0.75], [CAR[0] - 0.6, 1.3, CAR[2] + 2.3], { fov: 44, face: 0.5, shake: shakeAt([tTag + 0.05], 0.03) }),
  S05: creep([P_LD[0], 1.35, P_LD[2]], [P_LD[0] - 0.9, 1.45, P_LD[2] + 2.4], { face: 0.55 }),
  S06: { ...creep(spFace(P_SP), [P_SP[0] + 0.4, 1.3, P_SP[2] + 2.0], { face: 0.62, roll: [0, -3] }), fovAt: slam(tOuch, 50, 40, 0.14), shake: shakeAt([tOuch], 0.05) },
  S07: creep([P_LD[0], 1.35, P_LD[2]], [P_LD[0] - 0.5, 1.4, P_LD[2] + 2.2], { face: 0.55, shake: shakeAt([tFlip + 0.1], 0.02) }),
  S08: creep(spFace(P_SP), [P_SP[0] - 0.4, 1.35, P_SP[2] + 2.6], { face: 0.6 }),
  S09: creep([0.1, 0.45, -0.45], [0.2, 0.95, 1.4], { fov: 46, face: 0.5 }),
  S10: creep([TABLE[0], 1.0, TABLE[2]], [TABLE[0] - 0.2, 1.7, TABLE[2] + 2.8], { fov: 56, face: 0.5, shake: shakeAt([tSign], 0.03) }),
  S11: creep([DOOR[0], 1.2, DOOR[2]], [DOOR[0] + 1.1, 1.3, DOOR[2] + 3.6], { fov: 46, face: 0.5, push: 0.12, shake: (t: number) => 0.006 + 0.004 * Math.abs(Math.sin(t * 23)) }),
  S12: creep([(FUR[0] + TW2[0]) / 2 - 0.6, 1.1, -1.9], [0.0, 1.9, 4.6], { fov: 60, face: 0.5, mood: "whisper", fovAt: slam(tBurst, 66, 58, 0.1), shake: shakeAt([tBurst], 0.08) }),
  S13: creep([(TW1[0] + TW2[0]) / 2, 1.3, TW1[2]], [3.0, 0.7, TW1[2] + 3.4], { fov: 56, face: 0.42, mood: "whisper", shake: shakeAt([tTower], 0.06) }),
  S14: creep([(CAR[0] + CAR2[0]) / 2, 0.8, -1.2], [-0.4, 1.8, 3.9], { fov: 58, face: 0.5, mood: "whisper" }),
  S15: creep([P_B[0] - 0.6, 1.0, P_B[2] - 0.4], [P_B[0] + 1.6, 1.5, P_B[2] + 2.2], { fov: 54, face: 0.5, mood: "whisper", shake: shakeAt([T("S15") + 0.25, T("S15") + 0.8], 0.03) }),
  S16: creep([CALP[0], CALP[1] - 0.5, CALP[2]], [CALP[0] + 0.3, 1.7, CALP[2] + 2.6], { fov: 50, face: 0.5, mood: "ending" }),
  S17: creep([FUR[0] + 0.85, 1.0, FUR[2] + 0.55], [0.6, 1.4, 2.6], { fov: 54, face: 0.5 }),
};
export const SAMECAR_SHOTS = shotsOf(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  void tau;
  const actors = actorsAt(i, t);
  const doorOpen = i >= 12 ? 1 : 0;
  const burstU = i === 12 ? (t - tBurst) / 0.5 : 2;
  const tossing = i === 1 || i === 17 || i === 15 || (i === 2 && t < tFor - 0.1);
  const brick = tossing ? brickAt(t, 0) : null;
  const pile = i === 16 ? 0.2 + 0.6 * ss(T("S16"), T("S16") + 1.2, t) : 0;
  const t1 = i === 12 ? ss(tBurst + 0.2, tBurst + 0.6, t) : i >= 13 ? 1 : 0;
  const t2 = i === 12 ? ss(tBurst + 0.2, tBurst + 0.6, t) * 0.45 : i === 13 ? 0.45 + 0.55 * easeOut(clamp((t - tTower) / 0.3)) : i > 13 ? 1 : 0;
  const yr = i === 16 ? (t - T("S16") < 0.35 ? 3 : Math.min(7, 3 + Math.floor((t - T("S16") - 0.35) / 0.12))) : 3;
  return (
    <>
      <Ground road roadW={3.0} />
      {/* the lot: the car (and its twin in S14), the price sign, the 7% tag */}
      <Car p={CAR} yaw={-0.5} color={PAL.debt} smoke={0} t={t} />
      {i === 14 ? <Car p={CAR2} yaw={-0.5} color={PAL.debt} t={t} /> : null}
      {i === 14 ? <Label p={[CAR2[0], 1.75, CAR2[2]]} text={["3 YEARS"]} w={0.7} h={0.22} bg="#fff4c8" fg={PAL.ink} /> : null}
      {i === 14 ? <Label p={[CAR[0], 1.75, CAR[2]]} text={["7 YEARS"]} w={0.7} h={0.22} bg="#fff4c8" fg={PAL.debt} /> : null}
      <mesh position={[SIGN[0], 0.9, SIGN[2]]} castShadow><boxGeometry args={[0.1, 1.8, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <Label p={[SIGN[0], 1.95, SIGN[2] + 0.06]} text={["NEW CAR", "$30,000"]} w={0.95} h={0.5} bg={PAL.night} fg="#ffd23a" glow={0.3} />
      {i >= 4 && i <= 11 ? <group position={[CAR[0] - 0.2, 1.08, CAR[2] + 0.66]} rotation={[-0.35, -0.5, 0]} scale={i === 4 ? 1 + 0.6 * (1 - easeOut(clamp((t - tTag) / 0.12))) : 1}><Label p={[0, 0, 0]} text={["7% APR", "EXAMPLE"]} w={0.5} h={0.26} bg="#fff4c8" fg={PAL.debt} /></group> : null}
      {/* the table with the contract (S10: SIGNED) */}
      <BigBlock p={TABLE} size={[0.8, 0.85, 0.55]} color="#7a4a2a" text="" />
      {i >= 9 && i <= 11 ? <group position={[TABLE[0], 0.86, TABLE[2]]} rotation={[-Math.PI / 2, 0, 0]}><Sheet lines={["7 YEARS", "$453/MO"]} w={0.38} h={0.46} accent={PAL.cash} /><Stamp p={[0, -0.05, 0.01]} text="SIGNED" u={i === 10 ? clamp((t - tSign + 0.05) / 0.2) : i > 10 ? 1 : 0} w={0.3} /></group> : null}
      {/* the two payment stacks (S09) */}
      {i === 9 ? (
        <>
          <CoinStack p={[-0.25, 0, -0.45]} n={40} s={1.6} />
          <CoinStack p={[0.45, 0, -0.45]} n={20} s={1.6} glow={0.6} />
          <Label p={[-0.25, 1.2, -0.4]} text={["$926"]} w={0.42} h={0.18} bg={PAL.debt} fg="#fff4c8" />
          <Label p={[0.45, 0.75, -0.4]} text={["$453"]} w={0.42} h={0.18} bg={PAL.cash} fg="#fff4c8" />
        </>
      ) : null}
      {/* the shed: a covered sign over a door that glows (S11), then bursts open (S12) */}
      <BigBlock p={SHED} size={[2.6, 2.6, 2.0]} color="#8a8fa8" text="" />
      {doorOpen ? null : <BigBlock p={[DOOR[0], 0, DOOR[2] + 0.05]} size={[1.0, 2.0, 0.08]} color="#5a4a3a" text="" />}
      {i === 11 ? <mesh position={[DOOR[0], 0.02, DOOR[2] + 0.35]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.1, 0.5]} /><meshStandardMaterial color="#ff7a1a" emissive="#ff5a00" emissiveIntensity={1.4 + 0.5 * Math.sin(t * 19)} transparent opacity={0.7} /></mesh> : null}
      {i === 11 ? <pointLight position={[DOOR[0], 0.3, DOOR[2] + 0.4]} color="#ff8a3a" intensity={1.6 + 0.6 * Math.sin(t * 17)} distance={3} decay={2} /> : null}
      <Label p={[DOOR[0], 2.32, DOOR[2] + 0.06]} text={doorOpen ? ["INTEREST"] : ["? ? ?"]} w={1.2} h={0.3} bg={doorOpen ? "#c01818" : "#6a6a78"} fg="#ffffff" />
      {i === 12 ? <Debris p={[DOOR[0], 1.0, DOOR[2] + 0.1]} t={t} t0={tBurst} n={16} c={["#5a4a3a", "#8a6a4a", "#ffd23a"]} y0={0} size={0.12} /> : null}
      {i === 12 && burstU > 0 && burstU < 1 ? <BigBlock p={[DOOR[0] + 1.6 * burstU, Math.max(0.04, 1.4 * burstU - 1.8 * burstU * burstU), DOOR[2] + 1.8 * burstU]} size={[1.0, 2.0, 0.08]} r={[-1.3 * burstU, 0.6 * burstU, 0.4 * burstU]} color="#5a4a3a" text="" /> : null}
      {fireOn(i) ? <Furnace p={FUR} t={t} heat={tossing ? 0.7 : 1} base={1.6} /> : null}
      {brick ? <BillBrick p={brick} s={2.0} r={[t * 5, t * 3, t * 2]} /> : null}
      {i === 15 || i === 1 || i === 17 ? <CoinStack p={[P_B[0] + 0.55, 0, P_B[2] - 0.55]} n={14} s={1.6} /> : null}
      {i === 15 ? <Label p={[FUR[0] + 0.1, 2.05, FUR[2] + 0.5]} text={["≈$4,700", "EXTRA"]} w={0.85} h={0.4} bg={PAL.debt} fg="#fff4c8" /> : null}
      {/* the interest towers */}
      {t1 > 0 ? <BigBlock p={TW1} size={[0.8, Math.max(0.05, 1.0 * t1), 0.6]} color="#3a8ae8" text={t1 > 0.5 ? "$3,347" : ""} /> : null}
      {t2 > 0 ? <BigBlock p={TW2} size={[0.8, Math.max(0.05, 2.4 * t2), 0.6]} color={PAL.debt} text={t2 > 0.3 ? "$8,034" : ""} glow={0.15} /> : null}
      {t1 > 0.5 ? <Label p={[TW1[0], 0.15, TW1[2] + 0.35]} text={["3 YRS"]} w={0.6} h={0.16} bg="#fff4c8" fg={PAL.ink} /> : null}
      {t2 > 0.5 ? <Label p={[TW2[0], 0.15, TW2[2] + 0.35]} text={["7 YRS"]} w={0.6} h={0.16} bg="#fff4c8" fg={PAL.ink} /> : null}
      {/* the calendar that stretches 3 -> 7 years, a pile that grows */}
      <mesh position={[CALP[0], 0.7, CALP[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <FlipCalendar p={CALP} title="LOAN" value={`${yr} YRS`} prev={i === 16 && yr > 3 ? `${yr - 1} YRS` : undefined} flip={i === 16 ? (t * 8) % 1 : 1} sub="$30,000 CAR" color={yr >= 7 ? PAL.debt : undefined} />
      {pile > 0 ? <CoinStack p={[CALP[0] + 1.0, 0, CALP[2] + 0.5]} n={Math.round(40 * pile)} s={1.6} /> : null}
      {actors.map((a) => <Act key={a.name} look={a.look} pose={a.pose} emotion={a.emo} s={a.s} t={t} seed={a.seed} held={a.held} />)}
      {Array.from({ length: 0 }, (_, k) => hash(k))}
    </>
  );
};

// ------------------------------------------------------------------ QA: props vs head/torso/hand boxes, every frame
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const SAMECAR_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = SAMECAR_SHOTS.find((s) => t >= s.a && t < s.b) ?? SAMECAR_SHOTS[SAMECAR_SHOTS.length - 1];
  const i = idx(sh.id);
  const actors = actorsAt(i, t).flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], a.s, a.pose));
  const props: Box[] = [
    box("car", [CAR[0], 0.6, CAR[2]], [1.15, 0.6, 1.15]), box("table", [TABLE[0], 0.43, TABLE[2]], [0.4, 0.43, 0.28]),
    box("shed", [SHED[0], 1.3, SHED[2]], [1.3, 1.3, 1.0]), box("sign", [SIGN[0], 1.4, SIGN[2]], [0.48, 0.7, 0.08]),
  ];
  if (i === 14) props.push(box("car2", [CAR2[0], 0.6, CAR2[2]], [1.15, 0.6, 1.15]));
  if (fireOn(i)) props.push(box("furnace", [FUR[0], 0.75, FUR[2]], [0.75, 0.75, 0.6]));
  const tossing = i === 1 || i === 17 || i === 15 || (i === 2 && t < tFor - 0.1);
  const b = tossing ? brickAt(t, 0) : null;
  if (b) props.push(box("brick", b, [0.2, 0.2, 0.2]));
  if (i === 9) props.push(box("stack926", [-0.25, 0.4, -0.45], [0.12, 0.4, 0.12]), box("stack453", [0.45, 0.2, -0.45], [0.12, 0.2, 0.12]));
  if (i === 15 || i === 1 || i === 17) props.push(box("coinStack", [P_B[0] + 0.55, 0.15, P_B[2] - 0.55], [0.12, 0.15, 0.12]));
  if (i >= 12) props.push(box("tower1", [TW1[0], 0.5, TW1[2]], [0.4, 0.5, 0.3]), box("tower2", [TW2[0], 1.2, TW2[2]], [0.4, 1.2, 0.3]));
  if (i === 12) { const u = (t - tBurst) / 0.5; if (u > 0 && u < 1) props.push(box("door", [DOOR[0] + 1.6 * u, Math.max(1.0, 1.0 + 1.4 * u - 1.8 * u * u), DOOR[2] + 1.8 * u], [0.6, 1.0, 0.6])); }
  return { actors, props };
};

// ------------------------------------------------------------------ overlay, spec, audio
const overlay = (t: number) => (
  <>
    <HookText text="$4,700 FOR NOTHING" t={t} until={lineEnd(1) + 0.25} />
    {t >= T("S17") ? <HookText text="$4,700 FOR NOTHING" t={t} until={99} /> : null}
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
  tag: (t, s) => (idx(s.id) >= 3 && idx(s.id) <= 16 ? "EXAMPLE" : null),
  bg: "#6aa6f2",
  overlay,
};
export const SAMECAR_AUDIO: StoryAudio = {
  music: "upbeat",
  cues: [
    { t: 0, sfx: "fire", db: -6 }, { t: 0.25, sfx: "thud", db: -6 }, { t: 0.8, sfx: "fire", db: -8 },
    { t: tFor - 0.12, sfx: "scratch", db: -6 }, { t: tFor - 0.02, sfx: "impact", db: 0 },
    { t: T("S03"), sfx: "whoosh", db: -4 }, { t: T("S03") + 0.2, sfx: "sparkle", db: -8 },
    { t: tTag, sfx: "stamp", db: -4 }, { t: tOuch - 0.02, sfx: "impact", db: -2 }, { t: tOuch + 0.05, sfx: "gasp", db: -6 },
    { t: tFlip, sfx: "paper", db: -4 }, { t: tFlip + 0.15, sfx: "ding", db: -6 }, { t: T("S08") + 0.05, sfx: "success", db: -8 },
    { t: T("S09") + 0.1, sfx: "coins", db: -6 }, { t: tSign, sfx: "stamp", db: -2 },
    { t: T("S11"), sfx: "rumble", db: -6 }, { t: T("S11") + 0.1, sfx: "suspense", db: -8 }, { t: T("S11") + 0.5, sfx: "knock", db: -8 },
    { t: tBurst - 0.02, sfx: "crash", db: 0 }, { t: tBurst, sfx: "fire", db: -2 }, { t: tBurst + 0.05, sfx: "boom", db: -4 },
    { t: tTower - 0.02, sfx: "impact", db: 0 }, { t: T("S14"), sfx: "whoosh", db: -6 },
    { t: T("S15") + 0.25, sfx: "fire", db: -4 }, { t: T("S15") + 0.8, sfx: "fail", db: -6 },
    { t: T("S16") + 0.1, sfx: "tick", db: -6 }, { t: T("S16") + 0.5, sfx: "coins", db: -8 },
    { t: END - 0.35, sfx: "whoosh", db: -4 },
  ],
};

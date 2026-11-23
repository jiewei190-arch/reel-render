// rule-of-72: "Seventy-two tells you when your money doubles." A bright blocky maths workshop: a chalk-green board on
// the back wall, a podium, a bench of coin jars (green, saving) on the left and a red debt stack on the right.
import React from "react";
import { HoloTag, Jar, NeonSign } from "../library/props";
import { LENDER, PENNY, SAVER, SPENDER } from "../library/characters";
import { pop } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/rule_of_72.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, Hall, Label, PAL, Pedestal, Stamp } from "./props";
import SCRIPT from "./scripts/rule72";

// ------------------------------------------------------------------ layout
const POD: V3 = [0.25, 0, -0.75];
const POD_H = 0.85;
const P_SAVER: V3 = [-0.25, 0, 0.45];
const P_PENNY: V3 = [0.7, 0, 0.6];
const P_SPEND: V3 = [1.2, 0, 0.35];
const P_LEND: V3 = [2.0, 0, -0.35];
const BENCH: V3 = [-1.45, 0, -1.0]; // green jars (saving)
const DEBT: V3 = [1.45, 0, -1.0]; // red stack (owing)
const BOARD: V3 = [0, 2.15, -3.43];
const WOBBLE_Z = 1.25;
const S = { saver: 1.0, penny: 0.72, spender: 1.0, lender: 1.15 };
const face = (p: V3, s: number, dy = 0): V3 => [p[0], 1.247 * s + dy, p[2]];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const idx = (id: string) => PLAN.findIndex((p) => p.id === id);

// ------------------------------------------------------------------ story state
type Rate = { rate: string; years: string } | null;
const rateOf = (id: string): Rate => {
  const i = idx(id);
  if (i >= idx("S05") && i <= idx("S06")) return { rate: "6", years: "12" };
  if (id === "S07") return { rate: "8", years: "9" };
  if (i >= idx("S08") && i <= idx("S11")) return { rate: "12", years: "6" };
  if (i >= idx("S13") && i <= idx("S15")) return { rate: "24", years: "3" };
  return null;
};
/** time inside the current shot when the second jar pops in (faster rate = sooner) */
const jarPopAt: Record<string, number> = { S02: 0.35, S06: 0.75, S07: 0.5, S09: 0.25 };
const debtN = (id: string, tau: number) => {
  const i = idx(id);
  if (i < idx("S14")) return 3;
  if (id === "S14") return Math.round(lerp(3, 6, ss(0.25, 0.75, tau)));
  if (id === "S17") return 3;
  return 6;
};

// ------------------------------------------------------------------ lenses
const L = (o: Partial<FinShot> & Pick<FinShot, "subj" | "fov" | "face" | "mood">): Omit<FinShot, "id" | "a" | "b"> => ({ off: [0, 0, 3], ...o });
const OPEN_SUBJ: V3 = [-0.1, 1.55, 0.2];
const OPEN_POS: V3 = [0.35, 1.2, 3.0];
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: L({ subj: () => OPEN_SUBJ, pos: OPEN_POS, fov: 58, face: 0.5, mood: "store", roll: [0, 1.2], blur: 0.9 }),
  S02: L({ subj: () => [BENCH[0], 0.95, BENCH[2]], off: [0.35, 0.25, 1.35], fov: 48, face: 0.5, mood: "store", roll: [0, -1.2], blur: 2.0 }),
  S03: L({ subj: () => [POD[0], POD_H + 0.25, POD[2]], off: [-0.5, 0.35, 1.9], fov: 52, face: 0.5, mood: "store", roll: [0, 1.5], blur: 1.4, shutter: 0.2 }),
  S04: L({ subj: () => [1.6, 2.65, -3.2], pos: [0.9, 0.95, 0.9], fov: 56, face: 0.5, mood: "store", roll: [0, -1.2], blur: 0.6 }),
  S05: L({ subj: () => [0.25, 1.1, 0.45], pos: [0.45, 1.35, 3.0], fov: 54, face: 0.45, mood: "store", roll: [0, 1.0], blur: 1.0 }),
  S06: L({ subj: () => [BENCH[0], 1.05, BENCH[2]], off: [0.15, 0.35, 2.1], fov: 52, face: 0.5, mood: "store", roll: [0, 1.2], blur: 2.0 }),
  S07: L({ subj: () => face(P_PENNY, S.penny, -0.15), off: [0.35, 0.12, 1.45], fov: 50, face: 0.42, mood: "store", roll: [0, -1.2], blur: 1.8 }),
  S08: L({ subj: () => face(P_PENNY, S.penny, -0.12), off: [-0.4, 0.1, 1.3], fov: 50, face: 0.42, mood: "store", roll: [0, 1.2], blur: 1.8 }),
  S09: L({ subj: () => [BENCH[0] + 0.3, 1.0, BENCH[2] + 0.3], pos: [-0.2, 1.55, 2.4], fov: 56, face: 0.5, mood: "store", roll: [0, -1.0], blur: 1.0 }),
  S10: L({ subj: () => [1.4, 1.45, -2.9], pos: [1.45, 1.45, 0.4], fov: 50, face: 0.42, mood: "store", roll: [0, 1.2], blur: 1.6 }),
  S11: L({ subj: () => [0.0, 1.35, WOBBLE_Z], off: [0.4, 0.15, 3.4], fov: 56, face: 0.48, mood: "store", roll: [0, -1.5], blur: 0.9 }),
  S12: L({ subj: () => face(P_SPEND, S.spender, -0.15), off: [-0.45, 0.05, 1.9], fov: 50, face: 0.42, mood: "whisper", push: 0.08, roll: [0, 1.0], blur: 1.8 }),
  S13: L({ subj: () => [P_SPEND[0] - 0.1, 1.1, P_SPEND[2] + 0.62], off: [-0.05, 0.05, 0.85], fov: 44, face: 0.5, mood: "whisper", roll: [0, -1.5], blur: 2.6 }),
  S14: L({ subj: () => face(P_LEND, S.lender, -0.25), off: [0.85, 0.05, 2.0], fov: 52, face: 0.42, mood: "whisper", roll: [0, 1.2], blur: 1.4 }),
  S15: L({ subj: () => [P_SPEND[0] + 0.1, 1.35, P_SPEND[2] - 0.3], pos: [0.65, 0.35, 2.3], fov: 58, face: 0.4, mood: "whisper", roll: [0, -1.5], blur: 1.0 }),
  S16: L({ subj: () => [0.0, 1.3, -0.4], pos: [0.0, 1.45, 4.4], fov: 58, face: 0.48, mood: "store", roll: [0, 0.8], blur: 0.7, push: 0.08 }),
  S17: L({ subj: () => OPEN_SUBJ, pos: OPEN_POS, fov: 58, face: 0.5, mood: "store", roll: [0, 1.2], blur: 0.9 }),
};
export const RULE72_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ props
const CoinJar: React.FC<{ p: V3; fill: number; s?: number; glow?: number }> = ({ p, fill, s = 1.25, glow = 0 }) => (
  <group position={p} scale={s}>
    <Jar label={false}>
      <mesh position={[0, (0.34 * fill) / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * fill), 32]} />
        <meshStandardMaterial color={PAL.coin} roughness={0.35} emissive="#c88a10" emissiveIntensity={0.25 + glow} />
      </mesh>
    </Jar>
  </group>
);
/** the bench of green jars; n jars, the last pops in with u (0..1) */
const Bench: React.FC<{ n: number; u: number; tag?: string; t: number }> = ({ n, u, tag, t }) => (
  <group>
    <mesh position={[BENCH[0], 0.36, BENCH[2]]} castShadow receiveShadow>
      <boxGeometry args={[1.7, 0.72, 0.6]} />
      <meshStandardMaterial color={PAL.cash} roughness={0.5} />
    </mesh>
    <mesh position={[BENCH[0], 0.735, BENCH[2]]} receiveShadow>
      <boxGeometry args={[1.8, 0.04, 0.68]} />
      <meshStandardMaterial color="#e8fff0" roughness={0.4} />
    </mesh>
    {Array.from({ length: n }, (_, i) => {
      const last = i === n - 1 && u < 1;
      const k = last ? Math.max(0, pop(u)) : 1;
      return k > 0.01 ? (
        <group key={i} position={[BENCH[0] - 0.35 + i * 0.7, 0.755, BENCH[2]]} scale={[k, k, k]}>
          <CoinJar p={[0, 0, 0]} fill={0.7} glow={last ? 0.6 : 0.1} />
        </group>
      ) : null;
    })}
    {tag ? <HoloTag p={[BENCH[0], 1.38, BENCH[2] + 0.25]} text={tag} t={t} w={0.55} /> : null}
  </group>
);
/** the red debt stack: n red blocks with "$" faces */
const DebtStack: React.FC<{ n: number; tag?: string; t: number; glow?: number }> = ({ n, tag, t, glow = 0 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => (
      <BigBlock key={i} p={[DEBT[0] + 0.03 * Math.sin(i * 2.1), i * 0.3, DEBT[2]]} size={[0.62, 0.29, 0.42]} color={PAL.debt} text="$" r={[0, 0.06 * Math.sin(i * 1.7), 0]} glow={glow} />
    ))}
    {tag ? <HoloTag p={[DEBT[0], n * 0.3 + 0.3, DEBT[2] + 0.25]} text={tag} t={t} w={0.6} /> : null}
  </group>
);
const RateCard: React.FC<{ text: string; red?: boolean }> = ({ text, red = false }) => (
  <group rotation={[0, 0, 0]}>
    <Label p={[0, 0.12, 0]} text={[text]} w={0.3} h={0.2} bg={red ? PAL.debt : "#fffaf0"} fg={red ? "#ffffff" : PAL.ink} border={red ? undefined : "#1f9e4f"} glow={red ? 0.5 : 0} />
  </group>
);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const rate = rateOf(id);
  const debtSide = i >= idx("S12") && i <= idx("S15");
  const actors: React.ReactNode[] = [];
  // ---- Saver: hoists the 72 block (S01, S17), slams + chops (S03), taps the tag (S10), balances (S11), split (S16)
  let block: React.ReactNode = null;
  {
    let p = P_SAVER;
    const yawCam = yawTo(p, [0.3, 0, 3.4]);
    let pose: Pose = { ...stand(p[0], p[2], yawCam, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    if (id === "S01" || id === "S17") {
      const lift = id === "S01" ? 1 : ss(0.1, 0.7, tau);
      pose = { ...pose, armL: lerp(0.3, 2.95, lift), armR: lerp(0.3, 2.95, lift), outL: 0.12, outR: 0.12, headPitch: -0.12 };
      block = <BigBlock p={[p[0], lerp(1.1, 1.78, lift) + 0.03 * Math.sin(t * 3), p[2] + 0.05]} size={[0.62, 0.46, 0.36]} color="#f0c040" fg="#16121c" text="72" glow={0.35} r={[0, yawCam, 0]} />;
      emo = "joy";
    } else if (id === "S03") {
      p = [POD[0] - 0.6, 0, POD[2] + 0.35];
      const chop = ss(0.45, 0.62, tau);
      pose = { ...stand(p[0], p[2], yawTo(p, POD) * 0.6 + yawTo(p, [0, 0, 3]) * 0.4, S.saver), armL: lerp(2.6, 1.05, chop), outL: 0.15, armR: 0.3 };
      emo = "sly";
    } else if (id === "S10") {
      p = [1.75, 0, -2.85];
      pose = { ...stand(p[0], p[2], yawTo(p, [1.45, 0, 0.4]), S.saver), armL: 2.0 + 0.1 * Math.max(0, Math.sin(tau * 10)), outL: 0.75, headYaw: 0.5, armR: 0.2 };
      emo = "curious";
    } else if (id === "S11") {
      const x = lerp(-0.6, 0.6, ss(0, 1.8, tau));
      p = [x, wobbleH(x, t), WOBBLE_Z];
      const tip = 0.12 * Math.sin(t * 5);
      pose = { ...stand(p[0], p[2], yawTo(p, [0.4, 0, WOBBLE_Z + 3.4]), S.saver), y: stand(0, 0, 0, S.saver).y + p[1], outL: 1.45 + tip, outR: 1.45 - tip, armL: 0.1, armR: 0.1, sway: tip };
      emo = "shock";
    } else if (id === "S16") {
      p = [-1.1, 0, 0.3];
      pose = { ...stand(p[0], p[2], yawTo(p, [0, 0, 4.4]), S.saver), armR: 1.2, outR: 0.4, armL: 0.2 };
      emo = "happy";
    } else if (id === "S05") {
      p = [-0.25, 0, 0.35];
      pose = { ...stand(p[0], p[2], yawTo(p, P_PENNY) * 0.5 + yawCam * 0.5, S.saver), armL: 0.2, armR: 0.9, outR: 0.3 };
    }
    const show = !(debtSide && id !== "S12") || id === "S16";
    if (show && !(id === "S12" || id === "S13" || id === "S14" || id === "S15"))
      actors.push(<Act key="saver" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} />);
  }
  // ---- Penny: the rate card (S05..S09)
  if (i >= idx("S05") && i <= idx("S09")) {
    const p = P_PENNY;
    const flip = id === "S07" || id === "S08" ? ss(0, 0.35, tau) : 1;
    const pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0.6, 0, 3]), S.penny), armL: 2.2 + 0.15 * Math.sin(t * 6), outL: 0.2, armR: 0.2 };
    const card = <group rotation={[0, (1 - flip) * Math.PI, 0]}><RateCard text={`${rate?.rate ?? "6"}%`} /></group>;
    actors.push(<Act key="penny" look={PENNY} pose={pose} emotion={id === "S08" ? "joy" : "happy"} s={S.penny} t={t} seed={1} held={{ side: "L", node: card }} />);
  }
  // ---- Spender: enters with the red card (S12..S16)
  if (i >= idx("S12") && i <= idx("S16")) {
    const p = id === "S16" ? [1.1, 0, 0.3] as V3 : P_SPEND;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0, 0, 3]), S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "sly";
    let held;
    if (id === "S12") {
      const walkIn = ss(0, 0.6, tau);
      pose = { ...stand(lerp(p[0] + 1.2, p[0], walkIn), p[2], yawTo(p, [0, 0, 3]), S.spender), armL: 1.25, outL: 0.25 };
      held = { side: "L" as const, node: <RateCard text="24%" red /> };
    } else if (id === "S13") {
      pose = { ...pose, armL: 1.25, outL: 0.25 };
      held = { side: "L" as const, node: <RateCard text="24%" red /> };
    } else if (id === "S15") {
      pose = { ...pose, armL: 1.0, armR: 1.0, outL: -0.1, outR: -0.1, headPitch: -0.35, ant: 1 };
      emo = "shock";
    } else if (id === "S16") {
      pose = { ...pose, headYaw: 0.55, headPitch: 0.1 };
      emo = "sad";
    } else if (id === "S14") {
      emo = "curious";
    }
    actors.push(<Act key="spender" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
  }
  // ---- Lender: stacks red blocks (S14, S15)
  if (id === "S14" || id === "S15") {
    const p = P_LEND;
    const lift = id === "S14" ? Math.sin(Math.PI * ss(0, 0.9, tau)) : 0;
    const pose: Pose = { ...stand(p[0], p[2], yawTo(p, DEBT) * 0.3 + yawTo(p, [2.85, 0, 1.65]) * 0.7, S.lender), armL: 1.0 + 0.9 * lift, armR: 1.0 + 0.9 * lift };
    actors.push(<Act key="lender" look={LENDER} pose={pose} emotion="sly" s={S.lender} t={t} seed={5} />);
  }
  // ---- podium: the 72 block sits here in S02..S03 then splits; later a plain podium
  let podTop: React.ReactNode = null;
  if (id === "S03") {
    const land = ss(0.0, 0.35, tau);
    const split = ss(0.6, 0.95, tau);
    if (split <= 0) podTop = <BigBlock p={[POD[0], lerp(POD_H + 0.6, POD_H, land), POD[2]]} size={[0.62, 0.46, 0.36]} color="#f0c040" fg="#16121c" text="72" glow={0.3} />;
    else
      podTop = (
        <>
          <BigBlock p={[POD[0] - 0.17 - 0.12 * split, POD_H, POD[2]]} size={[0.3, 0.46, 0.36]} color="#f0c040" fg="#16121c" text="72" r={[0, 0, 0.12 * split]} />
          <BigBlock p={[POD[0] + 0.17 + 0.12 * split, POD_H, POD[2]]} size={[0.3, 0.46, 0.36]} color={PAL.cash} fg="#ffffff" text="÷ %" r={[0, 0, -0.12 * split]} />
        </>
      );
  }
  // ---- jars + debt stack
  const jp = jarPopAt[id];
  const jars = jp !== undefined ? <Bench n={2} u={clamp((tau - jp) / 0.7)} t={t} tag={rate ? `${rate.years} YRS` : undefined} /> : <Bench n={id === "S16" ? 3 : 1} u={1} t={t} />;
  const debtTag = id === "S15" ? "3 YRS" : undefined;
  // ---- the wobbly line (S11)
  const wobble =
    id === "S11"
      ? Array.from({ length: 13 }, (_, k) => {
          const x = -1.8 + k * 0.3;
          const h = wobbleH(x, t);
          return (
            <mesh key={k} position={[x, h / 2, WOBBLE_Z]} castShadow receiveShadow>
              <boxGeometry args={[0.28, Math.max(0.05, h), 0.4]} />
              <meshStandardMaterial color={PAL.cash} roughness={0.45} emissive={PAL.cash} emissiveIntensity={0.2} />
            </mesh>
          );
        })
      : null;
  // ---- the board: the rule painted from frame 0 + the current sum; a stamp in S10
  const sum = rate ? `72 ÷ ${rate.rate} = ${rate.years}` : "72 ÷ RATE = YEARS";
  const neon = i < idx("S04") ? 0 : id === "S04" ? (Math.floor(tau * 14) % 3 === 0 && tau < 0.6 ? 0.3 : 1) : 1;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#5fb8a0" stripe="#ffd23a" floorA="#f6f2ff" floorB="#e6defa" />
      <Label p={BOARD} text={["72 ÷ RATE ≈ YEARS TO DOUBLE", sum]} w={3.3} h={1.45} bg="#1e4a2e" fg="#f4fff0" border="#7ee8a0" />
      <NeonSign p={[2.6, 3.3, -3.4]} text="RATE %" w={1.3} h={0.42} color={neon > 0.5 ? "#ff5aa0" : "#4a2a3a"} />
      {id === "S10" ? <Stamp p={[BOARD[0] + 1.05, BOARD[1] - 0.95, BOARD[2] + 0.02]} text="≈ ESTIMATE" u={clamp(tau / 0.3)} w={1.0} /> : null}
      <Pedestal p={POD} h={POD_H} r={0.34} />
      {podTop}
      {jars}
      <DebtStack n={debtN(id, tau)} t={t} tag={debtTag} glow={debtSide ? 0.25 : 0} />
      {id === "S13" ? <Label p={[P_SPEND[0] - 0.1, 1.1 + 0.02 * Math.sin(t * 2), P_SPEND[2] + 0.62]} r={[0, 0, -0.06]} text={["24% APR", "EXAMPLE"]} w={0.5} h={0.32} bg="#a01818" fg="#ffffff" /> : null}
      {wobble}
      {block}
      {actors}
    </>
  );
};
/** the "real returns" line: block heights rising and dipping (seeded, slow) */
const wobbleH = (x: number, t: number) => 0.55 + 0.3 * Math.sin(x * 2.2 + 0.6) + 0.12 * Math.sin(x * 5.1 + t * 1.5) + 0.05 * (hash(Math.round(x * 10)) - 0.5);

// ------------------------------------------------------------------ counter
const counter = (t: number, shot: FinShot, tau: number): CounterState => {
  const id = shot.id;
  const i = idx(id);
  const rate = rateOf(id);
  const fresh = (id === "S05" || id === "S07" || id === "S08" || id === "S13") ? clamp(tau / 0.35) : 0;
  if (id === "S16")
    return { lines: [{ text: "72 ÷ 8 = 9 YRS", color: "#5ff08a", size: 70 }, { text: "72 ÷ 24 = 3 YRS", color: "#ff6a5f", size: 70 }], accent: "#ffe27a" };
  if (!rate) return { lines: [{ text: "72 ÷ RATE = YEARS", color: "#ffffff" }, ...(id === "S10" || id === "S11" ? [{ text: "AN ESTIMATE", color: "#ffe27a", size: 44 }] : [])], accent: "#7fefff" };
  const red = i >= idx("S12");
  return { lines: [{ text: `72 ÷ ${rate.rate} = ${rate.years} YRS`, color: red ? "#ff6a5f" : "#5ff08a" }, ...(id === "S10" || id === "S11" ? [{ text: "AN ESTIMATE", color: "#ffe27a", size: 44 }] : [])], pop: fresh, accent: red ? "#ff8a7a" : "#7dffb0" };
};

export const RULE72_SPEC: FinSpec = {
  slug: "rule-of-72",
  shots: RULE72_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: (_t, shot) => (idx(shot.id) >= idx("S12") && idx(shot.id) <= idx("S15") ? "24% APR · EXAMPLE" : null),
  bg: "#1f3a34",
};
export const _r72 = { T };

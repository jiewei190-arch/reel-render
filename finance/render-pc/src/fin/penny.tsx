// penny-doubles: "This penny beats a million dollars." A bright blocky coin-counter hall. Times from
// src/shorts/penny_doubles.plan.gen.ts (do not edit there); lenses, staging and counter here.
import React from "react";
import { Jar, ShelfUnit, SHELF, NeonSign, HoloTag, Counter as Desk } from "../library/props";
import { PENNY, SAVER, SPENDER, TELLER } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { pop } from "../library/characters";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/penny_doubles.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { Bill, BillFan, CashCase, Coin, CoinPile, CoinStack, FlipCalendar, Hall, Label, Pedestal, Receipt } from "./props";
import SCRIPT from "./scripts/penny";

// ------------------------------------------------------------------ layout (metres; y up, lens side = +z)
const POD: V3 = [0.12, 0, 0.25];
const POD_H = 0.8;
const DESK: V3 = [0.75, 0, -0.75]; // counter: 2.0 wide, top 0.98, front face z = -0.4
const CASE_ON: V3 = [0.42, 0.98, -0.62];
const P_PENNY: V3 = [-0.45, 0, 0.62];
const P_SPEND: V3 = [1.05, 0, 0.2];
const P_TELL: V3 = [0.95, 0, -1.3];
const P_SAVER: V3 = [1.95, 0, 2.2];
const P_SPEND_END: V3 = [2.35, 0, 1.55];
const CAL: V3 = [-1.25, 2.2, -3.44];
const SHELF_P: V3 = [-2.7, 0, -3.15];
const S = { penny: 0.72, spender: 1.0, teller: 0.9, saver: 1.0 };
const face = (p: V3, s: number, dy = 0): V3 => [p[0], 1.247 * s + dy, p[2]];

const t0 = (id: string) => PLAN.find((p) => p.id === id)!.t;
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const after = (id: string, t: number) => t >= T[id] - 1e-6;

// ------------------------------------------------------------------ story state
/** the day the world shows at time t (the counter ticks inside shots) */
const dayAt = (t: number): number => {
  if (t < T.S03) return 1;
  if (t < T.S05) return lerp(1, 2, ss(T.S03 + 0.2, T.S03 + 0.7, t));
  if (t < T.S07) return lerp(2, 10, ss(T.S05, T.S05 + 0.75, t));
  if (t < T.S11) return lerp(10, 20, ss(T.S07, T.S07 + 0.75, t));
  if (t < T.S14) return lerp(20, 25, ss(T.S11 + 0.1, T.S12 + 0.4, t));
  if (t < T.S16) return lerp(25, 28, ss(T.S14, T.S14 + 0.6, t));
  if (t < T.S21) return lerp(28, 30, ss(T.S16 + 0.1, T.S16 + 0.75, t));
  return 1;
};
const value = (d: number) => 0.01 * Math.pow(2, d - 1);
/** pile size for a day (the coin heap grows with the money, cube-root so it reads) */
const pileOf = (d: number): { r: number; h: number } => {
  if (d < 26) return { r: 0, h: 0 };
  const u = clamp((d - 26) / 4); // 26 -> 30
  const k = Math.pow(value(d) / value(30), 1 / 3);
  return { r: lerp(0.3, 2.3, k) * (0.4 + 0.6 * u), h: lerp(0.3, 2.7, k) * (0.4 + 0.6 * u) };
};

// ------------------------------------------------------------------ shots (lenses)
const L = (o: Partial<FinShot> & Pick<FinShot, "subj" | "fov" | "face" | "mood">): Omit<FinShot, "id" | "a" | "b"> => ({ off: [0, 0, 3], ...o });
const MID: V3 = [0.1, 0.92, 0.35];
const OPEN_POS: V3 = [0.32, 1.22, 3.25];
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: L({ subj: () => MID, pos: OPEN_POS, fov: 56, face: 0.42, mood: "store", roll: [0, 1.2], blur: 1.0 }),
  S02: L({ subj: () => face(P_SPEND, S.spender, -0.15), off: [-0.55, 0.05, 1.85], fov: 50, face: 0.4, mood: "store", roll: [0, -1.2], blur: 1.6 }),
  S03: L({ subj: () => [POD[0], POD_H + 0.05, POD[2]], off: [0.12, 0.22, 0.85], fov: 46, face: 0.5, mood: "store", roll: [0, 1.5], blur: 2.4 }),
  S04: L({ subj: () => [-0.95, 1.45, -1.6], pos: [0.2, 0.5, 1.75], fov: 60, face: 0.42, mood: "store", roll: [0, -1.5], blur: 0.8 }),
  S05: L({ subj: () => [-0.55, 1.35, -1.2], pos: [0.6, 1.4, 3.1], fov: 56, face: 0.45, mood: "store", roll: [0, 1.0], blur: 0.8 }),
  S06: L({ subj: () => [POD[0], POD_H + 0.1, POD[2]], off: [-0.45, 0.2, 1.05], fov: 48, face: 0.55, mood: "store", roll: [0, -1.5], blur: 2.2 }),
  S07: L({ subj: () => [POD[0], POD_H + 0.2, POD[2]], off: [0.35, 0.25, 1.6], fov: 50, face: 0.5, mood: "store", roll: [0, 1.2], blur: 1.4 }),
  S08: L({ subj: () => [POD[0] - 0.2, POD_H + 0.1, POD[2] + 0.2], off: [0.42, 0.08, 1.0], fov: 48, face: 0.48, mood: "store", roll: [0, -1.2], blur: 2.2 }),
  S09: L({ subj: () => [0.55, 0.8, 0.35], pos: [1.7, 1.1, 2.75], fov: 54, face: 0.45, mood: "store", roll: [0, 1.2], blur: 1.2 }),
  S10: L({ subj: () => [POD[0] - 0.17, POD_H + 0.12, POD[2] + 0.22], off: [0.38, 0.06, 0.95], fov: 44, face: 0.5, mood: "whisper", push: 0.08, roll: [0, -1], blur: 2.4 }),
  S11: L({ subj: () => [POD[0], POD_H + 0.3, POD[2]], off: [0.6, 0.2, 2.0], fov: 52, face: 0.5, mood: "whisper", roll: [0, 1.5], blur: 1.2, shutter: 0.2 }),
  S12: L({ subj: () => [SHELF_P[0], 1.0, SHELF_P[2] + 0.3], pos: [-1.7, 1.25, -0.55], fov: 56, face: 0.48, mood: "store", roll: [0, -1.2], blur: 0.8 }),
  S13: L({ subj: () => face(P_SPEND, S.spender, -0.12), off: [0.45, 0.02, 1.25], fov: 46, face: 0.42, mood: "store", roll: [0, 1.5], blur: 2.0 }),
  S14: L({ subj: () => [POD[0], 1.75, POD[2]], pos: [0.55, 0.45, 3.4], fov: 60, face: 0.52, mood: "store", roll: [0, -1.5], blur: 0.8 }),
  S15: L({ subj: () => face(P_TELL, S.teller, -0.25), pos: [-0.35, 1.62, 0.05], fov: 50, face: 0.4, mood: "store", roll: [0, 1.2], blur: 1.5 }),
  S16: L({ subj: () => [POD[0], 2.2, POD[2]], pos: [0.5, 3.0, 6.6], fov: 62, face: 0.5, mood: "ending", roll: [0, -1.2], blur: 0.6, push: 0.09 }),
  S17: L({ subj: () => [POD[0], 3.15, POD[2] + 0.1], off: [0.6, -0.1, 2.6], fov: 52, face: 0.52, mood: "ending", roll: [0, 1.2], blur: 1.2 }),
  S18: L({ subj: () => face(P_SPEND_END, S.spender, -0.1), off: [-0.4, 0.02, 1.2], fov: 46, face: 0.42, mood: "ending", roll: [0, -1.5], blur: 2.0 }),
  S19: L({ subj: () => [0.9, 1.3, 1.0], pos: [2.4, 1.9, 6.6], fov: 60, face: 0.5, mood: "ending", roll: [0, 1.0], blur: 0.8 }),
  S20: L({ subj: () => [CAL[0], CAL[1] - 0.05, CAL[2] + 0.4], off: [0.25, -0.2, 2.2], fov: 46, face: 0.48, mood: "ending", roll: [0, -1.5], blur: 1.6 }),
  S21: L({ subj: () => MID, pos: OPEN_POS, fov: 56, face: 0.42, mood: "store", roll: [0, 1.2], blur: 1.0 }),
};
export const PENNY_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ the scene
const coinsBurst = (tau: number) => {
  // S11: coins pop over the rim and arc out onto the floor and counter (seeded, ballistic, then resting)
  const out: React.ReactNode[] = [];
  const top: V3 = [POD[0], POD_H + 0.36, POD[2]];
  for (let i = 0; i < 26; i++) {
    const t = tau - 0.04 * i * 0.5;
    if (t <= 0) continue;
    const a = hash(i * 3.3) * Math.PI * 2;
    const v = 0.9 + 0.8 * hash(i * 7.1);
    const vy = 1.8 + 0.9 * hash(i * 2.9);
    const tt = Math.min(t, (vy + Math.sqrt(vy * vy + 2 * 9.8 * top[1])) / 9.8);
    const y = Math.max(0.0, top[1] + vy * tt - 4.9 * tt * tt);
    out.push(<Coin key={i} p={[top[0] + Math.cos(a) * v * tt * 0.6, y, top[2] + Math.sin(a) * v * tt * 0.6]} r={[t * 9 * (1 - tt / 2), a, t * 5]} s={1.15} glow={0.6} />);
  }
  return out;
};

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const d = id === "S21" ? 1 : dayAt(t);
  const day = Math.floor(d + 1e-6);
  const pile = id === "S21" || id === "S20" ? { r: 0, h: 0 } : pileOf(d);
  const pileShown = id === "S20" ? pileOf(30) : pile;
  // what sits on the podium
  const jarPhase = d >= 19.5 && d < 25 && id !== "S21";
  const jarFill = jarPhase ? clamp(0.15 + 0.35 * ss(T.S07, T.S07 + 0.8, t) + (id === "S11" ? 0.5 * ss(0, 0.5, tau) : 0)) : 0;
  const jarGlow = id === "S10" ? ss(0, 0.9, tau) : id === "S11" ? 1 : 0;
  // the case: on the counter, then hugged by Spender (S02..S18), slips in S18
  const hugging = after("S02", t) && !after("S21", t) && !(id === "S09");
  const caseSlip = id === "S18" ? ss(0.25, 0.75, tau) : after("S19", t) && !after("S21", t) ? 1 : 0;
  // ---- actors
  const actors: React.ReactNode[] = [];
  // Penny: by the podium (S01..S13), on top of the pile (S14..S17), off to the side (S19, S20), back (S21)
  {
    let p = P_PENNY;
    let pose: Pose;
    let emo: Emotion = "happy";
    const yawCam = yawTo(p, [0.6, 0, 3]);
    if (pile.h > 0.6 && (id === "S14" || id === "S16" || id === "S17")) {
      p = [POD[0] - 0.05, pile.h - 0.06, POD[2] + 0.1];
      pose = { ...stand(p[0], p[2], yawTo(p, [0.6, 0, 4]), S.penny), y: stand(0, 0, 0, S.penny).y + p[1], armL: 2.6 + 0.25 * Math.sin(t * 9), outL: 0.35, armR: 0.2 };
      emo = "joy";
    } else if (id === "S04") {
      pose = { ...stand(p[0], p[2], yawTo(p, [CAL[0], 0, CAL[2]]) * 0.55 + yawCam * 0.45, S.penny), headPitch: -0.55, armL: 0.25, armR: 0.25 };
      emo = "curious";
    } else if (id === "S06") {
      pose = { ...stand(p[0], p[2], yawCam, S.penny), outL: 0.75 * ss(0, 0.5, tau), outR: 0.75 * ss(0, 0.5, tau), armL: 0.3, armR: 0.3, headPitch: 0.1 };
      emo = "sad";
    } else if (id === "S08" || id === "S10") {
      p = [POD[0] - 0.38, 0, POD[2] + 0.32];
      const tap = id === "S08" ? 0.12 * Math.max(0, Math.sin(tau * 12)) : 0;
      pose = { ...stand(p[0], p[2], yawTo(p, POD) * 0.6 + yawTo(p, [0, 0, 3]) * 0.4, S.penny), armL: 1.45 + tap, outL: 0.2, headPitch: 0.05 };
      emo = id === "S10" ? "shock" : "curious";
    } else if (id === "S19" || id === "S20" || id === "S18") {
      p = [-2.35, 0, 1.5];
      pose = { ...stand(p[0], p[2], yawCam, S.penny), armL: 2.6 + 0.25 * Math.sin(t * 9), outL: 0.3 };
      emo = "joy";
    } else {
      // pointing at the penny on the podium (S01, S21), watching otherwise
      const point = id === "S01" || id === "S21" || id === "S03" ? 1 : 0;
      pose = { ...stand(p[0], p[2], yawTo(p, POD) * 0.45 + yawCam * 0.55, S.penny), armL: lerp(0.15, 1.35, point), outL: lerp(0.08, 0.35, point) };
      emo = id === "S11" || id === "S12" ? "shock" : "happy";
    }
    actors.push(<Act key="penny" look={PENNY} pose={pose} emotion={emo} s={S.penny} t={t} seed={1} />);
  }
  // Spender (steps out of the mountain's way in the ending)
  {
    const p = after("S16", t) && !after("S21", t) ? P_SPEND_END : P_SPEND;
    const yawCam = yawTo(p, [0.2, 0, 3]);
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, CASE_ON) * 0.5 + yawCam * 0.5, S.spender), armL: 0.15, armR: 0.15 };
    let emo: Emotion = "sly";
    let chest: React.ReactNode = undefined;
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    const hug = { armL: 1.05, armR: 1.05, outL: -0.12, outR: -0.12 };
    if (id === "S01") {
      pose = { ...pose, headYaw: -0.25, armR: 0.5 };
      emo = "curious";
    }
    if (hugging && id !== "S18") {
      const g = id === "S02" ? pop(clamp(tau / 0.75)) : 1;
      pose = { ...stand(p[0], p[2], yawCam, S.spender), armL: lerp(0.15, hug.armL, g), armR: lerp(0.15, hug.armR, g), outL: hug.outL, outR: hug.outR };
      chest = <group position={[0, -0.08, 0.2]} scale={0.62}><CashCase label="$1,000,000" glow={0.6} /></group>;
      emo = "sly";
    }
    if (id === "S06") {
      pose = { ...pose, armR: 1.45, outR: 0.15, armL: hug.armL, headPitch: -0.06 + 0.05 * Math.sin(tau * 14), sway: 0.05 * Math.sin(tau * 14) };
      emo = "joy";
    }
    if (id === "S09") {
      // sitting on the case on the floor, fanning bills
      const sp: V3 = [0.75, 0, 0.55];
      pose = { ...stand(sp[0], sp[2], yawTo(sp, [1.5, 0, 3]), S.spender), legL: 1.35, legR: 1.35, y: stand(0, 0, 0, 1).y - 0.2, armR: 1.2 + 0.18 * Math.sin(tau * 10), outR: 0.25, armL: 0.3 };
      held = { side: "R", node: <BillFan spread={0.6} /> };
      emo = "sly";
    }
    if (id === "S13") {
      pose = { ...pose, headPitch: 0.12, headYaw: -0.4 * ss(0, 0.5, tau), ant: 1 };
      emo = "shock";
    }
    if (id === "S18") {
      const sl = caseSlip;
      pose = { ...stand(p[0], p[2], yawCam, S.spender), armL: lerp(hug.armL, 0.35, sl), armR: lerp(hug.armR, 0.35, sl), outL: 0.3 * sl, outR: 0.3 * sl, ant: 1 };
      chest = sl < 0.5 ? <group position={[0, -0.08 - 0.3 * sl, 0.2]} scale={0.62}><CashCase label="$1,000,000" glow={0.6} /></group> : undefined;
      emo = "shock";
    }
    if (id === "S19" || id === "S20") {
      pose = { ...stand(p[0], p[2], yawTo(p, POD), S.spender), armL: 0.2, armR: 0.2, ant: -1 };
      emo = "sad";
    }
    if (id === "S21") {
      pose = { ...stand(p[0], p[2], yawTo(p, POD) * 0.6 + yawCam * 0.4, S.spender), armL: 1.2 * ss(0.2, 1.0, tau), outL: 0.35 * ss(0.2, 1.0, tau), armR: 0.15 };
      emo = "curious";
    }
    actors.push(<Act key="spender" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} chest={chest} held={held} />);
  }
  // Teller behind the counter (buried by the mountain in the ending)
  if (!(pile.h > 1.5 || id === "S20")) {
    const p = P_TELL;
    const slide = id === "S01" || id === "S21" ? ss(0, 0.6, tau) : 0;
    const pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0, 0, 3]), S.teller), armL: 0.9 * slide + (id === "S15" ? 1.0 : 0.1), armR: id === "S15" ? 1.0 : 0.1, outL: 0.15 };
    actors.push(<Act key="teller" look={TELLER} pose={pose} emotion={id === "S15" || id === "S16" ? "joy" : "happy"} s={S.teller} t={t} seed={3} />);
  }
  // Saver (enters for the half-split)
  if (id === "S19") {
    const p = P_SAVER;
    const pose: Pose = { ...stand(p[0], p[2], yawTo(p, POD) * 0.6 + yawTo(p, [1.9, 0, 5]) * 0.4, S.saver), armL: 1.5, outL: 0.25, armR: 0.2 };
    actors.push(<Act key="saver" look={SAVER} pose={pose} emotion="happy" s={S.saver} t={t} seed={4} />);
  }
  // ---- props on and around the podium
  const pod: React.ReactNode[] = [];
  const top = POD_H;
  if (pile.h < 0.75) {
    if (day <= 1 || id === "S21") pod.push(<BigPenny key="penny" t={t} />);
    else if (id === "S03") {
      const u = pop(clamp(tau / 0.7));
      pod.push(<BigPenny key="c1" t={t} dx={-0.11 * u} />, <BigPenny key="c2" t={t} dx={0.11 * u} s={clamp(u + 0.2)} />);
    } else if (day < 10 || id === "S04") pod.push(<BigPenny key="c1" t={t} dx={-0.11} />, <BigPenny key="c2" t={t} dx={0.11} />);
    else if (!jarPhase) pod.push(<CoinStack key="st" p={[POD[0], top, POD[2]]} n={lerp(2, 9, clamp((d - 2) / 8))} s={1.5} copper />);
    if (jarPhase)
      pod.push(
        <group key="jar" position={[POD[0], top, POD[2]]} scale={1.25}>
          <Jar label={false}>
            <mesh position={[0, (0.34 * jarFill) / 2 + 0.01, 0]}>
              <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * jarFill), 32]} />
              <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#ffb020" emissiveIntensity={0.25 + 1.4 * jarGlow} />
            </mesh>
          </Jar>
          {jarGlow > 0 ? <pointLight position={[0, 0.25, 0.25]} color="#ffd060" intensity={2.5 * jarGlow} distance={2.2} decay={2} /> : null}
        </group>,
      );
  }
  // ---- shelves with coin stacks (DAY 25)
  const shelfFill = id === "S12" ? ss(0, 0.6, tau) : d >= 25 && d < 28.5 && id !== "S21" ? 1 : 0;
  const stacks: React.ReactNode[] = [];
  if (shelfFill > 0)
    SHELF.boards.forEach((by, bi) => {
      for (let i = 0; i < 9; i++) {
        const show = shelfFill * 9 * 3 - (bi * 9 + i);
        if (show <= 0) continue;
        stacks.push(<CoinStack key={`${bi}-${i}`} p={[-SHELF.w / 2 + 0.2 + i * 0.275, by, 0.02]} n={Math.round(8 + 10 * hash(bi * 9 + i)) * clamp(show)} seed={bi * 9 + i} s={1.6} />);
      }
    });
  // ---- the receipt (S15), the half-split line (S19), the flying page (S20)
  const receiptLen = id === "S15" ? 0.2 + 1.6 * ss(0, 1.4, tau) : 0;
  const calValue = id === "S21" || d < 1.5 ? "1" : String(Math.min(30, day));
  const calPrev = id === "S05" ? "2" : id === "S07" ? "10" : id === "S12" ? "20" : id === "S14" ? "25" : id === "S16" ? "28" : undefined;
  const calFlip = calPrev ? ss(0.05, 0.5, tau) : 1;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#7f6fe0" stripe="#ffd23a">
        <NeonSign p={[1.6, 2.65, -3.42]} text="COIN COUNTER" w={2.2} h={0.42} color="#7dffcf" />
      </Hall>
      <Desk p={DESK} />
      <Pedestal p={POD} h={POD_H} r={0.2} />
      <ShelfUnit p={SHELF_P} yaw={0}>{stacks}</ShelfUnit>
      <FlipCalendar p={CAL} value={id === "S20" ? "30" : calValue} prev={calPrev} flip={calFlip} sub="OF 30" />
      {!hugging && !(id === "S09") && caseSlip === 0 ? <CashCase p={CASE_ON} label="$1,000,000" glow={1} /> : null}
      {id === "S09" ? <CashCase p={[0.75, 0, 0.55]} r={[0, 0.4, 0]} label="$1,000,000" glow={0.7} s={1.1} /> : null}
      {caseSlip > 0.5 && !after("S21", t) ? <CashCase p={[P_SPEND_END[0] - 0.05, Math.max(0, 0.75 - 1.6 * (caseSlip - 0.5)), P_SPEND_END[2] + 0.62]} r={[0.5 * caseSlip, 0.3, 0.2 * caseSlip]} label="$1,000,000" glow={0.4} s={0.62} /> : null}
      {pod}
      {id === "S11" ? coinsBurst(tau) : null}
      {pileShown.h > 0 ? <CoinPile p={POD} r={pileShown.r} h={pileShown.h} coins={pileShown.h > 1.5 ? 160 : 90} glow={after("S16", t) ? 0.4 : 0} splitGlow={id === "S19" ? ss(0.1, 0.8, tau) : 0} /> : null}
      {id === "S16" ? <HoloTag p={[POD[0] + 1.3, pileShown.h * 0.55, POD[2] + 1.6]} text="$5,368,709" t={t} w={1.1} /> : null}
            {id === "S20" ? <FlyingPage tau={tau} /> : null}
      {receiptLen > 0 ? <Receipt p={[0.55, 0.98, -0.95]} len={receiptLen} /> : null}
            {actors}
    </>
  );
};
/** the penny: one big copper coin standing upright on a little stand on the podium, slowly turning, glowing */
const BigPenny: React.FC<{ t: number; dx?: number; s?: number }> = ({ t, dx = 0, s = 1 }) => (
  <group position={[POD[0] + dx, POD_H, POD[2]]} scale={s}>
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.07, 0.09, 0.04, 20]} />
      <meshStandardMaterial color="#3a3f58" roughness={0.4} />
    </mesh>
    <Coin p={[0, 0.2, 0]} r={[Math.PI / 2, 0, 0.25 * Math.sin(t * 1.4)]} s={2.9} copper glow={0.5} />
    <pointLight position={[0, 0.25, 0.3]} color="#ffb070" intensity={0.7} distance={1.2} decay={2} />
  </group>
);
/** S20: the last page tears off the calendar and flutters toward the lens */
const FlyingPage: React.FC<{ tau: number }> = ({ tau }) => {
  const u = ss(0.15, 1.9, tau);
  const p: V3 = [CAL[0] + 0.25 * Math.sin(u * 5), CAL[1] - 0.1 - 0.35 * u, CAL[2] + 0.1 + 1.05 * u];
  return <Label p={p} text={["DAY", "30"]} w={1.15} h={0.88} r={[-0.4 * Math.sin(u * 6), 0.5 * Math.sin(u * 4), 0.3 * Math.sin(u * 7)]} bg="#fffaf0" fg="#16121c" />;
};

// ------------------------------------------------------------------ counter
const RED = "#ff6a5f", GREEN = "#5ff08a", GOLD = "#ffd23a";
const counter = (t: number, shot: FinShot, tau: number): CounterState => {
  const id = shot.id;
  const d = id === "S21" ? 1 : dayAt(t);
  const day = Math.floor(d + 1e-6);
  const v = value(day);
  const col = day >= 30 ? GOLD : v >= 1e6 ? GREEN : RED;
  const lines = [{ text: `DAY ${day} · ${usd(day >= 30 ? value(30) : v)}`, color: col }];
  if (id === "S09") lines.push({ text: "STILL LOSING", color: RED, size: 46 } as { text: string; color: string; size: number });
  if (id === "S19") lines.push({ text: `DAY 30 ALONE: +${usd(value(30) / 2)}`, color: GOLD, size: 44 } as { text: string; color: string; size: number });
  if (id === "S01" || id === "S21") lines.push({ text: "vs  $1,000,000 TODAY", color: "#ffffff", size: 42 } as { text: string; color: string; size: number });
  const popAt = id === "S17" ? clamp(tau / 0.35) : id === "S14" ? clamp((tau - 0.45) / 0.35) : 0;
  return { lines, pop: popAt, accent: col === RED ? "#ff8a7a" : col === GREEN ? "#7dffb0" : "#ffe27a" };
};

export const PENNY_SPEC: FinSpec = {
  slug: "penny-doubles",
  shots: PENNY_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "THOUGHT EXPERIMENT",
  bg: "#2a1f5a",
};
export const _unused = { t0, Bill };

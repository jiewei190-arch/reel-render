// surprise-bill: "A surprise bill can last two years." A sunny blocky street. Spender's car breaks ($1,000 due now);
// Saver pays from his EMERGENCY FUND jar (done); Spender puts it on a card at 22 % and pays $50 a month at Lender's booth
// (26 months, about $257 interest, the stated example); the Fed's 2025 survey: 63 % would cover a $400 surprise with cash
// or its equivalent. Times from src/shorts/surprise_bill.plan.gen.ts; lenses fitted (f2kit).
import React from "react";
import { Jar } from "../library/props";
import { LENDER, SAVER, SPENDER } from "../library/characters";
import { clamp, hash, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/surprise_bill.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, CoinPile, CoinStack, FlipCalendar, Ground, Label, PAL, Pedestal, TollBooth, ChartBoard } from "./props";
import { body, Car, fitted, manual, Sheet } from "./f2kit";
import SCRIPT from "./scripts/surprise_bill";

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { spender: 1.0, saver: 1.0, lender: 1.15 };
const CAR: V3 = [0.15, 0, -0.6];
const P_SP: V3 = [1.45, 0, 0.55];
const P_SV: V3 = [-2.1, 0, 0.75];
const JAR_P: V3 = [-2.85, 0, 0.25];
const CAR2: V3 = [-3.4, 0, -1.6];
const BOOTH: V3 = [3.7, 0, -1.3];
const P_LD: V3 = [3.0, 0, -0.35];
const PILE: V3 = [4.6, 0, -2.6];
const CAL: V3 = [-0.9, 2.05, -2.6];
const BOARD: V3 = [0.9, 0, -3.2];
const BLOCKS: V3 = [0.9, 0, -1.9];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);

// ------------------------------------------------------------------ the stated example
const card = (() => {
  let b = 1000, paid = 0, int = 0;
  const rows = [{ b, int }];
  while (b > 0.005 && rows.length < 60) {
    const it = Math.round(b * (0.22 / 12) * 100) / 100;
    const p = Math.min(50, b + it);
    b = b + it - p;
    paid += p;
    int += it;
    rows.push({ b: Math.max(0, b), int });
  }
  return rows; // 27 rows: months 0..26, interest 257.13
})();
const MONTHS = card.length - 1;
/** the month the card route shows (0 until S09, races to 26 by the end of S11) */
const monthAt = (t: number) => (t < T.S09 ? 0 : Math.round(MONTHS * ss(T.S10, T.S11 + 0.6, t)));

// ------------------------------------------------------------------ lenses
const sp = (bust = false) => body(P_SP, S.spender, bust);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: fitted([...sp(), [CAR[0] - 0.9, 0, CAR[2]], [CAR[0] + 0.9, 1.4, CAR[2]], [P_SP[0], 2.3, P_SP[2]]], 18, 0.18, D.S01, { mood: "earth", sky: true, fov: 54 }),
  S02: manual([CAL[0], CAL[1] - 0.15, CAL[2]], 12, 2.0, 0.05, { mood: "earth", sky: true }),
  S03: fitted([...sp(), [CAR[0] + 0.6, 1.8, CAR[2] + 0.8]], 28, 0.12, D.S03, { mood: "earth", sky: true }),
  S04: manual([P_SP[0] - 0.25, 1.45, P_SP[2] + 0.45], 14, 1.05, 0.0, { mood: "earth", sky: true }),
  S05: fitted([...body(P_SV, S.saver), [JAR_P[0] - 0.35, 1.4, JAR_P[2]], [JAR_P[0] - 0.35, 0, JAR_P[2]], [CAL[0], CAL[1] + 0.55, CAL[2]]], -14, 0.14, D.S05, { mood: "earth", sky: true }),
  S06: manual([JAR_P[0], 1.05, JAR_P[2]], -8, 1.4, 0.2, { mood: "earth", sky: true }),
  S07: fitted([...body(P_SV, S.saver), [CAR2[0] - 0.9, 0, CAR2[2]], [CAR2[0] + 0.8, 1.3, CAR2[2]]], -22, 0.14, D.S07, { mood: "earth", sky: true }),
  S08: fitted(sp(true), 22, 0.05, D.S08, { mood: "earth", sky: true, face: 0.5 }),
  S09: fitted([...body(P_LD, S.lender), ...body([BOOTH[0] + 1.35, 0, BOOTH[2] + 0.95], S.spender), [BOOTH[0], 2.1, BOOTH[2]]], -8, 0.12, D.S09, { mood: "earth", sky: true }),
  S10: manual([CAL[0], CAL[1] - 0.15, CAL[2]], -10, 1.9, 0.05, { mood: "earth", sky: true }),
  S11: fitted([[BOOTH[0] - 0.6, 0, BOOTH[2]], [PILE[0] + 1.0, 0, PILE[2]], [PILE[0], 2.2, PILE[2]], [BOOTH[0], 2.1, BOOTH[2]]], -12, 0.18, D.S11, { mood: "earth", sky: true }),
  S12: fitted(sp(true), 30, 0.08, D.S12, { mood: "whisper", sky: true, face: 0.5 }),
  S13: fitted([[BOARD[0] - 1.0, 0.9, BOARD[2]], [BOARD[0] + 1.0, 2.25, BOARD[2]]], 4, 0.05, D.S13, { mood: "store", sky: true }),
  S14: fitted([[BLOCKS[0] - 1.2, 0, BLOCKS[2]], [BLOCKS[0] + 0.1, 1.1, BLOCKS[2]], [BLOCKS[0] - 1.4, 0, BLOCKS[2] + 0.9]], 6, 0.2, D.S14, { mood: "store", sky: true }), // PC fix: the manual lens rendered an empty frame
  S15: fitted([[BLOCKS[0] - 1.6, 0, BLOCKS[2]], [BLOCKS[0] + 1.6, 0.9, BLOCKS[2]]], 0, 0.25, D.S15, { mood: "store", sky: true }),
  S16: fitted([...sp(true), [P_SP[0] - 0.95, 1.95, P_SP[2] + 0.3], [P_SP[0] - 0.95, 1.45, P_SP[2] + 0.3], [BOARD[0] + 1.0, 2.0, BOARD[2]]], 24, 0.05, D.S16, { mood: "store", sky: true, face: 0.5 }),
  S17: fitted([...body(P_SV, S.saver, true), [JAR_P[0], 0.8, JAR_P[2]]], -16, 0.08, D.S17, { mood: "ending", sky: true }),
  S18: fitted([...body([-0.6, 0, 0.9], S.saver), ...body([0.35, 0, 0.9], S.spender)], 4, 0.12, D.S18, { mood: "ending", sky: true }),
  S19: fitted([...sp(), [CAR[0] - 0.9, 0, CAR[2]], [CAR[0] + 0.9, 1.4, CAR[2]], [P_SP[0], 2.3, P_SP[2]]], 18, 0.18, D.S19, { mood: "earth", sky: true, fov: 54 }),
};
export const SURPRISE_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const loop = i === 1 || i === 19;
  const smoke = i <= 4 || i === 19 ? 1 : 0;
  const month = monthAt(t);
  const actors: React.ReactNode[] = [];
  // Spender
  {
    let p = P_SP;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, CAR) * 0.2 + yawTo(p, [2.6, 0, 5]) * 0.8, S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop || i === 3) { pose = { ...pose, armL: 0.6, armR: 0.6, outL: 0.5, outR: 0.5, ant: 1 }; emo = "shock"; }
    if (i === 4) { pose = { ...pose, armR: 1.25, outR: 0.05 }; held = { side: "R", node: <group position={[0, 0.2, 0.05]}><Sheet lines={["REPAIR", "$1,000", "DUE NOW"]} accent={PAL.debt} /></group> }; emo = "shock"; }
    if (i === 8) { pose = { ...pose, armR: 2.2 * ss(0, 0.8, tau) + 0.2, outR: 0.15 }; held = { side: "R", node: <Label p={[0, 0.12, 0.05]} text={["CARD"]} w={0.3} h={0.19} bg={PAL.debt} fg="#fff4c8" /> }; emo = "sly"; }
    if (i === 9 || i === 10 || i === 11) {
      p = [BOOTH[0] + 1.35, 0, BOOTH[2] + 0.95];
      pose = { ...stand(p[0], p[2], yawTo(p, [BOOTH[0] + 0.75, 0, BOOTH[2] + 0.35]) * 0.5 + yawTo(p, [2.0, 0, 5]) * 0.5, S.spender), armL: 1.1, outL: 0.05 };
      emo = "happy";
    }
    if (i === 12) { pose = { ...pose, armL: 0.05, armR: 0.05, headPitch: 0.25, ant: -1 }; emo = "sad"; }
    if (i === 16) { pose = { ...pose, headYaw: 0.3, armL: 0.9, outL: 0.3 }; emo = "shock"; }
    if (i === 18) { p = [0.35, 0, 0.9]; pose = { ...stand(p[0], p[2], yawTo(p, [-0.6, 0, 0.9]) * 0.5 + yawTo(p, [0, 0, 4]) * 0.5, S.spender), armL: 1.0, armR: 1.0 }; emo = "joy"; held = { side: "R", node: <group scale={0.5}><Jar label={false}><CoinStack p={[0, 0.02, 0]} n={5} /></Jar></group> }; }
    if (!(i >= 13 && i <= 15)) actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
  }
  // Saver (his route: S05-S07, then S17-S18)
  if ((i >= 5 && i <= 7) || i === 17 || i === 18) {
    let p = P_SV;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, JAR_P) * 0.4 + yawTo(p, [-1.2, 0, 4]) * 0.6, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    if (i === 6) pose = { ...pose, armL: 1.3 - 0.3 * Math.sin(tau * 6), outL: 0.2 };
    if (i === 7) { pose = { ...pose, armL: 0.9, armR: 0.9, outL: 0.35 + 0.15 * Math.sin(tau * 10), outR: 0.35 }; emo = "joy"; }
    if (i === 17) { pose = { ...pose, armL: 1.35, outL: 0.25 }; emo = "happy"; }
    if (i === 18) { p = [-0.6, 0, 0.9]; pose = { ...stand(p[0], p[2], yawTo(p, [0.35, 0, 0.9]) * 0.5 + yawTo(p, [0, 0, 4]) * 0.5, S.saver), armR: 1.2, outR: -0.1 }; emo = "joy"; }
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} />);
  }
  // Lender at the booth
  if (i >= 9 && i <= 11) {
    const pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, [2.2, 0, 3]), S.lender), armL: i === 11 ? 1.2 : 0.3, outL: 0.2 };
    actors.push(<Act key="ld" look={LENDER} pose={pose} emotion={i === 11 ? "sly" : "happy"} s={S.lender} t={t} seed={5} />);
  }
  // the money: the jar level (S06: scooped), the card coin (S09), the interest pile (grows with the months)
  const jarFill = i === 6 ? 1 - 0.55 * ss(0.2, 1.0, tau) : i === 7 || i >= 17 ? 0.45 : 1;
  const pile = month > 0 && i <= 12 ? 0.25 + 1.4 * (month / MONTHS) : 0;
  const coinIn = i === 9 ? ss(0.3, 0.9, tau) : 0;
  const bar = i === 14 ? 0.63 * ss(0.1, 0.9, tau) : 0.63;
  const lit = i === 15 ? Math.min(6.3, 7 * ss(0.1, 1.0, tau)) : 6.3;
  const calVal = i <= 2 || i === 19 ? "26" : String(Math.max(1, month));
  return (
    <>
      <Ground road roadW={3.2} />
      {/* the broken car and the bill over Spender */}
      {i === 14 ? null : <Car p={CAR} yaw={0.55} color={PAL.debt} smoke={smoke} t={t} />}{/* PC fix: the car overlaps the survey blocks, so it is hidden in S14 (the close-up on the 63 % bar) */}
      {loop || i === 3 ? <Label p={[P_SP[0], 2.15 + 0.06 * Math.sin(t * 3), P_SP[2]]} r={[0, -0.25, 0]} text={["$1,000", "SURPRISE BILL"]} w={0.9} h={0.42} bg={PAL.debt} fg="#fff4c8" glow={0.4} /> : null}
      <Label p={[0.9, 0.3, 0.9]} r={[-0.5, 0.1, 0]} text={["EXAMPLE: $1,000 · 22% APR · $50/MO"]} w={1.1} h={0.15} />
      {/* Saver's emergency fund */}
      <Pedestal p={JAR_P} h={0.72} r={0.26} ring={PAL.cash} />
      <group position={[JAR_P[0], 0.72, JAR_P[2]]} scale={1.5}>
        <Jar label={false}>
          <mesh position={[0, (0.34 * jarFill) / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * jarFill), 28]} />
            <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#c88a10" emissiveIntensity={i === 17 ? 0.9 : 0.25} />
          </mesh>
        </Jar>
      </group>
      <Label p={[JAR_P[0], 0.42, JAR_P[2] + 0.27]} text={["EMERGENCY", "FUND"]} w={0.46} h={0.24} bg={PAL.cash} fg="#fff4c8" />
      {i === 6 ? <CoinStack p={[JAR_P[0] + 0.45, 0.72 + 0.15 * ss(0.2, 1.0, tau), JAR_P[2] + 0.1]} n={18} s={1.4} /> : null}
      <Car p={CAR2} yaw={-0.4} color="#2a7de1" />
      {/* the card booth, the interest pile */}
      <TollBooth p={BOOTH} yaw={-0.55} display={[month > 0 ? `MONTH ${month}` : "$50/MO"]} />
      {i === 9 ? <CoinStack p={[BOOTH[0] + 0.62 - 0.25 * (1 - coinIn), 1.25 + 0.3 * (1 - coinIn), BOOTH[2] + 0.7 - 0.3 * coinIn]} n={1} s={1.6} /> : null}
      {pile > 0 ? <CoinPile p={PILE} r={pile * 0.9} h={pile} coins={60} /> : null}
      {i === 11 || i === 12 ? <Label p={[PILE[0], pile + 0.45, PILE[2] + 0.5]} r={[0, -0.3, 0]} text={[`${usd(card[Math.min(MONTHS, month)].int, false)} INTEREST`]} w={0.9} h={0.22} bg="#ffe0dc" fg={PAL.debt} /> : null}
      {/* the calendar on a post */}
      <mesh position={[CAL[0], 0.7, CAL[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <FlipCalendar p={CAL} title="MONTHS" value={calVal} prev={i === 10 && month > 1 ? String(month - 1) : undefined} flip={i === 10 ? (t * 8) % 1 : 1} sub="ON THE CARD" />
      {/* the Fed survey: a board, a 63 % bar, ten blocks */}
      {i >= 13 && i <= 16 ? (
        <>
          <ChartBoard p={BOARD} title="FED SURVEY 2025: A $400 SURPRISE" values={[]} w={2.0} h={1.3} />
          <Label p={[BOARD[0], 1.55, BOARD[2] + 0.06]} text={["63% WOULD USE", "CASH OR ITS EQUIVALENT"]} w={1.7} h={0.5} bg="#16301e" fg="#7ee8a0" />
          <BigBlock p={[BLOCKS[0] - 0.9, 0, BLOCKS[2]]} size={[0.5, 1.0, 0.3]} color="#c8c8d4" text="100%" fg="#16121c" />
          <BigBlock p={[BLOCKS[0] - 0.3, 0, BLOCKS[2]]} size={[0.5, Math.max(0.02, bar * 1.0), 0.3]} color={PAL.cash} text="63%" glow={0.4} />
          {Array.from({ length: 10 }, (_, k) => (
            <mesh key={k} position={[BLOCKS[0] - 1.35 + k * 0.3, 0.14, BLOCKS[2] + 0.8]} castShadow>
              <boxGeometry args={[0.24, 0.28, 0.24]} />
              <meshStandardMaterial color={k < Math.floor(lit) || (k === Math.floor(lit) && lit % 1 > 0.25) ? PAL.cash : "#9a9aa8"} emissive={k < lit ? "#1f9e4f" : "#000000"} emissiveIntensity={0.3} />
            </mesh>
          ))}
          {i === 16 ? <Label p={[P_SP[0] - 0.6, 1.7, P_SP[2] + 0.3]} r={[0, 0.2, 0]} text={["$400", "SURPRISE"]} w={0.6} h={0.36} bg={PAL.debt} fg="#fff4c8" /> : null}
        </>
      ) : null}
      {actors}
      {Array.from({ length: 0 }, (_, k) => hash(k))}
    </>
  );
};

// ------------------------------------------------------------------ counter
const RED = "#ff6a5f", GREEN = "#5ff08a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  if (i >= 5 && i <= 7) return { lines: [{ text: "EMERGENCY FUND", color: GREEN }, { text: "PAID $1,000 · INTEREST $0", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  if (i >= 13 && i <= 16) return { lines: [{ text: "63%", color: GREEN }, { text: "WOULD COVER $400 WITH CASH", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
  if (i === 17 || i === 18) return { lines: [{ text: "A SMALL CUSHION", color: GREEN }, { text: "VS 26 MONTHS ON A CARD", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
  const m = i <= 4 || i === 19 ? 0 : monthAt(t);
  const r = card[Math.min(MONTHS, m)];
  return { lines: [{ text: i <= 4 || i === 19 ? "$1,000 BILL" : `MONTH ${m} · ${usd(r.b, false)}`, color: RED }, { text: `CARD 22% · INTEREST ${usd(r.int, false)}`, color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
};

export const SURPRISE_SPEC: FinSpec = {
  slug: "surprise-bill",
  shots: SURPRISE_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: (t, s) => (idx(s.id) >= 13 && idx(s.id) <= 16 ? "FED SHED 2025" : "EXAMPLE"),
  bg: "#6aa6f2",
};
void clamp;

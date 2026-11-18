// interest-only: "Five years of payments. Still owe everything." A bright hall with a payment booth (Lender) and two
// lanes: Spender pays interest only on $20,000 at a made-up 8 % ($133.33/mo: $8,000 in 5 years, still owes $20,000);
// Saver pays the full $405.53/mo (owes $0 after 5 years, $4,331.67 interest). Times from src/shorts/interest_only.plan.gen.ts.
import React from "react";
import { NeonSign } from "../library/props";
import { LENDER, SAVER, SPENDER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/interest_only.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, CashCase, CoinPile, CoinStack, FlipCalendar, Hall, Label, PAL, Pedestal, TollBooth } from "./props";
import { body, fitted, manual } from "./f2kit";
import SCRIPT from "./scripts/interest_only";

// ------------------------------------------------------------------ the stated example
const P = 20000, R = 0.08 / 12, N = 60;
const IO = P * R; // 133.33
const FULL = (P * R) / (1 - (1 + R) ** -N); // 405.53
const owedFull = (m: number) => (m >= N ? 0 : P * (1 + R) ** m - (FULL * ((1 + R) ** m - 1)) / R);

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { spender: 1.0, saver: 1.0, lender: 1.1 };
const BOOTH: V3 = [0.2, 0, -2.3];
const SLOT: V3 = [BOOTH[0] + 0.75, 1.05, BOOTH[2] + 0.35];
const P_LD: V3 = [-0.75, 0, -1.55];
const P_PAY: V3 = [0.95, 0, -1.1];
const BLK_SP: V3 = [-2.45, 0, -1.7];
const P_SP: V3 = [-1.3, 0, 0.15];
const PILE_SP: V3 = [-3.55, 0, -0.35];
const BLK_SV: V3 = [2.55, 0, -1.7];
const P_SV: V3 = [1.55, 0, 0.2];
const CAL: V3 = [0.2, 2.85, -3.44];
const RATE: V3 = [-0.35, 0, -0.55];
const PILE_A: V3 = [-1.0, 0, -0.5];
const PILE_B: V3 = [1.0, 0, -0.5];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);

/** months elapsed on the calendar: 60 at the hook/loop, races 0 -> 60 in S07 (Spender) and S13-S14 (Saver) */
const monthsAt = (t: number, i: number) => {
  if (i === 1 || i === 2 || i === 18 || i === 17 || i === 19) return 60;
  if (i <= 6) return 0;
  if (i === 7) return Math.round(60 * ss(T.S07, T.S08 - 0.1, t));
  if (i >= 8 && i <= 10) return 60;
  if (i === 11 || i === 12) return 0;
  if (i === 13 || i === 14) return Math.round(60 * ss(T.S13, T.S15 - 0.15, t));
  return 60;
};

// ------------------------------------------------------------------ lenses
const sp = (bust = false) => body(P_SP, S.spender, bust);
const sv = (bust = false) => body(P_SV, S.saver, bust);
const blkSp: V3[] = [[BLK_SP[0] - 0.75, 0, BLK_SP[2]], [BLK_SP[0] + 0.75, 2.1, BLK_SP[2]]];
const blkSv: V3[] = [[BLK_SV[0] - 0.75, 0, BLK_SV[2]], [BLK_SV[0] + 0.75, 2.1, BLK_SV[2]]];
const hook = fitted([...sp(), ...blkSp, [PILE_SP[0] - 0.4, 0, PILE_SP[2]], [CAL[0] - 0.2, CAL[1] + 0.5, CAL[2]]], -14, 0.1, D.S01, { mood: "store", fov: 54, face: 0.55, m: 0.1 });
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: hook,
  S02: manual([BLK_SP[0], 1.45, BLK_SP[2] + 0.4], -8, 2.2, 0.05, { mood: "store" }),
  S03: fitted([...sp(), ...body(P_LD, S.lender)], 10, 0.08, D.S03, { mood: "store" }),
  S04: manual([RATE[0], 1.25, RATE[2]], 12, 1.35, 0.05, { mood: "store" }),
  S05: fitted([...body(P_PAY, S.spender), [SLOT[0] + 0.25, 1.3, SLOT[2]], [BOOTH[0] - 0.5, 2.1, BOOTH[2]]], 18, 0.08, D.S05, { mood: "store" }),
  S06: manual([SLOT[0], SLOT[1], SLOT[2] + 0.1], 14, 1.0, 0.05, { mood: "store" }),
  S07: manual([CAL[0], CAL[1] - 0.1, CAL[2]], 6, 2.0, -0.05, { mood: "store" }),
  S08: fitted([...sp(), [PILE_SP[0] - 0.6, 0, PILE_SP[2]], [PILE_SP[0] + 0.6, 1.4, PILE_SP[2]]], -28, 0.12, D.S08, { mood: "store" }),
  S09: fitted([...sp(true), [BLK_SP[0] + 0.5, 2.1, BLK_SP[2]]], 22, 0.0, D.S09, { mood: "store", face: 0.5 }),
  S10: manual([BLK_SP[0], 1.3, BLK_SP[2] + 0.4], 12, 2.3, 0.0, { mood: "store" }),
  S11: fitted([...sv(), ...blkSv], 18, 0.1, D.S11, { mood: "ending" }),
  S12: manual([SLOT[0], SLOT[1], SLOT[2] + 0.1], -12, 1.0, 0.05, { mood: "ending" }),
  S13: fitted([...body(P_PAY, S.saver), [SLOT[0] + 0.25, 1.3, SLOT[2]], ...blkSv], 30, 0.1, D.S13, { mood: "ending" }),
  S14: fitted([...blkSv, [CAL[0] + 0.7, CAL[1] + 0.5, CAL[2]]], 12, 0.1, D.S14, { mood: "ending" }),
  S15: fitted([...sv(), [BLK_SV[0] - 0.75, 0, BLK_SV[2]], [BLK_SV[0] + 0.75, 1.0, BLK_SV[2]]], 16, 0.08, D.S15, { mood: "ending" }),
  S16: fitted([[PILE_A[0] - 0.8, 0, PILE_A[2]], [PILE_B[0] + 0.8, 0, PILE_B[2]], [PILE_A[0], 1.9, PILE_A[2]], [PILE_B[0], 1.5, PILE_B[2]]], 0, 0.22, D.S16, { mood: "whisper" }),
  S19: manual([PILE_B[0], 0.75, PILE_B[2] + 0.2], -8, 1.9, 0.12, { mood: "whisper" }),
  S17: fitted(sp(true), 18, 0.03, D.S17, { mood: "store", face: 0.5 }),
  S18: hook,
};
export const IO_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  const loop = i === 1 || i === 2 || i === 18;
  const m = monthsAt(t, i);
  const actors: React.ReactNode[] = [];
  // Spender (his lane: S01-S10, S16-S18)
  if (i <= 10 || i === 17 || i === 18) {
    let p = P_SP;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, BLK_SP) * 0.35 + yawTo(p, [0.5, 0, 5]) * 0.65, S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop) { pose = { ...pose, armL: 0.5, armR: 0.5, outL: 0.6, outR: 0.6, ant: -1 }; emo = "sad"; }
    if (i === 3) { pose = { ...pose, armR: 1.1, outR: 0.05 }; emo = "happy"; held = { side: "R", node: <group scale={0.7}><CashCase label="$20,000" glow={0.6} /></group> }; }
    if (i === 4) emo = "happy";
    if (i === 5 || i === 6) {
      p = P_PAY;
      pose = { ...stand(p[0], p[2], yawTo(p, SLOT) * 0.6 + yawTo(p, [0, 0, 5]) * 0.4, S.spender), armR: 1.25, outR: 0.0 };
      held = { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={2} s={1.2} /> };
      emo = "happy";
    }
    if (i === 8) { pose = { ...pose, headYaw: -0.5 }; emo = "happy"; }
    if (i === 9 || i === 10) { pose = { ...pose, headPitch: -0.3, armL: 0.6, armR: 0.6, outL: 0.5, outR: 0.5, ant: 1 }; emo = "shock"; }
    if (i === 17) { pose = { ...pose, armR: 1.5, outR: 0.1 }; held = { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={1} s={1.8} /> }; emo = "curious"; }
    actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
  }
  // Saver (his lane: S11-S16)
  if (i >= 11 && i <= 16) {
    let p = P_SV;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, BLK_SV) * 0.35 + yawTo(p, [-0.5, 0, 5]) * 0.65, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 13) {
      p = P_PAY;
      pose = { ...stand(p[0], p[2], yawTo(p, SLOT) * 0.6 + yawTo(p, [0, 0, 5]) * 0.4, S.saver), armR: 1.25 };
      held = { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={6} s={1.2} /> };
    }
    if (i === 15) { pose = { ...pose, armL: 2.4, armR: 2.4, outL: 0.4, outR: 0.4 }; emo = "joy"; }
    if (i !== 16) actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} held={held} />);
  }
  // Lender at the booth
  if (i <= 15) {
    let pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, [0, 0, 5]), S.lender), armL: 0.2, armR: 0.2 };
    if (i === 3) pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, P_SP) * 0.6 + yawTo(P_LD, [0, 0, 5]) * 0.4, S.lender), armL: 1.2, outL: 0.0 };
    actors.push(<Act key="ld" look={LENDER} pose={pose} emotion="sly" s={S.lender} t={t} seed={5} />);
  }
  // money: what each has paid, what each still owes
  const spPaid = i === 1 || i === 2 || i === 17 || i === 18 ? 8000 : i <= 6 ? 0 : i === 7 ? IO * m : 8000;
  const svOwe = i <= 12 ? P : i <= 14 ? owedFull(m) : 0;
  const svH = 2.0 * (svOwe / P);
  const pileR = (v: number) => 0.25 + 0.9 * Math.sqrt(v / 8000);
  const coinIn = i === 5 || i === 13 ? ss(0.25, 0.85, tau) : 0;
  const pulse = i === 10 ? 0.5 + 0.5 * Math.sin(tau * 12) : 0;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#e8a05f" stripe="#2a4fb0">
        <NeonSign p={[-2.6, 3.1, -3.42]} text="LOANS" w={1.3} h={0.42} color="#ffd23a" />
      </Hall>
      <TollBooth p={BOOTH} display={i >= 11 && i <= 15 ? ["$406/MO", "FULL"] : ["$133/MO", "INTEREST"]} displayColor={i >= 11 && i <= 15 ? "#5ff08a" : "#ff5a4f"} />
      {coinIn > 0 ? <CoinStack p={[SLOT[0] - 0.2 * (1 - coinIn), SLOT[1] + 0.25 * (1 - coinIn), SLOT[2] + 0.25 * (1 - coinIn)]} n={i === 13 ? 4 : 1} s={1.4} /> : null}
      <FlipCalendar p={CAL} title="YEAR" value={String(Math.max(1, Math.ceil(m / 12)))} prev={(i === 7 || i === 13 || i === 14) && m > 12 ? String(Math.ceil(m / 12) - 1) : undefined} flip={i === 7 || i === 13 || i === 14 ? (t * 5) % 1 : 1} sub={m >= 60 ? "AFTER 5 YEARS" : "PAYING"} />
      {/* Spender's lane: the debt block that never shrinks, the pile he paid */}
      <BigBlock p={BLK_SP} size={[1.4, 2.0, 1.0]} color={PAL.debt} text="" glow={0.2 + 0.5 * pulse} />
      <Label p={[BLK_SP[0], 1.45, BLK_SP[2] + 0.52]} text={[i === 2 || i === 10 ? "STILL OWE" : "OWE", "$20,000"]} w={1.25} h={0.5} bg="#fff4c8" fg={PAL.debt} glow={pulse * 0.5} />
      {spPaid > 0 && i !== 16 && i !== 19 ? <CoinPile p={PILE_SP} r={pileR(spPaid)} h={pileR(spPaid) * 0.9} coins={70} /> : null}
      {spPaid > 0 && i !== 16 && i !== 19 ? <Label p={[PILE_SP[0], pileR(spPaid) + 0.35, PILE_SP[2] + 0.45]} r={[0, 0.35, 0]} text={[`PAID ${usd(Math.round(spPaid), false)}`]} w={0.95} h={0.22} bg="#fff4c8" fg={PAL.ink} /> : null}
      {/* Saver's lane: his block shrinks to zero */}
      {svH > 0.02 ? <BigBlock p={BLK_SV} size={[1.4, Math.max(0.05, svH), 1.0]} color={PAL.debt} text="" /> : null}
      <Label p={[BLK_SV[0], Math.max(0.35, svH) + (svH > 1 ? -0.55 : 0.3), BLK_SV[2] + 0.52]} text={[svOwe <= 0.5 ? "OWE $0" : `OWE ${usd(Math.round(svOwe / 10) * 10, false)}`]} w={1.25} h={0.28} bg="#fff4c8" fg={svOwe <= 0.5 ? PAL.cash : PAL.debt} glow={svOwe <= 0.5 ? 0.6 : 0} />
      {/* the rate card */}
      <Pedestal p={RATE} h={0.9} r={0.28} ring="#ffd23a" />
      <Label p={[RATE[0], 1.22, RATE[2]]} r={[0, 0.2, 0]} text={["8% APR", "MADE-UP EXAMPLE"]} w={0.7} h={0.36} bg={PAL.night} fg="#ffd23a" />
      {/* the end: two interest piles side by side */}
      {i === 16 || i === 19 ? (
        <>
          <CoinPile p={PILE_A} r={pileR(8000)} h={pileR(8000) * 0.9} coins={80} />
          <Label p={[PILE_A[0], pileR(8000) + 0.45, PILE_A[2] + 0.5]} text={["INTEREST-ONLY", "$8,000 + STILL OWE"]} w={1.2} h={0.4} bg={PAL.debt} fg="#fff4c8" />
          <CoinPile p={PILE_B} r={pileR(4332)} h={pileR(4332) * 0.9} coins={50} seed={7} />
          <Label p={[PILE_B[0], pileR(4332) + 0.45, PILE_B[2] + 0.5]} text={["FULL PAYMENT", "$4,332 · OWE $0"]} w={1.2} h={0.4} bg={PAL.cash} fg="#fff4c8" />
        </>
      ) : null}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const RED = "#ff6a5f", GREEN = "#5ff08a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  const m = monthsAt(t, i);
  if (i === 16 || i === 19) return { lines: [{ text: "INTEREST $8,000 VS $4,332", color: "#ffffff" }, { text: "AND ONE STILL OWES $20,000", color: RED, size: 40 }], accent: "#ffd23a" };
  if (i >= 11 && i <= 15) {
    const owe = i <= 12 ? P : i <= 14 ? owedFull(m) : 0;
    return { lines: [{ text: `FULL $406/MO · OWE ${usd(Math.round(owe / 10) * 10, false)}`, color: GREEN }, { text: m > 0 ? `YEAR ${Math.max(1, Math.ceil(m / 12))} OF 5` : "SAME $20,000 · 8%", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
  }
  const paid = i === 1 || i === 2 || i === 17 || i === 18 ? 8000 : i <= 6 ? 0 : i === 7 ? IO * m : 8000;
  if (i === 3 || i === 4) return { lines: [{ text: "BORROW $20,000", color: RED }, { text: "8% · MADE-UP EXAMPLE", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
  return { lines: [{ text: `INTEREST-ONLY $133/MO`, color: RED }, { text: `PAID ${usd(Math.round(paid), false)} · OWE $20,000`, color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
};

export const IO_SPEC: FinSpec = {
  slug: "interest-only",
  shots: IO_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "EXAMPLE: $20,000 · 8% · 5 YRS",
  bg: "#2a1f5a",
};

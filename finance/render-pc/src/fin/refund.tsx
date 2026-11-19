// tax-refund-loan: "Your tax refund is a free loan." A tax-office hall: Teller slides the REFUND $3,366 case to Saver
// (the IRS average refund, 2026 season to Oct. 16); his payslip feeds a WITHHELD jar all year (≈$280 a month, 0 %
// interest); twist: not a bonus, his own pay sent back late; his W-4 sets the withholding and the IRS estimator (free)
// checks it. Times from src/shorts/tax_refund_loan.plan.gen.ts.
import React from "react";
import { Jar, NeonSign, Counter as Desk } from "../library/props";
import { SAVER, SPENDER, TELLER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/tax_refund_loan.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, BigClock, CashCase, ChartBoard, CoinStack, FlipCalendar, Hall, Label, PAL, Stamp } from "./props";
import { body, fitted, manual, Sheet } from "./f2kit";
import SCRIPT from "./scripts/tax_refund_loan";

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { saver: 1.0, spender: 1.0, teller: 0.9 };
const DESK: V3 = [0.35, 0, -1.0]; // library counter: 2.0 wide, top 0.98
const TOP = 0.98;
const P_TL: V3 = [0.6, 0, -1.65];
const TL_LIFT = 0.22;
const P_SV: V3 = [-0.55, 0, 0.1];
const CASE: V3 = [-0.15, TOP, -0.85];
const JAR: V3 = [1.05, TOP, -0.9];
const BOARD: V3 = [-2.4, 0, -3.1];
const BLOCK: V3 = [-2.4, 0, -1.6];
const CAL: V3 = [2.3, 2.35, -3.44];
const STACKS: V3 = [2.9, 0, -0.6];
const CLOCK: V3 = [-0.4, 2.55, -3.42];
const EST: V3 = [3.0, 0, -2.6];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
void T;

// ------------------------------------------------------------------ lenses
const sv = (bust = false) => body(P_SV, S.saver, bust);
const tl = (bust = false) => body(P_TL, S.teller, bust, TL_LIFT);
const hook = fitted([...sv(), ...tl(), [CASE[0], TOP + 0.95, CASE[2]], [DESK[0] + 1.0, 0.3, DESK[2] + 0.35]], 10, 0.1, D.S01, { mood: "store", fov: 52, face: 0.55, m: 0.1 });
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: hook,
  S02: manual([CASE[0], TOP + 0.3, CASE[2]], 8, 1.35, 0.15, { mood: "store" }),
  S03: fitted([[BOARD[0] - 1.05, 0.9, BOARD[2]], [BOARD[0] + 1.05, 2.35, BOARD[2]]], 10, 0.05, D.S03, { mood: "store" }),
  S04: fitted([[BLOCK[0] - 0.7, 0, BLOCK[2]], [BLOCK[0] + 0.7, 2.0, BLOCK[2]]], 14, -0.05, D.S04, { mood: "store" }),
  S05: fitted(sv(true), 20, 0.04, D.S05, { mood: "store", face: 0.5 }),
  S06: manual([JAR[0], TOP + 0.3, JAR[2]], -8, 1.4, 0.2, { mood: "store" }),
  S07: manual([CAL[0], CAL[1] - 0.1, CAL[2]], -8, 2.0, 0.0, { mood: "store" }),
  S08: fitted([[STACKS[0] - 1.0, 0, STACKS[2]], [STACKS[0] + 0.7, 0.6, STACKS[2] + 0.2]], -20, 0.35, D.S08, { mood: "store" }),
  S09: fitted([...tl(true), [JAR[0] + 0.25, TOP, JAR[2]]], -18, 0.05, D.S09, { mood: "store" }),
  S10: manual([JAR[0], TOP + 0.75, JAR[2] + 0.1], -14, 1.25, 0.05, { mood: "store" }),
  S11: fitted([...sv(true), [P_SV[0] - 0.75, 1.9, P_SV[2] + 0.2]], 22, 0.05, D.S11, { mood: "whisper" }),
  S12: manual([P_SV[0] + 0.32, 1.05, P_SV[2] + 0.3], 18, 1.15, 0.15, { mood: "whisper" }),
  S13: manual([CLOCK[0], CLOCK[1], CLOCK[2]], 6, 2.2, -0.05, { mood: "whisper" }),
  S14: fitted(sv(true), 18, 0.04, D.S14, { mood: "store", face: 0.5 }),
  S15: manual([P_SV[0] + 0.28, 1.3, P_SV[2] + 0.3], 12, 0.95, 0.05, { mood: "store" }),
  S16: fitted([[EST[0] - 1.05, 0.9, EST[2]], [EST[0] + 1.05, 2.35, EST[2]]], -12, 0.05, D.S16, { mood: "store" }),
  S17: fitted([...sv(), [P_SV[0] + 0.45, 1.75, P_SV[2] + 0.3]], 16, 0.08, D.S17, { mood: "store" }),
  S18: fitted([...sv(), ...body([0.55, 0, 0.35], S.spender)], 6, 0.1, D.S18, { mood: "ending" }),
  S19: hook,
};
export const REFUND_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  const loop = i === 1 || i === 19;
  const actors: React.ReactNode[] = [];
  // Saver
  {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, CASE) * 0.35 + yawTo(P_SV, [0.4, 0, 5]) * 0.65, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop || i === 2) { pose = { ...pose, armL: 1.3, armR: 1.3, outL: 0.2, outR: 0.2 }; emo = "joy"; }
    if (i === 5 || i === 6) { pose = { ...pose, armR: 1.35, outR: 0.05 }; held = { side: "R", node: <group position={[0, 0.18, 0.05]}><Sheet lines={["PAYSLIP", "PAY $", "WITHHELD $"]} accent={PAL.cash} /></group> }; }
    if (i === 11 || i === 12) { pose = { ...pose, armR: 1.2, armL: 1.2, outL: 0.05, outR: 0.05 }; emo = i === 11 ? "curious" : "sly"; held = { side: "R", node: <group position={[-0.12, -0.05, 0.12]} scale={0.75}><CashCase label="REFUND" glow={0.5} /></group> }; }
    if (i === 14 || i === 15) { pose = { ...pose, armR: 1.35, outR: 0.0 }; held = { side: "R", node: <group position={[0, 0.2, 0.05]}><Sheet lines={["FORM W-4", "WITHHOLDING", "▢ ▢ ▢"]} accent={PAL.ink} /></group> }; emo = "curious"; }
    if (i === 17) { pose = { ...pose, armR: 1.6 - 0.4 * Math.abs(Math.sin(tau * 6)), outR: 0.0 }; emo = "joy"; held = { side: "R", node: <group position={[0, 0.2, 0.05]}><Sheet lines={["FORM W-4", "CHECKED ✓"]} accent={PAL.cash} /></group> }; }
    if (i === 18) { pose = { ...pose, armL: 0.6, armR: 0.6, outL: 0.6, outR: 0.6 }; emo = "happy"; }
    const show = !(i === 3 || i === 4 || i === 7 || i === 8 || i === 10 || i === 13 || i === 16);
    if (show) actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} held={held} />);
  }
  // Teller behind the counter
  if (i <= 10 || i === 19) {
    let pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, P_SV) * 0.4 + yawTo(P_TL, [0, 0, 5]) * 0.6, S.teller), armL: 0.2, armR: 0.2 };
    if (loop) pose = { ...pose, armR: 1.2, outR: 0.0 };
    if (i === 9) pose = { ...pose, armL: 1.1, outL: -0.1 };
    pose = { ...pose, y: pose.y + TL_LIFT };
    actors.push(<Act key="tl" look={TELLER} pose={pose} emotion={i === 9 ? "sly" : "happy"} s={S.teller} t={t} seed={3} />);
  }
  if (i === 18) {
    const p: V3 = [0.55, 0, 0.35];
    actors.push(<Act key="sp" look={SPENDER} pose={{ ...stand(p[0], p[2], yawTo(p, P_SV) * 0.4 + yawTo(p, [0, 0, 5]) * 0.6, S.spender), armL: 0.3 }} emotion="happy" s={S.spender} t={t} seed={2} />);
  }
  const slide = loop ? ss(0.0, 0.6, tau) : 1;
  const caseOnDesk = i <= 4 || i === 19;
  const month = i === 7 ? Math.min(11, Math.floor(12 * ss(0.0, 0.95, tau))) : i < 7 ? 0 : 11;
  const fill = i < 6 ? 0.15 : i === 6 ? 0.15 + 0.6 * ss(0.1, 0.9, tau) : 0.85;
  const nStacks = i === 8 ? Math.min(12, Math.floor(1 + 12 * ss(0.0, 0.85, tau))) : 12;
  const rise = i === 4 ? ss(0.05, 0.8, tau) : 1;
  const strike = i === 11 ? ss(0.3, 0.8, tau) : i > 11 ? 1 : 0;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#7a8ae8" stripe="#ffd23a">
        <NeonSign p={[0.35, 2.95, -3.42]} text="TAX OFFICE" w={1.9} h={0.42} color="#ffd23a" />
      </Hall>
      <Desk p={DESK} />
      {/* the refund case slides across the counter to Saver */}
      {caseOnDesk ? <CashCase p={[CASE[0] + 0.5 * (1 - slide), CASE[1], CASE[2]]} label="REFUND $3,366" glow={0.8} s={1.5} /> : null}
      {loop ? <Label p={[CASE[0], TOP + 0.8, CASE[2] + 0.05]} r={[0, 0.1, 0]} text={["A LOAN?", "INTEREST $0"]} w={0.75} h={0.34} bg={PAL.debt} fg="#fff4c8" glow={0.3} /> : null}
      {i === 2 ? <Stamp p={[CASE[0], TOP + 0.24, CASE[2] + 0.16]} text="INTEREST $0" u={ss(0.05, 0.4, tau)} w={0.44} /> : null}
      {/* the WITHHELD jar on the counter */}
      <group position={JAR} scale={1.25}>
        <Jar label={false}>
          <mesh position={[0, (0.34 * fill) / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * fill), 28]} />
            <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#c88a10" emissiveIntensity={0.25} />
          </mesh>
        </Jar>
      </group>
      <Label p={[JAR[0], TOP + 0.62, JAR[2] + 0.05]} text={["WITHHELD"]} w={0.5} h={0.14} bg={PAL.night} fg="#ffd23a" />
      {i === 6 ? <CoinStack p={[JAR[0] - 0.05, TOP + 0.55 - 0.3 * ss(0.1, 0.9, (tau * 3) % 1), JAR[2]]} n={3} s={1.2} /> : null}
      {i === 9 || i === 10 ? <Label p={[JAR[0], TOP + 0.85, JAR[2] + 0.1]} text={["0% INTEREST"]} w={0.62} h={0.18} bg="#fff4c8" fg={PAL.debt} glow={i === 10 ? 0.4 : 0} /> : null}
      {/* the IRS board + the average block */}
      <ChartBoard p={BOARD} title="IRS · 2026 SEASON TO OCT 16" values={[]} w={2.0} h={1.3} />
      <Label p={[BOARD[0], 1.5, BOARD[2] + 0.05]} text={["AVERAGE REFUND", "$3,366"]} w={1.7} h={0.55} bg="#16301e" fg="#7ee8a0" />
      <BigBlock p={BLOCK} size={[1.2, Math.max(0.05, 1.8 * rise), 0.6]} color={PAL.cash} text={rise > 0.4 ? "$3,366" : ""} glow={0.3} />
      {/* the calendar of months, the twelve $280 stacks */}
      <FlipCalendar p={CAL} title="WITHHELD" value={MONTHS[month]} prev={i === 7 && month > 0 ? MONTHS[month - 1] : undefined} flip={i === 7 ? (t * 7) % 1 : 1} sub="EVERY PAYCHECK" />
      {Array.from({ length: nStacks }, (_, k) => (
        <CoinStack key={k} p={[STACKS[0] - 0.95 + (k % 6) * 0.3, 0, STACKS[2] + Math.floor(k / 6) * 0.32]} n={8} s={1.4} seed={k} />
      ))}
      <Label p={[STACKS[0] - 0.2, 0.55, STACKS[2] - 0.3]} text={["≈$280 A MONTH"]} w={0.9} h={0.2} bg="#fff4c8" fg={PAL.ink} />
      {/* twist props: the BONUS sign struck out, the open case of YOUR PAY, the clock */}
      {i === 11 ? <Label p={[P_SV[0] - 0.75, 1.75, P_SV[2] + 0.2]} r={[0, 0.3, 0]} text={["BONUS!"]} w={0.7} h={0.3} bg="#ffd23a" fg={PAL.ink} strike={strike} /> : null}
      {i === 12 ? <Label p={[P_SV[0] + 0.3, 1.38, P_SV[2] + 0.45]} r={[0, 0.25, 0]} text={["YOUR OWN PAY"]} w={0.62} h={0.16} bg={PAL.cash} fg="#fff4c8" glow={0.4} /> : null}
      <BigClock p={CLOCK} s={0.9} hour={i === 13 ? (t * 9) % 12 : 4} min={i === 13 ? (t * 108) % 60 : 15} />
      {i === 13 ? <Label p={[CLOCK[0], CLOCK[1] - 0.85, CLOCK[2] + 0.05]} text={["SENT BACK LATE"]} w={1.0} h={0.22} bg={PAL.night} fg="#ffd23a" /> : null}
      {/* the free estimator board */}
      <ChartBoard p={EST} title="IRS WITHHOLDING ESTIMATOR" values={[]} w={2.0} h={1.3} board="#1a2a4a" />
      <Label p={[EST[0], 1.5, EST[2] + 0.05]} text={["FREE", "CHECK YOUR W-4"]} w={1.6} h={0.55} bg="#1a2a4a" fg="#9fd8ff" />
      {i === 17 ? <Stamp p={[P_SV[0] + 0.45, 1.75, P_SV[2] + 0.35]} text="CHECKED" u={ss(0.1, 0.45, tau)} w={0.5} color={PAL.cash} /> : null}
      {i === 18 ? <Label p={[0.0, 2.1, 0.4]} text={["A FINE CHOICE TOO"]} w={1.1} h={0.22} bg="#fff4c8" fg={PAL.cash} /> : null}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const GREEN = "#5ff08a", RED = "#ff6a5f";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  void t;
  if (i >= 7 && i <= 10) return { lines: [{ text: "≈$280 / MONTH", color: GREEN }, { text: "HELD AT 0% INTEREST", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  if (i >= 11 && i <= 13) return { lines: [{ text: "NOT A BONUS", color: RED }, { text: "YOUR OWN PAY, SENT BACK LATE", color: "#ffffff", size: 38 }], accent: "#ff8a7a" };
  if (i >= 14 && i <= 18) return { lines: [{ text: "W-4 → WITHHOLDING", color: GREEN }, { text: "FREE IRS ESTIMATOR", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  return { lines: [{ text: "AVG REFUND $3,366", color: GREEN }, { text: i <= 2 || i === 19 ? "INTEREST PAID TO YOU: $0" : "IRS · 2026 SEASON", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
};

export const REFUND_SPEC: FinSpec = {
  slug: "tax-refund-loan",
  shots: REFUND_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "IRS 2026 SEASON",
  bg: "#2a1f5a",
};

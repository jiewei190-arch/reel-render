// overdraft-fee: "Swipe 24 dollars, pay 58." A bright bank hall. Spender swipes a plain card for a $24 sandwich and
// overdraws; Teller stamps FEE $34 (the medians in the CFPB's 2014 overdraft study); more than half pay it back within
// three days; seen as a loan (Lender), $24 for 3 days at $34 is an APR of about 17,000 % (the CFPB's own comparison);
// Saver at the switch: debit overdraft coverage is opt-in by law. Times from src/shorts/overdraft_fee.plan.gen.ts.
import React from "react";
import { NeonSign, Sandwich, Counter as Desk } from "../library/props";
import { LENDER, SAVER, SPENDER, TELLER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/overdraft_fee.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, ChartBoard, CoinStack, FlipCalendar, Hall, Label, PAL, Pedestal, Stamp } from "./props";
import { body, fitted, manual, Sheet } from "./f2kit";
import SCRIPT from "./scripts/overdraft_fee";

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { spender: 1.0, teller: 0.9, lender: 1.1, saver: 1.0 };
const TERM: V3 = [-1.15, 0, -0.35]; // the card terminal (a post + a screen)
const P_SP: V3 = [-0.45, 0, 0.35];
const DESK: V3 = [1.55, 0, -1.25]; // library counter: 2.0 wide, top 0.98
const TOP = 0.98;
const P_TL: V3 = [1.45, 0, -1.9];
const TL_LIFT = 0.22;
const SHEET: V3 = [1.2, TOP + 0.01, -1.05];
const BOARD: V3 = [-2.1, 0, -3.1];
const CAL: V3 = [0.6, 2.35, -3.44];
const BLOCKS: V3 = [-0.4, 0, -2.0];
const TOWER: V3 = [3.55, 0, -2.4];
const P_LD: V3 = [2.75, 0, 0.45];
const P_SP2: V3 = [1.75, 0, 0.6];
const SWITCH: V3 = [-3.3, 0, -1.0];
const P_SV: V3 = [-2.55, 0, -0.25];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
void T;

// ------------------------------------------------------------------ lenses
const sp = (bust = false) => body(P_SP, S.spender, bust);
const sp2 = (bust = false) => body(P_SP2, S.spender, bust);
const tl = (bust = false) => body(P_TL, S.teller, bust, TL_LIFT);
const RECEIPT: V3 = [TERM[0] + 0.05, 2.0, TERM[2] + 0.1];
const hook = fitted([...sp(), [TERM[0] - 0.2, 0, TERM[2]], [RECEIPT[0] - 0.55, RECEIPT[1] + 0.3, RECEIPT[2]], [RECEIPT[0] + 0.55, RECEIPT[1] - 0.3, RECEIPT[2]]], -24, 0.12, D.S01, { mood: "store", fov: 52, face: 0.55, m: 0.1 });
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: hook,
  S02: manual(RECEIPT, 10, 1.75, 0.05, { mood: "store" }),
  S03: fitted([[BOARD[0] - 1.05, 0.9, BOARD[2]], [BOARD[0] + 1.05, 2.35, BOARD[2]]], 8, 0.05, D.S03, { mood: "store" }),
  S04: fitted([...sp(true), [TERM[0], 1.55, TERM[2]], [TERM[0], 1.05, TERM[2]]], 26, 0.06, D.S04, { mood: "store", face: 0.5 }),
  S05: manual([P_SP[0] - 0.42, 1.12, P_SP[2] + 0.2], 18, 1.05, 0.08, { mood: "store" }),
  S06: fitted([...tl(), [DESK[0] - 1.0, 0.4, DESK[2] + 0.35], [DESK[0] + 1.0, TOP, DESK[2] + 0.35]], -12, 0.1, D.S06, { mood: "store" }),
  S07: manual([SHEET[0], SHEET[1] + 0.05, SHEET[2]], -6, 1.15, 0.85, { mood: "store" }),
  S08: fitted([...body([DESK[0] - 0.35, 0, DESK[2] + 0.85], S.spender), ...tl(true), [DESK[0] - 0.4, TOP, DESK[2]]], -24, 0.1, D.S08, { mood: "store" }),
  S09: fitted([[BLOCKS[0] - 1.5, 0, BLOCKS[2]], [BLOCKS[0] + 1.5, 0.9, BLOCKS[2]], [BLOCKS[0], 1.4, BLOCKS[2]]], 4, 0.3, D.S09, { mood: "store" }),
  S10: manual([CAL[0], CAL[1] - 0.1, CAL[2]], 8, 2.0, 0.0, { mood: "store" }),
  S11: fitted(body(P_LD, S.lender), -20, 0.06, D.S11, { mood: "whisper", face: 0.55 }),
  S12: fitted([...sp2(), ...body(P_LD, S.lender)], -6, 0.08, D.S12, { mood: "whisper" }),
  S13: manual([CAL[0], CAL[1] - 0.1, CAL[2]], -10, 2.0, 0.0, { mood: "whisper" }),
  S14: fitted([...sp2(true), ...body(P_LD, S.lender, true)], 8, 0.05, D.S14, { mood: "whisper" }),
  S15: fitted([[TOWER[0] - 0.6, 0, TOWER[2]], [TOWER[0] + 0.6, 3.6, TOWER[2]]], -18, -0.12, D.S15, { mood: "whisper", fov: 56 }),
  S16: fitted([...body([TOWER[0] - 1.1, 0, TOWER[2] + 1.0], S.spender), [TOWER[0], 3.2, TOWER[2] + 0.4], [TOWER[0] - 0.9, 3.2, TOWER[2] + 0.4], [TOWER[0] + 0.5, 2.5, TOWER[2]]], -14, 0.05, D.S16, { mood: "whisper" }),
  S17: fitted([...body(P_SV, S.saver), [SWITCH[0] - 0.6, 2.1, SWITCH[2]], [SWITCH[0] + 0.6, 0.3, SWITCH[2]]], 22, 0.1, D.S17, { mood: "ending" }),
  S18: manual([SWITCH[0], 1.35, SWITCH[2] + 0.1], 18, 1.7, 0.05, { mood: "ending" }),
  S19: hook,
};
export const OVERDRAFT_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  const loop = i === 1 || i === 19;
  const loan = i >= 11 && i <= 16;
  const actors: React.ReactNode[] = [];
  // Spender: at the terminal (S01-S05, S19), at the counter (S08), with Lender (S12-S14), under the tower (S16)
  {
    let p = P_SP;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, TERM) * 0.3 + yawTo(p, [-1.5, 0, 5]) * 0.7, S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined = { side: "L", node: <group position={[0, -0.02, 0.06]}><Sandwich /></group> };
    if (loop || i <= 5) {
      const swipe = loop ? ss(0.0, 0.5, tau) : 1;
      pose = { ...pose, armR: 1.0 + 0.25 * swipe, outR: 0.25 - 0.2 * swipe, armL: 0.9, outL: 0.1 };
      if (i === 1 || i === 19 || i === 4) emo = tau > 0.35 || i === 4 ? "shock" : "happy";
      if (i === 2) emo = "shock";
      if (i === 4) pose = { ...pose, ant: 1 };
    }
    if (i === 8) {
      p = [DESK[0] - 0.35, 0, DESK[2] + 0.85];
      pose = { ...stand(p[0], p[2], yawTo(p, P_TL) * 0.6 + yawTo(p, [0, 0, 5]) * 0.4, S.spender), armR: 1.35, outR: 0.05 };
      held = undefined;
      emo = "sad";
    }
    if (i >= 12 && i <= 14) {
      p = P_SP2;
      pose = { ...stand(p[0], p[2], yawTo(p, P_LD) * 0.55 + yawTo(p, [0, 0, 5]) * 0.45, S.spender), armR: i === 13 ? 0.2 : 1.2, outR: 0.05 };
      held = i === 12 ? { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={Math.round(3 + 3 * ss(0.2, 0.8, tau))} s={1.2} /> } : i === 14 ? { side: "R", node: <CoinStack p={[0, 0, 0.05]} n={9} s={1.2} /> } : undefined;
      emo = i === 14 ? "sad" : "curious";
    }
    if (i === 16) {
      p = [TOWER[0] - 1.1, 0, TOWER[2] + 1.0];
      pose = { ...stand(p[0], p[2], yawTo(p, [0.5, 0, 5]), S.spender), armL: 0.7, armR: 0.7, outL: 0.6, outR: 0.6, headPitch: -0.35, ant: 1 };
      held = undefined;
      emo = "shock";
    }
    const show = loop || i <= 5 || i === 8 || (i >= 12 && i <= 14) || i === 16;
    if (show) actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
  }
  // Teller behind the counter (stamp in S06-S07)
  if (!loan) {
    let pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, [0, 0, 4]), S.teller), armL: 0.2, armR: 0.2 };
    if (i === 6) pose = { ...pose, armR: 2.0 + 0.4 * Math.sin(tau * 5), outR: 0.1 };
    if (i === 7) pose = { ...pose, armR: 1.1, outR: 0.05 };
    pose = { ...pose, y: pose.y + TL_LIFT };
    actors.push(<Act key="tl" look={TELLER} pose={pose} emotion={i === 6 || i === 7 ? "sly" : "happy"} s={S.teller} t={t} seed={3} />);
  }
  // Lender (the loan view)
  if (i >= 11 && i <= 14) {
    let pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, P_SP2) * 0.4 + yawTo(P_LD, [0, 0, 5]) * 0.6, S.lender), armL: 0.2, armR: 0.2 };
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 11) { pose = { ...pose, armR: 2.3, outR: 0.1 }; held = { side: "R", node: <Label p={[0, 0.22, 0.05]} text={["LOAN?"]} w={0.5} h={0.22} bg={PAL.night} fg="#ffd23a" /> }; }
    if (i === 12) pose = { ...pose, armL: 1.25, outL: 0.0 };
    if (i === 14) pose = { ...pose, armL: 1.1, outL: 0.1 };
    actors.push(<Act key="ld" look={LENDER} pose={pose} emotion="sly" s={S.lender} t={t} seed={5} held={held} />);
  }
  // Saver at the opt-in switch
  if (i >= 17 && i <= 18) {
    const pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, SWITCH) * 0.45 + yawTo(P_SV, [0, 0, 5]) * 0.55, S.saver), armL: 1.2, outL: 0.25, armR: 0.2 };
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion="happy" s={S.saver} t={t} seed={4} />);
  }
  const receipt = loop ? ss(0.15, 0.55, tau) : i === 2 ? 1 : 0;
  const stampU = i === 7 ? ss(0.05, 0.35, tau) : i > 7 && i < 11 ? 1 : 0;
  const lit = i === 9 ? 5.4 * ss(0.05, 0.85, tau) : 5.4;
  const day = i === 10 ? 1 + Math.min(2, Math.floor(3 * ss(0.05, 0.85, tau))) : 3;
  const towerH = i === 15 ? 0.3 + 3.4 * ss(0.05, 0.9, tau) : i === 16 ? 3.7 : 0.3;
  const sw = i === 18 ? (Math.sin(tau * 9) > 0 ? 1 : 0) : 1;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#5fb8a8" stripe="#ffd23a">
        <NeonSign p={[1.55, 2.95, -3.42]} text="BANK" w={1.2} h={0.42} color="#ffd23a" />
      </Hall>
      <Desk p={DESK} />
      {/* the card terminal: a post, a tilted screen with the balance */}
      <BigBlock p={[TERM[0], 0, TERM[2]]} size={[0.16, 1.12, 0.16]} color="#3a3f58" text="" />
      <Label p={[TERM[0], 1.25, TERM[2] + 0.02]} r={[-0.25, 0.35, 0]} text={i >= 4 && i <= 5 ? ["BALANCE", "-$24"] : ["CARD", loop || i >= 4 ? "-$24" : "$24"]} w={0.42} h={0.3} bg="#0e0a18" fg={i >= 4 || loop ? "#ff5a4f" : "#7dffcf"} glow={1.0} />
      {/* the $24 tag on Spender's sandwich (S05 close-up) */}
      {i === 5 ? <Label p={[P_SP[0] - 0.42, 1.38, P_SP[2] + 0.25]} r={[0, 0.3, 0]} text={["$24", "MEDIAN"]} w={0.42} h={0.26} bg="#fff4c8" fg={PAL.ink} /> : null}
      {/* the receipt over the terminal (hook, S02, loop) */}
      {receipt > 0 ? (
        <group position={RECEIPT} scale={0.6 + 0.4 * receipt}>
          <Label p={[0, 0.12, 0]} r={[0, 0.25, 0]} text={["$24 + $34 FEE"]} w={1.05} h={0.26} bg="#fff4c8" fg={PAL.debt} />
          <Label p={[0, -0.2, 0.02]} r={[0, 0.25, 0]} text={["= $58"]} w={0.8} h={0.36} bg={PAL.debt} fg="#fff4c8" glow={0.4} />
        </group>
      ) : null}
      {/* the counter: a statement sheet + the FEE stamp; the paid-back stack */}
      <group position={SHEET} rotation={[-Math.PI / 2, 0, 0]}>
        <Sheet lines={["STATEMENT", "CARD -$24"]} w={0.42} h={0.5} accent={PAL.ink} />
        <Stamp p={[0, -0.08, 0.01]} text="FEE $34" u={stampU} w={0.38} r={[0, 0, 0.12]} />
      </group>
      {i === 6 ? <Stamp p={[P_TL[0] + 0.32, 2.0, P_TL[2] + 0.3]} text="FEE $34" u={1} w={0.42} r={[0, 0, 0.1]} /> : null}
      {i === 8 ? <CoinStack p={[DESK[0] - 0.4, TOP + 0.02, DESK[2] + 0.1]} n={Math.round(10 * ss(0.1, 0.8, tau))} s={1.3} /> : null}
      {/* the CFPB board */}
      <ChartBoard p={BOARD} title="CFPB STUDY · 2014 DATA" values={[]} w={2.0} h={1.3} />
      <Label p={[BOARD[0], 1.5, BOARD[2] + 0.05]} text={["DEBIT OVERDRAFTS", "MEDIAN $24 · FEE $34"]} w={1.75} h={0.55} bg="#16301e" fg="#7ee8a0" />
      {/* ten blocks: more than half back within three days */}
      {Array.from({ length: 10 }, (_, k) => (
        <mesh key={k} position={[BLOCKS[0] - 1.35 + k * 0.3, 0.16, BLOCKS[2]]} castShadow>
          <boxGeometry args={[0.24, 0.32, 0.24]} />
          <meshStandardMaterial color={k < lit ? PAL.cash : "#9a9aa8"} emissive={k < lit ? "#1f9e4f" : "#000000"} emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Label p={[BLOCKS[0], 0.75, BLOCKS[2]]} text={["BACK ABOVE $0", "WITHIN 3 DAYS: OVER HALF"]} w={1.5} h={0.34} bg="#fff4c8" fg={PAL.cash} />
      {/* the calendar on the wall */}
      <FlipCalendar p={CAL} title={loan ? "THE LOAN" : "DAY"} value={String(day)} prev={i === 10 && day > 1 ? String(day - 1) : undefined} flip={i === 10 ? (t * 6) % 1 : 1} sub={loan ? "3 DAYS" : "OVERDRAWN"} />
      {/* the APR tower */}
      <BigBlock p={TOWER} size={[1.0, towerH, 0.8]} color={PAL.debt} text={towerH > 1.2 ? "APR" : ""} glow={0.3} />
      {i >= 15 && i <= 16 ? <Label p={[TOWER[0] - 0.25, Math.max(1.0, towerH - 0.5), TOWER[2] + 0.45]} r={[0, -0.2, 0]} text={["≈17,000%", "APR"]} w={1.2} h={0.5} bg={PAL.night} fg="#ff7a6a" glow={0.6} /> : null}
      {/* the opt-in switch */}
      <Pedestal p={[SWITCH[0], 0, SWITCH[2]]} h={0.9} r={0.32} ring="#ffd23a" />
      <Label p={[SWITCH[0], 1.7, SWITCH[2]]} r={[0, 0.35, 0]} text={["DEBIT OVERDRAFT", "OPT-IN BY LAW"]} w={1.15} h={0.42} bg={PAL.night} fg="#ffd23a" />
      <group position={[SWITCH[0], 0.95, SWITCH[2]]} rotation={[0, 0.35, 0]}>
        <mesh rotation={[0, 0, sw ? -0.5 : 0.5]} position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.45, 0.08]} />
          <meshStandardMaterial color={sw ? "#5ff08a" : "#ff6a5f"} emissive={sw ? "#1f9e4f" : "#d62a2a"} emissiveIntensity={0.5} />
        </mesh>
        <Label p={[0, 0.55, 0.05]} text={[sw ? "OFF" : "ON"]} w={0.32} h={0.16} bg="#0e0a18" fg={sw ? "#5ff08a" : "#ff6a5f"} glow={1} />
      </group>
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const RED = "#ff6a5f", GREEN = "#5ff08a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  void t;
  if (i >= 15 && i <= 16) return { lines: [{ text: "APR ≈17,000%", color: RED }, { text: "$34 TO BORROW $24 FOR 3 DAYS", color: "#ffffff", size: 38 }], accent: "#ff8a7a" };
  if (i >= 11 && i <= 14) return { lines: [{ text: "BORROW $24 · PAY $34", color: RED }, { text: "3 DAYS", color: "#ffffff", size: 42 }], accent: "#ff8a7a" };
  if (i >= 17 && i <= 18) return { lines: [{ text: "DEBIT OVERDRAFT", color: GREEN }, { text: "OPT-IN BY LAW", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  if (i === 9 || i === 10) return { lines: [{ text: "OVER HALF", color: GREEN }, { text: "PAID BACK IN 3 DAYS", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  if (i >= 6) return { lines: [{ text: "$24 + $34 FEE", color: RED }, { text: "= $58", color: "#ffffff", size: 46 }], accent: "#ff8a7a" };
  return { lines: [{ text: i === 3 || i === 5 ? "$24 SWIPE" : "$24 + $34 = $58", color: RED }, { text: "TYPICAL DEBIT OVERDRAFT", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
};

export const OVERDRAFT_SPEC: FinSpec = {
  slug: "overdraft-fee",
  shots: OVERDRAFT_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: (t, s) => (idx(s.id) >= 11 && idx(s.id) <= 16 ? "CFPB'S OWN COMPARISON" : "CFPB 2014 DATA"),
  bg: "#2a1f5a",
};

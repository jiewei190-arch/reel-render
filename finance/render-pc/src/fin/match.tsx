// employer-match: "Some jobs pay you to save." The hall as a payroll office: Saver drops his savings into a RETIREMENT
// PLAN jar on the counter, Teller (the employer) adds the match; Spender skips it and the match slides away. Stated
// example: $50,000 salary, 50 % match up to 6 % of pay -> you $3,000, match $1,500; the 2026 employee limit $24,500 (IRS).
import React from "react";
import { Jar, NeonSign, Counter as Desk } from "../library/props";
import { SAVER, SPENDER, TELLER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/employer_match.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigClock, CoinStack, FlipCalendar, Hall, Label, PAL, Pedestal } from "./props";
import { body, fitted, manual, Sheet } from "./f2kit";
import SCRIPT from "./scripts/employer_match";

const S = { saver: 1.0, spender: 1.0, teller: 0.9 };
const DESK: V3 = [0.5, 0, -0.95]; // library counter: 2.0 wide, top 0.98, front face z = DESK.z + 0.35
const TOP = 0.98;
const JAR: V3 = [0.05, TOP, -0.85];
const JAR_B: V3 = [1.15, TOP, -0.85];
const P_SV: V3 = [-0.5, 0, 0.05];
const P_TL: V3 = [0.35, 0, -1.6];
const P_SP0: V3 = [2.6, 0, 0.7];
const P_SP: V3 = [1.6, 0, 0.35];
const BOARD: V3 = [-1.75, 2.1, -3.44];
const CLOCK: V3 = [-2.9, 2.35, -3.4];
const CAL: V3 = [2.55, 2.2, -3.44];
const JARS3: V3 = [-2.4, 0, -1.6];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
const TL_LIFT = 0.22; // Teller stands on a hidden step behind the counter

const sv = (bust = false) => body(P_SV, S.saver, bust);
const tl = (bust = false) => body(P_TL, S.teller, bust, TL_LIFT);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: fitted([...sv(), ...tl(), [JAR[0], TOP + 0.5, JAR[2]], [P_SP0[0], 1.6, P_SP0[2]]], 8, 0.16, D.S01, { mood: "store", fov: 54 }),
  S02: manual([JAR[0], TOP + 0.25, JAR[2]], 10, 1.25, 0.2, { mood: "store" }),
  S03: fitted([...tl(true), [JAR[0] + 0.3, TOP, JAR[2] + 0.3]], -14, 0.08, D.S03, { mood: "store", face: 0.5 }),
  S04: manual([P_SV[0] + 0.2, 1.4, P_SV[2] + 0.45], 18, 1.0, 0.0, { mood: "store" }),
  S05: manual([BOARD[0], BOARD[1] - 0.05, BOARD[2]], 10, 2.2, -0.05, { mood: "store" }),
  S06: manual([JAR[0] + 0.45, TOP + 0.12, JAR[2] + 0.15], 6, 0.95, 0.25, { mood: "store" }),
  S07: fitted(tl(true), -10, 0.06, D.S07, { mood: "store", face: 0.5 }),
  S08: fitted([...sv(), [JAR[0], TOP + 0.5, JAR[2]]], 22, 0.12, D.S08, { mood: "store" }),
  S09: manual([JAR[0], TOP + 0.28, JAR[2]], -12, 1.35, 0.2, { mood: "store" }),
  S10: manual([JAR[0] + 0.45, TOP + 0.15, JAR[2] + 0.25], 0, 0.8, 0.12, { mood: "store" }),
  S11: manual([JAR[0], TOP + 0.3, JAR[2]], 14, 1.45, 0.15, { mood: "store" }),
  S12: fitted(body(P_SP, S.spender), -20, 0.1, D.S12, { mood: "whisper" }),
  S13: manual([JAR_B[0] - 0.2, TOP + 0.15, JAR_B[2]], -8, 1.3, 0.2, { mood: "whisper" }),
  S14: fitted([...body(P_SP, S.spender, true), [JAR_B[0], TOP + 0.3, JAR_B[2]]], -24, 0.06, D.S14, { mood: "whisper" }),
  S15: fitted([[JARS3[0] - 0.9, 0, JARS3[2]], [JARS3[0] + 0.9, 1.6, JARS3[2]]], 12, 0.15, D.S15, { mood: "store" }),
  S16: manual([CLOCK[0] + 0.5, CLOCK[1] - 0.3, CLOCK[2]], 16, 2.3, -0.1, { mood: "store" }),
  S17: fitted([...tl(), [P_TL[0] + 0.35, 2.15, P_TL[2]]], -8, 0.08, D.S17, { mood: "store" }),
  S18: manual([P_TL[0] + 0.25, 1.75, P_TL[2] + 0.3], -6, 1.25, 0.0, { mood: "store" }),
  S19: manual([CAL[0], CAL[1] - 0.15, CAL[2]], -12, 2.0, 0.0, { mood: "store" }),
  S20: fitted([...sv(), ...tl(), [JAR[0], TOP + 0.5, JAR[2]], [P_SP0[0], 1.6, P_SP0[2]]], 8, 0.16, D.S20, { mood: "store", fov: 54 }),
};
export const MATCH_SHOTS = buildShots(PLAN, LENS);

/** what is in the jar (you, match) at time t */
const you = (t: number) => (t >= T.S08 && t < T.S20 ? 3000 * ss(T.S08 + 0.2, T.S08 + 0.9, t) : 0);
const match = (t: number) => (t >= T.S09 && t < T.S20 ? 1500 * ss(T.S09 + 0.2, T.S09 + 0.9, t) : 0);

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const loop = i === 1 || i === 20 || i === 2;
  const actors: React.ReactNode[] = [];
  // Saver
  {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, JAR) * 0.5 + yawTo(P_SV, [0, 0, 4]) * 0.5, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop || i === 8) { pose = { ...pose, armR: 1.35 - 0.25 * ss(0.3, 0.9, tau), outR: -0.05 }; held = tau < 0.6 ? { side: "R", node: <CoinStack p={[0, -0.02, 0.06]} n={i === 8 ? 14 : 8} s={1.3} /> } : undefined; }
    if (i === 4) { pose = { ...pose, armR: 1.25 }; held = { side: "R", node: <group position={[0, 0.22, 0.05]}><Sheet lines={["PAYSLIP", "$50,000/YR", "EXAMPLE"]} /></group> }; emo = "curious"; }
    if (i === 11) emo = "joy";
    if (i <= 11 || i >= 15) actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} held={held} />);
  }
  // Teller, the employer (behind the counter on a hidden step)
  {
    let pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, [0, 0, 4]), S.teller), armL: 0.2, armR: 0.2 };
    pose = { ...pose, y: pose.y + TL_LIFT };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop || i === 9) { pose = { ...pose, armL: 1.3, outL: 0.05 }; held = { side: "L", node: <CoinStack p={[0, -0.02, 0.06]} n={7} s={1.3} /> }; }
    if (i === 3) { pose = { ...pose, armR: 1.35, outR: 0.2 }; emo = "joy"; }
    if (i === 7) { pose = { ...pose, armR: 2.5, outR: 0.15 }; held = { side: "R", node: <Label p={[0, 0.12, 0.05]} text={["6%"]} w={0.3} h={0.2} bg={PAL.coin} fg={PAL.ink} /> }; emo = "sly"; }
    if (i === 13) { pose = { ...pose, armL: 0.9, outL: 0.3 }; emo = "sad"; }
    if (i === 17 || i === 18) { pose = { ...pose, armR: 2.0, outR: 0.12 }; held = { side: "R", node: <Label p={[0, 0.25, 0.05]} text={i === 17 ? ["I.R.S.", "LIMIT"] : ["$24,500", "YOUR PART · 2026"]} w={0.62} h={0.36} bg="#fff4c8" fg={PAL.ink} glow={0.2} /> }; }
    actors.push(<Act key="tl" look={TELLER} pose={pose} emotion={emo} s={S.teller} t={t} seed={3} held={held} />);
  }
  // Spender strolls past (S01/S20 in the back, S12-S14 at the counter)
  {
    const p = i >= 12 && i <= 14 ? P_SP : P_SP0;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0.5, 0, 4]), S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "sly";
    if (i === 12) { pose = { ...pose, armL: 2.4 * ss(0, 0.7, tau), armR: 2.4 * ss(0, 0.7, tau), outL: 0.3, outR: 0.3 }; emo = "happy"; }
    if (i === 14) { pose = { ...pose, outL: 0.7, outR: 0.7, armL: 0.35, armR: 0.35 }; emo = "sad"; }
    if (loop || (i >= 12 && i <= 14)) actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} />);
  }
  // jar contents: a fill level from what's in it
  const fill = Math.min(1, 0.05 + (you(t) + match(t)) / 5000);
  const slideAway = i === 13 ? ss(0.2, 1.1, tau) : 0;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#5f9ae8" stripe="#ffd23a">
        <NeonSign p={[0.5, 2.85, -3.42]} text="PAYROLL" w={1.6} h={0.42} color="#ffd23a" />
      </Hall>
      <Desk p={DESK} />
      {/* the RETIREMENT PLAN jar (Saver) and Spender's empty one */}
      <group position={JAR} scale={1.3}>
        <Jar label={false}>
          <mesh position={[0, (0.34 * fill) / 2 + 0.01, 0]}>
            <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * fill), 28]} />
            <meshStandardMaterial color="#f0c040" roughness={0.35} emissive={i === 11 || i === 2 ? "#1f9e4f" : "#c88a10"} emissiveIntensity={i === 11 || i === 2 ? 0.9 : 0.25} />
          </mesh>
        </Jar>
      </group>
      <Label p={[JAR[0], TOP - 0.2, DESK[2] + 0.36]} text={["RETIREMENT", "PLAN"]} w={0.5} h={0.24} bg={PAL.cash} fg="#fff4c8" />
      <group position={JAR_B} scale={1.1}><Jar label={false} /></group>
      <Label p={[JAR_B[0], TOP - 0.2, DESK[2] + 0.36]} text={["SPENDER"]} w={0.42} h={0.14} bg={PAL.debt} fg="#fff4c8" />
      <Label p={[DESK[0] + 0.55, TOP + 0.12, DESK[2] + 0.2]} r={[-0.5, 0, 0]} text={["EMPLOYER", "MATCH"]} w={0.42} h={0.22} bg="#16121c" fg="#ffd23a" glow={0.4} />
      {/* the match: half-size bundle beside the full one (S06), the $3,000 / $1,500 stacks (S08-S11), sliding away (S13) */}
      {i === 6 ? (
        <>
          <CoinStack p={[JAR[0] + 0.32, TOP, JAR[2] + 0.15]} n={16} s={1.4} />
          <CoinStack p={[JAR[0] + 0.55, TOP, JAR[2] + 0.15]} n={8 * ss(0.1, 0.6, tau)} s={1.4} />
          <Label p={[JAR[0] + 0.44, TOP + 0.48, JAR[2] + 0.15]} text={["½"]} w={0.18} h={0.16} bg={PAL.coin} />
        </>
      ) : null}
      {i >= 8 && i <= 11 ? (
        <>
          <Label p={[JAR[0] - 0.42, TOP + 0.3, JAR[2] + 0.2]} r={[0, 0.3, 0]} text={["YOU", "$3,000"]} w={0.4} h={0.26} bg={PAL.cash} fg="#fff4c8" />
          {i >= 9 ? <Label p={[JAR[0] + 0.42, TOP + 0.3, JAR[2] + 0.2]} r={[0, -0.3, 0]} text={["MATCH", "$1,500"]} w={0.4} h={0.26} bg={PAL.coin} fg={PAL.ink} /> : null}
        </>
      ) : null}
      {i === 10 ? (
        <>
          <Label p={[JAR[0] + 0.25, TOP + 0.15, JAR[2] + 0.35]} text={["$1"]} w={0.24} h={0.24} bg={PAL.coin} />
          <Label p={[JAR[0] + 0.62, TOP + 0.1, JAR[2] + 0.35]} text={["50¢"]} w={0.17} h={0.17} bg={PAL.coin} />
        </>
      ) : null}
      {i === 13 ? <CoinStack p={[JAR_B[0] - 0.35 + 0.5 * slideAway, TOP, JAR_B[2] + 0.1 - 0.35 * slideAway]} n={10} s={1.4} /> : null}
      {/* the board, three plans, the clock, the calendar */}
      <Label p={BOARD} text={["MATCH 50%", "UP TO 6% OF PAY", "(EXAMPLE)"]} w={1.5} h={0.8} bg="#16301e" fg="#7ee8a0" />
      {[["50% UP TO 6%", PAL.cash], ["100% UP TO 3%", "#2a7de1"], ["NO MATCH", "#9a9aa8"]].map(([txt, col], k) => (
        <group key={k}>
          <Pedestal p={[JARS3[0] - 0.7 + k * 0.7, 0, JARS3[2]]} h={0.75} r={0.2} ring={col} />
          <group position={[JARS3[0] - 0.7 + k * 0.7, 0.75, JARS3[2]]} scale={1.1}><Jar label={false}><CoinStack p={[0, 0.02, 0]} n={k === 2 ? 2 : 8} /></Jar></group>
          <Label p={[JARS3[0] - 0.7 + k * 0.7, 1.35, JARS3[2]]} text={[txt]} w={0.6} h={0.14} bg={col} fg="#ffffff" />
        </group>
      ))}
      {i === 15 ? <Label p={[JARS3[0], 1.7, JARS3[2]]} text={["PLANS DIFFER"]} w={0.9} h={0.2} bg="#fff4c8" /> : null}
      <BigClock p={CLOCK} hour={t * 0.6} min={t * 4} />
      {i === 16 ? <Label p={[CLOCK[0] + 0.75, CLOCK[1] - 0.75, CLOCK[2] + 0.1]} text={["VESTING:", "SOME PLANS", "MAKE YOU WAIT"]} w={1.0} h={0.55} bg="#fff4c8" /> : null}
      <FlipCalendar p={CAL} title="YEAR" value="2026" sub="EMPLOYEE LIMIT" />
      <Label p={[DESK[0] - 0.75, TOP + 0.02, DESK[2] + 0.36]} text={["EXAMPLE: $50,000 · 50% UP TO 6%"]} w={0.62} h={0.1} />
      {actors}
    </>
  );
};

const GREEN = "#5ff08a", GOLD = "#ffd23a", RED = "#ff6a5f";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  if (i >= 12 && i <= 14) return { lines: [{ text: "SKIPPED: $1,500", color: RED }, { text: "THE MATCH ISN'T YOURS", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
  if (i >= 15 && i <= 19) return { lines: [{ text: "PLANS DIFFER", color: GOLD }, { text: "2026 LIMIT (YOU): $24,500", color: "#ffffff", size: 40 }], accent: "#ffe27a" };
  const y = Math.round(you(t)), m = Math.round(match(t));
  return { lines: [{ text: `YOU $${y.toLocaleString("en-US")} + MATCH $${m.toLocaleString("en-US")}`, color: GREEN }, { text: i === 10 || i === 11 ? "50¢ ON EVERY $1" : "EXAMPLE: 50% UP TO 6%", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
};

export const MATCH_SPEC: FinSpec = {
  slug: "employer-match",
  shots: MATCH_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "EXAMPLE",
  bg: "#2a1f5a",
};

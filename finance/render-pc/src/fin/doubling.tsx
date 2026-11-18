// prices-double: "Prices double faster than you think." The hall as a corner shop: a big price block on a pedestal that
// doubles, Saver's 72 block pointed at an INFLATION sign, Penny's rate card (2 % / 3 % / 4 %), a flip calendar of years
// to double (36 / 24 / 18, Rule of 72), the CPI-U chart since 1970 (about 4 % a year, ×8.7, three doublings).
import React from "react";
import { NeonSign, ShelfUnit, SHELF } from "../library/props";
import { PENNY, SAVER, TELLER } from "../library/characters";
import { hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/prices_double.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, ChartBoard, CoinStack, FlipCalendar, Hall, Label, PAL, Pedestal } from "./props";
import { body, fitted, manual } from "./f2kit";
import SCRIPT from "./scripts/prices_double";

const S = { penny: 0.72, saver: 1.0, teller: 0.9 };
const POD: V3 = [0.25, 0, -0.55];
const POD_H = 0.75;
const P_PN: V3 = [-0.75, 0, 0.35];
const P_SV: V3 = [1.25, 0, 0.3];
const P_TL: V3 = [1.0, 0, -1.25];
const CAL: V3 = [-0.35, 2.55, -3.44];
const SIGN: V3 = [1.7, 2.65, -3.42];
const BOARD: V3 = [-1.7, 0, -2.3];
const ROW: V3 = [0.6, 0, -2.0];
const SHELF_P: V3 = [3.0, 0, -1.5];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);

const rateAt = (i: number) => (i >= 9 && i <= 10 ? 4 : i >= 7 && i <= 8 ? 3 : i >= 5 && i <= 6 ? 2 : 0);
/** the price block's value at time t (doubles in S02, grows through S14-S17, resets for the loop) */
const priceAt = (t: number, i: number) => {
  if (i === 1 || i === 18) return 1;
  if (i === 2) return lerp(1, 2, ss(T.S02 + 0.1, T.S02 + 0.5, t));
  if (i >= 14 && i <= 17) return lerp(1, 8, ss(T.S14, T.S15 + 0.6, t));
  return 2;
};
const blockH = (v: number) => 0.32 * Math.pow(v, 0.62);

const pn = (bust = false) => body(P_PN, S.penny, bust);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: fitted([...pn(), [POD[0], POD_H + 1.0, POD[2]], [POD[0] + 0.4, 0, POD[2]]], 14, 0.1, D.S01, { mood: "store", face: 0.6, m: 0.06 }),
  S02: manual([POD[0], POD_H + 0.3, POD[2]], 8, 1.5, 0.15, { mood: "store" }),
  S03: fitted([...body(P_SV, S.saver), [P_SV[0], 2.35, P_SV[2]]], -18, 0.1, D.S03, { mood: "store" }),
  S04: fitted([...body(P_SV, S.saver), [SIGN[0], SIGN[1] + 0.3, SIGN[2]], [SIGN[0] - 0.8, SIGN[1], SIGN[2]]], -8, 0.08, D.S04, { mood: "store", fov: 56 }),
  S05: fitted(pn(true), 22, 0.05, D.S05, { mood: "store", face: 0.5 }),
  S06: manual([CAL[0], CAL[1] - 0.15, CAL[2]], 14, 2.1, 0.0, { mood: "store" }),
  S07: fitted(pn(true), 10, 0.05, D.S07, { mood: "store", face: 0.5 }),
  S08: manual([CAL[0], CAL[1] - 0.15, CAL[2]], -8, 1.8, 0.0, { mood: "store" }),
  S09: fitted(pn(true), 28, 0.04, D.S09, { mood: "store", face: 0.5 }),
  S10: manual([CAL[0], CAL[1] - 0.15, CAL[2]], 6, 1.6, 0.0, { mood: "store" }),
  S11: fitted([...body(P_TL, S.teller), [POD[0], POD_H + 0.5, POD[2]], [CAL[0], CAL[1] + 0.5, CAL[2]]], 8, 0.12, D.S11, { mood: "home", fov: 56 }),
  S12: fitted([[BOARD[0] - 1.0, 0.9, BOARD[2]], [BOARD[0] + 1.0, 2.2, BOARD[2]]], 12, 0.05, D.S12, { mood: "store" }),
  S13: manual([BOARD[0] + 0.2, 1.55, BOARD[2]], 8, 1.4, 0.0, { mood: "store" }),
  S14: fitted([[ROW[0] - 1.0, 0, ROW[2]], [ROW[0] + 1.0, 2.0, ROW[2]]], 6, 0.12, D.S14, { mood: "store" }),
  S15: fitted([[ROW[0] - 1.0, 0, ROW[2]], [ROW[0] + 1.0, 2.45, ROW[2]]], -8, 0.1, D.S15, { mood: "store" }),
  S16: fitted([...pn(), [ROW[0] + 0.75, 2.1, ROW[2]]], 10, 0.1, D.S16, { mood: "ending" }),
  S17: fitted([...pn(), ...body(P_SV, S.saver), [ROW[0] + 0.75, 2.2, ROW[2]]], 2, -0.08, D.S17, { mood: "ending", fov: 58 }),
  S18: fitted([...pn(), [POD[0], POD_H + 1.0, POD[2]], [POD[0] + 0.4, 0, POD[2]]], 14, 0.1, D.S18, { mood: "store", face: 0.6, m: 0.06 }),
};
export const DOUBLING_SHOTS = buildShots(PLAN, LENS);

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const r = rateAt(i);
  const v = priceAt(t, i);
  const actors: React.ReactNode[] = [];
  // Penny
  {
    let pose: Pose = { ...stand(P_PN[0], P_PN[2], yawTo(P_PN, POD) * 0.5 + yawTo(P_PN, [0, 0, 4]) * 0.5, S.penny), armL: 0.2, armR: 0.2, headPitch: -0.2 };
    let emo: Emotion = "curious";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (r) { pose = { ...pose, armR: 1.55, outR: 0.5, headPitch: 0 }; held = { side: "R", node: <Label p={[0, 0.12, 0.05]} text={[`${r}%`]} w={0.3} h={0.2} bg={PAL.debt} fg="#fff4c8" /> }; emo = r === 4 ? "shock" : "curious"; }
    if (i === 16 || i === 17) { pose = { ...pose, armR: 1.55, outR: 0.5 }; held = { side: "R", node: <Label p={[0, 0.1, 0.05]} text={["4%"]} w={0.18} h={0.12} bg={PAL.debt} fg="#fff4c8" /> }; emo = "shock"; }
    actors.push(<Act key="pn" look={PENNY} pose={pose} emotion={emo} s={S.penny} t={t} seed={1} held={held} />);
  }
  // Saver with the 72 block (S03, S04), watching in the ending
  if ((i >= 3 && i <= 4) || i === 17) {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, [0.4, 0, 4]), S.saver), armL: 0.2, armR: 0.2 };
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 3) { pose = { ...pose, armL: 2.6, armR: 2.6, outL: 0.1, outR: 0.1 }; held = { side: "R", node: <BigBlock p={[0.17, 0, 0]} size={[0.6, 0.42, 0.22]} color={PAL.cash} text="72" glow={0.5} /> }; }
    if (i === 4) { pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, SIGN) * 0.6 + yawTo(P_SV, [0, 0, 4]) * 0.4, S.saver), armR: 1.5, outR: 0.1 }; held = { side: "R", node: <BigBlock p={[0, 0, 0.1]} size={[0.6, 0.42, 0.22]} color={PAL.cash} text="72" glow={0.5} /> }; }
    if (i === 17) { pose = { ...pose, headPitch: -0.35, armL: 0.6, armR: 0.6, outL: 0.5, outR: 0.5 }; }
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={i === 17 ? "shock" : "joy"} s={S.saver} t={t} seed={4} held={held} />);
  }
  // Teller relabels the price in 1970 (S11)
  if (i === 11) {
    const pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, POD), S.teller), armR: 1.3, outR: 0.1 };
    actors.push(<Act key="tl" look={TELLER} pose={pose} emotion="happy" s={S.teller} t={t} seed={3} held={{ side: "R", node: <Label p={[0, 0.1, 0.05]} text={["$1"]} w={0.2} h={0.14} /> }} />);
  }
  const showPod = !(i >= 14 && i <= 17);
  const ghost = i === 1 || i === 18 ? 0.35 + 0.25 * Math.sin(t * 3) : 0;
  const calVal = i >= 5 && i <= 6 ? "36" : i >= 7 && i <= 8 ? "24" : i >= 9 && i <= 10 ? "18" : i === 11 ? "1970" : "72÷%";
  const calTitle = i === 11 ? "YEAR" : "YEARS";
  const flip = i === 6 || i === 8 || i === 10 ? ss(0.05, 0.5, tau) : 1;
  const rowGrow = i === 14 ? ss(0, 1.2, tau) : i >= 15 && i <= 17 ? 1 : 0;
  const warm = i === 11;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall={warm ? "#c87a3a" : "#7f6fe0"} stripe="#ffd23a" floorA={warm ? "#f4e0c0" : undefined} floorB={warm ? "#e0c090" : undefined}>
        <NeonSign p={SIGN} text="INFLATION" w={2.0} h={0.42} color="#ff5a4f" />
      </Hall>
      <ShelfUnit p={SHELF_P} yaw={-Math.PI / 2}>
        {SHELF.boards.map((by, bi) => Array.from({ length: 6 }, (_, k) => (
          <group key={`${bi}-${k}`} position={[-SHELF.w / 2 + 0.3 + k * 0.4, by, 0]}>
            <mesh position={[0, 0.12, 0]} castShadow><boxGeometry args={[0.22, 0.24, 0.22]} /><meshStandardMaterial color={["#ff8a1f", "#2fd0bd", "#ff5aa0", "#ffd23a"][(bi + k) % 4]} roughness={0.5} /></mesh>
            <Label p={[0, 0.06, 0.12]} text={[`$${(2 ** ((bi + k) % 3)) * (1 + Math.round(hash(bi * 6 + k) * 3))}`]} w={0.18} h={0.08} />
          </group>
        )))}
      </ShelfUnit>
      {showPod ? (
        <>
          <Pedestal p={POD} h={POD_H} r={0.34} ring={PAL.debt} />
          <BigBlock p={[POD[0], POD_H, POD[2]]} size={[0.5 * Math.pow(v, 0.25), blockH(v), 0.32]} color={PAL.debt} text={`$${v < 1.95 && v > 1.05 ? v.toFixed(2) : Math.round(v)}`} glow={0.35} />
          {ghost > 0 ? (
            <mesh position={[POD[0] + 0.1, POD_H + blockH(2) / 2 + 0.05 + 0.1 * Math.sin(t * 2), POD[2] - 0.3]}>
              <boxGeometry args={[0.6, blockH(2), 0.34]} />
              <meshStandardMaterial color="#ff8a7a" transparent opacity={ghost} emissive="#ff5a4f" emissiveIntensity={0.4} />
            </mesh>
          ) : null}
          <Label p={[POD[0], 0.32, POD[2] + 0.36]} text={["RULE OF 72:", "AN APPROXIMATION"]} w={0.5} h={0.2} />
        </>
      ) : null}
      <FlipCalendar p={CAL} title={calTitle} value={calVal} prev={flip < 1 ? "?" : undefined} flip={flip} sub={i === 11 ? "U.S. CPI-U START" : "TO DOUBLE"} />
      {/* CPI chart since 1970 */}
      <ChartBoard p={BOARD} title="U.S. CPI-U 1970 → 2026 (×8.7)" values={[0.11, 0.2, 0.3, 0.4, 0.5, 0.58, 0.68, 0.78, 0.9, 1.0]} color={PAL.debt} draw={i === 12 ? ss(0, 1.1, tau) : i >= 12 ? 1 : 0.15} w={2.0} />
      {i === 13 ? <Label p={[BOARD[0] + 0.3, 1.7, BOARD[2] + 0.1]} text={["~4% A YEAR (AVG)"]} w={0.8} h={0.2} bg="#fff4c8" fg={PAL.debt} /> : null}
      {/* the doublings: $1 $2 $4 $8 */}
      {rowGrow > 0
        ? [1, 2, 4, 8].map((p, k) => {
            const g = Math.min(1, Math.max(0, rowGrow * 4 - k));
            return g > 0 ? <BigBlock key={k} p={[ROW[0] - 0.9 + k * 0.6, 0, ROW[2]]} size={[0.5, blockH(p) * 1.6 * g + 0.01, 0.4]} color={PAL.debt} text={`$${p}`} glow={0.3} /> : null;
          })
        : null}
      {i === 15 ? (
        <>
          {["×2", "×2", "×2"].map((x, k) => <Label key={k} p={[ROW[0] - 0.6 + k * 0.6, blockH(2 ** (k + 1)) * 1.6 + 0.3, ROW[2] + 0.25]} text={[x]} w={0.3} h={0.18} bg={PAL.coin} />)}
          <Label p={[ROW[0], 2.35, ROW[2]]} text={["≈ ×8.7 SINCE 1970"]} w={1.1} h={0.2} bg="#fff4c8" fg={PAL.debt} />
        </>
      ) : null}
      <CoinStack p={[POD[0] - 0.7, 0, POD[2] + 0.5]} n={3} s={1.4} />
      {actors}
    </>
  );
};

const RED = "#ff6a5f", GOLD = "#ffd23a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  const r = rateAt(i);
  if (i >= 11 && i <= 15) return { lines: [{ text: "1970 → 2026: ×8.7", color: RED }, { text: "≈ 3 DOUBLINGS · ~18 YEARS EACH", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
  if (i >= 16 && i <= 17) return { lines: [{ text: "SMALL % · BIG CHANGE", color: GOLD }, { text: "~4% A YEAR, 56 YEARS", color: "#ffffff", size: 40 }], accent: "#ffe27a" };
  return { lines: [{ text: r ? `72 ÷ ${r} = ${72 / r} YEARS` : "72 ÷ INFLATION = YEARS", color: r ? RED : "#ffffff" }, { text: "PRICES DOUBLE IN…", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
};

export const DOUBLING_SPEC: FinSpec = {
  slug: "prices-double",
  shots: DOUBLING_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "RULE OF 72 ≈",
  bg: "#2a1f5a",
};

// coffee-could-be: "Your coffee could be worth 186,000 dollars." The hall as a coffee bar + a savings corner. Spender
// buys a $5 coffee a day ($1,825 a year); Saver puts the same money into a jar monthly instead; at a made-up steady 7 %
// it becomes a tall column (≈ $186,600 after 30 years; 10 years ≈ $26,500). Twist: time, not the coffee.
import React from "react";
import { Jar, NeonSign } from "../library/props";
import { SAVER, SPENDER, TELLER } from "../library/characters";
import { lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/coffee_could_be.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { BigClock, CoinStack, FlipCalendar, Hall, Label, PAL, Pedestal, Stamp } from "./props";
import { body, CoffeeBar, Cup, fitted, manual } from "./f2kit";
import SCRIPT from "./scripts/coffee_could_be";

const S = { spender: 1.0, saver: 1.0, teller: 0.9 };
const BAR: V3 = [1.4, 0, -1.2];
const TOP = 0.98;
const P_SP: V3 = [0.9, 0, 0.0];
const P_TL: V3 = [1.6, 0, -1.85];
const P_SV: V3 = [-0.45, 0, 0.45];
const COL: V3 = [-1.1, 0, -0.75];
const COL2: V3 = [-0.1, 0, -0.55];
const CAL: V3 = [-2.6, 2.2, -3.44];
const CLOCK: V3 = [3.3, 2.45, -3.42];
const BOARD: V3 = [-0.6, 2.05, -3.44];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
const TL_LIFT = 0.22;

// ---- the example: $152.08 at the start of each month, 7 %/12 a month
const I = 0.07 / 12, PM = 1825 / 12;
const fv = (n: number) => (n <= 0 ? 0 : PM * ((1 + I) ** n - 1) / I * (1 + I));
const V30 = fv(360), V10 = fv(120);
/** the jar's value at t: deposits only (S07-S10, up to $54,750), then the growth (S11-S12) */
const jarValue = (t: number, i: number) => {
  if (i < 7 || i === 20) return 0;
  if (i <= 10) return 54750 * Math.min(1, ss(T.S07, T.S09 + 0.3, t));
  if (i <= 12) return lerp(54750, V30, ss(T.S11, T.S12 + 0.8, t));
  return V30;
};
const colH = (v: number) => 0.25 + 1.9 * Math.min(1, v / V30);

const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: fitted([...body(P_SP, S.spender), [COL[0], 2.4, COL[2]], [COL[0] - 0.4, 0, COL[2]]], 6, 0.1, D.S01, { mood: "store", fov: 52, face: 0.6, m: 0.06 }),
  S02: manual([COL[0], 1.5, COL[2]], 10, 2.6, -0.2, { mood: "store", fov: 54 }),
  S03: fitted([...body(P_SP, S.spender), ...body(P_TL, S.teller, false, TL_LIFT)], -10, 0.12, D.S03, { mood: "store" }),
  S04: manual([BAR[0] - 0.5, TOP + 0.12, BAR[2] + 0.3], 8, 1.2, 0.3, { mood: "store" }),
  S05: fitted([[BAR[0] - 1.3, TOP, BAR[2]], [BAR[0] + 1.3, TOP + 0.6, BAR[2]], ...body(P_SP, S.spender)], 4, 0.18, D.S05, { mood: "store" }),
  S06: manual([CAL[0], CAL[1] - 0.15, CAL[2]], 14, 2.0, 0.0, { mood: "store" }),
  S07: fitted([...body(P_SV, S.saver), [COL[0], 1.3, COL[2]]], -12, 0.1, D.S07, { mood: "store" }),
  S08: manual([COL[0], 1.0, COL[2]], -6, 1.6, 0.18, { mood: "store" }),
  S09: manual([COL[0], 1.05, COL[2] + 0.2], 10, 2.4, 0.1, { mood: "store" }),
  S10: manual([BOARD[0], BOARD[1] - 0.1, BOARD[2]], 4, 2.2, -0.05, { mood: "store" }),
  S11: manual([COL[0], 1.2, COL[2]], 16, 2.2, 0.05, { mood: "store" }),
  S12: manual([COL[0], 1.5, COL[2]], 8, 2.9, -0.22, { mood: "ending", fov: 56 }),
  S13: fitted(body(P_SP, S.spender, true), 18, 0.05, D.S13, { mood: "whisper", face: 0.5 }),
  S14: manual([BAR[0] - 0.4, TOP + 0.1, BAR[2] + 0.3], 10, 0.8, 0.2, { mood: "whisper" }),
  S15: manual([CLOCK[0], CLOCK[1] - 0.2, CLOCK[2]], -8, 2.1, -0.05, { mood: "ending" }),
  S16: manual([COL2[0], 0.8, COL2[2]], 12, 1.9, 0.1, { mood: "store" }),
  S17: fitted([[COL[0] - 0.4, 0, COL[2]], [COL[0], 2.4, COL[2]], [COL2[0] + 0.4, 0, COL2[2]]], 8, 0.08, D.S17, { mood: "store" }),
  S18: manual([BOARD[0], BOARD[1] - 0.1, BOARD[2]], -6, 2.0, -0.05, { mood: "whisper" }),
  S19: fitted(body(P_SP, S.spender, true), 14, 0.05, D.S19, { mood: "store", face: 0.5 }),
  S20: fitted([...body(P_SP, S.spender), [COL[0], 2.4, COL[2]], [COL[0] - 0.4, 0, COL[2]]], 6, 0.1, D.S20, { mood: "store", fov: 52, face: 0.6, m: 0.06 }),
};
export const COFFEE_SHOTS = buildShots(PLAN, LENS);

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const loop = i === 1 || i === 2 || i === 20;
  const v = jarValue(t, i);
  const actors: React.ReactNode[] = [];
  {
    let pose: Pose = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [0.6, 0, 4]), S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "happy";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined = { side: "R", node: <Cup p={[0, -0.02, 0.05]} s={1.5} /> };
    pose = { ...pose, armR: loop || i === 19 ? 1.55 : 0.95 };
    if (i === 3) { pose = { ...pose, armL: 1.1 }; emo = "joy"; }
    if (i === 13) { pose = { ...pose, headPitch: 0.25, armR: 1.1 }; emo = "curious"; }
    if (i === 19) emo = "joy";
    actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} held={held} />);
    void held;
    held = undefined;
  }
  {
    const pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, P_SP), S.teller), armL: i === 3 ? 1.1 : 0.2, armR: 0.2 };
    actors.push(<Act key="tl" look={TELLER} pose={{ ...pose, y: pose.y + TL_LIFT }} emotion="happy" s={S.teller} t={t} seed={3} held={i === 3 ? { side: "L", node: <Cup p={[0, -0.02, 0.05]} s={1.5} /> } : undefined} />);
  }
  if (loop || i === 7 || i === 12) {
    let pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, COL) * 0.5 + yawTo(P_SV, [0, 0, 4]) * 0.5, S.saver), armL: 0.2, armR: 0.2 };
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 7) { pose = { ...pose, armL: 1.3 - 0.2 * Math.sin(tau * 7), outL: 0.1 }; held = { side: "L", node: <CoinStack p={[0, -0.02, 0.06]} n={10} s={1.3} /> }; }
    if (i === 12) pose = { ...pose, headPitch: -0.4, armL: 0.5, armR: 0.5, outL: 0.4, outR: 0.4 };
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={i === 12 ? "joy" : "happy"} s={S.saver} t={t} seed={4} held={held} />);
  }
  const days = i === 4 ? Math.min(6, Math.floor(1 + tau * 4)) : i >= 5 && i <= 6 ? 14 : 0;
  const ghost = loop ? 0.35 + 0.15 * Math.sin(t * 2.5) : 0;
  const h = colH(v);
  const showCol = v > 0;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#b07a5a" stripe="#ffd23a" floorA="#fbefe0" floorB="#ecd8c0">
        <NeonSign p={[1.4, 2.75, -3.42]} text="COFFEE BAR" w={1.9} h={0.42} color="#ffd23a" />
      </Hall>
      <CoffeeBar p={BAR} w={2.6} />
      <Label p={[BAR[0] - 0.55, TOP + 0.02, BAR[2] + 0.34]} text={["EXAMPLE: $5/DAY · 7%/YR STEADY · NOT A PREDICTION"]} w={1.0} h={0.09} />
      <Label p={[BAR[0] + 0.7, TOP - 0.25, BAR[2] + 0.335]} text={["$5"]} w={0.3} h={0.2} bg="#16121c" fg="#ffd23a" glow={0.4} />
      {Array.from({ length: days }, (_, k) => <CoinStack key={k} p={[BAR[0] - 1.1 + (k % 7) * 0.18, TOP + 0.02, BAR[2] + 0.12 - Math.floor(k / 7) * 0.18]} n={5} s={1.3} />)}
      {i >= 5 && i <= 6 ? <Label p={[BAR[0], TOP + 0.5, BAR[2] + 0.1]} text={["$1,825 A YEAR"]} w={0.9} h={0.22} bg={PAL.debt} fg="#fff4c8" glow={0.3} /> : null}
      {/* Saver's corner: a pedestal, the jar that becomes a column, the ghost column of the hook */}
      <Pedestal p={COL} h={0.45} r={0.32} ring={PAL.cash} />
      {showCol ? (
        <group position={[COL[0], 0.45, COL[2]]} scale={[2, h / 0.36, 2]}>
          <Jar label={false}>
            <mesh position={[0, 0.17 * Math.min(1, v / 54750 + 0.05), 0]}>
              <cylinderGeometry args={[0.135, 0.135, Math.max(0.01, 0.34 * Math.min(1, v / 54750 + 0.05)), 28]} />
              <meshStandardMaterial color="#f0c040" roughness={0.35} emissive={i >= 11 ? "#1f9e4f" : "#c88a10"} emissiveIntensity={i >= 11 ? 0.6 : 0.25} />
            </mesh>
          </Jar>
        </group>
      ) : (
        <group position={[COL[0], 0.45, COL[2]]} scale={2}><Jar label={false} /></group>
      )}
      {ghost > 0 ? (
        <mesh position={[COL[0], 0.45 + colH(V30) / 2, COL[2]]}>
          <cylinderGeometry args={[0.3, 0.3, colH(V30), 28]} />
          <meshStandardMaterial color="#7ee8a0" transparent opacity={ghost} emissive="#1f9e4f" emissiveIntensity={0.6} />
        </mesh>
      ) : null}
      {loop ? <Label p={[COL[0], 0.45 + colH(V30) + 0.25, COL[2]]} text={["$186,000?"]} w={0.8} h={0.24} bg={PAL.cash} fg="#fff4c8" glow={0.4} /> : null}
      {i >= 9 && i <= 10 ? <Label p={[COL[0], 1.25, COL[2] + 0.35]} text={["PUT IN", "$54,750"]} w={0.5} h={0.3} /> : null}
      {i >= 12 && i <= 17 ? <Label p={[COL[0], 0.45 + h + 0.25, COL[2]]} text={[`≈ ${usd(Math.round(v / 100) * 100, false)}`, "30 YEARS"]} w={0.7} h={0.32} bg={PAL.cash} fg="#fff4c8" glow={0.3} /> : null}
      {i >= 16 && i <= 17 ? (
        <>
          <Pedestal p={COL2} h={0.45} r={0.26} ring={PAL.coin} />
          <mesh position={[COL2[0], 0.45 + colH(V10) / 2, COL2[2]]} castShadow><cylinderGeometry args={[0.24, 0.24, colH(V10), 28]} /><meshStandardMaterial color="#f0c040" roughness={0.3} emissive="#c88a10" emissiveIntensity={0.3} /></mesh>
          <Label p={[COL2[0], 0.45 + colH(V10) + 0.25, COL2[2]]} text={[`≈ ${usd(Math.round(V10 / 100) * 100, false)}`, "10 YEARS"]} w={0.6} h={0.3} bg={PAL.coin} />
        </>
      ) : null}
      {i === 14 ? <Label p={[BAR[0] - 0.4, TOP + 0.35, BAR[2] + 0.3]} text={["NOT THE VILLAIN"]} w={0.5} h={0.12} bg="#fff4c8" /> : null}
      <Cup p={[BAR[0] - 0.4, TOP, BAR[2] + 0.3]} s={1.6} />
      <FlipCalendar p={CAL} title={i >= 8 ? "YEARS" : "DAYS"} value={i === 6 ? String(Math.min(365, Math.round(365 * ss(0, 1.2, tau)))) : i >= 8 && i <= 12 ? "30" : i >= 16 && i <= 17 ? "10" : "1"} sub="OF COFFEE" />
      <Label p={BOARD} text={["EXAMPLE", "7%/YR, STEADY", "(MADE UP)"]} w={1.3} h={0.75} bg="#16301e" fg="#7ee8a0" />
      {i === 18 ? <Stamp p={[BOARD[0], BOARD[1], BOARD[2] + 0.05]} text="NO GUARANTEES" u={ss(0, 0.35, tau)} w={1.1} /> : null}
      <BigClock p={CLOCK} hour={i === 15 ? t * 6 : 0.3} min={i === 15 ? t * 40 : 2} />
      {i === 15 ? <Label p={[CLOCK[0], CLOCK[1] - 0.75, CLOCK[2] + 0.05]} text={["TIME IS"]} w={0.6} h={0.2} bg="#fff4c8" /> : null}
      {actors}
    </>
  );
};

const GREEN = "#5ff08a", RED = "#ff6a5f", GOLD = "#ffd23a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  if (i <= 6 || i === 20) return { lines: [{ text: i >= 5 && i <= 6 ? "$1,825 A YEAR" : "$5 A DAY", color: RED }, { text: "OR: $152 A MONTH, INVESTED?", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
  if (i <= 10) return { lines: [{ text: `PUT IN ${usd(Math.round(jarValue(t, i)), false)}`, color: GREEN }, { text: "30 YEARS · EXAMPLE", color: "#ffffff", size: 40 }], accent: "#7dffb0" };
  if (i <= 12) return { lines: [{ text: `≈ ${usd(Math.round(jarValue(t, i) / 100) * 100, false)}`, color: GREEN }, { text: "EXAMPLE 7%/YR · NOT A PREDICTION", color: "#ffffff", size: 38 }], accent: "#7dffb0" };
  if (i <= 15) return { lines: [{ text: "THE TWIST: TIME", color: GOLD }, { text: "NOT THE COFFEE", color: "#ffffff", size: 40 }], accent: "#ffe27a" };
  if (i <= 17) return { lines: [{ text: `10 YRS ≈ ${usd(Math.round(V10 / 100) * 100, false)}`, color: GOLD }, { text: `30 YRS ≈ ${usd(Math.round(V30 / 100) * 100, false)}`, color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  return { lines: [{ text: "NO GUARANTEES", color: RED }, { text: "THE COFFEE MIGHT BE WORTH IT", color: "#ffffff", size: 38 }], accent: "#ff8a7a" };
};

export const COFFEE_SPEC: FinSpec = {
  slug: "coffee-could-be",
  shots: COFFEE_SHOTS,
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

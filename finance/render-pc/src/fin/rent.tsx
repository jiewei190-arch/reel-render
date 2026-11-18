// rent-thirty-rule: "Who decided rent should be 30 percent?" A sunny blocky street with a PUBLIC HOUSING block. Saver's
// INCOME bar gets a red rent slice; the 1969 law capped public housing rent at 25 % of income (Teller stamps LAW), 1981
// raised the cap to 30 %, and the cap became everyone's rule of thumb; example: $4,000 a month -> $1,200.
// Times from src/shorts/rent_thirty_rule.plan.gen.ts.
import React from "react";
import { PENNY, SAVER, SPENDER, TELLER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/rent_thirty_rule.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, FlipCalendar, Ground, Label, PAL, Stamp } from "./props";
import { body, fitted, manual, Sheet } from "./f2kit";
import SCRIPT from "./scripts/rent_thirty_rule";

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const S = { saver: 1.0, spender: 1.0, penny: 0.75, teller: 0.95 };
const BAR: V3 = [0.45, 0, -1.0];
const BAR_H = 2.4;
const P_SV: V3 = [-0.55, 0, 0.25];
const HOUSE: V3 = [-3.2, 0, -4.2];
const CAL: V3 = [2.6, 1.95, -2.3];
const P_TL: V3 = [3.4, 0, -0.9];
const TARGET: V3 = [-1.7, 0, -1.4];
const ROW: V3[] = [[-1.35, 0, 0.75], [-0.35, 0, 0.85], [0.6, 0, 0.75]];
const STACK: V3 = [2.0, 0, 0.0];
const P_SV2: V3 = [1.05, 0, 0.6];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
void T;

// ------------------------------------------------------------------ lenses
const sv = (bust = false) => body(P_SV, S.saver, bust);
const bar: V3[] = [[BAR[0] - 0.5, 0, BAR[2]], [BAR[0] + 0.5, BAR_H + 0.3, BAR[2]]];
const hook = fitted([...sv(), ...bar, [P_SV[0], 2.5, P_SV[2]]], 14, 0.1, D.S01, { mood: "earth", sky: true, fov: 52, face: 0.55, m: 0.07 });
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: hook,
  S02: manual([BAR[0], BAR_H * 0.3 * 0.5 + 0.1, BAR[2] + 0.3], 10, 1.7, 0.1, { mood: "earth", sky: true }),
  S03: manual([CAL[0], CAL[1], CAL[2]], -10, 2.0, 0.0, { mood: "earth", sky: true }),
  S04: fitted([...body(P_TL, S.teller, true), [P_TL[0] - 0.55, 1.0, P_TL[2] + 0.3]], -24, 0.05, D.S04, { mood: "earth", sky: true, face: 0.5 }),
  S05: fitted([[HOUSE[0] - 1.4, 0, HOUSE[2]], [HOUSE[0] + 1.4, 3.3, HOUSE[2]]], 14, 0.05, D.S05, { mood: "earth", sky: true }),
  S06: fitted(bar, 6, 0.05, D.S06, { mood: "earth", sky: true }),
  S07: fitted([...sv(), ...bar], 18, 0.06, D.S07, { mood: "earth", sky: true }),
  S08: manual([BAR[0], BAR_H * 0.25, BAR[2] + 0.3], 14, 1.6, 0.05, { mood: "earth", sky: true }),
  S09: manual([TARGET[0], 1.55, TARGET[2]], 16, 1.8, 0.0, { mood: "earth", sky: true }),
  S10: manual([CAL[0], CAL[1], CAL[2]], 10, 2.0, 0.0, { mood: "earth", sky: true }),
  S11: fitted(bar, -8, 0.05, D.S11, { mood: "earth", sky: true }),
  S12: fitted([[HOUSE[0] - 1.4, 0, HOUSE[2]], [HOUSE[0] + 1.4, 3.3, HOUSE[2]], ...bar], 4, 0.1, D.S12, { mood: "whisper", sky: true }),
  S13: fitted([...body(ROW[0], S.saver), ...body(ROW[1], S.spender), ...body(ROW[2], S.penny), [ROW[1][0], 2.0, ROW[1][2]]], 2, 0.06, D.S13, { mood: "whisper", sky: true }),
  S14: manual([BAR[0], BAR_H + 0.6, BAR[2] + 0.1], 6, 2.2, 0.0, { mood: "whisper", sky: true }),
  S15: fitted([...body(P_SV2, S.saver), [STACK[0] - 0.4, 0, STACK[2]], [STACK[0] + 0.4, 2.2, STACK[2]]], -14, 0.08, D.S15, { mood: "ending", sky: true }),
  S16: manual([STACK[0], 1.75, STACK[2]], -8, 2.0, 0.05, { mood: "ending", sky: true }),
  S17: fitted(body(P_SV, S.saver, true), 16, 0.04, D.S17, { mood: "ending", sky: true, face: 0.5 }),
  S18: hook,
};
export const RENT_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ scene
/** the cap on the bar (percent of income) shown in each shot */
const capAt = (i: number, tau: number) => (i <= 2 || i >= 12 ? 30 : i <= 10 ? 25 : 25 + 5 * ss(0.15, 0.75, tau));
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const i = idx(shot.id);
  const loop = i === 1 || i === 18;
  const cap = capAt(i, tau);
  const actors: React.ReactNode[] = [];
  // Saver the tenant
  if (loop || i === 2 || i === 7 || i === 15 || i === 16 || i === 17) {
    const p = i === 15 || i === 16 ? P_SV2 : P_SV;
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, i >= 15 && i <= 16 ? STACK : BAR) * 0.35 + yawTo(p, [0, 0, 5]) * 0.65, S.saver), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (loop) { pose = { ...pose, armL: 0.6, armR: 0.6, outL: 0.6, outR: 0.6, ant: 1 }; emo = "shock"; }
    if (i === 7) { pose = { ...pose, armR: 1.4, outR: 0.5 }; emo = "happy"; }
    if (i === 15 || i === 16) { pose = { ...pose, armR: 1.2, outR: 0.4 }; emo = "happy"; }
    if (i === 17) { pose = { ...pose, armR: 1.35, outL: 0.6, armL: 0.5 }; emo = "happy"; held = { side: "R", node: <group position={[0, 0.2, 0.05]}><Sheet lines={["ROUGH", "GUIDE"]} accent={PAL.cash} /></group> }; }
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} held={held} />);
  }
  // Teller stamps the law (S04)
  if (i >= 3 && i <= 4) {
    const pose: Pose = { ...stand(P_TL[0], P_TL[2], yawTo(P_TL, [0, 0, 5]), S.teller), armR: 1.25, outR: 0.0, armL: i === 4 ? 1.6 + 0.5 * Math.sin(tau * 6) : 0.3, outL: 0.2 };
    actors.push(<Act key="tl" look={TELLER} pose={pose} emotion="happy" s={S.teller} t={t} seed={3} held={{ side: "R", node: <group position={[0, 0.2, 0.05]}><Sheet lines={["1969", "PUBLIC HOUSING", "RENT ≤ 25%"]} accent={PAL.ink} /><Stamp p={[0, -0.1, 0.01]} text="LAW" u={i === 4 ? ss(0.2, 0.5, tau) : 0} w={0.26} /></group> }} />);
  }
  // the row of tenants, each with a 30 % tag (S13)
  if (i === 13) {
    const looks = [SAVER, SPENDER, PENNY];
    const sc = [S.saver, S.spender, S.penny];
    ROW.forEach((p, k) => {
      actors.push(<Act key={`r${k}`} look={looks[k]} pose={{ ...stand(p[0], p[2], yawTo(p, [0, 0, 5]), sc[k]), armL: 0.3, armR: 0.3 }} emotion={k === 1 ? "sly" : "curious"} s={sc[k]} t={t} seed={7 + k} />);
    });
  }
  const sliceDrop = loop ? 1 - ss(0.0, 0.35, tau) : 0;
  const slice = loop || i === 2 ? 30 : i >= 6 && i <= 11 ? cap : 0;
  const lift = i === 16 ? ss(0.1, 0.6, tau) : 0;
  const strike = i === 9 ? ss(0.3, 0.75, tau) : 0;
  const yr = i <= 9 ? "1969" : i === 10 ? (tau < 0.45 ? "1969" : "1981") : "1981";
  return (
    <>
      <Ground road roadW={2.6} />
      {/* the public housing block */}
      <BigBlock p={HOUSE} size={[2.6, 3.0, 1.6]} color="#c8a07a" text="" />
      {Array.from({ length: 9 }, (_, k) => (
        <mesh key={k} position={[HOUSE[0] - 0.8 + (k % 3) * 0.8, 0.7 + Math.floor(k / 3) * 0.85, HOUSE[2] + 0.81]}>
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial color="#9fd8ff" emissive={i === 12 ? "#ffd23a" : "#3a6aa0"} emissiveIntensity={i === 12 ? 0.6 : 0.25} />
        </mesh>
      ))}
      <Label p={[HOUSE[0], 3.25, HOUSE[2] + 0.4]} text={["PUBLIC HOUSING"]} w={1.9} h={0.32} bg={PAL.night} fg="#ffd23a" />
      {/* Saver's income bar, the rent slice, the cap line */}
      <BigBlock p={BAR} size={[0.9, BAR_H, 0.6]} color={PAL.cash} text="" />
      <Label p={[BAR[0], BAR_H - 0.25, BAR[2] + 0.31]} text={["INCOME"]} w={0.8} h={0.2} bg={PAL.cash} fg="#fff4c8" />
      {slice > 0 ? <BigBlock p={[BAR[0], 1.2 * sliceDrop, BAR[2] + 0.06]} size={[0.96, (BAR_H * slice) / 100, 0.62]} color={PAL.debt} text={`RENT ${Math.round(slice)}%`} glow={0.2} /> : null}
      {i >= 6 && i <= 11 ? (
        <group position={[BAR[0], (BAR_H * cap) / 100, BAR[2] + 0.36]}>
          <mesh><boxGeometry args={[1.25, 0.05, 0.05]} /><meshStandardMaterial color="#ffd23a" emissive="#ffd23a" emissiveIntensity={i === 8 ? 1.2 : 0.6} /></mesh>
          <Label p={[0.85, 0, 0]} text={[`MAX ${Math.round(cap)}%`]} w={0.55} h={0.18} bg="#ffd23a" fg={PAL.ink} />
        </group>
      ) : null}
      {loop || i === 2 ? <Label p={[P_SV[0], 2.15 + 0.05 * Math.sin(t * 3), P_SV[2]]} text={["?"]} w={0.3} h={0.36} bg="#ffd23a" fg={PAL.ink} /> : null}
      {i === 2 ? <Label p={[BAR[0], (BAR_H * 0.3) + 0.25, BAR[2] + 0.4]} text={["WHO SAID?"]} w={0.7} h={0.2} bg="#fff4c8" fg={PAL.debt} /> : null}
      {/* the calendar on a post */}
      <mesh position={[CAL[0], 0.7, CAL[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <FlipCalendar p={CAL} title="YEAR" value={yr} prev={i === 10 && tau >= 0.45 ? "1969" : undefined} flip={i === 10 ? ss(0.45, 0.75, tau) : 1} sub={yr === "1969" ? "CAP 25%" : "CAP 30%"} />
      {/* the SPEND THIS target sign (struck out) */}
      <mesh position={[TARGET[0], 0.65, TARGET[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.3, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <Label p={[TARGET[0], 1.55, TARGET[2]]} r={[0, 0.25, 0]} text={["TARGET:", "SPEND IT!"]} w={0.9} h={0.5} bg="#fff4c8" fg={PAL.debt} strike={strike} />
      {i === 9 ? <Label p={[TARGET[0], 1.05, TARGET[2] + 0.05]} r={[0, 0.25, 0]} text={["A LIMIT, NOT A TARGET"]} w={1.0} h={0.16} bg={PAL.cash} fg="#fff4c8" /> : null}
      {i === 12 ? <Label p={[HOUSE[0] + 1.2, 2.2 + 0.4 * ss(0.1, 0.8, tau), HOUSE[2] + 1.4 + 2.0 * ss(0.1, 0.8, tau)]} text={["30%"]} w={0.6} h={0.3} bg={PAL.debt} fg="#fff4c8" glow={0.4} /> : null}
      {i === 13 ? ROW.map((p, k) => <Label key={k} p={[p[0], k === 2 ? 1.45 : 1.85, p[2] + 0.1]} text={["30%"]} w={0.4} h={0.2} bg={PAL.debt} fg="#fff4c8" />) : null}
      {i === 14 ? <Label p={[BAR[0], BAR_H + 0.6, BAR[2] + 0.1]} text={["RULE OF THUMB"]} w={1.6} h={0.36} bg={PAL.night} fg="#ffd23a" glow={0.5} /> : null}
      {/* the $4,000 month and its 30 % */}
      {i >= 15 && i <= 16 ? (
        <>
          <BigBlock p={STACK} size={[0.75, 1.4, 0.6]} color={PAL.cash} text="$2,800" />
          <BigBlock p={[STACK[0] + 0.5 * lift, 1.4 + 0.5 * lift, STACK[2] + 0.2 * lift]} size={[0.75, 0.6, 0.6]} color={PAL.debt} text="$1,200" glow={0.3 * lift} />
          <Label p={[STACK[0], 2.75, STACK[2]]} text={[i === 16 ? "30% = $1,200 RENT" : "$4,000 / MONTH"]} w={1.2} h={0.24} bg="#fff4c8" fg={i === 16 ? PAL.debt : PAL.ink} />
        </>
      ) : null}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const RED = "#ff6a5f", GOLD = "#ffd23a";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  void t;
  if (i === 15 || i === 16) return { lines: [{ text: "$4,000 × 30% = $1,200", color: GOLD }, { text: "EXAMPLE MONTH", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  if (i >= 3 && i <= 9) return { lines: [{ text: "1969: RENT CAP 25%", color: GOLD }, { text: "PUBLIC HOUSING", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  if (i === 10 || i === 11) return { lines: [{ text: "1981: CAP 25% → 30%", color: GOLD }, { text: "PUBLIC HOUSING", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  if (i >= 12 && i <= 14) return { lines: [{ text: "30% = RULE OF THUMB", color: GOLD }, { text: "FOR EVERYONE", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  if (i === 17) return { lines: [{ text: "30%: A ROUGH GUIDE", color: GOLD }, { text: "NOT A LAW OF NATURE", color: "#ffffff", size: 42 }], accent: "#ffe27a" };
  return { lines: [{ text: "RENT = 30%?", color: RED }, { text: "WHO DECIDED?", color: "#ffffff", size: 44 }], accent: "#ff8a7a" };
};

export const RENT_SPEC: FinSpec = {
  slug: "rent-thirty-rule",
  shots: RENT_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "NLIHC · HARVARD JCHS",
  bg: "#6aa6f2",
};

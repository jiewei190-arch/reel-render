// same-car-more: "Same car, 4,700 dollars more." Two identical red cars on a sunny street: the 3-year loan and the 7-year
// loan. Stated example: $30,000 at 7 % APR -> 3 years $926/month, $3,347 interest; 7 years $453/month, $8,034 interest
// (+$4,686 ≈ $4,700). Lender's booth, two interest piles, the CFPB line.
import React from "react";
import { LENDER, SAVER, SPENDER } from "../library/characters";
import { ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/same_car_more.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, CoinPile, Ground, Label, PAL, TollBooth } from "./props";
import { body, Car, fitted, manual } from "./f2kit";
import SCRIPT from "./scripts/same_car_more";

const S = { spender: 1.0, saver: 1.0, lender: 1.15 };
const CAR3: V3 = [-1.0, 0, -1.2];
const CAR7: V3 = [1.0, 0, -1.2];
const P_SP: V3 = [0.0, 0, 0.75];
const P_SV: V3 = [-2.15, 0, -0.2];
const BOOTH: V3 = [3.7, 0, -2.6];
const P_LD: V3 = [3.0, 0, -1.55];
const PILE3: V3 = [2.0, 0, -4.2];
const PILE7: V3 = [4.6, 0, -4.4];
const SIGN: V3 = [-2.3, 0, -2.8];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const D = Object.fromEntries(PLAN.map((p) => [p.id, p.end - p.t])) as Record<string, number>;
const idx = (id: string) => parseInt(id.slice(1), 10);
const carPts = (c: V3): V3[] => [[c[0] - 0.8, 0, c[2] + 1.3], [c[0] + 0.8, 1.6, c[2] - 1.3]];

const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: fitted([...carPts(CAR3), ...carPts(CAR7), ...body(P_SP, S.spender), [0, 2.4, CAR3[2]]], 0, 0.22, D.S01, { mood: "earth", sky: true, fov: 56 }),
  S02: fitted([...carPts(CAR7), [CAR7[0], 2.5, CAR7[2]]], -12, 0.2, D.S02, { mood: "earth", sky: true }),
  S03: fitted(body(P_SP, S.spender, true), 10, 0.05, D.S03, { mood: "earth", sky: true, face: 0.5 }),
  S04: fitted([...body(P_LD, S.lender), [BOOTH[0], 2.1, BOOTH[2]]], -16, 0.1, D.S04, { mood: "earth", sky: true }),
  S05: manual([BOOTH[0] - 0.1, 1.55, BOOTH[2] + 0.5], -24, 1.4, 0.05, { mood: "earth", sky: true }),
  S06: manual([P_LD[0] - 0.25, 1.35, P_LD[2] + 0.45], -10, 1.0, 0.0, { mood: "earth", sky: true }),
  S07: fitted([...body(P_SV, S.saver), ...carPts(CAR3)], 18, 0.12, D.S07, { mood: "earth", sky: true }),
  S08: manual([CAR3[0], 1.3, CAR3[2] + 0.9], 8, 1.25, 0.12, { mood: "earth", sky: true }),
  S09: fitted([[PILE3[0] - 0.8, 0, PILE3[2]], [PILE3[0] + 0.8, 1.4, PILE3[2]]], 10, 0.25, D.S09, { mood: "earth", sky: true }),
  S10: fitted([...carPts(CAR3), [CAR3[0], 0, CAR3[2] - 3.5]], 24, 0.25, D.S10, { mood: "earth", sky: true }),
  S11: fitted([...body([1.95, 0, 0.3], S.spender), ...carPts(CAR7)], -16, 0.12, D.S11, { mood: "earth", sky: true }),
  S12: manual([CAR7[0], 1.3, CAR7[2] + 0.9], -6, 1.25, 0.12, { mood: "earth", sky: true }),
  S13: fitted(body([1.95, 0, 0.3], S.spender, true), -14, 0.05, D.S13, { mood: "earth", sky: true, face: 0.5 }),
  S14: fitted([[BOOTH[0] - 0.7, 0, BOOTH[2]], [PILE7[0] + 1.3, 0, PILE7[2]], [PILE7[0], 2.6, PILE7[2]]], -12, 0.18, D.S14, { mood: "whisper", sky: true }),
  S15: manual([PILE7[0], 1.5, PILE7[2]], -6, 3.2, -0.25, { mood: "whisper", sky: true, fov: 56 }),
  S16: fitted([[PILE3[0] - 0.9, 0, PILE3[2]], [PILE7[0] + 1.4, 0, PILE7[2]], [PILE7[0], 2.6, PILE7[2]]], 0, 0.15, D.S16, { mood: "store", sky: true }),
  S17: manual([(PILE3[0] + PILE7[0]) / 2, 2.0, PILE3[2] + 0.3], 0, 2.2, 0.0, { mood: "store", sky: true }),
  S18: manual([SIGN[0], 1.75, SIGN[2]], 14, 2.1, 0.0, { mood: "store", sky: true }),
  S19: fitted(body([1.95, 0, 0.3], S.spender, true), -20, 0.05, D.S19, { mood: "whisper", sky: true, face: 0.5 }),
  S20: fitted([...carPts(CAR7), [CAR7[0] + 2.5, 0.2, CAR7[2] + 1.8], [CAR7[0] - 2.4, 0.2, CAR7[2] + 1.8]], -6, 0.25, D.S20, { mood: "earth", sky: true }),
  S21: fitted([...carPts(CAR3), ...carPts(CAR7), ...body(P_SP, S.spender), [0, 2.4, CAR3[2]]], 0, 0.22, D.S21, { mood: "earth", sky: true, fov: 56 }),
};
export const SAMECAR_SHOTS = buildShots(PLAN, LENS);

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const i = idx(id);
  const loop = i === 1 || i === 21;
  const actors: React.ReactNode[] = [];
  // Spender: between the cars (hook), then at the 7-year car
  {
    const p: V3 = loop || i <= 3 ? P_SP : [1.95, 0, 0.3];
    let pose: Pose = { ...stand(p[0], p[2], yawTo(p, [0.3, 0, 5]), S.spender), armL: 0.2, armR: 0.2 };
    let emo: Emotion = "curious";
    if (loop) { pose = { ...pose, armR: 2.4, outR: -0.25, headYaw: 0.25 * Math.sin(t * 2) }; emo = "curious"; }
    if (i === 3) { pose = { ...pose, headYaw: 0.4 * Math.sin(tau * 9), ant: 1 }; emo = "shock"; }
    if (i === 13) { pose = { ...pose, armL: 0.9, armR: 0.9, outL: 0.3 + 0.2 * Math.sin(tau * 10), outR: 0.3 }; emo = "joy"; }
    if (i === 19) { pose = { ...pose, headPitch: 0.25, ant: -1 }; emo = "sad"; }
    if (!(i >= 4 && i <= 10) && !(i >= 14 && i <= 18)) actors.push(<Act key="sp" look={SPENDER} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} />);
  }
  if (i >= 7 && i <= 9) {
    const pose: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, [-0.5, 0, 5]), S.saver), armR: i === 7 ? 1.35 : 0.2, outR: 0.2 };
    actors.push(<Act key="sv" look={SAVER} pose={pose} emotion="happy" s={S.saver} t={t} seed={4} />);
  }
  if (i >= 4 && i <= 6) {
    let pose: Pose = { ...stand(P_LD[0], P_LD[2], yawTo(P_LD, [1.5, 0, 5]), S.lender), armL: 0.2, armR: 0.2 };
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    if (i === 4) { pose = { ...pose, armR: 1.2, outR: -0.05 }; held = { side: "R", node: <BigBlock p={[0, -0.05, 0.08]} size={[0.5, 0.22, 0.2]} color={PAL.cash} text="$30,000" /> }; }
    if (i === 6) { pose = { ...pose, armL: 1.3 }; held = { side: "L", node: <Label p={[0, 0.1, 0.05]} text={["EXAMPLE", "RATE"]} w={0.32} h={0.2} /> }; }
    actors.push(<Act key="ld" look={LENDER} pose={pose} emotion="sly" s={S.lender} t={t} seed={5} held={held} />);
  }
  // cars: the 3-year one drives off in S10
  const drive = i === 10 ? ss(0.1, 1.0, tau) : i > 10 && i < 21 ? 1 : 0;
  const car3: V3 = [CAR3[0], 0, CAR3[2] - 4.5 * drive];
  const pile3 = i >= 9 && !loop ? 0.75 : 0;
  const pile7 = i >= 14 && !loop ? (i === 14 ? 0.3 + 1.5 * ss(0, 1.2, tau) : 1.8) : 0;
  const stretch = i === 20 ? ss(0.1, 1.1, tau) : 0;
  return (
    <>
      <Ground road roadW={4.4} />
      <Car p={car3} yaw={0} color={PAL.debt} />
      <Car p={CAR7} yaw={0} color={PAL.debt} />
      {drive < 0.9 ? <Label p={[car3[0], 1.65, car3[2]]} text={["3-YEAR", "LOAN"]} w={0.66} h={0.32} bg={PAL.cash} fg="#fff4c8" /> : null}
      <Label p={[CAR7[0], 1.65, CAR7[2]]} text={["7-YEAR", "LOAN"]} w={0.66} h={0.32} bg={PAL.debt} fg="#fff4c8" />
      {loop || i === 2 ? <Label p={[CAR7[0], 2.2 + 0.05 * Math.sin(t * 3), CAR7[2] + 0.3]} text={["+$4,700"]} w={0.8} h={0.3} bg="#16121c" fg="#ff6a5f" glow={0.6} /> : null}
      {i === 8 ? <Label p={[CAR3[0], 1.25, CAR3[2] + 1.0]} r={[-0.3, 0, 0]} text={["$926", "A MONTH"]} w={0.5} h={0.3} bg={PAL.cash} fg="#fff4c8" /> : null}
      {i === 12 ? <Label p={[CAR7[0], 1.25, CAR7[2] + 1.0]} r={[-0.3, 0, 0]} text={["$453", "A MONTH"]} w={0.5} h={0.3} bg={PAL.coin} fg={PAL.ink} /> : null}
      <Label p={[-1.4, 0.3, 1.6]} r={[-0.5, 0.15, 0]} text={["EXAMPLE: $30,000 · 7% APR"]} w={0.9} h={0.14} />
      <TollBooth p={BOOTH} yaw={-0.5} display={["7% APR"]} />
      {pile3 > 0 ? <><CoinPile p={PILE3} r={0.6} h={pile3} coins={50} /><Label p={[PILE3[0], pile3 + 0.35, PILE3[2] + 0.4]} text={["$3,347", "3 YEARS"]} w={0.55} h={0.3} bg={PAL.cash} fg="#fff4c8" /></> : null}
      {pile7 > 0 ? <><CoinPile p={PILE7} r={pile7 * 0.75} h={pile7} coins={90} /><Label p={[PILE7[0], pile7 + 0.4, PILE7[2] + 0.5]} text={["$8,034", "7 YEARS"]} w={0.6} h={0.32} bg={PAL.debt} fg="#fff4c8" /></> : null}
      {i === 17 ? <Label p={[(PILE3[0] + PILE7[0]) / 2, 2.0, PILE3[2] + 0.4]} text={["+$4,686", "(≈ $4,700)"]} w={0.7} h={0.38} bg="#16121c" fg="#ff6a5f" glow={0.5} /> : null}
      {/* the CFPB line on a plain sign */}
      <mesh position={[SIGN[0], 0.8, SIGN[2] - 0.05]} castShadow><boxGeometry args={[0.1, 1.6, 0.1]} /><meshStandardMaterial color="#9aa3b0" /></mesh>
      <Label p={[SIGN[0], 1.85, SIGN[2]]} text={["CFPB:", "A LONGER LOAN", "MEANS MORE INTEREST"]} w={1.3} h={0.62} bg="#fff4c8" />
      {/* the stretching loan bar (S20) */}
      {i === 20 ? (
        <>
          <mesh position={[CAR7[0] - 2.4 + 2.4 * (0.43 + 0.57 * stretch), 0.12, CAR7[2] + 1.8]} castShadow>
            <boxGeometry args={[4.8 * (0.43 + 0.57 * stretch), 0.16, 0.25]} />
            <meshStandardMaterial color={PAL.debt} emissive={PAL.debt} emissiveIntensity={0.3} />
          </mesh>
          <Label p={[CAR7[0] - 2.4 + 4.8 * (0.43 + 0.57 * stretch) + 0.35, 0.45, CAR7[2] + 1.8]} text={[stretch > 0.95 ? "7 YRS" : "3 YRS →"]} w={0.5} h={0.18} />
        </>
      ) : null}
      {actors}
    </>
  );
};

const GREEN = "#5ff08a", RED = "#ff6a5f";
const counter = (t: number, shot: FinShot): CounterState => {
  const i = idx(shot.id);
  if (i >= 7 && i <= 10) return { lines: [{ text: "3 YEARS · $926/MO", color: GREEN }, { text: "INTEREST $3,347", color: "#ffffff", size: 42 }], accent: "#7dffb0" };
  if (i >= 11 && i <= 15) return { lines: [{ text: "7 YEARS · $453/MO", color: RED }, { text: i >= 14 ? "INTEREST $8,034" : "FEELS CHEAPER…", color: "#ffffff", size: 42 }], accent: "#ff8a7a" };
  if (i >= 16 && i <= 20) return { lines: [{ text: "SAME CAR: +$4,686", color: RED }, { text: "LOWER PAYMENT, BIGGER TOTAL", color: "#ffffff", size: 38 }], accent: "#ff8a7a" };
  if (i >= 4 && i <= 6) return { lines: [{ text: "$30,000 AT 7% APR", color: "#ffffff" }, { text: "EXAMPLE RATE", color: "#ffffff", size: 40 }], accent: "#7fefff" };
  return { lines: [{ text: "SAME CAR: +$4,700", color: RED }, { text: "3-YEAR vs 7-YEAR LOAN", color: "#ffffff", size: 40 }], accent: "#ff8a7a" };
};

export const SAMECAR_SPEC: FinSpec = {
  slug: "same-car-more",
  shots: SAMECAR_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: () => "EXAMPLE",
  bg: "#6aa6f2",
};

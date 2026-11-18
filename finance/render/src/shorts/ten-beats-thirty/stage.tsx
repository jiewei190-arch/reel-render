// ten-beats-thirty: two garden plots on the suburb lawn. Saver (left) and Spender (right) each have a big jar on a
// podium with an age sign and a balance counter. Saver deposits $200 a month from 25 to 35 and stops (deck chair);
// Spender deposits from 35 to 65; a board shows the hypothetical steady 7 %; at 65 the jars rise like columns and
// Saver's ends taller. The figures follow finance/shorts/ten-beats-thirty/sources.md (deposits at the start of each
// month, 7 %/12 a month): Saver ≈ $282,600, Spender ≈ $245,400.
import React from "react";
import * as plan from "./plan.gen";
import type { Actor, Lens, ShortDef } from "../../fin/engine";
import { fitLens, lens } from "../../fin/engine";
import { SAVER, SPENDER, PENNY, FIN_SCALE, FIN_PAL, sit, walk } from "../../library/characters";
import { Outdoor } from "../../fin/sets";
import { ChartBoard, CoinStack, PostSign, Placard, DeckChair, BigClock, StackRow } from "../../fin/props";
import { Jar, Podium } from "../../library/props";
import { stand, gesture, lift, SHOCK, SHRUG, HOLD_R } from "../../fin/poses";
import { T, idx, money } from "../../fin/util";
import { ss } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";
import type { Held } from "../../blocky/Blocky";

const P = plan as unknown as ShortDef["plan"];
const S = (id: string) => T(P, id);
const sv = FIN_SCALE.saver, sp = FIN_SCALE.spender, pn = FIN_SCALE.penny;
const JA: V3 = [1.7, 0, 0.6]; // Saver's podium + jar
const JB: V3 = [4.5, 0, 0.6]; // Spender's
const POD_H = 0.55;
const SVP: V3 = [JA[0] - 0.8, 0, JA[2] + 0.55];
const SPP: V3 = [JB[0] + 0.8, 0, JB[2] + 0.55];
const BOARD: V3 = [3.1, 0, -0.35];

// ---- the stated example (start-of-month deposits, 7 %/12 a month) ----
const I = 0.07 / 12;
const fv = (n: number) => (n <= 0 ? 0 : 200 * ((1 + I) ** n - 1) / I * (1 + I));
const SAVER_65 = fv(120) * (1 + I) ** 360; // 282,607
const SPENDER_65 = fv(360); // 245,417
/** age shown on the signs */
const ageA = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 2 || i === 23) return 25;
  if (i <= 4) return 25 + 10 * ss(S("S03"), S("S05"), t);
  if (i <= 14) return 35;
  return 65;
};
const ageB = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 6 || i === 23) return 35;
  if (i <= 8) return 35 + 30 * ss(S("S07"), S("S09") + 0.6, t);
  return 65;
};
/** what the jars show: deposits so far (no growth) until the reveal, then the hypothetical value at 65 */
const balA = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 2 || i === 23) return 0;
  if (i <= 4) return 200 * Math.round((ageA(t, id) - 25) * 12);
  if (i <= 14) return 24000;
  return 24000 + (SAVER_65 - 24000) * (i >= 17 ? 1 : ss(S("S15"), S("S17"), t));
};
const balB = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 6 || i === 23) return 0;
  if (i <= 8) return 200 * Math.round((ageB(t, id) - 35) * 12);
  if (i <= 14) return 72000;
  return 72000 + (SPENDER_65 - 72000) * (i >= 18 ? 1 : ss(S("S15"), S("S18"), t));
};
/** jar fill height (m) from a balance (log-ish so both stay readable) */
const fillOf = (v: number) => (v <= 0 ? 0 : 0.04 + 0.5 * Math.min(1, v / 80000));
const columnOf = (v: number) => (v <= 80000 ? 1 : 1 + 2.4 * ((v - 80000) / (SAVER_65 - 80000)));

const F = (keys: string[], yaw: number, dy: number, o: Parameters<typeof fitLens>[4] = {}) => fitLens("garden", keys, yaw, dy, o);
const JAR_TOP = (p: V3, k = 1): V3 => [p[0], POD_H + 0.75 * k, p[2]];
const lenses: Record<string, Lens> = {
  S01: F(["saver", "spender"], 0, 0.1, { fov: 54, face: 0.5, extra: [JAR_TOP(JA), JAR_TOP(JB), [JA[0], 2.4, JA[2] - 0.3]] }),
  S02: lens("garden", [JA[0], POD_H + 0.35, JA[2]], 12, 1.6, 0.2, 48, 0.5),
  S03: F(["saver"], 15, 0.06, { face: 0.5, extra: [JAR_TOP(JA), [JA[0], 2.4, JA[2] - 0.3]] }),
  S04: lens("garden", [JA[0], POD_H + 0.3, JA[2]], -10, 1.5, 0.25, 48, 0.5),
  S05: F(["saver"], 20, 0.06, { face: 0.5, extra: [[JA[0], 2.4, JA[2] - 0.3]] }),
  S06: F(["saver"], 25, 0.1, { fov: 52, face: 0.5, extra: [JAR_TOP(JA)] }),
  S07: F(["spender"], -18, 0.06, { face: 0.5, extra: [[JB[0], 2.4, JB[2] - 0.3]] }),
  S08: lens("garden", [JB[0], POD_H + 0.3, JB[2]], 10, 1.5, 0.25, 48, 0.5),
  S09: F(["spender"], -12, 0.08, { fov: 52, face: 0.5, extra: [JAR_TOP(JB), [JB[0], 2.4, JB[2] - 0.3]] }),
  S10: lens("garden", [JA[0], POD_H + 0.95, JA[2] + 0.35], 8, 1.4, 0.1, 48, 0.5),
  S11: F(["spender"], -10, 0.05, { face: 0.5, extra: [[JB[0], POD_H + 1.2, JB[2] + 0.35]] }),
  S12: lens("garden", [BOARD[0], 1.5, BOARD[2]], 0, 3.0, 0.15, 52, 0.48),
  S13: lens("garden", [BOARD[0], 1.55, BOARD[2]], 6, 2.0, 0.05, 50, 0.48),
  S14: F(["saver", "spender"], 0, 0.1, { fov: 54, face: 0.5, extra: [JAR_TOP(JA), JAR_TOP(JB)] }),
  S15: F(["saver", "spender"], 0, 0.06, { fov: 54, face: 0.52, extra: [JAR_TOP(JA, 2.2), JAR_TOP(JB, 2.0)] }),
  S16: F(["saver"], 18, -0.12, { fov: 56, face: 0.5, extra: [JAR_TOP(JA, 3.6)] }),
  S17: lens("garden", [JA[0], POD_H + 1.35, JA[2] + 0.35], 10, 1.5, 0.05, 48, 0.5),
  S18: lens("garden", [JB[0], POD_H + 1.35, JB[2] + 0.35], -10, 1.5, 0.05, 48, 0.5),
  S19: F(["spender", "saver"], -6, 0.08, { fov: 54, face: 0.5 }),
  S20: lens("garden", [BOARD[0], 1.5, BOARD[2]], -6, 2.6, 0.1, 50, 0.48),
  S21: lens("garden", [BOARD[0], 1.5, BOARD[2]], 8, 1.9, 0.05, 50, 0.48),
  S22: F(["saver"], 16, 0.04, { fov: 54, face: 0.5, extra: [[JA[0], 3.3, JA[2]]] }),
  S23: F(["saver", "spender"], 0, 0.1, { fov: 54, face: 0.5, extra: [JAR_TOP(JA), JAR_TOP(JB), [JA[0], 2.4, JA[2] - 0.3]] }),
};

const bundle: Held = { side: "R", node: <CoinStack p={[0, -0.02, 0.06]} n={6} /> };
const actors = (t: number, id: string): Actor[] => {
  const i = idx(id);
  const out: Actor[] = [];
  // Saver
  let a = stand(SVP[0], SVP[2], 0.45, sv);
  let ae: Actor["emotion"] = "happy";
  let ah: Held | undefined;
  if (i === 3 || i === 23) { a = gesture(a, { armR: 1.5, outR: -0.2 }, t, S(id) + 0.1, 0.7); ah = bundle; }
  if (i === 5) { a = gesture(a, { armL: 0.9, armR: 0.9, outL: 0.3, outR: 0.3 }, t, S("S05"), 0.6); ae = "joy"; }
  if (i >= 6 && i <= 14) { a = lift(sit(SVP[0] - 0.45, SVP[2] + 0.15, 0.6), 0.29); ae = "happy"; }
  if (i >= 15 && i <= 19) { a = stand(SVP[0], SVP[2], 0.45, sv); ae = "joy"; }
  if (i === 17) a = gesture(a, { armR: 2.4, outR: 0.4, headPitch: 0.05 }, t, S("S17"), 0.7);
  if (i === 22) { a = gesture(a, { armL: 2.6, armR: 2.6, outL: 0.2, outR: 0.2 }, t, S("S22"), 0.8); ae = "joy"; }
  out.push({ key: "saver", look: SAVER, pose: a, emotion: ae, s: sv, held: ah, seed: 5 });
  // Spender
  let b = stand(SPP[0], SPP[2], -0.45, sp);
  let be: Actor["emotion"] = "sly";
  let bh: Held | undefined;
  if (i >= 7 && i <= 9) { b = gesture(b, { armL: 1.5, outL: -0.2 }, t, S(id) + 0.1, 0.7); bh = { side: "L", node: <CoinStack p={[0, -0.02, 0.06]} n={6} /> }; be = i === 9 ? "sad" : "happy"; }
  if (i === 9) b = { ...b, ant: -1 };
  if (i === 11) { b = gesture(b, { armR: 1.0, outR: 0.4 }, t, S("S11"), 0.7); be = "sly"; }
  if (i === 18 || i === 19) { b = gesture(b, SHOCK, t, S("S18"), 0.8); be = "shock"; }
  if (i >= 20 && i <= 21) { b = gesture(b, SHRUG, t, S("S20"), 0.8); be = "curious"; }
  out.push({ key: "spender", look: SPENDER, pose: b, emotion: be, s: sp, held: bh, seed: 11 });
  // Penny the courier (S04, S08)
  if (i === 4 || i === 8) {
    const tgt = i === 4 ? JA : JB;
    let c = walk(tgt[0] + (i === 4 ? 1.2 : -1.2), tgt[2] + 0.55, i === 4 ? -Math.PI / 2 : Math.PI / 2, t, S(id), 0.45, pn);
    c = gesture(c, HOLD_R, t, S(id), 0.4);
    out.push({ key: "penny", look: PENNY, pose: c, emotion: "joy", s: pn, held: bundle, seed: 7 });
  }
  return out;
};

const JarCol: React.FC<{ p: V3; v: number; k: number; glow: number; lifted?: number }> = ({ p, v, k, glow, lifted = 0 }) => (
  <group position={[p[0], POD_H + lifted, p[2]]} scale={[2, 2 * k, 2]}>
    <Jar p={[0, 0, 0]} label={false}>
      <mesh position={[0, fillOf(v) / 2 / 2 + 0.01, 0]}>
        <cylinderGeometry args={[0.135, 0.135, fillOf(v) / 2, 24]} />
        <meshStandardMaterial color="#f0c040" roughness={0.3} emissive="#f0c040" emissiveIntensity={glow} />
      </mesh>
    </Jar>
  </group>
);

const props = (t: number, id: string): React.ReactNode => {
  const i = idx(id);
  const va = balA(t, id), vb = balB(t, id);
  const ka = i >= 15 && i <= 22 ? columnOf(va) : 1;
  const kb = i >= 15 && i <= 22 ? columnOf(vb) : 1;
  const glow = i >= 13 && i <= 22 ? 0.25 : 0;
  const drop = i === 12 ? 1 - ss(S("S12"), S("S12") + 0.6, t) : i >= 12 && i <= 21 ? 0 : -1;
  const lifted = i === 22 ? 0.9 * ss(S("S22") + 0.2, S("S22") + 1.0, t) : 0;
  return (
    <Outdoor>
      <Podium p={JA} h={POD_H} color="#7fe3b8" />
      <Podium p={JB} h={POD_H} color="#ff9a8a" />
      <JarCol p={JA} v={va} k={ka} glow={glow} lifted={lifted} />
      <JarCol p={JB} v={vb} k={kb} glow={glow} />
      <PostSign p={[JA[0] - 0.55, 0, JA[2] - 0.45]} text={[i <= 2 || i === 23 ? "SAVES 10 YRS" : `AGE ${Math.round(ageA(t, id))}`]} bg="#7fe3b8" />
      <PostSign p={[JB[0] + 0.55, 0, JB[2] - 0.45]} text={[i <= 2 || i === 23 ? "SAVES 30 YRS" : `AGE ${Math.round(ageB(t, id))}`]} bg="#ff9a8a" />
      {/* balance placards on the podium fronts */}
      <Placard p={[JA[0], POD_H * 0.5, JA[2] + 0.5]} text={[money(va, false)]} w={0.62} h={0.26} bg="#1f9e4f" fg="#fff4c8" />
      <Placard p={[JB[0], POD_H * 0.5, JB[2] + 0.5]} text={[money(vb, false)]} w={0.62} h={0.26} bg="#c42424" fg="#fff4c8" />
      {/* deposits put in (S10-S11): 3 stacks vs 9 */}
      {i >= 10 && i <= 11 ? (
        <>
          <StackRow p={[JA[0], POD_H, JA[2] + 0.32]} k={3} n={8} gap={0.17} />
          <Placard p={[JA[0], POD_H + 0.95, JA[2] + 0.35]} text={["PUT IN", "$24,000"]} w={0.6} h={0.36} />
          <StackRow p={[JB[0], POD_H, JB[2] + 0.32]} k={9} n={8} gap={0.1} />
          <Placard p={[JB[0], POD_H + 0.95, JB[2] + 0.35]} text={["PUT IN", "$72,000"]} w={0.6} h={0.36} />
        </>
      ) : null}
      {i >= 15 && i <= 19 ? (
        <>
          <Placard p={[JA[0], POD_H + 1.3, JA[2] + 0.35]} text={["≈ $282,600"]} w={0.62} h={0.24} bg="#1f9e4f" fg="#fff4c8" glow={0.3} />
          <Placard p={[JB[0], POD_H + 1.3, JB[2] + 0.35]} text={["≈ $245,400"]} w={0.62} h={0.24} bg="#c42424" fg="#fff4c8" glow={0.3} />
        </>
      ) : null}
      {i >= 6 && i <= 14 ? <DeckChair p={[SVP[0] - 0.45, 0, SVP[2] + 0.15]} yaw={0.6 + Math.PI} /> : null}
      {drop >= 0 ? <ChartBoard p={[BOARD[0], 3 * drop, BOARD[2]]} title="EXAMPLE: 7%/YR STEADY" values={[0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.96]} draw={i === 13 ? ss(S("S13"), S("S13") + 1.0, t) : i >= 14 ? 1 : 0} wobble={i >= 20 ? 0.6 + 0.4 * Math.sin(t * 4) : 0} stamp={i === 21 ? "NOT GUARANTEED" : undefined} color={FIN_PAL.cash} w={1.7} /> : null}
      {i === 22 ? <BigClock p={[JA[0], 2.3 + 0.9 * ss(S("S22") + 0.2, S("S22") + 1.0, t), JA[2] + 0.1]} t={t} s={0.8} spin={6} /> : null}
    </Outdoor>
  );
};

const counter = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 2 || i === 23) return { label: "$200/MO · EXAMPLE 7%/YR", value: "10 YRS vs 30", color: FIN_PAL.cashLight, sub: "SAVER vs SPENDER" };
  if (i <= 6) return { label: `SAVER · AGE ${Math.round(ageA(t, id))} · PUT IN`, value: money(balA(t, id), false), color: FIN_PAL.cashLight, sub: i >= 5 ? "STOPS SAVING AT 35" : "$200 A MONTH" };
  if (i <= 9) return { label: `SPENDER · AGE ${Math.round(ageB(t, id))} · PUT IN`, value: money(balB(t, id), false), color: "#ff6a5a", sub: "$200 A MONTH" };
  if (i <= 11) return { label: "PUT IN", value: i === 10 ? "$24,000" : "$72,000", color: i === 10 ? FIN_PAL.cashLight : "#ff6a5a", since: S(id), sub: i === 10 ? "SAVER" : "SPENDER" };
  if (i <= 14) return { label: "HYPOTHETICAL", value: "7%/YR STEADY", color: FIN_PAL.coin, sub: "AN EXAMPLE, NOT A PREDICTION" };
  if (i <= 19) return { label: "AT 65 · SAVER", value: `≈ ${money(balA(t, id), false)}`, color: FIN_PAL.cashLight, sub: `SPENDER ≈ ${money(i >= 18 ? SPENDER_65 : balB(t, id), false)}` };
  if (i <= 21) return { label: "REAL RETURNS", value: "VARY", color: "#ff6a5a", sub: "NOTHING IS GUARANTEED" };
  return { label: "THE DIFFERENCE", value: "TIME", color: FIN_PAL.coin, sub: "10 EARLY YEARS" };
};

export const TEN_BEATS_THIRTY: ShortDef = { slug: "ten-beats-thirty", comp: "TenBeatsThirty", plan: P, lenses, actors, props, counter };

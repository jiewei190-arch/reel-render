// penny-doubles: the coin hall. Teller (on a hidden box) behind the counter offers a $1,000,000 case and ONE penny;
// Penny (kid) picks the penny, Spender grabs the case. The penny doubles each "day": a stack, a jar, the shelves, a
// pile taller than the counter, a golden mountain with Penny on the summit. The loop shot repeats S01's lens and state.
import React from "react";
import * as plan from "./plan.gen";
import type { Actor, Lens, ShortDef } from "../../fin/engine";
import { orbit } from "../../fin/engine";
import { PENNY, SPENDER, TELLER, SAVER, FIN_SCALE, FIN_PAL } from "../../library/characters";
import { Hall, HALL } from "../../fin/sets";
import { Penny, CoinStack, CoinPile, CashCase, WallCalendar, Receipt, Bill, Coin, Placard } from "../../fin/props";
import { Jar } from "../../library/props";
import { stand, lift, gesture, POINT_R, POINT_L, SHRUG, SHOCK, LOOK_UP, HOLD_R, wave } from "../../fin/poses";
import { T, idx, money } from "../../fin/util";
import { hash, ss } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";

const P = plan as unknown as ShortDef["plan"];
const S = (id: string) => T(P, id);
const C = HALL.counter; // [0, 0, -1.4]
const TOP = 1.01; // counter top height
const PENNY_AT: V3 = [-0.6, TOP, C[2] + 0.05];
const CASE_AT: V3 = [0.6, TOP, C[2] + 0.05];
const pS = FIN_SCALE.penny, sS = FIN_SCALE.spender, tS = FIN_SCALE.teller;
const PK: V3 = [-0.75, 0, -0.35]; // Penny's mark
const SP: V3 = [0.95, 0, -0.25]; // Spender's mark (moves to SP2 when the pile grows)
const SP2: V3 = [2.0, 0, 0.9];
const PILE28 = { p: [-1.1, 0, 0.35] as V3, h: 1.35, r: 1.5 };
const PILE30 = { p: [-0.6, 0, -0.5] as V3, h: 2.3, r: 2.6 };
const CAL: V3 = [-2.45, 2.15, HALL.backZ + 0.05];

/** the story day at time t (the counter and every coin prop follow it) */
export const dayAt = (t: number): number => {
  if (t >= S("S21")) return 1;
  if (t >= S("S16")) return 30;
  if (t >= S("S14")) return 28;
  if (t >= S("S12")) return 25;
  if (t >= S("S10")) return Math.round(20 + 5 * ss(S("S10"), S("S12"), t));
  if (t >= S("S07")) return 20;
  if (t >= S("S05")) return 10;
  if (t >= S("S03")) return 2;
  return 1;
};
const valueOf = (d: number) => 0.01 * 2 ** (d - 1);

const L = (subj: V3, yaw: number, dist: number, dy: number, fov = 50, face = 0.42, extra: Partial<Lens> = {}): Lens => ({ subj, off: orbit(yaw, dist, dy), fov, face, set: "hall", ...extra });
/** a fitted lens: direction (yaw, elevation ratio dy per m), solved distance; subj = the fitted group's centre unless given */
const F = (keys: string[], yaw: number, dy: number, o: { fov?: number; face?: number; bust?: boolean; subj?: V3; extra?: V3[]; shutter?: number } = {}): Lens => ({
  subj: o.subj, off: orbit(yaw, 1, dy), fov: o.fov ?? 50, face: o.face ?? 0.5, set: "hall", shutter: o.shutter,
  fit: { keys, bust: o.bust, extra: o.extra },
});
const SUMMIT: V3 = [PILE30.p[0], PILE30.h, PILE30.p[2]];
const ON_COUNTER: V3[] = [[PENNY_AT[0] - 0.15, TOP, PENNY_AT[2]], [CASE_AT[0] + 0.35, TOP + 0.45, CASE_AT[2]]];
const lenses: Record<string, Lens> = {
  S01: F(["penny", "spender", "teller"], 10, 0.16, { fov: 52, face: 0.55, extra: ON_COUNTER }),
  S02: F(["spender"], -22, 0.05, { bust: true, face: 0.45 }),
  S03: L([PENNY_AT[0], TOP + 0.08, PENNY_AT[2]], 8, 0.85, 0.28, 44, 0.52),
  S04: F(["penny"], 32, -0.04, { fov: 54, face: 0.5, extra: [[CAL[0], CAL[1] + 0.65, CAL[2]], [CAL[0] - 0.5, CAL[1] - 0.6, CAL[2]]] }),
  S05: F(["penny"], 24, 0.12, { fov: 54, face: 0.55, extra: [[CAL[0], CAL[1] + 0.5, CAL[2]], [PENNY_AT[0], TOP, PENNY_AT[2]]] }),
  S06: F(["penny"], 28, 0.05, { bust: true, face: 0.45, extra: [[PENNY_AT[0], TOP + 0.1, PENNY_AT[2]]] }),
  S07: L([PENNY_AT[0], TOP + 0.2, PENNY_AT[2]], 0, 1.35, 0.15, 46, 0.5),
  S08: F(["penny"], 30, 0.05, { bust: true, face: 0.5, extra: [[PENNY_AT[0], TOP + 0.4, PENNY_AT[2]]] }),
  S09: F(["spender", "penny"], -8, 0.12, { fov: 52, face: 0.55 }),
  S10: F(["penny"], 14, 0.02, { bust: true, face: 0.5, shutter: 0.25, extra: [[PENNY_AT[0], TOP + 0.4, PENNY_AT[2]]] }),
  S11: L([PENNY_AT[0], TOP + 0.15, PENNY_AT[2]], 4, 2.0, 0.4, 50, 0.5),
  S12: L([-3.2, 1.0, -0.6], 70, 3.0, 0.45, 54, 0.45),
  S13: F(["spender"], -18, 0.05, { bust: true, face: 0.45 }),
  S14: F(["penny"], 12, -0.05, { fov: 56, face: 0.5, extra: [[PILE28.p[0] - PILE28.r, 0, PILE28.p[2]], [PILE28.p[0] + PILE28.r, 0, PILE28.p[2]], [SP2[0], 1.5, SP2[2]]] }),
  S15: F(["teller"], -14, 0.0, { bust: true, face: 0.45, extra: [[0.25, TOP - 0.6, C[2] + 0.45]] }),
  S16: F(["penny"], 6, 0.25, { fov: 58, face: 0.5, extra: [[PILE30.p[0] - PILE30.r, 0, PILE30.p[2]], [PILE30.p[0] + PILE30.r, 0, PILE30.p[2]]] }),
  S17: F(["penny"], 16, 0.15, { bust: true, face: 0.45, extra: [[SUMMIT[0], SUMMIT[1] - 0.1, SUMMIT[2]]] }),
  S18: F(["spender"], -22, 0.04, { bust: true, face: 0.45 }),
  S19: F(["saver", "penny"], -32, 0.15, { fov: 56, face: 0.5 }),
  S20: L([CAL[0], CAL[1] - 0.1, CAL[2]], 24, 1.7, -0.15, 50, 0.45),
  S21: F(["penny", "spender", "teller"], 10, 0.16, { fov: 52, face: 0.55, extra: ON_COUNTER }),
};

const actors = (t: number, id: string): Actor[] => {
  const i = idx(id);
  const out: Actor[] = [];
  // Teller behind the counter on a hidden box
  let tp = lift(stand(0.25, -2.15, 0, tS), 0.25);
  if (id === "S15") tp = gesture(tp, { armL: 1.1, armR: 1.1, headPitch: 0.25 }, t, S("S15"), 0.7);
  if (id === "S21") tp = gesture(tp, HOLD_R, t, S("S21"), 0.8);
  if (i <= 2) tp = gesture(tp, { armL: 1.0, outL: 0.25, armR: 1.0, outR: 0.25 }, t, 0, 0.8);
  out.push({ key: "teller", look: TELLER, pose: tp, emotion: i === 15 ? "shock" : "happy", s: tS, seed: 3 });
  // Penny
  const onPile = i >= 14 && i <= 20;
  const pm = i >= 16 && i <= 20 ? SUMMIT : i >= 14 ? [PILE28.p[0], PILE28.h, PILE28.p[2]] : PK;
  let pp = stand(pm[0], pm[2], onPile ? 0.15 : 0.35, pS);
  if (onPile) pp = lift(pp, pm[1] - 0.02);
  let pe: Actor["emotion"] = "curious";
  if (i <= 2 || i === 21) { pp = gesture(pp, { armR: 1.3, outR: 0.3, headYaw: -0.4 }, t, i === 21 ? S("S21") : 0.2, 0.8); pe = "happy"; }
  if (id === "S04") { pp = gesture(pp, LOOK_UP, t, S("S04"), 0.6); pe = "curious"; }
  if (id === "S06") { pp = gesture(pp, SHRUG, t, S("S06"), 0.8); pe = "sad"; }
  if (id === "S07" || id === "S08") { pp = gesture(pp, { armR: 1.25, outR: 0.4, headYaw: -0.3 }, t, S("S07"), 0.8); pe = "curious"; }
  if (id === "S09") pe = "sly";
  if (id === "S10" || id === "S11") { pp = gesture(pp, SHOCK, t, S("S10"), 0.8); pe = "shock"; }
  if (i === 12 || i === 13) pe = "joy";
  if (onPile) { pp = wave(pp, t, S(i >= 16 ? "S16" : "S14")); pe = "joy"; }
  if (i >= 16 && i <= 20) pp = gesture(pp, { armL: 2.6, outL: 0.25, ant: 1 }, t, S("S16") + 0.3, 0.9);
  out.push({ key: "penny", look: PENNY, pose: pp, emotion: pe, s: pS, seed: 7 });
  // Spender (holds the case from S02 until it slips in S18)
  const sm = i >= 13 && i <= 20 ? SP2 : SP;
  let sp = stand(sm[0], sm[2], i >= 13 && i <= 20 ? -0.6 : -0.35, sS);
  let se: Actor["emotion"] = "sly";
  const hasCase = i >= 2 && i <= 17;
  if (hasCase) sp = gesture(sp, HOLD_R, t, i === 2 ? S("S02") : 0, 0.7);
  if (i === 1 || i === 21) { sp = gesture(sp, POINT_L, t, i === 21 ? S("S21") + 0.2 : 0.3, 0.8); se = "curious"; }
  if (id === "S06" || id === "S09") { sp = gesture(sp, { armL: 0.9 + 0.25 * Math.sin(t * 6), outL: 0.3 }, t, S(id), 0.7); se = "joy"; }
  if (id === "S12" || id === "S13") { sp = gesture(sp, { headPitch: 0.05, headYaw: 0.5 }, t, S(id), 0.7); se = "curious"; }
  if (i >= 16 && i <= 18) { sp = gesture(sp, SHOCK, t, S("S16"), 0.8); se = "shock"; }
  if (i >= 19 && i <= 20) se = "sad";
  const held = hasCase
    ? { side: "R" as const, node: <CashCase p={[0, -0.18, 0.08]} s={0.7} /> }
    : id === "S06" || id === "S09"
      ? { side: "L" as const, node: <Bill label="CASH" /> }
      : undefined;
  out.push({ key: "spender", look: SPENDER, pose: sp, emotion: se, s: sS, held, seed: 11 });
  // Saver arrives for the half line
  if (i >= 18 && i <= 20) {
    let vp = stand(2.55, -0.55, -1.25, FIN_SCALE.saver);
    vp = gesture(vp, POINT_R, t, S("S18") + 0.2, 0.8);
    out.push({ key: "saver", look: SAVER, pose: vp, emotion: "happy", s: FIN_SCALE.saver, seed: 5 });
  }
  return out;
};

const props = (t: number, id: string): React.ReactNode => {
  const i = idx(id);
  const d = dayAt(t);
  const loop = id === "S21";
  const nCoins = d <= 2 ? d : d === 10 ? 6 : 0;
  const splitK = id === "S03" ? ss(S("S03"), S("S03") + 0.5, t) : 1;
  const pile28 = i >= 14 && i <= 15;
  const pile30 = i >= 16 && i <= 20;
  const flip = id === "S20" ? ss(S("S20") + 0.2, S("S20") + 1.4, t) : 0;
  const shelfFill = d >= 25 && !loop ? 1 : d >= 20 && !loop ? 0.25 * ss(S("S10"), S("S12"), t) : 0;
  return (
    <Hall sign="COIN HALL" shelfFill={shelfFill}>
      <WallCalendar p={CAL} head="30 DAYS" big={`DAY ${d}`} flip={flip} />
      {/* the two offers on the counter (S01 and the loop) */}
      <mesh position={[PENNY_AT[0], TOP + 0.03, PENNY_AT[2]]} castShadow receiveShadow><cylinderGeometry args={[0.13, 0.15, 0.06, 24]} /><meshStandardMaterial color="#efe6ff" roughness={0.4} /></mesh>
      {i <= 1 || loop ? <CashCase p={CASE_AT} s={0.7} /> : null}
      {i <= 2 || loop ? (
        <>
          <Placard p={[PENNY_AT[0] - 0.1, TOP + 0.62, PENNY_AT[2] + 0.2]} text={["1¢"]} w={0.42} h={0.3} bg="#d27a3a" fg="#fff4c8" glow={0.5} />
          <Placard p={[CASE_AT[0] + 0.15, TOP + 0.78, CASE_AT[2] + 0.2]} text={["$1,000,000"]} w={0.66} h={0.26} bg="#1f9e4f" fg="#fff4c8" glow={0.5} />
          <Placard p={[0.0, TOP + 0.7, PENNY_AT[2] + 0.25]} text={["OR"]} w={0.24} h={0.18} bg="#16121c" fg="#ffd23a" />
        </>
      ) : null}
      {/* the doubling coins on Penny's podium */}
      {d <= 2 && id !== "S03" ? <CoinStack p={[PENNY_AT[0], TOP + 0.06, PENNY_AT[2]]} n={d} color="#d27a3a" /> : null}
      {id === "S03" ? (
        <>
          <Penny p={[PENNY_AT[0] - 0.09 * splitK, TOP + 0.06, PENNY_AT[2]]} />
          <Penny p={[PENNY_AT[0] + 0.09 * splitK, TOP + 0.06 + 0.03 * Math.sin(Math.PI * splitK), PENNY_AT[2]]} s={0.6 + 0.4 * splitK} />
        </>
      ) : null}
      {d === 10 ? <CoinStack p={[PENNY_AT[0], TOP + 0.06, PENNY_AT[2]]} n={nCoins} color="#d27a3a" /> : null}
      {d >= 20 && d < 28 && !loop ? (
        <Jar p={[PENNY_AT[0], TOP + 0.06, PENNY_AT[2]]} label={false}>
          <CoinStack p={[0, 0.02, 0]} n={7 + Math.round(6 * ss(S("S10"), S("S11"), t))} color="#d27a3a" seed={2} />
        </Jar>
      ) : null}
      {/* the burst: coins tumbling over the counter (S11), a small pile on the counter from day 25 */}
      {id === "S11" ? Array.from({ length: 14 }, (_, k) => {
        const u = Math.min(1, Math.max(0, (t - S("S11") - k * 0.05) / 0.7));
        const a = hash(k * 3.1) * Math.PI * 2;
        const r = 0.15 + 0.5 * u;
        return <Coin key={k} p={[PENNY_AT[0] + Math.cos(a) * r, TOP + 0.4 * Math.sin(Math.PI * u) + 0.06, PENNY_AT[2] + Math.sin(a) * r * 0.5 + 0.1]} rot={[u * 6 + k, 0, u * 4]} />;
      }) : null}
      {i >= 12 && i <= 13 ? <CoinPile p={[PENNY_AT[0], TOP, PENNY_AT[2] + 0.1]} h={0.35} r={0.42} seed={4} /> : null}
      {pile28 ? <CoinPile p={PILE28.p} h={PILE28.h} r={PILE28.r} seed={6} /> : null}
      {pile30 ? <CoinPile p={PILE30.p} h={PILE30.h} r={PILE30.r} seed={8} glow={i === 18 ? 0.35 : 0.12} /> : null}
      {/* Saver's "half" sign over the right half of the mountain */}
      {i >= 18 && i <= 19 ? <Placard p={[PILE30.p[0] + 0.9, PILE30.h * 0.75, PILE30.p[2] + 0.9]} yaw={-0.4} text={["DAY 30 ALONE", "= ½"]} w={0.9} h={0.5} bg="#fff4a0" fg="#16121c" glow={0.5 * ss(S("S18"), S("S18") + 0.6, t)} /> : null}
      {/* Teller's receipt (S15) */}
      {id === "S15" ? <Receipt p={[0.25, TOP + 0.05, C[2] + 0.42]} len={0.15 + 0.85 * ss(S("S15"), S("S15") + 1.2, t)} /> : null}
      {/* the dropped case after it slips (S18 on) */}
      {i >= 18 && i <= 20 ? <CashCase p={[SP2[0] + 0.25, 0.0 + Math.max(0, 0.5 * (1 - ss(S("S18") + 0.3, S("S18") + 0.8, t))), SP2[2] + 0.3]} rot={[0, -0.6, 0]} s={0.55} /> : null}
    </Hall>
  );
};

const counter = (t: number, id: string) => {
  const d = dayAt(t);
  const v = valueOf(d);
  const color = d >= 30 ? FIN_PAL.coin : v >= 1_000_000 ? FIN_PAL.cashLight : "#ff6a5a";
  // pop when the day changes: the shot start of the day's first shot
  const since = ["S03", "S05", "S07", "S10", "S12", "S14", "S16", "S21"].map((x) => S(x)).filter((x) => x <= t).pop();
  return { label: `DAY ${d} OF 30`, value: money(v), color, since, sub: v >= 1_000_000 ? "BEATS $1,000,000" : "vs $1,000,000" };
};

export const PENNY_DOUBLES: ShortDef = { slug: "penny-doubles", comp: "PennyDoubles", plan: P, lenses, actors, props, counter };

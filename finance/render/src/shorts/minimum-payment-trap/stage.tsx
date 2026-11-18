// minimum-payment-trap: the long road (template suburb, road along x at z -9.9..-2.4). Spender carries the red $5,000
// block from the start line; Lender's toll booth takes the minimum; the block barely shrinks; a red interest pile grows
// behind the booth. The contrast lane: Saver pays a flat $200 and walks through the PAID OFF gate. Then Teller's
// statement counter (the hall) with the minimum payment warning. The counters follow the stated example exactly
// (finance/shorts/minimum-payment-trap/sources.md: $5,000, 22 % APR, minimum = interest + 1 %, $25 floor).
import React from "react";
import * as plan from "./plan.gen";
import type { Actor, Lens, ShortDef } from "../../fin/engine";
import { fitLens, lens } from "../../fin/engine";
import { SPENDER, LENDER, SAVER, TELLER, FIN_SCALE, FIN_PAL } from "../../library/characters";
import { Outdoor, Hall, HALL } from "../../fin/sets";
import { TollBooth, BalanceBlock, Coin, CoinPile, Gate, PostSign, ChartBoard, Placard, WallCalendar } from "../../fin/props";
import { Tag } from "../../library/props";
import { stand, gesture, lift, DROOP, SHOCK, POINT_R } from "../../fin/poses";
import { walk } from "../../library/characters";
import { T, idx, money } from "../../fin/util";
import { ss, hash } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";

const P = plan as unknown as ShortDef["plan"];
const S = (id: string) => T(P, id);
const sp = FIN_SCALE.spender, ld = FIN_SCALE.lender, sv = FIN_SCALE.saver, tl = FIN_SCALE.teller;
const ROADZ = -5.4; // Spender's lane (near half of the road)
const START: V3 = [-6.0, 0, ROADZ];
const BOOTH: V3 = [-2.6, 0, -2.9]; // on the near sidewalk edge, window toward the road (-z)
const PAY: V3 = [-2.6, 0, -4.2]; // where Spender stands to pay (faces the booth: +z)
const LD: V3 = [-1.7, 0, -2.2]; // Lender beside his booth
const PILE: V3 = [-3.4, 0, -1.6];
const GATE_X = 26;
const SAVER_LANE = -7.6;

// ---- the stated example, month by month ----
type Row = { bal: number; paid: number; int: number };
const sim = (fixed?: number): Row[] => {
  let bal = 5000, paid = 0, int = 0;
  const out: Row[] = [{ bal, paid, int }];
  while (bal > 0.005 && out.length < 400) {
    const it = Math.round(bal * (0.22 / 12) * 100) / 100;
    let p = fixed ?? Math.max(25, Math.round((bal * 0.01 + it) * 100) / 100);
    p = Math.min(p, bal + it);
    bal = bal + it - p;
    paid += p;
    int += it;
    out.push({ bal: Math.max(0, bal), paid, int });
  }
  return out;
};
const MIN = sim(); // 230 months
const FLAT = sim(200); // 34 months
const at = (rows: Row[], u: number) => rows[Math.max(0, Math.min(rows.length - 1, Math.round(u * (rows.length - 1))))];
/** months elapsed on the minimum route: 0 until S06, then to month 230 by the start of S14 (ease: slow, it crawls) */
const minU = (t: number) => (t < S("S06") ? 0 : t >= S("S14") ? 1 : Math.pow((t - S("S06")) / (S("S14") - S("S06")), 1.15));
const flatU = (t: number) => ss(S("S14"), S("S16") + 0.8, t);

const F = (set: "road" | "hall", keys: string[], yaw: number, dy: number, o: Parameters<typeof fitLens>[4] = {}) => fitLens(set, keys, yaw, dy, o);
const lenses: Record<string, Lens> = {
  S01: F("road", ["spender"], 48, 0.1, { fov: 54, face: 0.52 }),
  S02: { subj: [GATE_X - 4, 1.6, ROADZ], pos: [START[0] - 1.2, 1.55, ROADZ + 0.5], fov: 50, face: 0.5, set: "road", fit: { keys: [] } },
  S03: F("road", ["lender", "spender"], -40, 0.08, { face: 0.5, extra: [[BOOTH[0], 2.1, BOOTH[2]]] }),
  S04: lens("road", [PAY[0] + 0.05, 0.95, PAY[2] - 0.25], -150, 0.9, 0.1, 46, 0.48),
  S05: F("road", ["lender"], -30, 0.06, { face: 0.5, extra: [[LD[0] + 1.5, 2.2, LD[2] + 0.6], [LD[0] + 1.5, 0.9, LD[2] + 0.6]] }),
  S06: F("road", ["spender"], -55, 0.08, { face: 0.5, extra: [[BOOTH[0], 1.3, BOOTH[2] - 0.5]] }),
  S07: lens("road", [BOOTH[0], 1.1, BOOTH[2] - 0.62], -160, 0.95, 0.15, 46, 0.5),
  S08: lens("road", [PAY[0] - 0.2, 0.75, PAY[2] - 0.35], -120, 1.0, 0.25, 46, 0.5),
  S09: F("road", ["spender"], 62, 0.08, { fov: 52, face: 0.5 }),
  S10: F("road", ["spender"], 68, 0.04, { bust: true, face: 0.5 }),
  S11: F("road", ["spender"], 20, 0.03, { fov: 54, face: 0.55, shutter: 0.3 }),
  S12: F("road", ["spender"], 75, 0.02, { bust: true, face: 0.5 }),
  S13: F("road", ["lender"], -25, 0.05, { fov: 54, face: 0.55, extra: [[PILE[0], 2.6, PILE[2]], [PILE[0] - 1.2, 0, PILE[2]]] }),
  S14: F("road", ["saver"], -50, 0.08, { face: 0.5, extra: [[BOOTH[0], 1.3, BOOTH[2] - 0.5]] }),
  S15: F("road", ["saver"], -75, 0.08, { fov: 52, face: 0.5 }),
  S16: F("road", ["saver"], -60, 0.1, { fov: 56, face: 0.5, extra: [[GATE_X, 3.8, SAVER_LANE], [GATE_X, 0, SAVER_LANE + 2.4]] }),
  S17: F("hall", ["teller", "spender"], 8, 0.12, { face: 0.5 }),
  S18: lens("hall", [0.1, 1.04, HALL.counter[2] + 0.25], 5, 0.85, 0.45, 46, 0.5),
  S19: F("road", ["spender"], 48, 0.1, { fov: 54, face: 0.52 }),
};

/** the block hugged in front of the chest (both arms around it) */
const block = (k: number) => <group position={[0, -0.12, 0.2]}><BalanceBlock label="$5,000" k={0.85 * k} /></group>;
const HUG = { armL: 1.15, armR: 1.15, outL: -0.12, outR: -0.12 };
const actors = (t: number, id: string): Actor[] => {
  const i = idx(id);
  const out: Actor[] = [];
  const hall = i === 17 || i === 18;
  const bk = 1 - 0.18 * minU(t); // the block barely shrinks (a 1 % sliver a month)
  if (!hall) {
    // Spender
    let p;
    let e: Actor["emotion"] = "happy";
    if (i <= 2 || i === 19) {
      p = stand(START[0], START[2], Math.PI / 2 - 0.6, sp);
      p = gesture(p, HUG, t, i === 19 ? S("S19") : 0, 0.8);
      e = "happy";
    } else if (i <= 8) {
      p = stand(PAY[0], PAY[2], 0.0, sp);
      p = gesture(p, HUG, t, 0, 0.1);
      if (i >= 6) p = gesture(p, { armL: 1.45, outL: 0.05 }, t, S("S06"), 0.7, S("S06") + 1.0);
      e = i === 8 ? "curious" : i >= 6 ? "happy" : "curious";
    } else if (i <= 10) {
      p = walk(PAY[0] + 0.6, ROADZ, Math.PI / 2, t, S("S09"), 0.55, sp);
      p = { ...p, ...HUG };
      e = "curious";
    } else {
      // crawl: torso pitched forward, low, block on the back (S11-S16)
      const x = PAY[0] + 2.4 + 0.12 * (t - S("S11"));
      p = { ...stand(x, ROADZ, Math.PI / 2, sp), pitch: 1.25, y: 0.42 * sp, legL: -0.2 + 0.25 * Math.sin(t * 3), legR: -0.2 - 0.25 * Math.sin(t * 3), armL: 1.45 + 0.2 * Math.sin(t * 3 + 1), armR: 1.45 - 0.2 * Math.sin(t * 3 + 1), headPitch: -0.9 };
      if (i >= 12) p = { ...p, ant: -1 };
      e = i >= 12 ? "sad" : "sad";
    }
    const chest = i <= 10 || i === 19 ? block(i <= 2 || i === 19 ? 1 : bk) : undefined;
    // crawling (S11-S16): the block rides on his back
    const back = i >= 11 && i <= 16 ? <group position={[0, 0.12, -0.42]}><BalanceBlock label="$5,000" k={0.7 * bk} /></group> : undefined;
    if (i <= 16 || i === 19) out.push({ key: "spender", look: SPENDER, pose: p, emotion: e, s: sp, chest: chest ?? back, seed: 11 });
    // Lender at the booth
    let l = stand(LD[0], LD[2], -2.5, ld);
    if (i === 3) l = gesture(l, { armR: 1.6, outR: 0.1 }, t, S("S03") + 0.2, 0.6);
    if (i === 13) l = gesture(l, POINT_R, t, S("S13") + 0.2, 0.7);
    if (i >= 3 && i <= 13) out.push({ key: "lender", look: LENDER, pose: l, emotion: i === 13 ? "sly" : "happy", s: ld, seed: 13 });
    // Saver's lane
    if (i >= 14 && i <= 16) {
      let v;
      if (i === 14) {
        v = stand(PAY[0], SAVER_LANE + 1.2, 0.0, sv);
        v = gesture(v, { armR: 1.3, outR: 0 }, t, S("S14"), 0.7);
      } else v = walk(i === 15 ? PAY[0] + 2 : GATE_X - 3.5, SAVER_LANE, Math.PI / 2, t, S(id), 1.1, sv);
      out.push({ key: "saver", look: SAVER, pose: v, emotion: i === 16 ? "joy" : "happy", s: sv, held: i <= 15 ? { side: "L", node: <group position={[0.17, -0.05, 0.12]}><BalanceBlock label={money(at(FLAT, flatU(t)).bal, false)} k={0.35 + 0.65 * (1 - flatU(t))} /></group> } : undefined, seed: 5 });
    }
  } else {
    out.push({ key: "teller", look: TELLER, pose: gesture(lift(stand(0.0, -2.15, 0, tl), 0.25), { armR: 1.2 }, t, S("S17"), 0.8), emotion: "curious", s: tl, seed: 3 });
    out.push({ key: "spender", look: SPENDER, pose: gesture(stand(0.55, -0.5, -0.3, sp), SHOCK, t, S("S18"), 0.8), emotion: i === 18 ? "shock" : "curious", s: sp, seed: 11 });
  }
  void DROOP;
  return out;
};

const props = (t: number, id: string): React.ReactNode => {
  const i = idx(id);
  if (i === 17 || i === 18) {
    const glow = i === 18 ? 0.4 + 0.4 * ss(S("S18"), S("S18") + 0.5, t) : 0;
    return (
      <Hall sign="STATEMENTS" pal="now">
        <group position={[0.1, 1.012, HALL.counter[2] + 0.2]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
          <Placard p={[0, 0, 0]} text={["STATEMENT", "MIN PAYMENT WARNING"]} w={0.5} h={0.34} bg={i === 18 ? "#fff4c8" : "#ffffff"} fg="#d62a2a" glow={glow} />
        </group>
        <WallCalendar p={[-2.3, 2.2, HALL.backZ + 0.05]} head="EXAMPLE" big="19 YRS" />
      </Hall>
    );
  }
  const u = minU(t);
  const pileH = 0.15 + 2.3 * u;
  const coinDrop = i >= 6 && i <= 8 ? ss(S("S06") + 0.2, S("S06") + 0.8, t) : 0;
  return (
    <Outdoor>
      <TollBooth p={BOOTH} yaw={Math.PI} text={["MIN DUE", money(at(MIN, u).bal * 0.01 + at(MIN, u).bal * 0.22 / 12, true)]} />
      <PostSign p={[START[0] + 2.2, 0, -2.0]} text={["19 YEARS →"]} />
      <Gate p={[GATE_X, 0, ROADZ - 0.8]} yaw={-Math.PI / 2} text="PAID OFF" />
      <PostSign p={[START[0] - 0.4, 0, -2.0]} text={["EXAMPLE", "$5,000 · 22%"]} bg="#fff4c8" />
      {/* the interest pile behind the booth (red, grows with the months) */}
      <CoinPile p={PILE} h={pileH} r={pileH * 0.9} color="#c43a32" coin="#ff7a6a" seed={5} />
      {i >= 13 ? <Tag p={[PILE[0], pileH + 0.35, PILE[2] + 0.4]} text={[`${money(at(MIN, u).int, false)} INTEREST`]} w={0.7} h={0.2} bg="#ffe0dc" tilt={0} /> : null}
      {/* the chart board behind Lender (S05) */}
      {i >= 4 && i <= 5 ? <ChartBoard p={[LD[0] + 1.5, 0, LD[2] + 0.4]} yaw={-0.5} title="CARD APR ≈ 22%" values={[0.7, 0.72, 0.74, 0.73, 0.75, 0.74]} color={FIN_PAL.debt} w={1.5} /> : null}
      {i === 5 ? <Tag p={[LD[0] + 1.5, 2.55, LD[2] + 0.45]} text={["U.S. AVG ≈ 22% (FED G.19)"]} w={0.9} h={0.16} tilt={0} /> : null}
      {i === 4 ? <Tag p={[PAY[0] + 0.05, 1.1, PAY[2] - 0.05]} text={["22% APR", "EXAMPLE"]} w={0.32} h={0.18} bg="#ffe0dc" tilt={0} /> : null}
      {/* the minimum coin: from Spender's hand into the slot; most of it glows red (interest) */}
      {i >= 6 && i <= 8 ? <Coin p={[PAY[0] - 0.05 * (1 - coinDrop), 1.0 + 0.1 * (1 - coinDrop), PAY[2] + 0.45 + 0.75 * coinDrop]} rot={[Math.PI / 2, 0, 0]} s={1.6} color={i >= 7 ? "#e03a32" : "#f0c040"} /> : null}
      {i === 8 ? <mesh position={[PAY[0] - 0.25, 0.25 + 0.6 * (1 - ss(S("S08"), S("S08") + 0.6, t)), PAY[2] + 0.1]}><boxGeometry args={[0.05, 0.36, 0.36]} /><meshStandardMaterial color="#e03a32" /></mesh> : null}
      {/* calendar pages blowing past (S12) */}
      {i === 12 ? Array.from({ length: 8 }, (_, k) => {
        const u2 = ((t - S("S12")) * 0.8 + hash(k)) % 1;
        return <mesh key={k} position={[PAY[0] + 2.0 + (t - S("S11")) * 0.12 - 2 + 4 * u2, 0.6 + 1.4 * hash(k * 3), ROADZ + 0.8 - 1.6 * hash(k * 5)]} rotation={[u2 * 6, u2 * 4 + k, 0]}><planeGeometry args={[0.22, 0.28]} /><meshStandardMaterial color="#fffaf0" side={2} /></mesh>;
      }) : null}
    </Outdoor>
  );
};

const counter = (t: number, id: string) => {
  const i = idx(id);
  if (i >= 14 && i <= 16) {
    const u = flatU(t), r = at(FLAT, u);
    return { label: `FLAT $200 · YEAR ${(u * 34 / 12).toFixed(1)}`, value: money(r.bal, false), color: FIN_PAL.cashLight, sub: `INTEREST PAID ${money(r.int, false)}` };
  }
  if (i === 17 || i === 18) return { label: "MINIMUM ONLY (EXAMPLE)", value: "≈ 19 YEARS", color: "#ff6a5a", sub: `INTEREST ≈ ${money(MIN[MIN.length - 1].int, false)}` };
  const u = i === 19 ? 0 : minU(t), r = at(MIN, u);
  return { label: `MINIMUM ONLY · YEAR ${Math.floor(u * 230 / 12)}`, value: money(r.bal, false), color: "#ff6a5a", sub: `INTEREST PAID ${money(r.int, false)}` };
};

export const MINIMUM_PAYMENT_TRAP: ShortDef = { slug: "minimum-payment-trap", comp: "MinimumPaymentTrap", plan: P, lenses, actors, props, counter };

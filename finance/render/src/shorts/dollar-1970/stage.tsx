// dollar-1970: one corner shop in two eras. NOW: the bright hall; 1970: the same shop in warm retro colours. Spender's
// plain bill shrinks (11.5 cents of 1970 buying power), Saver shows the CPI line, the same basket costs $1.00 then and
// $8.70 now, and a slow drip of coins leaks from Spender's bag (about 4 % a year for 56 years). Figures: BLS CPI-U,
// 1970 average 38.8 vs October 2026 337.511 (finance/shorts/dollar-1970/sources.md).
import React from "react";
import * as plan from "./plan.gen";
import type { Actor, Lens, ShortDef } from "../../fin/engine";
import { fitLens, lens } from "../../fin/engine";
import { SPENDER, TELLER, SAVER, FIN_SCALE, FIN_PAL } from "../../library/characters";
import { Hall, HALL } from "../../fin/sets";
import { Bill, BillBlock, ChartBoard, Coin, CoinPile, Placard, WallCalendar } from "../../fin/props";
import { Tag } from "../../library/props";
import { stand, lift, gesture, POINT_R, SHRUG, SHOCK } from "../../fin/poses";
import { T, idx } from "../../fin/util";
import { ss, hash } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";
import type { Held } from "../../blocky/Blocky";
import { plastic, rbox } from "../../blocky/mat";

const P = plan as unknown as ShortDef["plan"];
const S = (id: string) => T(P, id);
const sp = FIN_SCALE.spender, tl = FIN_SCALE.teller, sv = FIN_SCALE.saver;
const SP: V3 = [0.45, 0, -0.35];
const SV: V3 = [-1.55, 0, -0.75];
const BOARD: V3 = [-1.9, 0, -2.3];
const TOP = 1.01;
const BASKET: V3 = [-0.35, TOP, HALL.counter[2] + 0.1];
const BILLS: V3 = [1.75, 0, -0.75];
const RATIO = 337.511 / 38.8; // 8.70
const CENTS = 100 / RATIO; // 11.5

const retro = (id: string) => ["S03", "S08", "S09"].includes(id);
const F = (set: "hall" | "retro", keys: string[], yaw: number, dy: number, o: Parameters<typeof fitLens>[4] = {}) => fitLens(set, keys, yaw, dy, o);
const lenses: Record<string, Lens> = {
  S01: F("hall", ["spender"], 14, 0.05, { bust: true, face: 0.48, extra: [[SP[0] - 0.35, 1.45, SP[2] + 0.3]] }),
  S02: lens("hall", [SP[0] - 0.22, 1.12, SP[2] + 0.38], 10, 0.8, 0.1, 46, 0.5),
  S03: F("retro", ["teller"], 0, 0.1, { fov: 54, face: 0.5, extra: [[-1.3, TOP, HALL.counter[2]], [1.3, TOP, HALL.counter[2]], [0, 2.9, HALL.backZ]] }),
  S04: lens("hall", [-3.2, 1.0, -0.6], 70, 2.8, 0.4, 52, 0.45),
  S05: F("hall", ["spender"], -20, 0.06, { face: 0.5, extra: [[BILLS[0], 1.25, BILLS[2]], [BILLS[0] + 0.3, 0, BILLS[2]]] }),
  S06: F("hall", ["saver"], 22, 0.05, { face: 0.5, extra: [[BOARD[0] - 0.8, 2.15, BOARD[2]], [BOARD[0] + 0.8, 1.0, BOARD[2]]] }),
  S07: lens("hall", [BOARD[0], 1.55, BOARD[2]], 18, 1.7, 0.05, 50, 0.48),
  S08: F("retro", ["spender", "teller"], 6, 0.08, { face: 0.5, extra: [BASKET] }),
  S09: lens("retro", [BASKET[0] + 0.2, TOP + 0.3, BASKET[2] + 0.15], 8, 0.9, 0.12, 46, 0.5),
  S10: F("hall", ["spender", "teller"], 6, 0.08, { face: 0.5, extra: [BASKET] }),
  S11: F("hall", ["spender"], 40, 0.05, { face: 0.5 }),
  S12: lens("hall", [SP[0] + 0.3, 0.55, SP[2] - 0.1], 70, 1.2, 0.05, 46, 0.5),
  S13: lens("hall", [-2.3, 1.8, HALL.backZ], 18, 2.6, -0.1, 52, 0.45),
  S14: F("hall", ["spender"], 30, 0.04, { bust: true, face: 0.48 }),
  S15: F("hall", ["spender"], 18, 0.1, { fov: 54, face: 0.5, extra: [[SP[0] - 0.9, 1.0, SP[2] - 0.7], [SP[0] + 0.9, 0, SP[2] - 0.7]] }),
  S16: F("hall", ["spender"], 12, 0.06, { face: 0.5, extra: [[-3.3, 1.6, -0.6]] }),
  S17: F("hall", ["spender"], 14, 0.05, { bust: true, face: 0.48, extra: [[SP[0] - 0.35, 1.45, SP[2] + 0.3]] }),
};

/** how much of the bill is left (1 -> 0.115) */
const billK = (t: number, id: string) => {
  const i = idx(id);
  if (i === 1) return 1 - (1 - CENTS / 100) * ss(0.2, S("S02"), t);
  if (i === 17) return 1 - (1 - CENTS / 100) * ss(S("S17") + 0.3, S("S17") + 2.0, t);
  return CENTS / 100;
};
const actors = (t: number, id: string): Actor[] => {
  const i = idx(id);
  const out: Actor[] = [];
  let p = stand(SP[0], SP[2], 0.15, sp);
  let e: Actor["emotion"] = "curious";
  let held: Held | undefined;
  if (i <= 2 || i === 17) {
    p = gesture(p, { armL: 1.6, outL: 0.05 }, t, i === 17 ? S("S17") : 0, 0.7);
    held = { side: "L", node: <Bill k={billK(t, id)} label="$1" /> };
    e = i === 2 ? "shock" : "curious";
  }
  if (i === 8) { p = gesture(p, { armL: 1.2, armR: 1.2 }, t, S("S08") + 0.3, 0.7); e = "happy"; }
  if (i === 10) { p = gesture(p, SHOCK, t, S("S10") + 0.3, 0.8); e = "shock"; }
  if (i >= 11 && i <= 14) { p = gesture(p, { headYaw: 0.4, headPitch: -0.15 }, t, S("S11"), 0.7); e = "happy"; }
  if (i === 15) e = "curious";
  if (i === 16) { p = gesture(p, SHRUG, t, S("S16"), 0.8); e = "sad"; }
  out.push({ key: "spender", look: SPENDER, pose: p, emotion: e, s: sp, held, seed: 11 });
  // Teller behind the counter (both eras)
  let q = lift(stand(0.15, -2.15, 0, tl), 0.25);
  if (i === 8 || i === 10) q = gesture(q, { armL: 1.15, armR: 1.15 }, t, S(id), 0.7);
  out.push({ key: "teller", look: TELLER, pose: q, emotion: i === 10 ? "sly" : "happy", s: tl, seed: 3 });
  // Saver by the CPI board
  if (i >= 6 && i <= 7) {
    let v = stand(SV[0], SV[2], 0.55, sv);
    v = gesture(v, i === 7 ? { armR: 1.8, outR: 0.3 } : POINT_R, t, S(id), 0.7);
    out.push({ key: "saver", look: SAVER, pose: v, emotion: i === 7 ? "sly" : "happy", s: sv, seed: 5 });
  }
  return out;
};

const Basket: React.FC<{ p: V3; tag: string; glow?: number }> = ({ p, tag, glow = 0 }) => (
  <group position={p}>
    <mesh geometry={rbox(0.5, 0.18, 0.32, 0.03)} material={plastic("#c87a3a", { rough: 0.7 })} position={[0, 0.09, 0]} castShadow receiveShadow />
    {[[-0.14, 0, "#e0412b"], [0.0, 0.03, "#ffd23a"], [0.14, -0.02, "#7fe3b8"], [-0.05, -0.08, "#ff8a1f"]].map(([x, z, c], k) => (
      <mesh key={k} position={[x as number, 0.21, z as number]} castShadow><sphereGeometry args={[0.065, 16, 12]} /><meshStandardMaterial color={c as string} roughness={0.4} /></mesh>
    ))}
    <Tag p={[0.33, 0.2, 0.12]} text={[tag]} w={0.26} h={0.13} tilt={-0.2} yaw={-0.3} bg={glow ? "#fff4a0" : "#fff4c8"} />
  </group>
);

const props = (t: number, id: string): React.ReactNode => {
  const i = idx(id);
  const old = retro(id);
  const price = i === 10 ? `$${(1 + (RATIO - 1) * ss(S("S10") + 0.2, S("S10") + 1.1, t)).toFixed(2)}` : old ? "$1.00" : "$8.70";
  const year = Math.round(1970 + 56 * (i === 5 ? ss(S("S05"), S("S06"), t) : i === 13 ? ss(S("S13"), S("S14"), t) : i >= 14 ? 1 : i >= 6 ? 1 : 0));
  const drip = i >= 11 && i <= 16;
  const trail = i >= 11 ? Math.min(1, (t - S("S11")) / (S("S16") - S("S11"))) : 0;
  return (
    <Hall pal={old ? "retro" : "now"} sign={old ? "SHOP · 1970" : "CORNER SHOP"} shelfFill={old ? 0.6 : 1}>
      {old || i === 10 || i === 16 ? <Basket p={BASKET} tag={price} glow={i === 10 ? 1 : 0} /> : null}
      {/* price tags along the left shelf flip upward (S04) */}
      {[0.16, 0.74, 1.32].map((y, r) => [-1.4, -0.6, 0.2].map((z, c) => {
        const u = i === 4 ? ss(S("S04") + (r * 3 + c) * 0.08, S("S04") + (r * 3 + c) * 0.08 + 0.3, t) : i > 4 && !old ? 1 : 0;
        return <Tag key={`${r}${c}`} p={[HALL.leftX + 0.53, y + 0.1, z]} yaw={Math.PI / 2} text={[u > 0.5 ? `$${(8.7 * (1 + 0.3 * hash(r * 3 + c))).toFixed(2)}` : `$${(1 + 0.3 * hash(r * 3 + c)).toFixed(2)}`]} w={0.22} h={0.1} tilt={-0.4 + u * 0.4} bg={u > 0.5 ? "#ffe0dc" : "#fff4c8"} />;
      }))}
      {/* nine bill blocks vs one 1970 block (S05) */}
      {i === 5 ? (
        <>
          {Array.from({ length: 9 }, (_, k) => (k < 1 + 8 * ss(S("S05"), S("S05") + 1.4, t) ? <BillBlock key={k} p={[BILLS[0], k * 0.12, BILLS[2]]} rot={[0, hash(k) * 0.3 - 0.15, 0]} s={2} label="$1" /> : null))}
          <BillBlock p={[BILLS[0] - 0.75, 0, BILLS[2] + 0.1]} s={2} label="1970" />
          <Tag p={[BILLS[0] - 0.4, 1.3, BILLS[2] + 0.3]} text={["≈ 8.7×"]} w={0.4} h={0.18} tilt={0} />
        </>
      ) : null}
      <WallCalendar p={[-2.4, 2.25, HALL.backZ + 0.05]} head={old ? "1970" : "YEAR"} big={old ? "1970" : `${year}`} flip={i === 13 || i === 5 ? (t * 3) % 1 : 0} w={0.9} />
      {/* the CPI board */}
      <ChartBoard p={BOARD} yaw={0.35} title="CPI-U (BLS)" values={[0.12, 0.2, 0.32, 0.45, 0.58, 0.72, 0.86, 0.98]} draw={i === 6 ? ss(S("S06"), S("S06") + 1.2, t) : 1} stamp={i === 7 ? "NOT A GUESS" : undefined} color={FIN_PAL.debt} w={1.5} />
      {/* the drip from Spender's bag and the coin trail */}
      {drip ? Array.from({ length: 3 }, (_, k) => {
        const u = ((t - S("S11")) * 1.3 + k / 3) % 1;
        return <Coin key={k} p={[SP[0] + 0.32, 0.72 * (1 - u * u), SP[2] - 0.05]} rot={[u * 9, 0, u * 5]} s={0.6} />;
      }) : null}
      {drip && trail > 0.05 ? <CoinPile p={[SP[0] + 0.45, 0, SP[2] - 0.35]} h={0.05 + 0.75 * trail} r={0.15 + 0.85 * trail} seed={9} /> : null}
      {i === 13 ? <Tag p={[-2.4, 1.55, HALL.backZ + 0.2]} text={["~4% A YEAR (AVG)"]} w={0.6} h={0.16} tilt={0} /> : null}
      {i === 15 ? <Placard p={[SP[0] - 0.9, 1.6, SP[2] - 0.9]} text={["56 YEARS"]} w={0.6} h={0.26} /> : null}
    </Hall>
  );
};

const counter = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 2 || i === 17) {
    const k = billK(t, id);
    return { label: "YOUR $1 IN 1970 MONEY", value: `${(100 * k).toFixed(1)}¢`, color: "#ff6a5a", sub: "CPI-U, 1970 AVG vs OCT 2026" };
  }
  if (retro(id)) return { label: "SHOP PRICES · 1970", value: "$1.00", color: "#ffb060", sub: "THE SAME BASKET" };
  if (i <= 7) return { label: "PRICES SINCE 1970", value: "× 8.7", color: "#ff6a5a", sub: "CPI-U (BLS)" };
  if (i === 10) return { label: "$1 (1970) = NOW", value: `$${(1 + (RATIO - 1) * ss(S("S10") + 0.2, S("S10") + 1.1, t)).toFixed(2)}`, color: "#ff6a5a", since: S("S10"), sub: "THE SAME BASKET" };
  const u = i >= 11 ? Math.min(1, (t - S("S11")) / (S("S16") - S("S11"))) : 1;
  return { label: `INFLATION ≈ 4%/YR · ${Math.round(1970 + 56 * u)}`, value: `YOUR $1 = ${(100 / Math.pow(RATIO, u)).toFixed(0)}¢`, color: "#ff6a5a", sub: "1970 BUYING POWER" };
};

export const DOLLAR_1970: ShortDef = { slug: "dollar-1970", comp: "Dollar1970", plan: P, lenses, actors, props, counter };

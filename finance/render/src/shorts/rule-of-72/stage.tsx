// rule-of-72: the maths workshop. Left: Saver, Penny and a table of coin jars that double; centre: the board (the
// equation); right: Spender and Lender with the red debt stack. Frame 1 shows both sides under one 72 sign.
import React from "react";
import * as plan from "./plan.gen";
import type { Actor, Lens, ShortDef } from "../../fin/engine";
import { fitLens, lens } from "../../fin/engine";
import { PENNY, SPENDER, SAVER, LENDER, FIN_SCALE, FIN_PAL } from "../../library/characters";
import { Hall, HALL } from "../../fin/sets";
import { ChartBoard, NumberBlock, DebtStack, CoinStack, Placard } from "../../fin/props";
import { Jar, NeonSign, Tag } from "../../library/props";
import { rbox, plastic } from "../../blocky/mat";
import { stand, gesture, POINT_R, SHRUG, SHOCK, HOLD_R, HOLD_L, CHEER } from "../../fin/poses";
import { T, idx } from "../../fin/util";
import { ss, hash } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";
import type { Held } from "../../blocky/Blocky";

const P = plan as unknown as ShortDef["plan"];
const S = (id: string) => T(P, id);
const sv = FIN_SCALE.saver, pn = FIN_SCALE.penny, sp = FIN_SCALE.spender, ld = FIN_SCALE.lender;
const SV: V3 = [-0.75, 0, 0.3];
const PN: V3 = [-1.75, 0, 0.75];
const SPd: V3 = [1.35, 0, 0.45];
const LD: V3 = [2.35, 0, -0.35];
const TABLE: V3 = [-1.7, 0, -1.25];
const TOPY = 0.72;
const DEBT: V3 = [2.0, 0, 0.75];
const BOARD: V3 = [0.15, 0, -2.75];
const POD: V3 = [-0.15, 0, -0.75];

const rate = (t: number) => (t >= S("S17") ? 0 : t >= S("S12") ? 24 : t >= S("S08") ? 12 : t >= S("S07") ? 8 : t >= S("S05") ? 6 : 0);
const years = (r: number) => (r ? Math.round(72 / r) : 0);
/** jars on Saver's table: 1 -> 2 (doubling) and quicker pops with higher rates */
const jarsAt = (t: number, id: string) => {
  const i = idx(id);
  if (i <= 1 || i >= 17) return 1;
  if (i === 2) return 1 + ss(S("S02") + 0.2, S("S02") + 0.6, t);
  if (i <= 5) return 2;
  if (i === 6) return 2 + 2 * ss(S("S06"), S("S06") + 0.8, t);
  if (i <= 8) return 4 + 2 * ss(S("S07"), S("S07") + 0.6, t);
  return Math.min(8, 6 + 2 * ss(S("S09"), S("S09") + 0.5, t));
};
const debtAt = (t: number, id: string) => {
  const i = idx(id);
  if (i < 14) return i >= 12 ? 2 : 2;
  if (i === 14) return 2 + 2 * ss(S("S14") + 0.15, S("S14") + 0.8, t);
  return 4 + 4 * ss(S("S15"), S("S15") + 0.9, t);
};

const F = (keys: string[], yaw: number, dy: number, o: Parameters<typeof fitLens>[4] = {}) => fitLens("workshop", keys, yaw, dy, o);
const M = (subj: V3, yaw: number, dist: number, dy: number, fov = 50, face = 0.45) => lens("workshop", subj, yaw, dist, dy, fov, face);
const JARS: V3[] = [[TABLE[0] - 0.75, TOPY, TABLE[2]], [TABLE[0] + 0.75, TOPY + 0.7, TABLE[2]]];
const lenses: Record<string, Lens> = {
  S01: F(["saver", "spender"], 4, 0.1, { fov: 56, face: 0.5, extra: [[TABLE[0] - 0.4, TOPY + 0.4, TABLE[2]], [DEBT[0], 1.0, DEBT[2]]] }),
  S02: M([TABLE[0], TOPY + 0.2, TABLE[2]], 10, 1.5, 0.35, 46, 0.5),
  S03: F(["saver"], 22, 0.08, { face: 0.5, extra: [[POD[0], 0.85, POD[2]], [POD[0], 1.45, POD[2]]] }),
  S04: { subj: [-2.0, 2.4, HALL.backZ], pos: [-0.6, 1.3, 1.4], fov: 52, face: 0.45, set: "workshop" },
  S05: F(["penny"], 22, 0.06, { face: 0.5, extra: [[BOARD[0] - 0.9, 1.9, BOARD[2]], [BOARD[0] + 0.5, 1.4, BOARD[2]]] }),
  S06: M([TABLE[0], TOPY + 0.2, TABLE[2]], -8, 1.6, 0.4, 48, 0.5),
  S07: F(["penny"], 22, 0.04, { bust: true, face: 0.45 }),
  S08: F(["penny"], -10, 0.06, { bust: true, face: 0.45 }),
  S09: M([TABLE[0], TOPY + 0.25, TABLE[2]], 14, 2.1, 0.55, 50, 0.5),
  S10: F(["saver"], 26, 0.03, { bust: true, face: 0.45 }),
  S11: F(["saver"], 8, 0.08, { fov: 54, face: 0.5, extra: [[BOARD[0] - 0.9, 2.4, BOARD[2]], [BOARD[0] + 0.9, 1.0, BOARD[2]]] }),
  S12: F(["spender"], -16, 0.05, { bust: true, face: 0.45 }),
  S13: M([SPd[0] - 0.25, 1.0, SPd[2] + 0.35], -6, 0.75, 0.15, 44, 0.48),
  S14: F(["lender", "spender"], -26, 0.06, { face: 0.5, extra: [[DEBT[0], 1.3, DEBT[2]]] }),
  S15: F(["spender"], -12, -0.12, { fov: 56, face: 0.5, extra: [[DEBT[0], 2.0, DEBT[2]]] }),
  S16: F(["saver", "spender"], 0, 0.1, { fov: 56, face: 0.5, extra: [[TABLE[0] - 0.6, TOPY + 0.4, TABLE[2]], [DEBT[0] + 0.3, 1.8, DEBT[2]]] }),
  S17: F(["saver", "spender"], 4, 0.1, { fov: 56, face: 0.5, extra: [[TABLE[0] - 0.4, TOPY + 0.4, TABLE[2]], [DEBT[0], 1.0, DEBT[2]]] }),
};
void JARS;

const card = (txt: string, red = false): Held => ({
  side: "R",
  node: <Placard p={[0, 0.12, 0.06]} text={[txt]} w={0.34} h={0.22} bg={red ? "#ffe0dc" : "#fff4c8"} fg={red ? "#d62a2a" : "#1f9e4f"} />,
});

const actors = (t: number, id: string): Actor[] => {
  const i = idx(id);
  const out: Actor[] = [];
  // Saver: holds the 72 block overhead in S01/S17, chops it in S03, taps the tag in S10, balances in S11
  let s = stand(SV[0], SV[2], 0.25, sv);
  let se: Actor["emotion"] = "happy";
  let held: Held | undefined;
  if (i === 1 || i === 17) {
    s = gesture(s, { armL: 2.75, armR: 2.75, outL: 0.12, outR: 0.12 }, t, i === 17 ? S("S17") : 0, 0.8);
    held = { side: "R", node: <NumberBlock p={[0.17, 0.05, 0]} text="72" s={0.75} /> };
    se = "joy";
  }
  if (i === 3) { s = gesture(s, { armR: 2.4, outR: -0.1 }, t, S("S03"), 0.5); s = gesture(s, { armR: 0.9 }, t, S("S03") + 0.55, 0.35); se = "sly"; }
  if (i === 10) { s = gesture(s, POINT_R, t, S("S10"), 0.7); se = "curious"; }
  if (i === 11) { s = gesture(s, { outL: 1.35, outR: 1.35, armL: 0.1, armR: 0.1, sway: 0.08 * Math.sin(t * 3) }, t, S("S11"), 0.7); se = "shock"; }
  if (i === 16) { s = gesture(s, POINT_R, t, S("S16") + 0.2, 0.8); se = "happy"; }
  out.push({ key: "saver", look: SAVER, pose: s, emotion: se, s: sv, held, seed: 5 });
  // Penny with the rate card
  let p = stand(PN[0], PN[2], 0.35, pn);
  const r = rate(t);
  let ph: Held | undefined;
  if (i >= 5 && i <= 9) {
    p = gesture(p, { armR: 1.55, outR: 0.55 }, t, S("S05"), 0.8);
    ph = card(`${r}%`);
  }
  out.push({ key: "penny", look: PENNY, pose: p, emotion: i >= 8 && i <= 9 ? "joy" : "curious", s: pn, held: ph, seed: 7 });
  // Spender: the red card glows in his hand from S12
  let q = stand(SPd[0], SPd[2], -0.3, sp);
  let qe: Actor["emotion"] = "sly";
  let qh: Held | undefined;
  if (i >= 12 && i <= 13) { q = gesture(q, { armR: 1.2, outR: 0.0 }, t, S("S12"), 0.8); qh = card("24% APR", true); qe = "sly"; }
  if (i >= 14 && i <= 15) { q = gesture(q, SHOCK, t, S("S14") + 0.3, 0.8); qe = "shock"; }
  if (i === 16) { q = gesture(q, SHRUG, t, S("S16"), 0.8); qe = "sad"; }
  if (i <= 11 || i === 17) qe = "sly";
  out.push({ key: "spender", look: SPENDER, pose: q, emotion: qe, s: sp, held: qh, seed: 11 });
  // Lender stacks the debt blocks
  let l = stand(LD[0], LD[2], -0.6, ld);
  if (i === 14) l = gesture(l, { armL: 1.4, armR: 1.4, outL: 0.1, outR: 0.1 }, t, S("S14"), 0.7, S("S14") + 0.9);
  out.push({ key: "lender", look: LENDER, pose: l, emotion: i >= 14 && i <= 15 ? "sly" : "happy", s: ld, seed: 13 });
  return out;
};

const props = (t: number, id: string): React.ReactNode => {
  const i = idx(id);
  const r = rate(t);
  const nj = jarsAt(t, id);
  const whole = Math.floor(nj), frac = nj - whole;
  const chop = i === 3 ? ss(S("S03") + 0.6, S("S03") + 1.0, t) : i > 3 && i < 17 ? 1 : 0;
  const title = i >= 12 && i <= 16 ? "72 ÷ 24 = 3" : r ? `72 ÷ ${r} = ${years(r)}` : "72 ÷ RATE = YEARS";
  const wob = i === 11 ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
  return (
    <Hall pal="workshop" sign="RULE OF 72" counter={false} shelves={false}>
      <ChartBoard p={BOARD} title={title} values={[0.15, 0.3, 0.45, 0.6, 0.75, 0.9]} draw={i >= 4 ? 1 : 0.3} wobble={wob} color={i >= 12 && i <= 15 ? FIN_PAL.debt : FIN_PAL.cash} stamp={i === 10 ? "≈ ESTIMATE" : undefined} w={1.9} />
      {i >= 4 ? <NeonSign p={[-2.3, 2.55, HALL.backZ + 0.06]} text="RATE %" w={1.3} h={0.42} color={i === 4 && t - S("S04") < 0.4 && Math.sin(t * 60) > 0 ? "#2a2a3a" : "#ffd23a"} /> : null}
      {/* Saver's jar table */}
      <mesh geometry={rbox(1.6, 0.06, 0.7, 0.02)} material={plastic("#ffd23a", { rough: 0.4 })} position={[TABLE[0], TOPY - 0.03, TABLE[2]]} castShadow receiveShadow />
      {[-0.7, 0.7].map((x) => [-0.28, 0.28].map((z) => <mesh key={`${x}${z}`} geometry={rbox(0.06, TOPY - 0.06, 0.06, 0.01)} material={plastic("#5a3a2e")} position={[TABLE[0] + x, (TOPY - 0.06) / 2, TABLE[2] + z]} castShadow />))}
      {Array.from({ length: Math.min(8, whole + (frac > 0.02 ? 1 : 0)) }, (_, k) => {
        const sc = k < whole ? 1 : frac;
        const col = k % 4, row = Math.floor(k / 4);
        return (
          <group key={k} position={[TABLE[0] - 0.54 + col * 0.36, TOPY, TABLE[2] + 0.12 - row * 0.3]} scale={[sc, sc, sc]}>
            <Jar p={[0, 0, 0]} label={false}>
              <CoinStack p={[0, 0.02, 0]} n={6} seed={k} />
            </Jar>
          </group>
        );
      })}
      {r && i <= 9 ? <Placard p={[TABLE[0], TOPY + 0.55, TABLE[2] - 0.32]} text={[`${years(r)} YRS`]} w={0.5} h={0.24} bg="#1f9e4f" fg="#fff4c8" /> : null}
      {/* the 72 block on its podium (S03 chop: two halves slide apart) */}
      {i >= 2 && i <= 16 ? (
        <group>
          <mesh geometry={rbox(0.6, 0.85, 0.6, 0.04)} material={plastic("#efe6ff", { rough: 0.4 })} position={[POD[0], 0.425, POD[2]]} castShadow receiveShadow />
          {i === 2 ? <NumberBlock p={[POD[0], 1.16, POD[2]]} text="72" s={0.75} /> : null}
          {i >= 3 ? (
            <>
              <group position={[POD[0] - 0.16 * chop, 1.16 + 0.04 * Math.sin(Math.PI * chop), POD[2]]} rotation={[0, 0, 0.12 * chop]}>
                <NumberBlock text="7" s={0.75} p={[-0.17 * (1 - chop * 0) * 0, 0, 0]} />
              </group>
              <group position={[POD[0] + 0.32 * chop, 1.16, POD[2]]} rotation={[0, 0, -0.12 * chop]} scale={[1, 1, 1]}>
                <NumberBlock text="2" s={0.5} color="#2a8a5a" />
              </group>
            </>
          ) : null}
        </group>
      ) : null}
      {/* the debt side: Spender's red stack under the same sign */}
      <DebtStack p={DEBT} n={debtAt(t, id)} label={i >= 15 && i <= 16 ? "3 YRS" : undefined} w={0.6} />
      {i >= 15 && i <= 16 ? <Tag p={[DEBT[0] + 0.45, 1.6, DEBT[2] + 0.2]} text={["×2 IN ~3 YRS"]} w={0.42} h={0.14} bg="#ffe0dc" tilt={0} /> : null}
      {/* one 72 sign over both sides */}
      {Array.from({ length: i === 11 ? 7 : 0 }, (_, k) => (
        <mesh key={k} geometry={rbox(0.3, 0.12, 0.3, 0.02)} material={plastic(FIN_PAL.cash, { rough: 0.4 })} position={[-1.2 + k * 0.35, 0.06 + 0.25 * (0.5 + 0.5 * Math.sin(k * 1.3 + t * 3)) * (0.3 + 0.7 * hash(k)), -0.3]} castShadow receiveShadow />
      ))}
    </Hall>
  );
};

const counter = (t: number, id: string) => {
  const i = idx(id);
  const r = rate(t);
  const debt = i >= 12 && i <= 16;
  const since = ["S03", "S05", "S07", "S08", "S12", "S15"].map((x) => S(x)).filter((x) => x <= t).pop();
  if (debt) return { label: "DEBT AT 24% APR", value: "72 ÷ 24 = 3", color: "#ff6a5a", since, sub: "≈ 3 YEARS TO DOUBLE" };
  return { label: "YEARS TO DOUBLE", value: r ? `72 ÷ ${r} = ${years(r)}` : "72 ÷ RATE", color: FIN_PAL.cashLight, since, sub: r ? `≈ ${years(r)} YEARS (ESTIMATE)` : "RULE OF 72" };
};

export const RULE_OF_72: ShortDef = { slug: "rule-of-72", comp: "RuleOf72", plan: P, lenses, actors, props, counter };
void HOLD_R; void HOLD_L; void CHEER; void POINT_R;

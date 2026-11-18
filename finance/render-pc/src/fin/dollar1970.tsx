// dollar-1970: "Your dollar is worth under twelve cents." One blocky corner shop in two looks: NOW (bright) and 1970
// (warm orange/brown retro, warm gold mood). Times from src/shorts/dollar_1970.plan.gen.ts.
import React from "react";
import * as THREE from "three";
import { Counter as Desk, HoloTag, ShelfUnit, SHELF, Tag } from "../library/props";
import { SAVER, SPENDER, TELLER, heldWorld, pop, walk } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { geoOf, plastic, rbox } from "../blocky/mat";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/dollar_1970.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks } from "./hud";
import type { CounterState } from "./hud";
import { Bill, BillFan, BillBrick, ChartBoard, Coin, CoinPile, FlipCalendar, Hall, Label, Pedestal, Stamp } from "./props";
import SCRIPT from "./scripts/dollar1970";

// ------------------------------------------------------------------ layout (metres; y up, lens side = +z)
const DESK: V3 = [0.75, 0, -0.75]; // counter top 0.98, front face z = -0.4
const SHELF_P: V3 = [-2.7, 0, -3.15];
const CHART: V3 = [3.1, 0, -2.4];
const SP: V3 = [0.1, 0, 1.4]; // Spender's usual spot
const P_TELL: V3 = [0.95, 0, -1.3];
const P_SAVER: V3 = [1.9, 0, -1.2];
const STACK: V3 = [-1.3, 0, 0.6];
const CALP: V3 = [-1.3, 1.95, -1.4];
const PILE_P: V3 = [-0.3, 0, 0.4];
const DOORZ = 5.2;
const BASKET_ON: V3 = [0.55, 0.98, -0.6];
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const E = Object.fromEntries(PLAN.map((p) => [p.id, p.end])) as Record<string, number>;
const RED = "#ff6a5f", GOLD = "#ffd23a", ORANGE = "#ffb347";
const OLD = (id: string) => id === "S03" || id === "S08" || id === "S09";

// ------------------------------------------------------------------ story numbers
// BLS CPI-U, U.S. city average, all items, annual averages (1982-84 = 100); 2026 = the Oct 2026 index in sources.md
const CPI: Record<number, number> = {
  1970: 38.8, 1971: 40.5, 1972: 41.8, 1973: 44.4, 1974: 49.3, 1975: 53.8, 1976: 56.9, 1977: 60.6, 1978: 65.2, 1979: 72.6,
  1980: 82.4, 1981: 90.9, 1982: 96.5, 1983: 99.6, 1984: 103.9, 1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3, 1989: 124.0,
  1990: 130.7, 1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2, 1995: 152.4, 1996: 156.9, 1997: 160.5, 1998: 163.0, 1999: 166.6,
  2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9, 2005: 195.3, 2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5,
  2010: 218.1, 2011: 224.9, 2012: 229.6, 2013: 233.0, 2014: 236.7, 2015: 237.0, 2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7,
  2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 313.7,
};
const CPI_NOW = 337.511;
const MULT = CPI_NOW / CPI[1970]; // 8.699
/** u = years since 1970 (0..56). u < 55: the calendar year 1970 + floor(u) (a true annual value); u >= 55: Oct 2026 */
const cpiAt = (u: number) => (u >= 55 ? CPI_NOW : CPI[1970 + Math.floor(u + 1e-6)]);
const cents = (u: number) => (100 * CPI[1970]) / cpiAt(u);
const dollarsIn = (u: number) => cpiAt(u) / CPI[1970];
const yearLabel = (u: number) => (u >= 55 ? "OCT 2026" : String(1970 + Math.floor(u + 1e-6)));
/** the year clock of the NOW shots: S01/S02 start AND stay at Oct 2026; S17 rolls 100 c -> 11.5 c so its last frame = S01's first */
const yearAt = (t: number, id: string): number => {
  if (id === "S01" || id === "S02") return 56;
  if (id === "S11") return lerp(0, 8, (t - T.S11) / (E.S11 - T.S11));
  if (id === "S12") return lerp(8, 20, (t - T.S12) / (E.S12 - T.S12));
  if (id === "S13") return lerp(20, 40, (t - T.S13) / (E.S13 - T.S13));
  if (id === "S14") return lerp(40, 54, (t - T.S14) / (E.S14 - T.S14));
  if (id === "S15") return lerp(54, 56, (t - T.S15) / (E.S15 - T.S15));
  if (id === "S16") return 56;
  if (id === "S17") return 56 * ss(T.S17 + 0.1, E.S17 - 0.25, t);
  return 0;
};
/** u for the price rollers (S04, S05, S10): lands on Oct 2026 = $8.70 */
const rollU = (t: number, id: string): number => {
  if (id === "S04") return lerp(0, 30, ss(T.S04 + 0.1, E.S04, t));
  if (id === "S05") return lerp(30, 56, ss(T.S05, T.S05 + 1.2, t));
  if (id === "S10") return lerp(0, 56, ss(T.S10, T.S10 + 0.45, t));
  if (id === "S06" || id === "S07") return 56;
  return 0;
};
const roll = (t: number, id: string): number => dollarsIn(rollU(t, id));

// the drip schedule (S11-S15): spawn times of the coins leaking out of the bag
const DRIPS: number[] = (() => {
  const out: number[] = [];
  const phases: [number, number, number][] = [[T.S11, E.S11, 0.45], [E.S11, E.S12, 0.6], [E.S12, E.S13, 0.28], [E.S13, E.S14, 0.2], [E.S14, E.S15, 0.17]];
  for (const [a, b, dt] of phases) for (let t = a + 0.12; t < b; t += dt) out.push(t);
  return out;
})();
const dripX = (t: number) => (t < T.S14 ? 0.1 : lerp(0.1, 1.4, clamp((t - T.S14) / 1.2)));

// ------------------------------------------------------------------ Spender per shot
const spenderAt = (id: string, t: number, tau: number): { pos: V3; pose: Pose; emo: Emotion; held?: React.ReactNode; heldSide?: "L" | "R" } => {
  const c = cents(yearAt(t, id));
  const bill = (
    <group position={[0, 0.16, 0.0]} rotation={[Math.PI / 2, 0, 0]} scale={2.2 * Math.max(0.18, c / 100)}>
      <Bill />
    </group>
  );
  const camYaw = (q: V3) => yawTo(q, [1.0, 0, 4]);
  if (id === "S01" || id === "S17" || id === "S02") {
    const ph = Math.sin((2 * Math.PI * tau) / 1.04);
    const pos = SP;
    const pose: Pose = { ...stand(pos[0], pos[2], camYaw(pos) * 0.9, 1), armL: 2.0 + 0.08 * ph, outL: 0.5, armR: 0.2, headPitch: -0.1, headYaw: 0.15 };
    return { pos, pose, emo: id === "S02" ? "sad" : "shock", held: bill, heldSide: "L" };
  }
  if (id === "S03") {
    const pos: V3 = [0.2, 0, 2.2];
    return { pos, pose: { ...stand(pos[0], pos[2], camYaw(pos), 1), armL: 0.2, armR: 0.2, headPitch: -0.05 }, emo: "joy" };
  }
  if (id === "S04") {
    const pos: V3 = [-0.8, 0, 0.4];
    return { pos, pose: { ...stand(pos[0], pos[2], yawTo(pos, SHELF_P) * 0.7, 1), armL: 0.3, armR: 0.3, headYaw: 0.2 }, emo: "shock" };
  }
  if (id === "S05") {
    const pos: V3 = [0.2, 0, 0.1];
    return { pos, pose: { ...stand(pos[0], pos[2], camYaw(pos) * 0.5, 1), armL: 1.2, outL: 0.4, armR: 0.2 }, emo: "shock" };
  }
  if (id === "S06" || id === "S07") {
    const pos: V3 = [0.7, 0, 0.4];
    return { pos, pose: { ...stand(pos[0], pos[2], yawTo(pos, P_SAVER), 1), armL: 0.2, armR: 0.2 }, emo: "curious" };
  }
  if (id === "S08" || id === "S09" || id === "S10") {
    const pos: V3 = [-0.1, 0, 0.35];
    const give = id === "S08" ? 1 : 0.2;
    const pose: Pose = { ...stand(pos[0], pos[2], yawTo(pos, [0.4, 0, -0.6]) * 0.6 + 0.15, 1), armL: 1.2 * give, outL: 0.2, armR: 0.2, headPitch: 0.1, ant: id === "S10" ? 1 : 0.3 };
    return { pos, pose, emo: id === "S10" ? "shock" : "happy", held: id === "S08" ? <group position={[0, 0.12, 0]} rotation={[0, 0, 0]} scale={0.8}><Bill /></group> : undefined, heldSide: "L" };
  }
  if (id === "S11" || id === "S12" || id === "S13") {
    const pos: V3 = [0.1, 0, 1.0];
    return { pos, pose: { ...stand(pos[0], pos[2], camYaw(pos) * 0.6, 1), armL: 0.12, armR: 0.12, headYaw: 0.2 * Math.sin(t * 1.5) }, emo: "happy" };
  }
  if (id === "S14") {
    const x = dripX(t);
    const w = walk(x, 1.0, Math.PI / 2, 0, 0, 0, 1);
    const ph = 2 * Math.PI * 1.1 * (t - T.S14);
    const psi = 0.35 * Math.sin(ph);
    const pose: Pose = { ...w, x, legL: psi, legR: -psi, armL: -0.45 * psi, armR: 0.45 * psi, headPitch: -0.1, headYaw: -0.4, bob: -0.012 * (0.5 + 0.5 * Math.cos(2 * ph)) };
    return { pos: [x, 0, 1.0], pose, emo: "joy" };
  }
  if (id === "S15") {
    const pos: V3 = [1.6, 0, 0.9];
    return { pos, pose: { ...stand(pos[0], pos[2], camYaw(pos) * 0.5, 1), armL: 0.12, armR: 0.12 }, emo: "joy" };
  }
  // S16: shrugs at the empty bag
  const pos: V3 = [0.2, 0, 1.2];
  const sh = pop(clamp(tau / 0.6));
  return { pos, pose: { ...stand(pos[0], pos[2], camYaw(pos) * 0.8, 1), outL: 0.7 * sh, outR: 0.7 * sh, armL: 0.5 * sh, armR: 0.5 * sh, headYaw: 0.3 * Math.sin(tau * 3), headPitch: 0.1 }, emo: "sad" };
};
const hand = (id: string, t: number, tau: number): V3 => {
  const s = spenderAt(id, t, tau);
  return heldWorld(s.pose, "L", 1, [0, 0.16, 0.0]);
};

// ------------------------------------------------------------------ shots (lenses)
const L = (o: Partial<FinShot> & Pick<FinShot, "subj" | "fov" | "face" | "mood">): Omit<FinShot, "id" | "a" | "b"> => ({ off: [0, 0, 3], ...o });
const OPEN_POS: V3 = [1.5, 1.35, 4.5];
const OPEN_SUBJ: V3 = [0.1, 1.15, 1.4];
const PUSH17 = 0.04;
const k17 = 1 - PUSH17 * (E.S17 - T.S17);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: L({ subj: () => OPEN_SUBJ, pos: OPEN_POS, fov: 52, face: 0.42, mood: "store", push: PUSH17, roll: [0, 0.6], blur: 1.0 }),
  S02: L({ subj: (t) => { const h = hand("S02", t, 0); return [h[0], h[1] - 0.02, h[2]]; }, off: [0.3, 0.05, 1.3], fov: 44, face: 0.5, mood: "store", roll: [0, -1.2], blur: 2.2 }),
  S03: L({ subj: () => [0, 1.2, 0.5], pos: [0.0, 1.45, 8.0], fov: 56, face: 0.5, mood: "ending", push: 0.1, roll: [0, 1.0], blur: 0.8 }),
  S04: L({ subj: () => [-2.3, 1.0, -2.8], pos: [-1.2, 1.4, 1.5], fov: 56, face: 0.5, mood: "store", roll: [0, -1.2], blur: 1.0 }),
  S05: L({ subj: () => [-1.2, 1.2, -0.3], pos: [-0.2, 0.45, 3.2], fov: 58, face: 0.5, mood: "store", roll: [0, 1.2], blur: 1.0 }),
  S06: L({ subj: () => [2.4, 1.3, -1.6], pos: [1.0, 1.5, 2.2], fov: 54, face: 0.45, mood: "store", roll: [0, -1.0], blur: 1.2 }),
  S07: L({ subj: () => [CHART[0], 1.8, CHART[2] + 0.1], pos: [2.5, 1.8, 0.3], fov: 48, face: 0.5, mood: "store", roll: [0, 1.4], blur: 1.8 }),
  S08: L({ subj: () => [0.4, 1.1, -0.4], pos: [0.9, 1.4, 2.3], fov: 52, face: 0.45, mood: "ending", roll: [0, -1.2], blur: 1.3 }),
  S09: L({ subj: () => [BASKET_ON[0], 1.2, BASKET_ON[2] + 0.1], pos: [0.9, 1.45, 1.5], fov: 44, face: 0.5, mood: "ending", roll: [0, 1.2], blur: 2.0 }),
  S10: L({ subj: () => [BASKET_ON[0], 1.2, BASKET_ON[2] + 0.1], pos: [0.9, 1.45, 1.5], fov: 44, face: 0.5, mood: "store", roll: [0, -1.2], blur: 2.0 }),
  S11: L({ subj: () => [0.2, 1.0, 1.0], off: [0.9, 0.15, 3.1], fov: 52, face: 0.45, mood: "whisper", roll: [0, 1.2], blur: 1.3 }),
  S12: L({ subj: () => [0.4, 0.75, 0.9], off: [0.6, 0.1, 2.4], fov: 48, face: 0.5, mood: "whisper", roll: [0, -1.2], blur: 2.0 }),
  S13: L({ subj: () => [-0.3, 1.5, -0.4], pos: [0.8, 1.5, 4.8], fov: 58, face: 0.5, mood: "whisper", roll: [0, 1.0], blur: 0.9 }),
  S14: L({ subj: (t) => [dripX(t) - 0.2, 0.95, 1.0], off: [0.5, 0.15, 3.0], fov: 54, face: 0.5, mood: "whisper", roll: [0, -1.2], blur: 1.1 }),
  S15: L({ subj: () => [0.7, 0.85, 0.7], pos: [3.2, 2.5, 6.6], fov: 62, face: 0.5, mood: "ending", push: 0.09, roll: [0, 1.0], blur: 0.7 }),
  S16: L({ subj: () => [0.2, 1.15, 1.2], pos: [-0.5, 1.3, 4.3], fov: 52, face: 0.45, mood: "store", roll: [0, -1.2], blur: 1.2 }),
  S17: L({
    subj: () => OPEN_SUBJ,
    pos: [OPEN_SUBJ[0] + (OPEN_POS[0] - OPEN_SUBJ[0]) / k17, OPEN_SUBJ[1] + (OPEN_POS[1] - OPEN_SUBJ[1]) / k17, OPEN_SUBJ[2] + (OPEN_POS[2] - OPEN_SUBJ[2]) / k17],
    fov: 52, face: 0.42, mood: "store", push: PUSH17, roll: [0.6, 0], blur: 1.0,
  }),
};
export const D1970_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ props
const GOODS = ["#ff7a6a", "#ffd23a", "#7ee8a0", "#8fd6ff", "#ffb27a", "#d3b2ff"];
const price = (base: number, mult: number) => "$" + (base * mult).toFixed(2);
const PRICES = [0.25, 0.35, 0.5, 0.15, 0.9, 0.6, 0.45, 0.2, 0.75];
/** the shelf tags: 3 per board; flips (a half turn) one after another */
const Tags: React.FC<{ mode: "old" | "now" | "flip" | "tick"; tau: number }> = ({ mode, tau }) => (
  <>
    {PRICES.map((b, i) => {
      const board = SHELF.boards[Math.floor(i / 3)];
      const x = -0.8 + (i % 3) * 0.8;
      let u = 1;
      let txt = price(b, mode === "old" ? 1 : MULT);
      let tilt = -0.2;
      if (mode === "flip" || mode === "tick") {
        u = clamp((tau - 0.05 - 0.11 * i) / 0.4);
        const from = mode === "flip" ? 1 : MULT;
        const to = mode === "flip" ? MULT : MULT * 1.04;
        txt = price(b, u > 0.5 ? to : from);
        tilt = -0.2 - Math.PI * 2 * ss(0, 1, u);
      }
      return <Tag key={i} p={[x, board + 0.1, SHELF.d / 2 + 0.02]} text={[txt]} w={0.4} h={0.2} tilt={tilt} bg="#fff4c8" />;
    })}
  </>
);
const ShelfGoods: React.FC = () => (
  <>
    {SHELF.boards.map((by, bi) =>
      Array.from({ length: 9 }, (_, i) => (
        <mesh key={`${bi}-${i}`} geometry={rbox(0.2, 0.22 + 0.1 * hash(bi * 9 + i), 0.2, 0.04)} material={plastic(GOODS[(bi * 3 + i) % GOODS.length], { rough: 0.6 })} position={[-1.05 + i * 0.26, by + 0.11, -0.05]} castShadow />
      )),
    )}
  </>
);
const Basket: React.FC<{ p: V3; tag: string; tagGlow?: number; r?: V3 }> = ({ p, tag, tagGlow = 0, r = [0, 0, 0] }) => (
  <group position={p} rotation={r}>
    <mesh geometry={rbox(0.42, 0.04, 0.3, 0.01)} material={plastic("#b97a3a")} position={[0, 0.02, 0]} castShadow />
    {[[0, 0.1, 0.15, 0.42, 0.18, 0.03], [0, 0.1, -0.15, 0.42, 0.18, 0.03], [0.21, 0.1, 0, 0.03, 0.18, 0.3], [-0.21, 0.1, 0, 0.03, 0.18, 0.3]].map((q, i) => (
      <mesh key={i} geometry={rbox(q[3], q[4], q[5], 0.008)} material={plastic("#c98a46")} position={[q[0], q[1], q[2]]} castShadow />
    ))}
    <mesh geometry={rbox(0.14, 0.2, 0.1, 0.02)} material={plastic("#ffd27a")} position={[-0.1, 0.2, 0]} />
    <mesh geometry={rbox(0.12, 0.16, 0.1, 0.02)} material={plastic("#fff")} position={[0.08, 0.18, 0.02]} />
    <mesh geometry={geoOf("apple", () => new THREE.SphereGeometry(0.06, 12, 8))} material={plastic("#e03a32")} position={[0.12, 0.2, -0.06]} />
    <mesh geometry={rbox(0.1, 0.22, 0.08, 0.02)} material={plastic("#5fc86a")} position={[-0.02, 0.22, -0.05]} />
    <Label p={[0.0, 0.3, 0.2]} text={[tag]} w={0.34} h={0.17} r={[-0.3, 0, 0]} bg="#fff4c8" fg="#16121c" glow={tagGlow} />
  </group>
);
const Door: React.FC<{ open: number }> = ({ open }) => (
  <group position={[0, 0, DOORZ]}>
    {[-1, 1].map((s) => (
      <mesh key={s} geometry={rbox(5.0, 4.2, 0.3, 0.04)} material={plastic("#8c8fb8", { rough: 0.8 })} position={[s * (0.85 + 2.5), 2.1, 0]} castShadow />
    ))}
    <mesh geometry={rbox(1.7, 1.9, 0.3, 0.04)} material={plastic("#8c8fb8", { rough: 0.8 })} position={[0, 3.25, 0]} />
    <mesh geometry={rbox(0.14, 2.3, 0.34, 0.03)} material={plastic("#5a3a1a")} position={[-0.85, 1.15, 0]} />
    <mesh geometry={rbox(0.14, 2.3, 0.34, 0.03)} material={plastic("#5a3a1a")} position={[0.85, 1.15, 0]} />
    <group position={[-0.78, 0, 0.05]} rotation={[0, open * 1.75, 0]}>
      <mesh geometry={rbox(1.5, 2.25, 0.1, 0.02)} material={plastic("#a8642a", { rough: 0.6 })} position={[0.75, 1.125, 0]} castShadow />
      <Label p={[0.75, 1.5, 0.06]} text={["1970"]} w={0.95} h={0.5} bg="#fff4c8" fg="#8a3a10" />
      <Label p={[0.75, 1.5, -0.06]} text={["1970"]} w={0.95} h={0.5} bg="#fff4c8" fg="#8a3a10" r={[0, Math.PI, 0]} />
    </group>
    <Label p={[0, 2.5, 0.2]} text={["1970"]} w={1.3} h={0.5} bg="#2a1608" fg="#ffb347" glow={1.0} />
  </group>
);

// ------------------------------------------------------------------ the scene
const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const old = OLD(id);
  const actors: React.ReactNode[] = [];
  // Spender
  {
    const s = spenderAt(id, t, tau);
    actors.push(<Act key="sp" look={SPENDER} pose={s.pose} emotion={s.emo} s={1} t={t} seed={2} held={s.held ? { side: s.heldSide ?? "L", node: s.held } : undefined} />);
  }
  // Teller behind the counter (hands the basket in S08)
  {
    const give = id === "S08" ? ss(0.2, 1.0, tau) : 0;
    const pose: Pose = { ...stand(P_TELL[0], P_TELL[2], yawTo(P_TELL, [0.3, 0, 4]), 0.9), armL: 0.15 + 0.9 * give, armR: 0.15 + 0.9 * give, outL: 0.1, outR: 0.1 };
    actors.push(<Act key="tel" look={TELLER} pose={pose} emotion="happy" s={0.9} t={t} seed={3} />);
  }
  // Saver with the chart (S06, S07)
  if (id === "S06" || id === "S07") {
    const pose: Pose = { ...stand(P_SAVER[0], P_SAVER[2], yawTo(P_SAVER, [1.2, 0, 4]), 1), armL: 0.3, outL: 1.25, armR: 0.2, headYaw: -0.2 };
    actors.push(<Act key="sav" look={SAVER} pose={pose} emotion="happy" s={1} t={t} seed={4} />);
  }
  // ---- coins leaking (S11-S15)
  const drips: React.ReactNode[] = [];
  let landed = 0;
  if (t >= T.S11 && t < E.S15 + 0.01 && id !== "S16" && id !== "S17") {
    DRIPS.forEach((ts, i) => {
      const u = (t - ts) / 0.55;
      if (u < 0) return;
      const sx = dripX(ts);
      const bag: V3 = [sx + 0.28, 0.66, 1.0 - 0.12];
      const a = hash(i * 3.7) * 6.28;
      const land: V3 = ts < T.S14 ? [PILE_P[0] + Math.cos(a) * 0.3, 0.1, PILE_P[2] + Math.sin(a) * 0.3] : [sx - 0.35 - 0.1 * hash(i), 0.01, 1.0 + (hash(i * 9) - 0.5) * 0.3];
      if (u >= 1) {
        landed++;
        if (ts >= T.S14) drips.push(<Coin key={i} p={land} r={[0, a, 0]} s={1.6} />);
        return;
      }
      const q = u * u;
      drips.push(<Coin key={i} p={[lerp(bag[0], land[0], u), lerp(bag[1], land[1], q), lerp(bag[2], land[2], u)]} r={[u * 6, a, u * 4]} s={1.6} glow={0.3} />);
    });
  } else if (id === "S15") landed = 99;
  void landed;
  const pileH = id === "S15" ? lerp(0.5, 0.95, clamp(tau / 1.2)) : t >= T.S11 && t < E.S14 ? 0.04 + 0.4 * ss(T.S11, E.S14, t) : id === "S16" || id === "S17" ? 0 : 0;
  // ---- the 5 stack of bill-blocks (S05)
  const nB = id === "S05" ? 1 + 8 * ss(0.1, 1.7, tau) : 0;
  const bricks: React.ReactNode[] = [];
  if (id === "S05") {
    for (let i = 0; i < 9; i++) {
      const f = clamp(nB - i);
      if (f > 0.02) bricks.push(<BillBrick key={i} p={[STACK[0] + 0.55, 0.154 * i + 0.0, STACK[2]]} s={2.2 * 1.0} r={[0, 0, 0]} />);
    }
  }
  // ---- calendar
  const yrNow = id === "S05" ? 1970 + 56 * ss(0.1, 1.9, tau) : 1970;
  const yq = Math.min(2026, 1970 + Math.floor((yrNow - 1970) / 4) * 4 + (yrNow >= 2025.99 ? 2 : 0));
  const yp = Math.max(1970, yq - 4);
  const calU = id === "S05" ? (yrNow - 1970 - Math.floor((yrNow - 1970) / 4) * 4) / 4 : 1;
  // ---- chart
  const chartVals = Array.from({ length: 14 }, (_, i) => 0.12 + 0.72 * (1 - Math.pow(1 - i / 13, 1.3)));
  const flipMode: "old" | "now" | "flip" | "tick" = id === "S04" ? "flip" : id === "S16" ? "tick" : old ? "old" : id === "S01" || id === "S02" ? "now" : "now";
  const hall = old
    ? { wall: "#c2742e", stripe: "#6a3412", floorA: "#d9a66c", floorB: "#b98348" }
    : { wall: "#7f6fe0", stripe: "#ffd23a", floorA: "#f4ecff", floorB: "#e2d6fa" };
  const basketTag = id === "S09" || id === "S08" ? "$1.00" : id === "S10" ? "$" + roll(t, id).toFixed(2) : "$8.70";
  const showBasket = id === "S08" || id === "S09" || id === "S10";
  const bsl = id === "S08" ? ss(0.2, 1.0, tau) : 1;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall={hall.wall} stripe={hall.stripe} floorA={hall.floorA} floorB={hall.floorB} />
      <Desk p={DESK} />
      <ShelfUnit p={SHELF_P} yaw={0} color={old ? "#8a4a22" : "#5b3fb5"}>
        <ShelfGoods />
        <Tags mode={flipMode} tau={tau} />
      </ShelfUnit>
      {id === "S02" ? (() => { const h = hand("S02", t, tau); return <HoloTag p={[h[0] + 0.45, h[1] + 0.45, h[2]]} text="UNDER 12¢" t={t} w={0.7} />; })() : null}
      {/* the painted card on the counter */}
      <Label p={[1.35, 1.13, -0.62]} text={["CPI-U, 1970 AVG", "vs OCT 2026"]} w={0.56} h={0.24} r={[-0.25, -0.2, 0]} bg="#fff4c8" fg="#16121c" />
      {showBasket ? <Basket p={id === "S08" ? [lerp(BASKET_ON[0], 0.2, bsl * 0.0), BASKET_ON[1], BASKET_ON[2] + 0.3 * bsl] : BASKET_ON} tag={basketTag} tagGlow={id === "S10" ? 0.25 : 0} /> : null}
      {id === "S10" && rollU(t, id) >= 55 ? <HoloTag p={[BASKET_ON[0], 1.62, BASKET_ON[2] + 0.15]} text="$8.70" t={t} w={0.5} /> : null}
      {/* S03: the 1970 door */}
      {id === "S03" ? <Door open={ss(0.15, 1.2, tau)} /> : null}
      {/* S05: bill blocks + calendar */}
      {id === "S05" ? (
        <>
          {bricks}
          <BillBrick p={[STACK[0] - 0.55, 0, STACK[2]]} s={2.2} />
          <Label p={[STACK[0] - 0.55, 0.22, STACK[2] + 0.5]} text={["1970", "$1"]} w={0.7} h={0.4} bg="#fff4c8" fg="#8a3a10" />
          <Label p={[STACK[0] + 0.55, 0.22, STACK[2] + 0.5]} text={["NOW", `$${(nB < 8.9 ? Math.max(1, nB) * 1 : MULT).toFixed(1)}`]} w={0.7} h={0.4} bg="#2a1a5a" fg="#7dffcf" />
          <Pedestal p={[CALP[0], 0, CALP[2]]} h={1.3} r={0.22} />
          <FlipCalendar p={CALP} w={1.2} h={1.0} title="YEAR" value={String(yq)} prev={String(yp)} flip={calU} />
          <Label p={[CALP[0] + 1.9, 1.25, CALP[2] + 1.6]} text={["≈ 8.7×"]} w={1.1} h={0.45} bg="#16121c" fg="#ffd23a" glow={0.8} r={[0, -0.3, 0]} />
        </>
      ) : null}
      {/* S06/S07 chart */}
      {id === "S06" || id === "S07" ? (
        <>
          <ChartBoard p={CHART} yaw={-0.15} w={2.0} h={1.3} title="CPI-U (BLS)" values={chartVals} color="#5ff08a" draw={id === "S06" ? ss(0.1, 1.5, tau) : 1} board="#16301e" />
          <Stamp p={[CHART[0] - 0.1, 1.75, CHART[2] + 0.12]} text="NOT A GUESS" u={id === "S07" ? clamp((tau - 0.25) / 0.35) : 0} w={1.35} />
        </>
      ) : null}
      {/* coin pile */}
      {pileH > 0.05 ? <CoinPile p={PILE_P} r={pileH * 1.1 + 0.1} h={pileH} coins={id === "S15" ? 120 : 60} /> : null}
      {id === "S15" ? <HoloTag p={[PILE_P[0] + 0.1, 1.55, PILE_P[2] + 0.9]} text="56 YEARS" t={t} w={1.1} /> : null}
      {drips}
      {actors}
    </>
  );
};

// ------------------------------------------------------------------ counter
const counter = (t: number, shot: FinShot, tau: number): CounterState => {
  const id = shot.id;
  const y = yearAt(t, id);
  const c = cents(y);
  const fmtC = (v: number) => `${v >= 99.95 ? "100" : v.toFixed(1)}¢`;
  const yr = y >= 55 ? "OCT 2026" : `YEAR ${yearLabel(y)}`;
  if (id === "S03") return { lines: [{ text: "1970 PRICES", color: ORANGE }, { text: "$1 (1970) = $1.00", color: "#ffffff", size: 44 }], pop: clamp((tau - 0.9) / 0.4), accent: "#ffb347" };
  if (id === "S04" || id === "S05" || id === "S10") {
    const u = rollU(t, id);
    const x = dollarsIn(u);
    return { lines: [{ text: `$1 (1970) = $${x.toFixed(2)}`, color: u >= 55 ? GOLD : "#ffffff" }, { text: `IN ${yearLabel(u)}${id === "S05" ? "  ·  ≈ 8.7×" : ""}`, color: ORANGE, size: 42 }], pop: id === "S10" ? clamp((tau - 0.42) / 0.3) : 0, accent: "#7fefff" };
  }
  if (id === "S06" || id === "S07") return { lines: [{ text: `$1 (1970) = $${MULT.toFixed(2)}`, color: GOLD }, { text: "IN OCT 2026 · CPI-U (BLS)", color: "#7dffcf", size: 40 }], accent: "#7dffcf" };
  if (id === "S08" || id === "S09") return { lines: [{ text: "$1 (1970) = $1.00", color: ORANGE }, { text: "1970 BASKET", color: "#ffffff", size: 44 }], accent: "#ffb347" };
  return {
    lines: [
      { text: `YOUR $1 = ${fmtC(c)}`, color: c < 20 ? RED : "#ffffff" },
      { text: `${yr}`, color: "#ffffff", size: 44 },
    ],
    pop: id === "S17" ? clamp((tau - 0.95) / 0.3) : id === "S15" ? clamp(tau / 0.35) : 0,
    accent: "#ff8a7a",
  };
};

export const D1970_SPEC: FinSpec = {
  slug: "dollar-1970",
  shots: D1970_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: (t) => (t < 4 ? "CPI-U, 1970 AVG vs OCT 2026" : "EXAMPLE: CPI-U"),
  bg: "#2a1f5a",
};
export const _unused = { BillFan, hand };

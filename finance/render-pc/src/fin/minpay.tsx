// minimum-payment-trap: "Your minimum payment can take nineteen years." A long blocky suburb road with a far PAID OFF
// gate, a toll booth (the lender) and a statement counter. Times from src/shorts/minimum_payment_trap.plan.gen.ts.
import React from "react";
import * as THREE from "three";
import { Counter as Desk, HoloTag, Sign } from "../library/props";
import { LENDER, SAVER, SPENDER, TELLER, heldWorld, pop, walk } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Look } from "../blocky/Blocky";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { geoOf, plastic, rbox } from "../blocky/mat";
import { CAPTIONS, DURATION, SHOTS as PLAN } from "../shorts/minimum_payment_trap.plan.gen";
import { Act, buildShots, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { casedChunks, usd } from "./hud";
import type { CounterState } from "./hud";
import { BigBlock, ChartBoard, Coin, CoinPile, FlipCalendar, Ground, Label, Pedestal, TollBooth } from "./props";
import SCRIPT from "./scripts/minpay";

// ------------------------------------------------------------------ layout (metres; y up, lens side = +z, road along -z)
const SP0: V3 = [0.35, 0, 0.8]; // Spender at the start of the road
const BO: V3 = [-2.6, 0, -1.3]; // toll booth
const SLOT: V3 = [BO[0] + 0.75, 1.21, BO[2] + 0.35];
const P_LEND: V3 = [-4.0, 0, 0.0];
const PED: V3 = [-3.05, 0.7, 0.05]; // top of the pedestal the block rests on (S03-S08)
const CHART: V3 = [-3.2, 0, -3.6];
const PILE: V3 = [-5.4, 0, -1.8];
const CT: V3 = [3.0, 0, -0.9]; // statement counter
const P_TELL: V3 = [3.0, 0, -1.55];
const NG: V3 = [0, 0, -3.3]; // the near PAID OFF gate used by the Saver's lane
const FAR_GATE: V3 = [0, 0, -62];
const BLK: V3 = [0.5, 0.42, 0.34];
const S = { spender: 1.0, lender: 1.15, teller: 0.9, saver: 1.0 };
const T = Object.fromEntries(PLAN.map((p) => [p.id, p.t])) as Record<string, number>;
const E = Object.fromEntries(PLAN.map((p) => [p.id, p.end])) as Record<string, number>;
const RED = "#ff6a5f", GREEN = "#5ff08a", GOLD = "#ffd23a";

// ------------------------------------------------------------------ story numbers
const R = 0.22 / 12;
const MIN_YEARS = 19;
const MIN_INT = 8099;
/** the year the minimum route shows at time t (the counter ticks inside shots) */
const yearMin = (t: number): number => {
  if (t < T.S09) return 0;
  if (t < T.S10) return lerp(0, 1, ss(T.S09, E.S09, t));
  if (t < T.S11) return lerp(1, 3, ss(T.S10, E.S10, t));
  if (t < T.S12) return lerp(3, 8, ss(T.S11, E.S11, t));
  if (t < T.S13) return lerp(8, 13, ss(T.S12, E.S12, t));
  if (t < T.S14) return lerp(13, 19, ss(T.S13, T.S13 + 1.3, t));
  return 0;
};
const sliceAt = T.S08 + 0.55;
const balMin = (t: number): number => {
  if (t < sliceAt) return 5000;
  const y = yearMin(t);
  return Math.min(4950, 5000 * Math.pow(Math.max(0, 1 - y / MIN_YEARS), 1.4));
};
const intMin = (t: number): number => {
  if (t < T.S07 + 0.7) return 0;
  const y = yearMin(t);
  const f = y / MIN_YEARS;
  return Math.max(92, MIN_INT * (1 - Math.pow(Math.max(0, 1 - f), 1.5)));
};
const payMin = (t: number): number => Math.max(25, balMin(t) * (R + 0.01));
// the flat $200 lane (real amortisation: 22 % APR monthly)
const FLAT = 200;
const mEnd = Math.log(FLAT / (FLAT - 5000 * R)) / Math.log(1 + R);
const yEnd = mEnd / 12;
const yearSv = (t: number): number => {
  if (t < T.S14) return 0;
  if (t < T.S15) return lerp(0, 0.5, ss(T.S14, E.S14, t));
  if (t < T.S16) return lerp(0.5, 1.7, ss(T.S15, E.S15, t));
  return lerp(1.7, yEnd, ss(T.S16, T.S16 + 1.05, t));
};
const balSv = (y: number): number => {
  const m = Math.min(mEnd, y * 12);
  if (m >= mEnd - 1e-6) return 0;
  const q = Math.pow(1 + R, m);
  return Math.max(0, 5000 * q - (FLAT * (q - 1)) / R);
};
const intSv = (y: number): number => Math.max(0, FLAT * Math.min(mEnd, y * 12) - (5000 - balSv(y)));
const isSaverShot = (id: string) => id === "S14" || id === "S15" || id === "S16";

// ------------------------------------------------------------------ shots (lenses)
const L = (o: Partial<FinShot> & Pick<FinShot, "subj" | "fov" | "face" | "mood">): Omit<FinShot, "id" | "a" | "b"> => ({ off: [0, 0, 3], sky: true, ...o });
const sp = (p: V3, dy = 1.05): V3 => [p[0], dy, p[2]];
// Spender's route: stands at the start, later walks, crawls, droops
const WALK_V = 1.1;
const walkPos = (t: number): V3 => [0.8, 0, 0.2 - WALK_V * Math.max(0, t - T.S09)];
const crawlZ = (t: number) => walkPos(E.S10)[2] - 0.3 * Math.max(0, t - T.S11);
const spenderPos = (t: number): V3 => {
  if (t < T.S09) return SP0;
  if (t < T.S11) return walkPos(t);
  if (t < T.S12) return [0.8, 0, crawlZ(t)];
  return [0.8, 0, crawlZ(T.S12)];
};
const saverPos = (t: number): V3 => (t < T.S15 ? [-1.45, 0, -0.95] : [0.5, 0, 0.2 - 1.5 * (t - T.S15)]);
const OPEN_POS: V3 = [1.0, 1.3, 3.8];
const OPEN_SUBJ: V3 = [0.35, 1.05, 0.8];
const PUSH19 = 0.04;
const k19 = 1 - PUSH19 * (E.S19 - T.S19);
const LENS: Record<string, Omit<FinShot, "id" | "a" | "b">> = {
  S01: L({ subj: () => OPEN_SUBJ, pos: OPEN_POS, fov: 52, face: 0.42, mood: "earth", push: PUSH19, roll: [0, 0.6], blur: 1.0 }),
  S02: L({ subj: () => [0.4, 1.0, -9], pos: [0.6, 1.75, 2.9], fov: 55, face: 0.45, mood: "earth", roll: [0, -1.2], blur: 0.7 }),
  S03: L({ subj: () => [-3.55, 1.05, 0.0], off: [0.5, 0.15, 3.4], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.4 }),
  S04: L({ subj: () => [PED[0] + 0.1, PED[1] + 0.36, PED[2] + 0.25], off: [0.05, 0.0, 1.25], fov: 40, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 2.0 }),
  S05: L({ subj: () => [-4.3, 1.4, -1.0], pos: [-3.3, 1.55, 2.6], fov: 55, face: 0.45, mood: "earth", roll: [0, 1.0], blur: 0.9 }),
  S06: L({ subj: () => [-1.9, 1.1, -0.95], off: [0.3, 0.05, 2.9], fov: 50, face: 0.42, mood: "earth", roll: [0, -1.2], blur: 1.4 }),
  S07: L({ subj: () => [SLOT[0], SLOT[1] + 0.2, SLOT[2]], off: [0.15, 0.1, 1.4], fov: 44, face: 0.5, mood: "earth", roll: [0, 1.5], blur: 2.0 }),
  S08: L({ subj: () => [PED[0] + 0.1, PED[1] + 0.1, PED[2]], off: [0.3, 0.2, 1.9], fov: 44, face: 0.5, mood: "earth", roll: [0, -1.5], blur: 2.0 }),
  S09: L({ subj: (t) => sp(spenderPos(t)), off: [1.0, 0.25, -3.0], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.2 }),
  S10: L({ subj: (t) => { const p = spenderPos(t); return [p[0] + 0.4, 0.8, p[2] - 0.15]; }, off: [0.8, 0.2, -1.9], fov: 46, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 2.0 }),
  S11: L({ subj: (t) => [0.8, 0.45, crawlZ(t)], pos: [1.9, 0.8, crawlZ(T.S11) - 3.2], fov: 56, face: 0.5, mood: "whisper", roll: [0, 1.2], blur: 0.9 }),
  S12: L({ subj: () => sp([0.8, 0, crawlZ(T.S12)], 1.0), off: [0.4, 0.1, -3.0], fov: 50, face: 0.45, mood: "whisper", roll: [0, -1.2], blur: 1.3 }),
  S13: L({ subj: () => [-3.9, 1.5, -1.2], pos: [-1.0, 1.4, 4.6], fov: 56, face: 0.5, mood: "whisper", roll: [0, 1.2], blur: 0.8 }),
  S14: L({ subj: () => [-1.7, 1.1, -0.95], off: [0.3, 0.05, 2.9], fov: 50, face: 0.42, mood: "ending", roll: [0, -1.2], blur: 1.4 }),
  S15: L({ subj: (t) => sp(saverPos(t), 1.0), off: [1.0, 0.25, -3.0], fov: 52, face: 0.45, mood: "ending", roll: [0, 1.2], blur: 1.2 }),
  S16: L({ subj: () => [0, 2.3, NG[2]], pos: [3.0, 1.8, 3.8], fov: 64, face: 0.5, mood: "ending", roll: [0, -1.0], blur: 0.8 }),
  S17: L({ subj: () => [CT[0] - 0.1, 1.3, CT[2] - 0.3], pos: [1.0, 1.5, 3.2], fov: 52, face: 0.45, mood: "earth", roll: [0, 1.2], blur: 1.4 }),
  S18: L({ subj: () => [2.55, 1.0, -0.78], pos: [2.6, 1.9, 0.3], fov: 46, face: 0.5, mood: "earth", roll: [0, -1.2], blur: 2.0 }),
  S19: L({
    subj: () => OPEN_SUBJ,
    pos: [OPEN_SUBJ[0] + (OPEN_POS[0] - OPEN_SUBJ[0]) / k19, OPEN_SUBJ[1] + (OPEN_POS[1] - OPEN_SUBJ[1]) / k19, OPEN_SUBJ[2] + (OPEN_POS[2] - OPEN_SUBJ[2]) / k19],
    fov: 52, face: 0.42, mood: "earth", push: PUSH19, roll: [0.6, 0], blur: 1.0,
  }),
};
export const MINPAY_SHOTS = buildShots(PLAN, LENS);

// ------------------------------------------------------------------ props local to this Short
const Block: React.FC<{ p?: V3; sc: number; tag: boolean; ysq?: number; r?: V3 }> = ({ p = [0, 0, 0], sc, tag, ysq = 1, r = [0, 0, 0] }) => (
  <group position={p} rotation={r} scale={[sc, sc * ysq, sc]}>
    <BigBlock p={[0, 0, 0]} size={BLK} color="#d62a2a" text="$5,000" fg="#ffe9a8" />
    {tag ? <Label p={[0.16, 0.4, BLK[2] / 2 + 0.03]} text={["22% APR", "EXAMPLE"]} w={0.3} h={0.15} bg="#d41414" fg="#ffffff" glow={0.12} r={[0, 0, -0.3]} /> : null}
  </group>
);
const Snail: React.FC<{ p: V3; yaw: number }> = ({ p, yaw }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.12, 0.05, 0.34, 0.02)} material={plastic("#9be36e", { rough: 0.6 })} position={[0, 0.025, 0]} castShadow />
    <mesh geometry={geoOf("snailShell", () => new THREE.SphereGeometry(0.1, 14, 10))} material={plastic("#e0802a", { rough: 0.5 })} position={[0, 0.11, -0.05]} castShadow />
    <mesh geometry={rbox(0.03, 0.03, 0.1, 0.01)} material={plastic("#e0802a")} position={[0, 0.11, -0.05]} />
    {[-0.035, 0.035].map((x) => (
      <mesh key={x} geometry={rbox(0.014, 0.09, 0.014, 0.005)} material={plastic("#9be36e")} position={[x, 0.1, 0.15]} />
    ))}
  </group>
);
const HOUSE_COL = ["#ffd27a", "#8fd6ff", "#ff9ab0", "#b9f08a", "#d3b2ff", "#ffb27a"];
const Suburb: React.FC = () => (
  <group>
    {Array.from({ length: 26 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const k = Math.floor(i / 2);
      const z = 2 - k * 6.2 - (side > 0 ? 1.5 : 0);
      const x = side * (4.6 + 0.6 * hash(i));
      const c = HOUSE_COL[i % HOUSE_COL.length];
      if (side > 0 && z > -4 && z < 3.5) return null;
      return (
        <group key={i} position={[x, 0, z]} rotation={[0, -side * 0.18, 0]}>
          <mesh geometry={rbox(2.3, 1.5, 2.1, 0.06)} material={plastic(c, { rough: 0.7 })} position={[0, 0.75, 0]} castShadow receiveShadow />
          <mesh geometry={geoOf("roofCone", () => new THREE.ConeGeometry(1.0, 0.8, 4))} material={plastic("#d6513b", { rough: 0.7 })} position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.7, 1, 1.5]} castShadow />
          <mesh geometry={rbox(0.4, 0.85, 0.05, 0.01)} material={plastic("#5a3a8a")} position={[-side * 0.5, 0.43, 1.06]} />
          <mesh geometry={rbox(0.5, 0.4, 0.05, 0.01)} material={plastic("#cfeaff", { rough: 0.2, emissive: "#8fd6ff", ei: 0.15 })} position={[side * 0.55, 0.9, 1.06]} />
        </group>
      );
    })}
    {Array.from({ length: 22 }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const z = 0 - Math.floor(i / 2) * 5.3 - 1.2;
      if (i % 2 && z > -3 && z < 0.5) return null;
      return (
        <group key={i} position={[side * (2.75 + 0.3 * hash(i + 9)), 0, z]}>
          <mesh geometry={rbox(0.14, 0.7, 0.14, 0.03)} material={plastic("#7a4a2a")} position={[0, 0.35, 0]} castShadow />
          <mesh geometry={rbox(0.8, 0.8, 0.8, 0.12)} material={plastic("#3fae48", { rough: 0.8 })} position={[0, 1.05, 0]} castShadow />
        </group>
      );
    })}
  </group>
);
const Gate: React.FC<{ p: V3; w: number; h: number; big?: number; calendars?: boolean; t: number }> = ({ p, w, h, big = 1, calendars = false, t }) => (
  <group position={p} scale={big}>
    {[-1, 1].map((s) => (
      <mesh key={s} geometry={rbox(0.4, h, 0.4, 0.05)} material={plastic("#e8f6ff", { rough: 0.5 })} position={[(s * w) / 2, h / 2, 0]} castShadow />
    ))}
    <mesh geometry={rbox(w + 0.5, 0.4, 0.45, 0.05)} material={plastic("#1f9e4f", { rough: 0.5 })} position={[0, h + 0.2, 0]} castShadow />
    <Sign p={[0, h + 0.95, 0.05]} text="PAID OFF" w={w * 0.82} h={0.8} color="#7dffb0" bg="#0f3a22" glow={1.6} />
    {calendars
      ? [0, 1, 2].map((i) => <FlipCalendar key={i} p={[(i - 1) * 1.05, h + 2.0, 0.1]} w={0.9} h={0.75} title="YEAR" value={String(i + 1)} />)
      : null}
    <pointLight position={[0, h + 0.8, 1.2]} color="#9fffc8" intensity={1.0} distance={6} decay={2} />
    {t < 0 ? null : null}
  </group>
);
/** a calendar page that blows past the lens (S12) */
const Page: React.FC<{ tau: number; i: number; z: number; y: number }> = ({ tau, i, z, y }) => {
  const u = (tau - 0.1 - 0.22 * i) / 0.55;
  if (u <= 0 || u >= 1) return null;
  const x = lerp(2.6, -2.8, u);
  return <Label p={[0.4 + x * 0.7, y + 0.35 * Math.sin(u * 5 + i) + 0.2 * i - 0.1, z + 0.2 * Math.cos(u * 4 + i)]} text={["YEAR", String(8 + i + 1)]} w={0.55} h={0.42} bg="#fffaf0" fg="#16121c" r={[0.4 * Math.sin(u * 6 + i), Math.PI + 0.5 - 1.0 * u, 0.6 * Math.sin(u * 7 + i)]} />;
};
const GREY: Look = { ...SPENDER, skin: "#b98480", hair: "#8d7d7d", shirt: "#8f3c3c" };

// ------------------------------------------------------------------ the scene
const blockScale = (bal: number) => Math.pow(Math.max(0.0001, bal / 5000), 1 / 3);
const chestBlock = (sc: number, lift = 0, ysq = 1): React.ReactNode => (
  <group position={[0, -0.2 + lift, 0.27]}>
    <Block sc={0.78 * sc} tag ysq={ysq} />
  </group>
);

const scene = (t: number, shot: FinShot, tau: number): React.ReactNode => {
  const id = shot.id;
  const actors: React.ReactNode[] = [];
  const loop = id === "S01" || id === "S19";
  const saver = isSaverShot(id);
  const minYear = loop || id === "S17" || id === "S18" || id === "S03" || id === "S04" || id === "S05" || id === "S06" || id === "S02" ? 0 : yearMin(t);
  const bal = saver ? balSv(yearSv(t)) : id === "S07" || id === "S06" || id === "S02" || loop || id === "S17" || id === "S18" ? 5000 : balMin(t);
  const sliceU = id === "S08" ? ss(0.35, 1.05, tau) : 0;
  const bsc = blockScale(bal);
  void minYear;

  // ---- Lender (always by the booth; stamps in S03; slumps nothing: a friendly navy hat)
  {
    const p = P_LEND;
    const yaw = id === "S03" || id === "S04" ? 0.95 : id === "S06" || id === "S07" ? 0.7 : yawTo(p, [0.5, 0, 3]) * 0.7;
    const stamp = id === "S03" ? ss(0.35, 0.55, tau) - ss(0.6, 0.85, tau) : 0;
    const pose: Pose = {
      ...stand(p[0], p[2], yaw, S.lender),
      armR: 0.25 + 1.55 * stamp + (id === "S03" ? 0.15 * Math.sin(tau * 5) : 0),
      outR: 0.1,
      armL: id === "S05" ? 1.2 : 0.15,
      outL: id === "S05" ? 0.5 : 0.1,
      headPitch: id === "S03" ? 0.12 : 0,
    };
    actors.push(<Act key="lender" look={LENDER} pose={pose} emotion={id === "S06" || id === "S07" || id === "S13" ? "sly" : "happy"} s={S.lender} t={t} seed={5} />);
  }
  // ---- Teller behind the statement counter (S17, S18 and the loop frame)
  if (id === "S17" || id === "S18") {
    const slide = ss(0.15, 0.9, tau);
    const pose: Pose = { ...stand(P_TELL[0], P_TELL[2], yawTo(P_TELL, [3.4, 0, 3]), S.teller), armL: 0.9 * slide + 0.15, armR: 0.9 * slide + 0.15, outL: 0.1, outR: 0.1 };
    actors.push(<Act key="teller" look={TELLER} pose={pose} emotion="happy" s={S.teller} t={t} seed={3} />);
  }
  // ---- Spender
  if (!saver) {
    let p: V3 = SP0;
    let pose: Pose;
    let emo: Emotion = "sad";
    let chest: React.ReactNode = undefined;
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    let look: Look = SPENDER;
    const hug = { armL: 1.05, armR: 1.05, outL: -0.12, outR: -0.12 };
    const camYaw = (q: V3) => yawTo(q, [1.2, 0, 3.2]);
    const bsl = blockScale(balMin(t));
    if (loop) {
      // lifting the heavy block again and again (a period equal to the shot, so the loop is seamless)
      const ph = Math.sin((2 * Math.PI * (id === "S01" ? tau : tau)) / 1.3);
      p = SP0;
      pose = { ...stand(p[0], p[2], camYaw(p) * 0.8 + 0.25, S.spender), ...hug, armL: 1.0 + 0.1 * ph, armR: 1.0 + 0.1 * ph, pitch: 0.06 - 0.05 * ph, headPitch: 0.05 };
      chest = chestBlock(1, 0.03 * ph);
      emo = "shock";
    } else if (id === "S02") {
      p = [0.15, 0, 0.5];
      pose = { ...stand(p[0], p[2], Math.PI, S.spender), ...hug, armL: 1.0, armR: 1.0 };
      emo = "sad";
      chest = chestBlock(1);
    } else if (id === "S03" || id === "S04" || id === "S05") {
      p = [-1.35, 0, 0.7];
      pose = { ...stand(p[0], p[2], yawTo(p, P_LEND) * 0.5 + 0.1, S.spender), armL: 0.15, armR: 0.15, headYaw: 0.2 };
      emo = id === "S05" ? "curious" : "shock";
    } else if (id === "S06" || id === "S07") {
      p = [-1.45, 0, -0.95];
      const drop = id === "S06" ? ss(0.25, 0.7, tau) : 1;
      pose = { ...stand(p[0], p[2], -0.35, S.spender), armR: lerp(0.3, 0.55, drop), outR: lerp(0.4, 1.9, ss(0.0, 0.45, id === "S06" ? tau : 1)), armL: 0.15, outL: 0.1, headYaw: 0.2, ant: 0.4 };
      emo = id === "S06" ? "happy" : "joy";
      if (id === "S06" && tau < 0.45) held = { side: "R", node: <Coin p={[0, 0.1, 0.0]} r={[Math.PI / 2, 0, 0]} s={1.8} /> };
    } else if (id === "S08") {
      p = [-1.8, 0, 0.9];
      pose = { ...stand(p[0], p[2], yawTo(p, PED) * 0.4 + 0.2, S.spender), armL: 0.15, armR: 0.15, headPitch: 0.2 };
      emo = "shock";
    } else if (id === "S09" || id === "S10") {
      p = walkPos(t);
      const f = id === "S09" ? 0 : 1;
      const w = walk(p[0], p[2], Math.PI, 0, 0, 0, S.spender);
      const ph = 2 * Math.PI * 1.1 * (t - T.S09);
      const psi = 0.42 * Math.sin(ph);
      pose = { ...w, legL: psi, legR: -psi, armL: 1.0, armR: 1.0 + 0.0 * f, outL: -0.12, outR: -0.12, bob: -0.015 * (0.5 + 0.5 * Math.cos(2 * ph)), headYaw: 0.9 };
      chest = chestBlock(bsl, 0, 1);
      // his coin shrinks with the payment (right hand, outside, nearest to the lens)
      const sc = lerp(3.4, 1.4, clamp((142 - payMin(t)) / 142 / 0.7));
      pose = { ...pose, armR: 0.5, outR: 0.35, armL: 1.0 };
      held = { side: "R", node: <Coin p={[0, 0.07, 0.07]} r={[Math.PI / 2, 0, 0.2]} s={sc} /> };
      emo = "sad";
      void held;
    } else if (id === "S11") {
      p = [0.8, 0, crawlZ(t)];
      const ph = 2 * Math.PI * 0.9 * (t - T.S11);
      pose = { ...stand(p[0], p[2], Math.PI, S.spender), y: 0.24, pitch: 1.3, legL: -0.2 + 0.25 * Math.sin(ph), legR: -0.2 - 0.25 * Math.sin(ph), armL: -1.2 + 0.3 * Math.sin(ph), armR: -1.2 - 0.3 * Math.sin(ph), outL: 0.1, outR: 0.1, headPitch: -0.9, headYaw: 0.5, ant: -0.6 };
      chest = undefined;
      emo = "sad";
    } else if (id === "S12" || id === "S13") {
      p = [0.8, 0, crawlZ(T.S12)];
      pose = { ...stand(p[0], p[2], camYaw(p) * 0.9, S.spender), armL: 0.1, armR: 0.1, headPitch: 0.35, pitch: 0.12, ant: -1 };
      look = GREY;
      emo = "sad";
    } else {
      // S17, S18: in front of the statement counter, ignoring nothing yet
      p = [2.6, 0, 0.2];
      pose = { ...stand(p[0], p[2], yawTo(p, [3.0, 0, -0.9]) * 0.5 + 0.3, S.spender), armL: 0.15, armR: 0.15, headPitch: 0.15 };
      emo = "curious";
    }
    actors.push(<Act key="spender" look={look} pose={pose} emotion={emo} s={S.spender} t={t} seed={2} chest={chest} held={held} />);
    // crawling: the block sits on his back
    if (id === "S11") {
      const q = spenderPos(t);
      actors.push(
        <group key="backblock" position={[q[0], 0.62, q[2] + 0.22]}>
          <Block sc={0.62 * bsl} tag />
        </group>,
      );
    }
  }
  // ---- Saver (the flat-payment lane)
  if (saver) {
    const q = saverPos(t);
    let pose: Pose;
    let held: { side: "L" | "R"; node: React.ReactNode } | undefined;
    let emo: Emotion = "happy";
    let chest: React.ReactNode = undefined;
    if (id === "S14") {
      pose = { ...stand(q[0], q[2], -0.3, S.saver), armR: 0.55, outR: lerp(0.4, 1.9, ss(0, 0.5, tau)), armL: 0.15, headYaw: 0.2 };
      if (tau < 0.5) held = { side: "R", node: <Coin p={[0, 0.1, 0]} r={[Math.PI / 2, 0, 0]} s={3.2} /> };
      emo = "joy";
      chest = undefined;
    } else {
      const ph = 2 * Math.PI * 1.1 * (t - T.S15);
      const psi = 0.42 * Math.sin(ph);
      pose = { ...stand(q[0], q[2], Math.PI, S.saver), legL: psi, legR: -psi, armL: 1.0, armR: 1.0, outL: -0.12, outR: -0.12, bob: -0.015 * (0.5 + 0.5 * Math.cos(2 * ph)), headYaw: id === "S15" ? 0.9 : 0.5 };
      chest = bal > 1 ? chestBlock(bsc) : undefined;
      emo = "joy";
    }
    actors.push(<Act key="saver" look={SAVER} pose={pose} emotion={emo} s={S.saver} t={t} seed={4} chest={chest} held={held} />);
  }

  // ---- the block on the pedestal (S03-S08)
  const onPed = id === "S03" || id === "S04" || id === "S05" || id === "S06" || id === "S07" || id === "S08";
  const tagOn = id === "S03" ? tau > 0.55 : true;
  const tagPop = id === "S03" ? pop(clamp((tau - 0.55) / 0.35)) : 1;
  void tagPop;
  // ---- the coin that splits (S06, S07)
  const coinStuff: React.ReactNode[] = [];
  if (id === "S06") {
    if (tau >= 0.45) {
      const u = clamp((tau - 0.45) / 0.3);
      coinStuff.push(<Coin key="c" p={[SLOT[0], SLOT[1] + 0.18 * (1 - u) + 0.03, SLOT[2]]} r={[Math.PI / 2, 0, 0]} s={1.8} />);
    }
  }
  if (id === "S07") {
    const u = clamp((tau - 0.15) / 0.3); // the whole coin sits in the slot, then splits
    if (tau < 0.3) coinStuff.push(<Coin key="c" p={[SLOT[0], SLOT[1] + 0.06 - 0.05 * u, SLOT[2]]} r={[Math.PI / 2, 0, 0]} s={1.8} />);
    const sp2 = clamp((tau - 0.3) / 0.8);
    if (tau >= 0.3) {
      // the red interest half-coin sinks into the booth, glowing
      const sink = ss(0.25, 0.85, sp2);
      coinStuff.push(<Coin key="red" p={[SLOT[0] + 0.02, SLOT[1] + 0.12 - 0.3 * sink, SLOT[2] + 0.04]} r={[Math.PI / 2, 0, 0.3]} s={1.7 * (1 - 0.6 * sink)} tint="#ff3b30" glow={1.2} />);
      coinStuff.push(<Label key="int" p={[SLOT[0] + 0.05, SLOT[1] + 0.5 + 0.12 * sp2, SLOT[2] + 0.2]} text={["INTEREST"]} w={0.6} h={0.2} bg="#2a0a0a" fg="#ff6a5f" glow={1.0 * (1 - 0.4 * sp2)} />);
      // the sliver flies to the block
      const f = ss(0.0, 1.0, sp2);
      const from: V3 = [SLOT[0] + 0.1, SLOT[1] + 0.1, SLOT[2] + 0.1];
      const to: V3 = [PED[0] + 0.1, PED[1] + 0.3, PED[2] + 0.2];
      coinStuff.push(<Coin key="sl" p={[lerp(from[0], to[0], f), lerp(from[1], to[1], f) + 0.3 * Math.sin(Math.PI * f), lerp(from[2], to[2], f)]} r={[f * 8, 0.3, f * 5]} s={0.9} glow={0.4} />);
    }
  }
  // the falling slice (S08)
  const slice =
    id === "S08" && sliceU > 0 ? (
      <mesh
        key="slice"
        geometry={rbox(BLK[0], 0.03, BLK[2], 0.008)}
        material={plastic("#d62a2a", { rough: 0.4 })}
        position={[PED[0] + 0.25 * sliceU, Math.max(0.03, PED[1] + BLK[1] * 0.93 - 0.9 * sliceU * sliceU * 1.2), PED[2] + 0.3 * sliceU]}
        rotation={[0.9 * sliceU, 0.8 * sliceU, 0.5 * sliceU]}
        castShadow
      />
    ) : null;

  // ---- the red interest pile behind the booth (grows with the interest paid)
  const intNow = id === "S13" || id === "S12" || id === "S11" ? intMin(t) : 0;
  const pk = Math.pow(intNow / MIN_INT, 0.85);
  const pileH = id === "S13" ? lerp(0.6, 2.9, pk) : 0;

  // ---- the statement (S17, S18)
  const stmt = id === "S17" || id === "S18";
  const slideZ = id === "S17" ? lerp(-1.02, -0.72, ss(0.2, 1.0, tau)) : -0.72;
  const glow = id === "S18" ? ss(0.35, 0.8, tau) * (0.85 + 0.15 * Math.sin(tau * 12)) : 0;

  const farGate = id !== "S16";
  const tNow = t;
  return (
    <>
      <Ground road roadW={3.2} len={160} grass="#6ccf55" kerb="#8a84a6" />
      <Suburb />
      {farGate ? <Gate p={FAR_GATE} w={5.2} h={3.6} big={1.6} t={tNow} /> : null}
      {id === "S16" ? <Gate p={NG} w={3.9} h={2.7} calendars t={tNow} /> : null}
      {id === "S16" ? <HoloTag p={[2.6, 1.9, NG[2] + 0.6]} text="~3 YEARS" t={t} w={1.1} /> : null}
      {/* roadside signs */}
      <Sign p={[2.1, 1.35, -3.2]} text="19 YEARS AHEAD" w={1.25} h={0.3} color="#ffd23a" yaw={-0.5} />
      <mesh geometry={rbox(0.1, 1.3, 0.1, 0.02)} material={plastic("#3a3f58")} position={[2.1, 0.65, -3.2]} />
      {/* the toll booth + display */}
      <TollBooth p={BO} display={["22%", "APR"]} />
      {/* block on the pedestal */}
      <Pedestal p={[PED[0], 0, PED[2]]} h={PED[1]} r={0.3} color="#9a88d8" ring="#157a6e" />
      {onPed ? <Block p={[PED[0], PED[1], PED[2]]} sc={1} tag={tagOn} ysq={1 - 0.07 * sliceU} /> : null}
      {coinStuff}
      {slice}
      {/* the chart board (S05) */}
      <ChartRed t={t} tau={tau} id={id} />
      {/* the red coin pile */}
      {pileH > 0.05 ? <CoinPile p={PILE} r={lerp(0.4, 1.7, pileH / 2.9)} h={pileH} coins={140} tint="#e03a32" glow={0.2} /> : null}
      {id === "S13" ? <HoloTag p={[-3.1, 2.55, 0.9]} text="$8,099 INTEREST" t={t} w={1.5} /> : null}
      {/* snail (S11) */}
      {id === "S11" ? <Snail p={[1.5, 0, crawlZ(T.S11) + 0.4 - 0.65 * (t - T.S11)]} yaw={Math.PI} /> : null}
      {/* calendar pages (S12) */}
      {id === "S12" ? [0, 1, 2, 3, 4].map((i) => <Page key={i} tau={tau} i={i} z={crawlZ(T.S12) - 1.2} y={0.45} />) : null}
      {/* the statement counter */}
      <Desk p={CT} />
      {stmt ? (
        <group>
          <Label p={[2.55, 1.0, slideZ]} text={["STATEMENT", "BALANCE $5,000"]} w={0.5} h={0.66} r={[-Math.PI / 2, 0, 0.05]} bg="#fffdf6" fg="#16121c" />
          <Label p={[2.55, 1.012, slideZ + 0.1]} text={["MINIMUM PAYMENT", "WARNING"]} w={0.44} h={0.2} r={[-Math.PI / 2, 0, 0.05]} bg="#ffe27a" fg="#c01818" border="#c01818" glow={0.25 * glow} />
        </group>
      ) : null}
      {actors}
    </>
  );
};
const ChartRed: React.FC<{ t: number; tau: number; id: string }> = ({ tau, id }) => {
  const vals = Array.from({ length: 12 }, (_, i) => 0.78 + 0.02 * Math.sin(i * 1.7));
  const draw = id === "S05" ? ss(0.05, 1.4, tau) : 1;
  return (
    <group>
      <group position={CHART} rotation={[0, 0.35, 0]}>
        <ChartBoardLazy draw={draw} vals={vals} />
      </group>
    </group>
  );
};
const ChartBoardLazy: React.FC<{ draw: number; vals: number[] }> = ({ draw, vals }) => (
  <group>
    <ChartBoard p={[0, 0, 0]} w={2.0} h={1.3} title="U.S. AVG ≈ 22% APR" values={vals} color="#ff4a3f" draw={draw} board="#2a1030" />
    <Label p={[0, 0.6, 0.06]} text={["SOURCE: FED G.19"]} w={1.3} h={0.2} bg="#fff4c8" fg="#16121c" />
  </group>
);

// ------------------------------------------------------------------ counter
const counter = (t: number, shot: FinShot, tau: number): CounterState => {
  const id = shot.id;
  if (isSaverShot(id)) {
    const y = yearSv(t);
    const b = balSv(y);
    const done = b <= 0.5;
    return {
      lines: [
        { text: `BALANCE ${usd(b, false)}`, color: done ? GOLD : GREEN },
        { text: `INTEREST PAID ${usd(intSv(y), false)} · YEAR ${y.toFixed(1)}`, color: "#ffffff", size: 38 },
        { text: "FLAT $200 / MONTH", color: GREEN, size: 38 },
      ],
      pop: id === "S16" ? clamp((tau - 1.0) / 0.3) : 0,
      accent: "#7dffb0",
    };
  }
  const resetWorld = id === "S01" || id === "S19" || id === "S17" || id === "S18" || id === "S02" || id === "S03" || id === "S04" || id === "S05" || id === "S06";
  const b = resetWorld ? 5000 : id === "S07" ? 5000 : balMin(t);
  const i = resetWorld ? 0 : intMin(t);
  const y = resetWorld ? 0 : Math.floor(yearMin(t) + 1e-6);
  const lines = [
    { text: `BALANCE ${usd(b, false)}`, color: b <= 0.5 ? GREEN : "#ffffff" },
    { text: `INTEREST PAID ${usd(i, false)} · YEAR ${y}`, color: RED, size: 38 },
  ] as { text: string; color?: string; size?: number }[];
  if (id === "S09" || id === "S10") lines.push({ text: `PAYMENT ${usd(payMin(t), false)} / MONTH`, color: GOLD, size: 38 });
  if (id === "S04") lines.push({ text: "22% APR · EXAMPLE", color: GOLD, size: 38 });
  if (id === "S18") lines.push({ text: "READ THE WARNING", color: GOLD, size: 38 });
  const popAt = id === "S07" ? clamp((tau - 0.65) / 0.3) : id === "S08" ? clamp((tau - 0.5) / 0.3) : id === "S13" ? clamp((tau - 1.1) / 0.4) : 0;
  return { lines, pop: popAt, accent: "#ff8a7a" };
};

export const MINPAY_SPEC: FinSpec = {
  slug: "minimum-payment-trap",
  shots: MINPAY_SHOTS,
  duration: DURATION,
  chunks: casedChunks(CAPTIONS, SCRIPT, DURATION),
  until: DURATION / 30,
  whisper: [],
  ending: [],
  scene,
  counter,
  tag: (t, shot) => (isSaverShot(shot.id) ? "EXAMPLE: $5,000 · 22% APR · $200 / MONTH" : t < 3 || shot.id === "S19" ? "EXAMPLE: $5,000 · 22% APR · MIN = INTEREST + 1%" : "EXAMPLE"),
  bg: "#8fd0ff",
};
export const _unused = { heldWorld, SAVER };

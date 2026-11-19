// Easter eggs + the double payoff (finance/FORMAT_V1.md "Retention tactics"): small recurring background gags that
// reward a pause or a rewatch and link the Shorts together. All our own designs (no characters from any pack):
//   cat     a tiny blocky cat that sneaks along a path, grabs a coin at the far end and walks back with it
//   tv19    Spender's TV from episode 1 ("YEAR 19" on its screen)
//   sticky  a yellow sticky note with a one-line joke
//   mug     a "BLOCK MONEY" mug
// recipe.eggs places 1-2 in the background of every shot of a set (each set has default spots; `at` overrides);
// recipe.finalGag plays one gag in the last 0.5-1 s after the spoken payoff (the cat steals a coin, the TV falls over,
// the sticky note flutters down). Everything is a pure function of t and goes through the clip QA (eggBoxes).
import React from "react";
import { clamp, hash, lerp } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";
import { B, TV } from "../hooks";
import { Label } from "../props";
import { Coin3 } from "../v1/kit";
import type { Box } from "../v1/kit";
import type { SetId } from "./types";

export type EggId = "cat" | "tv19" | "sticky" | "mug";
export type EggSpec = EggId | { egg: EggId; at?: V3; to?: V3; yaw?: number; text?: string };
export type GagId = "catCoin" | "tvFall" | "stickyFall";
export type FinalGag = { gag: GagId; at?: V3; from?: number };

/** default background spots per set: cat = a walk [from, to] on some surface; the others a point (+ yaw, deg) */
export const EGG_SPOTS: Record<SetId, { cat: [V3, V3]; tv19: [V3, number]; sticky: [V3, number]; mug: [V3, number] }> = {
  store: { cat: [[4.15, 1.52, -2.85], [5.05, 1.52, -2.85]], tv19: [[-4.85, 1.52, -1.2], 90], sticky: [[4.23, 1.35, 0.6], -90], mug: [[2.15, 1.1, -2.85], 10] },
  home: { cat: [[-2.3, 0.94, -2.85], [-0.9, 0.94, -2.85]], tv19: [[4.6, 1.9, -1.4], -90], sticky: [[-4.38, 1.4, -1.0], 90], mug: [[-1.35, 0.38, -1.3], 20] },
  street: { cat: [[-2.6, 0.12, -2.35], [-1.0, 0.12, -2.35]], tv19: [[5.2, 0.12, -3.6], -20], sticky: [[-3.05, 1.5, -2.55], 0], mug: [[-0.3, 0.12, -2.4], 15] },
  bank: { cat: [[0.6, 1.04, -0.95], [1.2, 1.04, -0.95]], tv19: [[4.2, 0, -1.9], -30], sticky: [[0.9, 1.5, -1.07], 0], mug: [[-0.9, 1.04, -0.85], 10] },
  office: { cat: [[-3.0, 0.78, -2.2], [-1.9, 0.78, -2.2]], tv19: [[-4.6, 1.9, -2.9], 0], sticky: [[-2.4, 1.0, -2.5], 0], mug: [[2.8, 0.78, -2.2], 20] },
};
const JOKES = ["BUDGET: LOL", "DON'T BUY TV", "IOU $5", "SAVE LATER?", "COFFEE FUND: $0"];

// ------------------------------------------------------------------ the cat (our own blocky design)
const CAT = { body: "#f0a040", stripe: "#c8742a", belly: "#fff4e0", eye: "#17161c" };
/** a tiny blocky cat facing +z of its group; walk phase w (rad) moves the legs and tail; carry shows a coin in its mouth */
export const BlockCat: React.FC<{ p: V3; yaw: number; w: number; carry?: boolean; s?: number }> = ({ p, yaw, w, carry = false, s = 1 }) => {
  const leg = (x: number, z: number, ph: number) => <B key={`${x}${z}`} s={[0.04, 0.07, 0.04]} p={[x, 0.035 + 0.012 * Math.max(0, Math.sin(w + ph)), z + 0.015 * Math.sin(w + ph)]} c={CAT.body} />;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      <B s={[0.12, 0.09, 0.24]} p={[0, 0.11, 0]} c={CAT.body} />
      <B s={[0.125, 0.02, 0.05]} p={[0, 0.145, -0.04]} c={CAT.stripe} />
      <B s={[0.125, 0.02, 0.05]} p={[0, 0.145, 0.04]} c={CAT.stripe} />
      <B s={[0.1, 0.03, 0.16]} p={[0, 0.07, 0]} c={CAT.belly} />
      {leg(0.035, 0.08, 0)}
      {leg(-0.035, 0.08, Math.PI)}
      {leg(0.035, -0.08, Math.PI)}
      {leg(-0.035, -0.08, 0)}
      {/* head + ears + eyes */}
      <group position={[0, 0.17, 0.14]} rotation={[0.1 * Math.sin(w * 0.5), 0.15 * Math.sin(w * 0.25), 0]}>
        <B s={[0.11, 0.09, 0.09]} p={[0, 0, 0]} c={CAT.body} />
        <B s={[0.03, 0.04, 0.02]} p={[0.035, 0.06, -0.01]} c={CAT.stripe} r={[0, 0, -0.3]} />
        <B s={[0.03, 0.04, 0.02]} p={[-0.035, 0.06, -0.01]} c={CAT.stripe} r={[0, 0, 0.3]} />
        <B s={[0.016, 0.022, 0.006]} p={[0.025, 0.01, 0.046]} c={CAT.eye} />
        <B s={[0.016, 0.022, 0.006]} p={[-0.025, 0.01, 0.046]} c={CAT.eye} />
        <B s={[0.02, 0.012, 0.006]} p={[0, -0.015, 0.046]} c="#ff8aa0" />
        {carry ? <Coin3 p={[0, -0.04, 0.07]} r={[Math.PI / 2, 0, 0]} s={1.2} /> : null}
      </group>
      {/* tail: up and swishing */}
      <B s={[0.025, 0.14, 0.025]} p={[0.02 * Math.sin(w * 0.7), 0.2, -0.13]} r={[-0.5, 0, 0.3 * Math.sin(w * 0.7)]} c={CAT.stripe} />
    </group>
  );
};
/** cat state at t on a ping-pong path: out without a coin, back with it (the coin waits at the far end until then) */
export const catAt = (from: V3, to: V3, t: number, speed = 0.35, seed = 1) => {
  const L = Math.max(0.2, Math.hypot(to[0] - from[0], to[2] - from[2]));
  const pause = 0.6; // sniffs the coin at the far end
  const cyc = 2 * L / speed + 2 * pause;
  const d = ((t + seed * 1.7) % cyc + cyc) % cyc;
  const out = L / speed;
  let u: number, dir: 1 | -1, carry: boolean, moving = true;
  if (d < out) { u = d / out; dir = 1; carry = false; }
  else if (d < out + pause) { u = 1; dir = 1; carry = d > out + pause * 0.6; moving = false; }
  else if (d < 2 * out + pause) { u = 1 - (d - out - pause) / out; dir = -1; carry = true; }
  else { u = 0; dir = -1; carry = false; moving = false; }
  const p: V3 = [lerp(from[0], to[0], u), lerp(from[1], to[1], u), lerp(from[2], to[2], u)];
  const yaw = Math.atan2((to[0] - from[0]) * dir, (to[2] - from[2]) * dir);
  return { p, yaw, w: moving ? t * 16 : 0, carry, coinAtEnd: !carry && u < 1 - 1e-3 || (!carry && d < out + pause * 0.6) };
};

// ------------------------------------------------------------------ the other eggs
export const Mug: React.FC<{ p: V3; yaw?: number }> = ({ p, yaw = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh position={[0, 0.06, 0]} castShadow>
      <cylinderGeometry args={[0.045, 0.042, 0.12, 20]} />
      <meshStandardMaterial color="#1f9e4f" roughness={0.5} />
    </mesh>
    <B s={[0.02, 0.06, 0.05]} p={[0.055, 0.065, 0]} c="#1f9e4f" />
    <Label p={[0, 0.065, 0.047]} text={["BLOCK", "MONEY"]} w={0.07} h={0.05} bg="#ffd23a" fg="#16121c" />
  </group>
);
export const Sticky: React.FC<{ p: V3; yaw?: number; text: string; r?: V3 }> = ({ p, yaw = 0, text, r = [0, 0, 0.06] }) => (
  <group position={p} rotation={[r[0], yaw + r[1], r[2]]}>
    <Label p={[0, 0, 0.006]} text={[text]} w={0.2} h={0.2} bg="#ffe45a" fg="#16121c" />
  </group>
);
export const OldTV19: React.FC<{ p: V3; yaw?: number; tip?: number }> = ({ p, yaw = 0, tip = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <group rotation={[tip * 1.45, 0, 0]} position={[0, 0, -0.06 * tip]}>
      <TV p={[0, 0, 0]} s={0.3} screen={["YEAR 19"]} screenBg="#c01818" />
    </group>
  </group>
);

// ------------------------------------------------------------------ placing eggs + the final gag
export type EggPlaced = { egg: EggId; at: V3; to?: V3; yaw: number; text: string; seed: number };
export const placeEggs = (setId: SetId, eggs: EggSpec[] | undefined): EggPlaced[] =>
  (eggs ?? []).map((e, i) => {
    const o = typeof e === "string" ? { egg: e } : e;
    const sp = EGG_SPOTS[setId];
    if (o.egg === "cat") return { egg: "cat", at: o.at ?? sp.cat[0], to: o.to ?? sp.cat[1], yaw: 0, text: "", seed: i + 1 };
    const [p, yaw] = sp[o.egg];
    return { egg: o.egg, at: o.at ?? p, yaw: ((o.yaw ?? yaw) * Math.PI) / 180, text: o.text ?? JOKES[Math.floor(hash(i + 3) * JOKES.length)], seed: i + 1 };
  });
/** the final gag's progress 0..1 over its window (0 before), and its window start */
export const gagU = (g: FinalGag | undefined, end: number, t: number) => {
  if (!g) return 0;
  const t0 = g.from ?? end - 0.8;
  return clamp((t - t0) / Math.max(0.2, end - t0 - 0.05));
};
export const EggsView: React.FC<{ eggs: EggPlaced[]; t: number; gag?: FinalGag; gu: number }> = ({ eggs, t, gag, gu }) => (
  <>
    {eggs.map((e, i) => {
      if (e.egg === "cat") {
        // final gag "catCoin": the cat dashes the whole path with the coin
        const c = gag?.gag === "catCoin" && gu > 0 ? { p: [lerp(e.at[0], e.to![0], gu), lerp(e.at[1], e.to![1], gu), lerp(e.at[2], e.to![2], gu)] as V3, yaw: Math.atan2(e.to![0] - e.at[0], e.to![2] - e.at[2]), w: t * 26, carry: true, coinAtEnd: false } : catAt(e.at, e.to!, t, 0.35, e.seed);
        return (
          <group key={i}>
            <BlockCat p={c.p} yaw={c.yaw} w={c.w} carry={c.carry} />
            {c.coinAtEnd ? <Coin3 p={[e.to![0], e.to![1] + 0.012, e.to![2]]} r={[0, 0, 0]} s={1.3} /> : null}
          </group>
        );
      }
      if (e.egg === "mug") return <Mug key={i} p={e.at} yaw={e.yaw} />;
      if (e.egg === "sticky") {
        const fall = gag?.gag === "stickyFall" ? gu : 0;
        return <Sticky key={i} p={[e.at[0] + 0.15 * Math.sin(fall * 9), e.at[1] - (e.at[1] - 0.02) * fall * fall, e.at[2] + 0.1 * fall]} yaw={e.yaw} text={e.text} r={[fall * 1.4, 0, 0.06 + fall * 2]} />;
      }
      return <OldTV19 key={i} p={e.at} yaw={e.yaw} tip={gag?.gag === "tvFall" ? Math.min(1, gu * gu * 1.6) : 0} />;
    })}
  </>
);
/** QA boxes for the eggs at t (the cat moves; a falling TV / sticky is boxed where it is) */
export const eggBoxes = (eggs: EggPlaced[], t: number, gag?: FinalGag, gu = 0): Box[] =>
  eggs.map((e, i): Box => {
    if (e.egg === "cat") {
      const p = gag?.gag === "catCoin" && gu > 0 ? [lerp(e.at[0], e.to![0], gu), lerp(e.at[1], e.to![1], gu), lerp(e.at[2], e.to![2], gu)] : catAt(e.at, e.to!, t, 0.35, e.seed).p;
      return { name: `egg.cat${i}`, c: [p[0], p[1] + 0.12, p[2]], h: [0.14, 0.12, 0.14] };
    }
    if (e.egg === "mug") return { name: `egg.mug${i}`, c: [e.at[0], e.at[1] + 0.06, e.at[2]], h: [0.07, 0.06, 0.06] };
    if (e.egg === "sticky") return { name: `egg.sticky${i}`, c: [e.at[0], Math.max(0.12, e.at[1] - (e.at[1] - 0.02) * (gag?.gag === "stickyFall" ? gu * gu : 0)), e.at[2]], h: [0.11, 0.11, 0.03] };
    return { name: `egg.tv19${i}`, c: [e.at[0], e.at[1] + 0.16, e.at[2]], h: [0.24, 0.16, 0.12] };
  });

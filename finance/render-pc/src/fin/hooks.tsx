// Hook prototypes for minimum-payment-trap (finance/hooks/{A,B,C}): 5-6 s openings in the NEW style. Frame 0 is action,
// every shot moves (slam zooms, whips, shake), no HUD/counter (story first: Spender in trouble), captions only.
// Word times come from src/shorts/hooks.timings.gen.ts (the worker's timings); shots are anchored to those words.
import React from "react";
import { Counter as Desk } from "../library/props";
import { SAVER, SPENDER } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { plastic, rbox } from "../blocky/mat";
import { Act, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { BillBrick, Bill, FlipCalendar, Hall, Label } from "./props";
import { HOOKS } from "../shorts/hooks.timings.gen";
import type { Chunk } from "../engine/core/captions";

export type HookId = "A" | "B" | "C";
export const W = (h: HookId) => HOOKS[h];
/** time of the first word matching w (lower-case, punctuation-free), at or after `from` */
export const at = (h: HookId, w: string, from = 0): number => {
  const x = W(h).words.find((q) => q.w.toLowerCase().replace(/[^a-z0-9]/g, "") === w && q.a >= from - 1e-6);
  if (!x) throw new Error(`hook ${h}: no word "${w}"`);
  return x.a;
};
export const durOf = (h: HookId) => W(h).duration;

// ------------------------------------------------------------------ shared set: a bright blocky store
export const CT: V3 = [0, 0, -0.6]; // shop counter (top ~0.95 m)
export const TOP = 0.98;
export const P_SP: V3 = [1.0, 0, 0.45];
export const SC = 1.0;
export const FACE = 1.247 * SC;
export const B: React.FC<{ s: V3; p: V3; c: string; r?: V3; e?: [string, number]; rough?: number }> = ({ s, p, c, r = [0, 0, 0], e, rough = 0.45 }) => (
  <mesh geometry={rbox(s[0], s[1], s[2], Math.min(s[0], s[1], s[2]) * 0.14)} material={plastic(c, { rough, emissive: e?.[0], ei: e?.[1] })} position={p} rotation={r} castShadow receiveShadow />
);
export const Store: React.FC<{ sign: string }> = ({ sign }) => (
  <>
    <Hall W={11} back={-3.5} front={7} wall="#6a5ae8" stripe="#ffd23a" floorA="#fbefe0" floorB="#e6d4ff">
      <Label p={[0, 2.75, -3.42]} text={[sign]} w={2.6} h={0.5} bg="#16121c" fg="#ffd23a" glow={0.9} />
    </Hall>
    <Desk p={CT} />
  </>
);
/** a dust puff: cubes flying out from p, u = 0..1 */
export const Dust: React.FC<{ p: V3; u: number; n?: number; r?: number; c?: string }> = ({ p, u, n = 14, r = 0.9, c = "#f2e6d0" }) => {
  if (u <= 0 || u >= 1) return null;
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i) * 0.6;
        const d = r * (1 - Math.pow(1 - u, 2.2)) * (0.6 + 0.6 * hash(i + 3));
        const s = 0.16 * (1 - u) * (0.6 + 0.8 * hash(i + 7));
        return <B key={i} s={[s, s, s]} p={[Math.cos(a) * d, 0.05 + 0.35 * u * hash(i + 5), Math.sin(a) * d * 0.6]} c={c} rough={0.9} />;
      })}
    </group>
  );
};
export const Card: React.FC<{ p: V3; r?: V3; s?: number }> = ({ p, r = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <B s={[0.17, 0.11, 0.008]} p={[0, 0, 0]} c="#2a6de1" rough={0.25} />
    <B s={[0.03, 0.022, 0.004]} p={[-0.045, 0.01, 0.006]} c="#ffd23a" rough={0.2} />
    <B s={[0.13, 0.012, 0.003]} p={[0, -0.03, 0.006]} c="#cfe0ff" />
  </group>
);
export const TV: React.FC<{ p: V3; r?: V3; s?: number; on?: number; screen?: string[]; screenBg?: string }> = ({ p, r = [0, 0, 0], s = 1, on = 1, screen = ["BIG TV"], screenBg = "#ffd23a" }) => (
  <group position={p} rotation={r} scale={s}>
    <B s={[1.5, 0.92, 0.16]} p={[0, 0.56, 0]} c="#16121c" rough={0.3} />
    <B s={[1.38, 0.8, 0.02]} p={[0, 0.56, 0.085]} c="#3a7dff" e={["#5fa0ff", 0.9 * on]} rough={0.15} />
    <Label p={[0, 0.56, 0.1]} text={screen} w={0.8} h={0.22 * screen.length} bg={screenBg} fg={screenBg === "#ffd23a" ? "#16121c" : "#ffffff"} />
    <B s={[0.5, 0.06, 0.3]} p={[0, 0.03, 0]} c="#2a2440" />
    <B s={[0.12, 0.08, 0.06]} p={[0, 0.1, 0]} c="#2a2440" />
  </group>
);
export const Reader: React.FC<{ p: V3; lit: number }> = ({ p, lit }) => (
  <group position={p}>
    <B s={[0.16, 0.1, 0.24]} p={[0, 0.05, 0]} c="#2a2440" />
    <B s={[0.12, 0.05, 0.02]} p={[0, 0.12, -0.08]} c={lit > 0.5 ? "#5ff08a" : "#16121c"} e={lit > 0.5 ? ["#5ff08a", 1.2] : undefined} />
  </group>
);
/** a hungry furnace labelled INTEREST (hook B) */
export const Furnace: React.FC<{ p: V3; t: number; heat: number; base?: number }> = ({ p, t, heat, base = 1.4 }) => (
  <group position={p}>
    <B s={[1.5, 1.5, 1.2]} p={[0, 0.75, 0]} c="#3a3f58" rough={0.5} />
    <B s={[0.8, 0.55, 0.05]} p={[0, 0.7, 0.6]} c="#ff7a1a" e={["#ff5a00", base + 0.5 * heat + 0.25 * Math.sin(t * 23)]} rough={0.2} />
    <B s={[0.36, 1.4, 0.36]} p={[0.4, 2.1, -0.2]} c="#2a2f48" />
    <Label p={[0, 1.27, 0.62]} text={["INTEREST"]} w={1.25} h={0.3} bg="#c01818" fg="#ffffff" glow={0.6} />
    <pointLight position={[0, 0.8, 1.1]} color="#ff8a3a" intensity={2.2 + heat} distance={5} decay={2} />
  </group>
);

// ------------------------------------------------------------------ lens helpers
const SUB_SP = (dy = FACE - 0.05): V3 => [P_SP[0], dy, P_SP[2]];
export const lin = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
/** a slam: the fov drops from f0 to f1 over d s from a, then creeps on */
export const slam = (a: number, f0: number, f1: number, d = 0.16) => (t: number) => lerp(f0, f1, easeOut((t - a) / d)) - 1.5 * clamp((t - a - d) / 2);
export const shakeAt = (hits: number[], amp = 0.05, decay = 0.35) => (t: number) => hits.reduce((s, h) => s + (t >= h ? amp * Math.exp(-(t - h) / (decay / 3)) : 0), 0) + 0.004;
/** a slam lens: from -> to in d s from t0, then keeps creeping toward the subject with a slow orbit (never static) */
export const slamPos = (from: V3, to: V3, subj: V3, t0: number, d = 0.2, creep = 0.1) => (t: number): V3 => {
  const p = lin(from, to, easeOut((t - t0) / d));
  const e = Math.max(0, t - t0 - d);
  const k = 1 - creep * e;
  const o = 0.08 * Math.sin(e * 1.3);
  return [subj[0] + (p[0] - subj[0]) * k + o, subj[1] + (p[1] - subj[1]) * k + 0.03 * Math.sin(e * 2.1), subj[2] + (p[2] - subj[2]) * k];
};
export type Shot = Omit<FinShot, "id" | "a" | "b">;
export const shot = (o: Partial<Shot> & Pick<Shot, "subj">): Shot => ({ off: [0, 0, 3], fov: 50, face: 0.5, mood: "store", blur: 0.8, shutter: 0.5, push: 0.06, roll: [0, 0], ...o });
export const mk = (cuts: [string, number, Shot][], end: number): FinShot[] => cuts.map(([id, a, s], i) => ({ id, a, b: i + 1 < cuts.length ? cuts[i + 1][1] : end, ...s }));

// ------------------------------------------------------------------ captions: 2-4 words per chunk, cut at punctuation
const chunksOf = (h: HookId): Chunk[] => {
  const ws = W(h).words;
  const out: Chunk[] = [];
  let cur: typeof ws = [];
  const flush = () => {
    if (cur.length) out.push({ words: cur.map((q) => q.w), a: cur[0].a, b: 0 });
    cur = [];
  };
  ws.forEach((q, i) => {
    cur.push(q);
    const punct = /[.,!?…]$/.test(q.w);
    const next = ws[i + 1];
    const gap = next ? next.a - q.b : 9;
    if (cur.length >= 4 || (cur.length >= 2 && (punct || gap > 0.25)) || (punct && /[.!?…]$/.test(q.w))) flush();
  });
  flush();
  out.forEach((c, i) => (c.b = i + 1 < out.length ? out[i + 1].a : Math.min(durOf(h), ws[ws.length - 1].b + 0.6)));
  return out;
};

// ================================================================== A: "TV"
// "Spender just bought a TV. He'll be paying for it for nineteen years."
const A_shots = (): FinShot[] => {
  const tTV = at("A", "tv"), tHe = at("A", "hell"), tNine = at("A", "nineteen"), end = durOf("A");
  const hit = 0.32; // the TV lands
  const swipe = tTV + 0.15;
  const boom = Math.max(swipe + 0.75, tHe + 0.1);
  return mk(
    [
      // A1: the TV is already falling at frame 0; low lens, slam on the landing
      ["A1", 0, shot({ subj: () => [CT[0] + 0.3, TOP + 0.45, CT[2] + 0.3], posAt: (t) => lin([0.9, 0.55, 3.2], [0.7, 0.7, 2.5], t / 1.0), fovAt: slam(hit, 62, 48, 0.12), shake: shakeAt([hit], 0.07), face: 0.45 })],
      // A2: whip to the card swipe
      ["A2", swipe - 0.35, shot({ subj: () => [RD[0], TOP + 0.1, RD[2]], posAt: (t) => lin([RD[0] - 1.3, TOP + 0.9, RD[2] + 0.6], [RD[0] - 0.4, TOP + 0.4, RD[2] + 0.7], easeOut((t - (swipe - 0.35)) / 0.25)), fov: 42, shake: shakeAt([swipe + 0.12], 0.025), face: 0.55, blur: 1.6 })],
      // A3: the calendar on the counter explodes into pages counting the years
      ["A3", boom - 0.15, shot({ subj: () => [CAL[0], TOP + 0.75, CAL[2]], posAt: (t) => lin([CAL[0] - 0.3, 1.45, 2.7], [CAL[0] - 0.2, 1.55, 2.0], (t - boom) / 2.5), fovAt: slam(boom, 58, 50, 0.1), shake: shakeAt([boom], 0.06), face: 0.5, blur: 0.9 })],
      // A4: slam on the jaw drop on "nineteen"
      ["A4", tNine - 0.12, shot({ subj: () => SUB_SP(), roll: [0, -3], posAt: slamPos([P_SP[0] - 0.5, 1.35, P_SP[2] + 2.2], [P_SP[0] - 0.2, 1.28, P_SP[2] + 1.2], SUB_SP(), tNine - 0.12, 0.22), fovAt: slam(tNine, 52, 36, 0.14), shake: shakeAt([tNine], 0.05), face: 0.42, blur: 1.6 })],
    ],
    end,
  );
};
const RD: V3 = [CT[0] + 0.62, TOP, CT[2] + 0.3];
const CAL: V3 = [CT[0] - 0.75, TOP, CT[2] + 0.2];
const A_scene = (t: number, s: FinShot): React.ReactNode => {
  const tTV = at("A", "tv"), tHe = at("A", "hell"), tNine = at("A", "nineteen");
  const hit = 0.32, swipe = tTV + 0.15, boom = Math.max(swipe + 0.75, tHe + 0.1);
  // TV: falls from above (frame 0 already moving), bounces, settles
  const fall = clamp(t / hit);
  const ty = t < hit ? lerp(2.6, TOP, fall * fall) : TOP + 0.08 * Math.abs(Math.sin((t - hit) * 18)) * Math.exp(-(t - hit) * 7);
  const squash = t >= hit ? 1 - 0.12 * Math.exp(-(t - hit) * 12) : 1;
  const tvRot: V3 = [0, 0.25 + 0.5 * (1 - fall), t < hit ? 0.25 * (1 - fall) : 0];
  // Spender: arms up when the TV lands, swipes the card, jaw drop on "nineteen"
  const swipeU = clamp((t - swipe) / 0.25);
  const drop = ss(tNine - 0.05, tNine + 0.12, t);
  const cheer = t < swipe - 0.3 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  const pose: Pose = {
    ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [0.4, 0, 3]) * 0.7, SC),
    armL: t < swipe - 0.3 ? 2.6 + 0.2 * cheer : drop > 0 ? lerp(0.4, 2.2, drop) : 0.35,
    outL: t < swipe - 0.3 ? 0.4 : drop > 0 ? 0.9 * drop : 0.15,
    armR: t < swipe - 0.3 ? 2.6 - 0.2 * cheer : t < boom ? lerp(1.1, 1.3, swipeU) : drop > 0 ? lerp(0.5, 2.2, drop) : 0.5,
    outR: t < swipe - 0.3 ? 0.4 : t < boom ? lerp(0.2, 0.9, swipeU) : 0.9 * drop + 0.15,
    headPitch: drop > 0 ? -0.15 * drop + 0.03 * Math.sin(t * 31) : t > boom ? -0.2 : 0.05,
    bob: t < swipe - 0.3 ? -0.04 * Math.abs(Math.sin(t * 9)) : 0,
    pitch: -0.12 * drop,
  };
  const emo: Emotion = t < boom ? "joy" : t < tNine - 0.05 ? "curious" : "shock";
  const held = undefined;
  // the calendar explodes: pages fly at the lens with the years counting up to 19
  const yStep = Math.max(0.02, (tNine - boom) / 18.5);
  const pages: React.ReactNode[] = [];
  if (t >= boom) {
    for (let i = 0; i < 19; i++) {
      const u = (t - boom - i * yStep) / 0.9;
      if (u <= 0 || u >= 1) continue;
      const a = hash(i) * Math.PI * 2;
      const r = 0.25 + 2.0 * easeOut(u);
      pages.push(<Label key={i} p={[CAL[0] + Math.cos(a) * r * 0.8, TOP + 0.6 + Math.sin(a) * r * 0.6 + 0.4 * u, CAL[2] + 1.6 * u]} text={["YEAR", String(i + 1)]} w={0.42} h={0.34} bg="#fffaf0" fg={i >= 17 ? "#c01818" : "#16121c"} r={[0.6 * Math.sin(u * 7 + i), 0.8 * Math.sin(u * 5 + i), 0.9 * Math.sin(u * 6 + i)]} />);
    }
  }
  if (t >= tNine - 0.12) for (let i = 0; i < 10; i++) {
    const u = ((t - tNine + 0.12) * 0.45 + i / 10) % 1;
    pages.push(<Label key={`f${i}`} p={[P_SP[0] - 0.6 + 1.2 * hash(i + 11), FACE + 0.9 - 1.6 * u, P_SP[2] + 0.35 + 0.4 * hash(i + 2)]} text={["YEAR", String(10 + (i % 10))]} w={0.3} h={0.24} bg="#fffaf0" fg="#c01818" r={[0.5 * Math.sin(u * 9 + i), 0.7 * Math.sin(u * 6 + i), 0.8 * Math.sin(u * 7 + i)]} />);
  }
  const nowYear = t < boom ? 1 : Math.min(19, 1 + Math.floor((t - boom) / yStep));
  return (
    <>
      <Store sign="ELECTRONICS" />
      <group position={[CT[0] - 0.05, ty, CT[2] - 0.05]} rotation={tvRot} scale={[1, squash, 1]}>
        <TV p={[0, 0, 0]} />
      </group>
      <Dust p={[CT[0], TOP + 0.02, CT[2] + 0.1]} u={(t - hit) / 0.6} n={16} r={1.1} />
      <Reader p={RD} lit={swipeU} />
      {t >= swipe - 0.35 && t < boom ? <Card p={[RD[0] + lerp(-0.25, 0.25, easeOut(swipeU)), TOP + 0.13, RD[2]]} r={[0, Math.PI / 2, 0]} s={1.2} /> : null}
      {t < boom ? <FlipCalendar p={[CAL[0], TOP + 0.45, CAL[2]]} w={0.7} h={0.6} title="YEAR" value="1" /> : <FlipCalendar p={[CAL[0], TOP + 0.45 + 0.05 * Math.sin((t - boom) * 30) * Math.exp(-(t - boom) * 3), CAL[2]]} w={0.7} h={0.6} title="YEAR" value={String(nowYear)} color={nowYear >= 19 ? "#c01818" : undefined} />}
      <Dust p={[CAL[0], TOP + 0.6, CAL[2] + 0.1]} u={(t - boom) / 0.5} n={12} r={0.8} c="#fffaf0" />
      {pages}
      <Act look={SPENDER} pose={pose} emotion={emo} s={SC} t={t} seed={2} held={held} />
      {s.id === "A4" ? null : null}
    </>
  );
};

// ================================================================== B: "burn"
// "This guy is about to pay eight thousand dollars... for nothing."
const FUR: V3 = [-1.0, 0, -1.2];
const B_shots = (): FinShot[] => {
  const tGuy = at("B", "guy"), tEight = at("B", "eight"), tFor = at("B", "for", at("B", "dollars")), end = durOf("B");
  return mk(
    [
      // B1: a brick is already mid-air into the furnace at frame 0; tracking from the side
      ["B1", 0, shot({ subj: () => [FUR[0] + 0.5, 0.95, FUR[2] + 0.9], posAt: (t) => lin([1.5, 1.35, 3.1], [1.2, 1.25, 2.5], t / 1.4), fov: 52, shake: shakeAt([0.35, tGuy + 0.3], 0.03), face: 0.5, blur: 0.9 })],
      // B2: whip up the chimney: the bills fly out as confetti
      ["B2", tGuy + 0.55, shot({ subj: () => [FUR[0] + 0.4, 2.7, FUR[2] - 0.2], posAt: (t) => lin([0.6, 1.6, 2.6], [0.4, 2.2, 1.8], easeOut((t - tGuy - 0.55) / 0.3)), fov: 56, shake: shakeAt([tGuy + 0.6], 0.03), face: 0.55, blur: 0.8 })],
      // B3: wide on "eight thousand": he cheerfully keeps feeding it
      ["B3", tEight - 0.1, shot({ subj: () => [FUR[0] + 0.7, 1.0, FUR[2] + 0.6], posAt: (t) => lin([-2.6, 1.5, 2.9], [-2.1, 1.4, 2.3], (t - tEight) / 1.5), fovAt: slam(tEight - 0.1, 60, 52, 0.12), shake: shakeAt([tEight], 0.04), face: 0.5, blur: 0.8 })],
      // B4: hard zoom on his face on "for nothing"
      ["B4", tFor - 0.12, shot({ subj: () => [P_B[0], FACE - 0.05, P_B[2]], roll: [0, 3], posAt: slamPos([P_B[0] + 0.7, 1.4, P_B[2] + 2.6], [P_B[0] + 0.25, 1.28, P_B[2] + 1.3], [P_B[0], FACE - 0.05, P_B[2]], tFor - 0.12, 0.2), fovAt: slam(tFor, 50, 34, 0.14), shake: shakeAt([tFor], 0.05), face: 0.42, blur: 1.6 })],
    ],
    end,
  );
};
const P_B: V3 = [0.25, 0, -0.1];
const B_scene = (t: number, s: FinShot): React.ReactNode => {
  const tFor = at("B", "for", at("B", "dollars"));
  const realise = ss(tFor - 0.05, tFor + 0.15, t);
  // he tosses a brick every 0.55 s (one is mid-air at frame 0)
  const period = 0.55;
  const ph = ((t + 0.3) % period) / period; // 0..1 within a toss
  const tossing = t < tFor - 0.1;
  const from: V3 = [P_B[0] - 0.3, 1.1, P_B[2] - 0.1];
  const to: V3 = [FUR[0], 0.72, FUR[2] + 0.6];
  const pose: Pose = {
    ...stand(P_B[0], P_B[2], lerp(yawTo(P_B, FUR) * 0.6 + 0.35, yawTo(P_B, [P_B[0] + 0.35, 0, P_B[2] + 2]), realise), SC),
    armR: tossing ? lerp(0.6, 2.1, Math.sin(Math.PI * ph)) : lerp(0.5, 2.3, realise),
    outR: tossing ? 0.3 : 0.2 + 0.7 * realise,
    armL: tossing ? 0.8 + 0.3 * Math.sin(t * 7) : lerp(0.5, 2.3, realise),
    outL: tossing ? 0.2 : 0.2 + 0.7 * realise,
    bob: tossing ? -0.03 * Math.abs(Math.sin(t * 8)) : 0,
    headPitch: tossing ? 0.05 : -0.1 * realise,
    pitch: -0.1 * realise,
  };
  const emo: Emotion = tossing ? "joy" : "shock";
  const bricks: React.ReactNode[] = [];
  if (tossing) {
    const u = ph;
    bricks.push(<BillBrick key="fly" p={[lerp(from[0], to[0], u), lerp(from[1], to[1], u) + 0.7 * Math.sin(Math.PI * u), lerp(from[2], to[2], u)]} s={2.2} r={[u * 5, u * 3, u * 2]} />);
  }
  // the brick stack beside him shrinks
  const left = Math.max(1, 9 - Math.floor((t + 0.3) / period));
  for (let i = 0; i < left; i++) bricks.push(<BillBrick key={`s${i}`} p={[P_B[0] + 0.2, 0.155 * i * 1.0, P_B[2] - 0.75]} s={2.2} r={[0, 0.1 * hash(i), 0]} />);
  // confetti bills out of the chimney
  const conf: React.ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const t0 = (i * 0.11) % 5.5;
    const u = (t - t0) / 1.6;
    if (u <= 0 || u >= 1) continue;
    const a = hash(i) * Math.PI * 2;
    conf.push(<Bill key={i} p={[FUR[0] + 0.4 + Math.cos(a) * 1.2 * u, 2.85 + 2.2 * u - 1.6 * u * u, FUR[2] - 0.2 + Math.sin(a) * 1.0 * u + 0.5 * u]} r={[u * 9 + i, u * 6, u * 7 + i]} s={2.0} />);
  }
  return (
    <>
      {s.id === "B4" ? Array.from({ length: 18 }, (_, i) => {
        const u = ((t - tFor) * 0.5 + i / 18) % 1;
        return <Bill key={`r${i}`} p={[P_B[0] - 0.8 + 1.6 * hash(i + 4), FACE + 1.0 - 1.8 * u, P_B[2] + 0.3 + 0.5 * hash(i + 8)]} r={[u * 8 + i, u * 5, u * 6]} s={1.6} />;
      }) : null}
      <Hall W={11} back={-3.5} front={7} wall="#3a2a5a" stripe="#ff7a1a" floorA="#2a2440" floorB="#3a3158" />
      <Furnace p={FUR} t={t} heat={tossing ? 0.5 + 0.5 * Math.sin(Math.PI * ph) : 1} />
      {bricks}
      {conf}
      <Act look={SPENDER} pose={pose} emotion={emo} s={SC} t={t} seed={2} />
      {s.id === "B4" ? null : null}
    </>
  );
};

// ================================================================== C: "warning"
// "Never pay the minimum. Watch what happens."
const P_SV0: V3 = [-2.6, 0, 0.6];
const C_shots = (): FinShot[] => {
  const tWatch = at("C", "watch"), end = durOf("C");
  const slap = 0.55;
  return mk(
    [
      // C1: Saver is already sprinting in at frame 0; lens tracks him
      ["C1", 0, shot({ subj: () => [0.0, 1.15, 0.45], posAt: (t) => lin([0.5, 1.35, 3.6], [0.3, 1.3, 3.0], t / 0.8), fovAt: (t) => lerp(60, 52, clamp(t / 0.6)), shake: shakeAt([slap], 0.06), face: 0.5, blur: 0.9, shutter: 0.6 })],
      // C2: slow-mo spin of the card (record scratch at the cut)
      ["C2", slap + 0.2, shot({ subj: (t) => cardPos(t), posAt: (t) => { const c = cardPos(t); const a = 0.6 + 0.35 * (t - slap); return [c[0] + 0.75 * Math.sin(a), c[1] + 0.12, c[2] + 0.75 * Math.cos(a)]; }, fov: 40, face: 0.5, blur: 2.2, shutter: 0.25, push: 0 })],
      // C3: "Watch what happens": slam on Saver wagging a finger
      ["C3", tWatch - 0.1, shot({ subj: () => [P_SV1[0] + 0.15, FACE, P_SV1[2]], roll: [0, -3], posAt: slamPos([P_SV1[0] - 0.3, 1.4, P_SV1[2] + 3.0], [P_SV1[0] - 0.1, 1.3, P_SV1[2] + 1.9], [P_SV1[0] + 0.15, FACE, P_SV1[2]], tWatch - 0.1, 0.2), fovAt: slam(tWatch - 0.05, 52, 38, 0.14), shake: shakeAt([tWatch], 0.045), face: 0.42, blur: 1.6 })],
      // C4: wide on both: the card lands at Spender's feet, he grabs his head
      ["C4", cLand(), shot({ subj: () => [0.25, 0.85, 0.55], roll: [2, -2], posAt: slamPos([1.4, 1.7, 3.2], [0.25, 1.45, 3.9], [0.25, 0.85, 0.55], cLand(), 0.25, 0.1), fovAt: (t) => lerp(62, 56, clamp((t - cLand()) / 2.4)), fov: 58, shake: shakeAt([cLand() + 0.05], 0.04), face: 0.5, blur: 0.9 })],
    ],
    end,
  );
};
/** the wide closing shot of C starts just after the line ends */
const cLand = () => { const ws = HOOKS.C.words; return ws[ws.length - 1].b + 0.25; };
const P_SV1: V3 = [-0.55, 0, 0.45];
/** the card: in Spender's raised hand, then slapped away: slow spin through the air (slow-mo 0.75..tMin), lands */
const cardPos = (t: number): V3 => {
  const slap = 0.55;
  if (t < slap) return [P_SP[0] - 0.3, 1.45, P_SP[2] + 0.15];
  const tSlow = at("C", "watch") - 0.1, land = cLand();
  // fast for 0.2 s, slow-mo until "Watch", then it falls and lands as the wide shot cuts in
  const u = t < slap + 0.2 ? ((t - slap) / 0.2) * 0.25 : t < tSlow ? 0.25 + 0.25 * clamp((t - slap - 0.2) / (tSlow - slap - 0.2)) : 0.5 + 0.5 * clamp((t - tSlow) / (land - tSlow));
  return [P_SP[0] - 0.3 - 0.35 * u, lerp(1.45, 0.02, u) + 1.0 * Math.sin(Math.PI * u), P_SP[2] + 0.15 + 0.6 * u];
};
const C_scene = (t: number, s: FinShot): React.ReactNode => {
  const tMin = at("C", "minimum"), tWatch = at("C", "watch");
  const slap = 0.55;
  const slow = s.id === "C2";
  const landed = t >= cLand();
  // Saver: sprints in from the left (already moving at frame 0), slaps, then wags/points
  const run = clamp(t / slap);
  const sv: V3 = t < slap ? lin([P_SV0[0], 0, P_SV0[2]], [P_SV1[0], 0, P_SV1[2]], easeOut(run)) : P_SV1;
  const g = 2 * Math.PI * 2.4 * t;
  const swing = ss(slap - 0.12, slap + 0.05, t) - ss(slap + 0.2, slap + 0.5, t);
  const svPose: Pose = {
    ...stand(sv[0], sv[2], t < slap ? 1.4 : t < tWatch - 0.1 ? yawTo(P_SV1, P_SP) : yawTo(P_SV1, [P_SV1[0] - 0.1, 0, 4]), SC),
    headPitch: t >= tWatch - 0.1 ? 0.04 * Math.sin(t * 5) : 0,
    legL: t < slap ? 0.7 * Math.sin(g) : 0,
    legR: t < slap ? -0.7 * Math.sin(g) : 0,
    armL: t < slap ? -0.7 * Math.sin(g) : t >= tWatch - 0.1 ? 2.5 + 0.12 * Math.sin(t * 11) : 0.3,
    armR: t < slap - 0.12 ? 0.7 * Math.sin(g) : t < tMin ? 1.2 + 1.2 * swing : t < tWatch - 0.1 ? 2.3 + 0.15 * Math.sin(t * 16) : 0.3,
    outR: t < slap - 0.12 ? 0.1 : t < tMin ? 0.6 - 0.9 * swing : 0.2,
    outL: t >= tWatch - 0.1 ? 0.35 + 0.15 * Math.sin(t * 11) : 0.1,
    pitch: t < slap ? 0.25 : 0,
    bob: t < slap ? -0.05 * Math.abs(Math.sin(g)) : -0.02 * Math.abs(Math.sin(t * 4)),
  };
  // Spender: card up to pay, then the slap knocks it away: shock
  const hitU = ss(slap, slap + 0.15, t);
  const spPose: Pose = {
    ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [-0.6, 0, 3]) * 0.8, SC),
    armL: t < slap ? 1.9 : landed ? 2.9 : lerp(1.9, 2.4, hitU),
    outL: t < slap ? 0.2 : landed ? 0.55 : 0.8 * hitU,
    headPitch: landed ? 0.3 + 0.1 * Math.sin(t * 13) : 0,
    headYaw: landed ? 0.35 * Math.sin(t * 9) : t > slap ? -0.2 : 0,
    bob: landed ? -0.05 * Math.abs(Math.sin(t * 14)) : 0,
    armR: t < slap ? 0.3 : landed ? 2.9 : lerp(0.3, 2.3, hitU),
    outR: landed ? 0.55 : 0.15 + 0.7 * hitU,
    pitch: -0.12 * hitU,
  };
  const card = t >= slap ? <Card p={cardPos(t)} r={landed ? [-Math.PI / 2, 0, 0.4] : [t * (slow ? 3 : 12), t * (slow ? 2.4 : 9), t * (slow ? 1.6 : 6)]} s={1.6} /> : null;
  return (
    <>
      <Store sign="CHECKOUT" />
      <Reader p={[CT[0] + 0.5, TOP, CT[2] + 0.25]} lit={0} />
      <Label p={[CT[0] + 0.55, TOP + 0.45, CT[2] + 0.15]} text={["MINIMUM DUE", "$150"]} w={0.6} h={0.32} bg="#fff4c8" fg="#c01818" border="#c01818" />
      <Dust p={[sv[0], 0.02, sv[2]]} u={t < slap ? (t % 0.25) / 0.25 : -1} n={6} r={0.4} />
      <Dust p={[P_SP[0] - 0.3, 1.45, P_SP[2] + 0.15]} u={(t - slap) / 0.35} n={10} r={0.5} c="#ffffff" />
      <Dust p={cardPos(cLand())} u={(t - cLand()) / 0.4} n={8} r={0.35} />
      {card}
      <Act look={SAVER} pose={svPose} emotion={t < tMin ? "sly" : t < tWatch ? "curious" : "sly"} s={SC} t={t} seed={4} />
      <Act look={SPENDER} pose={spPose} emotion={t < slap ? "joy" : "shock"} s={SC} t={t} seed={2} held={t < slap ? { side: "L", node: <Card p={[0, 0.03, 0.05]} r={[0, 0, Math.PI / 2]} s={1.4} /> } : undefined} />
    </>
  );
};

// ------------------------------------------------------------------ specs
const spec = (h: HookId, shots: FinShot[], scene: (t: number, s: FinShot) => React.ReactNode): FinSpec => ({
  slug: `hook-${h}`,
  shots,
  duration: Math.round(durOf(h) * 30),
  chunks: chunksOf(h),
  until: durOf(h),
  whisper: [],
  ending: [],
  scene: (t, s) => scene(t, s),
  counter: () => null,
  tag: () => null,
  bg: "#6a5ae8",
});
export const HOOK_A = spec("A", A_shots(), A_scene);
export const HOOK_B = spec("B", B_shots(), B_scene);
export const HOOK_C = spec("C", C_shots(), C_scene);

// ------------------------------------------------------------------ audio cues (tools/hook_mix.py reads these via tools/hook_cues.mjs)
export type Cue = { t: number; sfx: string; db?: number };
export const HOOK_AUDIO: Record<HookId, { music: string; hookWord: number; cues: Cue[] }> = (() => {
  const cutCues = (shots: FinShot[], name = "whoosh"): Cue[] => shots.slice(1).map((s) => ({ t: s.a - 0.06, sfx: name, db: -4 }));
  // A
  const tTV = at("A", "tv"), tHe = at("A", "hell"), tNine = at("A", "nineteen");
  const swipe = tTV + 0.15, boom = Math.max(swipe + 0.75, tHe + 0.1);
  const A: Cue[] = [
    { t: 0, sfx: "whoosh", db: -2 }, { t: 0.3, sfx: "impact", db: 0 }, { t: 0.32, sfx: "thud", db: -2 }, { t: 0.36, sfx: "crash", db: -10 },
    ...cutCues(HOOK_A.shots),
    { t: swipe + 0.02, sfx: "slide", db: -2 }, { t: swipe + 0.22, sfx: "beep", db: -6 }, { t: swipe + 0.3, sfx: "cash", db: -2 },
    { t: boom - 0.02, sfx: "boom", db: -3 }, { t: boom + 0.05, sfx: "paper", db: -4 }, { t: boom + 0.4, sfx: "paper", db: -8 },
    { t: tNine - 0.02, sfx: "impact", db: 0 }, { t: tNine + 0.05, sfx: "gasp", db: -6 },
  ];
  // B
  const tGuy = at("B", "guy"), tEight = at("B", "eight"), tFor = at("B", "for", at("B", "dollars"));
  const tosses: Cue[] = [];
  for (let k = 0; ; k++) { const land = k * 0.55 + 0.25; if (land > tFor - 0.1) break; tosses.push({ t: land, sfx: k % 2 ? "fire" : "thud", db: -8 }); }
  const B: Cue[] = [
    { t: 0, sfx: "whoosh", db: -3 }, { t: 0, sfx: "fire", db: -6 }, ...tosses,
    ...cutCues(HOOK_B.shots),
    { t: tGuy + 0.6, sfx: "coins", db: -6 }, { t: tEight - 0.02, sfx: "cash", db: -2 }, { t: tEight + 0.02, sfx: "impact", db: -4 },
    { t: tFor - 0.12, sfx: "scratch", db: -6 }, { t: tFor - 0.02, sfx: "impact", db: 0 }, { t: tFor + 0.35, sfx: "fail", db: -6 },
  ];
  // C
  const tMin = at("C", "minimum"), tWatch = at("C", "watch");
  const C: Cue[] = [
    { t: 0, sfx: "whoosh", db: -2 }, { t: 0.05, sfx: "footsteps", db: -8 },
    { t: 0.5, sfx: "punch", db: 0 }, { t: 0.52, sfx: "slide", db: -6 },
    { t: 0.72, sfx: "scratch", db: 0 },
    ...cutCues(HOOK_C.shots),
    { t: tMin - 0.02, sfx: "impact", db: -6 },
    { t: tWatch - 0.02, sfx: "impact", db: 0 }, { t: tWatch + 0.1, sfx: "riser", db: -8 },
    { t: cLand(), sfx: "drop", db: -2 }, { t: cLand() + 0.05, sfx: "fail", db: -6 }, { t: cLand() + 0.2, sfx: "gasp", db: -6 },
  ];
  return {
    A: { music: "upbeat", hookWord: tNine, cues: A },
    B: { music: "upbeat", hookWord: tFor, cues: B },
    C: { music: "tense", hookWord: tWatch, cues: C },
  };
})();

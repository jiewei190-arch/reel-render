// FORMAT v1, style S5 CHARACTER-TALKS: dollar-1970. Spender and Saver talk (no narrator; two D2 voice settings, see
// finance/shorts/dollar-1970/vo/speakers.json). A blocky corner SNACK SHOP. Frame 0: Spender's $1 bill already shrinking
// in his hand ("Wait. My dollar is worth under twelve cents?!"). Saver: in 1970 money; prices almost 9x; the CPI, not a
// guess. Open loop (~47 %): "So where did it go?" / "It's hiding in plain sight. Watch..." (the lights dim). Twist
// (~56-80 %): a 1970 -> NOW match cut on a snack tag $1.00 -> $8.70; a slow coin drip from Spender's bag, ~4% a year for
// over 50 years. Ends on "You only notice the total. Like:" and loops to frame 0.
// Maths (sources.md): CPI-U 1970 avg 38.8, Oct 2026 337.511: x8.70, 1/8.70 = $0.115 (under 12 cents), ~3.9 %/yr over 56.3 yrs.
import React from "react";
import { SAVER, SPENDER } from "../../library/characters";
import { clamp, lerp, ss } from "../../blocky/motion";
import type { Emotion, Pose, V3 } from "../../blocky/motion";
import { DURATION, SHOTS as PLAN, WORDS } from "../../shorts/dollar_1970_v1.plan.gen";
import { Act, stand, yawTo } from "../core";
import type { FinShot, FinSpec } from "../core";
import { CoinStack, FlipCalendar, Hall, Label, PAL, Stamp } from "../props";
import { B, FACE, SC, easeOut, shakeAt, slam } from "../hooks";
import type { Shot } from "../hooks";
import { actorBoxes, armPoint, Coin3, creep, shotsOf, Squash, sqAt, timing, WordCaption } from "./kit";
import type { Box, StoryAudio } from "./kit";

const { T, W, lineEnd } = timing(PLAN, WORDS);
const idx = (id: string) => parseInt(id.slice(1), 10);
const END = DURATION / 30;

// ------------------------------------------------------------------ layout (metres; lens side = +z)
const P_SP: V3 = [0.6, 0, 0.45];
const P_SV: V3 = [-0.7, 0, 0.3];
const SHELF: V3 = [0.15, 0, -1.55];
const SNACK: V3 = [0.25, 1.1, -1.45];
const TAG: V3 = [0.25, 0.88, -1.12];
const SIGN: V3 = [-1.55, 2.35, -2.45];
const CAL: V3 = [1.6, 2.0, -2.4];

// ------------------------------------------------------------------ key times
const tShrink0 = 0.0, tShrink1 = W(1, "cents") + 0.2; // the bill shrinks across line 1 (already shrinking at frame 0)
const tNine = W(2, "nine");
const tGuess = W(3, "not");
const tWatch = W(5, "watch");
const tCost = T("S11");
const tDrip = T("S12");
const tLoopShot = T("S16");
const tPrice = (t: number) => lerp(1.0, 8.7, easeOut(clamp((t - tCost - 0.15) / 0.9)));

// ------------------------------------------------------------------ actors (shared by the scene and the QA)
const speaking = (who: "spender" | "saver", t: number) => {
  const turn = who === "spender" ? [1, 4, 8] : [2, 3, 5, 6, 7, 9];
  return WORDS.some((w) => turn.includes(w.turn) && t >= w.t && t < w.end + 0.05);
};
/** the bill's scale: shrinks across line 1 (frame 0 already mid-shrink) and again on the loop shot */
const billScale = (t: number) => {
  if (t >= tLoopShot) return lerp(1.0, 0.55, clamp((t - tLoopShot) / (END - tLoopShot)));
  return lerp(0.88, 0.14, easeOut(clamp((t - tShrink0) / (tShrink1 - tShrink0))));
};
const Bill: React.FC<{ s: number }> = ({ s }) => (
  <group scale={[s, s, s]}>
    <B s={[0.5, 0.24, 0.012]} p={[0, 0, 0]} c="#3fb86a" rough={0.6} />
    <Label p={[0, 0, 0.008]} text={["$1"]} w={0.28} h={0.17} bg="#e9f7e2" fg="#1f6a3a" />
  </group>
);
type ActorAt = { name: string; look: typeof SPENDER; pose: Pose; emo: Emotion; seed: number; held?: { side: "L" | "R"; node: React.ReactNode } };
const actorsAt = (i: number, t: number): ActorAt[] => {
  const spTalk = speaking("spender", t), svTalk = speaking("saver", t);
  const gsp = spTalk ? 0.12 * Math.sin(t * 11) : 0, gsv = svTalk ? 0.12 * Math.sin(t * 9) : 0;
  // ---- Spender
  let sp: Pose = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [P_SV[0] + 0.3, 0, 4]), SC), armL: 0.35, armR: 0.35, outL: 0.1, outR: 0.1, bob: spTalk ? -0.02 * Math.abs(Math.sin(t * 8)) : 0 };
  let se: Emotion = "curious";
  let held: ActorAt["held"];
  if (i <= 2 || i === 16) {
    sp = { ...sp, armR: 1.45 + gsp, outR: -0.15, headPitch: 0.12, armL: i === 2 ? 1.1 : 0.4, outL: i === 2 ? 0.3 : 0.1 };
    se = i === 16 ? "curious" : t < 0.95 ? "curious" : "shock";
    // S01/S16: the bill held forward, clear of the forearm in the frame-0 lens; S02's macro keeps the original grip
    held = i === 2 ? undefined : { side: "R", node: <group position={[0, 0.12, 0.14]}><Bill s={billScale(t)} /></group> }; // S02: the bill floats just above his fist (world space, below)
  } else if (i === 7 || i === 8) {
    const spin = i === 8 ? Math.sin((t - T("S08")) * 6) * 0.9 : 0;
    sp = { ...stand(P_SP[0], P_SP[2], yawTo(P_SP, [P_SV[0], 0, 4]) + spin, SC), armL: 0.6 + gsp, armR: 0.6 - gsp, outL: 0.45, outR: 0.45, headYaw: i === 7 ? -0.3 : 0 };
    se = i === 7 ? "sly" : "curious";
  } else if (i === 11) {
    const d = ss(tCost + 0.3, tCost + 0.5, t);
    sp = { ...sp, armL: lerp(0.35, 2.1, d), armR: lerp(0.35, 2.1, d), outL: 0.7 * d, outR: 0.7 * d, ant: d };
    se = d > 0.3 ? "shock" : "curious";
  } else if (i === 12 || i === 13) {
    sp = { ...sp, headPitch: 0.35, armL: 0.3, armR: 0.3, headYaw: 0.4 };
    se = "curious";
  } else if (i === 14) {
    sp = { ...sp, headPitch: 0.3 + 0.04 * Math.sin(t * 12), armL: 1.2 + gsp, armR: 1.2 - gsp, outL: 0.5, outR: 0.5, pitch: 0.1 };
    se = "sad";
  } else if (i >= 3) {
    sp = { ...sp, armL: 0.35, armR: 0.35, headYaw: -0.2 };
    se = i === 6 ? "shock" : i === 5 ? "curious" : i === 15 ? "sad" : "curious";
  }
  // ---- Saver
  let sv: Pose = { ...stand(P_SV[0], P_SV[2], yawTo(P_SV, [P_SP[0] - 0.3, 0, 4]), SC), armL: 0.3, armR: 0.3, outL: 0.1, outR: 0.1, bob: svTalk ? -0.015 * Math.abs(Math.sin(t * 7)) : 0 };
  let ve: Emotion = "happy";
  let vheld: ActorAt["held"];
  if (i === 3) { sv = { ...sv, armL: 2.3 + gsv, outL: 0.45 }; }
  if (i === 4) { sv = { ...sv, armR: 1.2 + gsv, outR: 0.3 }; }
  if (i === 5 || i === 6) {
    sv = { ...sv, armR: 1.5 + gsv * 0.5, outR: -0.1 };
    vheld = { side: "R", node: <group position={[0, 0.12, 0.05]}><B s={[0.26, 0.34, 0.04]} p={[0, 0, 0]} c="#2a6de1" /><Label p={[0, 0.02, 0.025]} text={["CONSUMER", "PRICE", "INDEX", "(BLS)"]} w={0.22} h={0.28} bg="#e8f0ff" fg="#16121c" /></group> };
  }
  if (i === 9) { sv = { ...sv, armR: 1.4 + gsv, outR: -0.2, pitch: 0.1, headPitch: 0.1 }; ve = "sly"; }
  if (i === 15) { sv = { ...sv, armL: 0.9 + gsv, outL: 0.3 }; ve = "happy"; }
  if (i === 12 || i === 13) { sv = { ...sv, armR: 1.0 + gsv, outR: 0.4 }; }
  return [
    { name: "Spender", look: SPENDER, pose: sp, emo: se, seed: 2, held },
    { name: "Saver", look: SAVER, pose: sv, emo: ve, seed: 4, held: vheld },
  ];
};

// ------------------------------------------------------------------ moving props
/** coins dripping from the hole in Spender's bag (left hip), falling to the floor behind him (S12-S13) */
const BAG = (): V3 => [P_SP[0] + 0.3, 0.72, P_SP[2] - 0.05];
const dripPos = (k: number, t: number): V3 | null => {
  if (t < tDrip) return null;
  const u = ((t - tDrip) * 1.8 + k / 5) % 1;
  const b = BAG();
  return [b[0] + 0.05, lerp(b[1] - 0.05, 0.07, u * u), b[2] - 0.12]; // lands ON the floor
};

// ------------------------------------------------------------------ lenses
const fSp = (): V3 => [P_SP[0], FACE - 0.05, P_SP[2]];
const fSv = (): V3 => [P_SV[0], FACE - 0.05, P_SV[2]];
const over = (f: V3, side: number, o: Partial<Shot> = {}) => creep(f, [f[0] + 0.45 * side, FACE + 0.02, f[2] + 1.05], { fov: 48, face: 0.55, blur: 1.6, ...o });
const handSp = (t: number) => armPoint(actorsAt(1, t)[0].pose, "R", 1, SC);
const LZ: Record<string, Shot> = {
  S01: (() => { const h = handSp(0.2), f = fSp(); const c: V3 = [0.58 * h[0] + 0.42 * f[0], (h[1] + 0.1 + f[1]) / 2, (h[2] + f[2]) / 2]; return creep(c, [c[0] + 0.15, c[1] + 0.05, c[2] + 1.6], { fov: 52, face: 0.5, blur: 1.4 }); })(), // PC: face AND the shrinking bill in frame 0
  S02: (() => { const h = handSp(1.2); const c: V3 = [h[0], h[1] + 0.42, h[2] + 0.22]; return { ...creep(c, [c[0] + 0.08, c[1] + 0.03, c[2] + 0.8], { fov: 46, face: 0.5, blur: 2.0 }), fovAt: slam(T("S02") + 0.1, 50, 42, 0.12), shake: shakeAt([T("S02") + 0.1], 0.03) }; })(),
  S03: over(fSv(), -0.6),
  S04: { ...creep([SNACK[0], 1.0, SNACK[2]], [SNACK[0] + 0.3, 1.3, SNACK[2] + 1.9], { fov: 50, face: 0.5 }), fovAt: slam(tNine, 54, 48, 0.12), shake: shakeAt([tNine], 0.04) },
  S05: creep([P_SV[0] + 0.1, 1.15, P_SV[2]], [P_SV[0] - 0.3, 1.45, P_SV[2] + 2.0], { fov: 50, face: 0.5 }),
  S06: { ...creep([P_SV[0] - 0.05, 1.3, P_SV[2] + 0.35], [P_SV[0] - 0.15, 1.4, P_SV[2] + 1.15], { fov: 46, face: 0.5, blur: 1.8 }), shake: shakeAt([tGuess + 0.1], 0.03) },
  S07: over(fSp(), 0.6),
  S08: creep([0, 1.0, 0.3], [0.1, 1.5, 3.1], { fov: 54, face: 0.5 }),
  S09: { ...over(fSv(), -0.4), mood: "whisper", fovAt: slam(tWatch, 50, 44, 0.12) },
  S10: { ...creep([SNACK[0], 1.0, SNACK[2]], [SNACK[0] + 0.1, 1.25, SNACK[2] + 1.75], { fov: 48, face: 0.5 }), mood: "home" },
  S11: { ...creep([SNACK[0], 1.0, SNACK[2]], [SNACK[0] + 0.1, 1.25, SNACK[2] + 1.75], { fov: 48, face: 0.5 }), fovAt: slam(tCost + 0.15, 50, 44, 0.12), shake: shakeAt([tCost + 0.15], 0.03) },
  S12: creep([P_SP[0] + 0.15, 0.85, P_SP[2]], [P_SP[0] + 1.1, 1.25, P_SP[2] + 1.9], { fov: 52, face: 0.5 }),
  S13: creep([0.2, 1.2, -0.6], [0.4, 1.7, 4.0], { fov: 56, face: 0.5 }),
  S14: over(fSp(), 0.5),
  S15: { ...over(fSv(), -0.5), mood: "ending" },
  S16: (() => { const h = handSp(0.2), f = fSp(); const c: V3 = [0.58 * h[0] + 0.42 * f[0], (h[1] + 0.1 + f[1]) / 2, (h[2] + f[2]) / 2]; return creep(c, [c[0] + 0.15, c[1] + 0.05, c[2] + 1.6], { fov: 52, face: 0.5, blur: 1.4 }); })(),
};
export const D1970_SHOTS = shotsOf(PLAN, LZ);

// ------------------------------------------------------------------ scene
const scene = (t: number, shot: FinShot): React.ReactNode => {
  const i = idx(shot.id);
  const actors = actorsAt(i, t);
  const k = sqAt(t, [0.95, T("S02") + 0.1, tCost + 0.35, T("S14")]);
  const retro = i === 10;
  const dim = i === 9;
  const price = i === 11 ? tPrice(t) : i >= 12 ? 8.7 : 1.0;
  const year = i >= 13 ? Math.round(lerp(1970, 2026, easeOut(clamp((t - T("S13")) / 1.5)))) : retro ? 1970 : 2026;
  const drips: React.ReactNode[] = [];
  if (i === 12 || i === 13) for (let q = 0; q < 5; q++) { const p = dripPos(q, t); if (p) drips.push(<Coin3 key={q} p={p} r={[t * 8 + q, q, 0]} s={1.0} />); }
  // the trail of coins on the floor behind him, growing through S12-S14
  const trail = i >= 12 && i <= 14 ? Math.min(9, 1 + Math.floor((t - tDrip) * 2)) : 0;
  return (
    <>
      <Hall W={9} back={-2.9} front={6} wall={retro ? "#b0703a" : dim ? "#2a3260" : "#4a7ad8"} stripe={retro ? "#ffcf7a" : "#ffd23a"} floorA={retro ? "#e8c890" : "#f2ece0"} floorB={retro ? "#d0a870" : "#ded4c6"} />
      <Label p={SIGN} text={[retro ? "1970" : "NOW"]} w={0.95} h={0.42} bg={retro ? "#ffcf7a" : "#16121c"} fg={retro ? "#5a2a10" : "#7fefff"} glow={retro ? 0 : 0.4} />
      <Label p={[0, 2.85, -2.85]} text={["SNACKS"]} w={1.6} h={0.36} bg="#16121c" fg="#ffd23a" glow={0.4} />
      {/* shelf + the snack + its price tag */}
      <B s={[2.4, 0.9, 0.55]} p={[SHELF[0], 0.45, SHELF[2]]} c={retro ? "#8a5a30" : "#e8e4f0"} />
      <B s={[2.4, 0.06, 0.6]} p={[SHELF[0], 0.92, SHELF[2]]} c={retro ? "#6a3a18" : "#c8c4d4"} />
      <B s={[0.3, 0.36, 0.14]} p={SNACK} c="#ff7a3a" e={["#ff7a3a", 0.1]} />
      <Label p={[SNACK[0], SNACK[1] + 0.02, SNACK[2] + 0.075]} text={["SNACK"]} w={0.24} h={0.1} bg="#fff4c8" fg="#c01818" />
      <Label p={TAG} r={[-0.25, 0, 0]} text={[`$${price.toFixed(2)}`]} w={0.42} h={0.17} bg="#fff4c8" fg={price > 1.01 ? "#c01818" : "#16121c"} border={price > 1.01 ? "#c01818" : undefined} />
      <FlipCalendar p={CAL} w={0.75} h={0.68} title="YEAR" value={String(year)} />
      {i === 2 ? <group position={[handSp(t)[0], handSp(t)[1] + 0.36, handSp(t)[2] + 0.22]} rotation={[0, 0.1, 0.06 * Math.sin(t * 7)]}><Bill s={billScale(t)} /></group> : null}
      {i === 2 ? <Stamp p={[handSp(t)[0] - 0.05, handSp(t)[1] + 0.6, handSp(t)[2] + 0.24]} text="UNDER 12¢ (1970 MONEY)" u={clamp((t - W(1, "twelve")) / 0.25)} w={0.34} /> : null}
      {i === 4 ? <Stamp p={[SNACK[0], 1.55, SNACK[2] + 0.2]} text="ALMOST 9x" u={clamp((t - tNine) / 0.25)} w={0.6} /> : null}
      {i === 6 ? <Stamp p={[P_SV[0] - 0.05, 1.62, P_SV[2] + 0.42]} text="NOT A GUESS" u={clamp((t - tGuess) / 0.25)} w={0.5} color={PAL.cash} /> : null}
      {i === 12 || i === 13 ? <Label p={[P_SP[0] - 0.75, 1.95, P_SP[2] - 0.6]} text={["~4% A YEAR"]} w={0.7} h={0.22} bg={PAL.debt} fg="#fff4c8" /> : null}
      {drips}
      {Array.from({ length: trail }, (_, q) => <CoinStack key={`tr${q}`} p={[P_SP[0] + 0.4 + 0.12 * Math.sin(q), 0, P_SP[2] - 0.45 - 0.32 * q]} n={1 + (q % 2)} s={1.0} />)}
      {actors.map((a) => (
        <Squash key={a.name} p={[a.pose.x, 0, a.pose.z]} k={a.name === "Spender" ? k : 0}>
          <Act look={a.look} pose={a.pose} emotion={a.emo} s={SC} t={t} seed={a.seed} held={a.held} />
        </Squash>
      ))}
    </>
  );
};

// ------------------------------------------------------------------ QA
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
export const D1970_QA = (t: number): { actors: Box[]; props: Box[] } => {
  const sh = D1970_SHOTS.find((s) => t >= s.a && t < s.b) ?? D1970_SHOTS[D1970_SHOTS.length - 1];
  const i = idx(sh.id);
  const as = actorsAt(i, t);
  const actors = as.flatMap((a) => actorBoxes(a.name, [a.pose.x, 0, a.pose.z], SC, a.pose));
  const props: Box[] = [box("shelf", [SHELF[0], 0.47, SHELF[2]], [1.2, 0.47, 0.3])];
  if (i === 12 || i === 13) for (let q = 0; q < 5; q++) { const p = dripPos(q, t); if (p) props.push(box(`drip${q}`, p, [0.05, 0.05, 0.05])); }
  if (i === 12 || i === 13) props.push(box("rate", [P_SP[0] - 0.75, 1.95, P_SP[2] - 0.6], [0.35, 0.11, 0.03]));
  if (i === 6) props.push(box("notGuess", [P_SV[0] - 0.05, 1.62, P_SV[2] + 0.42], [0.25, 0.07, 0.03]));
  return { actors, props };
};

// ------------------------------------------------------------------ overlay
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (!(t < lineEnd(1) + 0.3 || t >= tLoopShot)) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 80, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 82, lineHeight: 1.06, color: "#ffd23a", textAlign: "center", whiteSpace: "nowrap", WebkitTextStroke: "9px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.7)" }}>
        YOUR $1 = UNDER 12¢
        <br />
        <span style={{ color: "#ffffff", fontSize: 64 }}>(IN 1970 MONEY)</span>
      </div>
    </div>
  );
};
const overlay = (t: number) => (
  <>
    <Hook t={t} />
    <WordCaption words={WORDS} t={t} hot={speaking("spender", t) ? "#ff5a4f" : "#5ff08a"} />
  </>
);
export const D1970_SPEC: FinSpec = {
  slug: "dollar-1970",
  shots: D1970_SHOTS,
  duration: DURATION,
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene: (t, s) => scene(t, s),
  counter: () => null,
  tag: (t, s) => (idx(s.id) >= 3 && idx(s.id) <= 15 ? "CPI-U AVERAGE" : null),
  bg: "#4a7ad8",
  overlay,
};

// ------------------------------------------------------------------ audio
export const D1970_AUDIO: StoryAudio = {
  music: "curious",
  cues: [
    { t: 0, sfx: "zap", db: -8 }, { t: 0.02, sfx: "whoosh", db: -4 },
    { t: 0.95, sfx: "gasp", db: -6 }, { t: T("S02") + 0.1, sfx: "impact", db: -4 }, { t: W(1, "twelve"), sfx: "stamp", db: -4 },
    { t: tNine, sfx: "stamp", db: -2 }, { t: tNine + 0.02, sfx: "thud", db: -6 },
    { t: T("S05"), sfx: "paper", db: -6 }, { t: tGuess, sfx: "stamp", db: -4 },
    { t: T("S08"), sfx: "boing", db: -8 },
    { t: T("S09"), sfx: "suspense", db: -4 }, { t: tWatch, sfx: "water", db: -8 },
    { t: T("S10"), sfx: "chime", db: -6 },
    { t: tCost, sfx: "whoosh", db: -4 }, { t: tCost + 0.15, sfx: "cash", db: -2 }, { t: tCost + 0.35, sfx: "impact", db: -4 },
    { t: tDrip, sfx: "coins", db: -8 }, { t: tDrip + 0.6, sfx: "drop", db: -10 }, { t: T("S13"), sfx: "clock", db: -6 },
    { t: T("S14"), sfx: "fail", db: -6 },
    { t: T("S15"), sfx: "chime", db: -8 },
    { t: END - 0.3, sfx: "whoosh", db: -2 },
  ],
};

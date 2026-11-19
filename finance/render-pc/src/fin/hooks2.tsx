// Hook prototypes v2 (finance/hooks/{A2,B2}): the owner's picks A "TV" and B "burn", rebuilt around EMOTION (big
// reaction faces that change >= 3 times, squash/stretch on each reaction) and IMPACT (slams with a 2-3 frame shake, a
// white flash frame, a bass thump, bouncing debris). Frame 0 is a composed thumbnail mid-action. Shots <= ~0.7 s, the
// final reaction <= 1.0 s. Captions: 1-3 words, 84 px, upper-middle band, the spoken word in red, clear of the bottom
// 420 px and the right-hand button column.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SPENDER } from "../library/characters";
import { clamp, hash, lerp, ss } from "../blocky/motion";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { Act, stand, yawTo } from "./core";
import type { FinShot, FinSpec } from "./core";
import { BillBrick, Bill, FlipCalendar, Hall, Label } from "./props";
import { B, CT, Card, Dust, FACE, Furnace, Reader, SC, Store, TOP, TV, at, easeOut, lin, mk, shot } from "./hooks";
import type { Cue, HookId } from "./hooks";
import { HOOKS } from "../shorts/hooks.timings.gen";

// ------------------------------------------------------------------ shared v2 pieces
/** a 2-3 frame camera shake per hit (bigger than v1, gone fast) */
const jolt = (hits: number[], amp = 0.09) => (t: number) => hits.reduce((s, h) => s + (t >= h && t < h + 0.1 ? amp * (1 - (t - h) / 0.1) : 0), 0) + 0.003;
/** squash/stretch after a reaction at t0: squash first, then a stretch, settling in ~0.35 s */
const sqAt = (t: number, hits: number[]) => hits.reduce((k, h) => (t >= h ? k + 0.22 * Math.exp(-(t - h) * 9) * Math.cos((t - h) * 26) : k), 0);
/** an actor squashed about its feet (k > 0 squash, k < 0 stretch) */
const Squash: React.FC<{ p: V3; k: number; children: React.ReactNode }> = ({ p, k, children }) => (
  <group position={[p[0], 0, p[2]]} scale={[1 + 0.5 * k, 1 - k, 1 + 0.5 * k]}>
    <group position={[-p[0], 0, -p[2]]}>{children}</group>
  </group>
);
/** small blocks thrown out from p at t0 that bounce twice on the floor at y0 */
const Debris: React.FC<{ p: V3; t: number; t0: number; n?: number; c?: string[]; y0?: number; size?: number }> = ({ p, t, t0, n = 12, c = ["#d6d0e8", "#ffd23a", "#3a3f58"], y0 = 0, size = 0.07 }) => {
  const tau = t - t0;
  if (tau < 0 || tau > 1.6) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i + 1) * Math.PI * 2;
        const v = 1.2 + 1.4 * hash(i + 2);
        const vy = 2.0 + 1.6 * hash(i + 3);
        const g = 9.8;
        // ballistic, then two damped bounces
        const T1 = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, p[1] - y0))) / g;
        let y: number;
        let tt = tau;
        if (tt < T1) y = p[1] + vy * tt - 0.5 * g * tt * tt;
        else {
          tt -= T1;
          const v2 = vy * 0.45, T2 = (2 * v2) / g;
          if (tt < T2) y = y0 + v2 * tt - 0.5 * g * tt * tt;
          else { tt -= T2; const v3 = v2 * 0.4, T3 = (2 * v3) / g; y = tt < T3 ? y0 + v3 * tt - 0.5 * g * tt * tt : y0; }
        }
        const d = v * Math.min(tau, T1 + 0.5) * (tau > T1 ? 0.8 : 1);
        const s = size * (0.6 + 0.8 * hash(i + 4));
        return <B key={i} s={[s, s, s]} p={[p[0] + Math.cos(a) * d, y + s / 2, p[2] + Math.sin(a) * d * 0.7]} r={[tau * 9 * hash(i), tau * 7, 0]} c={c[i % c.length]} rough={0.6} />;
      })}
    </group>
  );
};
/** white impact flash: one full frame, then two fading */
const flashOp = (t: number, hits: number[]) => {
  let o = 0;
  for (const h of hits) {
    const f = Math.floor((t - h) * 30 + 1e-6);
    if (f >= 0 && f < 3) o = Math.max(o, [0.85, 0.4, 0.12][f]);
  }
  return o;
};
/** 1-3 word captions, upper-middle band, the word being spoken in red; clear of the bottom 420 px and the right rail */
const Caption: React.FC<{ h: HookId; t: number; hot?: string }> = ({ h, t, hot = "#ff3b30" }) => {
  const ws = HOOKS[h].words;
  // chunks of <= 3 words, broken at punctuation and pauses
  const chunks: (typeof ws)[] = [];
  let cur: typeof ws = [];
  ws.forEach((q, i) => {
    cur.push(q);
    const nx = ws[i + 1];
    if (cur.length >= 3 || /[.,!?…]$/.test(q.w) || (nx && nx.a - q.b > 0.25) || !nx) { chunks.push(cur); cur = []; }
  });
  const ci = chunks.findIndex((c, i) => t >= c[0].a - 0.05 && t < (chunks[i + 1] ? chunks[i + 1][0].a - 0.05 : c[c.length - 1].b + 0.5));
  if (ci < 0) return null;
  const c = chunks[ci];
  const u = clamp((t - c[0].a + 0.05) / 0.15);
  const x = u - 1, s = u >= 1 ? 1 : 0.5 + 0.5 * (1 + 3.4 * x * x * x + 2.4 * x * x);
  return (
    <div style={{ position: "absolute", left: 70, right: 170, top: 1920 * 0.3 - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s})`, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 84, lineHeight: 1.05, WebkitTextStroke: "7px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 16px rgba(8,4,16,0.6)" }}>
        {c.map((q, i) => (
          <span key={i} style={{ color: t >= q.a - 0.03 && t < q.b + 0.05 ? hot : "#ffffff" }}>{(i ? " " : "") + q.w.toUpperCase()}</span>
        ))}
      </div>
    </div>
  );
};
const overlayOf = (h: HookId, hits: number[]) => (t: number) => {
  const o = flashOp(t, hits);
  return (
    <>
      {o > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: o }} /> : null}
      <Caption h={h} t={t} />
    </>
  );
};
const W = (h: HookId, w: string, from = 0) => at(h, w, from);

// ================================================================== A2 "TV"
// Spender just bought a TV. | He'll be paying for it for | nineteen | years.
const A = (() => {
  const tTV = W("A", "tv"), tHe = W("A", "hell"), tNine = W("A", "nineteen"), tYears = W("A", "years");
  const land = 0.3; // the TV slams onto the counter
  const swipe = tTV + 0.05; // card swipe + ding
  const boom = tHe + 0.42; // the calendar explodes
  const slaps = [tNine + 0.02, tNine + 0.2, tYears + 0.02]; // pages slap into his face
  const plant = 3.85; // his head slams onto the counter
  const end = 4.6;
  return { tTV, tHe, tNine, tYears, land, swipe, boom, slaps, plant, end };
})();
const P_A: V3 = [0.95, 0, 0.35]; // Spender beside the TV
const CAL: V3 = [CT[0] - 0.75, TOP, CT[2] + 0.25];
const tvY = (t: number) => (t < A.land ? TOP + 0.85 * (1 - (t / A.land) ** 2) + 0.02 : TOP + 0.07 * Math.abs(Math.sin((t - A.land) * 20)) * Math.exp(-(t - A.land) * 9));
const faceA = (): V3 => [P_A[0], FACE + 0.02, P_A[2]];
const A_SHOTS = (): FinShot[] => {
  const hitsAll = [A.land, A.boom, ...A.slaps, A.plant];
  const sh = jolt(hitsAll);
  return mk(
    [
      // A1 frame 0: the TV fills the frame mid-fall, 0.3 s from the slam
      ["A1", 0, shot({ subj: (t) => [CT[0] - 0.05, tvY(t) + 0.5, CT[2] - 0.05], posAt: (t) => lin([0.25, 1.75, 1.15], [0.2, 1.6, 1.0], t / 0.55), fov: 58, shake: sh, face: 0.5, blur: 0.6, push: 0 })],
      // A2: smug Spender leaning on his new TV, thumbs up
      ["A2", 0.55, shot({ subj: faceA, posAt: (t) => lin([P_A[0] - 0.75, 1.5, P_A[2] + 1.35], [P_A[0] - 0.55, 1.42, P_A[2] + 1.05], (t - 0.55) / 0.6), fov: 50, shake: sh, face: 0.6, blur: 1.4 })],
      // A3: the card swipe close-up (ding)
      ["A3", A.tTV - 0.06, shot({ subj: () => [READ[0], TOP + 0.12, READ[2]], posAt: (t) => lin([READ[0] - 0.55, TOP + 0.55, READ[2] + 0.6], [READ[0] - 0.4, TOP + 0.42, READ[2] + 0.48], (t - A.tTV) / 0.6), fov: 46, shake: sh, face: 0.55, blur: 2.0 })],
      // A4: the calendar starts flipping, his face behind turns curious
      ["A4", A.tHe - 0.1, shot({ subj: () => [CAL[0] + 0.35, TOP + 0.55, CAL[2]], posAt: (t) => lin([CAL[0] - 0.2, TOP + 0.75, CAL[2] + 1.5], [CAL[0] - 0.05, TOP + 0.7, CAL[2] + 1.15], (t - A.tHe) / 0.6), fov: 50, shake: sh, face: 0.58, blur: 1.4 })],
      // A5: the calendar EXPLODES at the lens
      ["A5", A.boom - 0.05, shot({ subj: () => [CAL[0], TOP + 0.6, CAL[2]], posAt: (t) => lin([CAL[0] + 0.2, TOP + 0.75, CAL[2] + 1.5], [CAL[0] + 0.15, TOP + 0.72, CAL[2] + 1.1], easeOut((t - A.boom) / 0.3)), fovAt: (t) => lerp(60, 50, easeOut((t - A.boom) / 0.2)), fov: 60, shake: sh, face: 0.55, blur: 1.0 })],
      // A6: "nineteen": the pages SLAP into his face (tight)
      ["A6", A.tNine - 0.06, shot({ subj: faceA, posAt: (t) => lin([P_A[0] - 0.2, FACE + 0.12, P_A[2] + 1.0], [P_A[0] - 0.15, FACE + 0.1, P_A[2] + 0.82], (t - A.tNine) / 0.6), fov: 46, shake: sh, face: 0.6, blur: 1.8 })],
      // A7: "years": angle change, low and closer: despair, pages stuck on him and raining
      ["A7", A.tYears - 0.04, shot({ subj: faceA, posAt: (t) => lin([P_A[0] + 0.55, FACE - 0.25, P_A[2] + 0.95], [P_A[0] + 0.45, FACE - 0.22, P_A[2] + 0.75], (t - A.tYears) / 0.7), fov: 48, shake: sh, face: 0.6, blur: 1.6, roll: [3, 1] })],
      // A8: final reaction: his head SLAMS onto the counter beside the TV that now reads 19 YEARS
      ["A8", A.plant - 0.2, shot({ subj: () => [P_A[0] - 0.35, 1.05, P_A[2] - 0.2], posAt: (t) => lin([P_A[0] + 0.9, 1.75, P_A[2] + 2.5], [P_A[0] + 0.7, 1.65, P_A[2] + 2.1], (t - A.plant) / 0.8), fov: 56, shake: sh, face: 0.6, blur: 1.2, roll: [-2, 0] })],
    ],
    A.end,
  );
};
const READ: V3 = [CT[0] + 0.62, TOP, CT[2] + 0.35];
const A_SCENE = (t: number): React.ReactNode => {
  // TV: falls (already moving at frame 0), slams, settles; the screen flips to 19 YEARS for the final beat
  const sq = t >= A.land ? 0.14 * Math.exp(-(t - A.land) * 12) : 0;
  const screen = t >= A.plant - 0.25 ? ["19 YEARS", "OF PAYMENTS"] : ["BIG TV"];
  // Spender's emotional arc: joy (A1) -> sly (A2-A3) -> curious (A4) -> shock (A5-A6) -> sad (A7-A8)
  const emo: Emotion = t < 0.5 ? "joy" : t < A.tHe - 0.1 ? "sly" : t < A.boom ? "curious" : t < A.tYears - 0.04 ? "shock" : "sad";
  const reacts = [0.55, A.tHe - 0.1, A.boom, ...A.slaps, A.tYears - 0.04, A.plant];
  const k = sqAt(t, reacts);
  const plantU = ss(A.plant - 0.15, A.plant, t);
  const smug = t >= 0.5 && t < A.tHe - 0.1;
  const pose: Pose = {
    ...stand(P_A[0], P_A[2], lerp(yawTo(P_A, [0.3, 0, 3]) * 0.7, -0.9, plantU), SC),
    armL: t < 0.5 ? 2.7 : smug ? 0.9 + 0.1 * Math.sin(t * 8) : t < A.boom ? 0.6 : t < A.tYears - 0.04 ? 2.4 + 0.15 * Math.sin(t * 20) : lerp(0.4, 1.4, plantU),
    outL: t < 0.5 ? 0.4 : smug ? 0.25 : t < A.boom ? 0.15 : t < A.tYears - 0.04 ? 0.9 : 0.3,
    armR: t < 0.5 ? 2.7 : smug ? 2.5 : t < A.boom ? 0.6 : t < A.tYears - 0.04 ? 2.4 - 0.15 * Math.sin(t * 20) : lerp(0.4, 1.4, plantU),
    outR: t < 0.5 ? 0.4 : smug ? 0.5 : t < A.boom ? 0.15 : t < A.tYears - 0.04 ? 0.9 : 0.3,
    pitch: lerp(t >= A.tYears - 0.04 ? 0.12 : 0, 1.05, plantU),
    headPitch: t >= A.tYears - 0.04 ? 0.25 + 0.04 * Math.sin(t * 17) : smug ? -0.12 : 0,
    headYaw: smug ? 0.25 : 0,
    bob: t < 0.5 ? -0.05 * Math.abs(Math.sin(t * 14)) : 0,
  };
  // calendar: flips YEAR 1..19 from "He'll", explodes at boom
  const flips = t < A.tHe ? 1 : Math.min(19, 1 + Math.floor((t - A.tHe) / ((A.boom - A.tHe) / 6)));
  const pages: React.ReactNode[] = [];
  if (t >= A.boom) {
    for (let i = 0; i < 16; i++) {
      const u = (t - A.boom - i * 0.025) / 0.7;
      if (u <= 0 || u >= 1) continue;
      const a = hash(i) * Math.PI * 2, r = 0.2 + 1.8 * easeOut(u);
      pages.push(<Label key={i} p={[CAL[0] + Math.cos(a) * r * 0.8, TOP + 0.6 + Math.sin(a) * r * 0.6 + 0.3 * u, CAL[2] + 1.4 * u]} text={["YEAR", String(i + 4)]} w={0.4} h={0.32} bg="#fffaf0" fg={i >= 14 ? "#c01818" : "#16121c"} r={[0.6 * Math.sin(u * 7 + i), 0.8 * Math.sin(u * 5 + i), 0.9 * Math.sin(u * 6 + i)]} />);
    }
  }
  // the slapping pages: each flies from the lens side into his face and sticks
  const f = faceA();
  A.slaps.forEach((h, i) => {
    const u = clamp((t - (h - 0.12)) / 0.12);
    if (t < h - 0.12) return;
    const off: V3 = [[-0.12, 0.08, 0.2], [0.14, -0.06, 0.2], [0.0, 0.16, 0.21]][i] as V3;
    const from: V3 = [f[0] - 0.6 + 0.5 * i, f[1] + 0.3, f[2] + 1.2];
    const stick: V3 = [f[0] + off[0], f[1] + off[1], f[2] + off[2]];
    const p = t < A.plant - 0.2 ? lin(from, stick, u) : [stick[0] - 0.4 * plantU, stick[1] - 0.5 * plantU, stick[2] - 0.3 * plantU] as V3;
    pages.push(<Label key={`s${i}`} p={p} text={["YEAR", ["19", "18", "19"][i]]} w={0.3} h={0.24} bg="#fffaf0" fg="#c01818" r={[0, 0, [-0.35, 0.3, 0.1][i] + (1 - u) * 2]} />);
  });
  // pages raining in A7/A8
  if (t >= A.tYears - 0.1) for (let i = 0; i < (t >= A.plant - 0.2 ? 5 : 12); i++) {
    const u = ((t - A.tYears) * 0.55 + i / 12) % 1;
    pages.push(<Label key={`r${i}`} p={[P_A[0] - 0.7 + 1.4 * hash(i + 11), FACE + 1.1 - 1.9 * u, P_A[2] + 0.3 + 0.5 * hash(i + 2)]} text={["YEAR", String(8 + (i % 12))]} w={0.26} h={0.2} bg="#fffaf0" fg="#c01818" r={[0.5 * Math.sin(u * 9 + i), 0.7 * Math.sin(u * 6 + i), 0.8 * Math.sin(u * 7 + i)]} />);
  }
  const swipeU = clamp((t - A.swipe + 0.15) / 0.2);
  return (
    <>
      <Store sign="ELECTRONICS" />
      <ambientLight intensity={0.25} />
      <group position={[CT[0] - 0.05, tvY(t), CT[2] - 0.05]} rotation={[0, 0.2, t < A.land ? 0.12 * (1 - t / A.land) : 0]} scale={[1 + 0.5 * sq, 1 - sq, 1 + 0.5 * sq]}>
        <TV p={[0, 0, 0]} screen={screen} screenBg={screen.length > 1 ? "#c01818" : "#ffd23a"} />
      </group>
      <Dust p={[CT[0], TOP + 0.02, CT[2] + 0.15]} u={(t - A.land) / 0.55} n={18} r={1.2} />
      <Debris p={[CT[0], TOP + 0.05, CT[2] + 0.2]} t={t} t0={A.land} n={14} y0={TOP} />
      <Reader p={READ} lit={swipeU} />
      {t >= A.tTV - 0.1 && t < A.tHe ? <Card p={[READ[0] + lerp(-0.22, 0.22, easeOut(swipeU)), TOP + 0.14, READ[2]]} r={[0, Math.PI / 2, 0]} s={1.4} /> : null}
      {t < A.boom ? <FlipCalendar p={[CAL[0], TOP + 0.42, CAL[2]]} w={0.72} h={0.62} title="YEAR" value={String(flips)} /> : null}
      <Dust p={[CAL[0], TOP + 0.6, CAL[2] - 0.1]} u={(t - A.boom) / 0.4} n={8} r={0.6} c="#fffaf0" />
      <Debris p={[CAL[0], TOP + 0.5, CAL[2] + 0.1]} t={t} t0={A.boom} n={10} y0={TOP} c={["#fffaf0", "#c01818"]} />
      <Debris p={[P_A[0] - 0.45, TOP + 0.3, P_A[2] - 0.5]} t={t} t0={A.plant} n={10} y0={TOP} c={["#fffaf0", "#c01818", "#d6d0e8"]} size={0.06} />
      {pages}
      <Squash p={P_A} k={k}>
        <Act look={SPENDER} pose={pose} emotion={emo} s={SC} t={t} seed={2} />
      </Squash>
    </>
  );
};

// ================================================================== B2 "burn"
// This guy is | about to pay | eight thousand | dollars... | for | nothing.
const Bt = (() => {
  const tPay = W("B", "pay"), tEight = W("B", "eight"), tDol = W("B", "dollars"), tFor = W("B", "for", W("B", "dollars")), tNo = W("B", "nothing");
  return { tPay, tEight, tDol, tFor, tNo, toss0: 0.62, slam1: 0.82, burst: 1.3, end: 4.8, knees: tNo + 0.35 };
})();
const P_B: V3 = [0.35, 0, 0.15];
const FUR: V3 = [-1.05, 0, -1.0];
const MOUTH: V3 = [FUR[0], 0.7, FUR[2] + 0.62];
const faceB = (y = 0): V3 => [P_B[0], FACE + 0.02 - y, P_B[2]];
const kneeY = (t: number) => 0.38 * ss(Bt.knees - 0.15, Bt.knees, t);
const B_SHOTS = (): FinShot[] => {
  const hits = [Bt.slam1, Bt.tEight, Bt.tFor, Bt.knees];
  const sh = jolt(hits);
  return mk(
    [
      // B1 frame 0: tight on his grin, brick in hand, warm furnace light
      ["B1", 0, shot({ subj: () => faceB(0.12), posAt: (t) => lin([P_B[0] + 0.15, FACE - 0.05, P_B[2] + 1.35], [P_B[0] + 0.12, FACE - 0.06, P_B[2] + 1.15], t / 0.62), fov: 52, shake: sh, face: 0.6, blur: 1.6 })],
      // B2: the brick SLAMS into the furnace mouth: fire burst
      ["B2", Bt.toss0, shot({ subj: () => [MOUTH[0] + 0.2, MOUTH[1] + 0.35, MOUTH[2]], posAt: (t) => lin([MOUTH[0] + 1.5, MOUTH[1] + 0.7, MOUTH[2] + 2.4], [MOUTH[0] + 1.2, MOUTH[1] + 0.6, MOUTH[2] + 1.9], (t - Bt.toss0) / 0.6), fov: 56, shake: sh, face: 0.55, blur: 1.2 })],
      // B4: "eight thousand": smug, two bricks at once
      ["B4", Bt.tEight - 0.08, shot({ subj: () => [P_B[0] - 0.2, 1.15, P_B[2]], posAt: (t) => lin([P_B[0] - 1.5, 1.5, P_B[2] + 1.7], [P_B[0] - 1.25, 1.45, P_B[2] + 1.4], (t - Bt.tEight) / 0.6), fov: 52, shake: sh, face: 0.58, blur: 1.2 })],
      // B3: "dollars...": the chimney erupts: bills as confetti
      ["B3", Bt.tDol + 0.1, shot({ subj: () => [FUR[0] + 0.4, 2.9, FUR[2] - 0.2], posAt: (t) => lin([FUR[0] + 1.1, 1.9, FUR[2] + 2.2], [FUR[0] + 0.9, 2.1, FUR[2] + 1.8], (t - Bt.tDol) / 0.6), fov: 60, shake: sh, face: 0.5, blur: 0.8 })],
      // B5: the pause: he reaches back: the stack is gone
      ["B5", Bt.tDol + 0.55, shot({ subj: () => [P_B[0] + 0.3, 0.95, P_B[2]], posAt: (t) => lin([P_B[0] + 0.9, 1.5, P_B[2] + 1.9], [P_B[0] + 0.75, 1.45, P_B[2] + 1.6], (t - Bt.tDol - 0.55) / 0.4), fov: 56, shake: sh, face: 0.58, blur: 1.4 })],
      // B6: "for...": record scratch, SLAM on his shocked face
      ["B6", Bt.tFor - 0.04, shot({ subj: () => faceB(), posAt: (t) => lin([P_B[0] + 0.1, FACE + 0.12, P_B[2] + 1.05], [P_B[0] + 0.08, FACE + 0.08, P_B[2] + 0.72], easeOut((t - Bt.tFor) / 0.15)), fovAt: (t) => lerp(56, 44, easeOut((t - Bt.tFor) / 0.12)), fov: 44, shake: sh, face: 0.6, blur: 1.8 })],
      // B7: "nothing": angle change, low: despair, he drops to his knees (thud), bills raining
      ["B7", Bt.tNo - 0.04, shot({ subj: (t) => faceB(kneeY(t)), posAt: (t) => lin([P_B[0] - 0.65, 0.9, P_B[2] + 1.05], [P_B[0] - 0.55, 0.85, P_B[2] + 0.85], (t - Bt.tNo) / 0.7), fov: 50, shake: sh, face: 0.6, blur: 1.6, roll: [-3, -1] })],
      // B8: final: wide, the furnace burps out the last bill, he's on his knees with empty hands
      ["B8", Bt.knees + 0.4, shot({ subj: () => [-0.35, 0.9, -0.35], posAt: (t) => lin([1.4, 1.6, 2.8], [1.15, 1.5, 2.35], (t - Bt.knees) / 1.0), fov: 56, shake: sh, face: 0.58, blur: 0.9 })],
    ],
    Bt.end,
  );
};
const B_SCENE = (t: number): React.ReactNode => {
  // emotional arc: joy (B1) -> sly (B4) -> curious (B5) -> shock (B6) -> sad (B7-B8)
  const emo: Emotion = t < Bt.tEight - 0.08 ? "joy" : t < Bt.tDol + 0.55 ? "sly" : t < Bt.tFor - 0.04 ? "curious" : t < Bt.tNo - 0.04 ? "shock" : "sad";
  const k = sqAt(t, [Bt.toss0, Bt.tEight - 0.08, Bt.tDol + 0.55, Bt.tFor, Bt.tNo - 0.04, Bt.knees]);
  // throws: the brick in his hand leaves at toss0 and slams into the mouth at slam1; two more on "eight thousand"
  const throws = [Bt.toss0, Bt.tEight - 0.05, Bt.tEight + 0.05];
  const from: V3 = [P_B[0] - 0.25, 1.35, P_B[2] + 0.05];
  const flying: React.ReactNode[] = [];
  throws.forEach((t0, i) => {
    const d = i === 0 ? Bt.slam1 - Bt.toss0 : 0.32;
    const u = (t - t0) / d;
    if (u <= 0 || u >= 1) return;
    flying.push(<BillBrick key={`f${i}`} p={[lerp(from[0] + 0.12 * i, MOUTH[0], u), lerp(from[1], MOUTH[1], u) + 0.6 * Math.sin(Math.PI * u), lerp(from[2], MOUTH[2], u)]} s={2.4} r={[u * 6, u * 4, u * 2]} />);
  });
  const inHand = t < Bt.toss0 || (t >= Bt.tEight - 0.35 && t < Bt.tEight - 0.05);
  const throwing = (t >= Bt.toss0 - 0.15 && t < Bt.toss0 + 0.15) || (t >= Bt.tEight - 0.2 && t < Bt.tEight + 0.15);
  const reach = t >= Bt.tDol + 0.55 && t < Bt.tFor - 0.04;
  const kn = kneeY(t);
  const despair = t >= Bt.tNo - 0.04;
  const pose: Pose = {
    ...stand(P_B[0], P_B[2], reach ? yawTo(P_B, [P_B[0] + 1.2, 0, P_B[2] + 3]) : t >= Bt.tFor - 0.04 ? yawTo(P_B, [P_B[0] + 0.1, 0, P_B[2] + 3]) : t < Bt.toss0 ? yawTo(P_B, [0.6, 0, 3]) * 0.6 : yawTo(P_B, FUR) * 0.6 + 0.3, SC),
    armR: inHand ? 2.2 + 0.15 * Math.sin(t * 6) : throwing ? 2.6 : reach ? 0.5 + 0.2 * Math.sin(t * 14) : despair ? 0.25 : 0.5,
    outR: inHand ? 0.55 : reach ? 1.0 : 0.25,
    armL: t >= Bt.tFor - 0.04 && t < Bt.tNo - 0.04 ? 2.5 : reach ? 0.8 : despair ? 0.25 : 0.9 + 0.2 * Math.sin(t * 7),
    outL: t >= Bt.tFor - 0.04 && t < Bt.tNo - 0.04 ? 0.8 : 0.25,
    headPitch: despair ? 0.35 + 0.05 * Math.sin(t * 15) : reach ? 0.35 : -0.05,
    headYaw: reach ? 0.6 : 0,
    pitch: despair ? 0.15 : 0,
    bob: t < Bt.toss0 ? -0.03 * Math.abs(Math.sin(t * 10)) : 0,
  };
  const posed: Pose = { ...pose };
  if (kn > 0) { posed.y = (posed.y ?? 0) - kn; posed.legL = -1.3 * (kn / 0.38); posed.legR = -1.3 * (kn / 0.38); posed.pitch = 0.2; }
  const held = inHand ? { side: "R" as const, node: <BillBrick p={[0, -0.05, 0.08]} s={2.0} r={[0.3, 0.4, 0]} /> } : undefined;
  // the stack behind him: 3 bricks, then 1, then none
  const left = t < Bt.tEight - 0.35 ? 3 : t < Bt.tDol ? 1 : 0;
  const stack = Array.from({ length: left }, (_, i) => <BillBrick key={`s${i}`} p={[P_B[0] + 0.7, 0.17 * i, P_B[2] - 0.05]} s={2.4} />);
  // confetti from the chimney after each slam; bills rain on him at the end
  const conf: React.ReactNode[] = [];
  for (let i = 0; i < 50; i++) {
    const t0 = Bt.slam1 + 0.1 + (i % 25) * 0.07 + (i >= 25 ? Bt.tEight + 0.25 - Bt.slam1 : 0);
    const u = (t - t0) / 1.5;
    if (u <= 0 || u >= 1) continue;
    const a = hash(i) * Math.PI * 2;
    conf.push(<Bill key={i} p={[FUR[0] + 0.4 + Math.cos(a) * 1.4 * u, 2.9 + 2.4 * u - 1.9 * u * u, FUR[2] - 0.2 + Math.sin(a) * 1.1 * u + 0.6 * u]} r={[u * 9 + i, u * 6, u * 7 + i]} s={2.0} />);
  }
  if (despair) for (let i = 0; i < 16; i++) {
    const u = ((t - Bt.tNo) * 0.6 + i / 16) % 1;
    conf.push(<Bill key={`r${i}`} p={[P_B[0] - 0.8 + 1.6 * hash(i + 4), FACE + 1.0 - 1.9 * u, P_B[2] + 0.2 + 0.5 * hash(i + 8)]} r={[u * 8 + i, u * 5, u * 6]} s={1.7} />);
  }
  const heat = t >= Bt.slam1 ? 1.6 * Math.exp(-(t - Bt.slam1) * 3) + 0.6 : 0.8;
  const lastBill = t >= Bt.knees + 0.5 ? clamp((t - Bt.knees - 0.5) / 0.6) : -1;
  return (
    <>
      <Hall W={11} back={-3.5} front={7} wall="#9a6ad8" stripe="#ffb03a" floorA="#f6e0c8" floorB="#e8c8a8" />
      <ambientLight intensity={0.45} />
      <pointLight position={[P_B[0] - 0.6, 1.5, P_B[2] + 0.6]} color="#ffb070" intensity={2.4} distance={4} decay={2} />
      <Furnace p={FUR} t={t} heat={heat} base={0.5} />
      {stack}
      {flying}
      <Dust p={MOUTH} u={(t - Bt.slam1) / 0.45} n={14} r={0.7} c="#ffb03a" />
      <Debris p={MOUTH} t={t} t0={Bt.slam1} n={12} c={["#ffb03a", "#ff5a00", "#3fb86a"]} y0={0} size={0.06} />
      <Debris p={[P_B[0], 0.1, P_B[2] + 0.1]} t={t} t0={Bt.knees} n={10} c={["#3fb86a", "#e8c8a8"]} y0={0} size={0.05} />
      {conf}
      {lastBill >= 0 && lastBill < 1 ? <Bill p={[MOUTH[0] + 0.9 * lastBill, MOUTH[1] - 0.1 + 0.5 * Math.sin(Math.PI * lastBill), MOUTH[2] + 0.9 * lastBill]} r={[lastBill * 8, lastBill * 5, 0]} s={2.2} /> : null}
      <Squash p={P_B} k={k}>
        <Act look={SPENDER} pose={posed} emotion={emo} s={SC} t={t} seed={2} held={held} />
      </Squash>
    </>
  );
};

// ------------------------------------------------------------------ specs + audio
const spec2 = (slug: string, h: HookId, shots: FinShot[], scene: (t: number) => React.ReactNode, end: number, hits: number[], bg: string): FinSpec => ({
  slug,
  shots,
  duration: Math.round(end * 30),
  chunks: [],
  until: 0,
  whisper: [],
  ending: [],
  scene: (t) => scene(t),
  counter: () => null,
  tag: () => null,
  bg,
  overlay: overlayOf(h, hits),
});
const A_HITS = [A.land, A.boom, A.slaps[0], A.plant];
const B_HITS = [Bt.slam1, Bt.tEight, Bt.tFor, Bt.knees];
export const HOOK_A2 = spec2("hook-A2", "A", A_SHOTS(), A_SCENE, A.end, A_HITS, "#6a5ae8");
export const HOOK_B2 = spec2("hook-B2", "B", B_SHOTS(), B_SCENE, Bt.end, B_HITS, "#9a6ad8");
/** 3-6 strong SFX on payoffs and impacts (frame 0 included) + a bass thump under every slam; quiet texture otherwise */
export const HOOK2_AUDIO: Record<"A2" | "B2", { voice: HookId; music: string; duration: number; cues: Cue[] }> = {
  A2: {
    voice: "A",
    music: "upbeat",
    duration: A.end,
    cues: [
      { t: 0, sfx: "whoosh", db: -3 },
      { t: A.land, sfx: "impact", db: 0 }, { t: A.land, sfx: "boom", db: -4 }, { t: A.land + 0.02, sfx: "crash", db: -12 },
      { t: A.swipe, sfx: "cash", db: -2 },
      { t: A.boom, sfx: "boom", db: -2 }, { t: A.boom + 0.03, sfx: "paper", db: -8 },
      { t: A.slaps[0], sfx: "punch", db: 0 }, { t: A.slaps[0], sfx: "thud", db: -6 }, { t: A.slaps[1], sfx: "punch", db: -8 }, { t: A.slaps[2], sfx: "punch", db: -10 },
      { t: A.plant, sfx: "thud", db: 0 }, { t: A.plant, sfx: "boom", db: -6 }, { t: A.plant + 0.08, sfx: "fail", db: -8 },
    ],
  },
  B2: {
    voice: "B",
    music: "upbeat",
    duration: Bt.end,
    cues: [
      { t: 0, sfx: "fire", db: -6 }, { t: 0, sfx: "coins", db: -6 },
      { t: Bt.slam1, sfx: "impact", db: 0 }, { t: Bt.slam1, sfx: "boom", db: -4 }, { t: Bt.slam1 + 0.05, sfx: "fire", db: -4 },
      { t: Bt.tEight, sfx: "cash", db: -2 }, { t: Bt.tEight, sfx: "thud", db: -6 },
      { t: Bt.tFor - 0.06, sfx: "scratch", db: 0 }, { t: Bt.tFor, sfx: "boom", db: -6 },
      { t: Bt.knees, sfx: "thud", db: 0 }, { t: Bt.knees, sfx: "boom", db: -6 }, { t: Bt.knees + 0.1, sfx: "fail", db: -8 },
    ],
  },
};

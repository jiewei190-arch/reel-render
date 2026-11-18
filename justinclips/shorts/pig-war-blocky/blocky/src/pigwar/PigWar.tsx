// The Pig War (1859) in the blocky-shorts look. Same script, voice, shot plan and beats as justinclips/shorts/pig-war:
// the shot list and its times come from that Short's story/shots.json (built from lines.json + the voice's word timings),
// captions from its timeline/words.json. Every frame is a pure function of the frame number.
// Tone guard: the pig is never shown being shot ("He shot it." cuts away to gulls bursting out of a tree, off-screen
// BANG); no gun is ever pointed at anyone (the farmer's rifle is always held upright). Frame 1 = the hook; the last
// shot hard-cuts back to frame 1 (loop); no CTA.
// Status: stills pass. Shots s01 s02 s05 s09 s11 s13 are staged; the others use a stand-in set until the motion pass.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Blocky } from "../blocky/Blocky";
import type { Held, Look } from "../blocky/Blocky";
import { Blob } from "../blocky/Contact";
import type { Emotion, Pose, V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import { subFrame, useFonts } from "../engine/core/frame";
import { makeChunks } from "../engine/core/captions";
import type { Word } from "../engine/core/captions";
import { View } from "../engine/core/View";
import type { Cam } from "../engine/core/View";
import { PopCaptions } from "../library/PopCaptions";
import { alive, base, blinkAt, facePoint, pop, walk } from "../library/characters";
import { BLUECOAT, extra, FARMER, OFFICIAL, REDCOAT } from "./cast";
import { moodOfShot } from "./mood";
import type { MoodId } from "./mood";
import { Pig } from "./pig";
import { Cabin, Cannon, Coin, Fence, Flag, FarIslands, Island, Patch, Pine, Rifle, Rock, Rowboat, Tent, Tufts, Tumble, Warship } from "./world";
import shotsJson from "./data/shots.json";
import wordsJson from "./data/words.json";

export const FPS = 30;
type ShotRow = { id: string; start: number; end: number };
const SHOTS: ShotRow[] = (shotsJson as { shots: ShotRow[] }).shots;
const DUR: number = (shotsJson as { duration: number }).duration;
export const PW_FRAMES = Math.ceil(DUR * FPS);
const WORDS: Word[] = (wordsJson as { words: { word: string; start: number; end: number }[] }).words.map((w) => [w.word, w.start, w.end]);
// captions keep the script's casing (words.json is aligned to script.txt: "America", "Britain"); makeChunks lowercases,
// so the chunk words are mapped back to the original words by position
const CHUNKS = (() => {
  const ch = makeChunks(WORDS, DUR, FPS);
  let i = 0;
  return ch.map((c) => ({ ...c, words: c.words.map(() => WORDS[i++][0]) }));
})();
const TOP_UNTIL = 3.4;
const shotAt = (n: number) => {
  let i = 0;
  for (let k = 0; k < SHOTS.length; k++) if (n >= Math.round(SHOTS[k].start * FPS)) i = k;
  return SHOTS[i];
};
/** onset (s, global) of the first word starting with `w` at or after `after` */
const onset = (w: string, after: number, fb: number) => {
  const x = WORDS.find((q) => q[1] >= after - 0.05 && q[0].toLowerCase().replace(/[^a-z0-9]/g, "").startsWith(w));
  return x ? x[1] : fb;
};

// ------------------------------------------------------------------ helpers
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** subject + offset lens with a constant push-in (PUSH x distance per s) and a small roll drift */
const lens = (subj: V3, off: V3, fov: number, face: number, tau: number, push = 0.1, roll: [number, number] = [0, 1]): Cam => {
  const k = 1 - push * tau;
  const c = aim([subj[0] + off[0] * k, subj[1] + off[1] * k, subj[2] + off[2] * k], subj, fov, face);
  return { ...c, roll: lerp(roll[0], roll[1], clamp(tau / 2)) };
};
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ pos: mixV(a.pos, b.pos, u), look: mixV(a.look, b.look, u), fov: lerp(a.fov, b.fov, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) });

type A = { key: string; look: Look; pose: Pose; emotion: Emotion; seed: number; held?: Held };
const Actor: React.FC<{ a: A; t: number; still?: boolean }> = ({ a, t, still }) => {
  const live = still ? a.pose : alive({ key: a.key, look: a.look, pose: a.pose, emotion: a.emotion, s: 1, blinkSeed: a.seed }, t).pose;
  return (
    <>
      <Blocky pose={live} look={a.look} emotion={a.emotion} blink={blinkAt(t, a.seed)} held={a.held} />
      <Blob p={[a.pose.x, 0, a.pose.z]} sx={0.75} sz={0.55} yaw={-a.pose.yaw} op={0.55} />
    </>
  );
};
/** arm pose helpers (rad): a point forward, a talking-hands beat */
const pointArm = (p: Pose, side: "L" | "R", k: number, up = 0.1): Pose => (side === "L" ? { ...p, armL: lerp(p.armL, 1.45 + up, k), outL: lerp(p.outL, 0.08, k) } : { ...p, armR: lerp(p.armR, 1.45 + up, k), outR: lerp(p.outR, 0.08, k) });
const talk = (p: Pose, t: number, side: "L" | "R", k = 1): Pose => {
  const b = Math.sin(t * 5.5);
  return side === "L" ? { ...p, armL: lerp(p.armL, 0.9 + 0.18 * b, k), outL: lerp(p.outL, 0.25, k) } : { ...p, armR: lerp(p.armR, 0.9 + 0.18 * b, k), outR: lerp(p.outR, 0.25, k) };
};

// ------------------------------------------------------------------ sets
/** the standoff corridor: redcoats down the left, bluecoats down the right, facing each other; the bay at the end */
const CORR_Z = [0.9, 0.15, -0.6, -1.35, -2.1, -2.85];
/** skip: front rows left out of this shot; xs: half-width of the corridor. Chosen per shot by a numeric edge check so
 *  every face is fully in frame or fully out for the whole shot (no half faces at the frame edge). */
const corridorActors = (t: number, eR: Emotion, eB: Emotion, o: { point?: boolean; lean?: number; skip?: number; xs?: number } = {}): A[] => {
  const out: A[] = [];
  const sk = o.skip ?? 0, xs = o.xs ?? 0.82;
  CORR_Z.forEach((z, i) => {
    if (i < sk) return;
    const lookR = i === 0 ? REDCOAT : extra(REDCOAT, i);
    const lookB = i === 0 ? BLUECOAT : extra(BLUECOAT, i + 2);
    let pr = base(-xs - (i % 2) * 0.06, z, Math.PI / 2 - 0.32, 1, { pitch: o.lean ?? 0, armL: 0.02, armR: 0.02, outL: 0.04, outR: 0.04 });
    let pb = base(xs + (i % 2) * 0.06, z, -Math.PI / 2 + 0.32, 1, { pitch: o.lean ?? 0, armL: 0.02, armR: 0.02, outL: 0.04, outR: 0.04 });
    if (o.point && i === sk) {
      pr = pointArm(pr, "R", 1, -0.15 + 0.06 * Math.sin(t * 7));
      pb = pointArm(pb, "L", 1, -0.15 + 0.06 * Math.sin(t * 7 + 1));
    }
    if (o.point && i === sk + 1) {
      pr = talk(pr, t + 0.4, "L");
      pb = talk(pb, t, "R");
    }
    out.push({ key: `r${i}`, look: lookR, pose: pr, emotion: eR, seed: 20 + i });
    out.push({ key: `b${i}`, look: lookB, pose: pb, emotion: eB, seed: 40 + i });
  });
  return out;
};
const Bay: React.FC<{ t: number; seaZ: number }> = ({ t, seaZ }) => (
  <>
    <Island t={t} seaZ={seaZ} back={20} />
    <FarIslands z={seaZ - 70} />
    <Warship p={[-2.6, -0.45, seaZ - 10]} yaw={0.3} s={1.1} t={t} seed={1} />
    <Warship p={[4.5, -0.45, seaZ - 20]} yaw={-0.25} s={1.0} t={t} seed={2} />
  </>
);
const Corridor: React.FC<{ t: number; actors: A[]; tumble?: V3; still?: boolean }> = ({ t, actors, tumble }) => (
  <>
    <Bay t={t} seaZ={-6.5} />
    {[[-3.2, -4.6, 0], [3.4, -4.2, 1], [-2.4, -5.6, 2], [2.6, -5.8, 3], [-4.6, -3.0, 4], [4.4, -2.6, 5]].map(([x, z, s]) => <Pine key={s} p={[x, 0, z]} s={0.62 + (s % 3) * 0.08} seed={s} t={t} />)}
    <Flag kind="uk" p={[-1.3, 0, -3.9]} h={2.4} t={t} yaw={0.2} />
    <Flag kind="us" p={[0.8, 0, -3.9]} h={2.4} t={t + 0.7} yaw={-0.2} />
    {actors.map((a) => <Actor key={a.key} a={a} t={t} />)}
    <Rock p={[-0.75, 0, 2.3]} s={0.55} yaw={0.4} />
    <Rock p={[0.85, 0, 2.6]} s={0.45} yaw={1.2} />
    <Tufts x={[-3, 3]} z={[-3.5, 3.2]} n={260} keep={[[0, -0.6, 0.4]]} />
    {tumble ? <Tumble p={tumble} spin={-t * 7} /> : null}
  </>
);
/** the farmer's place: cabin, potato patch, fence, pines, the sea behind */
const Garden: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <>
    <Island t={t} seaZ={-9} back={20} />
    <FarIslands z={-75} />
    <Cabin p={[-1.1, 0, -3.3]} yaw={0.3} s={0.78} />
    <Patch p={[1.5, 0, -1.2]} s={0.6} />
    <Fence p={[-2.6, 0, 1.8]} n={9} />
    {[[-3.8, -5.5, 0], [2.8, -5.2, 1], [4.2, -3.6, 2], [-4.6, -2.6, 3], [0.8, -6.4, 4]].map(([x, z, s]) => <Pine key={s} p={[x, 0, z]} s={0.62 + (s % 3) * 0.08} seed={s} t={t} />)}
    <Tufts x={[-4, 4]} z={[-6, 3]} n={220} keep={[[-1.1, -3.3, 1.8], [1.5, -1.2, 1.4]]} seed={4} />
    <Warship p={[6, -0.45, -24]} yaw={-0.3} s={0.5} t={t} seed={3} />
    {children}
  </>
);
/** the hilltop camp: rows of bluecoats, cannons, tents, the flag */
const campActors = (t: number, c0: number): A[] => {
  const out: A[] = [];
  for (let i = 0; i < 12; i++) {
    const col = (i % 4) - 1.5, row = Math.floor(i / 4);
    const hero = i === 1;
    let p = base(col * 0.78 + (hero ? 0.39 : 0), 0.6 - row * 0.95, 0, 1, { armL: 0.02, armR: 0.02, outL: 0.03, outR: 0.03 });
    if (hero) {
      const s = clamp(pop((t - c0 + 0.1) / 0.7));
      p = { ...p, x: 0, armR: lerp(0.02, 2.75, s), outR: lerp(0.03, -0.35, s) };
    }
    out.push({ key: `c${i}`, look: hero ? BLUECOAT : extra(BLUECOAT, i), pose: p, emotion: hero ? "angry" : "flat", seed: 60 + i });
  }
  return out;
};
const Camp: React.FC<{ t: number; actors: A[] }> = ({ t, actors }) => (
  <>
    <Island t={t} seaZ={-12} back={20} />
    <FarIslands z={-80} />
    <Warship p={[-5, -0.45, -24]} yaw={0.4} s={0.55} t={t} seed={4} />
    {actors.map((a) => <Actor key={a.key} a={a} t={t} />)}
    <Cannon p={[-2.0, 0, 0.9]} s={0.6} />
    <Cannon p={[2.0, 0, 0.9]} s={0.6} />
    <Cannon p={[-2.3, 0, -1.6]} s={0.6} />
    <Cannon p={[2.3, 0, -1.6]} s={0.6} />
    {[[-1.8, -4.0], [0.3, -4.6], [2.4, -4.1]].map(([x, z], i) => <Tent key={i} p={[x, 0, z]} />)}
    <Flag kind="us" p={[-0.4, 0, -3.2]} h={3.0} t={t} />
    {[[-4, -5.5, 0], [4.5, -5, 1], [-5.5, -2, 2], [5.6, -1.5, 3]].map(([x, z, s]) => <Pine key={s} p={[x, 0, z]} s={0.7} seed={s} t={t} />)}
    <Tufts x={[-5, 5]} z={[-7, 3]} n={220} keep={[[0, -0.4, 2]]} seed={6} />
  </>
);

// ------------------------------------------------------------------ shots
type Built = { mood: MoodId; cam: Cam; node: React.ReactNode };
const build = (id: string, t: number, sh: ShotRow): Built => {
  const tau = t - sh.start, dur = sh.end - sh.start;
  // ---- standoff corridor shots
  if (id === "s01" || id === "s02" || id === "s13" || id === "s13b" || id === "s03" || id === "s03b" || id === "s14") {
    const tense = id === "s13" || id === "s13b";
    const golden = id === "s14";
    const T0 = t + 0.4;
    const lay = id === "s02" ? { skip: 6, xs: 0.82 } : id === "s13" ? { skip: 2, xs: 0.62 } : id === "s13b" ? { skip: 2, xs: 0.66 } : { skip: 2, xs: 0.82 };
    const actors = corridorActors(T0, tense ? "flat" : "angry", tense ? "flat" : "angry", { point: id === "s01" || id === "s02", ...lay });
    let pig: React.ReactNode = null;
    let cam: Cam;
    if (id === "s01") {
      const z = 0.75 + 0.4 * T0;
      pig = <Pig t={T0} pose={{ p: [0.03 + Math.sin(T0 * 1.6) * 0.05, 0, z], yaw: 0.35 + Math.cos(T0 * 1.6) * 0.1, walk: 1, chew: 1, potato: true, face: "happy", look: 0.3 }} />;
      cam = lens([0, 0.55, z], [0.05, 0.32, 2.0], 58, 0.6, tau, 0.08, [0, 1.2]);
    } else if (id === "s02") {
      const lk = tau < 0.55 ? -1 : tau < 0.75 ? lerp(-1, 1, ease((tau - 0.55) / 0.2)) : 1;
      pig = <Pig t={t} pose={{ p: [0, 0, 0.9], yaw: 0.15, chew: 1, potato: true, face: "curious", look: lk, headYaw: -lk * 0.2, head: -0.12 }} />;
      cam = lens([0, 0.4, 0.98], [0.14, 0.12, 1.6], 50, 0.45, tau, 0.1, [0, -1.2]);
    } else if (id === "s14") {
      pig = <Pig t={t} pose={{ p: [0, 0.5 + tau * 0.35, 0.6], yaw: 0.3, walk: 0.3, face: "angel" }} shadow={false} />;
      cam = lens([0, 0.8 + tau * 0.35, 0.6], [0, 0.2, 2.4], 52, 0.45, tau, 0.08);
    } else if (id === "s03" || id === "s03b") {
      cam = lens([0, 0.6, -1.5], [id === "s03" ? -2 : 2, 4.5, 6], 55, 0.5, tau, 0.08);
    } else {
      cam = id === "s13" ? lens([0, 0.85, -1.2], [0, 0.75, 5.6], 38, 0.5, tau, 0.08, [0, -1]) : lens([0, 1.15, 0.7], [0, 0.18, 2.3], 50, 0.42, tau, 0.1);
    }
    const tw: V3 | undefined = id === "s13" ? [-0.6 + tau * 0.8, 0.09 + Math.abs(Math.sin(tau * 6)) * 0.12, 0.4] : undefined;
    return { mood: golden ? "golden" : tense ? "tense" : "sunny", cam, node: <><Corridor t={t} actors={actors} tumble={tw} />{pig}</> };
  }
  // ---- s07 / s08: the deal. The farmer offers one coin; the company man flings a hand up for 100; the farmer is shocked.
  if (id === "s07" || id === "s08") {
    const actors: A[] = [];
    let fpose = base(-0.42, 0.25, 0.95, 1);
    let opose = base(0.42, 0.25, -0.95, 1, { armL: 0.25, armR: 0.25, outL: 0.42, outR: 0.42 });
    let fe: Emotion = "happy", oe: Emotion = "curious";
    let held: Held | undefined;
    if (id === "s07") {
      const k = clamp(pop((tau - 0.1) / 0.7), -0.2, 1.1);
      fpose = talk({ ...fpose, armR: lerp(0.05, 1.25, k), outR: 0.08 }, t, "L", clamp((tau - 0.6) / 0.3));
      held = { side: "R", node: <Coin t={t} /> };
      fe = "sly";
    } else {
      const t100 = onset("100", sh.start, sh.start + 0.6) - sh.start;
      const k = clamp(pop((tau - t100 + 0.35) / 0.7), -0.2, 1.1);
      opose = { ...opose, armL: lerp(0.25, 2.75, k), outL: lerp(0.42, 0.12, k), pitch: -0.04 * k };
      oe = k > 0.5 ? "sly" : "curious";
      const kf = clamp(pop((tau - t100 - 0.05) / 0.6), -0.2, 1.1);
      fpose = { ...fpose, armL: lerp(0.05, 0.6, kf), armR: lerp(0.05, 0.6, kf), outL: lerp(0.05, 0.6, kf), outR: lerp(0.05, 0.6, kf), pitch: -0.06 * kf };
      fe = kf > 0.4 ? "shock" : "curious";
    }
    actors.push({ key: "farmer", look: FARMER, pose: fpose, emotion: fe, seed: 13, held });
    actors.push({ key: "off", look: OFFICIAL, pose: opose, emotion: oe, seed: 41 });
    actors.push({ key: "s1", look: extra(REDCOAT, 2), pose: base(2.5, -3.6, -0.5, 1), emotion: "flat", seed: 81 });
    actors.push({ key: "s2", look: extra(REDCOAT, 5), pose: base(3.2, -4.4, -0.5, 1), emotion: "flat", seed: 82 });
    const cam = id === "s07" ? lens([0, 1.0, 0.25], [0.05, 0.1, 3.9], 46, 0.47, tau, 0.1, [0, 1]) : lens([0.05, 1.05, 0.25], [-0.6, 0.1, 3.6], 46, 0.46, tau, 0.1, [0, -1.2]);
    return { mood: "sunny", cam, node: <Garden t={t}>{actors.map((a) => <Actor key={a.key} a={a} t={t} />)}</Garden> };
  }
  // ---- the garden / the deal / the arrest
  if (id === "s04" || id === "s05" || id === "s06" || id === "s09") {
    const tense = id === "s09";
    const actors: A[] = [];
    const fp = base(0, 0, id === "s05" ? 0.28 : 0.85, 1, { armR: id === "s05" ? 0.22 : 0.05, outR: id === "s05" ? 0.16 : 0.12 });
    actors.push({ key: "farmer", look: FARMER, pose: id === "s09" ? { ...fp, x: -0.45, armL: 0.5, armR: 0.5, outL: 0.4, outR: 0.4 } : fp, emotion: id === "s05" ? "flat" : id === "s09" ? "sad" : "angry", seed: 13, held: id === "s05" ? { side: "R", node: <Rifle />, tilt: [0.05, 0.12] } : undefined });
    let cam: Cam;
    if (id === "s09") {
      const ta = onset("arrest", sh.start, sh.start + 0.8) - sh.start;
      const k = clamp(pop((tau - ta + 0.3) / 0.6));
      actors.push({ key: "off", look: OFFICIAL, pose: pointArm(base(0.45, 0, -0.85, 1), "R", k, 0.05), emotion: "angry", seed: 41 });
      const rc = base(0.95, 0, lerp(-0.45, -1.1, ease(clamp((tau - 0.35) / 0.6))), 1.0, { armL: 0.02, armR: 0.02 });
      rc.z = 0.8;
      actors.push({ key: "rc", look: REDCOAT, pose: rc, emotion: "angry", seed: 71 });
      actors.push({ key: "rc2", look: extra(REDCOAT, 3), pose: base(1.35, -0.55, -1.0, 1), emotion: "angry", seed: 72 });
      const close = lens(facePoint(rc, 1), [-0.5, 0.05, 1.95], 46, 0.46, tau, 0.1);
      const wide = lens([0.2, 0.75, 0.1], [0, 0.6, 3.6], 50, 0.5, tau - 1, 0.08);
      cam = mixCam(close, wide, ease(clamp((tau - 0.45) / Math.max(0.5, ta - 0.55))));
    } else {
      actors.push({ key: "off", look: OFFICIAL, pose: base(2.4, -2.6, -0.6, 1), emotion: "sly", seed: 41 });
      cam = lens(facePoint(fp, 1), [-0.4, 0.05, 3.0], 46, 0.4, tau, 0.1, [0, 1]);
    }
    return { mood: tense ? "tense" : "sunny", cam, node: <Garden t={t}>{actors.map((a) => <Actor key={a.key} a={a} t={t} />)}</Garden> };
  }
  // ---- s10: the landing. Bluecoats march up from the rowboats; the front man plants the flag on "soldiers".
  if (id === "s10") {
    const ts = onset("soldiers", sh.start, sh.start + 1.2) - sh.start;
    const actors: A[] = [];
    [-1.5, -2.3, -3.0].forEach((z0, r) => [-0.42, 0.42].forEach((x0, c) => {
      const i = r * 2 + c;
      actors.push({ key: `w${i}`, look: extra(BLUECOAT, i + 1), pose: walk(x0 + (r % 2) * 0.08, z0, 0, tau + i * 0.13, i * 0.13, 0.7, 1), emotion: "flat", seed: 90 + i });
    }));
    const stopT = Math.max(0.3, ts - 0.15);
    const hp = tau < stopT ? walk(0.75, -1.1, 0, tau, 0, 0.7, 1) : base(0.75, -1.1 + 0.7 * stopT, 0, 1);
    const k = clamp(pop((tau - ts + 0.2) / 0.7), -0.2, 1.1);
    actors.push({ key: "hero", look: { ...BLUECOAT, moustache: "#2a1a12" }, pose: { ...hp, armR: lerp(1.0, 2.55, k), outR: 0.1 }, emotion: k > 0.3 ? "angry" : "flat", seed: 99, held: { side: "R", node: <Flag kind="us" p={[0, 0, 0]} h={1.5} t={t} yaw={-Math.PI / 2} s={0.8} /> } });
    const cam = lens([0.35, 0.95, -0.9 + 0.35 * tau], [1.35, -0.05, 3.1], 50, 0.5, tau, 0.08, [0, 1.2]);
    return {
      mood: "tense", cam, node: (
        <>
          <Island t={t} seaZ={-3.4} back={20} />
          <FarIslands z={-75} />
          {[[-1.4, -5.2, 0.3], [1.1, -6.4, -0.2], [-0.2, -8.6, 0.1]].map(([x, z, y], i) => <Rowboat key={i} p={[x, -0.5, z]} yaw={y} t={t} seed={i} />)}
          <Warship p={[7, -0.45, -24]} yaw={Math.PI - 0.3} s={1.0} t={t} seed={5} />
          {[[-3.2, -1.6, 0], [3.6, -1.2, 1], [-4.2, 1.4, 2], [4.6, 2.2, 3]].map(([x, z, q]) => <Pine key={q} p={[x, 0, z]} s={0.7} seed={q} t={t} />)}
          <Tufts x={[-4, 4]} z={[-3, 3]} n={180} keep={[[0, -1, 1.2]]} seed={10} />
          {actors.map((a) => <Actor key={a.key} a={a} t={t} />)}
        </>
      ),
    };
  }
  // ---- s12: five warships glide into the bay, seen past two worried bluecoats on the hill
  if (id === "s12") {
    const tw = onset("warships", sh.start, sh.start + 0.6) - sh.start;
    const turn = clamp((tau - tw) / 0.3);
    const actors: A[] = [
      { key: "f1", look: extra(BLUECOAT, 1), pose: base(-0.62, 1.2, Math.PI - 0.35, 1, { headYaw: 0.35 * turn }), emotion: "sad", seed: 140 },
      { key: "f2", look: extra(BLUECOAT, 4), pose: base(0.66, 1.45, Math.PI + 0.4, 1, { headYaw: -0.35 * turn }), emotion: "shock", seed: 141 },
      { key: "m1", look: extra(BLUECOAT, 2), pose: base(-2.0, -1.4, Math.PI - 0.2, 1), emotion: "sad", seed: 142 },
      { key: "m2", look: extra(BLUECOAT, 3), pose: base(2.1, -1.8, Math.PI + 0.2, 1), emotion: "sad", seed: 143 },
    ];
    const subj: V3 = [0, 1.0, -14];
    const pos: V3 = [0.15, 1.85, 3.6 - 0.35 * tau];
    const c = aim(pos, subj, 48, 0.42);
    return {
      mood: "tense", cam: { ...c, roll: lerp(0, -1, clamp(tau / 2)) }, node: (
        <>
          <Island t={t} seaZ={-4.2} back={20} />
          <FarIslands z={-80} />
          {[0, 1, 2, 3, 4].map((i) => <Warship key={i} p={[-4.2 + (i % 2) * 3.4 - i * 0.5 + 0.9 * tau, -0.45, -9.5 - i * 5.2]} yaw={0.15} s={1.0} t={t} seed={i} />)}
          <Cannon p={[1.5, 0, -0.4]} yaw={Math.PI} s={0.6} />
          {[[-3.4, -2.6, 0], [3.8, -3.0, 1]].map(([x, z, q]) => <Pine key={q} p={[x, 0, z]} s={0.7} seed={q} t={t} />)}
          <Tufts x={[-4, 4]} z={[-3.5, 3]} n={160} seed={12} />
          {actors.map((a) => <Actor key={a.key} a={a} t={t} />)}
        </>
      ),
    };
  }
  // ---- the landing / the camp / the warships
  const c0 = onset("461", sh.start, sh.start + 0.5) - sh.start;
  const actors = campActors(tau, c0);
  const hero = actors[1].pose;
  const close = lens(facePoint(hero, 1), [0.05, 0.03, 1.75], 46, 0.43, tau, 0.1);
  const wide = lens([0, 0.7, -0.6], [0, 1.6, 4.2], 50, 0.5, tau - 1.2, 0.08);
  const cam = id === "s11" ? mixCam(close, wide, ease(clamp((tau - Math.max(0.4, c0 - 0.1)) / 1.0))) : wide;
  void dur;
  return { mood: "tense", cam, node: <Camp t={t} actors={actors} /> };
};

// ------------------------------------------------------------------ overlays
const TopCaption: React.FC<{ t: number }> = ({ t }) => {
  if (t > TOP_UNTIL) return null;
  const op = clamp((TOP_UNTIL - t) / 0.2);
  const line = (s: string, size: number, y: number) => (
    <div style={{ position: "absolute", left: 108, right: 108, top: y, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.05, color: "#ffffff", WebkitTextStroke: "7px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.6)", opacity: op }}>{s}</div>
  );
  return (
    <>
      {line("San Juan Island, 1859:", 64, 280)}
      {line("a 12-year standoff", 84, 360)}
    </>
  );
};
/** story-fact card (diegetic text sits above the caption band) with a pop-in */
const Card: React.FC<{ t: number; t0: number; text: string; y?: number; color?: string; size?: number }> = ({ t, t0, text, y = 520, color = "#c8302a", size = 92 }) => {
  if (t < t0) return null;
  const u = (t - t0) / 0.2;
  const s = u >= 1 ? 1 : 0.5 + 0.5 * (1 + 3.4 * (u - 1) ** 3 + 2.4 * (u - 1) ** 2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - 70, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s}) rotate(-3deg)`, background: "#fff8ec", border: `10px solid ${color}`, borderRadius: 26, padding: "10px 40px", fontFamily: "Poppins", fontWeight: 800, fontSize: size, color, boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{text}</div>
    </div>
  );
};
const overlays = (id: string, t: number, sh: ShotRow): React.ReactNode => {
  if (id === "s07") return <Card t={t} t0={onset("10", sh.start, sh.start + 0.4)} text="$10" color="#2f8a3a" />;
  if (id === "s08") return <Card t={t} t0={onset("100", sh.start, sh.start + 0.6)} text="$100" />;
  if (id === "s10") return <Card t={t} t0={onset("soldiers", sh.start, sh.start + 1.2)} text="U.S. ARMY LANDS" color="#2c5cc0" size={76} />;
  if (id === "s12") {
    const tw = onset("warships", sh.start, sh.start + 0.6);
    return (
      <>
        <Card t={t} t0={sh.start + 0.05} text="× 5 WARSHIPS" size={84} />
        <Card t={t} t0={tw + 0.15} text="2,000+ men aboard" y={700} color="#2c3a5a" size={60} />
      </>
    );
  }
  if (id === "s09") return <Card t={t} t0={onset("arrest", sh.start, sh.start + 0.8)} text="ARREST HIM" />;
  if (id === "s13") return <Card t={t} t0={onset("shot", sh.start, sh.start + 0.6)} text="SHOTS FIRED: 0" color="#2c3a5a" />;
  if (id === "s11") {
    const c0 = onset("461", sh.start, sh.start + 0.5);
    if (t < c0) return null;
    const v = Math.round(461 * (1 - Math.pow(1 - clamp((t - c0) / 0.6), 3)));
    return (
      <>
        <Card t={t} t0={c0} text={`${v} TROOPS`} color="#2c5cc0" />
        <Card t={t} t0={c0 + 0.7} text="+ 14 cannons" y={700} color="#2c3a5a" size={60} />
      </>
    );
  }
  return null;
};

// ------------------------------------------------------------------ the composition
export const PigWar: React.FC<{ sub?: boolean }> = ({ sub = false }) => {
  useFonts();
  const g = useCurrentFrame();
  const { n, fp } = sub ? subFrame(g, 4, 0.35) : { n: g, fp: g };
  const t = fp / FPS;
  const tn = n / FPS; // captions and cards key to the output frame (stay sharp)
  const sh = shotAt(n);
  const b = build(sh.id, t, sh);
  const mood = moodOfShot(b.mood, sh.id, b.cam);
  return (
    <AbsoluteFill style={{ background: "#6aa6f2" }}>
      <View mood={mood} cam={b.cam} t={t} blur={0}>
        {b.node}
      </View>
      {overlays(sh.id, tn, sh)}
      <TopCaption t={tn} />
      {tn < TOP_UNTIL ? null : <PopCaptions chunks={CHUNKS} t={tn} until={DUR} />}
    </AbsoluteFill>
  );
};

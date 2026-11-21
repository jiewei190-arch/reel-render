// The recipe compiler: Recipe + voice words -> a compiled Short (shots with lenses, a scene function, overlays, the
// audio cue plan, the clip-QA boxes and the frame-0 gate data). RecipeFilm renders it (one View, or two for the S2
// split screen). Everything is a pure function of t, like the hand-written v1 Shorts (src/fin/v1/*.tsx).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Blocky } from "../../blocky/Blocky";
import type { Look } from "../../blocky/Blocky";
import { clamp, hash, lerp, ss } from "../../blocky/motion";
import type { Pose, V3 } from "../../blocky/motion";
import { subFrame, useFonts } from "../../engine/core/frame";
import { aim } from "../../engine/core/rig";
import { View } from "../../engine/core/View";
import * as CH from "../../library/characters";
import { alive, blinkAt } from "../../library/characters";
import { moodFor, setMoodShots } from "../../library/mood";
import { stand, yawTo } from "../core";
import type { FinShot } from "../core";
import { B, Card, Dust, Reader, TV, easeOut, slam } from "../hooks";
import { CoinPile, FlipCalendar, Label, PAL, Stamp, Bill } from "../props";
import { Asset, assetSize, useAssetWindow, usePreload } from "../lib/assets";
import { kickAt, kicked, pushK, whipK } from "../lib/camera";
import type { Cam } from "../lib/camera";
import { LowerThirdCaptions, RecipeCaptions, chunkWords } from "../lib/captions";
import { EASE_OUT, EASE_PLACE, LEAD, prog } from "../lib/motion";
import { anticip, blinkVar, gestureAt, lookAt as lookAtFn, mixPose, weightShift } from "../lib/alive";
import type { GestureId } from "../lib/alive";
import { nodAt, speakingAt, visemeAt } from "../lib/lipsync";
import { wobbleAt } from "../lib/spring";
import type { Viseme } from "../../blocky/Blocky";
import { canvasTexture, geoOf } from "../../blocky/mat";
import * as THREE from "three";
import { armPoint, Burst, burstHalf, burstPos, Coin3, DebtBlock, Debris, HookText, limbBoxes, PayBox, sqAt, Squash, TallJar } from "../v1/kit";
import type { Box, Cue, StoryAudio } from "../v1/kit";
import { hipFor, POSES, soleLow } from "./poses";
import { SETS } from "./sets";
import { eggBoxes, EggsView, gagU, placeEggs } from "./eggs";
import type { SetDef } from "./sets";
import { makeAt } from "./timing";
import type { ActorSpec, At, CamSpec, Emotion, FxSpec, Place, PropSpec, Recipe, SetId, ShotSpec, Target, Word } from "./types";

export const FPS = 30;
const D2R = Math.PI / 180;
const LOOKS: Record<string, Look> = { SPENDER: CH.SPENDER, SAVER: CH.SAVER, SELLER: CH.SELLER, DAD: CH.DAD, KID: CH.KID };
const FACE_Y = 1.247; // head centre at scale 1 (blocky/motion SPEC)
const HIP0 = (s: number) => stand(0, 0, 0, s).y; // standing hip height

// ------------------------------------------------------------------ resolved pieces
type ActorR = { id: string; look: Look; seed: number; spec: ActorSpec; p0: V3; p1: V3; yaw: (p: V3, t: number) => number; segs: { t0: number; pose: ActorSpec["pose"]; emotion?: Emotion }[]; s: number; squash: number[];
  /** quality pass */ q: boolean; talk: boolean; words: readonly Word[]; gestures: { t0: number; g: GestureId }[]; lookT: ((t: number) => V3) | null; camPos: V3 | null; extra?: boolean };
export type ActorState = { id: string; pose: Pose; emotion: Emotion; s: number; head: V3; torso: V3; grounded: boolean; look: Look; seed: number; squash: number; blink: boolean; mouth: Viseme; extra?: boolean };
type PropR = { key: string; spec: PropSpec; a: number; b: number; hit: number; pos: (t: number) => V3; held: boolean; set: SetId };
type FxR = { fx: string; at: number; p: (t: number) => V3; gain: number };
export type ShotR = { id: string; a: number; b: number; set: SetId; spec: ShotSpec; lens: FinShot; lens2?: FinShot; pov?: string; kicks: [number, number][]; actors: ActorR[]; props: PropR[]; fx: FxR[] };

export type Compiled = {
  recipe: Recipe;
  slug: string;
  duration: number; // frames
  shots: ShotR[];
  assets: string[];
  audio: StoryAudio;
  shotAt: (t: number) => ShotR;
  actorsAt: (t: number) => ActorState[];
  camAt: (t: number) => { main: Cam; second?: Cam; split: boolean };
  qa: (t: number) => { actors: Box[]; props: Box[]; feet: { name: string; low: number; grounded: boolean }[] };
  textsAt: (t: number) => string[];
  words: readonly Word[];
  at: (a: At | undefined, d?: number) => number;
  hookUntil: number;
  quality: boolean;
  /** frame size: 1080x1920 (portrait Short) or 1920x1080 (landscape long-form) */
  W: number;
  H: number;
  landscape: boolean;
  /** landscape: chapters resolved to seconds (t = the chapter word; card = when its title card plays) */
  chapters: { n: number; title: string; t: number; card: number }[];
  /** landscape: the CC0 assets each shot's window needs (that shot + the next), by shot index */
  windowAssets: string[][];
};

const isV3 = (x: unknown): x is V3 => Array.isArray(x) && x.length === 3;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const fmt = (n: number, decimals = 0) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** kit prop half sizes and centre height (local, at scale 1) for QA and framing */
const kitBox = (p: PropSpec): { c: number; h: V3 } => {
  const sz = p.size;
  switch (p.kit) {
    case "tv": return { c: 0.5, h: [0.76, 0.5, 0.17] };
    case "card": return { c: 0, h: [0.09, 0.06, 0.01] };
    case "reader": return { c: 0.06, h: [0.08, 0.07, 0.12] };
    case "debtBlock": case "block": { const s = sz ?? [1.8, 1.8, 1.0]; return { c: s[1] / 2, h: [s[0] / 2, s[1] / 2, s[2] / 2] }; }
    case "label": { const s = sz ?? [0.8, 0.3, 0.05]; return { c: 0, h: [s[0] / 2, s[1] / 2, 0.04] }; }
    case "jar": return { c: 0.8, h: [0.46, 0.8, 0.46] };
    case "coinPile": { const r = sz?.[0] ?? 0.9, h = sz?.[1] ?? 0.7; return { c: h / 2, h: [r, h / 2, r] }; }
    case "calendar": { const s = sz ?? [1.3, 1.1, 0.1]; return { c: 0, h: [s[0] / 2, s[1] / 2 + 0.1, 0.08] }; }
    case "stamp": { const w = sz?.[0] ?? 0.6; return { c: 0, h: [w / 2, w * 0.2, 0.03] }; }
    case "payBox": return { c: 0.75, h: [0.32, 0.75, 0.24] };
    case "coin": return { c: 0, h: [0.08, 0.08, 0.08] };
    case "bill": return { c: 0, h: [0.14, 0.07, 0.01] };
    case "counter": { const s = sz ?? [2.1, 0.96, 0.8]; return { c: s[1] / 2, h: [s[0] / 2, s[1] / 2, s[2] / 2] }; }
    default: return { c: 0.25, h: [0.25, 0.25, 0.25] };
  }
};
const propBox = (p: PropSpec): { c: number; h: V3 } => {
  const s = p.s ?? 1;
  if (p.asset) { const z = assetSize(p.asset, s); return { c: z[1] / 2, h: [z[0] / 2, z[1] / 2, z[2] / 2] }; }
  const k = kitBox(p);
  return { c: k.c * s, h: [k.h[0] * s, k.h[1] * s, k.h[2] * s] };
};
const textOf = (p: PropSpec, t: number, hit: number): string[] => {
  if (p.motion === "count-up" && p.count) {
    const c = p.count;
    const v = lerp(c.from, c.to, EASE_OUT(prog(t, hit, hit + (c.dur ?? 1.2))));
    const line = `${c.prefix ?? ""}${fmt(v, c.decimals ?? 0)}${c.suffix ?? ""}`;
    const rest = Array.isArray(p.text) ? p.text : p.text ? [p.text] : [];
    return rest.length ? [rest[0], line] : [line];
  }
  return Array.isArray(p.text) ? p.text : p.text ? [p.text] : [];
};

// ------------------------------------------------------------------ the compiler
export const compileRecipe = (recipe: Recipe, words: readonly Word[], voDuration?: number): Compiled => {
  const { at, lineEnd } = makeAt(words);
  const durS = recipe.duration ?? voDuration ?? Math.max(...words.map((w) => w.end)) + 0.6;
  const duration = Math.round(durS * FPS);
  const end = duration / FPS;
  const castIds = Object.keys(recipe.cast);
  const Q = recipe.quality !== false;
  const talkMode = recipe.talk ?? (recipe.style === "S3" || recipe.style === "S5" ? "auto" : "none");
  const seedOf = (id: string) => 2 + 2 * castIds.indexOf(id);
  const LS = recipe.format === "landscape";
  if (recipe.format !== undefined && recipe.format !== "portrait" && !LS) throw new Error(`recipe: format "${recipe.format}" (use "portrait" or "landscape")`);
  if (recipe.chapters && !LS) throw new Error("recipe: chapters need \"format\": \"landscape\"");
  // shot times
  const starts = recipe.shots.map((s) => at(s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1]) throw new Error(`recipe: shot ${i + 1} starts at ${a.toFixed(2)} s, not after shot ${i} (${starts[i - 1].toFixed(2)} s)`); });
  if (Math.abs(starts[0]) > 1e-6) throw new Error("recipe: the first shot must start at 0");
  let curSet: SetId = recipe.shots[0].set ?? "store";
  const shots: ShotR[] = [];

  // places: [x,z] | [x,y,z] | "anchor" | "anchor:dx,dy,dz" | "<actor>.handR|handL|face|head" (dynamic)
  const placeFn = (pl: Place | undefined, set: SetDef, actorsOf: () => ActorR[], dflt: V3 = [0, 0, 0]): { f: (t: number) => V3; held: boolean } => {
    if (pl === undefined) return { f: () => dflt, held: false };
    if (Array.isArray(pl)) { const v: V3 = pl.length === 2 ? [pl[0], 0, pl[1]] : (pl as V3); return { f: () => v, held: false }; }
    const [name, off] = pl.split(":");
    const o: V3 = off ? (off.split(",").map(Number) as V3) : [0, 0, 0];
    const dot = name.indexOf(".");
    if (dot > 0 && castIds.includes(name.slice(0, dot))) {
      const id = name.slice(0, dot), part = name.slice(dot + 1);
      return {
        held: part.startsWith("hand"),
        f: (t) => {
          const st = actorState(actorsOf().find((a) => a.id === id), t);
          if (!st) return add(dflt, o);
          if (part === "handR" || part === "handL") return add(armPoint(st.pose, part === "handR" ? "R" : "L", 1.08, st.s), o);
          if (part === "head") return add([st.head[0], st.head[1] + 0.2 * st.s, st.head[2]], o);
          return add(st.head, o);
        },
      };
    }
    const a = set.anchors[name];
    if (!a) throw new Error(`recipe: no anchor "${name}" in this set (has: ${Object.keys(set.anchors).join(", ")})`);
    return { f: () => add(a, o), held: false };
  };

  // global (multi-shot) props
  const globalProps = (recipe.props ?? []).map((p, i) => ({ p, a: at(p.from, 0), b: at(p.until, end + 1), i }));

  recipe.shots.forEach((sp, i) => {
    curSet = sp.set ?? curSet;
    const set = SETS[curSet];
    const a = starts[i], b = i + 1 < starts.length ? starts[i + 1] : end;
    const id = `S${String(i + 1).padStart(2, "0")}`;
    const actors: ActorR[] = [];
    const props: PropR[] = []; // filled below; actors may face a prop by id
    const getActors = () => actors;
    for (const as of sp.actors ?? []) {
      if (!recipe.cast[as.id]) throw new Error(`recipe ${id}: actor "${as.id}" is not in cast`);
      const p0 = placeFn(as.at, set, getActors).f(a);
      const p1 = as.to ? placeFn(as.to, set, getActors).f(a) : p0;
      const t0 = at(as.from, a);
      const segs = [{ t0: Math.max(a, t0 - LEAD), pose: as.pose, emotion: as.emotion }, ...(as.then ?? []).map((x) => ({ t0: at(x.at) - LEAD, pose: x.pose, emotion: x.emotion }))];
      const faceT = as.face;
      const yaw = (p: V3, t: number) => {
        if (as.pose === "walk" || as.pose === "run") if (as.to) return yawTo(p0, p1);
        if (faceT === undefined) return yawTo(p, [p[0] * 0.3, 0, 5]); // toward the lens side
        if (typeof faceT === "number") return faceT * D2R;
        const q = targetFn(faceT, set, actors, props, id)(t);
        return yawTo(p, [q[0], 0, q[2]]);
      };
      const camT = typeof sp.cam.target === "string" ? sp.cam.target.split(".")[0] : "";
      const talk = Q && (sp.talk !== undefined ? sp.talk === as.id : talkMode === "auto" && camT === as.id);
      actors.push({ id: as.id, look: LOOKS[recipe.cast[as.id]] ?? CH.SPENDER, seed: seedOf(as.id), spec: as, p0, p1, yaw, segs, s: as.scale ?? 1, squash: (as.squash ?? []).map((x) => at(x)),
        q: Q, talk, words, gestures: (as.gestures ?? []).map((g) => ({ t0: at(g.at) - LEAD, g: g.g })), lookT: null, camPos: null });
    }
    const addProp = (ps: PropSpec, pa: number, pb: number, k: string) => {
      const pf = placeFn(ps.at, set, getActors);
      props.push({ key: k, spec: ps, a: pa, b: pb, hit: at(ps.hit, a + 0.12), pos: pf.f, held: pf.held, set: curSet });
    };
    (sp.props ?? []).forEach((ps, k) => addProp(ps, a, b, ps.id ?? ps.asset ?? ps.kit ?? `p${k}`));
    globalProps.filter((g) => g.a < b && g.b > a).forEach((g) => addProp({ ...g.p, from: undefined } as PropSpec, g.a, g.b, g.p.id ?? g.p.asset ?? g.p.kit ?? `g${g.i}`));
    const fx: FxR[] = (sp.fx ?? []).map((f: FxSpec) => {
      const o = typeof f === "string" ? { fx: f } : f;
      const tf = at(o.at, at(sp.cam.hit, a + 0.12));
      const pf = o.p !== undefined ? placeFn(o.p, set, getActors).f : (t: number) => { const q = targetFn(sp.cam.target ?? "centre", set, actors, props, id)(t); return [q[0], 0.05, q[2]] as V3; };
      return { fx: o.fx, at: tf, p: pf, gain: o.gain ?? 1 };
    });
    // kicks: slam hits, shake fx, drop/burst impacts
    const hit = at(sp.cam.hit, a + 0.12);
    const kicks: [number, number][] = [];
    if (sp.cam.preset === "slamZoom") kicks.push([hit, 1.2]);
    if (sp.cam.preset === "hookZoom") kicks.push([a + 0.38, 0.7]);
    fx.filter((f) => f.fx === "shake").forEach((f) => kicks.push([f.at, 1.4 * f.gain]));
    props.filter((p) => p.spec.motion === "dropSlam" || p.spec.motion === "burst").forEach((p) => kicks.push([p.hit, 0.8]));
    const prev = shots[shots.length - 1];
    let { lens, lens2, pov } = lensOf(sp.cam.az === undefined && sp.in === "match" && prev ? { ...sp.cam, az: prev.spec.cam.az ?? 0 } : sp.cam, set, actors, props, a, b, hit, id, sp.mood ?? set.mood, LS);
    if (Q) {
      // deeper depth of field on close shots
      if (sp.cam.blur === undefined && (sp.cam.preset === "closeUp" || sp.cam.preset === "slamZoom" || sp.cam.preset === "pushIn")) lens = { ...lens, blur: (lens.blur ?? 1.2) * 1.5 };
      // transitions: punch-in (default), whip, match, cut
      const tin = i === 0 ? "cut" : sp.in ?? (sp.cam.preset === "whip" || sp.cam.preset === "slamZoom" || sp.cam.preset === "splitScreen" || sp.cam.preset === "povFirstPerson" ? "cut" : "punch");
      if (tin === "punch") {
        const f0 = lens.fovAt ?? (() => lens.fov);
        lens = { ...lens, fovAt: (t: number) => f0(t) + 7 * (1 - easeOut((t - a) / 0.14)) };
        kicks.push([a, 0.5]);
      }
      if (tin === "whip") {
        const p0 = lens.posAt ? lens.posAt(a) : lens.pos!, s0 = lens.subj;
        lens = { ...lens, posAt: lens.posAt ?? (() => p0), subj: (t: number) => { const q = s0(t); const pp = lens.posAt ? lens.posAt(t) : p0; return add(pp, rotY([q[0] - pp[0], q[1] - pp[1], q[2] - pp[2]], 32 * D2R * whipK(t, a))); }, shutter: 0.2 };
      }
      // eyes and head: the camera while talking ("you"), else the shot's target (the money, the other character)
      const camPos = lens.pos ?? (lens.posAt ? lens.posAt(a) : null);
      for (const ac of actors) {
        ac.camPos = camPos;
        const la = ac.spec.lookAt;
        if (la === "none") continue;
        if (la === "camera" || (la === undefined && ac.talk)) { ac.lookT = () => camPos ?? [0, 1.2, 5]; continue; }
        const tg = la ?? sp.cam.target;
        if (tg === undefined || (typeof tg === "string" && tg.split(".")[0] === ac.id)) continue;
        try { ac.lookT = targetFn(tg, set, actors, props, id); } catch { ac.lookT = null; }
      }
    }
    shots.push({ id, a, b, set: curSet, spec: sp, lens, lens2, pov, kicks, actors, props, fx });
  });

  // ---------------------------------------------------------------- per-time helpers
  // binary search (long-form has hundreds of shots): the last shot with t >= its start (shots[0] before that)
  const shotAt = (t: number) => { let lo = 0, hi = shots.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (t >= shots[mid].a - 1e-9) lo = mid; else hi = mid - 1; } return shots[lo]; };
  const actorsAt = (t: number) => shotAt(t).actors.map((a) => actorState(a, t)!).filter(Boolean);
  const camOf = (L: FinShot, t: number): Cam => {
    const tau = Math.max(0, t - L.a);
    const subj = L.subj(t);
    const k = 1 - (L.push ?? 0.06) * tau;
    const pos: V3 = L.posAt ? L.posAt(t) : L.pos ? [subj[0] + (L.pos[0] - subj[0]) * k, subj[1] + (L.pos[1] - subj[1]) * k, subj[2] + (L.pos[2] - subj[2]) * k] : add(subj, L.off);
    const c = aim(pos, subj, L.fovAt ? L.fovAt(t) : L.fov, L.face);
    const r = L.roll ?? [0, 0];
    return { ...c, roll: lerp(r[0], r[1], Math.min(1, tau / Math.max(0.01, L.b - L.a))) };
  };
  const camAt = (t: number) => {
    const s = shotAt(t);
    const kk = kickAt(t, s.kicks);
    const main = kicked(camOf(s.lens, t), kk);
    return { main, second: s.lens2 ? kicked(camOf(s.lens2, t), kk) : undefined, split: !!s.lens2 };
  };
  const qa = (t: number) => {
    const s = shotAt(t);
    const st = [...s.actors.map((a) => actorState(a, t)!).filter((x) => x && x.id !== s.pov), ...(Q && recipe.extras !== false && s.spec.extras !== false ? extrasAt(s.set, t) : [])];
    const actors: Box[] = [];
    const feet: { name: string; low: number; grounded: boolean }[] = [];
    for (const a of st) {
      actors.push({ name: `${a.id}.head`, c: a.head, h: [0.16 * a.s, 0.17 * a.s, 0.16 * a.s] });
      actors.push({ name: `${a.id}.torso`, c: a.torso, h: [0.29 * a.s, 0.29 * a.s, 0.29 * a.s] });
      actors.push(...limbBoxes(a.id, a.pose, a.s));
      feet.push({ name: a.id, low: soleLow(a.pose, a.s), grounded: a.grounded });
    }
    const props: Box[] = [...SETS[s.set].blockers, ...(Q ? eggBoxes(placeEggs(s.set, recipe.eggs), t, recipe.finalGag, gagU(recipe.finalGag, end, t)) : [])];
    for (const p of s.props) {
      if (t < p.a || t >= p.b || p.held) continue;
      props.push(...propBoxes(p, t, s));
    }
    return { actors, props, feet };
  };
  const textsAt = (t: number) => {
    const s = shotAt(t);
    const out: string[] = [];
    if (t <= hookUntil) out.push(recipe.hook.text);
    for (const p of s.props) if (t >= p.a && t < p.b) { const m = motionAt(p, t, s); if (m.show) out.push(...textOf(p.spec, t, p.hit)); }
    return out;
  };
  const hookUntil = recipe.hook.until !== undefined ? at(recipe.hook.until) : lineEnd(1) + 0.25;
  // long-form chapters: the title card plays on the chapter word (the first one after the hook text has gone)
  const chapters = (recipe.chapters ?? []).map((ch, i) => { const t = at(ch.word); return { n: i + 1, title: ch.title, t, card: Math.max(t, t < hookUntil ? hookUntil + 0.1 : t) }; });
  chapters.forEach((ch, i) => { if (i && ch.t <= chapters[i - 1].t) throw new Error(`recipe: chapter ${i + 1} "${ch.title}" starts at ${ch.t.toFixed(2)} s, not after chapter ${i}`); });

  // ---------------------------------------------------------------- audio plan (story_mix.py format)
  // FORMAT_V1 day-1 fix 3: a sound punch at 0.00 s (impact by default; recipe.sfx0 picks another, e.g. "drop")
  const cues: Cue[] = [{ t: 0, sfx: recipe.sfx0 ?? "impact", db: -1 }];
  for (const s of shots) {
    if (s.spec.cam.preset === "slamZoom") cues.push({ t: at(s.spec.cam.hit, s.a + 0.12) - 0.02, sfx: "impact", db: -1 });
    if (s.spec.cam.preset === "whip") cues.push({ t: s.a, sfx: "whoosh", db: -4 });
    for (const p of s.props) {
      if (p.a !== s.a) continue; // a global prop's cues once
      const m = p.spec.motion;
      if (m === "dropSlam") cues.push({ t: p.hit - 0.02, sfx: "impact", db: 0 }, { t: p.hit, sfx: "thud", db: -2 });
      if (m === "burst") cues.push({ t: p.hit - 0.02, sfx: "boom", db: -2 }, { t: p.hit + 0.05, sfx: "crash", db: -6 });
      if (m === "fly-in") cues.push({ t: p.hit - 0.3, sfx: "whoosh", db: -6 }, { t: p.hit, sfx: "thud", db: -6 });
      if (m === "stick-to-face") cues.push({ t: p.hit, sfx: "punch", db: -3 });
      if (m === "rain") cues.push({ t: s.a + 0.05, sfx: "paper", db: -6 });
      if (m === "count-up") cues.push({ t: p.hit, sfx: "coins", db: -6 }, { t: p.hit + (p.spec.count?.dur ?? 1.2), sfx: "ding", db: -8 });
      if (p.spec.kit === "stamp") cues.push({ t: p.hit, sfx: "stamp", db: -2 });
    }
    for (const f of s.fx) if (f.fx === "debris") cues.push({ t: f.at, sfx: "crash", db: -8 });
    for (const x of s.spec.sfx ?? []) cues.push({ t: at(x.at), sfx: x.sfx, db: x.db });
  }
  for (const ch of chapters) cues.push({ t: ch.card - 0.25, sfx: "whoosh", db: -6 }, { t: ch.card + 0.05, sfx: "impact", db: -6 });
  if (Q && recipe.finalGag) cues.push({ t: recipe.finalGag.from ?? end - 0.8, sfx: recipe.finalGag.gag === "tvFall" ? "crash" : recipe.finalGag.gag === "catCoin" ? "coins" : "paper", db: -6 });
  cues.push({ t: end - 0.35, sfx: "whoosh", db: -2 });
  const audio: StoryAudio = { music: recipe.music ?? "upbeat", cues: cues.filter((c) => c.t >= 0 && c.t < end).sort((x, y) => x.t - y.t) };

  const assets = new Set<string>();
  for (const s of shots) { SETS[s.set].assets.forEach((x) => assets.add(x)); s.props.forEach((p) => p.spec.asset && assets.add(p.spec.asset)); }
  const shotAssets = shots.map((s) => [...SETS[s.set].assets, ...s.props.filter((p) => p.spec.asset).map((p) => p.spec.asset!)]);
  const windowAssets = shots.map((_, i) => [...new Set([...shotAssets[i], ...(shotAssets[i + 1] ?? [])])].sort());
  const out: Compiled = { recipe, slug: recipe.slug, duration, shots, assets: [...assets], audio, shotAt, actorsAt, camAt, qa, textsAt, words, at, hookUntil, quality: Q,
    W: LS ? 1920 : 1080, H: LS ? 1080 : 1920, landscape: LS, chapters, windowAssets };
  return out;
};

// ------------------------------------------------------------------ actors
export const actorState = (a: ActorR | undefined, t: number): ActorState | null => {
  if (!a) return null;
  let si = 0;
  a.segs.forEach((s, k) => { if (t >= s.t0) si = k; });
  const raw = (k: number, tt: number) => {
    const seg = a.segs[k];
    const walking = seg.pose === "walk" || seg.pose === "run";
    const shotA = a.segs[0].t0;
    const u = walking ? clamp((tt - shotA) / Math.max(0.2, (Math.hypot(a.p1[0] - a.p0[0], a.p1[2] - a.p0[2]) || 1) / (seg.pose === "run" ? 3.2 : 1.3))) : 0;
    const p = walking ? lerpV(a.p0, a.p1, u) : a.p0;
    const yaw = a.yaw(p, tt);
    const b = { ...stand(p[0], p[2], yaw, a.s), armL: 0.3, armR: 0.3 };
    return { out: POSES[seg.pose](b, { t: tt, t0: seg.t0 + LEAD, u, s: a.s, seed: a.seed }), walking, yaw };
  };
  const seg = a.segs[si];
  const r = raw(si, t);
  const out = r.out;
  let pose = out.pose;
  let blink = blinkAt(t, a.seed), mouth: Viseme = "rest";
  if (a.q) {
    // blended acting: from the previous pose into the new one with anticipation + overshoot (no snaps)
    if (si > 0 && t - seg.t0 < 0.38) pose = mixPose(raw(si - 1, t).out.pose, pose, anticip((t - seg.t0) / 0.38));
    pose = gestureAt(pose, a.gestures, t);
    if (!r.walking && out.grounded) {
      const w = weightShift(t, a.seed);
      pose = { ...pose, x: pose.x + w.dx * Math.cos(r.yaw), z: pose.z - w.dx * Math.sin(r.yaw), sway: (pose.sway ?? 0) + w.sway, twist: (pose.twist ?? 0) + w.twist };
    }
    if (a.lookT) {
      const hd: V3 = [pose.x, FACE_Y * a.s, pose.z];
      const l = lookAtFn(pose, hd, a.lookT(t), 0.75);
      pose = { ...pose, headYaw: pose.headYaw * 0.4 + l.headYaw, headPitch: pose.headPitch + l.headPitch };
    }
    if (a.talk) {
      pose = { ...pose, headPitch: pose.headPitch + nodAt(a.words, t), bob: (pose.bob ?? 0) - (speakingAt(a.words, t) ? 0.008 * Math.abs(Math.sin(t * 11)) : 0) };
      mouth = visemeAt(a.words, t);
    }
    // secondary motion: antennae and upper body ring out after squash hits and pose changes (damped spring)
    const jolts = [...a.squash, ...a.segs.slice(1).map((s) => s.t0 + LEAD)];
    pose = { ...pose, antWob: (pose.antWob ?? 0) + wobbleAt(t, jolts, 0.5, 0.28, 0.3), sway: (pose.sway ?? 0) + wobbleAt(t, jolts, 0.05, 0.3, 0.4) };
    // an expression change hides behind a blink (the decal swaps under closed lids)
    blink = blinkVar(t, a.seed, a.segs.slice(1).map((s) => s.t0 + LEAD - 1 / 30));
  }
  // re-ground every standing pose: a torso pitch swings the legs too (they hang from the pitched root), so the hip
  // height always comes from the actual leg angles; the lowest sole corner then sits on the floor (no sinking)
  if (out.grounded) pose = { ...pose, y: hipFor(pose.legL, pose.legR, a.s, pose.pitch) };
  // head/torso centres: offsets above the hip, tilted by the torso pitch, plus the bob
  const yaw = pose.yaw;
  const hip = pose.y, dh = FACE_Y * a.s - HIP0(a.s), dt = 0.81 * a.s - HIP0(a.s);
  const fw: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  const at = (d: number): V3 => [pose.x + fw[0] * d * Math.sin(pose.pitch), hip + d * Math.cos(pose.pitch) + (pose.bob ?? 0), pose.z + fw[2] * d * Math.sin(pose.pitch)];
  return { id: a.id, pose, emotion: seg.emotion ?? out.emotion, s: a.s, head: at(dh), torso: at(dt), grounded: out.grounded, look: a.look, seed: a.seed, squash: sqAt(t, a.squash), blink, mouth, extra: a.extra };
};

// ------------------------------------------------------------------ quality pass: background passers-by
/** ping-pong walkers along the set's extras path (each at its own speed and phase), from the Blocky crowd looks */
export const extrasAt = (setId: SetId, t: number): ActorState[] => {
  const path = SETS[setId].extrasPath;
  if (!path) return [];
  const [a0, a1] = path.line;
  const L = Math.hypot(a1[0] - a0[0], a1[2] - a0[2]);
  return Array.from({ length: path.n }, (_, k) => {
    const v = 0.75 + 0.35 * hash(k + 3), ph = hash(k + 11) * 2 * L;
    const d = (t * v + ph) % (2 * L);
    const fwd = d < L;
    const u = (fwd ? d : 2 * L - d) / L;
    const p = add(lerpV(a0, a1, u), [0, 0, 0.7 * k]); // each walker on its own lane (toward the lens): they never meet
    const yaw = Math.atan2((a1[0] - a0[0]) * (fwd ? 1 : -1), (a1[2] - a0[2]) * (fwd ? 1 : -1));
    const s = 0.95 + 0.1 * hash(k + 7);
    const o = POSES.walk({ ...stand(p[0], p[2], yaw, s), armL: 0.3, armR: 0.3 }, { t: t + k, t0: 0, u, s, seed: 40 + k });
    const pose = o.pose;
    const dh = FACE_Y * s - HIP0(s), dt = 0.81 * s - HIP0(s);
    return { id: `extra${k}`, pose, emotion: (k % 2 ? "happy" : "curious") as Emotion, s, head: [pose.x, pose.y + dh, pose.z] as V3, torso: [pose.x, pose.y + dt, pose.z] as V3, grounded: true, look: CH.CROWD[(k * 3 + 1) % CH.CROWD.length], seed: 40 + k, squash: 0, blink: blinkVar(t, 40 + k), mouth: "rest" as Viseme, extra: true };
  });
};

// ------------------------------------------------------------------ targets and lenses
const targetFn = (tg: Target, set: SetDef, actors: ActorR[], props: PropR[], shotId: string): ((t: number) => V3) => {
  if (isV3(tg)) return () => tg;
  const [name, part] = tg.split(".");
  const ac = actors.find((a) => a.id === name);
  if (ac) {
    return (t) => {
      const st = actorState(ac, t)!;
      if (part === "face") return [st.head[0], st.head[1] - 0.05 * st.s, st.head[2]];
      if (part === "hands") { const l = armPoint(st.pose, "L", 1, st.s), r = armPoint(st.pose, "R", 1, st.s); return lerpV(l, r, 0.5); }
      if (part === "feet") return [st.pose.x, 0.15, st.pose.z];
      return [st.torso[0], st.torso[1] + 0.15 * st.s, st.torso[2]];
    };
  }
  const pr = props.find((p) => p.key === name);
  if (pr) return (t) => { const m = motionAt(pr, t, null); const bx = propBox(pr.spec); return [m.p[0], m.p[1] + bx.c, m.p[2]]; };
  const [an, off] = tg.split(":");
  const a = set.anchors[an];
  if (a) { const o = off ? (off.split(",").map(Number) as V3) : [0, 0, 0]; return () => add(a, o as V3); }
  throw new Error(`recipe ${shotId}: no camera target "${tg}" (actors: ${actors.map((x) => x.id).join(", ") || "none"}; props: ${props.map((p) => p.key).join(", ") || "none"}; anchors: ${Object.keys(set.anchors).join(", ")})`);
};
/** the camera presets: every one keeps moving (push, orbit or slam creep), per FORMAT v1 */
export const CAM_PRESETS = {
  /** frame-0 hook: a fast push straight into the action over the first 0.4 s (from 1.3x the distance, so frame 0 is still a close-up), then a creep */
  hookZoom: { dist: 1.7, h: 0.12, fov: 46, face: 0.48, push: 0.05, blur: 1.6, roll: [-2, 0.5] as [number, number] },
  closeUp: { dist: 1.3, h: 0.08, fov: 42, face: 0.45, push: 0.07, blur: 1.8, roll: [0, 1.5] as [number, number] },
  medium: { dist: 2.6, h: 0.3, fov: 48, face: 0.5, push: 0.06, blur: 1.2, roll: [0, 1.2] as [number, number] },
  wide: { dist: 5.4, h: 1.0, fov: 54, face: 0.5, push: 0.04, blur: 0.6, roll: [0, 0.8] as [number, number] },
  slamZoom: { dist: 2.2, h: 0.2, fov: 46, face: 0.48, push: 0.06, blur: 1.4, roll: [0, 1.5] as [number, number] },
  pushIn: { dist: 2.4, h: 0.25, fov: 46, face: 0.48, push: 0, blur: 1.3, roll: [0, 1] as [number, number] },
  whip: { dist: 2.4, h: 0.25, fov: 50, face: 0.5, push: 0.05, blur: 1.2, roll: [4, 0] as [number, number] },
  orbit: { dist: 2.8, h: 0.4, fov: 46, face: 0.5, push: 0.02, blur: 1.2, roll: [0, 0] as [number, number] },
  splitScreen: { dist: 2.3, h: 0.25, fov: 34, face: 0.5, push: 0.05, blur: 1.0, roll: [0, 0] as [number, number] },
  povFirstPerson: { dist: 0, h: 0, fov: 64, face: 0.5, push: 0, blur: 0.8, roll: [0, 0] as [number, number] },
};
/** LONG-FORM (16:9) lens adjustments per preset: [fov x, dist x]. The vertical fov is what three.js keeps, so a 16:9
 *  frame at the portrait fov shows the same height and 3.2x the width: close shots stay as framed (a face reads on a TV),
 *  wider presets narrow their fov a little so the set's walls and floor edges stay out of frame. */
export const LANDSCAPE_LENS: Record<string, [number, number]> = { hookZoom: [1, 1], closeUp: [1, 1], slamZoom: [0.95, 1], pushIn: [0.95, 1], medium: [0.9, 1], whip: [0.9, 1], orbit: [0.9, 1], wide: [0.8, 0.95], splitScreen: [1.15, 1], povFirstPerson: [0.85, 1] };
const lensOf = (c0: CamSpec, set: SetDef, actors: ActorR[], props: PropR[], a: number, b: number, hit: number, shotId: string, moodKey: string, LS = false): { lens: FinShot; lens2?: FinShot; pov?: string } => {
  const P0 = CAM_PRESETS[c0.preset];
  const lk = LS && P0 ? LANDSCAPE_LENS[c0.preset] ?? [1, 1] : null;
  const P = lk ? { ...P0, fov: P0.fov * lk[0], dist: P0.dist * lk[1] } : P0;
  const c: CamSpec = lk && c0.fov !== undefined ? { ...c0, fov: c0.fov * lk[0] } : c0;
  if (!P) throw new Error(`recipe ${shotId}: no camera preset "${c.preset}"`);
  const mood = (moodKey === "earth" || moodKey === "home" || moodKey === "whisper" || moodKey === "ending" ? moodKey : "store") as FinShot["mood"];
  const base = (tg: Target): FinShot => {
    const subj = targetFn(tg, set, actors, props, shotId);
    const ac = actors.find((x) => typeof tg === "string" && tg.split(".")[0] === x.id);
    const s0 = subj(a);
    const az = (c.az ?? (ac ? (ac.yaw(ac.p0, a) / D2R) * 0.45 : 0)) * D2R;
    const dist = c.dist ?? P.dist, h = c.h ?? P.h;
    const pos: V3 = add(s0, [Math.sin(az) * dist, h, Math.cos(az) * dist]);
    return { id: shotId, a, b, subj, off: [0, 0, 3], pos, fov: c.fov ?? P.fov, face: c.face ?? P.face, push: P.push, roll: c.roll ?? P.roll, mood, blur: c.blur ?? P.blur, shutter: 0.35, sky: set.sky };
  };
  const tg = c.target ?? "centre";
  if (c.preset === "splitScreen") {
    const [t1, t2] = c.targets ?? [tg, tg];
    const l2 = base(t2);
    if (typeof c.face2 === "number") l2.face = c.face2; // caption-safe framing for the bottom view (baked by recipe_build)
    return { lens: base(t1), lens2: l2 };
  }
  const L = base(tg);
  switch (c.preset) {
    case "slamZoom": {
      // crash-zoom anticipation (video-shotcraft, Apache-2.0, idea): pull back ~3 % over the 6 frames before the hit
      const sl = slam(hit, 60, c.fov ?? P.fov, 0.12);
      return { lens: { ...L, fovAt: (t: number) => sl(t) + (t < hit && t > hit - 0.2 ? 1.8 * Math.sin(Math.PI * (t - hit + 0.2) / 0.2) : 0) } };
    }
    case "hookZoom": {
      const s0 = L.subj(a), p0 = L.pos!;
      const far = add(s0, [(p0[0] - s0[0]) * 1.3, (p0[1] - s0[1]) * 1.15, (p0[2] - s0[2]) * 1.3]); // frame 0 is already close (gate: >= 50 %), then punches in
      return { lens: { ...L, posAt: (t) => { const u = easeOut((t - a) / 0.4); const q = lerpV(far, p0, u); const k = 1 - (P.push) * Math.max(0, t - a - 0.4); const sj = L.subj(t); return [sj[0] + (q[0] - sj[0]) * k, sj[1] + (q[1] - sj[1]) * k, sj[2] + (q[2] - sj[2]) * k]; } } };
    }
    case "pushIn": { const s0 = L.subj(a), p0 = L.pos!; return { lens: { ...L, posAt: (t) => lerpV(s0, p0, pushK(t, a, 0.003, 0.006, 35)) } }; }
    case "whip": {
      const p0 = L.pos!, s0 = L.subj;
      return { lens: { ...L, pos: undefined, posAt: () => p0, subj: (t) => { const q = s0(t); return add(p0, rotY([q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]], 35 * D2R * whipK(t, a))); }, shutter: 0.2 } };
    }
    case "orbit": {
      const s0 = L.subj(a), v = [L.pos![0] - s0[0], L.pos![1] - s0[1], L.pos![2] - s0[2]] as V3;
      return { lens: { ...L, posAt: (t) => add(L.subj(t), rotY(v, lerp(-22, 22, clamp((t - a) / Math.max(0.3, b - a))) * D2R)) } };
    }
    case "povFirstPerson": {
      // the viewer ("you"): targets[0] if given, else the shot's first actor; the look target: targets[1] or target
      const who = (c.targets ? actors.find((x) => x.id === c.targets![0]) : undefined) ?? actors[0];
      if (!who) throw new Error(`recipe ${shotId}: povFirstPerson needs an actor (the viewer) in the shot`);
      const look = c.targets ? targetFn(c.targets[1], set, actors, props, shotId) : targetFn(tg, set, actors, props, shotId);
      return {
        pov: who.id,
        lens: { ...L, subj: look, posAt: (t) => { const st = actorState(who, t)!; const y = st.pose.yaw; return [st.head[0] + Math.sin(y) * 0.12, st.head[1] + 0.04 + 0.01 * Math.sin(t * 5.5), st.head[2] + Math.cos(y) * 0.12]; }, push: 0 },
      };
    }
    default: return { lens: L };
  }
};

// ------------------------------------------------------------------ prop motions (render + QA share this)
type MState = { p: V3; r: V3; sc: V3; show: boolean; burstU: number };
const motionAt = (pr: PropR, t: number, s: ShotR | null): MState => {
  const ps = pr.spec, h = pr.hit;
  const rest = pr.pos(t);
  const yaw = (ps.yaw ?? 0) * D2R;
  const one: V3 = [1, 1, 1];
  switch (ps.motion) {
    case "dropSlam": {
      const H = ps.drop ?? 2.4, fall = 0.35 * Math.sqrt(H / 2.4);
      if (t < h) { const u = clamp((t - (h - fall)) / fall); return { p: [rest[0], rest[1] + H * (1 - u * u), rest[2]], r: [0, yaw + 0.5 * (1 - u), 0.25 * (1 - u)], sc: one, show: true, burstU: -1 }; }
      const e = t - h;
      return { p: [rest[0], rest[1] + 0.08 * Math.abs(Math.sin(e * 18)) * Math.exp(-e * 7), rest[2]], r: [0, yaw, 0], sc: [1 + 0.06 * Math.exp(-e * 12), 1 - 0.12 * Math.exp(-e * 12), 1 + 0.06 * Math.exp(-e * 12)], show: true, burstU: -1 };
    }
    case "fly-in": {
      const from = ps.from ? (Array.isArray(ps.from) ? (ps.from.length === 2 ? [ps.from[0], rest[1], ps.from[1]] : ps.from) as V3 : add(rest, [-3, 1.2, 1.5])) : add(rest, [-3, 1.2, 1.5]);
      const u = clamp((t - (h - 0.4)) / 0.4);
      const q = lerpV(from, rest, EASE_PLACE(u));
      return { p: [q[0], q[1] + 0.6 * Math.sin(Math.PI * u), q[2]], r: [0, yaw + (1 - u) * 4, 0.3 * Math.exp(-(t - h) * 6) * Math.sin((t - h) * 30) * (t > h ? 1 : 0)], sc: one, show: u > 0, burstU: -1 };
    }
    case "stick-to-face": {
      const ac = s?.actors.find((a) => a.id === ps.on) ?? null;
      const st = actorState(ac ?? undefined, t);
      if (!st) return { p: rest, r: [0, yaw, 0], sc: one, show: true, burstU: -1 };
      const hd = propBox(ps).h[2];
      const fw: V3 = [Math.sin(st.pose.yaw), 0, Math.cos(st.pose.yaw)];
      const d = 0.17 * st.s + hd + 0.03; // outside the head box (half depth 0.16 s) + 1-3 cm air
      const stuck: V3 = [st.head[0] + fw[0] * d, st.head[1], st.head[2] + fw[2] * d];
      const from = add(stuck, [0.9, 1.0, 1.6]);
      const u = clamp((t - (h - 0.3)) / 0.3);
      const q = lerpV(from, stuck, easeOut(u));
      const wob = t > h ? 0.35 * Math.exp(-(t - h) * 5) * Math.sin((t - h) * 26) : 0;
      return { p: [q[0], q[1] - propBox(ps).c, q[2]], r: [0, st.pose.yaw, wob + (1 - u) * 3], sc: one, show: u > 0, burstU: -1 };
    }
    case "burst": {
      if (t < h) { const k = ss(h - 0.25, h, t); return { p: rest, r: [0, yaw, 0], sc: [1 + 0.1 * k, 1 - 0.12 * k, 1 + 0.1 * k], show: true, burstU: -1 }; }
      return { p: rest, r: [0, yaw, 0], sc: one, show: false, burstU: (t - h) / 0.9 };
    }
    default:
      return { p: rest, r: [0, yaw, 0], sc: one, show: true, burstU: -1 };
  }
};
const rainPos = (pr: PropR, t: number, k: number): V3 => {
  const rest = pr.pos(t), n = pr.spec.n ?? 10, ar = pr.spec.area ?? [2.4, 0.6];
  const u = (((t - pr.a) * 0.55 + k / n) % 1 + 1) % 1;
  const hh = propBox(pr.spec).h[1];
  return [rest[0] + ar[0] * (hash(k + 11) - 0.5), Math.max(rest[1] + hh, rest[1] + 2.6 * (1 - u)), rest[2] + ar[1] * (hash(k + 2) - 0.5)];
};
const BURST_N = 20;
const propBoxes = (pr: PropR, t: number, s: ShotR): Box[] => {
  const m = motionAt(pr, t, s);
  const bx = propBox(pr.spec);
  const out: Box[] = [];
  if (pr.spec.motion === "rain") {
    for (let k = 0; k < (pr.spec.n ?? 10); k++) out.push({ name: `${pr.key}.rain${k}`, c: rainPos(pr, t, k), h: bx.h });
    return out;
  }
  if (m.burstU > 0 && m.burstU < 1.6) {
    const rest = pr.pos(t);
    for (let k = 0; k < BURST_N; k++) { const q = burstPos(rest, m.burstU, k, BURST_N, 2.0, [Math.PI * 1.05, Math.PI * 1.95]); const hs = burstHalf(k); out.push({ name: `${pr.key}.cube${k}`, c: [q[0], Math.max(hs, q[1]), q[2]], h: [hs, hs, hs] }); }
  }
  if (m.show) out.push({ name: pr.key, c: [m.p[0], m.p[1] + bx.c * m.sc[1], m.p[2]], h: [bx.h[0] * m.sc[0], bx.h[1] * m.sc[1], bx.h[2] * m.sc[2]], yaw: m.r[1] || undefined });
  return out;
};

// ------------------------------------------------------------------ rendering
const KitProp: React.FC<{ ps: PropSpec; text: string[]; t: number; hit: number }> = ({ ps, text, t, hit }) => {
  const color = ps.color;
  switch (ps.kit) {
    case "tv": return <TV p={[0, 0, 0]} screen={text.length ? text : ["BIG TV"]} screenBg={color ?? "#ffd23a"} />;
    case "card": return <Card p={[0, 0, 0]} s={1} />;
    case "reader": return <Reader p={[0, 0, 0]} lit={t > hit ? 1 : 0} />;
    case "debtBlock": return <DebtBlock p={[0, 0, 0]} size={ps.size} text={text.length ? text : ["OWE"]} color={color} glow={ps.glow} />;
    case "block": return <DebtBlock p={[0, 0, 0]} size={ps.size ?? [1.2, 1.2, 0.8]} text={text} color={color ?? PAL.cash} glow={ps.glow} />;
    case "label": { const s = ps.size ?? [0.8, 0.3, 0.05]; return <Label p={[0, 0, 0]} text={text} w={s[0]} h={s[1]} bg={color ?? PAL.debt} fg="#fff4c8" glow={ps.glow ?? 0.1} />; }
    case "jar": return <TallJar p={[0, 0, 0]} fill={ps.fill ?? 0.3} label={text[0] ?? "SAVINGS"} color={color} glow={ps.glow} />;
    case "coinPile": return <CoinPile p={[0, 0, 0]} r={ps.size?.[0] ?? 0.9} h={ps.size?.[1] ?? 0.7} coins={80} />;
    case "calendar": return <FlipCalendar p={[0, 0, 0]} title={text[0] ?? "YEAR"} value={ps.value ?? text[1] ?? "1"} sub={text[2]} color={color} />;
    case "stamp": return <Stamp p={[0, 0, 0]} text={text[0] ?? "PAID"} u={clamp((t - hit + 0.12) / 0.25)} w={ps.size?.[0] ?? 0.6} color={color ?? "#e0412b"} />;
    case "payBox": return <PayBox p={[0, 0, 0]} lit={t > hit ? 0.8 : 0} text={text[0] ?? "PAY BILL"} />;
    case "coin": return <Coin3 p={[0, 0, 0]} s={1.4} r={[Math.PI / 2, 0, 0]} />;
    case "bill": return <Bill p={[0, 0, 0]} r={[Math.PI / 2, 0, 0]} />;
    case "counter": { const s = ps.size ?? [2.1, 0.96, 0.8]; return <B s={s} p={[0, s[1] / 2, 0]} c={color ?? "#ff9a3a"} />; }
    default: return null;
  }
};
const PropView: React.FC<{ pr: PropR; t: number; s: ShotR }> = ({ pr, t, s }) => {
  if (t < pr.a || t >= pr.b) return null;
  const ps = pr.spec;
  const m = motionAt(pr, t, s);
  const text = textOf(ps, t, pr.hit);
  const body = (key?: React.Key) => (ps.asset ? <Asset key={key} id={ps.asset} s={ps.s ?? 1} glow={ps.glow} /> : <group key={key} scale={ps.s ?? 1}><KitProp ps={ps} text={text} t={t} hit={pr.hit} /></group>);
  if (ps.motion === "rain") {
    return <>{Array.from({ length: ps.n ?? 10 }, (_, k) => { const q = rainPos(pr, t, k); const hh = propBox(ps).c; return <group key={k} position={[q[0], q[1] - hh, q[2]]} rotation={[0.6 * Math.sin(t * 5 + k), t * 2 + k, 0.7 * Math.sin(t * 6 + k)]}>{body()}</group>; })}</>;
  }
  return (
    <>
      {m.show ? (
        <group position={m.p} rotation={m.r} scale={m.sc}>{body()}</group>
      ) : null}
      {m.burstU > 0 ? <Burst p={pr.pos(t)} u={m.burstU} n={BURST_N} r={2.0} c={ps.color ?? PAL.debt} arc={[Math.PI * 1.05, Math.PI * 1.95]} /> : null}
    </>
  );
};
const FxView: React.FC<{ f: FxR; t: number }> = ({ f, t }) => {
  if (f.fx === "dust") return <Dust p={f.p(f.at)} u={(t - f.at) / 0.6} n={16} r={1.1} />;
  if (f.fx === "debris") return <Debris p={f.p(f.at)} t={t} t0={f.at} n={14} />;
  return null;
};
const ActorView: React.FC<{ st: ActorState; t: number }> = ({ st, t }) => {
  const a = alive({ key: st.id, look: st.look, pose: st.pose, emotion: st.emotion, s: st.s, blinkSeed: st.seed }, t);
  const body = <Blocky pose={a.pose} look={st.look} emotion={st.emotion} blink={st.blink} scale={st.s} mouth={st.mouth} />;
  return st.squash ? <Squash p={[st.pose.x, 0, st.pose.z]} k={st.squash}>{body}</Squash> : body;
};
/** first-person hands: two forearm blocks low in frame, in the viewer's shirt colour */
const PovHands: React.FC<{ cam: Cam; st: ActorState; t: number }> = ({ cam, st, t }) => {
  const d: V3 = [cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]];
  const L = Math.hypot(...d);
  const f: V3 = [d[0] / L, d[1] / L, d[2] / L];
  const side: V3 = [f[2], 0, -f[0]];
  const up = st.pose.armR > 1.0 ? 0.08 : -0.02;
  const yaw = Math.atan2(f[0], f[2]);
  return (
    <>
      {[-1, 1].map((k) => (
        <group key={k} position={[cam.pos[0] + f[0] * 0.42 + side[0] * k * 0.17, cam.pos[1] - 0.24 + up + 0.006 * Math.sin(t * 5 + k), cam.pos[2] + f[2] * 0.42 + side[2] * k * 0.17]} rotation={[0, yaw, 0]}>
          <B s={[0.1, 0.1, 0.34]} p={[0, 0, 0]} c={st.look.shirt} />
          <B s={[0.11, 0.11, 0.1]} p={[0, 0, 0.2]} c={st.look.skin} />
        </group>
      ))}
    </>
  );
};

// ------------------------------------------------------------------ quality pass: set life (posters, sparkles, dust, contact shadows)
const blobTex = () => canvasTexture("recipeBlob", 128, 128, (g, W) => {
  const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  gr.addColorStop(0, "rgba(20,10,40,0.55)");
  gr.addColorStop(0.6, "rgba(20,10,40,0.22)");
  gr.addColorStop(1, "rgba(20,10,40,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, W);
});
const blobMat = () => new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
let BLOB: THREE.MeshBasicMaterial | null = null;
const sparkMat = new Map<string, THREE.MeshBasicMaterial>();
const spark = (c: string) => { let m = sparkMat.get(c); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, depthWrite: false }); sparkMat.set(c, m); } return m; };
const MONEY_KITS = new Set(["coin", "coinPile", "jar", "bill"]);
const SetLife: React.FC<{ c: Compiled; shot: ShotR; t: number; actors: ActorState[] }> = ({ c, shot, t, actors }) => {
  const set = SETS[shot.set];
  BLOB = BLOB ?? blobMat();
  const all = [...actors.filter((a) => a.id !== shot.pov), ...(c.recipe.extras !== false && shot.spec.extras !== false ? extrasAt(shot.set, t) : [])];
  return (
    <>
      {/* soft contact shadows under every character (darker when the feet are on the floor) */}
      {all.map((a) => (
        <mesh key={`b${a.id}`} geometry={geoOf("recipeBlobPlane", () => new THREE.PlaneGeometry(1, 1))} material={BLOB!} rotation={[-Math.PI / 2, 0, 0]} position={[a.pose.x, 0.006, a.pose.z]} scale={[0.75 * a.s, 0.6 * a.s, 1]} />
      ))}
      {/* posters on the walls: no empty walls */}
      {(set.posters ?? []).map((p, i) => <Label key={`p${i}`} p={p.p} r={[0, p.yaw ?? 0, p.tilt ?? 0]} text={p.text} w={p.w ?? 0.9} h={p.h ?? 0.55} bg={p.bg} fg={p.fg ?? "#ffffff"} glow={0.15} />)}
      {/* sparkles twinkling on money props */}
      {shot.props.filter((p) => t >= p.a && t < p.b && (MONEY_KITS.has(p.spec.kit ?? "") || (p.spec.asset ?? "").startsWith("coin") || p.spec.asset === "jewel" || p.spec.asset === "chest")).map((p) => {
        const q = p.pos(t), bx = propBox(p.spec);
        return Array.from({ length: 6 }, (_, k) => {
          const ph = (t * (1.3 + hash(k + 2)) + hash(k)) % 1;
          const s = 0.045 * Math.sin(Math.PI * ph);
          if (s <= 0.004) return null;
          return <mesh key={`s${p.key}${k}`} geometry={geoOf("sparkOcta", () => new THREE.OctahedronGeometry(1, 0))} material={spark(k % 2 ? "#fff6c0" : "#ffffff")} position={[q[0] + bx.h[0] * 1.1 * (hash(k + 5) - 0.5) * 2, q[1] + bx.c + bx.h[1] * (hash(k + 9) * 2 - 0.6), q[2] + bx.h[2] + 0.05]} scale={[s, s * 1.6, s]} rotation={[0, t * 3 + k, 0]} />;
        });
      })}
      {/* dust motes drifting in the light (indoor sets) */}
      {!set.sky ? Array.from({ length: 26 }, (_, k) => {
        const x = -3.5 + 7 * hash(k + 31), z = -2.5 + 4.5 * hash(k + 37), y = 0.4 + ((hash(k + 41) * 2.4 + t * 0.06 * (0.5 + hash(k))) % 2.4);
        return <mesh key={`d${k}`} geometry={geoOf("dustMote", () => new THREE.SphereGeometry(1, 6, 4))} material={spark("#fffaf0")} position={[x + 0.1 * Math.sin(t * 0.7 + k), y, z]} scale={0.008 + 0.006 * hash(k + 3)} />;
      }) : null}
    </>
  );
};

let moodsFor = "";
export const RecipeFilm: React.FC<{ c: Compiled; sub?: boolean }> = ({ c, sub = false }) => {
  const g = useCurrentFrame();
  useFonts();
  if (c.landscape) return <LandscapeFilm c={c} g={g} />;
  return <PortraitFilm c={c} g={g} sub={sub} />;
};
const PortraitFilm: React.FC<{ c: Compiled; g: number; sub: boolean }> = ({ c, g, sub }) => {
  const ready = usePreload(c.assets);
  if (moodsFor !== c.slug) {
    setMoodShots(c.shots.filter((s) => s.lens.mood === "whisper").map((s) => `${c.slug}:${s.id}`), c.shots.filter((s) => s.lens.mood === "ending").map((s) => `${c.slug}:${s.id}`));
    moodsFor = c.slug;
  }
  const n0 = sub ? Math.floor(g / 4) : g;
  const shot0 = c.shotAt(n0 / FPS);
  const { n, fp } = sub ? subFrame(g, 4, shot0.lens.shutter ?? 0.35) : { n: g, fp: g };
  const shot = c.shotAt(n / FPS);
  const t = Math.min(Math.max(fp / FPS, shot.a), shot.b - 1e-4);
  const tOut = n / FPS;
  const cams = c.camAt(t);
  const set = SETS[shot.set];
  const actors = c.actorsAt(t);
  const pov = shot.pov ? actors.find((a) => a.id === shot.pov) : undefined;
  const scene = (cam: Cam) => (
    <>
      {set.render(t)}
      {actors.filter((a) => a.id !== shot.pov).map((a) => <ActorView key={a.id} st={a} t={t} />)}
      {c.quality && c.recipe.extras !== false && shot.spec.extras !== false ? extrasAt(shot.set, t).map((a) => <ActorView key={a.id} st={a} t={t} />) : null}
      {c.quality ? <SetLife c={c} shot={shot} t={t} actors={actors} /> : null}
      {shot.props.map((p) => <PropView key={p.key} pr={p} t={t} s={shot} />)}
      {c.quality ? <EggsView eggs={placeEggs(shot.set, c.recipe.eggs)} t={t} gag={c.recipe.finalGag} gu={gagU(c.recipe.finalGag, c.duration / FPS, t)} /> : null}
      {shot.fx.map((f, i) => <FxView key={i} f={f} t={t} />)}
      {pov ? <PovHands cam={cam} st={pov} t={t} /> : null}
    </>
  );
  const moodOf = (L: FinShot, cam: Cam, k: string) => moodFor(L.mood === "earth" ? "earth" : L.mood === "home" ? "home" : "store2", `${c.slug}:${shot.id}${k}`, { pos: cam.pos, look: cam.look, fov: cam.fov, roll: cam.roll ?? 0 });
  const view = (L: FinShot, cam: Cam, h: number, top: number, k: string) => (
    <View key={k} mood={moodOf(L, cam, k)} cam={{ pos: cam.pos, look: cam.look, fov: cam.fov, roll: cam.roll ?? 0 }} t={t} blur={L.blur ?? 1.2} focus={L.subj(t)} sky={L.sky ?? false} height={h} style={{ top, height: h }}>
      {scene(cam)}
    </View>
  );
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, tOut >= f.at ? 0.65 * (1 - (tOut - f.at) / 0.12) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const tag = c.recipe.tag && tOut >= c.at(c.recipe.tag.from) && tOut < c.at(c.recipe.tag.until) ? c.recipe.tag.text : null;
  const again = c.recipe.hook.again !== undefined ? c.at(c.recipe.hook.again) : null;
  return (
    <AbsoluteFill style={{ background: c.recipe.bg ?? set.bg }}>
      {ready ? (cams.split && cams.second && shot.lens2 ? (
        <>
          {view(shot.lens, cams.main, 960, 0, "a")}
          {view(shot.lens2, cams.second, 960, 960, "b")}
          <div style={{ position: "absolute", left: 0, right: 0, top: 952, height: 16, background: "#16121c" }} />
        </>
      ) : view(shot.lens, cams.main, 1920, 0, "")) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
      <HookText text={c.recipe.hook.text} t={tOut} until={c.hookUntil} />
      {again !== null && tOut >= again ? <HookText text={c.recipe.hook.text} t={tOut} until={99} /> : null}
      {!capOff ? (fixedCap ? <RecipeCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} style={{ centre: capCentre(c, shot) }} /> : <RecipeCaptions chunks={CHUNKS(c)} t={tOut} hide={(x) => x < CAPTIONS_FROM} style={{ centre: capCentre(c, shot) }} />) : null}
      {/* EXAMPLE tag: bottom left under the caption band (was top right at y 440, where it sat on tall boards); clear of the right rail and YouTube's bottom UI */}
      {tag ? <div style={{ position: "absolute", left: 60, top: 1456, padding: "4px 12px", borderRadius: 10, background: "rgba(255,244,200,0.92)", color: "#16121c", fontFamily: "Poppins", fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{tag}</div> : null}
    </AbsoluteFill>
  );
};
// ------------------------------------------------------------------ LONG-FORM: the 1920x1080 film (LONGFORM.md)
/** a chapter title sting: 2.6 s, a bar slides in from the left with "CHAPTER n" and the title, holds, slides out */
export const CHAPTER_CARD_S = 2.6;
const ChapterCard: React.FC<{ n: number; title: string; u: number }> = ({ n, title, u }) => {
  if (u < 0 || u > CHAPTER_CARD_S) return null;
  const inK = EASE_OUT(clamp(u / 0.35)), outK = EASE_OUT(clamp((u - (CHAPTER_CARD_S - 0.35)) / 0.35));
  const x = -1100 * (1 - inK) - 1300 * outK;
  const dim = 0.32 * inK * (1 - outK);
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(10,6,16,${dim})` }} />
      <div style={{ position: "absolute", left: 0, top: 330, transform: `translateX(${x}px)`, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ marginLeft: 120, padding: "6px 18px", background: "#ffd23a", color: "#140c1c", fontFamily: "Poppins", fontWeight: 800, fontSize: 34, letterSpacing: 4, borderRadius: 8 }}>{`CHAPTER ${n}`}</div>
        <div style={{ marginTop: 14, padding: "18px 60px 22px 120px", background: "rgba(20,12,28,0.88)", borderRight: "14px solid #ff3b30", color: "#ffffff", fontFamily: "Poppins", fontWeight: 800, fontSize: 96, lineHeight: 1.05, maxWidth: 1500, textTransform: "uppercase" }}>{title}</div>
      </div>
    </>
  );
};
/** LONG-FORM lower-third caption centre (px at 1080 tall) and half its 2-line band */
export const CAP_Y_L = 905;
const CAP_HALF_L = 72;
const LandscapeFilm: React.FC<{ c: Compiled; g: number }> = ({ c, g }) => {
  const t0 = g / FPS;
  const shot = c.shotAt(t0);
  const si = c.shots.indexOf(shot);
  // windowed loading: only this shot's and the next shot's models (never every asset of a 10-minute video at once)
  const ready = useAssetWindow(c.windowAssets[si] ?? []);
  if (moodsFor !== c.slug) {
    setMoodShots(c.shots.filter((s) => s.lens.mood === "whisper").map((s) => `${c.slug}:${s.id}`), c.shots.filter((s) => s.lens.mood === "ending").map((s) => `${c.slug}:${s.id}`));
    moodsFor = c.slug;
  }
  const t = Math.min(Math.max(t0, shot.a), shot.b - 1e-4);
  const cams = c.camAt(t);
  const set = SETS[shot.set];
  const actors = c.actorsAt(t);
  const pov = shot.pov ? actors.find((a) => a.id === shot.pov) : undefined;
  const scene = (cam: Cam) => (
    <>
      {set.render(t)}
      {actors.filter((a) => a.id !== shot.pov).map((a) => <ActorView key={a.id} st={a} t={t} />)}
      {c.quality && c.recipe.extras !== false && shot.spec.extras !== false ? extrasAt(shot.set, t).map((a) => <ActorView key={a.id} st={a} t={t} />) : null}
      {c.quality ? <SetLife c={c} shot={shot} t={t} actors={actors} /> : null}
      {shot.props.map((p) => <PropView key={p.key} pr={p} t={t} s={shot} />)}
      {c.quality ? <EggsView eggs={placeEggs(shot.set, c.recipe.eggs)} t={t} gag={c.recipe.finalGag} gu={gagU(c.recipe.finalGag, c.duration / FPS, t)} /> : null}
      {shot.fx.map((f, i) => <FxView key={i} f={f} t={t} />)}
      {pov ? <PovHands cam={cam} st={pov} t={t} /> : null}
    </>
  );
  const moodOf = (L: FinShot, cam: Cam, k: string) => moodFor(L.mood === "earth" ? "earth" : L.mood === "home" ? "home" : "store2", `${c.slug}:${shot.id}${k}`, { pos: cam.pos, look: cam.look, fov: cam.fov, roll: cam.roll ?? 0 });
  const view = (L: FinShot, cam: Cam, w: number, left: number, k: string) => (
    <View key={k} mood={moodOf(L, cam, k)} cam={{ pos: cam.pos, look: cam.look, fov: cam.fov, roll: cam.roll ?? 0 }} t={t} blur={L.blur ?? 1.2} focus={L.subj(t)} sky={L.sky ?? false} width={w} height={1080} postScale={1} style={{ left, width: w, height: 1080 }}>
      {scene(cam)}
    </View>
  );
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, t0 >= f.at ? 0.65 * (1 - (t0 - f.at) / 0.12) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const tag = c.recipe.tag && t0 >= c.at(c.recipe.tag.from) && t0 < c.at(c.recipe.tag.until) ? c.recipe.tag.text : null;
  const again = c.recipe.hook.again !== undefined ? c.at(c.recipe.hook.again) : null;
  const ch = c.chapters.find((x) => t0 >= x.card && t0 < x.card + CHAPTER_CARD_S);
  const capY = capPlanL(c, shot).y / 1080;
  return (
    <AbsoluteFill style={{ background: c.recipe.bg ?? set.bg }}>
      {ready ? (cams.split && cams.second && shot.lens2 ? (
        <>
          {/* split screen side by side in 16:9: left = targets[0], right = targets[1] */}
          {view(shot.lens, cams.main, 960, 0, "a")}
          {view(shot.lens2, cams.second, 960, 960, "b")}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 952, width: 16, background: "#16121c" }} />
        </>
      ) : view(shot.lens, cams.main, 1920, 0, "")) : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
      <HookText text={c.recipe.hook.text} t={t0} until={c.hookUntil} top={70} size={80} />
      {again !== null && t0 >= again ? <HookText text={c.recipe.hook.text} t={t0} until={99} top={70} size={80} /> : null}
      {ch ? <ChapterCard n={ch.n} title={ch.title} u={t0 - ch.card} /> : null}
      {!capOff ? (fixedCap ? <LowerThirdCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={t0} centre={capY} /> : <LowerThirdCaptions chunks={CHUNKS_L(c)} t={t0} centre={capY} hide={(x) => x < CAPTIONS_FROM} />) : null}
      {tag ? <div style={{ position: "absolute", right: 48, top: 40, padding: "6px 16px", borderRadius: 10, background: "rgba(255,244,200,0.92)", color: "#16121c", fontFamily: "Poppins", fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>{tag}</div> : null}
    </AbsoluteFill>
  );
};
const chunkCacheL = new WeakMap<Compiled, ReturnType<typeof chunkWords>>();
/** long-form captions: phrases of up to 7 words (2 lines max in the 1440 px column) */
const CHUNKS_L = (c: Compiled) => { let k = chunkCacheL.get(c); if (!k) { k = chunkWords(c.words, 7); chunkCacheL.set(c, k); } return k; };
const capCacheL = new WeakMap<Compiled, Map<string, CapPlan>>();
/** the long-form caption plan: like capPlan, for a 1920x1080 frame (a side-by-side split checks both views) */
export const capPlanL = (c: Compiled, shot: { id: string; a: number; b: number }): CapPlan => {
  let m = capCacheL.get(c); if (!m) { m = new Map(); capCacheL.set(c, m); }
  const hit = m.get(shot.id); if (hit) return hit;
  type Ob = { top: number; bot: number };
  const faces: Ob[] = [];
  const boards = new Set<string>();
  const inBand = (o: Ob, y: number) => !(o.bot < y - CAP_HALF_L || o.top > y + CAP_HALF_L);
  for (const u of [0.1, 0.3, 0.5, 0.7, 0.92]) {
    const tm = shot.a + (shot.b - shot.a) * u;
    const cams = c.camAt(tm);
    const views: [Cam, number, number][] = cams.split && cams.second ? [[cams.main, 960, 0], [cams.second, 960, 960]] : [[cams.main, 1920, 0]];
    const texty = new Set(c.shotAt(tm).props.filter((p) => p.spec.kit === "label" || (p.spec as { text?: unknown }).text).map((p) => p.key));
    const pboxes = c.qa(tm).props;
    for (const [cam, w, left] of views) {
      for (const a of c.actorsAt(tm)) {
        const q = project(cam, [a.head[0], a.head[1] - 0.05 * a.s, a.head[2]], 1080, 0, w, left);
        if (!q || q.x < left + 240 || q.x > left + w - 240) continue;
        const half = 0.17 * a.s * q.k;
        const o = { top: q.y - half, bot: q.y + half };
        if (o.bot > 0 && o.top < 1080) faces.push(o);
      }
      for (const b of pboxes) {
        if (!texty.has(b.name)) continue;
        const qt = project(cam, [b.c[0], b.c[1] + b.h[1], b.c[2]], 1080, 0, w, left), qb = project(cam, [b.c[0], b.c[1] - b.h[1], b.c[2]], 1080, 0, w, left);
        if (!qt || !qb) continue;
        const reach = b.h[0] * qt.k, cx = (qt.x + qb.x) / 2;
        const o = { top: Math.min(qt.y, qb.y), bot: Math.max(qt.y, qb.y) };
        if (cx + reach > 240 && cx - reach < 1680 && o.bot > 0 && o.top < 1080 && inBand(o, CAP_Y_L)) boards.add(b.name);
      }
    }
  }
  const free = (y: number) => faces.every((o) => !inBand(o, y));
  let y = CAP_Y_L;
  if (!free(CAP_Y_L)) {
    // a lower third only moves down a little (to 940) or up to just over the face; never into the top third
    const cand = [...faces.map((o) => o.bot + CAP_HALF_L + 8), ...faces.map((o) => o.top - CAP_HALF_L - 8)].filter((v) => v >= 400 && v <= 940 && free(v));
    if (cand.length) y = cand.reduce((b, v) => (Math.abs(v - CAP_Y_L) < Math.abs(b - CAP_Y_L) ? v : b));
  }
  const out: CapPlan = { y, faces: faces.filter((o) => inBand(o, CAP_Y_L)), boards: [...boards] };
  m.set(shot.id, out);
  return out;
};

/** OWNER 2026-11-19 (rule v2): word captions are FIXED in the bottom band. The chunk's centre is at CAP_Y px (a one-line
 *  baseline at about 72 % of the frame), never lower than CAP_MAX_Y (nothing below y 1500: YouTube's bottom UI).
 *  The SHOT keeps that band clear: faces go in the upper or middle part of the frame, with chest, body, props or floor
 *  in the band. Only when a face's eyes-to-mouth box still lands in the band (any of 5 samples across the shot) does
 *  the caption move, by the smallest amount that clears it: down first (up to CAP_MAX_Y), else up to just over the
 *  face. Text boards do not move the caption; recipe_build warns about them instead. Evaluated once per shot, so the
 *  caption only moves at cuts. tools/recipe_build.mjs gates: centre >= 65 % of the height on >= 90 % of caption time. */
export const CAP_Y = 1344;
export const CAP_MAX_Y = 1400;
const CAP_HALF = 105; // half the band a 1-2 line chunk needs
export type CapPlan = { y: number; faces: { top: number; bot: number }[]; boards: string[] };
const capCache = new WeakMap<Compiled, Map<string, CapPlan>>();
export const project = (cam: Cam, p: V3, h: number, top: number, w = 1080, left = 0): { x: number; y: number; k: number } | null => {
  const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const nrm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const f = nrm(sub(cam.look, cam.pos)); const r = nrm(cross(f, [0, 1, 0])); const u = cross(r, f);
  const d = sub(p, cam.pos); const z = dot(d, f);
  if (z <= 0.05) return null;
  const k = (h / 2) / Math.tan((cam.fov * Math.PI) / 360); // px per unit at distance 1
  return { x: left + w / 2 + (dot(d, r) / z) * k, y: top + h / 2 - (dot(d, u) / z) * k, k: k / z };
};
export const capPlan = (c: Compiled, shot: { id: string; a: number; b: number }): CapPlan => {
  let m = capCache.get(c); if (!m) { m = new Map(); capCache.set(c, m); }
  const hit = m.get(shot.id); if (hit) return hit;
  type Ob = { top: number; bot: number };
  const faces: Ob[] = [];
  const boards = new Set<string>();
  const inBand = (o: Ob, y: number) => !(o.bot < y - CAP_HALF || o.top > y + CAP_HALF);
  for (const u of [0.1, 0.3, 0.5, 0.7, 0.92]) {
    const tm = shot.a + (shot.b - shot.a) * u;
    const cams = c.camAt(tm);
    const split = cams.split && cams.second;
    const cam = split ? cams.second! : cams.main;
    const h = split ? 960 : 1920, top = split ? 960 : 0;
    const vis = (o: Ob) => o.bot > top && o.top < top + h;
    for (const a of c.actorsAt(tm)) {
      const q = project(cam, [a.head[0], a.head[1] - 0.05 * a.s, a.head[2]], h, top);
      if (!q || q.x < 120 || q.x > 960) continue;
      const half = 0.17 * a.s * q.k;
      const o = { top: q.y - half, bot: q.y + half };
      if (vis(o)) faces.push(o);
    }
    const texty = new Set(c.shotAt(tm).props.filter((p) => p.spec.kit === "label" || (p.spec as { text?: unknown }).text).map((p) => p.key));
    for (const b of c.qa(tm).props) {
      if (!texty.has(b.name)) continue;
      const qt = project(cam, [b.c[0], b.c[1] + b.h[1], b.c[2]], h, top), qb = project(cam, [b.c[0], b.c[1] - b.h[1], b.c[2]], h, top);
      if (!qt || !qb) continue;
      const reach = b.h[0] * qt.k, cx = (qt.x + qb.x) / 2;
      const o = { top: Math.min(qt.y, qb.y), bot: Math.max(qt.y, qb.y) };
      if (cx + reach > 170 && cx - reach < 910 && vis(o) && inBand(o, CAP_Y)) boards.add(b.name);
    }
  }
  const free = (y: number) => faces.every((o) => !inBand(o, y));
  let y = CAP_Y;
  if (!free(CAP_Y)) {
    const cand = [...faces.map((o) => o.bot + CAP_HALF + 10), ...faces.map((o) => o.top - CAP_HALF - 10)].filter((v) => v >= 560 && v <= CAP_MAX_Y && free(v));
    if (cand.length) y = cand.reduce((b, v) => (Math.abs(v - CAP_Y) < Math.abs(b - CAP_Y) ? v : b));
  }
  const out: CapPlan = { y: Math.min(y, CAP_MAX_Y), faces: faces.filter((o) => inBand(o, CAP_Y)), boards: [...boards] };
  m.set(shot.id, out);
  return out;
};
export const capCentre = (c: Compiled, shot: { id: string; a: number; b: number }): number => capPlan(c, shot).y / 1920;
/** OWNER rule v2: caption-safe framing. After compiling, any shot whose eyes-to-mouth box lands in the caption band gets
 *  its framing lifted (the lens's `face` fraction, i.e. where the target sits from the top) just enough to clear it, so
 *  the shot shows chest/body/floor in the band instead. Split screens lift the bottom view only. Limits keep heads in
 *  frame (full >= 0.26, split view >= 0.2); whatever is left over falls back to the smallest caption nudge in capPlan.
 *  A recipe can opt a shot out with cam.face set explicitly. */
export const captionSafeFraming = (c: Compiled): { i: number; key: "face" | "face2"; v: number }[] => {
  const out: { i: number; key: "face" | "face2"; v: number }[] = [];
  if (c.landscape) {
    // long-form: lift a shot whose face lands in the lower-third band (a side-by-side split lifts both views)
    c.shots.forEach((shot, i) => {
      if (shot.pov) return;
      const cs = shot.spec.cam as { face?: unknown; face2?: unknown };
      const lenses: [FinShot, "face" | "face2"][] = shot.lens2 ? [[shot.lens, "face"], [shot.lens2, "face2"]] : [[shot.lens, "face"]];
      const f0 = lenses.map(([L]) => L.face);
      for (let it = 0; it < 4; it++) {
        capCacheL.delete(c);
        const p = capPlanL(c, shot);
        if (!p.faces.length) break;
        const need = Math.max(...p.faces.map((o) => o.bot)) - (CAP_Y_L - CAP_HALF_L - 10);
        let moved = false;
        for (const [L, key] of lenses) if (typeof cs[key] !== "number" && (L.face ?? 0.5) > 0.26 + 1e-3) { L.face = Math.max(0.26, (L.face ?? 0.5) - (need + 8) / 1080); moved = true; }
        if (need <= 0 || !moved) break;
      }
      lenses.forEach(([L, key], k) => { if (L.face !== f0[k]) out.push({ i, key, v: Math.round(L.face * 1000) / 1000 }); });
    });
    capCacheL.delete(c);
    return out;
  }
  c.shots.forEach((shot, i) => {
    if (shot.b <= 1.0 || shot.pov) return;
    const split = !!shot.lens2;
    const L = split ? shot.lens2! : shot.lens;
    const cs = shot.spec.cam as { face?: unknown; face2?: unknown };
    if (typeof (split ? cs.face2 : cs.face) === "number") return;
    const f0 = L.face;
    const h = split ? 960 : 1920, min = split ? 0.2 : 0.26;
    for (let it = 0; it < 4; it++) {
      capCache.delete(c);
      const p = capPlan(c, shot);
      if (!p.faces.length) break;
      const need = Math.max(...p.faces.map((o) => o.bot)) - (CAP_Y - CAP_HALF - 10);
      if (need <= 0 || (L.face ?? 0.5) <= min + 1e-3) break;
      L.face = Math.max(min, (L.face ?? 0.5) - (need + 8) / h);
    }
    if (L.face !== f0) out.push({ i, key: split ? "face2" : "face", v: Math.round(L.face * 1000) / 1000 });
  });
  capCache.delete(c);
  return out;
};
/** FORMAT_V1 day-1 fix 2: frame 0 shows ONE hook line, so word captions (a second text layer) start at 1.0 s */
export const CAPTIONS_FROM = 1.0;
const chunkCache = new WeakMap<Compiled, ReturnType<typeof chunkWords>>();
const CHUNKS = (c: Compiled) => { let k = chunkCache.get(c); if (!k) { k = chunkWords(c.words, 3); chunkCache.set(c, k); } return k; };

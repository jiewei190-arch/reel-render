// storytime compiler: recipe + word timings + the voice's loudness per frame -> a pure function of t: the shot, the
// camera, every kid's pose / face / mouth, the caption chunk, the fx. Runs in node for the QA (tools/storytime_build.mjs)
// and in the browser for the render (src/storytime/film.tsx); nothing here imports three or remotion.
import { fitFs } from "../longform/polish";
import { FACES } from "./face";
import type { FaceP } from "./face";
import { FPS, H, K, SETS, W, add, bodyK, cross, dot, fwd, headUpOf, hipOf, leftOf, mul, norm, project, sub } from "./layout";
import type { CamS, Extra, Mark, SetLayout, V3 } from "./layout";
import type { AdultEv, At, Cam, CastId, CastSpec, ClassEv, Expr, Fx, Line, Pose, Recipe, SetId, Shot, Word } from "./types";
import { CAM_PRESETS, EXPRS, POSES, SET_IDS } from "./types";

export { FPS };
/** the closest a close-up / punch-in camera may get (m from the face): the head (with hair) stays whole in frame (R2) */
export const CLOSE_MIN = 2.6, PUNCH_MIN = 2.45; // 9:16: the head (with hair) keeps ~60 % of the frame width
/** the caption pop: 0.82 -> 1.06 -> 1 over 4 frames (shouts full, other chunks half as much) */
/** the angle (radians) between a kid's face direction and the direction to the lens; face pieces are flat clay decals,
 *  so they are hidden past FACE_CULL (seen edge-on they would stand off the side of the head) */
export const FACE_CULL = (62 * Math.PI) / 180;
export const faceAngle = (st: { x: number; z: number; yaw: number; headYaw: number }, cam: readonly number[]) => {
  const fwd = st.yaw + st.headYaw, toCam = Math.atan2(cam[0] - st.x, cam[2] - st.z);
  let d = toCam - fwd; d = Math.atan2(Math.sin(d), Math.cos(d));
  return Math.abs(d);
};
export const capPop = (_t: number, _start: number, _shout: boolean) => 1; // LOW-POLY: captions cut in, no pop
export const capPopClay = (t: number, start: number, shout: boolean) => {
  const k = Math.min(1, Math.max(0, (t - start + 0.04) / (4 / 30)));
  const pop = k < 0.6 ? 0.82 + (1.06 - 0.82) * (k / 0.6) : 1.06 - 0.06 * ((k - 0.6) / 0.4);
  return shout ? pop : 1 + (pop - 1) * 0.5;
};
const LEADS: CastId[] = ["me", "homie"];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ------------------------------------------------------------------ words + anchors
/** a word's comparable form: lower case letters/digits only, repeated letters collapsed ("FUUUCK" = "fuck") */
export const normW = (w: string) => String(w).toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(.)\1+/g, "$1");

export const resolveAt = (at: At | undefined, words: readonly Word[], dflt: number): number => {
  if (at === undefined) return dflt;
  if (typeof at === "number") return at;
  let str = String(at).trim(), off = 0;
  const om = str.match(/^(.+?)([+-]\d+(?:\.\d+)?)$/);
  if (om && !om[1].endsWith(":")) { str = om[1]; off = Number(om[2]); }
  const m = str.match(/^(\d+)(?::([^#]+))?(?:#(\d+))?$/);
  if (!m) throw new Error(`bad anchor "${at}": use seconds, "L", "L:word", "L:word#k", "L:end", optionally "+0.2"`);
  const line = Number(m[1]), key = m[2], k = m[3] ? Number(m[3]) : 1;
  const lw = words.filter((w) => w.turn === line);
  if (!lw.length) throw new Error(`anchor "${at}": line ${line} has no words (lines: ${[...new Set(words.map((w) => w.turn))].join(", ")})`);
  if (!key) return lw[0].t + off;
  if (key === "end") return lw[lw.length - 1].end + off;
  const hits = lw.filter((w) => normW(w.w) === normW(key));
  if (hits.length < k) throw new Error(`anchor "${at}": line ${line} has ${hits.length} "${key}" (words: ${lw.map((w) => w.w).join(" ")})`);
  return hits[k - 1].t + off;
};

// ------------------------------------------------------------------ captions
export type CapWordR = { text: string; t: number; end: number; accent: boolean };
export type Chunk = { words: CapWordR[]; start: number; end: number; hold: number; line: number; shout: boolean; fs: number; fitOk: boolean; text: string };
const STOP = new Set("a an the to in on at of is it i i'm im my me and so he she was you your do this that would like then but or as with be are".split(" "));
/** LOW-POLY captions: Barlow Condensed Bold, white, no outline (a faint shadow), ~5 % of the height, centred at 0.62 H.
 *  fitFs measures Poppins widths; the condensed face is ~0.74 as wide, so the fit width is divided by CW. */
export const CAP = { fitFloor: 80, fs: 96, fsShout: 100, minFs: 72, side: 90, centre: 0.66, accent: "#FFB020", stroke: 0, lineH: 1.1, maxY: 0.74, CW: 0.74, maxWords: 4 } as const;

/** align the script's spellings to the timed words: "FUUUCK" shows for the timed "fuck", "old-ASS" for "old" "-ass" */
const displayWords = (lw: readonly Word[], line: Line | undefined) => {
  const toks = (line?.text ?? "").replace(/—/g, "— ").split(/\s+/).flatMap((x) => x.split(/(?=-[A-Za-z])/)).filter((x) => normW(x));
  let j = 0;
  return lw.map((w) => {
    for (let k = j; k < Math.min(toks.length, j + 4); k++) if (normW(toks[k]) === normW(w.w) || (/—$/.test(toks[k]) && normW(toks[k]).length > 1 && normW(w.w).startsWith(normW(toks[k])))) { j = k + 1; return { w, tok: toks[k] }; }
    return { w, tok: w.w };
  });
};
const clean = (s: string) => s.replace(/^["“]+/, "").replace(/[,.;:"”]+$/, "").replace(/\.\.\.$/, "");
const isCaps = (s: string) => /[A-Z]{2,}/.test(s) && s === s.toUpperCase();

export const buildChunks = (words: readonly Word[], lines: Record<string, Line>): Chunk[] => {
  const out: Chunk[] = [];
  const byLine = new Map<number, Word[]>();
  for (const w of words) { if (!byLine.has(w.turn)) byLine.set(w.turn, []); byLine.get(w.turn)!.push(w); }
  for (const [ln, lw] of [...byLine].sort((a, b) => a[0] - b[0])) {
    const L = lines[String(ln)];
    const shout = !!L?.shout;
    // merge "-ass" into the word before it
    const dw: { text: string; raw: string; t: number; end: number }[] = [];
    for (const { w, tok } of displayWords(lw, L)) {
      const tx = clean(tok);
      if (/^-/.test(tx) && dw.length) { const p = dw[dw.length - 1]; p.text += tx; p.raw += tok; p.end = w.end; continue; }
      dw.push({ text: tx, raw: tok, t: w.t, end: w.end });
    }
    let cur: typeof dw = [];
    const flush = () => {
      if (!cur.length) return;
      const pref = new Set((L?.accent ?? []).map(normW));
      const score = (x: (typeof dw)[number]) => (pref.has(normW(x.text)) ? 100 : 0) + (isCaps(x.raw) ? 40 : 0) + (/(.)\1\1/i.test(x.raw) ? 30 : 0) + (STOP.has(x.text.toLowerCase().replace(/[^a-z']/g, "")) ? -60 : 0) + normW(x.text).length;
      let ai = 0;
      cur.forEach((x, i) => { if (score(x) > score(cur[ai])) ai = i; });
      const ws = cur.map((x, i) => ({ text: shout ? x.text.toUpperCase() : x.text, t: x.t, end: x.end, accent: i === ai }));
      const text = ws.map((x) => x.text).join(" ");
      const f = fitFs(text, shout ? CAP.fsShout : CAP.fs, (W - 2 * CAP.side) / CAP.CW, 0, CAP.minFs);
      out.push({ words: ws, start: ws[0].t, end: ws[ws.length - 1].end, hold: 0, line: ln, shout, fs: f.fs, fitOk: f.ok, text });
      cur = [];
    };
    const fits = (ws: typeof dw) => fitFs(ws.map((q) => (shout ? q.text.toUpperCase() : q.text)).join(" "), shout ? CAP.fsShout : CAP.fs, (W - 2 * CAP.side) / CAP.CW, 0, CAP.minFs).fs >= CAP.fitFloor;
    dw.forEach((x, i) => {
      if (cur.length && !fits([...cur, x])) flush();
      cur.push(x);
      const nx = dw[i + 1];
      if (cur.length >= CAP.maxWords || /[.,!?…—]$/.test(x.raw.replace(/\.\.\.$/, ".")) || !nx || nx.t - x.end > 0.45) flush();
    });
  }
  out.sort((a, b) => a.start - b.start);
  out.forEach((c, i) => { const n = out[i + 1]; c.hold = n ? Math.min(n.start, c.end + 0.7) : c.end + 0.8; });
  return out;
};

// ------------------------------------------------------------------ timelines
type Ev<T> = { t: number; v: T };
const valueAt = <T,>(evs: Ev<T>[], t: number, dflt: T): { v: T; prev: T; t0: number } => {
  let v = dflt, prev = dflt, t0 = -99;
  for (const e of evs) { if (e.t > t + 1e-9) break; if (e.v !== v) { prev = v; v = e.v; t0 = e.t; } }
  return { v, prev, t0 };
};

export type ShotR = {
  i: number; id: string; a: number; b: number; set: SetId; spec: Shot; cam: Cam; on: CastId;
  fx: { fx: Fx["fx"]; at: number; gain: number; dur: number; sustain: boolean }[];
  /** extras hidden in this shot (they would stand between the lens and the subject) */
  hide: Set<string>;
  /** caption centre (px from the top) for this shot: below every named face and neck */
  capY: number;
};

export type FigState = {
  id: string; lead: boolean; spec: CastSpec; x: number; z: number; yaw: number; headYaw: number; headPitch: number;
  sit: boolean; s: number; lean: number; bob: number; tilt: number;
  /** arms: [forward raise, sideways raise] (rad) for the left (+x) and right arm */
  armL: [number, number]; armR: [number, number];
  /** elbow bends in radians (L, R; forward), default a slight natural bend */
  elbow?: [number, number];
  pose: Pose; expr: Expr; face: FaceP; mouth: number; talking: boolean; seed: number;
  /** the floor under the kid (a stage) */
  y?: number;
  /** seconds since the current pose began (the slow phone raise) */
  poseT?: number;
};

export type Compiled = ReturnType<typeof compileStory>;

/** the head centre of a kid in world space */
export const headCenter = (st: Pick<FigState, "x" | "z" | "yaw" | "sit" | "s" | "lean" | "bob"> & { y?: number; spec?: { adult?: boolean } }): V3 => {
  const up = headUpOf(st.spec) * st.s;
  const f = fwd(st.yaw);
  const y = (st.y ?? 0) + hipOf(st.sit, st.spec) * st.s + st.bob + Math.cos(st.lean) * up;
  const ahead = Math.sin(st.lean) * up;
  return [st.x + f[0] * ahead, y, st.z + f[2] * ahead];
};
/** QA boxes: the head (incl. hair), the face (front of the head), the torso */
export const kidBoxes = (st: FigState) => {
  const c = headCenter(st), s = st.s;
  const hairTop = st.spec.hairStyle === "spiky" ? 0.13 : st.spec.hairStyle === "curls" ? 0.13 : st.spec.hairStyle === "puff" ? 0.12 : st.spec.hairStyle === "flattop" ? 0.1 : 0.05;
  const head = { c: [c[0], c[1] + (hairTop * s) / 2, c[2]] as V3, h: [(K.headW * 0.5 + 0.03) * s, (K.headH / 2 + hairTop / 2) * s, (K.headD * 0.5 + 0.03) * s] as V3 };
  const face = { c, h: [K.headW * 0.5 * s, K.headH * 0.5 * s, K.headD * 0.5 * s] as V3 };
  const y0 = st.y ?? 0, tk = bodyK(st.spec).torso;
  const hip = hipOf(st.sit, st.spec) * s + st.bob;
  const torso = { c: [st.x, y0 + hip + (K.torsoH * tk / 2) * s, st.z] as V3, h: [(K.torsoW / 2) * s, (K.torsoH * tk / 2) * s, (K.torsoD / 2) * s] as V3 };
  const legs = { c: [st.x, y0 + hip / 2, st.z] as V3, h: [0.2 * s, hip / 2, 0.2 * s] as V3 };
  return { head, face, torso, legs };
};

type PoseOut = { L: [number, number]; R: [number, number]; lean: number; bob: number; E?: [number, number]; ownBeat?: boolean };
/** b = the speaker's word-beat envelope (0..1, a hit on each spoken word, stronger on emphasised words) */
/** pt = seconds since the pose began */
const POSE_ARMS: Record<Pose, (t: number, seed: number, amp: number, b: number, pt: number) => PoseOut> = {
  // a deep bow from the waist, arms at the sides (eases in over 0.4 s)
  bow: (t, sd, a, b, pt) => { const k = ease(pt / 0.4); return { L: [0.12 + 0.2 * k, 0.04], R: [0.12 + 0.2 * k, 0.04], lean: 0.95 * k, bob: 0, ownBeat: true }; },
  // stiff as a plank: arms pinned to the sides (the whole body tips over in the renderer)
  fall: () => ({ L: [0.0, 0.03], R: [0.0, 0.03], lean: 0, bob: 0, ownBeat: true }),
  // the phone comes up slowly, right hand, from the chest to face height (2.2 s), screen to the lens
  raise: (t, sd, a, b, pt) => { const k = ease(pt / 2.2); return { L: [0.1, 0.1], R: [0.75 + 1.4 * k, -0.08], E: [0.12, 1.25 - 0.95 * k], lean: 0.04 + 0.04 * k, bob: 0 }; },
  // fists pumping out at head height on every shouted word (the cold open)
  pump: (t, sd, a, b) => ({ L: [1.2 + 0.55 * b, -0.12], R: [1.2 + 0.55 * b, -0.12], E: [1.9 - 0.3 * b, 1.9 - 0.3 * b], lean: 0.1 + 0.08 * b, bob: 0.03 * b, ownBeat: true }),
  // both forearms out, palms up: "who the fuck is Deez?"
  shrug: (t, sd, a, b) => ({ L: [0.42, 0.5 + 0.1 * b], R: [0.42, 0.5 + 0.1 * b], E: [1.45, 1.45], lean: -0.04, bob: 0.02 + 0.012 * b, ownBeat: true }),
  // both fists come down on the table on every word, up between words
  slam: (t, sd, a, b) => ({ L: [1.35 - 0.4 * b, 0.12], R: [1.35 - 0.4 * b, 0.12], E: [1.5 - 0.95 * b, 1.5 - 0.95 * b], lean: 0.06 + 0.12 * b, bob: -0.01 * b, ownBeat: true }),
  idle: (t, sd) => ({ L: [0.08 + 0.01 * Math.sin(t * 0.9 + sd), 0.1], R: [0.08 + 0.01 * Math.sin(t * 0.9 + sd + 1), 0.1], lean: 0.008 * Math.sin(t * 0.6 + sd), bob: 0 }),
  talk: (t, sd, a) => ({ L: [0.45 + 0.35 * Math.sin(t * 4.1 + sd) * (0.4 + a), 0.25 + 0.1 * Math.sin(t * 2.7)], R: [0.6 + 0.4 * Math.sin(t * 3.6 + sd + 2) * (0.4 + a), 0.2], lean: 0.05 + 0.04 * a, bob: 0.012 * a }),
  yell: (t) => ({ L: [0.75, 0.9 + 0.03 * Math.sin(t * 2)], R: [0.75, 0.9 + 0.03 * Math.sin(t * 2 + 1)], lean: 0.16, bob: 0 }),
  phone: (t, sd) => ({ L: [1.45 + 0.02 * Math.sin(t * 1.7), -0.3], R: [1.45 + 0.02 * Math.sin(t * 1.7 + 1), -0.3], lean: 0.1, bob: 0.003 * Math.sin(t * 2 + sd) }),
  laugh: (t, sd) => ({ L: [0.55, -0.42], R: [0.55, -0.42], lean: -0.12 + 0.04 * Math.sin(t * 6 + sd), bob: 0.012 * Math.abs(Math.sin(t * 6 + sd)) }),
  point: (t, sd, a, b) => ({ L: [0.1, 0.12], R: [1.72 + 0.03 * Math.sin(t * 3) - 0.1 * b, -0.08], E: [0.12, 0.02], lean: 0.08 + 0.06 * b, bob: 0.004 * Math.sin(t * 2 + sd), ownBeat: true }),
  lean: (t, sd) => ({ L: [1.2, -0.15], R: [1.2, -0.15], lean: 0.3 + 0.02 * Math.sin(t * 1.1 + sd), bob: 0 }),
};

/**
 * Compile a recipe. `amp` is the voice loudness per output frame (0..1, from tools/storytime_amp.py); `vo` its length.
 */
export const compileStory = (recipe: Recipe, words: readonly Word[], vo?: number, amp: readonly number[] = []) => {
  if (recipe.kit !== "storytime") throw new Error(`recipe.kit is "${recipe.kit}", not "storytime"`);
  const at = (a: At | undefined, d: number) => resolveAt(a, words, d);
  const show = new Set(recipe.props?.show ?? []);
  /** the set's extras in this recipe (optional ones only when recipe.props.show lists them) */
  const extrasOf = (id: SetId) => SETS[id].extras.filter((e) => !e.opt || show.has(e.id) || show.has(e.id.replace(/_stage$/, "")) || (e.id.startsWith("hallkid") && show.has("hallkids")));
  for (const id of LEADS) if (!recipe.cast?.[id]) throw new Error(`recipe.cast.${id} is missing (the narrator "me" and "homie")`);
  // ---- lines: who speaks when (a line runs from its first word to its last word's end)
  const spans: { line: number; speaker: CastId; a: number; b: number }[] = [];
  for (const [k, L] of Object.entries(recipe.lines)) {
    if (!LEADS.includes(L.speaker)) throw new Error(`line ${k}: speaker "${L.speaker}" (use "me" or "homie")`);
    const lw = words.filter((w) => w.turn === Number(k));
    if (!lw.length) throw new Error(`line ${k} has no timed words`);
    spans.push({ line: Number(k), speaker: L.speaker, a: lw[0].t, b: lw[lw.length - 1].end });
  }
  spans.sort((a, b) => a.a - b.a);
  for (const w of words) if (!recipe.lines[String(w.turn)]) throw new Error(`timed word "${w.w}" is on line ${w.turn}, which recipe.lines does not have`);
  const speakerAt = (t: number) => spans.find((s) => t >= s.a - 0.06 && t < s.b + 0.12) ?? null;

  // ---- the end: a hard cut to black
  const lastEnd = words.length ? words[words.length - 1].end : 0;
  const endAt = recipe.end ? at(recipe.end.at, lastEnd) : Infinity;
  const total = Math.max(vo ?? lastEnd + 0.6, Number.isFinite(endAt) ? endAt + (recipe.end?.hold ?? 0.5) : 0);
  const duration = Math.ceil(total * FPS - 1e-6);

  // ---- shots
  if (!recipe.shots?.length) throw new Error("recipe.shots is empty");
  let curSet: SetId = recipe.shots[0].set ?? "classroom";
  const shots: ShotR[] = recipe.shots.map((s, i) => {
    if (s.set) { if (!SET_IDS.includes(s.set)) throw new Error(`shot ${i + 1}: set "${s.set}" (sets: ${SET_IDS.join(", ")})`); curSet = s.set; }
    if (!s.cam || !CAM_PRESETS.includes(s.cam.preset)) throw new Error(`shot ${i + 1}: cam.preset "${s.cam?.preset}" (presets: ${CAM_PRESETS.join(", ")})`);
    const a = i === 0 ? 0 : at(s.at, 0);
    const on: CastId = s.cam.preset === "closeup_me" ? "me" : s.cam.preset === "closeup_homie" ? "homie" : s.cam.on ?? "homie";
    if (!LEADS.includes(on)) throw new Error(`shot ${i + 1}: cam.on "${s.cam.on}" (me | homie)`);
    if (s.cam.preset === "windows" && curSet !== "cafeteria") throw new Error(`shot ${i + 1}: cam "windows" is the cafeteria's`);
    if ((s.cam.preset === "wide_class" || s.cam.preset === "crowd") && !SETS[curSet].cams[s.cam.preset]) throw new Error(`shot ${i + 1}: set ${curSet} has no "${s.cam.preset}" camera`);
    if (s.cam.preset === "setcam" && !SETS[curSet].cams[s.cam.name ?? ""]) throw new Error(`shot ${i + 1}: set ${curSet} has no camera "${s.cam.name}" (cameras: ${Object.keys(SETS[curSet].cams).join(", ")})`);
    const fx = (s.fx ?? []).map((f) => ({ fx: f.fx, at: at(f.at, a), gain: (f as { gain?: number }).gain ?? 1, dur: (f as { dur?: number }).dur ?? 0.45, sustain: !!(f as { sustain?: boolean }).sustain }));
    return { i, id: `S${String(i + 1).padStart(2, "0")}`, a, b: 0, set: curSet, spec: s, cam: s.cam, on, fx, hide: new Set<string>(s.hide ?? []), capY: CAP.centre * H };
  });
  shots.forEach((s, i) => { s.b = i + 1 < shots.length ? shots[i + 1].a : Math.min(total, endAt); if (s.b <= s.a) throw new Error(`shot ${s.id} at ${s.a.toFixed(2)} s starts after the next shot (${s.b.toFixed(2)} s): shots must be in time order`); });
  const shotAt = (t: number) => { let s = shots[0]; for (const x of shots) { if (x.a <= t + 1e-9) s = x; else break; } return s; };

  // ---- timelines: faces, poses, looks (line faces at the line start, then shot events)
  const faceEv: Record<CastId, Ev<Expr>[]> = { me: [], homie: [] };
  const poseEv: Record<CastId, Ev<Pose>[]> = { me: [], homie: [] };
  const lookEv: Record<CastId, Ev<string>[]> = { me: [], homie: [] };
  /** background-kid events per set (a set's kids only react to events in shots of that set) */
  const classEv: Partial<Record<SetId, Ev<ClassEv["do"]>[]>> = {};
  for (const sp of spans) {
    const L = recipe.lines[String(sp.line)];
    for (const id of LEADS) { const e = L.faces?.[id]; if (e) { if (!EXPRS.includes(e)) throw new Error(`line ${sp.line}: face "${e}" (faces: ${EXPRS.join(", ")})`); faceEv[id].push({ t: sp.a - 0.08, v: e }); } }
  }
  for (const s of shots) {
    for (const e of s.spec.face ?? []) { const t = at(e.at, s.a); for (const id of LEADS) { const v = e[id]; if (v) { if (!EXPRS.includes(v)) throw new Error(`shot ${s.id}: face "${v}" (faces: ${EXPRS.join(", ")})`); faceEv[id].push({ t, v }); } } }
    for (const e of s.spec.pose ?? []) { const t = at(e.at, s.a); for (const id of LEADS) { const v = e[id]; if (v) { if (!POSES.includes(v)) throw new Error(`shot ${s.id}: pose "${v}" (poses: ${POSES.join(", ")})`); poseEv[id].push({ t, v }); } } }
    for (const e of s.spec.look ?? []) { const t = at(e.at, s.a); for (const id of LEADS) { const v = e[id]; if (v) lookEv[id].push({ t, v }); } }
    for (const e of s.spec.class ?? []) (classEv[s.set] ??= []).push({ t: at(e.at, s.a), v: e.do });
  }
  const byT = <T,>(a: Ev<T>, b: Ev<T>) => a.t - b.t;
  for (const id of LEADS) { faceEv[id].sort(byT); poseEv[id].sort(byT); lookEv[id].sort(byT); }
  for (const k of Object.keys(classEv) as SetId[]) classEv[k]!.sort(byT);
  // adult extras: face / skin / pose timelines per id
  const adultEv = new Map<string, { face: Ev<Expr>[]; skin: Ev<string>[]; pose: Ev<Pose>[] }>();
  for (const s of shots) for (const e of (s.spec.adult ?? []) as AdultEv[]) {
    const t = at(e.at, s.a);
    if (!adultEv.has(e.id)) adultEv.set(e.id, { face: [], skin: [], pose: [] });
    const A = adultEv.get(e.id)!;
    if (e.face) { if (!EXPRS.includes(e.face)) throw new Error(`shot ${s.id}: adult face "${e.face}"`); A.face.push({ t, v: e.face }); }
    if (e.skin) A.skin.push({ t, v: e.skin });
    if (e.pose) { if (!POSES.includes(e.pose)) throw new Error(`shot ${s.id}: adult pose "${e.pose}"`); A.pose.push({ t, v: e.pose }); }
  }
  for (const A of adultEv.values()) { A.face.sort(byT); A.skin.sort(byT); A.pose.sort(byT); }
  // the soundboard presses, the nugget
  const presses = (recipe.props?.presses ?? []).map((p) => at(p, 0)).sort((a, b) => a - b);
  const phoneAt = (t: number) => {
    let last = -Infinity, next = Infinity;
    for (const p of presses) { if (p <= t + 1e-9) last = p; else { next = p; break; } }
    return { app: recipe.props?.phone ?? "clips", age: t - last, next: next - t };
  };
  const fr = recipe.props?.fair;
  const fair = fr ? { gone: at(fr.gone, 0), ribbon: fr.ribbon !== undefined ? at(fr.ribbon, 0) : Infinity, ribbonText: fr.ribbonText ?? "1ST PLACE", poster: fr.poster ?? "OUR CRYSTAL" } : null;
  const slideEvs = (recipe.props?.slides ?? []).map((s) => ({ t: at(s.at, 0), kind: s.kind, text: s.text ?? "" })).sort((a, b) => a.t - b.t);
  const slideAt = (t: number) => { let s: (typeof slideEvs)[number] | null = null; for (const x of slideEvs) if (x.t <= t + 1e-9) s = x; return s; };
  const tr = recipe.props?.tray;
  const tray = tr ? { owner: tr.owner, drop: at(tr.drop, 0), take: at(tr.take, 0) } : null;

  // ---- the mouth: voice loudness while this kid's line plays (attack fast, release a little slower)
  void amp; // the voice loudness is kept in the recipe build but no longer drives the mouths
  // LOW-POLY: no lip-sync, mouths never move ("talking" = the camera on the speaker + the caption)
  const mouthOf = (_id: CastId, _t: number) => 0;
  // ---- body beats: every word the kid speaks lands a small hit (a nod, a lean, an arm chop on alternate sides);
  // emphasised words (shout lines, ALL-CAPS words, the line's accent words) hit full, the rest about half
  const beats: Record<CastId, { t: number; k: number; side: number }[]> = { me: [], homie: [] };
  for (const [k, L] of Object.entries(recipe.lines)) {
    const acc = new Set((L.accent ?? []).map(normW));
    words.filter((w) => w.turn === Number(k)).forEach((w, i) => {
      const caps = /[A-Z]{2,}/.test(w.w) && w.w === w.w.toUpperCase();
      beats[L.speaker].push({ t: w.t, k: L.shout || caps ? 1 : acc.has(normW(w.w)) ? 0.8 : 0.5, side: i % 2 ? 1 : -1 });
    });
  }
  for (const id of LEADS) beats[id].sort((a, b) => a.t - b.t);
  const beatAt = (id: CastId, t: number) => {
    let v = 0, side = 1;
    for (const b of beats[id]) {
      const dt = t - b.t;
      if (dt < 0) break;
      if (dt > 0.7) continue;
      const e = b.k * Math.exp(-dt / 0.17) * clamp(dt / 0.05);
      if (e > v) { v = e; side = b.side; }
    }
    return { v: t < endAt ? v : 0, side };
  };

  // ---- one kid at t
  const blinkAt = (t: number, seed: number) => {
    const per = 2.6 + 1.6 * hash(seed);
    const ph = ((t + hash(seed * 3) * per) % per) / per;
    return ph < 0.045 ? 1 : 0;
  };
  /** a lead's mark in a set (recipe.props.marks overrides the set's) */
  const markOf = (setId: SetId, id: CastId): Mark => (recipe.props?.marks?.[setId]?.[id] as Mark | undefined) ?? SETS[setId].marks[id];
  const leadAt = (id: CastId, t: number, setId: SetId): FigState => {
    const m: Mark = markOf(setId, id);
    const spec = recipe.cast[id];
    const s = spec.height ?? 1;
    const seed = id === "me" ? 3 : 7;
    // face (blend 0.14 s)
    const fv = valueAt(faceEv[id], t, "neutral" as Expr);
    // replacement animation: the face SNAPS to its expression (no morph); the mouth is one of 6 sculpted openings
    let face = { ...FACES[fv.v] };
    const talking = !!speakerAt(t) && speakerAt(t)!.speaker === id && t < endAt;
    const mo = mouthOf(id, t);
    // LOW-POLY: no lip-sync (mo is always 0); a shout expression shows a STATIC open-mouth decal (it never animates)
    void mo;
    if (face.arc < 0.5 && blinkAt(t, seed)) face = { ...face, lid: 1 };
    // side-eye looks toward the other lead
    const other = markOf(setId, id === "me" ? "homie" : "me");
    const side = Math.sign(dot(sub([other.x, 0, other.z], [m.x, 0, m.z]), leftOf(m.yaw))) || 1;
    face = { ...face, px: face.px * side, browAsym: face.browAsym * (fv.v === "sideeye" ? side : 1) };
    // pose
    const pv = valueAt(poseEv[id], t, "idle" as Pose);
    const pose = pv.v;
    const bt = beatAt(id, t);
    const pt = t - pv.t0;
    const P = POSE_ARMS[pose](t, seed, mo, bt.v, pt);
    const Pp = POSE_ARMS[pv.prev](t, seed, mo, bt.v, pt);
    const u = ease((t - pv.t0) / 0.22);
    // shout lean: a scream pushes the head forward
    const exprLean = fv.v === "scream" || fv.v === "yell" ? 0.06 : fv.v === "shocked" ? -0.05 : 0;
    // look: head turns toward the other lead (up to 0.75 rad), the body follows a little
    const lv = valueAt(lookEv[id], t, "front");
    const yawTo = (target: string) => {
      if (target === "front") return 0;
      const o = markOf(setId, target as CastId);
      if (!o) return 0;
      let d = Math.atan2(o.x - m.x, o.z - m.z) - m.yaw;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      return clamp(d, -1.15, 1.15);
    };
    // the beat on idle / talk / yell / lean poses: one forearm chops forward on alternate words; poses that move
    // with the beat themselves (pump, shrug, slam, point) take it whole; the phone pose keeps its hands still
    const chop = P.ownBeat || pose === "phone" || pose === "raise" || pose === "laugh" ? 0 : bt.v;
    const armBeat = (sd: number) => (bt.side === sd ? 0.32 * chop : 0.06 * chop);
    const elbowBeat = (sd: number) => (bt.side === sd ? 0.55 * chop : 0);
    const nod = bt.v * (pose === "phone" ? 0.3 : 1);
    const lu = ease((t - lv.t0) / 0.35);
    const turn = lerp(yawTo(lv.prev), yawTo(lv.v), lu);
    const bodyTurn = turn * 0.45;
    return {
      id, lead: true, spec, x: m.x, z: m.z, yaw: m.yaw + bodyTurn, headYaw: turn - bodyTurn + 0.012 * Math.sin(t * 0.5 + seed), headPitch: 0.006 * Math.sin(t * 0.6 + seed) + (pose === "phone" ? 0.22 : 0) + 0.12 * nod,
      sit: m.sit, s, lean: lerp(Pp.lean, P.lean, u) + exprLean + 0.03 * nod, bob: lerp(Pp.bob, P.bob, u) + (m.sit ? 0 : 0.006 * nod), tilt: 0.01 * Math.sin(t * 0.4 + seed) + 0.05 * nod * bt.side + (fv.v === "sideeye" ? 0.06 * side : 0) + (fv.v === "smug" ? -0.07 : 0),
      armL: [lerp(Pp.L[0], P.L[0], u) + armBeat(1), lerp(Pp.L[1], P.L[1], u)], armR: [lerp(Pp.R[0], P.R[0], u) + armBeat(-1), lerp(Pp.R[1], P.R[1], u)],
      elbow: [lerp(Pp.E?.[0] ?? 0.12, P.E?.[0] ?? 0.12, u) + elbowBeat(1), lerp(Pp.E?.[1] ?? 0.12, P.E?.[1] ?? 0.12, u) + elbowBeat(-1)],
      pose, expr: fv.v, face, mouth: mo, talking, seed, y: m.y ?? 0, poseT: pt,
    };
  };
  const adultAt = (e: Extra, t: number): FigState => {
    const A = adultEv.get(e.id.replace(/_stage$/, ""));
    const fv = A ? valueAt(A.face, t, "neutral" as Expr) : { v: "neutral" as Expr };
    const skin = A ? valueAt(A.skin, t, e.spec.skin).v : e.spec.skin;
    const pv = A ? valueAt(A.pose, t, "idle" as Pose) : { v: "idle" as Pose, prev: "idle" as Pose, t0: -99 };
    let face = { ...FACES[fv.v] };
    if (fv.v !== "yell" && fv.v !== "scream") face = { ...face, open: 0, teeth: 0 };
    if (face.arc < 0.5 && blinkAt(t, e.seed + 5)) face = { ...face, lid: 1 };
    const P = POSE_ARMS[pv.v](t, e.seed, 0, 0, t - pv.t0);
    return { id: e.id, lead: false, spec: skin === e.spec.skin ? e.spec : { ...e.spec, skin }, x: e.x, z: e.z, y: e.y ?? 0, yaw: e.yaw, headYaw: 0.04 * Math.sin(t * 0.5 + e.seed), headPitch: 0.04,
      sit: e.sit, s: e.s ?? 1, lean: P.lean + (fv.v === "furious" || fv.v === "yell" ? 0.05 : 0), bob: P.bob, tilt: 0.01 * Math.sin(t * 0.4 + e.seed), armL: P.L, armR: P.R, elbow: P.E,
      pose: pv.v, expr: fv.v, face, mouth: 0, talking: false, seed: e.seed, poseT: t - pv.t0 };
  };
  const extraAt = (e: Extra, t: number, setId: SetId): FigState => {
    if (e.spec.adult) return adultAt(e, t);
    const cv = valueAt(classEv[setId] ?? [], t, "front" as ClassEv["do"]);
    // "turn": swivel round to face the back row (staggered per kid); "laugh": turned AND laughing; "front": back again
    const turned = (v: ClassEv["do"]) => (v === "front" || v === "bow" ? 0 : 1);
    const stag = 0.12 * hash(e.seed * 5);
    const tu = ease((t - cv.t0 - stag) / 0.4);
    const turnAmt = lerp(turned(cv.prev), turned(cv.v), tu);
    const laughing = (cv.v === "laugh" || cv.v === "cheer") && t >= cv.t0 + stag;
    const cheering = cv.v === "cheer" && t >= cv.t0 + stag, bowing = cv.v === "bow" && t >= cv.t0 + stag;
    const f0 = laughing ? FACES.laughing : FACES.neutral;
    let face = { ...f0, open: 0, teeth: 0 }; // LOW-POLY: static mouth bars
    if (!laughing && blinkAt(t, e.seed + 11)) face = { ...face, lid: 1 };
    const P = cheering ? { L: [2.55 + 0.12 * Math.sin(t * 9 + e.seed), 0.35] as [number, number], R: [2.55 + 0.12 * Math.sin(t * 9 + e.seed + 1.5), 0.35] as [number, number], lean: -0.05, bob: 0.02 * Math.abs(Math.sin(t * 9 + e.seed)) }
      : POSE_ARMS[bowing ? "bow" : laughing ? "laugh" : "idle"](t, e.seed * 1.7, 0, 0, t - cv.t0 - stag);
    // turn round toward the leads (in the classroom, the back row) with the body; the head does the rest
    const yaw = e.yaw + turnAmt * (Math.PI - 0.25 * Math.sign(e.x || 1) * (1 - Math.abs(e.x) / 3));
    return { id: e.id, lead: false, spec: e.spec, x: e.x, z: e.z, y: e.y ?? 0, yaw, headYaw: 0.05 * Math.sin(t * 0.6 + e.seed), sit: e.sit, s: (e.s ?? 1) * (e.spec.height ?? 1) * 0.92,
      lean: P.lean, bob: P.bob, tilt: laughing && !cheering ? 0.08 * Math.sin(t * 7 + e.seed) : 0, armL: P.L, armR: P.R, pose: bowing ? "bow" : laughing ? "laugh" : "idle", expr: laughing ? "laughing" : "neutral", headPitch: bowing ? 0.35 : 0, face, mouth: 0, talking: false, seed: e.seed };
  };
  /** STOP MOTION: characters and props move on twos (a new pose every 2 output frames = 15 fps inside 30 fps) */
  const onTwos = (t: number) => t; // LOW-POLY: smooth (the clay look moved on twos)
  const figsAt = (t0: number, shot?: ShotR): FigState[] => {
    const s = shot ?? shotAt(t0);
    const t = Math.max(s.a, onTwos(t0));
    return [...LEADS.filter((id) => !s.hide.has(id)).map((id) => leadAt(id, t, s.set)), ...extrasOf(s.set).filter((e) => !s.hide.has(e.id)).map((e) => extraAt(e, t, s.set))];
  };

  // ---- cameras
  const shakeAt = (s: ShotR, t: number) => {
    let g = 0;
    for (const f of s.fx) if (f.fx === "shake" && t >= f.at) {
      const u = (t - f.at) / f.dur;
      if (u > 1) continue;
      g += f.gain * (f.sustain ? (u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15) : Math.pow(1 - u, 1.6));
    }
    return g;
  };
  const punchAt = (s: ShotR, t: number) => { let k = 0; for (const f of s.fx) if (f.fx === "punch" && t >= f.at) k += f.gain * Math.exp(-(t - f.at) / 0.16) * clamp((t - f.at) / 0.04); return k; };
  const faceDir = (st: FigState) => st.yaw + st.headYaw;
  const camBase = (s: ShotR, t: number): CamS => {
    const S = SETS[s.set], c = s.cam;
    const u = clamp((t - s.a) / Math.max(0.5, s.b - s.a));
    const tr = Math.min(s.a + 0.55, s.b - 0.01);
    const figsR = [leadAt("me", tr, s.set), leadAt("homie", tr, s.set)];
    const byId = (id: CastId) => figsR.find((f) => f.id === id)!;
    const faceFrac = c.face ?? (c.preset === "two_shot" ? 0.4 : c.preset === "punch_in" ? 0.32 : c.preset === "ots" ? 0.32 : 0.3);
    const aim = (pos: V3, target: V3, fov: number): CamS => {
      const d = Math.hypot(target[0] - pos[0], target[2] - pos[2]);
      const off = (0.5 - faceFrac) * 2 * d * Math.tan((fov * Math.PI) / 360);
      return { pos, look: [target[0], target[1] - off, target[2]], fov, roll: c.roll ?? 0 };
    };
    const drift = (c.push ?? 0.06) * u; // every shot keeps pushing in a little: no frame is static
    switch (c.preset) {
      case "closeup": case "closeup_me": case "closeup_homie": case "punch_in": {
        const st = byId(s.on), F = headCenter(st);
        const punch = c.preset === "punch_in";
        // a punch-in slams from 1.5x out to its distance in 0.16 s; never closer than PUNCH_MIN (the head stays whole)
        const intro = 1; // LOW-POLY: hard cuts only, no slam-in
        const d = Math.max(c.tight ? 2.2 : punch ? PUNCH_MIN : CLOSE_MIN, (punch ? 2.5 : 3.05) * (c.dist ?? 1)) * intro * (1 - drift * (punch ? 0.5 : 1));
        // the other lead must not stand between the lens and this face: swing the angle away until clear
        const O = headCenter(byId(s.on === "me" ? "homie" : "me"));
        const clear = (az: number) => {
          const y = faceDir(st) + az * (Math.PI / 180), P: V3 = [F[0] + Math.sin(y) * d, F[1], F[2] + Math.cos(y) * d];
          const v = sub(P, F), L = Math.hypot(...v), k = clamp(dot(sub(O, F), v) / (L * L));
          if (k > 0.02 && Math.hypot(...sub(O, add(F, mul(v, k)))) < 0.62) return false;
          // ... nor its shoulders / torso (an out-of-focus blob at the frame's lower edge)
          const T: V3 = [O[0], O[1] - 0.42, O[2]], kt = clamp(dot(sub(T, F), v) / (L * L));
          return !(kt > 0.02 && Math.hypot(...sub(T, add(F, mul(v, kt)))) < 0.6);
        };
        let az0 = c.az ?? 0;
        if (!clear(az0)) { for (let k = 5; k <= 70; k += 5) { if (clear(az0 + k * (az0 >= 0 ? 1 : -1))) { az0 += k * (az0 >= 0 ? 1 : -1); break; } if (clear(az0 - k * (az0 >= 0 ? 1 : -1))) { az0 -= k * (az0 >= 0 ? 1 : -1); break; } } }
        const dy = faceDir(st) + (az0 + 2.5 * u) * (Math.PI / 180);
        const pos: V3 = [F[0] + Math.sin(dy) * d, F[1] + (c.h ?? 0.06), F[2] + Math.cos(dy) * d];
        return aim(pos, F, 34);
      }
      case "two_shot": {
        const A = headCenter(byId("me")), B = headCenter(byId("homie"));
        const M = mul(add(A, B), 0.5);
        const yaw = S.twoYaw + ((c.az ?? 0) + 3 * u) * (Math.PI / 180);
        const dir = fwd(yaw), right = norm(cross(mul(dir, -1), [0, 1, 0]));
        const spread = Math.abs(dot(sub(A, B), right)) + 0.75;
        const th = Math.tan((40 * Math.PI) / 360) * (W / H);
        const d = Math.max(2.4, spread / 2 / (th * 0.86)) * (c.dist ?? 1) * (1 - drift * 0.7);
        const pos: V3 = [M[0] + dir[0] * d, M[1] + 0.12 + (c.h ?? 0), M[2] + dir[2] * d];
        return aim(pos, M, 40);
      }
      case "ots": {
        const B = headCenter(byId(s.on)), A = headCenter(byId(s.on === "me" ? "homie" : "me"));
        const dBA = norm([A[0] - B[0], 0, A[2] - B[2]]);
        const perp: V3 = [dBA[2], 0, -dBA[0]];
        const sd = (c.az ?? 1) >= 0 ? 1 : -1;
        const pos = add(add(A, mul(dBA, 1.25 * (c.dist ?? 1) * (1 - drift * 0.5))), add(mul(perp, 0.85 * sd), [0, 0.1 + (c.h ?? 0), 0]));
        return aim(pos, B, 32);
      }
      case "pov_phone": {
        // FIRST PERSON: my eyes (me is hidden) looking at the homie's phone held up in front of me; the homie behind it
        const E = headCenter(byId("me")), Hh = headCenter(byId("homie"));
        const tgt: V3 = [lerp(E[0], Hh[0], 0.55), Hh[1] - 0.16, lerp(E[2], Hh[2], 0.55) - 0.25];
        const pos: V3 = add(E, [0, 0.03, 0]);
        const dir = norm(sub(tgt, pos));
        return { pos: add(pos, mul(dir, 0.04 * u)), look: tgt, fov: 40, roll: c.roll ?? 3 };
      }
      case "pov_press": {
        // FIRST PERSON (the homie's eyes): looking down at his soundboard phone held at his chest
        const ho = byId("homie"), E = headCenter(ho), f = fwd(ho.yaw);
        const pos: V3 = add(E, add(mul(f, 0.05), [0, 0.02, 0]));
        const look: V3 = add(E, add(mul(f, 0.6), [0, -0.5 + 0.02 * u, 0]));
        return { pos, look, fov: 46, roll: c.roll ?? 2 };
      }
      case "pov_tray": {
        // FIRST PERSON: the eyes of cam.on (default me) looking down at his lunch tray (his hands on its edges), the other across
        const eyes: CastId = c.on ?? "me";
        const me = byId(eyes), E = headCenter(me), f = fwd(me.yaw);
        const pos: V3 = add(E, add(mul(f, 0.04), [0, 0.1, 0]));
        const Hh = headCenter(byId(eyes === "me" ? "homie" : "me"));
        if (recipe.props?.tray?.owner === eyes) {
          // the nugget beat: straight down at his own (empty) tray, the other kid's chest at the top of the frame
          const T: V3 = eyes === "homie" ? [0.05, 0.675, -0.22] : [-0.05, 0.675, 0.24];
          return { pos, look: [lerp(T[0], Hh[0], 0.12), T[1] + 0.02 * u, lerp(T[2], Hh[2], 0.12)], fov: 50, roll: c.roll ?? -2 };
        }
        const look: V3 = [lerp(E[0], Hh[0], 0.8), Hh[1] - 0.3 + 0.03 * u, lerp(E[2], Hh[2], 0.8)];
        return { pos, look, fov: 50, roll: c.roll ?? -2 };
      }
      case "insert": {
        const st = byId("homie"), F = headCenter(st), f = fwd(st.yaw), l = leftOf(st.yaw);
        const ph = add(add(F, mul(f, 0.44)), [0, -0.36, 0]);
        const pos = add(add(F, add(mul(f, 0.34 + 0.04 * u), mul(l, 0.16))), [0, 0.02, 0]);
        return { pos, look: ph, fov: 44 - 4 * u, roll: c.roll ?? -4 };
      }
      default: {
        const sc = S.cams[c.preset === "setcam" ? c.name! : c.preset]!;
        const k = 1 - 0.05 * u;
        const pos = add(sc.look, mul(sub(sc.pos, sc.look), k));
        return { pos: add(pos, [0.08 * u, 0, 0]), look: sc.look, fov: sc.fov, roll: c.roll ?? 0 };
      }
    }
  };
  const camIn = (s: ShotR, t: number): CamS => {
    const c = camBase(s, t), B = SETS[s.set].bounds;
    return { ...c, pos: [clamp(c.pos[0], B[0][0], B[0][1]), clamp(c.pos[1], B[1][0], B[1][1]), clamp(c.pos[2], B[2][0], B[2][1])] };
  };
  const camAt = (t: number): CamS => {
    const s = shotAt(t);
    const c = camIn(s, Math.min(Math.max(t, s.a), s.b));
    const g = 0 * shakeAt(s, t), pk = 0 * punchAt(s, t); // LOW-POLY: no shakes, no punch zooms
    if (g <= 0 && pk <= 0) return c;
    const f = norm(sub(c.look, c.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
    const n1 = Math.sin(t * 71.3) + 0.6 * Math.sin(t * 113.7 + 1.3), n2 = Math.sin(t * 83.9 + 2.1) + 0.6 * Math.sin(t * 131.1 + 0.4), n3 = Math.sin(t * 59.7 + 4.2);
    const dist = Math.hypot(...sub(c.look, c.pos));
    const k = 0.007 * dist * Math.min(g, 1.4);
    const off = add(mul(r, n1 * k), mul(u, n2 * k * 0.8));
    return { pos: add(c.pos, off), look: add(c.look, mul(off, 0.35)), fov: c.fov * (1 - 0.12 * pk), roll: (c.roll ?? 0) + 2.2 * g * n3 };
  };

  for (const s of shots) if (/^pov_/.test(s.cam.preset)) s.hide.add(s.cam.preset === "pov_press" ? "homie" : s.cam.preset === "pov_tray" ? (s.cam.on ?? "me") : "me"); // the camera IS their eyes
  for (const s of shots) if (s.cam.preset === "windows") { s.hide.add("me"); s.hide.add("homie"); } // the cracked windows alone
  /** POV rig for the film: what is held in front of the lens, and on which side the homie sits */
  const povOf = (s: ShotR) => {
    if (!/^pov_/.test(s.cam.preset)) return null;
    const me = leadAt("me", s.a, s.set), ho = leadAt("homie", s.a, s.set);
    const right = norm(cross(fwd(me.yaw), [0, 1, 0]));
    const eyes: CastId = s.cam.preset === "pov_press" ? "homie" : s.cam.preset === "pov_tray" ? (s.cam.on ?? "me") : "me";
    return { kind: s.cam.preset as "pov_phone" | "pov_tray" | "pov_press", homieSide: Math.sign(dot(sub(headCenter(ho), headCenter(me)), right)) || 1, me: me.spec, homie: ho.spec, eyes: eyes === "me" ? me.spec : ho.spec };
  };
  // ---- extras that would block the subject are cheated out of the shot (a film-set cheat)
  for (const s of shots) {
    if (s.cam.preset === "wide_class" || s.cam.preset === "crowd" || s.cam.preset === "setcam") continue;
    const tm = (s.a + s.b) / 2, cam = camIn(s, tm);
    const subj = s.cam.preset === "windows" ? cam.look : s.cam.preset === "two_shot" ? mul(add(headCenter(leadAt("me", tm, s.set)), headCenter(leadAt("homie", tm, s.set))), 0.5) : headCenter(leadAt(s.on, tm, s.set));
    const dS = Math.hypot(...sub(subj, cam.pos));
    for (const e of extrasOf(s.set)) {
      const st = extraAt(e, tm, s.set), hc = headCenter(st);
      for (const p of [hc, [st.x, 0.7, st.z] as V3]) {
        const q = project(cam, p);
        const near = Math.hypot(...sub(p, cam.pos)) < 0.9;
        if (near || (q && q.z < dS - 0.35 && q.x > -250 && q.x < W + 250 && q.y > -300 && q.y < H + 300)) s.hide.add(e.id);
      }
    }
    // a face close-up / punch-in: the other lead between the lens and the subject (an out-of-focus shoulder or arm
    // blob at the frame edge) is cheated out too; OTS shots keep their foreground shoulder on purpose
    if (/closeup|punch_in/.test(s.cam.preset)) {
      const oid: CastId = s.on === "me" ? "homie" : "me";
      for (const tt of [s.a + 1e-3, tm, s.b - 1e-3]) {
        const c2 = camIn(s, tt), o = leadAt(oid, tt, s.set), d2 = Math.hypot(...sub(headCenter(leadAt(s.on, tt, s.set)), c2.pos));
        for (const p of [headCenter(o), [o.x, 0.75, o.z] as V3, [o.x, 1.0, o.z] as V3]) {
          const q = project(c2, p);
          if (q && q.z < d2 - 0.3 && q.x > -800 && q.x < W + 800 && q.y > -300 && q.y < H + 400) s.hide.add(oid); // its arms reach ~0.5 m in
        }
      }
    }
  }

  // ---- captions: chunks, and each shot's caption centre (below every named face + neck on screen)
  const chunks = recipe.captions === "off" ? [] : buildChunks(words, recipe.lines);
  // one chunk on screen at a time: a chunk's linger ends where the next one comes in (capAt shows from start - 0.04)
  { const cs = [...chunks].sort((a, b) => a.start - b.start); for (let i = 0; i + 1 < cs.length; i++) cs[i].hold = Math.min(cs[i].hold, cs[i + 1].start - 0.04); }
  const named = (s: ShotR): CastId[] => (s.cam.preset === "two_shot" ? (["me", "homie"] as CastId[]).filter((id) => !s.hide.has(id)) : s.cam.preset === "wide_class" || s.cam.preset === "crowd" || s.cam.preset === "insert" || s.cam.preset === "setcam" || /^pov_/.test(s.cam.preset) ? [] : s.cam.preset === "windows" ? [] : [s.on]);
  const neckBottom = (cam: CamS, st: FigState) => {
    const b = kidBoxes(st).face;
    const drop = 0.3 * 2 * b.h[1];
    let y1 = -Infinity;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const q = project(cam, [b.c[0] + sx * b.h[0], b.c[1] - b.h[1] - drop, b.c[2] + sz * b.h[2]]); if (q) y1 = Math.max(y1, q.y); }
    return y1;
  };
  for (const s of shots) {
    let need = 0;
    for (let t = s.a; t < s.b; t += 1 / FPS) {
      const cam = camIn(s, t); // this shot's own camera (camAt(t) can pick the next shot at a float boundary)
      for (const id of named(s)) need = Math.max(need, neckBottom(cam, leadAt(id, t, s.set)));
    }
    const maxFs = CAP.fsShout * CAP.lineH;
    s.capY = Math.min(CAP.maxY * H, Math.max(CAP.centre * H, need + 22 + maxFs / 2 + CAP.stroke));
  }
  // ONE caption baseline for the whole film: the lowest any shot needs (lower only ever clears more of a face/neck)
  const capNeed = shots.map((s) => ({ id: s.id, preset: s.cam.preset, y: Math.round(s.capY) }));
  // the cold open (the shots in the first set, before the story's first set change) is its own scene: it may need a
  // lower line for its chest-up shout close-ups; everything after it shares ONE baseline
  const firstSet = shots[0].set, k0 = shots.findIndex((s) => s.set !== firstSet);
  const cold = k0 > 0 ? shots.slice(0, k0) : [], rest = k0 > 0 ? shots.slice(k0) : shots;
  const base = (ss: ShotR[]) => Math.max(CAP.centre * H, ...ss.map((s) => s.capY));
  if (cold.length) { const b0 = base(cold); for (const s of cold) s.capY = b0; }
  const capBase = base(rest);
  for (const s of rest) s.capY = capBase;
  const capAt = (t: number) => {
    if (t >= endAt) return null;
    const c = chunks.find((k) => t >= k.start - 0.04 && t < k.hold);
    if (!c) return null;
    return { chunk: c, y: shotAt(t).capY };
  };

  // ---- fx state at t
  const fxAt = (t: number) => {
    const s = shotAt(t);
    const flash = 0 * s.fx.filter((f) => f.fx === "flash" || f.fx === "shatter").reduce((o, f) => Math.max(o, t >= f.at ? clamp(1 - (t - f.at) / 0.12) * (f.fx === "shatter" ? 0.7 : 0.85) : 0), 0);
    const sh = s.fx.find((f) => f.fx === "shatter");
    return { flash, shatter: sh ? t - sh.at : null, shatterAt: sh?.at ?? null, black: t >= endAt, shake: shakeAt(s, t) };
  };
  // shards: the shatter state per shot (windows broken from this time on, in this set and later shots)
  const brokenFrom = shots.flatMap((s) => s.fx.filter((f) => f.fx === "shatter").map((f) => f.at)).sort((a, b) => a - b)[0] ?? Infinity;

  return {
    recipe, words, amp, layout: { W, H }, duration, total, endAt, shots, shotAt, camAt, camBase, figsAt, leadAt, extraAt, capAt, chunks, fxAt, speakerAt, spans,
    brokenFrom, named, mouthOf, onTwos, povOf, capNeed, phoneAt, tray, extrasOf, fair, slideAt,
  };
};

export const setOf = (id: SetId): SetLayout => SETS[id];

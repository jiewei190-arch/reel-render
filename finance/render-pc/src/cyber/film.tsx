// CyberFilm: renders a compiled cyber3d recipe. One View through the engine's post chain (dark moods, strong bloom on
// the neon), the set, the hooded figure, BOLT (optional, lit by the same dark rig), cutaway objects and kit props;
// then the DOM HUD: labels, boards, story devices, the hook, captions, the glitch and the alert wash.
// Plain 30 fps (no motion-blur sub-frames: the owner's call for this kit).
import { useThree } from "@react-three/fiber";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import { Bolt } from "../tech/bolt";
import { CutawayObject } from "../tech/cutaway";
import type { CyberCompiled, FxR, PropR } from "./compile";
import { FPS } from "./compile";
import { Figure, figureRig } from "./figure";
import { CyberHero } from "./hero";
import { AlertWash, Boards, CyberCaptions, CyberHook, Devices, GlitchBars, LabelLayer, cyberChunks } from "./hud";
import { CP, CYBER_MOODS } from "./palette";
import { chapterAt, ChapterCard, chunkWords, LF, LowerThirdCaptions } from "../longform/kit";
import type { CapChunk } from "../longform/kit";
import { CITIES, CYBER_SETS, emailTex, geo, neon, pinTop, StringLine } from "./sets";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const ClipOn: React.FC = () => { const { gl } = useThree(); gl.localClippingEnabled = true; return null; };
const OCTA = () => geoOf("cfOcta", () => new THREE.OctahedronGeometry(1, 0));
const PLANE = () => geoOf("cfPlane", () => new THREE.PlaneGeometry(1, 1));

/** a route arc: lifted quadratic bezier from a to b */
export const arcAt = (a: V3, b: V3, u: number): V3 => {
  const d = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const m: V3 = [(a[0] + b[0]) / 2, 0.4 + 0.2 * d, (a[2] + b[2]) / 2];
  const w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u;
  return [w0 * a[0] + w1 * m[0] + w2 * b[0], w0 * a[1] + w1 * m[1] + w2 * b[1] + 0.06, w0 * a[2] + w1 * m[2] + w2 * b[2]];
};

const KitView: React.FC<{ pr: PropR; c: CyberCompiled; t: number }> = ({ pr, c, t }) => {
  const pl = c.placeOf(pr, t);
  const sp = pr.spec;
  if (pr.show(t) <= 0) return null;
  switch (sp.kit) {
    case "figure": return <Figure p={pl.p} yaw={pl.yaw} s={pl.s} rig={figureRig(pr.fig!, t)} t={t} />;
    case "route": {
      const a = geo(...CITIES[sp.from!]);
      const col = sp.color ?? CP.magenta;
      return (
        <>
          {(sp.to ?? []).map((dest, k) => {
            const b = geo(...CITIES[dest]);
            const t0 = pr.hit + k * 0.18;
            const draw = clamp((t - t0) / 0.55);
            if (draw <= 0) return null;
            const N = 26;
            return (
              <group key={dest}>
                {Array.from({ length: N }, (_, j) => { const u = j / (N - 1); if (u > draw) return null; return <mesh key={j} geometry={OCTA()} material={neon(col, 0.7)} position={arcAt(a, b, u)} scale={0.035} />; })}
                {draw >= 1 ? [0, 1, 2].map((j) => { const u = ((t - t0 - 0.55) * 0.7 + j / 3) % 1; return (
                  <group key={`p${j}`}>
                    <mesh geometry={OCTA()} material={neon(CP.white, 1)} position={arcAt(a, b, u)} scale={0.1} rotation={[t * 3, t * 2, 0]} />
                    {[0.02, 0.04, 0.06].map((du, q) => (u - du > 0 ? <mesh key={q} geometry={OCTA()} material={neon(col, 0.6 - q * 0.17)} position={arcAt(a, b, u - du)} scale={0.075 - q * 0.015} /> : null))}
                  </group>
                ); }) : null}
                {/* arrival ring at the destination (one slow pulse per packet) */}
                {draw >= 1 ? <mesh geometry={geoOf("cfRing", () => new THREE.TorusGeometry(1, 0.05, 4, 28))} material={neon(col, 0.8 * (1 - ((t - t0) * 0.7 % 1)))} rotation={[Math.PI / 2, 0, 0]} position={[b[0], 0.05, b[2]]} scale={0.12 + 0.35 * ((t - t0) * 0.7 % 1)} /> : null}
              </group>
            );
          })}
        </>
      );
    }
    case "email": {
      const phishOn = !!sp.phish && t >= pr.hit - 0.05;
      const pulse = 0.5 + 0.5 * Math.sin((t - pr.hit) * 3.2);
      return (
        <group position={pl.p} rotation={[0, pl.yaw, 0]} scale={pl.s}>
          {phishOn ? <mesh geometry={PLANE()} material={neon(CP.red, 0.35 + 0.25 * pulse)} position={[0, 0, -0.01]} scale={[1.12, 0.48, 1]} /> : null}
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, emailTex(sp.text ?? "Invoice", phishOn))} scale={[1.0, 0.36, 1]} />
          {phishOn ? <pointLight position={[0, 0, 0.4]} color={CP.red} intensity={1.2 + 0.6 * pulse} distance={2.5} decay={2} /> : null}
        </group>
      );
    }
    case "string": {
      const u = clamp((t - pr.hit) / 0.5);
      return u > 0 ? <StringLine a={pinTop(sp.from!)} b={pinTop(sp.to![0])} u={u} t={t} /> : null;
    }
    case "signal":
      return (
        <group position={pl.p} rotation={[Math.PI / 2, 0, 0]} scale={pl.s}>
          {[0, 1, 2].map((k) => { const u = (t * 0.8 + k / 3) % 1; return <mesh key={k} geometry={geoOf("cfSig", () => new THREE.TorusGeometry(1, 0.04, 6, 32))} material={neon(sp.color ?? CP.cyan, 0.85 * (1 - u))} scale={0.2 + 1.2 * u} />; })}
        </group>
      );
    case "phone": case "laptop": case "envelope": case "card": case "usb": case "server": case "atm": case "padlock": case "coin": case "doc":
      return <group position={pl.p} rotation={[0, pl.yaw, 0]} scale={pl.s}><CyberHero kind={sp.kit} color={sp.color} label={sp.label} lines={sp.lines} t={t} seed={7 + pr.key.length * 13 + pr.key.charCodeAt(0)} /></group>;
    case "block": {
      const z = sp.size ?? [0.5, 0.5, 0.5];
      return <mesh geometry={geoOf(`cfBlk${z.join(",")}`, () => new THREE.BoxGeometry(...z))} material={plastic(CP.steel, { flat: true, emissive: sp.color ?? CP.cyan, ei: 0.35 })} position={[pl.p[0], pl.p[1] + (z[1] * pl.s) / 2, pl.p[2]]} rotation={[0, pl.yaw, 0]} scale={pl.s} castShadow />;
    }
    default: return null;
  }
};
const Sparks: React.FC<{ f: FxR; t: number }> = ({ f, t }) => {
  const u = (t - f.at) / 0.8;
  if (u < 0 || u > 1) return null;
  const p = f.p(f.at);
  return (
    <>
      {Array.from({ length: 18 }, (_, k) => {
        const a = hash(k + 1) * Math.PI * 2, e = 0.3 + hash(k + 5), sp = 1 + 1.4 * hash(k + 9);
        const d = sp * (1 - Math.pow(1 - u, 2));
        const pos: V3 = [p[0] + Math.cos(a) * Math.cos(e) * d, p[1] + Math.sin(e) * d - u * u, p[2] + Math.sin(a) * Math.cos(e) * d];
        return <mesh key={k} geometry={OCTA()} material={neon(k % 3 === 0 ? CP.magenta : CP.cyan, 1)} position={pos} scale={0.05 * (1 - u)} />;
      })}
    </>
  );
};

/** portrait (Shorts) or landscape (long-form, LONGFORM.md); the portrait film is unchanged */
export const CyberFilm: React.FC<{ c: CyberCompiled }> = ({ c }) => (c.landscape ? <CyberFilmL c={c} /> : <CyberFilmP c={c} />);

const CyberFilmP: React.FC<{ c: CyberCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.L;
  const shot = c.shotAt(n / FPS);
  const t = Math.min(Math.max(n / FPS, shot.a), shot.b - 1e-4);
  const tOut = n / FPS;
  const cam = c.camAt(t);
  const set = CYBER_SETS[shot.set];
  const bolts = c.boltsAt(t);
  const g = c.glitchAt(tOut);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const chunks = React.useMemo(() => cyberChunks(c.words), [c]);
  const jx = g > 0 ? (hash(Math.floor(n / 2) * 3.1) - 0.5) * 36 * g * L.k : 0;
  return (
    <AbsoluteFill style={{ background: set.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: g > 0 ? `translateX(${jx.toFixed(1)}px)` : undefined }}>
        <View mood={CYBER_MOODS[set.mood]} cam={cam} t={t} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={L.W} height={L.H}>
          <ClipOn />
          {set.render(t)}
          {bolts.map((st) => <Bolt key={st.id} st={st} t={t} shadow />)}
          {shot.props.map((p) => {
            if (t < p.a || t >= p.b) return null;
            if (p.def) { const pl = c.placeOf(p, t); return p.show(t) > 0 ? <CutawayObject key={p.key} k={p.key} def={p.def} pl={pl} st={c.cutOf(p.key, t)} t={t} /> : null; }
            return <KitView key={p.key} pr={p} c={c} t={t} />;
          })}
          {shot.fx.filter((f) => f.fx === "sparks").map((f, i) => <Sparks key={i} f={f} t={t} />)}
        </View>
      </AbsoluteFill>
      <GlitchBars g={g} frame={n} L={L} />
      <AlertWash a={c.alertAt(tOut)} L={L} />
      <LabelLayer labels={c.labelsAt(tOut)} t={tOut} L={L} />
      <Boards boards={c.boardsAt(tOut)} t={tOut} L={L} />
      <Devices devices={c.devicesAt(tOut)} t={tOut} L={L} />
      <CyberHook text={c.recipe.hook.text} t={tOut} until={c.hookUntil} L={L} g={g} />
      {c.hookAgain !== null ? <CyberHook text={c.recipe.hook.text} t={tOut} t0={c.hookAgain} until={99} L={L} g={g} /> : null}
      {!capOff ? (fixedCap ? <CyberCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} L={L} from={0} /> : <CyberCaptions chunks={chunks} t={tOut} L={L} />) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ LONG-FORM: the 1920x1080 film (LONGFORM.md)
const chunkCacheL = new WeakMap<CyberCompiled, CapChunk[]>();
/** long-form captions: lower-third phrases of up to LF.CAP_WORDS words (2 lines max in the 1440 px column) */
const chunksL = (c: CyberCompiled) => { let k = chunkCacheL.get(c); if (!k) { k = chunkWords(c.words, LF.CAP_WORDS); chunkCacheL.set(c, k); } return k; };
/** The same scene and HUD as a Short, laid out for 16:9: ONE View (the canvas stays mounted across shots: no key per
 *  shot, so the shaders compile once per tab), the post chain at its 1080 weight (postScale 1), the hook top centre,
 *  a chapter card at each chapter, and the shared lower-third captions (the spoken word in the kit's neon cyan, as on
 *  the Shorts) at the shot's caption-safe centre. Everything is procedural: no model or texture file is loaded. */
const CyberFilmL: React.FC<{ c: CyberCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.L;
  const tOut = n / FPS;
  const shot = c.shotAt(tOut);
  const t = Math.min(Math.max(tOut, shot.a), shot.b - 1e-4);
  const cam = c.camAt(t);
  const set = CYBER_SETS[shot.set];
  const bolts = c.boltsAt(t);
  const g = c.glitchAt(tOut);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const capY = shot.capY ?? LF.CAP_Y / LF.H;
  const ch = chapterAt(c.chapters, tOut);
  const jx = g > 0 ? (hash(Math.floor(n / 2) * 3.1) - 0.5) * 36 * g * L.k : 0;
  return (
    <AbsoluteFill style={{ background: set.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: g > 0 ? `translateX(${jx.toFixed(1)}px)` : undefined }}>
        <View mood={CYBER_MOODS[set.mood]} cam={cam} t={t} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={LF.W} height={LF.H} postScale={1}>
          <ClipOn />
          {set.render(t)}
          {bolts.map((st) => <Bolt key={st.id} st={st} t={t} shadow />)}
          {shot.props.map((p) => {
            if (t < p.a || t >= p.b) return null;
            if (p.def) { const pl = c.placeOf(p, t); return p.show(t) > 0 ? <CutawayObject key={p.key} k={p.key} def={p.def} pl={pl} st={c.cutOf(p.key, t)} t={t} /> : null; }
            return <KitView key={p.key} pr={p} c={c} t={t} />;
          })}
          {shot.fx.filter((f) => f.fx === "sparks").map((f, i) => <Sparks key={i} f={f} t={t} />)}
        </View>
      </AbsoluteFill>
      <GlitchBars g={g} frame={n} L={L} />
      <AlertWash a={c.alertAt(tOut)} L={L} />
      <LabelLayer labels={c.labelsAt(tOut)} t={tOut} L={L} />
      <Boards boards={c.boardsAt(tOut)} t={tOut} L={L} />
      <Devices devices={c.devicesAt(tOut)} t={tOut} L={L} />
      <CyberHook text={c.recipe.hook.text} t={tOut} until={c.hookUntil} L={L} g={g} />
      {c.hookAgain !== null ? <CyberHook text={c.recipe.hook.text} t={tOut} t0={c.hookAgain} until={99} L={L} g={g} /> : null}
      {ch ? <ChapterCard n={ch.n} title={ch.title} u={tOut - ch.card} accent={CP.cyan} edge={CP.magenta} /> : null}
      {!capOff ? (fixedCap ? <LowerThirdCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} centre={capY} size={L.cap.fs} hot={CP.cyan} />
        : <LowerThirdCaptions chunks={chunksL(c)} t={tOut} centre={capY} size={L.cap.fs} hot={CP.cyan} hide={(x) => x < L.cap.from} />) : null}
    </AbsoluteFill>
  );
};

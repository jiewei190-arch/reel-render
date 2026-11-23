// BizFilm: renders a compiled biz3d recipe. One View (the engine's light rig + post chain) with the set, the
// executives, the kit props and fx, all on the WORLD clock (it holds during a freeze-frame); the camera and the HUD
// run on the real clock, so a freeze still moves. Then the HUD: labels, chart tags, devices, the hook, captions.
// Plain 30 fps only: no sub-frame motion blur in this kit (the owner's decision).
// "format": "landscape" (1920x1080 long-form, LONGFORM.md) renders BizFilmL: the same scene and cards, the shared
// lower-third captions (7-word phrases, the spoken word in the kit's gold, centre per shot from the caption plan), the
// shared chapter card, the hook top-centre, and the post chain weighted by the short side (postScale 1). The View has
// no per-shot key, so the WebGL canvas stays mounted across shots. Portrait (BizFilmP) is unchanged.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import type { BizCompiled, FxR } from "./compile";
import { FPS } from "./compile";
import { Exec } from "./exec";
import { BizCaptions, BizHook, bizChunks, Devices, LabelLayer, TagLayer } from "./hud";
import { chapterAt, ChapterCard, chunkWords, LF, LowerThirdCaptions } from "../longform/kit";
import { BIZ_MOODS, BP } from "./palette";
import { KitProp } from "./props";
import { BIZ_SETS } from "./sets";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const Debris: React.FC<{ f: FxR; t: number }> = ({ f, t }) => {
  const u = (t - f.at) / 1.1;
  if (u < 0 || u > 1) return null;
  const p = f.p(f.at);
  return (
    <>
      {Array.from({ length: 18 }, (_, k) => {
        const a = hash(k + 1) * Math.PI * 2, e = 0.2 + hash(k + 5) * 1.1, sp = (1.0 + 1.8 * hash(k + 9)) * f.gain;
        const d = sp * (1 - Math.pow(1 - u, 2));
        const pos: V3 = [p[0] + Math.cos(a) * Math.cos(e) * d, Math.max(0.05, p[1] + Math.sin(e) * d - 4 * u * u), p[2] + Math.sin(a) * Math.cos(e) * d];
        return <mesh key={k} geometry={geoOf("bzBox", () => new THREE.BoxGeometry(1, 1, 1))} material={plastic(k % 3 === 0 ? "#c9ccd2" : k % 3 === 1 ? "#3a4560" : "#ff6b5e", { rough: 0.7 })} position={pos} scale={0.08 + 0.1 * hash(k + 2)} rotation={[t * 5 + k, t * 3, 0]} castShadow />;
      })}
    </>
  );
};

export const BizFilm: React.FC<{ c: BizCompiled }> = ({ c }) => (c.landscape ? <BizFilmL c={c} /> : <BizFilmP c={c} />);

const BizFilmP: React.FC<{ c: BizCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.layout;
  const tOut = n / FPS;
  const shot = c.shotAt(tOut);
  const t = Math.min(Math.max(tOut, shot.a), shot.b - 1e-4);
  const ts = c.sceneT(t); // the world clock
  const cam = c.camAt(t);
  const set = BIZ_SETS[shot.set];
  const execs = c.execsAt(t);
  const w = c.world(t);
  const fz = c.freezeAt(tOut);
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, tOut >= f.at ? 0.6 * (1 - (tOut - f.at) / 0.14) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const chunks = React.useMemo(() => bizChunks(c.words), [c]);
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <AbsoluteFill style={{ filter: fz > 0 ? `saturate(${1 - 0.85 * fz}) contrast(${1 + 0.18 * fz}) brightness(${1 - 0.12 * fz})` : undefined }}>
        <View mood={BIZ_MOODS[set.mood]} cam={cam} t={ts} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={L.W} height={L.H}>
          {set.render(ts, w)}
          {execs.map((st) => <Exec key={st.id} st={st} />)}
          {shot.props.map((p) => (t < p.a || t >= p.b ? null : <KitProp key={p.key} sp={p.spec} pl={c.placeOf(p, t)} st={c.propState(p.key, ts)} t={ts} vis={p.show(ts)} seed={p.seed} />))}
          {shot.fx.filter((f) => f.fx === "debris").map((f, i) => <Debris key={i} f={f} t={ts} />)}
        </View>
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
      {fz > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(120,10,10,${0.35 * fz}) 100%)` }} /> : null}
      <TagLayer L={L} tags={c.tagsAt(tOut)} />
      <LabelLayer L={L} labels={c.labelsAt(tOut)} t={tOut} />
      <Devices L={L} devices={c.devicesAt(tOut)} t={tOut} />
      <BizHook L={L} text={c.recipe.hook.text} t={tOut} until={c.hookUntil} tone={c.recipe.hook.tone} />
      {c.hookAgain !== null ? <BizHook L={L} text={c.recipe.hook.text} t={tOut} t0={c.hookAgain} until={99} tone={c.recipe.hook.tone} /> : null}
      {!capOff ? (fixedCap ? <BizCaptions L={L} chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} from={0} /> : <BizCaptions L={L} chunks={chunks} t={tOut} />) : null}
    </AbsoluteFill>
  );
};
const chunksL = new WeakMap<BizCompiled, ReturnType<typeof chunkWords>>();
const CHUNKS_L = (c: BizCompiled) => { let k = chunksL.get(c); if (!k) { k = chunkWords(c.words, LF.CAP_WORDS); chunksL.set(c, k); } return k; };

const BizFilmL: React.FC<{ c: BizCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.layout;
  const tOut = n / FPS;
  const shot = c.shotAt(tOut);
  const t = Math.min(Math.max(tOut, shot.a), shot.b - 1e-4);
  const ts = c.sceneT(t);
  const cam = c.camAt(t);
  const set = BIZ_SETS[shot.set];
  const execs = c.execsAt(t);
  const w = c.world(t);
  const fz = c.freezeAt(tOut);
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, tOut >= f.at ? 0.6 * (1 - (tOut - f.at) / 0.14) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const capC = c.capY(shot) / LF.H;
  const ch = chapterAt(c.chapters, tOut);
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <AbsoluteFill style={{ filter: fz > 0 ? `saturate(${1 - 0.85 * fz}) contrast(${1 + 0.18 * fz}) brightness(${1 - 0.12 * fz})` : undefined }}>
        <View mood={BIZ_MOODS[set.mood]} cam={cam} t={ts} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={L.W} height={L.H} postScale={1}>
          {set.render(ts, w)}
          {execs.map((st) => <Exec key={st.id} st={st} />)}
          {shot.props.map((p) => (t < p.a || t >= p.b ? null : <KitProp key={p.key} sp={p.spec} pl={c.placeOf(p, t)} st={c.propState(p.key, ts)} t={ts} vis={p.show(ts)} seed={p.seed} />))}
          {shot.fx.filter((f) => f.fx === "debris").map((f, i) => <Debris key={i} f={f} t={ts} />)}
        </View>
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
      {fz > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(120,10,10,${0.35 * fz}) 100%)` }} /> : null}
      <TagLayer L={L} tags={c.tagsAt(tOut)} />
      <LabelLayer L={L} labels={c.labelsAt(tOut)} t={tOut} />
      <Devices L={L} devices={c.devicesAt(tOut)} t={tOut} />
      <BizHook L={L} text={c.recipe.hook.text} t={tOut} until={c.hookUntil} tone={c.recipe.hook.tone} />
      {c.hookAgain !== null ? <BizHook L={L} text={c.recipe.hook.text} t={tOut} t0={c.hookAgain} until={99} tone={c.recipe.hook.tone} /> : null}
      {ch ? <ChapterCard n={ch.n} title={ch.title} u={tOut - ch.card} accent={BP.gold} edge={BP.red} safe top={ch.top} fs={ch.fs} /> : null}
      {!capOff ? (fixedCap
        ? <LowerThirdCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} centre={capC} size={L.cap.fs} hot={BP.gold} />
        : <LowerThirdCaptions chunks={CHUNKS_L(c)} t={tOut} centre={capC} size={L.cap.fs} hot={BP.gold} hide={(x) => x < L.cap.from} />) : null}
    </AbsoluteFill>
  );
};
export { clamp };

// LawFilm: renders a compiled law3d recipe: one View through the engine's post chain (the set with its beams and
// dust, the cast, the props, fx), then the DOM HUD (devices, the hook at frame 0 and at the loop, captions).
// The plain 30 fps composition only: no motion-blur sub-frames (the owner's call).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { geoOf } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import { Figure } from "./cast";
import type { FxR, LawCompiled, PropR } from "./compile";
import { FPS } from "./compile";
import { ChapterCard, LF, LowerThirdCaptions, chapterAt, chunkWords } from "../longform/kit";
import { Devices, LawCaptions, LawHook, lawChunks } from "./hud";
import { KitMesh } from "./objects";
import { LAW_MOODS, LP } from "./palette";
import { LAW_SETS } from "./sets";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const pm = new Map<string, THREE.MeshStandardMaterial>();
const paperMat = (c: string) => { let m = pm.get(c); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, side: THREE.DoubleSide }); pm.set(c, m); } return m; };

const PropView: React.FC<{ pr: PropR; t: number }> = ({ pr, t }) => {
  const pl = pr.place(t);
  if (pr.show(t) <= 0) return null;
  return (
    <group position={pl.p} rotation={[pl.pitch, pl.yaw, pl.roll, "YXZ"]} scale={pl.s}>
      <KitMesh sp={{ kit: pr.spec.kit, text: pr.text, color: pr.spec.color, photo: pr.spec.photo, held: pr.held, label: pr.spec.label, lines: pr.spec.lines, species: pr.spec.species, variant: pr.spec.variant, hair: pr.spec.hair, bandage: pr.spec.bandage, sale: pr.spec.sale, steam: pr.spec.steam, lightbar: pr.spec.lightbar, count: pr.spec.count }} t={t} strike={pr.strike(t)} seed={pr.seed} act={pr.act(t)} move={pr.spec.to !== undefined ? pr.speed(t) : 0} />
    </group>
  );
};
/** a burst of paper sheets fluttering out of a point (a case blowing open) */
const Papers: React.FC<{ f: FxR; t: number }> = ({ f, t }) => {
  const u = (t - f.at) / 1.6;
  if (u < 0 || u > 1) return null;
  const p = f.p(f.at);
  return (
    <>
      {Array.from({ length: 14 }, (_, k) => {
        const a = hash(k + 1) * Math.PI * 2, sp = 0.9 + 1.3 * hash(k + 7), up = 0.6 + 1.2 * hash(k + 3);
        const e = 1 - Math.pow(1 - u, 2);
        const pos: V3 = [p[0] + Math.cos(a) * sp * e, p[1] + up * e - 1.1 * u * u + 0.08 * Math.sin(t * 9 + k), p[2] + Math.sin(a) * sp * e];
        return <mesh key={k} geometry={geoOf("lawFlySheet", () => new THREE.PlaneGeometry(0.21, 0.28))} material={paperMat(k % 4 ? LP.paper : LP.paperDark)} position={pos} rotation={[t * (3 + k % 3) + k, t * 2 + k * 0.7, Math.sin(t * 5 + k)]} castShadow />;
      })}
    </>
  );
};

export const LawFilm: React.FC<{ c: LawCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.layout;
  const shot = c.shotAt(n / FPS);
  const t = Math.min(Math.max(n / FPS, shot.a), shot.b - 1e-4);
  const cam = c.camAt(t);
  const set = LAW_SETS[shot.set];
  const figs = c.figsAt(t);
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, t >= f.at ? 0.55 * (1 - (t - f.at) / 0.14) : 0), 0)
    + shot.devices.filter((d) => d.act.do === "verdict").reduce((o, d) => Math.max(o, t >= d.t0 ? 0.35 * (1 - (t - d.t0) / 0.12) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const chunks = React.useMemo(() => lawChunks(c.words), [c]);
  const ds = c.devicesAt(t);
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <View mood={LAW_MOODS[set.mood]} cam={cam} t={t} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={L.W} height={L.H}>
        {set.render(t, { jury: shot.spec.jury, drive: shot.spec.drive, patrol: shot.spec.patrol })}
        {figs.map((st) => <Figure key={st.id} st={st} t={t} />)}
        {shot.props.map((p) => (t < p.a || t >= p.b ? null : <PropView key={p.key} pr={p} t={t} />))}
        {shot.fx.filter((f) => f.fx === "papers").map((f, i) => <Papers key={i} f={f} t={t} />)}
      </View>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff2d8", opacity: Math.min(0.7, flash), mixBlendMode: "screen" }} /> : null}
      <Devices L={L} ds={ds} t={t} />
      <LawHook L={L} text={c.recipe.hook.text} t={t} until={c.hookUntil} />
      {c.hookAgain !== null ? <LawHook L={L} text={c.recipe.hook.text} t={t} t0={c.hookAgain} until={99} /> : null}
      {!capOff ? (fixedCap ? <LawCaptions L={L} chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={t} from={0} /> : <LawCaptions L={L} chunks={chunks} t={t} />) : null}
    </AbsoluteFill>
  );
};

/** LONG-FORM ("format": "landscape", 1920x1080, LONGFORM.md): the same scene through one 1920x1080 View (the post chain
 *  keeps its Shorts weight: postScale 1, scaled by the short side), the hook top centre, a chapter card at each chapter,
 *  lower-third captions (phrases of up to 7 words; the spoken word in the kit's gold, as on the Shorts), centred where
 *  the shot's caption plan puts them. The canvas stays mounted across shots (no key per shot): creating it compiles
 *  every shader. law3d is procedural (no model or texture files), so there is nothing to window-load. */
export const LawFilmLandscape: React.FC<{ c: LawCompiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const L = c.layout;
  const t0 = n / FPS;
  const shot = c.shotAt(t0);
  const t = Math.min(Math.max(t0, shot.a), shot.b - 1e-4);
  const cam = c.camAt(t);
  const set = LAW_SETS[shot.set];
  const figs = c.figsAt(t);
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, t >= f.at ? 0.55 * (1 - (t - f.at) / 0.14) : 0), 0)
    + shot.devices.filter((d) => d.act.do === "verdict").reduce((o, d) => Math.max(o, t >= d.t0 ? 0.35 * (1 - (t - d.t0) / 0.12) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const chunks = React.useMemo(() => chunkWords(c.words, LF.CAP_WORDS), [c]);
  const capY = (shot.capY ?? LF.CAP_Y) / LF.H;
  const ch = chapterAt(c.chapters, t0);
  const ds = c.devicesAt(t);
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <View mood={LAW_MOODS[set.mood]} cam={cam} t={t} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false} width={L.W} height={L.H} postScale={1}>
        {set.render(t, { jury: shot.spec.jury, drive: shot.spec.drive, patrol: shot.spec.patrol })}
        {figs.map((st) => <Figure key={st.id} st={st} t={t} />)}
        {shot.props.map((p) => (t < p.a || t >= p.b ? null : <PropView key={p.key} pr={p} t={t} />))}
        {shot.fx.filter((f) => f.fx === "papers").map((f, i) => <Papers key={i} f={f} t={t} />)}
      </View>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff2d8", opacity: Math.min(0.7, flash), mixBlendMode: "screen" }} /> : null}
      <Devices L={L} ds={ds} t={t} />
      <LawHook L={L} text={c.recipe.hook.text} t={t0} until={c.hookUntil} />
      {c.hookAgain !== null ? <LawHook L={L} text={c.recipe.hook.text} t={t0} t0={c.hookAgain} until={99} /> : null}
      {ch ? <ChapterCard n={ch.n} title={ch.title} u={t0 - ch.card} accent={LP.gold} edge={LP.goldDeep} safe top={ch.top} fs={ch.fs} /> : null}
      {!capOff ? (fixedCap
        ? <LowerThirdCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={t0} centre={capY} size={L.capFs} hot={LP.gold} />
        : <LowerThirdCaptions chunks={chunks} t={t0} centre={capY} size={L.capFs} hot={LP.gold} hide={(x) => x < 1.0} />) : null}
    </AbsoluteFill>
  );
};

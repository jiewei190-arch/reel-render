// TechFilm: renders a compiled tech3d recipe (one View through the engine's post chain, the set, BOLT, cutaway
// objects and kit props, fx), then the HUD: label cards, boards, the hook (frame 0 and the loop repeat), captions.
import { useThree } from "@react-three/fiber";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { subFrame, useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import { Bolt } from "./bolt";
import { CutawayObject } from "./cutaway";
import type { PropR, TechCompiled, FxR } from "./compile";
import { FPS } from "./compile";
import { Boards, LabelLayer, TechCaptions, TechHook, techChunks } from "./hud";
import { FOG_BG, TECH_MOODS, TP } from "./palette";
import { TECH_SETS } from "./sets";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const bm = new Map<string, THREE.MeshBasicMaterial>();
const beamMat = (c: string, o: number) => { const k = `${c}|${o.toFixed(2)}`; let m = bm.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }); bm.set(k, m); } return m; };
const q2 = (v: number) => Math.round(v * 20) / 20;

/** clipping planes need the renderer flag (cutaway slices) */
const ClipOn: React.FC = () => { const { gl } = useThree(); gl.localClippingEnabled = true; return null; };

/** a fan (triangle) of length L and half-angle a, in the XZ plane, pointing +z from the origin */
const fanGeo = (L: number, a: number) => geoOf(`fan${L}|${a}`, () => {
  const w = L * Math.tan(a);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, -w, 0, L, w, 0, L], 3));
  g.setIndex([0, 1, 2]);
  g.computeVertexNormals();
  return g;
});
const KitView: React.FC<{ pr: PropR; c: TechCompiled; t: number }> = ({ pr, c, t }) => {
  const pl = c.placeOf(pr, t);
  const sp = pr.spec;
  const vis = pr.show(t);
  if (vis <= 0) return null;
  switch (sp.kit) {
    case "locBeam": {
      // the localizer: a narrow horizontal fan along the runway centreline (left/right guidance), pulses travel out
      const L = 220, A = (2.5 * Math.PI) / 180, col = sp.color ?? TP.mint;
      return (
        <group position={pl.p} rotation={[0, pl.yaw, 0]}>
          <mesh geometry={fanGeo(L, A)} material={beamMat(col, 0.36)} position={[0, 1.4, 0]} />
          <mesh geometry={fanGeo(L, A * 0.22)} material={beamMat("#ffffff", 0.55)} position={[0, 1.42, 0]} />
          {Array.from({ length: 7 }, (_, k) => { const z = ((t * 34 + k * (L / 7)) % L); const w = z * Math.tan(A); return <mesh key={k} geometry={geoOf("beamBar", () => new THREE.BoxGeometry(1, 0.05, 0.6))} material={beamMat(col, q2(0.75 * (1 - z / L)))} position={[0, 1.44, z]} scale={[2 * w, 1, 1 + z / 60]} />; })}
        </group>
      );
    }
    case "gsBeam": {
      // the glideslope: a sloped sheet rising from the touchdown zone (default 3 degrees), pulses travel up it
      const deg = sp.deg ?? 3, L = 200, A = (1.8 * Math.PI) / 180, col = sp.color ?? TP.orange;
      return (
        <group position={pl.p} rotation={[0, pl.yaw, 0]}>
          <group rotation={[(-deg * Math.PI) / 180, 0, 0]}>
            <mesh geometry={fanGeo(L, A)} material={beamMat(col, 0.42)} />
            <mesh geometry={fanGeo(L, A * 0.25)} material={beamMat("#ffffff", 0.6)} position={[0, 0.02, 0]} />
            {Array.from({ length: 7 }, (_, k) => { const z = ((t * 30 + k * (L / 7)) % L); const w = z * Math.tan(A); return <mesh key={k} geometry={geoOf("beamBar", () => new THREE.BoxGeometry(1, 0.05, 0.6))} material={beamMat(col, q2(0.8 * (1 - z / L)))} position={[0, 0.03, z]} scale={[2 * w, 1, 1 + z / 60]} />; })}
          </group>
        </group>
      );
    }
    case "signal": {
      // expanding rings: a radio signal arriving at / leaving a point
      return (
        <group position={pl.p} rotation={[pl.pitch ?? 0, pl.yaw, pl.roll ?? 0]} scale={pl.s}>
          {[0, 1, 2].map((k) => { const u = (t * 1.2 + k / 3) % 1; return <mesh key={k} geometry={geoOf("sigRing", () => new THREE.TorusGeometry(1, 0.04, 6, 32))} material={beamMat(sp.color ?? TP.mint, q2(0.85 * (1 - u)))} scale={0.2 + 1.2 * u} />; })}
        </group>
      );
    }
    case "block": {
      const z = sp.size ?? [0.5, 0.5, 0.5];
      return <mesh geometry={geoOf(`blk${z.join(",")}`, () => new THREE.BoxGeometry(...z))} material={plastic(sp.color ?? TP.blue, { flat: true })} position={[pl.p[0], pl.p[1] + (z[1] * pl.s) / 2, pl.p[2]]} rotation={[0, pl.yaw, 0]} scale={pl.s} castShadow />;
    }
    default: return null;
  }
};
const Sparks: React.FC<{ f: FxR; t: number }> = ({ f, t }) => {
  const u = (t - f.at) / 0.7;
  if (u < 0 || u > 1) return null;
  const p = f.p(f.at);
  return (
    <>
      {Array.from({ length: 16 }, (_, k) => {
        const a = hash(k + 1) * Math.PI * 2, e = 0.3 + hash(k + 5) * 1.0, sp = 1.2 + 1.4 * hash(k + 9);
        const d = sp * (1 - Math.pow(1 - u, 2));
        const pos: V3 = [p[0] + Math.cos(a) * Math.cos(e) * d, p[1] + Math.sin(e) * d - 1.2 * u * u, p[2] + Math.sin(a) * Math.cos(e) * d];
        return <mesh key={k} geometry={geoOf("sparkOcta", () => new THREE.OctahedronGeometry(1, 0))} material={beamMat(k % 3 === 0 ? TP.orange : k % 3 === 1 ? TP.mint : "#ffffff", 1)} position={pos} scale={0.06 * (1 - u)} rotation={[t * 5 + k, t * 3, 0]} />;
      })}
    </>
  );
};

export const TechFilm: React.FC<{ c: TechCompiled; sub?: boolean }> = ({ c, sub = false }) => {
  const g = useCurrentFrame();
  useFonts();
  const n0 = sub ? Math.floor(g / 4) : g;
  const shot0 = c.shotAt(n0 / FPS);
  const { n, fp } = sub ? subFrame(g, 4, shot0.lens.shutter) : { n: g, fp: g };
  const shot = c.shotAt(n / FPS);
  const t = Math.min(Math.max(fp / FPS, shot.a), shot.b - 1e-4);
  const tOut = n / FPS;
  const cam = c.camAt(t);
  const set = TECH_SETS[shot.set];
  const bolts = c.boltsAt(t);
  const flash = shot.fx.filter((f) => f.fx === "flash").reduce((o, f) => Math.max(o, tOut >= f.at ? 0.6 * (1 - (tOut - f.at) / 0.14) : 0), 0);
  const capOff = shot.spec.caption === "off" || c.recipe.captions === "off";
  const fixedCap = shot.spec.caption && shot.spec.caption !== "auto" && shot.spec.caption !== "off" ? shot.spec.caption : null;
  const chunks = React.useMemo(() => techChunks(c.words), [c]);
  const labels = c.labelsAt(tOut);
  const boards = c.boardsAt(tOut);
  return (
    <AbsoluteFill style={{ background: shot.spec.mood === "fog" ? FOG_BG : set.bg }}>
      <View mood={TECH_MOODS[shot.spec.mood === "fog" && set.id === "sky" ? "skyFog" : set.mood]} cam={cam} t={t} blur={shot.lens.blur} focus={shot.lens.subj(t)} sky={false}>
        <ClipOn />
        {set.render(t, { fog: shot.spec.mood === "fog" })}
        {bolts.map((st) => <Bolt key={st.id} st={st} t={t} shadow={shot.set !== "sky" || st.y - st.floorY < 3} />)}
        {shot.props.map((p) => {
          if (t < p.a || t >= p.b) return null;
          if (p.def) { const pl = c.placeOf(p, t); return p.show(t) > 0 ? <CutawayObject key={p.key} k={p.key} def={p.def} pl={pl} st={c.cutOf(p.key, t)} t={t} /> : null; }
          return <KitView key={p.key} pr={p} c={c} t={t} />;
        })}
        {shot.fx.filter((f) => f.fx === "sparks").map((f, i) => <Sparks key={i} f={f} t={t} />)}
      </View>
      {flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} /> : null}
      <LabelLayer labels={labels} t={tOut} />
      <Boards boards={boards} t={tOut} />
      <TechHook text={c.recipe.hook.text} t={tOut} until={c.hookUntil} />
      {c.hookAgain !== null ? <TechHook text={c.recipe.hook.text} t={tOut} t0={c.hookAgain} until={99} /> : null}
      {!capOff ? (fixedCap ? <TechCaptions chunks={[{ words: [{ w: fixedCap, t: shot.a, end: shot.b }], start: shot.a, end: shot.b, hold: shot.b }]} t={tOut} from={0} /> : <TechCaptions chunks={chunks} t={tOut} />) : null}
    </AbsoluteFill>
  );
};
export { clamp };

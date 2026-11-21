// law3d sets. Each one keeps moving (dust drifting in the light beams, a flickering practical, breathing silhouettes,
// drifting fog), so no frame is ever static, even on a slow push. All geometry is procedural; no seals, logos or flags.
//   courtroom  the main room: the judge's bench on a platform under a warm spotlight, the witness stand, the plaintiff
//              and defense tables, the jury box with silhouettes, the gallery rail and benches, wood-panelled walls,
//              tall windows with cool moonlight beams
//   evidence   a dark room: one evidence table under a hard top light, shelves of boxes in the back
//   casefile   a big wooden desk seen from above: folders, photos, a mug, a pen, a brass desk lamp pool of light
//   headlines  a wall of newspaper pages and pinned notes with red string, lit from the side
//   steps      outside the courthouse at night: wide stone steps, columns, a plain pediment, glowing doors, lamp posts
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { SpotBeam } from "./beam";
import { Figure, figState } from "./cast";
import type { CastSpec, FigPose } from "./cast";
import { KitMesh } from "./objects";
import { LP } from "./palette";

export type LawSetId = "courtroom" | "evidence" | "casefile" | "headlines" | "steps";
export type LawSet = {
  id: LawSetId;
  bg: string;
  mood: LawSetId;
  anchors: Record<string, V3>;
  /** static QA boxes (no figure or flying prop may enter them) */
  blockers: { name: string; c: V3; h: V3 }[];
  render: (t: number) => React.ReactNode;
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const basic = new Map<string, THREE.MeshBasicMaterial>();
const bmat = (c: string, o = 1) => { const k = `${c}|${o}`; let m = basic.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1, toneMapped: false }); basic.set(k, m); } return m; };
const BOX = () => geoOf("lsBox", () => new THREE.BoxGeometry(1, 1, 1));
const PLANE = () => geoOf("lsPlane", () => new THREE.PlaneGeometry(1, 1));
const wood = (c: string = LP.wood, r = 0.55) => plastic(c, { rough: r, flat: true });
/** a box from its min corner to its max corner */
const Blk: React.FC<{ a: V3; b: V3; m: THREE.Material; cast?: boolean }> = ({ a, b, m, cast = true }) => (
  <mesh geometry={BOX()} material={m} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} scale={[b[0] - a[0], b[1] - a[1], b[2] - a[2]]} castShadow={cast} receiveShadow />
);
const blocker = (name: string, a: V3, b: V3) => ({ name, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2] as V3, h: [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2, (b[2] - a[2]) / 2] as V3 });

const planksTex = (key: string, base: string, line: string) => canvasTexture(key, 512, 512, (g, W, H) => {
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 16; k++) { g.fillStyle = `rgba(0,0,0,${0.05 + 0.12 * hash(k + 3)})`; g.fillRect(0, k * 32, W, 32); g.fillStyle = line; g.fillRect(0, k * 32, W, 2); const off = hash(k) * W; g.fillRect(off, k * 32, 2, 32); }
});
const tiled = (tex: THREE.Texture, rx: number, ry: number) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry); tex.needsUpdate = true; return tex; };
const floorMat = () => plastic("#ffffff", { rough: 0.6, map: tiled(planksTex("lsFloor", "#4a2e1c", "rgba(0,0,0,0.5)"), 6, 6) });
const panelTex = () => canvasTexture("lsPanel", 256, 512, (g, W, H) => {
  g.fillStyle = "#3e2616"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#4c2f1c"; g.fillRect(24, 24, W - 48, H * 0.55); g.fillRect(24, H * 0.62, W - 48, H * 0.33);
  g.strokeStyle = "rgba(0,0,0,0.45)"; g.lineWidth = 6; g.strokeRect(24, 24, W - 48, H * 0.55); g.strokeRect(24, H * 0.62, W - 48, H * 0.33);
  g.strokeStyle = "rgba(255,210,150,0.12)"; g.lineWidth = 2; g.strokeRect(30, 30, W - 60, H * 0.55 - 12);
});
const panelMat = (rx: number) => plastic("#ffffff", { rough: 0.6, map: tiled(panelTex(), rx, 1) });

// ------------------------------------------------------------------ silhouettes (jurors, gallery)
const SIL: CastSpec = { role: "juror" };
const Sil: React.FC<{ id: string; at: V3; yaw: number; t: number; seed: number; sit?: boolean; pose?: FigPose; hair?: CastSpec["hairStyle"]; build?: CastSpec["build"] }> = ({ id, at, yaw, t, seed, sit = true, pose = "idle", hair, build }) => {
  const st = figState({ id, spec: { ...SIL, hairStyle: hair, build }, seed, s: 1, sit, at: () => at, yaw: () => yaw + 0.15 * Math.sin(t * 0.3 + seed), segs: [{ t0: -10, pose }], faces: [], hits: [], gavel: false }, t);
  return <Figure st={st} t={t} />;
};

// ------------------------------------------------------------------ courtroom
const BENCH_TOP = 1.55;
const courtroom: LawSet = {
  id: "courtroom", bg: LP.bg, mood: "courtroom",
  anchors: {
    centre: [0, 0, 0], well: [0, 0, -1.4], bench: [0, 0.6, -4.75], benchTop: [0, BENCH_TOP, -4.05], gavel: [0.55, BENCH_TOP, -4.05],
    witness: [2.9, 0.35, -3.2], witnessRail: [2.9, 1.0, -2.45],
    plaintiff: [-1.7, 0, 1.15], defendant: [1.7, 0, 1.15], plaintiff2: [-2.5, 0, 1.15], defendant2: [2.5, 0, 1.15], defendant3: [0.9, 0, 1.15],
    pTable: [-1.7, 0.76, 0.4], dTable: [1.7, 0.76, 0.4], podium: [0, 0, -1.0], jury: [-3.9, 0.3, -1.5], gallery: [0, 0, 3.6], aisle: [0, 0, 2.6], door: [0, 0, 6.5],
  },
  blockers: [
    blocker("set.bench", [-1.95, 0, -4.25], [1.95, BENCH_TOP, -3.85]),
    blocker("set.witnessRail", [2.25, 0, -2.52], [3.55, 1.25, -2.38]),
    blocker("set.pTable", [-2.55, 0, 0.0], [-0.85, 0.76, 0.8]),
    blocker("set.dTable", [0.85, 0, 0.0], [2.55, 0.76, 0.8]),
    blocker("set.juryRail", [-3.25, 0, -3.3], [-3.1, 1.0, 0.3]),
    blocker("set.galleryRail", [-5, 0, 2.15], [-0.7, 0.95, 2.3]),
    blocker("set.galleryRailR", [0.7, 0, 2.15], [5, 0.95, 2.3]),
  ],
  render: (t) => (
    <>
      <mesh geometry={geoOf("lsBgDome", () => new THREE.SphereGeometry(80, 16, 10))} material={(() => { const m = bmat("#070c18"); m.side = THREE.BackSide; return m; })()} />
      <mesh geometry={PLANE()} material={floorMat()} rotation={[-Math.PI / 2, 0, 0]} scale={[14, 16, 1]} position={[0, 0, 0]} receiveShadow />
      {/* a dark blue carpet runner down the aisle and the well */}
      <mesh geometry={PLANE()} material={plastic("#1b2a4a", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 9, 1]} position={[0, 0.004, 1.5]} receiveShadow />
      {/* walls: wood panels, gold trim, ceiling */}
      <mesh geometry={PLANE()} material={panelMat(12)} position={[0, 3, -6.2]} scale={[14, 6, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={panelMat(14)} position={[-6, 3, 0]} rotation={[0, Math.PI / 2, 0]} scale={[16, 6, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={panelMat(14)} position={[6, 3, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[16, 6, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={plastic("#120c0a", { rough: 1 })} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 16, 1]} />
      <Blk a={[-6, 2.6, -6.19]} b={[6, 2.66, -6.15]} m={plastic(LP.gold, { rough: 0.35, emissive: LP.goldDeep, ei: 0.12 })} cast={false} />
      {/* the panel behind the bench: a tall recessed frame with a gold border (no seal) */}
      <Blk a={[-1.6, 1.6, -6.18]} b={[1.6, 5.2, -6.1]} m={wood("#2c1a0f")} cast={false} />
      {[[-1.6, 1.6, -1.52, 5.2], [1.52, 1.6, 1.6, 5.2], [-1.6, 5.12, 1.6, 5.2], [-1.6, 1.6, 1.6, 1.68]].map(([x0, y0, x1, y1], k) => <Blk key={k} a={[x0, y0, -6.1]} b={[x1, y1, -6.05]} m={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.2 })} cast={false} />)}
      {/* pilasters */}
      {[-5.2, -3, 3, 5.2].map((x) => <Blk key={x} a={[x - 0.22, 0, -6.2]} b={[x + 0.22, 6, -5.95]} m={wood(LP.woodDark)} />)}
      {/* side windows: deep blue glass with mullions, a cool moonlight beam crossing the room */}
      {[-3.5, 0.5, 4].map((z, k) => (
        <group key={k}>
          <mesh geometry={PLANE()} material={bmat("#1c3a6e")} position={[5.98, 3.2, z]} rotation={[0, -Math.PI / 2, 0]} scale={[1.4, 3, 1]} />
          <Blk a={[5.94, 1.65, z - 0.75]} b={[5.99, 4.75, z - 0.68]} m={wood(LP.woodDark)} cast={false} />
          <Blk a={[5.94, 1.65, z + 0.68]} b={[5.99, 4.75, z + 0.75]} m={wood(LP.woodDark)} cast={false} />
          <Blk a={[5.94, 3.15, z - 0.7]} b={[5.99, 3.25, z + 0.7]} m={wood(LP.woodDark)} cast={false} />
        </group>
      ))}
      <SpotBeam from={[5.9, 4.6, 0.5]} to={[1.0, 0, -1.6]} t={t} color="#8fb4ff" intensity={14} angle={0.16} cone={0.07} dust={30} seed={7} />
      {/* the judge's platform, the bench (front panel with raised panels), the high-back chair */}
      <Blk a={[-2.2, 0, -6.0]} b={[2.2, 0.6, -3.9]} m={wood(LP.woodDark)} />
      <Blk a={[-1.95, 0, -4.25]} b={[1.95, BENCH_TOP - 0.06, -3.85]} m={wood(LP.wood)} />
      <Blk a={[-2.05, BENCH_TOP - 0.06, -4.45]} b={[2.05, BENCH_TOP, -3.8]} m={wood(LP.woodLight)} />
      {[-1.3, 0, 1.3].map((x) => <Blk key={x} a={[x - 0.5, 0.25, -3.85]} b={[x + 0.5, BENCH_TOP - 0.25, -3.82]} m={wood("#6a4126")} cast={false} />)}
      <Blk a={[-1.95, BENCH_TOP - 0.2, -3.84]} b={[1.95, BENCH_TOP - 0.16, -3.81]} m={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.2 })} cast={false} />
      <mesh geometry={rbox(0.8, 1.5, 0.16, 0.05)} material={plastic("#2a1616", { rough: 0.7 })} position={[0, 0.6 + 1.1, -5.25]} castShadow />
      <mesh geometry={rbox(0.7, 0.12, 0.6, 0.03)} material={plastic("#2a1616", { rough: 0.7 })} position={[0, 0.6 + 0.48, -4.9]} />
      {/* witness stand: platform, front rail box and a chair */}
      <Blk a={[2.25, 0, -3.65]} b={[3.55, 0.35, -2.4]} m={wood(LP.woodDark)} />
      <Blk a={[2.25, 0.35, -2.52]} b={[3.55, 1.25, -2.4]} m={wood(LP.wood)} />
      <Blk a={[3.45, 0.35, -3.65]} b={[3.55, 1.25, -2.4]} m={wood(LP.wood)} />
      <Blk a={[2.2, 1.25, -2.56]} b={[3.6, 1.3, -2.36]} m={wood(LP.woodLight)} />
      <mesh geometry={rbox(0.55, 0.9, 0.12, 0.04)} material={plastic("#2a1616", { rough: 0.7 })} position={[2.9, 0.35 + 0.75, -3.5]} castShadow />
      {/* plaintiff and defense tables with chairs */}
      {[-1.7, 1.7].map((x) => (
        <group key={x}>
          <Blk a={[x - 0.85, 0.72, 0.0]} b={[x + 0.85, 0.76, 0.8]} m={wood(LP.woodLight)} />
          <Blk a={[x - 0.8, 0, 0.05]} b={[x + 0.8, 0.72, 0.12]} m={wood(LP.wood)} />
          {[-0.78, 0.78].map((dx) => <Blk key={dx} a={[x + dx - 0.04, 0, 0.05]} b={[x + dx + 0.04, 0.72, 0.75]} m={wood(LP.woodDark)} />)}
          {[-0.4, 0.4].map((dx) => <mesh key={dx} geometry={rbox(0.46, 0.9, 0.08, 0.03)} material={plastic("#24140c", { rough: 0.8 })} position={[x + dx, 0.45 + 0.5, 1.55]} castShadow />)}
        </group>
      ))}
      {/* brass lamps on the tables: a warm practical pool each */}
      {[-2.3, 2.3].map((x) => (
        <group key={x} position={[x, 0.76, 0.2]}>
          <mesh geometry={geoOf("lsLampBase", () => new THREE.CylinderGeometry(0.07, 0.09, 0.03, 10))} material={plastic(LP.gold, { rough: 0.3 })} position={[0, 0.015, 0]} />
          <mesh geometry={geoOf("lsLampStem", () => new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6))} material={plastic(LP.gold, { rough: 0.3 })} position={[0, 0.17, 0]} />
          <mesh geometry={geoOf("lsLampShade", () => new THREE.CylinderGeometry(0.06, 0.12, 0.1, 10, 1, true))} material={plastic("#1f4a2e", { rough: 0.5, side: THREE.DoubleSide })} position={[0, 0.33, 0]} />
          <mesh geometry={geoOf("lsLampBulb", () => new THREE.SphereGeometry(0.035, 8, 6))} material={bmat("#ffe2a8")} position={[0, 0.3, 0]} />
          <pointLight position={[0, 0.25, 0]} color="#ffc070" intensity={1.6 * (1 + 0.04 * Math.sin(t * 13 + x))} distance={2.2} decay={2} />
        </group>
      ))}
      {/* the jury box: rail, two tiers, six silhouettes facing the well */}
      <Blk a={[-4.6, 0, -3.3]} b={[-3.25, 0.3, 0.3]} m={wood(LP.woodDark)} />
      <Blk a={[-4.6, 0.3, -3.3]} b={[-4.0, 0.6, 0.3]} m={wood(LP.woodDark)} />
      <Blk a={[-3.25, 0, -3.3]} b={[-3.1, 1.0, 0.3]} m={wood(LP.wood)} />
      {[-2.6, -1.5, -0.4].map((z, k) => <Sil key={`j${k}`} id={`j${k}`} at={[-3.65, 0.3, z]} yaw={Math.PI / 2} t={t} seed={11 + k} hair={k === 1 ? "long" : "short"} />)}
      {[-2.9, -1.8, -0.7, 0.2].map((z, k) => <Sil key={`k${k}`} id={`k${k}`} at={[-4.3, 0.6, z]} yaw={Math.PI / 2} t={t} seed={21 + k} hair={k % 2 ? "bun" : "short"} build={k === 2 ? "broad" : undefined} />)}
      {/* gallery: a low rail with a gate, benches, a few silhouettes */}
      {[-1, 1].map((k) => <Blk key={k} a={[k > 0 ? 0.7 : -5, 0.85, 2.15]} b={[k > 0 ? 5 : -0.7, 0.95, 2.3]} m={wood(LP.woodLight)} />)}
      {Array.from({ length: 12 }, (_, k) => { const x = (k < 6 ? -4.7 : 0.9) + (k % 6) * 0.75; return <Blk key={`b${k}`} a={[x, 0, 2.2]} b={[x + 0.06, 0.85, 2.26]} m={wood(LP.wood)} />; })}
      {[3.2, 4.3, 5.4].map((z) => [-1, 1].map((k) => <Blk key={`${z}${k}`} a={[k > 0 ? 0.8 : -5, 0.42, z - 0.25]} b={[k > 0 ? 5 : -0.8, 0.48, z + 0.25]} m={wood(LP.woodDark)} />))}
      {[[-3.2, 3.4], [-1.6, 3.4], [2.1, 3.4], [3.6, 4.5], [-2.4, 4.5], [1.4, 5.6], [-4.0, 5.6]].map(([x, z], k) => <Sil key={`g${k}`} id={`g${k}`} at={[x, 0, z + 0.05]} yaw={Math.PI} t={t} seed={31 + k} hair={k % 3 === 1 ? "long" : k % 3 === 2 ? "curly" : "short"} />)}
      {/* the hero light: a warm spotlight on the bench with visible dust, plus a softer one over the well */}
      <SpotBeam from={[0.6, 5.9, -2.0]} to={[0, 1.4, -4.6]} t={t} intensity={70} angle={0.3} cone={0.15} dust={80} seed={1} />
      <SpotBeam from={[-0.4, 5.9, 2.4]} to={[0, 0, 0.6]} t={t} intensity={34} angle={0.42} cone={0.06} dust={40} seed={3} />
    </>
  ),
};

// ------------------------------------------------------------------ evidence room
const evidence: LawSet = {
  id: "evidence", bg: "#05080f", mood: "evidence",
  anchors: { centre: [0, 0, 0], table: [0, 0.9, 0], left: [-1.6, 0, 0.9], right: [1.6, 0, 0.9], back: [0, 0, -1.6], front: [0, 0, 1.4], high: [0, 2.2, 0] },
  blockers: [blocker("set.table", [-1.15, 0, -0.55], [1.15, 0.9, 0.55])],
  render: (t) => (
    <>
      <mesh geometry={geoOf("lsBgDome", () => new THREE.SphereGeometry(80, 16, 10))} material={(() => { const m = bmat("#04060c"); m.side = THREE.BackSide; return m; })()} />
      <mesh geometry={PLANE()} material={plastic("#141c2e", { rough: 0.9 })} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} receiveShadow />
      {/* the table: dark wood top on four legs, a felt pad */}
      <Blk a={[-1.15, 0.85, -0.55]} b={[1.15, 0.9, 0.55]} m={wood(LP.wood)} />
      <mesh geometry={PLANE()} material={plastic("#1c2a3c", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.902, 0]} scale={[2.0, 0.9, 1]} receiveShadow />
      {[[-1.05, -0.45], [1.05, -0.45], [-1.05, 0.45], [1.05, 0.45]].map(([x, z], k) => <Blk key={k} a={[x - 0.05, 0, z - 0.05]} b={[x + 0.05, 0.85, z + 0.05]} m={wood(LP.woodDark)} />)}
      {/* shelving in the dark behind: racks of evidence boxes */}
      {[-2.6, 0, 2.6].map((x, i) => (
        <group key={i} position={[x, 0, -3.2]}>
          {[0.02, 0.9, 1.8].map((y) => <Blk key={y} a={[-1.2, y, -0.3]} b={[1.2, y + 0.04, 0.3]} m={plastic("#3a3e48", { rough: 0.6 })} />)}
          {[-1.18, 1.18].map((dx) => <Blk key={dx} a={[dx - 0.03, 0, -0.3]} b={[dx + 0.03, 2.6, 0.3]} m={plastic("#3a3e48", { rough: 0.6 })} />)}
          {Array.from({ length: 6 }, (_, k) => <group key={k} position={[-0.75 + (k % 3) * 0.75, 0.06 + Math.floor(k / 3) * 0.9, 0]}><KitMesh sp={{ kit: "box", text: `CASE ${1990 + i * 7 + k}` }} t={t} strike={0} /></group>)}
        </group>
      ))}
      <SpotBeam from={[0, 4.6, 0.3]} to={[0, 0.9, 0]} t={t} intensity={60} angle={0.36} cone={0.17} dust={90} seed={5} flicker={0.08} />
      <SpotBeam from={[-3, 4, -1.5]} to={[-2.6, 1, -3.2]} t={t} color="#8fb4ff" intensity={8} angle={0.3} cone={0.04} dust={12} seed={9} />
    </>
  ),
};

// ------------------------------------------------------------------ case-file desk
const deskTex = () => canvasTexture("lsDesk", 512, 512, (g, W, H) => {
  g.fillStyle = "#5a3520"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 90; k++) { g.strokeStyle = `rgba(${k % 2 ? "30,15,5" : "120,70,40"},${0.08 + 0.1 * hash(k)})`; g.lineWidth = 1 + 3 * hash(k + 1); g.beginPath(); const y = hash(k + 7) * H; g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + 10 * Math.sin(k), W * 0.6, y - 12, W, y + 6 * Math.cos(k)); g.stroke(); }
});
const casefile: LawSet = {
  id: "casefile", bg: "#0c0907", mood: "casefile",
  anchors: { centre: [0, 0.78, 0], desk: [0, 0.78, 0], left: [-0.8, 0.78, 0.1], right: [0.8, 0.78, 0.1], back: [0, 0.78, -0.45], front: [0, 0.78, 0.45], lamp: [-1.15, 0.78, -0.5], high: [0, 2.4, 0.4] },
  blockers: [],
  render: (t) => (
    <>
      <mesh geometry={geoOf("lsBgDome", () => new THREE.SphereGeometry(80, 16, 10))} material={(() => { const m = bmat("#0a0706"); m.side = THREE.BackSide; return m; })()} />
      <mesh geometry={PLANE()} material={plastic("#1c1410", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} scale={[20, 20, 1]} receiveShadow />
      <Blk a={[-1.6, 0.72, -0.85]} b={[1.6, 0.78, 0.85]} m={plastic("#ffffff", { rough: 0.5, map: deskTex() })} />
      <Blk a={[-1.55, 0, -0.8]} b={[-0.9, 0.72, 0.8]} m={wood(LP.woodDark)} />
      <Blk a={[0.9, 0, -0.8]} b={[1.55, 0.72, 0.8]} m={wood(LP.woodDark)} />
      {/* a green desk blotter */}
      <mesh geometry={PLANE()} material={plastic("#1f3a2a", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.782, 0.05]} scale={[1.5, 0.95, 1]} receiveShadow />
      {/* scattered paperwork that is always there (the recipe's own props sit on top) */}
      {[[-1.05, 0.25, 0.4, "photo", "shop"], [1.15, -0.4, -0.3, "photo", "person"], [-0.95, -0.35, 0.2, "paper", "NOTES"], [1.2, 0.4, 0.5, "folder", "ARCHIVE"]].map(([x, z, r, k, txt], i) => (
        <group key={i} position={[x as number, 0.785 + i * 0.002, z as number]} rotation={[0, r as number, 0]}>
          <KitMesh sp={{ kit: k as "photo", text: txt as string, photo: txt as string }} t={t} strike={0} />
        </group>
      ))}
      {/* coffee mug and a pen */}
      <group position={[1.25, 0.78, -0.05]}>
        <mesh geometry={geoOf("lsMug", () => new THREE.CylinderGeometry(0.06, 0.055, 0.13, 12))} material={plastic("#e8e0d0", { rough: 0.4 })} position={[0, 0.065, 0]} castShadow />
        <mesh geometry={geoOf("lsMugIn", () => new THREE.CircleGeometry(0.052, 12))} material={plastic("#2a160a", { rough: 0.2 })} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <mesh geometry={geoOf("lsMugH", () => new THREE.TorusGeometry(0.035, 0.01, 4, 10))} material={plastic("#e8e0d0", { rough: 0.4 })} position={[0.065, 0.07, 0]} />
        {/* steam */}
        {[0, 1, 2].map((k) => { const u = (t * 0.4 + k / 3) % 1; return <mesh key={k} geometry={geoOf("lsSteam", () => new THREE.IcosahedronGeometry(0.03, 0))} material={bmat("#ffffff", Math.round(0.25 * (1 - u) * 20) / 20)} position={[0.02 * Math.sin(t * 2 + k), 0.15 + u * 0.3, 0]} scale={1 + 2 * u} />; })}
      </group>
      <mesh geometry={geoOf("lsPen", () => new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6))} material={plastic(LP.gold, { rough: 0.3 })} position={[0.55, 0.79, 0.55]} rotation={[0, 0.4, Math.PI / 2]} />
      {/* the brass desk lamp with a green shade */}
      <group position={[-1.15, 0.78, -0.5]}>
        <mesh geometry={geoOf("lsDLBase", () => new THREE.CylinderGeometry(0.1, 0.12, 0.03, 12))} material={plastic(LP.gold, { rough: 0.3 })} position={[0, 0.015, 0]} />
        <mesh geometry={geoOf("lsDLStem", () => new THREE.CylinderGeometry(0.014, 0.014, 0.42, 6))} material={plastic(LP.gold, { rough: 0.3 })} position={[0, 0.22, 0]} />
        <mesh geometry={geoOf("lsDLShade", () => new THREE.CylinderGeometry(0.06, 0.06, 0.34, 10, 1, false, 0, Math.PI))} material={plastic("#1f5a36", { rough: 0.4, side: THREE.DoubleSide })} position={[0.12, 0.44, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={geoOf("lsDLBulb", () => new THREE.CylinderGeometry(0.02, 0.02, 0.26, 6))} material={bmat("#ffe7b0")} position={[0.12, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>
      <SpotBeam from={[-1.0, 1.2, -0.5]} to={[0.1, 0.78, 0.1]} t={t} intensity={14} angle={0.75} cone={0.05} dust={40} seed={4} />
      <SpotBeam from={[1.0, 3.6, 1.4]} to={[0, 0.78, 0]} t={t} intensity={24} angle={0.34} cone={0.06} dust={30} seed={6} />
    </>
  ),
};

// ------------------------------------------------------------------ headline wall
const corkTex = () => canvasTexture("lsCork", 256, 256, (g, W, H) => {
  g.fillStyle = "#6a4a30"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${hash(k) > 0.5 ? "30,18,8" : "160,120,80"},0.25)`; g.fillRect(hash(k + 1) * W, hash(k + 2) * H, 2, 2); }
});
const FILLER = ["CITY HALL BUDGET VOTE", "STORM HITS COAST", "LOCAL TEAM WINS", "COURT TO HEAR APPEAL", "NEW BRIDGE OPENS", "JURY SELECTED", "MARKET RALLIES", "SCHOOL BOARD SPLITS"];
const headlines: LawSet = {
  id: "headlines", bg: "#0a0e18", mood: "headlines",
  anchors: { centre: [0, 0, 0], wall: [0, 1.7, -1.94], left: [-1.1, 1.7, -1.94], right: [1.1, 1.7, -1.94], high: [0, 2.4, -1.94], low: [0, 1.0, -1.94], floor: [0, 0, 0] },
  blockers: [],
  render: (t) => (
    <>
      <mesh geometry={geoOf("lsBgDome", () => new THREE.SphereGeometry(80, 16, 10))} material={(() => { const m = bmat("#070a12"); m.side = THREE.BackSide; return m; })()} />
      <mesh geometry={PLANE()} material={plastic("#16120e", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} scale={[20, 20, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 1, map: tiled(corkTex(), 6, 3) })} position={[0, 1.6, -2.0]} scale={[7, 3.4, 1]} receiveShadow />
      <Blk a={[-3.6, -0.0, -2.08]} b={[3.6, 0.1, -1.98]} m={wood(LP.woodDark)} />
      <Blk a={[-3.6, 3.3, -2.08]} b={[3.6, 3.4, -1.98]} m={wood(LP.woodDark)} />
      {/* filler pages: generic headlines, tilted, pinned */}
      {Array.from({ length: 14 }, (_, k) => {
        const x = -3.1 + (k % 7) * 1.02 + 0.15 * (hash(k) - 0.5), y = k < 7 ? 2.35 : 0.65, r = 0.12 * (hash(k + 4) - 0.5);
        if (Math.abs(x) < 1.6 && k >= 0 && (k % 7 === 2 || k % 7 === 3 || k % 7 === 4)) return null; // keep the middle free for the recipe's pages
        return (
          <group key={k} position={[x, y - 0.38, -1.985]} rotation={[0, 0, r]}>
            <KitMesh sp={{ kit: "newspaper", text: FILLER[k % FILLER.length] }} t={t + k} strike={0} />
            <mesh geometry={geoOf("lsPin", () => new THREE.SphereGeometry(0.02, 6, 4))} material={plastic(LP.red, { rough: 0.3 })} position={[0, 0.72, 0.02]} />
          </group>
        );
      })}
      {/* red string between pins (it sways a little) */}
      {[[-2.9, 2.69, -0.2, 2.6], [-0.2, 2.6, 2.9, 1.0], [-1.9, 0.99, 0.3, 1.2]].map(([x0, y0, x1, y1], k) => {
        const dx = x1 - x0, dy = y1 - y0 + 0.02 * Math.sin(t * 1.3 + k), L = Math.hypot(dx, dy);
        return <mesh key={k} geometry={BOX()} material={plastic("#c0302a", { rough: 0.5 })} position={[(x0 + x1) / 2, (y0 + y1) / 2, -1.96]} rotation={[0, 0, Math.atan2(dy, dx)]} scale={[L, 0.012, 0.012]} />;
      })}
      <SpotBeam from={[2.6, 3.4, 1.6]} to={[0, 1.6, -1.95]} t={t} intensity={36} angle={0.42} cone={0.08} dust={60} seed={8} />
      <SpotBeam from={[-2.8, 3.2, 1.2]} to={[-1.2, 1.4, -1.95]} t={t} color="#8fb4ff" intensity={10} angle={0.35} cone={0.04} dust={20} seed={12} />
    </>
  ),
};

// ------------------------------------------------------------------ courthouse steps (night)
const skyTex = () => canvasTexture("lsNight", 8, 256, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#050914"); gr.addColorStop(0.45, "#13244a"); gr.addColorStop(0.52, "#2a3c66"); gr.addColorStop(1, "#1a2540");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});
let night: THREE.MeshBasicMaterial | null = null;
const nightMat = () => { if (!night) night = new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }); return night; };
const STEP_N = 8, STEP_RISE = 0.2, STEP_RUN = 0.5, STEP_Z0 = 6;
/** the walkable height of the steps at z (for anchors) */
export const stepY = (z: number) => { const k = Math.floor((STEP_Z0 - z) / STEP_RUN); return z >= STEP_Z0 ? 0 : Math.min(STEP_N, k + 1) * STEP_RISE; };
const STARS = Array.from({ length: 60 }, (_, k) => ({ a: hash(k + 1) * Math.PI - Math.PI, e: 0.25 + 0.9 * hash(k + 2), s: 0.15 + 0.3 * hash(k + 3) }));
const steps: LawSet = {
  id: "steps", bg: "#0c1428", mood: "steps",
  anchors: { centre: [0, 0, 7], bottom: [0, 0, 7], steps: [0, stepY(4.2), 4.2], top: [0, STEP_N * STEP_RISE, 1.6], door: [0, STEP_N * STEP_RISE, 0.3], left: [-2.6, 0, 7.4], right: [2.6, 0, 7.4], plaza: [0, 0, 9.5], high: [0, 5, 8] },
  blockers: [],
  render: (t) => (
    <>
      <mesh geometry={geoOf("lsNightDome", () => new THREE.SphereGeometry(300, 16, 12))} material={nightMat()} />
      {STARS.map((s, k) => <mesh key={k} geometry={geoOf("lsStar", () => new THREE.IcosahedronGeometry(1, 0))} material={bmat("#dfe8ff", Math.round((0.5 + 0.5 * Math.abs(Math.sin(t * (0.5 + s.s) + k))) * 10) / 10)} position={[200 * Math.cos(s.e) * Math.sin(s.a), 200 * Math.sin(s.e), -200 * Math.cos(s.e) * Math.cos(s.a) * 0.6 - 60]} scale={s.s} />)}
      {/* the plaza */}
      <mesh geometry={PLANE()} material={plastic("#2a2e3a", { rough: 0.9 })} rotation={[-Math.PI / 2, 0, 0]} scale={[80, 60, 1]} position={[0, 0, 10]} receiveShadow />
      {/* steps */}
      {Array.from({ length: STEP_N }, (_, k) => <Blk key={k} a={[-6, 0, -1]} b={[6, (k + 1) * STEP_RISE, STEP_Z0 - k * STEP_RUN]} m={plastic(k % 2 ? "#8e8a84" : "#9a958c", { rough: 0.85, flat: true })} />)}
      {/* the building: columns, an architrave, a plain pediment with a gold line, glowing doors */}
      <Blk a={[-6.2, STEP_N * STEP_RISE, -6]} b={[6.2, 8.5, -1]} m={plastic("#8a8478", { rough: 0.9 })} />
      {Array.from({ length: 6 }, (_, k) => {
        const x = -4.5 + k * 1.8;
        return (
          <group key={k} position={[x, STEP_N * STEP_RISE, 1.0]}>
            <mesh geometry={geoOf("lsCol", () => new THREE.CylinderGeometry(0.32, 0.36, 5.6, 12))} material={plastic(LP.stone, { rough: 0.8, flat: true })} position={[0, 2.8, 0]} castShadow receiveShadow />
            <Blk a={[-0.45, 0, -0.45]} b={[0.45, 0.25, 0.45]} m={plastic("#a8a194", { rough: 0.9 })} />
            <Blk a={[-0.45, 5.6, -0.45]} b={[0.45, 5.85, 0.45]} m={plastic("#a8a194", { rough: 0.9 })} />
          </group>
        );
      })}
      <Blk a={[-6.2, STEP_N * STEP_RISE + 5.85, -1]} b={[6.2, STEP_N * STEP_RISE + 6.6, 1.6]} m={plastic("#b0a99c", { rough: 0.85 })} />
      <mesh geometry={geoOf("lsPed", () => { const s = new THREE.Shape(); s.moveTo(-6.4, 0); s.lineTo(6.4, 0); s.lineTo(0, 2.0); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 2.6, bevelEnabled: false }); g.translate(0, 0, -1); return g; })} material={plastic("#b0a99c", { rough: 0.85, flat: true })} position={[0, STEP_N * STEP_RISE + 6.6, 0]} castShadow />
      <mesh geometry={geoOf("lsPedLine", () => new THREE.BoxGeometry(12.4, 0.06, 0.05))} material={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.5 })} position={[0, STEP_N * STEP_RISE + 6.62, 1.62]} />
      {[-1.6, 0, 1.6].map((x) => (
        <group key={x}>
          <mesh geometry={PLANE()} material={bmat("#ffcf86")} position={[x, STEP_N * STEP_RISE + 1.35, -0.99]} scale={[1.1, 2.7, 1]} />
          <Blk a={[x - 0.03, STEP_N * STEP_RISE, -0.99]} b={[x + 0.03, STEP_N * STEP_RISE + 2.7, -0.96]} m={wood(LP.woodDark)} cast={false} />
        </group>
      ))}
      <pointLight position={[0, STEP_N * STEP_RISE + 1.4, 0]} color="#ffc070" intensity={4} distance={9} decay={1.6} />
      {/* lamp posts */}
      {[-5, 5].map((x) => (
        <group key={x} position={[x, 0, 7.2]}>
          <mesh geometry={geoOf("lsPost", () => new THREE.CylinderGeometry(0.06, 0.1, 3.2, 8))} material={plastic("#1a1a1e", { rough: 0.5 })} position={[0, 1.6, 0]} castShadow />
          <mesh geometry={geoOf("lsGlobe", () => new THREE.SphereGeometry(0.24, 12, 8))} material={bmat("#ffe2a8")} position={[0, 3.35, 0]} />
          <pointLight position={[0, 3.3, 0]} color="#ffc070" intensity={4 * (1 + 0.05 * Math.sin(t * 11 + x))} distance={8} decay={1.6} />
        </group>
      ))}
      <SpotBeam from={[-5, 3.3, 7.2]} to={[-4.2, 0, 7.6]} t={t} intensity={0} angle={0.6} cone={0.06} dust={30} seed={13} light={false} />
      <SpotBeam from={[5, 3.3, 7.2]} to={[4.2, 0, 7.6]} t={t} intensity={0} angle={0.6} cone={0.06} dust={30} seed={14} light={false} />
      {/* drifting ground fog banks */}
      {Array.from({ length: 8 }, (_, k) => <mesh key={k} geometry={geoOf("lsFog", () => new THREE.IcosahedronGeometry(1, 1))} material={bmat("#3a4a70", 0.12)} position={[((k * 3.1 + t * 0.25) % 24) - 12, 0.2, 6.5 + (k % 3) * 1.6]} scale={[2.6, 0.4, 1.2]} />)}
    </>
  ),
};

export const LAW_SETS: Record<LawSetId, LawSet> = { courtroom, evidence, casefile, headlines, steps };
export const LAW_SET_IDS = Object.keys(LAW_SETS) as LawSetId[];

// storytime sets: small, bright, readable school sets with few props. Procedural only: no logos, no real brands.
//   classroom  back row (the leads) + two rows of classmates facing a green chalkboard; wall clock, posters, windows
//   hallway    two walls of lockers, tiled floor, ceiling lights, a bulletin board, double doors at the end
//   cafeteria  long tables with benches and trays, a serving counter, a wall of BIG windows (they shatter)
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import { SETS, deskOf } from "./layout";
import type { V3 } from "./layout";
import type { SetId } from "./types";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const flat = (c: string, r = 0.8) => plastic(c, { flat: true, rough: r });
const BOX = () => geoOf("stBox", () => new THREE.BoxGeometry(1, 1, 1));
const PLANE = () => geoOf("stPlane", () => new THREE.PlaneGeometry(1, 1));
const basic = new Map<string, THREE.MeshBasicMaterial>();
const bmat = (c: string, map?: THREE.Texture) => { const k = `${c}|${map?.uuid ?? ""}`; let m = basic.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, map: map ?? null, toneMapped: false, fog: false }); basic.set(k, m); } return m; };
/** a box from its min corner to its max corner */
const Blk: React.FC<{ a: V3; b: V3; m: THREE.Material; cast?: boolean }> = ({ a, b, m, cast = true }) => (
  <mesh geometry={BOX()} material={m} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} scale={[b[0] - a[0], b[1] - a[1], b[2] - a[2]]} castShadow={cast} receiveShadow />
);
const tiled = (tex: THREE.Texture, rx: number, ry: number) => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry); tex.needsUpdate = true; return tex; };
const texMat = (tex: THREE.Texture, r = 0.75) => plastic("#ffffff", { rough: r, map: tex });

// ------------------------------------------------------------------ textures
const woodFloor = () => canvasTexture("stWoodFloor", 256, 256, (g, W, H) => {
  g.fillStyle = "#e3b77c"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 8; k++) { g.fillStyle = `rgba(150,90,40,${0.06 + 0.1 * hash(k)})`; g.fillRect(0, k * 32, W, 32); g.fillStyle = "rgba(120,70,30,0.35)"; g.fillRect(0, k * 32, W, 2); g.fillRect(hash(k + 4) * W, k * 32, 2, 32); }
});
const tiles = (key: string, a: string, b: string) => canvasTexture(key, 128, 128, (g, W, H) => {
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 64, j * 64, 64, 64); }
  g.strokeStyle = "rgba(0,0,0,0.08)"; g.lineWidth = 2; g.strokeRect(0, 0, W, H); g.beginPath(); g.moveTo(64, 0); g.lineTo(64, H); g.moveTo(0, 64); g.lineTo(W, 64); g.stroke();
});
const chalkboard = () => canvasTexture("stBoard", 1024, 400, (g, W, H) => {
  g.fillStyle = "#2f6b4f"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.05)"; for (let k = 0; k < 30; k++) g.fillRect(hash(k) * W, hash(k + 9) * H, 120, 30);
  g.fillStyle = "rgba(245,245,235,0.92)"; g.font = "700 64px Poppins, sans-serif"; g.fillText("POP QUIZ FRIDAY", 60, 100);
  g.font = "700 54px Poppins, sans-serif"; g.fillText("2x + 3 = 11", 60, 200); g.fillText("x = ?", 60, 285);
  g.strokeStyle = "rgba(245,245,235,0.85)"; g.lineWidth = 6;
  g.beginPath(); g.arc(800, 200, 70, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(730, 200); g.lineTo(870, 200); g.moveTo(800, 130); g.lineTo(800, 270); g.stroke();
  g.font = "700 40px Poppins, sans-serif"; g.fillText("no phones in class!", 560, 360);
});
const poster = (key: string, bg: string, fg: string, word: string, icon: (g: CanvasRenderingContext2D) => void) => canvasTexture(key, 256, 340, (g, W, H) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(12, 12, W - 24, H - 24);
  g.fillStyle = fg; g.strokeStyle = fg; g.lineWidth = 10; icon(g);
  g.font = "800 56px Poppins, sans-serif"; g.textAlign = "center"; g.fillText(word, W / 2, H - 40);
});
const lockerTex = (key: string, c: string) => canvasTexture(key, 128, 512, (g, W, H) => {
  g.fillStyle = c; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
  g.fillStyle = "rgba(0,0,0,0.35)"; for (let k = 0; k < 5; k++) g.fillRect(30, 40 + k * 18, 68, 7);
  g.fillStyle = "#d9d9d9"; g.fillRect(92, 250, 14, 46);
  g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(8, 8, 10, H - 16);
});
const skyTex = () => canvasTexture("stSky", 512, 256, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#57a8ff"); gr.addColorStop(0.7, "#a9dcff"); gr.addColorStop(1, "#d9f2ff");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.9)"; for (const [x, y, r] of [[80, 60, 26], [110, 55, 32], [140, 62, 24], [360, 90, 22], [390, 82, 30], [420, 92, 22]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#6cc46a"; g.beginPath(); g.moveTo(0, H); g.quadraticCurveTo(W * 0.3, H * 0.62, W * 0.6, H * 0.85); g.quadraticCurveTo(W * 0.8, H * 0.7, W, H * 0.8); g.lineTo(W, H); g.fill();
  g.fillStyle = "#3f9a4c"; for (let k = 0; k < 7; k++) { const x = 30 + k * 72 + hash(k) * 20, y = H * 0.78; g.beginPath(); g.arc(x, y - 30, 30, 0, Math.PI * 2); g.fill(); g.fillStyle = "#6b4a2b"; g.fillRect(x - 5, y - 4, 10, 30); g.fillStyle = "#3f9a4c"; }
});

// ------------------------------------------------------------------ shared pieces
const Clock: React.FC<{ p: V3; t: number; yaw?: number; r?: number }> = ({ p, t, yaw = 0, r = 0.26 }) => {
  const face = canvasTexture("stClock", 256, 256, (g, W) => {
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#222"; for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; g.fillRect(W / 2 + Math.sin(a) * 100 - 5, W / 2 - Math.cos(a) * 100 - 5, 10, 10); }
  });
  const sec = (t * Math.PI) / 30, min = 1.3 + t * 0.02;
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={geoOf("stClockRim", () => new THREE.CylinderGeometry(1, 1, 0.08, 20))} material={flat("#2b2d42")} rotation={[Math.PI / 2, 0, 0]} scale={[r + 0.03, 1, r + 0.03]} />
      <mesh geometry={geoOf("stClockFace", () => new THREE.CircleGeometry(1, 24))} material={texMat(face)} position={[0, 0, 0.045]} scale={r} />
      <mesh geometry={BOX()} material={flat("#1b1b1b")} position={[Math.sin(min) * r * 0.25, Math.cos(min) * r * 0.25, 0.055]} rotation={[0, 0, -min]} scale={[0.025, r * 0.55, 0.01]} />
      <mesh geometry={BOX()} material={flat("#1b1b1b")} position={[Math.sin(min * 12) * r * 0.35, Math.cos(min * 12) * r * 0.35, 0.06]} rotation={[0, 0, -min * 12]} scale={[0.018, r * 0.75, 0.01]} />
      <mesh geometry={BOX()} material={flat("#e63946")} position={[Math.sin(sec) * r * 0.38, Math.cos(sec) * r * 0.38, 0.065]} rotation={[0, 0, -sec]} scale={[0.008, r * 0.8, 0.01]} />
    </group>
  );
};
const Desk: React.FC<{ p: V3; yaw: number; color?: string }> = ({ p, yaw, color = "#f2c46d" }) => (
  <group position={[p[0], 0, p[2]]} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.8, 0.05, 0.52, 0.015)} material={flat(color, 0.6)} position={[0, 0.66, 0]} castShadow receiveShadow />
    <Blk a={[-0.37, 0, -0.22]} b={[-0.33, 0.64, -0.18]} m={flat("#8d99ae")} />
    <Blk a={[0.33, 0, -0.22]} b={[0.37, 0.64, -0.18]} m={flat("#8d99ae")} />
    <Blk a={[-0.37, 0, 0.18]} b={[-0.33, 0.64, 0.22]} m={flat("#8d99ae")} />
    <Blk a={[0.33, 0, 0.18]} b={[0.37, 0.64, 0.22]} m={flat("#8d99ae")} />
    <Blk a={[-0.36, 0.52, -0.2]} b={[0.36, 0.55, 0.2]} m={flat("#6c7486")} />
  </group>
);
const Chair: React.FC<{ x: number; z: number; yaw: number }> = ({ x, z, yaw }) => (
  <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.44, 0.04, 0.42, 0.012)} material={flat("#4d7cfe", 0.6)} position={[0, 0.41, 0.03]} castShadow receiveShadow />
    <mesh geometry={rbox(0.44, 0.34, 0.04, 0.012)} material={flat("#4d7cfe", 0.6)} position={[0, 0.66, -0.2]} castShadow />
    <Blk a={[-0.2, 0, -0.17]} b={[-0.17, 0.4, -0.14]} m={flat("#8d99ae")} />
    <Blk a={[0.17, 0, -0.17]} b={[0.2, 0.4, -0.14]} m={flat("#8d99ae")} />
    <Blk a={[-0.2, 0, 0.2]} b={[-0.17, 0.4, 0.23]} m={flat("#8d99ae")} />
    <Blk a={[0.17, 0, 0.2]} b={[0.2, 0.4, 0.23]} m={flat("#8d99ae")} />
  </group>
);
const CeilingLight: React.FC<{ p: V3 }> = ({ p }) => (
  <mesh geometry={BOX()} material={plastic("#ffffff", { emissive: "#fffbe8", ei: 1.4 })} position={p} scale={[1.1, 0.05, 0.4]} />
);

// ------------------------------------------------------------------ classroom
const Classroom: React.FC<{ t: number }> = ({ t }) => {
  const S = SETS.classroom;
  const floor = texMat(tiled(woodFloor(), 8, 8), 0.7);
  const wall = flat("#a8d8ea", 0.9), wall2 = flat("#f7e3af", 0.9), base = flat("#5c6b8a");
  const kids = [S.marks.me, S.marks.homie, ...S.extras];
  const posters = [
    poster("stP1", "#ff8c42", "#ffffff", "READ!", (g) => { g.fillRect(70, 70, 50, 120); g.fillRect(136, 70, 50, 120); }),
    poster("stP2", "#9b5de5", "#ffffff", "SPACE", (g) => { g.beginPath(); g.arc(128, 130, 60, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(128, 130, 105, 22, -0.3, 0, Math.PI * 2); g.stroke(); }),
    poster("stP3", "#06a6a0", "#ffffff", "A B C", (g) => { g.font = "800 110px Poppins, sans-serif"; g.textAlign = "center"; g.fillText("Aa", 128, 180); }),
  ];
  return (
    <group>
      <mesh geometry={PLANE()} material={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} scale={[9, 10, 1]} receiveShadow />
      {/* walls: back (behind the leads), front (board), sides; skirting */}
      <Blk a={[-4.5, 0, 3.8]} b={[4.5, 3.4, 3.9]} m={wall} cast={false} />
      <Blk a={[-4.5, 0, -5.0]} b={[4.5, 3.4, -4.9]} m={wall} cast={false} />
      <Blk a={[-4.3, 0, -5]} b={[-4.2, 3.4, 3.9]} m={wall2} cast={false} />
      <Blk a={[4.2, 0, -5]} b={[4.3, 3.4, 3.9]} m={wall2} cast={false} />
      <Blk a={[-4.5, 0, 3.75]} b={[4.5, 0.18, 3.8]} m={base} cast={false} />
      <Blk a={[-4.5, 3.4, -5]} b={[4.5, 3.45, 3.9]} m={flat("#fbfbf6")} cast={false} />
      {[-3.2, 0, 3.2].map((z) => [-1.6, 1.6].map((x) => <CeilingLight key={`${x}${z}`} p={[x, 3.38, z]} />))}
      {/* the chalkboard + tray, the teacher's desk */}
      <Blk a={[-2.0, 0.85, -4.92]} b={[2.0, 2.45, -4.86]} m={flat("#b07a45")} />
      <mesh geometry={PLANE()} material={texMat(chalkboard(), 0.95)} position={[0, 1.65, -4.85]} scale={[3.8, 1.45, 1]} />
      <Blk a={[-2.0, 0.82, -4.86]} b={[2.0, 0.86, -4.74]} m={flat("#b07a45")} />
      <Blk a={[1.4, 0, -4.2]} b={[3.0, 0.78, -3.5]} m={flat("#c98d4b")} />
      <Clock p={[-2.9, 2.55, -4.85]} t={t} r={0.3} />
      {/* back wall (seen behind the leads' close-ups): a clock, posters, cubbies */}
      <Clock p={[1.55, 2.15, 3.74]} t={t} yaw={Math.PI} r={0.27} />
      {posters.map((tex, i) => <mesh key={i} geometry={PLANE()} material={texMat(tex, 0.9)} position={[-2.4 + i * 1.05 - (i > 0 ? 0 : 0), 1.85, 3.74]} rotation={[0, Math.PI, 0]} scale={[0.66, 0.88, 1]} />)}
      {[-2.9, -1.9].map((x, i) => <mesh key={i} geometry={PLANE()} material={texMat(posters[(i + 1) % 3], 0.9)} position={[x + 5.9, 1.75, 3.74]} rotation={[0, Math.PI, 0]} scale={[0.6, 0.8, 1]} />)}
      <Blk a={[-4.2, 0, 3.3]} b={[-2.9, 1.0, 3.75]} m={flat("#f4a259")} />
      {[0, 1, 2].map((k) => <Blk key={k} a={[-4.1 + k * 0.42, 0.12, 3.29]} b={[-3.75 + k * 0.42, 0.88, 3.3]} m={flat(["#ef476f", "#118ab2", "#06d6a0"][k])} cast={false} />)}
      {/* windows on the right wall (sunny) */}
      {[-2.8, -0.6, 1.6].map((z, i) => (
        <group key={i}>
          <mesh geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[4.19, 1.75, z]} rotation={[0, -Math.PI / 2, 0]} scale={[1.6, 1.5, 1]} />
          <Blk a={[4.12, 0.98, z - 0.84]} b={[4.2, 1.02, z + 0.84]} m={flat("#ffffff")} />
          <Blk a={[4.12, 2.48, z - 0.84]} b={[4.2, 2.52, z + 0.84]} m={flat("#ffffff")} />
          <Blk a={[4.12, 1.0, z - 0.03]} b={[4.2, 2.5, z + 0.03]} m={flat("#ffffff")} />
        </group>
      ))}
      {/* desks + chairs for everyone */}
      {kids.map((k, i) => { const d = deskOf(k); return <React.Fragment key={i}><Desk p={d} yaw={k.yaw} color={i < 2 ? "#f2c46d" : "#e9b95f"} /><Chair x={k.x} z={k.z} yaw={k.yaw} /></React.Fragment>; })}
      {/* stuff on the leads' desks: a notebook and a pencil */}
      <mesh geometry={rbox(0.24, 0.02, 0.3, 0.005)} material={flat("#ffffff")} position={[deskOf(S.marks.me)[0] + 0.1, 0.695, deskOf(S.marks.me)[2]]} rotation={[0, 0.2, 0]} />
      <mesh geometry={rbox(0.24, 0.02, 0.3, 0.005)} material={flat("#ffd166")} position={[deskOf(S.marks.homie)[0] - 0.12, 0.695, deskOf(S.marks.homie)[2]]} rotation={[0, -0.3, 0]} />
    </group>
  );
};

// ------------------------------------------------------------------ hallway
const Hallway: React.FC<{ t: number }> = () => {
  const floor = texMat(tiled(tiles("stHallTiles", "#e9e4d8", "#c9d6e3"), 3, 22), 0.5);
  const lockL = texMat(tiled(lockerTex("stLockA", "#3a86ff"), 1, 1), 0.5), lockR = texMat(tiled(lockerTex("stLockB", "#ff9f1c"), 1, 1), 0.5);
  const wall = flat("#f1f3d0", 0.9);
  const n = 40, z0 = -15;
  return (
    <group>
      <mesh geometry={PLANE()} material={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} scale={[3.6, 22, 1]} receiveShadow />
      <Blk a={[-1.9, 0, z0]} b={[-1.8, 3.1, 6]} m={wall} cast={false} />
      <Blk a={[1.8, 0, z0]} b={[1.9, 3.1, 6]} m={wall} cast={false} />
      <Blk a={[-1.9, 3.1, z0]} b={[1.9, 3.15, 6]} m={flat("#fbfbf6")} cast={false} />
      {Array.from({ length: 8 }, (_, k) => <CeilingLight key={k} p={[0, 3.08, 4 - k * 2.4]} />)}
      {/* lockers: a row on each wall (a bulletin board breaks the left row) */}
      {Array.from({ length: n }, (_, k) => {
        const z = 5 - k * 0.5;
        const gap = z < -1.6 && z > -3.6;
        return (
          <React.Fragment key={k}>
            {gap ? null : <mesh geometry={BOX()} material={lockL} position={[-1.62, 1.0, z]} scale={[0.36, 1.85, 0.48]} castShadow receiveShadow />}
            <mesh geometry={BOX()} material={lockR} position={[1.62, 1.0, z]} scale={[0.36, 1.85, 0.48]} castShadow receiveShadow />
          </React.Fragment>
        );
      })}
      <Blk a={[-1.8, 0, -3.7]} b={[-1.79, 2.0, -1.5]} m={flat("#cfd8dc")} cast={false} />
      <Blk a={[-1.8, 1.0, -3.4]} b={[-1.74, 2.2, -1.8]} m={flat("#c58b55")} />
      {[["#ffd166", -3.2, 1.9], ["#ef476f", -2.6, 1.55], ["#8ecae6", -2.15, 1.95], ["#ffffff", -2.9, 1.3]].map(([c, z, y], i) => <Blk key={i} a={[-1.74, (y as number) - 0.16, (z as number) - 0.13]} b={[-1.73, (y as number) + 0.16, (z as number) + 0.13]} m={flat(c as string)} cast={false} />)}
      {/* the end: double doors with windows, a green exit sign */}
      <Blk a={[-1.9, 0, z0 - 0.1]} b={[1.9, 3.1, z0]} m={wall} cast={false} />
      <Blk a={[-0.9, 0, z0 + 0.02]} b={[0.9, 2.3, z0 + 0.08]} m={flat("#7a8ba8")} />
      <mesh geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[-0.45, 1.6, z0 + 0.09]} scale={[0.5, 0.6, 1]} />
      <mesh geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[0.45, 1.6, z0 + 0.09]} scale={[0.5, 0.6, 1]} />
      <mesh geometry={BOX()} material={plastic("#27c46b", { emissive: "#27c46b", ei: 1.2 })} position={[0, 2.6, z0 + 0.1]} scale={[0.6, 0.22, 0.06]} />
    </group>
  );
};

// ------------------------------------------------------------------ cafeteria
const Tray: React.FC<{ p: V3; yaw: number; seed: number }> = ({ p, yaw, seed }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.46, 0.03, 0.34, 0.01)} material={flat(seed % 2 ? "#57cc99" : "#ff9f1c", 0.5)} castShadow receiveShadow />
    {/* a pizza slice, an apple, a milk carton */}
    <mesh geometry={geoOf("stSlice", () => { const s = new THREE.Shape(); s.moveTo(0, 0.12); s.lineTo(-0.08, -0.08); s.lineTo(0.08, -0.08); s.lineTo(0, 0.12); return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }); })} material={flat("#ffcf56")} position={[-0.08, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0.4]} />
    <mesh geometry={geoOf("stApple", () => new THREE.IcosahedronGeometry(0.05, 0))} material={flat("#e63946")} position={[0.12, 0.07, 0.07]} />
    <mesh geometry={rbox(0.07, 0.12, 0.07, 0.008)} material={flat("#ffffff")} position={[0.13, 0.09, -0.08]} />
    <mesh geometry={rbox(0.072, 0.03, 0.072, 0.006)} material={flat("#3a86ff")} position={[0.13, 0.13, -0.08]} />
  </group>
);
const Table: React.FC<{ x0: number; x1: number; z: number }> = ({ x0, x1, z }) => (
  <group>
    <mesh geometry={rbox(x1 - x0, 0.06, 1.0, 0.02)} material={flat("#f4f1de", 0.5)} position={[(x0 + x1) / 2, 0.63, z]} castShadow receiveShadow />
    {[x0 + 0.2, x1 - 0.2].map((x, i) => <Blk key={i} a={[x - 0.04, 0, z - 0.3]} b={[x + 0.04, 0.6, z + 0.3]} m={flat("#8d99ae")} />)}
    {[-0.72, 0.72].map((dz, i) => <mesh key={i} geometry={rbox(x1 - x0, 0.05, 0.32, 0.015)} material={flat("#e76f51", 0.6)} position={[(x0 + x1) / 2, 0.4, z + dz]} castShadow receiveShadow />)}
    {[-0.72, 0.72].map((dz, i) => <Blk key={`l${i}`} a={[(x0 + x1) / 2 - 0.05, 0, z + dz - 0.1]} b={[(x0 + x1) / 2 + 0.05, 0.38, z + dz + 0.1]} m={flat("#8d99ae")} />)}
  </group>
);

const Cafeteria: React.FC<{ t: number; broken: number | null }> = ({ t, broken }) => {
  const S = SETS.cafeteria, Wd = S.windows!;
  const floor = texMat(tiled(tiles("stCafTiles", "#f2e8cf", "#d8e2dc"), 8, 7), 0.5);
  const wall = flat("#ffd6a5", 0.9), wallB = flat("#cde7b0", 0.9), frame = flat("#ffffff", 0.5);
  const glass = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4f1ff", transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, depthWrite: false }), []);
  const isBroken = broken !== null && t >= broken;
  return (
    <group>
      <mesh geometry={PLANE()} material={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} scale={[13, 10, 1]} receiveShadow />
      {/* back wall (behind me) with the serving counter */}
      <Blk a={[-6.5, 0, 5.2]} b={[6.5, 3.8, 5.3]} m={wall} cast={false} />
      <Blk a={[-3.5, 0, 4.3]} b={[3.5, 1.0, 5.2]} m={flat("#adb5bd", 0.4)} />
      <Blk a={[-3.5, 1.0, 4.25]} b={[3.5, 1.06, 5.2]} m={flat("#e9ecef", 0.3)} />
      <Blk a={[-3.5, 1.06, 4.3]} b={[3.5, 1.5, 4.34]} m={plastic("#e8f6ff", { transparent: true, opacity: 0.3 })} cast={false} />
      <mesh geometry={PLANE()} material={texMat(poster("stMenu", "#264653", "#ffd166", "LUNCH", (g) => { g.font = "700 34px Poppins, sans-serif"; g.textAlign = "center"; for (let k = 0; k < 4; k++) g.fillText(["PIZZA", "TACOS", "SALAD", "MILK"][k], 128, 70 + k * 46); }), 0.9)} position={[0, 2.5, 5.18]} rotation={[0, Math.PI, 0]} scale={[1.6, 1.4, 1]} />
      {/* side walls */}
      <Blk a={[-6.6, 0, -4.4]} b={[-6.5, 3.8, 5.3]} m={wallB} cast={false} />
      <Blk a={[6.5, 0, -4.4]} b={[6.6, 3.8, 5.3]} m={wallB} cast={false} />
      <Blk a={[-6.6, 3.8, -4.4]} b={[6.6, 3.85, 5.3]} m={flat("#fbfbf6")} cast={false} />
      {[-3.5, 0, 3.5].map((x) => [-2.2, 1.0, 3.6].map((z) => <CeilingLight key={`${x}${z}`} p={[x, 3.78, z]} />))}
      {/* the window wall: a low wall, BIG windows (2 x 2 panes each), the sky + trees outside */}
      <Blk a={[-6.6, 0, Wd.z - 0.15]} b={[6.6, Wd.y0, Wd.z]} m={wall} cast={false} />
      <Blk a={[-6.6, Wd.y1, Wd.z - 0.15]} b={[6.6, 3.85, Wd.z]} m={wall} cast={false} />
      {[-6.6, ...Wd.xs.flatMap((x) => [x - Wd.w / 2, x + Wd.w / 2]), 6.6].reduce<[number, number][]>((o, x, i, a) => (i % 2 === 0 && i + 1 < a.length ? [...o, [x, a[i + 1]]] : o), []).map(([a, b], i) => b - a > 0.01 ? <Blk key={`p${i}`} a={[a, Wd.y0, Wd.z - 0.15]} b={[b, Wd.y1, Wd.z]} m={wall} cast={false} /> : null)}
      <mesh geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[0, 2.3, Wd.z - 2.6]} scale={[18, 6, 1]} />
      {Wd.xs.map((x, i) => (
        <group key={i}>
          {/* frame + mullions */}
          <Blk a={[x - Wd.w / 2, Wd.y0 - 0.05, Wd.z - 0.12]} b={[x + Wd.w / 2, Wd.y0 + 0.04, Wd.z + 0.04]} m={frame} />
          <Blk a={[x - Wd.w / 2, Wd.y1 - 0.04, Wd.z - 0.12]} b={[x + Wd.w / 2, Wd.y1 + 0.05, Wd.z + 0.04]} m={frame} />
          <Blk a={[x - Wd.w / 2 - 0.04, Wd.y0, Wd.z - 0.12]} b={[x - Wd.w / 2 + 0.05, Wd.y1, Wd.z + 0.04]} m={frame} />
          <Blk a={[x + Wd.w / 2 - 0.05, Wd.y0, Wd.z - 0.12]} b={[x + Wd.w / 2 + 0.04, Wd.y1, Wd.z + 0.04]} m={frame} />
          <Blk a={[x - 0.035, Wd.y0, Wd.z - 0.1]} b={[x + 0.035, Wd.y1, Wd.z + 0.03]} m={frame} />
          <Blk a={[x - Wd.w / 2, (Wd.y0 + Wd.y1) / 2 - 0.035, Wd.z - 0.1]} b={[x + Wd.w / 2, (Wd.y0 + Wd.y1) / 2 + 0.035, Wd.z + 0.03]} m={frame} />
          {/* the glass: whole panes before the shatter, jagged leftovers after */}
          {!isBroken ? (
            <mesh geometry={PLANE()} material={glass} position={[x, (Wd.y0 + Wd.y1) / 2, Wd.z - 0.04]} scale={[Wd.w - 0.08, Wd.y1 - Wd.y0 - 0.08, 1]} />
          ) : (
            [0, 1, 2, 3].map((q) => {
              const cx = x + (q % 2 ? 1 : -1) * Wd.w / 4, cy = (Wd.y0 + Wd.y1) / 2 + (q < 2 ? 1 : -1) * (Wd.y1 - Wd.y0) / 4;
              return <mesh key={q} geometry={geoOf(`stJag${q}`, () => { const w = 0.7, h = 0.66; const a = new THREE.Shape(); a.moveTo(-w, -h); a.lineTo(-w + 0.32, -h); a.lineTo(-w + 0.1, -h + 0.42); a.lineTo(-w, -h + 0.28); a.lineTo(-w, -h); const b = new THREE.Shape(); b.moveTo(w, h); b.lineTo(w - 0.4, h); b.lineTo(w - 0.12, h - 0.3); b.lineTo(w, h - 0.5); b.lineTo(w, h); return new THREE.ShapeGeometry([a, b]); })} material={glass} position={[cx, cy, Wd.z - 0.04]} rotation={[0, 0, q * Math.PI / 2]} />;
            })
          )}
        </group>
      ))}
      {/* tables: ours, two side tables, one back table */}
      <Table x0={-1.8} x1={1.8} z={0} />
      <Table x0={-4.5} x1={-2.0} z={0} />
      <Table x0={2.0} x1={4.5} z={0} />
      <Table x0={-2.6} x1={2.6} z={-2.08} />
      <Tray p={[0.05, 0.675, -0.22]} yaw={0.08} seed={1} />
      <Tray p={[-0.05, 0.675, 0.24]} yaw={Math.PI - 0.1} seed={2} />
      {S.extras.map((e, i) => <Tray key={i} p={[e.x, 0.675, e.z + Math.cos(e.yaw) * 0.42]} yaw={e.yaw} seed={i + 3} />)}
    </group>
  );
};

export const SET_BG: Record<SetId, string> = { classroom: "#a8d8ea", hallway: "#f1f3d0", cafeteria: "#ffd6a5" };
export const StorySet: React.FC<{ id: SetId; t: number; broken: number | null }> = ({ id, t, broken }) =>
  id === "classroom" ? <Classroom t={t} /> : id === "hallway" ? <Hallway t={t} /> : <Cafeteria t={t} broken={broken} />;

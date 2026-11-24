// storytime sets, LOW-POLY: simple but furnished school sets, flat matte colours (saturated mids on cream / beige walls, a
// grey ceiling), warm low sun through the windows laid on the walls as long soft stripes. No logos, no real brands.
//   classroom  back row (the leads) + two rows of classmates facing a whiteboard (readable generic text); clock, corkboard,
//              bookshelf, posters, windows
//   hallway    two walls of lockers, tiled floor, ceiling lights, a bulletin board, double doors at the end
//   cafeteria  long tables with benches and trays, a serving counter, a wall of BIG windows (they shatter)
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf } from "../blocky/mat";
import { polyBox, polyIco, polyLimb, polyMat, printMat, sunMat } from "./poly";
import { GYM, SETS, deskOf } from "./layout";
import { Mitten } from "./cast";
import type { V3 } from "./layout";
import type { SetId } from "./types";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const flat = (c: string, _r = 0.8) => polyMat(c);
const rbox = (w: number, h: number, d: number, r: number) => polyBox(w, h, d, r);
const plastic = (c: string, o: { emissive?: string; ei?: number; transparent?: boolean; opacity?: number } = {}) =>
  o.transparent ? glassMat(c, o.opacity ?? 0.3) : polyMat(c, { emissive: o.emissive, ei: o.ei });
const glassMats = new Map<string, THREE.Material>();
const glassMat = (c: string, op: number) => { const k = `${c}|${op}`; let m = glassMats.get(k); if (!m) { m = new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: op, roughness: 0.1, metalness: 0, depthWrite: false }); glassMats.set(k, m); } return m; };
/** the room palette: cream / beige walls, grey ceiling, warm floors */
const WALL = "#eadbbd", WALL2 = "#e3cfa8", CEIL = "#a9abae";
const BOX = () => geoOf("stBox", () => new THREE.BoxGeometry(1, 1, 1));
const PLANE = () => geoOf("stPlane", () => new THREE.PlaneGeometry(1, 1));
const basic = new Map<string, THREE.MeshBasicMaterial>();
const bmat = (c: string, map?: THREE.Texture) => { const k = `${c}|${map?.uuid ?? ""}`; let m = basic.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, map: map ?? null, toneMapped: false, fog: false }); basic.set(k, m); } return m; };
/** a box from its min corner to its max corner */
const Blk: React.FC<{ a: V3; b: V3; m: THREE.Material; cast?: boolean }> = ({ a, b, m, cast = true }) => {
  const w = b[0] - a[0], h = b[1] - a[1], d = b[2] - a[2], c: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return <mesh geometry={BOX()} material={m} position={c} scale={[w, h, d]} castShadow={cast} receiveShadow />;
};
const texMat = (tex: THREE.Texture, _r = 0.75) => printMat(tex);
/** a sunlight patch: a quad from 4 world corners (the window light laid on a wall / floor), additive warm */
const Patch: React.FC<{ P: V3[]; k?: number }> = ({ P, k = 0.42 }) => {
  const key = `stPatch${P.map((p) => p.map((v) => v.toFixed(2)).join(",")).join("|")}`;
  const g = geoOf(key, () => { const b = new THREE.BufferGeometry(); b.setAttribute("position", new THREE.Float32BufferAttribute([...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]], 3)); b.computeVertexNormals(); return b; });
  return <mesh geometry={g} material={sunMat(k)} renderOrder={2} />;
};
/** window panes (rectangles on a window plane) pushed along the sun direction d until they hit a plane (axis = value) */
const sunStripes = (panes: [V3, V3, V3, V3][], d: V3, axis: 0 | 1 | 2, value: number, lim: { y0?: number; y1?: number; a0?: number; a1?: number; along?: 0 | 2 } = {}) => panes.map((Q) => Q.map((p) => {
  const tt = (value - p[axis]) / d[axis];
  const o: V3 = [p[0] + d[0] * tt, p[1] + d[1] * tt, p[2] + d[2] * tt];
  o[axis] = value + (axis === 1 ? 0.004 : -0.004 * Math.sign(d[axis]));
  if (lim.y0 !== undefined) o[1] = Math.max(lim.y0, Math.min(lim.y1 ?? 99, o[1]));
  if (lim.along !== undefined && lim.a0 !== undefined) o[lim.along] = Math.max(lim.a0, Math.min(lim.a1 ?? 99, o[lim.along]));
  return o;
}) as V3[]);

// ------------------------------------------------------------------ textures
export type SlideFx = { kind: "title" | "selfie" | "selfie_glasses"; text: string };
/** the whiteboard as a slide screen: a title slide with planets, or the homie's cartoon selfie on a starfield */
const slideTex = (sl: SlideFx) => canvasTexture(`stSlide${sl.kind}|${sl.text}`, 1024, 400, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0b1033"); gr.addColorStop(1, "#22145a");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.8)"; for (let k = 0; k < 70; k++) g.fillRect(hash(k) * W, hash(k + 40) * H, 3, 3);
  if (sl.kind === "title") {
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(W / 2 - 170, 95, 52, 0, Math.PI * 2); g.fill();
    [["#4ea8de", -70, 16], ["#e76f51", -10, 12], ["#f4a261", 70, 26], ["#90be6d", 150, 20]].forEach(([c, x, r]) => { g.fillStyle = c as string; g.beginPath(); g.arc(W / 2 + (x as number), 95, r as number, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = "#ffffff"; g.font = "800 80px Poppins, sans-serif"; g.textAlign = "center"; g.fillText(sl.text || "THE SOLAR SYSTEM", W / 2, 245);
    g.font = "600 36px Poppins, sans-serif"; g.fillStyle = "#c7d2fe"; g.fillText("group project", W / 2, 310); g.textAlign = "left";
    return;
  }
  // the homie's selfie: copper curls, a peach face, octagon eyes, a smug half-lid, the purple tee; a gold frame
  const cx = W / 2, cy = H / 2 + 10, s = 1.0;
  g.fillStyle = "#ffd23f"; g.fillRect(cx - 190, 18, 380, H - 36);
  g.fillStyle = "#2a1d5c"; g.fillRect(cx - 176, 32, 352, H - 64);
  g.fillStyle = "#7b4fd6"; g.fillRect(cx - 120, cy + 95 * s, 240, 80);
  g.fillStyle = "#f4cfa6"; g.fillRect(cx - 95, cy - 90, 190, 185);
  g.fillStyle = "#c4541c"; for (let k = 0; k < 11; k++) { g.beginPath(); g.arc(cx - 95 + k * 19, cy - 92 + 8 * Math.sin(k * 1.7), 26, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#8a3b14"; g.fillRect(cx - 70, cy - 30, 50, 10); g.fillRect(cx + 20, cy - 40, 50, 10);
  if (sl.kind === "selfie_glasses") {
    g.fillStyle = "#0d0d10"; g.fillRect(cx - 82, cy - 18, 70, 40); g.fillRect(cx + 12, cy - 18, 70, 40); g.fillRect(cx - 14, cy - 10, 28, 8);
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(cx - 74, cy - 12, 18, 8); g.fillRect(cx + 20, cy - 12, 18, 8);
  } else {
    g.fillStyle = "#141414"; for (const ex of [-45, 45]) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + (i * Math.PI) / 4; g.lineTo(cx + ex + Math.cos(a) * 18, cy + Math.sin(a) * 20); } g.fill(); }
    g.fillStyle = "#f4cfa6"; g.fillRect(cx - 70, cy - 22, 140, 14);
  }
  g.fillStyle = "#3a1e22"; g.beginPath(); g.moveTo(cx - 40, cy + 52); g.lineTo(cx + 45, cy + 44); g.lineTo(cx + 45, cy + 52); g.lineTo(cx - 40, cy + 60); g.fill();
  g.fillStyle = "#ffffff"; g.font = "800 46px Poppins, sans-serif"; g.textAlign = "center"; g.fillText(sl.text || "ME", cx + 330, 210); g.fillText("\u2728", cx - 330, 210); g.textAlign = "left";
});
/** an episode's whiteboard: the first line huge (red), the rest smaller */
const boardLines = (lines: string[]) => canvasTexture(`stBoard${lines.join("|")}`, 1024, 400, (g, W, H) => {
  g.fillStyle = "#f7f8f6"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.04)"; for (let k = 0; k < 6; k++) g.fillRect(hash(k) * W, hash(k + 9) * H, 220, 26);
  g.textAlign = "center";
  g.fillStyle = "#d62828"; g.font = "800 124px Poppins, sans-serif"; g.fillText(lines[0] ?? "", W / 2, 180);
  g.fillStyle = "#1f4fbf"; g.font = "700 52px Poppins, sans-serif"; (lines.slice(1)).forEach((l, i) => g.fillText(l, W / 2, 285 + i * 62));
  g.strokeStyle = "#d62828"; g.lineWidth = 8; g.beginPath(); g.moveTo(W * 0.26, 210); g.lineTo(W * 0.74, 210); g.stroke();
  g.textAlign = "left";
});
const chalkboard = () => canvasTexture("stWhiteboard", 1024, 400, (g, W, H) => {
  g.fillStyle = "#f7f8f6"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.04)"; for (let k = 0; k < 6; k++) g.fillRect(hash(k) * W, hash(k + 9) * H, 220, 26);
  g.fillStyle = "#1f4fbf"; g.font = "700 66px Poppins, sans-serif"; g.fillText("TODAY: Fractions", 50, 92);
  g.fillStyle = "#222"; g.font = "700 58px Poppins, sans-serif"; g.fillText("1/2 + 1/4 = ?", 50, 190);
  g.fillStyle = "#c62828"; g.font = "700 50px Poppins, sans-serif"; g.fillText("Quiz Friday!", 50, 290);
  g.fillStyle = "#2e7d32"; g.font = "700 44px Poppins, sans-serif"; g.fillText("HW: p. 42  #1-10", 560, 290);
  g.strokeStyle = "#1f4fbf"; g.lineWidth = 7; g.beginPath(); g.arc(800, 165, 75, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(800, 165); g.lineTo(800, 90); g.moveTo(800, 165); g.lineTo(865, 200); g.stroke();
  g.fillStyle = "#555"; g.font = "700 36px Poppins, sans-serif"; g.fillText("no phones in class", 560, 370);
});
/** a cracked pane: a spider web of white crack lines on clear (unlit, transparent) */
const crackTex = () => canvasTexture("stCrack", 512, 512, (g, W, H) => {
  g.clearRect(0, 0, W, H); g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineCap = "round";
  const cx = W * 0.46, cy = H * 0.52;
  const rays = 13;
  const ends: [number, number][][] = [];
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2 + hash(k) * 0.4; const pts: [number, number][] = [[cx, cy]];
    let x = cx, y = cy;
    for (let j = 1; j <= 6; j++) { const r = j * W * 0.11; x = cx + Math.cos(a + (hash(k * 7 + j) - 0.5) * 0.25) * r; y = cy + Math.sin(a + (hash(k * 7 + j) - 0.5) * 0.25) * r; pts.push([x, y]); }
    ends.push(pts);
    g.lineWidth = 4; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
  }
  g.lineWidth = 2.5;
  for (let j = 1; j <= 5; j++) { g.beginPath(); for (let k = 0; k <= rays; k++) { const [px, py] = ends[k % rays][j]; if (k) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); }
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.arc(cx, cy, 26, 0, Math.PI * 2); g.fill();
});
let crackM: THREE.Material | null = null;
const crackMat = () => (crackM ??= new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, depthWrite: false, toneMapped: false, fog: false }));
const corkTex = () => canvasTexture("stCork", 512, 340, (g, W, H) => {
  g.fillStyle = "#c69a63"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(90,60,30,0.18)"; for (let k = 0; k < 400; k++) g.fillRect(hash(k) * W, hash(k + 3) * H, 3, 3);
  const notes: [number, number, number, number, string, string][] = [[24, 24, 150, 120, "#fff59d", "Field trip\nMay 12"], [196, 40, 130, 150, "#ffffff", "Lunch\nmenu"], [348, 20, 140, 110, "#90caf9", "Book\nclub"], [40, 170, 170, 140, "#ffab91", "Science\nfair!"], [240, 210, 120, 110, "#a5d6a7", "Team\nA B C"], [380, 150, 110, 160, "#ffffff", "Rules\n1 2 3"]];
  for (const [x, y, w, h, c, txt] of notes) {
    g.fillStyle = c; g.fillRect(x, y, w, h); g.fillStyle = "#333"; g.font = "700 26px Poppins, sans-serif";
    txt.split("\n").forEach((l, i) => g.fillText(l, x + 12, y + 38 + i * 32));
    g.fillStyle = "#e53935"; g.beginPath(); g.arc(x + w / 2, y + 8, 7, 0, Math.PI * 2); g.fill();
  }
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

/** the sun's travel direction per set (from the windows into the room): low and warm */
export const SUN_CLASS: V3 = (() => { const v: V3 = [-0.6, -0.12, 1]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; })();
export const SUN_CAF: V3 = (() => { const v: V3 = [0.22, -0.1, 1]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; })();
const Bookshelf: React.FC<{ x0: number; x1: number; z: number }> = ({ x0, x1, z }) => {
  const wood = flat("#9c6b3f"), h = 1.6, d = 0.34, zc = z - d / 2;
  const books: React.ReactNode[] = [];
  const C = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#8338ec", "#ffbe0b", "#3a86ff", "#fb5607"];
  for (let r = 0; r < 3; r++) {
    let x = x0 + 0.06, k = 0;
    while (x < x1 - 0.12) { const w = 0.05 + 0.04 * hash(r * 31 + k), hh = 0.28 + 0.12 * hash(r * 17 + k * 3); books.push(<Blk key={`${r}-${k}`} a={[x, 0.08 + r * 0.52, zc - 0.12]} b={[x + w, 0.08 + r * 0.52 + hh, zc + 0.12]} m={flat(C[(r * 5 + k) % C.length])} />); x += w + 0.008; k++; }
  }
  return (
    <group>
      <Blk a={[x0, 0, z - 0.04]} b={[x1, h, z]} m={wood} />
      <Blk a={[x0, 0, z - d]} b={[x0 + 0.04, h, z]} m={wood} />
      <Blk a={[x1 - 0.04, 0, z - d]} b={[x1, h, z]} m={wood} />
      {[0, 0.52, 1.04, 1.56].map((y, i) => <Blk key={i} a={[x0, y, z - d]} b={[x1, y + 0.04, z]} m={wood} />)}
      {books}
    </group>
  );
};

// ------------------------------------------------------------------ classroom
export type FairFx = { gone: number; ribbon: number; ribbonText: string; poster: string };
const ribbonTex = (text: string) => canvasTexture(`stRibbon${text}`, 256, 256, (g, W) => {
  g.fillStyle = "#1d4ed8"; g.beginPath(); for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, r = k % 2 ? 118 : 128; g.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } g.fill();
  g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(W / 2, W / 2, 92, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#1d4ed8"; g.textAlign = "center"; const ws = text.split(" ");
  g.font = `800 ${ws.length > 1 ? 34 : 40}px Poppins, sans-serif`; ws.forEach((w, i) => g.fillText(w, W / 2, W / 2 + 12 + (i - (ws.length - 1) / 2) * 38));
});
/** the science fair on the leads' desks: a crystal cluster on a stand (gone from `gone` on), a trifold poster, a ribbon */
const Fair: React.FC<{ f: FairFx; t: number }> = ({ f, t }) => {
  const S = SETS.classroom, dh = deskOf(S.marks.homie);
  const crystals: [number, number, number, number, number][] = [[0, 0.17, 0, 0.0, 1.0], [-0.07, 0.12, 0.03, 0.45, 0.75], [0.07, 0.11, -0.02, -0.4, 0.7], [0.02, 0.1, 0.07, 0.25, 0.6], [-0.03, 0.09, -0.07, -0.3, 0.55]];
  return (
    <group>
      {/* the stand + crystals on the homie's desk */}
      <mesh geometry={polyBox(0.24, 0.05, 0.2, 0.01)} material={flat("#3a2a4a")} position={[dh[0], 0.715, dh[2]]} castShadow />
      {t < f.gone ? crystals.map(([x, y, z, r, s], i) => <mesh key={i} geometry={polyIco(0.06, 0.8, 2.6, 0.8)} material={polyMat(i % 2 ? "#a78bfa" : "#7dd3fc", { emissive: "#6d5ae8", ei: 0.25, rough: 0.35 })} position={[dh[0] + x, 0.74 + y * s, dh[2] + z]} rotation={[0, 0, r]} scale={s} castShadow />) : null}
      {t >= f.ribbon ? (
        <group position={[dh[0], 0.76, dh[2] + 0.02]} rotation={[-0.35, Math.PI, 0]}>
          <mesh geometry={PLANE()} material={texMat(ribbonTex(f.ribbonText))} scale={[0.22, 0.22, 1]} />
          {[-1, 1].map((sd) => <mesh key={sd} geometry={BOX()} material={flat("#1d4ed8")} position={[sd * 0.04, -0.15, -0.002]} rotation={[0, 0, sd * 0.2]} scale={[0.05, 0.14, 0.004]} />)}
        </group>
      ) : null}
      {/* the trifold poster standing on the narrator's desk, facing the front of the room */}
      <group position={[dh[0] - 0.62, 0.0, dh[2] + 0.1]} rotation={[0, Math.PI - 0.35, 0]} scale={2.2}>
        <mesh geometry={PLANE()} material={texMat(signTex(`stPoster${f.poster}`, f.poster, "#ffffff", "#1d4ed8", 512, 360, 64))} position={[0, 0.2, 0]} scale={[0.34, 0.4, 1]} />
        {[-1, 1].map((sd) => <mesh key={sd} geometry={PLANE()} material={flat("#fef3c7")} position={[sd * 0.25, 0.2, 0.06]} rotation={[0, -sd * 0.6, 0]} scale={[0.18, 0.4, 1]} />)}
      </group>
    </group>
  );
};

const Classroom: React.FC<{ t: number; board?: string[]; slide?: SlideFx | null; fair?: FairFx | null }> = ({ t, board, slide, fair }) => {
  const S = SETS.classroom;
  const floor = flat("#c98f5a");
  const wall = flat(WALL), wall2 = flat(WALL2), base = flat("#7a5c46");
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
      <Blk a={[-4.5, 3.4, -5]} b={[4.5, 3.45, 3.9]} m={flat(CEIL)} cast={false} />
      {[-3.2, 0, 3.2].map((z) => [-1.6, 1.6].map((x) => <CeilingLight key={`${x}${z}`} p={[x, 3.38, z]} />))}
      {/* the chalkboard + tray, the teacher's desk */}
      <Blk a={[-2.0, 0.85, -4.92]} b={[2.0, 2.45, -4.86]} m={flat("#b07a45")} />
      <mesh geometry={PLANE()} material={slide ? bmat("#ffffff", slideTex(slide)) : texMat(board?.length ? boardLines(board) : chalkboard(), 0.95)} position={[0, 1.65, -4.85]} scale={[3.8, 1.45, 1]} />
      {fair ? <Fair f={fair} t={t} /> : null}
      <Blk a={[-2.0, 0.82, -4.86]} b={[2.0, 0.86, -4.74]} m={flat("#b07a45")} />
      <Blk a={[1.4, 0, -4.2]} b={[3.0, 0.78, -3.5]} m={flat("#c98d4b")} />
      <Clock p={[-2.9, 2.55, -4.85]} t={t} r={0.3} />
      {/* back wall (seen behind the leads' close-ups): posters, the corkboard, a clock, the bookshelf, cubbies */}
      {posters.slice(0, 2).map((tex, i) => <mesh key={i} geometry={PLANE()} material={texMat(tex, 0.9)} position={[-3.35 + i * 0.95, 1.85, 3.74]} rotation={[0, Math.PI, 0]} scale={[0.66, 0.88, 1]} />)}
      <Blk a={[-1.75, 1.15, 3.72]} b={[-0.25, 2.25, 3.8]} m={flat("#8a5a32")} />
      <mesh geometry={PLANE()} material={texMat(corkTex())} position={[-1.0, 1.7, 3.715]} rotation={[0, Math.PI, 0]} scale={[1.38, 0.98, 1]} />
      <Clock p={[0.85, 2.35, 3.74]} t={t} yaw={Math.PI} r={0.27} />
      <Bookshelf x0={2.0} x1={3.7} z={3.78} />
      <Blk a={[-4.2, 0, 3.3]} b={[-2.9, 1.0, 3.75]} m={flat("#f4a259")} />
      {[0, 1, 2].map((k) => <Blk key={k} a={[-4.1 + k * 0.42, 0.12, 3.29]} b={[-3.75 + k * 0.42, 0.88, 3.3]} m={flat(["#ef476f", "#118ab2", "#06d6a0"][k])} cast={false} />)}
      {/* low warm sun from the windows (+x, front) laid on the back wall as long slanted stripes */}
      {sunStripes([-2.8, -0.6, 1.6].flatMap((z) => [[z - 0.81, z - 0.03], [z + 0.03, z + 0.81]].map(([a, b]) => [[4.12, 1.02, a], [4.12, 1.02, b], [4.12, 2.48, b], [4.12, 2.48, a]] as [V3, V3, V3, V3])), SUN_CLASS, 2, 3.79, { y0: 0.19, y1: 3.38, along: 0, a0: -4.2, a1: 4.2 }).map((P, i) => <Patch key={i} P={P} />)}
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
  const floor = flat("#b9c2c9");
  const lockL = printMat(lockerTex("stLockA", "#3a86ff")), lockR = printMat(lockerTex("stLockB", "#ff9f1c"));
  const wall = flat(WALL);
  const n = 40, z0 = -15;
  return (
    <group>
      <mesh geometry={PLANE()} material={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} scale={[3.6, 22, 1]} receiveShadow />
      <Blk a={[-1.9, 0, z0]} b={[-1.8, 3.1, 6]} m={wall} cast={false} />
      <Blk a={[1.8, 0, z0]} b={[1.9, 3.1, 6]} m={wall} cast={false} />
      <Blk a={[-1.9, 3.1, z0]} b={[1.9, 3.15, 6]} m={flat(CEIL)} cast={false} />
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
const Tray: React.FC<{ p: V3; yaw: number; seed: number; empty?: boolean }> = ({ p, yaw, seed, empty }) => empty ? (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.46, 0.03, 0.34, 0.01)} material={flat(seed % 2 ? "#57cc99" : "#ff9f1c", 0.5)} castShadow receiveShadow />
    {/* the moulded compartments, all empty */}
    {[[-0.1, 0, 0.2, 0.26], [0.13, 0.07, 0.15, 0.11], [0.13, -0.07, 0.15, 0.11]].map(([x, z, w, d], i) => <mesh key={i} geometry={rbox(w, 0.012, d, 0.004)} material={flat(seed % 2 ? "#47b585" : "#e88d10")} position={[x, 0.016, z]} />)}
  </group>
) : (
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

/** a world-space arm (sleeve + mitten) from `from` reaching to `to` */
const Arm: React.FC<{ from: V3; to: V3; sleeve: string; skin: string; r?: number }> = ({ from, to, sleeve, skin, r = 0.055 }) => {
  const d = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.clone().normalize());
  return (
    <group position={from} quaternion={q}>
      <mesh geometry={polyLimb(r, r * 0.92, len)} material={flat(sleeve)} />
      <group position={[0, -len - 0.05, 0]}><Mitten skin={skin} /></group>
    </group>
  );
};
const ease = (u: number) => { const x = Math.min(1, Math.max(0, u)); return x * x * (3 - 2 * x); };
export type TrayFx = { owner: "me" | "homie"; drop: number; take: number };
export const TRAY_AT: Record<"me" | "homie", V3> = { homie: [0.05, 0.675, -0.22], me: [-0.05, 0.675, 0.24] };
/** ONE nugget drops onto the owner's empty tray; a lunch lady's gloved hand reaches in from the side and takes it back */
const Nugget: React.FC<{ tr: TrayFx; t: number }> = ({ tr, t }) => {
  if (t < tr.drop) return null;
  const P = TRAY_AT[tr.owner];
  const rest: V3 = [P[0] - 0.08, P[1] + 0.04, P[2] + (tr.owner === "homie" ? 0.02 : -0.02)];
  // the drop: falls 0.45 m in 0.22 s, a small bounce
  const u = (t - tr.drop) / 0.22;
  let y = rest[1] + (u < 1 ? 0.45 * (1 - u * u) : 0.025 * Math.max(0, Math.sin(Math.min(1, (u - 1) / 0.6) * Math.PI)));
  let pos: V3 = [rest[0], y, rest[2]];
  // the take: the hand comes in over 0.45 s, grabs, leaves over 0.55 s with the nugget
  const side = tr.owner === "homie" ? 1 : -1;
  const from: V3 = [P[0] + 0.85, P[1] + 0.85, P[2] + side * 0.35];
  const grab: V3 = [rest[0] + 0.04, rest[1] + 0.12, rest[2]];
  let hand: V3 | null = null;
  if (t >= tr.take - 0.45 && t < tr.take + 0.55) {
    const kIn = ease((t - (tr.take - 0.45)) / 0.45), kOut = ease((t - tr.take - 0.1) / 0.45);
    hand = t < tr.take + 0.1 ? [from[0] + (grab[0] - from[0]) * kIn, from[1] + (grab[1] - from[1]) * kIn, from[2] + (grab[2] - from[2]) * kIn]
      : [grab[0] + (from[0] - grab[0]) * kOut, grab[1] + (from[1] - grab[1]) * kOut, grab[2] + (from[2] - grab[2]) * kOut];
    if (t >= tr.take) pos = [hand[0] - 0.04, hand[1] - 0.1, hand[2]];
  }
  if (t >= tr.take + 0.55) return null;
  return (
    <group>
      <mesh geometry={polyIco(0.05, 1.25, 0.55, 0.95)} material={flat("#d9963a")} position={pos} rotation={[0.1, 0.6, 0.05]} castShadow />
      {hand ? <Arm from={from} to={hand} sleeve="#f4f4f0" skin="#8fd3ff" /> : null}
    </group>
  );
};

const Cafeteria: React.FC<{ t: number; broken: number | null; tray?: TrayFx | null }> = ({ t, broken, tray }) => {
  const S = SETS.cafeteria, Wd = S.windows!;
  const floor = flat("#d8c9a8");
  const wall = flat(WALL), wallB = flat(WALL2), frame = flat("#ffffff", 0.5);
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
      {/* low sun through the big windows (behind the homie) laid on the back wall as long stripes */}
      {sunStripes(Wd.xs.flatMap((x) => [[x - Wd.w / 2 + 0.06, x - 0.04], [x + 0.04, x + Wd.w / 2 - 0.06]].flatMap(([a, b]) => [[Wd.y0 + 0.06, (Wd.y0 + Wd.y1) / 2 - 0.04], [(Wd.y0 + Wd.y1) / 2 + 0.04, Wd.y1 - 0.06]].map(([y0, y1]) => [[a, y0, Wd.z], [b, y0, Wd.z], [b, y1, Wd.z], [a, y1, Wd.z]] as [V3, V3, V3, V3]))), SUN_CAF, 2, 5.19, { y0: 1.08, y1: 3.78, along: 0, a0: -6.5, a1: 6.5 }).map((P, i) => <Patch key={i} P={P} k={0.36} />)}
      {/* side walls */}
      <Blk a={[-6.6, 0, -4.4]} b={[-6.5, 3.8, 5.3]} m={wallB} cast={false} />
      <Blk a={[6.5, 0, -4.4]} b={[6.6, 3.8, 5.3]} m={wallB} cast={false} />
      <Blk a={[-6.6, 3.8, -4.4]} b={[6.6, 3.85, 5.3]} m={flat(CEIL)} cast={false} />
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
          {isBroken ? <mesh geometry={PLANE()} material={crackMat()} position={[x, (Wd.y0 + Wd.y1) / 2, Wd.z - 0.03]} scale={[Wd.w - 0.08, Wd.y1 - Wd.y0 - 0.08, 1]} rotation={[0, 0, i * 1.7]} renderOrder={3} /> : null}
        </group>
      ))}
      {isBroken ? Array.from({ length: 70 }, (_, k) => <mesh key={`sh${k}`} geometry={polyIco(0.05 + 0.06 * hash(k + 3), 1.2, 0.18, 0.9)} material={glassMat("#cfeeff", 0.7)} position={[Wd.xs[k % 3] + (hash(k) - 0.5) * 3.2, 0.012, Wd.z + 0.25 + hash(k + 9) * 2.4]} rotation={[0, hash(k + 5) * 6, 0]} />) : null}
      {/* tables: ours, two side tables, one back table */}
      <Table x0={-1.8} x1={1.8} z={0} />
      <Table x0={-4.5} x1={-2.0} z={0} />
      <Table x0={2.0} x1={4.5} z={0} />
      <Table x0={-2.6} x1={2.6} z={-2.08} />
      <Tray p={TRAY_AT.homie} yaw={0.08} seed={1} empty={tray?.owner === "homie"} />
      <Tray p={TRAY_AT.me} yaw={Math.PI - 0.1} seed={2} empty={tray?.owner === "me"} />
      {tray ? <Nugget tr={tray} t={t} /> : null}
      {S.extras.map((e, i) => <Tray key={i} p={[e.x, 0.675, e.z + Math.cos(e.yaw) * 0.42]} yaw={e.yaw} seed={i + 3} />)}
    </group>
  );
};

// ------------------------------------------------------------------ detention
function signTex(key: string, text: string, bg: string, fg: string, w = 1024, h = 256, fs = 150) { return canvasTexture(key, w, h, (g, W, H) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = fg; g.font = `800 ${fs}px Poppins, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, W / 2, H / 2 + 6);
}); }
const Detention: React.FC<{ t: number }> = ({ t }) => {
  const S = SETS.detention, wall = flat("#d9cbb0"), wall2 = flat("#cfbf9f");
  const ho = S.marks.homie;
  const empty: [number, number][] = [[-1.75, 0], [1.75, 0], [-1.75, 1.5], [0, 1.5], [1.75, 1.5]];
  return (
    <group>
      <mesh geometry={PLANE()} material={flat("#a99a80")} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.5]} scale={[6.4, 6.6, 1]} receiveShadow />
      <Blk a={[-3.1, 0, -2.6]} b={[3.1, 3.0, -2.5]} m={wall} cast={false} />
      <Blk a={[-3.1, 0, 3.7]} b={[3.1, 3.0, 3.8]} m={wall} cast={false} />
      <Blk a={[-3.1, 0, -2.6]} b={[-3.0, 3.0, 3.8]} m={wall2} cast={false} />
      <Blk a={[3.0, 0, -2.6]} b={[3.1, 3.0, 3.8]} m={wall2} cast={false} />
      <Blk a={[-3.1, 3.0, -2.6]} b={[3.1, 3.05, 3.8]} m={flat(CEIL)} cast={false} />
      <Blk a={[-3.1, 0, -2.5]} b={[3.1, 0.16, -2.46]} m={flat("#6b5444")} cast={false} />
      <CeilingLight p={[0, 2.98, 0.5]} />
      {/* the sign above him, a clock, a rules poster */}
      <mesh geometry={PLANE()} material={texMat(signTex("stDetention", "DETENTION", "#c1121f", "#ffffff"))} position={[0, 2.3, -2.48]} scale={[2.3, 0.58, 1]} />
      <Clock p={[1.75, 2.3, -2.48]} t={t} r={0.24} />
      <mesh geometry={PLANE()} material={texMat(poster("stRules", "#264653", "#ffffff", "RULES", (g) => { g.font = "700 30px Poppins, sans-serif"; g.textAlign = "center"; ["NO PHONES", "NO TALKING", "NO NOISE"].forEach((l, i) => g.fillText(l, 128, 80 + i * 50)); }), 0.9)} position={[-1.8, 1.65, -2.48]} scale={[0.66, 0.88, 1]} />
      {/* a window with the blinds half down (right wall) */}
      <mesh geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[2.99, 1.75, 0.8]} rotation={[0, -Math.PI / 2, 0]} scale={[1.6, 1.4, 1]} />
      {Array.from({ length: 9 }, (_, k) => <Blk key={k} a={[2.93, 2.42 - k * 0.075, 0.0]} b={[2.97, 2.47 - k * 0.075, 1.6]} m={flat("#efe9dc")} />)}
      {/* his desk, and the empty ones */}
      <Desk p={deskOf(ho)} yaw={ho.yaw} />
      <Chair x={ho.x} z={ho.z} yaw={ho.yaw} />
      {empty.map(([x, z], i) => { const m = { x, z, yaw: 0, sit: true }; return <React.Fragment key={i}><Desk p={deskOf(m)} yaw={0} color="#e2b35c" /><Chair x={x} z={z} yaw={0} /></React.Fragment>; })}
    </group>
  );
};

// ------------------------------------------------------------------ gym (the assembly)
const bannerTex = () => canvasTexture("stBanner", 1024, 180, (g, W, H) => {
  g.fillStyle = "#1d4ed8"; g.fillRect(0, 0, W, H); g.strokeStyle = "#ffd23f"; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20);
  g.fillStyle = "#ffd23f"; g.font = "800 92px Poppins, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("STUDENT OF THE MONTH", W / 2, H / 2 + 4);
});
/** a big black speaker cabinet: two woofers and a tweeter on its +z face */
const Speaker: React.FC<{ p: V3; yaw: number; w?: number; h?: number }> = ({ p, yaw, w = 1.1, h = 2.5 }) => {
  const d = w * 0.75, cone = (y: number, r: number, k: string) => (
    <group key={k} position={[0, y, d / 2 + 0.005]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geoOf("stSpkRim", () => new THREE.CylinderGeometry(1, 1, 0.04, 16))} material={flat("#3a3b42")} scale={[r, 1, r]} />
      <mesh geometry={geoOf("stSpkCone", () => new THREE.ConeGeometry(1, 0.5, 16, 1, true))} material={flat("#141418")} position={[0, -0.0, 0]} rotation={[Math.PI, 0, 0]} scale={[r * 0.82, 0.25, r * 0.82]} />
      <mesh geometry={geoOf("stSpkCap", () => new THREE.SphereGeometry(1, 10, 6))} material={flat("#2a2b31")} position={[0, 0.03, 0]} scale={[r * 0.22, r * 0.12, r * 0.22]} />
    </group>
  );
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={rbox(w, h, d, 0.04)} material={flat("#1b1b1f")} position={[0, h / 2, 0]} castShadow receiveShadow />
      {cone(h * 0.27, w * 0.36, "a")}{cone(h * 0.6, w * 0.36, "b")}{cone(h * 0.86, w * 0.13, "c")}
    </group>
  );
};
const MicStand: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh geometry={geoOf("stMicBase", () => new THREE.CylinderGeometry(0.15, 0.17, 0.03, 12))} material={flat("#202024")} position={[0, 0.015, 0]} />
    <Blk a={[-0.012, 0, -0.012]} b={[0.012, 1.3, 0.012]} m={flat("#3a3a40")} />
    <mesh geometry={BOX()} material={flat("#3a3a40")} position={[0, 1.33, -0.06]} rotation={[0.9, 0, 0]} scale={[0.02, 0.18, 0.02]} />
    <mesh geometry={polyBox(0.05, 0.14, 0.05, 0.02)} material={flat("#111114")} position={[0, 1.39, -0.13]} rotation={[0.9, 0, 0]} />
  </group>
);
const Gym: React.FC<{ t: number }> = () => {
  const [sz0, sz1] = GYM.stageZ, sy = GYM.stageY;
  const lower = flat("#2f5d9e"), upper = flat("#e6dcc6");
  return (
    <group>
      {/* the court floor, its lines */}
      <mesh geometry={PLANE()} material={flat("#d9a066")} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} scale={[15.4, 16.4, 1]} receiveShadow />
      <Blk a={[-7.5, 0, 0.98]} b={[7.5, 0.006, 1.06]} m={flat("#ffffff")} cast={false} />
      <mesh geometry={geoOf("stCourtRing", () => new THREE.RingGeometry(1.7, 1.78, 40))} material={flat("#ffffff")} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 1.02]} />
      <Blk a={[-6.2, 0, -5.9]} b={[6.2, 0.006, -5.82]} m={flat("#c1121f")} cast={false} />
      {/* walls: blue block below, cream above */}
      {([[[-7.7, 0, -9.2], [7.7, 1.8, -9.1]], [[-7.7, 0, 7.0], [7.7, 1.8, 7.1]], [[-7.7, 0, -9.2], [-7.6, 1.8, 7.1]], [[7.6, 0, -9.2], [7.7, 1.8, 7.1]]] as [V3, V3][]).map(([a, b], i) => <Blk key={`l${i}`} a={a} b={b} m={lower} cast={false} />)}
      {([[[-7.7, 1.8, -9.2], [7.7, 6.6, -9.1]], [[-7.7, 1.8, 7.0], [7.7, 6.6, 7.1]], [[-7.7, 1.8, -9.2], [-7.6, 6.6, 7.1]], [[7.6, 1.8, -9.2], [7.7, 6.6, 7.1]]] as [V3, V3][]).map(([a, b], i) => <Blk key={`u${i}`} a={a} b={b} m={upper} cast={false} />)}
      <Blk a={[-7.7, 6.6, -9.2]} b={[7.7, 6.7, 7.1]} m={flat("#7d8188")} cast={false} />
      {[-5.5, -1.5, 2.5, 5.5].map((z) => [-4, 0, 4].map((x) => <mesh key={`${x}${z}`} geometry={BOX()} material={plastic("#ffffff", { emissive: "#fffbe8", ei: 1.5 })} position={[x, 6.55, z]} scale={[1.3, 0.08, 0.6]} />))}
      {/* high windows on the side walls */}
      {[-4, 0, 4].map((z) => [-7.58, 7.58].map((x) => <mesh key={`w${x}${z}`} geometry={PLANE()} material={bmat("#ffffff", skyTex())} position={[x, 4.9, z]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} scale={[2.2, 1.1, 1]} />))}
      {/* folded bleachers against the side walls */}
      {[-1, 1].map((sd) => [0, 1, 2, 3].map((k) => <Blk key={`b${sd}${k}`} a={[sd > 0 ? 7.6 - 0.95 + k * 0.22 : -7.6, 0, -3.5]} b={[sd > 0 ? 7.6 : -7.6 + 0.95 - k * 0.22, 0.45 + k * 0.42, 5.2]} m={flat(k % 2 ? "#b08350" : "#9c7244")} />))}
      {/* a hoop on the back wall (behind the kids) */}
      <Blk a={[-0.9, 3.2, 6.9]} b={[0.9, 4.25, 6.96]} m={flat("#ffffff")} />
      <Blk a={[-0.3, 3.3, 6.89]} b={[0.3, 3.75, 6.9]} m={flat("#e85d04")} cast={false} />
      <mesh geometry={polyTorusGeo()} material={flat("#e85d04")} position={[0, 3.3, 6.65]} rotation={[Math.PI / 2, 0, 0]} />
      {/* the stage, its skirt, the curtain, the steps */}
      <Blk a={[-4.3, 0, sz0]} b={[4.3, sy, sz1]} m={flat("#b5814b")} />
      <Blk a={[-4.3, 0.05, sz1]} b={[4.3, sy - 0.04, sz1 + 0.03]} m={flat("#1d3557")} cast={false} />
      <Blk a={[-4.3, sy, sz0 - 0.05]} b={[4.3, 5.4, sz0 + 0.05]} m={flat("#8f1d21")} cast={false} />
      {Array.from({ length: 14 }, (_, k) => <Blk key={`c${k}`} a={[-4.2 + k * 0.6, sy, sz0 + 0.05]} b={[-4.0 + k * 0.6, 5.4, sz0 + 0.12]} m={flat("#a4262c")} cast={false} />)}
      <Blk a={[-4.6, 4.9, sz0]} b={[4.6, 5.6, sz0 + 0.35]} m={flat("#7a1519")} />
      {[0, 1, 2].map((k) => <Blk key={`s${k}`} a={[4.3, 0, sz1 - 1.2]} b={[4.3 + 0.32 * (3 - k), sy * ((k + 1) / 3), sz1 - 0.2]} m={flat("#a8763f")} />)}
      {/* the banner */}
      <mesh geometry={PLANE()} material={texMat(bannerTex())} position={[0, 3.85, sz0 + 0.16]} scale={[5.8, 1.02, 1]} />
      {/* the mic stand at the stage front, a podium-free assembly */}
      <MicStand p={GYM.mic} />
      {/* the BIG speakers: floor stacks either side of the stage, two more high on the wall */}
      <Speaker p={[-GYM.speakerX, 0, -5.4]} yaw={0.3} />
      <Speaker p={[GYM.speakerX, 0, -5.4]} yaw={-0.3} />
      <Speaker p={[-GYM.speakerX, 2.5, -5.4]} yaw={0.3} w={0.9} h={1.0} />
      <Speaker p={[GYM.speakerX, 2.5, -5.4]} yaw={-0.3} w={0.9} h={1.0} />
      <Speaker p={[-6.6, 4.4, -8.6]} yaw={0.6} w={0.8} h={1.1} />
      <Speaker p={[6.6, 4.4, -8.6]} yaw={-0.6} w={0.8} h={1.1} />
      {/* the benches the kids sit on */}
      {GYM.rows.map((z, i) => (
        <group key={`bench${i}`}>
          <mesh geometry={rbox(7.4, 0.05, 0.42, 0.015)} material={flat("#c58b4b")} position={[0, 0.415, z - 0.03]} castShadow receiveShadow />
          {[-3.5, -1.2, 1.2, 3.5].map((x) => <Blk key={x} a={[x - 0.04, 0, z - 0.2]} b={[x + 0.04, 0.4, z + 0.14]} m={flat("#8d99ae")} />)}
        </group>
      ))}
    </group>
  );
};
const polyTorusGeo = () => geoOf("stHoop", () => new THREE.TorusGeometry(0.24, 0.02, 4, 16));

export const SET_BG: Record<SetId, string> = { classroom: "#a8d8ea", hallway: "#f1f3d0", cafeteria: "#ffd6a5", detention: "#e9dcc4", gym: "#e6dcc6" };
export type SetProps = { board?: string[]; tray?: TrayFx | null; slide?: SlideFx | null; fair?: FairFx | null };
export const StorySet: React.FC<{ id: SetId; t: number; broken: number | null; props?: SetProps }> = ({ id, t, broken, props }) =>
  id === "classroom" ? <Classroom t={t} board={props?.board} slide={props?.slide} fair={props?.fair} /> : id === "hallway" ? <Hallway t={t} /> : id === "detention" ? <Detention t={t} /> : id === "gym" ? <Gym t={t} /> : <Cafeteria t={t} broken={broken} tray={props?.tray} />;

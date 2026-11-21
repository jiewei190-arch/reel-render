// biz3d sets: a stylised miniature business world. Every set keeps moving on its own (skyline windows twinkle, clouds
// and traffic drift, lamps sway, dust floats, papers flutter, the chart grid scans), so no frame is ever static.
//   boardroom   a long table, eight chairs, the CEO chair at the head, a wall of glass over a dusk skyline, a clock
//   city        a miniature street: a row of nine stores whose windows and signs light up or go dark, towers behind,
//               traffic, street lamps
//   chart       the chart studio: a dark void with a glowing floor grid; the recipe's chart is drawn here (chart.tsx)
//   warehouse   steel racks of product boxes, a running conveyor, swaying lamps
//   headlines   a wall of newspapers (generic mastheads) with one hero paper carrying the shot's headline
// No set shows a real logo, brand colour scheme or mascot: store signs read generic words ("VIDEO", "RENTALS").
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { ChartView } from "./chart";
import type { ChartGeo } from "./chart";
import { BP } from "./palette";

export type BizSetId = "boardroom" | "city" | "chart" | "warehouse" | "headlines";
export const BIZ_SET_IDS: BizSetId[] = ["boardroom", "city", "chart", "warehouse", "headlines"];
export type WorldCtx = {
  /** 0 = dark, 1 = lit, per store index (city) */
  storeOn: (i: number) => number;
  chart?: ChartGeo;
  /** how much of the chart is drawn (a float index) */
  chartDraw: number;
  /** newspaper arrival 0..1 per paper index (headlines) */
  paper: (i: number) => number;
  headline?: string;
};
export type BizSet = {
  id: BizSetId;
  bg: string;
  mood: BizSetId;
  anchors: Record<string, V3>;
  blockers: { name: string; c: V3; h: V3 }[];
  render: (t: number, w: WorldCtx) => React.ReactNode;
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const basic = new Map<string, THREE.MeshBasicMaterial>();
export const bmat = (c: string, o = 1, tex?: THREE.Texture, fog = true) => {
  const k = `${c}|${o.toFixed(3)}|${tex?.uuid ?? ""}|${fog}`;
  let m = basic.get(k);
  if (!m) { if (basic.size > 300) basic.clear(); m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1, map: tex ?? null, toneMapped: false, fog }); basic.set(k, m); }
  return m;
};
const glowM = new Map<string, THREE.MeshStandardMaterial>();
/** a lit surface: standard material with an emissive map/colour (windows, signs) */
export const glow = (color: string, ei: number, tex?: THREE.Texture, rough = 0.4) => {
  const q = Math.round(ei * 20) / 20;
  const k = `${color}|${q}|${tex?.uuid ?? ""}|${rough}`;
  let m = glowM.get(k);
  if (!m) { if (glowM.size > 300) glowM.clear(); m = new THREE.MeshStandardMaterial({ color: tex ? "#ffffff" : color, map: tex ?? null, emissive: color, emissiveMap: tex ?? null, emissiveIntensity: q, roughness: rough, metalness: 0 }); glowM.set(k, m); }
  return m;
};
const PLANE = () => geoOf("bzPlane", () => new THREE.PlaneGeometry(1, 1));
const BOX = () => geoOf("bzBox", () => new THREE.BoxGeometry(1, 1, 1));
const bgDome = (c: string) => { const m = bmat(c, 1, undefined, false); m.side = THREE.BackSide; m.depthWrite = false; return <mesh geometry={geoOf("bzDome", () => new THREE.SphereGeometry(400, 16, 10))} material={m} />; };

/** a dusk-sky gradient card */
const skyTex = (key: string, top: string, mid: string, bot: string) => canvasTexture(key, 8, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
/** a building facade: a window grid, some windows lit (warm), the rest dark glass */
const facadeTex = (seed: number, lit = 0.45) => canvasTexture(`bzFacade${seed}|${lit}`, 128, 256, (g, W, H) => {
  g.fillStyle = "#1b2238"; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 16; r++) for (let c = 0; c < 6; c++) {
    const on = hash(seed * 31 + r * 7 + c) < lit;
    g.fillStyle = on ? (hash(seed + r + c * 3) < 0.5 ? "#ffd58a" : "#fff1c9") : "#2c3a5a";
    g.fillRect(8 + c * 20, 6 + r * 15.6, 13, 9);
  }
});
const SIGN_WORDS = ["VIDEO", "RENTALS", "MOVIES", "VIDEO", "FILMS", "RENTALS", "VIDEO", "MOVIES", "FILMS"];
const signTex = (word: string, col: string) => canvasTexture(`bzSign${word}|${col}`, 512, 128, (g, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffffff"; g.font = "bold 88px 'DejaVu Sans', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(word, W / 2, H / 2 + 4);
});
const woodTex = (key: string, a: string, b: string, planks = 8) => canvasTexture(key, 256, 256, (g, W, H) => {
  for (let k = 0; k < planks; k++) { g.fillStyle = k % 2 ? a : b; g.fillRect(0, (k * H) / planks, W, H / planks); g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, (k * H) / planks, W, 2); }
  for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(0,0,0,${0.04 + 0.05 * hash(k)})`; g.fillRect(hash(k + 3) * W, hash(k + 9) * H, 40 + 60 * hash(k + 1), 1.5); }
});

// ------------------------------------------------------------------ boardroom
const CHAIRS: { p: V3; yaw: number; head?: boolean }[] = [
  ...[-2.2, -0.8, 0.6, 2.0].map((z) => ({ p: [-1.15, 0, z] as V3, yaw: Math.PI / 2 })),
  ...[-2.2, -0.8, 0.6, 2.0].map((z) => ({ p: [1.15, 0, z] as V3, yaw: -Math.PI / 2 })),
  { p: [0, 0, -3.75], yaw: 0, head: true },
];
const Chair: React.FC<{ p: V3; yaw: number; head?: boolean }> = ({ p, yaw, head }) => {
  const lea = plastic("#16181d", { rough: 0.35 }), chrome = plastic("#c7ccd4", { rough: 0.2 });
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={rbox(0.55, 0.1, 0.52, 0.04)} material={lea} position={[0, 0.44, 0]} castShadow />
      <mesh geometry={rbox(0.55, head ? 1.0 : 0.62, 0.1, 0.05)} material={lea} position={[0, head ? 0.98 : 0.8, -0.26]} rotation={[-0.1, 0, 0]} castShadow />
      <mesh geometry={geoOf("bzChairPost", () => new THREE.CylinderGeometry(0.035, 0.035, 0.36, 10))} material={chrome} position={[0, 0.22, 0]} />
      {[0, 1, 2, 3, 4].map((k) => <mesh key={k} geometry={BOX()} material={chrome} position={[0.17 * Math.sin((k * 2 * Math.PI) / 5), 0.04, 0.17 * Math.cos((k * 2 * Math.PI) / 5)]} rotation={[0, (k * 2 * Math.PI) / 5, 0]} scale={[0.04, 0.035, 0.34]} />)}
    </group>
  );
};
const SKYLINE = Array.from({ length: 26 }, (_, k) => ({ x: -34 + k * 2.7 + 1.2 * hash(k + 4), z: -22 - 16 * hash(k + 8), h: 6 + 22 * hash(k + 2) ** 1.4, w: 2 + 2.2 * hash(k + 6), seed: k }));
const Skyline: React.FC<{ t: number; y0?: number }> = ({ t, y0 = -3 }) => (
  <>
    <mesh geometry={PLANE()} material={bmat("#ffffff", 1, skyTex("bzDusk", "#1a2550", "#5a4f8a", "#f09a6a"), false)} position={[0, 18, -70]} scale={[220, 60, 1]} />
    {SKYLINE.map((b) => (
      <mesh key={b.seed} geometry={BOX()} material={glow("#ffd28a", 0.9, facadeTex(b.seed % 9))} position={[b.x, y0 + b.h / 2, b.z]} scale={[b.w, b.h, b.w]} />
    ))}
    {/* twinkling windows: a few small lights that switch over time */}
    {Array.from({ length: 30 }, (_, k) => { const b = SKYLINE[k % SKYLINE.length]; const on = Math.sin(t * (0.7 + hash(k) * 1.6) + k * 3) > 0.2; return on ? <mesh key={k} geometry={PLANE()} material={bmat("#fff2c0", 1)} position={[b.x - b.w / 2 + b.w * hash(k + 11), y0 + b.h * (0.2 + 0.7 * hash(k + 5)), b.z + b.w / 2 + 0.02]} scale={[0.35, 0.25, 1]} /> : null; })}
    {/* drifting clouds */}
    {[0, 1, 2, 3].map((k) => <mesh key={k} geometry={PLANE()} material={bmat("#f5c3a8", 0.32, undefined, false)} position={[((t * 0.6 + k * 30) % 120) - 60, 26 + 5 * k, -66]} scale={[24, 2.2, 1]} />)}
  </>
);
const boardroom: BizSet = {
  id: "boardroom", bg: "#231c26", mood: "boardroom",
  anchors: {
    centre: [0, 0, 0], head: [0, 0, -3.75], tableTop: [0, 0.78, 0], tableEnd: [0, 0.78, 2.8], foot: [0, 0, 3.7], window: [0, 1.9, -5.9],
    seatL1: [-1.15, 0, -2.2], seatL2: [-1.15, 0, -0.8], seatL3: [-1.15, 0, 0.6], seatL4: [-1.15, 0, 2.0],
    seatR1: [1.15, 0, -2.2], seatR2: [1.15, 0, -0.8], seatR3: [1.15, 0, 0.6], seatR4: [1.15, 0, 2.0],
    standL: [-2.4, 0, -1.2], standR: [2.4, 0, -1.2], door: [0, 0, 4.6], high: [0, 3.2, 2.5],
  },
  blockers: [{ name: "table", c: [0, 0.755, -0.2], h: [0.85, 0.035, 3.0] }, { name: "windowWall", c: [0, 2, -6.05], h: [6, 2, 0.1] }],
  render: (t) => {
    const floor = woodTex("bzFloor", "#5a3a24", "#4d3220", 10);
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping; floor.repeat.set(4, 6);
    return (
      <>
        {bgDome("#231c26")}
        <Skyline t={t} y0={-6} />
        <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.55, map: floor })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} scale={[11, 11, 1]} receiveShadow />
        {/* a dark rug under the table */}
        <mesh geometry={PLANE()} material={plastic("#2b2236", { rough: 0.95 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.4]} scale={[4.2, 8.6, 1]} receiveShadow />
        {/* the window wall: mullions over open glass */}
        {[-5, -3, -1, 1, 3, 5].map((x) => <mesh key={x} geometry={BOX()} material={plastic("#1b1d22", { rough: 0.4 })} position={[x, 1.95, -6]} scale={[0.12, 3.9, 0.12]} />)}
        {[0.06, 1.3, 3.85].map((y) => <mesh key={y} geometry={BOX()} material={plastic("#1b1d22", { rough: 0.4 })} position={[0, y, -6]} scale={[10.4, 0.12, 0.14]} />)}
        <mesh geometry={PLANE()} material={bmat("#9cc9f0", 0.08)} position={[0, 1.95, -6.02]} scale={[10.2, 3.8, 1]} />
        {/* side walls (wood panels), ceiling with downlights */}
        {[-5.5, 5.5].map((x) => <mesh key={x} geometry={BOX()} material={plastic("#4a2f1f", { rough: 0.5 })} position={[x, 1.95, -0.5]} scale={[0.15, 3.9, 11]} receiveShadow />)}
        <mesh geometry={BOX()} material={plastic("#1d1a20", { rough: 0.9 })} position={[0, 3.95, -0.5]} scale={[11, 0.1, 11]} />
        {[-2.5, -0.5, 1.5].map((z) => [-0.9, 0.9].map((x) => <mesh key={`${x}${z}`} geometry={geoOf("bzDown", () => new THREE.CircleGeometry(0.16, 20))} material={bmat("#fff1d6", 1)} position={[x, 3.89, z]} rotation={[Math.PI / 2, 0, 0]} />))}
        {/* the table: a dark polished top on two pedestals; folders, glasses and a speakerphone on it */}
        <mesh geometry={rbox(1.7, 0.07, 6.0, 0.03)} material={plastic("#2a1a10", { rough: 0.18 })} position={[0, 0.755, -0.2]} castShadow receiveShadow />
        {[-1.8, 1.4].map((z) => <mesh key={z} geometry={rbox(0.5, 0.72, 0.9, 0.04)} material={plastic("#1f140c", { rough: 0.4 })} position={[0, 0.36, z]} castShadow />)}
        {[-2.2, -0.8, 0.6, 2.0].map((z, k) => [-1, 1].map((s) => (
          <group key={`${z}${s}`}>
            <mesh geometry={BOX()} material={plastic(k % 2 ? "#e9e4d8" : "#f4efe4", { rough: 0.7 })} position={[s * 0.5, 0.797, z + 0.05]} rotation={[0, 0.2 * s, 0]} scale={[0.3, 0.014, 0.4]} castShadow />
            <mesh geometry={geoOf("bzGlass", () => new THREE.CylinderGeometry(0.035, 0.03, 0.12, 12))} material={bmat("#cfe6ff", 0.45)} position={[s * 0.62, 0.85, z - 0.32]} />
          </group>
        )))}
        <mesh geometry={geoOf("bzSpk", () => new THREE.CylinderGeometry(0.16, 0.2, 0.05, 3))} material={plastic("#202226", { rough: 0.3 })} position={[0, 0.815, -0.2]} />
        <mesh geometry={geoOf("bzSpkL", () => new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8))} material={bmat(Math.sin(t * 4) > 0 ? BP.green : "#1a5a32", 1)} position={[0, 0.845, -0.27]} />
        {CHAIRS.map((c, k) => <Chair key={k} {...c} />)}
        {/* a wall clock with a running second hand */}
        <group position={[-5.4, 2.6, -2]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={geoOf("bzClock", () => new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32))} material={plastic("#f4f0e6", { rough: 0.5 })} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={BOX()} material={bmat(BP.red)} position={[0, 0, 0.04]} rotation={[0, 0, -t * ((2 * Math.PI) / 60) * 6]} scale={[0.012, 0.36, 0.01]} />
          <mesh geometry={BOX()} material={bmat("#111111")} position={[0, 0, 0.035]} rotation={[0, 0, -1.1]} scale={[0.03, 0.26, 0.01]} />
        </group>
        {/* dust in the light */}
        {Array.from({ length: 24 }, (_, k) => <mesh key={k} geometry={geoOf("bzMote", () => new THREE.SphereGeometry(0.012, 5, 4))} material={bmat("#fff4dc", 0.7)} position={[-2 + 4 * hash(k), 0.9 + ((hash(k + 3) * 2.8 + t * 0.06 * (0.5 + hash(k + 7))) % 2.8), -3 + 6 * hash(k + 5) + 0.1 * Math.sin(t * 0.5 + k)]} />)}
      </>
    );
  },
};

// ------------------------------------------------------------------ city block
export const STORE_N = 9, STORE_W = 1.9;
const STORE_COLS = ["#C2410C", "#0F766E", "#7C3AED", "#B45309", "#1D4ED8", "#BE123C", "#15803D", "#A16207", "#334155"];
export const storeX = (i: number) => (i - (STORE_N - 1) / 2) * STORE_W;
const STORES = Array.from({ length: STORE_N }, (_, i) => ({ x: storeX(i), h: 1.7 + 0.9 * hash(i + 21), col: STORE_COLS[i], word: SIGN_WORDS[i], aw: hash(i + 4) < 0.5 }));
// the plaza behind the middle stores stays open (x -2.6..2.6): the "hq" anchor tower stands there
const TOWERS = Array.from({ length: 16 }, (_, k) => ({ x: -11 + k * 1.5 + 0.6 * hash(k + 40), z: -7 - 7 * hash(k + 41), h: 4 + 9 * hash(k + 42), w: 1.4 + hash(k + 43), seed: k + 3 })).filter((b) => Math.abs(b.x) > 2.6 + b.w / 2);
const Car: React.FC<{ x: number; z: number; dir: 1 | -1; col: string }> = ({ x, z, dir, col }) => (
  <group position={[x, 0, z]} rotation={[0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
    <mesh geometry={rbox(0.5, 0.2, 0.95, 0.07)} material={plastic(col, { rough: 0.3 })} position={[0, 0.16, 0]} castShadow />
    <mesh geometry={rbox(0.42, 0.16, 0.5, 0.06)} material={plastic("#1f2937", { rough: 0.2 })} position={[0, 0.32, -0.05]} />
    {[-0.16, 0.16].map((s) => <mesh key={s} geometry={PLANE()} material={bmat("#fff6d0", 1)} position={[s, 0.17, 0.48]} scale={[0.09, 0.05, 1]} />)}
    {[-0.16, 0.16].map((s) => <mesh key={`r${s}`} geometry={PLANE()} material={bmat("#ff3b30", 1)} position={[s, 0.17, -0.48]} rotation={[0, Math.PI, 0]} scale={[0.09, 0.04, 1]} />)}
  </group>
);
const city: BizSet = {
  id: "city", bg: "#141c38", mood: "city",
  anchors: { centre: [0, 0, 0], street: [0, 0, 0], stores: [0, 0, -2.2], hq: [0, 0, -7], corner: [-8, 0, 0], high: [0, 6, 4], front: [0, 0, 1.9], ...Object.fromEntries(STORES.map((s, i) => [`store${i}`, [s.x, 0, -2.2] as V3])) },
  blockers: STORES.map((s, i) => ({ name: `store${i}`, c: [s.x, s.h / 2, -3.0] as V3, h: [STORE_W / 2 - 0.05, s.h / 2, 0.8] as V3 })),
  render: (t, w) => (
    <>
      {bgDome("#141c38")}
      <mesh geometry={PLANE()} material={bmat("#ffffff", 1, skyTex("bzCitySky", "#0f1838", "#3a3a78", "#d0806a"), false)} position={[0, 14, -40]} scale={[160, 40, 1]} />
      <Skyline t={t} y0={-2} />
      {/* ground: asphalt, sidewalks, lane dashes, a crosswalk */}
      <mesh geometry={PLANE()} material={plastic("#2a2e38", { rough: 0.85 })} rotation={[-Math.PI / 2, 0, 0]} scale={[60, 40, 1]} receiveShadow />
      {[-1.8, 1.8].map((z) => <mesh key={z} geometry={BOX()} material={plastic("#8f8a84", { rough: 0.9 })} position={[0, 0.04, z]} scale={[40, 0.08, 0.8]} receiveShadow />)}
      {Array.from({ length: 16 }, (_, k) => <mesh key={k} geometry={PLANE()} material={bmat("#e8d27a", 1)} rotation={[-Math.PI / 2, 0, 0]} position={[-15 + k * 2, 0.005, 0]} scale={[0.9, 0.08, 1]} />)}
      {Array.from({ length: 6 }, (_, k) => <mesh key={`cw${k}`} geometry={PLANE()} material={bmat("#e9e9e9", 1)} rotation={[-Math.PI / 2, 0, 0]} position={[-9.6, 0.006, -1.1 + k * 0.45]} scale={[1.1, 0.22, 1]} />)}
      {/* towers behind the stores */}
      {TOWERS.map((b) => <mesh key={b.seed} geometry={BOX()} material={glow("#ffd28a", 0.8, facadeTex(b.seed % 9, 0.5))} position={[b.x, b.h / 2, b.z]} scale={[b.w, b.h, b.w]} castShadow />)}
      {/* the store row */}
      {STORES.map((s, i) => {
        const on = w.storeOn(i);
        return (
          <group key={i} position={[s.x, 0, -3.0]}>
            <mesh geometry={rbox(STORE_W - 0.08, s.h, 1.6, 0.03)} material={plastic(s.col, { rough: 0.7 })} position={[0, s.h / 2, 0]} castShadow receiveShadow />
            {/* shop window: warm and glowing when open, dark glass when closed */}
            <mesh geometry={PLANE()} material={on > 0.02 ? glow("#ffbf5a", 0.9 * on, undefined, 0.3) : plastic("#1a2030", { rough: 0.15 })} position={[-0.2, 0.62, 0.81]} scale={[1.15, 0.8, 1]} />
            <mesh geometry={PLANE()} material={on > 0.02 ? glow("#ffd890", 0.7 * on) : plastic("#141a26", { rough: 0.2 })} position={[0.62, 0.55, 0.81]} scale={[0.36, 1.0, 1]} />
            {/* shelf silhouettes in the window */}
            {on > 0.02 ? [0.4, 0.72].map((y) => <mesh key={y} geometry={PLANE()} material={bmat("#7a4a20", 0.55 * on)} position={[-0.2, y, 0.815]} scale={[1.0, 0.05, 1]} />) : null}
            {/* the sign: lit text when open; when closed a dead panel */}
            <mesh geometry={PLANE()} material={on > 0.02 ? glow("#ffffff", 0.15 + 0.4 * on, signTex(s.word, s.col)) : plastic("#2b2b30", { rough: 0.6 })} position={[0, 1.2, 0.815]} scale={[1.5, 0.3, 1]} />
            {/* the awning */}
            <mesh geometry={BOX()} material={plastic(s.aw ? "#f3efe6" : "#1f2937", { rough: 0.7 })} position={[0, 1.05, 1.0]} rotation={[0.45, 0, 0]} scale={[STORE_W - 0.15, 0.04, 0.45]} castShadow />
            {/* upper windows */}
            {s.h > 2.0 ? [-0.5, 0, 0.5].map((x) => <mesh key={x} geometry={PLANE()} material={glow("#ffd890", hash(i * 3 + x) > 0.5 ? 0.6 * on + 0.1 : 0.05)} position={[x, s.h - 0.35, 0.81]} scale={[0.3, 0.28, 1]} />) : null}
          </group>
        );
      })}
      {/* street lamps (they breathe) and trees */}
      {[-7, -3.5, 0, 3.5, 7].map((x, k) => (
        <group key={x} position={[x + 0.95, 0, 1.95]}>
          <mesh geometry={geoOf("bzPole", () => new THREE.CylinderGeometry(0.03, 0.04, 1.6, 8))} material={plastic("#1c1f26", { rough: 0.5 })} position={[0, 0.8, 0]} />
          <mesh geometry={geoOf("bzLamp", () => new THREE.SphereGeometry(0.09, 10, 8))} material={bmat("#ffe2a0", 1)} position={[0, 1.62, 0]} scale={1 + 0.04 * Math.sin(t * 3 + k)} />
        </group>
      ))}
      {[-5.2, 1.8, 5.3].map((x, k) => (
        <group key={x} position={[x, 0, 1.85]} rotation={[0, 0, 0.03 * Math.sin(t * 1.1 + k)]}>
          <mesh geometry={geoOf("bzTrunk", () => new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6))} material={plastic("#4a3020")} position={[0, 0.3, 0]} />
          <mesh geometry={geoOf("bzLeaf", () => new THREE.IcosahedronGeometry(0.35, 0))} material={plastic("#2f7a3a", { flat: true, rough: 0.8 })} position={[0, 0.8, 0]} castShadow />
        </group>
      ))}
      {/* traffic: cars loop both ways */}
      {[0, 1, 2].map((k) => <Car key={k} x={((t * 2.4 + k * 9) % 27) - 13.5} z={0.6} dir={1} col={["#e5e7eb", "#2563eb", "#f59e0b"][k]} />)}
      {[0, 1].map((k) => <Car key={`b${k}`} x={13.5 - ((t * 2.0 + k * 13) % 27)} z={-0.6} dir={-1} col={["#dc2626", "#10b981"][k]} />)}
    </>
  ),
};

// ------------------------------------------------------------------ chart studio
const gridTex = () => canvasTexture("bzGrid", 512, 512, (g, W, H) => {
  g.fillStyle = "#0b1430"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(120,160,255,0.22)"; g.lineWidth = 2;
  for (let k = 0; k <= 16; k++) { const v = (k * W) / 16; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, H); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
  g.strokeStyle = "rgba(160,190,255,0.5)"; g.lineWidth = 4;
  for (let k = 0; k <= 4; k++) { const v = (k * W) / 4; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, H); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
});
const chartSet: BizSet = {
  id: "chart", bg: "#0b1430", mood: "chart",
  anchors: { centre: [0, 0, 0], floor: [0, 0, 0], high: [0, 8, 6] },
  blockers: [],
  render: (t, w) => {
    const tx = gridTex(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(24, 12); tx.needsUpdate = true;
    const scan = ((t * 6) % 80) - 20;
    return (
      <>
        {bgDome("#0b1430")}
        <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.35, map: tx })} rotation={[-Math.PI / 2, 0, 0]} position={[20, 0, 0]} scale={[120, 60, 1]} receiveShadow />
        <mesh geometry={PLANE()} material={bmat("#6f8cff", 0.3)} rotation={[-Math.PI / 2, 0, 0]} position={[scan, 0.01, 0]} scale={[0.5, 60, 1]} />
        {/* rising motes (the market is alive) */}
        {Array.from({ length: 40 }, (_, k) => <mesh key={k} geometry={PLANE()} material={bmat(k % 3 ? "#7fa0ff" : BP.gold, 0.6)} position={[-8 + 60 * hash(k), (hash(k + 2) * 14 + t * (0.3 + 0.5 * hash(k + 4))) % 14, -6 - 10 * hash(k + 6)]} rotation={[0, 0, t + k]} scale={0.12} />)}
        {/* a distant back wall of faint bars */}
        {Array.from({ length: 30 }, (_, k) => <mesh key={`b${k}`} geometry={BOX()} material={bmat("#1c2c66", 1)} position={[-10 + k * 2.2, 0, -26]} scale={[1.4, 2 + 10 * hash(k + 9) + 0.6 * Math.sin(t * 0.8 + k), 0.4]} />)}
        {w.chart ? <ChartView g={w.chart} draw={w.chartDraw} t={t} /> : null}
      </>
    );
  },
};

// ------------------------------------------------------------------ warehouse
const boxTex = () => canvasTexture("bzBoxTex", 128, 128, (g, W, H) => {
  g.fillStyle = BP.cardboard; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,0.08)"; for (let k = 0; k < 30; k++) g.fillRect(0, hash(k) * H, W, 1);
  g.fillStyle = "#d8b98a"; g.fillRect(W * 0.42, 0, W * 0.16, H);
  g.fillStyle = "#3a2a18"; g.fillRect(W * 0.12, H * 0.66, W * 0.22, 6); g.fillRect(W * 0.12, H * 0.74, W * 0.14, 6);
});
export const CardBox: React.FC<{ p: V3; s?: number; r?: number }> = ({ p, s = 1, r = 0 }) => (
  <mesh geometry={rbox(0.55, 0.42, 0.45, 0.02)} material={plastic("#ffffff", { rough: 0.85, map: boxTex() })} position={p} rotation={[0, r, 0]} scale={s} castShadow receiveShadow />
);
const RACK_Z = [-4.5, -2.5, -0.5, 1.5];
const Rack: React.FC<{ x: number; seed: number }> = ({ x, seed }) => (
  <group position={[x, 0, 0]}>
    {RACK_Z.map((z) => [-0.45, 0.45].map((dx) => <mesh key={`${z}${dx}`} geometry={BOX()} material={plastic("#2b5fb8", { rough: 0.5 })} position={[dx, 1.6, z - 1]} scale={[0.06, 3.2, 0.06]} />))}
    {[0.15, 1.15, 2.15, 3.1].map((y) => <mesh key={y} geometry={BOX()} material={plastic("#e8762b", { rough: 0.5 })} position={[0, y, -1.5]} scale={[1.0, 0.07, 8.2]} castShadow />)}
    {[0.2, 1.2, 2.2].flatMap((y, l) => Array.from({ length: 12 }, (_, k) => {
      const z = -5.2 + k * 0.62, show = hash(seed * 13 + l * 17 + k) < 0.82;
      return show ? <CardBox key={`${l}${k}`} p={[0.1 * (hash(k + l) - 0.5), y + 0.21, z]} r={0.12 * (hash(k * 3 + l) - 0.5)} /> : null;
    }))}
  </group>
);
const warehouse: BizSet = {
  id: "warehouse", bg: "#2a2d36", mood: "warehouse",
  anchors: { centre: [0, 0, 0], aisle: [0, 0, 2.5], conveyor: [0, 0.82, 0], rackL: [-2.6, 0, 0], rackR: [2.6, 0, 0], back: [0, 0, -6.5], dock: [0, 0, 4], high: [0, 4, 3] },
  blockers: [{ name: "conveyor", c: [0, 0.42, -1], h: [0.42, 0.42, 4.6] }, { name: "rackL", c: [-2.6, 1.6, -1.5], h: [0.55, 1.6, 4.1] }, { name: "rackR", c: [2.6, 1.6, -1.5], h: [0.55, 1.6, 4.1] }],
  render: (t) => (
    <>
      {bgDome("#2a2d36")}
      <mesh geometry={PLANE()} material={plastic("#9c978e", { rough: 0.8 })} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} receiveShadow />
      {[-1.2, 1.2].map((x) => <mesh key={x} geometry={PLANE()} material={bmat("#e8c33a", 1)} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.004, 0]} scale={[0.08, 14, 1]} />)}
      <mesh geometry={PLANE()} material={plastic("#5d6470", { rough: 0.7 })} position={[0, 3, -7.5]} scale={[16, 6, 1]} receiveShadow />
      {Array.from({ length: 20 }, (_, k) => <mesh key={k} geometry={BOX()} material={plastic("#6e7682", { rough: 0.6 })} position={[-7.6 + k * 0.8, 3, -7.45]} scale={[0.08, 6, 0.05]} />)}
      <Rack x={-2.6} seed={1} />
      <Rack x={2.6} seed={2} />
      {/* the conveyor: a belt, rollers turning, boxes riding toward the dock */}
      <mesh geometry={BOX()} material={plastic("#2d3138", { rough: 0.5 })} position={[0, 0.42, -1]} scale={[0.84, 0.84, 9.2]} castShadow />
      <mesh geometry={BOX()} material={plastic("#16181c", { rough: 0.9 })} position={[0, 0.85, -1]} scale={[0.7, 0.02, 9.2]} />
      {Array.from({ length: 14 }, (_, k) => <mesh key={k} geometry={geoOf("bzRoller", () => new THREE.CylinderGeometry(0.04, 0.04, 0.74, 8))} material={plastic("#9aa3b0", { rough: 0.3 })} position={[0, 0.86, -5.4 + k * 0.66]} rotation={[t * 6, 0, Math.PI / 2]} />)}
      {[0, 1, 2, 3, 4].map((k) => <CardBox key={k} p={[0, 1.08, -5.4 + ((t * 0.9 + k * 1.9) % 9.2)]} s={0.85} />)}
      {/* hanging lamps that sway, with light cones */}
      {[-3.5, 0, 3.5].map((z, k) => { const sw = 0.06 * Math.sin(t * 1.2 + k); return (
        <group key={z} position={[0, 5.6, z - 1]} rotation={[sw, 0, sw * 0.6]}>
          <mesh geometry={geoOf("bzCord", () => new THREE.CylinderGeometry(0.01, 0.01, 1.6, 4))} material={plastic("#111")} position={[0, -0.8, 0]} />
          <mesh geometry={geoOf("bzShade", () => new THREE.ConeGeometry(0.4, 0.3, 16, 1, true))} material={plastic("#2f3640", { rough: 0.4, side: THREE.DoubleSide })} position={[0, -1.7, 0]} />
          <mesh geometry={geoOf("bzBulb", () => new THREE.SphereGeometry(0.1, 10, 8))} material={bmat("#fff0c8", 1)} position={[0, -1.82, 0]} />
          <mesh geometry={geoOf("bzCone", () => new THREE.ConeGeometry(1.8, 3.6, 24, 1, true))} material={bmat("#ffe7b0", 0.05)} position={[0, -3.6, 0]} />
        </group>
      ); })}
      {Array.from({ length: 30 }, (_, k) => <mesh key={`d${k}`} geometry={geoOf("bzMote", () => new THREE.SphereGeometry(0.012, 5, 4))} material={bmat("#fff4dc", 0.6)} position={[-1.5 + 3 * hash(k), 0.5 + ((hash(k + 3) * 4 + t * 0.08 * (0.5 + hash(k + 7))) % 4), -5 + 9 * hash(k + 5)]} />)}
    </>
  ),
};

// ------------------------------------------------------------------ headline wall
const MASTHEADS = ["THE DAILY LEDGER", "THE MARKET WIRE", "THE MORNING BELL", "THE DAILY LEDGER", "THE COUNTING HOUSE"];
const HEADS = ["SHARES SLIDE", "STORES CLOSE", "DEBT MOUNTS", "SALES SLUMP", "LAYOFFS LOOM", "RIVAL SOARS", "STOCK PLUNGES", "CEO OUT", "PROFIT WARNING", "MARKET SHOCK"];
const paperTex = (key: string, mast: string, head: string, hero: boolean) => canvasTexture(key, hero ? 640 : 320, hero ? 840 : 420, (g, W, H) => {
  g.fillStyle = "#f3eee2"; g.fillRect(0, 0, W, H);
  const k = W / 320;
  g.fillStyle = "#141414"; g.textAlign = "center"; g.textBaseline = "top";
  g.font = `bold ${22 * k}px 'DejaVu Serif', Georgia, serif`; g.fillText(mast, W / 2, 12 * k);
  g.fillRect(14 * k, 42 * k, W - 28 * k, 3 * k); g.fillRect(14 * k, 48 * k, W - 28 * k, 1 * k);
  // the headline, wrapped to the width, big and black
  g.font = `bold ${(hero ? 40 : 38) * k}px 'DejaVu Sans', Arial, sans-serif`;
  const words = head.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const wd of words) { const nx = cur ? `${cur} ${wd}` : wd; if (g.measureText(nx).width > W - 30 * k && cur) { lines.push(cur); cur = wd; } else cur = nx; }
  if (cur) lines.push(cur);
  lines.slice(0, 4).forEach((ln, i) => g.fillText(ln, W / 2, (58 + i * 44) * k));
  const y0 = (58 + Math.min(4, lines.length) * 44 + 10) * k;
  g.fillStyle = "#b9b2a3"; g.fillRect(14 * k, y0, W * 0.52, H * 0.3);
  g.fillStyle = "#5a554c";
  for (let r = 0; r < 26; r++) for (let c = 0; c < 2; c++) { const x = c === 0 ? W * 0.56 : 14 * k, y = c === 0 ? y0 + r * 9 * k : y0 + H * 0.3 + 10 * k + r * 9 * k; if (y < H - 12 * k) g.fillRect(x, y, (c === 0 ? W * 0.4 : W - 28 * k) * (0.7 + 0.3 * hash(r + c * 40)), 3 * k); }
});
const PAPERS = Array.from({ length: 18 }, (_, k) => {
  const col = k % 6, row = Math.floor(k / 6);
  return { x: -4.1 + col * 1.64 + 0.15 * (hash(k) - 0.5), y: 0.95 + row * 1.5 + 0.12 * hash(k + 3), r: 0.12 * (hash(k + 5) - 0.5), mast: MASTHEADS[k % MASTHEADS.length], head: HEADS[k % HEADS.length], k };
}).filter((p) => !(Math.abs(p.x) < 1.2 && p.y > 1.5 && p.y < 3.6));
export const PAPER_N = PAPERS.length + 1;
const headlines: BizSet = {
  id: "headlines", bg: "#2a2119", mood: "headlines",
  anchors: { centre: [0, 0, 2], wall: [0, 2.3, -1], hero: [0, 2.4, -0.88], left: [-2.6, 2.2, -0.95], right: [2.6, 2.2, -0.95], floor: [0, 0, 1.5] },
  blockers: [],
  render: (t, w) => {
    const arrive = (i: number, x: number, y: number, z: number, r: number) => {
      const u = w.paper(i);
      const k = 1 - u;
      return { p: [x + k * (x > 0 ? 2.5 : -2.5), y + k * 1.2, z + k * 3.5] as V3, r: r + k * (x > 0 ? 0.9 : -0.9), s: 1 + 0.2 * k, vis: u > 0.001 };
    };
    const hero = arrive(PAPERS.length, 0, 2.45, -0.86, -0.02);
    return (
      <>
        {bgDome("#2a2119")}
        <mesh geometry={PLANE()} material={plastic("#6b4a33", { rough: 0.95 })} position={[0, 2.5, -1.05]} scale={[12, 7, 1]} receiveShadow />
        <mesh geometry={PLANE()} material={plastic("#3a2a1e", { rough: 0.8 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} scale={[14, 8, 1]} receiveShadow />
        {PAPERS.map((p, i) => {
          const a = arrive(i, p.x, p.y, -0.98, p.r);
          if (!a.vis) return null;
          const fl = 0.025 * Math.sin(t * 2.1 + p.k);
          return (
            <group key={i} position={a.p} rotation={[fl, fl * 0.6, a.r]} scale={a.s}>
              <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: paperTex(`bzPaper${p.k}`, p.mast, p.head, false), side: THREE.DoubleSide })} scale={[1.2, 1.58, 1]} castShadow />
              <mesh geometry={geoOf("bzPin", () => new THREE.SphereGeometry(0.035, 8, 6))} material={plastic(i % 2 ? BP.red : BP.gold, { rough: 0.3 })} position={[0, 0.72, 0.03]} />
            </group>
          );
        })}
        {hero.vis ? (
          <group position={hero.p} rotation={[0.02 * Math.sin(t * 1.7), 0, hero.r]} scale={hero.s}>
            <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.8, map: paperTex(`bzHero|${w.headline ?? ""}`, "THE DAILY LEDGER", (w.headline ?? "BREAKING NEWS").toUpperCase(), true), side: THREE.DoubleSide })} scale={[1.75, 2.3, 1]} castShadow />
            <mesh geometry={geoOf("bzPin", () => new THREE.SphereGeometry(0.035, 8, 6))} material={plastic(BP.red, { rough: 0.3 })} position={[0, 1.08, 0.03]} />
          </group>
        ) : null}
        {/* a bare bulb swinging in front of the wall */}
        <group position={[0.9, 5.4, 1.2]} rotation={[0, 0, 0.09 * Math.sin(t * 1.3)]}>
          <mesh geometry={geoOf("bzCord2", () => new THREE.CylinderGeometry(0.008, 0.008, 1.2, 4))} material={plastic("#111")} position={[0, -0.6, 0]} />
          <mesh geometry={geoOf("bzBulb", () => new THREE.SphereGeometry(0.1, 10, 8))} material={bmat("#fff0c8", 1)} position={[0, -1.25, 0]} />
        </group>
      </>
    );
  },
};

export const BIZ_SETS: Record<BizSetId, BizSet> = { boardroom, city, chart: chartSet, warehouse, headlines };

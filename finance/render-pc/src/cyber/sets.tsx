// cyber3d sets. Dark, neon, and never still: screens scroll, LEDs twinkle, packets fly, dust and data bits drift,
// scan lines sweep. Everything is procedural (canvas textures and primitives): no logos, seals or real brands.
//   room      a dim hacker room: desk, three glowing monitors, a rack, the hooded figure's seat
//   vault     a black floor grid and a neon ring stage for the data-block vault (src/cyber/objects.ts)
//   netmap    a dotted 3D world map (stylised continents) with city nodes; packets fly between them (kit "route")
//   inbox     a wall of email tiles; one slot ("phish") is left for the red phishing email (kit "email")
//   evidence  an evidence board: pinned photos and documents, red string between pins (generic, no agency marks)
//   servers   a server-room corridor: racks both sides, blinking LEDs, light strips, a reflective floor
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import type { CyberMoodId } from "./palette";
import { CP } from "./palette";

export type CyberSetId = CyberMoodId;
export type CyberSet = {
  id: CyberSetId;
  bg: string;
  mood: CyberMoodId;
  anchors: Record<string, V3>;
  blockers: { name: string; c: V3; h: V3 }[];
  render: (t: number) => React.ReactNode;
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const basic = new Map<string, THREE.MeshBasicMaterial>();
/** an unlit neon material (blooms) */
export const neon = (c: string, o = 1, tex?: THREE.Texture, side: THREE.Side = THREE.FrontSide) => {
  const q = Math.round(o * 20) / 20;
  const k = `${c}|${q}|${tex?.uuid ?? ""}|${side}`;
  let m = basic.get(k);
  if (!m) { if (basic.size > 500) basic.clear(); m = new THREE.MeshBasicMaterial({ color: c, transparent: q < 1, opacity: q, depthWrite: q >= 1, map: tex ?? null, toneMapped: false, side }); basic.set(k, m); }
  return m;
};
const PLANE = () => geoOf("csPlane", () => new THREE.PlaneGeometry(1, 1));
const BOX = () => geoOf("csBox", () => new THREE.BoxGeometry(1, 1, 1));
const OCTA = () => geoOf("csOcta", () => new THREE.OctahedronGeometry(1, 0));
const bgDome = (c: string) => { const m = neon(c, 1, undefined, THREE.BackSide); m.fog = false; m.depthWrite = false; return <mesh geometry={geoOf("csDome", () => new THREE.SphereGeometry(300, 16, 10))} material={m} />; };

/** drifting dust / data bits: never a still frame */
const Drift: React.FC<{ t: number; n: number; box: [V3, V3]; color: string; size?: number; seed?: number; rise?: number }> = ({ t, n, box, color, size = 0.012, seed = 0, rise = 0.08 }) => {
  const [a, b] = box;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const h = (j: number) => hash(k * 7 + j + seed * 31);
        const H = b[1] - a[1];
        const y = a[1] + ((h(2) * H + t * rise * (0.5 + h(5))) % H);
        const x = a[0] + h(1) * (b[0] - a[0]) + 0.12 * Math.sin(t * (0.3 + h(3)) + k);
        const z = a[2] + h(4) * (b[2] - a[2]);
        return <mesh key={k} geometry={OCTA()} material={neon(k % 5 === 0 ? CP.magenta : color, 0.5 + 0.3 * h(6))} position={[x, y, z]} scale={size * (0.6 + h(7))} rotation={[t + k, t * 0.7, 0]} />;
      })}
    </>
  );
};

// ------------------------------------------------------------------ textures
const codeTex = (key: string, tint: string) => canvasTexture(`csCode${key}`, 512, 512, (g, W, H) => {
  g.fillStyle = "#03101a"; g.fillRect(0, 0, W, H);
  g.font = "bold 18px monospace";
  for (let r = 0; r < 26; r++) {
    const y = 14 + r * 19.5;
    let x = 14 + 18 * (hash(r * 3 + key.length) * 4 | 0);
    const n = 3 + (hash(r + 9 * key.length) * 6 | 0);
    for (let k = 0; k < n; k++) {
      const w = 20 + hash(r * 11 + k) * 90;
      g.fillStyle = k === 0 ? tint : hash(r * 5 + k) > 0.8 ? CP.magenta : hash(r + k * 3) > 0.6 ? "#5fa8c8" : "#2d6a86";
      g.fillRect(x, y, w, 9);
      x += w + 10;
      if (x > W - 30) break;
    }
  }
}, true);
const scrolling = (key: string, tint: string, t: number, speed: number) => {
  const tx = codeTex(key, tint);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.offset.y = (t * speed) % 1;
  return tx;
};
const ledTex = () => canvasTexture("csLeds", 128, 256, (g, W, H) => {
  g.fillStyle = "#070b14"; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 16; r++) {
    g.fillStyle = "#0e1626"; g.fillRect(6, r * 16 + 2, W - 12, 12);
    for (let k = 0; k < 6; k++) { const v = hash(r * 13 + k); g.fillStyle = v > 0.85 ? CP.magenta : v > 0.55 ? CP.cyan : v > 0.4 ? "#0f6a80" : "#132033"; g.fillRect(12 + k * 9, r * 16 + 6, 5, 4); }
    g.fillStyle = "#1a2a40"; g.fillRect(W - 46, r * 16 + 5, 34, 6);
  }
});
const leds = (t: number) => { const tx = ledTex(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.offset.y = Math.floor(t * 2) * 0.0625; return tx; };
const gridTex = (key: string, line: string, bg: string, n = 16) => canvasTexture(`csGrid${key}`, 512, 512, (g, W, H) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = line; g.lineWidth = 2;
  for (let k = 0; k <= n; k++) { const v = (k * W) / n; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, H); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
});
const floorGrid = (key: string, line: string, bg: string, rep: number) => { const tx = gridTex(key, line, bg); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep, rep); return tx; };

// ------------------------------------------------------------------ room: the dim hacker room
const room: CyberSet = {
  id: "room", bg: CP.bg, mood: "room",
  anchors: { centre: [0, 0, 0], seat: [0, 0, 0.15], desk: [0, 0.76, -0.62], screens: [0, 1.2, -0.95], keyboard: [0, 0.79, -0.42], left: [-1.6, 0, 0.4], right: [1.6, 0, 0.4], door: [2.4, 0, 1.2], high: [0, 2.2, 0.6] },
  blockers: [{ name: "set.desk", c: [0, 0.38, -0.7], h: [1.1, 0.38, 0.4] }],
  render: (t) => (
    <>
      {bgDome("#030409")}
      <mesh geometry={PLANE()} material={plastic("#0b0f1a", { rough: 0.5 })} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={plastic("#0a0e18", { rough: 0.9 })} position={[0, 2, -2.2]} scale={[12, 4, 1]} receiveShadow />
      {/* a neon strip on the back wall and a dim window of far city glow */}
      <mesh geometry={PLANE()} material={neon(CP.magenta, 0.85)} position={[0, 2.35, -2.18]} scale={[6, 0.035, 1]} />
      <mesh geometry={PLANE()} material={neon("#0a2a44", 1)} position={[-2.6, 1.6, -2.17]} scale={[1.6, 1.1, 1]} />
      {Array.from({ length: 14 }, (_, k) => <mesh key={`w${k}`} geometry={PLANE()} material={neon(k % 4 ? "#1b5f86" : CP.magentaDeep, 0.8)} position={[-3.3 + hash(k) * 1.4, 1.1 + hash(k + 4) * 0.5 * (0.8 + 0.2 * Math.sin(t * 0.5 + k)), -2.16]} scale={[0.07, 0.04 + hash(k + 2) * 0.5, 1]} />)}
      {/* the desk */}
      <mesh geometry={BOX()} material={plastic("#121a2a", { rough: 0.4, flat: true })} position={[0, 0.74, -0.7]} scale={[2.2, 0.05, 0.8]} castShadow receiveShadow />
      {[-1, 1].map((s) => <mesh key={s} geometry={BOX()} material={plastic("#0d1320", { flat: true })} position={[s * 1.02, 0.36, -0.7]} scale={[0.06, 0.72, 0.72]} />)}
      <mesh geometry={PLANE()} material={neon(CP.cyan, 0.9)} position={[0, 0.712, -0.302]} scale={[2.2, 0.012, 1]} />
      {/* the keyboard (soft glow) and a mug */}
      <mesh geometry={BOX()} material={plastic("#0c111c", { emissive: CP.cyanDeep, ei: 0.5, flat: true })} position={[0, 0.775, -0.45]} scale={[0.5, 0.02, 0.16]} />
      <mesh geometry={geoOf("csMug", () => new THREE.CylinderGeometry(0.045, 0.04, 0.1, 10))} material={plastic("#1d2840")} position={[0.62, 0.82, -0.5]} />
      {/* three monitors, code scrolling (slowly, no flicker) */}
      {[[-0.68, 0.42, "a", CP.cyan], [0, 0, "b", CP.magenta], [0.68, -0.42, "c", CP.amber]].map(([x, yaw, k, tint]) => (
        <group key={k as string} position={[x as number, 1.13, -0.92 + Math.abs(x as number) * 0.25]} rotation={[0, yaw as number, 0]}>
          <mesh geometry={BOX()} material={plastic("#090d16", { flat: true })} scale={[0.66, 0.42, 0.04]} castShadow />
          <mesh geometry={PLANE()} material={neon("#ffffff", 1, scrolling(k as string, tint as string, t, 0.035 + (k === "b" ? 0.02 : 0)))} position={[0, 0, 0.022]} scale={[0.62, 0.38, 1]} />
          <mesh geometry={BOX()} material={plastic("#0d1320")} position={[0, -0.28, -0.02]} scale={[0.05, 0.16, 0.05]} />
        </group>
      ))}
      <pointLight position={[0, 1.25, -0.55]} color={CP.cyan} intensity={2.2} distance={4} decay={2} />
      <pointLight position={[0.8, 1.2, -0.5]} color={CP.magenta} intensity={0.9} distance={3} decay={2} />
      {/* a rack in the corner with twinkling LEDs */}
      <group position={[2.0, 0, -1.6]}>
        <mesh geometry={BOX()} material={plastic("#0b101b", { flat: true })} position={[0, 1.0, 0]} scale={[0.6, 2, 0.6]} castShadow />
        <mesh geometry={PLANE()} material={neon("#ffffff", 1, leds(t))} position={[0, 1.0, 0.302]} scale={[0.52, 1.85, 1]} />
      </group>
      {/* cables on the floor */}
      {[0, 1, 2].map((k) => <mesh key={`cb${k}`} geometry={geoOf(`csCable${k}`, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.3 + k * 0.3, 0.72, -1.0), new THREE.Vector3(-0.2 + k * 0.4, 0.05, -1.2), new THREE.Vector3(1.2 + k * 0.2, 0.02, -1.0 + k * 0.3), new THREE.Vector3(1.9, 0.3, -1.4)]), 24, 0.012, 5))} material={plastic("#06080e")} />)}
      <Drift t={t} n={40} box={[[-2.4, 0.2, -1.8], [2.4, 2.6, 1.4]]} color="#7fdcff" size={0.008} />
    </>
  ),
};

// ------------------------------------------------------------------ vault stage
const vault: CyberSet = {
  id: "vault", bg: CP.bg, mood: "vault",
  anchors: { centre: [0, 0, 0], stage: [0, 0, 0], front: [0, 0, 2.6], left: [-2.6, 0, 1.4], right: [2.6, 0, 1.4], high: [0, 3.2, 1] },
  blockers: [],
  render: (t) => {
    const scan = ((t * 1.6) % 14) - 7;
    return (
      <>
        {bgDome("#02030a")}
        <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.35, map: floorGrid("vault", "rgba(25,230,255,0.22)", "#04070e", 30) })} rotation={[-Math.PI / 2, 0, 0]} scale={[60, 60, 1]} receiveShadow />
        <mesh geometry={PLANE()} material={neon(CP.cyan, 0.3)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, scan]} scale={[30, 0.25, 1]} />
        <mesh geometry={geoOf("csStageRing", () => new THREE.TorusGeometry(2.6, 0.03, 6, 72))} material={neon(CP.cyan, 0.9)} rotation={[Math.PI / 2, 0, t * 0.15]} position={[0, 0.03, 0.3]} />
        <mesh geometry={geoOf("csStageRing2", () => new THREE.TorusGeometry(3.1, 0.015, 6, 72))} material={neon(CP.magenta, 0.7)} rotation={[Math.PI / 2, 0, -t * 0.1]} position={[0, 0.03, 0.3]} />
        {/* floating data columns in the dark */}
        {Array.from({ length: 16 }, (_, k) => {
          const a = (k / 16) * Math.PI * 2 + 0.2, r = 6 + 3 * hash(k);
          const hgt = 1 + 4 * hash(k + 3);
          return <mesh key={k} geometry={BOX()} material={neon(k % 3 ? CP.cyanDeep : CP.magentaDeep, 0.5)} position={[Math.cos(a) * r, hgt / 2 + 0.3 * Math.sin(t * 0.6 + k), Math.sin(a) * r - 2]} scale={[0.12, hgt, 0.12]} />;
        })}
        <pointLight position={[0, 3, 3]} color={CP.cyan} intensity={3} distance={9} decay={2} />
        <Drift t={t} n={50} box={[[-4, 0.2, -3], [4, 4, 3]]} color={CP.cyan} size={0.02} rise={0.25} />
      </>
    );
  },
};

// ------------------------------------------------------------------ netmap: a dotted world map
export const MAP_W = 48, MAP_H = 24;
/** lon/lat -> map floor point (equirectangular, x east, z south) */
export const geo = (lon: number, lat: number, y = 0.06): V3 => [(lon / 180) * (MAP_W / 2), y, (-lat / 90) * (MAP_H / 2)];
export const CITIES: Record<string, [number, number]> = {
  svalley: [-122.1, 37.4], newyork: [-74, 40.7], taiwan: [121, 24.5], latvia: [24.1, 56.9], lithuania: [25.3, 54.7],
  cyprus: [33.4, 35.1], slovakia: [17.1, 48.1], hungary: [19.0, 47.5], hongkong: [114.2, 22.3], london: [-0.1, 51.5],
};
// stylised continents (coarse lon/lat outlines; the map is drawn as dots)
const LAND: [number, number][][] = [
  [[-168, 66], [-140, 70], [-100, 73], [-80, 70], [-62, 60], [-55, 50], [-66, 44], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-105, 20], [-95, 16], [-83, 9], [-78, 8], [-88, 15], [-105, 22], [-112, 30], [-118, 33], [-124, 40], [-125, 48], [-135, 58], [-150, 60], [-165, 60]],
  [[-80, 10], [-60, 11], [-50, 0], [-35, -6], [-40, -22], [-55, -35], [-65, -42], [-68, -55], [-75, -48], [-72, -30], [-71, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [5, 52], [8, 57], [5, 62], [15, 69], [30, 71], [60, 70], [80, 73], [110, 76], [140, 72], [170, 69], [180, 66], [160, 60], [142, 52], [135, 43], [127, 39], [122, 31], [120, 23], [108, 21], [105, 10], [100, 13], [98, 8], [92, 21], [80, 16], [77, 8], [72, 20], [66, 25], [57, 26], [50, 30], [48, 29], [56, 24], [59, 22], [52, 16], [43, 13], [35, 28], [35, 33], [27, 36], [23, 40], [19, 40], [16, 38], [12, 44], [7, 44], [3, 42], [-1, 37]],
  [[-17, 21], [-10, 30], [-5, 36], [10, 37], [25, 32], [33, 31], [35, 28], [43, 12], [51, 12], [42, 0], [40, -15], [35, -25], [20, -35], [17, -29], [12, -17], [13, -5], [9, 4], [-8, 5], [-17, 14]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [130, -32], [115, -34]],
  [[-5, 50], [1, 51], [0, 53], [-3, 58], [-6, 57], [-5, 54]],
  [[130, 31], [135, 34], [141, 36], [142, 41], [140, 43], [145, 44], [141, 45], [139, 38], [133, 34]],
  [[-50, 60], [-20, 70], [-20, 82], [-60, 82], [-70, 76]],
  [[95, 5], [105, -6], [120, -9], [140, -8], [130, -2], [118, 5], [108, 1]],
  [[120, 22], [122, 25], [121.5, 25.3], [120.2, 23]],
];
const inPoly = (x: number, y: number, p: [number, number][]) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const mapTex = () => canvasTexture("csMap", 2048, 1024, (g, W, H) => {
  g.fillStyle = "#03060d"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(25,230,255,0.10)"; g.lineWidth = 2;
  for (let lon = -180; lon <= 180; lon += 15) { const x = ((lon + 180) / 360) * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let lat = -90; lat <= 90; lat += 15) { const y = ((90 - lat) / 180) * H; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let lat = -58; lat <= 84; lat += 1.6) for (let lon = -180; lon <= 180; lon += 1.6) {
    if (!LAND.some((p) => inPoly(lon, lat, p))) continue;
    const x = ((lon + 180) / 360) * W, y = ((90 - lat) / 180) * H;
    g.fillStyle = hash(lon * 3 + lat) > 0.93 ? "rgba(255,43,214,0.75)" : "rgba(25,230,255,0.62)";
    g.beginPath(); g.arc(x, y, 3.2, 0, Math.PI * 2); g.fill();
  }
});
const netmap: CyberSet = {
  id: "netmap", bg: CP.bg, mood: "netmap",
  anchors: { centre: [0, 0, 0], ...Object.fromEntries(Object.entries(CITIES).map(([k, [lo, la]]) => [k, geo(lo, la)])), europe: geo(20, 50), asia: geo(118, 26), usa: geo(-100, 40), atlantic: geo(-40, 45) },
  blockers: [],
  render: (t) => (
    <>
      {bgDome("#02040a")}
      <mesh geometry={PLANE()} material={neon("#ffffff", 1, mapTex())} rotation={[-Math.PI / 2, 0, 0]} scale={[MAP_W, MAP_H, 1]} />
      <mesh geometry={PLANE()} material={plastic("#02040a", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} scale={[400, 400, 1]} />
      {/* a sweeping scan meridian */}
      <mesh geometry={PLANE()} material={neon(CP.cyan, 0.22)} rotation={[-Math.PI / 2, 0, 0]} position={[((t * 2.5) % MAP_W) - MAP_W / 2, 0.01, 0]} scale={[0.5, MAP_H, 1]} />
      {/* city nodes: a glowing post, a base ring that breathes slowly */}
      {Object.entries(CITIES).map(([k, [lo, la]], i) => {
        const p = geo(lo, la, 0);
        const u = (t * 0.7 + i * 0.37) % 1;
        return (
          <group key={k} position={p}>
            <mesh geometry={geoOf("csNode", () => new THREE.CylinderGeometry(0.03, 0.03, 1, 6))} material={neon(CP.cyan, 0.9)} position={[0, 0.25, 0]} scale={[1, 0.5, 1]} />
            <mesh geometry={geoOf("csNodeTop", () => new THREE.SphereGeometry(0.07, 10, 8))} material={neon(CP.white, 1)} position={[0, 0.52, 0]} />
            <mesh geometry={geoOf("csNodeRing", () => new THREE.TorusGeometry(1, 0.06, 4, 28))} material={neon(CP.cyan, 0.7 * (1 - u))} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={0.1 + 0.3 * u} />
          </group>
        );
      })}
      <Drift t={t} n={60} box={[[-14, 0.2, -8], [14, 3, 8]]} color={CP.cyan} size={0.03} rise={0.15} />
    </>
  ),
};

// ------------------------------------------------------------------ inbox: a wall of emails
const SUBJECTS = ["Invoice 4471", "Re: Q3 order", "Shipping update", "Meeting notes", "Payment schedule", "Re: Re: parts list", "Weekly report", "Contract draft", "Lunch?", "PO 88-1023", "Updated forecast", "Re: samples", "Travel booking", "Team offsite", "Invoice 4472", "Re: pricing"];
export const emailTex = (subject: string, phish: boolean) => canvasTexture(`csMail|${subject}|${phish ? 1 : 0}`, 512, 176, (g, W, H) => {
  g.fillStyle = phish ? "#2a060c" : "#0b1424"; g.fillRect(0, 0, W, H);
  g.strokeStyle = phish ? CP.red : "rgba(25,230,255,0.45)"; g.lineWidth = phish ? 8 : 3; g.strokeRect(4, 4, W - 8, H - 8);
  g.fillStyle = phish ? CP.red : CP.cyanDeep; g.beginPath(); g.arc(44, 52, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = phish ? "#ffd0d6" : "#9fd8ec"; g.font = "bold 30px sans-serif"; g.fillText(subject.slice(0, 22), 82, 62);
  g.fillStyle = phish ? "rgba(255,120,140,0.6)" : "rgba(120,170,200,0.45)";
  g.fillRect(82, 86, 320, 12); g.fillRect(82, 110, 380, 12); g.fillRect(82, 134, 240, 12);
  if (phish) { g.fillStyle = CP.red; g.font = "bold 26px sans-serif"; g.fillText("!", W - 46, 60); }
});
const TILE_W = 1.0, TILE_H = 0.36, COLS = 7, ROWS = 8;
const tileAt = (c: number, r: number): V3 => [(c - (COLS - 1) / 2) * (TILE_W + 0.08), 0.45 + r * (TILE_H + 0.07), -2.0];
const PHISH_SLOT: [number, number] = [4, 4];
const inbox: CyberSet = {
  id: "inbox", bg: CP.bg, mood: "inbox",
  anchors: { centre: [0, 0, 0], wall: [0, 1.9, -2.0], phish: tileAt(...PHISH_SLOT), front: [0, 0, 1.5], left: [-2, 0, 0.5], right: [2, 0, 0.5], high: [0, 2.6, 0] },
  blockers: [],
  render: (t) => {
    const scan = 0.4 + ((t * 0.9) % 3.6);
    return (
      <>
        {bgDome("#03050b")}
        <mesh geometry={PLANE()} material={plastic("#070b14", { rough: 0.4 })} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} receiveShadow />
        <mesh geometry={PLANE()} material={plastic("#05080f", { rough: 0.9 })} position={[0, 2, -2.08]} scale={[12, 6, 1]} />
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          if (c === PHISH_SLOT[0] && r === PHISH_SLOT[1]) return null;
          const p = tileAt(c, r);
          const dz = 0.03 * Math.sin(t * 0.8 + c * 0.9 + r * 0.6);
          return <mesh key={i} geometry={PLANE()} material={neon("#ffffff", 0.92, emailTex(SUBJECTS[(i * 5) % SUBJECTS.length], false))} position={[p[0], p[1], p[2] + dz]} scale={[TILE_W, TILE_H, 1]} />;
        })}
        {/* a scan line sweeping up the wall */}
        <mesh geometry={PLANE()} material={neon(CP.cyan, 0.25)} position={[0, scan, -1.98]} scale={[8.5, 0.05, 1]} />
        <pointLight position={[0, 2, 0]} color={CP.cyan} intensity={1.6} distance={6} decay={2} />
        <Drift t={t} n={40} box={[[-3.5, 0.2, -1.8], [3.5, 3.6, 1.2]]} color="#8fe6ff" size={0.01} />
      </>
    );
  },
};

// ------------------------------------------------------------------ evidence board
const docTex = (key: string, title: string, kind: "photo" | "doc" | "note" | "map") => canvasTexture(`csDoc|${key}`, 256, 320, (g, W, H) => {
  g.fillStyle = kind === "note" ? "#d9c25a" : kind === "photo" ? "#1a1d24" : "#d8d4c8"; g.fillRect(0, 0, W, H);
  if (kind === "photo") {
    // a generic hooded silhouette, no face
    g.fillStyle = "#3a4152"; g.fillRect(14, 14, W - 28, H - 90);
    g.fillStyle = "#0b0d12"; g.beginPath(); g.ellipse(W / 2, 120, 52, 62, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(40, H - 76); g.quadraticCurveTo(W / 2, 140, W - 40, H - 76); g.fill();
    g.fillStyle = "#e8e8e8"; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.fillText(title, W / 2, H - 30);
  } else if (kind === "map") {
    g.fillStyle = "#b9c4c9"; g.fillRect(10, 10, W - 20, H - 20);
    g.strokeStyle = "#7a8a92"; g.lineWidth = 3; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(10, 30 + k * 42); g.bezierCurveTo(90, 10 + k * 45, 150, 60 + k * 40, W - 10, 20 + k * 44); g.stroke(); }
    g.fillStyle = "#8a1020"; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.fillText(title, W / 2, H - 24);
  } else {
    g.fillStyle = "#222"; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.fillText(title, W / 2, 50);
    g.fillStyle = "rgba(30,30,30,0.55)"; for (let k = 0; k < 9; k++) g.fillRect(26, 80 + k * 24, (W - 52) * (0.55 + 0.45 * hash(k + key.length)), 9);
    if (kind === "doc") { g.strokeStyle = "#a01020"; g.lineWidth = 5; g.strokeRect(W - 110, H - 80, 90, 50); g.fillStyle = "#a01020"; g.font = "bold 20px sans-serif"; g.fillText("FAKE", W - 65, H - 48); }
  }
});
type Pin = { id: string; p: V3; w: number; h: number; title: string; kind: "photo" | "doc" | "note" | "map"; rot: number };
const BOARD_Z = -1.6;
export const PINS: Pin[] = [
  { id: "suspect", p: [0, 1.95, BOARD_Z], w: 0.62, h: 0.78, title: "SUSPECT", kind: "photo", rot: -0.03 },
  { id: "invoice", p: [-1.35, 2.15, BOARD_Z], w: 0.52, h: 0.65, title: "INVOICE", kind: "doc", rot: 0.06 },
  { id: "email", p: [-1.5, 1.2, BOARD_Z], w: 0.5, h: 0.62, title: "EMAIL", kind: "doc", rot: -0.05 },
  { id: "bank", p: [1.4, 2.2, BOARD_Z], w: 0.52, h: 0.65, title: "WIRE LOG", kind: "doc", rot: -0.07 },
  { id: "map", p: [1.3, 1.15, BOARD_Z], w: 0.62, h: 0.62, title: "LATVIA", kind: "map", rot: 0.04 },
  { id: "note", p: [0.05, 0.95, BOARD_Z], w: 0.42, h: 0.42, title: "SAME NAME?", kind: "note", rot: 0.08 },
  { id: "stamp", p: [-0.55, 2.75, BOARD_Z], w: 0.42, h: 0.42, title: "STAMPS", kind: "note", rot: -0.06 },
  { id: "cyprus", p: [2.25, 1.75, BOARD_Z], w: 0.42, h: 0.42, title: "CYPRUS", kind: "note", rot: 0.05 },
];
export const pinTop = (id: string): V3 => { const p = PINS.find((q) => q.id === id); if (!p) throw new Error(`evidence: no pin "${id}" (has: ${PINS.map((q) => q.id).join(", ")})`); return [p.p[0], p.p[1] + p.h / 2 - 0.05, BOARD_Z + 0.03]; };
const STRINGS: [string, string][] = [["suspect", "invoice"], ["suspect", "bank"], ["suspect", "map"], ["invoice", "email"], ["bank", "cyprus"], ["map", "note"]];
/** a red string between two points, sagging slightly */
export const StringLine: React.FC<{ a: V3; b: V3; u?: number; t: number }> = ({ a, b, u = 1, t }) => {
  const n = 14, out: React.ReactNode[] = [];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const pts: V3[] = Array.from({ length: n + 1 }, (_, k) => { const s = (k / n) * u; return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s - 0.06 * L * Math.sin(Math.PI * s) * (1 + 0.04 * Math.sin(t * 1.5)), a[2] + 0.01]; });
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[k + 1];
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (d < 1e-4) continue;
    out.push(<mesh key={k} geometry={BOX()} material={neon(CP.red, 1)} position={[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, p[2]]} rotation={[0, 0, Math.atan2(q[1] - p[1], q[0] - p[0])]} scale={[d + 0.005, 0.012, 0.012]} />);
  }
  return <>{out}</>;
};
const evidence: CyberSet = {
  id: "evidence", bg: "#07060a", mood: "evidence",
  anchors: { centre: [0, 0, 0], board: [0, 1.8, BOARD_Z], front: [0, 0, 1.2], left: [-1.8, 0, 0.2], right: [1.8, 0, 0.2], ...Object.fromEntries(PINS.map((p) => [p.id, [p.p[0], p.p[1], BOARD_Z + 0.02] as V3])) },
  blockers: [],
  render: (t) => (
    <>
      {bgDome("#050407")}
      <mesh geometry={PLANE()} material={plastic("#0c0b10", { rough: 0.6 })} rotation={[-Math.PI / 2, 0, 0]} scale={[30, 30, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={plastic("#0a090d", { rough: 1 })} position={[0, 2, BOARD_Z - 0.06]} scale={[12, 6, 1]} />
      {/* the board: a dark cork panel with a frame */}
      <mesh geometry={BOX()} material={plastic("#3b2a1f", { rough: 1, flat: true })} position={[0, 1.85, BOARD_Z - 0.03]} scale={[5.6, 2.7, 0.04]} receiveShadow />
      {[[0, 3.22, 5.7, 0.06], [0, 0.48, 5.7, 0.06], [-2.83, 1.85, 0.06, 2.8], [2.83, 1.85, 0.06, 2.8]].map(([x, y, w, h], k) => <mesh key={`f${k}`} geometry={BOX()} material={plastic("#16110d", { flat: true })} position={[x, y, BOARD_Z]} scale={[w, h, 0.07]} />)}
      {PINS.map((p, k) => (
        <group key={p.id} position={[p.p[0], p.p[1] + 0.006 * Math.sin(t * 0.9 + k), BOARD_Z + 0.005]} rotation={[0, 0, p.rot + 0.01 * Math.sin(t * 0.7 + k)]}>
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.9, map: docTex(p.id, p.title, p.kind) })} scale={[p.w, p.h, 1]} receiveShadow />
          <mesh geometry={geoOf("csPin", () => new THREE.SphereGeometry(0.03, 8, 6))} material={plastic(CP.red, { emissive: CP.red, ei: 0.5 })} position={[0, p.h / 2 - 0.05, 0.03]} />
        </group>
      ))}
      {STRINGS.map(([a, b], k) => <StringLine key={k} a={pinTop(a)} b={pinTop(b)} t={t + k} />)}
      {/* a hanging lamp: a warm cone of light on the board */}
      <mesh geometry={geoOf("csLamp", () => new THREE.ConeGeometry(0.22, 0.24, 12, 1, true))} material={plastic("#1a1a1a", { side: THREE.DoubleSide })} position={[0.2, 3.6, -0.4]} />
      <mesh geometry={geoOf("csBulb", () => new THREE.SphereGeometry(0.06, 8, 6))} material={neon("#ffe6b0", 1)} position={[0.2, 3.5, -0.4]} />
      <pointLight position={[0.2, 3.1, -0.6]} color="#ffd9a6" intensity={6} distance={6} decay={2} />
      <pointLight position={[-2, 1.5, 1]} color={CP.red} intensity={0.7} distance={5} decay={2} />
      <Drift t={t} n={45} box={[[-3, 0.3, -1.4], [3, 3.6, 1.5]]} color="#ffe2b8" size={0.008} rise={0.04} />
    </>
  ),
};

// ------------------------------------------------------------------ servers: a corridor of racks
const RACK_N = 14;
const servers: CyberSet = {
  id: "servers", bg: CP.bg, mood: "servers",
  anchors: { centre: [0, 0, 0], start: [0, 0, 4], mid: [0, 0, -8], end: [0, 0, -24], left: [-0.7, 0, 0], right: [0.7, 0, 0], high: [0, 2.4, 2] },
  blockers: [{ name: "set.racksL", c: [-1.5, 1.1, -10], h: [0.45, 1.1, 14.5] }, { name: "set.racksR", c: [1.5, 1.1, -10], h: [0.45, 1.1, 14.5] }],
  render: (t) => (
    <>
      {bgDome("#02040a")}
      <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.25, map: floorGrid("servers", "rgba(25,230,255,0.18)", "#05080f", 24) })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} scale={[40, 40, 1]} receiveShadow />
      {Array.from({ length: RACK_N }, (_, k) => [-1, 1].map((s) => {
        const z = 3.5 - k * 2.05;
        return (
          <group key={`${k}${s}`} position={[s * 1.5, 0, z]}>
            <mesh geometry={BOX()} material={plastic("#0a0f1a", { rough: 0.5, flat: true })} position={[0, 1.1, 0]} scale={[0.9, 2.2, 1.95]} castShadow receiveShadow />
            <mesh geometry={PLANE()} material={neon("#ffffff", 1, leds(t + k * 0.37 + (s > 0 ? 0.2 : 0)))} position={[-s * 0.452, 1.1, 0]} rotation={[0, -s * Math.PI / 2, 0]} scale={[1.8, 2.0, 1]} />
          </group>
        );
      }))}
      {/* ceiling light strips and floor guide lines */}
      {[-0.55, 0.55].map((x) => <mesh key={`c${x}`} geometry={PLANE()} material={neon(CP.cyan, 0.85)} rotation={[Math.PI / 2, 0, 0]} position={[x, 2.9, -10]} scale={[0.05, 30, 1]} />)}
      {[-0.95, 0.95].map((x) => <mesh key={`g${x}`} geometry={PLANE()} material={neon(CP.magenta, 0.7)} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, -10]} scale={[0.03, 30, 1]} />)}
      <mesh geometry={PLANE()} material={plastic("#04060b")} rotation={[Math.PI / 2, 0, 0]} position={[0, 3.0, -10]} scale={[4, 32, 1]} />
      {/* a pulse running down the floor (data on the move) */}
      {[0, 1, 2].map((k) => <mesh key={`p${k}`} geometry={PLANE()} material={neon(CP.cyan, 0.5)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 4 - (((t * 6 + k * 10) % 30))]} scale={[1.6, 0.12, 1]} />)}
      <pointLight position={[0, 2.5, 1]} color={CP.cyan} intensity={2} distance={8} decay={2} />
      <pointLight position={[0, 2.5, -10]} color={CP.magenta} intensity={1.6} distance={10} decay={2} />
      <Drift t={t} n={40} box={[[-0.9, 0.2, -20], [0.9, 2.6, 4]]} color={CP.cyan} size={0.012} rise={0.1} />
    </>
  ),
};

export const CYBER_SETS: Record<CyberSetId, CyberSet> = { room, vault, netmap, inbox, evidence, servers };
export const CYBER_SET_IDS = Object.keys(CYBER_SETS) as CyberSetId[];

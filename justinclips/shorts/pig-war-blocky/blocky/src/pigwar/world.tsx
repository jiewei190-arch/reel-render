// The Pig War world, all blocks: island ground + beach + shiny sea with drifting foam, block pines and oaks, a log cabin,
// a potato patch, block warships, waving flags, rocks, tufts, a cannon, tents, a rowboat, gulls, the pig.
// Every part is a pure function of t. Units: metres (the character family's U = 0.27 m).
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import { grassMap, GRASS } from "../blocky/World";
import { Blob } from "../blocky/Contact";
import type { V3 } from "../blocky/motion";

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
type BoxP = { s: V3; p?: V3; r?: V3; c: string; round?: number; rough?: number; cast?: boolean; em?: string; ei?: number };
export const Bx: React.FC<BoxP> = ({ s, p = [0, 0, 0], r = [0, 0, 0], c, round, rough = 0.6, cast = true, em, ei }) => (
  <mesh geometry={rbox(s[0], s[1], s[2], round ?? Math.min(s[0], s[1], s[2]) * 0.18)} material={plastic(c, { rough, emissive: em, ei })} position={p} rotation={r} castShadow={cast} receiveShadow />
);

// ------------------------------------------------------------------ ground, beach, sea
const seaTex = () =>
  canvasTexture("pwSea", 256, 256, (g, W) => {
    const r = rng(5);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, W);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(20,60,110,${0.04 + r() * 0.06})`;
      g.fillRect(r() * W, r() * W, 6 + r() * 18, 2);
    }
  });
export const Island: React.FC<{ t: number; seaZ: number; back?: number; grass?: string; foam?: number; seed?: number }> = ({ t, seaZ, back = 40, grass = GRASS, foam = 50, seed = 3 }) => {
  const gt = grassMap();
  const st = seaTex();
  st.wrapS = st.wrapT = THREE.RepeatWrapping;
  st.repeat.set(30, 30);
  const depth = back - seaZ;
  const r = rng(seed);
  const caps = Array.from({ length: foam }, () => [(r() - 0.5) * 60, seaZ - 1.6 - r() * 40, 0.4 + r() * 1.2, r() * 6] as const);
  return (
    <>
      <mesh geometry={geoOf(`pwGround${depth}`, () => new THREE.BoxGeometry(160, 0.6, depth))} material={plastic(grass, { rough: 0.9, map: gt })} position={[0, -0.3, (back + seaZ) / 2]} receiveShadow />
      <Bx s={[160, 0.5, 1.6]} p={[0, -0.33, seaZ - 0.7]} c="#e6cf98" rough={0.9} cast={false} round={0.12} />
      <mesh geometry={geoOf("pwSea", () => new THREE.PlaneGeometry(700, 500))} material={plastic("#2b7fc2", { rough: 0.16, map: st })} position={[0, -0.45, seaZ - 250]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
      {caps.map(([x, z, w, ph], i) => (
        <Bx key={i} s={[w * (0.8 + 0.2 * Math.sin(t * 1.2 + ph)), 0.04, 0.14]} p={[x + Math.sin(t * 0.6 + ph) * 0.4, -0.43 + Math.sin(t * 1.7 + ph) * 0.02, z]} c="#eef8fc" rough={0.5} cast={false} round={0.015} />
      ))}
    </>
  );
};
/** distant islands: big fogged blocks on the horizon */
export const FarIslands: React.FC<{ z: number; seed?: number }> = ({ z, seed = 7 }) => {
  const r = rng(seed);
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const x = (i - 1.5) * 34 + (r() - 0.5) * 10, h = 3 + r() * 5, w = 14 + r() * 10;
        return (
          <group key={i}>
            <Bx s={[w, h, 8]} p={[x, h / 2 - 0.6, z - r() * 20]} c={["#4f7a5e", "#5a8566", "#46705a", "#5e8a68"][i]} rough={1} cast={false} round={0.5} />
            <Bx s={[w * 0.5, h + 2.5, 6]} p={[x + (r() - 0.5) * 6, (h + 2.5) / 2 - 0.6, z - 2 - r() * 18]} c="#557f62" rough={1} cast={false} round={0.5} />
          </group>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ plants and rocks
export const Pine: React.FC<{ p: V3; s?: number; seed?: number; t?: number }> = ({ p, s = 1, seed = 0, t = 0 }) => {
  const c = ["#2f6e3c", "#2a6436", "#357a44"][seed % 3];
  return (
    <group position={p} scale={s} rotation={[0, seed * 0.7, Math.sin(t * 1.1 + seed) * 0.012]}>
      <Bx s={[0.3, 1.0, 0.3]} p={[0, 0.5, 0]} c="#6a4428" rough={0.8} />
      {[0, 1, 2, 3].map((i) => (
        <Bx key={i} s={[1.8 - i * 0.4, 0.62, 1.8 - i * 0.4]} p={[0, 1.15 + i * 0.56, 0]} c={i % 2 ? c : "#3a8448"} rough={0.75} round={0.08} />
      ))}
      <Bx s={[0.28, 0.4, 0.28]} p={[0, 3.35, 0]} c="#3f8a4c" rough={0.75} />
      <Blob p={[0, 0, 0]} sx={2.2} sz={2.2} op={0.45} />
    </group>
  );
};
export const Oak: React.FC<{ p: V3; s?: number; seed?: number; shake?: number }> = ({ p, s = 1, seed = 2, shake = 0 }) => {
  const r = rng(seed);
  const cubes = Array.from({ length: 10 }, (_, i) => [(r() - 0.5) * 2.4, 2.7 + r() * 1.7, (r() - 0.5) * 1.9, 1.1 + r() * 0.8, i] as const);
  return (
    <group position={p} scale={s}>
      <Bx s={[0.46, 2.6, 0.46]} p={[0, 1.3, 0]} c="#6a4428" rough={0.8} />
      <group rotation={[0, 0, shake]}>
        {cubes.map(([x, y, z, w, i]) => (
          <Bx key={i} s={[w, w * 0.8, w]} p={[x, y, z]} c={["#4f9a44", "#5aa84c", "#45893d"][i % 3]} rough={0.75} round={0.12} />
        ))}
      </group>
      <Blob p={[0, 0, 0]} sx={3} sz={3} op={0.5} />
    </group>
  );
};
export const Rock: React.FC<{ p: V3; s?: number; yaw?: number }> = ({ p, s = 1, yaw = 0 }) => (
  <group position={p} scale={s} rotation={[0, yaw, 0]}>
    <Bx s={[0.6, 0.38, 0.5]} p={[0, 0.17, 0]} c="#8c8f95" rough={0.85} round={0.08} />
    <Bx s={[0.34, 0.26, 0.34]} p={[0.2, 0.32, 0.08]} c="#9ea3a9" rough={0.85} round={0.06} />
    <Blob p={[0, 0, 0]} sx={0.9} sz={0.8} op={0.5} />
  </group>
);
/** grass tufts + small flowers scattered in a rectangle, avoiding keep-clear discs */
export const Tufts: React.FC<{ x: [number, number]; z: [number, number]; n: number; seed?: number; keep?: [number, number, number][] }> = ({ x, z, n, seed = 9, keep = [] }) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const px = x[0] + r() * (x[1] - x[0]), pz = z[0] + r() * (z[1] - z[0]);
    const a = r();
    if (keep.some(([kx, kz, kr]) => Math.hypot(px - kx, pz - kz) < kr)) continue;
    if (a < 0.12) out.push(<Bx key={i} s={[0.07, 0.07, 0.07]} p={[px, 0.1, pz]} c={["#fff4f0", "#ffd34a", "#f27aa0", "#b48cff"][i % 4]} rough={0.5} cast={false} />);
    else out.push(<Bx key={i} s={[0.05, 0.1 + a * 0.12, 0.05]} p={[px, 0.05, pz]} r={[0, a * 3, (a - 0.5) * 0.4]} c={i % 3 ? "#3f7f2a" : "#68a83c"} rough={0.8} cast={false} round={0.01} />);
  }
  return <>{out}</>;
};

// ------------------------------------------------------------------ cabin, patch, potato, props
export const Cabin: React.FC<{ p: V3; yaw?: number; s?: number }> = ({ p, yaw = 0, s = 1 }) => {
  const logs = ["#8a5a34", "#7a4e2c"];
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 0.17 + i * 0.32;
    rows.push(<Bx key={`f${i}`} s={[4.2, 0.32, 0.34]} p={[0, y, 1.5]} c={logs[i % 2]} rough={0.8} round={0.12} />);
    rows.push(<Bx key={`b${i}`} s={[4.2, 0.32, 0.34]} p={[0, y, -1.5]} c={logs[i % 2]} rough={0.8} round={0.12} />);
    rows.push(<Bx key={`l${i}`} s={[0.34, 0.32, 3.3]} p={[-2.0, y + 0.16, 0]} c={logs[(i + 1) % 2]} rough={0.8} round={0.12} />);
    rows.push(<Bx key={`r${i}`} s={[0.34, 0.32, 3.3]} p={[2.0, y + 0.16, 0]} c={logs[(i + 1) % 2]} rough={0.8} round={0.12} />);
  }
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      {rows}
      <Bx s={[3.7, 2.3, 2.8]} p={[0, 1.15, 0]} c="#6a4428" rough={0.9} round={0.02} />
      {[-1, 1].map((k) => <Bx key={k} s={[4.8, 0.16, 2.3]} p={[0, 2.92, k * 0.85]} r={[k * 0.62, 0, 0]} c="#5a3d2e" rough={0.7} round={0.04} />)}
      <Bx s={[0.66, 1.9, 0.66]} p={[1.35, 3.1, -0.5]} c="#8e8a86" rough={0.85} round={0.06} />
      <Bx s={[0.8, 1.55, 0.12]} p={[0.75, 0.78, 1.72]} c="#4a2e1c" rough={0.7} round={0.03} />
      <Bx s={[0.08, 0.08, 0.06]} p={[1.0, 0.8, 1.8]} c="#e8b83a" rough={0.25} />
      <Bx s={[0.78, 0.66, 0.08]} p={[-1.05, 1.35, 1.71]} c="#ffd88a" rough={0.3} em="#ffb04a" ei={1.2} />
      <Bx s={[0.95, 0.1, 0.16]} p={[-1.05, 0.98, 1.77]} c="#5a3a22" rough={0.8} />
      <Bx s={[0.06, 0.68, 0.1]} p={[-1.05, 1.35, 1.77]} c="#5a3a22" rough={0.8} />
      <Blob p={[0, 0, 0]} sx={5.2} sz={4.2} op={0.55} />
    </group>
  );
};
export const Potato: React.FC<{ p?: V3; r?: V3; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <Bx s={[0.12, 0.085, 0.095]} c="#c9a062" rough={0.75} round={0.025} />
    <Bx s={[0.018, 0.018, 0.01]} p={[0.02, 0.012, 0.048]} c="#8a6a3a" rough={0.8} cast={false} />
  </group>
);
export const Patch: React.FC<{ p: V3; rows?: number; cols?: number; s?: number }> = ({ p, rows = 4, cols = 6, s = 1 }) => {
  const plants: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      for (let k = 0; k < 4; k++)
        plants.push(<Bx key={`${i}-${j}-${k}`} s={[0.16, 0.08, 0.22]} p={[(i - (cols - 1) / 2) * 0.62 + Math.cos(k * 1.6) * 0.08, 0.2 + k * 0.035, (j - (rows - 1) / 2) * 0.7 + Math.sin(k * 1.6) * 0.08]} r={[0.45 * Math.sin(k + i), k * 1.6, 0.3]} c={["#4f9a44", "#5eae4e", "#3f8a3e"][(k + i + j) % 3]} rough={0.7} />);
  return (
    <group position={p} scale={s}>
      <Bx s={[cols * 0.62 + 0.3, 0.1, rows * 0.7 + 0.2]} p={[0, 0.02, 0]} c="#6a4a30" rough={0.95} round={0.03} cast={false} />
      {Array.from({ length: rows }, (_, j) => <Bx key={j} s={[cols * 0.62, 0.1, 0.32]} p={[0, 0.09, (j - (rows - 1) / 2) * 0.7]} c="#5a3c26" rough={0.95} round={0.04} cast={false} />)}
      {plants}
    </group>
  );
};
export const Fence: React.FC<{ p: V3; n: number; yaw?: number }> = ({ p, n, yaw = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    {Array.from({ length: n }, (_, i) => <Bx key={i} s={[0.1, 0.62, 0.1]} p={[i * 0.75, 0.31, 0]} c="#8a6a46" rough={0.8} />)}
    {[0.24, 0.5].map((y) => <Bx key={y} s={[(n - 1) * 0.75 + 0.1, 0.07, 0.05]} p={[((n - 1) * 0.75) / 2, y, 0.06]} c="#9a7a52" rough={0.8} />)}
  </group>
);
/** a rifle, always held upright (barrel to the sky): never pointed at anyone */
export const Rifle: React.FC = () => (
  <group position={[0, 0.12, 0]}>
    <Bx s={[0.05, 0.95, 0.05]} p={[0, 0.42, 0]} c="#6c6e78" rough={0.3} />
    <Bx s={[0.08, 0.36, 0.07]} p={[0, -0.12, 0]} c="#a8703e" rough={0.55} />
  </group>
);
export const Coin: React.FC<{ t: number }> = ({ t }) => (
  <mesh geometry={geoOf("pwCoin", () => new THREE.CylinderGeometry(0.06, 0.06, 0.016, 10))} material={plastic("#f0c64a", { rough: 0.2, emissive: "#a07818", ei: 0.4 })} rotation={[Math.PI / 2, t * 5, 0]} position={[0, 0.06, 0]} castShadow />
);
export const Cannon: React.FC<{ p: V3; yaw?: number; s?: number }> = ({ p, yaw = 0, s = 1 }) => (
  <group position={p} rotation={[0, yaw, 0]} scale={s}>
    <Bx s={[0.4, 0.22, 0.7]} p={[0, 0.3, -0.05]} c="#7a5032" rough={0.7} />
    <Bx s={[0.2, 0.2, 1.1]} p={[0, 0.5, 0.25]} r={[-0.1, 0, 0]} c="#34363c" rough={0.35} />
    {[-1, 1].map((k) => <Bx key={k} s={[0.08, 0.46, 0.46]} p={[k * 0.25, 0.25, 0]} c="#5a3a22" rough={0.7} round={0.08} />)}
    <Blob p={[0, 0, 0]} sx={0.9} sz={1.2} op={0.5} />
  </group>
);
export const Tent: React.FC<{ p: V3; yaw?: number }> = ({ p, yaw = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    {[-1, 1].map((k) => <Bx key={k} s={[1.25, 0.05, 1.5]} p={[k * 0.36, 0.5, 0]} r={[0, 0, -k * 0.95]} c="#ece4d0" rough={0.8} />)}
    <Bx s={[0.07, 1.0, 0.07]} p={[0, 0.5, 0.74]} c="#6a4a32" rough={0.8} />
    <Blob p={[0, 0, 0]} sx={2} sz={1.8} op={0.45} />
  </group>
);
export const Rowboat: React.FC<{ p: V3; yaw?: number; t: number; seed?: number }> = ({ p, yaw = 0, t, seed = 0 }) => (
  <group position={[p[0], p[1] + Math.sin(t * 1.6 + seed) * 0.03, p[2]]} rotation={[0, yaw, Math.sin(t * 1.3 + seed) * 0.04]}>
    <Bx s={[0.9, 0.28, 2.0]} p={[0, 0.06, 0]} c="#7a5032" rough={0.7} round={0.08} />
    <Bx s={[0.76, 0.2, 1.8]} p={[0, 0.16, 0]} c="#5a3a22" rough={0.8} round={0.05} />
    {[-0.5, 0.3].map((z) => <Bx key={z} s={[0.86, 0.05, 0.2]} p={[0, 0.24, z]} c="#8a6040" rough={0.7} />)}
  </group>
);
export const Tumble: React.FC<{ p: V3; spin: number }> = ({ p, spin }) => {
  const r = rng(9);
  const b = Array.from({ length: 7 }, (_, i) => [(r() - 0.5) * 0.18, (r() - 0.5) * 0.18, (r() - 0.5) * 0.18, r() * 3, i] as const);
  return (
    <group position={p} rotation={[0, 0, spin]}>
      {b.map(([x, y, z, a, i]) => <Bx key={i} s={[0.15, 0.15, 0.15]} p={[x, y, z]} r={[a, a * 2, a]} c={["#6cc04a", "#4fa83c", "#8ad85a"][i % 3]} rough={0.7} />)}
      <Bx s={[0.05, 0.05, 0.05]} p={[0.06, 0.13, 0.06]} c="#ffd34a" rough={0.5} />
    </group>
  );
};

// ------------------------------------------------------------------ flags + warships
const flagTex = (kind: "us" | "uk") =>
  canvasTexture(`pwFlag${kind}`, 300, 180, (x, w, h) => {
    if (kind === "us") {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#ffffff" : "#c8282e";
        x.fillRect(0, (i * h) / 13, w, h / 13 + 1);
      }
      x.fillStyle = "#2a3a7a";
      x.fillRect(0, 0, w * 0.42, (h * 7) / 13);
      x.fillStyle = "#fff";
      for (let i = 0; i < 20; i++) x.fillRect(8 + (i % 5) * 24, 8 + Math.floor(i / 5) * 22, 8, 8);
    } else {
      x.fillStyle = "#2a3a7a";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#fff";
      x.lineWidth = 36;
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(w, h);
      x.moveTo(w, 0);
      x.lineTo(0, h);
      x.stroke();
      x.strokeStyle = "#c8282e";
      x.lineWidth = 12;
      x.stroke();
      x.fillStyle = "#fff";
      x.fillRect(w / 2 - 30, 0, 60, h);
      x.fillRect(0, h / 2 - 30, w, 60);
      x.fillStyle = "#c8282e";
      x.fillRect(w / 2 - 18, 0, 36, h);
      x.fillRect(0, h / 2 - 18, w, 36);
    }
  });
/** a flag of 8 rigid strips that ripple (cloth reads as blocks too) */
export const Flag: React.FC<{ kind: "us" | "uk"; p: V3; h?: number; t: number; yaw?: number; s?: number }> = ({ kind, p, h = 2.4, t, yaw = 0, s = 1 }) => {
  const N = 8, W = 1.1, H = 0.66;
  const tex = flagTex(kind);
  const strips: React.ReactNode[] = [];
  let x = 0, z = 0, a = 0;
  for (let i = 0; i < N; i++) {
    const da = Math.sin(t * 5 - i * 0.9) * 0.28 * (i / N + 0.2);
    a += da;
    const sw = W / N;
    const geo = geoOf(`pwStrip${kind}${i}`, () => {
      const g = new THREE.PlaneGeometry(sw, H);
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / N);
      return g;
    });
    strips.push(<mesh key={i} geometry={geo} material={plastic("#ffffff", { rough: 0.6, map: tex, side: THREE.DoubleSide })} position={[x + (Math.cos(a) * sw) / 2, h - H / 2 - 0.04, z - (Math.sin(a) * sw) / 2]} rotation={[0, a, 0]} castShadow />);
    x += Math.cos(a) * sw;
    z -= Math.sin(a) * sw;
  }
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      <Bx s={[0.07, h, 0.07]} p={[0, h / 2, 0]} c="#e4dccc" rough={0.4} />
      <Bx s={[0.13, 0.13, 0.13]} p={[0, h + 0.05, 0]} c="#e8b83a" rough={0.25} />
      {strips}
    </group>
  );
};
export const Warship: React.FC<{ p: V3; yaw?: number; s?: number; t: number; seed?: number }> = ({ p, yaw = 0, s = 1, t, seed = 0 }) => {
  const hull = "#2c2428";
  return (
    <group position={[p[0], p[1] + Math.sin(t * 1.3 + seed) * 0.08, p[2]]} rotation={[Math.sin(t * 0.9 + seed) * 0.012, yaw, Math.sin(t * 1.1 + seed) * 0.02]} scale={s}>
      <Bx s={[7.0, 1.1, 2.0]} p={[0, 0.35, 0]} c={hull} rough={0.5} round={0.1} />
      <Bx s={[7.04, 0.3, 2.04]} p={[0, 0.55, 0]} c="#e8d8a8" rough={0.5} round={0.04} />
      {Array.from({ length: 9 }, (_, i) => [-1, 1].map((k) => <Bx key={`${i}${k}`} s={[0.24, 0.17, 0.06]} p={[-2.8 + i * 0.68, 0.55, k * 1.03]} c="#141012" rough={0.6} cast={false} />))}
      <Bx s={[1.4, 0.9, 1.8]} p={[4.0, 0.6, 0]} c={hull} rough={0.5} round={0.12} />
      <Bx s={[1.0, 0.18, 0.18]} p={[5.1, 1.1, 0]} c="#6a4a32" rough={0.7} />
      <Bx s={[1.6, 1.0, 2.1]} p={[-2.9, 1.3, 0]} c="#3e3034" rough={0.5} round={0.08} />
      <Bx s={[1.65, 0.12, 2.15]} p={[-2.9, 1.82, 0]} c="#d8b04a" rough={0.3} />
      <Bx s={[6.8, 0.1, 1.9]} p={[0, 0.95, 0]} c="#8a6a4a" rough={0.7} />
      {([[-1.5, 5.6], [0.7, 6.6], [2.8, 5.0]] as const).map(([x, h], m) => (
        <group key={m}>
          <Bx s={[0.16, h, 0.16]} p={[x, 0.9 + h / 2, 0]} c="#6a4a32" rough={0.7} />
          {[0, 1, 2].map((k) => {
            const sw = 1.9 - k * 0.38;
            return (
              <group key={k}>
                <Bx s={[sw + 0.3, 0.1, 0.1]} p={[x, 1.9 + k * 1.55 + h * 0.06, 0.12]} c="#6a4a32" rough={0.7} />
                <Bx s={[sw, 1.2, 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 2 + k + m))]} p={[x, 1.3 + k * 1.55 + h * 0.06, 0.2]} c="#f2ead6" rough={0.7} round={0.05} />
              </group>
            );
          })}
        </group>
      ))}
      <Flag kind="uk" p={[-3.6, 1.8, 0]} h={1.5} t={t + seed} yaw={Math.PI} s={1} />
    </group>
  );
};
/** a gull: white body, grey back, dark wing tips, orange beak; wings flap */
export const Gull: React.FC<{ p: V3; yaw: number; t: number; flap: number; s?: number }> = ({ p, yaw, t, flap, s = 1 }) => {
  const w = Math.sin(t * 24) * 0.9 * flap;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      <Bx s={[0.16, 0.13, 0.28]} c="#f4f2ee" rough={0.5} />
      <Bx s={[0.12, 0.12, 0.12]} p={[0, 0.07, 0.15]} c="#f4f2ee" rough={0.5} />
      <Bx s={[0.04, 0.03, 0.07]} p={[0, 0.06, 0.24]} c="#e8a03a" rough={0.4} />
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.08, 0.03, 0]} rotation={[0, 0, k * w]}>
          <Bx s={[0.18, 0.025, 0.16]} p={[k * 0.09, 0, 0]} c="#c9ccd2" rough={0.5} />
          <Bx s={[0.12, 0.022, 0.13]} p={[k * 0.23, 0, -0.01]} c="#3a3a44" rough={0.5} />
        </group>
      ))}
    </group>
  );
};

// storytime fx: the cafeteria windows shattering (3D glass shards bursting into the room, falling, spinning) and the
// crack overlay (a 2D spider-web of cracks over the frame from the moment of the break to the next cut). Screen shake and
// punch-ins live in the camera (compile.ts camAt); the hard cut to black is the film's last frames (film.tsx).
import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { geoOf } from "../blocky/mat";
import { SETS } from "./layout";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const N_SHARDS = 90;

export const Shards: React.FC<{ u: number }> = ({ u }) => {
  const mat = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#f2fbff", emissive: "#cfeeff", emissiveIntensity: 0.7, transparent: true, opacity: 0.92, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }), []);
  if (u < 0 || u > 2.2) return null;
  const Wd = SETS.cafeteria.windows!;
  const geo = geoOf("stShard", () => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.09, 0, -0.06, -0.05, 0, 0.07, -0.04, 0], 3)); g.computeVertexNormals(); return g; });
  return (
    <group>
      {Array.from({ length: N_SHARDS }, (_, k) => {
        const wi = k % Wd.xs.length;
        const x0 = Wd.xs[wi] + (hash(k + 1) - 0.5) * (Wd.w - 0.2), y0 = Wd.y0 + 0.1 + hash(k + 2) * (Wd.y1 - Wd.y0 - 0.2), z0 = Wd.z;
        // burst into the room (+z), spread sideways and up a little, then gravity
        const vz = 2.2 + 3.6 * hash(k + 3), vx = (hash(k + 4) - 0.5) * 2.6, vy = 0.6 + 1.8 * hash(k + 5);
        const tt = u * (0.9 + 0.2 * hash(k + 6));
        let y = y0 + vy * tt - 4.9 * tt * tt;
        const z = z0 + vz * tt, x = x0 + vx * tt;
        if (y < 0.02) y = 0.02;
        const sc = 1.6 + 2.6 * hash(k + 7);
        const sp = 6 + 10 * hash(k + 8);
        return <mesh key={k} geometry={geo} material={mat} position={[x, y, z]} rotation={[tt * sp + k, tt * sp * 0.7 + k * 0.3, tt * sp * 0.4]} scale={sc} />;
      })}
    </group>
  );
};

/** a spider-web crack over the frame, centred at (cx, cy) px; grows over 0.08 s and stays */
export const CrackOverlay: React.FC<{ u: number; cx?: number; cy?: number; seed?: number }> = ({ u, cx = 330, cy = 560, seed = 3 }) => {
  if (u < 0) return null;
  const g = Math.min(1, u / 0.08);
  const rays = 11;
  const paths: string[] = [];
  const pts: [number, number][][] = [];
  for (let r = 0; r < rays; r++) {
    const a0 = (r / rays) * Math.PI * 2 + hash(seed + r) * 0.4;
    const len = (700 + 900 * hash(seed + r * 3)) * g;
    const P: [number, number][] = [[cx, cy]];
    let a = a0, x = cx, y = cy;
    const steps = 7;
    for (let k = 1; k <= steps; k++) {
      a += (hash(seed + r * 17 + k) - 0.5) * 0.5;
      const d = len / steps;
      x += Math.cos(a) * d; y += Math.sin(a) * d;
      P.push([x, y]);
    }
    pts.push(P);
    paths.push("M" + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L"));
  }
  // rings joining neighbouring rays (the web)
  for (const ring of [1, 2, 4]) {
    if (ring >= pts[0].length) continue;
    const R = pts.map((P) => P[Math.min(ring, P.length - 1)]);
    paths.push("M" + R.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z");
  }
  const d = paths.join(" ");
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={60 * g} fill="rgba(255,255,255,0.35)" />
        <path d={d} stroke="rgba(10,20,35,0.55)" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={d} stroke="rgba(255,255,255,0.95)" strokeWidth={3.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

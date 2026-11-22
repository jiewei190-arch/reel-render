// The giant 3D chart (the kit's signature): a thick glowing line on columns, drawn in left to right. Every rising
// segment is GREEN, every falling one RED; a glass curtain of thin bars fills the area under the line; a bright tip
// leads the draw. The chartFly camera rides along the line (compile.ts), so the crash becomes a dive.
import React from "react";
import * as THREE from "three";
import { geoOf } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { BP } from "./palette";
import { bmat, glow } from "./sets";
import type { BizChart } from "./types";

export type ChartGeo = { pts: V3[]; n: number; step: number; at: (s: number) => V3; rising: (k: number) => boolean; tags: { i: number; text: string }[] };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const BASE_Y = 0.4;

export const chartGeo = (c: BizChart): ChartGeo => {
  if (c.pts.length < 2) throw new Error("recipe chart: needs at least 2 points");
  const step = c.step ?? 3, H = c.height ?? 9, vmax = Math.max(...c.pts), vmin = Math.min(0, ...c.pts);
  const pts = c.pts.map((v, i) => [i * step, BASE_Y + ((v - vmin) / Math.max(1e-9, vmax - vmin)) * H, 0] as V3);
  const at = (s: number): V3 => {
    const x = clamp(s, 0, pts.length - 1), k = Math.min(pts.length - 2, Math.floor(x)), u = x - k;
    const A = pts[k], B = pts[k + 1];
    return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, 0];
  };
  return { pts, n: pts.length, step, at, rising: (k) => pts[Math.min(k + 1, pts.length - 1)][1] >= pts[k][1], tags: c.tags ?? [] };
};

const BOX = () => geoOf("bzBox", () => new THREE.BoxGeometry(1, 1, 1));
const SPH = () => geoOf("bzChartDot", () => new THREE.SphereGeometry(1, 16, 12));
export const ChartView: React.FC<{ g: ChartGeo; draw: number; t: number }> = ({ g, draw, t }) => {
  const u = clamp(draw, 0, g.n - 1);
  const segs: React.ReactNode[] = [];
  for (let k = 0; k < g.n - 1; k++) {
    if (k >= u) break;
    const fr = Math.min(1, u - k);
    const A = g.pts[k], Bf = g.pts[k + 1];
    const B: V3 = [A[0] + (Bf[0] - A[0]) * fr, A[1] + (Bf[1] - A[1]) * fr, 0];
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    const col = g.rising(k) ? BP.green : BP.red;
    segs.push(<mesh key={`s${k}`} geometry={BOX()} material={glow(col, 0.55)} position={[(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0]} rotation={[0, 0, Math.atan2(dy, dx)]} scale={[L + 0.2, 0.3, 0.3]} castShadow />);
    // the curtain: thin glass bars under the segment
    const nb = 6;
    for (let b = 0; b < nb; b++) {
      const v = (b + 0.5) / nb;
      if (v > fr) break;
      const x = A[0] + (Bf[0] - A[0]) * v, y = A[1] + (Bf[1] - A[1]) * v;
      segs.push(<mesh key={`c${k}.${b}`} geometry={BOX()} material={bmat(col, 0.16)} position={[x, y / 2, 0]} scale={[g.step / nb - 0.08, y, 0.5]} />);
    }
  }
  const dots = g.pts.map((p, i) => (i <= u + 1e-6 ? (
    <group key={`d${i}`}>
      <mesh geometry={SPH()} material={bmat("#ffffff", 1)} position={p} scale={0.24} />
      <mesh geometry={BOX()} material={bmat(i > 0 && !g.rising(i - 1) ? BP.redGlow : BP.greenGlow, 0.5)} position={[p[0], p[1] / 2, -0.3]} scale={[0.06, p[1], 0.06]} />
    </group>
  ) : null));
  const tip = g.at(u);
  const pulse = 0.36 + 0.06 * Math.sin(t * 12);
  const tipCol = u >= g.n - 1 - 1e-6 ? (g.rising(g.n - 2) ? BP.greenGlow : BP.redGlow) : g.rising(Math.floor(u)) ? BP.greenGlow : BP.redGlow;
  return (
    <group>
      <mesh geometry={BOX()} material={bmat("#3a4f9a", 1)} position={[(g.n - 1) * g.step / 2, 0.02, 0.4]} scale={[(g.n - 1) * g.step + 4, 0.04, 0.06]} />
      {segs}
      {dots}
      <mesh geometry={SPH()} material={bmat(tipCol, 1)} position={tip} scale={pulse} />
      <mesh geometry={SPH()} material={bmat(tipCol, 0.25)} position={tip} scale={pulse * 2.4} />
    </group>
  );
};

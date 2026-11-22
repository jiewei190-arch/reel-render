// biz3d kit props (all procedural, generic, no brand marks):
//   tower     a generic headquarters tower; `crack` runs a glowing red crack down its face, `collapse` splits it
//   boxes     a stack of product boxes [columns, rows, layers]
//   cash      a stack of cash bundles; `drain` shrinks it
//   disc      a plain disc in a clear case (the generic "movie rental")
//   envelope  a mailer with a printed address block (label = the addressee, lines = the address) and a stamp
//   block     a plain box
//   + the HERO PROPS (src/biz/hero.tsx): can, cup, box, bottle, phone, case, camera, shoe, burger, laptop, card, bag,
//     letter: generic labelled products to open a Short on (KIT_BIZ3D.md "Hero props")
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { HERO_FONT } from "../library/hero";
import { BIZ_HERO_BOX, BIZ_HERO_KINDS, BizHero } from "./hero";
import type { BizHeroKind } from "./hero";
import { BP } from "./palette";
import { bmat, CardBox, glow } from "./sets";
import type { BizProp } from "./types";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const BOX = () => geoOf("bzBox", () => new THREE.BoxGeometry(1, 1, 1));
export type PropState = { crack: number; collapse: number; drain: number };
export type Placement = { p: V3; yaw: number; s: number };

export const TOWER_SIZE: V3 = [2.4, 8, 2.4];
const towerTex = (col: string) => canvasTexture(`bzTower${col}`, 128, 512, (g, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  for (let r = 0; r < 26; r++) for (let c = 0; c < 5; c++) {
    g.fillStyle = hash(r * 9 + c) < 0.55 ? "#ffd98e" : "#25324f";
    g.fillRect(8 + c * 24, 10 + r * 19.2, 16, 12);
  }
});
/** the crack polyline down the front face, top to bottom, in tower-local units (x, y) */
export const crackPath = (seed: number, w: number, h: number): [number, number][] => {
  const n = 14, out: [number, number][] = [];
  for (let k = 0; k <= n; k++) out.push([k === 0 || k === n ? 0 : (hash(seed + k * 3.1) - 0.5) * 0.45 * w, h - (k / n) * h]);
  return out;
};
const Tower: React.FC<{ sp: BizProp; st: PropState; t: number; seed: number }> = ({ sp, st, t, seed }) => {
  const [w, h, d] = sp.size ?? TOWER_SIZE;
  const col = sp.color ?? "#3d6fb0";
  const path = crackPath(seed, w, h);
  const cN = st.crack * (path.length - 1);
  const c2 = st.collapse * st.collapse;
  const half = (side: 1 | -1) => (
    <group position={[side * (0.3 * st.collapse + 0.04 * Math.sin(t * 30) * clamp(st.crack * 4 - 3) * (1 - st.collapse)), -0.9 * c2, 0]} rotation={[0, 0, -side * 0.16 * c2]}>
      <mesh geometry={BOX()} material={glow("#ffd98e", 0.7, towerTex(col))} position={[side * w / 4, h / 2, 0]} scale={[w / 2, h, d]} castShadow receiveShadow />
      <mesh geometry={BOX()} material={plastic("#1c2433", { rough: 0.4 })} position={[side * w / 4, h + 0.15, 0]} scale={[w / 2 - 0.1, 0.3, d - 0.1]} castShadow />
    </group>
  );
  return (
    <group>
      {half(1)}
      {half(-1)}
      {/* the crack: glowing red segments growing down the face (front and side), with a hot core */}
      {st.crack > 0 && st.collapse < 0.6 ? path.slice(0, -1).map((a, k) => {
        if (k >= cN) return null;
        const fr = Math.min(1, cN - k);
        const b = path[k + 1];
        const bx = a[0] + (b[0] - a[0]) * fr, by = a[1] + (b[1] - a[1]) * fr;
        const L = Math.hypot(bx - a[0], by - a[1]), ang = Math.atan2(by - a[1], bx - a[0]);
        const wid = 0.09 * (1 + st.collapse * 3);
        return (
          <group key={k}>
            <mesh geometry={BOX()} material={bmat("#2a0606", 1)} position={[(a[0] + bx) / 2, (a[1] + by) / 2, d / 2 + 0.02]} rotation={[0, 0, ang]} scale={[L + 0.05, wid * 1.8, 0.02]} />
            <mesh geometry={BOX()} material={bmat(BP.redGlow, 1)} position={[(a[0] + bx) / 2, (a[1] + by) / 2, d / 2 + 0.035]} rotation={[0, 0, ang]} scale={[L + 0.03, wid * 0.55, 0.02]} />
          </group>
        );
      }) : null}
      {/* debris falls while it splits */}
      {st.collapse > 0 ? Array.from({ length: 14 }, (_, k) => {
        const u = clamp(st.collapse * 1.4 - hash(k) * 0.4);
        if (u <= 0 || u >= 1) return null;
        const y0 = h * (0.3 + 0.6 * hash(k + 4));
        return <mesh key={`deb${k}`} geometry={BOX()} material={plastic(k % 3 ? "#3a4560" : "#c9ccd2", { rough: 0.7 })} position={[(hash(k + 8) - 0.5) * w * 0.6, Math.max(0.1, y0 - 9 * u * u), d / 2 + 0.3 + hash(k + 2) * 0.8]} rotation={[u * 6 + k, u * 4, 0]} scale={0.12 + 0.12 * hash(k + 1)} />;
      }) : null}
    </group>
  );
};
const discTex = () => canvasTexture("bzDisc", 256, 256, (g, W, H) => {
  const gr = g.createConicGradient ? g.createConicGradient(0, W / 2, H / 2) : null;
  if (gr) { ["#d9e4f2", "#f6d4ff", "#cff5ff", "#fff3c4", "#d9e4f2"].forEach((c, i) => gr.addColorStop(i / 4, c)); g.fillStyle = gr; } else g.fillStyle = "#dfe6ef";
  g.beginPath(); g.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#9aa4b2"; g.beginPath(); g.arc(W / 2, H / 2, W * 0.12, 0, Math.PI * 2); g.fill();
});
/** the envelope's front: an addressee and address lines in real text, a postmark and a stamp (never blank) */
const envTex = (col: string, label?: string, lines?: string[]) => canvasTexture(`bzEnv|${col}|${label ?? ""}|${(lines ?? []).join("|")}`, 512, 312, (g, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.fillStyle = "#B3261E"; g.fillRect(W - 96, 18, 74, 88); g.fillStyle = "#F7E7C6"; g.fillRect(W - 88, 26, 58, 72);
  g.fillStyle = "#B3261E"; g.font = `bold 28px ${HERO_FONT}`; g.textAlign = "center"; g.fillText("$", W - 59, 72);
  g.strokeStyle = "rgba(40,40,40,0.55)"; g.lineWidth = 3; g.beginPath(); g.arc(W - 150, 64, 34, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(W - 120, 48 + k * 10); g.lineTo(W - 20, 48 + k * 10); g.stroke(); }
  g.textAlign = "left"; g.fillStyle = "#1A1A1A";
  g.font = `bold 34px ${HERO_FONT}`; g.fillText((label ?? "THE BOARD").toUpperCase().slice(0, 22), 150, 168);
  g.font = `26px ${HERO_FONT}`;
  (lines && lines.length ? lines : ["1 Main Street", "Suite 400", "Dallas, TX"]).slice(0, 3).forEach((l, i) => g.fillText(l.slice(0, 28), 150, 206 + i * 32));
  g.font = `bold 18px ${HERO_FONT}`; g.fillText("FIRST CLASS", 24, 40);
});
export const isHero = (k: string): k is BizHeroKind => (BIZ_HERO_KINDS as string[]).includes(k);
export const KitProp: React.FC<{ sp: BizProp; pl: Placement; st: PropState; t: number; vis: number; seed: number }> = ({ sp, pl, st, t, vis, seed }) => {
  if (vis <= 0) return null;
  let body: React.ReactNode = null;
  switch (sp.kit) {
    case "tower": body = <Tower sp={sp} st={st} t={t} seed={seed} />; break;
    case "boxes": {
      const [c, r, l] = sp.size ?? [3, 2, 2];
      body = <>{Array.from({ length: c * r * l }, (_, k) => { const x = k % c, z = Math.floor(k / c) % r, y = Math.floor(k / (c * r)); return <CardBox key={k} p={[(x - (c - 1) / 2) * 0.58, 0.21 + y * 0.43, (z - (r - 1) / 2) * 0.48]} r={0.08 * (hash(k + seed) - 0.5)} />; })}</>;
      break;
    }
    case "cash": {
      const n = Math.max(0, Math.round(14 * (1 - st.drain)));
      body = <>{Array.from({ length: n }, (_, k) => (
        <group key={k} position={[0.03 * (hash(k) - 0.5), 0.045 + k * 0.085, 0.03 * (hash(k + 3) - 0.5)]} rotation={[0, 0.1 * (hash(k + 5) - 0.5), 0]}>
          <mesh geometry={rbox(0.62, 0.08, 0.3, 0.01)} material={plastic("#6fae5a", { rough: 0.8 })} castShadow />
          <mesh geometry={BOX()} material={plastic(BP.gold, { rough: 0.5 })} scale={[0.1, 0.085, 0.305]} />
        </group>
      ))}</>;
      break;
    }
    case "disc":
      body = (
        <group position={[0, 0.48, 0]} rotation={[0, 0, 0.05 * Math.sin(t * 1.3)]}>
          <mesh geometry={rbox(0.62, 0.9, 0.06, 0.02)} material={plastic(sp.color ?? "#1d2433", { rough: 0.3 })} castShadow />
          <mesh geometry={geoOf("bzDiscG", () => new THREE.CircleGeometry(0.26, 40))} material={plastic("#ffffff", { rough: 0.15, map: discTex() })} position={[0, 0.02, 0.035]} rotation={[0, 0, t * 2]} />
        </group>
      );
      break;
    case "envelope":
      body = (
        <group position={[0, 0.02, 0]}>
          <mesh geometry={rbox(0.9, 0.03, 0.55, 0.01)} material={plastic(sp.color ?? "#f2efe8", { rough: 0.8 })} castShadow />
          <mesh geometry={geoOf("bzEnvP", () => new THREE.PlaneGeometry(0.88, 0.53))} material={plastic("#ffffff", { rough: 0.8, map: envTex(sp.color ?? "#f2efe8", sp.label, sp.lines) })} position={[0, 0.0155, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </group>
      );
      break;
    case "block": {
      const z = sp.size ?? [0.5, 0.5, 0.5];
      body = <mesh geometry={BOX()} material={plastic(sp.color ?? BP.slate, { rough: 0.6 })} position={[0, z[1] / 2, 0]} scale={z} castShadow />;
      break;
    }
    default:
      if (isHero(sp.kit)) body = <BizHero kind={sp.kit} color={sp.color} label={sp.label} lines={sp.lines} t={t} seed={seed} />;
  }
  return <group position={pl.p} rotation={[0, pl.yaw, 0]} scale={pl.s * Math.max(0.001, vis)}>{body}</group>;
};
/** the QA box of a kit prop (world, axis-aligned); null for props that never block */
export const propBox = (sp: BizProp, pl: Placement): { name: string; c: V3; h: V3 } | null => {
  const s = pl.s;
  switch (sp.kit) {
    case "tower": { const [w, h, d] = sp.size ?? TOWER_SIZE; return { name: sp.id, c: [pl.p[0], pl.p[1] + (h * s) / 2, pl.p[2]], h: [(w * s) / 2, (h * s) / 2, (d * s) / 2] }; }
    case "block": { const z = sp.size ?? [0.5, 0.5, 0.5]; return { name: sp.id, c: [pl.p[0], pl.p[1] + (z[1] * s) / 2, pl.p[2]], h: [(z[0] * s) / 2, (z[1] * s) / 2, (z[2] * s) / 2] }; }
    case "boxes": { const [c, r, l] = sp.size ?? [3, 2, 2]; return { name: sp.id, c: [pl.p[0], pl.p[1] + 0.43 * l * s / 2, pl.p[2]], h: [0.29 * c * s, 0.43 * l * s / 2, 0.24 * r * s] }; }
    default: {
      if (!isHero(sp.kit)) return null;
      const hb = heroBox(sp.kit, pl);
      const cy = Math.abs(Math.cos(hb.yaw)), sy = Math.abs(Math.sin(hb.yaw));
      return { name: sp.id, c: hb.c, h: [cy * hb.h[0] + sy * hb.h[2], hb.h[1], sy * hb.h[0] + cy * hb.h[2]] };
    }
  }
};
/** a hero prop's box in the world, with its yaw (for the screen-space checks: tools/framing_qa.mjs corners()) */
export const heroBox = (kind: BizHeroKind, pl: Placement): { c: V3; h: V3; yaw: number } => {
  const b = BIZ_HERO_BOX[kind], s = pl.s, cy = Math.cos(pl.yaw), sy = Math.sin(pl.yaw);
  const lx = b.c[0] * s, lz = b.c[2] * s;
  return { c: [pl.p[0] + lx * cy + lz * sy, pl.p[1] + b.c[1] * s, pl.p[2] - lx * sy + lz * cy], h: [b.h[0] * s, b.h[1] * s, b.h[2] * s], yaw: pl.yaw };
};
/** the point a camera aims at for a prop */
export const propCentre = (sp: BizProp, pl: Placement): V3 => {
  const b = propBox(sp, pl);
  if (b) return b.c;
  return [pl.p[0], pl.p[1] + (sp.kit === "cash" ? 0.6 : sp.kit === "disc" ? 0.48 : 0.1) * pl.s, pl.p[2]];
};

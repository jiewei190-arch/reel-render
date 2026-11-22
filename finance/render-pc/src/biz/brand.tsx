// Channel branding for "Billion Dollar Blunders", built from the biz3d kit's own pieces (procedural only, no logos):
//   BizBrandPfp     800 x 800    a gold coin split in two by a crashing red chart arrow (reads at 98 px in a circle)
//   BizBrandBanner  2560 x 1440  the miniature city at dusk with the giant green-then-red chart line over the skyline;
//                                title, tagline and schedule inside YouTube's centred 1546 x 423 safe area
// Rendered as stills at full size (tools/biz_brand.mjs); plain frames, no motion blur.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import { chartGeo, ChartView } from "./chart";
import { BIZ_MOODS, BP } from "./palette";
import { bmat, BIZ_SETS, glow, STORE_N } from "./sets";

const FONT = "Poppins";
export const BRAND = {
  pfp: { W: 800, H: 800 },
  banner: { W: 2560, H: 1440, safe: { w: 1546, h: 423 } },
  /** the frame the stills are taken at (the world keeps moving; any frame works) */
  frame: 30,
};

// ------------------------------------------------------------------ profile picture
const BOX = () => geoOf("bzBox", () => new THREE.BoxGeometry(1, 1, 1));
const coinFace = () => canvasTexture("bzCoinFace", 512, 512, (g, W, H) => {
  const gr = g.createRadialGradient(W * 0.38, H * 0.34, 20, W / 2, H / 2, W / 2);
  gr.addColorStop(0, "#ffe08a"); gr.addColorStop(0.6, BP.gold); gr.addColorStop(1, BP.goldDeep);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#b07405"; g.lineWidth = 18; g.beginPath(); g.arc(W / 2, H / 2, W * 0.4, 0, Math.PI * 2); g.stroke();
  g.font = "bold 320px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#fff1c2"; g.fillText("$", W / 2 - 5, H / 2 + 6);
  g.fillStyle = "#6e4300"; g.fillText("$", W / 2 + 4, H / 2 + 14);
});
const CoinHalf: React.FC<{ side: 1 | -1; r: number; d: number }> = ({ side, r, d }) => {
  const geo = geoOf(`bzCoinHalf${side}${r}${d}`, () => new THREE.CylinderGeometry(r, r, d, 72, 1, false, side > 0 ? 0 : Math.PI, Math.PI));
  // the face decal: a half disc whose UVs follow position, so the two halves carry one unbroken "$"
  const face = geoOf(`bzCoinFace${side}${r}`, () => new THREE.CircleGeometry(r * 0.985, 72, side > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI));
  return (
    <group>
      <mesh geometry={geo} material={plastic(BP.goldDeep, { rough: 0.35 })} rotation={[Math.PI / 2, 0, 0]} castShadow />
      <mesh geometry={face} material={glow("#ffd76a", 0.3, coinFace(), 0.35)} position={[0, 0, d / 2 + 0.003]} />
      {/* the broken edge, dark red */}
      <mesh geometry={BOX()} material={bmat("#5a0a0a", 1)} scale={[0.02, 2 * r, d * 0.98]} />
    </group>
  );
};
const pfpBg = () => canvasTexture("bzPfpBg", 512, 512, (g, W, H) => {
  const gr = g.createRadialGradient(W / 2, H * 0.47, 10, W / 2, H / 2, W * 0.62);
  gr.addColorStop(0, "#2b4478"); gr.addColorStop(0.5, BP.navy); gr.addColorStop(1, "#060b1c");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});
/** a thick glowing segment from a to b (screen plane) */
const Seg: React.FC<{ a: [number, number]; b: [number, number]; col: string; w: number; z: number }> = ({ a, b, col, w, z }) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return <mesh geometry={BOX()} material={glow(col, col === BP.red ? 0.22 : 0.3)} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z]} rotation={[0, 0, Math.atan2(b[1] - a[1], b[0] - a[0])]} scale={[L + w * 0.9, w, w]} castShadow />;
};
const Dot: React.FC<{ p: [number, number]; z: number; s: number }> = ({ p, z, s }) => <mesh geometry={geoOf("bzChartDot", () => new THREE.SphereGeometry(1, 16, 12))} material={bmat("#ffffff", 1)} position={[p[0], p[1], z]} scale={s} />;

export const BizBrandPfp: React.FC = () => {
  const n = useCurrentFrame();
  const t = n / 30;
  const r = 1.35, d = 0.32, gap = 0.16;
  // the chart: a green climb up the left, a peak, then a long red crash through the coin's split to an arrowhead
  const W = 0.24, z = 0.55;
  const up: [number, number][] = [[-1.5, -0.55], [-1.12, -0.08], [-0.86, -0.28], [-0.36, 1.22]];
  const peak = up[up.length - 1];
  const tipEnd: [number, number] = [1.02, -1.0];
  const ang = Math.atan2(tipEnd[1] - peak[1], tipEnd[0] - peak[0]);
  const cam = { pos: [0, 0.15, 12] as V3, look: [0, 0.02, 0] as V3, fov: 23 };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #22345e 0%, ${BP.navy} 42%, ${BP.night} 78%)` }}>
      <View mood={BIZ_MOODS.chart} cam={cam} t={t} blur={0} sky={false} width={BRAND.pfp.W} height={BRAND.pfp.H}>
        {/* the coin, split down the middle and tipping apart */}
        <group position={[-0.06, 0, -0.2]} rotation={[0.12, -0.32, 0]}>
          <group position={[gap / 2 + 0.08, -0.06, 0]} rotation={[0, 0, -0.14]}><CoinHalf side={1} r={r} d={d} /></group>
          <group position={[-gap / 2 - 0.08, 0, 0]} rotation={[0, 0, 0.1]}><CoinHalf side={-1} r={r} d={d} /></group>
        </group>
        {/* the backdrop: a navy radial glow, with red light spilling from behind the crack */}
        <mesh geometry={geoOf("bzPlane", () => new THREE.PlaneGeometry(1, 1))} material={bmat("#ffffff", 1, pfpBg(), false)} position={[0, 0, -6]} scale={[12, 12, 1]} />
        <mesh geometry={geoOf("bzPfpGlow", () => new THREE.CircleGeometry(1, 40))} material={bmat(BP.redGlow, 0.85)} position={[0, -0.05, -0.45]} scale={[0.1, 1.2, 1]} />
        {/* the chart arrow, in front */}
        {up.slice(0, -1).map((a, k) => <Seg key={k} a={a} b={up[k + 1]} col={up[k + 1][1] >= a[1] ? BP.green : BP.red} w={W} z={z} />)}
        <Seg a={peak} b={[tipEnd[0] - 0.25 * Math.cos(ang), tipEnd[1] - 0.25 * Math.sin(ang)]} col={BP.red} w={W * 1.15} z={z + 0.02} />
        <mesh geometry={geoOf("bzArrowHead", () => new THREE.ConeGeometry(0.36, 0.6, 3))} material={glow(BP.red, 0.22)} position={[tipEnd[0], tipEnd[1], z + 0.02]} rotation={[0, 0, ang - Math.PI / 2]} castShadow />
        {up.map((p, k) => <Dot key={k} p={p} z={z + 0.05} s={k === up.length - 1 ? 0.2 : 0.15} />)}
      </View>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ banner
const BANNER_CHART = chartGeo({ pts: [0.6, 1.4, 2.0, 3.4, 4.2, 6.0, 7.2, 9.0, 8.6, 5.4, 2.6, 0.8], step: 3, height: 9 });
export const BizBrandBanner: React.FC = () => {
  const n = useCurrentFrame();
  useFonts();
  const t = n / 30;
  const { W, H, safe } = BRAND.banner;
  const city = BIZ_SETS.city;
  // stores on the left still lit, on the right gone dark (the story in one street)
  const world = { storeOn: (i: number) => (i < STORE_N * 0.55 ? 1 : 0), chartDraw: BANNER_CHART.n - 1, paper: () => 1 };
  const cam = { pos: [0, 2.6, 14.5] as V3, look: [0, 5.2, -6] as V3, fov: 38 };
  const sx = (W - safe.w) / 2, sy = (H - safe.h) / 2;
  const span = (BANNER_CHART.n - 1) * BANNER_CHART.step;
  return (
    <AbsoluteFill style={{ background: city.bg }}>
      <View mood={BIZ_MOODS.city} cam={cam} t={t} blur={0} sky={false} width={W} height={H}>
        {city.render(t, world)}
        {/* the giant chart standing over the skyline: green climb, red crash */}
        <group position={[-span * 0.37, 0.1, -5.4]} scale={[0.74, 0.95, 0.6]}>
          <ChartView g={BANNER_CHART} draw={BANNER_CHART.n - 1} t={t} />
        </group>
      </View>
      {/* a soft dark band behind the title, so the words read over any building */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${safe.w * 0.62}px ${safe.h * 0.78}px at 50% 50%, rgba(8,12,28,0.72) 0%, rgba(8,12,28,0.45) 55%, rgba(8,12,28,0) 100%)` }} />
      <div style={{ position: "absolute", left: sx, top: sy, width: safe.w, height: safe.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: -2, whiteSpace: "nowrap", WebkitTextStroke: `16px ${BP.ink}`, paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,0.55)" }}>
          <span style={{ color: "#ffffff" }}>BILLION </span>
          <span style={{ color: BP.gold }}>DOLLAR </span>
          <span style={{ color: BP.red }}>BLUNDERS</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#ffffff", whiteSpace: "nowrap", WebkitTextStroke: `10px ${BP.ink}`, paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
          The decisions that cost a fortune
        </div>
        <div style={{ marginTop: 6, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: BP.ink, background: BP.gold, padding: "6px 30px 8px", borderRadius: 40, whiteSpace: "nowrap", boxShadow: "0 10px 26px rgba(0,0,0,0.4)" }}>
          New Shorts daily · Full stories Tue &amp; Fri
        </div>
      </div>
    </AbsoluteFill>
  );
};

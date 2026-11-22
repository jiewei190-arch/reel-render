// Finance props for the Block Money Shorts (our own designs, no logos, no portraits, no seals, no brands).
// Every prop is a pure function of its props (no clocks, no randomness: seeded hashes only).
//   Coin, CoinStack, CoinPile (mound -> mountain), Bill (plain green), BillFan, BigBlock (a labelled block: "72", "$5,000"),
//   CashCase (glowing case with a label), FlipCalendar (wall calendar, flipping page), Receipt (unrolling paper),
//   TollBooth (booth + slot + display), ChartBoard (a block line on a board), BigClock, Label (canvas text panel),
//   Stamp (a slammed rubber-stamp mark), Hall (the bright blocky interior set), Ground (the outdoor floor + horizon).
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { clamp, hash, lerp } from "../blocky/motion";
import { textTex } from "../library/props";

export const PAL = { cash: "#1f9e4f", cashLight: "#7ee8a0", debt: "#d62a2a", debtLight: "#ff7a6a", coin: "#f0c040", coinDark: "#c8961c", copper: "#c4642a", ink: "#16121c", paper: "#fff4c8", night: "#221640", violet: "#7a4ad8" };

const B: React.FC<{ s: V3; p: V3; c: string; r?: V3; e?: [string, number]; rough?: number }> = ({ s, p, c, r = [0, 0, 0], e, rough = 0.5 }) => (
  <mesh geometry={rbox(s[0], s[1], s[2], Math.min(s[0], s[1], s[2]) * 0.12)} material={plastic(c, { rough, emissive: e?.[0], ei: e?.[1] })} position={p} rotation={r} castShadow receiveShadow />
);

// ------------------------------------------------------------------ coins
export const COIN = { r: 0.055, h: 0.014 };
const coinMat = (copper: boolean, glow = 0) => plastic(copper ? "#a8521f" : PAL.coin, { rough: 0.32, emissive: copper ? "#5a2408" : "#c88a10", ei: copper ? 0.15 + 0.4 * glow : 0.25 + glow });
/** one coin lying flat (or standing with rot); a ring + a raised centre so it reads as a coin at any size */
export const Coin: React.FC<{ p?: V3; r?: V3; s?: number; copper?: boolean; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, copper = false, glow = 0 }) => (
  <group position={p} rotation={r} scale={s}>
    <mesh geometry={geoOf("coinBody", () => new THREE.CylinderGeometry(COIN.r, COIN.r, COIN.h, 28))} material={coinMat(copper, glow)} position={[0, COIN.h / 2, 0]} castShadow receiveShadow />
    <mesh geometry={geoOf("coinRim", () => new THREE.TorusGeometry(COIN.r * 0.93, COIN.h * 0.32, 6, 28))} material={plastic(copper ? "#c86a30" : "#ffe27a", { rough: 0.3 })} position={[0, COIN.h, 0]} rotation={[Math.PI / 2, 0, 0]} />
    <mesh geometry={geoOf("coinBoss", () => new THREE.CylinderGeometry(COIN.r * 0.45, COIN.r * 0.5, COIN.h * 0.5, 20))} material={plastic(copper ? "#b85e26" : "#ffd84a", { rough: 0.35 })} position={[0, COIN.h * 1.15, 0]} />
  </group>
);
/** a straight stack of n coins (slightly jittered, seeded) */
export const CoinStack: React.FC<{ p: V3; n: number; seed?: number; copper?: boolean; s?: number; glow?: number }> = ({ p, n, seed = 0, copper = false, s = 1, glow = 0 }) => {
  const k = Math.max(0, Math.round(n));
  return (
    <group position={p} scale={s}>
      {k > 0 ? (
        <mesh geometry={geoOf(`stackBody${k}`, () => new THREE.CylinderGeometry(COIN.r * 0.985, COIN.r * 0.985, COIN.h * k, 28))} material={coinMat(copper, glow)} position={[0, (COIN.h * k) / 2, 0]} castShadow receiveShadow />
      ) : null}
      {Array.from({ length: Math.min(k, 40) }, (_, i) => {
        const j = Math.round((i * k) / Math.min(k, 40));
        return (
          <mesh key={i} geometry={geoOf("stackGroove", () => new THREE.TorusGeometry(COIN.r * 0.99, 0.0018, 4, 28))} material={plastic(copper ? "#8a4a1a" : PAL.coinDark, { rough: 0.4 })} position={[(hash(seed + j) - 0.5) * 0.004, COIN.h * j, (hash(seed + j * 7) - 0.5) * 0.004]} rotation={[Math.PI / 2, 0, 0]} />
        );
      })}
      {k > 0 ? <Coin p={[0, COIN.h * (k - 1), 0]} copper={copper} glow={glow} /> : null}
    </group>
  );
};
/** a mound of coins: a cone of gold under a skin of seeded loose coins. r = base radius, h = height (grows from 0) */
export const CoinPile: React.FC<{ p: V3; r: number; h: number; seed?: number; coins?: number; glow?: number; splitGlow?: number }> = ({ p, r, h, seed = 3, coins = 90, glow = 0, splitGlow = 0 }) => {
  if (h <= 0.002 || r <= 0.002) return null;
  const slope = h / r;
  return (
    <group position={p}>
      <mesh geometry={geoOf("pileCone", () => new THREE.ConeGeometry(1, 1, 48, 6))} material={plastic(PAL.coin, { rough: 0.35, emissive: "#c88a10", ei: 0.3 + glow })} scale={[r, h, r]} position={[0, h / 2, 0]} castShadow receiveShadow />
      {Array.from({ length: coins }, (_, i) => {
        const a = hash(seed + i * 3.1) * Math.PI * 2;
        const u = Math.sqrt(hash(seed + i * 5.7)) * 0.96;
        const rr = r * u;
        const y = h * (1 - u) + 0.006;
        const tilt = Math.atan(slope);
        const sc = clamp(r / 1.2, 0.6, 3.2) * (0.8 + 0.5 * hash(seed + i));
        return <Coin key={i} p={[Math.cos(a) * rr, y, Math.sin(a) * rr]} r={[tilt * Math.cos(a + Math.PI / 2) * 0.9, hash(i) * 3, tilt * Math.sin(a) * 0.9]} s={sc} />;
      })}
      {splitGlow > 0 ? (
        <>
          <mesh geometry={geoOf("pileHalf", () => new THREE.ConeGeometry(1, 1, 48, 6, true, 0, Math.PI))} material={plastic("#fff2a0", { emissive: "#ffe060", ei: 2.6 * splitGlow, transparent: true, opacity: 0.75 * splitGlow })} scale={[r * 1.02, h * 1.02, r * 1.02]} position={[0, h / 2, 0]} renderOrder={5} />
          <mesh geometry={geoOf("pileHalfB", () => new THREE.ConeGeometry(1, 1, 48, 6, true, Math.PI, Math.PI))} material={plastic("#1a1008", { transparent: true, opacity: 0.45 * splitGlow })} scale={[r * 1.02, h * 1.02, r * 1.02]} position={[0, h / 2, 0]} renderOrder={5} />
          <mesh geometry={geoOf("pileSplit", () => new THREE.PlaneGeometry(0.06, 1))} material={plastic("#ffffff", { emissive: "#fff6c0", ei: 3 * splitGlow })} scale={[1, h * 1.15, 1]} position={[0, h * 0.55, r * 0.02]} rotation={[0, 0, 0]} renderOrder={6} />
        </>
      ) : null}
    </group>
  );
};

// ------------------------------------------------------------------ bills (plain: no portrait, no seal, no text)
const billTex = () =>
  canvasTexture("billPlain", 512, 230, (g, W, H) => {
    g.fillStyle = "#3fb86a";
    g.fillRect(0, 0, W, H);
    g.strokeStyle = "#e8ffe8";
    g.lineWidth = 10;
    g.strokeRect(14, 14, W - 28, H - 28);
    g.fillStyle = "#2a9a54";
    g.beginPath();
    g.ellipse(W / 2, H / 2, H * 0.32, H * 0.32, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#e8ffe8";
    g.font = "800 110px Poppins";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("$", W / 2, H / 2 + 6);
  });
export const BILL = { w: 0.26, h: 0.115 };
/** a plain green bill lying flat (rot to stand it); s scales it (the shrinking dollar) */
export const Bill: React.FC<{ p?: V3; r?: V3; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <mesh geometry={rbox(BILL.w, 0.004, BILL.h, 0.0015)} material={plastic("#3fb86a", { rough: 0.7 })} castShadow receiveShadow />
    <mesh geometry={geoOf("billFace", () => new THREE.PlaneGeometry(BILL.w * 0.98, BILL.h * 0.96))} material={plastic("#ffffff", { decal: true, rough: 0.7, map: billTex() })} position={[0, 0.0026, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    <mesh geometry={geoOf("billBack", () => new THREE.PlaneGeometry(BILL.w * 0.98, BILL.h * 0.96))} material={plastic("#ffffff", { decal: true, rough: 0.7, map: billTex() })} position={[0, -0.0026, 0]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);
/** a fan of 3 bills held in a hand (stands upright, fans by `spread` rad) */
export const BillFan: React.FC<{ spread?: number }> = ({ spread = 0.5 }) => (
  <group>
    {[-1, 0, 1].map((k) => (
      <group key={k} rotation={[0, 0, k * spread * 0.5]}>
        <Bill p={[0, 0.06, 0.004 * k]} r={[Math.PI / 2, 0, Math.PI / 2]} s={0.8} />
      </group>
    ))}
  </group>
);
/** a block of bills (a brick of cash: green slab with a paper band) */
export const BillBrick: React.FC<{ p: V3; s?: number; r?: V3 }> = ({ p, s = 1, r = [0, 0, 0] }) => (
  <group position={p} scale={s} rotation={r}>
    <B s={[BILL.w, 0.07, BILL.h]} p={[0, 0.035, 0]} c="#3fb86a" rough={0.75} />
    <B s={[0.05, 0.074, BILL.h + 0.006]} p={[0, 0.035, 0]} c="#fff4c8" rough={0.8} />
  </group>
);

// ------------------------------------------------------------------ labels and blocks
/** a flat panel of text (front faces +z). Bright plate, bold Poppins. */
export const Label: React.FC<{ p: V3; text: string[]; w: number; h: number; r?: V3; bg?: string; fg?: string; border?: string; glow?: number; strike?: number }> = ({ p, text, w, h, r = [0, 0, 0], bg = PAL.paper, fg = PAL.ink, border, glow = 0, strike }) => (
  <group position={p} rotation={r}>
    <mesh geometry={rbox(w, h, 0.012, Math.min(w, h) * 0.08)} material={plastic(bg, { rough: 0.6 })} castShadow />
    <mesh
      geometry={geoOf(`lbl${w}|${h}`, () => new THREE.PlaneGeometry(w * 0.97, h * 0.95))}
      material={plastic("#ffffff", { decal: true, rough: 0.6, map: textTex(`L|${text.join("/")}|${bg}|${fg}|${border ?? ""}|${strike ?? -1}`, text, { w: 1024, h: Math.max(64, Math.round((1024 * h) / w)), bg, fg, border, strike }), emissive: glow ? fg : undefined, ei: glow })}
      position={[0, 0, 0.0075]}
    />
  </group>
);
/** a big labelled block (the "72" block, the "$5,000" debt block): front and back faces carry the text */
export const BigBlock: React.FC<{ p: V3; size: V3; color: string; text: string; fg?: string; r?: V3; glow?: number; scale?: number }> = ({ p, size, color, text, fg = "#ffffff", r = [0, 0, 0], glow = 0, scale = 1 }) => {
  const [w, h, d] = size;
  const tex = canvasTexture(`bb|${text}|${fg}`, 1024, Math.max(64, Math.round((1024 * h) / w)), (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.fillStyle = fg;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let px = H * 0.62;
    g.font = `800 ${px}px Poppins`;
    const fit = (W * 0.86) / Math.max(1, g.measureText(text).width);
    if (fit < 1) {
      px *= fit;
      g.font = `800 ${px}px Poppins`;
    }
    g.lineWidth = px * 0.08;
    g.strokeStyle = "rgba(10,6,20,0.55)";
    g.strokeText(text, W / 2, H / 2 + px * 0.04);
    g.fillText(text, W / 2, H / 2 + px * 0.04);
  });
  const face = plastic("#ffffff", { decal: true, map: tex, emissive: glow ? fg : undefined, ei: glow });
  return (
    <group position={p} rotation={r} scale={scale}>
      <mesh geometry={rbox(w, h, d, Math.min(w, h, d) * 0.1)} material={plastic(color, { rough: 0.4, emissive: glow ? color : undefined, ei: glow * 0.4 })} position={[0, h / 2, 0]} castShadow receiveShadow />
      <mesh geometry={geoOf(`bbF${w}|${h}`, () => new THREE.PlaneGeometry(w * 0.92, h * 0.9))} material={face} position={[0, h / 2, d / 2 + 0.005]} />
      <mesh geometry={geoOf(`bbF${w}|${h}`, () => new THREE.PlaneGeometry(w * 0.92, h * 0.9))} material={face} position={[0, h / 2, -d / 2 - 0.005]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};
/** the glowing cash case on the counter: a translucent case with gold edges and a label on the front */
export const CashCase: React.FC<{ p?: V3; r?: V3; label: string; glow?: number; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], label, glow = 1, s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <B s={[0.5, 0.06, 0.3]} p={[0, 0.03, 0]} c="#3a3f58" />
    <mesh geometry={rbox(0.46, 0.3, 0.26, 0.02)} material={plastic("#bff8ff", { rough: 0.1, transparent: true, opacity: 0.35, emissive: "#9ff0ff", ei: 0.4 * glow })} position={[0, 0.21, 0]} renderOrder={3} />
    {[0, 1, 2].map((i) => (
      <BillBrick key={i} p={[(i - 1) * 0.13, 0.06 + (i % 2) * 0.07, 0]} s={0.82} r={[0, 0.1 * (i - 1), 0]} />
    ))}
    <B s={[0.5, 0.04, 0.3]} p={[0, 0.38, 0]} c={PAL.coin} e={["#c88a10", 0.4 * glow]} />
    <B s={[0.12, 0.05, 0.06]} p={[0, 0.425, 0]} c={PAL.coinDark} />
    <Label p={[0, 0.2, 0.135]} text={[label]} w={0.42} h={0.1} bg="#16121c" fg="#ffe27a" glow={0.8 * glow} />
    {glow > 0 ? <pointLight position={[0, 0.3, 0.3]} color="#9ff0ff" intensity={0.8 * glow} distance={1.4} decay={2} /> : null}
  </group>
);

// ------------------------------------------------------------------ calendar, receipt, stamp
/** wall calendar: a board with a top bar and a big page. When `flip` runs 0 -> 1 the previous page lifts and falls away. */
/** the calendar title / sub-line grey: 4.8:1 on the #fffaf0 page (framing QA contrast rule; was #9a90b0, 2.9:1) */
export const CAL_GREY = "#736c84";
export const FlipCalendar: React.FC<{ p: V3; r?: V3; w?: number; h?: number; title?: string; value: string; prev?: string; flip?: number; sub?: string; color?: string }> = ({ p, r = [0, 0, 0], w = 1.3, h = 1.1, title = "DAY", value, prev, flip = 1, sub, color = "#e0412b" }) => {
  const page = (v: string) =>
    canvasTexture(`calp|${title}|${v}|${sub ?? ""}`, 512, Math.round((512 * (h - 0.22)) / w), (g, W, H) => {
      g.fillStyle = "#fffaf0";
      g.fillRect(0, 0, W, H);
      g.fillStyle = CAL_GREY;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `800 ${H * 0.13}px Poppins`;
      g.fillText(title, W / 2, H * 0.14);
      g.fillStyle = PAL.ink;
      let px = H * 0.56;
      g.font = `800 ${px}px Poppins`;
      const fit = (W * 0.88) / Math.max(1, g.measureText(v).width);
      if (fit < 1) {
        px *= fit;
        g.font = `800 ${px}px Poppins`;
      }
      g.fillText(v, W / 2, H * 0.55);
      if (sub) {
        g.fillStyle = CAL_GREY;
        g.font = `800 ${H * 0.1}px Poppins`;
        g.fillText(sub, W / 2, H * 0.88);
      }
    });
  const ph = h - 0.22;
  const u = clamp(flip);
  const ang = u * Math.PI * 0.95;
  return (
    <group position={p} rotation={r}>
      <B s={[w + 0.08, h + 0.08, 0.05]} p={[0, 0, -0.03]} c="#3a2a6a" />
      <B s={[w, 0.2, 0.06]} p={[0, h / 2 - 0.1, 0.01]} c={color} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geoOf("calRing", () => new THREE.TorusGeometry(0.035, 0.012, 6, 14))} material={plastic("#d8d8e8", { rough: 0.3 })} position={[s * w * 0.28, h / 2 - 0.2, 0.05]} />
      ))}
      <mesh geometry={geoOf(`calPage${w}|${ph}`, () => new THREE.PlaneGeometry(w * 0.94, ph))} material={plastic("#ffffff", { rough: 0.8, map: page(value) })} position={[0, -0.11, 0.032]} receiveShadow />
      {prev !== undefined && u < 1 ? (
        <group position={[0, ph / 2 - 0.11, 0.04]} rotation={[-ang, 0, 0]}>
          <mesh geometry={geoOf(`calPageT${w}|${ph}`, () => new THREE.PlaneGeometry(w * 0.94, ph).translate(0, -ph / 2, 0))} material={plastic("#ffffff", { rough: 0.8, map: page(prev), side: THREE.DoubleSide })} castShadow />
        </group>
      ) : null}
    </group>
  );
};
/** a paper receipt unrolling from a point: length grows, the tail curls over the edge */
export const Receipt: React.FC<{ p: V3; len: number; r?: V3 }> = ({ p, len, r = [0, 0, 0] }) => {
  const tex = canvasTexture("receiptLines2", 128, 512, (g, W, H) => {
    g.fillStyle = "#fff0b8";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#6a5a8a";
    for (let y = 10; y < H; y += 22) g.fillRect(14, y, W * (0.4 + 0.45 * hash(y)), 6);
  });
  tex.wrapT = THREE.RepeatWrapping;
  const L = Math.max(0.01, len);
  return (
    <group position={p} rotation={r}>
      <B s={[0.16, 0.1, 0.1]} p={[0, 0.05, 0]} c="#3a3f58" />
      <mesh geometry={geoOf(`rcpt${L.toFixed(2)}`, () => new THREE.PlaneGeometry(0.1, L))} material={plastic("#ffffff", { rough: 0.8, map: tex, side: THREE.DoubleSide })} position={[0, 0.1, 0.05 + L / 2]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow />
    </group>
  );
};
/** a stamp mark slammed onto a surface: scale pops 1.6 -> 1, red ink text in a box */
export const Stamp: React.FC<{ p: V3; text: string; u: number; w?: number; r?: V3; color?: string }> = ({ p, text, u, w = 0.6, r = [0, 0, -0.12], color = "#e0412b" }) => {
  if (u <= 0) return null;
  const s = u < 1 ? 1 + 0.6 * (1 - u) * (1 - u) : 1;
  const tex = canvasTexture(`stamp|${text}|${color}`, 1024, 300, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = color;
    g.lineWidth = 22;
    g.strokeRect(16, 16, W - 32, H - 32);
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let px = H * 0.5;
    g.font = `800 ${px}px Poppins`;
    const fit = (W * 0.84) / g.measureText(text).width;
    if (fit < 1) {
      px *= fit;
      g.font = `800 ${px}px Poppins`;
    }
    g.fillText(text, W / 2, H / 2 + 8);
  });
  return (
    <mesh geometry={geoOf(`stampP${w}`, () => new THREE.PlaneGeometry(w, w * 0.293))} material={plastic("#ffffff", { decal: true, map: tex, transparent: true, opacity: clamp(u * 4) })} position={p} rotation={r} scale={s} renderOrder={5} />
  );
};

// ------------------------------------------------------------------ booth, chart, clock
/** a blocky toll booth: hut, roof, window, a coin slot box in front and a little display with text lines */
export const TollBooth: React.FC<{ p: V3; yaw?: number; display?: string[]; displayColor?: string }> = ({ p, yaw = 0, display = ["$"], displayColor = "#ff5a4f" }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <B s={[1.1, 1.9, 1.0]} p={[0, 0.95, 0]} c="#efe6ff" />
    <B s={[1.35, 0.14, 1.25]} p={[0, 1.97, 0]} c={PAL.debt} />
    <B s={[1.2, 0.08, 1.1]} p={[0, 2.08, 0]} c="#a01a1a" />
    {[0.24, 0.5].map((y) => (
      <mesh key={y} geometry={rbox(1.112, 0.07, 1.012, 0.01)} material={plastic(PAL.debt, { rough: 0.5 })} position={[0, y, 0]} />
    ))}
    <mesh geometry={geoOf("boothWin", () => new THREE.PlaneGeometry(0.7, 0.55))} material={plastic("#8ec9f2", { rough: 0.12, emissive: "#3a6aa0", ei: 0.3 })} position={[0, 1.3, 0.505]} />
    {/* slot box */}
    <group position={[0.75, 0, 0.35]}>
      <B s={[0.1, 0.9, 0.1]} p={[0, 0.45, 0]} c="#3a3f58" />
      <B s={[0.36, 0.3, 0.3]} p={[0, 1.05, 0]} c="#3a3f58" />
      <B s={[0.16, 0.02, 0.04]} p={[0, 1.205, 0.05]} c="#0a0814" />
      <Label p={[0, 1.05, 0.157]} text={display} w={0.32} h={0.22} bg="#0e0a18" fg={displayColor} glow={1.2} />
    </group>
  </group>
);
/** a chart board on legs: dark board, grid, a line of blocks (values 0..1 mapped up the board), title on top.
 *  draw (0..1) reveals the line left to right; wobble adds up/down noise (seeded) to the points. */
export const ChartBoard: React.FC<{ p: V3; yaw?: number; w?: number; h?: number; title?: string; values: number[]; color?: string; draw?: number; wobble?: number; seed?: number; board?: string }> = ({ p, yaw = 0, w = 1.8, h = 1.2, title, values, color = PAL.cash, draw = 1, wobble = 0, seed = 1, board = "#16301e" }) => {
  const n = values.length;
  const shown = Math.max(0, Math.min(n, draw * n));
  const step = (w * 0.86) / n;
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      {[-1, 1].map((s) => (
        <B key={s} s={[0.06, 0.9, 0.06]} p={[s * (w / 2 - 0.1), 0.45, -0.02]} c="#3a3f58" />
      ))}
      <B s={[w + 0.1, h + 0.1, 0.06]} p={[0, 0.9 + h / 2, -0.04]} c="#5a4020" />
      <B s={[w, h, 0.04]} p={[0, 0.9 + h / 2, 0]} c={board} rough={0.85} />
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} geometry={geoOf(`gridH${w}`, () => new THREE.PlaneGeometry(w * 0.9, 0.006))} material={plastic("#ffffff", { transparent: true, opacity: 0.18 })} position={[0, 0.9 + 0.08 + (i * (h - 0.25)) / 4, 0.022]} />
      ))}
      {title ? <Label p={[0, 0.9 + h - 0.11, 0.03]} text={[title]} w={w * 0.8} h={0.16} bg={board} fg="#ffffff" /> : null}
      {Array.from({ length: Math.ceil(shown) }, (_, i) => {
        const v = clamp(values[i] + wobble * (hash(seed + i * 2.3) - 0.5) * 0.5, 0, 1);
        const y = 0.9 + 0.1 + v * (h - 0.4);
        return <B key={i} s={[step * 0.82, 0.07, 0.05]} p={[-w * 0.43 + step * (i + 0.5), y, 0.04]} c={color} e={[color, 0.5]} r={[0, 0, 0]} />;
      })}
    </group>
  );
};
/** a big blocky clock: a round face with 12 ticks and two hands. hour/min are angles (rad, 0 = 12 o'clock) */
export const BigClock: React.FC<{ p: V3; r?: V3; s?: number; hour: number; min: number; color?: string }> = ({ p, r = [0, 0, 0], s = 1, hour, min, color = "#2a7de1" }) => (
  <group position={p} rotation={r} scale={s}>
    <mesh geometry={geoOf("clockBody", () => new THREE.CylinderGeometry(0.5, 0.5, 0.16, 40))} material={plastic(color, { rough: 0.4 })} rotation={[Math.PI / 2, 0, 0]} castShadow />
    <mesh geometry={geoOf("clockFace", () => new THREE.CircleGeometry(0.43, 40))} material={plastic("#fffaf0", { rough: 0.6 })} position={[0, 0, 0.081]} />
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} geometry={geoOf("clockTick", () => new THREE.BoxGeometry(0.03, i % 3 ? 0.05 : 0.09, 0.01))} material={plastic(PAL.ink)} position={[Math.sin((i / 12) * Math.PI * 2) * 0.37, Math.cos((i / 12) * Math.PI * 2) * 0.37, 0.085]} rotation={[0, 0, -(i / 12) * Math.PI * 2]} />
    ))}
    <group position={[0, 0, 0.09]} rotation={[0, 0, -hour]}>
      <B s={[0.05, 0.22, 0.02]} p={[0, 0.1, 0]} c={PAL.ink} />
    </group>
    <group position={[0, 0, 0.1]} rotation={[0, 0, -min]}>
      <B s={[0.035, 0.32, 0.02]} p={[0, 0.15, 0]} c={PAL.debt} />
    </group>
    <mesh geometry={geoOf("clockPin", () => new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12))} material={plastic(PAL.coin)} position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);
/** a simple podium cylinder with a glowing top ring */
export const Pedestal: React.FC<{ p: V3; h: number; r?: number; color?: string; ring?: string }> = ({ p, h, r = 0.32, color = "#efe6ff", ring = "#2fd0bd" }) => (
  <group position={p}>
    <mesh geometry={geoOf(`ped${h}|${r}`, () => new THREE.CylinderGeometry(r, r * 1.15, h, 28))} material={plastic(color, { rough: 0.4 })} position={[0, h / 2, 0]} castShadow receiveShadow />
    <mesh geometry={geoOf(`pedRing${r}`, () => new THREE.TorusGeometry(r * 1.02, 0.02, 8, 36))} material={plastic(ring, { emissive: ring, ei: 0.7 })} position={[0, h - 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);

// ------------------------------------------------------------------ sets
/** soft contact darkening (fake AO): a gradient strip on the floor (or up a wall) */
export const AO: React.FC<{ p: V3; w: number; d?: number; yaw?: number; wall?: boolean; op?: number; color?: string }> = ({ p, w, d = 0.6, yaw = 0, wall = false, op = 0.45, color = "#140a2a" }) => {
  const tex = canvasTexture(`aoGrad|${color}`, 8, 128, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  });
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={geoOf(`ao${w}|${d}`, () => new THREE.PlaneGeometry(w, d))} material={plastic("#ffffff", { map: tex, transparent: true, opacity: op })} rotation={wall ? [0, 0, Math.PI] : [-Math.PI / 2, 0, 0]} position={wall ? [0, d / 2, 0.012] : [0, 0.004, d / 2]} renderOrder={2} />
    </group>
  );
};
const floorTex = (a: string, b: string) =>
  canvasTexture(`floor|${a}|${b}`, 512, 512, (g, W, H) => {
    g.fillStyle = a;
    g.fillRect(0, 0, W, H);
    g.fillStyle = b;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) g.fillRect((i * W) / 4, (j * H) / 4, W / 4, H / 4);
  });
/** the bright blocky interior: floor tiles, back + side walls with a stripe, a ceiling with light panels, AO in the
 *  corners. W x D room centred on x, back wall at z = back. */
export const Hall: React.FC<{ W?: number; back?: number; front?: number; H?: number; wall?: string; stripe?: string; floorA?: string; floorB?: string; children?: React.ReactNode }> = ({ W = 12, back = -3.5, front = 6, H = 4.2, wall = "#8a7ae8", stripe = "#ffd23a", floorA = "#f4ecff", floorB = "#e2d6fa", children }) => {
  const D = front - back;
  const ft = floorTex(floorA, floorB);
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping;
  ft.repeat.set(W / 2, D / 2);
  return (
    <group>
      <mesh geometry={geoOf(`hallFloor${W}|${D}`, () => new THREE.PlaneGeometry(W, D))} material={plastic("#ffffff", { rough: 0.55, map: ft })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, back + D / 2]} receiveShadow />
      <mesh geometry={geoOf(`hallBack${W}|${H}`, () => new THREE.PlaneGeometry(W, H))} material={plastic(wall, { rough: 0.8 })} position={[0, H / 2, back]} receiveShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geoOf(`hallSide${D}|${H}`, () => new THREE.PlaneGeometry(D, H))} material={plastic(wall, { rough: 0.8 })} position={[(s * W) / 2, H / 2, back + D / 2]} rotation={[0, -s * Math.PI / 2, 0]} receiveShadow />
      ))}
      <mesh geometry={geoOf(`hallCeil${W}|${D}`, () => new THREE.PlaneGeometry(W, D))} material={plastic("#f4f0ff", { rough: 0.9 })} rotation={[Math.PI / 2, 0, 0]} position={[0, H, back + D / 2]} />
      {[-3, 0, 3].map((x) => (
        <mesh key={x} geometry={geoOf("ceilPanel", () => new THREE.PlaneGeometry(1.6, 0.5))} material={plastic("#ffffff", { emissive: "#fff6e0", ei: 1.2 })} rotation={[Math.PI / 2, 0, 0]} position={[x, H - 0.01, back + 1.6]} />
      ))}
      {/* a wainscot stripe and skirting */}
      <mesh geometry={geoOf(`hallStripe${W}`, () => new THREE.PlaneGeometry(W, 0.16))} material={plastic(stripe, { rough: 0.6 })} position={[0, 1.15, back + 0.005]} />
      <mesh geometry={geoOf(`hallSkirt${W}`, () => new THREE.BoxGeometry(W, 0.14, 0.04))} material={plastic("#5a48b8", { rough: 0.6 })} position={[0, 0.07, back + 0.02]} />
      <AO p={[0, 0, back]} w={W} d={0.9} />
      <AO p={[0, 0, back]} w={W} d={0.7} wall />
      {[-1, 1].map((s) => (
        <group key={s}>
          <AO p={[s * (W / 2 - 0.01), 0, back + D / 2]} w={D} d={0.8} yaw={-s * Math.PI / 2} />
          <AO p={[s * (W / 2 - 0.01), 0, back + D / 2]} w={D} d={0.6} yaw={-s * Math.PI / 2} wall />
        </group>
      ))}
      {children}
    </group>
  );
};
/** an outdoor ground: grass, a straight road along -z from z0 (the long road), lane marks, a sky behind */
export const Ground: React.FC<{ road?: boolean; roadW?: number; grass?: string; roadColor?: string; len?: number }> = ({ road = false, roadW = 2.4, grass = "#5cc24a", roadColor = "#5a5a6e", len = 160 }) => (
  <group>
    <mesh geometry={geoOf("groundGrass", () => new THREE.PlaneGeometry(400, 400))} material={plastic(grass, { rough: 0.9 })} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
    {road ? (
      <>
        <mesh geometry={geoOf(`road${roadW}|${len}`, () => new THREE.PlaneGeometry(roadW, len))} material={plastic(roadColor, { rough: 0.85 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -len / 2 + 4]} receiveShadow />
        {Array.from({ length: Math.floor(len / 2) }, (_, i) => (
          <mesh key={i} geometry={geoOf("roadDash", () => new THREE.PlaneGeometry(0.1, 0.8))} material={plastic("#fff4c8", { rough: 0.7 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 3 - i * 2]} />
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={geoOf(`kerb${len}`, () => new THREE.BoxGeometry(0.16, 0.08, len))} material={plastic("#efe6ff", { rough: 0.6 })} position={[(s * (roadW + 0.16)) / 2, 0.04, -len / 2 + 4]} receiveShadow castShadow />
        ))}
      </>
    ) : null}
  </group>
);
export const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

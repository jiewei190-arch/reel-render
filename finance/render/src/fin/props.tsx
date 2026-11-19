// Finance props (our own designs, the blocky plastic family): coins, coin stacks and piles, a plain bill block (no
// portrait, no seal, no real currency art), a money case, a flip wall calendar, a toll booth, a chart board, a big
// clock, a number block, debt blocks, a PAID OFF gate, a deck chair. Every prop is a pure function of its props.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import { hash } from "../blocky/motion";
import type { V3 } from "../blocky/motion";
import { textTex } from "../library/props";
import { FIN_PAL } from "../library/characters";

export const COIN = { r: 0.075, h: 0.022 };
const coinGeo = () => geoOf("finCoin", () => new THREE.CylinderGeometry(COIN.r, COIN.r, COIN.h, 28));
const rimGeo = () => geoOf("finCoinRim", () => new THREE.TorusGeometry(COIN.r * 0.82, 0.005, 6, 28));
const coinMat = (c: string) => plastic(c, { rough: 0.28 });
const GOLD = FIN_PAL.coin;
const COPPER = "#d27a3a";

/** one coin, lying flat (rot to stand it up) */
export const Coin: React.FC<{ p?: V3; rot?: V3; s?: number; color?: string }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, color = GOLD }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh geometry={coinGeo()} material={coinMat(color)} position={[0, COIN.h / 2, 0]} castShadow receiveShadow />
    <mesh geometry={rimGeo()} material={coinMat(color === COPPER ? "#f0a060" : "#ffe08a")} position={[0, COIN.h + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
);
export const Penny: React.FC<{ p?: V3; rot?: V3; s?: number }> = (o) => <Coin {...o} color={COPPER} />;

/** a stack of n coins with a slight seeded wobble (n may grow with t) */
export const CoinStack: React.FC<{ p: V3; n: number; color?: string; seed?: number }> = ({ p, n, color = GOLD, seed = 0 }) => (
  <group position={p}>
    {Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => (
      <mesh key={i} geometry={coinGeo()} material={coinMat(color)} position={[(hash(seed * 31 + i) - 0.5) * 0.012, COIN.h * (i + 0.5), (hash(seed * 17 + i * 3) - 0.5) * 0.012]} castShadow receiveShadow />
    ))}
  </group>
);
/** a row/grid of stacks: k stacks of height n (used on shelves and podiums) */
export const StackRow: React.FC<{ p: V3; k: number; n: number; gap?: number; color?: string; seed?: number }> = ({ p, k, n, gap = 0.17, color, seed = 0 }) => (
  <group position={p}>
    {Array.from({ length: k }, (_, i) => (
      <CoinStack key={i} p={[(i - (k - 1) / 2) * gap, 0, 0]} n={n * (0.75 + 0.25 * hash(seed + i))} color={color} seed={seed + i} />
    ))}
  </group>
);

/** a coin pile: a cone of gold with coins scattered over its surface; h = height (m) */
export const CoinPile: React.FC<{ p: V3; h: number; r?: number; seed?: number; glow?: number; color?: string; coin?: string }> = ({ p, h, r, seed = 3, glow = 0, color = "#e8b232", coin = GOLD }) => {
  const R = r ?? h * 1.25;
  if (h <= 0.01) return null;
  const n = Math.min(90, Math.round(18 + R * 40));
  return (
    <group position={p}>
      <mesh geometry={geoOf("pileCone", () => new THREE.ConeGeometry(1, 1, 24, 1))} material={plastic(color, { rough: 0.35, emissive: glow ? color : undefined, ei: glow })} position={[0, h / 2, 0]} scale={[R, h, R]} castShadow receiveShadow />
      {Array.from({ length: n }, (_, i) => {
        const u = hash(seed + i * 7.1), a = hash(seed + i * 3.3) * Math.PI * 2;
        const rr = R * Math.sqrt(u) * 0.98;
        const y = h * (1 - rr / R);
        const slope = Math.atan2(h, R);
        return <Coin key={i} p={[Math.cos(a) * rr, y - 0.004, Math.sin(a) * rr]} rot={[Math.sin(a) * slope, 0, -Math.cos(a) * slope]} s={1.4} color={coin} />;
      })}
    </group>
  );
};

/** a plain bill block: green paper bundle with a pale band and a label (never a portrait, seal or real note art) */
export const BillBlock: React.FC<{ p?: V3; rot?: V3; s?: number; label?: string; w?: number; h?: number; d?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, label = "$1", w = 0.3, h = 0.06, d = 0.14 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh geometry={rbox(w, h, d, 0.008)} material={plastic("#5fb873", { rough: 0.7 })} position={[0, h / 2, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(w * 0.22, h + 0.006, d + 0.006, 0.004)} material={plastic("#fff4c8", { rough: 0.6 })} position={[0, h / 2, 0]} />
    <mesh geometry={geoOf(`billFace${w}|${d}|${label}`, () => new THREE.PlaneGeometry(w * 0.9, d * 0.8))} material={plastic("#ffffff", { decal: true, rough: 0.7, map: textTex(`bill|${label}`, [label], { w: 512, h: Math.round((512 * d) / w), bg: "#7fd08f", fg: "#1a5a32", border: "#2e8a4a" }) })} position={[0, h + 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]} />
  </group>
);
/** a flat paper bill held in a hand (shrinks with k) */
export const Bill: React.FC<{ k?: number; label?: string }> = ({ k = 1, label = "$1" }) => (
  <group scale={[Math.max(0.05, k), 1, 1]}>
    <mesh geometry={rbox(0.34, 0.16, 0.006, 0.003)} material={plastic("#6cc07e", { rough: 0.75 })} position={[0, 0.1, 0]} castShadow />
    <mesh geometry={geoOf("billFlat", () => new THREE.PlaneGeometry(0.32, 0.14))} material={plastic("#ffffff", { decal: true, rough: 0.7, map: textTex(`billflat|${label}`, [label], { w: 512, h: 224, bg: "#8fd89c", fg: "#1a5a32", border: "#2e8a4a" }) })} position={[0, 0.1, 0.0045]} />
  </group>
);

/** the money case: a chunky case with a handle and a front label */
export const CashCase: React.FC<{ p?: V3; rot?: V3; s?: number; label?: string; glow?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], s = 1, label = "$1,000,000", glow = 0.6 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh geometry={rbox(0.62, 0.42, 0.16, 0.03)} material={plastic("#3a3f58", { rough: 0.4 })} position={[0, 0.21, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(0.64, 0.04, 0.17, 0.01)} material={plastic("#ffd23a", { rough: 0.3 })} position={[0, 0.3, 0]} />
    <mesh geometry={geoOf("caseHandle", () => new THREE.TorusGeometry(0.07, 0.016, 8, 16, Math.PI))} material={plastic("#ffd23a", { rough: 0.3 })} position={[0, 0.42, 0]} castShadow />
    <mesh geometry={geoOf(`caseFace|${label}`, () => new THREE.PlaneGeometry(0.54, 0.14))} material={plastic("#ffffff", { decal: true, map: textTex(`case|${label}`, [label], { w: 1024, h: 266, bg: "#fff4c8", fg: "#1a5a32", border: "#e0a92a" }), emissive: "#fff4c8", ei: glow })} position={[0, 0.15, 0.0845]} />
  </group>
);

/** a big wall calendar: a board with rings, a red header and two lines of text (flip = 0..1 page turning) */
export const WallCalendar: React.FC<{ p: V3; yaw?: number; head: string; big: string; flip?: number; w?: number }> = ({ p, yaw = 0, head, big, flip = 0, w = 1.0 }) => {
  const h = w * 1.2;
  const page = textTex(`cal|${big}`, [big], { w: 512, h: 400, bg: "#fffaf0", fg: "#16121c", px: 170 });
  const hd = textTex(`calH|${head}`, [head], { w: 512, h: 128, bg: "#e0412b", fg: "#ffffff", px: 70 });
  const turn = Math.min(1, Math.max(0, flip));
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={rbox(w + 0.08, h + 0.08, 0.05, 0.02)} material={plastic("#3a2a6a", { rough: 0.5 })} castShadow receiveShadow />
      <mesh geometry={geoOf(`calHead${w}`, () => new THREE.PlaneGeometry(w, h * 0.22))} material={plastic("#ffffff", { decal: true, map: hd })} position={[0, h * 0.39, 0.03]} />
      <mesh geometry={geoOf(`calPage${w}`, () => new THREE.PlaneGeometry(w, h * 0.74))} material={plastic("#ffffff", { decal: true, map: page })} position={[0, -h * 0.12, 0.03]} />
      {[-0.3, 0, 0.3].map((x) => (
        <mesh key={x} geometry={geoOf("calRing", () => new THREE.TorusGeometry(0.035, 0.01, 6, 14))} material={plastic("#d8d8e0", { rough: 0.2 })} position={[x * w, h * 0.5, 0.035]} />
      ))}
      {turn > 0 && turn < 1 ? (
        <group position={[0, h * 0.26, 0.04]} rotation={[-turn * Math.PI * 0.95, 0, 0]}>
          <mesh geometry={geoOf(`calFlip${w}`, () => { const g = new THREE.PlaneGeometry(w, h * 0.74); g.translate(0, -h * 0.37, 0); return g; })} material={plastic("#fffaf0", { side: THREE.DoubleSide, rough: 0.7 })} />
        </group>
      ) : null}
    </group>
  );
};

/** a toll booth with a display on its front */
export const TollBooth: React.FC<{ p: V3; yaw?: number; text?: string[] }> = ({ p, yaw = 0, text = ["PAY HERE"] }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(1.1, 1.9, 1.0, 0.05)} material={plastic("#2a4fb0", { rough: 0.45 })} position={[0, 0.95, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(1.3, 0.14, 1.2, 0.04)} material={plastic("#ffd23a", { rough: 0.4 })} position={[0, 1.97, 0]} castShadow />
    <mesh geometry={rbox(0.9, 0.5, 0.02, 0.01)} material={plastic("#9fd8ff", { rough: 0.1, transparent: true, opacity: 0.55 })} position={[0, 1.35, 0.5]} />
    <mesh geometry={rbox(0.5, 0.06, 0.3, 0.01)} material={plastic("#16264a", { rough: 0.4 })} position={[0, 1.05, 0.62]} castShadow />
    <mesh geometry={geoOf("boothSlot", () => new THREE.PlaneGeometry(0.2, 0.03))} material={plastic("#05050a")} position={[0, 1.085, 0.6]} rotation={[-Math.PI / 2, 0, 0]} />
    <mesh geometry={geoOf("boothFace", () => new THREE.PlaneGeometry(0.9, 0.36))} material={plastic("#ffffff", { decal: true, map: textTex(`booth|${text.join("/")}`, text, { w: 640, h: 256, bg: "#16264a", fg: "#ffd23a" }), emissive: "#ffd23a", ei: 0.35 })} position={[0, 0.62, 0.505]} />
  </group>
);

/** a chart board: a framed board on legs with a title and a block line (values 0..1, wobble 0..1 makes it jagged) */
export const ChartBoard: React.FC<{ p: V3; yaw?: number; title: string; values: number[]; color?: string; draw?: number; wobble?: number; stamp?: string; w?: number }> = ({ p, yaw = 0, title, values, color = FIN_PAL.cash, draw = 1, wobble = 0, stamp, w = 1.6 }) => {
  const h = w * 0.66;
  const n = values.length;
  const shown = Math.max(0, Math.min(n, Math.ceil(draw * n)));
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={rbox(0.06, 1.0, 0.06, 0.02)} material={plastic("#5a3a2e", { rough: 0.6 })} position={[(s * w) / 2.4, 0.5, -0.02]} castShadow />
      ))}
      <group position={[0, 1.0 + h / 2, 0]}>
        <mesh geometry={rbox(w + 0.1, h + 0.1, 0.05, 0.02)} material={plastic("#5a3a2e", { rough: 0.6 })} castShadow receiveShadow />
        <mesh geometry={rbox(w, h, 0.02, 0.005)} material={plastic("#1f4a3a", { rough: 0.9 })} position={[0, 0, 0.02]} receiveShadow />
        <mesh geometry={geoOf(`chartTitle${w}`, () => new THREE.PlaneGeometry(w * 0.9, h * 0.2))} material={plastic("#ffffff", { decal: true, map: textTex(`chartT|${title}`, [title], { w: 1024, h: 220, fg: "#fff4c8" }) })} position={[0, h * 0.36, 0.036]} />
        {Array.from({ length: shown }, (_, i) => {
          const v0 = values[i];
          const v = Math.max(0.04, Math.min(1, v0 + wobble * (hash(i * 13 + 5) - 0.5) * 0.7));
          const bw = (w * 0.86) / n;
          const bh = v * h * 0.6;
          return <mesh key={i} geometry={rbox(bw * 0.8, bh, 0.04, 0.008)} material={plastic(color, { rough: 0.4, emissive: color, ei: 0.25 })} position={[-w * 0.43 + bw * (i + 0.5), -h * 0.42 + bh / 2, 0.05]} castShadow />;
        })}
        {stamp ? <mesh geometry={geoOf(`chartStamp${w}`, () => new THREE.PlaneGeometry(w * 0.7, h * 0.24))} material={plastic("#ffffff", { decal: true, map: textTex(`stamp|${stamp}`, [stamp], { w: 1024, h: 300, bg: "#fff4f0", fg: "#d62a2a", border: "#d62a2a" }) })} position={[0, -h * 0.05, 0.09]} rotation={[0, 0, 0.12]} /> : null}
      </group>
    </group>
  );
};

/** a big blocky clock (hands turn with t; spin = hours per second of film) */
export const BigClock: React.FC<{ p: V3; t: number; s?: number; spin?: number; yaw?: number }> = ({ p, t, s = 1, spin = 2, yaw = 0 }) => {
  const face = canvasTexture("clockFace", 512, 512, (g, W) => {
    g.fillStyle = "#fffaf0";
    g.beginPath();
    g.arc(W / 2, W / 2, W * 0.48, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#16121c";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.save();
      g.translate(W / 2 + Math.sin(a) * W * 0.4, W / 2 - Math.cos(a) * W * 0.4);
      g.rotate(a);
      g.fillRect(-6, -18, 12, 36);
      g.restore();
    }
  });
  const hr = -t * spin * (Math.PI / 6), mn = -t * spin * Math.PI * 2;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      <mesh geometry={rbox(0.9, 0.9, 0.18, 0.08)} material={plastic("#e0412b", { rough: 0.4 })} castShadow receiveShadow />
      <mesh geometry={geoOf("clockFacePlane", () => new THREE.CircleGeometry(0.38, 40))} material={plastic("#ffffff", { decal: true, map: face })} position={[0, 0, 0.095]} />
      <mesh geometry={rbox(0.05, 0.22, 0.02, 0.01)} material={plastic("#16121c")} position={[Math.sin(-hr) * 0.09, Math.cos(-hr) * 0.09, 0.11]} rotation={[0, 0, hr]} />
      <mesh geometry={rbox(0.035, 0.32, 0.02, 0.01)} material={plastic("#16121c")} position={[Math.sin(-mn) * 0.14, Math.cos(-mn) * 0.14, 0.12]} rotation={[0, 0, mn]} />
      {[-1, 1].map((k) => (
        <mesh key={k} geometry={geoOf("clockBell", () => new THREE.SphereGeometry(0.12, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2))} material={plastic("#ffd23a", { rough: 0.3 })} position={[k * 0.3, 0.48, 0]} rotation={[0, 0, -k * 0.5]} castShadow />
      ))}
    </group>
  );
};

/** a giant number block (e.g. 72): a chunky slab with the text on its front and back */
export const NumberBlock: React.FC<{ p?: V3; rot?: V3; text: string; color?: string; s?: number; glow?: number }> = ({ p = [0, 0, 0], rot = [0, 0, 0], text, color = FIN_PAL.cash, s = 1, glow = 0.8 }) => (
  <group position={p} rotation={rot} scale={s}>
    <mesh geometry={rbox(0.9, 0.62, 0.3, 0.06)} material={plastic(color, { rough: 0.35 })} castShadow receiveShadow />
    {[1, -1].map((k) => (
      <mesh key={k} geometry={geoOf("numFace", () => new THREE.PlaneGeometry(0.82, 0.56))} material={plastic("#ffffff", { decal: true, map: textTex(`num|${text}`, [text], { w: 512, h: 350, fg: "#fff4c8", px: 300 }), emissive: "#fff4c8", ei: glow })} position={[0, 0, k * 0.155]} rotation={[0, k > 0 ? 0 : Math.PI, 0]} />
    ))}
  </group>
);

/** a stack of red debt blocks (n may be fractional: the top block pops in) */
export const DebtStack: React.FC<{ p: V3; n: number; label?: string; w?: number }> = ({ p, n, label, w = 0.5 }) => {
  const k = Math.floor(n), f = n - k;
  const bh = w * 0.45;
  return (
    <group position={p}>
      {Array.from({ length: k + (f > 0.02 ? 1 : 0) }, (_, i) => {
        const sc = i < k ? 1 : f;
        return <mesh key={i} geometry={rbox(w, bh * 0.94, w * 0.8, 0.02)} material={plastic(i % 2 ? "#c42424" : "#e03a32", { rough: 0.45 })} position={[(hash(i * 5) - 0.5) * 0.04, bh * (i + 0.5), 0]} rotation={[0, (hash(i * 9) - 0.5) * 0.12, 0]} scale={[sc, sc, sc]} castShadow receiveShadow />;
      })}
      {label ? <mesh geometry={geoOf(`debtLabel${w}`, () => new THREE.PlaneGeometry(w * 0.9, bh * 0.6))} material={plastic("#ffffff", { decal: true, map: textTex(`debt|${label}`, [label], { w: 512, h: 170, fg: "#fff4c8" }) })} position={[0, bh * 0.5, w * 0.4 + 0.005]} /> : null}
    </group>
  );
};
/** the heavy red block Spender carries */
export const BalanceBlock: React.FC<{ label: string; k?: number }> = ({ label, k = 1 }) => (
  <group scale={[k, k, k]}>
    <mesh geometry={rbox(0.5, 0.36, 0.36, 0.03)} material={plastic("#d62a2a", { rough: 0.45 })} position={[0, 0.18, 0]} castShadow receiveShadow />
    <mesh geometry={geoOf("balFace", () => new THREE.PlaneGeometry(0.46, 0.2))} material={plastic("#ffffff", { decal: true, map: textTex(`bal|${label}`, [label], { w: 512, h: 222, fg: "#fff4c8" }) })} position={[0, 0.18, 0.185]} />
  </group>
);

/** a gate with a sign (the far PAID OFF gate) */
export const Gate: React.FC<{ p: V3; yaw?: number; text: string; s?: number }> = ({ p, yaw = 0, text, s = 1 }) => (
  <group position={p} rotation={[0, yaw, 0]} scale={s}>
    {[-1, 1].map((k) => (
      <mesh key={k} geometry={rbox(0.25, 3.2, 0.25, 0.04)} material={plastic("#f4f4f2", { rough: 0.5 })} position={[k * 2.2, 1.6, 0]} castShadow />
    ))}
    <mesh geometry={rbox(4.8, 0.9, 0.18, 0.05)} material={plastic(FIN_PAL.cash, { rough: 0.4 })} position={[0, 3.2, 0]} castShadow />
    <mesh geometry={geoOf("gateFace", () => new THREE.PlaneGeometry(4.5, 0.7))} material={plastic("#ffffff", { decal: true, map: textTex(`gate|${text}`, [text], { w: 1024, h: 160, fg: "#fff4c8" }), emissive: "#fff4c8", ei: 0.6 })} position={[0, 3.2, 0.095]} />
  </group>
);
/** a roadside sign on a post */
export const PostSign: React.FC<{ p: V3; yaw?: number; text: string[]; bg?: string; fg?: string }> = ({ p, yaw = 0, text, bg = "#ffd23a", fg = "#16121c" }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.08, 1.6, 0.08, 0.02)} material={plastic("#9aa3b0", { rough: 0.4 })} position={[0, 0.8, 0]} castShadow />
    <mesh geometry={rbox(1.1, 0.62, 0.05, 0.03)} material={plastic(bg, { rough: 0.5 })} position={[0, 1.75, 0]} castShadow />
    <mesh geometry={geoOf("postSignFace", () => new THREE.PlaneGeometry(1.0, 0.54))} material={plastic("#ffffff", { decal: true, map: textTex(`post|${text.join("/")}|${bg}`, text, { w: 512, h: 276, bg, fg }) })} position={[0, 1.75, 0.03]} />
  </group>
);
/** a big paper sign standing on a little easel (age signs, put-in tags) */
export const Placard: React.FC<{ p: V3; yaw?: number; text: string[]; w?: number; h?: number; bg?: string; fg?: string; glow?: number }> = ({ p, yaw = 0, text, w = 0.7, h = 0.42, bg = "#fff4c8", fg = "#16121c", glow = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(w + 0.06, h + 0.06, 0.04, 0.02)} material={plastic("#3a2a6a", { rough: 0.5 })} castShadow />
    <mesh geometry={geoOf(`placard${w}|${h}`, () => new THREE.PlaneGeometry(w, h))} material={plastic("#ffffff", { decal: true, map: textTex(`plac|${text.join("/")}|${bg}|${fg}`, text, { w: 512, h: Math.round((512 * h) / w), bg, fg }), emissive: glow ? bg : undefined, ei: glow })} position={[0, 0, 0.025]} />
  </group>
);
/** a paper receipt unrolling down from a counter edge (len m) */
export const Receipt: React.FC<{ p: V3; len: number; yaw?: number }> = ({ p, len, yaw = 0 }) => {
  const tex = canvasTexture("receiptTex", 128, 512, (g, W, H) => {
    g.fillStyle = "#fffdf4";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#9a96a8";
    for (let y = 12; y < H; y += 22) g.fillRect(14, y, 40 + ((y * 7) % 50), 6);
  });
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, Math.max(1, len * 2));
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={geoOf("receiptRoll", () => new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16))} material={plastic("#fffdf4", { rough: 0.8 })} rotation={[0, 0, Math.PI / 2]} castShadow />
      <mesh geometry={geoOf("receiptStrip", () => { const g = new THREE.PlaneGeometry(0.16, 1); g.translate(0, -0.5, 0); return g; })} material={plastic("#ffffff", { map: tex, side: THREE.DoubleSide, rough: 0.8 })} position={[0, 0, 0.065]} scale={[1, Math.max(0.01, len), 1]} castShadow />
    </group>
  );
};
/** a simple deck chair (seat at ~0.32 m) */
export const DeckChair: React.FC<{ p: V3; yaw?: number }> = ({ p, yaw = 0 }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <mesh geometry={rbox(0.7, 0.05, 0.6, 0.02)} material={plastic("#2fd0bd", { rough: 0.5 })} position={[0, 0.3, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(0.7, 0.7, 0.05, 0.02)} material={plastic("#2fd0bd", { rough: 0.5 })} position={[0, 0.6, -0.36]} rotation={[-0.35, 0, 0]} castShadow />
    {[-1, 1].map((k) => (
      <mesh key={k} geometry={rbox(0.05, 0.3, 0.6, 0.01)} material={plastic("#f4f4f2", { rough: 0.5 })} position={[k * 0.33, 0.15, 0]} castShadow />
    ))}
  </group>
);

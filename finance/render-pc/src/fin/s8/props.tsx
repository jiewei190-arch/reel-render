// S8 four-money-minds: props for the stacked-lanes Short (our own designs, no logos, no brands, no game IP).
// Everything is a pure function of its props (seeded hashes only, no clocks). Units: metres, +y up, +z toward the lens.
//   Envelope ($1,000 BONUS), ShoeBox, Headset, FoodBag, SavingsJar, FundBox (INDEX FUND), LineChart, DebtBoard (CREDIT CARD
//   $1,000 22% APR, cracks), Shard / GoldBrick, MoneyHammer (its head is the cash brick), Crown, Hater (faceless grey
//   blocky figure with a taunt sign that can flip to its back text), Coupon (thrown sale tags).
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../../blocky/mat";
import type { V3 } from "../../blocky/motion";
import { clamp } from "../../blocky/motion";
import { textTex } from "../../library/props";

export const Bx: React.FC<{ s: V3; p?: V3; c: string; r?: V3; e?: [string, number]; rough?: number; shadow?: boolean; op?: number; round?: number }> = ({ s, p = [0, 0, 0], c, r = [0, 0, 0], e, rough = 0.5, shadow = true, op, round = 0.12 }) => (
  <mesh
    geometry={rbox(s[0], s[1], s[2], Math.min(s[0], s[1], s[2]) * round)}
    material={plastic(c, { rough, emissive: e?.[0], ei: e?.[1], transparent: op !== undefined && op < 1, opacity: op ?? 1 })}
    position={p}
    rotation={r}
    castShadow={shadow}
    receiveShadow={shadow}
  />
);
/** a text face (front +z) on a plane of w x h, canvas text in Poppins */
export const TextFace: React.FC<{ p?: V3; r?: V3; w: number; h: number; lines: string[]; fg: string; bg?: string; border?: string; glow?: number; px?: number; side?: THREE.Side }> = ({ p = [0, 0, 0], r = [0, 0, 0], w, h, lines, fg, bg, border, glow = 0, px, side }) => {
  const H = Math.max(64, Math.round((512 * h) / w));
  return (
    <mesh position={p} rotation={r} geometry={geoOf(`tf${w.toFixed(3)}|${h.toFixed(3)}`, () => new THREE.PlaneGeometry(w, h))} material={plastic("#ffffff", { decal: true, rough: 0.6, map: textTex(`s8|${lines.join("/")}|${fg}|${bg ?? ""}|${border ?? ""}|${px ?? 0}|${H}`, lines, { w: 512, h: H, fg, bg, border, px }), emissive: glow ? "#ffffff" : undefined, ei: glow, side })} />
  );
};

// ------------------------------------------------------------------ envelope
/** an upright envelope (origin at its bottom centre, front +z). open 0..1 flips the flap up and back. */
export const Envelope: React.FC<{ p: V3; open?: number; sq?: number; s?: number }> = ({ p, open = 0, sq = 0, s = 1 }) => {
  const w = 0.56, h = 0.38, d = 0.05;
  const flap = geoOf("s8flap", () => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(0, -0.22);
    sh.lineTo(-w / 2, 0);
    return new THREE.ShapeGeometry(sh);
  });
  return (
    <group position={p} scale={[s * (1 + 0.18 * sq), s * (1 - 0.25 * sq), s]}>
      <Bx s={[w, h, d]} p={[0, h / 2, 0]} c="#f4e7c4" rough={0.75} round={0.06} />
      <TextFace p={[0, 0.115, d / 2 + 0.004]} w={0.46} h={0.17} lines={["$1,000", "BONUS"]} fg="#178a45" px={58} />
      <group position={[0, h - 0.004, d / 2 + 0.006]} rotation={[-open * Math.PI * 0.92, 0, 0]}>
        <mesh geometry={flap} material={plastic("#e8d6a6", { rough: 0.7, side: THREE.DoubleSide })} castShadow />
        <mesh geometry={geoOf("s8seal", () => new THREE.CircleGeometry(0.035, 20))} material={plastic("#d62a2a", { rough: 0.4 })} position={[0, -0.17, 0.003]} />
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ spender's buys
export const ShoeBox: React.FC<{ p: V3; color: string; r?: V3; s?: number }> = ({ p, color, r = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <Bx s={[0.5, 0.17, 0.3]} p={[0, 0.085, 0]} c={color} rough={0.6} />
    <Bx s={[0.53, 0.06, 0.33]} p={[0, 0.19, 0]} c="#f4f4f2" rough={0.55} />
    <Bx s={[0.34, 0.035, 0.005]} p={[0, 0.09, 0.152]} c="#ffffff" rough={0.6} shadow={false} />
  </group>
);
export const Headset: React.FC<{ p: V3; r?: V3; s?: number }> = ({ p, r = [0, 0, 0], s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <mesh geometry={geoOf("s8band", () => new THREE.TorusGeometry(0.15, 0.026, 10, 28, Math.PI))} material={plastic("#7a3ae0", { rough: 0.4 })} position={[0, 0.1, 0]} castShadow />
    {[-1, 1].map((k) => (
      <group key={k} position={[k * 0.15, 0.08, 0]}>
        <mesh geometry={geoOf("s8cup", () => new THREE.CylinderGeometry(0.075, 0.075, 0.07, 22))} material={plastic("#2a1f40", { rough: 0.4 })} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow />
        <mesh geometry={geoOf("s8cupRing", () => new THREE.TorusGeometry(0.06, 0.012, 8, 22))} material={plastic("#5ff0ff", { emissive: "#5ff0ff", ei: 2.2 })} position={[k * 0.037, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    ))}
  </group>
);
export const FoodBag: React.FC<{ p: V3; r?: V3; s?: number; label?: string }> = ({ p, r = [0, 0, 0], s = 1, label = "FOOD" }) => (
  <group position={p} rotation={r} scale={s}>
    <Bx s={[0.24, 0.28, 0.16]} p={[0, 0.14, 0]} c="#c8945a" rough={0.85} />
    <Bx s={[0.245, 0.05, 0.165]} p={[0, 0.27, 0]} c="#e0b07a" rough={0.85} />
    <mesh geometry={geoOf("s8handle", () => new THREE.TorusGeometry(0.06, 0.01, 6, 16, Math.PI))} material={plastic("#8a5a2a", { rough: 0.7 })} position={[0, 0.29, 0]} />
    <TextFace p={[0, 0.13, 0.083]} w={0.2} h={0.08} lines={[label]} fg="#d62a2a" />
  </group>
);

// ------------------------------------------------------------------ saver's jar
/** a big glass SAVINGS jar (origin = base centre). fill 0..1 = the gold level inside. gleam 0..1 = a highlight pulse. */
export const SavingsJar: React.FC<{ p: V3; fill: number; gleam?: number }> = ({ p, fill, gleam = 0 }) => {
  const R = 0.27, H = 0.66;
  const glass = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#a8d8f0", roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.16, depthWrite: false }), []);
  const f = clamp(fill);
  const fh = Math.max(0.001, f * (H - 0.08));
  return (
    <group position={p}>
      <mesh geometry={geoOf("s8jarFill", () => new THREE.CylinderGeometry(R * 0.9, R * 0.9, 1, 32))} material={plastic("#f0c040", { rough: 0.3, emissive: "#c88a10", ei: 0.45 + 0.9 * gleam })} position={[0, 0.02 + fh / 2, 0]} scale={[1, fh, 1]} castShadow />
      {f > 0.05
        ? [0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} geometry={geoOf("s8jarCoin", () => new THREE.CylinderGeometry(0.06, 0.06, 0.016, 20))} material={plastic("#ffd84a", { rough: 0.3, emissive: "#c88a10", ei: 0.4 })} position={[Math.cos(i * 1.3) * 0.14, 0.03 + fh, Math.sin(i * 1.3) * 0.12]} rotation={[0.25 * Math.sin(i * 2.1), 0, 0.3 * Math.cos(i * 1.7)]} />
          ))
        : null}
      <mesh geometry={geoOf("s8jarWall", () => new THREE.CylinderGeometry(R, R, H, 48, 1, true))} material={glass} position={[0, H / 2, 0]} renderOrder={3} />
      <mesh geometry={geoOf("s8jarRim", () => new THREE.TorusGeometry(R, 0.014, 8, 48))} material={plastic("#e8f6ff", { rough: 0.1, transparent: true, opacity: 0.7 })} position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geoOf("s8jarBase", () => new THREE.CylinderGeometry(R, R * 0.97, 0.03, 48))} material={plastic("#cfe8f4", { rough: 0.1, transparent: true, opacity: 0.5 })} position={[0, 0.015, 0]} />
      {[-0.6, -0.4].map((a, i) => (
        <mesh key={i} geometry={geoOf(`s8jarStreak${i}`, () => new THREE.PlaneGeometry(i ? 0.02 : 0.045, H * 0.8))} material={plastic("#ffffff", { transparent: true, opacity: (i ? 0.3 : 0.45) + 0.4 * gleam, emissive: "#ffffff", ei: 0.3 + gleam })} position={[Math.sin(a) * (R + 0.003), H * 0.5, Math.cos(a) * (R + 0.003)]} rotation={[0, a, 0]} renderOrder={4} />
      ))}
      <mesh geometry={geoOf("s8jarLabel", () => new THREE.CylinderGeometry(R + 0.004, R + 0.004, 0.2, 48, 1, true, -0.62, 1.24))} material={plastic("#fff6dc", { rough: 0.7, map: textTex("s8jarlabel", ["SAVINGS", "4% APY"], { w: 512, h: 200, bg: "#fff6dc", fg: "#178a45", px: 84 }) })} position={[0, 0.3, 0]} renderOrder={5} />
    </group>
  );
};

// ------------------------------------------------------------------ investor's fund box + chart
/** a sturdy crate labelled INDEX FUND (origin = base centre). lid 0..1 opens the lid backward. */
export const FundBox: React.FC<{ p: V3; lid?: number; glow?: number }> = ({ p, lid = 0, glow = 0 }) => (
  <group position={p}>
    <Bx s={[0.64, 0.44, 0.42]} p={[0, 0.22, 0]} c="#1f5fc0" rough={0.5} e={["#3a8fff", 0.15 + glow]} />
    <Bx s={[0.66, 0.05, 0.44]} p={[0, 0.03, 0]} c="#16306a" rough={0.5} />
    <TextFace p={[0, 0.235, 0.214]} w={0.56} h={0.2} lines={["INDEX", "FUND"]} fg="#ffffff" px={70} />
    <group position={[0, 0.44, -0.21]} rotation={[-lid * 1.9, 0, 0]}>
      <Bx s={[0.68, 0.06, 0.44]} p={[0, 0.03, 0.22]} c="#2a76e0" rough={0.45} />
    </group>
  </group>
);
/** a board on legs with a block line chart: values (any units) between lo and hi, `draw` = how many points are shown
 *  (fractional = the last segment grows). Points below `redBelow` turn red. */
export const LineChart: React.FC<{ p: V3; values: number[]; lo: number; hi: number; draw: number; redBelow: number; flash?: number; w?: number; h?: number }> = ({ p, values, lo, hi, draw, redBelow, flash = 0, w = 1.1, h = 0.78 }) => {
  const n = values.length;
  const x0 = -w * 0.42, x1 = w * 0.42;
  const y0 = 0.14, y1 = h - 0.12;
  const pt = (i: number): [number, number] => [x0 + ((x1 - x0) * i) / (n - 1), y0 + ((values[i] - lo) / (hi - lo)) * (y1 - y0)];
  const segs: React.ReactNode[] = [];
  const shown = clamp(draw, 0, n - 1);
  for (let i = 0; i < Math.ceil(shown); i++) {
    const u = Math.min(1, shown - i);
    const [ax, ay] = pt(i);
    const [bx0, by0] = pt(i + 1);
    const bx = ax + (bx0 - ax) * u, by = ay + (by0 - ay) * u;
    const len = Math.hypot(bx - ax, by - ay);
    const red = values[i + 1] < redBelow || values[i] < redBelow;
    const col = red ? "#ff3b3b" : "#3fe08a";
    segs.push(<Bx key={i} s={[Math.max(0.01, len), 0.035, 0.03]} p={[(ax + bx) / 2, (ay + by) / 2, 0.035]} r={[0, 0, Math.atan2(by - ay, bx - ax)]} c={col} e={[col, 1.6]} shadow={false} round={0.3} />);
  }
  const k = Math.floor(shown);
  const [hx, hy] = (() => {
    const [ax, ay] = pt(k);
    if (k >= n - 1) return [ax, ay];
    const [bx, by] = pt(k + 1);
    const u = shown - k;
    return [ax + (bx - ax) * u, ay + (by - ay) * u];
  })();
  const lastRed = values[Math.min(n - 1, Math.ceil(shown))] < redBelow;
  return (
    <group position={p}>
      {[-1, 1].map((s) => (
        <Bx key={s} s={[0.05, 0.62, 0.05]} p={[s * (w / 2 - 0.1), 0.31, -0.03]} c="#3a3f58" />
      ))}
      <group position={[0, 0.55, 0]}>
        <Bx s={[w + 0.08, h + 0.08, 0.05]} p={[0, h / 2, -0.03]} c="#3a3f58" />
        <Bx s={[w, h, 0.03]} p={[0, h / 2, 0]} c={flash > 0 ? "#3a0e14" : "#0e1a2a"} rough={0.85} e={["#ff2a2a", flash * 0.8]} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={geoOf(`s8grid${w}`, () => new THREE.PlaneGeometry(w * 0.88, 0.006))} material={plastic("#ffffff", { transparent: true, opacity: 0.16 })} position={[0, y0 + (i * (y1 - y0)) / 3, 0.017]} />
        ))}
        {/* the start line ($1,000) */}
        <mesh geometry={geoOf(`s8base${w}`, () => new THREE.PlaneGeometry(w * 0.88, 0.012))} material={plastic("#ffffff", { transparent: true, opacity: 0.45 })} position={[0, pt(0)[1], 0.018]} />
        {segs}
        <mesh geometry={geoOf("s8dot", () => new THREE.SphereGeometry(0.035, 14, 10))} material={plastic(lastRed ? "#ff3b3b" : "#3fe08a", { emissive: lastRed ? "#ff3b3b" : "#3fe08a", ei: 2.4 })} position={[hx, hy, 0.05]} />
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ debt killer's board, shards, gold wall
const crackTex = (level: number) =>
  canvasTexture(`s8crack${level}`, 512, 368, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = "#fff4e0";
    g.lineCap = "round";
    g.lineJoin = "round";
    const lines: [number, number][][] = [
      [[0.18, 0.45], [0.3, 0.38], [0.36, 0.2], [0.44, 0.05]],
      [[0.18, 0.45], [0.33, 0.55], [0.4, 0.78], [0.5, 0.95]],
      [[0.18, 0.45], [0.05, 0.3]],
    ];
    if (level > 1) {
      lines.push([[0.3, 0.38], [0.55, 0.42], [0.72, 0.3], [0.95, 0.25]], [[0.33, 0.55], [0.6, 0.62], [0.8, 0.8]], [[0.55, 0.42], [0.62, 0.1]], [[0.6, 0.62], [0.9, 0.55]]);
    }
    for (const l of lines) {
      g.lineWidth = level > 1 ? 9 : 7;
      g.beginPath();
      l.forEach(([x, y], i) => (i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)));
      g.stroke();
    }
  });
export const BOARD = { w: 1.0, h: 0.72, y0: 0.34 };
/** the red CREDIT CARD board on two legs (origin = floor centre). crack 0/1/2, shake = a small wobble angle. */
export const DebtBoard: React.FC<{ p: V3; crack: number; shake?: number; glow?: number }> = ({ p, crack, shake = 0, glow = 1 }) => (
  <group position={p} rotation={[0, 0, shake]}>
    {[-1, 1].map((s) => (
      <Bx key={s} s={[0.05, BOARD.y0 + 0.1, 0.05]} p={[s * (BOARD.w / 2 - 0.12), (BOARD.y0 + 0.1) / 2, -0.03]} c="#3a3f58" />
    ))}
    <group position={[0, BOARD.y0 + BOARD.h / 2, 0]}>
      <Bx s={[BOARD.w + 0.06, BOARD.h + 0.06, 0.06]} p={[0, 0, -0.01]} c="#5a0c12" e={["#ff2a2a", 0.25 * glow]} />
      <Bx s={[BOARD.w, BOARD.h, 0.04]} c="#c41e2a" e={["#ff2a2a", 0.35 * glow]} />
      <TextFace p={[0, 0.02, 0.026]} w={BOARD.w * 0.92} h={BOARD.h * 0.86} lines={["CREDIT CARD", "$1,000", "22% APR"]} fg="#ffffff" px={92} glow={0.25} />
      {crack > 0 ? (
        <mesh geometry={geoOf("s8crackPlane", () => new THREE.PlaneGeometry(BOARD.w, BOARD.h))} material={plastic("#ffffff", { decal: true, map: crackTex(crack > 1 ? 2 : 1), emissive: "#fff0c0", ei: 0.8 })} position={[0, 0, 0.03]} />
      ) : null}
    </group>
  </group>
);
/** board shard grid (4 x 3) -> gold brick wall (4 x 3). Shard i's home on the board and its slot in the wall. */
export const SHARD = { cols: 4, rows: 3 };
export const shardHome = (i: number): V3 => {
  const c = i % SHARD.cols, r = Math.floor(i / SHARD.cols);
  return [(c - 1.5) * (BOARD.w / SHARD.cols), BOARD.y0 + BOARD.h - (r + 0.5) * (BOARD.h / SHARD.rows), 0];
};
export const BRICK = { w: 0.3, h: 0.19, d: 0.24 };
export const brickSlot = (i: number): V3 => {
  const c = i % SHARD.cols, r = SHARD.rows - 1 - Math.floor(i / SHARD.cols);
  return [(c - 1.5) * (BRICK.w + 0.015) + (r % 2 ? 0.07 : 0), BRICK.h / 2 + r * (BRICK.h + 0.012), 0];
};
/** a piece in flight: gold 0..1 lerps red shard -> gold brick (size and colour) */
export const Shard: React.FC<{ p: V3; r: V3; gold: number; glow?: number }> = ({ p, r, gold, glow = 0 }) => {
  const g = clamp(gold);
  const s: V3 = [BOARD.w / SHARD.cols - 0.03 + (BRICK.w - BOARD.w / SHARD.cols + 0.03) * g, BOARD.h / SHARD.rows - 0.03 + (BRICK.h - BOARD.h / SHARD.rows + 0.03) * g, 0.04 + (BRICK.d - 0.04) * g];
  const col = g < 0.5 ? "#b01822" : "#e8a818";
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh geometry={rbox(1, 1, 1, 0.12)} material={plastic(col, { rough: 0.28, emissive: g < 0.5 ? "#ff2020" : "#c87808", ei: (g < 0.5 ? 0.12 : 0.22) + 0.5 * glow })} castShadow receiveShadow />
      {g >= 0.5 ? <mesh geometry={rbox(0.9, 0.08, 1.02, 0.03)} material={plastic("#ffe27a", { rough: 0.2, emissive: "#ffb020", ei: 0.3 + 0.6 * glow })} position={[0, 0.46, 0]} /> : null}
    </group>
  );
};

// ------------------------------------------------------------------ the money hammer, the crown
/** the debt killer's hammer: a wooden handle (grip at the origin, up +y) and a head that is a green cash brick */
export const MoneyHammer: React.FC<{ s?: number; glow?: number }> = ({ s = 1, glow = 0 }) => (
  <group scale={s}>
    <mesh geometry={geoOf("s8handleH", () => new THREE.CylinderGeometry(0.024, 0.028, 0.5, 12))} material={plastic("#8a5a2a", { rough: 0.6 })} position={[0, 0.17, 0]} castShadow />
    <group position={[0, 0.44, 0]}>
      <Bx s={[0.26, 0.15, 0.15]} c="#3fb86a" rough={0.7} e={["#3fe08a", glow]} />
      <Bx s={[0.06, 0.155, 0.155]} c="#fff4c8" rough={0.8} />
      <Bx s={[0.03, 0.17, 0.17]} p={[0.13, 0, 0]} c="#f0c040" rough={0.3} />
      <Bx s={[0.03, 0.17, 0.17]} p={[-0.13, 0, 0]} c="#f0c040" rough={0.3} />
    </group>
  </group>
);
/** a gold crown (origin = its base centre) */
export const Crown: React.FC<{ p: V3; s?: number; r?: V3 }> = ({ p, s = 1, r = [0, 0, 0] }) => (
  <group position={p} scale={s} rotation={r}>
    <mesh geometry={geoOf("s8crownRing", () => new THREE.CylinderGeometry(0.17, 0.16, 0.1, 5, 1, true))} material={plastic("#f0c040", { rough: 0.25, emissive: "#c88a10", ei: 0.6, side: THREE.DoubleSide })} position={[0, 0.05, 0]} castShadow />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 5;
      return (
        <group key={i}>
          <mesh geometry={geoOf("s8crownSpike", () => new THREE.ConeGeometry(0.05, 0.12, 4))} material={plastic("#f0c040", { rough: 0.25, emissive: "#c88a10", ei: 0.6 })} position={[Math.sin(a) * 0.155, 0.15, Math.cos(a) * 0.155]} castShadow />
          <mesh geometry={geoOf("s8crownGem", () => new THREE.SphereGeometry(0.022, 10, 8))} material={plastic(i % 2 ? "#ff3b5a" : "#3fe0ff", { emissive: i % 2 ? "#ff3b5a" : "#3fe0ff", ei: 1.2 })} position={[Math.sin(a) * 0.172, 0.05, Math.cos(a) * 0.172]} />
        </group>
      );
    })}
  </group>
);

// ------------------------------------------------------------------ haters
export const HATER_COLS = [
  { body: "#d9dce4", limb: "#b4b9c6", head: "#eceef3" },
  { body: "#c4c9d4", limb: "#9fa5b4", head: "#dcdfe7" },
  { body: "#eef0f4", limb: "#c8ccd6", head: "#f7f8fa" },
  { body: "#b8bdc9", limb: "#959baa", head: "#d2d6df" },
];
export type HaterPose = {
  x: number;
  z: number;
  yaw: number;
  /** body lean back (rad, + = falls back away from its facing) and a sideways slide already in x */
  lean?: number;
  /** right (throwing) arm forward raise (rad) */
  throwArm?: number;
  /** left (sign) arm extra raise (rad) and the sign's own wobble (rad) */
  signLift?: number;
  signWob?: number;
  /** 0 = sign front, 1 = turned round to its back text */
  flip?: number;
  hop?: number;
};
/** a faceless grey blocky figure (origin = feet), left hand holds a sign on a pole above its head, right arm throws */
export const Hater: React.FC<{ pose: HaterPose; sign: string; back?: string; col: number; s?: number }> = ({ pose, sign, back, col, s = 0.85 }) => {
  const C = HATER_COLS[col % HATER_COLS.length];
  const { x, z, yaw, lean = 0, throwArm = 0, signLift = 0, signWob = 0, flip = 0, hop = 0 } = pose;
  return (
    <group position={[x, hop, z]} rotation={[0, yaw, 0]} scale={s}>
      <group rotation={[-lean, 0, 0]}>
        {[-1, 1].map((k) => (
          <Bx key={k} s={[0.14, 0.42, 0.15]} p={[k * 0.08, 0.21, 0]} c={C.limb} rough={0.6} />
        ))}
        <Bx s={[0.38, 0.42, 0.2]} p={[0, 0.63, 0]} c={C.body} rough={0.55} />
        <Bx s={[0.28, 0.29, 0.26]} p={[0, 1.0, 0]} c={C.head} rough={0.5} round={0.2} />
        {/* left arm up holding the pole */}
        <group position={[0.25, 0.8, 0]} rotation={[-(2.5 + signLift), 0, 0]}>
          <Bx s={[0.11, 0.38, 0.12]} p={[0, -0.17, 0]} c={C.limb} rough={0.6} />
        </group>
        {/* the sign: pole from the raised left hand, board above the head */}
        <group position={[0.25, 1.08 + 0.12 * signLift, 0.06]} rotation={[0, flip * Math.PI, signWob]}>
          <Bx s={[0.03, 0.42, 0.03]} p={[0, 0.16, 0]} c="#7a5a3a" />
          <group position={[0, 0.46, 0]}>
            <Bx s={[0.66, 0.3, 0.03]} c="#fffaf0" rough={0.7} />
            <TextFace p={[0, 0, 0.017]} w={0.62} h={0.26} lines={[sign]} fg="#d62a2a" px={sign.length > 9 ? 84 : 100} />
            {back ? <TextFace p={[0, 0, -0.017]} r={[0, Math.PI, 0]} w={0.62} h={0.26} lines={[back]} fg="#178a45" px={100} /> : null}
          </group>
        </group>
        {/* right arm: rests down, swings forward to throw */}
        <group position={[-0.25, 0.8, 0]} rotation={[-throwArm, 0, -0.08]}>
          <Bx s={[0.11, 0.38, 0.12]} p={[0, -0.17, 0]} c={C.limb} rough={0.6} />
        </group>
      </group>
    </group>
  );
};
/** a thrown sale tag / coupon card (yellow card, red text) */
export const COUPON_TEXT = ["SALE", "50% OFF", "COUPON", "BUY NOW", "-70%"];
export const Coupon: React.FC<{ p: V3; r: V3; text: string; s?: number }> = ({ p, r, text, s = 1 }) => (
  <group position={p} rotation={r} scale={s}>
    <Bx s={[0.2, 0.11, 0.008]} c="#ffd23a" rough={0.6} round={0.2} />
    <TextFace p={[0, 0, 0.0055]} w={0.19} h={0.1} lines={[text]} fg="#d62a2a" />
    <TextFace p={[0, 0, -0.0055]} r={[0, Math.PI, 0]} w={0.19} h={0.1} lines={[text]} fg="#d62a2a" />
  </group>
);

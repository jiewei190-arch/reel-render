// tech3d sets. Each one keeps moving (drifting shapes, a scanning grid, clouds and sequenced approach lights), so no
// frame is ever static even on a slow push.
//   studio     a clean light cyclorama (floor curving up into the back wall), soft shadow, floating pastel shapes
//   blueprint  a blue grid floor with a scan line, dimension marks, deep blue fog
//   sky        a low-poly outdoor set: sky dome, drifting clouds, grass and hills, a runway with markings, edge and
//              sequenced approach lights, the ILS localizer array at the far end and the glideslope mast by the
//              touchdown zone
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { TP } from "./palette";

export type TechSetId = "studio" | "blueprint" | "sky";
export type TechSet = {
  id: TechSetId;
  bg: string;
  mood: TechSetId;
  anchors: Record<string, V3>;
  /** static QA boxes (no BOLT / prop may enter them) */
  blockers: { name: string; c: V3; h: V3 }[];
  render: (t: number, o?: { fog?: boolean }) => React.ReactNode;
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const basic = new Map<string, THREE.MeshBasicMaterial>();
const bmat = (c: string, o = 1, tex?: THREE.Texture) => { const k = `${c}|${o}|${tex?.uuid ?? ""}`; let m = basic.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1, map: tex ?? null, toneMapped: false }); basic.set(k, m); } return m; };
const PLANE = () => geoOf("tsPlane", () => new THREE.PlaneGeometry(1, 1));

// ------------------------------------------------------------------ studio cyclorama
const bgDome = (c: string) => { const m = bmat(c, 1); m.side = THREE.BackSide; m.fog = false; m.depthWrite = false; return <mesh geometry={geoOf("tsBgDome", () => new THREE.SphereGeometry(300, 16, 10))} material={m} />; };
/** a floor that curves up into the back wall: a plane bent along a profile (z, y), width along x */
const coveGeo = () => geoOf("tsCove", () => {
  const W = 240, R = 5, zBack = -7, zFront = 30;
  const prof: [number, number][] = [];
  for (let k = 0; k <= 16; k++) prof.push([zFront - (k / 16) * (zFront - (zBack + R)), 0]);
  for (let k = 1; k <= 14; k++) { const a = (k / 14) * (Math.PI / 2); prof.push([zBack + R - R * Math.sin(a), R - R * Math.cos(a)]); }
  for (let k = 1; k <= 6; k++) prof.push([zBack, R + (k / 6) * 30]);
  const pos: number[] = [], idx: number[] = [], uv: number[] = [];
  prof.forEach(([z, y], i) => { for (const x of [-W / 2, W / 2]) { pos.push(x, y, z); uv.push(x > 0 ? 1 : 0, i / prof.length); } });
  for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
});
const FLOATERS = Array.from({ length: 14 }, (_, k) => ({
  x: -9 + 18 * hash(k + 1), y: 1.2 + 6 * hash(k + 7), z: -6.2 + 1.2 * hash(k + 3) - (k % 3) * 0.4,
  r: 0.25 + 0.45 * hash(k + 13), kind: k % 3, col: [TP.blueSoft, "#BDF2DA", "#FFD2B3"][k % 3], sp: 0.2 + 0.4 * hash(k + 5),
}));
const studio: TechSet = {
  id: "studio", bg: TP.bg, mood: "studio",
  anchors: { centre: [0, 0, 0], stage: [0, 0, 0], left: [-2.2, 0, 0.3], right: [2.2, 0, 0.3], back: [0, 0, -2.5], front: [0, 0, 1.6], high: [0, 2.2, 0] },
  blockers: [],
  render: (t) => (
    <>
      {bgDome("#EEF2F8")}
      <mesh geometry={coveGeo()} material={plastic("#F2F5FA", { rough: 0.95 })} receiveShadow />
      {/* a soft blue disc stage under the subject */}
      <mesh geometry={geoOf("tsDisc", () => new THREE.CylinderGeometry(2.6, 2.75, 0.06, 40))} material={plastic("#E4ECF7", { rough: 0.8 })} position={[0, 0.03, 0]} receiveShadow />
      <mesh geometry={geoOf("tsRing", () => new THREE.TorusGeometry(2.68, 0.025, 6, 64))} material={plastic(TP.blue, { rough: 0.4, emissive: TP.blue, ei: 0.25 })} position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, t * 0.2]} />
      {/* floating pastel shapes on the back wall: they drift and turn (nothing is static) */}
      {FLOATERS.map((f, k) => (
        <mesh key={k} geometry={geoOf(`tsFloat${f.kind}`, () => (f.kind === 0 ? new THREE.IcosahedronGeometry(1, 0) : f.kind === 1 ? new THREE.TorusGeometry(0.8, 0.28, 6, 12) : new THREE.OctahedronGeometry(1, 0)))}
          material={plastic(f.col, { rough: 0.6, flat: true })} position={[f.x + 0.3 * Math.sin(t * f.sp + k), f.y + 0.25 * Math.sin(t * f.sp * 1.3 + k * 2), f.z]} rotation={[t * f.sp * 0.7 + k, t * f.sp + k * 0.5, 0]} scale={f.r} />
      ))}
    </>
  ),
};

// ------------------------------------------------------------------ blueprint
const gridTex = () => canvasTexture("tsGrid", 512, 512, (g, W, H) => {
  g.fillStyle = "#2563C9"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(220,235,255,0.28)"; g.lineWidth = 2;
  for (let k = 0; k <= 16; k++) { const v = (k * W) / 16; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, H); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
  g.strokeStyle = "rgba(235,245,255,0.6)"; g.lineWidth = 4;
  for (let k = 0; k <= 4; k++) { const v = (k * W) / 4; g.beginPath(); g.moveTo(v, 0); g.lineTo(v, H); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
});
const gridMat = () => {
  const tx = gridTex();
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  tx.repeat.set(20, 20);
  tx.needsUpdate = true;
  return plastic("#ffffff", { rough: 0.9, map: tx });
};
const blueprint: TechSet = {
  id: "blueprint", bg: "#1D4F9E", mood: "blueprint",
  anchors: { centre: [0, 0, 0], stage: [0, 0, 0], left: [-2.2, 0, 0.3], right: [2.2, 0, 0.3], back: [0, 0, -2.5], front: [0, 0, 1.6], high: [0, 2.2, 0] },
  blockers: [],
  render: (t) => {
    const scan = ((t * 2.2) % 16) - 8;
    return (
      <>
        {bgDome("#1D4F9E")}
        <mesh geometry={PLANE()} material={gridMat()} rotation={[-Math.PI / 2, 0, 0]} scale={[80, 80, 1]} receiveShadow />
        {/* the scan line sweeping across the floor */}
        <mesh geometry={PLANE()} material={bmat("#9fd0ff", 0.35)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, scan]} scale={[40, 0.35, 1]} />
        <mesh geometry={PLANE()} material={bmat("#ffffff", 0.55)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, scan]} scale={[40, 0.06, 1]} />
        {/* dimension marks: little crosses and ticks drifting up in the back */}
        {Array.from({ length: 22 }, (_, k) => {
          const x = -10 + 20 * hash(k + 2), z = -4 - 8 * hash(k + 9), y = ((hash(k + 4) * 7 + t * 0.25 * (0.5 + hash(k))) % 7) + 0.3;
          return (
            <group key={k} position={[x, y, z]} rotation={[0, 0, t * 0.3 + k]}>
              <mesh geometry={PLANE()} material={bmat("#cfe4ff", 0.7)} scale={[0.32, 0.04, 1]} />
              <mesh geometry={PLANE()} material={bmat("#cfe4ff", 0.7)} scale={[0.04, 0.32, 1]} />
            </group>
          );
        })}
        {/* a back panel so the frame never shows empty fog */}
        <mesh geometry={PLANE()} material={bmat("#2a63bf", 1)} position={[0, 10, -22]} scale={[90, 30, 1]} />
      </>
    );
  },
};

// ------------------------------------------------------------------ sky + runway
const skyTex = () => canvasTexture("tsSky", 8, 256, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#5D9DF0"); gr.addColorStop(0.42, "#A9CFFA"); gr.addColorStop(0.5, "#E6F1FF"); gr.addColorStop(1, "#E6F1FF");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
});
const runwayTex = () => canvasTexture("tsRunway", 128, 2048, (g, W, H) => {
  // 128 px = 8 m wide; 2048 px = 128 m long (16 px / m); the threshold at the BOTTOM (v = 0, near the lens side)
  g.fillStyle = "#4A5466"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#f4f7fb";
  g.fillRect(4, 0, 3, H); g.fillRect(W - 7, 0, 3, H); // edge lines
  for (let k = 0; k < 8; k++) g.fillRect(14 + k * 13 + (k >= 4 ? 4 : 0), H - 60, 8, 50); // threshold "piano keys"
  for (let y = H - 120; y > 40; y -= 64) g.fillRect(W / 2 - 2, y - 32, 4, 32); // centreline dashes
  for (const s of [-1, 1]) g.fillRect(W / 2 + s * 30 - 8, H - 330, 16, 70); // aiming point
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) g.fillRect(W / 2 + s * (20 + k * 9) - 3, H - 200, 6, 36); // touchdown zone
});
const CLOUDS = Array.from({ length: 12 }, (_, k) => ({ x: -60 + 120 * hash(k + 21), y: 14 + 16 * hash(k + 5), z: -30 - 90 * hash(k + 8), s: 3 + 4 * hash(k + 2), sp: 0.4 + 0.6 * hash(k + 9) }));
const HILLS = Array.from({ length: 16 }, (_, k) => ({ x: (k % 2 ? 1 : -1) * (22 + 40 * hash(k + 3)), z: -20 - 140 * hash(k + 6), s: 6 + 10 * hash(k + 1), c: k % 3 ? "#8FCB7E" : "#7DBD72" }));
const TREES = Array.from({ length: 26 }, (_, k) => ({ x: (k % 2 ? 1 : -1) * (12 + 14 * hash(k + 31)), z: 25 - 160 * hash(k + 17), s: 0.8 + 0.8 * hash(k + 2) }));
/** runway: x in [-4, 4], threshold at z = 0, the far end at z = -RW_LEN */
export const RW_LEN = 128;
const sky: TechSet = {
  id: "sky", bg: "#A9CFFA", mood: "sky",
  anchors: {
    centre: [0, 0, 0], threshold: [0, 0, 0], touchdown: [0, 0, -14], rollout: [0, 0, -40], farEnd: [0, 0, -RW_LEN],
    loc: [0, 0, -RW_LEN - 6], gs: [7, 0, -16], approach: [0, 7, 70], final: [0, 3.4, 36], short: [0, 1.6, 14],
    left: [-6, 0, 2], right: [6, 0, 2], side: [9, 0, -6], high: [0, 12, 30],
  },
  blockers: [{ name: "set.gsMast", c: [7, 2.4, -16], h: [0.4, 2.4, 0.4] }, { name: "set.locArray", c: [0, 0.8, -RW_LEN - 6], h: [5.4, 0.8, 0.5] }],
  render: (t, o) => (
    <>
      <mesh geometry={geoOf("tsSkyDome", () => new THREE.SphereGeometry(400, 24, 16))} material={(() => { const m = o?.fog ? bmat("#dfe6ee", 1) : bmat("#ffffff", 1, skyTex()); m.side = THREE.BackSide; m.fog = false; m.depthWrite = false; return m; })()} position={[0, 0, 0]} />
      {/* ground: grass with low-poly hills and trees */}
      <mesh geometry={PLANE()} material={plastic("#A6D98F", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} scale={[900, 900, 1]} receiveShadow />
      {HILLS.map((h, k) => <mesh key={`h${k}`} geometry={geoOf("tsHill", () => new THREE.IcosahedronGeometry(1, 1))} material={plastic(h.c, { rough: 1, flat: true })} position={[h.x, -h.s * 0.55, h.z]} scale={[h.s * 1.6, h.s, h.s]} receiveShadow />)}
      {TREES.map((tr, k) => (
        <group key={`t${k}`} position={[tr.x, 0, tr.z]} scale={tr.s} rotation={[0, 0, 0.03 * Math.sin(t * 1.3 + k)]}>
          <mesh geometry={geoOf("tsTrunk", () => new THREE.CylinderGeometry(0.12, 0.16, 0.8, 6))} material={plastic("#8A6A4A", { flat: true })} position={[0, 0.4, 0]} castShadow />
          <mesh geometry={geoOf("tsCrown", () => new THREE.ConeGeometry(0.9, 2.2, 7))} material={plastic("#4FAE6E", { flat: true })} position={[0, 1.8, 0]} castShadow />
        </group>
      ))}
      {/* runway + shoulders */}
      <mesh geometry={PLANE()} material={plastic("#C9D3C0", { rough: 1 })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -RW_LEN / 2]} scale={[12, RW_LEN + 8, 1]} receiveShadow />
      <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.95, map: runwayTex() })} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -RW_LEN / 2]} scale={[8, RW_LEN, 1]} receiveShadow />
      {/* edge lights every 8 m (soft twinkle) */}
      {Array.from({ length: 17 }, (_, k) => [-4.3, 4.3].map((x) => (
        <mesh key={`e${k}${x}`} geometry={geoOf("tsLamp", () => new THREE.SphereGeometry(0.09, 6, 4))} material={bmat(k === 0 ? TP.mint : "#fff6d6", 1)} position={[x, 0.09, -k * 8]} scale={1 + 0.25 * Math.sin(t * 6 + k)} />
      )))}
      {/* approach lights: bars on the extended centreline + a "rabbit" strobe that runs toward the runway */}
      {Array.from({ length: 10 }, (_, k) => {
        const z = 6 + k * 4, on = ((t * 2) % 1) * 10;
        const hot = Math.abs(9 - k - on) < 0.6;
        return (
          <group key={`a${k}`} position={[0, 0, z]}>
            <mesh geometry={geoOf("tsBar", () => new THREE.BoxGeometry(2.2, 0.05, 0.12))} material={plastic(TP.greyDark)} position={[0, 0.3, 0]} />
            <mesh geometry={geoOf("tsPole", () => new THREE.CylinderGeometry(0.04, 0.04, 0.3, 5))} material={plastic(TP.greyDark)} position={[0, 0.15, 0]} />
            {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => <mesh key={x} geometry={geoOf("tsBulb", () => new THREE.SphereGeometry(0.08, 6, 4))} material={bmat(hot ? "#ffffff" : "#ffe9a8", 1)} position={[x, 0.36, 0]} scale={hot ? 1.8 : 1} />)}
          </group>
        );
      })}
      {/* the localizer antenna array beyond the far end: a row of antennas on a low frame */}
      <group position={[0, 0, -RW_LEN - 6]}>
        <mesh geometry={geoOf("tsLocBeam", () => new THREE.BoxGeometry(10.6, 0.12, 0.2))} material={plastic(TP.greyDark)} position={[0, 0.5, 0]} castShadow />
        {Array.from({ length: 12 }, (_, k) => (
          <group key={k} position={[-5 + k * (10 / 11), 0, 0]}>
            <mesh geometry={geoOf("tsLocPost", () => new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5))} material={plastic(TP.greyDark)} position={[0, 0.5, 0]} />
            <mesh geometry={geoOf("tsLocEl", () => new THREE.BoxGeometry(0.18, 0.5, 0.45))} material={plastic(k % 2 ? TP.white : TP.orange, { flat: true })} position={[0, 1.2, 0]} castShadow />
          </group>
        ))}
      </group>
      {/* the glideslope mast beside the touchdown zone */}
      <group position={[7, 0, -16]}>
        <mesh geometry={geoOf("tsGsMast", () => new THREE.CylinderGeometry(0.12, 0.18, 4.8, 6))} material={plastic(TP.white, { flat: true })} position={[0, 2.4, 0]} castShadow />
        {[1.6, 2.8, 4.0].map((y, k) => <mesh key={k} geometry={geoOf("tsGsEl", () => new THREE.BoxGeometry(0.5, 0.36, 0.24))} material={plastic(k === 1 ? TP.orange : TP.blue, { flat: true })} position={[-0.28, y, 0]} castShadow />)}
        <mesh geometry={geoOf("tsHut", () => new THREE.BoxGeometry(1.2, 0.9, 1.0))} material={plastic("#F0F4FA", { flat: true })} position={[0.9, 0.45, 0]} castShadow />
      </group>
      {/* drifting low-poly clouds */}
      {CLOUDS.map((c, k) => (
        <group key={`c${k}`} position={[((c.x + t * c.sp + 60) % 120) - 60, c.y, c.z]} scale={c.s}>
          {[[0, 0, 0, 1], [0.9, -0.15, 0.1, 0.75], [-0.85, -0.2, -0.1, 0.7], [0.3, 0.45, 0, 0.65]].map(([x, y, z, r], j) => (
            <mesh key={j} geometry={geoOf("tsPuff", () => new THREE.IcosahedronGeometry(1, 1))} material={plastic("#ffffff", { rough: 1, flat: true })} position={[x, y, z]} scale={r} />
          ))}
        </group>
      ))}
    </>
  ),
};

export const TECH_SETS: Record<TechSetId, TechSet> = { studio, blueprint, sky };
export const TECH_SET_IDS = Object.keys(TECH_SETS) as TechSetId[];

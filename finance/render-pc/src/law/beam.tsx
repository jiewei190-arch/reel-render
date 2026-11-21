// law3d light beams: a real three.js spotlight plus a visible volumetric cone (additive, soft-edged) and dust motes
// drifting inside it. Every set uses these, so the frame always has moving dust in warm light.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf } from "../blocky/mat";
import type { V3 } from "../blocky/motion";

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const q2 = (v: number) => Math.round(v * 40) / 40;

/** a cone texture: bright at the top, soft fading edges (u across, v along) */
const coneTex = () => canvasTexture("lawConeTex", 128, 256, (g, W, H) => {
  const img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / (W - 1), v = y / (H - 1);
    const edge = Math.pow(Math.sin(Math.PI * u), 1.6); // the cylinder's unwrapped u: bright facing the lens on both sides
    const along = Math.pow(1 - v, 0.6) * (0.35 + 0.65 * v) * 1.6;
    const a = Math.max(0, Math.min(1, edge * along));
    const i = (y * W + x) * 4;
    img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255; img.data[i + 3] = Math.round(a * 255);
  }
  g.putImageData(img, 0, 0);
});
const cmats = new Map<string, THREE.MeshBasicMaterial>();
const coneMat = (c: string, o: number) => {
  const k = `${c}|${q2(o)}`;
  let m = cmats.get(k);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: c, map: coneTex(), transparent: true, opacity: q2(o), blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false }); cmats.set(k, m); }
  return m;
};
const dmats = new Map<string, THREE.MeshBasicMaterial>();

const dustMat = (c: string, o: number) => {
  const k = `${c}|${q2(o)}`;
  let m = dmats.get(k);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: q2(o), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }); dmats.set(k, m); }
  return m;
};

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

/** a spotlight from `from` to `to`: light + visible cone + dust. `angle` is the half angle (rad). */
export const SpotBeam: React.FC<{ from: V3; to: V3; t: number; color?: string; intensity?: number; angle?: number; cone?: number; dust?: number; seed?: number; light?: boolean; flicker?: number }> = ({ from, to, t, color = "#ffd9a0", intensity = 60, angle = 0.32, cone = 0.13, dust = 70, seed = 1, light = true, flicker = 0 }) => {
  const target = React.useMemo(() => new THREE.Object3D(), []);
  target.position.set(...to);
  target.updateMatrixWorld();
  const d = sub(to, from);
  const L = Math.hypot(...d);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...d).normalize());
  const R = L * Math.tan(angle);
  const fl = 1 + flicker * (0.5 * Math.sin(t * 9.1 + seed) + 0.5 * Math.sin(t * 23.7 + seed * 2)) * 0.5;
  return (
    <>
      {light ? (
        <>
          <primitive object={target} />
          <spotLight position={from} target={target} color={color} intensity={intensity * 0.4 * fl} angle={angle * 1.15} penumbra={0.55} decay={1.3} distance={L * 2.2} />
        </>
      ) : null}
      <group position={from} quaternion={q}>
        <mesh geometry={geoOf("lawCone", () => { const g = new THREE.CylinderGeometry(0.06, 1, 1, 24, 1, true); g.translate(0, -0.5, 0); return g; })} material={coneMat(color, cone * fl)} scale={[R, L, R]} />
        <mesh geometry={geoOf("lawCone", () => new THREE.CylinderGeometry(0.06, 1, 1, 24, 1, true))} material={coneMat(color, cone * 0.6 * fl)} scale={[R * 0.55, L, R * 0.55]} />
        {/* dust: motes drift slowly and twinkle; each one lives inside the cone (local y = -along, radius by depth) */}
        {Array.from({ length: dust }, (_, k) => {
          const a = hash(k * 3 + seed) * Math.PI * 2 + t * (0.05 + 0.1 * hash(k + 9));
          const v = (hash(k * 7 + seed * 5) + t * 0.012 * (0.5 + hash(k + 2))) % 1;
          const along = 0.15 + 0.85 * v;
          const rr = R * along * Math.sqrt(hash(k * 11 + seed)) * 0.85;
          const x = Math.cos(a) * rr + 0.05 * Math.sin(t * 0.7 + k), z = Math.sin(a) * rr + 0.05 * Math.cos(t * 0.6 + k);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + hash(k + 4)) + k));
          const s = (0.012 + 0.02 * hash(k + 13)) * (0.6 + 0.6 * along) * Math.max(1, L / 6);
          return <mesh key={k} geometry={geoOf("lawDust", () => new THREE.IcosahedronGeometry(0.5, 0))} material={dustMat(color, 0.7 * tw * Math.sin(Math.PI * v))} position={[x, -along * L, z]} scale={s} />;
        })}
      </group>
    </>
  );
};

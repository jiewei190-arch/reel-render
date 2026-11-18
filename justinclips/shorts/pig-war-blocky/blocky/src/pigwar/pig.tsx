// The pig: a pink block pig in the same toy-plastic family as the people. Flat decal face (eyes with catch-lights,
// brows), a proud block snout with nostrils, block ears, rigid legs, a curly tail of little cubes.
// Pure function of its props. Size ~0.62 m long, head top ~0.55 m.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic } from "../blocky/mat";
import { Blob } from "../blocky/Contact";
import type { V3 } from "../blocky/motion";
import { Bx, Potato } from "./world";

export type PigFace = "happy" | "curious" | "angel";
const PINK = "#f3a0b6", DARK = "#e07e98";
const pigFace = (f: PigFace, blink: boolean, lookX: number) =>
  canvasTexture(`pigFace|${f}|${blink ? 1 : 0}|${lookX.toFixed(2)}`, 256, 200, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    const ink = "#17161c";
    g.lineCap = "round";
    for (const s of [-1, 1]) {
      const cx = W / 2 + s * W * 0.22, cy = H * 0.4;
      g.fillStyle = ink;
      g.strokeStyle = ink;
      if (blink || f === "angel") {
        g.lineWidth = 9;
        g.beginPath();
        if (f === "angel") g.arc(cx, cy + 10, 18, Math.PI * 1.1, Math.PI * 1.9);
        else {
          g.moveTo(cx - 18, cy);
          g.lineTo(cx + 18, cy);
        }
        g.stroke();
      } else {
        g.beginPath();
        g.ellipse(cx + lookX * 6, cy, 20, 28, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.arc(cx + lookX * 6 + 7, cy - 11, 7, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(cx + lookX * 6 - 7, cy + 11, 3, 0, Math.PI * 2);
        g.fill();
      }
      // brow
      g.strokeStyle = ink;
      g.lineWidth = 9;
      const tilt = f === "curious" ? (s < 0 ? -8 : 8) : -3;
      g.beginPath();
      g.moveTo(cx - s * 20, cy - 46 - tilt * s * 0.5);
      g.lineTo(cx + s * 20, cy - 46 + tilt * s * 0.5);
      g.stroke();
    }
    // blush
    g.fillStyle = "rgba(255,90,130,0.45)";
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(W / 2 + s * W * 0.36, H * 0.72, 18, 10, 0, 0, Math.PI * 2);
      g.fill();
    }
  });

export type PigPose = { p: V3; yaw: number; walk?: number; head?: number; headYaw?: number; chew?: number; face?: PigFace; look?: number; potato?: boolean; roll?: number };
export const Pig: React.FC<{ pose: PigPose; t: number; s?: number; shadow?: boolean }> = ({ pose, t, s = 1, shadow = true }) => {
  const wk = pose.walk ?? 0;
  const ph = t * 2.6 * Math.PI;
  const bob = Math.abs(Math.sin(ph)) * 0.02 * wk + Math.sin(t * 2.4) * 0.004;
  const blink = (t * 0.41 + 0.3) % 1 < 0.035;
  const face = plastic("#ffffff", { decal: true, rough: 0.45, map: pigFace(pose.face ?? "happy", blink, pose.look ?? 0) });
  const chew = (pose.chew ?? 0) * Math.abs(Math.sin(t * 13)) * 0.012;
  const legs: V3[] = [[-0.11, 0.17, 0.2], [0.11, 0.17, 0.2], [-0.11, 0.17, -0.2], [0.11, 0.17, -0.2]];
  return (
    <group position={pose.p} rotation={[0, pose.yaw, pose.roll ?? 0]} scale={s}>
      {shadow ? <Blob p={[0, 0, 0]} sx={0.55} sz={0.75} op={0.55} /> : null}
      {legs.map((l, i) => (
        <group key={i} position={l} rotation={[Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.5 * wk, 0, 0]}>
          <Bx s={[0.1, 0.17, 0.1]} p={[0, -0.085, 0]} c={PINK} rough={0.45} />
          <Bx s={[0.105, 0.04, 0.105]} p={[0, -0.155, 0]} c="#5a3a3a" rough={0.5} />
        </group>
      ))}
      <group position={[0, bob, 0]} rotation={[0, 0, Math.sin(ph) * 0.03 * wk]}>
        <Bx s={[0.36, 0.3, 0.56]} p={[0, 0.3, 0]} c={PINK} rough={0.42} round={0.06} />
        {/* curly tail */}
        <group position={[0, 0.36, -0.29]} rotation={[0.3 + Math.sin(t * 4) * 0.15, 0, Math.sin(t * 9) * 0.5]}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = i * 0.95, r = 0.045 * (1 - i / 14);
            return <Bx key={i} s={[0.03, 0.03, 0.03]} p={[Math.cos(a) * r, Math.sin(a) * r + 0.008 * i, -0.012 - i * 0.011]} c={i % 2 ? PINK : DARK} rough={0.45} round={0.008} />;
          })}
        </group>
        {/* head */}
        <group position={[0, 0.38, 0.27]} rotation={[pose.head ?? 0, pose.headYaw ?? 0, 0]}>
          <Bx s={[0.3, 0.27, 0.24]} p={[0, 0.02, 0.06]} c={PINK} rough={0.42} round={0.05} />
          <mesh geometry={geoOf("pigFacePlane", () => new THREE.PlaneGeometry(0.26, 0.2))} material={face} position={[0, 0.045, 0.1805]} />
          <group position={[0, -0.03 + chew, 0.2]}>
            <Bx s={[0.15, 0.1, 0.06]} c={DARK} rough={0.4} round={0.02} />
            {[-1, 1].map((k) => <Bx key={k} s={[0.03, 0.04, 0.012]} p={[k * 0.035, 0, 0.031]} c="#7a3a4a" rough={0.5} cast={false} />)}
            {pose.potato ? <Potato p={[0.075, -0.065, 0.02]} r={[0.2, 0.4, 0.1]} s={0.55} /> : null}
          </group>
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.11, 0.15, 0.04]} rotation={[Math.sin(t * 5 + k) * 0.15, 0, k * -0.45]}>
              <Bx s={[0.1, 0.1, 0.03]} p={[0, 0.04, 0]} c={DARK} rough={0.45} round={0.015} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};

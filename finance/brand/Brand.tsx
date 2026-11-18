// Block Money brand art: a profile picture (square) and a channel banner (2560x1440). Our own blocky mascot.
import React from "react";
import { AbsoluteFill } from "remotion";
import { View } from "./engine/core/View";
import { Blocky } from "./blocky/Blocky";
import type { Look } from "./blocky/Blocky";
import { moodForShot } from "./blocky/mood";
import { plastic, canvasTexture } from "./blocky/mat";
import { base, faceH } from "./library/characters";
import { useFonts } from "./engine/core/frame";
import type { Cam } from "./engine/core/View";

export const SAVER: Look = {
  skin: "#f1c393", shirt: "#1fbf5a", pants: "#1d3b2a", shoes: "#ffffff", sole: "#ffc21a", hair: "#2b1912",
  hairStyle: "shaggy", accent: "#ffc21a", print: "star", cheeks: "blush", eyeScale: 1.15, belt: "#ffc21a", cuffs: "#ffffff",
  acc: { glasses: "#111111" },
};
const GOLD = plastic("#ffc21a", { rough: 0.25 });
const DOLLAR = canvasTexture("dollar", 256, 256, (g, w, h) => { g.fillStyle = "#e6a400"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff3c0"; g.font = "bold 190px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", w / 2, h / 2 + 10); });
const GOLD_D = plastic("#ffffff", { rough: 0.3, map: DOLLAR });
const Coin: React.FC<{ p: [number, number, number]; r?: number; rot?: [number, number, number] }> = ({ p, r = 0.09, rot = [Math.PI / 2, 0, 0] }) => (
  <group position={p} rotation={rot}>
    <mesh material={GOLD} castShadow><cylinderGeometry args={[r, r, r * 0.28, 32]} /></mesh>
    <mesh material={GOLD_D} position={[0, r * 0.15, 0]} rotation={[0, Math.PI, 0]}><cylinderGeometry args={[r * 0.72, r * 0.72, r * 0.02, 32]} /></mesh>
  </group>
);
const Stack: React.FC<{ x: number; z: number; n: number; r?: number }> = ({ x, z, n, r = 0.11 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => (
      <group key={i} position={[x + Math.sin(i * 1.7) * 0.006, r * 0.15 + i * r * 0.3, z + Math.cos(i * 2.3) * 0.006]}>
        <mesh material={GOLD} castShadow receiveShadow><cylinderGeometry args={[r, r, r * 0.28, 32]} /></mesh>
      </group>
    ))}
  </group>
);
const Floor: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={plastic("#2fae5b", { rough: 0.8 })}>
    <planeGeometry args={[40, 40]} />
  </mesh>
);
const Mascot: React.FC<{ x?: number; yaw?: number }> = ({ x = 0, yaw = 0.25 }) => (
  <Blocky
    pose={base(x, 0, yaw, 1, { armR: 2.2, outR: 0.2, armL: 0.08, outL: 0.12, headPitch: 0.02, headYaw: 0.15 })}
    look={SAVER}
    emotion="joy"
    held={{ side: "R", node: <Coin p={[0, 0.12, 0]} r={0.16} rot={[Math.PI / 2, 0, 0]} /> }}
  />
);

const FH = faceH(1);
export const Pfp: React.FC = () => {
  useFonts();
  const cam: Cam = { pos: [0.55, FH + 0.02, 2.9], look: [-0.05, FH - 0.08, 0], fov: 30 };
  return (
    <AbsoluteFill style={{ background: "#0f3d22" }}>
      <View mood={moodForShot("pfp", cam)} cam={cam} t={0} blur={0} width={1080} height={1080}>
        <Floor />
        <Mascot />
        <Stack x={-0.45} z={0.1} n={7} />
        <Stack x={0.5} z={-0.2} n={4} />
      </View>
    </AbsoluteFill>
  );
};

export const Banner: React.FC = () => {
  useFonts();
  const cam: Cam = { pos: [0, FH - 0.06, 8.8], look: [0.12, FH - 0.17, 0], fov: 22 };
  return (
    <AbsoluteFill style={{ background: "#0f3d22" }}>
      <View mood={moodForShot("banner", cam)} cam={cam} t={0} blur={0} width={2560} height={1440}>
        <Floor />
        <group position={[1.0, 0, 0]}><Mascot yaw={-0.3} /></group>
        <Stack x={1.65} z={0.3} n={9} />
        <Stack x={1.95} z={-0.2} n={5} />
        <Stack x={-2.6} z={-0.3} n={6} />
        <Stack x={-2.95} z={0.2} n={11} />
        <Stack x={2.9} z={0.0} n={13} />
      </View>
      <div style={{ position: "absolute", left: 540, top: 509, width: 1000, height: 423, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Poppins" }}>
        <div style={{ fontWeight: 800, fontSize: 118, lineHeight: 1, whiteSpace: "nowrap", color: "#ffffff", WebkitTextStroke: "6px #0b2a17", paintOrder: "stroke fill", textShadow: "0 8px 0 #0b2a17" }}>
          BLOCK <span style={{ color: "#ffc21a" }}>MONEY</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 50, color: "#ffffff", marginTop: 18, textShadow: "0 4px 0 #0b2a17" }}>Money facts in 30 seconds</div>
      </div>
    </AbsoluteFill>
  );
};

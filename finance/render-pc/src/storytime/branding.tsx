// storytime branding stills (the "My Homie Wildin" account): a profile picture of homie (1080 x 1080, with and without
// the account name) and a YouTube banner (2560 x 1440: homie mid-yell + me facepalming on the left of the safe area, the
// name big on the right). Same cast models and colours as the episodes; original designs only.
import React from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { canvasTexture, geoOf } from "../blocky/mat";
import { useFonts } from "../engine/core/frame";
import { mk } from "../engine/core/moods";
import { View } from "../engine/core/View";
import { Kid } from "./cast";
import type { FigState } from "./compile";
import { FACES } from "./face";
import type { FaceP } from "./face";
import type { V3 } from "./layout";
import type { CastSpec } from "./types";

export const BRAND_CAST: Record<"me" | "homie", CastSpec> = {
  me: { name: "me", skin: "#9a6240", hair: "#1b1410", hairStyle: "flattop", top: "#f2b632", topStyle: "hoodie", trim: "#ffffff", pants: "#2f3a56", shoes: "#f5f5f5", brow: "#1b1410", eye: "#3b2416" },
  homie: { name: "homie", skin: "#f4cfa6", hair: "#c4541c", hairStyle: "curls", top: "#7b4fd6", topStyle: "tee", trim: "#ffffff", pants: "#6b7a3a", shoes: "#22223b", brow: "#8a3b14", eye: "#2e6f3e", freckles: true },
};
const mood = (() => {
  const flat = (c: string) => ({ top: c, mid: c, bottom: c, cloudColor: c, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0, sun: { dir: [-0.6, 0.12, -1] as V3, color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1] as V3, color: "#ffffff", size: 4 }, moonOn: 0 });
  const m = mk({ note: "brand", hemi: ["#f0f4ff", "#a08060", 0.75], key: ["#fff1d8", 2.5, [0.6, 0.8, 0.7]], rim: ["#ffffff", 1.6, [-0.6, 0.5, -0.8]], fill: ["#d8e4ff", 0.6, [-0.7, 0.3, 0.6]], prac: ["#fff", 0, "#fff"], fog: ["#ffffff", 0.0001], sky: flat("#ffffff"),
    toon: { shadowTint: [0.92, 0.9, 1.1], hiTint: [1.04, 1.02, 0.96], rimColor: "#ffffff" }, grade: { exposure: 0.9, contrast: 1.12, saturation: 1.3, shadowTint: "#5a5ab0", highlightTint: "#fff6e0", gain: "#ffffff" }, bloomTint: "#fff4dc", ink: "#1d1630", camFill: ["#ffffff", 0.35], cast: { rim: ["#fff6e0", 1.2], fill: ["#ffe8d0", 0.5] } });
  return { ...m, post: { ...m.post, outline: { ...m.post.outline, widthPx: 1.6, strength: 0.22 }, bloom: { ...m.post.bloom, threshold: 1.6, strength: 0.1 }, vignette: { amount: 0.22, softness: 0.75, color: "#2a1a14" } } };
})();

const kid = (id: "me" | "homie", o: Partial<FigState> & { face: FaceP }): FigState => ({
  id: `brand_${id}`, lead: true, spec: BRAND_CAST[id], x: 0, z: 0, yaw: 0, headYaw: 0, headPitch: 0, sit: false, s: 1, lean: 0, bob: 0, tilt: 0,
  armL: [0.1, 0.12], armR: [0.1, 0.12], pose: "idle", expr: "smug", mouth: 0, talking: false, seed: 1, ...o,
});
/** wild + smug: one brow way up, a big toothy grin, eyes on the lens */
const WILD: FaceP = { ...FACES.smug, browAsym: 1, browY: 0.12, browA: 0.2, lid: 0.12, curve: 1, open: 0.65, teeth: 1, smirk: 0.3, px: 0, py: 0.05, mouthW: 0.34, eyeS: 1.12 };
const YELL: FaceP = { ...FACES.yell, open: 0.95, px: 0 };
const FACEPALM: FaceP = { ...FACES.deadpan, lid: 0.72, browA: -0.25, browY: 0.1, curve: -0.35, px: -0.4, py: -0.3 };

/** a backdrop plane facing the lens: a solid colour with a soft radial glow at its centre */
const Backdrop: React.FC<{ c: V3; yaw: number; size: number; base: string; glow: string; aspect?: number }> = ({ c, yaw, size, base, glow, aspect = 1 }) => {
  const tex = canvasTexture(`brandBg${base}${glow}${aspect}`, 1024, Math.round(1024 / aspect), (g, W, H) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    const r = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.45);
    r.addColorStop(0, glow); r.addColorStop(1, base);
    g.fillStyle = r; g.fillRect(0, 0, W, H);
  });
  const mat = React.useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false }), [tex]);
  return <mesh geometry={geoOf("brandPlane", () => new THREE.PlaneGeometry(1, 1))} material={mat} position={c} rotation={[0, yaw, 0]} scale={[size * aspect, size, 1]} />;
};
const Title: React.FC<{ fs: number; style?: React.CSSProperties; brk?: boolean }> = ({ fs, style, brk }) => (
  <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: fs, lineHeight: 1.02, color: "#fff", WebkitTextStroke: `${fs * 0.16}px #000`, paintOrder: "stroke fill", textShadow: `0 ${fs * 0.08}px 0 rgba(0,0,0,0.6)`, letterSpacing: fs * 0.01, ...style }}>
    MY HOMIE{brk ? <br /> : " "}<span style={{ color: "#FFD83A" }}>WILDIN</span>
  </div>
);

export const BrandPfp: React.FC<{ text?: boolean }> = ({ text }) => {
  useFonts();
  // a tight head-and-shoulders: the face fills ~55-60 % of the height, cropped at the chest, a cocky head tilt
  const head: V3 = [0, 1.2, 0], dy = 0.3, d = 1.8;
  const dir: V3 = [Math.sin(dy), 0, Math.cos(dy)];
  const cam = { pos: [head[0] + dir[0] * d, head[1] + 0.06, head[2] + dir[2] * d] as V3, look: [0, 1.19, 0] as V3, fov: 30 };
  const st = kid("homie", { yaw: 0.5, headYaw: -0.22, headPitch: -0.06, tilt: -0.17, lean: 0.06, face: WILD, armL: [0.25, 0.2], armR: [0.25, 0.2] });
  return (
    <AbsoluteFill style={{ background: "#F59A00" }}>
      <View mood={mood} cam={cam} t={0} blur={0} sky={false} width={1080} height={1080}>
        <Backdrop c={[-dir[0] * 1.6, 1.15, -dir[2] * 1.6]} yaw={dy} size={6} base="#F59A00" glow="#FFD000" />
        <Kid st={st} t={0} />
      </View>
      {text ? <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}><Title fs={84} /></div> : null}
    </AbsoluteFill>
  );
};

export const BrandBanner: React.FC = () => {
  useFonts();
  // the two kids sit in the left half of the 1546 x 423 safe area (x 507-2053, y 508-931); the name fills the right half
  // 1.6x the earlier framing: heads and chests fill the safe band's left part, bodies run off the band's bottom edge
  const cam = { pos: [0.47, 1.4, 5.9] as V3, look: [0.47, 1.3, 0] as V3, fov: 21 };
  const homie = kid("homie", { x: -0.3, yaw: 0.35, headYaw: -0.1, lean: 0.14, face: YELL, pose: "yell", armL: [0.35, 1.15], armR: [1.0, 0.3], elbow: [1.7, 1.0], bob: 0.02 });
  const me = kid("me", { x: 0.3, z: -0.2, yaw: -0.45, headYaw: 0.15, headPitch: 0.18, face: FACEPALM, pose: "idle", armR: [2.55, -0.38], armL: [0.12, 0.15], elbow: [0.18, 0], tilt: 0.05 });
  return (
    <AbsoluteFill style={{ background: "#0050D8" }}>
      <View mood={mood} cam={cam} t={0} blur={0} sky={false} width={2560} height={1440}>
        <Backdrop c={[0.86, 1.3, -3]} yaw={0} size={8} base="#0050D8" glow="#1E9BFF" aspect={16 / 9} />
        <Kid st={homie} t={0} />
        <Kid st={me} t={0} />
      </View>
      <div style={{ position: "absolute", left: 1360, width: 693, top: 508, height: 423, display: "flex", alignItems: "center", justifyContent: "center" }}><Title fs={124} brk style={{ textAlign: "center", whiteSpace: "nowrap" }} /></div>
    </AbsoluteFill>
  );
};

// biz3d HERO PROPS: generic, labelled product props a recipe places and closes up on, so the opening frame shows what
// the story is about (a red can for a cola story, a rental case for a video chain). All procedural, ORIGINAL designs:
// no real logo, trademark artwork or trade dress. Each takes `color` (the product colour), a short `label` (plain
// generic text: "COLA", "NEW", "FILM"; brand names are refused at compile time), `at`, `scale` (or `s`) and `spin`.
// Paper props (letter) always draw their text: a headline (the label) and body lines (`lines`); never blank paper.
// HERO SCALE: each prop is about 0.5-1 m (2-3x life size) so the kit's closeUp / hookZoom lenses fill the frame at
// their default distances; use "scale": 0.35 for a prop at life size on the boardroom table.
// Look: the premium miniature world (smooth satin plastic, a soft clear-coat highlight, rounded edges), lit by the set.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { docTex, fitText, hmat, HERO_FONT } from "../library/hero";
import { PACK_BOX, PACK_DEFAULT, PackHero, packKindsFor } from "../props/pack";
import type { PackKind, PackParams, PackTheme } from "../props/pack";
import { BP } from "./palette";

export type BizOwnKind = "can" | "cup" | "box" | "bottle" | "phone" | "case" | "camera" | "shoe" | "burger" | "laptop" | "card" | "bag" | "letter";
export const BIZ_OWN_KINDS: BizOwnKind[] = ["can", "cup", "box", "bottle", "phone", "case", "camera", "shoe", "burger", "laptop", "card", "bag", "letter"];
/** + the PROPS PACK (src/props/pack.tsx) in the biz3d look; biz3d keeps its own laptop and shoe */
export type BizHeroKind = BizOwnKind | PackKind;
export const BIZ_PACK_KINDS: PackKind[] = packKindsFor(BIZ_OWN_KINDS);
export const BIZ_HERO_KINDS: BizHeroKind[] = [...BIZ_OWN_KINDS, ...BIZ_PACK_KINDS];
const isOwn = (k: string): k is BizOwnKind => (BIZ_OWN_KINDS as string[]).includes(k);
/** default product colour and label per kind */
export const BIZ_HERO_DEFAULT: Record<BizHeroKind, { color: string; label: string; what: string }> = {
  ...PACK_DEFAULT,
  can: { color: "#D7262E", label: "COLA", what: "a soda can" },
  cup: { color: "#F4F1EA", label: "CLASSIC", what: "a paper cup with a lid and straw" },
  box: { color: "#F2B830", label: "CEREAL", what: "a cereal / product box" },
  bottle: { color: "#2F7D4A", label: "SODA", what: "a glass bottle with a label band" },
  phone: { color: "#1C2230", label: "NEW", what: "a smartphone, label on the lit screen" },
  case: { color: "#1E3A8A", label: "MOVIE", what: "a video rental case (DVD/VHS)" },
  camera: { color: "#2A2A2E", label: "FILM", what: "a film camera" },
  shoe: { color: "#E04E2C", label: "RUN", what: "a sneaker, label on the side panel" },
  burger: { color: "#E8A33A", label: "BURGER", what: "a burger box, lid open on a burger" },
  laptop: { color: "#B8BEC8", label: "ONLINE", what: "a laptop, label on the screen" },
  card: { color: "#1F2937", label: "GOLD", what: "a credit card (no network logo)" },
  bag: { color: "#C8102E", label: "SALE", what: "a shopping bag with rope handles" },
  letter: { color: "#FBF8F1", label: "NOTICE", what: "a letter / document: headline + body lines" },
};
/** the QA box of each kind at scale 1 (local: base on y = 0, front facing +z): centre and half extents */
export const BIZ_HERO_BOX: Record<BizHeroKind, { c: V3; h: V3 }> = {
  ...PACK_BOX,
  can: { c: [0, 0.31, 0], h: [0.2, 0.31, 0.2] },
  cup: { c: [0, 0.33, 0], h: [0.22, 0.33, 0.22] },
  box: { c: [0, 0.36, 0], h: [0.26, 0.36, 0.1] },
  bottle: { c: [0, 0.42, 0], h: [0.15, 0.42, 0.15] },
  phone: { c: [0, 0.46, 0], h: [0.22, 0.45, 0.07] },
  case: { c: [0, 0.39, 0], h: [0.26, 0.39, 0.05] },
  camera: { c: [0, 0.25, 0.05], h: [0.4, 0.25, 0.26] },
  shoe: { c: [0, 0.22, 0], h: [0.46, 0.22, 0.17] },
  burger: { c: [0, 0.3, -0.04], h: [0.32, 0.3, 0.32] },
  laptop: { c: [0, 0.31, -0.08], h: [0.5, 0.31, 0.38] },
  card: { c: [0, 0.3, 0], h: [0.43, 0.29, 0.06] },
  bag: { c: [0, 0.42, 0], h: [0.28, 0.42, 0.13] },
  letter: { c: [0, 0.43, 0], h: [0.33, 0.43, 0.08] },
};

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const shade = (hex: string, k: number) => { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color("#ffffff"), k); return `#${c.getHexString()}`; };
const lum = (hex: string) => { const c = new THREE.Color(hex); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; };
/** white text on a dark product, dark ink on a light one */
const inkOn = (hex: string) => (lum(hex) > 0.45 ? "#14161C" : "#FFFFFF");
const PLANE = () => geoOf("bhPlane", () => new THREE.PlaneGeometry(1, 1));
const CYL = (rt: number, rb: number, h: number, seg = 40, open = false) => geoOf(`bhCyl${rt}|${rb}|${h}|${seg}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
const SPH = () => geoOf("bhSph", () => new THREE.SphereGeometry(1, 28, 18));

/** a label panel: product colour, the label big and centred, a band and a small generic line ("NEW", "ORIGINAL") */
const panelTex = (kind: string, color: string, label: string, W: number, H: number, style: "can" | "box" | "case" | "bag" | "sleeve" | "plate" | "card" | "side", sub = "") =>
  canvasTexture(`bhPanel|${kind}|${color}|${label}|${sub}|${W}x${H}|${style}`, W, H, (g) => {
    const ink = inkOn(color);
    g.fillStyle = color; g.fillRect(0, 0, W, H);
    g.textAlign = "center"; g.textBaseline = "middle";
    switch (style) {
      case "can": {
        // a wrap-around can label: the brightest part (the front) is the middle of the texture
        const gr = g.createLinearGradient(0, 0, W, 0);
        gr.addColorStop(0, shade(color, -0.35)); gr.addColorStop(0.5, color); gr.addColorStop(1, shade(color, -0.35));
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // straight bands top and bottom (deliberately no ribbon / wave: an original, generic can)
        g.fillStyle = shade(color, -0.45); g.fillRect(0, 0, W, H * 0.12); g.fillRect(0, H * 0.84, W, H * 0.16);
        g.fillStyle = shade(color, 0.7); g.fillRect(0, H * 0.12, W, H * 0.025); g.fillRect(0, H * 0.815, W, H * 0.025);
        g.fillStyle = ink === "#FFFFFF" ? "#FFFFFF" : "#14161C";
        fitText(g, label.toUpperCase(), Math.round(H * 0.26), W * 0.3);
        g.save(); g.translate(W / 2, H * 0.42); g.fillText(label.toUpperCase(), 0, 0); g.restore();
        g.font = `bold ${Math.round(H * 0.06)}px ${HERO_FONT}`; // the small line is the recipe's `lines[0]` (e.g. "NEW TASTE"); none by default, so a can never claims a
        // flavour the story contradicts (a NEW cola can printed "ORIGINAL TASTE" was an accuracy blocker)
        if (sub) { fitText(g, sub.toUpperCase(), Math.round(H * 0.06), W * 0.3); g.fillText(sub.toUpperCase(), W / 2, H * 0.66); }
        break;
      }
      case "sleeve": {
        g.fillStyle = shade(color, -0.08); g.fillRect(0, H * 0.3, W, H * 0.4);
        g.fillStyle = "#3A2A1E"; g.fillRect(0, H * 0.3, W, H * 0.04); g.fillRect(0, H * 0.66, W, H * 0.04);
        g.fillStyle = "#3A2A1E"; fitText(g, label.toUpperCase(), Math.round(H * 0.2), W * 0.32); g.fillText(label.toUpperCase(), W / 2, H * 0.5);
        break;
      }
      case "box": case "case": case "bag": {
        const band = style === "case" ? "#111111" : shade(color, -0.3);
        g.fillStyle = band; g.fillRect(0, H * 0.06, W, H * 0.1);
        g.fillStyle = "#FFFFFF"; const top = style === "case" ? "2-NIGHT RENTAL" : style === "bag" ? "THANK YOU" : "FAMILY SIZE"; fitText(g, top, Math.round(H * 0.06), W * 0.86); g.fillText(top, W / 2, H * 0.11);
        // a big rounded badge with the label
        const bw = W * 0.84, bh = H * 0.34, bx = (W - bw) / 2, by = H * 0.3;
        g.fillStyle = ink === "#FFFFFF" ? "rgba(255,255,255,0.96)" : "rgba(20,22,28,0.94)";
        g.beginPath(); g.roundRect(bx, by, bw, bh, bh * 0.22); g.fill();
        g.fillStyle = ink === "#FFFFFF" ? color : "#FFFFFF";
        if (lum(color) > 0.8 && ink !== "#FFFFFF") g.fillStyle = "#FFFFFF";
        fitText(g, label.toUpperCase(), Math.round(bh * 0.62), bw * 0.88); g.fillText(label.toUpperCase(), W / 2, by + bh * 0.53);
        if (style === "box") { g.fillStyle = "#FFE14D"; g.beginPath(); for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, r = k % 2 ? W * 0.1 : W * 0.135; g.lineTo(W * 0.78 + Math.cos(a) * r, H * 0.8 + Math.sin(a) * r); } g.fill(); g.fillStyle = "#B3261E"; g.font = `bold ${Math.round(W * 0.07)}px ${HERO_FONT}`; g.fillText("NEW", W * 0.78, H * 0.8); g.fillStyle = shade(color, 0.6); g.beginPath(); g.ellipse(W * 0.34, H * 0.82, W * 0.2, H * 0.08, 0, 0, Math.PI * 2); g.fill(); }
        if (style === "case") { g.fillStyle = "#FFFFFF"; g.font = `bold ${Math.round(H * 0.045)}px ${HERO_FONT}`; g.fillText("NEW RELEASE", W / 2, H * 0.74); g.fillStyle = "#F5C542"; g.fillRect(W * 0.12, H * 0.82, W * 0.76, H * 0.06); g.fillStyle = "#111"; g.font = `bold ${Math.round(H * 0.04)}px ${HERO_FONT}`; g.fillText("RETURN BY 9 PM", W / 2, H * 0.851); }
        if (style === "bag") { g.strokeStyle = ink === "#FFFFFF" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"; g.lineWidth = 6; g.strokeRect(W * 0.06, H * 0.2, W * 0.88, H * 0.74); }
        break;
      }
      case "plate": case "side": {
        g.fillStyle = ink; fitText(g, label.toUpperCase(), Math.round(H * 0.62), W * 0.86); g.fillText(label.toUpperCase(), W / 2, H * 0.54);
        break;
      }
      case "card": {
        const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, shade(color, 0.18)); gr.addColorStop(1, shade(color, -0.25)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = "rgba(255,255,255,0.07)"; g.beginPath(); g.arc(W * 0.85, H * 0.1, H * 0.7, 0, Math.PI * 2); g.fill();
        // chip
        g.fillStyle = "#D9B65A"; g.beginPath(); g.roundRect(W * 0.08, H * 0.34, W * 0.14, H * 0.22, 10); g.fill();
        g.strokeStyle = "#9C7B2E"; g.lineWidth = 3; for (const y of [0.41, 0.49]) { g.beginPath(); g.moveTo(W * 0.08, H * y); g.lineTo(W * 0.22, H * y); g.stroke(); }
        g.textAlign = "left"; g.fillStyle = ink;
        fitText(g, label.toUpperCase(), Math.round(H * 0.17), W * 0.5); g.fillText(label.toUpperCase(), W * 0.08, H * 0.18);
        g.font = `bold ${Math.round(H * 0.11)}px ${HERO_FONT}`; g.fillText("4821  0073  5590  1186", W * 0.08, H * 0.72);
        g.font = `${Math.round(H * 0.07)}px ${HERO_FONT}`; g.fillText("VALID THRU 12/29", W * 0.08, H * 0.87);
        g.textAlign = "right"; g.font = `bold ${Math.round(H * 0.09)}px ${HERO_FONT}`; g.fillText("CREDIT", W * 0.93, H * 0.87);
        break;
      }
    }
  });

/** a lit screen: the label as a big headline, a small chart or text lines (phone, laptop) */
/** (the screen keeps its own UI colours; the body takes the prop colour) */
const screenTex = (kind: "phone" | "laptop", label: string) => canvasTexture(`bhScreen|${kind}|${label}`, kind === "phone" ? 360 : 640, kind === "phone" ? 720 : 400, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1B4FD8"); gr.addColorStop(1, "#0B1E57"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle";
  const card = (x: number, y: number, w: number, h: number) => { g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.roundRect(x, y, w, h, Math.min(w, h) * 0.12); g.fill(); };
  if (kind === "phone") {
    g.fillStyle = "rgba(255,255,255,0.85)"; g.font = `bold ${Math.round(W * 0.07)}px ${HERO_FONT}`; g.fillText("9:41", W / 2, H * 0.06);
    card(W * 0.08, H * 0.22, W * 0.84, H * 0.36);
    g.fillStyle = "#0B1E57"; fitText(g, label.toUpperCase(), Math.round(W * 0.26), W * 0.74); g.fillText(label.toUpperCase(), W / 2, H * 0.4);
    for (let k = 0; k < 3; k++) { g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.roundRect(W * 0.08 + k * W * 0.29, H * 0.68, W * 0.25, W * 0.25, W * 0.06); g.fill(); g.fillStyle = ["#F59E0B", "#22C55E", "#EF4444"][k]; g.beginPath(); g.arc(W * 0.205 + k * W * 0.29, H * 0.68 + W * 0.125, W * 0.06, 0, Math.PI * 2); g.fill(); }
  } else {
    g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(0, 0, W, H * 0.09);
    g.fillStyle = "#ffffff"; g.font = `bold ${Math.round(H * 0.05)}px ${HERO_FONT}`; g.textAlign = "left"; g.fillText("● ● ●", W * 0.03, H * 0.045); g.textAlign = "center";
    card(W * 0.08, H * 0.16, W * 0.84, H * 0.4);
    g.fillStyle = "#0B1E57"; fitText(g, label.toUpperCase(), Math.round(H * 0.25), W * 0.76); g.fillText(label.toUpperCase(), W / 2, H * 0.36);
    // a rising line chart
    g.strokeStyle = "#22C55E"; g.lineWidth = H * 0.025; g.lineJoin = "round"; g.beginPath();
    const pts = [0.1, 0.18, 0.15, 0.3, 0.28, 0.45, 0.6, 0.75];
    pts.forEach((p, i) => { const x = W * (0.1 + (0.8 * i) / (pts.length - 1)), y = H * (0.92 - p * 0.36); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke();
  }
});

/** the props: a pure function of (kind, color, label, lines, t); base on y = 0, front toward +z */
/** the biz3d look for the props pack: smooth satin plastic and soft clear-coat metal, green screen accents */
const bizGlow = new Map<string, THREE.MeshBasicMaterial>();
export const BIZ_PACK_THEME: PackTheme = {
  kit: "biz3d",
  m: (c, o = {}) => hmat(c, { rough: o.rough ?? 0.4, metal: o.metal ?? 0, map: o.map, opacity: o.opacity, side: o.side, emissive: o.emissive, ei: o.ei }),
  glow: (c, map, opacity = 1) => { const q = Math.round(opacity * 20) / 20, k = `${c}|${map?.uuid ?? ""}|${q}`; let m = bizGlow.get(k); if (!m) { if (bizGlow.size > 120) bizGlow.clear(); m = new THREE.MeshBasicMaterial({ color: c, map: map ?? null, toneMapped: false, transparent: q < 1, opacity: q }); bizGlow.set(k, m); } return m; },
  smooth: true, seg: 28, accent: BP.green, alert: BP.red, gold: BP.gold, chrome: "#D5D9E0", paper: BP.paper, ink: BP.ink, screenBg: BP.night, screenInk: "#FFFFFF", neonEdges: false,
};
export const BizHero: React.FC<{ kind: BizHeroKind; color?: string; label?: string; lines?: string[]; t: number; seed: number } & PackParams> = ({ kind, color, label, lines, t, seed, holding, spots, screen, variant }) => {
  if (!isOwn(kind)) return <PackHero sp={{ kind, color, label, lines, holding, spots, screen, variant }} th={BIZ_PACK_THEME} t={t} seed={seed} />;
  const D = BIZ_HERO_DEFAULT[kind];
  const col = color ?? D.color;
  const lab = (label ?? D.label).toUpperCase();
  const satin = (c: string, o: { rough?: number; metal?: number; map?: THREE.Texture } = {}) => hmat(c, { rough: o.rough ?? 0.32, metal: o.metal ?? 0, map: o.map });
  const silver = hmat("#D5D9E0", { rough: 0.22, metal: 0.35 });
  switch (kind) {
    case "can": {
      const tex = panelTex(kind, col, lab, 1024, 424, "can", lines?.[0] ?? "");
      return (
        <group>
          {/* the body (texture seam at the back: the label centre faces +z), the rounded shoulders, lid and pull tab */}
          <mesh geometry={CYL(0.2, 0.2, 0.52, 48)} material={satin("#ffffff", { map: tex, rough: 0.24, metal: 0.15 })} position={[0, 0.31, 0]} rotation={[0, Math.PI, 0]} castShadow receiveShadow />
          <mesh geometry={CYL(0.165, 0.2, 0.05, 48)} material={silver} position={[0, 0.595, 0]} castShadow />
          <mesh geometry={CYL(0.172, 0.172, 0.018, 48)} material={silver} position={[0, 0.626, 0]} />
          <mesh geometry={CYL(0.15, 0.15, 0.012, 40)} material={hmat("#B9BEC7", { rough: 0.3, metal: 0.3 })} position={[0, 0.632, 0]} />
          <mesh geometry={rbox(0.11, 0.012, 0.05, 0.005)} material={silver} position={[0, 0.642, 0.04]} />
          <mesh geometry={CYL(0.2, 0.17, 0.05, 48)} material={silver} position={[0, 0.025, 0]} castShadow />
          {/* condensation beads: tiny glossy spheres */}
          {Array.from({ length: 22 }, (_, k) => { const a = (hash(k + seed) - 0.5) * 2.2, y = 0.12 + 0.42 * hash(k * 3 + 1); return <mesh key={k} geometry={SPH()} material={hmat("#ffffff", { rough: 0.05, opacity: 0.55 })} position={[Math.sin(a) * 0.203, y, Math.cos(a) * 0.203]} scale={0.006 + 0.006 * hash(k + 9)} />; })}
        </group>
      );
    }
    case "cup": {
      const tex = panelTex(kind, col, lab, 1024, 512, "sleeve");
      return (
        <group>
          <mesh geometry={CYL(0.21, 0.15, 0.52, 48, false)} material={satin("#ffffff", { map: tex, rough: 0.55 })} position={[0, 0.26, 0]} rotation={[0, Math.PI, 0]} castShadow receiveShadow />
          <mesh geometry={CYL(0.225, 0.225, 0.035, 48)} material={satin("#F7F7F5", { rough: 0.4 })} position={[0, 0.535, 0]} castShadow />
          <mesh geometry={CYL(0.14, 0.2, 0.05, 40)} material={satin("#F7F7F5", { rough: 0.4 })} position={[0, 0.577, 0]} castShadow />
          <mesh geometry={CYL(0.018, 0.018, 0.34, 12)} material={satin("#E23B3B", { rough: 0.3 })} position={[0.05, 0.68, 0]} rotation={[0, 0, -0.18]} />
        </group>
      );
    }
    case "box": {
      const tex = panelTex(kind, col, lab, 512, 720, "box");
      return (
        <group>
          <mesh geometry={rbox(0.52, 0.72, 0.2, 0.012)} material={satin(shade(col, -0.15), { rough: 0.5 })} position={[0, 0.36, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.45 })} position={[0, 0.36, 0.1015]} scale={[0.5, 0.7, 1]} />
        </group>
      );
    }
    case "bottle": {
      const tex = panelTex(kind, "#FFFFFF", lab, 1024, 256, "plate");
      const prof = geoOf("bhBottle", () => new THREE.LatheGeometry([[0, 0], [0.13, 0], [0.145, 0.03], [0.15, 0.36], [0.145, 0.46], [0.09, 0.6], [0.055, 0.68], [0.05, 0.76], [0.0, 0.76]].map(([x, y]) => new THREE.Vector2(x, y)), 40));
      return (
        <group>
          <mesh geometry={prof} material={hmat(col, { rough: 0.08, metal: 0.1, opacity: 0.92 })} castShadow receiveShadow />
          <mesh geometry={CYL(0.153, 0.153, 0.18, 48, true)} material={satin("#ffffff", { map: tex, rough: 0.4 })} position={[0, 0.25, 0]} rotation={[0, Math.PI, 0]} />
          <mesh geometry={CYL(0.058, 0.058, 0.05, 24)} material={hmat("#C9A227", { rough: 0.25, metal: 0.4 })} position={[0, 0.78, 0]} castShadow />
          <mesh geometry={PLANE()} material={hmat("#ffffff", { rough: 0.05, opacity: 0.35 })} position={[-0.07, 0.32, 0.135]} rotation={[0, -0.45, 0]} scale={[0.03, 0.34, 1]} />
        </group>
      );
    }
    case "phone": {
      const tex = screenTex("phone", lab);
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.08, 0, 0]}>
          <mesh geometry={rbox(0.44, 0.88, 0.05, 0.06)} material={satin(col, { rough: 0.25, metal: 0.2 })} position={[0, 0.44, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={hmat("#ffffff", { map: tex, emissive: "#ffffff", emissiveMap: tex, ei: 0.9, rough: 0.15 })} position={[0, 0.44, 0.0255]} scale={[0.4, 0.82, 1]} />
          <mesh geometry={rbox(0.1, 0.025, 0.004, 0.01)} material={hmat("#05070A", { rough: 0.2 })} position={[0, 0.83, 0.028]} />
          <mesh geometry={rbox(0.014, 0.6, 0.05, 0.007)} material={satin(shade(col, 0.2), { rough: 0.2, metal: 0.2 })} position={[0.226, 0.5, 0]} />
        </group>
      );
    }
    case "case": {
      const tex = panelTex(kind, col, lab, 512, 800, "case");
      return (
        <group position={[0, 0, 0]} rotation={[-0.06, 0, 0]}>
          <mesh geometry={rbox(0.52, 0.78, 0.08, 0.02)} material={satin("#111318", { rough: 0.25 })} position={[0, 0.39, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.18 })} position={[0, 0.39, 0.0405]} scale={[0.49, 0.75, 1]} />
        </group>
      );
    }
    case "camera": {
      const tex = panelTex(kind, "#ECE6D8", lab, 512, 128, "plate");
      return (
        <group>
          <mesh geometry={rbox(0.78, 0.44, 0.26, 0.05)} material={satin("#C9CDD4", { rough: 0.25, metal: 0.3 })} position={[0, 0.24, 0]} castShadow receiveShadow />
          <mesh geometry={rbox(0.79, 0.25, 0.265, 0.02)} material={satin(col, { rough: 0.7 })} position={[0, 0.2, 0]} />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.4 })} position={[-0.25, 0.39, 0.1325]} scale={[0.22, 0.055, 1]} />
          <mesh geometry={CYL(0.15, 0.16, 0.2, 40)} material={hmat("#16171B", { rough: 0.35 })} position={[0.02, 0.22, 0.22]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={CYL(0.12, 0.12, 0.012, 40)} material={hmat("#3B5B8C", { rough: 0.02, metal: 0.4 })} position={[0.02, 0.22, 0.325]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={CYL(0.06, 0.06, 0.014, 28)} material={hmat("#9DC3F0", { rough: 0.0, opacity: 0.6 })} position={[-0.02, 0.25, 0.333]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={CYL(0.06, 0.06, 0.06, 24)} material={silver} position={[0.26, 0.49, 0]} />
          <mesh geometry={CYL(0.035, 0.035, 0.05, 20)} material={hmat("#B3261E", { rough: 0.3 })} position={[-0.27, 0.485, 0]} />
          <mesh geometry={rbox(0.16, 0.08, 0.02, 0.01)} material={hmat("#F2F5FA", { rough: 0.1, emissive: "#ffffff", ei: 0.25 })} position={[0.24, 0.38, 0.135]} />
        </group>
      );
    }
    case "shoe": {
      // a sneaker in side view (length along x, toe toward +x): a thick white cupsole with a grey tread, the coloured
      // upper, a white toe cap, a tongue and laces on top, a heel tab, the label on the side panel (both sides)
      const tex = panelTex(kind, col, lab, 512, 160, "side");
      const white = satin("#F4F4F2", { rough: 0.55 });
      const dark = satin(shade(col, -0.45), { rough: 0.6 });
      return (
        <group>
          <mesh geometry={rbox(0.92, 0.03, 0.33, 0.012)} material={satin("#6B7280", { rough: 0.9 })} position={[0, 0.015, 0]} castShadow receiveShadow />
          <mesh geometry={rbox(0.92, 0.1, 0.34, 0.045)} material={white} position={[0, 0.075, 0]} castShadow receiveShadow />
          <mesh geometry={rbox(0.66, 0.2, 0.3, 0.08)} material={satin(col, { rough: 0.55 })} position={[-0.11, 0.21, 0]} castShadow />
          <mesh geometry={SPH()} material={white} position={[0.27, 0.15, 0]} scale={[0.2, 0.085, 0.15]} castShadow />
          <mesh geometry={SPH()} material={satin(col, { rough: 0.55 })} position={[0.16, 0.19, 0]} scale={[0.17, 0.09, 0.148]} castShadow />
          <mesh geometry={rbox(0.26, 0.13, 0.3, 0.05)} material={satin(col, { rough: 0.55 })} position={[-0.32, 0.35, 0]} castShadow />
          <mesh geometry={rbox(0.2, 0.03, 0.2, 0.012)} material={satin("#1B1D22", { rough: 0.8 })} position={[-0.3, 0.415, 0]} />
          <mesh geometry={rbox(0.12, 0.2, 0.16, 0.04)} material={dark} position={[-0.16, 0.36, 0]} rotation={[0, 0, 0.5]} />
          <mesh geometry={rbox(0.06, 0.12, 0.1, 0.02)} material={dark} position={[-0.45, 0.37, 0]} />
          {[0, 1, 2, 3].map((k) => <mesh key={k} geometry={rbox(0.035, 0.018, 0.27, 0.008)} material={white} position={[-0.05 + k * 0.07, 0.32 - k * 0.03, 0]} rotation={[0, 0, -0.42]} castShadow />)}
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.5 })} position={[-0.12, 0.2, 0.151]} scale={[0.4, 0.125, 1]} />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.5 })} position={[-0.12, 0.2, -0.151]} rotation={[0, Math.PI, 0]} scale={[0.4, 0.125, 1]} />
        </group>
      );
    }
    case "burger": {
      const tex = panelTex(kind, col, lab, 512, 220, "plate");
      const lid = 1.05 + 0.04 * Math.sin(t * 1.6 + seed);
      return (
        <group>
          <mesh geometry={rbox(0.62, 0.2, 0.56, 0.04)} material={satin(col, { rough: 0.6 })} position={[0, 0.1, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.55 })} position={[0, 0.1, 0.2805]} scale={[0.56, 0.18, 1]} />
          {/* the lid hinged at the back, swung open */}
          <group position={[0, 0.2, -0.28]} rotation={[-lid, 0, 0]}>
            <mesh geometry={rbox(0.62, 0.16, 0.56, 0.04)} material={satin(col, { rough: 0.6 })} position={[0, 0.0, 0.28]} castShadow />
            <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.55 })} position={[0, 0.0805, 0.28]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.5, 0.2, 1]} />
          </group>
          {/* the burger */}
          <group position={[0, 0.2, 0.02]}>
            <mesh geometry={CYL(0.2, 0.19, 0.05, 32)} material={satin("#D99A4E", { rough: 0.6 })} position={[0, 0.03, 0]} />
            <mesh geometry={CYL(0.215, 0.215, 0.05, 32)} material={satin("#5A3222", { rough: 0.8 })} position={[0, 0.08, 0]} />
            <mesh geometry={rbox(0.4, 0.012, 0.4, 0.004)} material={satin("#F6C343", { rough: 0.4 })} position={[0, 0.11, 0]} rotation={[0, 0.6, 0]} />
            <mesh geometry={CYL(0.225, 0.225, 0.02, 24)} material={satin("#5DB548", { rough: 0.6 })} position={[0, 0.125, 0]} />
            <mesh geometry={SPH()} material={satin("#E1A257", { rough: 0.5 })} position={[0, 0.15, 0]} scale={[0.21, 0.11, 0.21]} />
            {Array.from({ length: 10 }, (_, k) => <mesh key={k} geometry={SPH()} material={satin("#FFF3D6", { rough: 0.6 })} position={[0.13 * Math.cos(k * 2.4), 0.21 + 0.03 * hash(k), 0.13 * Math.sin(k * 2.4)]} scale={[0.012, 0.006, 0.006]} />)}
          </group>
        </group>
      );
    }
    case "laptop": {
      const tex = screenTex("laptop", lab);
      const keys = canvasTexture("bhKeys", 256, 160, (g, W, H) => { g.fillStyle = "#2A2E36"; g.fillRect(0, 0, W, H); g.fillStyle = "#454B57"; for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) g.fillRect(6 + c * 19, 8 + r * 20, 15, 15); g.fillRect(70, 110, 116, 15); });
      return (
        <group>
          <mesh geometry={rbox(1.0, 0.04, 0.68, 0.02)} material={satin(col, { rough: 0.3, metal: 0.3 })} position={[0, 0.02, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={hmat("#ffffff", { map: keys, rough: 0.6 })} position={[0, 0.0405, -0.08]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.86, 0.36, 1]} />
          <mesh geometry={PLANE()} material={satin(shade(col, -0.1), { rough: 0.4 })} position={[0, 0.0405, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.3, 0.16, 1]} />
          <group position={[0, 0.04, -0.33]} rotation={[-0.28, 0, 0]}>
            <mesh geometry={rbox(1.0, 0.64, 0.03, 0.02)} material={satin(col, { rough: 0.3, metal: 0.3 })} position={[0, 0.32, 0]} castShadow />
            <mesh geometry={PLANE()} material={hmat("#ffffff", { map: tex, emissive: "#ffffff", emissiveMap: tex, ei: 0.9, rough: 0.15 })} position={[0, 0.33, 0.0155]} scale={[0.92, 0.575, 1]} />
          </group>
        </group>
      );
    }
    case "card": {
      const tex = panelTex(kind, col, lab, 860, 540, "card");
      return (
        <group position={[0, 0.03, 0]} rotation={[-0.12, 0, 0]}>
          <mesh geometry={rbox(0.86, 0.54, 0.018, 0.04)} material={satin(col, { rough: 0.2, metal: 0.25 })} position={[0, 0.27, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.18, metal: 0.1 })} position={[0, 0.27, 0.0095]} scale={[0.84, 0.525, 1]} />
          <mesh geometry={rbox(0.5, 0.06, 0.12, 0.02)} material={hmat("#20242C", { rough: 0.5 })} position={[0, 0.0, 0.0]} />
        </group>
      );
    }
    case "bag": {
      const tex = panelTex(kind, col, lab, 512, 560, "bag");
      const rope = hmat(shade(col, -0.45), { rough: 0.7 });
      return (
        <group>
          <mesh geometry={rbox(0.56, 0.62, 0.26, 0.01)} material={satin(col, { rough: 0.75 })} position={[0, 0.31, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={satin("#ffffff", { map: tex, rough: 0.7 })} position={[0, 0.31, 0.1305]} scale={[0.54, 0.6, 1]} />
          {[0.07, -0.07].map((z) => <mesh key={z} geometry={geoOf("bhRope", () => new THREE.TorusGeometry(0.11, 0.012, 8, 28, Math.PI))} material={rope} position={[0, 0.62, z]} />)}
          <mesh geometry={rbox(0.56, 0.02, 0.27, 0.005)} material={satin(shade(col, -0.2), { rough: 0.7 })} position={[0, 0.615, 0]} />
        </group>
      );
    }
    case "letter": {
      const tex = docTex(`biz${seed}`, label ?? D.label, lines, { paper: col, ink: "#141414", accent: "#B3261E", rule: "#8C8577" });
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.12, 0, 0.02 * Math.sin(t * 0.9 + seed)]}>
          <mesh geometry={rbox(0.66, 0.86, 0.008, 0.003)} material={satin(col, { rough: 0.85 })} position={[0, 0.43, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={hmat("#ffffff", { map: tex, rough: 0.85 })} position={[0, 0.43, 0.0045]} scale={[0.64, 0.84, 1]} />
          <mesh geometry={rbox(0.05, 0.12, 0.02, 0.008)} material={hmat("#9AA3B0", { rough: 0.3, metal: 0.3 })} position={[-0.24, 0.84, 0.01]} />
        </group>
      );
    }
  }
  return null;
};

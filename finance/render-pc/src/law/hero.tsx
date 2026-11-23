// law3d HERO PROPS: generic, labelled close-up props a recipe opens a Court Of Weird Short on, so the first frame shows
// what the case is ABOUT (the gold rooster in a statue dispute, the hairy palm of a skin graft, the trousers of a pants
// suit), not a text placard. All procedural and ORIGINAL: no real logo, trademark artwork, seal or trade dress. The
// look is the law3d courtroom: low-poly flat-shaded pieces, wood / navy / gold, lit by the set's warm spotlight.
// Each takes `color` (the main colour), a short `label` (generic words only: "GOLD ROOSTER", "EXHIBIT A", "FOR SALE";
// brand names are refused at compile time), `lines` (paper / screen / tag body text), `at`, `scale` (or `s`) and
// `spin`, plus a few kind params: statue `species`, hand `hair` / `bandage`, house `sale`, coffee `steam`, toy and food
// `variant`, frame `photo`. Paper props (contract, evidence bag tag) always draw text: never blank paper.
// HERO SCALE: each prop is about 0.6-1.3 m (2-4x life size) so the kit's closeUp / hookZoom lenses fill the frame at
// dist 1.4-1.9; "scale": 0.3-0.4 puts one at life size on a counsel table or the bench (KIT_LAW3D.md "Hero props").
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { docTex, fitText, HERO_FONT, wrap } from "../library/hero";
import { LP } from "./palette";

export type LawHeroKind = "statue" | "hand" | "trousers" | "coffee" | "house" | "car" | "phone" | "contract" | "cash" | "bigGavel" | "evidenceBag" | "frame" | "trophy" | "toy" | "food";
export const LAW_HERO_KINDS: LawHeroKind[] = ["statue", "hand", "trousers", "coffee", "house", "car", "phone", "contract", "cash", "bigGavel", "evidenceBag", "frame", "trophy", "toy", "food"];
export type StatueSpecies = "rooster" | "dog" | "cat" | "horse" | "eagle";
export const STATUE_SPECIES: StatueSpecies[] = ["rooster", "dog", "cat", "horse", "eagle"];
export const HERO_VARIANTS: Partial<Record<LawHeroKind, string[]>> = { toy: ["doll", "ball"], food: ["burger", "fries"] };
export const HERO_PHOTOS = ["person", "house", "pants", "landscape", "dog", "car"];

/** default colour and label per kind (label "" = no text; the statue's default label is "GOLD <SPECIES>") */
export const LAW_HERO_DEFAULT: Record<LawHeroKind, { color: string; label: string; what: string }> = {
  statue: { color: LP.gold, label: "", what: "a gold animal statue on a wood plinth with a gold name plate (`species`: rooster, dog, cat, horse, eagle)" },
  hand: { color: "#d9a07a", label: "", what: "an open palm, fingers up (`hair`: true / 0-1 grows hair on the palm, `bandage`: true wraps it)" },
  trousers: { color: "#7d8494", label: "EXHIBIT A", what: "trousers on a wooden hanger with a paper evidence tag" },
  coffee: { color: "#8A5A35", label: "HOT", what: "a takeaway coffee cup, lid and kraft sleeve, steam rising (`steam`: false for a cold cup)" },
  house: { color: "#E9DCC0", label: "FOR SALE", what: "a small model house on a lawn (`sale`: true adds the sign with the label)" },
  car: { color: "#2F4A7A", label: "EXHIBIT", what: "a generic four-door sedan, the label on its plates (front and back; yaw 25-40 shows one)" },
  phone: { color: "#1A2236", label: "NEW MESSAGE", what: "a smartphone: the label on the lit screen, `lines` as message bubbles" },
  contract: { color: LP.paper, label: "CONTRACT", what: "a contract page: headline, body `lines`, signature line, a gold foil sticker and a pen" },
  cash: { color: "#9DB88E", label: "CASH", what: "banded stacks of bills, the label on the gold bands" },
  bigGavel: { color: LP.woodDark, label: "", what: "a gavel close-up: the gavel resting across its sound block (label: a plate on the block)" },
  evidenceBag: { color: "#E9F0F7", label: "ITEM 1", what: "a clear evidence bag, red seal strip, a white tag: EVIDENCE + the label + `lines`" },
  frame: { color: LP.gold, label: "", what: "a gold picture frame on a stand (`photo`: person, house, pants, landscape, dog, car); label = the plate" },
  trophy: { color: LP.gold, label: "WINNER", what: "a gold cup trophy on a wood base, the label on its plate" },
  toy: { color: "#C8463A", label: "", what: "a toy (`variant`: doll = a rag doll, ball = a striped ball); label = a price tag" },
  food: { color: "#B8322A", label: "", what: "a takeaway meal (`variant`: burger = a burger on its open box, fries = a fries carton); label on the box" },
};
/** the QA box of each kind at scale 1 (local: base on y = 0, front facing +z): centre and half extents */
export const LAW_HERO_BOX: Record<LawHeroKind, { c: V3; h: V3 }> = {
  statue: { c: [0, 0.45, 0], h: [0.32, 0.45, 0.2] },
  hand: { c: [0, 0.5, 0], h: [0.22, 0.5, 0.1] },
  trousers: { c: [0, 0.64, 0], h: [0.3, 0.63, 0.1] },
  coffee: { c: [0, 0.33, 0], h: [0.23, 0.33, 0.23] },
  house: { c: [0, 0.36, 0], h: [0.46, 0.36, 0.42] },
  car: { c: [0, 0.29, 0], h: [0.74, 0.29, 0.34] },
  phone: { c: [0, 0.46, 0], h: [0.22, 0.45, 0.07] },
  contract: { c: [0, 0.43, 0], h: [0.33, 0.43, 0.08] },
  cash: { c: [0, 0.18, 0], h: [0.42, 0.18, 0.28] },
  bigGavel: { c: [0, 0.16, 0], h: [0.52, 0.16, 0.32] },
  evidenceBag: { c: [0, 0.42, 0], h: [0.3, 0.42, 0.05] },
  frame: { c: [0, 0.45, 0], h: [0.36, 0.45, 0.12] },
  trophy: { c: [0, 0.45, 0], h: [0.3, 0.45, 0.2] },
  toy: { c: [0, 0.32, 0], h: [0.3, 0.32, 0.28] },
  food: { c: [0, 0.3, -0.02], h: [0.32, 0.3, 0.3] },
};
/** the default label of a prop (the statue's says what it is) */
export const heroDefaultLabel = (kind: LawHeroKind, species?: string) => (kind === "statue" ? `GOLD ${(species ?? "rooster").toUpperCase()}` : LAW_HERO_DEFAULT[kind].label);

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const shade = (hex: string, k: number) => { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color("#ffffff"), k); return `#${c.getHexString()}`; };
const lum = (hex: string) => { const c = new THREE.Color(hex); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; };
const inkOn = (hex: string) => (lum(hex) > 0.45 ? LP.ink : "#FFFFFF");

// ---- low-poly building blocks (flat shaded, like the cast and the set)
const flat = (c: string, rough = 0.6, o: { emissive?: string; ei?: number; map?: THREE.Texture; opacity?: number; side?: THREE.Side } = {}) =>
  plastic(c, { rough, flat: true, emissive: o.emissive, ei: o.ei, map: o.map, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity, side: o.side });
const goldM = (c: string = LP.gold) => plastic(c, { rough: 0.26, flat: true, emissive: LP.goldDeep, ei: 0.28 });
const ICO = () => geoOf("lhIco", () => new THREE.IcosahedronGeometry(1, 1));
const BOX = () => geoOf("lhBox", () => new THREE.BoxGeometry(1, 1, 1));
const PLANE = () => geoOf("lhPlane", () => new THREE.PlaneGeometry(1, 1));
const CYL = (rt: number, rb: number, h: number, seg = 8, open = false) => geoOf(`lhCyl${rt}|${rb}|${h}|${seg}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
const CONE = (r: number, h: number, seg = 5) => geoOf(`lhCone${r}|${h}|${seg}`, () => new THREE.ConeGeometry(r, h, seg));
type MeshP = { p: V3; s: V3 | number; r?: V3; m: THREE.Material; shadow?: boolean };
/** an ellipsoid (a low-poly ball scaled) */
const Ell: React.FC<MeshP> = ({ p, s, r, m, shadow = true }) => <mesh geometry={ICO()} material={m} position={p} rotation={r ?? [0, 0, 0]} scale={s} castShadow={shadow} receiveShadow />;
/** a box (centre, full size) */
const Bx: React.FC<MeshP> = ({ p, s, r, m, shadow = true }) => <mesh geometry={BOX()} material={m} position={p} rotation={r ?? [0, 0, 0]} scale={s} castShadow={shadow} receiveShadow />;
/** a limb: a cylinder from a to b, radius r */
const Limb: React.FC<{ a: V3; b: V3; r: number; m: THREE.Material; seg?: number }> = ({ a, b, r, m, seg = 6 }) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const L = d.length() || 1e-3;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return <mesh geometry={CYL(r, r * 0.9, 1, seg)} material={m} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} quaternion={q} scale={[1, L, 1]} castShadow />;
};

/** a plate texture: gold (engraved dark text) or paper (ink) with the label */
const plateTex = (label: string, look: "gold" | "paper" | "red" | "navy", W = 512, H = 128) => canvasTexture(`lhPlate|${label}|${look}|${W}x${H}`, W, H, (g) => {
  if (look === "gold") { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, LP.goldSoft); gr.addColorStop(0.5, LP.gold); gr.addColorStop(1, LP.goldDeep); g.fillStyle = gr; }
  else g.fillStyle = look === "paper" ? LP.paper : look === "red" ? LP.red : LP.navy;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = look === "gold" ? "rgba(60,40,10,0.6)" : look === "paper" ? "rgba(26,20,16,0.5)" : "rgba(255,255,255,0.6)"; g.lineWidth = Math.max(4, H * 0.05); g.strokeRect(H * 0.07, H * 0.07, W - H * 0.14, H - H * 0.14);
  g.fillStyle = look === "gold" ? "#2a1c08" : look === "paper" ? LP.ink : "#FFFFFF"; g.textAlign = "center"; g.textBaseline = "middle";
  fitText(g, label.toUpperCase(), Math.round(H * 0.56), W * 0.86); g.fillText(label.toUpperCase(), W / 2, H * 0.54);
});
const Plate: React.FC<{ label: string; look?: "gold" | "paper" | "red" | "navy"; p: V3; w: number; h: number; r?: V3 }> = ({ label, look = "gold", p, w, h, r }) => (
  <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: look === "gold" ? 0.3 : 0.8, map: plateTex(label, look, 512, Math.round((512 * h) / w)) })} position={p} rotation={r ?? [0, 0, 0]} scale={[w, h, 1]} />
);
/** the wood plinth with a gold label plate (statue, trophy) */
const Plinth: React.FC<{ w: number; h: number; d: number; label: string }> = ({ w, h, d, label }) => (
  <>
    <mesh geometry={rbox(w, h, d, 0.015)} material={flat(LP.woodDark, 0.5)} position={[0, h / 2, 0]} castShadow receiveShadow />
    <mesh geometry={rbox(w + 0.04, 0.03, d + 0.04, 0.01)} material={flat(LP.wood, 0.5)} position={[0, 0.015, 0]} receiveShadow />
    <mesh geometry={rbox(w - 0.04, 0.02, d - 0.04, 0.008)} material={goldM()} position={[0, h + 0.01, 0]} />
    {label ? <Plate label={label} p={[0, h * 0.5, d / 2 + 0.002]} w={w * 0.82} h={Math.min(h * 0.62, w * 0.82 * 0.25)} /> : null}
  </>
);

// ------------------------------------------------------------------ the statue animals (gold, on a plinth top y = PL)
const PL = 0.2;
const Animal: React.FC<{ species: StatueSpecies; m: THREE.Material; t: number }> = ({ species, m }) => {
  const y = PL;
  switch (species) {
    case "rooster":
      // side profile (head toward +x): legs, a plump body, the sickle tail fanned up and back, a comb, beak and wattle
      return (
        <>
          {[-1, 1].map((k) => <Limb key={k} a={[0.02, y + 0.01, k * 0.05]} b={[0.0, y + 0.17, k * 0.045]} r={0.018} m={m} />)}
          {[-1, 1].map((k) => <Bx key={`f${k}`} p={[0.04, y + 0.012, k * 0.05]} s={[0.09, 0.022, 0.05]} m={m} />)}
          <Ell p={[0, y + 0.3, 0]} s={[0.2, 0.15, 0.13]} r={[0, 0, -0.18]} m={m} />
          <Ell p={[0.02, y + 0.31, 0.105]} s={[0.15, 0.08, 0.03]} r={[0, 0, -0.15]} m={m} />
          <Ell p={[0.02, y + 0.31, -0.105]} s={[0.15, 0.08, 0.03]} r={[0, 0, -0.15]} m={m} />
          <Ell p={[0.14, y + 0.44, 0]} s={[0.075, 0.13, 0.075]} r={[0, 0, -0.35]} m={m} />
          <Ell p={[0.19, y + 0.57, 0]} s={0.07} m={m} />
          {[0, 1, 2, 3].map((k) => <Ell key={`c${k}`} p={[0.14 + k * 0.035, y + 0.645 - Math.abs(k - 1.5) * 0.012, 0]} s={[0.026, 0.04, 0.018]} m={m} />)}
          <mesh geometry={CONE(0.028, 0.07, 4)} material={m} position={[0.27, y + 0.565, 0]} rotation={[0, 0, -Math.PI / 2]} />
          <Ell p={[0.215, y + 0.5, 0]} s={[0.025, 0.045, 0.02]} m={m} />
          {/* tail: six sickle feathers fanned from the rump */}
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = 0.35 + k * 0.22, len = 0.2 + 0.04 * Math.sin(k * 1.7);
            return <Ell key={`t${k}`} p={[-0.17 - Math.cos(a) * len * 0.45, y + 0.36 + Math.sin(a) * len * 0.55, (k % 2 ? 0.025 : -0.025)]} s={[0.035, len * 0.55, 0.022]} r={[0, 0, a - Math.PI / 2 + 0.4]} m={m} />;
          })}
        </>
      );
    case "dog":
      return (
        <>
          {[[0.14, 0.06], [0.14, -0.06], [-0.14, 0.06], [-0.14, -0.06]].map(([x, z], k) => <Limb key={k} a={[x, y, z]} b={[x * 0.95, y + 0.24, z]} r={0.03} m={m} />)}
          <Ell p={[0, y + 0.3, 0]} s={[0.22, 0.1, 0.1]} m={m} />
          <Ell p={[0.17, y + 0.42, 0]} s={[0.07, 0.11, 0.07]} r={[0, 0, -0.5]} m={m} />
          <Ell p={[0.24, y + 0.5, 0]} s={[0.085, 0.075, 0.075]} m={m} />
          <Bx p={[0.32, y + 0.48, 0]} s={[0.11, 0.06, 0.07]} m={m} />
          <Ell p={[0.375, y + 0.495, 0]} s={0.022} m={m} />
          {[-1, 1].map((k) => <Ell key={`e${k}`} p={[0.21, y + 0.53, k * 0.065]} s={[0.035, 0.07, 0.02]} r={[k * 0.3, 0, 0.35]} m={m} />)}
          <Limb a={[-0.2, y + 0.33, 0]} b={[-0.3, y + 0.46, 0]} r={0.02} m={m} />
        </>
      );
    case "cat":
      // sitting, facing the lens: body, front legs, head with pointed ears, the tail curled round the paws
      return (
        <>
          <Ell p={[0, y + 0.19, -0.02]} s={[0.14, 0.18, 0.12]} m={m} />
          {[-1, 1].map((k) => <Limb key={k} a={[k * 0.05, y, 0.075]} b={[k * 0.045, y + 0.2, 0.06]} r={0.024} m={m} />)}
          {[-1, 1].map((k) => <Ell key={`p${k}`} p={[k * 0.05, y + 0.015, 0.095]} s={[0.03, 0.018, 0.04]} m={m} />)}
          <Ell p={[0, y + 0.43, 0.01]} s={[0.1, 0.09, 0.09]} m={m} />
          {[-1, 1].map((k) => <mesh key={`e${k}`} geometry={CONE(0.035, 0.08, 4)} material={m} position={[k * 0.058, y + 0.52, 0.0]} rotation={[0, 0, -k * 0.25]} />)}
          <Ell p={[0, y + 0.41, 0.085]} s={[0.035, 0.025, 0.02]} m={m} />
          <mesh geometry={geoOf("lhCatTail", () => new THREE.TorusGeometry(0.13, 0.022, 5, 12, Math.PI * 1.1))} material={m} position={[0, y + 0.03, 0.0]} rotation={[Math.PI / 2, 0, 0.3]} />
        </>
      );
    case "horse":
      return (
        <>
          {[[0.16, 0.06], [0.16, -0.06], [-0.16, 0.06], [-0.16, -0.06]].map(([x, z], k) => <Limb key={k} a={[x + (k === 0 ? 0.04 : 0), y, z]} b={[x, y + 0.3, z]} r={0.022} m={m} />)}
          <Ell p={[0, y + 0.38, 0]} s={[0.24, 0.1, 0.09]} m={m} />
          <Limb a={[0.16, y + 0.4, 0]} b={[0.25, y + 0.6, 0]} r={0.05} m={m} />
          <Bx p={[0.31, y + 0.6, 0]} s={[0.17, 0.065, 0.07]} r={[0, 0, -0.55]} m={m} />
          {[-1, 1].map((k) => <mesh key={`e${k}`} geometry={CONE(0.02, 0.06, 4)} material={m} position={[0.24, y + 0.68, k * 0.025]} />)}
          <Bx p={[0.19, y + 0.55, 0]} s={[0.04, 0.22, 0.03]} r={[0, 0, -0.45]} m={m} />
          <Limb a={[-0.23, y + 0.42, 0]} b={[-0.32, y + 0.2, 0]} r={0.028} m={m} />
        </>
      );
    case "eagle":
      // facing the lens, wings spread and raised, on a perch
      return (
        <>
          <Limb a={[-0.18, y + 0.06, 0.02]} b={[0.18, y + 0.06, 0.02]} r={0.03} m={m} />
          {[-1, 1].map((k) => <Limb key={`l${k}`} a={[k * 0.04, y + 0.06, 0.02]} b={[k * 0.035, y + 0.17, 0]} r={0.018} m={m} />)}
          <Ell p={[0, y + 0.3, 0]} s={[0.1, 0.17, 0.08]} m={m} />
          <Ell p={[0, y + 0.5, 0.02]} s={0.068} m={m} />
          <mesh geometry={CONE(0.026, 0.07, 4)} material={m} position={[0, y + 0.48, 0.095]} rotation={[Math.PI / 2 + 0.5, 0, 0]} />
          {[-1, 1].map((k) => (
            <group key={`w${k}`}>
              <Bx p={[k * 0.17, y + 0.38, -0.02]} s={[0.22, 0.07, 0.03]} r={[0, 0, k * 0.35]} m={m} />
              <Bx p={[k * 0.33, y + 0.49, -0.03]} s={[0.17, 0.06, 0.025]} r={[0, 0, k * 0.75]} m={m} />
              {[0, 1, 2].map((f) => <Bx key={f} p={[k * (0.24 + f * 0.06), y + 0.34 + f * 0.05, -0.03]} s={[0.035, 0.13, 0.02]} r={[0, 0, k * (0.25 + f * 0.12)]} m={m} />)}
            </group>
          ))}
          <Bx p={[0, y + 0.13, -0.05]} s={[0.12, 0.1, 0.02]} r={[0.3, 0, 0]} m={m} />
        </>
      );
  }
};

// ------------------------------------------------------------------ textures
const paperTagTex = (label: string, lines: readonly string[] | undefined, head: string, headCol: string) => canvasTexture(`lhTag|${label}|${(lines ?? []).join("¦")}|${head}|${headCol}`, 400, 520, (g, W, H) => {
  g.fillStyle = "#FBF8F1"; g.fillRect(0, 0, W, H);
  g.fillStyle = headCol; g.fillRect(0, 0, W, H * 0.2);
  g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.textBaseline = "middle";
  fitText(g, head, Math.round(H * 0.12), W * 0.86); g.fillText(head, W / 2, H * 0.105);
  g.fillStyle = LP.ink; fitText(g, label.toUpperCase(), Math.round(H * 0.15), W * 0.86); g.fillText(label.toUpperCase(), W / 2, H * 0.34);
  g.fillStyle = "rgba(26,20,16,0.45)"; g.fillRect(W * 0.08, H * 0.44, W * 0.84, 3);
  g.textAlign = "left"; g.fillStyle = LP.ink;
  const body = lines && lines.length ? lines : ["CASE NO. ______", "DATE  ______", "BY  ______"];
  let y = H * 0.53;
  for (const l of body.slice(0, 4)) { fitText(g, l.toUpperCase(), Math.round(H * 0.07), W * 0.84, "bold"); g.fillText(l.toUpperCase(), W * 0.08, y); y += H * 0.115; }
});
const screenTex = (label: string, lines: readonly string[] | undefined) => canvasTexture(`lhScreen|${label}|${(lines ?? []).join("¦")}`, 360, 720, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1F3560"); gr.addColorStop(1, "#0B1426"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "rgba(255,255,255,0.85)"; g.font = `bold ${Math.round(W * 0.07)}px ${HERO_FONT}`; g.fillText("9:41", W / 2, H * 0.05);
  g.fillStyle = LP.gold; g.beginPath(); g.roundRect(W * 0.07, H * 0.11, W * 0.86, H * 0.2, W * 0.06); g.fill();
  g.fillStyle = LP.ink; fitText(g, label.toUpperCase(), Math.round(W * 0.15), W * 0.76); g.fillText(label.toUpperCase(), W / 2, H * 0.21);
  const body = lines && lines.length ? lines : ["See you in court.", "Who sent this?"];
  let y = H * 0.38;
  body.slice(0, 4).forEach((l, i) => {
    const mine = i % 2 === 1, bw = W * 0.74, bh = H * 0.11;
    g.font = `bold ${Math.round(W * 0.06)}px ${HERO_FONT}`;
    const tl = wrap(g, l, bw - W * 0.08).slice(0, 2);
    const hh = bh * (tl.length > 1 ? 1.5 : 1);
    g.fillStyle = mine ? "#2F6FD8" : "#F3EAD7"; g.beginPath(); g.roundRect(mine ? W * 0.2 : W * 0.06, y, bw, hh, W * 0.05); g.fill();
    g.fillStyle = mine ? "#FFFFFF" : LP.ink; g.textAlign = "left";
    tl.forEach((x, k) => g.fillText(x, (mine ? W * 0.2 : W * 0.06) + W * 0.04, y + hh / (tl.length + 1) * (k + 1)));
    y += hh + H * 0.03;
  });
});
const photoTex = (kind: string) => canvasTexture(`lhPhoto|${kind}`, 384, 480, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#6C86AA"); gr.addColorStop(1, "#2B3A55"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "#3E5A3A"; g.fillRect(0, H * 0.78, W, H * 0.22);
  switch (kind) {
    case "house": g.fillStyle = "#E9DCC0"; g.fillRect(W * 0.22, H * 0.46, W * 0.56, H * 0.34); g.fillStyle = "#7a2e22"; g.beginPath(); g.moveTo(W * 0.16, H * 0.47); g.lineTo(W * 0.5, H * 0.24); g.lineTo(W * 0.84, H * 0.47); g.fill(); g.fillStyle = LP.navy; g.fillRect(W * 0.44, H * 0.6, W * 0.12, H * 0.2); g.fillStyle = LP.goldSoft; g.fillRect(W * 0.28, H * 0.54, W * 0.1, H * 0.08); g.fillRect(W * 0.62, H * 0.54, W * 0.1, H * 0.08); break;
    case "pants": g.fillStyle = "#3c414c"; g.beginPath(); g.moveTo(W * 0.32, H * 0.14); g.lineTo(W * 0.68, H * 0.14); g.lineTo(W * 0.74, H * 0.86); g.lineTo(W * 0.56, H * 0.86); g.lineTo(W * 0.5, H * 0.36); g.lineTo(W * 0.44, H * 0.86); g.lineTo(W * 0.26, H * 0.86); g.closePath(); g.fill(); break;
    case "landscape": g.fillStyle = "#F6D88E"; g.beginPath(); g.arc(W * 0.72, H * 0.28, W * 0.09, 0, Math.PI * 2); g.fill(); g.fillStyle = "#4C6B4A"; g.beginPath(); g.moveTo(0, H * 0.8); g.lineTo(W * 0.35, H * 0.42); g.lineTo(W * 0.62, H * 0.8); g.fill(); g.fillStyle = "#5F7F57"; g.beginPath(); g.moveTo(W * 0.35, H * 0.8); g.lineTo(W * 0.7, H * 0.5); g.lineTo(W, H * 0.8); g.fill(); break;
    case "dog": g.fillStyle = "#B07A45"; g.beginPath(); g.ellipse(W * 0.5, H * 0.62, W * 0.24, H * 0.12, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(W * 0.7, H * 0.46, W * 0.12, 0, Math.PI * 2); g.fill(); g.fillRect(W * 0.32, H * 0.66, W * 0.05, H * 0.14); g.fillRect(W * 0.62, H * 0.66, W * 0.05, H * 0.14); g.fillStyle = "#6E4626"; g.beginPath(); g.ellipse(W * 0.76, H * 0.4, W * 0.04, H * 0.07, 0.4, 0, Math.PI * 2); g.fill(); break;
    case "car": g.fillStyle = "#2F4A7A"; g.beginPath(); g.roundRect(W * 0.1, H * 0.56, W * 0.8, H * 0.14, 14); g.fill(); g.beginPath(); g.moveTo(W * 0.28, H * 0.56); g.lineTo(W * 0.36, H * 0.44); g.lineTo(W * 0.64, H * 0.44); g.lineTo(W * 0.74, H * 0.56); g.fill(); g.fillStyle = "#14161c"; for (const x of [0.28, 0.72]) { g.beginPath(); g.arc(W * x, H * 0.71, W * 0.07, 0, Math.PI * 2); g.fill(); } break;
    default: g.fillStyle = "#1A2236"; g.beginPath(); g.arc(W / 2, H * 0.4, W * 0.15, 0, Math.PI * 2); g.fill(); g.beginPath(); g.roundRect(W * 0.24, H * 0.58, W * 0.52, H * 0.3, W * 0.12); g.fill(); g.fillStyle = "#8A5A35"; g.fillRect(W * 0.47, H * 0.58, W * 0.06, H * 0.12);
  }
});
const kraftTex = (label: string) => canvasTexture(`lhKraft|${label}`, 1024, 300, (g, W, H) => {
  g.fillStyle = "#B88A56"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(90,55,32,0.18)"; for (let k = 0; k < 30; k++) g.fillRect(0, k * 10, W, 2);
  g.fillStyle = LP.ink; g.textAlign = "center"; g.textBaseline = "middle";
  fitText(g, label.toUpperCase(), Math.round(H * 0.5), W * 0.3); g.fillText(label.toUpperCase(), W / 2, H * 0.54);
});
const boxSideTex = (label: string, color: string) => canvasTexture(`lhSide|${label}|${color}`, 512, 240, (g, W, H) => {
  g.fillStyle = color; g.fillRect(0, 0, W, H);
  g.fillStyle = shade(color, -0.3); g.fillRect(0, 0, W, H * 0.12); g.fillRect(0, H * 0.88, W, H * 0.12);
  if (label) { g.fillStyle = inkOn(color); g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, label.toUpperCase(), Math.round(H * 0.5), W * 0.86); g.fillText(label.toUpperCase(), W / 2, H * 0.53); }
});
const palmTex = () => canvasTexture("lhPalm", 256, 256, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  g.strokeStyle = "rgba(90,45,25,0.45)"; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(W * 0.12, H * 0.38); g.quadraticCurveTo(W * 0.5, H * 0.3, W * 0.9, H * 0.42); g.stroke();
  g.beginPath(); g.moveTo(W * 0.12, H * 0.52); g.quadraticCurveTo(W * 0.45, H * 0.5, W * 0.72, H * 0.62); g.stroke();
  g.beginPath(); g.moveTo(W * 0.78, H * 0.36); g.quadraticCurveTo(W * 0.6, H * 0.66, W * 0.74, H * 0.95); g.stroke();
});

const steamM: THREE.MeshBasicMaterial[] = [];
const steamMat = (k: number) => { if (!steamM[k]) steamM[k] = new THREE.MeshBasicMaterial({ color: "#f4efe6", transparent: true, opacity: 0.035 * k, depthWrite: false, toneMapped: false }); return steamM[k]; };
/** a lit screen: unlit, not tone-mapped (it glows in the dark courtroom) */
const lit = new Map<string, THREE.MeshBasicMaterial>();
const litMat = (tex: THREE.Texture) => { let m = lit.get(tex.uuid); if (!m) { if (lit.size > 60) lit.clear(); m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); lit.set(tex.uuid, m); } return m; };

// ------------------------------------------------------------------ the props
export type LawHeroSpec = { kind: LawHeroKind; color?: string; label?: string; lines?: string[]; species?: string; variant?: string; hair?: boolean | number; bandage?: boolean; sale?: boolean; steam?: boolean; photo?: string };
/** a hero prop in its local frame (base on y = 0, front toward +z); a pure function of (spec, t, seed) */
export const LawHero: React.FC<{ sp: LawHeroSpec; t: number; seed: number }> = ({ sp, t, seed }) => {
  const kind = sp.kind;
  const D = LAW_HERO_DEFAULT[kind];
  const col = sp.color ?? D.color;
  const lab = (sp.label ?? heroDefaultLabel(kind, sp.species)).toUpperCase();
  switch (kind) {
    case "statue": {
      const species = (STATUE_SPECIES as string[]).includes(sp.species ?? "") ? (sp.species as StatueSpecies) : "rooster";
      return (
        <group>
          <Plinth w={0.62} h={PL} d={0.36} label={lab} />
          <group position={[0, 0.02, 0]}><Animal species={species} m={goldM(col)} t={t} /></group>
        </group>
      );
    }
    case "hand": {
      // an open right palm toward the lens, fingers up; a navy sleeve and a white cuff at the wrist
      const skin = flat(col, 0.7);
      const hairK = sp.hair === true ? 1 : typeof sp.hair === "number" ? Math.max(0, Math.min(1, sp.hair)) : 0;
      const fingers: [number, number, number][] = [[-0.105, 0.24, 0.1], [-0.035, 0.27, 0.03], [0.035, 0.26, -0.03], [0.1, 0.21, -0.1]]; // x, length, spread
      const hairM = flat("#3a2414", 0.95);
      return (
        <group>
          <mesh geometry={CYL(0.13, 0.14, 0.26, 8)} material={flat(LP.navy, 0.8)} position={[0, 0.13, -0.01]} castShadow />
          <mesh geometry={CYL(0.115, 0.13, 0.05, 8)} material={flat("#F4F1EA", 0.7)} position={[0, 0.27, -0.01]} castShadow />
          <mesh geometry={CYL(0.1, 0.11, 0.12, 8)} material={skin} position={[0, 0.34, -0.01]} castShadow />
          <mesh geometry={rbox(0.3, 0.32, 0.1, 0.04)} material={skin} position={[0, 0.54, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.8, map: palmTex(), transparent: true })} position={[0, 0.54, 0.0505]} scale={[0.27, 0.29, 1]} />
          {fingers.map(([x, len, sprd], k) => (
            <group key={k} position={[x, 0.66, 0]} rotation={[0, 0, sprd * 0.5]}>
              {/* one piece per finger (it starts inside the palm: no gap), knuckle creases drawn on it */}
              <mesh geometry={rbox(0.064, len + 0.04, 0.07, 0.028)} material={skin} position={[0, (len + 0.04) / 2, 0]} castShadow />
              {[0.5, 0.78].map((u) => <Bx key={u} p={[0, 0.04 + len * u, 0.036]} s={[0.044, 0.006, 0.002]} m={flat(shade(col, -0.35), 0.8)} shadow={false} />)}
            </group>
          ))}
          {/* the thumb: a two-piece limb out of the palm's side, joined at the knuckle */}
          <Limb a={[0.1, 0.43, 0.01]} b={[0.2, 0.53, 0.03]} r={0.036} m={skin} />
          <Ell p={[0.2, 0.53, 0.03]} s={0.036} m={skin} />
          <Limb a={[0.2, 0.53, 0.03]} b={[0.25, 0.63, 0.04]} r={0.033} m={skin} />
          <Ell p={[0.25, 0.63, 0.04]} s={0.033} m={skin} />
          {/* hair ON THE PALM (a graft): dark strands standing out of the palm face, deterministic */}
          {hairK > 0 ? Array.from({ length: Math.round(130 * hairK) }, (_, k) => {
            // strands rooted in the palm, combed downward and a little outward, curling off the surface
            const hx = (hash(k * 3 + 1) - 0.5) * 0.25, hy = 0.41 + hash(k * 5 + 2) * 0.27, len = 0.045 + 0.04 * hash(k + 7);
            const a = Math.PI + hx * 2.2 + (hash(k * 7 + 3) - 0.5) * 0.7;
            return <mesh key={`h${k}`} geometry={BOX()} material={hairM} position={[hx + Math.sin(a) * len * 0.45, hy - Math.abs(Math.cos(a)) * len * 0.4, 0.055 + len * 0.18]} rotation={[0.45 + 0.3 * hash(k + 11), 0, a]} scale={[0.0045, len, 0.0045]} />;
          }) : null}
          {sp.bandage ? (
            <>
              {[0.43, 0.5, 0.36].map((y, k) => <mesh key={`b${k}`} geometry={rbox(0.33, 0.07, 0.125, 0.02)} material={flat(k === 2 ? "#EDE6D6" : "#F7F3EA", 0.9)} position={[0, y, 0.0]} rotation={[0, 0, (k - 1) * 0.12]} castShadow />)}
              <Bx p={[0.06, 0.465, 0.066]} s={[0.07, 0.012, 0.004]} r={[0, 0, 0.6]} m={flat("#D9CBAE", 0.9)} shadow={false} />
            </>
          ) : null}
          {lab ? (
            <group position={[0.16, 0.22, 0.08]} rotation={[0, 0, 0.12 + 0.03 * Math.sin(t * 1.3 + seed)]}>
              <Limb a={[-0.06, 0.06, -0.01]} b={[0, -0.02, 0]} r={0.003} m={flat("#B9B2A4", 0.8)} seg={4} />
              <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: paperTagTex(lab, sp.lines, "EXHIBIT", LP.navy), side: THREE.DoubleSide })} position={[0.02, -0.12, 0]} scale={[0.16, 0.21, 1]} />
            </group>
          ) : null}
        </group>
      );
    }
    case "trousers": {
      const m = flat(col, 0.85), dk = flat(shade(col, -0.45), 0.8), wood = flat(LP.woodLight, 0.4);
      return (
        <group>
          <mesh geometry={geoOf("lhPWaist", () => new THREE.BoxGeometry(0.5, 0.08, 0.14))} material={flat(col, 0.7)} position={[0, 1.08, 0]} castShadow />
          <mesh geometry={geoOf("lhPSeat", () => { const g = new THREE.CylinderGeometry(0.35, 0.33, 0.22, 4); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.42); return g; })} material={m} position={[0, 0.94, 0]} castShadow />
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.125, 0.86, 0]} rotation={[0, 0, k * 0.04]}>
              <mesh geometry={geoOf("lhPLeg", () => { const g = new THREE.CylinderGeometry(0.16, 0.125, 0.8, 4, 2); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.62); g.translate(0, -0.4, 0); return g; })} material={m} castShadow />
              <Bx p={[0, -0.4, 0.077]} s={[0.012, 0.74, 0.01]} m={dk} shadow={false} />
              <mesh geometry={geoOf("lhPCuff", () => { const g = new THREE.CylinderGeometry(0.132, 0.132, 0.065, 4); g.rotateY(Math.PI / 4); g.scale(1, 1, 0.64); return g; })} material={flat(col, 0.7)} position={[0, -0.8, 0]} />
            </group>
          ))}
          {[-0.17, -0.055, 0.055, 0.17].map((x) => <Bx key={x} p={[x, 1.08, 0.073]} s={[0.02, 0.08, 0.01]} m={dk} shadow={false} />)}
          <mesh geometry={CYL(0.016, 0.016, 0.012, 8)} material={goldM()} position={[0, 1.08, 0.076]} rotation={[Math.PI / 2, 0, 0]} />
          {/* the hanger: a bar through the waist, two arms to the hook, a chrome hook */}
          <Limb a={[-0.27, 1.13, 0]} b={[0.27, 1.13, 0]} r={0.012} m={wood} />
          {[-1, 1].map((k) => <Limb key={`a${k}`} a={[k * 0.27, 1.13, 0]} b={[0, 1.27, 0]} r={0.014} m={wood} />)}
          <mesh geometry={geoOf("lhHook", () => new THREE.TorusGeometry(0.05, 0.008, 5, 14, Math.PI * 1.4))} material={plastic("#c8c8d0", { rough: 0.2 })} position={[0, 1.31, 0]} rotation={[0, 0, -0.3]} />
          {/* the evidence tag on a string from the belt loop */}
          <group position={[0.17, 1.04, 0.08]} rotation={[0, 0, 0.06 * Math.sin(t * 1.2 + seed)]}>
            <Limb a={[0, 0, 0]} b={[0.02, -0.12, 0.01]} r={0.003} m={flat("#B9B2A4", 0.8)} seg={4} />
            {lab ? <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: paperTagTex(lab, sp.lines, "EVIDENCE", LP.red), side: THREE.DoubleSide })} position={[0.03, -0.25, 0.012]} scale={[0.19, 0.25, 1]} /> : null}
          </group>
        </group>
      );
    }
    case "coffee": {
      const steam = sp.steam ?? true;
      return (
        <group>
          <mesh geometry={CYL(0.21, 0.15, 0.52, 12)} material={flat("#F4F1EA", 0.55)} position={[0, 0.26, 0]} castShadow receiveShadow />
          <mesh geometry={CYL(0.197, 0.17, 0.2, 12, true)} material={plastic("#ffffff", { rough: 0.8, map: kraftTex(lab || "HOT"), flat: true })} position={[0, 0.27, 0]} rotation={[0, Math.PI, 0]} />
          <mesh geometry={CYL(0.225, 0.225, 0.035, 12)} material={flat(col, 0.5)} position={[0, 0.535, 0]} castShadow />
          <mesh geometry={CYL(0.15, 0.21, 0.05, 12)} material={flat(col, 0.5)} position={[0, 0.577, 0]} castShadow />
          <mesh geometry={CYL(0.03, 0.03, 0.012, 8)} material={flat(shade(col, -0.4), 0.5)} position={[0.08, 0.607, 0.04]} />
          {steam ? [0, 1, 2].map((w) => Array.from({ length: 7 }, (_, k) => {
            const ph = (t * 0.45 + k / 7 + w * 0.31 + hash(seed + w)) % 1;
            const x = (w - 1) * 0.07 + 0.05 * Math.sin(ph * 7 + w * 2 + t), y = 0.64 + ph * 0.55, r = 0.025 + ph * 0.05;
            // soft wisps: faint, unlit, quantised opacity (a small material set)
            return <mesh key={`${w}-${k}`} geometry={geoOf("lhSteam", () => new THREE.SphereGeometry(1, 10, 8))} material={steamMat(Math.round(6 * Math.sin(Math.PI * ph)))} position={[x, y, 0.02 * Math.cos(ph * 5 + w)]} scale={r} />;
          })) : null}
        </group>
      );
    }
    case "house": {
      const wall = flat(col, 0.7), roof = flat("#7a2e22", 0.6), trim = flat("#F7F3EA", 0.6);
      const prism = geoOf("lhRoof", () => { const s = new THREE.Shape(); s.moveTo(-0.37, 0); s.lineTo(0.37, 0); s.lineTo(0, 0.28); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.56, bevelEnabled: false }); g.translate(0, 0, -0.28); return g; });
      const sale = sp.sale ?? false;
      return (
        <group>
          <mesh geometry={rbox(0.92, 0.05, 0.84, 0.01)} material={flat("#4d6b3c", 0.95)} position={[0, 0.025, 0]} receiveShadow />
          <Bx p={[0, 0.27, -0.04]} s={[0.62, 0.42, 0.46]} m={wall} />
          <mesh geometry={prism} material={roof} position={[0, 0.48, -0.04]} castShadow />
          <Bx p={[0.18, 0.66, -0.12]} s={[0.08, 0.16, 0.08]} m={flat("#6a4a3a", 0.8)} />
          <Bx p={[0, 0.19, 0.192]} s={[0.12, 0.24, 0.02]} m={flat(LP.navy, 0.6)} />
          <Ell p={[0.035, 0.19, 0.205]} s={0.009} m={goldM()} shadow={false} />
          {[-1, 1].map((k) => (
            <group key={k}>
              <Bx p={[k * 0.2, 0.32, 0.191]} s={[0.12, 0.11, 0.02]} m={flat(LP.goldSoft, 0.3, { emissive: LP.gold, ei: 0.55 })} shadow={false} />
              <Bx p={[k * 0.2, 0.32, 0.2]} s={[0.012, 0.11, 0.01]} m={trim} shadow={false} />
              <Bx p={[k * 0.2, 0.32, 0.2]} s={[0.12, 0.012, 0.01]} m={trim} shadow={false} />
            </group>
          ))}
          <Bx p={[0, 0.06, 0.24]} s={[0.16, 0.02, 0.08]} m={flat(LP.stone, 0.9)} />
          {sale ? (
            <group position={[0.33, 0.05, 0.3]} rotation={[0, -0.25, 0]}>
              <Limb a={[0, 0, 0]} b={[0, 0.48, 0]} r={0.014} m={flat(LP.woodLight, 0.6)} />
              <Limb a={[0, 0.44, 0]} b={[-0.2, 0.44, 0]} r={0.01} m={flat(LP.woodLight, 0.6)} />
              <Bx p={[-0.11, 0.34, 0]} s={[0.22, 0.15, 0.012]} m={flat("#F7F3EA", 0.7)} />
              <Plate label={lab || "FOR SALE"} look="red" p={[-0.11, 0.34, 0.0065]} w={0.2} h={0.13} />
            </group>
          ) : null}
        </group>
      );
    }
    case "car": {
      const body = flat(col, 0.35), glass = flat("#1B2A44", 0.15), chrome = plastic("#C9CDD4", { rough: 0.25 }), tyre = flat("#14161c", 0.9);
      const cabin = geoOf("lhCabin", () => { const s = new THREE.Shape(); s.moveTo(-0.42, 0); s.lineTo(0.38, 0); s.lineTo(0.2, 0.23); s.lineTo(-0.3, 0.23); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.56, bevelEnabled: false }); g.translate(0, 0, -0.28); return g; });
      const win = geoOf("lhCabinW", () => { const s = new THREE.Shape(); s.moveTo(-0.38, 0.02); s.lineTo(0.34, 0.02); s.lineTo(0.18, 0.2); s.lineTo(-0.28, 0.2); s.closePath(); return new THREE.ShapeGeometry(s); });
      return (
        <group>
          <mesh geometry={rbox(1.42, 0.26, 0.64, 0.06)} material={body} position={[0, 0.26, 0]} castShadow receiveShadow />
          <mesh geometry={cabin} material={body} position={[-0.05, 0.385, 0]} castShadow />
          {[1, -1].map((k) => <mesh key={k} geometry={win} material={glass} position={[-0.05, 0.385, k * 0.2805]} rotation={[0, k > 0 ? 0 : Math.PI, 0]} scale={[k > 0 ? 1 : -1, 1, 1]} />)}
          {[1, -1].map((k) => <Bx key={`p${k}`} p={[-0.07, 0.48, k * 0.282]} s={[0.025, 0.19, 0.006]} m={body} shadow={false} />)}
          {[[0.46, 0.33], [0.46, -0.33], [-0.46, 0.33], [-0.46, -0.33]].map(([x, z], k) => (
            <group key={`w${k}`} position={[x, 0.14, z]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh geometry={CYL(0.14, 0.14, 0.1, 10)} material={tyre} castShadow />
              <mesh geometry={CYL(0.075, 0.075, 0.104, 8)} material={chrome} />
            </group>
          ))}
          {[1, -1].map((k) => <Bx key={`d${k}`} p={[0.05, 0.27, k * 0.321]} s={[0.006, 0.2, 0.004]} m={flat(shade(col, -0.4), 0.5)} shadow={false} />)}
          {[1, -1].map((k) => <Bx key={`h${k}`} p={[0.15, 0.32, k * 0.322]} s={[0.07, 0.015, 0.006]} m={chrome} shadow={false} />)}
          {[1, -1].map((k) => <Bx key={`l${k}`} p={[0.705, 0.3, k * 0.22]} s={[0.02, 0.06, 0.12]} m={flat("#FFF4D0", 0.2, { emissive: "#FFE9A8", ei: 0.8 })} shadow={false} />)}
          {[1, -1].map((k) => <Bx key={`r${k}`} p={[-0.705, 0.3, k * 0.22]} s={[0.02, 0.06, 0.12]} m={flat("#B8322A", 0.3, { emissive: "#B8322A", ei: 0.5 })} shadow={false} />)}
          <Bx p={[0.7, 0.17, 0]} s={[0.04, 0.07, 0.62]} m={chrome} />
          <Bx p={[-0.7, 0.17, 0]} s={[0.04, 0.07, 0.62]} m={chrome} />
          {lab ? (
            <>
              <Plate label={lab} look="paper" p={[0.722, 0.2, 0]} w={0.26} h={0.065} r={[0, Math.PI / 2, 0]} />
              <Plate label={lab} look="paper" p={[-0.722, 0.2, 0]} w={0.26} h={0.065} r={[0, -Math.PI / 2, 0]} />
            </>
          ) : null}
        </group>
      );
    }
    case "phone": {
      const tex = screenTex(lab || "NEW MESSAGE", sp.lines);
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.08, 0, 0]}>
          <mesh geometry={rbox(0.44, 0.88, 0.05, 0.06)} material={plastic(col, { rough: 0.3 })} position={[0, 0.44, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={litMat(tex)} position={[0, 0.44, 0.0255]} scale={[0.4, 0.82, 1]} />
          <mesh geometry={rbox(0.1, 0.025, 0.004, 0.01)} material={flat("#05070A", 0.2)} position={[0, 0.83, 0.028]} />
          <mesh geometry={rbox(0.014, 0.16, 0.05, 0.007)} material={flat(shade(col, 0.25), 0.3)} position={[0.226, 0.62, 0]} />
        </group>
      );
    }
    case "contract": {
      const tex = docTex(`law${seed}`, lab || "CONTRACT", sp.lines ?? ["The undersigned agree", "to the terms below.", "Payment is due in full", "on delivery.", "No refunds."], { paper: col, ink: LP.ink, accent: LP.goldDeep, rule: "#8C8577" });
      const seal = canvasTexture("lhSeal", 128, 128, (g, W) => { g.fillStyle = LP.gold; g.beginPath(); for (let k = 0; k < 32; k++) { const a = (k / 32) * Math.PI * 2, r = k % 2 ? W * 0.42 : W * 0.5; g.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } g.fill(); g.strokeStyle = LP.goldDeep; g.lineWidth = 5; g.beginPath(); g.arc(W / 2, W / 2, W * 0.3, 0, Math.PI * 2); g.stroke(); g.fillStyle = LP.goldDeep; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * Math.PI * 2, r = k % 2 ? W * 0.09 : W * 0.2; g.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } g.fill(); });
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.12, 0, 0.02 * Math.sin(t * 0.9 + seed)]}>
          <mesh geometry={rbox(0.66, 0.86, 0.008, 0.003)} material={flat(col, 0.85)} position={[0, 0.43, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: tex })} position={[0, 0.43, 0.0045]} scale={[0.64, 0.84, 1]} />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.3, map: seal, transparent: true })} position={[-0.21, 0.12, 0.006]} scale={0.13} />
          {/* a fountain pen across the signature corner */}
          <group position={[0.14, 0.12, 0.03]} rotation={[0, 0, 0.55]}>
            <mesh geometry={CYL(0.018, 0.018, 0.3, 8)} material={flat(LP.navy, 0.3)} rotation={[0, 0, Math.PI / 2]} castShadow />
            <mesh geometry={CONE(0.018, 0.06, 8)} material={goldM()} position={[0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
            <mesh geometry={CYL(0.02, 0.02, 0.025, 8)} material={goldM()} position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
          </group>
        </group>
      );
    }
    case "cash": {
      const bill = canvasTexture(`lhBill|${col}`, 256, 128, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); g.strokeStyle = shade(col, -0.55); g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = shade(col, -0.55); g.beginPath(); g.ellipse(W / 2, H / 2, 30, 38, 0, 0, Math.PI * 2); g.fill(); g.font = `bold 38px ${HERO_FONT}`; g.fillText("100", 16, 48); g.fillText("100", W - 92, H - 18); });
      const band = canvasTexture(`lhBand|${lab}`, 128, 256, (g, W, H) => { g.fillStyle = LP.gold; g.fillRect(0, 0, W, H); g.fillStyle = "#2a1c08"; g.save(); g.translate(W / 2, H / 2); g.rotate(-Math.PI / 2); g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, lab || "$", 70, H * 0.86); g.fillText(lab || "$", 0, 4); g.restore(); });
      const stacks: [number, number, number, number][] = [[-0.2, -0.12, 9, 0.05], [0.2, -0.12, 7, -0.06], [-0.2, 0.15, 6, -0.03], [0.2, 0.15, 10, 0.04], [0, 0.02, 4, 0.5]];
      return (
        <group>
          {stacks.map(([x, z, n, yaw], s) => (
            <group key={s} position={[x, s === 4 ? 0.36 : 0, z]} rotation={[0, yaw, s === 4 ? 0.06 : 0]}>
              {Array.from({ length: n }, (_, k) => <mesh key={k} geometry={rbox(0.38, 0.034, 0.19, 0.006)} material={plastic("#ffffff", { rough: 0.85, map: bill })} position={[0.004 * Math.sin(k * 3 + s), 0.017 + k * 0.035, 0.004 * Math.cos(k * 2 + s)]} rotation={[0, 0.03 * Math.sin(k * 5 + s), 0]} castShadow receiveShadow />)}
              <mesh geometry={rbox(0.08, n * 0.035 + 0.006, 0.196, 0.004)} material={plastic("#ffffff", { rough: 0.5, map: band })} position={[0, (n * 0.035) / 2, 0]} />
            </group>
          ))}
        </group>
      );
    }
    case "bigGavel": {
      const wood = flat(col, 0.4), gold = goldM();
      const rock = 0.02 * Math.sin(t * 1.4 + seed);
      return (
        <group>
          <mesh geometry={CYL(0.3, 0.32, 0.11, 14)} material={flat(LP.woodDark, 0.4)} position={[0.1, 0.055, 0.02]} castShadow receiveShadow />
          <mesh geometry={geoOf("lhBlockBand", () => new THREE.TorusGeometry(0.305, 0.013, 4, 28))} material={gold} position={[0.1, 0.085, 0.02]} rotation={[Math.PI / 2, 0, 0]} />
          {lab ? <Plate label={lab} p={[0.1, 0.05, 0.335]} w={0.22} h={0.055} /> : null}
          {/* the gavel resting across the block, the handle down to the table */}
          <group position={[0.12, 0.2, 0.04]} rotation={[0, 0.25, 0.12 + rock]}>
            <mesh geometry={CYL(0.1, 0.1, 0.44, 12)} material={wood} rotation={[Math.PI / 2, 0, 0]} castShadow />
            {[-1, 1].map((k) => <mesh key={k} geometry={CYL(0.104, 0.104, 0.035, 12)} material={gold} position={[0, 0, k * 0.15]} rotation={[Math.PI / 2, 0, 0]} />)}
            {[-1, 1].map((k) => <mesh key={`c${k}`} geometry={CYL(0.085, 0.1, 0.02, 12)} material={wood} position={[0, 0, k * 0.23]} rotation={[Math.PI / 2, 0, 0]} />)}
            <mesh geometry={CYL(0.03, 0.04, 0.72, 8)} material={flat(LP.woodLight, 0.45)} position={[-0.42, -0.05, 0]} rotation={[0, 0, Math.PI / 2 + 0.16]} castShadow />
            <mesh geometry={CYL(0.042, 0.042, 0.05, 8)} material={gold} position={[-0.1, 0.0, 0]} rotation={[0, 0, Math.PI / 2 + 0.16]} />
            <Ell p={[-0.78, -0.11, 0]} s={[0.05, 0.045, 0.045]} m={flat(LP.woodLight, 0.45)} />
          </group>
        </group>
      );
    }
    case "evidenceBag": {
      const tag = paperTagTex(lab || "ITEM 1", sp.lines, "EVIDENCE", LP.red);
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.08, 0, 0.02 * Math.sin(t * 0.8 + seed)]}>
          <mesh geometry={rbox(0.58, 0.8, 0.05, 0.02)} material={plastic(col, { rough: 0.08, transparent: true, opacity: 0.38 })} position={[0, 0.41, 0]} castShadow />
          <mesh geometry={rbox(0.58, 0.035, 0.055, 0.008)} material={flat(LP.red, 0.4)} position={[0, 0.76, 0]} />
          <mesh geometry={rbox(0.58, 0.012, 0.057, 0.004)} material={flat("#F7F3EA", 0.4)} position={[0, 0.735, 0]} />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: tag })} position={[0, 0.36, 0.0265]} scale={[0.46, 0.6, 1]} />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.05, transparent: true, opacity: 0.3 })} position={[-0.2, 0.5, 0.027]} rotation={[0, 0, 0.1]} scale={[0.04, 0.5, 1]} />
        </group>
      );
    }
    case "frame": {
      const photo = HERO_PHOTOS.includes(sp.photo ?? "") ? sp.photo! : "person";
      const g = goldM(col);
      return (
        <group position={[0, 0.02, 0]} rotation={[-0.1, 0, 0]}>
          <mesh geometry={rbox(0.72, 0.86, 0.06, 0.02)} material={g} position={[0, 0.45, 0]} castShadow receiveShadow />
          <mesh geometry={rbox(0.62, 0.76, 0.03, 0.01)} material={goldM(LP.goldDeep)} position={[0, 0.45, 0.02]} />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.5, map: photoTex(photo) })} position={[0, 0.47, 0.036]} scale={[0.54, 0.62, 1]} />
          {[-1, 1].map((kx) => [-1, 1].map((ky) => <Ell key={`${kx}${ky}`} p={[kx * 0.34, 0.45 + ky * 0.41, 0.03]} s={[0.04, 0.04, 0.02]} m={g} />))}
          {lab ? <Plate label={lab} p={[0, 0.1, 0.037]} w={0.3} h={0.06} /> : null}
          <Limb a={[0, 0.7, -0.03]} b={[0, 0.0, -0.32]} r={0.016} m={flat(LP.woodDark, 0.6)} />
        </group>
      );
    }
    case "trophy": {
      const g = goldM(col);
      const cup = geoOf("lhCup", () => new THREE.LatheGeometry([[0.0, 0], [0.06, 0], [0.07, 0.04], [0.04, 0.08], [0.035, 0.2], [0.09, 0.26], [0.17, 0.36], [0.2, 0.5], [0.19, 0.52], [0.0, 0.5]].map(([x, y]) => new THREE.Vector2(x, y)), 10));
      return (
        <group>
          <Plinth w={0.42} h={0.2} d={0.3} label={lab} />
          <mesh geometry={cup} material={g} position={[0, 0.2, 0]} castShadow receiveShadow />
          {[-1, 1].map((k) => <mesh key={k} geometry={geoOf("lhHandle", () => new THREE.TorusGeometry(0.085, 0.016, 5, 12, Math.PI * 1.2))} material={g} position={[k * 0.2, 0.6, 0]} rotation={[0, 0, k > 0 ? -0.9 : Math.PI - 0.3]} />)}
          <mesh geometry={CYL(0.21, 0.21, 0.02, 10)} material={goldM(LP.goldSoft)} position={[0, 0.71, 0]} />
          <Ell p={[0, 0.5, 0.17]} s={[0.05, 0.05, 0.01]} m={goldM(LP.goldSoft)} shadow={false} />
        </group>
      );
    }
    case "toy": {
      const v = sp.variant === "ball" ? "ball" : "doll";
      const tagEl = lab ? (
        <group position={[0.2, 0.18, 0.18]} rotation={[0, -0.3, 0.1]}>
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.85, map: plateTex(lab, "paper", 384, 192), side: THREE.DoubleSide })} scale={[0.16, 0.08, 1]} />
        </group>
      ) : null;
      if (v === "ball") {
        const stripes = canvasTexture(`lhBall|${col}`, 512, 256, (g, W, H) => { const cs = [col, "#F7F3EA", LP.gold, "#F7F3EA", "#2F6FD8", "#F7F3EA"]; cs.forEach((c, k) => { g.fillStyle = c; g.fillRect((k * W) / 6, 0, W / 6 + 1, H); }); g.fillStyle = "#F7F3EA"; g.fillRect(0, 0, W, H * 0.08); g.fillRect(0, H * 0.92, W, H * 0.08); });
        return (
          <group>
            <mesh geometry={geoOf("lhBallG", () => new THREE.SphereGeometry(0.29, 12, 8))} material={plastic("#ffffff", { rough: 0.3, map: stripes, flat: true })} position={[0, 0.3, 0]} rotation={[0.3, t * 0.4 + seed, 0.2]} castShadow receiveShadow />
            {tagEl}
          </group>
        );
      }
      const skin = flat("#F0C8A0", 0.7), dress = flat(col, 0.85), yarn = flat("#C8702A", 0.95);
      return (
        <group>
          {/* a sitting rag doll: legs forward, a dress, arms down, a round head with yarn hair and button eyes */}
          {[-1, 1].map((k) => <Limb key={`l${k}`} a={[k * 0.06, 0.05, 0.0]} b={[k * 0.08, 0.05, 0.24]} r={0.04} m={flat("#F7F3EA", 0.8)} />)}
          {[-1, 1].map((k) => <Ell key={`s${k}`} p={[k * 0.08, 0.05, 0.27]} s={[0.045, 0.04, 0.05]} m={flat(LP.ink, 0.6)} />)}
          <mesh geometry={CYL(0.09, 0.17, 0.26, 8)} material={dress} position={[0, 0.17, 0]} castShadow />
          {[-1, 1].map((k) => <Limb key={`a${k}`} a={[k * 0.1, 0.27, 0]} b={[k * 0.17, 0.12, 0.07]} r={0.03} m={skin} />)}
          <Ell p={[0, 0.42, 0]} s={0.1} m={skin} />
          {[-1, 1].map((k) => <Ell key={`e${k}`} p={[k * 0.035, 0.44, 0.09]} s={[0.014, 0.014, 0.006]} m={flat(LP.ink, 0.3)} shadow={false} />)}
          <Ell p={[0, 0.405, 0.095]} s={[0.025, 0.008, 0.005]} m={flat(LP.red, 0.5)} shadow={false} />
          {Array.from({ length: 9 }, (_, k) => { const a = -1.3 + (k / 8) * 2.6; return <Ell key={`y${k}`} p={[Math.sin(a) * 0.1, 0.44 + Math.cos(a) * 0.09, -0.02]} s={0.035} m={yarn} />; })}
          {tagEl}
        </group>
      );
    }
    case "food": {
      const v = sp.variant === "fries" ? "fries" : "burger";
      const label = sp.label !== undefined ? lab : v === "fries" ? "FRIES" : "BURGER";
      if (v === "fries") {
        const tex = boxSideTex(label, col);
        return (
          <group>
            <mesh geometry={CYL(0.2, 0.15, 0.42, 4)} material={flat(col, 0.6)} position={[0, 0.21, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.62]} castShadow receiveShadow />
            <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.6, map: tex })} position={[0, 0.22, 0.104]} rotation={[-0.06, 0, 0]} scale={[0.24, 0.13, 1]} />
            {Array.from({ length: 22 }, (_, k) => <Bx key={k} p={[(hash(k) - 0.5) * 0.22, 0.44 + hash(k + 5) * 0.12, (hash(k + 9) - 0.5) * 0.11]} s={[0.026, 0.24, 0.026]} r={[(hash(k + 2) - 0.5) * 0.4, 0, (hash(k + 4) - 0.5) * 0.5]} m={flat(k % 4 ? "#F2C45A" : "#E0A83E", 0.6)} />)}
          </group>
        );
      }
      const tex = boxSideTex(label, col);
      const lid = 1.05 + 0.04 * Math.sin(t * 1.6 + seed);
      return (
        <group>
          <mesh geometry={rbox(0.62, 0.2, 0.56, 0.03)} material={flat(col, 0.6)} position={[0, 0.1, 0]} castShadow receiveShadow />
          <mesh geometry={PLANE()} material={plastic("#ffffff", { rough: 0.55, map: tex })} position={[0, 0.1, 0.2805]} scale={[0.56, 0.18, 1]} />
          <group position={[0, 0.2, -0.28]} rotation={[-lid, 0, 0]}>
            <mesh geometry={rbox(0.62, 0.16, 0.56, 0.03)} material={flat(col, 0.6)} position={[0, 0.0, 0.28]} castShadow />
          </group>
          <group position={[0, 0.2, 0.02]}>
            <mesh geometry={CYL(0.2, 0.19, 0.05, 10)} material={flat("#D99A4E", 0.6)} position={[0, 0.03, 0]} />
            <mesh geometry={CYL(0.215, 0.215, 0.05, 10)} material={flat("#5A3222", 0.8)} position={[0, 0.08, 0]} />
            <mesh geometry={rbox(0.4, 0.012, 0.4, 0.004)} material={flat("#F6C343", 0.4)} position={[0, 0.11, 0]} rotation={[0, 0.6, 0]} />
            <mesh geometry={CYL(0.225, 0.225, 0.02, 10)} material={flat("#5DB548", 0.6)} position={[0, 0.125, 0]} />
            <Ell p={[0, 0.15, 0]} s={[0.21, 0.11, 0.21]} m={flat("#E1A257", 0.5)} />
          </group>
        </group>
      );
    }
  }
  return null;
};

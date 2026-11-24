// PROPS PACK: shared hero props for law3d, biz3d and cyber3d (src/law/hero.tsx, src/biz/hero.tsx, src/cyber/hero.tsx
// dispatch to PackHero). Living animals, gadgets, vehicles and everyday objects, so a story's SUBJECT can be on screen
// (the monkey in a selfie case, the cow in a sale-of-a-cow case, a pocket music player, a juice press).
// All procedural and ORIGINAL: generic shapes, no logo, trademark artwork or trade dress (the music player has a plain
// button row, never a click wheel or a squircle pad; the console and the headset are generic slabs).
// One geometry, themed per kit through a PackTheme the kit builds from its own palette and materials: law3d is
// low-poly flat-shaded in wood / navy / gold, biz3d is smooth satin plastic, cyber3d is dark steel with neon screens.
// Every prop takes the hero-prop fields (`color`, `label`, `lines`, `at`, `scale` / `s`, `spin`) plus a few kind
// params: monkey `holding: "camera"`, cow `spots`, `screen` (the big text on a device screen), `variant`
// (chicken: hen / rooster, shoe: sneaker / heel). Animals have an idle loop (blink + breath, and a tail, ear or head
// move). Everything is a pure function of (spec, t, seed): deterministic, no motion blur.
// HERO SCALE: like the kit hero props, about 0.6-1.5 m at scale 1 so the closeUp / hookZoom lenses fill the frame;
// PACK_LIFE gives the scale at which a prop is life size next to the kit's cast.
import React from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTexture, geoOf, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { fitText, heroLabelError, HERO_FONT } from "../library/hero";

export type PackKind =
  // animals
  | "monkey" | "cow" | "dog" | "cat" | "horse" | "pig" | "chicken" | "shark" | "bird" | "rabbit"
  // gadgets
  | "mp3Player" | "juicer" | "gameConsole" | "vrHeadset" | "smartwatch" | "drone" | "tablet" | "flipPhone" | "digitalCamera" | "laptop" | "smartSpeaker" | "headphones"
  // vehicles
  | "sedan" | "pickup" | "airplane" | "boat"
  // everyday
  | "shoppingCart" | "cashRegister" | "vendingMachine" | "pizzaBox" | "sodaBottle" | "shoe" | "wristwatch" | "ring" | "briefcase" | "suitcase";
export const PACK_KINDS: PackKind[] = [
  "monkey", "cow", "dog", "cat", "horse", "pig", "chicken", "shark", "bird", "rabbit",
  "mp3Player", "juicer", "gameConsole", "vrHeadset", "smartwatch", "drone", "tablet", "flipPhone", "digitalCamera", "laptop", "smartSpeaker", "headphones",
  "sedan", "pickup", "airplane", "boat",
  "shoppingCart", "cashRegister", "vendingMachine", "pizzaBox", "sodaBottle", "shoe", "wristwatch", "ring", "briefcase", "suitcase",
];
export type PackGroup = "animal" | "gadget" | "vehicle" | "everyday";
export const PACK_GROUP: Record<PackKind, PackGroup> = Object.fromEntries(PACK_KINDS.map((k, i) => [k, i < 10 ? "animal" : i < 22 ? "gadget" : i < 26 ? "vehicle" : "everyday"])) as Record<PackKind, PackGroup>;
export const isPackKind = (k: string): k is PackKind => (PACK_KINDS as string[]).includes(k);
/** the pack kinds a kit adds: every pack kind whose name the kit does not already have (biz3d keeps its own laptop and
 *  shoe, cyber3d its own laptop) */
export const packKindsFor = (own: readonly string[]): PackKind[] => PACK_KINDS.filter((k) => !own.includes(k));

/** default colour and label per kind, the `screen` default, and what it is (the KIT_*.md tables and the catalog) */
export const PACK_DEFAULT: Record<PackKind, { color: string; label: string; screen?: string; what: string }> = {
  monkey: { color: "#8A5A3C", label: "", what: "a sitting monkey (`holding: \"camera\"`: a selfie, the camera at arm's length and a grin)" },
  cow: { color: "#F4F1EA", label: "", what: "a standing cow (`spots`: default true; false = a plain brown cow)" },
  dog: { color: "#C98A4B", label: "", what: "a standing dog, floppy ears, wagging tail" },
  cat: { color: "#E39A4C", label: "", what: "a sitting cat, white chest, swaying tail" },
  horse: { color: "#7A4A2A", label: "", what: "a standing horse, dark mane and tail, white blaze" },
  pig: { color: "#F2A7A8", label: "", what: "a standing pig, snout, curly tail" },
  chicken: { color: "", label: "", what: "a chicken (`variant`: hen = white hen, rooster = red-brown rooster with a big comb and tail)" },
  shark: { color: "#6E8496", label: "", what: "a swimming shark (hovering), white belly, a toothy smile" },
  bird: { color: "#3B7DD8", label: "", what: "a small songbird on a branch perch" },
  rabbit: { color: "#D8CFC4", label: "", what: "a sitting rabbit, long ears, twitching nose" },
  mp3Player: { color: "#2B2F3A", label: "", screen: "NOW PLAYING", what: "a pocket music player: a screen (`screen` + `lines`) over a plain button row, earbuds on a cable" },
  juicer: { color: "#EEF0F2", label: "JUICE PACK", what: "a countertop juice press squeezing a juice pouch (the label) into a glass" },
  gameConsole: { color: "#1E2128", label: "", what: "a generic game console standing up, a controller leaning in front" },
  vrHeadset: { color: "#F2F2F0", label: "", what: "a VR headset on a display block: visor, strap, face cushion" },
  smartwatch: { color: "#1E2128", label: "", screen: "12:30", what: "a smartwatch on a display: `screen` = the big time / text, `lines` under it" },
  drone: { color: "#D8DCE0", label: "", what: "a hovering quadcopter drone, four turning rotors, a camera under the nose" },
  tablet: { color: "#2A2E36", label: "", screen: "HOME", what: "a tablet on a stand: `screen` = the title banner, an app grid, `lines`" },
  flipPhone: { color: "#3A4456", label: "", screen: "1 NEW TEXT", what: "an open flip phone: keypad below, the small screen (`screen` + `lines`) above" },
  digitalCamera: { color: "#B8BEC8", label: "", what: "a compact digital camera: lens barrel, flash, shutter button" },
  laptop: { color: "#B8BEC8", label: "", screen: "ONLINE", what: "an open laptop: `screen` + `lines` on the display" },
  smartSpeaker: { color: "#3A3F47", label: "", what: "a fabric smart speaker, a glowing ring on top" },
  headphones: { color: "#22252B", label: "", what: "over-ear headphones on a stand" },
  sedan: { color: "#2F4A7A", label: "", what: "a generic four-door sedan (label = the plates)" },
  pickup: { color: "#B03A2E", label: "", what: "a generic pickup truck, open bed (label = the plates)" },
  airplane: { color: "#C0392B", label: "", what: "a small high-wing propeller plane, white with a colour trim (label = painted on the side)" },
  boat: { color: "#1F6FB2", label: "", what: "a small motorboat on a patch of water, outboard motor (label = the name on the hull)" },
  shoppingCart: { color: "#D7262E", label: "", what: "a wire shopping cart, a coloured handle" },
  cashRegister: { color: "#D9D4C7", label: "", screen: "$12.00", what: "a cash register, drawer open with bills: `screen` = the display" },
  vendingMachine: { color: "#3A6EA5", label: "SNACKS", what: "a vending machine: glass front with rows of snacks and drinks, the label lit on top" },
  pizzaBox: { color: "#C89A5E", label: "PIZZA", what: "an open pizza box, a whole pepperoni pizza (label printed on the box)" },
  sodaBottle: { color: "#2F9E44", label: "SODA", what: "a plastic soda bottle, label band, bubbles rising" },
  shoe: { color: "", label: "", what: "a shoe (`variant`: sneaker = a lace-up sneaker, heel = a high-heel pump); label on the side" },
  wristwatch: { color: "#5A3722", label: "", screen: "10:10", what: "an analog wristwatch on a cushion: `screen` = \"HH:MM\" sets the hands" },
  ring: { color: "#E8B44A", label: "", what: "a diamond ring standing in an open ring box (color = the metal)" },
  briefcase: { color: "#3B2314", label: "", what: "a leather briefcase, gold latches (label = a luggage tag on the handle)" },
  suitcase: { color: "#2F7D8A", label: "", what: "a hard-shell rolling suitcase, handle up (label = a luggage tag)" },
};
/** variants per kind (the first is the default) */
export const PACK_VARIANTS: Partial<Record<PackKind, string[]>> = { chicken: ["hen", "rooster"], shoe: ["sneaker", "heel"] };
/** what an animal can hold */
export const PACK_HOLDING: Partial<Record<PackKind, string[]>> = { monkey: ["camera"] };
/** the kinds whose `screen` param draws on a screen */
export const PACK_SCREEN: PackKind[] = ["mp3Player", "smartwatch", "tablet", "flipPhone", "laptop", "cashRegister", "wristwatch"];
/** the QA box of each kind at scale 1 (local: base on y = 0, front facing +z): centre and half extents */
export const PACK_BOX: Record<PackKind, { c: V3; h: V3 }> = {
  monkey: { c: [0.04, 0.49, 0.04], h: [0.38, 0.49, 0.3] },
  cow: { c: [0.08, 0.56, 0.02], h: [0.8, 0.56, 0.3] },
  dog: { c: [0.04, 0.41, 0.02], h: [0.5, 0.41, 0.2] },
  cat: { c: [0, 0.4, 0], h: [0.26, 0.4, 0.22] },
  horse: { c: [0.08, 0.72, 0.02], h: [0.74, 0.72, 0.24] },
  pig: { c: [0.04, 0.33, 0.02], h: [0.46, 0.33, 0.24] },
  chicken: { c: [0, 0.38, 0], h: [0.32, 0.38, 0.2] },
  shark: { c: [-0.02, 0.44, 0], h: [0.95, 0.28, 0.34] },
  bird: { c: [0, 0.36, 0], h: [0.24, 0.36, 0.16] },
  rabbit: { c: [0, 0.46, 0.02], h: [0.24, 0.46, 0.22] },
  mp3Player: { c: [0, 0.43, 0], h: [0.3, 0.43, 0.14] },
  juicer: { c: [0, 0.47, 0], h: [0.3, 0.47, 0.27] },
  gameConsole: { c: [0, 0.35, -0.04], h: [0.34, 0.35, 0.3] },
  vrHeadset: { c: [0, 0.38, -0.06], h: [0.32, 0.38, 0.34] },
  smartwatch: { c: [0, 0.36, 0.03], h: [0.22, 0.36, 0.33] },
  drone: { c: [0, 0.44, 0], h: [0.5, 0.14, 0.5] },
  tablet: { c: [0, 0.4, -0.04], h: [0.45, 0.4, 0.15] },
  flipPhone: { c: [0, 0.47, -0.06], h: [0.18, 0.47, 0.2] },
  digitalCamera: { c: [0, 0.21, 0.04], h: [0.33, 0.21, 0.19] },
  laptop: { c: [0, 0.31, -0.08], h: [0.46, 0.31, 0.38] },
  smartSpeaker: { c: [0, 0.3, 0], h: [0.23, 0.3, 0.23] },
  headphones: { c: [0, 0.42, 0], h: [0.36, 0.42, 0.16] },
  sedan: { c: [0, 0.29, 0], h: [0.74, 0.29, 0.34] },
  pickup: { c: [0, 0.34, 0], h: [0.78, 0.34, 0.36] },
  airplane: { c: [0, 0.36, 0], h: [0.86, 0.36, 0.8] },
  boat: { c: [0, 0.27, 0], h: [0.76, 0.27, 0.32] },
  shoppingCart: { c: [0, 0.5, 0], h: [0.5, 0.5, 0.3] },
  cashRegister: { c: [0, 0.36, 0.06], h: [0.34, 0.36, 0.36] },
  vendingMachine: { c: [0, 0.76, 0], h: [0.42, 0.76, 0.32] },
  pizzaBox: { c: [0, 0.38, -0.02], h: [0.42, 0.38, 0.42] },
  sodaBottle: { c: [0, 0.48, 0], h: [0.19, 0.48, 0.19] },
  shoe: { c: [0, 0.22, 0], h: [0.47, 0.22, 0.17] },
  wristwatch: { c: [0, 0.36, 0.02], h: [0.27, 0.36, 0.3] },
  ring: { c: [0, 0.32, -0.02], h: [0.27, 0.32, 0.3] },
  briefcase: { c: [0, 0.38, 0], h: [0.42, 0.38, 0.12] },
  suitcase: { c: [0, 0.63, 0], h: [0.31, 0.63, 0.18] },
};
/** the scale at which a prop is about life size next to a kit figure (1.7-1.8 m): the animals in a scene with people */
export const PACK_LIFE: Record<PackKind, number> = {
  monkey: 0.6, cow: 1.3, dog: 0.75, cat: 0.45, horse: 1.15, pig: 1.0, chicken: 0.5, shark: 1.6, bird: 0.25, rabbit: 0.45,
  mp3Player: 0.14, juicer: 0.45, gameConsole: 0.45, vrHeadset: 0.35, smartwatch: 0.12, drone: 0.5, tablet: 0.3, flipPhone: 0.12, digitalCamera: 0.22, laptop: 0.36, smartSpeaker: 0.35, headphones: 0.45,
  sedan: 3.2, pickup: 3.4, airplane: 5.5, boat: 3.0,
  shoppingCart: 1.0, cashRegister: 0.6, vendingMachine: 1.2, pizzaBox: 0.45, sodaBottle: 0.35, shoe: 0.33, wristwatch: 0.12, ring: 0.08, briefcase: 0.55, suitcase: 0.6,
};
const SIDE_ON: PackKind[] = ["cow", "dog", "horse", "pig", "chicken", "shark", "sedan", "pickup", "airplane", "boat", "shoe", "bird"];
/** a close-up camera (closeUp preset, portrait) that frames the whole prop at scale `sc`: distance, height, azimuth.
 *  Side-on kinds (the animals walking to +x, the vehicles) are seen from 3/4 front, so the face / the front shows. */
export const packCam = (k: PackKind, sc = 1): { dist: number; h: number; az: number } => {
  const b = PACK_BOX[k], side = SIDE_ON.includes(k), az = side ? (k === "shark" || k === "airplane" ? 30 : ["cow", "dog", "horse", "pig", "chicken"].includes(k) ? 48 : 40) : 10, a = (az * Math.PI) / 180;
  const halfW = (b.h[0] * Math.cos(a) + b.h[2] * Math.sin(a)) * sc, halfH = b.h[1] * sc;
  const dist = Math.max(halfW * (k === "boat" ? 6.2 : 5.2), halfH * 3.3, 1.1) + b.h[2] * sc * 0.6;
  return { dist: Math.round(dist * 100) / 100, h: b.h[1] * sc < 0.35 ? 0.45 : side ? 0.3 : 0.12, az };
};
export const PACK_CAM: Record<PackKind, { dist: number; h: number; az: number }> = Object.fromEntries(PACK_KINDS.map((k) => [k, packCam(k)])) as Record<PackKind, { dist: number; h: number; az: number }>;

/** the gallery shots of the pack (every kit's gallery shows them all, in its own look): one per kind, then the kind
 *  params (the selfie monkey, the plain cow, the rooster, the heel); a few carry a label / screen to show where it goes */
export type PackGalleryShot = { name: string; kind: PackKind; p: { label?: string; lines?: string[]; screen?: string; holding?: string; spots?: boolean; variant?: string } };
export const PACK_GALLERY: PackGalleryShot[] = [
  ...PACK_KINDS.map((k): PackGalleryShot => ({ name: k, kind: k, p: ({
    dog: { label: "BUDDY" }, mp3Player: { label: "30 GB", lines: ["Track 07", "1:12 / 3:40"] }, sedan: { label: "EXHIBIT" }, pickup: { label: "FOR SALE" }, airplane: { label: "SKY ONE" },
    boat: { label: "SEA BREEZE" }, briefcase: { label: "EXHIBIT B" }, suitcase: { label: "LOST BAG" }, shoe: { label: "RUN" },
  } as Partial<Record<PackKind, PackGalleryShot["p"]>>)[k] ?? {} })),
  { name: "monkey-camera", kind: "monkey", p: { holding: "camera" } },
  { name: "cow-plain", kind: "cow", p: { spots: false, label: "BESSIE" } },
  { name: "chicken-rooster", kind: "chicken", p: { variant: "rooster" } },
  { name: "shoe-heel", kind: "shoe", p: { variant: "heel" } },
];
/** the gallery / close-up scale of a kind: big kinds come down to about 1.2 m across */
export const packGalleryScale = (k: PackKind) => { const b = PACK_BOX[k]; return Math.round(Math.min(1, 1.25 / (2 * Math.max(b.h[0], b.h[1], b.h[2] * 0.8))) * 100) / 100; };

/** the kind params a pack prop takes (beside color / label / lines) */
export type PackParams = { holding?: string; spots?: boolean; screen?: string; variant?: string };
/** null = ok, else the error (the kit compilers call it on every pack prop) */
export const packParamError = (kind: PackKind, p: PackParams & { [k: string]: unknown }): string | null => {
  if (p.holding !== undefined) {
    const hs = PACK_HOLDING[kind];
    if (!hs) return `"holding" is for ${Object.keys(PACK_HOLDING).join(", ")} (a ${kind} holds nothing)`;
    if (!hs.includes(p.holding)) return `a ${kind}'s "holding" is one of ${hs.join(", ")} (got "${p.holding}")`;
  }
  if (p.spots !== undefined && (kind !== "cow" || typeof p.spots !== "boolean")) return `"spots" (true / false) is for the cow`;
  if (p.variant !== undefined) {
    const vs = PACK_VARIANTS[kind];
    if (!vs) return `"variant" is for ${Object.keys(PACK_VARIANTS).map((k) => `${k} (${PACK_VARIANTS[k as PackKind]!.join(", ")})`).join(", ")}`;
    if (!vs.includes(p.variant)) return `a ${kind}'s "variant" is one of ${vs.join(", ")} (got "${p.variant}")`;
  }
  if (p.screen !== undefined) {
    if (!PACK_SCREEN.includes(kind)) return `"screen" is for ${PACK_SCREEN.join(", ")} (a ${kind} has no screen; use "label")`;
    const s = String(p.screen).trim();
    if (s.length > 18) return `screen "${s}" is ${s.length} characters: keep it <= 18 so it reads at phone size`;
    if (kind === "wristwatch" && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(s)) return `a wristwatch's "screen" is the time it shows, "HH:MM" (got "${s}")`;
    const words = s.split(/\s+/);
    for (let i = 0; i < words.length; i += 2) { const e = heroLabelError(words.slice(i, i + 2).join(" ").slice(0, 14), kind); if (e && /real brand/.test(e)) return `screen: ${e}`; }
  }
  return null;
};

// ------------------------------------------------------------------ the kit theme
export type PackMatOpts = { rough?: number; metal?: number; map?: THREE.Texture; opacity?: number; side?: THREE.Side; emissive?: string; ei?: number };
export type PackTheme = {
  kit: "law3d" | "biz3d" | "cyber3d";
  /** a lit surface material in the kit's look */
  m: (color: string, o?: PackMatOpts) => THREE.Material;
  /** an unlit glowing material (screens, LEDs, lit signs): the kit's screen / neon look */
  glow: (color: string, map?: THREE.Texture, opacity?: number) => THREE.Material;
  /** true = smooth round parts (biz3d / cyber3d), false = low-poly faceted (law3d) */
  smooth: boolean;
  /** segments of the round parts */
  seg: number;
  /** the kit accent (screen UI, LEDs, trims): law gold, biz green, cyber cyan */
  accent: string;
  /** a second accent (alerts, the record / power LED) */
  alert: string;
  /** precious metal (the ring, watch case, latches): law gold, biz / cyber silver-gold */
  gold: string;
  /** bright metal (chrome, steel) */
  chrome: string;
  /** printed paper and ink */
  paper: string;
  ink: string;
  /** the dark glass of a screen and its text colour */
  screenBg: string;
  screenInk: string;
  /** cyber3d: thin neon edge strips on the gadgets (the kit's look); off elsewhere */
  neonEdges: boolean;
};

// ------------------------------------------------------------------ helpers
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const shade = (hex: string, k: number) => { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color("#ffffff"), k); return `#${c.getHexString()}`; };
const lum = (hex: string) => { const c = new THREE.Color(hex); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; };
const inkOn = (hex: string) => (lum(hex) > 0.45 ? "#14161C" : "#FFFFFF");
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };

/** eyelid: 1 = open, ~0.1 = shut; a blink every ~3.4 s, offset by the seed (deterministic) */
export const blinkOf = (t: number, seed: number) => { const ph = (t + hash(seed) * 3.4) % 3.4; return ph < 0.14 ? 0.1 + 0.9 * Math.abs(ph - 0.07) / 0.07 : 1; };
/** breath: a slow scale pulse */
const breathOf = (t: number, seed: number, amp = 0.018) => 1 + amp * Math.sin(t * 2.3 + seed);

const PLANE = () => geoOf("pkPlane", () => new THREE.PlaneGeometry(1, 1));
const BOX = () => geoOf("pkBox", () => new THREE.BoxGeometry(1, 1, 1));
const SPH = (th: PackTheme) => (th.smooth ? geoOf("pkSph", () => new THREE.SphereGeometry(1, 22, 16)) : geoOf("pkIco", () => new THREE.IcosahedronGeometry(1, 1)));
const CYL = (th: PackTheme, rt: number, rb: number, h: number, segMul = 1, open = false) => { const seg = Math.max(6, Math.round(th.seg * segMul)); return geoOf(`pkCyl${rt}|${rb}|${h}|${seg}|${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)); };
const CONE = (th: PackTheme, r: number, h: number, seg?: number) => { const s = seg ?? Math.max(5, Math.round(th.seg * 0.6)); return geoOf(`pkCone${r}|${h}|${s}`, () => new THREE.ConeGeometry(r, h, s)); };
const TORUS = (th: PackTheme, R: number, r: number, arc = Math.PI * 2) => { const s = th.smooth ? 32 : 14; return geoOf(`pkTor${R}|${r}|${arc.toFixed(3)}|${s}`, () => new THREE.TorusGeometry(R, r, th.smooth ? 10 : 5, s, arc)); };
/** an extruded side profile (points in x/y), centred on z */
const EXTRUDE = (key: string, pts: [number, number][], depth: number, bevel = 0) => geoOf(`pkEx|${key}|${depth}|${bevel}`, () => {
  const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 }); g.translate(0, 0, -depth / 2); return g;
});

type MP = { th: PackTheme; p: V3; s: V3 | number; r?: V3; m: THREE.Material; shadow?: boolean };
/** an ellipsoid */
const Ell: React.FC<MP> = ({ th, p, s, r, m, shadow = true }) => <mesh geometry={SPH(th)} material={m} position={p} rotation={r ?? [0, 0, 0]} scale={s} castShadow={shadow} receiveShadow />;
/** a box (centre, full size), rounded when the kit is smooth */
const Bx: React.FC<MP & { round?: number }> = ({ th, p, s, r, m, shadow = true, round = 0 }) => {
  const sz: V3 = typeof s === "number" ? [s, s, s] : s;
  if (round > 0) return <mesh geometry={rbox(sz[0], sz[1], sz[2], round)} material={m} position={p} rotation={r ?? [0, 0, 0]} castShadow={shadow} receiveShadow />;
  return <mesh geometry={BOX()} material={m} position={p} rotation={r ?? [0, 0, 0]} scale={sz} castShadow={shadow} receiveShadow />;
};
/** a cylinder from a to b (radius r, tapering to r * taper) */
const Limb: React.FC<{ th: PackTheme; a: V3; b: V3; r: number; m: THREE.Material; taper?: number; ends?: boolean }> = ({ th, a, b, r, m, taper = 0.9, ends = false }) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const L = d.length() || 1e-3;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return (
    <>
      <mesh geometry={CYL(th, r * taper, r, 1, 0.5)} material={m} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} quaternion={q} scale={[1, L, 1]} castShadow />
      {ends ? <Ell th={th} p={b} s={r * taper} m={m} /> : null}
    </>
  );
};
/** a chain of limbs through points (a tail, a cable); radii taper from r0 to r1 */
const Chain: React.FC<{ th: PackTheme; pts: V3[]; r0: number; r1: number; m: THREE.Material }> = ({ th, pts, r0, r1, m }) => (
  <>{pts.slice(1).map((b, i) => { const a = pts[i], u0 = i / (pts.length - 1), u1 = (i + 1) / (pts.length - 1), ra = r0 + (r1 - r0) * u0, rb = r0 + (r1 - r0) * u1; return <React.Fragment key={i}><Limb th={th} a={a} b={b} r={ra} taper={rb / ra} m={m} /><Ell th={th} p={b} s={rb} m={m} /></React.Fragment>; })}</>
);
/** a flat texture card (a label, a screen) facing +z */
const Card: React.FC<{ p: V3; w: number; h: number; m: THREE.Material; r?: V3 }> = ({ p, w, h, m, r }) => <mesh geometry={PLANE()} material={m} position={p} rotation={r ?? [0, 0, 0]} scale={[w, h, 1]} />;

// ------------------------------------------------------------------ textures (keyed by the kit, so each kit's look is cached apart)
const labelTex = (th: PackTheme, key: string, label: string, bg: string, fg: string, W = 512, H = 160, border = true) => canvasTexture(`pkLab|${th.kit}|${key}|${label}|${bg}|${fg}|${W}x${H}|${border}`, W, H, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  if (border) { g.strokeStyle = fg; g.globalAlpha = 0.55; g.lineWidth = Math.max(3, H * 0.04); g.strokeRect(H * 0.08, H * 0.08, W - H * 0.16, H - H * 0.16); g.globalAlpha = 1; }
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  fitText(g, label.toUpperCase(), Math.round(H * 0.56), W * 0.84); g.fillText(label.toUpperCase(), W / 2, H * 0.54);
});
/** a screen: style picks the layout; title = the big text, lines = the body */
type ScreenStyle = "music" | "watch" | "tablet" | "flip" | "laptop" | "lcd";
const screenTex = (th: PackTheme, style: ScreenStyle, title: string, lines: readonly string[], W: number, H: number) => canvasTexture(`pkScr|${th.kit}|${style}|${title}|${lines.join("¦")}|${W}x${H}`, W, H, (g) => {
  const acc = th.accent, ink = th.screenInk;
  if (style === "lcd") {
    g.fillStyle = "#0B1A10"; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(124,255,138,0.08)"; for (let x = 0; x < W; x += 8) g.fillRect(x, 0, 2, H);
    g.fillStyle = "#7CFF8A"; g.textAlign = "right"; g.textBaseline = "middle";
    fitText(g, title, Math.round(H * 0.62), W * 0.88, "bold", "'DejaVu Sans Mono', monospace"); g.fillText(title, W * 0.94, H * 0.54);
    return;
  }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, shade(th.screenBg, 0.12)); gr.addColorStop(1, th.screenBg); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.textBaseline = "middle";
  const body = (ys: number, px: number, max: number, align: "center" | "left" = "center", x0 = W / 2) => {
    g.fillStyle = ink; g.textAlign = align; let y = ys;
    for (const l of lines.slice(0, max)) { fitText(g, l, px, W * 0.86, "normal"); g.fillText(l, x0, y); y += px * 1.35; }
  };
  switch (style) {
    case "music": {
      // status bar, a note icon in an accent tile, the title, the lines, a progress bar
      g.fillStyle = ink; g.globalAlpha = 0.6; g.fillRect(W * 0.82, H * 0.04, W * 0.12, H * 0.035); g.globalAlpha = 1;
      const s = W * 0.34, x = W / 2 - s / 2, y = H * 0.1;
      g.fillStyle = acc; g.beginPath(); g.roundRect(x, y, s, s, s * 0.14); g.fill();
      g.fillStyle = th.screenBg; g.beginPath(); g.ellipse(x + s * 0.36, y + s * 0.72, s * 0.13, s * 0.1, -0.3, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x + s * 0.7, y + s * 0.64, s * 0.13, s * 0.1, -0.3, 0, Math.PI * 2); g.fill();
      g.fillRect(x + s * 0.45, y + s * 0.22, s * 0.05, s * 0.5); g.fillRect(x + s * 0.79, y + s * 0.14, s * 0.05, s * 0.5);
      g.beginPath(); g.moveTo(x + s * 0.45, y + s * 0.22); g.lineTo(x + s * 0.84, y + s * 0.14); g.lineTo(x + s * 0.84, y + s * 0.26); g.lineTo(x + s * 0.45, y + s * 0.34); g.fill();
      g.fillStyle = ink; fitText(g, title.toUpperCase(), Math.round(H * 0.11), W * 0.9); g.fillText(title.toUpperCase(), W / 2, H * 0.56);
      body(H * 0.68, Math.round(H * 0.06), 2);
      g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(W * 0.1, H * 0.88, W * 0.8, H * 0.02); g.fillStyle = acc; g.fillRect(W * 0.1, H * 0.88, W * 0.5, H * 0.02);
      break;
    }
    case "watch": {
      g.fillStyle = ink; fitText(g, title, Math.round(H * 0.36), W * 0.86); g.fillText(title, W / 2, H * 0.42);
      g.strokeStyle = acc; g.lineWidth = H * 0.04; g.beginPath(); g.arc(W / 2, H * 0.42, Math.min(W, H) * 0.44, Math.PI * 0.8, Math.PI * 2.2); g.stroke();
      body(H * 0.76, Math.round(H * 0.1), 2);
      break;
    }
    case "tablet": {
      g.fillStyle = acc; g.fillRect(0, 0, W, H * 0.24);
      g.fillStyle = inkOn(acc); fitText(g, title.toUpperCase(), Math.round(H * 0.14), W * 0.9); g.fillText(title.toUpperCase(), W / 2, H * 0.125);
      const cols = 5, cw = W * 0.12, gap = (W - cols * cw) / (cols + 1);
      for (let k = 0; k < 10; k++) { const cx = gap + (k % cols) * (cw + gap), cy = H * 0.32 + Math.floor(k / cols) * (cw + H * 0.06); g.fillStyle = `hsl(${(k * 47 + 200) % 360},55%,${th.kit === "cyber3d" ? 45 : 58}%)`; g.beginPath(); g.roundRect(cx, cy, cw, cw, cw * 0.22); g.fill(); }
      body(H * 0.86, Math.round(H * 0.07), 1);
      break;
    }
    case "flip": {
      g.fillStyle = ink; for (let k = 0; k < 4; k++) g.fillRect(W * (0.06 + k * 0.04), H * (0.12 - k * 0.02), W * 0.025, H * (0.04 + k * 0.02));
      g.globalAlpha = 0.7; g.fillRect(W * 0.78, H * 0.07, W * 0.14, H * 0.06); g.globalAlpha = 1;
      g.fillStyle = acc; fitText(g, title.toUpperCase(), Math.round(H * 0.15), W * 0.9); g.fillText(title.toUpperCase(), W / 2, H * 0.34);
      body(H * 0.55, Math.round(H * 0.09), 3);
      break;
    }
    case "laptop": {
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(0, 0, W, H * 0.08);
      for (let k = 0; k < 3; k++) { g.fillStyle = ["#E5534B", "#E3B341", "#57AB5A"][k]; g.beginPath(); g.arc(W * (0.03 + k * 0.03), H * 0.04, H * 0.016, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = acc; fitText(g, title.toUpperCase(), Math.round(H * 0.17), W * 0.86); g.fillText(title.toUpperCase(), W / 2, H * 0.3);
      body(H * 0.52, Math.round(H * 0.075), 4);
      break;
    }
  }
});
/** a fine fabric weave (the speaker, the seat) */
const fabricTex = (th: PackTheme, color: string) => canvasTexture(`pkFab|${th.kit}|${color}`, 128, 128, (g, W, H) => {
  g.fillStyle = color; g.fillRect(0, 0, W, H); g.fillStyle = shade(color, -0.35);
  for (let y = 0; y < H; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < W; x += 6) g.fillRect(x, y, 2, 2);
});

// ------------------------------------------------------------------ shared bits
/** two eyes on a head that faces +z: a dark glossy ball with a white catch-light, the lid closing on a blink */
const Eyes: React.FC<{ th: PackTheme; y: number; z: number; gap: number; r: number; blink: number; iris?: string; tilt?: number }> = ({ th, y, z, gap, r, blink, iris, tilt = 0 }) => {
  const eye = th.m("#141414", { rough: 0.12 }), hi = th.glow("#FFFFFF"), ir = iris ? th.m(iris, { rough: 0.2 }) : null;
  return (
    <>{[-1, 1].map((k) => (
      <group key={k} position={[k * gap, y, z]} rotation={[0, k * 0.25, k * tilt]} scale={[1, blink, 1]}>
        {ir ? <Ell th={th} p={[0, 0, 0]} s={[r, r, r * 0.8]} m={ir} shadow={false} /> : null}
        <Ell th={th} p={[0, 0, ir ? r * 0.25 : 0]} s={ir ? [r * 0.38, r * 0.85, r * 0.7] : [r, r, r * 0.8]} m={eye} shadow={false} />
        {blink > 0.6 ? <Ell th={th} p={[r * 0.35, r * 0.38, r * 0.72]} s={r * 0.26} m={hi} shadow={false} /> : null}
      </group>
    ))}</>
  );
};
/** an animal's name tag: a collar ring with a round tag plate showing the label (only when there is a label) */
const NameTag: React.FC<{ th: PackTheme; label: string; p: V3; yaw?: number; collarR: number; size?: number; tilt?: number }> = ({ th, label, p, yaw = 0, collarR, size = 0.13, tilt = 0 }) => {
  if (!label) return null;
  const tex = labelTex(th, "tag", label, th.kit === "law3d" ? th.paper : "#FFFFFF", th.ink, 256, 256, false);
  return (
    <group position={p} rotation={[0, yaw, 0]}>
      <mesh geometry={TORUS(th, collarR, 0.018)} material={th.m("#B8322A", { rough: 0.5 })} rotation={[Math.PI / 2 + tilt, 0, 0]} />
      <group position={[0, -size * 0.55, collarR + 0.012]} rotation={[tilt * 0.5, 0, 0]}>
        <mesh geometry={CYL(th, size * 0.5, size * 0.5, 0.012)} material={th.m(th.gold, { rough: 0.3, metal: 0.4 })} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={geoOf("pkTagDisc", () => new THREE.CircleGeometry(0.5, 28))} material={th.m("#FFFFFF", { rough: 0.6, map: tex })} position={[0, 0, 0.0075]} scale={size * 0.86} />
      </group>
    </group>
  );
};
/** a paper luggage tag on a string (briefcase, suitcase) */
const LuggageTag: React.FC<{ th: PackTheme; label: string; p: V3; r?: V3 }> = ({ th, label, p, r }) => {
  if (!label) return null;
  const tex = labelTex(th, "lug", label, th.paper, th.ink, 400, 220);
  return (
    <group position={p} rotation={r ?? [0, 0, 0]}>
      <Limb th={th} a={[0, 0, 0]} b={[0, -0.08, 0.01]} r={0.004} m={th.m("#E8E2D4")} />
      <mesh geometry={rbox(0.22, 0.12, 0.006, 0.01)} material={th.m(th.paper, { rough: 0.8 })} position={[0, -0.14, 0.012]} castShadow />
      <Card p={[0, -0.14, 0.0155]} w={0.205} h={0.11} m={th.m("#FFFFFF", { rough: 0.8, map: tex })} />
    </group>
  );
};
/** a neon edge strip (cyber3d) */
const Neon: React.FC<{ th: PackTheme; p: V3; s: V3; c?: string }> = ({ th, p, s, c }) => (th.neonEdges ? <mesh geometry={BOX()} material={th.glow(c ?? th.accent)} position={p} scale={s} /> : null);
/** a lit screen card */
const Screen: React.FC<{ th: PackTheme; tex: THREE.Texture; p: V3; w: number; h: number; r?: V3 }> = ({ th, tex, p, w, h, r }) => <Card p={p} w={w} h={h} r={r} m={th.glow("#FFFFFF", tex)} />;
/** a wheel (axis along z) */
const Wheel: React.FC<{ th: PackTheme; p: V3; r: number; w: number; hub?: string }> = ({ th, p, r, w, hub }) => (
  <group position={p} rotation={[Math.PI / 2, 0, 0]}>
    <mesh geometry={CYL(th, r, r, w, 1.2)} material={th.m("#16181D", { rough: 0.9 })} castShadow />
    <mesh geometry={CYL(th, r * 0.55, r * 0.55, w * 1.04, 1)} material={th.m(hub ?? th.chrome, { rough: 0.3, metal: 0.4 })} />
  </group>
);
/** a licence plate / name panel with the label (front and back of a vehicle) */
const Plate: React.FC<{ th: PackTheme; label: string; p: V3; ry: number; w?: number; h?: number }> = ({ th, label, p, ry, w = 0.2, h = 0.07 }) =>
  label ? <Card p={p} w={w} h={h} r={[0, ry, 0]} m={th.m("#FFFFFF", { rough: 0.5, map: labelTex(th, "plate", label, "#F4F1E8", "#14161C", 400, 140) })} /> : null;

// ------------------------------------------------------------------ the animals
type AP = { th: PackTheme; col: string; label: string; t: number; seed: number; sp: PackParams };

/** the camera's back screen: the selfie it is taking (a grinning monkey face on a sky) */
const selfieTex = (th: PackTheme, col: string) => canvasTexture(`pkSelfie|${th.kit}|${col}`, 256, 170, (g, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#7EC3F0"); gr.addColorStop(1, "#5E9E4A"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = col; g.beginPath(); g.arc(W / 2, H * 0.56, H * 0.36, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(W / 2 - H * 0.36, H * 0.5, H * 0.1, 0, Math.PI * 2); g.arc(W / 2 + H * 0.36, H * 0.5, H * 0.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#E8C2A0"; g.beginPath(); g.ellipse(W / 2, H * 0.62, H * 0.27, H * 0.24, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#141414"; for (const k of [-1, 1]) { g.beginPath(); g.arc(W / 2 + k * H * 0.1, H * 0.5, H * 0.04, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#FFFFFF"; g.beginPath(); g.ellipse(W / 2, H * 0.72, H * 0.14, H * 0.06, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#FFFFFF"; g.lineWidth = 4; g.strokeRect(6, 6, W - 12, H - 12);
});
const Monkey: React.FC<AP> = ({ th, col, label, t, seed, sp }) => {
  const fur = th.m(col, { rough: 0.85 }), face = th.m("#E8C2A0", { rough: 0.7 }), dark = th.m(shade(col, -0.45), { rough: 0.8 }), brow = th.m(shade(col, -0.15), { rough: 0.8 });
  const br = breathOf(t, seed), blink = blinkOf(t, seed), cam = sp.holding === "camera";
  const sway = 0.18 * Math.sin(t * 1.4 + seed);
  // the camera hand: up and out to the right, turned back to the face (a selfie)
  const hand: V3 = cam ? [0.3, 0.84 + 0.01 * Math.sin(t * 1.1), 0.42] : [0.16, 0.2, 0.24];
  const elbow: V3 = cam ? [0.36, 0.6, 0.2] : [0.24, 0.3, 0.12];
  const headP: V3 = [0, 0.72, 0.02];
  const camQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(headP[0] - hand[0], headP[1] + 0.02 - hand[1], headP[2] + 0.1 - hand[2]).normalize());
  return (
    <group>
      {/* tail: an S curl behind, swaying */}
      <Chain th={th} pts={[[0.05, 0.12, -0.16], [0.22, 0.06, -0.26], [0.36, 0.14 + sway * 0.2, -0.24], [0.4, 0.32, -0.18 + sway * 0.3], [0.32, 0.42, -0.12 + sway * 0.4]]} r0={0.035} r1={0.022} m={fur} />
      <group scale={[1, br, 1]}>
        <Ell th={th} p={[0, 0.34, 0]} s={[0.24, 0.28, 0.2]} m={fur} />
        <Ell th={th} p={[0, 0.32, 0.1]} s={[0.17, 0.21, 0.12]} m={face} />
      </group>
      {/* folded legs, big feet */}
      {[-1, 1].map((k) => <Ell key={`l${k}`} th={th} p={[k * 0.14, 0.13, 0.1]} s={[0.1, 0.09, 0.16]} m={fur} />)}
      {[-1, 1].map((k) => <Ell key={`f${k}`} th={th} p={[k * 0.16, 0.04, 0.25]} s={[0.07, 0.04, 0.1]} m={face} />)}
      {/* left arm on the knee */}
      <Limb th={th} a={[-0.2, 0.52, 0.02]} b={[-0.25, 0.3, 0.12]} r={0.05} m={fur} ends />
      <Limb th={th} a={[-0.25, 0.3, 0.12]} b={[-0.16, 0.2, 0.24]} r={0.045} m={fur} />
      <Ell th={th} p={[-0.16, 0.2, 0.26]} s={[0.05, 0.04, 0.05]} m={face} />
      {/* right arm: on the knee, or holding the camera up */}
      <Limb th={th} a={[0.2, 0.52, 0.02]} b={elbow} r={0.05} m={fur} ends />
      <Limb th={th} a={elbow} b={hand} r={0.045} m={fur} />
      <Ell th={th} p={[hand[0], hand[1], hand[2] + 0.02]} s={[0.05, 0.05, 0.045]} m={face} />
      {cam ? (
        <group position={[hand[0] - 0.02, hand[1] + 0.03, hand[2] + 0.06]} quaternion={camQ}>
          <Bx th={th} p={[0, 0, 0]} s={[0.22, 0.15, 0.09]} m={th.m("#1C1E22", { rough: 0.4 })} round={th.smooth ? 0.02 : 0} />
          <Bx th={th} p={[0.07, 0.085, 0]} s={[0.06, 0.03, 0.06]} m={th.m("#1C1E22", { rough: 0.4 })} />
          <mesh geometry={CYL(th, 0.055, 0.06, 0.08)} material={th.m("#2A2C31", { rough: 0.3 })} position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={CYL(th, 0.04, 0.04, 0.01)} material={th.m("#0E2236", { rough: 0.05 })} position={[0, 0, 0.122]} rotation={[Math.PI / 2, 0, 0]} />
          <Bx th={th} p={[0, 0.0, 0]} s={[0.226, 0.03, 0.094]} m={th.m(th.chrome, { rough: 0.3, metal: 0.4 })} />
          <Card p={[0, 0, -0.0455]} w={0.17} h={0.11} r={[0, Math.PI, 0]} m={th.glow("#FFFFFF", selfieTex(th, col))} />
        </group>
      ) : null}
      {/* head */}
      <group position={headP} rotation={[0, cam ? 0.25 : 0, cam ? -0.08 : 0.04 * Math.sin(t * 0.7 + seed)]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.2, 0.19, 0.18]} m={fur} />
        {[-1, 1].map((k) => <Ell key={`e${k}`} th={th} p={[k * 0.2, 0.01, -0.01]} s={[0.065, 0.075, 0.03]} m={face} />)}
        <Ell th={th} p={[0, -0.01, 0.1]} s={[0.155, 0.145, 0.1]} m={face} />
        <Ell th={th} p={[0, 0.075, 0.14]} s={[0.12, 0.022, 0.04]} m={brow} />
        <Ell th={th} p={[0, -0.08, 0.16]} s={[0.1, 0.07, 0.07]} m={face} />
        <Eyes th={th} y={0.02} z={0.19} gap={0.055} r={0.03} blink={blink} />
        {[-1, 1].map((k) => <Ell key={`n${k}`} th={th} p={[k * 0.018, -0.055, 0.225]} s={0.009} m={dark} shadow={false} />)}
        {cam ? (
          <>
            <Ell th={th} p={[0, -0.105, 0.208]} s={[0.07, 0.04, 0.03]} m={th.m("#5A2A2A", { rough: 0.6 })} shadow={false} />
            <Bx th={th} p={[0, -0.09, 0.231]} s={[0.09, 0.018, 0.01]} m={th.m("#FBFAF5", { rough: 0.3 })} shadow={false} />
          </>
        ) : <mesh geometry={TORUS(th, 0.035, 0.007, Math.PI * 0.8)} material={dark} position={[0, -0.085, 0.222]} rotation={[0, 0, Math.PI * 1.1]} />}
      </group>
      <NameTag th={th} label={label} p={[0, 0.56, 0.03]} collarR={0.12} size={0.12} />
    </group>
  );
};

/** a four-legged body: legs, hooves / paws, the body, a breathing chest; head toward +x */
const Legs: React.FC<{ th: PackTheme; x: number; z: number; top: number; r: number; m: THREE.Material; foot: THREE.Material; footH?: number; t: number; seed: number }> = ({ th, x, z, top, r, m, foot, footH = 0.05 }) => (
  <>{[[x, z], [x, -z], [-x, z], [-x, -z]].map(([lx, lz], k) => (
    <React.Fragment key={k}>
      <Limb th={th} a={[lx, footH, lz]} b={[lx, top, lz]} r={r} taper={0.85} m={m} />
      <Bx th={th} p={[lx + 0.01, footH / 2, lz]} s={[r * 2.3, footH, r * 2.1]} m={foot} round={th.smooth ? Math.min(0.02, footH / 2.5) : 0} />
    </React.Fragment>
  ))}</>
);
/** the spots on an ellipsoid body (cow): flattened patches on its surface, from a fixed list */
const SPOTS: [number, number, number, number][] = [[0.3, 0.6, 0.14, 0.1], [-0.25, 1.2, 0.16, 0.12], [0.05, 2.3, 0.12, 0.1], [-0.45, 2.7, 0.1, 0.09], [0.55, 1.9, 0.09, 0.08], [-0.1, -0.5, 0.15, 0.11], [0.35, -1.3, 0.12, 0.1], [-0.4, -2.0, 0.13, 0.1], [0.15, -2.6, 0.1, 0.08], [0.6, -0.2, 0.08, 0.07], [-0.6, 0.5, 0.09, 0.08]];
const Spots: React.FC<{ th: PackTheme; c: V3; r: V3; m: THREE.Material }> = ({ th, c, r, m }) => (
  <>{SPOTS.map(([u, a, sx, sy], k) => {
    const q = Math.sqrt(1 - u * u), p = new THREE.Vector3(r[0] * u, r[1] * q * Math.cos(a), r[2] * q * Math.sin(a));
    const n = new THREE.Vector3(p.x / (r[0] * r[0]), p.y / (r[1] * r[1]), p.z / (r[2] * r[2])).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return <mesh key={k} geometry={SPH(th)} material={m} position={[c[0] + p.x * 0.985, c[1] + p.y * 0.985, c[2] + p.z * 0.985]} quaternion={quat} scale={[sx, sy, 0.03]} />;
  })}</>
);

const Cow: React.FC<AP> = ({ th, col, label, t, seed, sp }) => {
  const spots = sp.spots !== false;
  const body = th.m(spots ? col : col === PACK_DEFAULT.cow.color ? "#8B5A3C" : col, { rough: 0.8 }), patch = th.m("#2A2522", { rough: 0.8 });
  const pink = th.m("#E7A4A0", { rough: 0.6 }), hoof = th.m("#2A2420", { rough: 0.7 }), horn = th.m("#EDE3C8", { rough: 0.5 });
  const br = breathOf(t, seed, 0.02), blink = blinkOf(t, seed), sw = Math.sin(t * 1.7 + seed);
  return (
    <group>
      <Legs th={th} x={0.36} z={0.15} top={0.48} r={0.082} m={body} foot={hoof} footH={0.07} t={t} seed={seed} />
      <group position={[0, 0.6, 0]} scale={[1, br, br]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.56, 0.3, 0.28]} m={body} />
        {spots ? <Spots th={th} c={[0, 0, 0]} r={[0.56, 0.3, 0.28]} m={patch} /> : null}
      </group>
      <Ell th={th} p={[-0.2, 0.37, 0]} s={[0.1, 0.07, 0.09]} m={pink} />
      <Ell th={th} p={[0.5, 0.74, 0.03]} s={[0.17, 0.19, 0.16]} m={body} />
      {/* tail: hanging, swishing, a dark tuft */}
      <Chain th={th} pts={[[-0.54, 0.78, 0], [-0.6, 0.62, sw * 0.04], [-0.63, 0.46, sw * 0.08]]} r0={0.022} r1={0.016} m={body} />
      <Ell th={th} p={[-0.64, 0.4, sw * 0.09]} s={[0.04, 0.07, 0.04]} m={patch} />
      <group position={[0.68, 0.88, 0.08]} rotation={[0.1 * Math.sin(t * 0.8 + seed), 0.9, 0]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.16, 0.15, 0.17]} m={body} />
        {spots ? <Ell th={th} p={[0.07, 0.07, 0.08]} s={[0.07, 0.06, 0.06]} m={patch} /> : null}
        <Ell th={th} p={[0, -0.08, 0.15]} s={[0.15, 0.1, 0.1]} m={pink} />
        {[-1, 1].map((k) => <Ell key={`n${k}`} th={th} p={[k * 0.05, -0.07, 0.245]} s={[0.022, 0.03, 0.01]} m={hoof} shadow={false} />)}
        <Eyes th={th} y={0.04} z={0.13} gap={0.09} r={0.03} blink={blink} />
        {[-1, 1].map((k) => <Ell key={`e${k}`} th={th} p={[k * 0.21, 0.05, -0.03]} s={[0.1, 0.04, 0.055]} r={[0, 0, k * (-0.3 + 0.08 * Math.sin(t * 2.1 + k))]} m={body} />)}
        {[-1, 1].map((k) => <mesh key={`h${k}`} geometry={CONE(th, 0.025, 0.1)} material={horn} position={[k * 0.1, 0.16, -0.04]} rotation={[0, 0, -k * 0.5]} />)}
      </group>
      <NameTag th={th} label={label} p={[0.55, 0.8, 0.05]} yaw={0.9} collarR={0.15} size={0.14} tilt={-0.3} />
    </group>
  );
};

const Dog: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const fur = th.m(col, { rough: 0.85 }), light = th.m(shade(col, 0.45), { rough: 0.85 }), dark = th.m(shade(col, -0.35), { rough: 0.85 });
  const br = breathOf(t, seed, 0.025), blink = blinkOf(t, seed), wag = 0.5 * Math.sin(t * 9 + seed);
  return (
    <group>
      <Legs th={th} x={0.2} z={0.1} top={0.38} r={0.052} m={fur} foot={light} footH={0.04} t={t} seed={seed} />
      <group scale={[1, br, br]} position={[0, 0.42, 0]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.32, 0.17, 0.16]} m={fur} />
        <Ell th={th} p={[0.2, 0.03, 0]} s={[0.17, 0.17, 0.15]} m={fur} />
        <Ell th={th} p={[0.26, -0.02, 0]} s={[0.1, 0.12, 0.11]} m={light} />
      </group>
      <group position={[-0.3, 0.5, 0]} rotation={[wag, 0, 0]}>
        <Chain th={th} pts={[[0, 0, 0], [-0.07, 0.08, 0], [-0.1, 0.17, 0]]} r0={0.028} r1={0.018} m={fur} />
      </group>
      <group position={[0.36, 0.66, 0.04]} rotation={[0, 0.9, 0.08 * Math.sin(t * 0.9 + seed)]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.15, 0.14, 0.14]} m={fur} />
        <Ell th={th} p={[0, -0.04, 0.13]} s={[0.085, 0.07, 0.1]} m={light} />
        <Ell th={th} p={[0, -0.005, 0.228]} s={[0.035, 0.028, 0.025]} m={th.m("#141414", { rough: 0.2 })} />
        <Ell th={th} p={[0.0, -0.1, 0.16]} s={[0.035, 0.018, 0.04]} r={[0.3, 0, 0]} m={th.m("#E36A7A", { rough: 0.4 })} />
        <Eyes th={th} y={0.04} z={0.115} gap={0.065} r={0.026} blink={blink} />
        {[-1, 1].map((k) => <Ell key={`e${k}`} th={th} p={[k * 0.15, -0.03, -0.01]} s={[0.05, 0.12, 0.075]} r={[0, 0, k * (0.25 + 0.05 * Math.sin(t * 2 + k))]} m={dark} />)}
      </group>
      <NameTag th={th} label={label} p={[0.3, 0.58, 0.02]} yaw={0.9} collarR={0.115} size={0.12} tilt={-0.4} />
    </group>
  );
};

const Cat: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const fur = th.m(col, { rough: 0.85 }), white = th.m("#F6F1E8", { rough: 0.85 }), pink = th.m("#E89AA0", { rough: 0.5 }), stripe = th.m(shade(col, -0.25), { rough: 0.85 });
  const br = breathOf(t, seed, 0.02), blink = blinkOf(t, seed), sw = Math.sin(t * 1.6 + seed);
  return (
    <group>
      <Chain th={th} pts={[[0.12, 0.06, -0.12], [0.24, 0.08, -0.04], [0.28, 0.16 + 0.03 * sw, 0.06], [0.24 + 0.04 * sw, 0.3, 0.1], [0.2 + 0.07 * sw, 0.4, 0.06]]} r0={0.032} r1={0.024} m={fur} />
      <group scale={[1, br, br]}>
        <Ell th={th} p={[0, 0.28, -0.02]} s={[0.19, 0.26, 0.17]} m={fur} />
        <Ell th={th} p={[0, 0.3, 0.1]} s={[0.12, 0.17, 0.08]} m={white} />
        {[0.38, 0.28, 0.18].map((y, k) => <Ell key={`s${k}`} th={th} p={[0, y, -0.12]} s={[0.16, 0.022, 0.08]} m={stripe} shadow={false} />)}
      </group>
      {[-1, 1].map((k) => <Ell key={`h${k}`} th={th} p={[k * 0.15, 0.12, -0.02]} s={[0.1, 0.11, 0.15]} m={fur} />)}
      {[-1, 1].map((k) => <Limb key={`l${k}`} th={th} a={[k * 0.065, 0.03, 0.1]} b={[k * 0.06, 0.3, 0.08]} r={0.034} m={fur} />)}
      {[-1, 1].map((k) => <Ell key={`p${k}`} th={th} p={[k * 0.067, 0.025, 0.13]} s={[0.042, 0.028, 0.05]} m={white} />)}
      <group position={[0, 0.62, 0.03]} rotation={[0, 0.12 * Math.sin(t * 0.6 + seed), 0.06 * Math.sin(t * 0.45 + seed)]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.17, 0.145, 0.15]} m={fur} />
        {[-1, 1].map((k) => <Ell key={`c${k}`} th={th} p={[k * 0.06, -0.045, 0.1]} s={[0.06, 0.045, 0.05]} m={white} />)}
        <mesh geometry={CONE(th, 0.018, 0.022, 3)} material={pink} position={[0, -0.02, 0.15]} rotation={[-Math.PI / 2, 0, Math.PI]} />
        <Eyes th={th} y={0.02} z={0.12} gap={0.065} r={0.034} blink={blink} iris="#7BBF4A" />
        {[-1, 1].map((k) => (
          <group key={`e${k}`} position={[k * 0.1, 0.12, 0]} rotation={[0, 0, -k * 0.32]}>
            <mesh geometry={CONE(th, 0.055, 0.12, 4)} material={fur} rotation={[0, Math.PI / 4, 0]} castShadow />
            <mesh geometry={CONE(th, 0.032, 0.08, 4)} material={pink} position={[0, -0.01, 0.022]} rotation={[0, Math.PI / 4, 0]} />
          </group>
        ))}
        {[-1, 1].map((k) => [0, 1].map((j) => <Bx key={`w${k}${j}`} th={th} p={[k * 0.12, -0.04 - j * 0.02, 0.12]} s={[0.11, 0.004, 0.004]} r={[0, 0, k * (0.1 - j * 0.15)]} m={white} shadow={false} />))}
      </group>
      <NameTag th={th} label={label} p={[0, 0.5, 0.05]} collarR={0.1} size={0.11} />
    </group>
  );
};

const Horse: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const coat = th.m(col, { rough: 0.7 }), mane = th.m("#2A1A10", { rough: 0.9 }), hoof = th.m("#1E1A16", { rough: 0.7 }), white = th.m("#F4EFE6", { rough: 0.7 });
  const br = breathOf(t, seed, 0.02), blink = blinkOf(t, seed), sw = Math.sin(t * 1.3 + seed);
  return (
    <group>
      <Legs th={th} x={0.36} z={0.13} top={0.78} r={0.062} m={coat} foot={hoof} footH={0.06} t={t} seed={seed} />
      <group position={[0, 0.88, 0]} scale={[1, br, br]}><Ell th={th} p={[0, 0, 0]} s={[0.5, 0.22, 0.2]} m={coat} /></group>
      <Limb th={th} a={[0.36, 0.92, 0]} b={[0.56, 1.24, 0.02]} r={0.12} taper={0.7} m={coat} />
      <Ell th={th} p={[0.38, 0.96, 0]} s={[0.15, 0.16, 0.15]} m={coat} />
      {[0, 1, 2, 3, 4].map((k) => <Bx key={`m${k}`} th={th} p={[0.38 + k * 0.045, 1.08 + k * 0.06, -0.01]} s={[0.07, 0.11, 0.035]} r={[0, 0, -0.55]} m={mane} />)}
      <Chain th={th} pts={[[-0.48, 0.98, 0], [-0.56, 0.84, sw * 0.04], [-0.6, 0.66, sw * 0.08], [-0.6, 0.5, sw * 0.12]]} r0={0.05} r1={0.035} m={mane} />
      <group position={[0.62, 1.3, 0.05]} rotation={[0.06 * Math.sin(t * 0.7 + seed), 0.9, 0]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.12, 0.13, 0.13]} m={coat} />
        <Ell th={th} p={[0, -0.1, 0.15]} s={[0.09, 0.09, 0.17]} r={[0.45, 0, 0]} m={coat} />
        <Bx th={th} p={[0, 0.01, 0.13]} s={[0.035, 0.16, 0.02]} r={[0.25, 0, 0]} m={white} shadow={false} />
        {[-1, 1].map((k) => <Ell key={`n${k}`} th={th} p={[k * 0.04, -0.17, 0.28]} s={[0.016, 0.022, 0.01]} m={hoof} shadow={false} />)}
        <Eyes th={th} y={0.03} z={0.08} gap={0.1} r={0.026} blink={blink} />
        {[-1, 1].map((k) => <mesh key={`e${k}`} geometry={CONE(th, 0.03, 0.09, 4)} material={coat} position={[k * 0.06, 0.15, -0.03]} rotation={[0, 0, -k * 0.2 + 0.06 * Math.sin(t * 2.3 + k)]} />)}
        <Bx th={th} p={[0, 0.11, 0.06]} s={[0.05, 0.06, 0.05]} m={mane} />
      </group>
      <NameTag th={th} label={label} p={[0.5, 1.12, 0.03]} yaw={0.9} collarR={0.13} size={0.13} tilt={-0.6} />
    </group>
  );
};

const Pig: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const skin = th.m(col, { rough: 0.6 }), snout = th.m(shade(col, -0.12), { rough: 0.5 }), dark = th.m("#5A2A2E", { rough: 0.5 });
  const br = breathOf(t, seed, 0.025), blink = blinkOf(t, seed), tw = 0.25 * Math.sin(t * 5 + seed);
  return (
    <group>
      <Legs th={th} x={0.2} z={0.11} top={0.22} r={0.05} m={skin} foot={dark} footH={0.04} t={t} seed={seed} />
      <group position={[0, 0.36, 0]} scale={[1, br, br]}><Ell th={th} p={[0, 0, 0]} s={[0.34, 0.22, 0.22]} m={skin} /></group>
      <group position={[-0.34, 0.44, 0]} rotation={[tw, 0, 0]}>
        <mesh geometry={TORUS(th, 0.035, 0.012)} material={skin} position={[-0.03, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} />
      </group>
      <group position={[0.32, 0.42, 0.04]} rotation={[0, 0.9, 0]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.16, 0.15, 0.15]} m={skin} />
        <mesh geometry={CYL(th, 0.07, 0.075, 0.08)} material={snout} position={[0, -0.03, 0.16]} rotation={[Math.PI / 2, 0, 0]} />
        {[-1, 1].map((k) => <Ell key={`n${k}`} th={th} p={[k * 0.025, -0.03, 0.2]} s={[0.014, 0.022, 0.008]} m={dark} shadow={false} />)}
        <Eyes th={th} y={0.05} z={0.13} gap={0.07} r={0.022} blink={blink} />
        {[-1, 1].map((k) => <mesh key={`e${k}`} geometry={CONE(th, 0.055, 0.1, 4)} material={skin} position={[k * 0.1, 0.13, 0.02]} rotation={[0.6, 0, -k * 0.35]} />)}
      </group>
      <NameTag th={th} label={label} p={[0.26, 0.4, 0.03]} yaw={0.9} collarR={0.14} size={0.12} tilt={-0.2} />
    </group>
  );
};

const Chicken: React.FC<AP> = ({ th, col, label, t, seed, sp }) => {
  const rooster = sp.variant === "rooster";
  const body = th.m(col || (rooster ? "#B5512A" : "#F4F1EA"), { rough: 0.85 }), red = th.m("#D2302A", { rough: 0.5 }), yel = th.m("#F2B230", { rough: 0.5 });
  const tail = th.m(rooster ? "#1F4A3A" : col || "#F4F1EA", { rough: 0.6 }), gold = th.m("#E8A13A", { rough: 0.7 });
  const br = breathOf(t, seed, 0.02), blink = blinkOf(t, seed), bob = ((t * 1.3 + hash(seed)) % 2.6) < 0.25 ? 0.03 : 0;
  return (
    <group>
      {[-1, 1].map((k) => <Limb key={`l${k}`} th={th} a={[0.0, 0.0, k * 0.06]} b={[-0.01, 0.22, k * 0.055]} r={0.018} m={yel} />)}
      {[-1, 1].map((k) => [-0.35, 0, 0.35].map((a, j) => <Bx key={`t${k}${j}`} th={th} p={[0.05 * Math.cos(a), 0.008, k * 0.06 + 0.05 * Math.sin(a)]} s={[0.09, 0.014, 0.018]} r={[0, -a, 0]} m={yel} />))}
      <group position={[0, 0.38, 0]} scale={[1, br, br]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.22, 0.19, 0.17]} m={body} />
        {[-1, 1].map((k) => <Ell key={`w${k}`} th={th} p={[-0.02, 0.0, k * 0.15]} s={[0.15, 0.1, 0.04]} r={[0, 0, -0.2 + 0.05 * Math.sin(t * 3 + k)]} m={rooster ? gold : body} />)}
      </group>
      {/* tail: a hen's short fan, a rooster's sickle feathers */}
      {(rooster ? [0, 1, 2, 3, 4, 5] : [0, 1, 2]).map((k) => {
        const a = 0.5 + k * (rooster ? 0.2 : 0.3), len = rooster ? 0.24 + 0.05 * Math.sin(k * 1.7) : 0.12;
        return <Ell key={`f${k}`} th={th} p={[-0.18 - Math.cos(a) * len * 0.4, 0.46 + Math.sin(a) * len * 0.6, k % 2 ? 0.03 : -0.03]} s={[0.04, len * 0.6, 0.025]} r={[0, 0, a - Math.PI / 2 + 0.4]} m={tail} />;
      })}
      <Ell th={th} p={[0.12, 0.52, 0]} s={[0.09, 0.13, 0.09]} r={[0, 0, -0.3]} m={rooster ? gold : body} />
      <group position={[0.16, 0.64 + bob, 0.03]} rotation={[0, 0.9, 0]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.085, 0.09, 0.085]} m={body} />
        <mesh geometry={CONE(th, 0.028, 0.08, 4)} material={yel} position={[0, -0.01, 0.11]} rotation={[Math.PI / 2, 0, 0]} />
        <Ell th={th} p={[0, -0.07, 0.07]} s={[0.022, rooster ? 0.05 : 0.03, 0.02]} m={red} />
        {(rooster ? [0, 1, 2, 3] : [0, 1, 2]).map((k, _i, a) => <Ell key={`c${k}`} th={th} p={[0, 0.09 + (rooster ? 0.02 : 0) - Math.abs(k - (a.length - 1) / 2) * 0.015, 0.05 - k * 0.035]} s={[0.018, rooster ? 0.05 : 0.032, 0.022]} m={red} />)}
        <Eyes th={th} y={0.02} z={0.06} gap={0.05} r={0.017} blink={blink} />
      </group>
      <NameTag th={th} label={label} p={[0.12, 0.48, 0.02]} yaw={0.9} collarR={0.08} size={0.1} tilt={-0.3} />
    </group>
  );
};

const Shark: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const skin = th.m(col, { rough: 0.45 }), belly = th.m("#F1F3F2", { rough: 0.5 }), dark = th.m(shade(col, -0.45), { rough: 0.5 }), tooth = th.m("#FFFFFF", { rough: 0.3 });
  const sw = Math.sin(t * 1.8 + seed), bob = 0.025 * Math.sin(t * 1.1 + seed), blink = blinkOf(t, seed);
  const fin = EXTRUDE("shFin", [[-0.12, 0], [0.12, 0], [-0.08, 0.24]], 0.03);
  const lobe = EXTRUDE("shLobe", [[0, -0.02], [0, 0.04], [-0.22, 0.28], [-0.12, 0.02], [-0.18, -0.16]], 0.03);
  return (
    <group position={[0, bob, 0]} rotation={[0, 0.08 * sw, 0]}>
      <Ell th={th} p={[0, 0.44, 0]} s={[0.66, 0.2, 0.2]} m={skin} />
      <Ell th={th} p={[0.05, 0.38, 0]} s={[0.58, 0.13, 0.17]} m={belly} />
      <Ell th={th} p={[0.56, 0.44, 0]} s={[0.24, 0.14, 0.15]} m={skin} />
      <Ell th={th} p={[0.58, 0.39, 0]} s={[0.2, 0.08, 0.13]} m={belly} />
      <mesh geometry={fin} material={skin} position={[-0.02, 0.6, 0]} castShadow />
      {[-1, 1].map((k) => <mesh key={`p${k}`} geometry={fin} material={skin} position={[0.2, 0.34, k * 0.16]} rotation={[k * 1.9, -0.4 * k, 0]} castShadow />)}
      <mesh geometry={fin} material={skin} position={[-0.42, 0.32, 0]} rotation={[Math.PI, 0, 0]} scale={0.45} />
      <group position={[-0.62, 0.44, 0]} rotation={[0, 0.25 * sw, 0]}>
        <Limb th={th} a={[0.06, 0, 0]} b={[-0.12, 0, 0]} r={0.08} taper={0.55} m={skin} />
        <mesh geometry={lobe} material={skin} position={[-0.1, 0, 0]} castShadow />
      </group>
      {/* the face: eyes on the sides, gill slits, a smile with teeth */}
      {[-1, 1].map((k) => (
        <group key={`e${k}`} position={[0.6, 0.5, k * 0.12]} rotation={[0, k > 0 ? 0.6 : Math.PI - 0.6, 0]} scale={[1, blink, 1]}>
          <Ell th={th} p={[0, 0, 0]} s={[0.028, 0.03, 0.02]} m={th.m("#101214", { rough: 0.1 })} shadow={false} />
          <Ell th={th} p={[0.008, 0.012, 0.016]} s={0.008} m={th.glow("#FFFFFF")} shadow={false} />
        </group>
      ))}
      {[-1, 1].map((k) => [0, 1, 2].map((j) => <Bx key={`g${k}${j}`} th={th} p={[0.36 - j * 0.05, 0.44, k * 0.17]} s={[0.012, 0.09, 0.012]} r={[0, 0, 0.15]} m={dark} shadow={false} />))}
      <mesh geometry={TORUS(th, 0.11, 0.012, Math.PI * 0.8)} material={dark} position={[0.66, 0.39, 0]} rotation={[0, Math.PI / 2 - 0.0, Math.PI + 0.3 * Math.PI]} />
      {[-0.06, -0.02, 0.02, 0.06].map((z, k) => <mesh key={`t${k}`} geometry={CONE(th, 0.012, 0.03, 4)} material={tooth} position={[0.76 - Math.abs(z) * 0.4, 0.375, z]} rotation={[Math.PI, 0, 0]} />)}
      {label ? <Card p={[0.0, 0.47, 0.201]} w={0.3} h={0.08} m={th.m("#FFFFFF", { rough: 0.6, map: labelTex(th, "shk", label, "#F4F1E8", "#14161C", 400, 110) })} /> : null}
    </group>
  );
};

const Bird: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const feather = th.m(col, { rough: 0.7 }), belly = th.m("#F4E3C1", { rough: 0.8 }), wood = th.m("#6B4329", { rough: 0.8 }), beak = th.m("#F2A33A", { rough: 0.5 });
  const blink = blinkOf(t, seed), tilt = 0.2 * Math.sin(t * 1.9 + seed) * (((t * 0.7 + hash(seed)) % 2) < 1 ? 1 : 0.3), flap = 0.12 * Math.max(0, Math.sin(t * 14)) * (((t + hash(seed) * 4) % 4) < 0.5 ? 1 : 0);
  return (
    <group>
      <mesh geometry={CYL(th, 0.16, 0.18, 0.04)} material={wood} position={[0, 0.02, 0]} receiveShadow castShadow />
      <Limb th={th} a={[0, 0.04, 0]} b={[0, 0.3, -0.02]} r={0.025} m={wood} />
      <Limb th={th} a={[-0.2, 0.3, -0.02]} b={[0.18, 0.31, -0.02]} r={0.022} m={wood} />
      {[-1, 1].map((k) => <Limb key={`l${k}`} th={th} a={[0.0, 0.31, k * 0.03]} b={[0.0, 0.38, k * 0.03]} r={0.008} m={th.m("#3A2A1E")} />)}
      <group position={[0, 0.46, 0]} scale={[1, breathOf(t, seed, 0.03), 1]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.13, 0.11, 0.1]} r={[0, 0, 0.35]} m={feather} />
        <Ell th={th} p={[0.03, -0.01, 0.04]} s={[0.09, 0.09, 0.07]} m={belly} />
        {[-1, 1].map((k) => <Ell key={`w${k}`} th={th} p={[-0.03, 0.01, k * 0.085]} s={[0.1, 0.06, 0.025]} r={[k * flap * 3, 0, 0.3]} m={feather} />)}
      </group>
      {[0, 1, 2].map((k) => <Bx key={`t${k}`} th={th} p={[-0.16, 0.38 - k * 0.005, (k - 1) * 0.025]} s={[0.14, 0.012, 0.035]} r={[0, (k - 1) * 0.2, -0.6]} m={feather} />)}
      <group position={[0.08, 0.59, 0.01]} rotation={[0, 0.7, tilt]}>
        <Ell th={th} p={[0, 0, 0]} s={0.085} m={feather} />
        <Ell th={th} p={[0, -0.03, 0.04]} s={[0.06, 0.05, 0.05]} m={belly} />
        <mesh geometry={CONE(th, 0.022, 0.06, 4)} material={beak} position={[0, -0.01, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
        <Eyes th={th} y={0.015} z={0.06} gap={0.045} r={0.018} blink={blink} />
      </group>
      {label ? <Card p={[0, 0.02, 0.172]} w={0.24} h={0.035} m={th.m("#FFFFFF", { rough: 0.6, map: labelTex(th, "bird", label, th.gold, "#14161C", 512, 80, false) })} /> : null}
    </group>
  );
};

const Rabbit: React.FC<AP> = ({ th, col, label, t, seed }) => {
  const fur = th.m(col, { rough: 0.9 }), white = th.m("#FBF8F2", { rough: 0.9 }), pink = th.m("#E9A3AE", { rough: 0.5 });
  const br = breathOf(t, seed, 0.025), blink = blinkOf(t, seed), tw = ((t * 2 + hash(seed)) % 1.6) < 0.3 ? 0.008 * Math.sin(t * 40) : 0, ear = 0.1 * Math.sin(t * 0.9 + seed);
  return (
    <group>
      <Ell th={th} p={[0, 0.1, -0.16]} s={0.06} m={white} />
      <group scale={[1, br, br]}>
        <Ell th={th} p={[0, 0.24, -0.04]} s={[0.2, 0.22, 0.2]} m={fur} />
        <Ell th={th} p={[0, 0.24, 0.08]} s={[0.12, 0.15, 0.1]} m={white} />
      </group>
      {[-1, 1].map((k) => <Ell key={`f${k}`} th={th} p={[k * 0.11, 0.035, 0.1]} s={[0.055, 0.035, 0.13]} m={fur} />)}
      {[-1, 1].map((k) => <Ell key={`p${k}`} th={th} p={[k * 0.06, 0.06, 0.15]} s={[0.035, 0.05, 0.04]} m={white} />)}
      <group position={[0, 0.5, 0.05]}>
        <Ell th={th} p={[0, 0, 0]} s={[0.14, 0.13, 0.13]} m={fur} />
        {[-1, 1].map((k) => <Ell key={`c${k}`} th={th} p={[k * 0.05, -0.05, 0.09]} s={[0.05, 0.04, 0.045]} m={white} />)}
        <Ell th={th} p={[0, -0.02 + tw, 0.13]} s={[0.022, 0.016, 0.012]} m={pink} />
        <Eyes th={th} y={0.02} z={0.11} gap={0.065} r={0.026} blink={blink} />
        {[-1, 1].map((k) => (
          <group key={`e${k}`} position={[k * 0.05, 0.1, -0.01]} rotation={[k > 0 ? ear : -0.05, 0, -k * (0.16 + (k > 0 ? 0.0 : 0.05))]}>
            <Ell th={th} p={[0, 0.17, 0]} s={[0.045, 0.17, 0.025]} m={fur} />
            <Ell th={th} p={[0, 0.17, 0.015]} s={[0.026, 0.13, 0.014]} m={pink} shadow={false} />
          </group>
        ))}
      </group>
      <NameTag th={th} label={label} p={[0, 0.4, 0.06]} collarR={0.1} size={0.11} />
    </group>
  );
};

// ------------------------------------------------------------------ gadgets
type GP = { th: PackTheme; col: string; label: string; lines: string[] | undefined; screen: string; t: number; seed: number; sp: PackParams };

const buttonsTex = (th: PackTheme, col: string, label: string) => canvasTexture(`pkMp3Btn|${th.kit}|${col}|${label}`, 256, 192, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  const ink = inkOn(col);
  // three round buttons in a row (back / play-pause / forward) and a wide menu bar: no wheel, no pad
  g.fillStyle = shade(col, lum(col) > 0.45 ? -0.12 : 0.18); g.beginPath(); g.roundRect(W * 0.18, H * 0.06, W * 0.64, H * 0.16, H * 0.08); g.fill();
  g.fillStyle = ink; g.globalAlpha = 0.8; g.fillRect(W * 0.43, H * 0.13, W * 0.14, H * 0.025); g.globalAlpha = 1;
  [0.22, 0.5, 0.78].forEach((x, k) => {
    g.fillStyle = shade(col, lum(col) > 0.45 ? -0.12 : 0.18); g.beginPath(); g.arc(W * x, H * 0.48, H * 0.15, 0, Math.PI * 2); g.fill();
    g.fillStyle = ink; const cx = W * x, cy = H * 0.48, s = H * 0.06;
    if (k === 1) { g.beginPath(); g.moveTo(cx - s, cy - s); g.lineTo(cx + s * 0.6, cy); g.lineTo(cx - s, cy + s); g.fill(); g.fillRect(cx + s * 0.75, cy - s, s * 0.3, s * 2); }
    else { const d = k === 0 ? -1 : 1; for (const o of [0, 1]) { g.beginPath(); g.moveTo(cx + d * (s * 0.2 + o * s * 0.9), cy); g.lineTo(cx - d * (s * 0.7 - o * s * 0.9), cy - s * 0.8); g.lineTo(cx - d * (s * 0.7 - o * s * 0.9), cy + s * 0.8); g.fill(); } }
  });
  if (label) { g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, label.toUpperCase(), Math.round(H * 0.13), W * 0.8); g.fillText(label.toUpperCase(), W / 2, H * 0.84); }
});

const Mp3Player: React.FC<GP> = ({ th, col, label, lines, screen }) => {
  const body = th.m(col, { rough: 0.3, metal: 0.15 });
  const tex = screenTex(th, "music", screen, lines ?? ["Track 01", "2:14 / 3:30"], 360, 400);
  const cable = geoOf("pkMp3Cable", () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.12, 0.84, 0], [0.16, 0.92, 0.02], [0.3, 0.8, 0.08], [0.36, 0.45, 0.12], [0.34, 0.16, 0.16], [0.3, 0.06, 0.2]].map((p) => new THREE.Vector3(...p))), 40, 0.008, 5));
  const cable2 = geoOf("pkMp3Cable2", () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.3, 0.06, 0.2], [0.38, 0.03, 0.22], [0.44, 0.04, 0.14]].map((p) => new THREE.Vector3(...p))), 12, 0.007, 5));
  const bud = th.m("#F4F4F2", { rough: 0.3 });
  return (
    <group>
      <group position={[0, 0.02, 0]} rotation={[-0.08, 0, 0]}>
        <mesh geometry={rbox(0.44, 0.84, 0.07, 0.05)} material={body} position={[0, 0.42, 0]} castShadow receiveShadow />
        <mesh geometry={rbox(0.38, 0.44, 0.004, 0.02)} material={th.m("#06080C", { rough: 0.1 })} position={[0, 0.58, 0.035]} />
        <Screen th={th} tex={tex} p={[0, 0.58, 0.0375]} w={0.35} h={0.4} />
        <Card p={[0, 0.2, 0.0355]} w={0.4} h={0.3} m={th.m("#FFFFFF", { rough: 0.35, map: buttonsTex(th, col, label) })} />
        <Bx th={th} p={[0.226, 0.62, 0]} s={[0.012, 0.12, 0.03]} m={th.m(shade(col, 0.2), { rough: 0.3 })} />
        <mesh geometry={CYL(th, 0.014, 0.014, 0.02)} material={th.m("#0A0A0A")} position={[0.12, 0.845, 0]} />
        <Neon th={th} p={[0, 0.002, 0.03]} s={[0.36, 0.006, 0.006]} />
      </group>
      <mesh geometry={cable} material={bud} castShadow />
      <mesh geometry={cable2} material={bud} />
      <Ell th={th} p={[0.3, 0.05, 0.21]} s={[0.035, 0.03, 0.04]} m={bud} />
      <Ell th={th} p={[0.45, 0.04, 0.13]} s={[0.035, 0.03, 0.04]} m={bud} />
    </group>
  );
};

const Juicer: React.FC<GP> = ({ th, col, label, lines, t, seed }) => {
  const body = th.m(col, { rough: 0.35 }), steel = th.m(th.chrome, { rough: 0.25, metal: 0.5 }), dark = th.m("#2A2E36", { rough: 0.4 });
  const press = 0.5 + 0.5 * Math.sin(t * 0.9 + seed); // 0 open .. 1 pressed
  const plateY = 0.74 - 0.08 * press, squash = 1 - 0.32 * press;
  const pouchCol = "#7DBE4E";
  const pouch = canvasTexture(`pkPouch|${th.kit}|${label}|${(lines ?? []).join("¦")}`, 512, 300, (g, W, H) => {
    g.fillStyle = pouchCol; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.roundRect(W * 0.08, H * 0.18, W * 0.84, H * 0.64, 24); g.fill();
    g.fillStyle = "#24461A"; g.textAlign = "center"; g.textBaseline = "middle";
    fitText(g, (label || "JUICE").toUpperCase(), Math.round(H * 0.24), W * 0.76); g.fillText((label || "JUICE").toUpperCase(), W / 2, H * 0.42);
    g.font = `${Math.round(H * 0.1)}px ${HERO_FONT}`; fitText(g, (lines?.[0] ?? "PRESSED FRESH"), Math.round(H * 0.1), W * 0.7, "normal"); g.fillText(lines?.[0] ?? "PRESSED FRESH", W / 2, H * 0.66);
  });
  const drip = (t * 1.4 + hash(seed)) % 1;
  return (
    <group>
      <mesh geometry={rbox(0.6, 0.08, 0.52, 0.03)} material={body} position={[0, 0.04, 0]} castShadow receiveShadow />
      <mesh geometry={rbox(0.2, 0.84, 0.18, 0.04)} material={body} position={[0, 0.48, -0.17]} castShadow />
      <mesh geometry={rbox(0.58, 0.16, 0.46, 0.05)} material={body} position={[0, 0.86, -0.02]} castShadow />
      <Bx th={th} p={[0, 0.86, 0.213]} s={[0.3, 0.025, 0.01]} m={th.glow(th.accent)} />
      <mesh geometry={rbox(0.44, 0.03, 0.34, 0.012)} material={steel} position={[0, plateY, 0.02]} castShadow />
      <Limb th={th} a={[0, plateY, 0.02]} b={[0, 0.79, 0.02]} r={0.03} m={steel} />
      {/* the platen tray and the pouch being squeezed */}
      <mesh geometry={rbox(0.46, 0.05, 0.36, 0.015)} material={dark} position={[0, 0.36, 0.02]} castShadow />
      <group position={[0, 0.385, 0.02]} scale={[1 + 0.08 * press, squash, 1 + 0.06 * press]}>
        <mesh geometry={rbox(0.38, 0.3, 0.28, 0.08)} material={th.m(pouchCol, { rough: 0.45 })} position={[0, 0.15, 0]} castShadow />
        <Card p={[0, 0.15, 0.1405]} w={0.32} h={0.19} m={th.m("#FFFFFF", { rough: 0.45, map: pouch })} />
      </group>
      <mesh geometry={CYL(th, 0.02, 0.014, 0.08)} material={steel} position={[0, 0.33, 0.18]} />
      {/* the glass, juice, a drip falling */}
      <mesh geometry={CYL(th, 0.09, 0.08, 0.2, 1, true)} material={th.m("#DDEEF6", { rough: 0.05, opacity: 0.35, side: THREE.DoubleSide })} position={[0, 0.18, 0.18]} />
      <mesh geometry={CYL(th, 0.084, 0.078, 0.13)} material={th.m("#86C34A", { rough: 0.2 })} position={[0, 0.145, 0.18]} />
      <Ell th={th} p={[0, 0.29 - drip * 0.06, 0.18]} s={[0.012, 0.016, 0.012]} m={th.m("#86C34A", { rough: 0.1 })} shadow={false} />
      <Neon th={th} p={[0, 0.005, 0.26]} s={[0.56, 0.006, 0.006]} />
    </group>
  );
};

const GameConsole: React.FC<GP> = ({ th, col, label, t, seed }) => {
  const body = th.m(col, { rough: 0.35 }), side = th.m(shade(col, 0.15), { rough: 0.3 }), pad = th.m(shade(col, 0.12), { rough: 0.4 });
  const pulse = 0.7 + 0.3 * Math.sin(t * 2 + seed);
  return (
    <group>
      {/* the console standing up, a light strip on its front edge */}
      <group position={[0.1, 0, -0.12]} rotation={[0, -0.55, 0]}>
        <mesh geometry={rbox(0.16, 0.66, 0.5, 0.03)} material={body} position={[0, 0.36, 0]} castShadow receiveShadow />
        <mesh geometry={rbox(0.02, 0.6, 0.46, 0.008)} material={side} position={[0.085, 0.36, 0]} />
        <Bx th={th} p={[0.03, 0.36, 0.251]} s={[0.014, 0.56, 0.006]} m={th.glow(th.accent, undefined, pulse)} />
        <Bx th={th} p={[-0.03, 0.6, 0.251]} s={[0.06, 0.012, 0.006]} m={th.m("#0A0A0A")} />
        {[0, 1].map((k) => <Bx key={k} th={th} p={[-0.03, 0.12 + k * 0.05, 0.251]} s={[0.04, 0.02, 0.006]} m={th.m("#0A0A0A")} />)}
        <mesh geometry={rbox(0.22, 0.03, 0.32, 0.01)} material={th.m("#15171B")} position={[0, 0.015, 0]} />
        {label ? <Card p={[0.096, 0.5, 0]} w={0.36} h={0.07} r={[0, Math.PI / 2, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "gc", label, shade(col, 0.15), inkOn(col), 512, 100, false) })} /> : null}
      </group>
      {/* the controller leaning on a small stand in front */}
      <mesh geometry={rbox(0.12, 0.08, 0.1, 0.02)} material={th.m("#15171B")} position={[-0.05, 0.04, 0.12]} />
      <group position={[-0.05, 0.16, 0.2]} rotation={[-0.75, 0, 0]}>
        <mesh geometry={rbox(0.36, 0.16, 0.08, 0.035)} material={pad} castShadow />
        {[-1, 1].map((k) => <Ell key={`g${k}`} th={th} p={[k * 0.17, -0.07, -0.005]} s={[0.075, 0.11, 0.05]} r={[0, 0, k * 0.35]} m={pad} />)}
        <Bx th={th} p={[-0.13, 0.02, 0.042]} s={[0.07, 0.022, 0.01]} m={th.m("#1A1C20")} />
        <Bx th={th} p={[-0.13, 0.02, 0.042]} s={[0.022, 0.07, 0.01]} m={th.m("#1A1C20")} />
        {[[0, 0.03], [0.03, 0], [0, -0.03], [-0.03, 0]].map(([x, y], k) => <mesh key={`b${k}`} geometry={CYL(th, 0.014, 0.014, 0.014)} material={th.m(["#3FA34D", "#D9473F", "#3F7FD9", "#E3B33D"][k], { rough: 0.3 })} position={[0.13 + x, 0.02 + y, 0.042]} rotation={[Math.PI / 2, 0, 0]} />)}
        {[-1, 1].map((k) => (
          <group key={`s${k}`} position={[k * 0.055, -0.035, 0.04]}>
            <mesh geometry={CYL(th, 0.026, 0.026, 0.012)} material={th.m("#101114")} rotation={[Math.PI / 2, 0, 0]} />
            <mesh geometry={CYL(th, 0.02, 0.022, 0.03)} material={th.m("#2A2C31", { rough: 0.6 })} position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]} />
          </group>
        ))}
        <mesh geometry={CYL(th, 0.012, 0.012, 0.01)} material={th.glow(th.accent, undefined, pulse)} position={[0, 0.045, 0.042]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </group>
  );
};

const VrHeadset: React.FC<GP> = ({ th, col, label, t, seed }) => {
  const shell = th.m(col, { rough: 0.35 }), visor = th.m("#0B0D12", { rough: 0.08 }), strap = th.m("#2A2D33", { rough: 0.8 });
  const pulse = 0.65 + 0.35 * Math.sin(t * 1.6 + seed);
  const form = th.m(th.kit === "cyber3d" ? "#2A3850" : "#8C929C", { rough: 0.6 });
  return (
    <group>
      <mesh geometry={CYL(th, 0.16, 0.18, 0.04, 1.2)} material={th.m("#1E2128", { rough: 0.5 })} position={[0, 0.02, -0.08]} castShadow receiveShadow />
      <Limb th={th} a={[0, 0.04, -0.08]} b={[0, 0.2, -0.08]} r={0.03} m={th.m("#1E2128", { rough: 0.5 })} />
      <Ell th={th} p={[0, 0.42, -0.1]} s={[0.21, 0.27, 0.23]} m={form} />
      <group position={[0, 0.46, 0.02]}>
        <mesh geometry={rbox(0.58, 0.3, 0.22, 0.08)} material={shell} castShadow />
        <mesh geometry={rbox(0.46, 0.2, 0.03, 0.05)} material={visor} position={[0, 0.0, 0.1]} />
        <Bx th={th} p={[0, -0.1, 0.117]} s={[0.36, 0.012, 0.004]} m={th.glow(th.accent, undefined, pulse)} />
        {[[-0.21, 0.08], [0.21, 0.08], [-0.21, -0.08], [0.21, -0.08]].map(([x, y], k) => <mesh key={`c${k}`} geometry={CYL(th, 0.018, 0.018, 0.01)} material={th.m("#2A2E36", { rough: 0.2 })} position={[x, y, 0.118]} rotation={[Math.PI / 2, 0, 0]} />)}
        <mesh geometry={rbox(0.5, 0.22, 0.06, 0.05)} material={th.m("#26282E", { rough: 0.95 })} position={[0, -0.01, -0.12]} />
        {label ? <Card p={[0, 0.07, 0.117]} w={0.2} h={0.05} m={th.m("#FFFFFF", { rough: 0.3, map: labelTex(th, "vr", label, "#0B0D12", th.accent, 400, 100, false) })} /> : null}
      </group>
      {/* the straps: round the back of the form and over the top */}
      <mesh geometry={TORUS(th, 0.235, 0.028)} material={strap} position={[0, 0.47, -0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.05, 1]} />
      <mesh geometry={TORUS(th, 0.24, 0.025, Math.PI)} material={strap} position={[0, 0.5, -0.1]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

const Smartwatch: React.FC<GP> = ({ th, col, label, lines, screen }) => {
  const caseM = th.m(th.kit === "law3d" ? "#2A2E36" : "#30343C", { rough: 0.25, metal: 0.4 });
  const tex = screenTex(th, "watch", screen, lines ?? ["8,412 STEPS"], 320, 360);
  return (
    <group>
      <mesh geometry={rbox(0.42, 0.06, 0.4, 0.02)} material={th.m("#1A1C20", { rough: 0.6 })} position={[0, 0.03, -0.04]} receiveShadow castShadow />
      <mesh geometry={CYL(th, 0.29, 0.29, 0.26, 1.3, true)} material={th.m(col, { rough: 0.6, side: THREE.DoubleSide })} position={[0, 0.36, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow />
      <group position={[0, 0.38, 0.28]} rotation={[-0.05, 0, 0]}>
        <mesh geometry={rbox(0.36, 0.42, 0.1, 0.07)} material={caseM} castShadow />
        <mesh geometry={rbox(0.32, 0.38, 0.004, 0.05)} material={th.m("#05070A", { rough: 0.05 })} position={[0, 0, 0.05]} />
        <Screen th={th} tex={tex} p={[0, 0, 0.0525]} w={0.28} h={0.32} />
        <mesh geometry={CYL(th, 0.028, 0.028, 0.04)} material={caseM} position={[0.19, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} />
        <Neon th={th} p={[0, -0.215, 0.03]} s={[0.24, 0.006, 0.006]} />
      </group>
      {label ? <Card p={[0, 0.032, 0.161]} w={0.3} h={0.05} r={[-Math.PI / 2 + 0.0, 0, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "sw", label, "#1A1C20", "#FFFFFF", 512, 90, false) })} /> : null}
    </group>
  );
};

const Drone: React.FC<GP> = ({ th, col, label, t, seed }) => {
  const body = th.m(col, { rough: 0.35 }), dark = th.m("#22252B", { rough: 0.5 }), blade = th.m("#1A1C20", { rough: 0.4 });
  const y = 0.42 + 0.025 * Math.sin(t * 1.5 + seed), tilt = 0.03 * Math.sin(t * 0.8 + seed);
  return (
    <group position={[0, y, 0]} rotation={[tilt, 0, tilt * 0.6]}>
      <mesh geometry={rbox(0.3, 0.1, 0.38, 0.04)} material={body} castShadow />
      <mesh geometry={rbox(0.2, 0.05, 0.24, 0.02)} material={dark} position={[0, 0.06, -0.02]} />
      {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz], k) => {
        const mp: V3 = [sx * 0.36, 0.03, sz * 0.36], ang = t * (11 + k) * (k % 2 ? 1 : -1) + k;
        return (
          <group key={k}>
            <Limb th={th} a={[sx * 0.1, 0, sz * 0.12]} b={mp} r={0.022} m={body} />
            <mesh geometry={CYL(th, 0.035, 0.035, 0.06)} material={dark} position={mp} />
            <mesh geometry={TORUS(th, 0.16, 0.008)} material={th.m("#C8CDD3", { rough: 0.4, opacity: 0.6 })} position={[mp[0], 0.06, mp[2]]} rotation={[Math.PI / 2, 0, 0]} />
            <group position={[mp[0], 0.07, mp[2]]} rotation={[0, ang, 0]}>
              <Bx th={th} p={[0, 0, 0]} s={[0.28, 0.006, 0.035]} m={blade} />
            </group>
            <Ell th={th} p={[mp[0], -0.04, mp[2]]} s={0.014} m={th.glow(sz > 0 ? "#43E06B" : "#FF4A4A")} shadow={false} />
            <Limb th={th} a={[mp[0] * 0.8, -0.03, mp[2] * 0.8]} b={[mp[0] * 0.8, -0.14, mp[2] * 0.8]} r={0.008} m={dark} />
          </group>
        );
      })}
      <Ell th={th} p={[0, -0.08, 0.14]} s={[0.05, 0.045, 0.05]} m={dark} />
      <mesh geometry={CYL(th, 0.022, 0.022, 0.02)} material={th.m("#0E2236", { rough: 0.05 })} position={[0, -0.08, 0.19]} rotation={[Math.PI / 2, 0, 0]} />
      {label ? <Card p={[0, 0.051, 0.0]} w={0.22} h={0.06} r={[-Math.PI / 2, 0, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "dr", label, col, inkOn(col), 400, 110, false) })} /> : null}
      <Neon th={th} p={[0, -0.051, 0.0]} s={[0.24, 0.005, 0.3]} />
    </group>
  );
};

const Tablet: React.FC<GP> = ({ th, col, label, lines, screen }) => {
  const tex = screenTex(th, "tablet", screen, lines ?? ["4 new updates"], 640, 440);
  return (
    <group>
      <mesh geometry={rbox(0.5, 0.04, 0.24, 0.015)} material={th.m("#1A1C20", { rough: 0.6 })} position={[0, 0.02, -0.05]} receiveShadow castShadow />
      <Bx th={th} p={[0, 0.26, -0.15]} s={[0.4, 0.46, 0.02]} r={[0.35, 0, 0]} m={th.m("#1A1C20", { rough: 0.6 })} />
      <group position={[0, 0.42, -0.04]} rotation={[-0.22, 0, 0]}>
        <mesh geometry={rbox(0.9, 0.62, 0.035, 0.05)} material={th.m(col, { rough: 0.3, metal: 0.2 })} castShadow />
        <Screen th={th} tex={tex} p={[0, 0, 0.0185]} w={0.82} h={0.55} />
        <Neon th={th} p={[0, -0.316, 0.0]} s={[0.84, 0.006, 0.006]} />
      </group>
      {label ? <Card p={[0, 0.02, 0.071]} w={0.36} h={0.035} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "tb", label, "#1A1C20", "#FFFFFF", 512, 60, false) })} /> : null}
    </group>
  );
};

const keypadTex = (th: PackTheme, col: string) => canvasTexture(`pkKeys|${th.kit}|${col}`, 300, 440, (g, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  const key = shade(col, lum(col) > 0.45 ? -0.15 : 0.22), ink = inkOn(key);
  g.fillStyle = key; g.beginPath(); g.ellipse(W / 2, H * 0.12, W * 0.2, H * 0.07, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#3FA34D"; g.beginPath(); g.roundRect(W * 0.06, H * 0.08, W * 0.18, H * 0.08, 10); g.fill();
  g.fillStyle = "#D9473F"; g.beginPath(); g.roundRect(W * 0.76, H * 0.08, W * 0.18, H * 0.08, 10); g.fill();
  const labs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${Math.round(H * 0.06)}px ${HERO_FONT}`;
  labs.forEach((l, k) => { const x = W * (0.2 + (k % 3) * 0.3), y = H * (0.3 + Math.floor(k / 3) * 0.17); g.fillStyle = key; g.beginPath(); g.roundRect(x - W * 0.12, y - H * 0.06, W * 0.24, H * 0.12, 14); g.fill(); g.fillStyle = ink; g.fillText(l, x, y + 2); });
});
const FlipPhone: React.FC<GP> = ({ th, col, label, lines, screen }) => {
  const shell = th.m(col, { rough: 0.3, metal: 0.25 }), inner = th.m(shade(col, -0.3), { rough: 0.5 });
  const tex = screenTex(th, "flip", screen, lines ?? ["See you at 8?", "Reply"], 280, 300);
  return (
    <group>
      <mesh geometry={rbox(0.3, 0.05, 0.26, 0.02)} material={th.m("#1A1C20", { rough: 0.6 })} position={[0, 0.025, -0.04]} receiveShadow castShadow />
      {/* the lower half (keypad), tilted back */}
      <group position={[0, 0.04, 0.02]} rotation={[-0.2, 0, 0]}>
        <mesh geometry={rbox(0.3, 0.5, 0.06, 0.04)} material={shell} position={[0, 0.25, 0]} castShadow />
        <Card p={[0, 0.24, 0.0305]} w={0.27} h={0.44} m={th.m("#FFFFFF", { rough: 0.4, map: keypadTex(th, shade(col, -0.25)) })} />
        <mesh geometry={CYL(th, 0.03, 0.03, 0.3)} material={shell} position={[0, 0.5, -0.005]} rotation={[0, 0, Math.PI / 2]} />
        {/* the upper half (screen), opened further back */}
        <group position={[0, 0.5, -0.005]} rotation={[-0.32, 0, 0]}>
          <mesh geometry={rbox(0.3, 0.48, 0.05, 0.04)} material={shell} position={[0, 0.25, 0]} castShadow />
          <mesh geometry={rbox(0.27, 0.43, 0.004, 0.03)} material={inner} position={[0, 0.25, 0.026]} />
          <Screen th={th} tex={tex} p={[0, 0.22, 0.0285]} w={0.21} h={0.225} />
          <Bx th={th} p={[0, 0.42, 0.028]} s={[0.07, 0.012, 0.004]} m={th.m("#0A0A0A")} />
          <mesh geometry={CYL(th, 0.02, 0.022, 0.1)} material={inner} position={[0.1, 0.52, -0.01]} />
          {label ? <Card p={[0, 0.25, -0.0255]} w={0.2} h={0.06} r={[0, Math.PI, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "fp", label, col, inkOn(col), 400, 120, false) })} /> : null}
          <Neon th={th} p={[0, 0.49, 0.0]} s={[0.26, 0.006, 0.006]} />
        </group>
      </group>
    </group>
  );
};

const DigitalCamera: React.FC<GP> = ({ th, col, label, t, seed }) => {
  const body = th.m(col, { rough: 0.28, metal: 0.35 }), dark = th.m("#1C1E22", { rough: 0.4 }), glass = th.m("#0E2236", { rough: 0.04 });
  const blinkLed = ((t + hash(seed)) % 1.2) < 0.6 ? 1 : 0.25;
  return (
    <group>
      <mesh geometry={rbox(0.62, 0.38, 0.18, 0.05)} material={body} position={[0, 0.2, 0]} castShadow receiveShadow />
      <mesh geometry={rbox(0.1, 0.3, 0.04, 0.02)} material={dark} position={[-0.25, 0.19, 0.09]} />
      <group position={[0.07, 0.19, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={CYL(th, 0.14, 0.15, 0.04, 1.4)} material={body} position={[0, 0.02, 0]} />
        <mesh geometry={CYL(th, 0.115, 0.125, 0.08, 1.4)} material={dark} position={[0, 0.07, 0]} />
        <mesh geometry={CYL(th, 0.1, 0.1, 0.06, 1.4)} material={th.m(th.chrome, { rough: 0.2, metal: 0.5 })} position={[0, 0.12, 0]} />
        <mesh geometry={CYL(th, 0.075, 0.075, 0.02, 1.4)} material={glass} position={[0, 0.15, 0]} />
        <mesh geometry={TORUS(th, 0.05, 0.006)} material={th.m("#6A86C8", { rough: 0.1 })} position={[0, 0.161, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
      <mesh geometry={rbox(0.12, 0.06, 0.01, 0.01)} material={th.m("#F4F4F0", { rough: 0.15, opacity: 0.9 })} position={[0.2, 0.33, 0.092]} />
      <mesh geometry={CYL(th, 0.012, 0.012, 0.01)} material={th.glow("#FF8A2A", undefined, blinkLed)} position={[-0.12, 0.33, 0.092]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={CYL(th, 0.04, 0.04, 0.03)} material={th.m(th.chrome, { rough: 0.2, metal: 0.5 })} position={[0.2, 0.405, 0.0]} />
      <mesh geometry={CYL(th, 0.05, 0.05, 0.025, 1.2)} material={dark} position={[0.04, 0.4, -0.02]} />
      {label ? <Card p={[-0.13, 0.08, 0.0905]} w={0.18} h={0.04} m={th.m("#FFFFFF", { rough: 0.3, map: labelTex(th, "dc", label, col, inkOn(col), 400, 90, false) })} /> : null}
      <Neon th={th} p={[0, 0.005, 0.085]} s={[0.56, 0.006, 0.006]} />
    </group>
  );
};

const kbTex = (th: PackTheme, col: string) => canvasTexture(`pkKb|${th.kit}|${col}`, 512, 360, (g, W, H) => {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.fillStyle = "#1A1C22";
  for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) g.fillRect(W * 0.06 + c * W * 0.068, H * 0.06 + r * H * 0.1, W * 0.058, H * 0.08);
  g.fillRect(W * 0.26, H * 0.56, W * 0.48, H * 0.08);
  g.fillStyle = shade(col, -0.12); g.fillRect(W * 0.33, H * 0.7, W * 0.34, H * 0.24);
});
const Laptop: React.FC<GP> = ({ th, col, label, lines, screen }) => {
  const shell = th.m(col, { rough: 0.3, metal: 0.3 });
  const tex = screenTex(th, "laptop", screen, lines ?? ["Welcome back.", "3 new messages"], 640, 420);
  return (
    <group>
      <mesh geometry={rbox(0.9, 0.04, 0.62, 0.02)} material={shell} position={[0, 0.02, 0]} castShadow receiveShadow />
      <Card p={[0, 0.0405, 0.02]} w={0.84} h={0.56} r={[-Math.PI / 2, 0, 0]} m={th.m("#FFFFFF", { rough: 0.5, map: kbTex(th, col) })} />
      <group position={[0, 0.04, -0.3]} rotation={[-0.22, 0, 0]}>
        <mesh geometry={rbox(0.9, 0.6, 0.025, 0.02)} material={shell} position={[0, 0.3, 0]} castShadow />
        <mesh geometry={rbox(0.86, 0.56, 0.004, 0.015)} material={th.m("#06080C", { rough: 0.1 })} position={[0, 0.3, 0.0125]} />
        <Screen th={th} tex={tex} p={[0, 0.3, 0.015]} w={0.8} h={0.525} />
        {label ? <Card p={[0, 0.3, -0.0135]} w={0.3} h={0.08} r={[0, Math.PI, 0]} m={th.m("#FFFFFF", { rough: 0.3, map: labelTex(th, "lt", label, col, inkOn(col), 400, 110, false) })} /> : null}
        <Neon th={th} p={[0, 0.0, 0.014]} s={[0.84, 0.006, 0.006]} />
      </group>
    </group>
  );
};

const SmartSpeaker: React.FC<GP> = ({ th, col, label, t, seed }) => {
  const fab = th.m("#FFFFFF", { rough: 0.95, map: fabricTex(th, col) }), top = th.m(shade(col, -0.35), { rough: 0.4 });
  const pulse = 0.55 + 0.45 * Math.sin(t * 2.4 + seed) ** 2;
  return (
    <group>
      <mesh geometry={CYL(th, 0.22, 0.22, 0.5, 1.4)} material={fab} position={[0, 0.29, 0]} castShadow receiveShadow />
      <mesh geometry={CYL(th, 0.21, 0.22, 0.04, 1.4)} material={th.m("#15171B", { rough: 0.6 })} position={[0, 0.02, 0]} />
      <mesh geometry={CYL(th, 0.215, 0.22, 0.04, 1.4)} material={top} position={[0, 0.56, 0]} />
      <mesh geometry={TORUS(th, 0.19, 0.012)} material={th.glow(th.accent, undefined, pulse)} position={[0, 0.582, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {[0, 1, 2, 3].map((k) => <mesh key={k} geometry={CYL(th, 0.012, 0.012, 0.006)} material={th.m("#9AA0A8")} position={[Math.cos(k * Math.PI / 2) * 0.07, 0.582, Math.sin(k * Math.PI / 2) * 0.07]} />)}
      {label ? <Card p={[0, 0.14, 0.222]} w={0.2} h={0.05} m={th.m("#FFFFFF", { rough: 0.6, map: labelTex(th, "ss", label, shade(col, -0.2), "#FFFFFF", 400, 100, false) })} /> : null}
    </group>
  );
};

const Headphones: React.FC<GP> = ({ th, col, label }) => {
  const shell = th.m(col, { rough: 0.35 }), cush = th.m("#15171B", { rough: 0.9 }), metal = th.m(th.chrome, { rough: 0.25, metal: 0.5 });
  return (
    <group>
      <mesh geometry={CYL(th, 0.16, 0.18, 0.04, 1.2)} material={th.m("#1A1C20", { rough: 0.5 })} position={[0, 0.02, 0]} receiveShadow castShadow />
      <Limb th={th} a={[0, 0.04, 0]} b={[0, 0.76, 0]} r={0.025} m={metal} />
      <mesh geometry={TORUS(th, 0.27, 0.035, Math.PI)} material={shell} position={[0, 0.54, 0]} castShadow />
      <mesh geometry={TORUS(th, 0.245, 0.022, Math.PI * 0.7)} material={cush} position={[0, 0.54, 0]} rotation={[0, 0, Math.PI * 0.15]} />
      {[-1, 1].map((k) => (
        <group key={k} position={[k * 0.28, 0.4, 0]}>
          <Bx th={th} p={[0, 0.1, 0]} s={[0.025, 0.12, 0.05]} m={metal} />
          <mesh geometry={CYL(th, 0.13, 0.13, 0.08, 1.4)} material={shell} position={[k * 0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
          <mesh geometry={CYL(th, 0.11, 0.115, 0.05, 1.4)} material={cush} position={[-k * 0.035, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={TORUS(th, 0.1, 0.008)} material={th.glow(th.accent)} position={[k * 0.062, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        </group>
      ))}
      {label ? <Card p={[0, 0.04, 0.175]} w={0.24} h={0.04} m={th.m("#FFFFFF", { rough: 0.5, map: labelTex(th, "hp", label, "#1A1C20", "#FFFFFF", 512, 85, false) })} /> : null}
    </group>
  );
};

// ------------------------------------------------------------------ vehicles
type VP = { th: PackTheme; col: string; label: string; t: number; seed: number; sp: PackParams };

const Sedan: React.FC<VP> = ({ th, col, label }) => {
  const body = th.m(col, { rough: 0.3, metal: 0.25 }), glass = th.m("#1B2A44", { rough: 0.08 }), chrome = th.m(th.chrome, { rough: 0.2, metal: 0.5 });
  const cabin = EXTRUDE("sedanCab", [[-0.44, 0], [0.4, 0], [0.18, 0.24], [-0.3, 0.24]], 0.58);
  const win = EXTRUDE("sedanWin", [[-0.4, 0.02], [0.36, 0.02], [0.17, 0.21], [-0.28, 0.21]], 0.6);
  return (
    <group>
      <mesh geometry={rbox(1.44, 0.26, 0.64, 0.07)} material={body} position={[0, 0.27, 0]} castShadow receiveShadow />
      <mesh geometry={cabin} material={body} position={[-0.06, 0.39, 0]} castShadow />
      <mesh geometry={win} material={glass} position={[-0.06, 0.39, 0]} scale={[1, 1, 1]} />
      <Bx th={th} p={[-0.07, 0.5, 0]} s={[0.03, 0.2, 0.605]} m={body} />
      {[[0.46, 0.33], [0.46, -0.33], [-0.46, 0.33], [-0.46, -0.33]].map(([x, z], k) => <Wheel key={k} th={th} p={[x, 0.15, z]} r={0.15} w={0.1} />)}
      {[-1, 1].map((k) => <Bx key={`hl${k}`} th={th} p={[0.72, 0.32, k * 0.22]} s={[0.02, 0.06, 0.12]} m={th.glow("#FFF6D8")} />)}
      {[-1, 1].map((k) => <Bx key={`tl${k}`} th={th} p={[-0.72, 0.32, k * 0.22]} s={[0.02, 0.05, 0.12]} m={th.glow("#E0302A")} />)}
      <Bx th={th} p={[0.722, 0.25, 0]} s={[0.012, 0.06, 0.26]} m={chrome} />
      {[-1, 1].map((k) => <Bx key={`dh${k}`} th={th} p={[k * 0.12, 0.36, 0.322]} s={[0.07, 0.015, 0.01]} m={chrome} />)}
      <Bx th={th} p={[0.0, 0.36, 0.321]} s={[0.006, 0.2, 0.004]} m={th.m(shade(col, -0.4))} />
      <Plate th={th} label={label} p={[0.725, 0.2, 0]} ry={Math.PI / 2} />
      <Plate th={th} label={label} p={[-0.725, 0.22, 0]} ry={-Math.PI / 2} />
      <Neon th={th} p={[0, 0.14, 0.322]} s={[1.3, 0.008, 0.008]} />
    </group>
  );
};

const Pickup: React.FC<VP> = ({ th, col, label }) => {
  const body = th.m(col, { rough: 0.32, metal: 0.2 }), glass = th.m("#1B2A44", { rough: 0.08 }), chrome = th.m(th.chrome, { rough: 0.2, metal: 0.5 }), bed = th.m("#202226", { rough: 0.8 });
  const cab = EXTRUDE("pickCab", [[-0.26, 0], [0.24, 0], [0.12, 0.27], [-0.24, 0.27]], 0.62);
  const win = EXTRUDE("pickWin", [[-0.22, 0.03], [0.2, 0.03], [0.1, 0.23], [-0.2, 0.23]], 0.64);
  return (
    <group>
      <mesh geometry={rbox(1.52, 0.26, 0.68, 0.06)} material={body} position={[0, 0.32, 0]} castShadow receiveShadow />
      <mesh geometry={cab} material={body} position={[0.16, 0.45, 0]} castShadow />
      <mesh geometry={win} material={glass} position={[0.16, 0.45, 0]} />
      <Bx th={th} p={[-0.38, 0.452, 0]} s={[0.66, 0.012, 0.6]} m={bed} />
      {[-1, 1].map((k) => <Bx key={`w${k}`} th={th} p={[-0.38, 0.5, k * 0.32]} s={[0.7, 0.12, 0.04]} m={body} />)}
      <Bx th={th} p={[-0.74, 0.5, 0]} s={[0.04, 0.12, 0.68]} m={body} />
      <Bx th={th} p={[-0.05, 0.53, 0]} s={[0.04, 0.16, 0.66]} m={body} />
      {[[0.5, 0.34], [0.5, -0.34], [-0.5, 0.34], [-0.5, -0.34]].map(([x, z], k) => <Wheel key={k} th={th} p={[x, 0.18, z]} r={0.18} w={0.12} />)}
      {[[0.5, 1], [0.5, -1], [-0.5, 1], [-0.5, -1]].map(([x, k], j) => <mesh key={`a${j}`} geometry={TORUS(th, 0.2, 0.025, Math.PI)} material={th.m(shade(col, -0.35))} position={[x, 0.2, k * 0.345]} />)}
      <Bx th={th} p={[0.765, 0.33, 0]} s={[0.02, 0.14, 0.42]} m={chrome} />
      {[0, 1, 2].map((k) => <Bx key={`g${k}`} th={th} p={[0.772, 0.29 + k * 0.04, 0]} s={[0.006, 0.012, 0.38]} m={th.m("#1A1C20")} />)}
      {[-1, 1].map((k) => <Bx key={`hl${k}`} th={th} p={[0.765, 0.36, k * 0.26]} s={[0.02, 0.07, 0.1]} m={th.glow("#FFF6D8")} />)}
      {[-1, 1].map((k) => <Bx key={`tl${k}`} th={th} p={[-0.765, 0.46, k * 0.3]} s={[0.02, 0.1, 0.05]} m={th.glow("#E0302A")} />)}
      <Plate th={th} label={label} p={[0.776, 0.24, 0]} ry={Math.PI / 2} />
      <Plate th={th} label={label} p={[-0.765, 0.3, 0]} ry={-Math.PI / 2} />
      <Neon th={th} p={[0, 0.19, 0.342]} s={[1.4, 0.008, 0.008]} />
    </group>
  );
};

const Airplane: React.FC<VP> = ({ th, col, label, t, seed }) => {
  const white = th.m("#F4F4F2", { rough: 0.35 }), trim = th.m(col, { rough: 0.35 }), glass = th.m("#1B2A44", { rough: 0.08 }), dark = th.m("#22252B", { rough: 0.5 });
  const fin = EXTRUDE("apFin", [[0, 0], [0.2, 0], [0.05, 0.3], [-0.06, 0.3]], 0.025);
  const prop = t * 12 + seed;
  return (
    <group position={[0, 0.0, 0]}>
      {/* fuselage along x, the nose to +x */}
      <mesh geometry={CYL(th, 0.13, 0.115, 0.8, 1.4)} material={white} position={[0.1, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
      <mesh geometry={CYL(th, 0.115, 0.035, 0.7, 1.4)} material={white} position={[-0.65, 0.43, 0]} rotation={[0, 0, Math.PI / 2 + 0.06]} castShadow />
      <Ell th={th} p={[0.5, 0.4, 0]} s={[0.12, 0.125, 0.125]} m={white} />
      <mesh geometry={CONE(th, 0.06, 0.12)} material={trim} position={[0.66, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <group position={[0.63, 0.4, 0]} rotation={[prop, 0, 0]}>
        <Bx th={th} p={[0, 0, 0]} s={[0.012, 0.56, 0.05]} m={dark} />
      </group>
      {/* the stripe and the windows */}
      {[-1, 1].map((k) => <Bx key={`st${k}`} th={th} p={[-0.1, 0.38, k * 0.122]} s={[1.0, 0.035, 0.01]} m={trim} />)}
      {[-1, 1].map((k) => <Bx key={`wi${k}`} th={th} p={[0.26, 0.47, k * 0.108]} s={[0.26, 0.08, 0.02]} r={[k * 0.25, 0, 0]} m={glass} />)}
      <Bx th={th} p={[0.38, 0.49, 0]} s={[0.06, 0.08, 0.2]} r={[0, 0, -0.6]} m={glass} />
      {/* the high wing, struts, tail */}
      <mesh geometry={rbox(0.3, 0.035, 1.6, 0.015)} material={white} position={[0.22, 0.56, 0]} castShadow />
      {[-1, 1].map((k) => <Bx key={`wt${k}`} th={th} p={[0.22, 0.56, k * 0.76]} s={[0.3, 0.04, 0.09]} m={trim} />)}
      {[-1, 1].map((k) => <Limb key={`su${k}`} th={th} a={[0.2, 0.34, k * 0.1]} b={[0.22, 0.55, k * 0.45]} r={0.012} m={white} />)}
      <mesh geometry={rbox(0.18, 0.025, 0.56, 0.01)} material={white} position={[-0.9, 0.45, 0]} castShadow />
      <mesh geometry={fin} material={trim} position={[-1.0, 0.45, 0]} castShadow />
      {/* landing gear */}
      {[-1, 1].map((k) => <Limb key={`lg${k}`} th={th} a={[0.18, 0.3, k * 0.08]} b={[0.18, 0.1, k * 0.24]} r={0.014} m={dark} />)}
      {[-1, 1].map((k) => <Wheel key={`mw${k}`} th={th} p={[0.18, 0.08, k * 0.25]} r={0.08} w={0.05} hub="#F4F4F2" />)}
      <Limb th={th} a={[0.5, 0.3, 0]} b={[0.52, 0.08, 0]} r={0.012} m={dark} />
      <Wheel th={th} p={[0.52, 0.06, 0]} r={0.06} w={0.04} hub="#F4F4F2" />
      {label ? [-1, 1].map((k) => <Card key={`lb${k}`} p={[-0.38, 0.45, k * 0.112]} w={0.28} h={0.07} r={[0, k > 0 ? 0 : Math.PI, 0]} m={th.m("#FFFFFF", { rough: 0.35, map: labelTex(th, "ap", label, "#F4F4F2", col, 512, 128, false) })} />) : null}
      <Ell th={th} p={[0.22, 0.56, 0.81]} s={0.018} m={th.glow("#43E06B")} shadow={false} />
      <Ell th={th} p={[0.22, 0.56, -0.81]} s={0.018} m={th.glow("#FF4A4A")} shadow={false} />
    </group>
  );
};

const Boat: React.FC<VP> = ({ th, col, label, t, seed }) => {
  const hull = th.m("#F6F6F3", { rough: 0.3 }), trim = th.m(col, { rough: 0.35 }), deck = th.m("#C8A97A", { rough: 0.7 }), dark = th.m("#22252B", { rough: 0.5 });
  const hullGeo = geoOf("pkHull", () => {
    const s = new THREE.Shape();
    s.moveTo(-0.66, -0.26); s.lineTo(0.3, -0.27); s.quadraticCurveTo(0.62, -0.22, 0.74, 0); s.quadraticCurveTo(0.62, 0.22, 0.3, 0.27); s.lineTo(-0.66, 0.26); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2); return g;
  });
  const bob = 0.015 * Math.sin(t * 1.4 + seed), roll = 0.03 * Math.sin(t * 1.1 + seed + 1);
  const water = th.m(th.kit === "cyber3d" ? "#0E3A5A" : "#2F6E9E", { rough: 0.15, opacity: 0.9 });
  return (
    <group>
      <mesh geometry={geoOf("pkWater", () => new THREE.CircleGeometry(0.95, 40))} material={water} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
      {[0, 1].map((k) => { const u = ((t * 0.25 + k * 0.5 + hash(seed)) % 1); return <mesh key={k} geometry={TORUS(th, 1, 0.006)} material={th.m("#BFE3F5", { rough: 0.3, opacity: 0.6 * (1 - u) })} position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.45 + 0.45 * u, 0.3 + 0.3 * u, 1]} />; })}
      <group position={[0, 0.08 + bob, 0]} rotation={[roll, 0, roll * 0.4]}>
        <mesh geometry={hullGeo} material={hull} position={[0, 0, 0]} castShadow receiveShadow />
        {[-1, 1].map((k) => <Bx key={`st${k}`} th={th} p={[-0.12, 0.14, k * 0.272]} s={[1.0, 0.04, 0.01]} m={trim} />)}
        <Card p={[-0.1, 0.2405, 0]} w={1.0} h={0.44} r={[-Math.PI / 2, 0, 0]} m={deck} />
        <mesh geometry={rbox(0.24, 0.18, 0.36, 0.03)} material={trim} position={[0.12, 0.33, 0]} castShadow />
        <Bx th={th} p={[0.25, 0.48, 0]} s={[0.02, 0.18, 0.4]} r={[0, 0, -0.45]} m={th.m("#BFD9EE", { rough: 0.05, opacity: 0.5 })} />
        {[-1, 1].map((k) => <mesh key={`se${k}`} geometry={rbox(0.14, 0.1, 0.14, 0.02)} material={th.m("#F6F6F3", { rough: 0.6 })} position={[-0.18, 0.29, k * 0.12]} castShadow />)}
        <mesh geometry={rbox(0.12, 0.22, 0.14, 0.03)} material={dark} position={[-0.74, 0.34, 0]} castShadow />
        <Bx th={th} p={[-0.76, 0.14, 0]} s={[0.04, 0.24, 0.05]} m={dark} />
        {label ? [-1, 1].map((k) => <Card key={`lb${k}`} p={[-0.42, 0.13, k * 0.279]} w={0.28} h={0.075} r={[0, k > 0 ? 0 : Math.PI, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "bt", label, "#F6F6F3", col, 512, 136, false) })} />) : null}
        <Neon th={th} p={[-0.12, 0.2, 0.275]} s={[1.0, 0.008, 0.008]} />
      </group>
    </group>
  );
};

// ------------------------------------------------------------------ everyday
const cartWire = (th: PackTheme) => geoOf(`pkCartWire|${th.smooth}`, () => {
  const parts: THREE.BufferGeometry[] = [];
  const bar = (a: V3, b: V3, r = 0.008) => {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
    const g = new THREE.CylinderGeometry(r, r, L, 5, 1); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); parts.push(g);
  };
  // the basket: x from -0.42 (handle end) to 0.42 (front), the front narrower and lower, y 0.42 .. 0.82
  const top = (x: number) => 0.84 - (x + 0.42) * 0.04, bot = (x: number) => 0.44 + (x + 0.42) * 0.03, wz = (x: number) => 0.28 - (x + 0.42) * 0.06;
  for (const k of [-1, 1]) {
    bar([-0.42, top(-0.42), k * wz(-0.42)], [0.42, top(0.42), k * wz(0.42)], 0.011);
    bar([-0.42, bot(-0.42), k * wz(-0.42)], [0.42, bot(0.42), k * wz(0.42)]);
    bar([-0.42, (top(-0.42) + bot(-0.42)) / 2, k * wz(-0.42)], [0.42, (top(0.42) + bot(0.42)) / 2, k * wz(0.42)], 0.006);
    for (let i = 0; i <= 12; i++) { const x = -0.42 + (i / 12) * 0.84; bar([x, bot(x), k * wz(x)], [x, top(x), k * wz(x)], 0.006); }
  }
  for (const x of [-0.42, 0.42]) {
    bar([x, top(x), -wz(x)], [x, top(x), wz(x)], 0.011); bar([x, bot(x), -wz(x)], [x, bot(x), wz(x)]);
    for (let i = 0; i <= 8; i++) { const z = -wz(x) + (i / 8) * 2 * wz(x); bar([x, bot(x), z], [x, top(x), z], 0.006); }
  }
  for (let i = 0; i <= 8; i++) { const u = i / 8; bar([-0.42, bot(-0.42), -wz(-0.42) + u * 2 * wz(-0.42)], [0.42, bot(0.42), -wz(0.42) + u * 2 * wz(0.42)], 0.005); }
  // chassis: a frame from the basket down to the casters, a bottom rack
  for (const k of [-1, 1]) { bar([-0.4, bot(-0.4), k * 0.2], [-0.36, 0.08, k * 0.2], 0.013); bar([0.38, bot(0.38), k * 0.16], [0.34, 0.08, k * 0.16], 0.013); bar([-0.36, 0.08, k * 0.2], [0.34, 0.08, k * 0.16], 0.013); }
  for (let i = 0; i <= 5; i++) { const u = i / 5; bar([-0.34, 0.12, -0.2 + 0.4 * u], [0.3, 0.12, -0.16 + 0.32 * u], 0.005); }
  bar([-0.34, 0.12, -0.2], [-0.34, 0.12, 0.2], 0.008); bar([0.3, 0.12, -0.16], [0.3, 0.12, 0.16], 0.008);
  // handle uprights
  for (const k of [-1, 1]) bar([-0.42, top(-0.42), k * 0.24], [-0.5, 0.94, k * 0.24], 0.012);
  return mergeGeometries(parts.map((g) => g.toNonIndexed()));
});
const ShoppingCart: React.FC<VP> = ({ th, col, label }) => {
  const wire = th.m(th.chrome, { rough: 0.25, metal: 0.55 });
  return (
    <group>
      <mesh geometry={cartWire(th)} material={wire} castShadow />
      <mesh geometry={CYL(th, 0.026, 0.026, 0.56, 1)} material={th.m(col, { rough: 0.4 })} position={[-0.5, 0.94, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      {[[-0.36, 0.2], [-0.36, -0.2], [0.34, 0.16], [0.34, -0.16]].map(([x, z], k) => (
        <group key={k}>
          <Bx th={th} p={[x, 0.06, z]} s={[0.03, 0.04, 0.03]} m={wire} />
          <Wheel th={th} p={[x, 0.04, z]} r={0.04} w={0.025} hub="#9AA0A8" />
        </group>
      ))}
      {label ? <Card p={[0.425, 0.66, 0]} w={0.3} h={0.1} r={[0, Math.PI / 2, 0]} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "sc", label, col, inkOn(col), 400, 130) })} /> : null}
      {label ? <Card p={[0.0, 0.66, 0.268]} w={0.3} h={0.1} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "sc", label, col, inkOn(col), 400, 130) })} /> : null}
    </group>
  );
};

const regKeysTex = (th: PackTheme, col: string) => canvasTexture(`pkRegKeys|${th.kit}|${col}`, 420, 300, (g, W, H) => {
  g.fillStyle = shade(col, -0.15); g.fillRect(0, 0, W, H);
  const labs = ["7", "8", "9", "+", "4", "5", "6", "-", "1", "2", "3", "x", "0", "00", ".", "="];
  g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${Math.round(H * 0.11)}px ${HERO_FONT}`;
  labs.forEach((l, k) => { const x = W * (0.14 + (k % 4) * 0.24), y = H * (0.14 + Math.floor(k / 4) * 0.24); g.fillStyle = k % 4 === 3 ? "#D9473F" : "#F4F1EA"; g.beginPath(); g.roundRect(x - W * 0.1, y - H * 0.1, W * 0.2, H * 0.2, 10); g.fill(); g.fillStyle = k % 4 === 3 ? "#FFFFFF" : "#1A1C20"; g.fillText(l, x, y + 2); });
});
const CashRegister: React.FC<GP> = ({ th, col, label, screen }) => {
  const body = th.m(col, { rough: 0.45 }), dark = th.m("#2A2E36", { rough: 0.5 }), bill = th.m("#8DBA7A", { rough: 0.8 }), coin = th.m("#C9A64A", { rough: 0.35, metal: 0.4 });
  const tex = screenTex(th, "lcd", screen, [], 400, 140);
  const slope = EXTRUDE("regSlope", [[-0.24, 0], [0.2, 0], [0.2, 0.08], [-0.24, 0.26]], 0.6);
  return (
    <group>
      <mesh geometry={rbox(0.66, 0.2, 0.6, 0.03)} material={body} position={[0, 0.1, 0]} castShadow receiveShadow />
      {/* the drawer open, bills and coins in their cups */}
      <group position={[0, 0.09, 0.3]}>
        <mesh geometry={rbox(0.58, 0.1, 0.34, 0.015)} material={body} position={[0, 0, 0]} castShadow />
        <Bx th={th} p={[0, 0.052, 0]} s={[0.54, 0.005, 0.3]} m={dark} />
        {[-0.2, -0.07, 0.06, 0.19].map((x, k) => <mesh key={`b${k}`} geometry={rbox(0.11, 0.02, 0.15, 0.005)} material={bill} position={[x, 0.064, -0.05]} />)}
        {[-0.18, -0.06, 0.06, 0.18].map((x, k) => <mesh key={`c${k}`} geometry={CYL(th, 0.035, 0.035, 0.015)} material={coin} position={[x, 0.062, 0.09]} />)}
        <Bx th={th} p={[0, 0.0, 0.172]} s={[0.12, 0.02, 0.01]} m={th.m(th.chrome, { rough: 0.3, metal: 0.4 })} />
      </group>
      {/* the sloped keyboard */}
      <group position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={slope} material={body} castShadow />
      </group>
      <Card p={[0, 0.32, 0.02]} w={0.46} h={0.34} r={[-Math.PI / 2 + 0.39, 0, 0]} m={th.m("#FFFFFF", { rough: 0.5, map: regKeysTex(th, col) })} />
      {/* the display on a post, facing the customer (and the lens) */}
      <Limb th={th} a={[0, 0.4, -0.2]} b={[0, 0.58, -0.2]} r={0.03} m={dark} />
      <group position={[0, 0.64, -0.2]} rotation={[-0.15, 0, 0]}>
        <mesh geometry={rbox(0.38, 0.14, 0.08, 0.02)} material={dark} castShadow />
        <Screen th={th} tex={tex} p={[0, 0, 0.041]} w={0.34} h={0.11} />
      </group>
      {/* the receipt roll */}
      <mesh geometry={CYL(th, 0.05, 0.05, 0.12)} material={th.m("#F7F5EE")} position={[0.22, 0.42, -0.18]} rotation={[0, 0, Math.PI / 2]} />
      <Bx th={th} p={[0.22, 0.5, -0.15]} s={[0.1, 0.12, 0.004]} r={[-0.3, 0, 0]} m={th.m("#F7F5EE")} />
      {label ? <Card p={[0, 0.1, 0.475]} w={0.3} h={0.05} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "cr", label, col, inkOn(col), 512, 85, false) })} /> : null}
      <Neon th={th} p={[0, 0.2, 0.301]} s={[0.62, 0.006, 0.006]} />
    </group>
  );
};

const VendingMachine: React.FC<VP> = ({ th, col, label, t, seed }) => {
  const body = th.m(col, { rough: 0.35 }), dark = th.m("#1A1C20", { rough: 0.5 }), glass = th.m("#CFE6F5", { rough: 0.04, opacity: 0.22 });
  const head = labelTex(th, "vm", label || "SNACKS", shade(col, -0.35), "#FFFFFF", 512, 120, false);
  const items: React.ReactNode[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const k = r * 4 + c, x = -0.31 + c * 0.1, y = 0.5 + r * 0.19, h = hash(k * 3.1 + 7), cc = `hsl(${Math.round(h * 360)},65%,${th.kit === "cyber3d" ? 42 : 52}%)`;
    items.push(r % 2 ? <mesh key={k} geometry={CYL(th, 0.03, 0.03, 0.11)} material={th.m(cc, { rough: 0.3, metal: 0.2 })} position={[x, y + 0.055, 0.22]} /> : <mesh key={k} geometry={rbox(0.08, 0.12, 0.03, 0.01)} material={th.m(cc, { rough: 0.5 })} position={[x, y + 0.06, 0.24]} />);
    items.push(<Bx key={`sh${k}`} th={th} p={[x, y, 0.2]} s={[0.09, 0.006, 0.17]} m={th.m(th.chrome, { rough: 0.3, metal: 0.4 })} shadow={false} />);
  }
  const pulse = 0.85 + 0.15 * Math.sin(t * 2 + seed);
  return (
    <group>
      <mesh geometry={rbox(0.82, 1.52, 0.42, 0.03)} material={body} position={[0, 0.76, -0.1]} castShadow receiveShadow />
      <Bx th={th} p={[0.27, 0.76, 0.205]} s={[0.28, 1.52, 0.21]} m={body} />
      <Bx th={th} p={[-0.11, 1.43, 0.205]} s={[0.6, 0.18, 0.21]} m={body} />
      <Bx th={th} p={[-0.11, 0.17, 0.205]} s={[0.6, 0.34, 0.21]} m={body} />
      <Bx th={th} p={[-0.385, 0.76, 0.205]} s={[0.05, 1.52, 0.21]} m={body} />
      <Bx th={th} p={[-0.11, 0.86, 0.112]} s={[0.5, 1.0, 0.01]} m={dark} />
      {items}
      <Card p={[-0.11, 0.86, 0.311]} w={0.5} h={1.0} m={glass} />
      <Card p={[0, 1.42, 0.311]} w={0.74} h={0.14} m={th.glow("#FFFFFF", head, pulse)} />
      <mesh geometry={rbox(0.18, 0.5, 0.02, 0.01)} material={th.m(shade(col, -0.25), { rough: 0.5 })} position={[0.27, 0.98, 0.315]} />
      <Card p={[0.27, 1.14, 0.321]} w={0.12} h={0.06} m={th.glow(th.accent)} />
      {Array.from({ length: 9 }, (_, k) => <Bx key={`k${k}`} th={th} p={[0.24 + (k % 3) * 0.03, 1.04 - Math.floor(k / 3) * 0.035, 0.322]} s={[0.022, 0.025, 0.006]} m={th.m("#D8DCE0", { rough: 0.4 })} shadow={false} />)}
      <Bx th={th} p={[0.27, 0.84, 0.322]} s={[0.012, 0.05, 0.006]} m={th.m("#0A0A0A")} />
      <mesh geometry={rbox(0.5, 0.14, 0.03, 0.01)} material={dark} position={[-0.11, 0.2, 0.31]} />
      <Neon th={th} p={[-0.11, 1.365, 0.315]} s={[0.5, 0.006, 0.006]} />
    </group>
  );
};

const PizzaBox: React.FC<VP> = ({ th, col, label, seed }) => {
  const card = th.m(col, { rough: 0.85 }), crust = th.m("#D99A4E", { rough: 0.7 }), cheese = th.m("#F2C14E", { rough: 0.6 }), pep = th.m("#B83A2A", { rough: 0.5 }), sauce = th.m("#C84A2E", { rough: 0.6 });
  const lab = label || "PIZZA";
  const lidTex = canvasTexture(`pkPizzaLid|${th.kit}|${lab}|${col}`, 512, 512, (g, W, H) => {
    g.fillStyle = col; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#B8322A"; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H / 2, W * 0.36, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#B8322A"; g.textAlign = "center"; g.textBaseline = "middle"; fitText(g, lab.toUpperCase(), Math.round(H * 0.16), W * 0.6); g.fillText(lab.toUpperCase(), W / 2, H * 0.5);
  });
  const peps = Array.from({ length: 11 }, (_, k) => { const a = hash(k * 5.3 + seed * 0 + 1) * Math.PI * 2, r = 0.06 + hash(k * 2.7 + 3) * 0.22; return [Math.cos(a) * r, Math.sin(a) * r] as [number, number]; });
  return (
    <group>
      <mesh geometry={rbox(0.82, 0.07, 0.82, 0.01)} material={card} position={[0, 0.035, 0]} castShadow receiveShadow />
      <group position={[0, 0.07, 0.02]}>
        <mesh geometry={CYL(th, 0.36, 0.36, 0.03, 1.6)} material={crust} position={[0, 0.015, 0]} />
        <mesh geometry={CYL(th, 0.33, 0.33, 0.012, 1.6)} material={sauce} position={[0, 0.032, 0]} />
        <mesh geometry={CYL(th, 0.315, 0.315, 0.014, 1.6)} material={cheese} position={[0, 0.036, 0]} />
        {peps.map(([x, z], k) => <mesh key={k} geometry={CYL(th, 0.035, 0.035, 0.01, 0.8)} material={pep} position={[x, 0.046, z]} />)}
        {[0, 1, 2, 3].map((k) => <Bx key={`c${k}`} th={th} p={[0, 0.045, 0]} s={[0.7, 0.004, 0.006]} r={[0, (k * Math.PI) / 4, 0]} m={th.m("#9A6A2E")} shadow={false} />)}
      </group>
      {/* the lid, open and leaning back: its printed top faces the back, the inside print faces the lens */}
      <group position={[0, 0.07, -0.41]} rotation={[-1.75 + Math.PI / 2 - 0.0, 0, 0]}>
        <mesh geometry={rbox(0.82, 0.82, 0.012, 0.005)} material={card} position={[0, 0.41, 0]} castShadow />
        <Card p={[0, 0.41, 0.0065]} w={0.76} h={0.76} m={th.m("#FFFFFF", { rough: 0.8, map: lidTex })} />
      </group>
      <Card p={[0, 0.035, 0.4105]} w={0.6} h={0.055} m={th.m("#FFFFFF", { rough: 0.8, map: labelTex(th, "pz", lab, col, "#B8322A", 640, 60, false) })} />
    </group>
  );
};

const SodaBottle: React.FC<VP> = ({ th, col, label, t, seed }) => {
  const prof = geoOf(`pkBottle|${th.smooth}`, () => {
    const pts = [[0, 0], [0.12, 0.0], [0.17, 0.04], [0.175, 0.1], [0.172, 0.45], [0.176, 0.58], [0.15, 0.7], [0.08, 0.8], [0.05, 0.84], [0.05, 0.88]].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, th.smooth ? 36 : 12);
  });
  const liquid = geoOf(`pkBottleL|${th.smooth}`, () => new THREE.LatheGeometry([[0, 0.02], [0.115, 0.02], [0.158, 0.05], [0.162, 0.1], [0.16, 0.45], [0.163, 0.58], [0.1, 0.68], [0, 0.68]].map(([x, y]) => new THREE.Vector2(x, y)), th.smooth ? 36 : 12));
  const band = canvasTexture(`pkSodaBand|${th.kit}|${label}|${col}`, 1024, 256, (g, W, H) => {
    g.fillStyle = col; g.fillRect(0, 0, W, H);
    g.fillStyle = "#FFFFFF"; g.fillRect(0, H * 0.08, W, H * 0.05); g.fillRect(0, H * 0.87, W, H * 0.05);
    g.fillStyle = inkOn(col); g.textAlign = "center"; g.textBaseline = "middle";
    fitText(g, (label || "SODA").toUpperCase(), Math.round(H * 0.5), W * 0.3); g.fillText((label || "SODA").toUpperCase(), W * 0.5, H * 0.53);
  });
  return (
    <group>
      <mesh geometry={liquid} material={th.m("#6A2E18", { rough: 0.15, side: THREE.DoubleSide })} />
      {Array.from({ length: 7 }, (_, k) => { const u = (t * 0.25 + hash(k + seed)) % 1; return <Ell key={k} th={th} p={[(hash(k * 3.3) - 0.5) * 0.2, 0.06 + u * 0.6, (hash(k * 1.7) - 0.5) * 0.2]} s={0.008 + 0.006 * hash(k)} m={th.m("#F2D9B8", { rough: 0.1, opacity: 0.8 })} shadow={false} />; })}
      <mesh geometry={prof} material={th.m("#D9EEF2", { rough: 0.06, opacity: 0.35, side: THREE.DoubleSide })} castShadow />
      <mesh geometry={CYL(th, 0.179, 0.179, 0.22, 1.6, true)} material={th.m("#FFFFFF", { rough: 0.4, map: band })} position={[0, 0.34, 0]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={CYL(th, 0.058, 0.058, 0.07, 1)} material={th.m(col, { rough: 0.4 })} position={[0, 0.915, 0]} castShadow />
      <mesh geometry={CYL(th, 0.07, 0.07, 0.012, 1)} material={th.m(col, { rough: 0.4 })} position={[0, 0.872, 0]} />
    </group>
  );
};

const Shoe: React.FC<VP> = ({ th, col, label, sp }) => {
  const heel = sp.variant === "heel";
  if (heel) {
    // a pump: an arched sole on a stiletto, a closed toe box, a low heel counter, the open top showing the insole
    const cc = col || "#B8322A", c = th.m(cc, { rough: 0.25 }), sole = th.m("#1A1414", { rough: 0.5 }), insole = th.m("#E8D8C8", { rough: 0.7 });
    const arch: [number, number][] = [[-0.42, 0.36], [-0.3, 0.35], [-0.12, 0.25], [0.06, 0.08], [0.2, 0.025], [0.44, 0.025]];
    const ribbon = (key: string, th0: number, th1: number) => EXTRUDE(key, [...arch.map(([x, y]) => [x, y + th1] as [number, number]), ...arch.slice().reverse().map(([x, y]) => [x, y + th0] as [number, number])], 0.17);
    const counter = geoOf(`pkHeelCtr|${th.seg}`, () => new THREE.CylinderGeometry(0.085, 0.085, 0.1, Math.max(8, th.seg), 1, true, Math.PI * 0.5, Math.PI));
    return (
      <group>
        <mesh geometry={ribbon("heelSole", 0, 0.02)} material={sole} castShadow receiveShadow />
        <mesh geometry={ribbon("heelIns", 0.02, 0.03)} material={insole} />
        <Limb th={th} a={[-0.37, 0.0, 0]} b={[-0.37, 0.36, 0]} r={0.032} taper={0.45} m={sole} />
        <Bx th={th} p={[-0.37, 0.005, 0]} s={[0.035, 0.01, 0.035]} m={sole} />
        <mesh geometry={counter} material={th.m(cc, { rough: 0.25, side: THREE.DoubleSide })} position={[-0.34, 0.43, 0]} scale={[1.1, 1, 1]} rotation={[0, 0, 0.1]} castShadow />
        <Ell th={th} p={[0.27, 0.075, 0]} s={[0.2, 0.085, 0.095]} m={c} />
        <Ell th={th} p={[0.1, 0.12, 0]} s={[0.12, 0.07, 0.092]} r={[0, 0, 0.55]} m={c} />
        {[-1, 1].map((k) => <Bx key={k} th={th} p={[-0.14, 0.3, k * 0.08]} s={[0.3, 0.07, 0.012]} r={[0, 0, -0.5]} m={c} />)}
        {label ? <Card p={[0.26, 0.09, 0.097]} w={0.2} h={0.055} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "sh", label, cc, inkOn(cc), 400, 110, false) })} /> : null}
      </group>
    );
  }
  // a lace-up sneaker: a white cup sole, the upper built from a toe cap, a vamp and a heel counter, laces, an ankle
  // opening, the label on the side panel
  const cc = col || "#2E6FB5", c = th.m(cc, { rough: 0.45 }), white = th.m("#F6F6F3", { rough: 0.6 }), dark = th.m("#1A1C20", { rough: 0.8 });
  const upper = EXTRUDE("snkUp2", [[-0.42, 0.09], [0.36, 0.09], [0.42, 0.13], [0.32, 0.2], [0.12, 0.25], [-0.06, 0.33], [-0.22, 0.34], [-0.3, 0.3], [-0.44, 0.33], [-0.46, 0.2]], 0.24, 0.03);
  return (
    <group>
      <mesh geometry={rbox(0.98, 0.1, 0.34, 0.045)} material={white} position={[0, 0.05, 0]} castShadow receiveShadow />
      <Bx th={th} p={[0, 0.012, 0]} s={[0.96, 0.024, 0.32]} m={th.m("#C9CDD4", { rough: 0.8 })} shadow={false} round={th.smooth ? 0.01 : 0} />
      <mesh geometry={upper} material={c} castShadow />
      <Ell th={th} p={[0.3, 0.14, 0]} s={[0.16, 0.08, 0.14]} m={white} />
      <Ell th={th} p={[-0.37, 0.22, 0]} s={[0.1, 0.13, 0.145]} m={th.m(shade(cc, -0.25), { rough: 0.45 })} />
      <Ell th={th} p={[-0.22, 0.33, 0]} s={[0.12, 0.025, 0.1]} m={dark} shadow={false} />
      <Bx th={th} p={[-0.02, 0.3, 0]} s={[0.26, 0.02, 0.1]} r={[0, 0, -0.35]} m={th.m(shade(cc, 0.3), { rough: 0.6 })} />
      {[0, 1, 2, 3].map((k) => <Bx key={k} th={th} p={[-0.1 + k * 0.065, 0.335 - k * 0.025, 0]} s={[0.022, 0.014, 0.2]} r={[0, 0, -0.35]} m={white} />)}
      <Ell th={th} p={[-0.47, 0.3, 0]} s={[0.025, 0.06, 0.04]} m={white} />
      <Card p={[-0.02, 0.18, 0.1505]} w={0.34} h={0.1} r={[0, 0, 0.12]} m={th.m("#FFFFFF", { rough: 0.45, map: labelTex(th, "sn", label || " ", shade(cc, 0.18), "#FFFFFF", 400, 120, false) })} />
      <Card p={[-0.02, 0.18, -0.1505]} w={0.34} h={0.1} r={[0, Math.PI, -0.12]} m={th.m("#FFFFFF", { rough: 0.45, map: labelTex(th, "sn", label || " ", shade(cc, 0.18), "#FFFFFF", 400, 120, false) })} />
    </group>
  );
};

const dialTex = (th: PackTheme) => canvasTexture(`pkDial|${th.kit}`, 512, 512, (g, W, H) => {
  g.fillStyle = th.kit === "cyber3d" ? "#0D1526" : "#F6F2E8"; g.beginPath(); g.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2); g.fill();
  const ink = th.kit === "cyber3d" ? "#EAF6FF" : "#1A1C20";
  g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `bold ${Math.round(W * 0.11)}px ${HERO_FONT}`;
  for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2, r0 = W * (k % 5 ? 0.44 : 0.4); g.save(); g.translate(W / 2, H / 2); g.rotate(a); g.fillRect(-(k % 5 ? 2 : 5), -W * 0.47, k % 5 ? 4 : 10, W * 0.47 - r0); g.restore(); }
  [["12", 0], ["3", 0.25], ["6", 0.5], ["9", 0.75]].forEach(([s, u]) => { const a = (u as number) * Math.PI * 2 - Math.PI / 2; g.fillText(s as string, W / 2 + Math.cos(a) * W * 0.31, H / 2 + Math.sin(a) * W * 0.31); });
});
const Wristwatch: React.FC<GP> = ({ th, col, label, screen, t }) => {
  const caseM = th.m(th.gold, { rough: 0.25, metal: 0.5 }), strap = th.m(col, { rough: 0.7, side: THREE.DoubleSide }), hand = th.m(th.kit === "cyber3d" ? th.accent : "#1A1C20", { rough: 0.3 });
  const [hh, mm] = (screen.match(/^(\d{1,2}):(\d{2})$/) ? screen.split(":").map(Number) : [10, 10]);
  const sec = Math.floor(t) % 60; // ticks once a second (deterministic)
  const aH = -(((hh % 12) + mm / 60) / 12) * Math.PI * 2, aM = -(mm / 60) * Math.PI * 2, aS = -(sec / 60) * Math.PI * 2;
  return (
    <group>
      <Ell th={th} p={[0, 0.1, 0]} s={[0.26, 0.1, 0.22]} m={th.m(th.kit === "law3d" ? "#3A1E2A" : "#2A2D33", { rough: 0.9 })} />
      <mesh geometry={CYL(th, 0.27, 0.27, 0.2, 1.3, true)} material={strap} position={[0, 0.4, -0.04]} rotation={[0, 0, Math.PI / 2]} castShadow />
      <group position={[0, 0.42, 0.24]} rotation={[-0.08, 0, 0]}>
        <mesh geometry={CYL(th, 0.22, 0.22, 0.07, 1.6)} material={caseM} rotation={[Math.PI / 2, 0, 0]} castShadow />
        <mesh geometry={geoOf("pkDialC", () => new THREE.CircleGeometry(0.195, 48))} material={th.kit === "cyber3d" ? th.glow("#FFFFFF", dialTex(th)) : th.m("#FFFFFF", { rough: 0.5, map: dialTex(th) })} position={[0, 0, 0.0355]} />
        <group position={[0, 0, 0.04]} rotation={[0, 0, aH]}><Bx th={th} p={[0, 0.05, 0]} s={[0.018, 0.11, 0.006]} m={hand} shadow={false} /></group>
        <group position={[0, 0, 0.045]} rotation={[0, 0, aM]}><Bx th={th} p={[0, 0.075, 0]} s={[0.012, 0.16, 0.006]} m={hand} shadow={false} /></group>
        <group position={[0, 0, 0.05]} rotation={[0, 0, aS]}><Bx th={th} p={[0, 0.07, 0]} s={[0.005, 0.17, 0.004]} m={th.m("#C8302A")} shadow={false} /></group>
        <mesh geometry={CYL(th, 0.014, 0.014, 0.012)} material={caseM} position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={CYL(th, 0.025, 0.025, 0.04)} material={caseM} position={[0.235, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={TORUS(th, 0.21, 0.012)} material={caseM} position={[0, 0, 0.036]} />
      </group>
      {label ? <Card p={[0, 0.06, 0.226]} w={0.26} h={0.05} r={[-0.3, 0, 0]} m={th.m("#FFFFFF", { rough: 0.5, map: labelTex(th, "ww", label, th.gold, "#1A1C20", 512, 100, false) })} /> : null}
    </group>
  );
};

const Ring: React.FC<VP> = ({ th, col, label, t, seed }) => {
  const velvet = th.m(th.kit === "biz3d" ? "#14213D" : th.kit === "cyber3d" ? "#141826" : "#3A1E2A", { rough: 0.95 }), metal = th.m(col, { rough: 0.2, metal: 0.55 });
  const sparkle = 0.6 + 0.4 * Math.max(0, Math.sin(t * 3.1 + seed)) ** 6;
  const gem = th.m("#EAF6FF", { rough: 0.02, emissive: "#BFE6FF", ei: 0.35 * sparkle });
  return (
    <group>
      <mesh geometry={rbox(0.52, 0.22, 0.48, 0.04)} material={velvet} position={[0, 0.11, 0]} castShadow receiveShadow />
      <mesh geometry={rbox(0.44, 0.03, 0.4, 0.02)} material={th.m("#2E3138", { rough: 0.95 })} position={[0, 0.215, 0.0]} />
      <group position={[0, 0.22, -0.24]} rotation={[-1.85 + Math.PI / 2, 0, 0]}>
        <mesh geometry={rbox(0.52, 0.48, 0.1, 0.04)} material={velvet} position={[0, 0.24, -0.04]} castShadow />
        <mesh geometry={rbox(0.44, 0.4, 0.02, 0.02)} material={th.m("#F2EEE6", { rough: 0.8 })} position={[0, 0.24, 0.015]} />
      </group>
      <Ell th={th} p={[0, 0.24, 0.02]} s={[0.12, 0.05, 0.06]} m={velvet} />
      <group position={[0, 0.36, 0.02]} rotation={[0, 0.2 * Math.sin(t * 0.5 + seed), 0]}>
        <mesh geometry={TORUS(th, 0.12, 0.024)} material={metal} castShadow />
        <mesh geometry={CYL(th, 0.035, 0.03, 0.04, 0.6)} material={metal} position={[0, 0.14, 0]} />
        <mesh geometry={CONE(th, 0.08, 0.06, 8)} material={gem} position={[0, 0.17, 0]} rotation={[Math.PI, 0, 0]} />
        <mesh geometry={CYL(th, 0.05, 0.08, 0.035, 0.35)} material={gem} position={[0, 0.218, 0]} />
      </group>
      {label ? <Card p={[0, 0.1, 0.2405]} w={0.3} h={0.06} m={th.m("#FFFFFF", { rough: 0.4, map: labelTex(th, "rg", label, th.gold, "#1A1C20", 512, 100, false) })} /> : null}
    </group>
  );
};

const Briefcase: React.FC<VP> = ({ th, col, label, t }) => {
  const leather = th.m(col, { rough: 0.55 }), gold = th.m(th.gold, { rough: 0.25, metal: 0.5 });
  return (
    <group>
      <mesh geometry={rbox(0.82, 0.6, 0.22, 0.05)} material={leather} position={[0, 0.31, 0]} castShadow receiveShadow />
      <Bx th={th} p={[0, 0.48, 0.0]} s={[0.83, 0.012, 0.225]} m={th.m(shade(col, -0.3))} shadow={false} />
      {[-1, 1].map((k) => <mesh key={`l${k}`} geometry={rbox(0.08, 0.06, 0.03, 0.01)} material={gold} position={[k * 0.26, 0.48, 0.115]} />)}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([x, y], k) => <mesh key={`c${k}`} geometry={rbox(0.06, 0.06, 0.235, 0.015)} material={gold} position={[x * 0.39, 0.31 + y * 0.28, 0]} />)}
      {[-1, 1].map((k) => <mesh key={`m${k}`} geometry={rbox(0.05, 0.03, 0.06, 0.01)} material={gold} position={[k * 0.12, 0.625, 0]} />)}
      <mesh geometry={TORUS(th, 0.12, 0.022, Math.PI)} material={leather} position={[0, 0.63, 0]} castShadow />
      <LuggageTag th={th} label={label} p={[0.12, 0.66, 0.03]} r={[0, 0, 0.12 * Math.sin(t * 1.3)]} />
    </group>
  );
};

const Suitcase: React.FC<VP> = ({ th, col, label, t }) => {
  const shell = th.m(col, { rough: 0.3, metal: 0.1 }), dark = th.m("#1A1C20", { rough: 0.5 }), metal = th.m(th.chrome, { rough: 0.25, metal: 0.5 });
  return (
    <group>
      <mesh geometry={rbox(0.6, 0.88, 0.32, 0.06)} material={shell} position={[0, 0.52, 0]} castShadow receiveShadow />
      {[-0.18, -0.06, 0.06, 0.18].map((x, k) => <mesh key={`r${k}`} geometry={rbox(0.03, 0.78, 0.02, 0.01)} material={th.m(shade(col, 0.1), { rough: 0.3 })} position={[x, 0.52, 0.163]} />)}
      <Bx th={th} p={[0, 0.52, 0]} s={[0.605, 0.88, 0.012]} m={dark} shadow={false} />
      {[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, z], k) => (
        <group key={`w${k}`}>
          <Bx th={th} p={[x * 0.24, 0.07, z * 0.12]} s={[0.06, 0.04, 0.06]} m={dark} />
          <Wheel th={th} p={[x * 0.24, 0.04, z * 0.12]} r={0.04} w={0.03} hub="#3A3D44" />
        </group>
      ))}
      {[-1, 1].map((k) => <Limb key={`h${k}`} th={th} a={[k * 0.12, 0.96, -0.12]} b={[k * 0.12, 1.22, -0.12]} r={0.014} m={metal} />)}
      <mesh geometry={rbox(0.3, 0.05, 0.05, 0.02)} material={dark} position={[0, 1.24, -0.12]} castShadow />
      <mesh geometry={rbox(0.18, 0.04, 0.05, 0.015)} material={dark} position={[0.0, 0.98, 0.04]} />
      <LuggageTag th={th} label={label} p={[0.1, 1.22, -0.09]} r={[0, 0, 0.1 * Math.sin(t * 1.2)]} />
    </group>
  );
};

// ------------------------------------------------------------------ the dispatcher
export type PackSpec = { kind: PackKind; color?: string; label?: string; lines?: string[] } & PackParams;
/** a pack prop in its local frame (base on y = 0, front toward +z), in the kit's theme; a pure function of (spec, t, seed) */
export const PackHero: React.FC<{ sp: PackSpec; th: PackTheme; t: number; seed: number }> = ({ sp, th, t, seed }) => {
  const D = PACK_DEFAULT[sp.kind];
  const col = sp.color ?? D.color;
  const label = (sp.label ?? D.label).toUpperCase().trim();
  const screen = String(sp.screen ?? D.screen ?? "").trim();
  const p: PackParams = { holding: sp.holding, spots: sp.spots, screen: sp.screen, variant: sp.variant };
  const a = { th, col, label, t, seed, sp: p };
  const g = { ...a, lines: sp.lines, screen };
  switch (sp.kind) {
    case "monkey": return <Monkey {...a} />;
    case "cow": return <Cow {...a} />;
    case "dog": return <Dog {...a} />;
    case "cat": return <Cat {...a} />;
    case "horse": return <Horse {...a} />;
    case "pig": return <Pig {...a} />;
    case "chicken": return <Chicken {...a} />;
    case "shark": return <Shark {...a} />;
    case "bird": return <Bird {...a} />;
    case "rabbit": return <Rabbit {...a} />;
    case "mp3Player": return <Mp3Player {...g} />;
    case "juicer": return <Juicer {...g} />;
    case "gameConsole": return <GameConsole {...g} />;
    case "vrHeadset": return <VrHeadset {...g} />;
    case "smartwatch": return <Smartwatch {...g} />;
    case "drone": return <Drone {...g} />;
    case "tablet": return <Tablet {...g} />;
    case "flipPhone": return <FlipPhone {...g} />;
    case "digitalCamera": return <DigitalCamera {...g} />;
    case "laptop": return <Laptop {...g} />;
    case "smartSpeaker": return <SmartSpeaker {...g} />;
    case "headphones": return <Headphones {...g} />;
    case "sedan": return <Sedan {...a} />;
    case "pickup": return <Pickup {...a} />;
    case "airplane": return <Airplane {...a} />;
    case "boat": return <Boat {...a} />;
    case "shoppingCart": return <ShoppingCart {...a} />;
    case "cashRegister": return <CashRegister {...g} />;
    case "vendingMachine": return <VendingMachine {...a} />;
    case "pizzaBox": return <PizzaBox {...a} />;
    case "sodaBottle": return <SodaBottle {...a} />;
    case "shoe": return <Shoe {...a} />;
    case "wristwatch": return <Wristwatch {...g} />;
    case "ring": return <Ring {...a} />;
    case "briefcase": return <Briefcase {...a} />;
    case "suitcase": return <Suitcase {...a} />;
  }
  return null;
};
// smooth() is kept for kit code that eases a pack prop in
export { smooth as packEase };

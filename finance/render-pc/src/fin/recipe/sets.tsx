// SET presets: store, home, street, bank, office. Each = our kit's room/ground + CC0 props (src/fin/lib/assets.tsx),
// named anchors for placing actors/props/cameras ("counterTop", "mark", ...), static QA boxes (nothing may clip them),
// the mood, and whether it is outdoors (sky). The lens side is +z everywhere; keep actors around z 0..1.
import React from "react";
import type { V3 } from "../../blocky/motion";
import { B, CT, Store, TOP } from "../hooks";
import { Ground, Hall, Label } from "../props";
import { Asset, assetBox } from "../lib/assets";
import type { Box } from "../v1/kit";
import type { SetId } from "./types";

export type SetDef = {
  render: (t: number) => React.ReactNode;
  anchors: Record<string, V3>;
  blockers: Box[];
  assets: string[];
  mood: "store" | "home" | "earth";
  /** quality pass: background passers-by walking between two floor points */
  extrasPath?: { line: [V3, V3]; n: number };
  /** quality pass: posters on the walls (our own words, no brands) */
  posters?: { p: V3; text: string[]; bg: string; fg?: string; w?: number; h?: number; yaw?: number; tilt?: number }[];
  sky: boolean;
  bg: string;
};
const box = (name: string, c: V3, h: V3): Box => ({ name, c, h });
type Placed = { id: string; p: V3; yaw?: number; s?: number };
const placeAll = (xs: Placed[]) => xs.map((a, i) => <Asset key={`${a.id}${i}`} id={a.id} p={a.p} yaw={a.yaw ?? 0} s={a.s ?? 1} />);
const blockAll = (xs: Placed[]) => xs.map((a) => ({ ...assetBox(a.id, a.p, a.s ?? 1, a.yaw ?? 0), name: `set.${a.id}` }));

// ------------------------------------------------------------------ store: the v1 ELECTRONICS store + CC0 shop dressing
// kept to the walls: the floor between x -4.2 and 4.2, z > -3.4 stays free for a story's own props
const STORE_DRESS: Placed[] = [
  { id: "shelf-bags", p: [4.6, 0, -2.85], s: 0.8 },
  { id: "shelf-boxes", p: [-4.85, 0, -1.2], yaw: Math.PI / 2, s: 0.8 },
  { id: "vending", p: [4.85, 0, 0.6], yaw: -Math.PI / 2 },
  { id: "display-cans", p: [2.3, 0, -2.95] },
];
// ------------------------------------------------------------------ home: a living room
const HOME_DRESS: Placed[] = [
  { id: "sofa", p: [-1.6, 0, -2.6] },
  { id: "tv-stand", p: [2.2, 0, -3.0] },
  { id: "tv", p: [2.2, 0.58, -3.05] },
  { id: "rug", p: [0, 0, -0.8] },
  { id: "coffee-table", p: [-1.6, 0, -1.4] },
  { id: "lamp-floor", p: [-3.2, 0, -2.9] },
  { id: "plant", p: [3.8, 0, -2.8] },
  { id: "fridge", p: [-4.7, 0, -1.0], yaw: Math.PI / 2 },
  { id: "bookcase", p: [4.6, 0, -1.4], yaw: -Math.PI / 2 },
];
// ------------------------------------------------------------------ street: a shop row behind a pavement, a road in front
const STREET_DRESS: Placed[] = [
  { id: "shop-a", p: [-6.5, 0, -9] },
  { id: "shop-d", p: [-1.2, 0, -9] },
  { id: "shop-b", p: [4.2, 0, -9] },
  { id: "house-c", p: [10, 0, -10] },
  { id: "office-tower-b", p: [-14, 0, -22] },
  { id: "office-tower-a", p: [14, 0, -26] },
  { id: "streetlight", p: [-3.2, 0, -2.6] },
  { id: "streetlight", p: [3.6, 0, -2.6] },
  { id: "tree-small", p: [-5.5, 0, -3.0] },
  { id: "tree-small", p: [6.2, 0, -3.0] },
  { id: "parasol", p: [1.6, 0.12, -3.4] },
];
// ------------------------------------------------------------------ bank: a teller counter, a vault chest, coin stacks
const BANK_DRESS: Placed[] = [
  { id: "chest", p: [-3.6, 0, -2.6], s: 1.5 },
  { id: "plant", p: [4.6, 0, -2.9] },
  { id: "plant", p: [-4.8, 0, -2.9] },
  { id: "plinth", p: [3.3, 0, -2.6] },
  { id: "coin-gold", p: [3.3, 0.8, -2.6], s: 1.2 },
  { id: "desk-chair", p: [0.6, 0, -1.6], yaw: Math.PI },
];
// ------------------------------------------------------------------ office: two desks with monitors
const OFFICE_DRESS: Placed[] = [
  { id: "desk", p: [-2.4, 0, -2.4] },
  { id: "monitor", p: [-2.4, 0.78, -2.6] },
  { id: "desk-chair", p: [-2.4, 0, -1.6], yaw: Math.PI },
  { id: "desk", p: [2.4, 0, -2.4] },
  { id: "monitor", p: [2.4, 0.78, -2.6] },
  { id: "laptop", p: [2.0, 0.78, -2.25] },
  { id: "desk-chair", p: [2.4, 0, -1.6], yaw: Math.PI },
  { id: "bookcase", p: [-4.6, 0, -2.9] },
  { id: "plant", p: [0, 0, -3.0] },
  { id: "coat-rack", p: [4.6, 0, -2.9] },
];

const COUNTER: V3 = CT; // the kit counter (hooks.tsx Desk), top at TOP = 0.98 m
const CTR_BOX = box("set.counter", [CT[0], 0.48, CT[2]], [1.06, 0.48, 0.41]);

export const SETS: Record<SetId, SetDef> = {
  store: {
    render: () => (
      <>
        <Store sign="ELECTRONICS" />
        {placeAll(STORE_DRESS)}
      </>
    ),
    anchors: { counter: COUNTER, counterTop: [CT[0], TOP, CT[2]], mark: [1.0, 0, 0.45], left: [-1.4, 0, 0.6], right: [2.75, 0, 0.35], back: [-1.5, 0, -2.35], backLeft: [-4.0, 0, -2.4], backRight: [3.45, 0, -1.45], wall: [1.7, 2.55, -3.44], centre: [0, 0, 0.5] },
    blockers: [CTR_BOX, ...blockAll(STORE_DRESS)],
    extrasPath: { line: [[-0.1, 0, -3.2], [1.3, 0, -3.2]], n: 1 },
    posters: [
      { p: [-2.7, 2.35, -3.46], text: ["BIG", "SALE"], bg: "#d62a2a", w: 0.8, h: 0.7, tilt: 0.04 },
      { p: [-5.46, 2.2, 1.0], text: ["NEW", "TVs"], bg: "#2a6de1", yaw: Math.PI / 2, w: 0.9, h: 0.6 },
      { p: [5.46, 2.3, -1.6], text: ["0% TODAY*"], bg: "#ffd23a", fg: "#16121c", yaw: -Math.PI / 2, w: 1.0, h: 0.45 },
    ],
    assets: STORE_DRESS.map((a) => a.id),
    mood: "store",
    sky: false,
    bg: "#6a5ae8",
  },
  /** the store shell dressed as a clothing shop (same layout, anchors and blockers as "store"; only the sign and posters change) */
  clothes: {
    render: () => (
      <>
        <Store sign="CLOTHING" />
        {placeAll(STORE_DRESS)}
      </>
    ),
    anchors: { counter: COUNTER, counterTop: [CT[0], TOP, CT[2]], mark: [1.0, 0, 0.45], left: [-1.4, 0, 0.6], right: [2.75, 0, 0.35], back: [-1.5, 0, -2.35], backLeft: [-4.0, 0, -2.4], backRight: [3.45, 0, -1.45], wall: [1.7, 2.55, -3.44], centre: [0, 0, 0.5] },
    blockers: [CTR_BOX, ...blockAll(STORE_DRESS)],
    extrasPath: { line: [[-0.1, 0, -3.2], [1.3, 0, -3.2]], n: 1 },
    posters: [
      { p: [-2.7, 2.35, -3.46], text: ["BIG", "SALE"], bg: "#d62a2a", w: 0.8, h: 0.7, tilt: 0.04 },
      { p: [-5.46, 2.2, 1.0], text: ["NEW", "COATS"], bg: "#2a6de1", yaw: Math.PI / 2, w: 0.9, h: 0.6 },
      { p: [5.46, 2.3, -1.6], text: ["JEANS", "& TEES"], bg: "#ffd23a", fg: "#16121c", yaw: -Math.PI / 2, w: 1.0, h: 0.45 },
    ],
    assets: STORE_DRESS.map((a) => a.id),
    mood: "store",
    sky: false,
    bg: "#6a5ae8",
  },
  home: {
    render: () => (
      <>
        <Hall W={11} back={-3.5} front={7} wall="#e88a5a" stripe="#fff4c8" floorA="#f6e2c8" floorB="#e8cfae" />
        {placeAll(HOME_DRESS)}
        <B s={[1.4, 0.9, 0.05]} p={[-1.6, 2.1, -3.45]} c="#fff4c8" />
      </>
    ),
    anchors: { sofa: [-1.6, 0, -2.6], tv: [2.2, 0.58, -3.05], table: [-1.6, 0.38, -1.4], mark: [0.6, 0, 0.3], left: [-1.6, 0, 0.4], right: [2.4, 0, 0.3], back: [0, 0, -2.0], wall: [0, 2.3, -3.44], centre: [0, 0, 0.5] },
    blockers: blockAll(HOME_DRESS.filter((a) => a.id !== "rug")),
    posters: [{ p: [0.4, 2.2, -3.46], text: ["HOME"], bg: "#2fd0bd", w: 0.8, h: 0.5, tilt: -0.03 }, { p: [-5.46, 2.0, -0.5], text: ["BILLS", "DUE"], bg: "#fff4c8", fg: "#d62a2a", yaw: Math.PI / 2, w: 0.7, h: 0.6 }],
    assets: HOME_DRESS.map((a) => a.id),
    mood: "home",
    sky: false,
    bg: "#e88a5a",
  },
  street: {
    render: () => (
      <>
        <Ground grass="#7bd06a" />
        <B s={[40, 0.12, 5]} p={[0, 0.06, -4.5]} c="#e8e4f0" rough={0.8} />
        <B s={[40, 0.02, 7]} p={[0, 0.01, 4.2]} c="#5a5a6e" rough={0.85} />
        {Array.from({ length: 16 }, (_, i) => <B key={i} s={[1.2, 0.025, 0.14]} p={[-18 + i * 2.4, 0.02, 4.2]} c="#fff4c8" />)}
        {placeAll(STREET_DRESS)}
      </>
    ),
    anchors: { kerb: [0, 0.12, -2.2], mark: [0.6, 0, 0.3], left: [-1.6, 0, 0.4], right: [2.4, 0, 0.3], road: [0, 0, 4.2], shop: [-1.2, 0, -6.5], centre: [0, 0, 0.5] },
    blockers: blockAll(STREET_DRESS),
    extrasPath: { line: [[-4.6, 0, -1.4], [5.2, 0, -1.4]], n: 2 }, // walkers k are offset 0.7 m apart in depth
    assets: STREET_DRESS.map((a) => a.id),
    mood: "earth",
    sky: true,
    bg: "#8fd0ff",
  },
  bank: {
    render: () => (
      <>
        <Hall W={11} back={-3.5} front={7} wall="#2f8a6a" stripe="#ffd23a" floorA="#f2efe6" floorB="#ddd6c4">
          <Label p={[0, 2.75, -3.42]} text={["BANK"]} w={1.8} h={0.5} bg="#16121c" fg="#ffd23a" glow={0.9} />
        </Hall>
        <B s={[2.6, 0.98, 0.8]} p={[0, 0.49, -0.9]} c="#c8a46a" />
        <B s={[2.7, 0.06, 0.9]} p={[0, 1.01, -0.9]} c="#efe6d0" />
        <B s={[2.6, 0.7, 0.04]} p={[0, 1.4, -1.1]} c="#bfe4ff" />
        {placeAll(BANK_DRESS)}
      </>
    ),
    anchors: { counter: [0, 0, -0.9], counterTop: [0, 1.04, -0.9], vault: [-3.6, 0, -2.6], mark: [1.0, 0, 0.45], left: [-1.4, 0, 0.6], right: [2.75, 0, 0.35], teller: [0.6, 0, -1.6], back: [0, 0, -2.4], wall: [0, 2.4, -3.44], centre: [0, 0, 0.5] },
    blockers: [box("set.bankCounter", [0, 0.52, -0.9], [1.35, 0.52, 0.45]), ...blockAll(BANK_DRESS)],
    extrasPath: { line: [[-2.2, 0, -2.85], [2.2, 0, -2.85]], n: 1 },
    posters: [{ p: [-2.4, 2.3, -3.46], text: ["SAVE", "MORE"], bg: "#1f9e4f", w: 0.8, h: 0.6 }, { p: [2.4, 2.3, -3.46], text: ["LOANS"], bg: "#16121c", fg: "#ffd23a", w: 0.8, h: 0.45 }],
    assets: BANK_DRESS.map((a) => a.id),
    mood: "store",
    sky: false,
    bg: "#2f8a6a",
  },
  office: {
    render: () => (
      <>
        <Hall W={11} back={-3.5} front={7} wall="#5a8ae8" stripe="#ffffff" floorA="#eef2f8" floorB="#d6deea" />
        {placeAll(OFFICE_DRESS)}
      </>
    ),
    anchors: { deskL: [-2.4, 0.78, -2.4], deskR: [2.4, 0.78, -2.4], mark: [0.4, 0, 0.3], left: [-1.6, 0, 0.4], right: [2.4, 0, 0.3], back: [0, 0, -2.0], wall: [0, 2.3, -3.44], centre: [0, 0, 0.5] },
    blockers: blockAll(OFFICE_DRESS),
    posters: [{ p: [-1.2, 2.3, -3.46], text: ["Q3", "GOALS"], bg: "#ffffff", fg: "#2a6de1", w: 0.8, h: 0.6 }, { p: [1.3, 2.3, -3.46], text: ["PAYDAY", "FRIDAY"], bg: "#ffd23a", fg: "#16121c", w: 0.9, h: 0.55 }],
    assets: OFFICE_DRESS.map((a) => a.id),
    mood: "home",
    sky: false,
    bg: "#5a8ae8",
  },
};
export const SET_IDS = Object.keys(SETS) as SetId[];

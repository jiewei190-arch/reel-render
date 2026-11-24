// LawGallery: one shot per kit piece (every pose, every face, every role, every set, every prop, every story device),
// compiled by the same compiler as a real recipe. GALLERY_STILLS lists the frame to grab for each piece
// (node tools/law_stills.mjs gallery renders them all).
import { FIG_FACES, FIG_POSES } from "./cast";
import type { CastSpec, FigFace, FigPose } from "./cast";
import type { LawKit } from "./objects";
import { LAW_HERO_BOX, LAW_HERO_KINDS, STATUE_SPECIES } from "./hero";
import type { LawHeroKind } from "./hero";
import type { LawProp, LawRecipe, LawShot } from "./types";

const shots: LawShot[] = [];
export const GALLERY_STILLS: { name: string; frame: number }[] = [];
let t = 0;
const add = (name: string, len: number, sh: Omit<LawShot, "at">, still = 0.8) => {
  shots.push({ at: t, caption: "off", in: "cut", ...sh });
  GALLERY_STILLS.push({ name, frame: Math.round((t + len * still) * 30) });
  t += len;
};
const cast: Record<string, CastSpec> = {
  judge: { role: "judge", skin: "#c98f6a", hairStyle: "bun", hair: "#5a4a40", glasses: true, plate: "THE COURT" },
  plaintiff: { role: "plaintiff", skin: "#7a5038", hairStyle: "bald", hair: "#1a1410", suit: "#3a4a6e", tie: "#8a2a2a", plate: "PLAINTIFF" },
  defendant: { role: "defendant", skin: "#e0b48e", hairStyle: "short", hair: "#141414", suit: "#6e6a62", apron: "#2b4f7a", plate: "DEFENDANT" },
  lawyer: { role: "lawyer", skin: "#f0c8a8", hairStyle: "long", hair: "#7a4a24", suit: "#22242c", tie: "#B9862A" },
  witness: { role: "witness", skin: "#b07850", hairStyle: "curly", hair: "#2a1a10", beard: true },
  bailiff: { role: "bailiff", skin: "#d8a888", hairStyle: "short", build: "broad" },
  juror: { role: "juror" },
  trooper: { role: "trooper", skin: "#c99873", hair: "#3a2a1e", build: "broad" },
};
for (const p of FIG_POSES as FigPose[]) {
  const who = p === "gavel" ? "judge" : "plaintiff";
  add(`pose-${p}`, 1.6, { set: "evidence", cam: { preset: "medium", target: who, dist: 2.9, h: 0.15, face: 0.4 }, actors: [{ id: who, pose: p, at: "front", pointAt: [1.4, 1.6, 2.5] }], actions: p === "gavel" ? [{ do: "gavel", at: t + 0.9 }] : [] }, p === "gavel" ? 0.5 : 0.75);
}
for (const f of FIG_FACES as FigFace[]) add(`face-${f}`, 1.0, { set: "evidence", cam: { preset: "closeUp", target: "defendant.face", dist: 0.9 }, actors: [{ id: "defendant", pose: "idle", face: f, at: "front" }] }, 0.7);
const roles = Object.keys(cast);
add("cast-lineup", 2.0, { set: "courtroom", cam: { preset: "medium", target: [0, 1.2, 2.6], dist: 4.4, h: 0.1, face: 0.45 }, actors: roles.map((r, k) => ({ id: r, pose: "idle" as FigPose, at: [-2.4 + k * 0.8, 0, 2.6] as [number, number, number], look: 0 })) }, 0.6);
add("set-courtroom-wide", 2.0, { set: "courtroom", cam: { preset: "wide", target: [0, 1.4, -2.2], dist: 8.8, h: 1.2 }, actors: [{ id: "judge", pose: "idle", at: "bench", sit: true, look: 0 }, { id: "plaintiff", pose: "idle", at: "plaintiff", look: 180 }, { id: "defendant", pose: "idle", at: "defendant", look: 180 }] }, 0.6);
add("set-courtroom-bench", 2.0, { set: "courtroom", cam: { preset: "pushIn", target: "judge.face", dist: 2.6, h: -0.2 }, actors: [{ id: "judge", pose: "gavel", at: "bench", sit: true, look: 0 }], actions: [{ do: "gavel", at: t + 1.2 }], props: [{ id: "np", kit: "nameplate", of: "judge", at: "benchTop:-0.5,0,0.2" }] }, 0.45);
add("set-courtroom-witness", 2.0, { set: "courtroom", cam: { preset: "orbit", target: "witness.face", dist: 2.2, h: 0.1, az: -20 }, actors: [{ id: "witness", pose: "talk", at: "witness", sit: true, look: 0 }] }, 0.6);
add("set-evidence", 2.0, { set: "evidence", cam: { preset: "crane", target: "table", dist: 3.0, h: 0.8 }, props: [{ id: "ev", kit: "pants", at: "table", yaw: 20 }] }, 0.6);
add("set-casefile", 2.0, { set: "casefile", cam: { preset: "topDown", target: "desk", dist: 0.6, h: 1.7 }, props: [{ id: "f", kit: "folder", text: "PEARSON v. CHUNG", at: "desk", yaw: -8 }] }, 0.6);
add("set-headlines", 2.0, { set: "headlines", cam: { preset: "dolly", target: "wall", dist: 2.8, h: 0.0 }, props: [{ id: "n", kit: "newspaper", text: "JUDGE SUES OVER PANTS", at: "wall:0,-0.38,0" }] }, 0.6);
add("set-roadside", 2.0, { set: "roadside", cam: { preset: "crane", target: "centre:-0.6,0.9,0", dist: 9, h: 1.3, az: -34, sweep: 0.8 }, actors: [{ id: "trooper", pose: "search", at: "trooper", look: "trunk" }, { id: "defendant", pose: "idle", face: "worried", at: "driver", look: "trunk" }], props: [{ id: "car", kit: "car", at: "car", scale: 2.6, yaw: 180, color: "#7a8494", label: "" }, { id: "cooler", kit: "cooler", at: "trunk", scale: 0.8, yaw: 0, open: t + 0.6 }, { id: "dog", kit: "dog", at: "dog", scale: 1, yaw: 180, alert: t + 0.9 }] }, 0.8);
add("set-roadside-drive", 2.0, { set: "roadside", patrol: false, drive: 24, cam: { preset: "dolly", target: "car:0,0.8,0", dist: 6.5, h: 1.2, az: -20, sweep: 0.8 }, props: [{ id: "car", kit: "car", at: "car", scale: 2.6, yaw: 180, color: "#7a8494", label: "" }, { id: "pc", kit: "car", at: "car:6.5,0,0", scale: 2.6, yaw: 180, color: "#1b2334", label: "", lightbar: true }] }, 0.6);
add("set-steps", 2.0, { set: "steps", cam: { preset: "wide", target: [0, 2.2, 3], dist: 9, h: 0.6 }, actors: [{ id: "lawyer", pose: "talk", at: "steps", look: 0 }] }, 0.6);
for (const k of ["gavel", "paper", "folder", "photo", "pants", "sign", "money", "newspaper", "nameplate", "box"] as LawKit[]) {
  const stand = k === "sign" || k === "newspaper";
  add(`kit-${k}`, 1.4, { set: "evidence", cam: { preset: "orbit", target: k === "pants" ? "table" : k, dist: stand ? 2.4 : k === "pants" ? 2.0 : 1.2, h: stand ? 0.1 : 0.7, sweep: 30 }, props: [{ id: k, kit: k, at: "table", text: k === "sign" ? "SATISFACTION\nGUARANTEED" : undefined, photo: "pants" }], actions: k === "gavel" ? [{ do: "gavel", at: t + 0.9 }] : [] }, k === "gavel" ? 0.55 : 0.7);
}
add("device-casecard", 1.8, { set: "casefile", cam: { preset: "topDown", target: "desk" }, actions: [{ do: "caseCard", at: t + 0.1, title: "PEARSON v. CHUNG", year: "2005-2007", place: "Washington, D.C." }] }, 0.8);
add("device-exhibit", 1.8, { set: "evidence", cam: { preset: "pushIn", target: "table", dist: 2.4, h: 0.8 }, props: [{ id: "pants", kit: "pants", at: "table", motion: "dropIn", hit: t + 0.4 }], actions: [{ do: "exhibit", at: t + 0.5, text: "THE PANTS", on: "pants" }] }, 0.8);
add("device-verdict", 1.8, { set: "courtroom", cam: { preset: "slamZoom", target: "gavel", dist: 1.4, h: 0.3, hit: t + 0.3 }, props: [{ id: "gavel", kit: "gavel", at: "gavel" }], actions: [{ do: "gavel", at: t + 0.5 }, { do: "verdict", at: t + 0.5, text: "DENIED", sub: "$0 AWARDED" }] }, 0.8);
add("device-counter", 1.8, { set: "headlines", cam: { preset: "dolly", target: "wall", dist: 3.0 }, actions: [{ do: "counter", at: t + 0.1, title: "DAMAGES SOUGHT", prefix: "$", from: 0, to: 54000000, dur: 1.2, pos: "center" }] }, 0.9);

// the HERO PROPS (src/law/hero.tsx): one close-up each on the evidence table, turning slowly, then the kind params
// (every statue species, the hairy palm, the bandaged palm, the house for sale, the ball, the fries)
type HeroG = { name: string; p: Partial<LawProp>; dist?: number; h?: number; az?: number; act?: "open" | "alert" };
const HEROES: HeroG[] = [
  ...LAW_HERO_KINDS.map((k): HeroG => ({ name: k, p: { kit: k, ...(k === "contract" ? { label: "Sale contract", lines: ["The seller agrees to sell", "one gold rooster statue", "for the sum of $12,000.", "Payment on delivery.", "No refunds."] } : {}), ...(k === "phone" ? { lines: ["Where is my statue?", "It was never yours.", "See you in court."] } : {}), ...(k === "evidenceBag" ? { label: "ITEM 7", lines: ["CASE NO. 05-118", "ONE GOLD ROOSTER", "SEALED 03/14"] } : {}), ...(k === "frame" ? { label: "THE BUYER", photo: "person" } : {}) }, dist: k === "car" ? 3.4 : k === "statue" ? 2.3 : k === "trousers" ? 2.4 : k === "bigGavel" || k === "cash" || k === "house" ? 2.0 : 1.8, h: k === "car" || k === "house" || k === "cash" || k === "bigGavel" || k === "food" ? 0.55 : 0.12, az: k === "car" ? 30 : 8 })),
  ...STATUE_SPECIES.filter((sp) => sp !== "rooster").map((sp): HeroG => ({ name: `statue-${sp}`, p: { kit: "statue", species: sp }, dist: 2.3, h: 0.2 })),
  { name: "hand-hair", p: { kit: "hand", hair: true, label: "GRAFT" } },
  { name: "hand-bandage", p: { kit: "hand", bandage: true } },
  { name: "house-sale", p: { kit: "house", sale: true }, dist: 2.0, h: 0.5 },
  { name: "toy-ball", p: { kit: "toy", variant: "ball" } },
  { name: "food-fries", p: { kit: "food", variant: "fries" }, h: 0.45 },
  // the acting props, caught mid-action: the cooler lid up, the foil peeled back, the dog alerting, the truck's door open
  { name: "cooler-open", p: { kit: "cooler" }, act: "open", h: 0.7, dist: 2.0 },
  { name: "foil-open", p: { kit: "foil" }, act: "open", h: 0.6, dist: 1.4 },
  { name: "dog-alert", p: { kit: "dog" }, act: "alert", h: 0.25, dist: 2.2, az: 60 },
  { name: "truck-open", p: { kit: "truck" }, act: "open", h: 0.5, dist: 3.6, az: -140 },
  { name: "car-patrol", p: { kit: "car", color: "#1b2334", label: "", lightbar: true }, h: 0.55, dist: 3.4, az: 30 },
];
for (const g of HEROES) {
  const bx = LAW_HERO_BOX[g.p.kit as LawHeroKind];
  const k = g.p.kit as LawHeroKind;
  const d0 = k === "truck" ? 3.6 : k === "dog" ? 2.2 : k === "cooler" ? 2.0 : k === "foil" ? 1.4 : undefined, h0 = k === "truck" || k === "cooler" || k === "foil" ? 0.5 : k === "dog" ? 0.25 : undefined, az0 = k === "truck" ? 40 : k === "dog" ? 60 : undefined;
  add(`hero-${g.name}`, 1.2, { set: "evidence", cam: { preset: "closeUp", target: "hp", dist: g.dist ?? d0 ?? 1.8, h: g.h ?? h0 ?? 0.12, az: g.az ?? az0 ?? 8, face: 0.5 }, props: [{ id: "hp", kit: k as LawKit, at: "table", spin: 6, ...g.p, ...(bx.h[0] > 0.6 ? { scale: bx.h[0] > 1 ? 0.6 : 0.9 } : {}), ...(g.act ? { [g.act]: t + 0.15 } : {}) }] }, 0.6);
}

export const GALLERY_RECIPE: LawRecipe = { kit: "law3d", slug: "law-gallery", hook: { text: "LAW *GALLERY*", until: -1 }, cast, shots, duration: t, captions: "off" };

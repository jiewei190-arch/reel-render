// BizGallery: one shot per kit piece (every executive pose, every set, the chart flythrough, stores going dark, the
// crack and collapse, every story device, the props), compiled by the same compiler as a real recipe.
// GALLERY_STILLS lists the frame to grab for each piece (node tools/biz_stills.mjs gallery renders them all).
import type { ExecPose } from "./exec";
import { EXEC_POSES } from "./exec";
import { BIZ_HERO_KINDS } from "./hero";
import type { BizRecipe, BizShot } from "./types";

const shots: BizShot[] = [];
export const GALLERY_STILLS: { name: string; frame: number }[] = [];
let t = 0;
const add = (name: string, len: number, sh: Omit<BizShot, "at">, still = 0.75) => {
  shots.push({ at: t, caption: "off", in: "cut", ...sh });
  GALLERY_STILLS.push({ name, frame: Math.round((t + len * still) * 30) });
  t += len;
};
for (const p of EXEC_POSES as ExecPose[]) {
  add(`exec-pose-${p}`, 1.4, { set: "boardroom", cam: { preset: "medium", target: "ceo", dist: 3.6, h: 0.1, az: 20 }, actors: [{ id: "ceo", pose: p, at: "standL" }] }, p === "slam" ? 0.3 : 0.7);
}
add("exec-seated-boardroom", 2.0, { set: "boardroom", cam: { preset: "orbit", target: "tableTop", dist: 6.5, h: 2.4, az: 30, sweep: 30 }, actors: [
  { id: "ceo", pose: "fold", at: "head", seated: true }, { id: "a", pose: "talk", at: "seatL1", seated: true }, { id: "b", pose: "laugh", at: "seatR1", seated: true }, { id: "c", pose: "idle", at: "seatR2", seated: true },
] });
add("set-city", 2.0, { set: "city", cam: { preset: "dolly", target: "stores:0,0.8,0", dist: 9, h: 2.2, sweep: 3 } });
add("city-stores-dark", 2.4, { set: "city", cam: { preset: "pushIn", target: "stores:0,0.9,0", dist: 9.5, h: 2.6 }, actions: [{ do: "dark", on: "stores", at: 0.1 + t, stagger: 0.12, keep: [4] }] }, 0.85);
add("city-crack", 2.6, { set: "city", cam: { preset: "medium", target: "hq:0,4.5,0", dist: 15, h: 1.0 }, props: [{ id: "hq", kit: "tower", at: "hq" }], actions: [{ do: "crack", on: "hq", at: t + 0.2, dur: 1.0 }] }, 0.6);
add("city-collapse", 2.6, { set: "city", cam: { preset: "medium", target: "hq:0,4.5,0", dist: 15, h: 1.0 }, props: [{ id: "hq", kit: "tower", at: "hq" }], actions: [{ do: "crack", on: "hq", at: t + 0.1, dur: 0.6, collapse: t + 0.9 }], fx: [{ fx: "debris", at: t + 0.9, p: "hq:0,4,1.4" }] }, 0.75);
add("set-chart-fly-rise", 2.4, { set: "chart", cam: { preset: "chartFly", from: 0, to: 4 } }, 0.7);
add("set-chart-fly-crash", 2.4, { set: "chart", cam: { preset: "chartFly", from: 4, to: 8 } }, 0.6);
add("set-chart-wide", 1.6, { set: "chart", cam: { preset: "wide", target: "chart", dist: 26, h: 4 } });
add("set-warehouse", 2.0, { set: "warehouse", cam: { preset: "dolly", target: "conveyor", dist: 6, h: 1.4, az: 25 } });
add("set-headlines", 2.6, { set: "headlines", headline: "Giant Retailer Files for Bankruptcy", cam: { preset: "pushIn", target: "hero", dist: 3.6, h: 0.1 }, actions: [{ do: "slam", on: "papers", at: t + 0.1 }] }, 0.9);
add("device-company", 1.6, { set: "boardroom", cam: { preset: "medium", target: "ceo", dist: 3.4 }, actors: [{ id: "ceo", pose: "talk", at: "foot" }], devices: [{ do: "company", name: "ACME VIDEO", year: 1985, icon: "film", tone: "red", at: t }] });
add("device-decision", 1.8, { set: "boardroom", cam: { preset: "pushIn", target: "ceo.head", dist: 2.6 }, actors: [{ id: "ceo", pose: "fold", at: "foot" }], devices: [{ do: "decision", at: t + 0.2, sub: "BUY IT FOR $50M?" }] }, 0.6);
add("device-counter", 2.2, { set: "warehouse", cam: { preset: "orbit", target: "cash", dist: 2.6, h: 0.6 }, props: [{ id: "cash", kit: "cash", at: "aisle" }], actions: [{ do: "drain", on: "cash", at: t + 0.2, dur: 1.6 }], devices: [{ do: "counter", title: "CASH LEFT", from: 1.2e9, to: 4e7, at: t + 0.1, dur: 1.6 }] }, 0.8);
add("device-worth", 2.4, { set: "chart", cam: { preset: "orbit", target: "peak", dist: 14, h: 2 }, devices: [{ do: "worth", at: t + 0.1, a: { label: "The price", value: 5e7 }, b: { label: "Worth today", value: 2.5e11, text: "$250B+" } }] }, 0.85);
add("device-stamp-board", 1.8, { set: "headlines", headline: "Shares Plunge", cam: { preset: "medium", target: "hero", dist: 4.2 }, devices: [{ do: "stamp", text: "BANKRUPT", at: t + 0.2 }, { do: "board", title: "STORES", count: { from: 9000, to: 300 }, at: t + 0.1, pos: "left", tone: "red" }] });
add("props", 2.0, { set: "warehouse", cam: { preset: "orbit", target: "aisle:0,0.4,0", dist: 3.6, h: 0.9 }, props: [{ id: "bx", kit: "boxes", at: "aisle:-1.1,0,0", size: [2, 2, 2] }, { id: "dv", kit: "disc", at: "aisle:0,0,0.3", motion: "bob" }, { id: "en", kit: "envelope", at: "aisle:0.9,0,0.4", yaw: 20 }, { id: "c2", kit: "cash", at: "aisle:0.6,0,-0.6" }] });

// the HERO PROPS (src/biz/hero.tsx): one close-up each, in their default colour and label, turning slowly
for (const k of BIZ_HERO_KINDS) {
  const wide = k === "laptop" || k === "shoe" || k === "camera" || k === "card" || k === "burger";
  add(`hero-${k}`, 1.2, { set: "warehouse", cam: { preset: "closeUp", target: "hp", dist: wide ? 2.2 : 1.6, h: k === "laptop" || k === "burger" || k === "shoe" ? 0.5 : 0.12, az: k === "shoe" ? 20 : 8, face: 0.5 }, props: [{ id: "hp", kit: k, at: "aisle", spin: 6, ...(k === "letter" ? { label: "Offer declined", lines: ["Dear Founders,", "Thank you for your visit.", "We are not interested", "in a purchase at $50M.", "Regards, the Board"] } : {}) }] }, 0.6);
}
add("hero-labels", 2.0, { set: "boardroom", cam: { preset: "medium", target: "tableTop:0,0.25,1.2", dist: 2.8, h: 0.4, az: 0, face: 0.5 }, props: [
  { id: "c1", kit: "can", label: "NEW", color: "#C8102E", at: "tableTop:-0.55,0,1.2", scale: 0.6 }, { id: "c2", kit: "can", label: "CLASSIC", color: "#7A1A1A", at: "tableTop:0,0,1.2", scale: 0.6 }, { id: "c3", kit: "cup", label: "", at: "tableTop:0.55,0,1.2", scale: 0.6 },
] }, 0.6);

export const GALLERY_RECIPE: BizRecipe = {
  kit: "biz3d", slug: "biz-gallery", hook: { text: "THE *GALLERY*", until: -1 }, duration: t, captions: "off",
  cast: { ceo: "charcoal", a: "navy", b: "burgundy", c: { suit: "#3F5B3A", tie: "#22C55E", skin: "#8D5A3B", hair: "#111", hairStyle: "bald" } },
  chart: { pts: [2, 3, 4.5, 6.5, 9, 8.6, 6, 3, 0.6], tags: [{ i: 0, text: "1985" }, { i: 4, text: "2004" }, { i: 8, text: "2010" }] },
  shots,
};

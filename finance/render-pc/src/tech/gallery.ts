// TechGallery: one shot per kit piece (BOLT poses, BOLT faces, each object whole / exploded / sliced / labelled, each
// set), compiled by the same compiler as a real recipe. GALLERY_STILLS lists the frame to grab for each piece
// (tools/tech_stills.sh renders them all).
import type { BoltFace, BoltPose } from "./bolt";
import { BOLT_FACES, BOLT_POSES } from "./bolt";
import type { TechRecipe, TechShot } from "./types";

const shots: TechShot[] = [];
export const GALLERY_STILLS: { name: string; frame: number }[] = [];
let t = 0;
const add = (name: string, len: number, sh: Omit<TechShot, "at">, still = 0.8) => {
  shots.push({ at: t, caption: "off", in: "cut", ...sh });
  GALLERY_STILLS.push({ name, frame: Math.round((t + len * still) * 30) });
  t += len;
};
for (const p of BOLT_POSES as BoltPose[]) {
  add(`bolt-pose-${p}`, 1.6, { set: "studio", cam: { preset: "medium", target: "bolt", dist: 2.5, h: 0.25, face: 0.5, az: p === "peek" ? 20 : 0 }, actors: [{ id: "bolt", pose: p, at: "centre", pointAt: [1.6, 1.9, 1.2] }], props: p === "peek" ? [{ id: "crate", kit: "block", at: [-0.62, 0, -0.1], size: [0.7, 0.9, 0.7], color: "#BCD6FA" }] : [] }, p === "celebrate" ? 0.55 : 0.75);
}
for (const f of BOLT_FACES as BoltFace[]) {
  add(`bolt-face-${f}`, 1.2, { set: "studio", cam: { preset: "closeUp", target: "bolt.face", dist: 1.25, face: 0.45 }, actors: [{ id: "bolt", pose: "idle", face: f, at: "centre" }] }, 0.7);
}
const objShots = (name: string, obj: string, yaw: number, dist: number, h: number, az: number, labels: string[], y = 0) => {
  const at: [number, number, number] = [0, y, 0];
  add(`${name}-whole`, 2.0, { set: "studio", cam: { preset: "orbit", target: `${name}A`, dist, h, az, sweep: 30 }, props: [{ id: `${name}A`, obj, at, yaw }] }, 0.5);
  add(`${name}-exploded`, 2.4, { set: "studio", cam: { preset: "explodeOrbit", target: `${name}B`, dist, h: h * 1.2, az, sweep: 30 }, props: [{ id: `${name}B`, obj, at, yaw }], actions: [{ do: "explode", on: `${name}B`, at: t + 0.15, dur: 0.9 }] }, 0.9);
  add(`${name}-sliced`, 2.4, { set: "studio", cam: { preset: "medium", target: `${name}C`, dist: dist * 0.95, h, az }, props: [{ id: `${name}C`, obj, at, yaw }], actions: [{ do: "slice", on: `${name}C`, at: t + 0.15, dur: 0.9 }] }, 0.9);
  add(`${name}-labelled`, 2.8, {
    set: "studio", cam: { preset: "medium", target: `${name}D`, dist: dist * 1.05, h, az }, props: [{ id: `${name}D`, obj, at, yaw }],
    actions: [{ do: "explode", on: `${name}D`, at: t + 0.05, dur: 0.6, amount: 0.75 }, ...labels.map((p, k) => ({ do: "label" as const, on: `${name}D.${p}`, at: t + 0.7 + k * 0.5 })), { do: "highlight", on: `${name}D.${labels[0]}`, at: t + 0.7 }],
  }, 0.92);
};
objShots("plane", "airplane", 0, 11.5, 3.2, 58, ["ilsAntenna", "autopilot", "engineR"]);
objShots("phone", "smartphone", -28, 4.2, 0.5, 22, ["battery", "board", "camera"], 0.15);
objShots("ship", "ship", 0, 9.5, 2.8, 50, ["ballastL", "engine", "propeller"]);
add("set-studio", 2.0, { set: "studio", cam: { preset: "wide", target: "centre:0,1,0", dist: 7.5, h: 1.8 }, actors: [{ id: "bolt", pose: "idle", at: "centre" }] });
add("set-blueprint", 2.0, { set: "blueprint", cam: { preset: "wide", target: "centre:0,1,0", dist: 7.5, h: 2.2 }, actors: [{ id: "bolt", pose: "explain", at: "centre" }] });
add("set-sky", 2.4, {
  set: "sky", cam: { preset: "wide", target: [0, 2.2, 8], dist: 16, h: 4.5, az: 28 },
  props: [{ id: "jet", obj: "airplane", at: "final", s: 0.9, motion: "path", path: [[0, "final"], [6, "touchdown"]] }],
  actors: [{ id: "bolt", pose: "point", at: [2.6, 0, 6], pointAt: "jet" }],
}, 0.5);

export const GALLERY_RECIPE: TechRecipe = { kit: "tech3d", slug: "tech-gallery", hook: { text: "TECH *GALLERY*", until: -1 }, cast: { bolt: "BOLT" }, shots, duration: t, captions: "off", talk: "none" };

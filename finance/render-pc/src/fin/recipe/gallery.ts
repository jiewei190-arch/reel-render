// A generated recipe with one 1-second shot per preset (poses, cameras, prop motions, fx, sets): the RECIPE_GUIDE
// thumbnails come from it (bash tools/preset_sheet.sh). It also smoke-tests every preset through the compiler.
import { POSE_IDS } from "./poses";
import { SET_IDS } from "./sets";
import type { CamId, MotionId, PropSpec, Recipe, ShotSpec } from "./types";

const CAMS: CamId[] = ["hookZoom", "slamZoom", "whip", "pushIn", "orbit", "closeUp", "medium", "wide", "splitScreen", "povFirstPerson"];
const MOTIONS: MotionId[] = ["dropSlam", "fly-in", "stick-to-face", "rain", "burst", "count-up"];
const FX = ["shake", "flash", "dust", "debris"] as const;
export type GalleryItem = { group: string; name: string; frame: number };
const shots: ShotSpec[] = [];
export const GALLERY_ITEMS: GalleryItem[] = [];
const add = (group: string, name: string, s: Omit<ShotSpec, "at">, look = 0.6) => {
  const a = shots.length;
  shots.push({ at: a, caption: "off", ...s } as ShotSpec);
  GALLERY_ITEMS.push({ group, name, frame: Math.round((a + look) * 30) });
};
for (const p of POSE_IDS) {
  const walk = p === "walk" || p === "run";
  add("pose", p, { set: "store", cam: { preset: "medium", target: "spender", dist: 3.0, az: 20 }, actors: [{ id: "spender", pose: p, at: walk ? "left" : "mark", to: walk ? "right" : undefined, from: shots.length + 0.1 }] }, walk ? 0.45 : 0.7);
}
for (const c of CAMS) {
  const s: Omit<ShotSpec, "at"> = { set: "store", cam: { preset: c, target: c === "povFirstPerson" ? "tv" : "spender.face", hit: shots.length + 0.15 }, actors: [{ id: "spender", pose: "shock", at: "mark", from: shots.length + 0.1 }], props: [{ id: "tv", kit: "tv", at: "counterTop:-0.05,0,-0.05", yaw: 14 }] };
  if (c === "splitScreen") { s.actors!.push({ id: "saver", pose: "celebrate", at: "right" }); s.cam.targets = ["saver", "spender"]; }
  if (c === "povFirstPerson") { s.cam.targets = ["spender", "tv"]; s.actors = [{ id: "spender", pose: "reach", at: [0.4, 1.2], face: [0, 0, -0.6] }]; }
  add("camera", c, s, c === "whip" ? 0.1 : 0.6);
}
for (const m of MOTIONS) {
  const t0 = shots.length;
  const p: PropSpec = { id: "thing", motion: m, hit: t0 + 0.5, at: "counterTop:-0.1,0,0" };
  if (m === "dropSlam" || m === "fly-in" || m === "burst") Object.assign(p, { kit: "debtBlock", size: [0.8, 0.8, 0.5], text: ["OWE", "$5,000"] });
  if (m === "stick-to-face") Object.assign(p, { kit: "label", text: ["BILL", "$142"], size: [0.36, 0.26, 0.04], on: "spender", at: "mark", hit: t0 + 0.4 });
  if (m === "rain") Object.assign(p, { kit: "coin", at: "counterTop:0,0,0.2", n: 14, area: [1.6, 0.4] });
  if (m === "count-up") Object.assign(p, { kit: "calendar", text: ["YEAR"], at: "counterTop:-0.1,0.6,0", count: { from: 1, to: 19, dur: 0.6 }, hit: t0 + 0.2 });
  const actors = m === "stick-to-face" ? [{ id: "spender", pose: "shock" as const, at: "mark", from: t0 + 0.4 }] : [{ id: "spender", pose: "shock" as const, at: "right", from: t0 + 0.5 }];
  add("motion", m, { set: "store", cam: { preset: "medium", target: m === "stick-to-face" ? "spender.face" : "counterTop:0.4,0.3,0.3", dist: m === "stick-to-face" ? 1.6 : 3.2 }, actors, props: [p] }, m === "burst" ? 0.75 : m === "dropSlam" ? 0.42 : 0.7);
}
for (const f of FX) {
  const t0 = shots.length;
  add("fx", f, { set: "store", cam: { preset: "medium", target: "counterTop:0.4,0.2,0.3", dist: 3.0 }, actors: [{ id: "spender", pose: "shock", at: "right" }], fx: [{ fx: f, at: t0 + 0.5, p: "counterTop:0,0.05,0.3" }] }, f === "flash" ? 0.53 : 0.72);
}
// easter eggs (recipe.eggs; default spots per set): a close look at each in the store
const EGG_LOOK: [string, [number, number, number], number][] = [["cat", [4.6, 1.62, -2.85], 1.3], ["tv19", [-4.85, 1.7, -1.2], 1.4], ["sticky", [4.23, 1.35, 0.6], 0.9], ["mug", [2.15, 1.16, -2.85], 0.8]];
for (const [name, p, d] of EGG_LOOK) add("egg", name, { set: "store", cam: { preset: "closeUp", target: p, dist: d, az: name === "tv19" ? 70 : name === "sticky" ? -70 : 0, fov: 40 } }, 0.6);
for (const s of SET_IDS) add("set", s, { set: s, cam: { preset: "wide", target: "spender", dist: 6.5, h: 1.3, fov: 56 }, actors: [{ id: "spender", pose: "idle", at: "mark" }] });

export const GALLERY_RECIPE: Recipe = { slug: "preset-gallery", style: "S1", hook: { text: "", until: -1 }, duration: shots.length, cast: { spender: "SPENDER", saver: "SAVER" }, captions: "off", shots, eggs: ["cat", "tv19", "sticky", "mug"] };

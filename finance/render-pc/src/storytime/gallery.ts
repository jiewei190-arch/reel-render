// StoryGallery: one second per expression for each lead (close-ups, classroom), then each set's wide and the two-shot,
// for the review stills (node tools/storytime_stills.mjs gallery). Captions off; no voice.
import type { Recipe, Shot, Word } from "./types";
import { EXPRS } from "./types";

const cast: Recipe["cast"] = {
  me: { name: "me", skin: "#9a6240", hair: "#1b1410", hairStyle: "flattop", top: "#f2b632", topStyle: "hoodie", trim: "#ffffff", pants: "#2f3a56", shoes: "#f5f5f5", brow: "#1b1410" },
  homie: { name: "homie", skin: "#f4cfa6", hair: "#c4541c", hairStyle: "curls", top: "#7b4fd6", topStyle: "tee", trim: "#ffffff", pants: "#6b7a3a", shoes: "#22223b", brow: "#8a3b14", freckles: true },
};
const shots: Shot[] = [];
let t = 0;
for (const id of ["me", "homie"] as const) for (const e of EXPRS) { shots.push({ at: t, set: "classroom", cam: { preset: id === "me" ? "closeup_me" : "closeup_homie" }, face: [{ [id]: e }], note: `${id} ${e}` }); t += 1; }
for (const set of ["classroom", "hallway", "cafeteria"] as const) {
  shots.push({ at: t, set, cam: { preset: "two_shot" }, face: [{ me: "deadpan", homie: "smug" }], note: `${set} two-shot` }); t += 1;
  shots.push({ at: t, set, cam: { preset: "wide_class" }, note: `${set} wide` }); t += 1;
}
shots.push({ at: t, set: "cafeteria", cam: { preset: "windows" }, fx: [{ fx: "shatter", at: t + 0.3 }], note: "windows shatter" }); t += 1.5;
const words: Word[] = [{ w: "gallery", turn: 1, t: 0, end: 0.5 }];
export const GALLERY = {
  recipe: { kit: "storytime", slug: "gallery", title: "gallery", cast, lines: { "1": { speaker: "me", text: "gallery" } }, shots, captions: "off" } as Recipe,
  words, duration: t,
};

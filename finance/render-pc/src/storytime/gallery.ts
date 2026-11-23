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

// StoryEp2Kit: the episode-2 set pieces on their own (no voice) for review stills: the POP QUIZ board + the teacher
// (her face goes purple), the soundboard phone (a press POV, the insert), the principal in the hallway, detention, the
// nugget tray, the gym assembly (wide, stage, crowd, speakers), and the slow phone raise.
const k2: Shot[] = [];
let t2 = 0;
const add2 = (d: number, s: Omit<Shot, "at">) => { k2.push({ at: t2, ...s }); t2 += d; };
add2(1, { set: "classroom", cam: { preset: "setcam", name: "board" }, class: [{ do: "laugh" }], note: "board + teacher, class laughing" });
add2(1.5, { cam: { preset: "setcam", name: "teacher" }, adult: [{ id: "teacher", face: "furious" }, { at: 1.5, id: "teacher", skin: "#8e4fa8" }], note: "teacher furious, goes purple at 0.5 s" });
add2(1, { cam: { preset: "closeup_homie" }, pose: [{ homie: "phone" }], face: [{ homie: "deadpan" }], class: [{ do: "front" }], note: "homie deadpan with the phone" });
add2(1.5, { cam: { preset: "pov_press" }, note: "press POV (press at +0.5 s)" });
add2(1, { cam: { preset: "insert" }, note: "insert over the shoulder" });
add2(1, { set: "hallway", cam: { preset: "setcam", name: "principal" }, hide: ["me"], adult: [{ id: "principal", face: "annoyed" }], pose: [{ homie: "idle" }], note: "principal from low" });
add2(1, { cam: { preset: "setcam", name: "on_homie" }, hide: ["me"], note: "down onto the homie" });
add2(1, { cam: { preset: "setcam", name: "stop" }, hide: ["me"], note: "down the hall" });
add2(1, { set: "detention", cam: { preset: "setcam", name: "lonely" }, hide: ["me"], face: [{ homie: "deadpan" }], note: "detention" });
add2(2.6, { set: "cafeteria", cam: { preset: "pov_tray", on: "homie" }, note: "nugget drops at +0.3, taken at +1.6" });
add2(1, { set: "gym", cam: { preset: "wide_class" }, note: "gym wide" });
add2(1, { cam: { preset: "setcam", name: "stage" }, note: "principal at the mic" });
add2(1, { cam: { preset: "setcam", name: "crowd" }, note: "the frozen rows" });
add2(1, { cam: { preset: "setcam", name: "speakers" }, note: "the speakers" });
add2(1, { cam: { preset: "closeup_me" }, face: [{ me: "shocked" }], note: "me mortified" });
add2(1, { cam: { preset: "two_shot" }, face: [{ me: "annoyed", homie: "smug" }], note: "gym two-shot" });
add2(3, { set: "classroom", cam: { preset: "closeup_homie", push: 0.25 }, pose: [{ homie: "raise" }], face: [{ homie: "deadpan" }], note: "the slow phone raise" });
const pressAt = k2[3].at as number;
const trayAt = k2[9].at as number;
export const GALLERY2 = {
  recipe: {
    kit: "storytime", slug: "ep2kit", title: "ep2 kit", cast, lines: { "1": { speaker: "me", text: "gallery" } }, shots: k2, captions: "off",
    props: { phone: "bruh", presses: [pressAt + 0.5, (k2[4].at as number) + 0.3], board: ["POP QUIZ", "phones away. no talking."], show: ["teacher", "principal"], tray: { owner: "homie", drop: trayAt + 0.3, take: trayAt + 1.6 } },
  } as Recipe,
  words, duration: t2,
};

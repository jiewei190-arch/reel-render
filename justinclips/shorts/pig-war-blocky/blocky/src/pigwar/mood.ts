// Three scene moods on the skill's light rig (key from the lens's front-left, complementary fill, strong rim from behind):
//   sunny  the island day (blue sky, warm sun, warm-white rim)
//   tense  the standoff (steel-blue overcast sky, cool low key, hot orange rim, heavier vignette, a little haze)
//   golden the ending (sunset sky, low gold key, gold rim, glow)
import { blockyDay, moodForShot } from "../blocky/mood";
import type { MoodPreset } from "../engine/core/moods";
import type { Cam } from "../engine/core/View";
import { build } from "../library/mood";
import type { Opts } from "../library/mood";

export type MoodId = "sunny" | "tense" | "golden";
const TENSE_SKY = { ...blockyDay.sky, top: "#1b2440", mid: "#3e4c6e", bottom: "#a49c8c", cloudColor: "#5c6680", cloudLit: "#d8c8b0", clouds: 0.85, stars: 0, rays: 0, sunOn: 0, moonOn: 0, horizon: 0.12 };
const GOLD_SKY = { ...blockyDay.sky, top: "#3a3684", mid: "#d8786a", bottom: "#ffd08a", cloudColor: "#c8708a", cloudLit: "#ffe0b0", clouds: 0.55, stars: 0, rays: 0.3, sunOn: 0.8, moonOn: 0, sun: { dir: [-0.6, 0.18, -0.8] as [number, number, number], color: "#ffd890", size: 7 } };
const TENSE: Opts = { hemi: ["#90a2c8", "#3a3a2a", 0.6], key: ["#e8eeff", 3.2, 34], fill: ["#6a84c0", 0.35], rim: ["#ffa860", 5.2], exposure: 0.2, sat: 1.0, vignette: [0.42, "#0a0c18"], bloom: [0.82, 0.35, 36], sky: TENSE_SKY, camFill: 0.14 };
const GOLDEN: Opts = { hemi: ["#ffd8b0", "#5a3a4a", 0.75], key: ["#ffc070", 3.9, 22], fill: ["#a890ff", 0.45], rim: ["#ffe0a0", 5.4], exposure: 0.3, sat: 1.05, hi: "#ffd8a0", vignette: [0.3, "#1a0a10"], bloom: [0.7, 0.55, 44], sky: GOLD_SKY };

const cache = new Map<string, MoodPreset>();
export const moodOfShot = (m: MoodId, id: string, cam: Cam): MoodPreset => {
  const k = `${m}|${id}`;
  const hit = cache.get(k);
  if (hit) return hit;
  let out: MoodPreset;
  if (m === "sunny") {
    const day = moodForShot(id, cam);
    // the skill's 'earth' recipe: the sunny day + a warm-white rim from behind + a soft fill
    const tmp = build({ ...TENSE, rim: ["#fff0c8", 3.4] }, cam);
    out = { ...day, lights: { ...day.lights, rim: { ...day.lights.rim, color: "#fff0c8", intensity: 3.4, dir: tmp.lights.rim.dir }, fill: { ...day.lights.fill, intensity: 0.4, dir: tmp.lights.fill.dir } }, post: { ...day.post, bloom: { ...day.post.bloom, threshold: 0.82, strength: 0.32 }, vignette: { ...day.post.vignette, amount: 0.22 } } };
  } else if (m === "tense") {
    const b = build(TENSE, cam);
    out = { ...b, fog: { color: "#7a8296", density: 0.012 } };
  } else {
    const b = build(GOLDEN, cam);
    out = { ...b, fog: { color: "#f0b890", density: 0.006 } };
  }
  cache.set(k, out);
  return out;
};

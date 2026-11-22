// biz3d palette and light moods: a premium-documentary miniature world. Clean, directional light, rich saturated
// colour, a GREEN accent for growth and a RED accent for collapse, gold for money, ink-navy text on white cards.
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";

export const BP = {
  ink: "#0E1726",
  navy: "#13233F",
  slate: "#34445E",
  white: "#FFFFFF",
  paper: "#F6F1E7",
  green: "#22C55E",
  greenDeep: "#15803D",
  greenGlow: "#4ADE80",
  red: "#EF3B36",
  redDeep: "#B91C1C",
  redGlow: "#FF6B5E",
  gold: "#F5B324",
  goldDeep: "#C98A0B",
  wood: "#6B4329",
  woodDark: "#3E2616",
  glass: "#9CC9F0",
  steel: "#8B97A8",
  concrete: "#B9B4AA",
  cardboard: "#C89A5E",
  night: "#0B1430",
} as const;

/** suit presets for the cast (any hex works too): one colour family per side of a story */
export const SUITS: Record<string, { suit: string; tie: string; shirt?: string }> = {
  charcoal: { suit: "#2E3440", tie: BP.red },
  navy: { suit: "#1E2B4A", tie: BP.gold },
  olive: { suit: "#3F5B3A", tie: BP.green },
  teal: { suit: "#1F5F63", tie: BP.greenGlow },
  burgundy: { suit: "#5B1F2A", tie: BP.gold },
  grey: { suit: "#6B7280", tie: "#1E3A8A" },
  cream: { suit: "#D8CBB0", tie: BP.redDeep },
};

type SkyArgs = Parameters<typeof mk>[0]["sky"];
const flatSky = (top: string, mid: string, bottom: string): SkyArgs => ({
  top, mid, bottom, cloudColor: mid, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0,
  sun: { dir: [-0.6, 0.12, -1], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1], color: "#ffffff", size: 4 }, moonOn: 0,
});

type MoodArgs = { fog: string; density: number; hemi: [string, string, number]; key: [string, number]; keyDir?: [number, number, number]; rim: [string, number]; fill: [string, number]; exposure?: number; sat?: number; contrast?: number; ink?: string; vignette?: number; bloom?: number };
const doc = (o: MoodArgs): MoodPreset => {
  const m = mk({
    note: "biz3d documentary",
    hemi: o.hemi,
    key: [o.key[0], o.key[1], o.keyDir ?? [0.5, 0.8, 0.45]],
    rim: [o.rim[0], o.rim[1], [-0.6, 0.45, -0.7]],
    fill: [o.fill[0], o.fill[1], [-0.7, 0.3, 0.5]],
    prac: ["#ffd9a0", 0, "#fff0d0"],
    fog: [o.fog, o.density],
    sky: flatSky("#1b2a52", "#3a4f80", "#c58a6a"),
    toon: { shadowTint: [0.92, 0.95, 1.08], hiTint: [1.04, 1.01, 0.97], rimColor: "#ffe9cf" },
    grade: { exposure: o.exposure ?? 1.0, contrast: o.contrast ?? 1.08, saturation: o.sat ?? 1.14, shadowTint: "#33406b", highlightTint: "#fff3e0", gain: "#ffffff" },
    bloomTint: "#ffe2b8",
    ink: o.ink ?? "#141a26",
    camFill: ["#fff6ea", 0.5],
    cast: { rim: ["#ffe2c0", 1.2], fill: ["#dfe8ff", 0.5] },
  });
  return {
    ...m,
    post: {
      ...m.post,
      outline: { ...m.post.outline, widthPx: 1.8, strength: 0.42, farOpacity: 0.2 },
      bloom: { ...m.post.bloom, threshold: 1.0, strength: o.bloom ?? 0.55, radiusPx: 36 },
      grade: { ...m.post.grade, lift: "#000000", splitAmount: 0.08, sharpen: 0.35 },
      vignette: { amount: o.vignette ?? 0.2, softness: 0.85, color: "#0b0f1c" },
    },
  };
};

export const BIZ_MOODS: Record<string, MoodPreset> = {
  /** warm wood and lamps inside, a cool dusk skyline through the window */
  boardroom: doc({ fog: "#2a2230", density: 0.012, hemi: ["#ffe9d2", "#3b3350", 1.1], key: ["#ffe2bd", 3.0], rim: ["#9fc4ff", 1.6], fill: ["#bcd0ff", 0.45] }),
  /** a miniature city block at dusk: deep blue sky, warm windows */
  city: doc({ fog: "#2b3a66", density: 0.011, hemi: ["#c6d6ff", "#4a3b5c", 1.15], key: ["#ffd3a0", 2.6], keyDir: [0.6, 0.55, 0.5], rim: ["#7fa8ff", 1.8], fill: ["#ffb28a", 0.35], sat: 1.2 }),
  /** the chart studio: a dark navy void, a glowing grid, the line lights itself */
  chart: doc({ fog: "#0b1430", density: 0.018, hemi: ["#9fb6ff", "#0b1430", 0.8], key: ["#ffffff", 1.8], rim: ["#6f8cff", 1.4], fill: ["#8fa6ff", 0.35], exposure: 1.05, bloom: 0.85, vignette: 0.3 }),
  /** a cool steel warehouse with warm hanging lamps */
  warehouse: doc({ fog: "#4a4f5c", density: 0.02, hemi: ["#dfe6f2", "#4a4036", 1.05], key: ["#ffd9a8", 2.7], rim: ["#a8c4ff", 1.3], fill: ["#c8d6ff", 0.4] }),
  /** warm paper under a gallery light */
  headlines: doc({ fog: "#3a3026", density: 0.01, hemi: ["#fff3e0", "#5a4634", 1.25], key: ["#fff0d8", 2.8], keyDir: [0.3, 0.7, 0.8], rim: ["#ffd9b0", 1.0], fill: ["#dfe6ff", 0.4], sat: 1.05 }),
};

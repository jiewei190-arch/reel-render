// cyber3d palette and light moods: a dark cyber-heist thriller. Near-black, neon cyan + magenta, ONE red for alerts.
// Lights are low and cool (a cyan key, a magenta rim); the neon parts are emissive and the bloom picks them up.
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";

export const CP = {
  bg: "#05070D",
  ink: "#0A0F1C",
  panel: "#0D1526",
  steel: "#1A2436",
  steelHi: "#2A3850",
  cyan: "#19E6FF",
  cyanDeep: "#0A8FB0",
  magenta: "#FF2BD6",
  magentaDeep: "#A3168A",
  red: "#FF2A3D",
  redDeep: "#9E0F1F",
  white: "#EAF6FF",
  dim: "#6F86A8",
  amber: "#FFC24A", // monitor text accents only (never a UI colour)
} as const;

type SkyArgs = Parameters<typeof mk>[0]["sky"];
const flatSky = (c: string): SkyArgs => ({
  top: c, mid: c, bottom: c, cloudColor: c, cloudLit: c, clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0,
  sun: { dir: [-0.6, 0.12, -1], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1], color: "#ffffff", size: 4 }, moonOn: 0,
});

/** dark and moody: a low cool hemisphere, a cyan key, a magenta rim, deep fog, strong bloom on the neon */
const dark = (o: { fog: string; density: number; key?: [string, number]; rim?: [string, number]; hemi?: number; exposure?: number }): MoodPreset => {
  const m = mk({
    note: "cyber3d dark",
    hemi: ["#3a5a8a", "#0a0614", o.hemi ?? 0.55],
    key: [o.key?.[0] ?? "#9fe9ff", o.key?.[1] ?? 1.5, [0.5, 0.8, 0.6]],
    rim: [o.rim?.[0] ?? CP.magenta, o.rim?.[1] ?? 2.2, [-0.6, 0.45, -0.7]],
    fill: ["#2a6cff", 0.45, [-0.8, 0.3, 0.5]],
    prac: ["#19e6ff", 0, "#19e6ff"],
    fog: [o.fog, o.density],
    sky: flatSky(o.fog),
    toon: { shadowTint: [0.8, 0.85, 1.25], hiTint: [1.0, 1.05, 1.12], rimColor: "#ff7ae8" },
    grade: { exposure: o.exposure ?? 1.0, contrast: 1.12, saturation: 1.18, shadowTint: "#1a2a6a", highlightTint: "#e6fbff", gain: "#ffffff" },
    bloomTint: "#bff6ff",
    ink: "#02040a",
    camFill: ["#6fb8ff", 0.3],
    cast: { rim: [CP.magenta, 1.6], fill: ["#5fd8ff", 0.5] },
  });
  return {
    ...m,
    post: {
      ...m.post,
      outline: { ...m.post.outline, widthPx: 1.8, strength: 0.6, farOpacity: 0.3 },
      bloom: { ...m.post.bloom, threshold: 0.62, strength: 0.85, radiusPx: 46 },
      grade: { ...m.post.grade, lift: "#000000", splitAmount: 0.12, sharpen: 0.3 },
      vignette: { amount: 0.42, softness: 0.75, color: "#000006" },
    },
  };
};

export type CyberMoodId = "room" | "vault" | "netmap" | "inbox" | "evidence" | "servers";
export const CYBER_MOODS: Record<CyberMoodId, MoodPreset> = {
  room: dark({ fog: "#05070d", density: 0.09, key: ["#7fdcff", 1.3] }),
  vault: dark({ fog: "#04060c", density: 0.045, key: ["#a6f0ff", 1.6], hemi: 0.6 }),
  netmap: dark({ fog: "#03050b", density: 0.02, key: ["#8fe6ff", 1.2], hemi: 0.5 }),
  inbox: dark({ fog: "#05060d", density: 0.05, key: ["#b0ecff", 1.4] }),
  evidence: dark({ fog: "#07060a", density: 0.06, key: ["#ffe2c0", 1.6], rim: [CP.red, 1.4], hemi: 0.6 }),
  servers: dark({ fog: "#03060c", density: 0.05, key: ["#8fe6ff", 1.2], rim: [CP.cyan, 1.8] }),
};

// law3d kit: the "weird true court cases" palette and the dark, moody courtroom light rig (one MoodPreset per set).
// Approved look: deep navy and wood tones, a warm spotlight on the bench, dust in the light beams, ONE gold accent.
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";

export const LP = {
  /** the frame background behind every set (deep navy) */
  bg: "#0B1426",
  navy: "#0F1C33",
  navyMid: "#1A2C4A",
  navySoft: "#2B4266",
  /** wood tones */
  wood: "#5A3720",
  woodDark: "#3B2314",
  woodLight: "#8A5A35",
  /** the ONE accent: gold (the hook word, the active caption word, card trims, the gavel band, the counter) */
  gold: "#E8B44A",
  goldDeep: "#B9862A",
  goldSoft: "#F6D88E",
  /** warm spotlight colour */
  spot: "#FFD9A0",
  paper: "#F3EAD7",
  paperDark: "#D9CBAE",
  ink: "#1A1410",
  white: "#FFFFFF",
  /** text on dark */
  cream: "#FFF4DE",
  red: "#B8322A",
  stone: "#B9B2A4",
  stoneDark: "#7E786C",
  silhouette: "#141C2C",
} as const;

type SkyArgs = Parameters<typeof mk>[0]["sky"];
const flatSky = (top: string, mid: string, bottom: string): SkyArgs => ({
  top, mid, bottom, cloudColor: mid, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0,
  sun: { dir: [-0.6, 0.12, -1], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1], color: "#ffffff", size: 4 }, moonOn: 0,
});

/** dark and moody: a low navy hemisphere, one warm key from high in front (the "spotlight"), a cool blue rim from behind,
 *  very little fill, warm bloom on the practicals, a heavy navy vignette */
const moody = (o: { fog: string; density: number; hemi?: [string, string, number]; key?: number; keyDir?: [number, number, number]; exposure?: number; rim?: number; sat?: number; vig?: number }): MoodPreset => {
  const m = mk({
    note: "law3d moody courtroom",
    hemi: o.hemi ?? ["#4a5f8f", "#1a1420", 0.55],
    key: ["#ffd29a", o.key ?? 3.4, o.keyDir ?? [0.25, 0.9, 0.55]],
    rim: ["#7fa6ff", o.rim ?? 2.0, [-0.55, 0.45, -0.8]],
    fill: ["#6a7fb8", 0.28, [-0.8, 0.3, 0.45]],
    prac: ["#ffc070", 0, "#ffe0a8"],
    fog: [o.fog, o.density],
    sky: flatSky("#0b1426", "#14213a", "#1a2c4a"),
    toon: { shadowTint: [0.82, 0.86, 1.16], hiTint: [1.1, 1.02, 0.88], rimColor: "#a8c0ff" },
    grade: { exposure: o.exposure ?? 0.98, contrast: 1.16, saturation: o.sat ?? 1.06, shadowTint: "#1c2c5a", highlightTint: "#ffe2b0", gain: "#fff6ea" },
    bloomTint: "#ffd8a0",
    ink: "#07090f",
    camFill: ["#c8d4ff", 0.22],
    cast: { rim: ["#8fb0ff", 1.6], fill: ["#ffd9b0", 0.35] },
  });
  return {
    ...m,
    post: {
      ...m.post,
      outline: { ...m.post.outline, widthPx: 2.0, strength: 0.6, farOpacity: 0.3 },
      bloom: { ...m.post.bloom, threshold: 0.95, strength: 0.55, radiusPx: 44 },
      grade: { ...m.post.grade, lift: "#05070d", splitAmount: 0.12, sharpen: 0.35 },
      vignette: { amount: o.vig ?? 0.42, softness: 0.75, color: "#02040a" },
    },
  };
};

export const LAW_MOODS: Record<string, MoodPreset> = {
  courtroom: moody({ fog: "#0d1628", density: 0.028 }),
  evidence: moody({ fog: "#070b14", density: 0.035, key: 4.2, keyDir: [0.05, 1, 0.2], hemi: ["#3a4a70", "#0a0a10", 0.4], rim: 1.6 }),
  casefile: moody({ fog: "#120e0c", density: 0.02, key: 3.2, keyDir: [-0.45, 0.85, 0.3], hemi: ["#5a5a7a", "#1a1410", 0.6], exposure: 1.02 }),
  headlines: moody({ fog: "#0e1422", density: 0.02, key: 3.0, keyDir: [0.35, 0.7, 0.75], hemi: ["#56658f", "#181420", 0.65], exposure: 1.02 }),
  steps: moody({ fog: "#1a2a48", density: 0.012, key: 2.4, keyDir: [-0.5, 0.55, 0.65], hemi: ["#5a74b0", "#1e1a28", 0.75], rim: 2.4, exposure: 1.04 }),
};

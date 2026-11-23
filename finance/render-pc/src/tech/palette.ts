// tech3d kit: the "Tech explained" palette and the bright, soft, clean light rig (one MoodPreset per set).
// Approved look: bright 3D low-poly isometric/cutaway, soft clean light, electric blue / mint / warm orange on #F5F7FA.
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";

export const TP = {
  bg: "#F5F7FA",
  blue: "#2F80ED",
  blueDeep: "#1C5BBF",
  blueSoft: "#BCD6FA",
  mint: "#3DDC97",
  mintDeep: "#1FA873",
  orange: "#FF8A3D",
  orangeDeep: "#E5641A",
  navy: "#14213D",
  ink: "#1B2A44",
  white: "#FFFFFF",
  shell: "#E9EEF5",
  grey: "#B7C2D0",
  greyDark: "#6B7A90",
  screen: "#0F1B33",
} as const;

type SkyArgs = Parameters<typeof mk>[0]["sky"];
const flatSky = (top: string, mid: string, bottom: string): SkyArgs => ({
  top, mid, bottom, cloudColor: mid, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0,
  sun: { dir: [-0.6, 0.12, -1], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1], color: "#ffffff", size: 4 }, moonOn: 0,
});

/** soft, bright, low-contrast: a cool hemisphere, a gentle warm key with a soft shadow, a blue rim, thin navy ink */
const bright = (o: { fog: string; density: number; hemi?: [string, string, number]; key?: number; exposure?: number; ink?: string; sat?: number }): MoodPreset => {
  const m = mk({
    note: "tech3d bright studio",
    hemi: o.hemi ?? ["#ffffff", "#c9d6ea", 1.55],
    key: ["#fff7ee", o.key ?? 2.6, [0.45, 0.85, 0.55]],
    rim: ["#d6e6ff", 1.4, [-0.55, 0.5, -0.75]],
    fill: ["#e3f6ff", 0.7, [-0.75, 0.35, 0.45]],
    prac: ["#ffffff", 0, "#ffffff"],
    fog: [o.fog, o.density],
    sky: flatSky("#9cc4ff", "#d8e8ff", "#f5f7fa"),
    toon: { shadowTint: [0.95, 0.97, 1.06], hiTint: [1.02, 1.01, 1.0], rimColor: "#eaf3ff" },
    grade: { exposure: o.exposure ?? 0.95, contrast: 1.04, saturation: o.sat ?? 1.08, shadowTint: "#5a78b0", highlightTint: "#ffffff", gain: "#ffffff" },
    bloomTint: "#ffffff",
    ink: o.ink ?? TP.ink,
    camFill: ["#ffffff", 0.45],
    cast: { rim: ["#d6e6ff", 1.2], fill: ["#ffffff", 0.6] },
  });
  return {
    ...m,
    post: {
      ...m.post,
      outline: { ...m.post.outline, widthPx: 2.2, strength: 0.55, farOpacity: 0.25 },
      bloom: { ...m.post.bloom, threshold: 1.05, strength: 0.35, radiusPx: 30 },
      grade: { ...m.post.grade, lift: "#000000", splitAmount: 0.04, sharpen: 0.35 },
      vignette: { amount: 0.06, softness: 0.9, color: "#8fa6c8" },
    },
  };
};

export const TECH_MOODS: Record<string, MoodPreset> = {
  studio: bright({ fog: "#eef2f8", density: 0.012 }),
  blueprint: bright({ fog: "#1d4f9e", density: 0.03, hemi: ["#e8f1ff", "#2a5aa8", 1.4], key: 2.0, exposure: 1.0, ink: "#0c2350" }),
  sky: bright({ fog: "#cfe3fb", density: 0.0055, hemi: ["#ffffff", "#b9d0a8", 1.5], key: 2.8 }),
  /** the sky set in thick fog (low visibility): the runway fades out within ~20 m */
  skyFog: bright({ fog: "#dfe6ee", density: 0.085, hemi: ["#ffffff", "#c8d2dc", 1.6], key: 1.6, sat: 0.95 }),
};
export const FOG_BG = "#dfe6ee";

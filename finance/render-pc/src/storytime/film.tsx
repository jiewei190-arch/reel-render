// StoryFilm: one compiled storytime recipe. One View (bright school light, flat-shaded toon look, ink outline, no depth
// of field, no motion blur) with the set, the kids and the fx; then the 2D layer: flash, the crack overlay, the caption,
// and the hard cut to black (pure black from the cut on: no fade).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "../engine/core/frame";
import { mk } from "../engine/core/moods";
import type { MoodPreset } from "../engine/core/moods";
import { View } from "../engine/core/View";
import { Kid } from "./cast";
import type { Compiled } from "./compile";
import { FPS } from "./compile";
import { CrackOverlay, Shards } from "./fx";
import { StoryCaption } from "./hud";
import { SET_BG, StorySet } from "./sets";
import type { SetId } from "./types";

const flatSky = (c: string) => ({ top: c, mid: c, bottom: c, cloudColor: c, cloudLit: "#ffffff", clouds: 0, stars: 0, rays: 0, horizon: 0.16, brush: 0, sun: { dir: [-0.6, 0.12, -1] as [number, number, number], color: "#ffffff", size: 6 }, sunOn: 0, moon: { dir: [-0.4, 0.45, -1] as [number, number, number], color: "#ffffff", size: 4 }, moonOn: 0 });
/** bright, saturated school daylight: a strong window key, a cool-blue sky fill, a light ink line */
const school = (fog: string, keyDir: [number, number, number]): MoodPreset => {
  const m = mk({
    note: "storytime bright school", hemi: ["#f4f8ff", "#b89a7a", 1.15], key: ["#fff1d8", 3.2, keyDir], rim: ["#fff8e8", 1.2, [-0.5, 0.5, -0.8]],
    fill: ["#c8d8ff", 0.55, [-0.7, 0.3, 0.6]], prac: ["#fff0d0", 0, "#fff0d0"], fog: [fog, 0.008], sky: flatSky(fog),
    toon: { shadowTint: [0.92, 0.9, 1.1], hiTint: [1.04, 1.02, 0.96], rimColor: "#ffffff" },
    grade: { exposure: 0.96, contrast: 1.08, saturation: 1.22, shadowTint: "#5a5ab0", highlightTint: "#fff6e0", gain: "#ffffff" }, bloomTint: "#fff4dc", ink: "#1d1630",
    camFill: ["#ffffff", 0.35], cast: { rim: ["#fff6e0", 1.2], fill: ["#ffe8d0", 0.5] },
  });
  return { ...m, post: { ...m.post, outline: { ...m.post.outline, widthPx: 2.6, strength: 0.85 }, bloom: { ...m.post.bloom, threshold: 1.25, strength: 0.25 }, grade: { ...m.post.grade, lift: "#1a1620", sharpen: 0.3 }, vignette: { amount: 0.12, softness: 0.85, color: "#1a1020" } } };
};
const MOODS: Record<SetId, MoodPreset> = {
  classroom: school("#cfe6f2", [0.75, 0.75, 0.3]),
  hallway: school("#eef0d8", [0.25, 0.9, 0.45]),
  cafeteria: school("#ffe6c8", [0.15, 0.7, -0.8]),
};

export const StoryFilm: React.FC<{ c: Compiled }> = ({ c }) => {
  const n = useCurrentFrame();
  useFonts();
  const t0 = n / FPS;
  const shot = c.shotAt(t0);
  const t = Math.min(Math.max(t0, shot.a), shot.b - 1e-4);
  const fx = c.fxAt(t0);
  if (fx.black) return <AbsoluteFill style={{ background: "#000" }}>{c.recipe.audio ? <Audio src={staticFile(c.recipe.audio)} /> : null}</AbsoluteFill>;
  const cam = c.camAt(t0);
  const figs = c.figsAt(t, shot);
  const cap = c.capAt(t0);
  const broken = Number.isFinite(c.brokenFrom) ? c.brokenFrom : null;
  return (
    <AbsoluteFill style={{ background: SET_BG[shot.set] }}>
      {c.recipe.audio ? <Audio src={staticFile(c.recipe.audio)} /> : null}
      <View mood={MOODS[shot.set]} cam={cam} t={t} blur={0} sky={false} width={c.layout.W} height={c.layout.H}>
        <StorySet id={shot.set} t={t} broken={broken} />
        {figs.map((st) => <Kid key={st.id} st={st} t={t} />)}
        {shot.set === "cafeteria" && fx.shatter !== null ? <Shards u={fx.shatter} /> : null}
      </View>
      {fx.flash > 0 ? <AbsoluteFill style={{ background: "#ffffff", opacity: fx.flash }} /> : null}
      {fx.shatter !== null ? <CrackOverlay u={fx.shatter} /> : null}
      {cap ? <StoryCaption c={cap.chunk} y={cap.y} t={t0} /> : null}
    </AbsoluteFill>
  );
};

// Asset gallery: frame k = catalogue asset k on a floor, seen from the front (+z, slightly above), with a 1.45 m
// reference block (a Blocky actor's height) to its left. Used for RECIPE_GUIDE thumbnails and the +z facing check.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useFonts } from "../../engine/core/frame";
import { aim } from "../../engine/core/rig";
import { View } from "../../engine/core/View";
import { moodFor } from "../../library/mood";
import { B } from "../hooks";
import { Asset, assetSize, usePreload } from "./assets";
import { CATALOG } from "./assets.catalog.gen";

export const GALLERY_FRAMES = CATALOG.length;
export const AssetGallery: React.FC<{ only?: string }> = ({ only }) => {
  const f = useCurrentFrame();
  useFonts();
  const ready = usePreload(CATALOG.map((x) => x.id));
  const a = only ? CATALOG.find((x) => x.id === only)! : CATALOG[Math.min(f, CATALOG.length - 1)];
  const [w, h, d] = assetSize(a.id);
  const R = Math.max(w, h * 0.62, d, 0.5);
  const cam = aim([R * 0.55, h * 0.6 + R * 0.55, R * 2.2 + d / 2], [0, h * 0.45, 0], 40, 0.55);
  const mood = moodFor("store2", `gallery:${a.id}`, cam);
  return (
    <AbsoluteFill style={{ background: "#6a5ae8" }}>
      {ready ? <View mood={mood} cam={cam} t={0} blur={0} sky={false} width={1080} height={1080}>
        <B s={[R * 8, 0.02, R * 8]} p={[0, -0.01, 0]} c="#f4ecff" />
        <B s={[R * 8, R * 4, 0.05]} p={[0, R * 2, -R * 2.5]} c="#8a7ae8" />
        <Asset key={a.id} id={a.id} />
        <B s={[0.12, 1.45, 0.12]} p={[-w / 2 - 0.3, 0.725, 0]} c="#ff5a4f" />
        {/* a +z arrow on the floor: the front of the prop must face it */}
        <B s={[0.06, 0.02, R * 0.5]} p={[w / 2 + 0.25, 0.01, d / 2 + R * 0.25]} c="#1f9e4f" />
      </View> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, height: 120, fontFamily: "Poppins", fontWeight: 800, fontSize: 44, color: "#fff", textAlign: "center", WebkitTextStroke: "4px #140c1c", paintOrder: "stroke fill" }}>
        {a.id} · {w.toFixed(2)}×{h.toFixed(2)}×{d.toFixed(2)} m
      </div>
    </AbsoluteFill>
  );
};

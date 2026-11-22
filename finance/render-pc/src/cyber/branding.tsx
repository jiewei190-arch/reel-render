// Channel branding stills ("Scam Files TV"), made from the kit's own scenes at full resolution, plain frames (no
// motion blur). Two compositions on the cyber entry:
//   BrandPfp     800x800    the hooded figure lit by the monitors (YouTube crops it to a circle: subject in the inner 70%)
//   BrandBanner  2560x1440  the neon network map, wide, with the channel name inside the 1546x423 centre safe area
// Render: node tools/brand_stills.mjs (stills + the phone / circle previews into branding/scam-files-tv/).
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import type { CyberCompiled } from "./compile";
import { FPS, compileCyber } from "./compile";
import { ClipOn, KitView } from "./film";
import { CP, CYBER_MOODS } from "./palette";
import { CYBER_SETS } from "./sets";
import type { CyberRecipe } from "./types";

const FONT = "Poppins";
export const BANNER = { W: 2560, H: 1440, safeW: 1546, safeH: 423 };
export const PFP = { W: 800, H: 800 };
/** frame to grab for each still (packets mid-flight, figure mid-type) */
export const BRAND_FRAMES = { BrandPfp: 45, BrandBanner: 75 };

const base = { kit: "cyber3d" as const, hook: { text: "SCAM FILES TV", until: -1 }, captions: "off" as const, talk: "none" as const, duration: 4 };
const PFP_RECIPE: CyberRecipe = {
  ...base, slug: "brand-pfp",
  shots: [{ at: 0, set: "room", in: "cut", caption: "off", cam: { preset: "medium", target: "hk.head", dist: 1.05, h: 0.05, az: -140, face: 0.5 }, props: [{ id: "hk", kit: "figure", at: "seat", yaw: 180, pose: "type" }] }],
};
const BANNER_RECIPE: CyberRecipe = {
  ...base, slug: "brand-banner", frame: "landscape",
  shots: [{
    at: 0, set: "netmap", in: "cut", caption: "off", cam: { preset: "medium", target: "atlantic", dist: 13, h: 11, az: 0 },
    props: [
      { id: "r1", kit: "route", at: "lithuania", from: "lithuania", to: ["cyprus", "slovakia", "hungary", "hongkong", "latvia"], hit: 0.1 },
      { id: "r2", kit: "route", at: "svalley", from: "svalley", to: ["newyork", "london", "taiwan"], hit: 0.3, color: CP.cyan },
      { id: "r3", kit: "route", at: "newyork", from: "newyork", to: ["lithuania", "london"], hit: 0.5, color: CP.red },
    ],
  }],
};

const cache = new Map<string, CyberCompiled>();
const compiled = (id: "BrandPfp" | "BrandBanner") => {
  let c = cache.get(id);
  if (!c) { c = compileCyber(id === "BrandPfp" ? PFP_RECIPE : BANNER_RECIPE, [], base.duration); cache.set(id, c); }
  return c;
};

/** the 3D layer of a compiled one-shot recipe, at any canvas size */
const Scene: React.FC<{ c: CyberCompiled; W: number; H: number; children?: React.ReactNode }> = ({ c, W, H, children }) => {
  const n = useCurrentFrame();
  const t = n / FPS;
  const shot = c.shotAt(t);
  const set = CYBER_SETS[shot.set];
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <View mood={CYBER_MOODS[set.mood]} cam={c.camAt(t)} t={t} blur={0} focus={shot.lens.subj(t)} sky={false} width={W} height={H}>
        <ClipOn />
        {set.render(t)}
        {shot.props.map((p) => (t < p.a || t >= p.b ? null : <KitView key={p.key} pr={p} c={c} t={t} />))}
        {children}
      </View>
    </AbsoluteFill>
  );
};

const Pfp: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Scene c={compiled("BrandPfp")} W={PFP.W} H={PFP.H}>
        {/* monitor glow: cyan key from the screens, magenta rim from behind */}
        <pointLight position={[-0.35, 1.35, -0.55]} color={CP.cyan} intensity={3.2} distance={2.2} decay={2} />
        <pointLight position={[0.5, 1.55, 0.5]} color={CP.magenta} intensity={10} distance={2.0} decay={2} />
      </Scene>
      {/* pull the eye to the centre: dark edges (the circle crop loses the corners anyway) */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 42%, rgba(5,7,13,0.75) 78%)" }} />
      {/* neon ring just inside the circle crop: reads as a bold shape even at 98 px */}
      <div style={{ position: "absolute", left: 32, top: 32, width: 736, height: 736, borderRadius: "50%", padding: 14, boxSizing: "border-box", background: `conic-gradient(from 200deg, ${CP.cyan}, ${CP.magenta}, ${CP.cyan})`, WebkitMask: "radial-gradient(circle, transparent 353px, #000 354px)", mask: "radial-gradient(circle, transparent 353px, #000 354px)", filter: `drop-shadow(0 0 14px ${CP.magenta})` }} />
    </AbsoluteFill>
  );
};

const Banner: React.FC = () => {
  useFonts();
  const { W, H, safeW, safeH } = BANNER;
  const x0 = (W - safeW) / 2, y0 = (H - safeH) / 2;
  return (
    <AbsoluteFill>
      <Scene c={compiled("BrandBanner")} W={W} H={H} />
      {/* a soft dark plate behind the text so it reads over the map on every device crop */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${safeW * 0.62}px ${safeH * 0.85}px at 50% 50%, rgba(5,7,13,0.86) 0%, rgba(5,7,13,0.6) 55%, rgba(5,7,13,0) 100%)` }} />
      <div style={{ position: "absolute", left: x0, top: y0, width: safeW, height: safeH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, color: CP.white, textAlign: "center" }}>
        <div style={{ fontSize: 168, lineHeight: 1, letterSpacing: -3, whiteSpace: "nowrap", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: `0 0 34px ${CP.cyan}55, 0 10px 30px rgba(0,0,0,0.8)` }}>
          SCAM <span style={{ color: CP.cyan, textShadow: `0 0 30px ${CP.cyan}, 0 10px 30px rgba(0,0,0,0.8)` }}>FILES</span> TV
        </div>
        <div style={{ marginTop: 26, height: 6, width: 520, background: `linear-gradient(90deg, ${CP.cyan}, ${CP.magenta})`, boxShadow: `0 0 18px ${CP.magenta}` }} />
        <div style={{ marginTop: 26, fontSize: 56, lineHeight: 1.1, whiteSpace: "nowrap", textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>True scams. How they worked. How to spot them.</div>
        <div style={{ marginTop: 18, fontSize: 36, fontWeight: 700, color: "#A9BEDD", letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 3px 12px rgba(0,0,0,0.9)" }}>
          New Shorts daily <span style={{ color: CP.magenta }}>·</span> Full cases Tue &amp; Fri
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const BrandRoot: React.FC = () => (
  <>
    <Composition id="BrandPfp" component={Pfp} durationInFrames={base.duration * FPS} fps={FPS} width={PFP.W} height={PFP.H} />
    <Composition id="BrandBanner" component={Banner} durationInFrames={base.duration * FPS} fps={FPS} width={BANNER.W} height={BANNER.H} />
  </>
);

// Channel branding for "Court Of Weird", rendered from the kit's own scene (set, cast, beams, post chain) at full
// resolution, plain frames (no motion blur):
//   LawBrandPfp     800 x 800    the judge close-up under the bench spotlight, gavel raised (YouTube crops a circle:
//                                the subject sits inside the inner ~70 %)
//   LawBrandBanner  2560 x 1440  the wide courtroom (TV shows all of it); the title, tagline and schedule sit inside the
//                                centred 1546 x 423 safe strip (phones show only that)
// Each runs a short clip so the frame (the gavel's height, the dust) can be picked:
//   npx remotion still src/index.law.ts LawBrandPfp branding/court-of-weird/pfp.png --frame=N --gl=swangle
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import type { V3 } from "../blocky/motion";
import { useFonts } from "../engine/core/frame";
import { View } from "../engine/core/View";
import type { Cam } from "../engine/core/View";
import { Figure, figHead, figState } from "./cast";
import type { CastSpec, FigPose, FigTrack } from "./cast";
import { LAW_MOODS, LP } from "./palette";
import { LAW_SETS } from "./sets";

const FONT = "Poppins";
const T0 = 2; // scene time at frame 0
export const BRAND_HIT = T0 + 1.0; // the gavel lands 1 s in (frame 30)
const set = LAW_SETS.courtroom;

const JUDGE: CastSpec = { role: "judge", skin: "#c98f6a", hairStyle: "short", hair: "#3a3430", glasses: true, plate: "THE COURT" };
const track = (id: string, spec: CastSpec, at: V3, yaw: number, pose: FigPose, sit: boolean, seed: number, hits: number[] = []): FigTrack => ({
  id, spec, seed, s: 1, sit, at: () => at, yaw: () => yaw, segs: [{ t0: -10, pose }], faces: [], hits, gavel: pose === "gavel",
});
const judgeT = track("judge", JUDGE, set.anchors.bench, 0, "gavel", true, 7, [BRAND_HIT]);

// ------------------------------------------------------------------ profile picture
export const BrandPfp: React.FC = () => {
  useFonts();
  const t = T0 + useCurrentFrame() / 30;
  const judge = figState(judgeT, t);
  const h = figHead(judge);
  const look: V3 = [h[0] + 0.17, h[1] + 0.2, h[2]];
  const cam: Cam = { pos: [h[0] + 0.5, h[1] + 0.32, h[2] + 1.95], look, fov: 34, roll: -3 };
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <View mood={LAW_MOODS[set.mood]} cam={cam} t={t} blur={1.2} focus={h} sky={false} width={800} height={800}>
        {set.render(t, { jury: false })}
        <Figure st={judge} t={t} />
      </View>
      {/* a soft gold glow behind the subject and a dark edge, so the circle crop reads as one bold mark */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, rgba(232,180,74,0.10) 0%, rgba(232,180,74,0) 38%, rgba(11,20,38,0) 52%, rgba(11,20,38,0.55) 72%)" }} />
      <div style={{ position: "absolute", left: 400 - 368, top: 400 - 368, width: 736, height: 736, borderRadius: "50%", border: `10px solid ${LP.gold}`, boxSizing: "border-box", opacity: 0.9 }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ banner
export const BANNER = { W: 2560, H: 1440, safe: { w: 1546, h: 423 } };
const others: FigTrack[] = [
  judgeT,
  track("plaintiff", { role: "plaintiff", skin: "#7a5038", hairStyle: "bald", hair: "#1a1410", suit: "#3a4a6e", tie: "#8a2a2a" }, set.anchors.plaintiff, Math.PI, "point", false, 3),
  track("lawyer", { role: "lawyer", skin: "#f0c8a8", hairStyle: "long", hair: "#7a4a24", suit: "#22242c", tie: "#B9862A" }, set.anchors.podium, Math.PI, "present", false, 5),
  track("defendant", { role: "defendant", skin: "#e0b48e", hairStyle: "short", hair: "#141414", suit: "#6e6a62", apron: "#2b4f7a" }, set.anchors.defendant, Math.PI, "shock", false, 9),
  track("witness", { role: "witness", skin: "#b07850", hairStyle: "curly", hair: "#2a1a10", beard: true }, set.anchors.witness, -0.5, "talk", true, 11),
  track("bailiff", { role: "bailiff", skin: "#d8a888", hairStyle: "short", build: "broad" }, [-3.0, 0, -3.4], 0.6, "cross", false, 13),
];
export const BrandBanner: React.FC = () => {
  useFonts();
  const t = T0 + useCurrentFrame() / 30;
  const figs = others.map((tr) => figState(tr, t));
  const cam: Cam = { pos: [0.3, 2.9, 5.8], look: [0, -0.35, -2.6], fov: 52 };
  const S = BANNER.safe;
  return (
    <AbsoluteFill style={{ background: set.bg }}>
      <View mood={LAW_MOODS[set.mood]} cam={cam} t={t} blur={0.4} focus={[0, 1.4, -1.5]} sky={false} width={BANNER.W} height={BANNER.H}>
        {set.render(t)}
        {figs.map((st) => <Figure key={st.id} st={st} t={t} />)}
      </View>
      {/* a dark band behind the safe strip, so the type reads over any part of the room */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(11,20,38,0) 0%, rgba(11,20,38,0) 28%, rgba(11,20,38,0.78) 40%, rgba(11,20,38,0.86) 50%, rgba(11,20,38,0.78) 60%, rgba(11,20,38,0) 72%)` }} />
      <div style={{ position: "absolute", left: (BANNER.W - S.w) / 2, top: (BANNER.H - S.h) / 2, width: S.w, height: S.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginBottom: 10 }}>
          <div style={{ width: 120, height: 5, background: LP.gold, borderRadius: 3 }} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 10, color: LP.gold }}>WEIRD TRUE COURT CASES</div>
          <div style={{ width: 120, height: 5, background: LP.gold, borderRadius: 3 }} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 150, lineHeight: 1.04, letterSpacing: 2, whiteSpace: "nowrap", color: LP.cream, textShadow: "0 8px 26px rgba(0,0,0,0.65)" }}>
          COURT OF <span style={{ color: LP.gold }}>WEIRD</span>
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: LP.cream, marginTop: 8, whiteSpace: "nowrap", textShadow: "0 4px 14px rgba(0,0,0,0.7)" }}>True cases too strange to believe</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: LP.gold, marginTop: 16, letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 3px 10px rgba(0,0,0,0.7)" }}>New Shorts daily  ·  Full cases Tue &amp; Fri</div>
      </div>
    </AbsoluteFill>
  );
};

export const BrandCompositions: React.FC = () => (
  <>
    <Composition id="LawBrandPfp" component={BrandPfp} durationInFrames={60} fps={30} width={800} height={800} />
    <Composition id="LawBrandBanner" component={BrandBanner} durationInFrames={60} fps={30} width={BANNER.W} height={BANNER.H} />
  </>
);

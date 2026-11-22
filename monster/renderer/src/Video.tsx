import React from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoProps } from "./types";
import { SCENES, Layout, layoutFor } from "./scenes";

// Load the bundled open-licensed font (SIL OFL, see public/fonts/LIBERATION_LICENSE.txt) before the first frame.
const fontHandle = typeof document !== "undefined" ? delayRender("font") : null;
if (typeof document !== "undefined") {
  const faces = [
    new FontFace("MYA", `url(${staticFile("fonts/LiberationSans-Bold.ttf")})`, { weight: "700" }),
    new FontFace("MYA", `url(${staticFile("fonts/LiberationSans-Regular.ttf")})`, { weight: "400" }),
  ];
  Promise.all(faces.map((f) => f.load())).then((loaded) => {
    loaded.forEach((f) => (document as any).fonts.add(f));
    if (fontHandle !== null) continueRender(fontHandle);
  }).catch(() => { if (fontHandle !== null) continueRender(fontHandle); });
}

// A slowly moving background so no frame is ever static: drifting dot grid + a soft accent glow.
const Backdrop: React.FC<{ L: Layout; accent: string; bg: string }> = ({ L, accent, bg }) => {
  const f = useCurrentFrame();
  const dx = (f * 0.6) % 60, dy = (f * 0.35) % 60;
  const gx = L.w * (0.5 + 0.3 * Math.sin(f / 90)), gy = L.h * (0.35 + 0.15 * Math.cos(f / 110));
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${gx}px ${gy}px, ${accent}33 0%, transparent 45%)` }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${accent}22 2px, transparent 2.5px)`,
        backgroundSize: "60px 60px", backgroundPosition: `${dx}px ${dy}px`,
      }} />
    </AbsoluteFill>
  );
};

const SceneFrame: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(f, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(f, [0, dur], [1, 1.035]); // slow push-in: the frame keeps moving while a scene holds
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter, exit), transform: `scale(${drift}) translateY(${(1 - enter) * 40}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = (p) => {
  const { width, height } = useVideoConfig();
  const L = layoutFor(width, height);
  return (
    <AbsoluteFill style={{ fontFamily: "MYA, Arial, sans-serif", color: p.theme.text }}>
      <Backdrop L={L} accent={p.theme.accent} bg={p.theme.bg} />
      {p.scenes.map((s) => {
        const C = SCENES[s.type];
        const dur = Math.max(1, s.end - s.start);
        return (
          <Sequence key={s.id} from={s.start} durationInFrames={dur} name={`${s.id}:${s.type}`}>
            <SceneFrame dur={dur}>{C ? <C p={s.params} theme={p.theme} L={L} dur={dur} /> : null}</SceneFrame>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Thumbnail / cover: the first scene's content held at its settled state, plus the title.
export const Thumbnail: React.FC<VideoProps> = (p) => {
  const L = layoutFor(p.width, p.height);
  const s = p.scenes[0];
  const C = s ? SCENES[s.type] : null;
  return (
    <AbsoluteFill style={{ fontFamily: "MYA, Arial, sans-serif", color: p.theme.text }}>
      <Backdrop L={L} accent={p.theme.accent} bg={p.theme.bg} />
      <Sequence from={-60} durationInFrames={1000}>{C ? <C p={s.params} theme={p.theme} L={L} dur={1000} /> : null}</Sequence>
    </AbsoluteFill>
  );
};

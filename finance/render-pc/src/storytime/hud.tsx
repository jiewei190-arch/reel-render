// storytime captions (LOW-POLY look): 1-4 words at a time in Barlow Condensed Bold, white with NO outline (a faint soft
// shadow only), ~5 % of the frame height, ONE accent word per chunk in yellow-orange, shout lines ALL CAPS. They cut in
// with no pop. The centre line is the film's one caption baseline (compile.ts: ~0.62 H, below every named face and neck).
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import type { Chunk } from "./compile";
import { CAP } from "./compile";

export const CAP_FONT = "StoryCond";
let fontPromise: Promise<void> | null = null;
let capFontReady = false;
/** load Barlow Condensed Bold once (OFL, public/fonts) before the first caption frame renders */
export const useCapFont = () => {
  // (document.fonts.check() is true for a family that was never added, so track the load ourselves)
  const [handle] = React.useState(() => (typeof document !== "undefined" && !capFontReady ? delayRender("storytime caption font") : null));
  React.useEffect(() => {
    if (handle === null) return;
    fontPromise ??= new FontFace(CAP_FONT, `url(${staticFile("fonts/BarlowCondensed-Bold.woff2")}) format("woff2")`, { weight: "700" }).load().then((f) => { document.fonts.add(f); capFontReady = true; });
    fontPromise.then(() => continueRender(handle), () => continueRender(handle));
  }, [handle]);
};

export const StoryCaption: React.FC<{ c: Chunk; y: number; t: number }> = ({ c, y }) => {
  const lh = c.fs * CAP.lineH;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - lh / 2, height: lh, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: `${CAP_FONT}, "Barlow Condensed", "Arial Narrow", sans-serif`, fontWeight: 700, fontSize: c.fs, lineHeight: `${lh}px`, whiteSpace: "nowrap", letterSpacing: "0.005em", textShadow: "0 0 3px #000, 0 0 6px #000, 0 0 9px rgba(0,0,0,0.95), 0 0 13px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.45)" }}>
        {c.words.map((w, i) => (
          <span key={i} style={{ color: w.accent ? CAP.accent : "#ffffff" }}>{w.text}{i < c.words.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};

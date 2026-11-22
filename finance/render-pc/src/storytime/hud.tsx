// storytime captions: 1-3 words at a time, white bold sans (Poppins 800) with a thick black outline, ONE accent word per
// chunk in yellow, shout lines ALL CAPS and bigger with a pop. The centre line is the shot's capY (compile.ts: below every
// named face and neck, framing rule R6). The chunk's font size is text-fit (polish.ts fitFs) to one line.
import React from "react";
import type { Chunk } from "./compile";
import { CAP, capPop } from "./compile";

export const StoryCaption: React.FC<{ c: Chunk; y: number; t: number }> = ({ c, y, t }) => {
  // a hard pop in (no fade), bigger on shouts
  const sc = capPop(t, c.start, c.shout);
  const lh = c.fs * CAP.lineH;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y - lh / 2, height: lh, display: "flex", justifyContent: "center", alignItems: "center", transform: `scale(${sc})`, transformOrigin: `540px ${lh / 2}px` }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: c.fs, lineHeight: `${lh}px`, whiteSpace: "nowrap", letterSpacing: 0, WebkitTextStroke: `${CAP.stroke * 2}px #000`, paintOrder: "stroke fill", textShadow: "0 6px 0 rgba(0,0,0,0.55)" }}>
        {c.words.map((w, i) => (
          <span key={i} style={{ color: w.accent ? CAP.accent : "#ffffff" }}>{w.text}{i < c.words.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};

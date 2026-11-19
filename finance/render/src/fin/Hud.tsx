// The on-screen counter (every shot) and the captions. The counter is a chunky blocky panel high in the frame (top 9-21 %,
// clear of the caption band at 68 % and of the platform's top bar): a small label line + a big number, in the story's
// colour (cash green / debt red / coin gold), popping (scale 1.12 -> 1) when its value changes. Captions: Poppins
// ExtraBold, white with a dark outline and soft shadow, centred at 68 %, 12 % side margins, <= 2 lines, a pop-in on
// every chunk, script.txt casing, and at most one accent word (yellow) where the plan marks one.
import React from "react";
import type { Chunk } from "../engine/core/captions";

export type HudState = { label: string; value: string; color: string; since?: number; sub?: string };

const back = (u: number) => {
  if (u >= 1) return 1;
  if (u <= 0) return 0.6;
  const x = u - 1;
  return 0.6 + 0.4 * (1 + 3.4 * x * x * x + 2.4 * x * x);
};

export const Hud: React.FC<{ state: HudState; t: number; width?: number; height?: number }> = ({ state, t, width = 1080, height = 1920 }) => {
  const k = width / 1080;
  const u = state.since === undefined ? 1 : (t - state.since) / 0.22;
  const s = back(u);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: height * 0.085, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${s})`,
          background: "rgba(16,10,30,0.82)",
          border: `${8 * k}px solid ${state.color}`,
          borderRadius: 34 * k,
          padding: `${14 * k}px ${44 * k}px ${18 * k}px`,
          boxShadow: `0 ${10 * k}px ${0}px rgba(0,0,0,0.35), 0 0 ${40 * k}px ${state.color}66`,
          textAlign: "center",
          minWidth: width * 0.5,
          maxWidth: width * 0.84,
        }}
      >
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 40 * k, color: "#fff4c8", letterSpacing: 2 * k, lineHeight: 1.1 }}>{state.label}</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 104 * k, color: state.color, lineHeight: 1.04, WebkitTextStroke: `${3 * k}px rgba(0,0,0,0.25)`, whiteSpace: "nowrap" }}>{state.value}</div>
        {state.sub ? <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34 * k, color: "#ffffffcc", lineHeight: 1.1 }}>{state.sub}</div> : null}
      </div>
    </div>
  );
};

const POP = 0.17;
const popScale = (u: number) => {
  if (u >= 1) return 1;
  if (u <= 0) return 0.5;
  const x = u - 1;
  const kk = 2.4;
  return 0.5 + 0.5 * (1 + (kk + 1) * x * x * x + kk * x * x);
};
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");

export const FinCaptions: React.FC<{ chunks: (Chunk & { accent: string[] })[]; t: number; until: number; width?: number; height?: number }> = ({ chunks, t, until, width = 1080, height = 1920 }) => {
  const c = chunks.find((x) => t >= x.a && t < x.b);
  if (!c || t > until) return null;
  const k = width / 1080;
  const u = (t - c.a) / POP;
  const acc = new Set(c.accent.map(norm));
  let used = false;
  const words = c.words.join(" ").split(" ");
  return (
    <div style={{ position: "absolute", left: width * 0.12, right: width * 0.12, top: height * 0.68 - 130 * k, height: 260 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${popScale(u)})`,
          opacity: Math.min(1, Math.max(0, u * 3)),
          textAlign: "center",
          fontFamily: "Poppins",
          fontWeight: 800,
          fontSize: 100 * k,
          lineHeight: 1.06,
          color: "#ffffff",
          WebkitTextStroke: `${7 * k}px #140c1c`,
          paintOrder: "stroke fill",
          textShadow: `0 ${6 * k}px ${18 * k}px rgba(8,4,16,0.6), 0 0 ${4 * k}px rgba(8,4,16,0.5)`,
          maxWidth: width * 0.76,
        }}
      >
        {words.map((w, i) => {
          const hit = !used && acc.has(norm(w));
          if (hit) used = true;
          return (
            <span key={i} style={{ color: hit ? "#ffd23a" : "#ffffff" }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

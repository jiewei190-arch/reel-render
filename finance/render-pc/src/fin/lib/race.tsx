// The RACE / ticking-stake overlay (finance/FORMAT_V1.md day-1 watch-time data: the S2 split-screen race held 85 % of
// the Short; list-like middles sag). Two bars race (or one counter ticks) from `from` to the twist, and the leader can
// FLIP at `flip`: the viewer keeps watching to see who wins. Sits above the bottom 420 px safe zone, clear of the
// captions band. Pure function of t.
import React from "react";
import { EASE_INOUT, prog } from "./motion";

export type RaceLane = { label: string; color: string; from: number; to: number; prefix?: string; suffix?: string; /** "linear" | "late" (slow then fast: compound growth) */ curve?: "linear" | "late" };
export type RaceSpec = { lanes: RaceLane[]; from: number; until: number; resolve: number; title?: string };
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const val = (l: RaceLane, u: number) => l.from + (l.to - l.from) * (l.curve === "late" ? Math.pow(u, 2.6) : u);
export const RaceOverlay: React.FC<{ r: RaceSpec; t: number }> = ({ r, t }) => {
  if (t < r.from || t >= r.until) return null;
  const u = EASE_INOUT(prog(t, r.from, r.resolve));
  const vals = r.lanes.map((l) => val(l, u));
  const max = Math.max(...r.lanes.map((l) => Math.max(l.from, l.to)), 1);
  const lead = vals.indexOf(Math.max(...vals));
  const done = t >= r.resolve;
  const appear = prog(t, r.from, r.from + 0.2);
  return (
    <div style={{ position: "absolute", left: 70, right: 180, top: 1300, opacity: appear, fontFamily: "Poppins", fontWeight: 800 }}>
      {r.title ? <div style={{ color: "#fff", fontSize: 38, WebkitTextStroke: "5px #140c1c", paintOrder: "stroke fill", marginBottom: 8 }}>{r.title}</div> : null}
      {r.lanes.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div style={{ width: 170, color: "#fff", fontSize: 34, WebkitTextStroke: "5px #140c1c", paintOrder: "stroke fill" }}>{l.label}</div>
          <div style={{ flex: 1, height: 46, background: "rgba(20,12,28,0.55)", borderRadius: 12, overflow: "hidden", border: i === lead ? "4px solid #ffd23a" : "4px solid transparent" }}>
            <div style={{ width: `${(100 * vals[i]) / max}%`, height: "100%", background: l.color, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10, boxSizing: "border-box" }}>
              <span style={{ color: "#fff", fontSize: 30, WebkitTextStroke: "4px #140c1c", paintOrder: "stroke fill", whiteSpace: "nowrap" }}>{`${l.prefix ?? ""}${fmt(vals[i])}${l.suffix ?? ""}`}</span>
            </div>
          </div>
          <div style={{ width: 60, textAlign: "center", fontSize: 40 }}>{done && i === lead ? <span style={{ color: "#ffd23a", fontSize: 30, WebkitTextStroke: "4px #140c1c", paintOrder: "stroke fill" }}>WIN</span> : ""}</div>
        </div>
      ))}
    </div>
  );
};

// Model sheet: every character in a few expressions and poses (for checking designs and new episodes).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, CharState } from "../characters/Character";
import { Expr, Pose, POSES } from "../characters/parts";
import { W, Who } from "../theme";

const base: CharState = { expr: "neutral", arms: POSES.idle, talk: 0, look: 0, blink: 0, prop: "none", thumb: false, siren: 1 };
const rows: Array<{ who: Who; cells: Array<[Expr, Pose, number, CharState["prop"]]> }> = [
  { who: "anxiety", cells: [["panic", "armsUp", 0.6, "none"], ["shock", "point", 0, "none"], ["relieved", "idle", 0, "none"], ["panic", "coverEyes", 0, "megaphone"]] },
  { who: "logic", cells: [["tired", "sip", 0, "mug"], ["annoyed", "facepalm", 0, "none"], ["determined", "stop", 0.5, "none"], ["shock", "dive", 0.8, "none"]] },
  { who: "confidence", cells: [["smug", "thumbsUp", 0, "none"], ["happy", "holdUp", 0.4, "router"], ["blank", "shrug", 0, "none"], ["determined", "windup", 0, "phone"]] },
];
export const ModelSheet: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#f6efe4" }}>
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
      {rows.map((r, i) =>
        r.cells.map(([expr, pose, talk, prop], j) => (
          <g key={`${i}-${j}`} transform={`translate(${135 + j * 270} ${560 + i * 620}) scale(0.62)`}>
            <Character who={r.who} s={{ ...base, expr, arms: POSES[pose], talk, prop, thumb: pose === "thumbsUp", tag: r.who === "confidence" && j === 2 ? "GERALD" : undefined }} />
          </g>
        )),
      )}
    </svg>
  </AbsoluteFill>
);

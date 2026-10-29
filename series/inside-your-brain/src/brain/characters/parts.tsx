// Shared drawing parts for the Inside Your Brain cast: eyes, brows, mouths, arms, hands and props.
// Every character is drawn in its own SVG group with the origin at the feet; up is negative y.
import React from "react";
import { INK, LINE } from "../theme";

export type Expr =
  | "neutral" | "panic" | "tired" | "smug" | "shock" | "relieved"
  | "blank" | "happy" | "determined" | "annoyed";

export type Pose =
  | "idle" | "armsUp" | "point" | "pointLeft" | "facepalm" | "thumbsUp" | "windup"
  | "holdUp" | "grab" | "coverEyes" | "shrug" | "reach" | "sip" | "stop" | "dive";

export type Prop = "none" | "mug" | "phone" | "router" | "megaphone";

// Arm angles in degrees: [upper L, lower L, upper R, lower R]. 0 = hanging down,
// positive = swung outward/up (each side mirrored), lower is relative to upper.
export const POSES: Record<Pose, [number, number, number, number]> = {
  idle: [14, 10, 14, 10],
  armsUp: [165, 10, 165, 10],
  point: [14, 10, 128, -8],
  pointLeft: [128, -8, 14, 10],
  facepalm: [14, 10, 150, 128],
  thumbsUp: [14, 10, 58, 98],
  windup: [14, 10, 205, 40],
  holdUp: [158, -38, 158, -38],
  grab: [14, 10, 88, -6],
  coverEyes: [150, 132, 150, 132],
  shrug: [62, -96, 62, -96],
  reach: [14, 10, 62, -28],
  sip: [14, 10, 34, 128],
  stop: [14, 10, 96, -84],
  dive: [118, 0, 118, 0],
};

export type Face = {
  open: number; // eye openness, 1 = normal
  pupil: number; // pupil size, 1 = normal
  happyEyes: boolean; // closed ^ ^ arcs
  brow: number; // raise in px (negative = down)
  browTilt: number; // + = worried (inner ends up), - = angry
  mouth: "smile" | "frown" | "flat" | "grin" | "o" | "wobble";
};

export const FACES: Record<Expr, Face> = {
  neutral: { open: 0.9, pupil: 1, happyEyes: false, brow: 0, browTilt: 0, mouth: "flat" },
  panic: { open: 1.18, pupil: 0.45, happyEyes: false, brow: 26, browTilt: 22, mouth: "o" },
  tired: { open: 0.42, pupil: 0.9, happyEyes: false, brow: -6, browTilt: 4, mouth: "flat" },
  smug: { open: 0.55, pupil: 1, happyEyes: false, brow: 10, browTilt: -8, mouth: "grin" },
  shock: { open: 1.25, pupil: 0.3, happyEyes: false, brow: 34, browTilt: 8, mouth: "o" },
  relieved: { open: 0.1, pupil: 1, happyEyes: true, brow: 8, browTilt: 14, mouth: "smile" },
  blank: { open: 1, pupil: 0.28, happyEyes: false, brow: 0, browTilt: 0, mouth: "flat" },
  happy: { open: 0.9, pupil: 1, happyEyes: true, brow: 12, browTilt: 0, mouth: "grin" },
  determined: { open: 0.8, pupil: 0.9, happyEyes: false, brow: -10, browTilt: -22, mouth: "flat" },
  annoyed: { open: 0.5, pupil: 0.9, happyEyes: false, brow: -8, browTilt: -12, mouth: "frown" },
};

const o = { stroke: INK, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const Eye: React.FC<{ x: number; y: number; r: number; face: Face; look: number; blink: number; skin: string }> = ({ x, y, r, face, look, blink, skin }) => {
  const open = Math.max(0.06, face.open * (1 - blink));
  if (face.happyEyes) {
    return <path d={`M ${x - r * 0.75} ${y + 6} Q ${x} ${y - r * 0.8} ${x + r * 0.75} ${y + 6}`} fill="none" {...o} strokeWidth={LINE + 2} />;
  }
  const ry = r * Math.min(open, 1.25);
  const p = r * 0.42 * face.pupil;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={ry} fill="#fff" {...o} />
      <clipPath id={`eye-${x}-${y}`}>
        <ellipse cx={x} cy={y} rx={r - 3} ry={Math.max(ry - 3, 1)} />
      </clipPath>
      <g clipPath={`url(#eye-${x}-${y})`}>
        <circle cx={x + look * r * 0.38} cy={y + 4} r={p} fill={INK} />
        <circle cx={x + look * r * 0.38 - p * 0.35} cy={y - p * 0.3} r={p * 0.3} fill="#fff" />
      </g>
      {open < 0.7 && (
        // heavy lid for tired/smug looks
        <path d={`M ${x - r - 2} ${y - ry + 2} Q ${x} ${y - ry - 8} ${x + r + 2} ${y - ry + 2}`} fill={skin} {...o} />
      )}
    </g>
  );
};

export const Brows: React.FC<{ y: number; dx: number; len: number; face: Face; thick?: number }> = ({ y, dx, len, face, thick = 12 }) => {
  const by = y - face.brow;
  const t = face.browTilt;
  return (
    <g>
      <line x1={-dx - len / 2} y1={by + t * 0.3} x2={-dx + len / 2} y2={by - t * 0.7} stroke={INK} strokeWidth={thick} strokeLinecap="round" />
      <line x1={dx - len / 2} y1={by - t * 0.7} x2={dx + len / 2} y2={by + t * 0.3} stroke={INK} strokeWidth={thick} strokeLinecap="round" />
    </g>
  );
};

// talk: 0..1 from the dialogue envelope. Closed shape comes from the expression.
export const Mouth: React.FC<{ y: number; w: number; face: Face; talk: number; teeth?: boolean }> = ({ y, w, face, talk, teeth }) => {
  const h = 10 + talk * w * 0.55;
  if (talk > 0.08 || face.mouth === "o") {
    const ow = face.mouth === "o" ? w * 0.42 + talk * 10 : w * (0.62 + talk * 0.12);
    const oh = face.mouth === "o" ? Math.max(h, w * 0.38) : h;
    return (
      <g>
        <ellipse cx={0} cy={y + oh * 0.15} rx={ow / 2} ry={oh / 2} fill="#5a1630" {...o} />
        <ellipse cx={0} cy={y + oh * 0.42} rx={ow * 0.26} ry={oh * 0.16} fill="#ff7a90" />
        {teeth && <rect x={-ow * 0.3} y={y - oh * 0.35} width={ow * 0.6} height={Math.min(14, oh * 0.25)} rx={4} fill="#fff" />}
      </g>
    );
  }
  switch (face.mouth) {
    case "smile":
      return <path d={`M ${-w / 2} ${y - 6} Q 0 ${y + w * 0.32} ${w / 2} ${y - 6}`} fill="none" {...o} strokeWidth={LINE + 1} />;
    case "frown":
      return <path d={`M ${-w / 2.4} ${y + 10} Q 0 ${y - w * 0.22} ${w / 2.4} ${y + 10}`} fill="none" {...o} strokeWidth={LINE + 1} />;
    case "grin":
      return (
        <g>
          <path d={`M ${-w / 2} ${y - 10} Q 0 ${y + w * 0.5} ${w / 2} ${y - 10} Z`} fill="#5a1630" {...o} />
          <path d={`M ${-w / 2 + 8} ${y - 6} Q 0 ${y + 4} ${w / 2 - 8} ${y - 6} L ${w / 2 - 14} ${y - 8} Q 0 ${y - 2} ${-w / 2 + 14} ${y - 8} Z`} fill="#fff" />
        </g>
      );
    case "wobble":
      return <path d={`M ${-w / 2} ${y} q ${w / 8} -10 ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0 t ${w / 4} 0`} fill="none" {...o} />;
    default:
      return <line x1={-w / 2.6} y1={y} x2={w / 2.6} y2={y} {...o} strokeWidth={LINE + 1} />;
  }
};

export const Hand: React.FC<{ r?: number; skin: string; thumb?: boolean }> = ({ r = 28, skin, thumb }) => (
  <g>
    <circle cx={0} cy={0} r={r} fill={skin} {...o} />
    {thumb && <rect x={-9} y={-r - 26} width={18} height={34} rx={9} fill={skin} {...o} />}
  </g>
);

export const PropItem: React.FC<{ prop: Prop }> = ({ prop }) => {
  switch (prop) {
    case "mug":
      return (
        <g transform="translate(18 -10)">
          <rect x={-26} y={-34} width={52} height={60} rx={8} fill="#fff" {...o} />
          <path d="M 26 -18 q 22 0 22 16 q 0 16 -22 16" fill="none" {...o} />
          <text x={0} y={6} fontSize={18} fontWeight={900} textAnchor="middle" fill={INK} fontFamily="Arial Black, Arial">☕</text>
          <path d="M -10 -46 q 6 -10 0 -20 M 8 -46 q 6 -10 0 -20" fill="none" stroke="#9aa" strokeWidth={4} strokeLinecap="round" />
        </g>
      );
    case "phone":
      return (
        <g transform="translate(6 -30) rotate(-12)">
          <rect x={-28} y={-50} width={56} height={100} rx={10} fill="#222" {...o} />
          <rect x={-20} y={-40} width={40} height={74} rx={4} fill="#ffd6e0" />
          <path d="M 0 6 l -10 -10 a 6 6 0 0 1 10 -6 a 6 6 0 0 1 10 6 z" fill="#ff3b5c" />
        </g>
      );
    case "router":
      return (
        <g transform="translate(0 -40)">
          <line x1={-50} y1={-40} x2={-62} y2={-110} {...o} />
          <line x1={50} y1={-40} x2={62} y2={-110} {...o} />
          <rect x={-100} y={-50} width={200} height={70} rx={14} fill="#3b3f5c" {...o} />
          {[-60, -30, 0, 30, 60].map((x) => <circle key={x} cx={x} cy={-30} r={6} fill="#5cff9d" />)}
          <text x={0} y={8} fontSize={22} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Arial Black, Arial">THE INTERNET</text>
        </g>
      );
    case "megaphone":
      return (
        <g transform="translate(10 -6) rotate(-20)">
          <path d="M 0 -18 L 70 -48 L 70 48 L 0 18 Z" fill="#ff4d6d" {...o} />
          <rect x={-22} y={-20} width={26} height={40} rx={6} fill="#fff" {...o} />
        </g>
      );
    default:
      return null;
  }
};

// One arm: shoulder at (0,0) of its group; mirror the group for the right arm.
export const Arm: React.FC<{ upper: number; lower: number; len?: number; color: string; skin: string; thumb?: boolean; prop?: Prop; width?: number; mirrored?: boolean }> = ({
  upper, lower, len = 130, color, skin, thumb, prop = "none", width = 30, mirrored = false,
}) => (
  <g transform={`rotate(${upper})`}>
    <line x1={0} y1={0} x2={0} y2={len} stroke={INK} strokeWidth={width + LINE * 2} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={len} stroke={color} strokeWidth={width} strokeLinecap="round" />
    <g transform={`translate(0 ${len}) rotate(${lower})`}>
      <line x1={0} y1={0} x2={0} y2={len * 0.9} stroke={INK} strokeWidth={width + LINE * 2} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={len * 0.9} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <g transform={`translate(0 ${len * 0.9 + 10}) rotate(${-upper - lower})`}>
        <Hand skin={skin} thumb={thumb} />
        <g transform={mirrored ? "scale(-1 1)" : undefined}>
          <PropItem prop={prop} />
        </g>
      </g>
    </g>
  </g>
);

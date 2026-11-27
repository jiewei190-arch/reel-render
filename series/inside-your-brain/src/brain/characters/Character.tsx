// The Inside Your Brain cast. Pure drawing: give it a state, get a character.
// Origin = feet centre; the characters are ~640 px tall at scale 1.
import React from "react";
import { CAST, INK, LINE, Who } from "../theme";
import { Arm, Brows, Eye, Expr, FACES, Mouth, Prop } from "./parts";

export type CharState = {
  expr: Expr;
  arms: [number, number, number, number];
  talk: number; // 0..1 mouth openness from the voice track
  look: number; // -1 (left) .. 1 (right)
  blink: number; // 0..1
  prop: Prop;
  thumb: boolean;
  siren: number; // Anxiety's helmet light, 0..1
  tag?: string; // a name sticker on the chest (e.g. "GERALD")
};

const o = { stroke: INK, strokeWidth: LINE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const NameTag: React.FC<{ text: string; y: number }> = ({ text, y }) => (
  <g transform={`translate(0 ${y}) rotate(-6)`}>
    <rect x={-95} y={-52} width={190} height={104} rx={12} fill="#fff" {...o} />
    <rect x={-95} y={-52} width={190} height={34} rx={12} fill="#e23d4f" {...o} />
    <text x={0} y={-28} fontSize={18} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Arial Black, Arial">HELLO my name is</text>
    <text x={0} y={30} fontSize={40} textAnchor="middle" fill={INK} fontFamily="'Comic Sans MS', 'Comic Neue', cursive" fontWeight={700}>{text}</text>
  </g>
);

const Anxiety: React.FC<{ s: CharState }> = ({ s }) => {
  const c = CAST.anxiety; const f = FACES[s.expr];
  const [ul, ll, ur, lr] = s.arms;
  return (
    <g>
      <g transform="translate(-140 -250) scale(1 1)"><Arm upper={ul} lower={ll} color={c.body} skin={c.body} prop="none" width={28} /></g>
      <path d="M -150 0 C -175 -240 -195 -510 0 -555 C 195 -510 175 -240 150 0 Z" fill={c.body} {...o} />
      <path d="M -120 -40 C -140 -200 -150 -380 -110 -460" fill="none" stroke={c.shade} strokeWidth={14} strokeLinecap="round" opacity={0.5} />
      {/* frazzled hair */}
      <path d="M -110 -520 l 20 -70 l 25 50 l 25 -80 l 25 70 l 30 -85 l 20 80 l 30 -60 l 10 70 Z" fill={c.shade} {...o} />
      {/* commander cap with siren */}
      <path d="M -120 -515 Q 0 -585 120 -515 L 125 -490 Q 0 -540 -125 -490 Z" fill="#2b3a67" {...o} />
      <path d="M 70 -505 q 70 6 95 30 q -55 -4 -100 -12 z" fill="#2b3a67" {...o} />
      <circle cx={0} cy={-585} r={70 * s.siren + 8} fill="#ff2d48" opacity={0.35 * s.siren} />
      <path d="M -26 -560 Q -26 -610 0 -612 Q 26 -610 26 -560 Z" fill={s.siren > 0.5 ? "#ff2d48" : "#c4142c"} {...o} />
      <rect x={-34} y={-566} width={68} height={14} rx={5} fill="#c9cdd8" {...o} />
      <Eye x={-62} y={-395} r={56} face={f} look={s.look} blink={s.blink} skin={c.body} />
      <Eye x={62} y={-395} r={56} face={f} look={s.look} blink={s.blink} skin={c.body} />
      <Brows y={-472} dx={62} len={70} face={f} />
      {s.expr === "panic" && <path d="M 125 -470 q 14 30 0 44 q -14 -14 0 -44" fill="#8fd3ff" {...o} strokeWidth={4} />}
      <g transform="translate(0 -285)"><Mouth y={0} w={84} face={f} talk={s.talk} teeth /></g>
      <g transform="translate(140 -250) scale(-1 1)"><Arm upper={ur} lower={lr} color={c.body} skin={c.body} prop={s.prop} thumb={s.thumb} width={28} mirrored /></g>
    </g>
  );
};

const Logic: React.FC<{ s: CharState }> = ({ s }) => {
  const c = CAST.logic; const f = FACES[s.expr];
  const [ul, ll, ur, lr] = s.arms;
  return (
    <g>
      <g transform="translate(-132 -300)"><Arm upper={ul} lower={ll} color={c.body} skin={c.body} width={30} /></g>
      <rect x={-140} y={-610} width={280} height={620} rx={90} fill={c.body} {...o} />
      {/* shirt collar + loose tie */}
      <path d="M -70 -300 L 0 -250 L 70 -300 L 60 -330 L 0 -290 L -60 -330 Z" fill="#fff" {...o} />
      <path d="M -16 -268 L 16 -268 L 26 -150 L 4 -110 L -20 -150 Z" fill={c.accent} {...o} transform="rotate(8 0 -268)" />
      {/* tired hair: flat with one stray strand */}
      <path d="M -110 -560 Q 0 -640 110 -560 Q 60 -590 0 -585 Q -60 -590 -110 -560 Z" fill="#5b4a3a" {...o} />
      <path d="M 10 -600 q 20 -50 50 -40" fill="none" stroke="#5b4a3a" strokeWidth={8} strokeLinecap="round" />
      {/* eye bags */}
      <path d="M -100 -380 q 40 18 80 0 M 20 -380 q 40 18 80 0" fill="none" stroke={c.shade} strokeWidth={6} strokeLinecap="round" />
      <Eye x={-58} y={-430} r={44} face={f} look={s.look} blink={s.blink} skin={c.body} />
      <Eye x={58} y={-430} r={44} face={f} look={s.look} blink={s.blink} skin={c.body} />
      {/* glasses */}
      <rect x={-112} y={-470} width={104} height={78} rx={14} fill="none" {...o} strokeWidth={8} />
      <rect x={8} y={-470} width={104} height={78} rx={14} fill="none" {...o} strokeWidth={8} />
      <line x1={-8} y1={-440} x2={8} y2={-440} {...o} strokeWidth={8} />
      <Brows y={-500} dx={58} len={64} face={f} thick={11} />
      <g transform="translate(0 -335)"><Mouth y={0} w={72} face={f} talk={s.talk} /></g>
      <g transform="translate(132 -300) scale(-1 1)"><Arm upper={ur} lower={lr} color={c.body} skin={c.body} prop={s.prop} thumb={s.thumb} width={30} mirrored /></g>
    </g>
  );
};

const Confidence: React.FC<{ s: CharState }> = ({ s }) => {
  const c = CAST.confidence; const f = FACES[s.expr];
  const [ul, ll, ur, lr] = s.arms;
  return (
    <g>
      <g transform="translate(-188 -390)"><Arm upper={ul} lower={ll} color={c.body} skin={c.body} width={38} len={140} /></g>
      <path d="M -205 -395 C -215 -585 215 -585 205 -395 L 125 0 L -125 0 Z" fill={c.body} {...o} />
      <path d="M -150 -380 L -95 -60" stroke={c.shade} strokeWidth={14} strokeLinecap="round" opacity={0.45} />
      {/* pompadour */}
      <path d="M -130 -520 C -170 -640 40 -700 150 -600 C 120 -615 80 -610 60 -600 C 130 -580 120 -545 110 -525 Q 0 -560 -130 -520 Z" fill="#6b3d1f" {...o} />
      {/* sunglasses pushed up */}
      <g transform="translate(0 -560)">
        <path d="M -105 -12 h 90 q 0 38 -45 38 q -45 0 -45 -38 Z M 15 -12 h 90 q 0 38 -45 38 q -45 0 -45 -38 Z" fill="#1a1a2a" {...o} strokeWidth={5} />
        <line x1={-15} y1={-8} x2={15} y2={-8} stroke={INK} strokeWidth={6} />
      </g>
      <Eye x={-60} y={-460} r={42} face={f} look={s.look} blink={s.blink} skin={c.body} />
      <Eye x={60} y={-460} r={42} face={f} look={s.look} blink={s.blink} skin={c.body} />
      <Brows y={-520} dx={60} len={66} face={f} />
      <g transform="translate(0 -370)"><Mouth y={0} w={120} face={f} talk={s.talk} teeth /></g>
      <path d="M -8 -300 q 8 10 16 0" fill="none" {...o} strokeWidth={5} />
      {s.tag && <NameTag text={s.tag} y={-200} />}
      <g transform="translate(188 -390) scale(-1 1)"><Arm upper={ur} lower={lr} color={c.body} skin={c.body} prop={s.prop} thumb={s.thumb} width={38} len={140} mirrored /></g>
    </g>
  );
};

export const Character: React.FC<{ who: Who; s: CharState }> = ({ who, s }) => {
  if (who === "anxiety") return <Anxiety s={s} />;
  if (who === "logic") return <Logic s={s} />;
  return <Confidence s={s} />;
};

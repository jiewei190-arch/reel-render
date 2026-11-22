// cyber3d recipe schema ("kit": "cyber3d" in finance/shorts/<slug>/recipe.json). Shots anchor to words of the
// voice-over exactly like tech3d / Block Money (the `At` and `Place` syntax is the same). Guide: KIT_CYBER3D.md.
import type { V3 } from "../blocky/motion";
import type { At, Place } from "../fin/recipe/types";
import type { ChapterSpec } from "../longform/kit";
import type { BoltFace, BoltPose } from "../tech/bolt";
import type { FigurePose } from "./figure";
import type { CyberHeroKind } from "./hero";
import type { CyberSetId } from "./sets";

export type { At, Place };
export type CyberCamId = "hookZoom" | "slamZoom" | "whip" | "pushIn" | "orbit" | "closeUp" | "medium" | "wide" | "flyThrough" | "explodeOrbit" | "drift" | "crane";
/** "bolt" | "bolt.face" | "<prop>" | "<prop>.<part>" | "<figure>.head" | an anchor ("latvia", "phish:0,0.4,0") | [x, y, z] */
export type CyberTarget = string | V3;

export type CyberCam = {
  preset: CyberCamId;
  target?: CyberTarget;
  hit?: At;
  az?: number;
  dist?: number;
  h?: number;
  fov?: number;
  face?: number;
  roll?: [number, number];
  blur?: number;
  sweep?: number;
  endDist?: number;
  dur?: number;
  /** flyThrough / crane: travel toward this place instead of along the view axis */
  to?: Place;
};

/** BOLT, optional narrator side-character (re-lit for the dark sets) */
export type BoltSpec = {
  id: string;
  pose: BoltPose;
  at: Place;
  face?: BoltFace;
  then?: { at: At; pose?: BoltPose; face?: BoltFace }[];
  from?: At;
  to?: Place;
  look?: number | CyberTarget;
  pointAt?: CyberTarget;
  scale?: number;
  hover?: number;
  talk?: boolean;
};

export type CyberKit =
  /** the generic hooded figure (no face): `pose` type | idle | lean | turn | flee */
  | "figure"
  /** network routes: glowing packets flying along arcs from `from` to each of `to` (city anchors on the netmap) */
  | "route"
  /** an email tile (`text` = subject line) that can glow red as the phish */
  | "email"
  /** a red-string link between two evidence-board pins (`from`, `to` anchors) */
  | "string"
  /** a plain neon box */
  | "block"
  /** expanding pulse rings */
  | "signal"
  /** the HERO PROPS (src/cyber/hero.tsx): phone, laptop, envelope, card, usb, server, atm, padlock, coin, doc */
  | CyberHeroKind;
export type CyberMotion = "turntable" | "bob" | "popIn" | "dropIn" | "path" | "slideOut";
export type CyberProp = {
  id: string;
  /** a cutaway object (src/cyber/objects.ts: "vault", "rack") ... */
  obj?: string;
  /** ... or a kit piece */
  kit?: CyberKit;
  at: Place;
  yaw?: number;
  pitch?: number;
  roll?: number;
  s?: number;
  /** the same as `s` (hero props use "scale"); 1 = hero scale */
  scale?: number;
  /** hero props: the short generic text on the prop (<= 14 characters, <= 2 words, never a real brand); doc: the headline */
  label?: string;
  /** phone / laptop / atm / doc: the body lines (real text, up to 7) */
  lines?: string[];
  color?: string;
  size?: V3;
  motion?: CyberMotion;
  hit?: At;
  spin?: number;
  path?: [At, Place][];
  /** figure */
  pose?: FigurePose;
  then?: { at: At; pose: FigurePose }[];
  /** route: the start city and the destinations; packets launch from `hit` (default the shot start) */
  from?: string;
  to?: string[];
  /** email: subject text; phish: true glows red (from `hit`) */
  text?: string;
  phish?: boolean;
};

export type CyberAction =
  | { do: "explode" | "assemble"; on: string; at: At; dur?: number; amount?: number; stagger?: number; parts?: string[] }
  | { do: "slice" | "unslice"; on: string; at: At; dur?: number; axis?: "x" | "y" | "z"; keep?: "neg" | "pos"; stop?: number }
  | { do: "highlight"; on: string; at: At; until?: At }
  | { do: "label"; on: string; at: At; until?: At; text?: string; side?: "left" | "right" | "auto"; tone?: "cyan" | "red" };

export type CyberBoard = {
  title: string;
  at: At;
  until?: At;
  count?: { from: number; to: number; dur?: number; decimals?: number; prefix?: string; suffix?: string };
  value?: string;
  pos?: "left" | "right" | "top";
  tone?: "cyan" | "magenta" | "red";
  /** "giant": the stake board, centred and most of the frame wide (a frame-0 opener: "at": 0 shows it fully on) */
  size?: "giant";
};

/** story devices (DOM overlay, laid out from src/cyber/layout.ts) */
export type CaseFile = { at: At; until?: At; name: string; year: string; amount: string; title?: string; status?: string };
export type MoneyCounter = { at: At; until?: At; label?: string; from: number; to: number; dur?: number; prefix?: string; suffix?: string; decimals?: number };
export type Checklist = { at: At; until?: At; title?: string; items: string[]; /** when each item ticks (default: every 0.6 s) */ ticks?: At[] };
export type Countdown = { at: At; until?: At; label?: string; from: number; /** seconds per real second (default 1; 3600 = an hour a second) */ rate?: number };
export type Alert = { at: At; text?: string; dur?: number };

export type CyberFx = "shake" | "sparks" | { fx: "shake" | "sparks"; at?: At; p?: CyberTarget; gain?: number };

export type CyberShot = {
  at: At;
  set?: CyberSetId;
  cam: CyberCam;
  actors?: BoltSpec[];
  props?: CyberProp[];
  actions?: CyberAction[];
  boards?: CyberBoard[];
  fx?: CyberFx[];
  caption?: "auto" | "off" | string;
  /** transitions: glitch (default: a short, subtle RGB-split + slice jitter), punch, whip, cut */
  in?: "glitch" | "punch" | "cut" | "whip";
  sfx?: { at: At; sfx: string; db?: number }[];
  /** long-form: marks a new story beat for the pacing gate (chapters and set changes count by themselves) */
  beat?: boolean;
  /** framing QA (KIT guide "Framing rules"): the person this shot is about when the camera aims at an object */
  subject?: string;
  note?: string;
};

export type CyberRecipe = {
  kit: "cyber3d";
  slug: string;
  /** "short" (30-55 s, default) | "long" (5-8 min) | "landscape" (LONG-FORM 1920x1080, LONGFORM.md: 8-12 min) */
  format?: "short" | "long" | "landscape";
  /** the frame, independent of length: "portrait" (default) | "landscape" (an alias of "format": "landscape") */
  frame?: "portrait" | "landscape";
  /** landscape only: YouTube chapters, each starting on a word (a title card plays at each) */
  chapters?: ChapterSpec[];
  hook: { text: string; until?: At; again?: At };
  duration?: number;
  music?: string;
  sfx0?: string;
  /** optional: BOLT as a narrator side-character ({ "bolt": "BOLT" }) */
  cast?: Record<string, "BOLT">;
  talk?: "auto" | "none";
  props?: (CyberProp & { from?: At; until?: At; sets?: CyberSetId[] })[];
  /** story devices across the whole Short */
  caseFile?: CaseFile[];
  money?: MoneyCounter[];
  checklist?: Checklist;
  countdown?: Countdown[];
  alerts?: Alert[];
  shots: CyberShot[];
  captions?: "auto" | "off";
};

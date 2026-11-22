// tech3d recipe schema ("kit": "tech3d" in finance/shorts/<slug>/recipe.json). Shots anchor to words of the voice-over,
// exactly like the Block Money recipes (src/fin/recipe/types.ts): the `At` and `Place` syntax is the same.
// Full writer's guide: finance/render-pc/KIT_TECH3D.md.
import type { V3 } from "../blocky/motion";
import type { At, Place } from "../fin/recipe/types";
import type { BoltFace, BoltPose } from "./bolt";
import type { TechSetId } from "./sets";

export type { At, Place };
export type TechCamId = "hookZoom" | "slamZoom" | "whip" | "pushIn" | "orbit" | "closeUp" | "medium" | "wide" | "flyThrough" | "explodeOrbit";
/** a camera / action target: "bolt" | "bolt.face" | "<prop>" | "<prop>.<part>" | an anchor ("touchdown", "gs:0,2,0") | [x, y, z] */
export type TechTarget = string | V3;

export type TechCam = {
  preset: TechCamId;
  target?: TechTarget;
  /** slamZoom / whip landing time; default the shot start + 0.12 s */
  hit?: At;
  az?: number; // deg, 0 = from +z
  dist?: number;
  h?: number;
  fov?: number;
  face?: number;
  roll?: [number, number];
  blur?: number;
  /** orbit / explodeOrbit sweep in degrees (default orbit 44, explodeOrbit 80) */
  sweep?: number;
  /** flyThrough: the end distance (default 0.9 m) and the time the move takes (default the whole shot) */
  endDist?: number;
  dur?: number;
};

export type BoltSpec = {
  id: string; // a key of recipe.cast
  pose: BoltPose;
  /** the floor point under BOLT (it hovers HOVER m above it), or an anchor; for the sky set use a point in the air */
  at: Place;
  face?: BoltFace;
  /** later pose / face changes (a face change hides behind a blink) */
  then?: { at: At; pose?: BoltPose; face?: BoltFace }[];
  from?: At;
  /** glide to a place over the shot (BOLT hovers; it never walks) */
  to?: Place;
  /** turn toward (yaw deg, 0 = the lens side) or a target */
  look?: number | TechTarget;
  /** the point pose aims the right arm at this target (default: the shot's camera target) */
  pointAt?: TechTarget;
  scale?: number;
  /** hover height above `at` (m, default 1.05) */
  hover?: number;
  /** lip-sync the screen mouth to the voice in this shot (default: recipe.talk "auto" = when the camera is on BOLT) */
  talk?: boolean;
};

export type TechKit = "locBeam" | "gsBeam" | "signal" | "block";
export type TechMotion = "turntable" | "bob" | "popIn" | "dropIn" | "path";
export type TechProp = {
  id: string;
  /** a cutaway object: "airplane" | "smartphone" | "ship" (src/tech/objects.ts) ... */
  obj?: string;
  /** ... or a kit piece: radio beams ("locBeam", "gsBeam"), a "signal" pulse ring, a plain "block" */
  kit?: TechKit;
  at: Place;
  yaw?: number; // deg
  pitch?: number;
  roll?: number;
  s?: number;
  color?: string;
  size?: V3;
  motion?: TechMotion;
  /** motion key time (popIn / dropIn landing); default the shot start */
  hit?: At;
  /** turntable speed (deg/s, default 12) */
  spin?: number;
  /** path: keyframes [time, place]; the prop moves linearly between them (constant speed per leg) and pitches along
   *  the path (a plane on the glideslope). Before the first key it holds the first place; after the last, the last. */
  path?: [At, Place][];
  /** gsBeam: the slope in degrees (default 3, the standard ILS glide path) */
  deg?: number;
};

export type TechAction =
  | { do: "explode" | "assemble"; on: string; at: At; dur?: number; amount?: number; stagger?: number; parts?: string[] }
  | { do: "slice" | "unslice"; on: string; at: At; dur?: number; axis?: "x" | "y" | "z"; keep?: "neg" | "pos"; stop?: number }
  | { do: "highlight"; on: string; at: At; until?: At }
  | { do: "label"; on: string; at: At; until?: At; text?: string; side?: "left" | "right" | "auto" };

export type TechBoard = {
  /** the small title line, <= 3 words */
  title: string;
  at: At;
  until?: At;
  /** a counter: counts from -> to over dur s from `at` */
  count?: { from: number; to: number; dur?: number; decimals?: number; prefix?: string; suffix?: string };
  /** or a fixed value */
  value?: string;
  pos?: "left" | "right" | "top";
};

export type TechFx = "shake" | "flash" | "sparks" | { fx: "shake" | "flash" | "sparks"; at?: At; p?: TechTarget; gain?: number };

export type TechShot = {
  at: At;
  set?: TechSetId;
  /** "fog": thick fog over the set (the sky set's low-visibility look); default clear */
  mood?: "clear" | "fog";
  cam: TechCam;
  actors?: BoltSpec[];
  props?: TechProp[];
  actions?: TechAction[];
  boards?: TechBoard[];
  fx?: TechFx[];
  caption?: "auto" | "off" | string;
  in?: "punch" | "cut" | "whip";
  sfx?: { at: At; sfx: string; db?: number }[];
  /** long-form: marks a new story beat for the pacing gate (chapters and set changes count by themselves) */
  beat?: boolean;
  note?: string;
};

export type TechRecipe = {
  kit: "tech3d";
  slug: string;
  /** "short" (30-55 s, the default) or "long" (5-8 min portrait); only the gate's length check differs.
   *  "landscape": 1920x1080 long-form (LONGFORM.md; the long-form gate, lower-third captions, chapter cards) */
  format?: "short" | "long" | "landscape";
  /** landscape only: YouTube chapters, each starting on a word of the voice-over (title card + whoosh/impact) */
  chapters?: { title: string; word: At }[];
  /** hook: top of the frame, <= 2 lines, <= 5 words, *one word* in orange */
  hook: { text: string; until?: At; again?: At };
  duration?: number;
  music?: string;
  sfx0?: string;
  cast: Record<string, "BOLT">;
  /** "auto" (default): BOLT's screen mouth lip-syncs the voice when the camera is on BOLT; "none": never */
  talk?: "auto" | "none";
  /** props that live across shots: from/until are times */
  props?: (TechProp & { from?: At; until?: At; sets?: TechSetId[] })[];
  shots: TechShot[];
  captions?: "auto" | "off";
};

// biz3d recipe schema ("kit": "biz3d" in finance/shorts/<slug>/recipe.json). Shots anchor to words of the voice-over
// exactly like the Block Money and tech3d recipes: the `At` and `Place` syntax is the same (src/fin/recipe/types.ts).
// Full writer's guide: finance/render-pc/KIT_BIZ3D.md.
import type { V3 } from "../blocky/motion";
import type { At, Place } from "../fin/recipe/types";
import type { ExecLook, ExecPose } from "./exec";
import type { BizSetId } from "./sets";

export type { At, Place };
export type BizCamId = "hookZoom" | "slamZoom" | "whip" | "pushIn" | "orbit" | "closeUp" | "medium" | "wide" | "dolly" | "crane" | "chartFly";
/** "<exec>" (chest) | "<exec>.head" | "<prop>" | an anchor ("head", "hq:0,2,0") | "chart" | "chart:<i>" | "store:<i>" | [x, y, z] */
export type BizTarget = string | V3;

export type BizCam = {
  preset: BizCamId;
  target?: BizTarget;
  /** slamZoom / whip landing time (default the shot start + 0.12 s) */
  hit?: At;
  az?: number; // deg, 0 = from +z
  dist?: number;
  h?: number;
  fov?: number;
  /** where the target sits, as a fraction of the frame height from the top */
  face?: number;
  roll?: [number, number];
  blur?: number;
  /** orbit sweep (deg, default 40); dolly: the lateral travel (m, default 2.4) */
  sweep?: number;
  /** chartFly: the chart index range the camera rides (default 0 -> the last point) */
  from?: number;
  to?: number;
  /** chartFly: the time the ride takes (default the whole shot) */
  dur?: number;
};

export type ExecSpec = {
  id: string; // a key of recipe.cast
  pose: ExecPose;
  at: Place;
  then?: { at: At; pose: ExecPose }[];
  /** sits on a chair (the legs bend at the seat; the upper body still acts) */
  seated?: boolean;
  /** yaw in degrees (0 = facing +z), or a target to face; default the lens */
  look?: number | BizTarget;
  to?: Place;
  from?: At;
  scale?: number;
  talk?: boolean;
};

export type BizKit = "tower" | "boxes" | "cash" | "disc" | "envelope" | "block";
export type BizMotion = "turntable" | "bob" | "popIn" | "dropIn";
export type BizProp = {
  id: string;
  kit: BizKit;
  at: Place;
  yaw?: number;
  s?: number;
  color?: string;
  /** block: the size; tower: [width, height, depth]; boxes: [columns, rows, layers] */
  size?: V3;
  motion?: BizMotion;
  hit?: At;
  spin?: number;
};

export type BizAction =
  | { do: "crack"; on: string; at: At; dur?: number; collapse?: At }
  | { do: "dark" | "lit"; on: "stores"; at: At; stagger?: number; keep?: number[]; order?: "left" | "right" | "shuffle" }
  | { do: "drain"; on: string; at: At; dur?: number; to?: number }
  | { do: "draw"; on: "chart"; at: At; to?: number; dur?: number }
  | { do: "slam"; on: "papers"; at: At; stagger?: number }
  | { do: "label"; on: string; at: At; until?: At; text: string; side?: "left" | "right" | "auto"; tone?: "green" | "red" | "ink" };

export type Tone = "green" | "red" | "gold" | "ink";
export type BizDevice =
  /** the company card: a generic icon (never a logo), the name as plain text, the founding year */
  | { do: "company"; name: string; year?: number | string; icon?: CompanyIcon; tone?: Tone; tagline?: string; at: At; until?: At; pos?: "top" | "mid" | "low" }
  /** THE DECISION: the world freezes (the camera keeps creeping), the frame desaturates, a stamp slams in */
  | { do: "decision"; at: At; until?: At; text?: string; sub?: string; freeze?: boolean }
  /** a money counter: counts from -> to over dur (draining is red, rising is green) */
  | { do: "counter"; title: string; from: number; to: number; at: At; dur?: number; until?: At; tone?: Tone }
  /** what it's worth today: two bars, the small one first, then the big one grows and the multiple pops */
  | { do: "worth"; at: At; until?: At; a: { label: string; value: number; text?: string }; b: { label: string; value: number; text?: string }; multiple?: boolean }
  /** a number board (like tech3d's) */
  | { do: "board"; title: string; at: At; until?: At; value?: string; count?: { from: number; to: number; dur?: number; decimals?: number; prefix?: string; suffix?: string }; pos?: "left" | "right" | "top"; tone?: Tone }
  /** a rubber stamp (BANKRUPT, SOLD, NO) */
  | { do: "stamp"; text: string; at: At; until?: At; tone?: Tone; y?: number };
export type CompanyIcon = "film" | "mail" | "store" | "tower" | "rocket" | "cart" | "chip" | "phone" | "camera" | "bank";

export type BizFx = "shake" | "flash" | "debris" | { fx: "shake" | "flash" | "debris"; at?: At; p?: BizTarget; gain?: number };

export type BizShot = {
  at: At;
  set?: BizSetId;
  cam: BizCam;
  actors?: ExecSpec[];
  props?: BizProp[];
  actions?: BizAction[];
  devices?: BizDevice[];
  fx?: BizFx[];
  /** the headline-wall hero paper's headline (plain text; names allowed, no logos) */
  headline?: string;
  caption?: "auto" | "off" | string;
  in?: "punch" | "cut" | "whip";
  sfx?: { at: At; sfx: string; db?: number }[];
  note?: string;
};

export type BizChart = {
  /** the values, left to right (any unit; the tallest point is drawn `height` m high) */
  pts: number[];
  /** small tags above points (years, events) */
  tags?: { i: number; text: string }[];
  step?: number;
  height?: number;
};

export type CastLook = ExecLook | string; // a SUITS preset name ("charcoal", "olive", ...) or a full look

export type BizRecipe = {
  kit: "biz3d";
  slug: string;
  /** "short" (30-55 s portrait, default), "long" (5-8 min portrait), or "landscape" (1920 x 1080, long-form) */
  format?: "short" | "long" | "portrait" | "landscape";
  /** <= 5 words, <= 2 lines, *one word* in the accent (red), the dollar stake in it */
  hook: { text: string; until?: At; again?: At; tone?: "red" | "green" };
  duration?: number;
  music?: string;
  sfx0?: string;
  cast: Record<string, CastLook>;
  chart?: BizChart;
  props?: (BizProp & { from?: At; until?: At; sets?: BizSetId[] })[];
  shots: BizShot[];
  captions?: "auto" | "off";
  talk?: "auto" | "none";
};

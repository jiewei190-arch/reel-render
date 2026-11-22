// law3d recipe schema ("kit": "law3d" in finance/shorts/<slug>/recipe.json). Shots anchor to words of the voice-over,
// exactly like the Block Money and tech3d recipes (the `At` and `Place` syntax is the same).
// Full writer's guide: finance/render-pc/KIT_LAW3D.md.
import type { V3 } from "../blocky/motion";
import type { At, Place } from "../fin/recipe/types";
import type { CastSpec, FigFace, FigPose } from "./cast";
import type { LawKit } from "./objects";
import type { LawSetId } from "./sets";

export type { At, Place };
export type LawCamId = "hookZoom" | "slamZoom" | "whip" | "pushIn" | "orbit" | "closeUp" | "medium" | "wide" | "dolly" | "crane" | "topDown";
/** a target: "<cast id>" (chest) | "<cast id>.face" | "<prop id>" | an anchor ("benchTop", "pTable:0,0.1,0") | [x, y, z] */
export type LawTarget = string | V3;

export type LawCam = {
  preset: LawCamId;
  target?: LawTarget;
  /** slamZoom / whip landing time; default the shot start + 0.12 s */
  hit?: At;
  az?: number; // deg, 0 = from +z
  dist?: number;
  h?: number;
  fov?: number;
  /** where the target sits, as a fraction from the top (default per preset, from the layout) */
  face?: number;
  roll?: [number, number];
  blur?: number;
  /** orbit sweep (deg, default 36); dolly travel (m, default 1.2, sign = direction); crane rise (m, default 1.0) */
  sweep?: number;
};

export type ActorSpec = {
  id: string; // a key of recipe.cast
  pose: FigPose;
  /** the floor (or platform) point under the figure, or an anchor */
  at: Place;
  face?: FigFace;
  then?: { at: At; pose?: FigPose; face?: FigFace }[];
  from?: At;
  /** walk/slide to a place over the shot */
  to?: Place;
  /** yaw deg (0 = facing +z, toward the gallery) or a target to face; default: the lens */
  look?: number | LawTarget;
  pointAt?: LawTarget;
  scale?: number;
  /** seated (bench, tables, witness stand) */
  sit?: boolean;
  /** lip-sync the mouth to the voice-over in this shot (default false: the voice is a narrator) */
  talk?: boolean;
  /** the judge holds a gavel (on by default for role "judge" in pose "gavel") */
  gavel?: boolean;
};

export type LawMotion = "turntable" | "bob" | "popIn" | "dropIn" | "flyIn" | "float";
export type LawProp = {
  id: string;
  kit: LawKit;
  /** sign wording, headline, folder tab, paper title, nameplate text */
  text?: string;
  /** nameplate: use this cast entry's `plate` */
  of?: string;
  /** photo subject: "pants" | "shop" | "person" | "blank" */
  photo?: string;
  color?: string;
  at: Place;
  yaw?: number; pitch?: number; roll?: number; s?: number;
  motion?: LawMotion;
  /** popIn / dropIn / flyIn landing time; default the shot start + 0.12 s */
  hit?: At;
  /** flyIn: where it comes from, an offset from `at` (m); default [-2.4, 1.6, 1.4] */
  fromOff?: V3;
  /** turntable speed (deg/s, default 14) */
  spin?: number;
  /** gavel: strike times (each "gavel" action in the shot adds one) */
  hits?: At[];
};

export type LawAction =
  /** a gavel strike: the gavel props and the gavel-holding judge of the shot slam on `at` (camera kick + impact) */
  | { do: "gavel"; at: At; on?: string }
  /** EXHIBIT A: a tag card pops in (with a line to `on`, a target in the shot, when given) */
  | { do: "exhibit"; at: At; until?: At; label?: string; text: string; on?: LawTarget }
  /** the verdict reveal: a big stamped word (+ an optional sub line), with a gavel impact */
  | { do: "verdict"; at: At; until?: At; text: string; sub?: string }
  /** the case-file card: case name, year, place */
  | { do: "caseCard"; at: At; until?: At; title: string; year?: string; place?: string; note?: string }
  /** a number board: a dollar counter that counts up; `zeroAt` drains it to 0 (the verdict) */
  | { do: "counter"; at: At; until?: At; title: string; from?: number; to?: number; dur?: number; prefix?: string; suffix?: string; decimals?: number; value?: string; pos?: "left" | "right" | "top" | "center"; zeroAt?: At; compact?: boolean };

export type LawFx = "shake" | "flash" | "papers" | { fx: "shake" | "flash" | "papers"; at?: At; p?: LawTarget; gain?: number };

export type LawShot = {
  at: At;
  set?: LawSetId;
  cam: LawCam;
  actors?: ActorSpec[];
  props?: LawProp[];
  actions?: LawAction[];
  fx?: LawFx[];
  caption?: "auto" | "off" | string;
  /** courtroom: show the jury silhouettes (default true; false for a bench trial) */
  jury?: boolean;
  in?: "punch" | "cut" | "whip";
  sfx?: { at: At; sfx: string; db?: number }[];
  note?: string;
};

export type LawRecipe = {
  kit: "law3d";
  slug: string;
  /** "short" (30-55 s, portrait, the default), "long" (5-8 min, portrait) or "landscape" (1920 x 1080, long-form) */
  format?: "short" | "long" | "landscape";
  /** hook: top of the frame, <= 2 lines, <= 5 words, *one word* in gold */
  hook: { text: string; until?: At; again?: At };
  duration?: number;
  music?: string;
  sfx0?: string;
  /** the people of this case (generic stylized figures; outfits and nameplates are per case) */
  cast: Record<string, CastSpec>;
  props?: (LawProp & { from?: At; until?: At; sets?: LawSetId[] })[];
  shots: LawShot[];
  captions?: "auto" | "off";
};

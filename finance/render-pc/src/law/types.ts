// law3d recipe schema ("kit": "law3d" in finance/shorts/<slug>/recipe.json). Shots anchor to words of the voice-over,
// exactly like the Block Money and tech3d recipes (the `At` and `Place` syntax is the same).
// Full writer's guide: finance/render-pc/KIT_LAW3D.md.
import type { V3 } from "../blocky/motion";
import type { At, Place } from "../fin/recipe/types";
import type { ChapterSpec } from "../longform/kit";
import type { CastSpec, FigFace, FigPose } from "./cast";
import type { LawKit } from "./objects";
import type { LawSetId } from "./sets";
import type { LawSfx, LawSound } from "./sound";
export type { LawSfx, LawSound };

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

export type LawMotion = "turntable" | "bob" | "popIn" | "dropIn" | "flyIn" | "float" | "slideIn" | "driveIn";
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
  /** the same as `s` (hero props use "scale"); 1 = hero scale, 0.3-0.4 = about life size */
  scale?: number;
  // ---- HERO PROPS (src/law/hero.tsx, KIT_LAW3D.md "Hero props"); `spin` with no `motion` turns a prop slowly
  /** the short generic text printed on the prop (<= 14 characters, <= 2 words, never a real brand); "" = none */
  label?: string;
  /** paper / screen / tag body lines (contract, phone, evidence bag, trousers tag), up to 7 of <= 40 characters */
  lines?: string[];
  /** statue: "rooster" | "dog" | "cat" | "horse" | "eagle" */
  species?: string;
  /** toy: "doll" | "ball"; food: "burger" | "fries" */
  variant?: string;
  /** hand: hair on the palm (true, or a density 0-1) */
  hair?: boolean | number;
  /** hand: a bandage wrapped round the palm */
  bandage?: boolean;
  /** house: the "for sale" sign (its text is the label) */
  sale?: boolean;
  /** coffee: steam rising (default true) */
  steam?: boolean;
  // ---- ACTING PROPS (KIT_LAW3D.md "Acting props")
  /** cooler: the lid swings open on this word; foil: the wrap peels back; truck: the back door rolls up */
  open?: At;
  /** how long the opening takes (s, default 0.45) */
  openDur?: number;
  /** dog: sniffs (nose down, tail wagging) until this word, then ALERTS: sits, nose up and pointing, tail stiff */
  alert?: At;
  /** the prop travels from `at` to this place over the shot (a dog walking the length of a car; its legs stride) */
  to?: Place;
  /** car: a patrol light bar on the roof, flashing red and blue (no markings) */
  lightbar?: boolean;
  /** cooler: how many foil bundles sit inside (default 7) */
  count?: number;
  /** the prop's own sound, played when it lands (`hit`), opens (`open`) or alerts (`alert`): replaces the automatic
   *  cue; false = silent */
  sfx?: LawSound;
};

export type LawAction =
  /** a gavel strike: the gavel props and the gavel-holding judge of the shot slam on `at` (camera kick + impact) */
  | { do: "gavel"; at: At; sfx?: LawSound; on?: string }
  /** EXHIBIT A: a tag card pops in (with a line to `on`, a target in the shot, when given) */
  | { do: "exhibit"; at: At; sfx?: LawSound; until?: At; label?: string; text: string; on?: LawTarget }
  /** the verdict reveal: a big stamped word (+ an optional sub line), with a gavel impact */
  | { do: "verdict"; at: At; sfx?: LawSound; until?: At; text: string; sub?: string }
  /** the case-file card: case name, year, place */
  | { do: "caseCard"; at: At; sfx?: LawSound; until?: At; title: string; year?: string; place?: string; note?: string }
  /** a number board: a dollar counter that counts up; `zeroAt` drains it to 0 (the verdict) */
  | { do: "counter"; at: At; sfx?: LawSound; until?: At; title: string; from?: number; to?: number; dur?: number; prefix?: string; suffix?: string; decimals?: number; value?: string; pos?: "left" | "right" | "top" | "center"; zeroAt?: At; compact?: boolean;
      /** the anchor word (the voice saying the number): the count lands on `to` by its END and holds. Default: found in the
       *  voice-over (the words around the counter that say `to`: "fifteen", "$12,000", "54 million"); LONGFORM.md "Counters" */
      land?: At };

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
  /** roadside: the road moves under a travelling shot at this speed (m/s): lane stripes, rail posts and poles slide past */
  drive?: number;
  /** roadside: false hides the parked patrol car and its lights (a shot before the stop, or far from it) */
  patrol?: boolean;
  in?: "punch" | "cut" | "whip";
  /** sound cues of this shot: any library sound (src/law/sound.ts LAW_SFX) or one of the recipe's own "sounds" */
  sfx?: LawSfx[];
  /** framing QA (KIT guide "Framing rules"): the person this shot is about when the camera aims at an object */
  subject?: string;
  note?: string;
  /** long-form: marks a new story beat for the pacing gate (chapters and set changes count by themselves) */
  beat?: boolean;
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
  /** the music bed level in dB (default -12; it always ducks under the voice) */
  musicDb?: number;
  sfx0?: string;
  /** "off": no automatic cues (the punch-in whooshes, the drop thuds, the end whoosh): every sound is named by the
   *  recipe (shot / action / prop `sfx`, or the list below). The frame-0 punch (`sfx0`) stays */
  autoSfx?: "on" | "off";
  /** recipe-level cues, not tied to a shot (a siren under two shots, a heartbeat into the turn) */
  sfx?: LawSfx[];
  /** the recipe's own effects: name -> a file in the Short's folder ("sfx/foil.wav"); usable in any cue */
  sounds?: Record<string, string>;
  /** beats of silence: the music bed drops out between `at` and `until` (the voice and the cues stay) */
  silence?: { at: At; until: At }[];
  /** the people of this case (generic stylized figures; outfits and nameplates are per case) */
  cast: Record<string, CastSpec>;
  props?: (LawProp & { from?: At; until?: At; sets?: LawSetId[] })[];
  shots: LawShot[];
  captions?: "auto" | "off";
  /** long-form ("format": "landscape" only): YouTube chapters, each starting on a word (LONGFORM.md) */
  chapters?: ChapterSpec[];
};

// SHOT RECIPE schema: a Short = a list of shots. Every time is an `At` (a word of the voice-over or seconds), so a
// recipe survives a re-recorded voice. finance/shorts/<slug>/recipe.json -> tools/recipe_build.mjs -> a composition.
// Full guide with every preset: finance/render-pc/RECIPE_GUIDE.md.
import type { V3 } from "../../blocky/motion";

/** a time: seconds (2.4), or a word of vo/timings.json:
 *   "nineteen"        first "nineteen" (case/punctuation ignored)
 *   "nineteen#2"      its 2nd occurrence;   "3:wrong" = "wrong" in line (turn) 3
 *   "end:nineteen"    the END of that word; "line:3" = start of line 3; "lineEnd:1" = end of line 1
 *   any of these + an offset: "nineteen+0.12", "line:4-0.2"                                                     */
export type At = number | string;
/** a place: [x, z] on the floor, [x, y, z], or a set anchor: "counterTop", "mark", "counterTop:0.4,0,0.1" (offset) */
export type Place = [number, number] | V3 | string;

export type PoseId = "idle" | "smug" | "shock" | "despair" | "push" | "reach" | "swipe-card" | "kneel" | "collapse" | "point" | "celebrate" | "walk" | "run";
export type CamId = "hookZoom" | "slamZoom" | "whip" | "pushIn" | "orbit" | "closeUp" | "medium" | "wide" | "splitScreen" | "povFirstPerson";
export type MotionId = "dropSlam" | "fly-in" | "stick-to-face" | "rain" | "burst" | "count-up";
export type FxId = "shake" | "flash" | "dust" | "debris";
export type SetId = "store" | "home" | "street" | "bank" | "office";
export type Emotion = "happy" | "shock" | "sad" | "joy" | "sly" | "love" | "curious";

/** what the camera looks at: "spender.face", "spender" (body), "saver.hands", a prop id ("tv"), an anchor or a point */
export type Target = string | V3;

export type CamSpec = {
  preset: CamId;
  target?: Target;
  /** S2 split screen: [top target, bottom target] */
  targets?: [Target, Target];
  /** the impact time (slamZoom fov slam, whip landing); default: shot start + 0.12 s */
  hit?: At;
  /** overrides: azimuth (deg, 0 = from +z / the lens side), distance (m), height above the target (m), fov, roll [from, to] deg */
  az?: number;
  dist?: number;
  h?: number;
  fov?: number;
  roll?: [number, number];
  /** where the target sits, fraction from the top of the frame (default per preset) */
  face?: number;
  /** depth-of-field blur px */
  blur?: number;
};

export type ActorSpec = {
  id: string; // "spender" | "saver" | any key of recipe.cast
  pose: PoseId;
  at: Place;
  /** a yaw in degrees (0 = facing +z, the lens) or a target to turn toward */
  face?: number | Target;
  /** the pose starts at this time (reaction lands LEAD before it); default the shot start */
  from?: At;
  /** later pose changes inside the shot */
  then?: { at: At; pose: PoseId; emotion?: Emotion }[];
  emotion?: Emotion;
  /** walk/run destination */
  to?: Place;
  scale?: number;
  /** squash/stretch hits (times) */
  squash?: At[];
  /** quality pass: gestures on key words (point, count, palmsUp, facepalm, clutchHead, shrug) */
  gestures?: { at: At; g: "point" | "count" | "palmsUp" | "facepalm" | "clutchHead" | "shrug" }[];
  /** quality pass: where the eyes/head track ("camera" = the viewer); default the camera while talking, else the shot's target */
  lookAt?: Target | "camera" | "none";
};

export type KitId = "tv" | "card" | "reader" | "debtBlock" | "label" | "jar" | "coinPile" | "calendar" | "stamp" | "payBox" | "coin" | "bill" | "block" | "counter";
export type PropSpec = {
  /** a stable id (camera target, later shots, QA names); default asset/kit name */
  id?: string;
  /** a CC0 catalogue id (src/fin/lib/assets.tsx) ... */
  asset?: string;
  /** ... or one of our kit props */
  kit?: KitId;
  at: Place;
  yaw?: number; // degrees
  s?: number;
  text?: string[] | string;
  color?: string;
  /** kit extras: jar fill 0..1.2, calendar value, block size [w,h,d], coin-pile radius */
  fill?: number;
  value?: string;
  size?: V3;
  glow?: number;
  motion?: MotionId;
  /** dropSlam: the fall height in metres (default 2.4; ~1.0 keeps it in frame at frame 0, mid-fall) */
  drop?: number;
  /** the motion's key time (landing, burst, sticking); default the shot start */
  hit?: At;
  /** motion options: fly-in from (Place), stick-to-face actor id, rain count/area, count-up from/to/format/dur */
  from?: Place;
  on?: string;
  n?: number;
  area?: [number, number];
  count?: { from: number; to: number; dur?: number; prefix?: string; suffix?: string; decimals?: number };
};

export type FxSpec = FxId | { fx: FxId; at?: At; p?: Place; gain?: number };

export type ShotSpec = {
  /** shot start; the shot ends where the next one starts (the last at the end of the Short) */
  at: At;
  set?: SetId; // default: the previous shot's set
  mood?: "store" | "whisper" | "ending";
  cam: CamSpec;
  actors?: ActorSpec[];
  props?: PropSpec[];
  fx?: FxSpec[];
  /** "auto" (default) = word captions; "off" hides them for this shot; a string = a fixed caption */
  caption?: "auto" | "off" | string;
  /** quality pass: who lip-syncs the voice in this shot (an actor id) or "none"; default from recipe.talk */
  talk?: string;
  /** quality pass: false hides the background passers-by in this shot (when the shot's own props fill the background) */
  extras?: boolean;
  /** quality pass: how this shot comes in: "punch" (default: a punch-in zoom + small shake), "whip", "match" (keeps the
   *  previous shot's camera angle), or "cut" (plain) */
  in?: "punch" | "whip" | "match" | "cut";
  /** extra sfx cues for tools/story_mix.py */
  sfx?: { at: At; sfx: string; db?: number }[];
  /** optional note for humans (ignored) */
  note?: string;
};

export type Recipe = {
  slug: string;
  style: "S1" | "S2" | "S3" | "S4" | "S5" | "S6";
  /** hook text: on screen from frame 0, <= 8 words; until = when it goes (default end of line 1 + 0.25 s) */
  hook: { text: string; until?: At; again?: At };
  /** composition length (s); default the voice's duration */
  duration?: number;
  music?: string;
  /** the sfx punch at 0.00 s (default "impact"; e.g. "drop", "crash", "paper" for a rip) */
  sfx0?: string;
  bg?: string;
  /** the animation quality pass (lip-sync, alive idles, look-at, blended acting, transitions, extras, particles,
   *  contact shadows, deeper DOF). Default true; false renders the plain v1 look (for side-by-sides). */
  quality?: boolean;
  /** quality pass: "auto" = the actor the camera is on lip-syncs the voice (narrator-as-character); "none" = nobody
   *  (a narrator voice; characters react silently); per shot `talk` overrides. Default "auto" for S3/S5, else "none". */
  talk?: "auto" | "none";
  /** quality pass: background passers-by from the Blocky crowd (default true where the set has a path) */
  extras?: boolean;
  /** easter eggs in the background of every shot (1-2): "cat" | "tv19" | "sticky" | "mug", or { egg, at, to, yaw, text } */
  eggs?: (import("./eggs").EggSpec)[];
  /** the double payoff: a visual gag in the last 0.5-1 s after the spoken payoff ({ gag: "catCoin" | "tvFall" | "stickyFall", from?: s }) */
  finalGag?: import("./eggs").FinalGag;
  /** cast: id -> look ("SPENDER" | "SAVER" | "SELLER" | "DAD" | "KID") */
  cast: Record<string, string>;
  captions?: "auto" | "off";
  /** REMOVED 2026-11-19 (owner: captions bottom centre only). Kept so old recipes still type-check; ignored by the engine. */
  captionsTop?: boolean;
  /** props that stay across shots: shown from `from` to `until` (At); same fields as a shot prop */
  /** multi-shot props: `from`/`until` are times here (At), not a fly-in origin */
  props?: (Omit<PropSpec, "from"> & { from?: At; until?: At })[];
  shots: ShotSpec[];
  /** corner tag text (e.g. "EXAMPLE") from/until */
  tag?: { text: string; from: At; until: At };
};

/** a word of the voice-over (the same shape as the plan.gen WORDS) */
export type Word = { w: string; turn: number; t: number; end: number };

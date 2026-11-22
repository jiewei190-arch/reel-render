// storytime kit (KIT_STORYTIME.md): the recipe schema. A first-person comedy story ("my homie...") told by one narrator,
// two original kid characters with big expressive faces, three school sets, a cut every 1-3 s, 1-3 word captions.

/** a time anchor: seconds, or a spoken word: "L:word" (first "word" of line L), "L:word#k" (its k-th occurrence in the
 *  line, 1-based), "L" (line L's first word), "L:end" (line L's last word end); any of them + "+0.2" / "-0.1" seconds */
export type At = number | string;

export type CastId = "me" | "homie";
export type Expr =
  | "neutral" | "annoyed" | "furious" | "shocked" | "deadpan" | "smug" | "laughing" | "sideeye"
  /** extras: an excited yell (the cold open) and a full scream (the held "UUUP") */
  | "yell" | "scream";
export const EXPRS: Expr[] = ["neutral", "annoyed", "furious", "shocked", "deadpan", "smug", "laughing", "sideeye", "yell", "scream"];

export type Pose = "idle" | "talk" | "yell" | "phone" | "laugh" | "point" | "lean";
export const POSES: Pose[] = ["idle", "talk", "yell", "phone", "laugh", "point", "lean"];

export type SetId = "classroom" | "hallway" | "cafeteria";
export const SET_IDS: SetId[] = ["classroom", "hallway", "cafeteria"];

export type CamPreset =
  | "closeup_me" | "closeup_homie" | "closeup" // face close-up (closeup takes "on")
  | "punch_in" //   a tight face close-up that slams in over 0.15 s (on)
  | "two_shot" //   both kids
  | "ots" //        over the shoulder of the other kid onto "on"
  | "insert" //     the phone screen
  | "wide_class" // the set's wide (use sparingly)
  | "crowd" //      the background classmates (reactions)
  | "windows"; //   the cafeteria's window wall (the shatter)
export const CAM_PRESETS: CamPreset[] = ["closeup_me", "closeup_homie", "closeup", "punch_in", "two_shot", "ots", "insert", "wide_class", "crowd", "windows"];

export type Cam = {
  preset: CamPreset;
  /** the subject (closeup / punch_in / ots); closeup_me and closeup_homie set it */
  on?: CastId;
  /** degrees around the subject from its facing (+ = toward its left, screen right) */
  az?: number;
  /** distance multiplier (1 = the preset's) */
  dist?: number;
  /** metres up (+) or down */
  h?: number;
  /** where the face centre sits, as a share of the frame height from the top (default 0.34) */
  face?: number;
  /** roll in degrees (a dutch angle) */
  roll?: number;
};

/** a face / pose / look change: { "at": anchor, "me": "annoyed", "homie": "smug" } */
export type FaceEv = { at?: At } & Partial<Record<CastId, Expr>>;
export type PoseEv = { at?: At } & Partial<Record<CastId, Pose>>;
/** where a kid looks: "front" (the set's facing), the other kid's id, or "cam" (into the lens) */
export type LookEv = { at?: At } & Partial<Record<CastId, "front" | CastId | "cam">>;

export type Fx =
  | { fx: "shake"; at?: At; gain?: number; dur?: number }
  | { fx: "punch"; at?: At; gain?: number }
  | { fx: "flash"; at?: At }
  | { fx: "shatter"; at?: At };

export type ClassEv = { at?: At; do: "turn" | "laugh" | "front" };

export type Shot = {
  at: At;
  /** the set (carries over from the previous shot) */
  set?: SetId;
  cam: Cam;
  face?: FaceEv[];
  pose?: PoseEv[];
  look?: LookEv[];
  fx?: Fx[];
  /** the background classmates: turn around to the leads, laugh, face front again */
  class?: ClassEv[];
  /** a shot may run past 3 s only with hold: true (the held scream) */
  hold?: boolean;
  note?: string;
};

export type Line = {
  speaker: CastId;
  /** the line as written (its stylised spellings, e.g. "FUUUCK", are shown in the captions where they match a word) */
  text: string;
  /** a shout: captions ALL CAPS, bigger, with a pop */
  shout?: boolean;
  /** faces at the start of the line */
  faces?: Partial<Record<CastId, Expr>>;
  /** words to prefer as the yellow accent word (lower case, no punctuation) */
  accent?: string[];
};

export type CastSpec = {
  name: string;
  skin: string;
  hair: string;
  hairStyle: "flattop" | "spiky" | "buzz" | "puff" | "bob";
  top: string;
  topStyle: "hoodie" | "tee" | "jacket";
  trim: string;
  pants: string;
  shoes: string;
  brow: string;
  eye?: string;
  freckles?: boolean;
  /** height multiplier */
  height?: number;
};

export type Recipe = {
  kit: "storytime";
  slug: string;
  title: string;
  format?: "short";
  /** the voice track under public/ (staticFile path) */
  audio?: string;
  cast: Record<CastId, CastSpec>;
  lines: Record<string, Line>;
  shots: Shot[];
  /** the hard cut to black (no fade); the film ends `hold` s later (default: at the voice's end) */
  end?: { at: At; hold?: number };
  captions?: "on" | "off";
};

/** a timed word: line number in `turn` */
export type Word = { w: string; turn: number; t: number; end: number };

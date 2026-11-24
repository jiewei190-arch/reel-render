// storytime kit (KIT_STORYTIME.md): the recipe schema. A first-person comedy story ("my homie...") told by one narrator,
// two original low-poly kid characters (decal faces: octagon eyes, bar brows; no lip-sync), three school sets, held poses
// with a slow camera push per shot, hard cuts (~2.9 s average), POV inserts, 1-4 word captions.

/** a time anchor: seconds, or a spoken word: "L:word" (first "word" of line L), "L:word#k" (its k-th occurrence in the
 *  line, 1-based), "L" (line L's first word), "L:end" (line L's last word end); any of them + "+0.2" / "-0.1" seconds */
export type At = number | string;

export type CastId = "me" | "homie";
export type Expr =
  | "neutral" | "annoyed" | "furious" | "shocked" | "deadpan" | "smug" | "laughing" | "sideeye"
  /** extras: an excited yell (the cold open) and a full scream (the held "UUUP") */
  | "yell" | "scream";
export const EXPRS: Expr[] = ["neutral", "annoyed", "furious", "shocked", "deadpan", "smug", "laughing", "sideeye", "yell", "scream"];

/** raise: the phone comes up slowly from the chest to face height, screen to the lens (over ~2 s) */
/** bow: a deep bow from the waist; fall: goes down sideways stiff as a plank (adults on a stage) */
export type Pose = "idle" | "talk" | "yell" | "phone" | "laugh" | "point" | "lean" | "pump" | "shrug" | "slam" | "raise" | "bow" | "fall";
export const POSES: Pose[] = ["idle", "talk", "yell", "phone", "laugh", "point", "lean", "pump", "shrug", "slam", "raise", "bow", "fall"];

export type SetId = "classroom" | "hallway" | "cafeteria" | "detention" | "gym";
export const SET_IDS: SetId[] = ["classroom", "hallway", "cafeteria", "detention", "gym"];

export type CamPreset =
  | "closeup_me" | "closeup_homie" | "closeup" // face close-up (closeup takes "on")
  | "punch_in" //   a tight face close-up that slams in over 0.15 s (on)
  | "two_shot" //   both kids
  | "ots" //        over the shoulder of the other kid onto "on"
  | "insert" //     the phone screen over the holder's shoulder
  | "pov_phone" //  first person (the narrator's eyes): the homie's phone held up to the lens, the narrator's hand in frame
  | "pov_tray" //   first person: looking down at the narrator's lunch tray, his hands on its edges
  | "wide_class" // the set's wide (use sparingly)
  | "crowd" //      the background classmates (reactions)
  | "windows" //    the cafeteria's window wall (the shatter)
  | "pov_press" //  first person (the homie's eyes): his soundboard phone in his hand, his thumb on the big button
  | "setcam"; //    a named camera of the set (cam.name: board, teacher, principal, stage, speakers, ...)
export const CAM_PRESETS: CamPreset[] = ["closeup_me", "closeup_homie", "closeup", "punch_in", "two_shot", "ots", "insert", "pov_phone", "pov_tray", "wide_class", "crowd", "windows", "pov_press", "setcam"];

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
  /** how far the camera pushes in over the shot (share of the distance, default 0.06) */
  push?: number;
  /** a chest-up close-up: the head may fill ~75 % of the frame width (arms crop) */
  tight?: boolean;
  /** setcam: the set camera's name */
  name?: string;
};

/** a face / pose / look change: { "at": anchor, "me": "annoyed", "homie": "smug" } */
export type FaceEv = { at?: At } & Partial<Record<CastId, Expr>>;
export type PoseEv = { at?: At } & Partial<Record<CastId, Pose>>;
/** where a kid looks: "front" (the set's facing), the other kid's id, or "cam" (into the lens) */
export type LookEv = { at?: At } & Partial<Record<CastId, "front" | CastId | "cam">>;

export type Fx =
  | { fx: "shake"; at?: At; gain?: number; dur?: number; sustain?: boolean }
  | { fx: "punch"; at?: At; gain?: number }
  | { fx: "flash"; at?: At }
  | { fx: "shatter"; at?: At };

/** the background kids of the shot's set: turn round to the leads, laugh, cheer (arms up, a standing-ovation feel),
 *  bow (a deep bow where they are), or face front again */
export type ClassEv = { at?: At; do: "turn" | "laugh" | "front" | "cheer" | "bow" };
/** an adult extra (teacher, principal): face, skin tint (the purple face), pose from `at` on */
export type AdultEv = { at?: At; id: string; face?: Expr; skin?: string; pose?: Pose };

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
  /** adult extras' face / skin / pose changes */
  adult?: AdultEv[];
  /** leads left out of this shot (e.g. the homie alone in detention) */
  hide?: CastId[];
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
  hairStyle: "flattop" | "spiky" | "curls" | "twists" | "buzz" | "puff" | "bob";
  top: string;
  /** bomber: an open jacket (top) over a tee (inner), ribbed collar / cuffs / waistband (trim) */
  topStyle: "hoodie" | "tee" | "jacket" | "bomber";
  /** the tee under a bomber / jacket */
  inner?: string;
  /** a small chain necklace (colour) */
  chain?: string;
  /** cargo pants: pockets on the thighs */
  cargo?: boolean;
  trim: string;
  pants: string;
  shoes: string;
  brow: string;
  eye?: string;
  freckles?: boolean;
  /** height multiplier */
  height?: number;
  /** an adult: long legs, a taller torso, the same head (teacher, principal) */
  adult?: boolean;
  /** a necktie (colour) */
  tie?: string;
  /** glasses (frame colour) */
  glasses?: string;
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
  /** episode props */
  props?: Props;
};

export type Props = {
  /** the homie's phone app: "clips" (a video player, ep1) or "bruh" (a one-button soundboard) */
  phone?: "clips" | "bruh";
  /** soundboard presses: the button goes down and the screen shows "BRUH" big for ~1.3 s */
  presses?: At[];
  /** the classroom whiteboard's lines (the first one big) */
  board?: string[];
  /** optional extras to show (their ids: teacher, principal, ...) */
  show?: string[];
  /** a single nugget lands on `owner`'s (otherwise empty) tray at `drop`; a lunch-lady hand takes it back at `take` */
  tray?: { owner: CastId; drop: At; take: At };
  /** per-set mark overrides for the leads (e.g. the homie presenting at the whiteboard) */
  marks?: Partial<Record<SetId, Partial<Record<CastId, { x: number; z: number; yaw: number; sit: boolean }>>>>;
  /** the science fair: a crystal on the leads' desks (gone from `gone` on) and a ribbon on the desk from `ribbon` on */
  fair?: { gone: At; ribbon?: At; ribbonText?: string; poster?: string };
  /** the whiteboard as a slide screen: from each `at` on it shows a title slide or the homie's selfie (sunglasses optional) */
  slides?: { at: At; kind: "title" | "selfie" | "selfie_glasses"; text?: string }[];
};

/** a timed word: line number in `turn` */
export type Word = { w: string; turn: number; t: number; end: number };

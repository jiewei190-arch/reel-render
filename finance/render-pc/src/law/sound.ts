// law3d sound design: the names a recipe may use in a cue. A cue is a library sound (LAW_SFX: the toon3d library,
// origin/iawaken/toon3d-fx, <audio_dir>/sfx/<name>.wav) or one of the recipe's own effects ("sounds": { name: file },
// a file in the Short's folder). The compiler refuses any other name, so a typo never becomes a silent gap in the mix.
// KIT_LAW3D.md "Sound design".
import type { At } from "../fin/recipe/types";

export const LAW_SFX = ["alarm", "beep", "bell", "boing", "boom", "buzz", "cash", "chime", "click", "clock", "coins", "crash", "creak", "crowd", "ding", "door", "drop", "engine", "fail", "fire", "footsteps", "gasp", "glass", "gunshot", "heartbeat", "horn", "impact", "knock", "laugh", "magic", "metal", "paper", "pop", "punch", "rain", "riser", "rumble", "scratch", "slide", "sparkle", "splash", "squeak", "stamp", "success", "suspense", "swoosh", "thud", "thunder", "tick", "type", "water", "whoosh", "wind", "zap"] as const;

/** one sound cue of a recipe: `sfx` at `at`; `db` gain (0 = the library level), `len` trims it to that many seconds,
 *  `fade` fades the tail out (s), `fadeIn` fades the head in (s), `rate` plays it faster / slower (0.5-2: pitch and
 *  length change together, e.g. an engine winding down at 0.8) */
export type LawSfx = { at: At; sfx: string; db?: number; len?: number; fade?: number; fadeIn?: number; rate?: number };
/** the sound of one action or prop: a name, a full cue (its `at` defaults to the action's own time) or false = silent */
export type LawSound = string | false | (Omit<LawSfx, "at"> & { at?: At });
export type Cue = { t: number; sfx: string; db?: number; len?: number; fade?: number; fadeIn?: number; rate?: number };

export const sfxError = (name: unknown, own: Record<string, string> | undefined): string | null => {
  if (typeof name !== "string" || !name) return `a cue needs "sfx": a sound name`;
  if ((LAW_SFX as readonly string[]).includes(name) || (own && name in own)) return null;
  return `no sound "${name}" (library: ${LAW_SFX.join(", ")}${own && Object.keys(own).length ? `; this recipe's "sounds": ${Object.keys(own).join(", ")}` : `; add your own with "sounds": { "<name>": "sfx/<file>.wav" }`})`;
};

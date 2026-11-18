// Every finance Short of the render project. Add a Short here and in Root.tsx's list.
import type { ShortDef } from "../fin/engine";
import { setMoodShots } from "../library/mood";
import { PENNY_DOUBLES } from "./penny-doubles/stage";
import { RULE_OF_72 } from "./rule-of-72/stage";
import { MINIMUM_PAYMENT_TRAP } from "./minimum-payment-trap/stage";
import { DOLLAR_1970 } from "./dollar-1970/stage";
import { TEN_BEATS_THIRTY } from "./ten-beats-thirty/stage";

export const SHORTS: ShortDef[] = [PENNY_DOUBLES, RULE_OF_72, MINIMUM_PAYMENT_TRAP, DOLLAR_1970, TEN_BEATS_THIRTY];
export const BY_SLUG: Record<string, ShortDef> = Object.fromEntries(SHORTS.map((d) => [d.slug, d]));

// whisper and golden-ending moods for every Short at once (ids prefixed by slug: shot ids repeat across Shorts)
setMoodShots(
  SHORTS.flatMap((d) => d.plan.SHOTS.filter((s) => s.mood === "whisper").map((s) => `${d.slug}:${s.id}`)),
  SHORTS.flatMap((d) => d.plan.SHOTS.filter((s) => s.mood === "ending" || d.lenses[s.id]?.set === "retro").map((s) => `${d.slug}:${s.id}`)),
);

// Lip-sync from word timings: each word's letters are spread over its spoken span (or, when vo/timings.json carries
// per-character times from ElevenLabs /with-timestamps, those times are used directly), letters map to 6 mouth shapes,
// and the result is smoothed: a shape is held at least 2 frames, and gaps under 0.12 s between words stay open on a
// soft "E" instead of snapping shut. Stressed words (long, numbers, ALL-CAPS in the script) drive head nods.
import type { Viseme } from "../../blocky/Blocky";

export type LipWord = { w: string; t: number; end: number; turn?: number; chars?: { c: string; t: number; end: number }[] };
const FPS = 30;

/** letter -> mouth shape (rough English viseme classes) */
const V = (ch: string): Viseme | null => {
  const c = ch.toLowerCase();
  if ("mbp".includes(c)) return "M";
  if ("ou".includes(c)) return "O";
  if ("wq".includes(c)) return "U";
  if ("a".includes(c)) return "A";
  if ("eiy".includes(c)) return "E";
  if ("fvtdsznlrkghcjx".includes(c)) return "E"; // consonants: a narrow, slightly open mouth
  if ("0123456789".includes(c)) return "A";
  return null;
};
/** the mouth shape at time t for a list of words (null = silence: use the emotion's own mouth) */
export const visemeAt = (words: readonly LipWord[], t: number): Viseme => {
  // coarticulation lead (met4citizen/TalkingHead, MIT: a viseme ramps in up to 60 ms before its sound): the mouth
  // shows each shape ~50 ms early; then hold each shape >= 2 frames by sampling at the start of the 2-frame slot
  const ts = Math.floor((t + 0.05) * FPS / 2) * 2 / FPS;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (ts >= w.t && ts < w.end) {
      if (w.chars && w.chars.length) {
        const c = w.chars.find((q) => ts >= q.t && ts < q.end);
        return (c && V(c.c)) || "E";
      }
      const letters = w.w.replace(/[^A-Za-z0-9]/g, "");
      if (!letters.length) return "E";
      const k = Math.min(letters.length - 1, Math.floor(((ts - w.t) / Math.max(0.05, w.end - w.t)) * letters.length));
      // the last letter of a word closes toward rest a little earlier (no stuck-open mouths)
      if (ts > w.end - 0.04 && i + 1 < words.length && words[i + 1].t - w.end > 0.12) return "M";
      return V(letters[k]) ?? "E";
    }
    const nx = words[i + 1];
    if (nx && ts >= w.end && ts < nx.t && nx.t - w.end < 0.12) return "E"; // short gap: stay soft-open
  }
  return "rest";
};
/** is a word stressed (nod on it): long words, numbers, $ amounts, or written in CAPS in the script */
export const stressed = (w: LipWord) => /\d|\$/.test(w.w) || w.w.replace(/[^A-Za-z]/g, "").length >= 7 || (/^[A-Z]{2,}/.test(w.w) && w.w !== "TV");
/** head nod (rad, + = down) for the stressed words being spoken at t: a quick dip and recover over the word */
export const nodAt = (words: readonly LipWord[], t: number) => {
  let a = 0;
  for (const w of words) {
    if (!stressed(w)) continue;
    const u = (t - w.t + 0.03) / Math.max(0.18, Math.min(0.45, w.end - w.t));
    if (u > 0 && u < 1) a += 0.09 * Math.sin(Math.PI * u) * (1 - 0.4 * u);
  }
  return a;
};
/** is anyone speaking at t (for talk-bob) */
export const speakingAt = (words: readonly LipWord[], t: number) => words.some((w) => t >= w.t && t < w.end);

// kit_long.mjs: shared node helpers for the kit builders (tools/{tech,law,biz,cyber}_build.mjs), so every kit takes the
// same command line as tools/recipe_build.mjs and judges a LONG-FORM recipe ("format": "landscape", LONGFORM.md) by the
// same rules as the Block Money engine (tools/longform_gate.mjs).
//   kitArgs(argv, usage)  -> { slug, SHORTS, dir, check, noQa, qaSample, qaSampleGiven } | { err }
//   qaTimes(frames, long, qaSample) -> the clip-QA sample times: a Short gets every frame x 4 sub-frames (motion blur
//                                     safety, as before); long-form every Nth output frame (no motion blur, no sub-frames)
//   kitLongGate(ctx)      -> { gate, pacing }  the long-form gate rows ([check, ok, detail, hard])
//   kitLongReport(ctx)    -> the RECIPE_QA.md lines for a long-form kit recipe
//   chaptersTxt(chapters) -> the YouTube chapter lines (re-exported from longform_gate.mjs)
import { existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { chaptersTxt, stamp } from "./longform_gate.mjs";

export { chaptersTxt, stamp };
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** the shared command line: <slug> [--no-qa] [--check] [--shorts <dir>] [--qa-sample N]. Without --shorts the recipe is
 *  finance/shorts/<slug>, or finance/longform/<slug> when only that exists (like recipe_build.mjs). */
export const kitArgs = (argv) => {
  const args = argv.slice();
  const qsi = args.indexOf("--qa-sample");
  const qaSample = qsi >= 0 ? parseInt(args[qsi + 1], 10) : 1;
  if (!(qaSample >= 1)) return { err: "--qa-sample N: N must be a whole number >= 1" };
  const slug = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--shorts" && args[i - 1] !== "--qa-sample");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return { err: "usage" };
  const si = args.indexOf("--shorts");
  const SHORTS = si >= 0 ? resolve(args[si + 1]) : !existsSync(resolve(ROOT, "../shorts", slug)) && existsSync(resolve(ROOT, "../longform", slug)) ? resolve(ROOT, "../longform") : resolve(ROOT, "../shorts");
  return { slug, SHORTS, dir: join(SHORTS, slug), check: args.includes("--check"), noQa: args.includes("--no-qa"), qaSample, qaSampleGiven: qsi >= 0 };
};

/** clip-QA sample times (s) */
export const qaTimes = (frames, long, qaSample = 1) => {
  const out = [];
  if (long) for (let f = 0; f < frames; f += qaSample) out.push(f / 30);
  else for (let f = 0; f < frames * 4; f++) out.push(f / 120);
  return out;
};

const TEASE = /\?|^(but|wait|until|except|here's|heres|next|later|why|how|what|which|who|soon|yet|then)$/i;

/** the long-form gate, kit-agnostic. ctx:
 *   shots     [{ id, a, b, set, beat? }]                  every shot (beat: the shot's "beat": true)
 *   events    [[t, label]]                                visual changes besides cuts: hits, prop motions, pose/face
 *                                                         changes, device cards, fx (the chapter cards are added here)
 *   chapters  [{ n, title, t, card }]
 *   words, dur, audio ({ music, cues }), hookUntil, hookText
 *   caps      { share, moved: [] }                        lower-third share (caption centre >= 75 % of the height)
 *   boards    { small: [], edge: [], band: [] }           text readability / edge / caption-band notes (warn) */
export const kitLongGate = ({ shots, events, chapters, words, dur, audio, hookUntil, hookText, caps, boards }) => {
  const ev = [...shots.map((s) => [s.a, `cut ${s.id}`]), ...events, ...chapters.map((ch) => [ch.card, `chapter ${ch.n}`]), [dur, "end"]];
  const ts = [...new Set(ev.map(([t]) => Math.round(t * 100) / 100))].filter((t) => t >= 0 && t <= dur).sort((a, b) => a - b);
  let maxGap = 0, gapAt = 0;
  const longGaps = [];
  for (let i = 1; i < ts.length; i++) {
    const g = ts[i] - ts[i - 1];
    if (g > maxGap) { maxGap = g; gapAt = ts[i - 1]; }
    if (g > 6) longGaps.push(`${ts[i - 1].toFixed(1)}-${ts[i].toFixed(1)} s`);
  }
  const shotLens = shots.map((s) => s.b - s.a);
  const meanShot = shotLens.reduce((x, y) => x + y, 0) / Math.max(1, shotLens.length);
  const longShots = shots.filter((s) => s.b - s.a > 8).map((s) => `${s.id} ${(s.b - s.a).toFixed(1)} s`);
  const beats = [0, ...chapters.map((c) => c.t)];
  shots.forEach((s, i) => { if (s.beat || (i && s.set !== shots[i - 1].set)) beats.push(s.a); });
  beats.push(dur);
  const bs = [...new Set(beats.map((t) => Math.round(t * 100) / 100))].sort((a, b) => a - b);
  let maxBeat = 0, beatAt = 0;
  for (let i = 1; i < bs.length; i++) if (bs[i] - bs[i - 1] > maxBeat) { maxBeat = bs[i] - bs[i - 1]; beatAt = bs[i - 1]; }
  const noLoop = chapters.slice(1).filter((ch) => !words.some((w) => w.t >= ch.t - 25 && w.t < ch.t && TEASE.test(w.w.replace(/[^a-z?']/gi, "") || w.w))).map((ch) => `ch${ch.n} "${ch.title}"`);
  const chLen = chapters.map((ch, i) => (chapters[i + 1] ? chapters[i + 1].t : dur) - (i === 0 ? 0 : ch.t));
  const firstOk = chapters.length > 0 && chapters[0].t <= words[0].t + 0.5;
  const sfx0 = audio.cues.filter((c) => c.t <= 0.02);
  const gate = [
    ["hook text on screen at frame 0", hookUntil > 0, `"${hookText}" until ${hookUntil.toFixed(2)} s`, true],
    ["first spoken word by 0.5 s", words[0].t <= 0.5, `${words[0].w} at ${words[0].t.toFixed(2)} s`, true],
    ["a sound punch + music at 0.00 s", sfx0.length > 0 && !!audio.music, `${audio.music}, ${sfx0.map((c) => c.sfx).join(", ")}`, true],
    ["YouTube chapters: >= 3, the first at the first word (00:00)", chapters.length >= 3 && firstOk, chapters.length ? `${chapters.length} chapters, first "${chapters[0].title}" at ${chapters[0].t.toFixed(2)} s` : "no chapters", true],
    ["every chapter >= 10 s (YouTube minimum)", chLen.every((x) => x >= 10), chapters.map((c, i) => `${c.n}:${chLen[i].toFixed(0)}s`).join(" ") || "none", true],
    ["a visual change at least every 6 s (cut, hit, prop motion, pose change, card, chapter card)", maxGap <= 6.0, `longest gap ${maxGap.toFixed(2)} s from ${gapAt.toFixed(1)} s${longGaps.length ? `; gaps > 6 s: ${longGaps.slice(0, 6).join(", ")}` : ""}`, true],
    ["a new beat at least every 40 s (chapter, set change or \"beat\": true)", maxBeat <= 40, `longest ${maxBeat.toFixed(1)} s from ${beatAt.toFixed(1)} s; ${bs.length - 2} beat marks`, true],
    ["lower-third captions: centre >= 75 % of the height on >= 90 % of caption time", caps.share >= 0.9, `${(caps.share * 100).toFixed(0)} %; moved: ${caps.moved.slice(0, 8).join(", ") || "none"}`, true],
    ["shot length 3-6 s on average, none over 8 s", meanShot >= 2.5 && meanShot <= 6.5 && longShots.length === 0, `mean ${meanShot.toFixed(2)} s over ${shots.length} shots${longShots.length ? `; long: ${longShots.slice(0, 6).join(", ")}` : ""}`, false],
    ["an open loop (a question or a tease) in the 25 s before each chapter", noLoop.length === 0, noLoop.length ? `none before ${noLoop.join(", ")}` : "every chapter", false],
    ["text readable: text >= 30 px tall at 1080p", boards.small.length === 0, boards.small.slice(0, 8).join("; ") || "all readable", false],
    ["every landed text board / card fully inside the frame (1.5 % margin)", boards.edge.length === 0, boards.edge.slice(0, 8).join("; ") || "all inside", false],
    ["no text board or card in the lower-third caption band", boards.band.length === 0, boards.band.slice(0, 8).join(", ") || "none", false],
    ["length 8-12 min", dur >= 480 && dur <= 720, `${(dur / 60).toFixed(2)} min`, false],
  ];
  return { gate, pacing: { maxGap, meanShot, events: ts.length, beats: bs.length - 2 } };
};

/** RECIPE_QA.md for a long-form kit recipe */
export const kitLongReport = ({ slug, kit, tool, entry, pascal, C, dur, words, chapters, hits, qaLines, qaSample, qaS, gate, gateS, pacing, chTxt, extra = [] }) => [
  `# ${slug}: ${kit} long-form recipe QA (tools/${tool} + tools/kit_long.mjs)`, "",
  `Composition: \`${pascal}\` in \`${entry}\` (1920x1080, 30 fps, plain composition: no motion blur). Kit ${kit}, format landscape. ${C.shots.length} shots, ${dur.toFixed(2)} s (${(dur / 60).toFixed(2)} min), ${words.length} words, ${chapters.length} chapters.`, "",
  `## Clip QA: ${Math.ceil(C.duration / qaSample)} of ${C.duration} frames (every ${qaSample === 1 ? "frame" : `${qaSample}th frame`}), ${hits.size} clip(s), ${qaS.toFixed(1)} s`, "",
  ...(qaLines.length ? qaLines.map((l) => `- ${l}`) : ["- none: no prop or set piece enters a figure, no two people overlap, nobody sinks below the floor."]), "",
  `## Long-form gate (${gateS.toFixed(1)} s)`, "", "| check | result | detail |", "|---|---|---|",
  ...gate.map(([k, ok, d, hard]) => `| ${k} | ${ok ? "PASS" : hard ? "**FAIL**" : "warn"} | ${d} |`), "",
  `Pacing: ${pacing.events} visual-change marks, longest gap ${pacing.maxGap.toFixed(2)} s, mean shot ${pacing.meanShot.toFixed(2)} s, ${pacing.beats} beat marks.`, "",
  ...extra,
  "## chapters.txt", "", "```", chTxt.trimEnd(), "```", "",
];

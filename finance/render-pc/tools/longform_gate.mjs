// longform_gate.mjs: the LONG-FORM (format "landscape", 1920x1080) gate for tools/recipe_build.mjs, plus chapters.txt.
// The Shorts gate (frame-0 rules, 20-30 s, captions in the bottom band) stays in recipe_build.mjs unchanged; a long video
// is judged on pacing instead (LONGFORM.md "Pacing"):
//   - a visual change (a cut, a hit, a prop motion, a pose change, a chapter card) at least every 6 s
//   - a new story beat (a chapter, a set change or a shot with "beat": true) at least every 40 s
//   - an open loop (a question or a tease) in the 25 s before each chapter (warn)
//   - YouTube chapters: >= 3, the first at 00:00, each >= 10 s long
//   - lower-third captions (centre >= 75 % of the height on >= 90 % of caption time), 2 lines max
//   - text boards readable on a TV and on a phone held sideways (text >= 30 px tall at 1080p; warn)
// Exports longformGate(ctx) -> { gate, rows, chapters } and chaptersTxt(chapters, firstWordT).

/** "mm:ss" (or "h:mm:ss" past an hour), floored to the second, as YouTube parses description timestamps */
export const stamp = (t) => {
  const s = Math.max(0, Math.floor(t + 1e-6)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const two = (x) => String(x).padStart(2, "0");
  return h ? `${h}:${two(m)}:${two(ss)}` : `${two(m)}:${two(ss)}`;
};
/** YouTube chapter lines: the first chapter is written at 00:00 (YouTube requires it) */
export const chaptersTxt = (chapters) => chapters.map((ch, i) => `${stamp(i === 0 ? 0 : ch.t)} ${ch.title}`).join("\n") + "\n";

const TEASE = /\?|^(but|wait|until|except|here's|heres|next|later|why|how|what|which|who|soon|yet|then)$/i;
const MOVING = new Set(["dropSlam", "fly-in", "stick-to-face", "burst", "count-up", "rain"]);

export const longformGate = ({ C, m, recipe, words, dur }) => {
  // ---- pacing: every visual change event
  const ev = [];
  for (const s of C.shots) {
    ev.push([s.a, `cut ${s.id}`]);
    for (const [t] of s.kicks) ev.push([t, `hit ${s.id}`]);
    for (const p of s.props) if (p.a === s.a || p.hit >= s.a) { if (MOVING.has(p.spec.motion) || p.spec.kit === "stamp") ev.push([p.hit, `${p.spec.motion ?? "stamp"} ${p.key}`]); }
    for (const a of s.actors) for (const g of a.segs.slice(1)) ev.push([g.t0, `pose ${a.id}`]);
    for (const f of s.fx) ev.push([f.at, `${f.fx} ${s.id}`]);
  }
  for (const ch of C.chapters) ev.push([ch.card, `chapter ${ch.n}`]);
  ev.push([dur, "end"]);
  const ts = [...new Set(ev.map(([t]) => Math.round(t * 100) / 100))].filter((t) => t >= 0 && t <= dur).sort((a, b) => a - b);
  let maxGap = 0, gapAt = 0;
  for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > maxGap) { maxGap = ts[i] - ts[i - 1]; gapAt = ts[i - 1]; }
  const longGaps = [];
  for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 6) longGaps.push(`${ts[i - 1].toFixed(1)}-${ts[i].toFixed(1)} s`);
  const shotLens = C.shots.map((s) => s.b - s.a);
  const meanShot = shotLens.reduce((x, y) => x + y, 0) / shotLens.length;
  const longShots = C.shots.filter((s) => s.b - s.a > 8).map((s) => `${s.id} ${(s.b - s.a).toFixed(1)} s`);
  // ---- beats: chapters, set changes, "beat": true shots
  const beats = [0, ...C.chapters.map((c) => c.t)];
  C.shots.forEach((s, i) => { if (s.spec.beat || (i && s.set !== C.shots[i - 1].set)) beats.push(s.a); });
  beats.push(dur);
  const bs = [...new Set(beats.map((t) => Math.round(t * 100) / 100))].sort((a, b) => a - b);
  let maxBeat = 0, beatAt = 0;
  for (let i = 1; i < bs.length; i++) if (bs[i] - bs[i - 1] > maxBeat) { maxBeat = bs[i] - bs[i - 1]; beatAt = bs[i - 1]; }
  // ---- open loops into chapters: a question or a tease word in the 25 s before each chapter (after the first)
  const noLoop = C.chapters.slice(1).filter((ch) => !words.some((w) => w.t >= ch.t - 25 && w.t < ch.t && TEASE.test(w.w.replace(/[^a-z?']/gi, "") || w.w))).map((ch) => `ch${ch.n} "${ch.title}"`);
  // ---- chapters (YouTube: >= 3, first at 00:00, each >= 10 s)
  const chs = C.chapters;
  const chLen = chs.map((ch, i) => (chs[i + 1] ? chs[i + 1].t : dur) - (i === 0 ? 0 : ch.t));
  const firstOk = chs.length > 0 && chs[0].t <= words[0].t + 0.5;
  // ---- captions: lower third on >= 90 % of caption time
  let capT = 0, capLow = 0;
  const capMoved = [], capBoards = [];
  for (const s of C.shots) {
    const a = Math.max(s.a, 1.0), b = s.b; if (b <= a) continue;
    const p = m.capPlanL(C, s);
    capT += b - a; if (p.y >= 0.75 * 1080) capLow += b - a;
    if (p.y !== m.CAP_Y_L) capMoved.push(`${s.id}@${s.a.toFixed(1)}s->${(p.y / 10.8).toFixed(0)}%`);
    if (p.boards.length) capBoards.push(`${s.id}@${s.a.toFixed(1)}s:${p.boards.join("+")}`);
  }
  const capShare = capT ? capLow / capT : 1;
  // ---- text boards: inside the frame (1.5 % margin) and readable (text >= 30 px tall at 1080p), sampled every 0.25 s
  const EDGE = 16, edgeHits = new Map(), small = new Map();
  for (let t = 0; t < dur; t += 0.25) {
    const sh = C.shotAt(t), cams = C.camAt(t);
    const texty = new Map(sh.props.filter((p) => (p.spec.kit === "label" || p.spec.text) && t >= p.a && t < p.b && t >= (p.spec.motion ? p.hit : p.a) + 0.3).map((p) => [p.key, p]));
    if (!texty.size) continue;
    const views = cams.split && cams.second ? [[cams.main, 960, 0], [cams.second, 960, 960]] : [[cams.main, 1920, 0]];
    for (const b of C.qa(t).props) {
      const pr = texty.get(b.name);
      if (!pr) continue;
      const lines = Math.max(1, Array.isArray(pr.spec.text) ? pr.spec.text.length : 1) + (pr.spec.motion === "count-up" && !Array.isArray(pr.spec.text) ? 0 : 0);
      let worst = null, seen = false, px = 0;
      for (const [cam, w, left] of views) {
        const xs = [], ys = [];
        for (const dx of [-1, 1]) for (const dy of [-1, 1]) {
          const q = m.project(cam, [b.c[0] + dx * b.h[0], b.c[1] + dy * b.h[1], b.c[2]], 1080, 0, w, left);
          if (q) { xs.push(q.x); ys.push(q.y); }
        }
        if (xs.length < 4) continue;
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        if (x1 < left || x0 > left + w || y1 < 0 || y0 > 1080) continue;
        seen = true;
        px = Math.max(px, (0.55 * (y1 - y0)) / lines); // the kit label's glyphs fill ~55 % of a line
        const bad = x0 < left + EDGE || x1 > left + w - EDGE || y0 < EDGE || y1 > 1080 - EDGE;
        if (!bad) { worst = null; break; }
        worst = `${b.name} x ${x0.toFixed(0)}-${x1.toFixed(0)} y ${y0.toFixed(0)}-${y1.toFixed(0)}`;
      }
      if (seen && worst && !edgeHits.has(b.name)) edgeHits.set(b.name, `${worst} at ${t.toFixed(1)} s`);
      if (seen && px > 0 && px < 30 && !small.has(`${sh.id}.${b.name}`)) small.set(`${sh.id}.${b.name}`, `${sh.id} ${b.name} ${px.toFixed(0)} px at ${t.toFixed(1)} s`);
    }
  }
  const sfx0 = C.audio.cues.filter((c) => c.t <= 0.02);
  const gate = [
    ["hook text on screen at frame 0", C.hookUntil > 0, `"${recipe.hook.text}" until ${C.hookUntil.toFixed(2)} s`, true],
    ["first spoken word by 0.5 s", words[0].t <= 0.5, `${words[0].w} at ${words[0].t.toFixed(2)} s`, true],
    ["a sound punch + music at 0.00 s", sfx0.length > 0 && !!C.audio.music, `${C.audio.music}, ${sfx0.map((c) => c.sfx).join(", ")}`, true],
    ["YouTube chapters: >= 3, the first at the first word (00:00)", chs.length >= 3 && firstOk, chs.length ? `${chs.length} chapters, first "${chs[0].title}" at ${chs[0].t.toFixed(2)} s` : "no chapters", true],
    ["every chapter >= 10 s (YouTube minimum)", chLen.every((x) => x >= 10), chs.map((c, i) => `${c.n}:${chLen[i].toFixed(0)}s`).join(" "), true],
    ["a visual change at least every 6 s (cut, hit, prop motion, pose change, chapter card)", maxGap <= 6.0, `longest gap ${maxGap.toFixed(2)} s from ${gapAt.toFixed(1)} s${longGaps.length ? `; gaps > 6 s: ${longGaps.slice(0, 6).join(", ")}` : ""}`, true],
    ["a new beat at least every 40 s (chapter, set change or \"beat\": true)", maxBeat <= 40, `longest ${maxBeat.toFixed(1)} s from ${beatAt.toFixed(1)} s; ${bs.length - 2} beat marks`, true],
    ["lower-third captions: centre >= 75 % of the height on >= 90 % of caption time", capShare >= 0.9, `${(capShare * 100).toFixed(0)} %; moved: ${capMoved.slice(0, 8).join(", ") || "none"}`, true],
    ["shot length 3-6 s on average, none over 8 s", meanShot >= 2.5 && meanShot <= 6.5 && longShots.length === 0, `mean ${meanShot.toFixed(2)} s over ${C.shots.length} shots${longShots.length ? `; long: ${longShots.slice(0, 6).join(", ")}` : ""}`, false],
    ["an open loop (a question or a tease) in the 25 s before each chapter", noLoop.length === 0, noLoop.length ? `none before ${noLoop.join(", ")}` : "every chapter", false],
    ["text boards readable: text >= 30 px tall at 1080p", small.size === 0, [...small.values()].slice(0, 8).join("; ") || "all readable", false],
    ["every landed text board fully inside its view (1.5 % margin)", edgeHits.size === 0, [...edgeHits.values()].slice(0, 8).join("; ") || "all inside", false],
    ["no text board in the lower-third caption band", capBoards.length === 0, capBoards.slice(0, 8).join(", ") || "none", false],
    ["length 8-12 min", dur >= 480 && dur <= 720, `${(dur / 60).toFixed(2)} min`, false],
  ];
  return { gate, pacing: { maxGap, meanShot, events: ts.length, beats: bs.length - 2 } };
};

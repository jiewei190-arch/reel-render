// tall_story.js: runs the Distilbook boards (tall_boards.js) against a spec + voice timeline. Used by t_tall.js (Short,
// 1080x1920) and t_tallyt.js (long-form, 1920x1080). spec.boards = board id per phrase; spec.stages[run] = [[beat, offset], ...]
// stage cue times (beat = phrase index inside the run); spec.opts[run] = board options; spec.chapters = chapter title or null.
import { createDB, C, clamp, lerp, R, ss } from './styles/distilbook/distilbook.js';
import { BOARDS } from './tall_boards.js';

export async function run(name) {
  const spec = await (await fetch(`specs/${name}.json?${Date.now()}`)).json();
  await Promise.all(['40px "Patrick Hand"', '800 40px "Inter"', '600 20px "Inter"'].map(f => document.fonts.load(f)));
  const land = !!spec.landscape, W = land ? 1920 : 1080, H = land ? 1080 : 1920;
  const cv = document.getElementById('c'); cv.style.width = W / 2 + 'px'; cv.style.height = H / 2 + 'px';
  const D = createDB(cv, W, H), g = D.g, TL = window.TL, PH = TL.p;
  const pause = spec.pause || {};
  // runs of consecutive phrases on the same board
  const runs = []; spec.boards.forEach((b, i) => { if (!runs.length || runs[runs.length - 1].b !== b) runs.push({ b, i0: i, i1: i }); else runs[runs.length - 1].i1 = i; });
  runs.forEach((r, k) => { const p = PH[r.i0]; r.start = k === 0 ? 0 : p.start - .3 - (spec.chapters && spec.chapters[r.i0] ? 0 : 0); r.k = k;
    const map = (spec.stages && spec.stages[k]) || Array.from({ length: r.i1 - r.i0 + 1 }, (_, j) => [j, .1]);
    r.st = map.map(([beat, off]) => PH[Math.min(r.i1, r.i0 + beat)].start + off - r.start); r.opts = (spec.opts && spec.opts[k]) || {}; });
  runs.forEach((r, k) => { r.end = k < runs.length - 1 ? runs[k + 1].start : TL.total; });
  // chapters (long-form)
  const chap = []; (spec.chapters || []).forEach((c, i) => { if (c) chap.push({ i, title: c, start: i === 0 ? 0 : PH[i].start - (+pause[i - 1] || 0) - .35 }); });
  window.CHAPTERS = chap.map(c => ({ title: c.title, t: c.start }));
  const phraseAt = t => { let i = 0; PH.forEach((p, k) => { if (t >= p.start - .05) i = k; }); return i; };
  const drawRun = (r, t, a) => { if (a <= 0) return; const T = t - r.start; const K = (k, d = .8, off = 0) => k < r.st.length ? R(T, r.st[k] + off, d) : 0;
    D.alpha(a); BOARDS[r.b](D, T, K, r.opts); D.alpha(1); };
  function scene(t) {
    D.begin(t); D.frame(t, { right: land ? 'LONG-FORM  ·  HUMAN BODY' : 'HUMAN BODY' });
    let ri = 0; runs.forEach((r, k) => { if (t >= r.start) ri = k; }); const r = runs[ri];
    D.enterBoard();
    const x = R(t, r.start, .45);
    if (ri > 0 && x < 1) drawRun(runs[ri - 1], t, 1 - ss(x));
    drawRun(r, t, ri === 0 ? 1 : ss(R(t, r.start + .1, .4)));
    // chapter title card over the board
    if (chap.length) { const c = [...chap].reverse().find(c => t >= c.start); if (c) { const ci = chap.indexOf(c); const k = R(t, c.start, .35) * (1 - R(t, PH[c.i].start + .5, .45));
      if (k > 0) { g.save(); g.globalAlpha = k; g.fillStyle = C.card; g.fillRect(-200, -200, 1400, 1400); g.restore(); D.alpha(k);
        D.txt(`CHAPTER ${ci + 1}`, 500, 400, { size: 30, f: 'sans', wt: 700, col: C.blue, align: 'center', ls: 6 }); D.txt(c.title, 500, 490, { size: 78, align: 'center', write: R(t, c.start + .1, .7) });
        D.line(300, 550, 700, 550, { col: C.blue, w: 4, draw: R(t, c.start + .4, .5) }); D.alpha(1); } } }
    D.exitBoard();
    // title (portrait) / side notes (landscape)
    if (!land) { D.txt(spec.title || "Why you're **taller** in the morning", 540, 215, { size: 74, align: 'center' }); }
    else { const c = [...chap].reverse().find(c => t >= c.start) || chap[0]; const ci = chap.indexOf(c); const pi = phraseAt(t);
      const [sx, sy] = D.L.side; D.txt(`CHAPTER ${ci + 1} OF ${chap.length}`, sx, sy, { size: 22, f: 'sans', wt: 700, col: C.blue, ls: 4 });
      D.txt(c.title, sx, sy + 66, { size: 60 }); D.line(sx, sy + 112, sx + 300, sy + 112, { col: C.blue, w: 4 });
      const next = chap[ci + 1] ? chap[ci + 1].i : PH.length; const notes = [];
      for (let i = c.i; i < next && i <= pi; i++) { const m = PH[i].cap.match(/\*\*(.+?)\*\*/g); if (m) m.forEach(s => { const v = s.replace(/\*\*/g, '').replace(/[.…]+$/, ''); if (!notes.find(n => n.v === v)) notes.push({ v, t: PH[i].start }); }); }
      notes.slice(-8).forEach((n, j) => { const k = R(t, n.t + .2, .5); D.txt('•', sx, sy + 190 + j * 62, { size: 44, col: C.blue, alpha: k }); D.txt(n.v, sx + 34, sy + 190 + j * 62, { size: 46, write: k }); }); }
    D.player(t, TL.total, land ? chap.slice(1).map(c => c.start) : []);
    const i = phraseAt(t), p = PH[i];
    D.caption(p.cap, clamp((t - p.start) / (p.end - p.start)), 1);
    const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = 1 - fade; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); }
  }
  window.DUR = TL.total; window.seek = scene; window.render = scene; scene(0); window.ready = true; window.READY = true;
}

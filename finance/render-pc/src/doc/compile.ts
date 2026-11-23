// The doc kit compiler: doc.json + chapters/NN.json + the global voice words -> one timeline of scenes (2D documentary
// scenes and scene3d shots), the chapters (YouTube timestamps + one card each), the hook, and the 3D kit's sub-recipe
// that renders every scene3d shot (law3d / biz3d / cyber3d, unchanged kits). Pure; the same code runs in the render
// (src/doc/film.tsx) and in node (tools/doc_build.mjs).
//   validateDoc(doc, chapters, words, kit)  -> { errors: [{ where, msg }] }  schema problems, each with the fix
//   compileDoc(doc, chapters, words, vo)     -> DocCompiled
import { makeAt } from "../fin/recipe/timing";
import type { Word } from "../fin/recipe/types";
import { LF, chapterCues } from "../longform/kit";
import { CHAPTER, placeChapters } from "../longform/polish";
import type { Rect4 } from "../longform/polish";
import { DEFAULT_MOVE, layChart, layCompare, layDocument, layEvidence, layMap, layQuote, layRecap, layStat, layTimeline, rectOnScreen, setKey } from "./layout";
import type { Layout, TextItem } from "./layout";
import { CITIES, COUNTRIES, REGION_IDS } from "./maps";
import { LOOKS } from "./themes";
import type { DocLook } from "./themes";
import { DOC_MOVES, DOC_TYPES, THEME_KIT } from "./types";
import type { At, DocChapter, DocChapterRef, DocMove, DocScene, DocVideo } from "./types";

export const FPS = 30;
/** the hard limits the gates use (KIT_DOC.md "Variety rules") */
export const DOC_RULES = {
  maxScene: 6.0, repeatWindow: 45, max3dShare: 0.4, minTypesPerChapter: 4, maxShotShare: 0.3, combosPer10Min: 8,
  noCardBefore: 30, numberWindow: 1.5, maxEvents: 6, maxCards: 6, minCards: 2, maxPoints: 5, maxData: 6, maxLines: 8,
} as const;

export type SceneR = {
  id: string; i: number; ch: number; type: DocScene["type"]; spec: DocScene; a: number; b: number;
  move: DocMove; set: string; cam: string;
  /** resolved build times (chart / timeline pieces, map pins, compare right side, document marker) */
  ats: number[]; pinAts: number[]; routeAt: number; rightT: number; hlT: number;
};
export type ChapterC = { n: number; title: string; t: number; card: number; top?: number; box?: Rect4; fs?: number; fitOk?: boolean; heroSet?: string; file?: string };
export type DocCompiled = {
  doc: DocVideo; look: DocLook; kit: "law3d" | "biz3d" | "cyber3d"; slug: string; words: readonly Word[];
  duration: number; end: number; scenes: SceneR[]; chapters: ChapterC[]; hookUntil: number;
  at: (a: At | undefined, d?: number) => number;
  sceneAt: (t: number) => SceneR;
  /** a 2D scene's layout at t, text boxes already on screen (the stage move applied) */
  layoutAt: (s: SceneR, t: number) => Layout & { screen: (TextItem & { sx0: number; sy0: number; sx1: number; sy1: number })[] };
  /** the 3D kit's recipe (every scene3d is a shot; hidden filler shots between them) and the visible windows */
  kitRecipe: Record<string, unknown> | null; windows: [number, number][];
  cues: { t: number; sfx: string; db?: number }[];
};
export type DocError = { where: string; msg: string };

const isAt = (x: unknown) => typeof x === "number" || (typeof x === "string" && x.trim().length > 0);
const str = (x: unknown) => typeof x === "string" && x.trim().length > 0;

/** schema + reference checks, before any timing. `kit` gives the 3D kit's set ids and cast ids for scene3d. */
export const validateDoc = (doc: DocVideo, chapters: (DocChapter | null)[], words: readonly Word[], kitInfo: { sets: string[]; cams: string[]; cast: string[] }): DocError[] => {
  const E: DocError[] = [];
  const err = (where: string, msg: string) => E.push({ where, msg });
  if (doc.kit !== "doc") err("doc.json", `"kit" must be "doc"`);
  if (!LOOKS[doc.theme]) err("doc.json", `"theme" must be one of law, biz, cyber (got "${doc.theme}")`);
  if (!doc.hook || !str(doc.hook.text)) err("doc.json", `"hook": { "text": "*$54 MILLION* FOR PANTS" } is required (the cold-open title, <= 6 words, one *accent* word)`);
  else { const n = doc.hook.text.replace(/\*/g, "").trim().split(/\s+/).length; if (n > 6) err("doc.json", `hook "${doc.hook.text}" has ${n} words: use 6 or fewer`); if ((doc.hook.text.match(/\*[^*]+\*/g) ?? []).length !== 1) err("doc.json", `hook "${doc.hook.text}" needs exactly one *accent* word (wrap it in *stars*)`); }
  if (!Array.isArray(doc.chapters) || doc.chapters.length < 3) err("doc.json", `"chapters" is the outline, at least 3: [{ "file": "chapters/01.json", "title": "...", "from": "A", "card"?: word }, ...]`);
  const { at } = makeAt(words);
  const tryAt = (where: string, a: unknown, what: string) => {
    if (!isAt(a)) { err(where, `${what} is missing: a word of the voice-over ("$54", "3:The", "line:7", "end:pants") or seconds`); return null; }
    try { return at(a as At); } catch (e) { err(where, `${what} ${JSON.stringify(a)}: ${(e as Error).message.replace(/^recipe: /, "")} (use "N:word" for the word on line N, "word#2" for its 2nd use)`); return null; }
  };
  (doc.chapters ?? []).forEach((r: DocChapterRef, ci) => {
    const C = `doc.json chapters[${ci}]`;
    if (!r || !str(r.file)) err(C, `needs "file" ("chapters/${String(ci + 1).padStart(2, "0")}.json")`);
    if (!r || !str(r.title)) err(C, `needs "title" (one line, <= ${Math.floor((CHAPTER.maxW - 194) / (CHAPTER.minFs * 0.66))} characters)`);
    const f = tryAt(C, r?.from, `"from"`);
    if (ci === 0 && f !== null && f > (words[0]?.t ?? 0) + 0.5) err(C, `chapter 1 must start at the first word (00:00), not ${f.toFixed(2)} s: set "from" to "${words[0]?.w}" and its "card" after the cold open`);
    if (r?.card !== undefined) tryAt(C, r.card, `"card"`);
  });
  chapters.forEach((ch, ci) => {
    if (ch === null) return;
    const C = `chapter ${ci + 1}${doc.chapters?.[ci]?.title ? ` "${doc.chapters[ci].title}"` : ""}`;
    if (typeof ch !== "object") { err(C, "not a JSON object"); return; }
    if (ch.chapter !== ci + 1) err(C, `"chapter": ${ci + 1} (the files are in doc.json order)`);
    if (!Array.isArray(ch.scenes) || !ch.scenes.length) { err(C, `"scenes": [...] is empty`); return; }
    ch.scenes.forEach((s, si) => {
      const S = `${C} scene ${si + 1}${s && (s as { type?: string }).type ? ` (${(s as { type?: string }).type})` : ""}`;
      if (!s || typeof s !== "object") { err(S, "not a JSON object"); return; }
      if (!DOC_TYPES.includes(s.type)) { err(S, `"type" must be one of ${DOC_TYPES.join(", ")}`); return; }
      tryAt(S, s.at, `"at"`);
      if (s.move !== undefined && !DOC_MOVES.includes(s.move)) err(S, `"move" must be one of ${DOC_MOVES.join(", ")}`);
      if (s.move !== undefined && s.type === "scene3d") err(S, `"move" is for 2D scenes: a scene3d shot moves with "cam" (its kit's presets)`);
      const need = (k: string, ok: boolean, how: string) => { if (!ok) err(S, `"${k}" ${how}`); };
      const arr = (x: unknown) => Array.isArray(x) ? x : [];
      switch (s.type) {
        case "stat": need("value", str(s.value), `is required: the number exactly as shown ("$54,000,000", "79 DAYS")`); need("label", str(s.label), "is required: what the number is"); break;
        case "quote": need("text", str(s.text), "is required: the exact words (a real quote from the sources, not narration)"); need("who", str(s.who), "is required: who said it (a name in the script or sources)"); need("source", str(s.source), `is required: where it was said ("TO THE SHOP OWNERS, 2005", "RULING, JUNE 25, 2007")`); break;
        case "compare": for (const k of ["left", "right"] as const) { const c = s[k]; need(k, !!c && str(c.label) && str(c.value), `needs { "label", "value" } ("DEMANDED" / "$54,000,000"): values are shown final, never counted`); } if (s.rightAt !== undefined) tryAt(S, s.rightAt, `"rightAt"`); break;
        case "recap": need("title", str(s.title), "is required"); need("points", arr(s.points).length >= 1 && arr(s.points).length <= DOC_RULES.maxPoints && arr(s.points).every(str), `needs 1-${DOC_RULES.maxPoints} short lines`); break;
        case "timeline": need("events", arr(s.events).length >= 1 && arr(s.events).length <= DOC_RULES.maxEvents && arr(s.events).every((e) => e && str(e.when) && str(e.text)), `needs 1-${DOC_RULES.maxEvents} { "when": "2005", "text": "PANTS GO MISSING", "at"?: word }`); arr(s.events).forEach((e, k) => { if (e?.at !== undefined) tryAt(S, e.at, `events[${k}].at`); }); break;
        case "chart": {
          need("kind", ["bar", "line", "pie"].includes(s.kind), `must be "bar", "line" or "pie"`); need("title", str(s.title), "is required");
          const d = arr(s.data);
          need("data", d.length >= 2 && d.length <= (s.kind === "pie" ? 5 : DOC_RULES.maxData) && d.every((x) => x && str(x.label) && typeof x.value === "number" && str(x.text)), `needs 2-${s.kind === "pie" ? 5 : DOC_RULES.maxData} { "label", "value": number, "text": "$3,000" } (text = the value as shown)`);
          d.forEach((x, k) => { if (x?.at !== undefined) tryAt(S, x.at, `data[${k}].at`); });
          if (s.kind !== "pie" && (!str(s.x) || !str(s.y))) err(S, `"x" and "y" axis labels are required for a ${s.kind} chart ("OFFER", "AMOUNT OFFERED")`);
          break;
        }
        case "document": {
          need("kind", ["ruling", "filing", "email", "contract", "article", "receipt", "letter"].includes(s.kind), "must be ruling, filing, email, contract, article, receipt or letter");
          need("heading", str(s.heading), "is required (court, masthead, company or subject line)");
          need("lines", arr(s.lines).length >= 1 && arr(s.lines).every(str), "needs the page's text lines (real text from the sources)");
          need("key", Number.isInteger(s.key) && s.key >= 0 && s.key < arr(s.lines).length, `is the 0-based index of the key line in "lines" (0..${arr(s.lines).length - 1})`);
          if (s.kind === "article" && !str(s.headline)) err(S, `an article needs "headline" (every word of it must be in the script or the sources)`);
          if (s.highlightAt !== undefined) tryAt(S, s.highlightAt, `"highlightAt"`);
          break;
        }
        case "evidenceboard": {
          const cs = arr(s.cards);
          need("cards", cs.length >= DOC_RULES.minCards && cs.length <= DOC_RULES.maxCards && cs.every((c) => c && str(c.id) && str(c.label) && ["person", "doc", "place", "object"].includes(c.kind)), `needs ${DOC_RULES.minCards}-${DOC_RULES.maxCards} { "id", "kind": person|doc|place|object, "label" }`);
          const ids = new Set(cs.map((c) => c?.id));
          arr(s.links).forEach((l, k) => { if (!Array.isArray(l) || !ids.has(l[0]) || !ids.has(l[1])) err(S, `links[${k}] must be ["<card id>", "<card id>", "LABEL"?] (cards: ${[...ids].join(", ")})`); });
          break;
        }
        case "map": {
          if (!REGION_IDS.includes(s.region)) { err(S, `"region" must be one of ${REGION_IDS.join(", ")} (a country not listed: use "world" with a pin)`); break; }
          if (s.region === "city" && !str(s.name)) err(S, `a "city" map needs "name" (the city or district, as the script names it)`);
          arr(s.pins).forEach((p, k) => {
            if (!p || !str(p.label)) err(S, `pins[${k}] needs "label"`);
            const pl = p?.place;
            if (s.region === "city") return;
            if (typeof pl === "string") {
              const c = CITIES[pl];
              if (!c) err(S, `pins[${k}].place "${pl}" is not a bundled place (${Object.keys(CITIES).join(", ")}) : use [lon, lat]`);
              else if (s.region !== "world" && c[3] !== s.region) err(S, `pins[${k}].place "${pl}" is in ${c[3] ? COUNTRIES[c[3]]?.name ?? c[3] : "a country with no bundled outline"}, not on the ${COUNTRIES[s.region]?.name} map: use region "${c[3] || "world"}"`);
            } else if (!Array.isArray(pl) || pl.length !== 2) err(S, `pins[${k}].place must be a bundled city id or [lon, lat]`);
            if (p?.at !== undefined) tryAt(S, p.at, `pins[${k}].at`);
          });
          if (s.route) { if (s.route.at !== undefined) tryAt(S, s.route.at, `route.at`); }
          break;
        }
        case "scene3d": {
          if (!str(s.set) || !kitInfo.sets.includes(s.set)) err(S, `"set" must be a ${THEME_KIT[doc.theme]} set: ${kitInfo.sets.join(", ")}`);
          if (!s.cam || !kitInfo.cams.includes(String(s.cam.preset))) err(S, `"cam": { "preset" } must be a ${THEME_KIT[doc.theme]} camera: ${kitInfo.cams.join(", ")}`);
          for (const a of arr(s.actors)) if (!a || !kitInfo.cast.includes(a.id)) err(S, `actor "${a?.id}" is not in doc.json "kit3d.cast" (${kitInfo.cast.join(", ") || "empty"})`);
          break;
        }
      }
    });
  });
  return E;
};

/** spread n build times over the first 60 % of a scene (after 0.25 s) unless given */
const spread = (n: number, a: number, b: number, given: (number | null)[]) => given.map((g, i) => g ?? (n <= 1 ? a + 0.25 : a + 0.25 + (i * (0.6 * (b - a) - 0.25)) / (n - 1)));

export const compileDoc = (doc: DocVideo, chapters: (DocChapter | null)[], words: readonly Word[], voDuration?: number): DocCompiled => {
  const look = LOOKS[doc.theme];
  const kit = THEME_KIT[doc.theme];
  const { at, lineEnd } = makeAt(words);
  const durS = voDuration ?? Math.max(...words.map((w) => w.end)) + 0.8;
  const duration = Math.round(durS * FPS), end = duration / FPS;
  const chFrom = doc.chapters.map((r, i) => (i === 0 ? 0 : at(r.from)));
  const chEnd = (ci: number) => (ci + 1 < chFrom.length ? chFrom[ci + 1] : end);
  const flat: { s: DocScene; ch: number }[] = chapters.flatMap((c, ci) => (c ? c.scenes.map((s) => ({ s, ch: ci + 1 })) : []));
  const starts = flat.map((x) => at(x.s.at));
  starts.forEach((a, i) => { if (i && a <= starts[i - 1] + 1e-6) throw new Error(`scene ${i + 1} (${flat[i].s.type}, chapter ${flat[i].ch}) starts at ${a.toFixed(2)} s, not after scene ${i} (${starts[i - 1].toFixed(2)} s): scenes must be in time order`); });
  chapters.forEach((c, ci) => {
    if (!c) return;
    const k = flat.findIndex((x) => x.ch === ci + 1);
    if (k >= 0 && Math.abs(starts[k] - chFrom[ci]) > 0.05) throw new Error(`chapter ${ci + 1}: its first scene starts at ${starts[k].toFixed(2)} s, not at the chapter's "from" (${chFrom[ci].toFixed(2)} s): set the first scene's "at" to the chapter's "from" word`);
    flat.forEach((x, j) => { if (x.ch === ci + 1 && starts[j] >= chEnd(ci) - 1e-6) throw new Error(`chapter ${ci + 1}: scene ${j + 1} (${x.s.type}) starts at ${starts[j].toFixed(2)} s, after the chapter ends (${chEnd(ci).toFixed(2)} s): move it to the next chapter's file`); });
  });
  const scenes: SceneR[] = flat.map(({ s, ch }, i) => {
    const a = starts[i], b = i + 1 < starts.length && flat[i + 1].ch === ch ? starts[i + 1] : chEnd(ch - 1);
    const o = (x: At | undefined) => (x === undefined ? null : at(x));
    let ats: number[] = [], pinAts: number[] = [], routeAt = a + 0.6, rightT = a + 0.4 * (b - a), hlT = a + 0.35 * (b - a);
    if (s.type === "chart") ats = spread(s.data.length, a, b, s.data.map((d) => o(d.at)));
    if (s.type === "timeline") ats = spread(s.events.length, a, b, s.events.map((d) => o(d.at)));
    if (s.type === "map") { pinAts = spread((s.pins ?? []).length, a + 0.35 * (b - a) - 0.25, b, (s.pins ?? []).map((p) => o(p.at))); if (s.route?.at !== undefined) routeAt = at(s.route.at); }
    if (s.type === "compare" && s.rightAt !== undefined) rightT = at(s.rightAt);
    if (s.type === "document" && s.highlightAt !== undefined) hlT = at(s.highlightAt);
    const move: DocMove = s.type === "scene3d" ? "push" : s.move ?? DEFAULT_MOVE[s.type];
    const cam = s.type === "scene3d" ? `${(s.cam as { preset: string }).preset}:${JSON.stringify((s.cam as { target?: unknown }).target ?? "")}` : move;
    return { id: `S${String(i + 1).padStart(2, "0")}`, i, ch, type: s.type, spec: s, a, b, move, set: setKey(s as { type: string }), cam, ats, pinAts, routeAt, rightT, hlT };
  });
  const sceneAt = (t: number) => { let lo = 0, hi = scenes.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (scenes[mid].a <= t) lo = mid; else hi = mid - 1; } return scenes[lo]; };
  const layoutAt = (s: SceneR, t: number) => {
    const sp = s.spec as never;
    const T = { a: s.a, b: s.b };
    let L: Layout;
    switch (s.type) {
      case "stat": L = layStat({ ...(sp as object), ...T } as never, t, s.move); break;
      case "compare": L = layCompare({ ...(sp as object), ...T, rightT: s.rightT } as never, t, s.move); break;
      case "chart": L = layChart({ ...(sp as object), ...T, ats: s.ats } as never, t, s.move); break;
      case "timeline": L = layTimeline({ ...(sp as object), ...T, ats: s.ats } as never, t, s.move); break;
      case "document": L = layDocument({ ...(sp as object), ...T, hlT: s.hlT } as never, t, s.move); break;
      case "quote": L = layQuote({ ...(sp as object), ...T } as never, t, s.move); break;
      case "evidenceboard": L = layEvidence({ ...(sp as object), ...T } as never, t, s.move); break;
      case "recap": L = layRecap({ ...(sp as object), ...T } as never, t, s.move); break;
      case "map": L = layMap({ ...(sp as object), ...T, pinAts: s.pinAts, routeAt: s.routeAt } as never, t, s.move); break;
      default: return { items: [], stage: { s: 1, tx: 0, ty: 0, ox: 960, oy: 540 }, g: {}, screen: [] };
    }
    const screen = L.items.map((it) => { const r = rectOnScreen(L.stage, it); return { ...it, sx0: r.x0, sy0: r.y0, sx1: r.x1, sy1: r.y1 }; });
    return { ...L, screen };
  };
  // chapters: t = the chapter word (YouTube), card = when its card plays; placed clear of the scene text under it
  const chR: ChapterC[] = doc.chapters.map((r, i) => ({ n: i + 1, title: r.title, t: chFrom[i], card: at(r.card ?? r.from), heroSet: chapters[i]?.heroSet, file: r.file }));
  const busy = (t0: number, t1: number): Rect4[] => {
    const out: Rect4[] = [];
    for (let t = t0; t < t1; t += 0.2) {
      const s = sceneAt(t);
      if (s.type === "scene3d") continue;
      for (const it of layoutAt(s, t).screen) if (it.show > 0.3) out.push({ x0: it.sx0, x1: it.sx1, y0: it.sy0, y1: it.sy1 });
    }
    return out;
  };
  const placed = placeChapters(chR, busy, LF.CHAPTER_CARD_S).map((c, i) => ({ ...chR[i], top: c.top, box: c.box, fs: c.fs, fitOk: c.fitOk }));
  const hookUntil = doc.hook.until !== undefined ? at(doc.hook.until) : lineEnd(1) + 0.25;

  // the 3D kit sub-recipe: each scene3d is a shot at its own start; a hidden filler shot starts where a 3D window ends,
  // so every visible shot spans exactly its scene (camera moves are timed to the visible window)
  const windows: [number, number][] = scenes.filter((s) => s.type === "scene3d").map((s) => [s.a, s.b]);
  let kitRecipe: Record<string, unknown> | null = null;
  if (windows.length) {
    const shots: Record<string, unknown>[] = [];
    let lastEnd = 0, lastSet = String((scenes.find((s) => s.type === "scene3d")!.spec as { set: string }).set);
    const filler = (a: number) => ({ at: Math.round(a * 1000) / 1000, set: lastSet, cam: { preset: "wide" }, caption: "off", note: "doc kit: hidden filler between 3D scenes" });
    for (const s of scenes) {
      if (s.type !== "scene3d") continue;
      const { type: _t, beat: _b, id: _i, move: _m, tease: _te, note, at: _a, ...shot } = s.spec as Record<string, unknown>;
      if (!shots.length && s.a > 1e-6) shots.push(filler(0));
      else if (shots.length && s.a > lastEnd + 1e-3) shots.push(filler(lastEnd));
      shots.push({ ...shot, at: Math.round(s.a * 1000) / 1000, note: `${s.id} ${note ?? ""}`.trim() });
      lastEnd = s.b; lastSet = String(shot.set);
    }
    if (lastEnd < end - 1e-3) shots.push(filler(lastEnd));
    kitRecipe = { kit, slug: `${doc.slug}-3d`, format: "landscape", hook: { text: "*DOC*", until: -1 }, music: doc.music ?? "suspense", duration: end, ...(doc.kit3d ?? {}), shots };
  }
  // audio: the cold-open punch, a soft whoosh into every 2D scene, a pop per build piece, the chapter stings
  const cues: { t: number; sfx: string; db?: number }[] = [{ t: 0, sfx: "impact", db: -4 }];
  for (const s of scenes) {
    if (s.type === "scene3d") continue;
    if (s.a > 0.05) cues.push({ t: Math.max(0, s.a - 0.12), sfx: "whoosh", db: -14 });
    for (const t of [...s.ats, ...s.pinAts]) cues.push({ t, sfx: "pop", db: -12 });
    if (s.type === "document") cues.push({ t: s.hlT, sfx: "paper", db: -12 });
    if (s.type === "stat") cues.push({ t: s.a + 0.02, sfx: "impact", db: -10 });
  }
  cues.push(...chapterCues(placed.map((c) => ({ n: c.n, title: c.title, t: c.t, card: c.card }))));
  cues.sort((x, y) => x.t - y.t);
  return { doc, look, kit, slug: doc.slug, words, duration, end, scenes, chapters: placed, hookUntil, at, sceneAt, layoutAt, kitRecipe, windows, cues };
};

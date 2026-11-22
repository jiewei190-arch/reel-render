// "doc" kit schema: a long-form DOCUMENTARY (1920x1080, 9-12 min) built from chapter recipes. KIT_DOC.md is the writer's
// guide; tools/doc_build.mjs validates every field with a message that says what to change.
//   finance/longform/<slug>/doc.json          the video: theme, chapters, cast for the 3D kit, sources, teases
//   finance/longform/<slug>/chapters/NN.json  one chapter: its scenes (written one chapter at a time)
//   finance/longform/<slug>/vo/timings.json   the whole voice-over (global word timings: every `at` is a word of it)
import type { At } from "../fin/recipe/types";

export type { At };
export type DocTheme = "law" | "biz" | "cyber";
/** the 3D kit each theme's scene3d shots come from */
export const THEME_KIT: Record<DocTheme, "law3d" | "biz3d" | "cyber3d"> = { law: "law3d", biz: "biz3d", cyber: "cyber3d" };

/** the 2D camera move of a non-3D scene (the "camera" of the variety rules) */
export type DocMove = "push" | "pull" | "panL" | "panR" | "drift" | "rise";
export const DOC_MOVES: DocMove[] = ["push", "pull", "panL", "panR", "drift", "rise"];

export type DocSceneType = "map" | "timeline" | "document" | "quote" | "compare" | "chart" | "evidenceboard" | "recap" | "stat" | "scene3d";
export const DOC_TYPES: DocSceneType[] = ["map", "timeline", "document", "quote", "compare", "chart", "evidenceboard", "recap", "stat", "scene3d"];

/** fields every scene has */
export type SceneBase = {
  /** when the scene starts: a word of the voice-over ("$54", "3:The", "line:7", "end:pants+0.2") or seconds; it runs to
   *  the next scene (the last one to the end of the voice) */
  at: At;
  /** optional id (a tease payoff names it) */
  id?: string;
  /** a BIG BEAT (the line the video is about): scene3d with people, document, quote or compare only */
  beat?: boolean;
  /** 2D scenes: the slow camera move (default per type) */
  move?: DocMove;
  /** "off": no word captions during this scene */
  caption?: "off";
  /** cold open only: this scene teases a later moment (the payoff scene's id) */
  tease?: string;
  note?: string;
};

export type PlaceRef = string | [number, number]; // a bundled city id ("washington-dc") or [lon, lat]
export type MapScene = SceneBase & {
  type: "map";
  /** "world" | a bundled country ("usa", "uk", "bangladesh", ...) | "city" (procedural streets; `name` names it) */
  region: string;
  name?: string;
  title?: string;
  pins?: { place: PlaceRef; label: string; at?: At }[];
  /** a route drawn between two pins' places, from `at` */
  route?: { from: PlaceRef; to: PlaceRef; at?: At; label?: string };
  /** zoom from the whole region in to the pins (default true when there are pins) */
  zoom?: boolean;
};
export type TimelineScene = SceneBase & {
  type: "timeline";
  title?: string;
  /** left to right; each shows on its `at` (default: spread over the first 60 % of the scene) */
  events: { when: string; text: string; at?: At }[];
};
export type DocKind = "ruling" | "filing" | "email" | "contract" | "article" | "receipt" | "letter";
export type DocumentScene = SceneBase & {
  type: "document";
  kind: DocKind;
  /** the page's heading (court, masthead, company, subject) */
  heading: string;
  /** small header lines under the heading (case caption, From/To/Date, byline) */
  meta?: string[];
  /** article: the headline (every word must be in the script or sources) */
  headline?: string;
  /** the body, in order; long lines wrap (at most 7 lines after wrapping) */
  lines: string[];
  /** the index (0-based) in `lines` of the key line: the marker sweeps it */
  key: number;
  /** when the marker sweep starts (default: 35 % into the scene) */
  highlightAt?: At;
};
export type QuoteScene = SceneBase & { type: "quote"; text: string; who: string; source: string };
export type CompareSide = { label: string; value: string; note?: string };
export type CompareScene = SceneBase & { type: "compare"; title?: string; left: CompareSide; right: CompareSide; rightAt?: At; win?: "left" | "right" };
export type ChartScene = SceneBase & {
  type: "chart";
  kind: "bar" | "line" | "pie";
  title: string;
  /** axis labels (bar / line): what the bars are, what the values are */
  x?: string; y?: string;
  /** each piece builds on its `at` (default: spread over the first 60 %); `text` is the value as shown ("$3,000") */
  data: { label: string; value: number; text: string; at?: At }[];
};
export type EvidenceCard = { id: string; kind: "person" | "doc" | "place" | "object"; label: string; sub?: string };
export type EvidenceScene = SceneBase & {
  type: "evidenceboard";
  title?: string;
  /** 2-6 cards, pinned left to right (the camera pans across them in order) */
  cards: EvidenceCard[];
  /** strings between cards: [fromId, toId, label?] (labels must be facts the script states) */
  links?: [string, string, string?][];
};
export type RecapScene = SceneBase & { type: "recap"; title: string; points: string[] };
export type StatScene = SceneBase & { type: "stat"; value: string; label: string; sub?: string };
/** a shot of the theme's 3D kit: every field of that kit's shot (KIT_LAW3D.md / KIT_BIZ3D.md / KIT_CYBER3D.md) except
 *  `at`; `set`, `cam` and (for a people shot) `actors` are required */
export type Scene3D = SceneBase & { type: "scene3d"; set: string; cam: { preset: string; target?: unknown; [k: string]: unknown }; actors?: { id: string; [k: string]: unknown }[]; [k: string]: unknown };

export type DocScene = MapScene | TimelineScene | DocumentScene | QuoteScene | CompareScene | ChartScene | EvidenceScene | RecapScene | StatScene | Scene3D;

/** doc.json "chapters": the outline, decided before any chapter is written */
export type DocChapterRef = {
  /** the chapter's recipe file, "chapters/01.json" */
  file: string;
  title: string;
  /** the word the chapter starts on (YouTube timestamp); chapter 1 starts at the first word */
  from: At;
  /** when the chapter card plays (default `from`); never in the first 30 s (chapter 1's goes after the cold open) */
  card?: At;
};
/** chapters/NN.json: one chapter's scenes (the writer's unit of work) */
export type DocChapter = {
  chapter: number;
  /** the chapter's main 3D set (required when it has scene3d shots): its most-used set */
  heroSet?: string;
  scenes: DocScene[];
};

/** doc.json */
export type DocVideo = {
  kit: "doc";
  slug: string;
  theme: DocTheme;
  title?: string;
  music?: string;
  /** the cold-open title, top centre, from frame 0 ("*$54 MILLION* FOR PANTS": one *accent* word) */
  hook: { text: string; until?: At };
  /** the chapter outline, in order (>= 3) */
  chapters: DocChapterRef[];
  /** the voice: the global word timings every `at` resolves against */
  voice?: { timings: string };
  /** fields merged into the 3D kit's recipe (law3d / biz3d: "cast"; cyber3d: "cast", story devices ...) */
  kit3d?: Record<string, unknown>;
  /** where the facts come from: names, places, dates and numbers on screen must be in the script or here */
  sources?: string[];
  /** extra big-beat lines (words / "line:N") besides the scenes marked "beat" */
  beats?: At[];
  /** spoken figures that need no board, each with a reason ({ "word": "5:three", "why": "..." }) */
  numberExempt?: { word: At; why: string }[];
};

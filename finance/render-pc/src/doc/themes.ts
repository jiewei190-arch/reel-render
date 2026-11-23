// Per-channel looks for the doc kit's 2D scenes: law = wood / navy / gold, biz = a clean bright document look, cyber =
// neon on dark glass. Every text colour is chosen to clear 4.5:1 on its fill (tools/doc_build.mjs checks the pairs).
export type DocLook = {
  id: "law" | "biz" | "cyber";
  /** the frame background (two stops of a radial gradient) and the texture tint */
  bg: string; bg2: string; tex: string;
  /** main text on the background, secondary text, the accent (titles, rules, markers), a second accent (negative) */
  ink: string; dim: string; accent: string; accent2: string;
  /** text on the accent fill */
  onAccent: string;
  /** cards / panels: fill, edge, text, secondary text */
  card: string; cardEdge: string; cardInk: string; cardDim: string;
  /** a stressed value on a card (the "after" side of a compare) */
  cardHot: string;
  /** a document page: paper, ink, marker */
  paper: string; paperInk: string; paperDim: string; marker: string;
  /** maps: water, land, the region, its edge, pins */
  water: string; land: string; region: string; regionEdge: string; pin: string;
  /** evidence board: the board surface, string colour, pin colour */
  board: string; string: string;
  /** captions: the spoken word */
  hot: string;
  /** chapter card: tab colour and edge */
  chapterTab: string; chapterEdge: string;
};

export const LOOKS: Record<"law" | "biz" | "cyber", DocLook> = {
  law: {
    id: "law", bg: "#13213A", bg2: "#08101F", tex: "#2A1C10",
    ink: "#F7F1E2", dim: "#C9B994", accent: "#E8B44A", accent2: "#E0604F", onAccent: "#140C04",
    card: "#F3EAD7", cardEdge: "#8A6A2E", cardInk: "#1A1410", cardDim: "#5A4A34", cardHot: "#A3271B",
    paper: "#F5EEDC", paperInk: "#1A1410", paperDim: "#5A4C38", marker: "#F2C94C",
    water: "#0B1830", land: "#1F2E48", region: "#3A4E72", regionEdge: "#E8B44A", pin: "#E0604F",
    board: "#7A5230", string: "#B3261E",
    hot: "#E8B44A", chapterTab: "#E8B44A", chapterEdge: "#8A6A2E",
  },
  biz: {
    id: "biz", bg: "#F4F6F9", bg2: "#E3E8F0", tex: "#D5DCE6",
    ink: "#0E1726", dim: "#4A5870", accent: "#1C5BBF", accent2: "#C62828", onAccent: "#FFFFFF",
    card: "#FFFFFF", cardEdge: "#C8D2E0", cardInk: "#0E1726", cardDim: "#4A5870", cardHot: "#C62828",
    paper: "#FFFFFF", paperInk: "#0E1726", paperDim: "#4A5870", marker: "#FFE066",
    water: "#DCE6F2", land: "#C3CEDC", region: "#1C5BBF", regionEdge: "#0E3A82", pin: "#C62828",
    board: "#E9EDF3", string: "#C62828",
    hot: "#F5B324", chapterTab: "#1C5BBF", chapterEdge: "#C62828",
  },
  cyber: {
    id: "cyber", bg: "#0A1020", bg2: "#03060D", tex: "#0F2A44",
    ink: "#EAF6FF", dim: "#8FA6C6", accent: "#19E6FF", accent2: "#FF2BD6", onAccent: "#03060D",
    card: "#0B1424", cardEdge: "#19E6FF", cardInk: "#EAF6FF", cardDim: "#8FA6C6", cardHot: "#FF2BD6",
    paper: "#0D1A2C", paperInk: "#EAF6FF", paperDim: "#8FA6C6", marker: "#7A1FA8",
    water: "#040912", land: "#0E1C30", region: "#123A55", regionEdge: "#19E6FF", pin: "#FF2BD6",
    board: "#081221", string: "#FF2BD6",
    hot: "#19E6FF", chapterTab: "#19E6FF", chapterEdge: "#FF2BD6",
  },
};

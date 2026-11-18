// The Pig War cast in the blocky family. Each: ONE main colour + ONE silhouette accessory, our own faces and outfits.
//   redcoat  red coat, white cross belts, a tall black fur block hat
//   bluecoat blue coat, gold buttons, a forward-tilted cap with a visor
//   farmer   green shirt, suspenders, beard, a wide straw hat
//   official (company man) plum-grey coat, mutton chops, a top hat
// Skin tones vary across the extras; nobody uses the yellow-head / blue-torso / green-legs scheme, no studs anywhere.
import type { Look } from "../blocky/Blocky";

export const SKINS = ["#f2c7a2", "#d9a07a", "#b97a52", "#8a5638", "#f6dcc4", "#c98e66"];
const HAIR = ["#3a2416", "#6a4426", "#1e1612", "#8a5a2a", "#4a3020"];

export const REDCOAT: Look = { skin: SKINS[0], shirt: "#c8302a", pants: "#2c2a38", shoes: "#1a1820", sole: "#3a3442", hair: HAIR[0], hairStyle: "crop", accent: "#f2ece0", print: "xbelt", cheeks: "none", belt: "#f2ece0", cuffs: "#f2ece0", acc: { bearskin: ["#18151c", "#f2ece0"] } };
export const BLUECOAT: Look = { skin: SKINS[2], shirt: "#2c5cc0", pants: "#7088b4", shoes: "#1a1820", sole: "#3a3442", hair: HAIR[2], hairStyle: "crop", accent: "#f0c040", print: "buttons", cheeks: "none", belt: "#22222a", cuffs: "#1f3f88", acc: { kepi: ["#1f3470", "#f0c040"] } };
export const FARMER: Look = { skin: SKINS[0], shirt: "#3c9a48", pants: "#6a4a2e", shoes: "#3a2a20", sole: "#7a5a3a", hair: "#8a5a2a", hairStyle: "crop", accent: "#6a4a2e", print: "straps", cheeks: "freckles", beard: "#6a3e1c", cuffs: "#e8dcc0", acc: { straw: ["#ecc85e", "#c0402e"] } };
export const OFFICIAL: Look = { skin: SKINS[4], shirt: "#4e4560", pants: "#2c2834", shoes: "#141218", sole: "#2c2834", hair: "#c9b8a0", hairStyle: "crop", accent: "#9a2a2a", print: "bow", cheeks: "none", chops: "#c9b8a0", cuffs: "#efe6d4", belt: "#2c2834", acc: { tophat: ["#26222c", "#9a2a2a"] } };

/** extras of a side: varied skin, hair, moustaches; same coat + accessory */
export const extra = (base: Look, i: number): Look => ({ ...base, skin: SKINS[(i * 2 + 1) % SKINS.length], hair: HAIR[i % HAIR.length], moustache: i % 3 === 1 ? HAIR[(i + 2) % HAIR.length] : undefined });

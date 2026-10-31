// cast.js — the "What If You Could Level Up Your Strength Every Day?" cast (ep 5, classic What If style). Signature colours are FIXED for the whole video.
// Outfits feed drawFigure(). Accessories the rig has no field for (scarf, lanyard) are drawn by sets/actors.js.
export const HERO  = { top: 'hoodie',    color: '#1f2d52', legs: '#3a3d44', head: 'spiky', hair: '#6b3f23' }; // "you": NAVY bomber-style jacket (cyan trim drawn locally), short dark CHESTNUT hair with a front swoop, charcoal joggers, white trainers. Eyes never glow.
export const MINA  = { top: 'tshirt',    color: '#34293f', legs: '#2a2438', head: 'bun',    kid: true, scarf: '#d4262e' };       // little sister: child scale, RED SCARF
export const DEV   = { top: 'tshirt',    color: '#3c4058', legs: '#262a3c', head: 'beanie', headColor: '#f08a24' };             // best friend: ORANGE BEANIE
export const LIN   = { top: 'labcoat',   face: 'glasses', head: 'bun', legs: '#2c3040', lanyard: '#2fb85a' };                    // scientist: white coat, GREEN LANYARD
export const TOMAS = { top: 'tracksuit', color: '#46543a', color2: '#46543a', legs: '#2d3326', head: 'cap', headColor: '#2f6fd0' }; // ranger: BLUE CAP
export const VOLUNTEER = { top: 'tshirt', color: '#4a4a5c', legs: '#2a2a38', head: 'none' };                                      // background people (no colour item)
export const CAST = { HERO, MINA, DEV, LIN, TOMAS };
export const BISCUIT = { fur: '#2a2230', collar: '#9a5ad6', eye: '#c8f07a' };                                                     // the cat: PURPLE COLLAR
// heat (0..1) each character radiates in THERMAL VIEW. Skin/head is hottest; clothing cooler.
export const BODY_HEAT = { HERO: 0.86, MINA: 0.8, DEV: 0.84, LIN: 0.85, TOMAS: 0.84 };

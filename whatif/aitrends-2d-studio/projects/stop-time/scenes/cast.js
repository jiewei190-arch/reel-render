// cast.js — "What If You Could Freeze Time for 10 Seconds?" cast (I.Awaken ep, classic What If style).
// Outfits feed drawFigure(). Accessories the rig has no field for (scarf, lanyard) are drawn by sets/actors.js.
export const HERO  = { top: 'tshirt',    color: '#2f8f8a', color2: '#efe3c8', legs: '#24305e', head: 'spiky', hair: '#16141c' }; // "you": SHAGGY BLACK hair with one cowlick up, round tortoiseshell glasses + striped teal/cream long-sleeve tee + navy star pyjamas + mismatched socks (green/yellow) drawn locally
export const MINA  = { top: 'tshirt',    color: '#34293f', legs: '#2a2438', head: 'bun',    kid: true, scarf: '#d4262e' };       // little sister: child scale, RED SCARF
export const DEV   = { top: 'tshirt',    color: '#3c4058', legs: '#262a3c', head: 'beanie', headColor: '#f08a24' };             // best friend: ORANGE BEANIE
export const LIN   = { top: 'labcoat',   face: 'glasses', head: 'bun', legs: '#2c3040', lanyard: '#2fb85a' };                    // scientist: white coat, GREEN LANYARD
export const TOMAS = { top: 'tracksuit', color: '#46543a', color2: '#46543a', legs: '#2d3326', head: 'cap', headColor: '#2f6fd0' }; // ranger: BLUE CAP
export const VOLUNTEER = { top: 'tshirt', color: '#4a4a5c', legs: '#2a2a38', head: 'none' };                                      // background people (no colour item)
export const CAST = { HERO, MINA, DEV, LIN, TOMAS };
export const BISCUIT = { fur: '#2a2230', collar: '#9a5ad6', eye: '#c8f07a' };                                                     // the cat: PURPLE COLLAR
// heat (0..1) each character radiates in THERMAL VIEW. Skin/head is hottest; clothing cooler.
export const BODY_HEAT = { HERO: 0.86, MINA: 0.8, DEV: 0.84, LIN: 0.85, TOMAS: 0.84 };

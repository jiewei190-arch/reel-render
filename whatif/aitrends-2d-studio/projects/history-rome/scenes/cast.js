// cast.js — I.Awaken History Hook ep 1 "How Did the Roman Empire Get Destroyed?" (classic I.Awaken style: black round heads, rig2d bodies).
// Outfits feed drawFigure(); everything Roman the rig can't do (toga/palla drape, segmented armour, helmets, laurel wreaths, cloaks, braids)
// is drawn by sets/romans.js on top. FAMILY COLOUR = moss green #5f7f3a (every generation of Livia's family wears one moss-green item).
export const LIVIA   = { top: 'dress',  color: '#b9a98a', legs: '#6b5a44', head: 'curly', hair: '#16141c', kid: true, palla: '#5f7f3a', pallaTrim: '#efe3c8', coin: true }; // 410: girl ~12, dark curls tied back, MOSS-GREEN palla (shawl) with a cream border, the family coin on a cord
export const GAIUS   = { top: 'tshirt', color: '#a8322b', legs: '#5a3a2a', head: 'none', armour: 'lorica', helmet: 'legion', scarf: '#5f7f3a' }; // 117: young legionary, RED tunic, segmented armour, helmet with cheek guards, MOSS-GREEN neck scarf
export const FELIX   = { top: 'tshirt', color: '#c9b892', legs: '#6b5a44', head: 'curly', hair: '#16141c', apron: '#5f7f3a' };            // 235-260s: baker, cream tunic, MOSS-GREEN apron, flour on the sleeves
export const FELIX2  = { top: 'tshirt', color: '#bfae86', legs: '#5d4e3c', head: 'none', beard: true, apron: '#5f7f3a' };                // Felix's son (270s-301): same apron, a short beard
export const EMPEROR = { top: 'tshirt', color: '#e8e0cc', legs: '#e8e0cc', head: 'none', cloak: '#6a2a7a', wreath: true };                 // generic emperor: white tunic/toga, PURPLE cloak, gold laurel wreath; told apart by a NAME CHIP
export const ALARIC  = { top: 'tshirt', color: '#5a4a34', legs: '#3b3226', head: 'none', cloak: '#3d3a33', fur: '#9a8a6a', braid: true, shield: '#b8322a' }; // Gothic commander: fur-trimmed cloak, long braid, round shield with a red sun
export const ODOACER = { top: 'tshirt', color: '#4a3a2c', legs: '#2e261e', head: 'none', cloak: '#7a2a24', beard: 'big' };                // big bearded general, DARK-RED cloak, calm
export const ROMULUS = { top: 'tshirt', color: '#e8e0cc', legs: '#e8e0cc', head: 'none', kid: true, cloak: '#6a2a7a', wreath: 'big' };    // the boy emperor: too-big wreath that slips
export const GOTH_MUM = { top: 'dress', color: '#6a5a7a', legs: '#3a3240', head: 'bun', hair: '#16141c' };                                // the Gothic family on the Danube bank (376)
export const GOTH_DAD = { top: 'tshirt', color: '#5a6a4a', legs: '#33382a', head: 'none', cloak: '#4a4038', beard: true };
export const GOTH_BOY = { top: 'tshirt', color: '#8a6a3a', legs: '#4a3a2a', head: 'spiky', hair: '#16141c', kid: true };
export const SOLDIER = { top: 'tshirt', color: '#a8322b', legs: '#5a3a2a', head: 'none', armour: 'lorica', helmet: 'legion' };             // generic legionary (extras: vary the shield emblem, never the moss-green scarf)
export const LATE_SOLDIER = { top: 'tshirt', color: '#8a6a4a', legs: '#4a3a2a', head: 'none', armour: 'mail', helmet: 'ridge' };          // 4th-5th c. soldier: mail, ridge helmet, oval shield
export const CITIZEN = { top: 'tshirt', color: '#8a7a64', legs: '#5a4e40', head: 'none' };                                                // background Romans (one signature colour each, never moss green)
export const CAST = { LIVIA, GAIUS, FELIX, FELIX2, EMPEROR, ALARIC, ODOACER, ROMULUS, GOTH_MUM, GOTH_DAD, GOTH_BOY, SOLDIER, LATE_SOLDIER, CITIZEN };
// compatibility with the shared sets copied from earlier episodes (actors.js / faces.js / creatures.js import these names)
export const HERO = LIVIA, MINA = { ...LIVIA, scarf: '#5f7f3a' }, DEV = FELIX, LIN = EMPEROR, TOMAS = SOLDIER;
export const BISCUIT = { fur: '#2a2230', collar: '#5f7f3a', eye: '#c8f07a' };   // (a street cat in Rome, if anyone needs one)
export const BODY_HEAT = {};

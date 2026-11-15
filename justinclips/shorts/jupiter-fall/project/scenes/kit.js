// Toon 3D captions (1-3 words, lower-middle) + the ONE top caption of the triple hook (0-3.6 s, global time).
import { E } from '/engine/core.js';
import { drawToonCaption } from '/kits/toon3d/captions.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
import { topCaption } from './_lib.js';
useToonTransitions();
E.captionFn = (g, t) => { drawToonCaption(g, t, { ...(E.cfg.captionStyle || {}) }); topCaption(g, t, 'Jupiter has no ground.\nAt all.', 0, 3.6); };

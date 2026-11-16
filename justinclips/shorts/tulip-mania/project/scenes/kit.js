// Toon 3D captions (1-3 words, digits for numbers) + the kit's iris / whipBlur transitions.
// Shots with "captions": false in shots.json (insert cards) hide the word captions; nothing here is timed in seconds.
import { useToonCaptions } from '/kits/toon3d/captions.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
useToonCaptions();
useToonTransitions();

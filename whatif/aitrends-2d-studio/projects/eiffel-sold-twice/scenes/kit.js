// Toon 3D captions (1-3 words, digits for numbers) + the kit's iris / whipBlur transitions.
import { useToonCaptions } from '/kits/toon3d/captions.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
useToonCaptions({ hide: [[5.1, 7.0]] });
useToonTransitions();

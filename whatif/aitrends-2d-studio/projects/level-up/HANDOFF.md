# HANDOFF: "What If You Could Level Up Your Strength Every Day?" (What If ep 5, 16:9 1080p24, 419.0 s)

Script + sources + STYLE: `whatif/what-if-levelup/` (script.md, sources.md, **STYLE.md: read it first, its DO/DON'T list is mandatory**).
Voice landed: Fenrir, `input/voiceover.wav` 418.97 s, 1,003 words, transcribe 95%; `timeline/words.json` is the word clock.

## OWNER DECISION (Oct 31): ep 5 uses the SAME CLASSIC STYLE as eps 1-4 (aitrends kit: black round heads, rig2d actors, giantFace, ruleCard, bp blueprints).
The rig5/town5 look-dev below is SHELVED (kept on the worker branches, not used). KEEP from Stage 0: sets/statcard.js (H2: The Zip + Stat Card + LEVEL UP pop) and sets/fx5.js (H3: steam aura, bloom, slow-mo, ground crack...), both integrated here, plus all the ep 1-4 sets (home3 kitchen/bedroom, apartment living room, garden driveway/lawn/patio, park at night, street). HERO = cast.js (navy jacket, chestnut spiky hair via faces.js; draw the cyan zip/cuff trim locally).

## (shelved) WHY THIS EPISODE WAS GOING TO BE DIFFERENT: an ART UPGRADE (owner: "the art looks off, the next one we make better")
The owner wants a leveling-anime FEEL (dark ink-navy night, cyan holographic stat card, gold LEVEL UP pop, bloom, rim light, steam aura,
low angles, smash cuts, hype level-ups) with ORIGINAL designs (STYLE.md DON'T list: nothing copied from the series that inspired it).
The old flat black-round-head look is NOT good enough for this one. Stage 0 builds NEW, sharper models and look-dev frames that the OWNER
APPROVES before any shot is animated. Quality target: think a polished modern 2D animated YouTube channel: clean silhouettes, readable
faces with real eyes/brows/mouth on skin-toned faces, hair with shape and highlights, layered clothing with folds and shading (2-3 tones +
rim light), proper proportions (hero ~7 heads tall, lean), smooth arcs.

## Stage 0: look-dev (now). Each worker writes ONLY its own files; each ships DEMO_<name>.js with demo_* ids + 3 stills to the outbox.
| Who | Files | What |
|---|---|---|
| H1 | engine-free `sets/rig5.js` + DEMO_rig5.js | NEW CHARACTER RIG for ep 5 (do not modify engine/rig2d.js): `hero5(g, x, y, s, {pose, face, look, blink, talk, t, glow})` with the STYLE.md hero (lean, short dark chestnut hair with one stubborn front swoop, warm brown eyes that never glow, navy hip-length bomber with cyan zip pull + cyan cuff stripes, white tee, charcoal joggers, white trainers), skin-toned face with expressive eyes/brows/mouth, 3-tone cel shading + rim light, poses: stand, idle breathe, shock, grin, deadlift (setup/pull/lockout), overhead lift, push (feet planted), sink (ankles in ground), run, sleep, eat cereal. Plus `mina5`, `dev5` (same style: Mina red scarf, Dev orange beanie + phone) and `biscuit5`. A big close-up `face5(g, cx, cy, r, {who, expr, look, blink, glowReflect})` with the HUD's cyan reflecting on the cheeks. |
| H2 | `sets/statcard.js` + DEMO_statcard.js | Our ORIGINAL HUD per STYLE.md: "The Zip" rift (a small zipper-edged tear in the air with gold sparks) that the "Stat Card" unfolds from (rounded translucent glass #123A5E ~55%, thin cyan #3FE0FF frame, gold level badge, STR in kg with a dumbbell icon, chevron XP bar, extra red/coral warning line support like "Bones: not included."), the gold "LEVEL UP!" pop (flash #FFF3C4, scale snap, sparks), number roll-ups, open/close animations, a tiny version for Biscuit's head. NO words from the DON'T list ("System", "Quest", "Player"...). |
| H3 | `sets/fx5.js` + DEMO_fx5.js | Effects + grade: bloom/glow pass, cyan/violet rim-light helper, STEAM AURA (rising wisps from the body at night, it's body heat), slow-mo helper (time remap + motion streaks), smash-cut flash, impact frame, ground crack + soil sink + tile crack, dust, speed lines, low-angle camera helper, night colour grade per STYLE.md palette (ink-navy, never pure black). |
| H4 | `sets/town5.js` + DEMO_town5.js | Sets in the new style: home kitchen at breakfast (cereal bowl where The Zip opens), living room with the sofa (Biscuit asleep on it), driveway + family car + lawn + Mum's patio tiles, the night park on a hill road with sodium streetlights (#FF9F43) and a town view, a muddy field road with a truck full of festival pumpkins stuck (planks, gravel, sand props). Layered parallax, practical lights, atmosphere. |
| PC | look-dev frames (after H1-H4 push) | `scenes/shots/LOOKDEV.js`: compose 4 hero frames from the new pieces: (1) breakfast: The Zip opens over the cereal, Stat Card "LEVEL UP!", Dev reading it; (2) the sofa lift with Biscuit asleep; (3) night park, steam aura, low angle, bloom; (4) the car lift sinking into the lawn. Render each at full 1080p and send them to the owner for approval. |

Push to your own branch; status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot list + batches only after the owner approves the look.

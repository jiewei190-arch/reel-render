# Batch H: 12 Halloween reels (URGENT, posting Oct 28-31)

The owner wants 12 Halloween reels posted Oct 28-31, 3 extra per day (11:00 AM, 3:00 PM, 9:00 PM ET), on top of the existing schedule.
Four worker sessions build 3 reels each, in order. Speed matters: push each reel the moment it is done, and keep reels at 66-74 s so renders stay short.

## Read first (this branch: claude/reel-studio-handoff-f70dcj)
HANDOFF.md (rules 1-13), TEMPLATES.md (29 approved styles), HOOKS.md (rules + checklist), STYLE_FIT.md (incl. the REJECTED section), reels/USAGE_SAVERS.md, reels/PRIMITIVES.md.

Setup:
- Voice model in tts/ (see README).
- `pip install "playwright==1.63.0"` and set `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` for every render.py, rq.sh or thumb.py call. Never run `playwright install`.
- Clone the style repos into /home/claude/styles-src.
- Get demo videos with `reels/fetch_demos.sh <id>`: 78, 80, 83, 99, 101, 102, 115, or t21-t29 for the newer templates.
- lemo-opuscar templates (#1-#12) have real source in /home/claude/styles-src/lemo-opuscar/styles/<slug>.
- Reuse existing modules where they exist: reels/styles/{celboil,blueprint,popup,shadowpuppet,silkscreen-poster,distilbook,alchemy,aidoom,fieldbook,...}.

## Non-negotiables (owner rules)
- af_heart voice (copy specs/leaf.json settings).
- 66-86 s (aim 66-74).
- The last spoken line and the end card are exactly "Follow for more of how it really works."
- Every claim sourced in sources_<n>.md; soften or drop anything unverifiable; list softened claims in NOTES.md.
- Halloween but **educational, nothing gory or crude, no realistic photos**. Spooky-fun, never scary-gross.
- Reproduce the template's REAL demo (watch its frames); a loose interpretation counts as a fail (see STYLE_FIT REJECTED: flat generic cartoon, static repeated diagrams, no texture = never).
- HOOKS.md:
  - first line of 12 words or fewer;
  - frame 0 shows the subject, large and already moving;
  - a 3-6 word on-screen caption;
  - a "but" turn by 5 s;
  - the question answered at 45-70 s.
- New mix2.py (fx_gain 0.5, ducked). Never raise effects.
- Thumbnail: window.thumb() + reels/thumb.py -> jobs/<n>/thumb_<n>.jpg, template-styled, 2-4 words matching the hook, inside y 300-1620.
- QA: contact sheet + frame 0 + last frame; no blank or near-blank frames; no overlaps or clipped text.
- NEVER post, schedule, or touch any account or the owner's computer.

## Per reel, push to your branch as soon as each step is ready
1. `jobs/<n>/preview_<n>.mp4` (8 s with voice), as soon as the opening renders.
2. The final set:
   - `jobs/<n>/<n>.mp4`;
   - `thumb_<n>.jpg`;
   - `caption_<n>.md` (description + "Sources: ..." + the closing line + 5 hashtags including #halloween, ending #reels);
   - `sources_<n>.md`;
   - `NOTES.md` (template, what you copied from the demo, softened claims);
   - the code (t_<n>.js, specs, ev, style module).
3. Add a row to STYLE_FIT.md.
After each final push, send the main session a one-line message (send_message to the parent session), then start the next reel.

## Assignments (build in this order)
| Session | Reel | Topic + hook direction | Template |
|---|---|---|---|
| H1 | glowstick | How a glow stick glows with no battery (chemiluminescence: snap the inner vial, two chemicals mix, energy comes out as light; cold light) | #11 cel-boil (snap = action; reuse reels/styles/celboil) |
| H1 | ouija | Why a Ouija board's pointer moves (the ideomotor effect: tiny unconscious muscle movements; the classic blindfold tests) | #6 shadow-puppet (spooky theatre; reuse reels/styles/shadowpuppet) |
| H1 | skeleton | What your skeleton really does all day (206 bones in adults, babies are born with more that fuse, living tissue, makes blood cells in marrow, stores calcium) | #10 paper-popup (pop-up skeleton; reuse reels/styles/popup) |
| H2 | faces | Why you see faces (and "ghosts") in pumpkins, clouds and outlets (pareidolia; the brain's fast face detection) | #13 AI Doom (brain metaphors; reuse reels/styles/aidoom) |
| H2 | zombieant | The fungus that turns ants into "zombies" (Ophiocordyceps: steers the ant to bite a leaf at the right height, then grows out to spread spores; strictly non-gory, stylised) | #19 handdrawn "Sketch music" (demo 102: pencil landscape, eerie calm) |
| H2 | spidersilk | Why spider silk is so strong for its weight (protein, spun from spinnerets, stretch + strength; how a web catches prey) | #3 blueprint (engineering; reuse reels/styles/blueprint) |
| H3 | foxfire | Why some mushrooms glow in the dark (fungal bioluminescence, "foxfire" on rotting wood; luciferin-type reaction; theory that glow attracts insects) | #1 paper-lantern (lemo-opuscar source: night, glowing paper) |
| H3 | catseyes | Why cats' eyes glow in the dark (tapetum lucidum mirror layer behind the retina; second chance to catch light; why phone flash photos glow) | #21 Storybook paint (demo t21) |
| H3 | harvestmoon | Why the October moon looks huge and orange (moon illusion near the horizon; orange from light passing through more atmosphere; "hunter's moon") | #25 Ink moon (demo t25) |
| H4 | darkeyes | Why the dark gets less dark after a few minutes (dark adaptation: rods vs cones, rhodopsin rebuilds, about 20-30 minutes; red light keeps night vision) | #16 cinematic3d "Christmas story" (demo 99; reuse submarine's film-look module) |
| H4 | owl | How owls fly almost silently (comb-like leading-edge feathers, soft fringes, velvety surface break up turbulence) | #4 crayon-book (lemo-opuscar source) |
| H4 | pumpkin | Why a carved jack-o'-lantern rots so fast (cut surface lets water out and mould and bacteria in; tips that slow it, like keeping it cool and dry) | #18 handdrawn "Japan heat wave" (field notebook; reuse reels/styles/fieldbook) |

If a topic can't be sourced well, tell the main session and propose a swap before building. Don't build an unsourced reel.

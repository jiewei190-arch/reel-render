# Batch C (worker session): flush, airfryer, submarine, one at a time

Read HANDOFF.md, TEMPLATES.md, README.md, reels/USAGE_SAVERS.md and reels/PRIMITIVES.md first. HANDOFF.md section 2 rules apply exactly:
- af_heart voice (copy specs/leaf.json settings).
- 66-86 s.
- Last spoken line and end card are exactly "Follow for more of how it really works."
- Every claim sourced; soften or drop what you can't verify.
- No realistic photos.
- NEVER post, schedule or touch any account.
Setup: install the voice model as in README (tts/). Clone the style repos into /home/claude/styles-src. Run `reels/fetch_demos.sh` to get the demo videos and their contact sheets.

STYLE (strict): build each reel in the template named below. Reproduce that demo's actual animation language and formatting, not a lookalike: watch the demo video frame by frame (ffmpeg stills), and copy its layout, type, palette, transitions, camera and texture. Only topic, voiceover and objects are new. The demos are 16:9; recompose for 9:16 the way the earlier template reels did (see reels/styles/celboil, blueprint, popup). Write in NOTES.md what you copied from the demo.

| name | topic | template | demo |
|---|---|---|---|
| flush | How a toilet flushes (the siphon) | #17 handdrawn "Playful" | demo115.mp4: crayon/watercolour kid drawings on warm paper, black ink outlines, bouncy pop-in stickers, big rounded words, cute faces on objects |
| airfryer | How an air fryer cooks (a small convection oven, not frying) | #9 scifi-toon | /home/claude/styles-src/lemo-opuscar/styles/scifi-toon (STYLE.md, DEMO.md, demo/): sage lab interior, thick-outline cartoon cast, bold title lockup |
| submarine | How a submarine dives and surfaces (ballast tanks, buoyancy) | #16 cinematic3d "Christmas story" | demo99.mp4: sepia-to-blue film look, silhouettes with glowing windows, grain, vignette, film-frame border, italic serif captions |

Per reel:
1. Research with the "can this blow up" lens (surprising first 3 s, a myth corrected, a question near the end). Write sources_<n>.md as you go.
2. Write the script and spec, then voice2.py and mix2.py.
3. Write the scenes.
4. As soon as the first scenes render, push an 8 s preview with voice to jobs/<n>/preview_<n>.mp4 and keep going. The main session shows it to the owner and may push feedback to jobs/<n>/FEEDBACK.md. Check for it (git pull) before the full render.
5. Full render (rq.sh <n> 9301 9302, one at a time), then enc_hq.sh.
6. Contact sheet with contact.py plus the last frame. Check for blank first frames, clipped or overlapping text and empty areas.
7. Push jobs/<n>/{<n>.mp4, caption_<n>.md, sources_<n>.md, NOTES.md}. NOTES.md must list the template, what was copied, softened claims and caveats. Also push the style code under reels/styles/ and t_<n>.js/specs.
8. Delete frames/<n>.
Work on your own branch. When all 3 are pushed, stop and report.

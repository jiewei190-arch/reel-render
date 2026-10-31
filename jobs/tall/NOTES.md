# tall: "Why you're taller in the morning" (Short + long-form)

FOR THE OWNER'S NEW STICK-MAN CHANNEL, NOT howitreallyworkstudio. No HIRW branding: header reads "STICKMAN SKETCHBOOK",
no @handle, end card "Thanks for watching! / Follow for more" (Short) or "Subscribe for more" (long-form), and the spoken
closing line is "Follow for more." / "Subscribe for more videos like this." Characters are stick men (D.person in distilbook.js).

Template: #15 handdrawn "Distilbook" (awesome-opus-5-5-video-styles, styles/handdrawn.md, "Distilbook Motion Graphics Showreel").
Why: the topic is an anatomy-plus-data explainer (spine stack, disc cross-section, a 24 h height graph), which is exactly
the Distilbook demo's grammar: a white sketchbook card on a pale studio frame, fine wobbly ink diagrams, coloured-pencil
hatching (yellow sun, blue water), handwritten labels with blue keywords, circled notes, a player bar inside the card and a
karaoke caption under it. It is also the closest of the 19 templates to the doodle look that works for Ink Explainer.

Files
- reels/styles/distilbook/distilbook.js: new style module (portrait or landscape), fonts in styles/distilbook/fonts (Patrick Hand, OFL).
- reels/tall_boards.js: the sketchbook pages (shared by both versions). reels/tall_story.js: runner (board runs, stage cues, chapters, side notes).
- specs/tall.json (Short, 19 phrases, 68.6 s), specs/tallyt.json (long-form, 66 phrases, 5:38, landscape, 7 chapters).
  "stages" = per board run, [beat, offset] cue times; "opts" = per run board options; "pause" = extra silence after a phrase (chapter breaks).
- reels/mkev_tall.py: sound events from the stage cues. reels/rq4.sh: 4-chunk render for 4-CPU machines (VW/VH env for landscape).
- render.py now reads VW/VH (viewport) and CHROME (browser path) from env; voice2.py reads optional spec "pause".

Outputs (not in git, too big): reels/up/tall.mp4 (Short, 2-pass ~9.6 MB), reels/out/tallyt.mp4 (long-form 1080p).

Caveats
- Human ear check of the voice is still pending.
- Long-form is the first 16:9 build. Channel name not decided yet: add it to the end card once chosen.
- See sources_tall.md for softened claims.

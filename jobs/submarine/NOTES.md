# submarine: How a submarine dives and surfaces (ballast tanks, buoyancy)

- Template: #16 cinematic3d "Christmas story" (demo99). Duration 73.4 s (v2), 1080x1920, af_heart 0.97, music crayon 88 bpm.
- Why: the demo's night-time silhouettes with warm glowing windows and its sepia-to-blue grade map onto a surface-to-depth story: sepia above water, blue-lavender once the sub goes under, the lit tanks of air as the "windows".
- Code: reels/styles/cinefilm/cinefilm.js (new module), reels/t_submarine.js, t_submarine.html, specs/submarine.json, ev_submarine.json.

## Copied from the demo (studied frame by frame with ffmpeg stills)
- Old-film presentation: picture inside a rounded projector-gate frame on black, heavy animated grain, exposure flicker, gate weave, strong vignette, dust specks and the odd hair.
- Grade: monochrome sepia for the first act that drifts to blue-lavender later; warm light (windows, lanterns) added after the grade so it stays warm and blooms.
- Flat dark silhouettes against mid-tone grounds; glowing windows with soft halos; falling snow and twinkling stars; one shooting star near the end.
- Opening on a single glowing round light in the dark that the camera pulls back from (the demo's first shot), slow lateral drift, fades through dark between shots.
- The wavy black foreground band across the bottom of the picture, with the line of narration written in word by word in an italic Didone face (Playfair Display Italic), left-aligned like the demo's lyric line.
- The demo's wall clock became a glowing depth gauge; the porch lantern became the lamp on the sail.
- End card: dark frame, a small glowing star, the closing line in the italic face centred (the demo's "I'm Your Comet" card).
- Recomposed for 9:16: taller sky/sea, subject in the middle, caption band at the bottom inside the gate.

## Softened / unverified claims
- "Many fish" (bony fish only have swim bladders). "Every trick at once" paraphrases Wikipedia's "all depth and trim control methods are used simultaneously".
- Visual liberties: portholes and lit tanks are stylised (real subs have no windows); tank layout is schematic.
- Audio: human ear check still pending.

## v2 (Oct 27): HOOKS.md
- Hook: "To dive, a submarine lets the ocean in on purpose." (10 words, HOOKS.md option 1) + "But then, how does it ever come back up?" by 5 s; the gap is closed by the compressed-air blow at ~46-56 s.
- Frame 0: the cutaway sub on the surface with vents already popping, air geysering out and sea flooding the tanks; burned-in italic caption "Let the ocean in." (then "How does it come back up?"). This replaces the demo's slow pull-back from a single glowing light (HOOKS.md rule 2: no slow zoom from empty space).
- Thumbnail: thumb_submarine.jpg ("Let the ocean in." over the flooding cutaway in the film look), checked in the 3:4 grid crop.
- Mix: new mix2.py (effects at half level, ducked under the voice).

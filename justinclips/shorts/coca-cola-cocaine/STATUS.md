STATE: ready

# Justin clips Short: coca-cola-cocaine ("Did Coca-Cola Have Cocaine? Yes - Here's the Full Story 🥤")
- **Final video:** `video.mp4`, 1080x1920, 24 fps, **972 frames, 40.50 s** (audio 40.49 s), H.264 + AAC, **-14.1 LUFS, true peak -1.0 dBFS**, 20.3 MB (no split needed).
- `video.sha256`: `2313b18d7b018360513f34a84dd770b12735a31d5ddff383b234dbdaed844c7d  video.mp4` (Git Bash: `sha256sum -c video.sha256`).
- **Upload package:** `UPLOAD.md` has the owner's title kept exactly plus 🥤 (57 chars), the description line, sources, "Voice is synthetic.", #history #cocacola #shorts, the pinned yes/no comment, and the cover frame (0.5 s).
- **Script / sources:** `script.md` and `sources.md`. Every claim was checked. Snopes, History.com, NYT and Britannica could not be opened from the cloud. The Atlantic and JSTOR Daily pieces the kit cites could not be found. The claims are backed by Smithsonian, The Coca-Cola Company, the New Georgia Encyclopedia, a DEA Federal Register notice (Stepan, 2024), Mental Floss, and Wikipedia citing NYT 1988.
- **Changed from the owner's kit after the fact-check:**
  - Line 6: "by 1903" became "**around** 1903" (sources say 1903 or 1904).
  - Line 7: "Coca-Cola STILL uses" became "**Coke reportedly** STILL uses" (the company neither confirms nor denies it).
  - Shot 8: the crate label "MERCHANDISE NO. 5" and the "guarded facility" were dropped. Merchandise 5-9 identities are "a matter of debate", and no source mentions guards. The crates say "COCA LEAVES", and the sign says "COCA LEAF IMPORTS / LICENSED · NEW JERSEY".
  - Shot 9: the "REMOVED" box only, with no crystals.
  - The Pope cameo plays on "It was sold as medicine." with on-screen text "EVEN THE POPE LOVED COCA WINE", so it sits next to the medicine/tonic claim and is not read as Coke.
  - On-screen "(cocaine-free)" was added under STILL CONTAINS COCA LEAVES.
- **Length:** 40.5 s. The owner's script read by Chatterbox D2 at Shorts pacing (gap 0.3 s) runs longer than the PDF's ~31 s estimate. Nothing was padded.
- **Formula check (preview + `preview/contact_sheet.png`):**
  - Frame 1 is the cola glass with a floating coca leaf, bubbles rising and the glass turning, with the hook "COCA-COLA REALLY HAD COCAINE IN IT" already on screen. Captions are hidden for line 1 so the hook isn't repeated.
  - Line 1 is 6 words. The "NOT A RUMOR" stamp lands at 2.9 s, and "1886 / morphine-addicted pharmacist" follows at 3.8 s.
  - 15 shots, a new visual every 1.3-3.6 s. The longest is the can, 5.2 s, with a push-in, a text pop and a wink.
  - Captions are 1-3 words at 66 % height, clear of the bottom title zone and the right-hand buttons.
  - The payoff, the can winking on "the legal part.", lands at 37.7 s. The closer "Subscribe for more." is 0.94 s.
  - The last frame is the frame-1 glass and camera (without the hook text), for a seamless loop.
  - Years are said "eighteen eighty-six" and "nineteen oh-three" (spelled for TTS by chatterbox_d2.py; Whisper heard both correctly). Captions show "1886" and "1903".
- **Effects used:**
  - Lighting: warm interiors; sunny sky and god rays outside.
  - Reactions: sparkle, "!", "?", sweat, hearts, stars, camera shake and a flash after each reveal. The fountain customer only gets cartoon sparkles.
  - 3 inserts: the 1903 calendar with the COCAINE REMOVED stamp, STILL CONTAINS COCA LEAVES, and ONLY ONE COMPANY / NEW JERSEY.
  - Transitions: whipBlur, iris (in and open), flash and whip.
  - Audio: `toon3d:curious` music ducked under the voice, plus 48 sfx cues (most on spoken words).
- **No real logo artwork:** the glass, bottle and can are generic toon designs. "COCA-COLA" appears only in plain block letters on the poster and the fountain sign.
- **Voice:** Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3), `--gap 0.3 --comma 0.15 --lead 0.15`. All 10 lines passed QA on seed 7 (`project input/voiceover.lines.json`). Word timings come from Whisper small.en (97 % aligned), with 5 onsets hand-fixed from Whisper word timestamps (noted in words.json).
- **Project:** `whatif/aitrends-2d-studio/projects/coca-cola-cocaine` (Toon 3D kit + BEANMEN FX). Re-render from `whatif/aitrends-2d-studio`:
  `node render.mjs --project projects/coca-cola-cocaine --out projects/coca-cola-cocaine/build/video_silent.mp4` (972 frames)
  `python audio/mix.py --project projects/coca-cola-cocaine --video projects/coca-cola-cocaine/build/video_silent.mp4 --out projects/coca-cola-cocaine/build/mixed.mp4`
  The mix landed at -14.5 LUFS / TP -1.5. The final used `build/mix.wav` +0.4 dB (-14.1 / -1.0), muxed onto the full silent render with `-c:v copy` (mix.py's own mux drops 2 frames).
- **Preview:** `preview/coca_cola_cocaine_preview_540x960.mp4`. It was made before 3 small fixes in the final: the pharmacy sign moved away from the "1886" tag, the pot opened so the leaves show, and the Pope camera and hearts no longer overlap the text.
- Rendered in the cloud (SwiftShader, 4 workers): preview 4m35s, full res 14m02s. Build frames deleted.
- Nothing was posted, uploaded or logged into.

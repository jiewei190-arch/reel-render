STATE: ready

# Sharks Are Older Than Trees. Seriously. (slug `sharks-older-than-trees`)
Branch `justinclips/sharks-older-than-trees` (started from origin/iawaken/toon3d-fx). Nothing was posted, uploaded or logged into.

## Final video
- `video.mp4`: 1080x1920, 24 fps, **847 frames, 35.29 s**, H.264 + AAC 192k, 18.6 MB (no split needed). `video.sha256` next to it.
- Loudness: **-14.2 LUFS integrated, true peak -1.2 dBFS** (ebur128 on the final file).
- Rendered fully in the cloud (SwiftShader, 4 workers, 7m33s). mix.py's own mux dropped 1 frame (846), so the mix (`build/mix.wav`) was muxed onto the full silent render with `-c:v copy`: all 847 frames kept.
- Checked: `preview_540x960.mp4` + `contact_sheet.png` (16 frames incl. frame 1 and the last frame, with the Shorts UI zones shaded red: captions and hook stay clear). Frame 1 = big hook title + grinning shark + scared sapling, already moving; last shot returns to the frame-1 composition for the loop.

## Voice
Chatterbox D2 (`whatif/voice/chatterbox_d2.py`, copied from origin/voice-test, `--gap 0.3 --comma 0.15 --lead 0.15`). All 8 lines passed Whisper small.en QA on seed 7; numbers were spoken as words ("four hundred fifty million", "three hundred fifty to three hundred ninety", "sixty", "two hundred"), captions show digits. Script alignment 93/93 words. Held beats ("...") before both punchlines. Closer "Subscribe for more." = 0.6 s of speech in a 1.4 s last shot, hard cut to frame 1.

## Fact check (details + URLs in sources.md)
- 450 Myr sharks, all five mass extinctions incl. the asteroid: confirmed by the NHM timeline page.
- Trees 350-390 Myr: Live Science gives ~380-390 Myr, Discover Wildlife 385 Myr; kept the owner's 350-390 range (it brackets both; tree definitions vary). The IFLScience page was not reachable from the cloud.
- ~200 Myr older than dinosaurs: NHM dates the first dinosaurs to ~245 Myr ago (450 - 245 = 205). OK.
- Atlantic: the owner's fact sheet says it began forming ~150 Myr ago; Britannica / The Conversation put the start of the opening (central North Atlantic) at **~180 Myr ago**. The narration doesn't say a number; the on-screen tag in s08 uses the sourced figure "PANGAEA SPLITS: ~180M YEARS AGO".
- No narration line needed changing. "Older than Saturn's rings" not used.

## Project (for re-renders)
`whatif/aitrends-2d-studio/projects/sharks-older-than-trees` (voiceover.wav git-added with -f; all sfx/music come from the kit's `toon3d:` library).
```
cd whatif/aitrends-2d-studio
node render.mjs --project projects/sharks-older-than-trees --out projects/sharks-older-than-trees/build/video_silent.mp4   # add --gl gpu on the PC
python audio/mix.py --project projects/sharks-older-than-trees --video projects/sharks-older-than-trees/build/video_silent.mp4 --out projects/sharks-older-than-trees/build/video_mix.mp4
ffmpeg -i build/video_silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k video.mp4    # keep all 847 frames
```
New, project-local 3D assets (`scenes/_lib.js`): toon shark, sapling with a face, friendly dinosaur, cartoon asteroid, cakes, party table, bunting, popcorn, glasses, newspaper, briefcase. Kit files were not changed.

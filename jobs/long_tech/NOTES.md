# long_tech: "6 Everyday Tech Secrets You Use Every Day (Explained)", first YouTube long-form video

- 16:9, 1920x1080, 30 fps, H.264 (target 8 Mbps, average ~5.3 Mbps because the panels are mostly still), AAC 192k 48 kHz stereo. Length 8:29 (509.4 s).
- Built by reels/longform.py (panels, centre assembly, audio, compose) and reels/longform_thumb.py (thumbnail). The build reads reels/specs/lt_*.json, the mix_lt_*.wav files, jobs/<n>/<n>.mp4 and the reel timelines (barcode, faceid, tap and wifi timelines came from the original worker branches; their totals match the final mp4s to within 0.03 s).
- **The mp4 is 351 MB, over GitHub's 100 MB file limit**, so it's pushed as 4 parts. Rebuild it with `cat long_tech.mp4.part-* > long_tech.mp4 && sha256sum -c long_tech.mp4.sha256`. preview_long_tech.mp4 (960x540, ~76 MB) is a quick-look copy, not for upload.

## Structure (added value for YouTube's reused-content policy)
- New narration, af_heart 0.97, mixed with mix2.py:
  - a 15.8 s cold open ("You use all six of these today. Do you know how any of them work?");
  - six 7-10 s bridges, each linking the chapter to the previous one;
  - a 29.4 s outro recapping the six ideas, asking "Which one surprised you most?" and ending "Follow for more of how it really works."
- Each reel plays at full height in the centre (608x1080) with its own audio. Its closing line and end card are cut: the cut is at the end of the second-last phrase + 0.35 s, with a 0.3 s audio fade.
- Bridges show the next reel at half speed (a 30% point teaser). The cold open is a montage of the six hooks. The outro plays each reel's key moment under its recap line, then a 2x3 grid of the six thumbnails.

## Panels (one neutral studio look)
- Paper texture, Anton + Inter, gold #FFCD40.
- Left: chapter pill, title, subtitle, "THE KEY IDEA" card, and the matching Short's thumbnail.
- Right: up to 3 fact cards that fade in at the moment the reel says each fact. Each card carries its source, taken from jobs/<n>/sources_<n>.md. Below them, the 6-chapter progress list (current chapter in gold, finished ones ticked).

## QA (reels/qa.py --mp4 jobs/long_tech/long_tech.mp4, plus centre-only checks)
- Loudness -14.0 LUFS integrated: PASS. True peak -1.5 dBTP: PASS (loudnorm + alimiter 0.79).
- Voice over bed in the new narration (outro): 10.7 dB: PASS. qa.py reported 2.6 dB because it applied the outro timeline from 0:00 of the full video, which is not meaningful here.
- Static:
  - full frame: qa.py FAIL, because the still side panels dilute the motion;
  - centre area only (same metric): one run over 4 s, at 156-161 s. That is inside the Search chapter's own footage (the original reel), not added material.
- Frame 0: PASS. The 9:16 and length checks do not apply to 16:9 long-form.
- Spot frames checked: cold open, bridge, chapter with facts, last chapter with 3 facts, recap. In the first build the outro question card covered row 06 of the recap list, and the third fact card touched the progress list; both are fixed in this build.

## Caveats
- Fact cards restate facts already sourced in each reel's sources file. Wording is shortened, e.g. "Most U.S. products carry a 12-digit number (UPC-A)".
- The Short titles in description.md come from handoff/yt/meta4.json; the URLs are placeholders.
- No human audio check yet.

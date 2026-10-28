# QA gate: `reels/qa.py`

Run on every finished reel before reporting it:

```
python3 -I reels/qa.py <n>            # reads jobs/<n>/<n>.mp4, reels/tl_<n>.js, reels/specs/<n>.json
python3 -I reels/qa.py <n> --metrics  # also prints the raw numbers
# other locations: --mp4 PATH --tl PATH --spec PATH
```

It prints PASS / WARN / FAIL per check, writes `jobs/<n>/qa_<n>.txt` and `reels/stills/qa_<n>.jpg` (frames at the flagged moments, or an even spread if nothing is flagged), and exits with code 1 on any FAIL. It needs only ffmpeg, numpy and PIL (no browser) and takes about 30-60 s per reel.

How it looks: the video is decoded once at 4 fps, quarter resolution (270x480 grey). The audio comes from ffmpeg's `ebur128` filter plus raw samples. Visual "content" is measured as **foreground strong edges**: a pixel whose gradient (|dx|+|dy|) is above 60 counts as a strong edge, typical of text, ink lines and cut-outs. Edges that sit in the same place in more than half of all frames are treated as fixed decoration (frames, HUDs, the lantern box) and ignored. Paper or crayon texture and blueprint grids are weak edges and don't count.

## Checks and thresholds

| # | Check | Rule | Why this threshold |
|---|---|---|---|
| 1 | static | FAIL if the mean frame-to-frame difference stays below 0.35 (0-255 scale) for more than 4.0 s | Approved reels top out at exactly 4.0 s (lock, spidersilk) and 3.5 s (catseyes). A synthetic 5 s freeze inserted into catseyes is caught at 19.8-24.8 s. |
| 2 | empty thirds | FAIL if the top, middle or bottom third has a mean edge strength below 0.9 for more than 6 s | Approved reels' longest near-blank third is 4.25 s (submarine, a dark sea). |
| 3 | safe zones | Zones: TikTok/Shorts right button column (x>900, y 900-1650), bottom (y>1700) and top (y<150). WARN if foreground strong edges cover more than 5% of a zone for over 3 s; FAIL above 20% for over 3 s | Many approved reels put art in these zones (ship's paper scenery at the top, harvestmoon's peaks on the right, owl's crayon texture), so content alone is a WARN. Text-heavy coverage above 20% is never sustained in an approved reel (ship's top peaks at about 1 s). |
| 4 | outer 24 px | WARN if foreground strong edges cover more than 5% of any 24 px edge band for over 2 s | WARN only: full-bleed art legitimately touches the edge. |
| 5a | loudness | FAIL outside -16 to -14 LUFS integrated | All approved reels: -15.5 to -15.0. |
| 5b | true peak | WARN above -1.0 dBTP, FAIL above 0 dBTP | See "issues found": almost every reel is -0.5 to -0.9 after the AAC encode. Above 0 means real clipping. |
| 5c | voice over bed | Speech level (inside the phrase times from `tl_<n>.js`) vs the level in the pauses between phrases (gaps over 0.45 s, trimmed by 0.12 s each side). FAIL below 3.5 dB, WARN below 6 dB | mix2.py ducks the music under the voice, so the pauses hold the unducked bed and this is a conservative proxy. Approved reels range from 4.0 dB (ship) to 9.4 dB (owl). A 10 dB rule would fail all of them, so 10 dB is not usable on finished mp4s without the stems. |
| 6 | length / closing / years | FAIL outside 66-86 s. FAIL if the last spoken phrase in the spec isn't exactly "Follow for more of how it really works.". FAIL if a spoken phrase has a 4-digit year from 1100 to 2099 (rule 14: write years in words; quantities use a comma, e.g. 1,853) | Owner rules 5 and 14. |
| 7 | frame 0 | FAIL if frame 0 has a luminance std (contrast) below 18, or a mean edge strength below 1.0 | Approved reels: std 26-82. A blank or fade-from-black opening falls far below (lock: std 5.5). The edge minimum is low because a frame of huge flat type has few edges but is a strong image (barcode: edge 1.7, std 52.8). |
| 8a | 9:16 frame | FAIL unless the video stream is exactly 1080x1920 with SAR 1:1. Checks `jobs/<n>/<n>.mp4` and, if it exists, `<n>_ep.mp4` | Owner rule: every reel is 9:16. A 1080x1350 test file fails. |
| 8b | black bars | ffmpeg `cropdetect=limit=24` at 1 fps. WARN if a black bar over 60 px on any side shows in more than half of the samples | Catches letterboxing or a pillarboxed source. darkeyes (149 px) and submarine (142 px) WARN only, because their film-frame border is deliberate; other reels show 0 px. |

## Calibration (Oct 28): 16 reels

PASS: magnet, submarine. WARN only (safe-zone art, true peak -1..0, voice gap 4-6 dB): airfryer, catseyes, eclipse, flush, foxfire, harvestmoon, owl, recommend, skyblue, spidersilk.
FAIL, all real issues in already-approved reels:
- **lock:** frame 0 is black (fade-in from black). This breaks HOOKS.md rule 2.
- **match:** true peak +3.3 dBTP (clipping), and the spoken phrase 13 contains "1827" (rule 14 came later).
- **ship:** true peak +1.8 dBTP (clipping).
- **search:** the "15%" card holds with no motion for 5.0 s (59-64 s).

## Issues found that the pipeline should fix
- **True peak.** `tools.py assemble` uses loudnorm with TP -1.5, but the AAC encode in `enc_hq.sh` adds about 0.5-1 dB of overshoot, and some mixes clip. Suggested fix: run `alimiter=limit=0.8` (or loudnorm TP=-2.0) before the AAC encode, or re-run loudnorm in `enc_hq.sh`.
- **Old owl.** Only the 8 s previews of the first owl version exist in git history, not the full old render, so the static check could not be tested on it. If owl's old problem was a diagram that stayed on screen but still had small animations, check 1 won't catch it: it measures *no change at all*. The repetition rules in STYLE_FIT.md still need a human look at the contact sheet.

STATE: ready
Final: video.mp4 — 1080x1920, 24 fps, 901 frames, 37.54 s, H.264 + AAC 192k, -14.4 LUFS integrated, true peak -1.4 dBFS, 10.9 MB (no split needed). sha256 in video.sha256.
Built: Toon 3D + BEANMEN FX (spotlight, sparkle, "!", sweat, "???", stamp + flash, glow, shake; 4 insert cards: letter, suspected-route map, -$500B counter/chart, reported timeline; flash/whipBlur/iris/fade transitions; music toon3d:tense + 41 sfx cues). Narrator: Chatterbox D2 (whatif/voice/chatterbox_d2.py, Shorts pacing). Full render in the cloud (SwiftShader, 4 workers, 7m26s); video = full silent render + mix.wav muxed (-c:v copy, no frames trimmed).
Checked: preview_540x960.mp4 + contact_sheet.png (frame 1 hook readable, captions at y 0.70 clear of cards and the Shorts UI, FX on reveals, last frame -> hard cut to frame 1); full-res frames 0 / 8.5 / 22.5 / 37.5 s.
Safety edits applied: "suspected"/"reportedly" on every spy claim, woman not named or depicted (faceless grey silhouette/mannequin only), NYT/Reuters attributions on affairs #2/#3, "lost his job", comedy only in the crash/"couldn't compute" beat. Nothing was posted, uploaded or logged into.
Project: whatif/aitrends-2d-studio/projects/nvidia-ceo-scandal (voiceover.wav force-added; story/make_shots.py regenerates shots.json + caption digits from words.json).
Re-render: node render.mjs --project projects/nvidia-ceo-scandal --out projects/nvidia-ceo-scandal/build/video_silent.mp4 ; python audio/mix.py --project projects/nvidia-ceo-scandal ; mux mix.wav onto video_silent.mp4 with -c:v copy.

HISTORY:
MAIN resolved the blockers (2026-11-14): $500B per NBC ("about"), testimony sourced to TechCrunch (House, closed-door), chip figure "reportedly nearly $5 billion", keep "he resigned". Build in progress.

EARLIER BLOCK NOTE — WHAT DIFFERED (STEP 0 verification, 2026-11-14) — no build work started, waiting for MAIN:

1. "$570 billion in market value, gone in a week" (narration line 4, caption, INSERT card): NOT CONFIRMED by any major outlet I could reach. Reported figures conflict:
   - NBC News (Nov 12): shares "plunged about 11% this week, wiping out $500 billion in value" (through Thursday close).
   - Bloomberg (Nov 12): market cap fell below $4 trillion; intraday drop of up to ~$601B on Thursday alone (per search summary).
   - CNBC (Nov 13): live blog cites "more than $740 billion since Friday's close"; headline cites $1.7 trillion lost over a longer losing streak.
   - Forbes timeline (possible source of $570B) returned 403 and could not be read. Bloomberg Law not found.
   -> MAIN to pick: one sourced figure + window (e.g. "about $500 billion this week, NBC News" or "over $740 billion since last Friday, CNBC"), or drop the number.

2. Testimony detail: "closed-door testimony before Thanksgiving, Senate Banking Committee request" mixes two things.
   - TechCrunch: Huang confirmed he would testify to Congress before Thanksgiving (Nov 26), expected behind closed doors (House, per Chairman Mast).
   - Newsweek: Sen. Tim Scott's Senate Banking letter invites him to a PUBLIC hearing on December 3.
   -> Narration line 5 ("Congress wants him to testify before Thanksgiving") still holds; sources.md/UPLOAD must not attribute the pre-Thanksgiving session to Senate Banking. Flagging for MAIN.

3. Minor: chip purchase figure. TechCrunch: "reportedly purchased $4.8 billion" over two years. Newsweek (citing C4ADS): $4.6 billion, 2023-2025; Megaspeed denies the allegations. $4.8B is usable only as "reportedly"; MAIN to confirm.

Everything else checked out (see sources.md). Resignation wording: outlets say he RESIGNED (board accepted); WSJ reported directors were preparing to push him out — keep "he resigned".

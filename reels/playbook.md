# Reel playbook (howitreallyworkstudio)

## Hook (first 2 seconds)
- Open on the surprising claim, no intro. Patterns that fit our niche:
  - "Your X never does Y" (GPS: your phone never tells satellites where it is)
  - "Nobody tells you how X actually works"
  - Counter-intuitive truth + number (moon drifts 3.8 cm/year)
  - A question the viewer can't answer in 2 seconds
- Caption on screen from frame 1, keyword highlighted in accent color.

## Retention
- A new visual change every ~3-4 s. Re-hook at ~25 s and ~50 s ("but here's the weird part").
- Plain words, define terms once, one everyday analogy, recap near the end.
- Aim 66-86 s. End card "FOLLOW / for more explainers".

## Caption formula
1. Hook line (same as on-screen hook).
2. Two sentences of the payoff, no spoilers of the full mechanism.
3. One comment-driving question.
4. "Send this to someone who ..." (shares/sends are the strongest signal).
5. 5-8 specific hashtags (topic + #howthingswork #explained #reels).

## Posting and tracking
- 3 posts/day at 8:00 AM, 1:00 PM, 7:00 PM ET; rotate topic across slots.
- Reply to comments in the first hour; pin a question comment.
- Sunday review: watch-through %, sends per reach, 3-second hold, follows per reach, best slot.
- Series idea: numbered "Part 2" follow-ups for the top performer.

## Research first (user rule, Oct 26)
- Before writing any script: research the topic from current sources, write sources_<name>.md with every claim + source; no claim without a source (e.g. "why Oct 29" had no source, so the script made no claim).
- The script must be ABOUT the topic in the title (Cat Day reel failed because it was about purring).
- Then research visuals: list what each line needs to show, then find licensed assets.

## Look (user rule, Oct 26)
- No realistic photos and no hand-built blob models. User wants CUTE, animated, illustrated visuals.
- Cute 3D models: Sketchfab (CC BY / CC0, downloadable) via the user's logged-in Chrome (Download > GLB, Downloads folder is connected; stage with device_stage_files). Credit creators in caption + end screen.
- Cute icons: Microsoft Fluent Emoji 3D (MIT) from raw.githubusercontent.com/microsoft/fluentui-emoji (works from the workspace).
- Keep content below the caption area (y > ~250px) and labels on real objects; check stills before rendering; send stills to the user for approval on new formats.
- Quality: assemble at crf 16, then 2-pass encode to ~9.6 MB (enc_hq.sh) for the 10 MB upload limit.

## Tool notes (from a reel reviewed Oct 26)
- No new paid tools needed. Whisper could add burned-in word captions if Kokoro timings are not enough.
- Scraping IG with yt-dlp/Apify breaks IG terms; research by watching top accounts manually instead.

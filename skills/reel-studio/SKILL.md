---
name: "reel-studio"
description: "Make a howitreallyworkstudio animated explainer reel: research, pick one of the owner's 19 chosen templates, build, preview, render, encode and schedule on Instagram and YouTube."
---

# Reel Studio (howitreallyworkstudio), updated Oct 27 2026

Short animated explainer reels for Instagram and YouTube "howitreallyworkstudio". Read HANDOFF.md and TEMPLATES.md in the repo first; they are the source of truth. This skill is the short checklist.

## Hard rules (from the owner)
- Instagram + YouTube only. NEVER the Facebook Page "Jiesuke" (untick it on every Instagram row).
- Reels 66-86 s, beginner friendly, the script explains exactly what the title promises.
- Female voice af_heart (speed 0.97, music crayon, bpm 88) for all new reels.
- The LAST spoken phrase and the end card are exactly "Follow for more of how it really works."
- Research first; every claim sourced in sources_<name>.md; unverifiable claims are cut or attributed.
- No realistic photos, nothing crude or gory, nothing budget-looking.
- STYLE: only the owner's 29 approved styles (TEMPLATES.md: 19 grid templates, #20 crayon, #21-#29). Reproduce the demo's actual animation language and formatting, not a lookalike; only topic, voice and objects are new. Old house templates are dropped.
- Never enter passwords, tokens or card details; no permanent deletes; ask before changing account settings; never post without the owner's approval.
- Do your own research; do not ask the owner to fetch websites.
- Show an ~8 s preview as soon as scenes render, before the full render, so changes are cheap.

## Workflow
1. Research the topic with a "can this blow up on YouTube/Instagram" lens (surprising 3-s hook, a myth to correct, a question at the end). Avoid topics already covered (see tracking.csv).
2. Read STYLE_FIT.md, then pick the template that best fits (see the grid in TEMPLATES.md). Say which and why. Read the demo source in /home/claude/styles-src.
3. Script and spec: specs/<n>.json, voice2.py, mix2.py; scenes in t_<n>.js (newreel.py scaffolds; never overwrite an existing reel).
4. Preview clip (8 s with voice). Send to the owner.
5. Full render (rq.sh, one at a time with flock /tmp/render.lock) then enc_hq.sh (2-pass ~9.6 MB).
6. QA: contact.py or an ffmpeg tile of 12 frames + the final frame; check overlaps, blank frames, clipped text, closing line, duration, sources.
7. Thumbnail: window.thumb() in t_<n>.js + reels/thumb.py -> jobs/<n>/thumb_<n>.jpg (template-styled, 2-4 big words matching the hook, inside the 3:4 crop).
8. Caption: description, blank line, "Sources: ...", blank line, "Follow for more of how it really works.", 5 hashtags ending #reels (YouTube: #Shorts). No #fyp.
8. Send the finished reel and the list of unverified or softened claims to the owner. Wait for approval.
9. After approval schedule (HANDOFF.md section 8): Instagram bulk composer (8 AM, 1 PM, 7 PM ET), YouTube Studio (daily upload limit ~10; stop at it).
10. Update tracking.csv and handoff/yt/yt_schedule.csv, commit and push style code and notes to the repo.

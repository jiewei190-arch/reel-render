Justin clips Shorts job from the owner (Reel Studio MAIN): "make new ones and let it follow the rules from that YouTuber so we get out of jail view". Channel "Justin clips" is stuck under 1K views = SWIPE JAIL (viewers leave in the first 3 s). Build TWO new Shorts, one after the other.

READ FIRST (git fetch):
- `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96, section "JUSTIN CLIPS: BREAK THE VIEW JAIL" (these rules OVERRIDE anything older, incl. TOPICS.md lengths/structure).
- Your topics in `iawaken/topic-bank/TOPICS.md` on origin/iawaken/topic-bank (facts, sources, "SAY according to" flags). Re-verify every fact with the listed sources (WebSearch/WebFetch) and fill any "source gap" before building.
- Kit: start your branch from origin/iawaken/toon3d-fx (Toon 3D + BEANMEN effects); copy a finished project like projects/crow-grudge or projects/emu-war. SETUP_NOTES.md (npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`).
- Voice: Chatterbox D2: copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README.md + whatif/VOICE.md from origin/voice-test, run the setup, use it where fenrir.py was used. It spells years/numbers for TTS; captions keep digits.

THE JAIL-BREAK RULES (non-negotiable, check each before rendering):
1. TRIPLE HOOK in the first 2 s, all at once:
   - VISUAL: frame 1 = the strangest image of the story, ALREADY MOVING (no title card, no calm establishing shot, no character standing still).
   - VERBAL: VO line 1 = the LINE 1 given below, word for word, no setup before it.
   - TEXT: ONE top caption = the CAPTION given below. It ADDS story (not the title, not a subtitle). Big bold, top ~8-12% of the frame, on screen >= 3 s from frame 1, separate from the 1-3-word captions lower-middle.
2. ONE EMOTION (given below), chosen before writing. Write it at the top of script.md. Cut every line/shot that doesn't build to it.
3. NO PADDING: hit the TARGET length (+-3 s). Max ~6-8 VO lines. Cut setup, cut secondary facts, no "Wait, how...? You see..." beat unless it IS the payoff.
4. New shot every 1.5-2.5 s, faster cuts at the reveal. Payoff in the last 2 s. "Subscribe for more." <= 1 s or drop it if it hurts the loop. Last frame cuts straight back into frame 1 (loop).
5. Facts sourced in sources.md; keep every "according to/by one estimate/legend says" hedge from TOPICS.md; nobody shown hurt.

Per Short, deliver in `justinclips/shorts/<slug>/` on your branch: script.md (EMOTION + LINE 1 + CAPTION at top), sources.md, contact sheet you checked (frame 1 must show the top caption + action), FULL 1080x1920 24 fps video.mp4 + video.sha256 (mix.py -14 LUFS, TP <= -1), UPLOAD.md (title <= 60 chars + 1 emoji, 1-line description + Sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover = frame-1 area), STATUS.md first line `STATE: ready` when pushed (before: `STATE: building` / `STATE: rendering`). Push Short A as soon as it's ready, then build Short B. Full render in the cloud (owner's PC is not used). `git add -f` the media.
Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens; don't touch other branches.

SHORT A: #24 Peter the Great's Beard Tax, slug `beard-tax`. EMOTION: LOL. LINE 1: "Russia once made you pay to keep your beard." CAPTION: "and carry a beard token as proof". TARGET ~22 s. Frame 1: a toon barber's giant scissors snapping at a terrified bearded guy, or a patrol stopping a bearded man mid-step. Payoff: "The British Museum still has the tokens." No tax amounts on screen.
SHORT B: #25 Britain Deleted 11 Days, slug `eleven-days`. EMOTION: WTF. LINE 1: "In 1752, Britain deleted 11 days." CAPTION: "went to bed Sept 2, woke up Sept 14". TARGET ~22 s. Frame 1: calendar pages ripping out and flying past a confused sleeper. Payoff: "Legend says people rioted for their 11 days back. Historians aren't sure."

Branch: `justinclips/jail-a`.

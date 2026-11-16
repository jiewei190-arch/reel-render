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

SHORT A: #29 What If Humans Could Photosynthesize, slug `human-photosynthesis`. EMOTION: LOL. LINE 1: "You turn green and live on sunlight." CAPTION: "you'd still starve". TARGET ~22 s. Frame 1: the hero mid-transformation, skin flashing green, arms out to the sun. Keep "skin about the size of a tennis court, by one estimate". Payoff: "That's why plants don't walk."
SHORT B: #30 What If Every Mosquito Disappeared, slug `no-mosquitoes`. EMOTION: WTF (debate). LINE 1: "Every mosquito on Earth just vanished." CAPTION: "scientists can't agree if that's bad". TARGET ~25 s. Frame 1: a giant swarm blinking out of existence over a camper. Keep: fewer diseases like malaria; some Arctic birds could lose food (attributed); chocolate is safe (midges pollinate cacao). Payoff: the CDC entomologist's quote via Nature. Add a second source (WHO malaria page or a university article).

Branch: `justinclips/jail-c`.

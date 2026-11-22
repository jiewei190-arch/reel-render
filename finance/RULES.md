# Block Money (YouTube): standing rules (owner, 2026-11-18)

- Channel: **Block Money**, handle @BlockMoneys, channel ID UC9vwlwhchNKGNuLyd5ReXRA (formerly "What-If Sims"). Blocky-avatar finance Shorts.
- **Autopilot (owner, 2026-11-18): "upload them without my approval… fully ran by u guys".** The owner does NOT review Block Money Shorts before upload.
  The gate is MAIN: Creator uploads and SCHEDULES a Short only after MAIN sends a written "BM GO" for that exact slug and sha256.
  Max 2 per day, at 12:00 and 19:00 America/New_York, for at least 21 days (owner, 2026-11-19; was 4/day). Every upload: pick the most dramatic frame (big number + reaction face) as the thumbnail; Made for kids = No. Schedule only, never publish immediately. MAIN sends the owner the links afterwards.
- **Before every upload, confirm the channel switcher shows "Block Money".** Never upload finance Shorts to Justin clips, or the reverse.
- "Altered or synthetic content": always **No**. Never toggle it on.
- Description must include "Educational only, not financial advice." and "Voice is synthetic." plus sources.
- No investment advice, no stock or crypto picks, no get-rich promises. Every number is sourced.
- Original blocky characters only. No game names, avatars or logos.
- Stop on any password, 2FA or account-settings prompt.
- **Upload fields (owner, 2026-11-18): title and description ONLY.** No tags in the Tags field, and no #hashtags anywhere: not in the title, the description or the pinned comment.
  Strip any hashtags that appear in UPLOAD.md. Leave every other optional field at its default, and keep "Altered content" = No.

## Voice safety (owner, 2026-11-22, after an ElevenLabs policy warning)
ElevenLabs flagged the account for "fraudulent, predatory, or abusive behavior". The trigger was almost certainly the
hook "You owe five thousand. Pay the minimum..." (a debt demand when read without context), generated 11 times in two
bursts by listen-back retakes. Every script, autopilot builds included, follows these rules before any ElevenLabs call:
- Never voice a line that, read alone, sounds like a scam call, phishing or a debt collector. That rules out "you owe",
  orders to pay/send/wire money, "verify/confirm your account", "your account is locked", gift-card or crypto payment
  requests, first-person impersonation of a bank, agency or company, threats, and "act now". Use a situation or a
  question ("What if you only paid the minimum on five thousand?") or third person ("Spender owes five thousand").
- Scam stories are narration ("he called pretending to be the bank"), never the scammer's script read aloud.
- At most 1 retake per line and 2 per Short. Never regenerate one line again and again in a burst.
- No [whispers] (owner rule), and no [dramatic] on a money line.
- reelbot enforces this in `bot/reelbot/safety.py` (screen + rewrite; a line still flagged is never voiced). Any other
  pipeline that calls ElevenLabs must run the same screen first: `python -c "from reelbot import safety; ..."` or copy
  its PATTERNS.

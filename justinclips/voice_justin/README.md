# Justin's voice: the owner's own voice note

- `owner_voice_note.m4a` is the original 45 s voice memo from the channel owner. `owner_voice_note_24k.wav` is the same audio as mono 24 kHz.
- **Consent:** the first line of the memo is "Yo, it's Justin. This is my real voice, and I'm cool with using it for Justin Clips." The owner asked for their own voice to be cloned for Justin clips narration.
- **Use it only for Justin clips.** Never use it for any other channel, person or purpose. Keep "Voice is synthetic." in every description that uses the clone.

## Clone setup (Nov 15)
- `ref_clean.wav`: the Chatterbox voice reference (17.3 s cleaned cut of the memo). See `samples/NOTES.md` for how it was cut.
- `justin_tts.py`: narrator for Justin clips Shorts (defaults: exaggeration 0.5, cfg 0.4, mastered to -14 LUFS / -1 dBTP). `setup_chatterbox.sh` installs it.
- `samples/`: v1/v2/v3 test takes, the D2 A/B, and `NOTES.md` with settings, transcripts and the pick.
- Note: `owner_voice_note_24k.wav` (listed above) is not in the repo; `justin_tts.py` doesn't need it.

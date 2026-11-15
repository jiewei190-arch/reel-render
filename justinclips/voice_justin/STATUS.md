STATE: ready

Justin clips cloned-voice test is done (Justin clips only; consent on line 1 of owner_voice_note.m4a).
- ref_clean.wav: 17.3 s of the owner's whale story (7.25-17.20 s + 20.50-27.50 s), skipping the clipped "20!" and both inhales; light denoise, -20 LUFS, mono 24 kHz.
- samples/justin_v1.mp3 (0.35/0.4), justin_v2.mp3 (0.5/0.4), justin_v3.mp3 (0.65/0.3), d2_compare.mp3 (D2, then v2): all -14.1 to -14.2 LUFS, TP <= -1.7 dBTP; every line passed Whisper + squeak QA.
- Pick: v2 (exaggeration 0.5, cfg 0.4), now the default in justin_tts.py. Picked from QA and measurements; the owner should listen and confirm.
- Reuse: bash setup_chatterbox.sh, then ~/.venvs/chatterbox/bin/python justin_tts.py script.md out.wav plain.txt --mp3
- Nothing was posted or uploaded. Descriptions using this voice must say "Voice is synthetic."

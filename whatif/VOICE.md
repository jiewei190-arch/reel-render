# What If channel voice (locked by the owner, Oct 29)

Owner: "I like this voiceover, it's smooth and human-like, keep it like this."

- **Reference take:** `aitrends-2d-studio/projects/see-in-dark/input/voiceover.wav` (v2, 373.6 s, calm and natural). Every What If episode uses this same voice and delivery.
- **How it was made (episode 1, v2 take):**
  - **Model:** Chatterbox TTS (Resemble AI, MIT licence), its built-in default voice (no reference clip, no cloning), run locally on the owner's RTX 4060 from `reel-render/longform/human-limits/voice/` (`.venv`, Python 3.11, torch cu124). It adds an inaudible Perth watermark.
  - **Command:** `narrate.py ../../what-if-dark/v2/wid2.md --flow --exaggeration 0.42 --cfg 0.35 --stretch 0.87 --temperature 0.75` (the same flags are saved in `what-if-dark/v2/wid2.narrate_args`, and `check.py` reuses them for retries).
  - **`--flow` mode:**
    - **Generation:** each numbered script line is spoken in one pass (1-3 sentences), not sentence by sentence, so the voice carries its own rhythm.
    - **Seed:** `1000 + line*100 + attempt`.
    - **Speed:** pitch-preserving atempo 0.87 on speech only.
  - **Gaps between lines:** 0.32 s, 0.45 s after a "?", 0.55 s after "...", 0.9 s at a section or rule break, plus 0, 0.06 or 0.12 s of deterministic variation. Lead-in 0.3 s, tail 0.6 s.
  - **QA:** faster-whisper check, which retries a line if its word error rate is over 10%. `pronunciations.json` respellings apply.
  - **Post:** 48 kHz mono, two-pass loudnorm to -16 LUFS / -1.5 dBTP (`loudnorm.py`). Result: 373.6 s, 1,047 words.

## Episode 2 onward (owner's choice, Oct 30): Kokoro **am_fenrir**
The owner listened to samples and picked **Fenrir**: Kokoro v1.0 (`tts/kokoro-v1.0.onnx` + `voices-v1.0.bin` on the handoff branch), voice `am_fenrir`, speed 0.95, lang en-us. A free local model under the Apache 2.0 licence, so commercial use is fine. Pauses: 0.55 s after sentences, 0.25 s otherwise, 1.4 s at each section/rule-card break; peak-normalised to 0.89. Ep 2 take: `aitrends-2d-studio/projects/jump-double/input/voiceover.wav` (358.7 s).


## Justin clips Shorts (owner's choice, Nov 13): Chatterbox "D2"
The owner listened to `voice_test/all_samples.mp4` and picked **D2**: Chatterbox (Resemble AI, MIT), built-in default voice (no cloning), exaggeration 0.3, cfg 0.3. Tool: `voice/chatterbox_d2.py` (drop-in for `fenrir.py`, same CLI/outputs, built-in Whisper QA + seed log); setup + usage in `voice/README.md`. Proof take: `voice_test/tardigrade_d2.wav`. Long-form What If episodes keep Fenrir unless the owner says otherwise.

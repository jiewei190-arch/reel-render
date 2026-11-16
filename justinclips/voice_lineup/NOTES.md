# Voice lineup: free, commercial-OK narrators for Justin clips

**Listen first:** `lineup.mp3` (2:14). Each sample starts with a beep and "Number N", read by a British female Kokoro voice that is not a candidate. Every sample uses the same script:

> "Two cities went to war... over a bucket. In 1325, soldiers from Modena snuck into Bologna and stole a wooden bucket. Bologna sent an army to get it back. Modena won. And the bucket? It's still in Modena today."

(The TTS hears "thirteen twenty-five". Kokoro hears "Mohdenna" so it says MO-de-na instead of "Mod-na". Both come from `lines.json`.)

Every file is mastered to −14 LUFS with true peak ≤ −1 dBTP, measured on the final MP3: −14.0 to −14.2 LUFS, peaks −1.6 to −1.8 dBTP. Chain: 70 Hz high-pass, light 2.5:1 compression, gain, then a 4x-oversampled limiter. Output is 48 kHz mono, 192 kbps MP3.
No cloning: every voice is a model's built-in voice. Dia was steered with a short clip of Kokoro's built-in am_puck voice, which is synthetic and not a person. Nothing was posted or uploaded.

## The samples

| # | File | Model | Voice / settings | Length | Pitch (median, movement) | Whisper small.en heard | Render speed on this CPU (4 vCPU) |
|---|---|---|---|---|---|---|---|
| 1 | `01_kokoro_am_puck.mp3` | Kokoro-82M v1.0 | am_puck, speed 1.1 | 13.7 s | 122 Hz, 11.6 st | all words¹ | 3.0 s per 10 s |
| 2 | `02_kokoro_am_eric.mp3` | Kokoro-82M v1.0 | am_eric, speed 1.1 | 13.8 s | 158 Hz, 14.2 st | all words¹ | 2.8 s per 10 s |
| 3 | `03_kokoro_am_liam.mp3` | Kokoro-82M v1.0 | am_liam, speed 1.1 | 14.9 s | 122 Hz, 16.3 st | all words¹ | 3.0 s per 10 s |
| 4 | `04_kokoro_am_michael.mp3` | Kokoro-82M v1.0 | am_michael, speed 1.1 | 15.5 s | 117 Hz, 9.9 st | all words¹ | 3.0 s per 10 s |
| 5 | `05_chatterbox_default-ex0.6.mp3` | Chatterbox (original 0.5B) | built-in voice, exaggeration 0.6, cfg 0.3, temp 0.8, seed 7 | 13.0 s | 158 Hz, 16.4 st | word for word | 93 s per 10 s² |
| 6 | `06_chatterbox_default-ex0.8.mp3` | Chatterbox (original 0.5B) | built-in voice, exaggeration 0.8, cfg 0.3, temp 0.8, seeds 7 / 11 | 13.0 s | 149 Hz, 16.3 st | word for word, "...today**!**" | 83 s per 10 s² |
| 7 | `07_dia_puckprompt-seed23.mp3` | Dia-1.6B-0626 | [S1], voice prompt = 7.5 s Kokoro am_puck clip, seed 23, cfg 3.0, temp 1.8, top-p 0.9, top-k 45 | 13.6 s | 131 Hz, 15.9 st | all words¹ | 170 s per 10 s |
| 8 | `08_dia_puckprompt-seed7.mp3` | Dia-1.6B-0626 | same as #7, seed 7, plus `(laughs)` tail that is cut off after "today"³ | 12.7 s | **205 Hz**, 13.5 st | word for word, "Modena won**!** … today**!**" | 184 s per 10 s |

Pitch movement is the p5 to p95 spread of the pitch, in semitones. More movement usually means less monotone.
¹ The one difference: Whisper writes "And the bucket? It's still…" as "and the bucket is still…". The "it's" is quick and merges, a Whisper habit we also see on clean human speech. The words are all there.
² Includes retakes. "Modena won." is a two-word fragment that Chatterbox mumbled on some seeds ("Modna 1"), so `tts_any.py` re-rendered it with the next seed. A single take runs about 35 to 40 s per 10 s.
³ Dia tends to stop mid-way through its last word. Without the tail, seed 7 ended on "Modena to-". `tts_any.py --dia-tail " (laughs)"` lets the model finish the sentence, then cuts 0.12 s after the last scripted word (found from Whisper word timings) with a 60 ms fade.

Kokoro voices screened but left out: am_echo, am_adam, am_onyx and am_fenrir. Fenrir is the old production voice. Onyx (88 Hz, 8 st) and adam (11 st) are the flattest. Echo is low and slow (15.9 s). All eight renders are reproducible with `tts_any.py`.

## Licenses (code and weights)

| Model | Weights | Code / runtime | Commercial use | Notes |
|---|---|---|---|---|
| Kokoro-82M v1.0 | Apache-2.0: <https://huggingface.co/hexgrad/Kokoro-82M> | kokoro-onnx, MIT: <https://github.com/thewh1teagle/kokoro-onnx> | yes | The phonemizer, espeak-ng, is GPL-3.0. That covers the program, not the audio it helps make. |
| Chatterbox | MIT: <https://huggingface.co/ResembleAI/chatterbox> | MIT: <https://github.com/resemble-ai/chatterbox/blob/master/LICENSE> | yes | Output carries Resemble's inaudible Perth watermark. |
| Dia-1.6B-0626 | Apache-2.0: <https://huggingface.co/nari-labs/Dia-1.6B-0626> | Apache-2.0: <https://github.com/nari-labs/dia/blob/main/LICENSE>, run through HF transformers (Apache-2.0) | yes | Audio codec: Descript DAC 44 kHz, MIT, <https://github.com/descriptinc/descript-audio-codec>. Nari's README forbids identity misuse and deceptive content. We don't do either. |
| QA: faster-whisper small.en | MIT: <https://huggingface.co/Systran/faster-whisper-small.en> | MIT | yes | Used only to check the takes. |

### Candidates not rendered
- **Orpheus 3B** (card says Apache-2.0). The official weights (`canopylabs/orpheus-3b-0.1-ft`) are gated on Hugging Face and need a logged-in account that has accepted the terms. This session has no HF token. Downloading a third-party re-upload instead was blocked, and that is the right call. Orpheus is also a fine-tune of Llama-3.2-3B, so Meta's Llama 3.2 Community License very likely applies on top of the Apache card: "Built with Llama" attribution, plus a 700M-MAU cap that doesn't matter here. It would run on this CPU as a Q4–Q6 GGUF under llama.cpp, at roughly 10x slower than real time. **If you want it, add an HF token as a secret and I can render leo / dan / zac with `<laugh>` tags.**
- **Sesame CSM-1B** (Apache-2.0, Llama-3.2-1B backbone). Gated on HF for the same reason. Not run.
- **Higgs Audio v2** (Boson AI). Not permissive. It uses the "Boson Higgs Audio 2 Community License", which is built on the Meta Llama 3 license, requires attribution, and needs a separate license above 100k annual active users. It is also 5.8B parameters (3.6B LLM + 2.2B audio FFN), too heavy for this CPU. Skipped.
- **Kyutai Pocket TTS** (CC-BY-4.0). Gated on HF. Not run.
- **Chatterbox-Turbo** (MIT). Its only built-in voice is female, and a male voice would need a reference clip. Tested in the earlier voice-test round as E1.
- **VibeVoice** (Microsoft, MIT). Not tried. Microsoft's model card advises against commercial or real-world use without further testing.
- Kitten TTS (Apache-2.0) is tiny and well below Kokoro in naturalness, so it wasn't worth a slot.

## Ranked top 3: natural, energetic, human

I cannot listen to audio. This ranking comes from what each model is built for, the pitch numbers, how Whisper punctuated each take (it adds "!" when the delivery sounds excited), and the phrasing it heard. **Your ears decide.**

1. **#7 Dia, seed 23.** Dia is trained on dialogue, not audiobooks, so it is the model most likely to sound like a guy telling a friend something. It reads the script in one pass and phrases it itself. One difference: it runs "Two cities went to war... over a bucket" together instead of holding the "..." beat. Kokoro and Chatterbox hold that beat because `tts_any.py` renders them in parts. If you want the pause with Dia, it can go in as a separate line. The pitch is clearly male (131 Hz) and moves a lot (15.9 st). Costs: it is slow (about 17x real time, so roughly 8–9 min of CPU per take of a 30 s Short); each seed is a lottery for delivery, so plan on 2–3 takes per Short; and it can drop its last word, which `--dia-tail` handles.
2. **#8 Dia, seed 7.** The most hyped take: shortest (12.7 s) and the only one Whisper hears with "Modena won**!**". But its median pitch is 205 Hz, high for a man. Listen for whether it still sounds like the same young guy or has drifted toward a different voice. If it holds up, this is the "crazy story" energy.
3. **#6 Chatterbox, exaggeration 0.8.** Clearly more animated than the rejected D2 (0.3 / 0.3): the ending lands as "…today**!**" and the pitch range is wide (16.3 st). **Caveat:** it is the same built-in voice as D2, only livelier. If what you disliked was the voice itself rather than the flat delivery, skip #5 and #6.

The Kokoro takes (#1–#4) are clean, fast (about 3 s of CPU per 10 s) and always say every word. They are still the same family as the old fenrir narrator that got "sounds too AI". Of the four, **#2 am_eric** sounds youngest (highest pitch) and **#3 am_liam** moves the most.

## How to use the winner (`tts_any.py`)

`tts_any.py` renders any `lines.json` with any engine above, retries seeds until Whisper hears every word, masters to −14 LUFS / TP ≤ −1, and writes a `.json` report next to the output. Run `python tts_any.py` with no arguments for full help.

```bash
# Kokoro / Chatterbox: Python 3.11 venv from whatif/voice/setup_chatterbox.sh (branch voice-test), plus `pip install kokoro-onnx`
~/.venvs/chatterbox/bin/python tts_any.py lines.json out.mp3 --voice kokoro:am_eric --speed 1.1
~/.venvs/chatterbox/bin/python tts_any.py lines.json out.mp3 --engine chatterbox --exaggeration 0.8 --cfg 0.3
# Dia: Python 3.12 venv with CPU torch + transformers>=4.56 + librosa + scipy + faster-whisper
~/.venvs/dia/bin/python tts_any.py lines.json out.mp3 --engine dia --seed 23 \
   --prompt-audio prompts/dia_prompt_kokoro_am_puck.wav \
   --prompt-text "Okay, so you're not gonna believe this one, but it's totally true. I looked it up like three times, because I honestly thought it was a joke." \
   --dia-tail " (laughs)"
```
- `lines.json` lists the lines, each with a pause after it in seconds, plus optional per-engine respellings (`"pronounce"`). `...` inside a line is a held beat for Kokoro and Chatterbox. Dia reads the whole script in one pass and phrases it itself.
- To keep the same Dia voice across Shorts, always pass the same `--prompt-audio`/`--prompt-text`. The prompt is what fixes the timbre; the seed changes the delivery.
- `make_lineup.py` rebuilds `lineup.mp3` from the `NN_*.mp3` files in this folder.
- `reports/NN_*.json` holds the exact settings, seeds, per-part Whisper transcripts and timings for each sample.

"""Chatterbox samples (Resemble AI, MIT). Built-in default voice unless --ref (synthetic Kokoro ref only, never a real person).
Usage: python chatterbox_samples.py out.wav {std|turbo} exaggeration cfg [ref.wav] [seed]"""
import sys, time, torch, torchaudio as ta
torch.set_num_threads(4)
out, kind, ex, cfg = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
ref = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] != "-" else None
seed = int(sys.argv[6]) if len(sys.argv) > 6 else 7
TEXT = ("In two thousand seven, scientists strapped tiny animals to the outside of a satellite. "
        "No suits. No oxygen. Just open space for ten straight days. "
        "When the satellite came home, they checked the bodies... and the animals were alive.")
if kind == "turbo":
    from chatterbox.tts_turbo import ChatterboxTurboTTS as M
else:
    from chatterbox.tts import ChatterboxTTS as M
m = M.from_pretrained(device="cpu")
torch.manual_seed(seed)
t = time.time()
kw = dict(audio_prompt_path=ref) if ref else {}
wav = m.generate(TEXT, exaggeration=ex, cfg_weight=cfg, **kw) if kind != "turbo" else m.generate(TEXT, **kw)
dt = time.time() - t
ta.save(out, wav, m.sr)
dur = wav.shape[-1] / m.sr
print(f"{out}\t{dur:.2f}s\trender {dt:.1f}s\t{dt/dur*10:.1f}s per 10s")

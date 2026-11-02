#!/usr/bin/env python3
"""
Regenera UNA frase de una locución ya hecha (p. ej. un nombre propio mal pronunciado) y rearma la pista
manteniendo las demás frases y pausas. Prueba varias grafías y se queda con la que Whisper entiende mejor.
Uso: python3 scripts/vo_patch.py <pieza> <id_frase> "texto 1" ["texto 2" ...]
Trabaja sobre los archivos *_orig (antes de acelerar) y luego vuelve a aplicar la velocidad guardada.
"""
import difflib, json, os, subprocess, sys
import numpy as np, soundfile as sf, torch
from scipy.signal import resample_poly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vo_generate import norm, trim

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
name, sid, texts = sys.argv[1], sys.argv[2], sys.argv[3:]
js = os.path.join(ROOT, "src", "vo", f"{name}_orig.json")
wav = os.path.join(ROOT, "public", "vo", f"{name}_orig.wav")
if not os.path.exists(js):
    js, wav = js.replace("_orig", ""), wav.replace("_orig", "")
d = json.load(open(js)); y, SR = sf.read(wav, dtype="float32")
speed = json.load(open(os.path.join(ROOT, "src", "vo", f"{name}.json"))).get("speed", 1.0)
target = json.load(open(os.path.join(ROOT, "vo", f"{name}.json")))
want = next(s["text"] for s in target["segments"] if s["id"] == sid)

from faster_whisper import WhisperModel
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
stt = WhisperModel("small", device="cpu", compute_type="int8")
tts = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32)
prompt = tts.create_voice_clone_prompt(ref_audio=os.path.join(ROOT, "vo", "narrador_ref.wav"), ref_text=open(os.path.join(ROOT, "vo", "narrador_ref.txt")).read().strip())
best = None
for t in texts:
    wavs, sr = tts.generate_voice_clone(text=t, language="Spanish", voice_clone_prompt=prompt)
    x = trim(np.asarray(wavs[0], dtype=np.float32), sr)
    segs, _ = stt.transcribe(resample_poly(x, 16000, sr).astype("float32"), language="es", word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    sc = difflib.SequenceMatcher(None, norm(want), norm(" ".join(w[0] for w in words))).ratio()
    print(f"«{t}» → «{' '.join(w[0] for w in words)}» · {sc:.2f}", flush=True)
    if best is None or sc > best[0]:
        best = (sc, resample_poly(x, SR // 1000, sr // 1000).astype(np.float32), words)
sc, xnew, words = best
# rearmar: cortar cada frase de la pista original y reemplazar la elegida
segs = d["segments"]; parts = []; meta = []; t = 0.0
for i, s in enumerate(segs):
    a, b = int(s["start"] * SR), int(s["end"] * SR)
    gap = (segs[i + 1]["start"] - s["end"]) if i + 1 < len(segs) else 0.0
    if s["id"] == sid:
        clip = xnew; ws = [{"w": w, "s": round(t + ws_, 3), "e": round(t + we, 3)} for w, ws_, we in words]; txt = want
    else:
        clip = y[a:b]; ws = [{"w": w["w"], "s": round(w["s"] - s["start"] + t, 3), "e": round(w["e"] - s["start"] + t, 3)} for w in s["words"]]; txt = s["text"]
    dur = len(clip) / SR
    meta.append({**s, "text": txt, "start": round(t, 3), "end": round(t + dur, 3), "words": ws, "score": round(sc, 3) if s["id"] == sid else s.get("score")})
    parts += [clip, np.zeros(int(gap * SR), dtype=np.float32)]; t += dur + gap
out = np.concatenate(parts); out = out / (np.abs(out).max() + 1e-9) * 0.89
sf.write(wav, out, SR, subtype="PCM_16")
json.dump({"duration": round(len(out) / SR, 3), "segments": meta}, open(js, "w"), ensure_ascii=False, indent=1)
if js.endswith("_orig.json"):
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "vo_speed.py"), name, str(speed)], check=True)
print("OK patch", name, sid, f"{sc:.2f}")

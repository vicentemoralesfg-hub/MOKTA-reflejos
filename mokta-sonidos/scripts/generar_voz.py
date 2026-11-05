"""
Genera la locución del reel con Qwen3-TTS (código abierto, Apache 2.0), sin servicios pagados.

Flujo "diseñar y clonar":
  1. La voz se diseñó con Qwen3-TTS-12Hz-1.7B-VoiceDesign a partir de una descripción en texto
     (ver INSTRUCCION_VOZ). Esa toma de referencia vive en public/voz/_referencia.wav.
  2. Cada frase se genera con Qwen3-TTS-12Hz-1.7B-Base clonando esa referencia, así la voz es
     idéntica en todas las frases. Se hacen varias tomas por frase y se elige la mejor:
     transcripción correcta (Whisper) y mayor variación de entonación.
  3. Se recortan silencios, se normaliza y se escribe public/voz/<clave>.wav + src/voz.json
     (duraciones que usa src/config.ts para acomodar los tiempos del video).

Uso (CPU sirve, ~6x tiempo real):
  pip install qwen-tts faster-whisper librosa soundfile
  python scripts/generar_voz.py --modelos /ruta/modelos [--tomas 2] [--solo r1_revela,cierre]
"""
import argparse
import json
import re
import unicodedata
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
import torch

RAIZ = Path(__file__).resolve().parent.parent
VOZ_DIR = RAIZ / "public" / "voz"

INSTRUCCION_VOZ = (
    "Enthusiastic Chilean-neutral Latin American Spanish male sports and motor announcer, powerful resonant voice, "
    "contagious excitement, suspenseful build-up, lively melodic intonation, unhurried pace with deliberate pauses."
)  # semilla 7, ver la nota del README
TEXTO_REFERENCIA = (
    "¿Eres capaz de reconocer un auto... solo por su sonido? ¡Vamos a comprobarlo! "
    "Escucha con atención, porque esto se pone bueno."
)

# Frases. La segunda columna es el texto esperado para la verificación con Whisper.
FRASES = {
    "gancho": "¿Eres capaz de reconocer un auto... solo por su sonido? ¡Vamos a comprobarlo!",
    "r1_ronda": "¡Ronda uno!",
    "r1_pregunta": "¿Ferrari... o Lamborghini? ¡Escucha con atención!",
    "r1_ab": "¿Cuál es? ¿A... o B?",
    "r1_revela": "¡Era el Lamborghini! ¡Un ve doce brutal!",
    "r2_ronda": "¡Ronda dos!",
    "r2_pregunta": "¿Mustang... o Nissan ge te erre? ¡Atento a este rugido!",
    "r2_ab": "¿A... o B? ¡Tú decides!",
    "r2_revela": "¡Era el Mustang! ¡Puro músculo americano!",
    "r3_ronda": "¡Última ronda!",
    "r3_pregunta": "¿Bugatti... o Fórmula Uno? ¡Esta es la más difícil!",
    "r3_ab": "¿A... o B? ¡Última oportunidad!",
    "r3_revela": "¡Era el Fórmula Uno! ¡Diecinueve mil revoluciones!",
    "cierre": "¿Cuántas acertaste? ¡Déjalo en los comentarios!",
}


def normalizar(t: str) -> list[str]:
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = t.replace("gt-r", "ge te erre").replace("gtr", "ge te erre").replace("v12", "ve doce").replace("1", "uno")
    return re.findall(r"[a-z]+", t)


def wer(ref: str, hyp: str) -> float:
    r, h = normalizar(ref), normalizar(hyp)
    d = np.zeros((len(r) + 1, len(h) + 1), dtype=int)
    d[:, 0] = range(len(r) + 1)
    d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[len(r), len(h)] / max(1, len(r))


def expresividad(y: np.ndarray, sr: int) -> float:
    f0, _, _ = librosa.pyin(y, fmin=70, fmax=330, sr=sr, frame_length=1024)
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 5:
        return 0.0
    return float(np.std(12 * np.log2(f0 / np.median(f0))))


def recortar(y: np.ndarray, sr: int) -> np.ndarray:
    idx = librosa.effects.split(y, top_db=38, frame_length=1024, hop_length=256)
    if len(idx) == 0:
        return y
    a = max(0, idx[0][0] - int(0.03 * sr))
    b = min(len(y), idx[-1][1] + int(0.12 * sr))
    y = y[a:b]
    fade = int(0.015 * sr)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade * 4 :] *= np.linspace(1, 0, fade * 4)
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelos", required=True)
    ap.add_argument("--tomas", type=int, default=2)
    ap.add_argument("--solo", default="")
    args = ap.parse_args()

    from faster_whisper import WhisperModel
    from qwen_tts import Qwen3TTSModel

    torch.set_num_threads(4)
    base = Qwen3TTSModel.from_pretrained(
        f"{args.modelos}/Qwen3-TTS-12Hz-1.7B-Base", device_map="cpu", dtype=torch.float32
    )
    ref = VOZ_DIR / "_referencia.wav"
    prompt = base.create_voice_clone_prompt(ref_audio=str(ref), ref_text=TEXTO_REFERENCIA)
    whisper = WhisperModel("small", device="cpu", compute_type="int8")

    durs_path = RAIZ / "src" / "voz.json"
    duraciones = json.loads(durs_path.read_text()) if durs_path.exists() else {}
    claves = [c for c in FRASES if not args.solo or c in args.solo.split(",")]
    informe = {}
    for clave in claves:
        texto = FRASES[clave]
        mejores = []
        for toma in range(args.tomas):
            torch.manual_seed(1000 + toma * 17 + len(clave))
            wavs, sr = base.generate_voice_clone(text=texto, language="Spanish", voice_clone_prompt=prompt)
            y = recortar(np.asarray(wavs[0], dtype=np.float32), sr)
            y16 = librosa.resample(y, orig_sr=sr, target_sr=16000)
            segs, _ = whisper.transcribe(y16, language="es")
            hyp = " ".join(s.text for s in segs).strip()
            e = wer(texto, hyp)
            x = expresividad(y16, 16000)
            mejores.append((e, -x, toma, y, sr, hyp))
            print(f"  {clave} toma {toma}: {len(y)/sr:.2f}s WER={e:.2f} expr={x:.2f}st  «{hyp}»", flush=True)
        mejores.sort(key=lambda m: (round(m[0], 2), m[1]))
        e, negx, toma, y, sr, hyp = mejores[0]
        pico = np.max(np.abs(y)) or 1.0
        y = y / pico * 0.89  # pico ≈ -1 dBFS; la mezcla final se normaliza a -14 LUFS
        y48 = librosa.resample(y, orig_sr=sr, target_sr=48000)
        sf.write(VOZ_DIR / f"{clave}.wav", np.stack([y48, y48], axis=1), 48000, subtype="PCM_16")
        duraciones[clave] = round(len(y48) / 48000, 3)
        informe[clave] = {"toma": toma, "wer": round(e, 3), "expresividad_st": round(-negx, 2), "whisper": hyp}
        print(f"=> {clave}: toma {toma} ({duraciones[clave]}s)", flush=True)

    durs_path.write_text(json.dumps(duraciones, indent=2, ensure_ascii=False) + "\n")
    (VOZ_DIR / "_informe.json").write_text(json.dumps(informe, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

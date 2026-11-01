"""Casting con VoiceDesign: genera voces candidatas con el MISMO guion, las evalúa y
las clasifica. Uso:
    python -m mokta_tts.casting --out casting/ronda1 --seeds 2
"""
from __future__ import annotations
import argparse, json, time
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

from .device import pick_device, whisper_config
from .evaluate import evaluate_take
from .paths import MODELS

# Guion de casting: recorre registro analítico, tensión, sorpresa y énfasis.
CASTING_TEXT = (
    "En dos mil diecinueve, nadie le prestó atención a este dato. Parecía irrelevante. "
    "Pero cuando cruzamos las cifras, apareció algo inquietante: el mismo patrón, repetido una y otra vez. "
    "¿Casualidad? No. Y lo que descubrimos después… lo cambia todo."
)

PERSONAS = {
    "A_documental_en": (
        "Male, around 40 years old, native Latin American Spanish speaker with a neutral accent. "
        "Medium-low baritone timbre with warm chest resonance. Serious, confident and analytical delivery, "
        "like a professional documentary narrator. Clear articulation, measured pace, natural pauses, "
        "subtle dramatic tension and emphasis on key words."
    ),
    "B_documental_es": (
        "Locutor masculino de unos 40 años, español latinoamericano neutro. Timbre medio-grave, cálido y con cuerpo. "
        "Tono serio, seguro y analítico, como narrador de documental de investigación. Dicción clara, ritmo pausado, "
        "énfasis en las palabras clave y tensión contenida."
    ),
    "C_investigacion_en": (
        "Deep yet natural male voice, 35 to 45 years old, neutral Latin American Spanish, baritone. "
        "Calm authority, intelligent and analytical, slightly textured, intimate close-mic narration. "
        "Builds suspense with controlled intensity and conveys surprise and gravity without exaggeration."
    ),
    "D_divulgador_en": (
        "Male, early 30s, neutral Latin American Spanish, mid-low pitch, crisp and modern. Confident, sharp and "
        "analytical like a top educational YouTube narrator; engaging and dynamic intonation, expressive but never theatrical."
    ),
    "E_broadcast_en": (
        "Professional male broadcast voice, 45 years old, neutral Latin American Spanish, rich low-mid register, "
        "steady and authoritative. Serious news-documentary tone, precise diction, deliberate pacing with meaningful pauses."
    ),
}


def load_design_model(dev):
    from qwen_tts import Qwen3TTSModel
    return Qwen3TTSModel.from_pretrained(str(MODELS / "Qwen3-TTS-12Hz-1.7B-VoiceDesign"),
                                         device_map=dev["device"], dtype=dev["dtype"],
                                         attn_implementation=dev["attn"])


def _final(rep) -> tuple[float, float]:
    # objetivo "medio-grave": mediana de F0 ~ 80-125 Hz
    pen = 0.0
    if rep.f0_median > 125: pen = 0.25 * (rep.f0_median - 125)
    if rep.f0_median < 80: pen = 0.25 * (80 - rep.f0_median)
    return round(rep.score - pen, 3), round(pen, 2)


def rescore(out: Path, whisper: str):
    dev = pick_device(); wcfg = {**whisper_config(dev), "model": whisper}
    rp = out / "reporte.json"
    rows = json.loads(rp.read_text())
    for r in rows:
        wav, sr = sf.read(out / f"{r['id']}.wav", dtype="float32")
        rep = evaluate_take(wav, sr, CASTING_TEXT, wcfg)
        r.update(rep.to_dict())
        r["final"], r["pitch_penalty"] = _final(rep)
    rows.sort(key=lambda r: r["final"], reverse=True)
    rp.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    for r in rows:
        print(f"{r['final']:8.2f}  {r['id']:24s} cer={r['cer']:.3f} pesq={r['pesq']:.2f} stoi={r['stoi']:.3f} "
              f"seseo={r.get('seseo_delta')} f0={r['f0_median']:.0f}Hz var={r['f0_st_std']:.2f}st art={r['chars_per_sec']:.1f}l/s dur={r['duration']:.1f}s")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="casting/ronda1")
    ap.add_argument("--seeds", type=int, default=2)
    ap.add_argument("--personas", nargs="*", default=None)
    ap.add_argument("--whisper", default="large-v3-turbo")
    ap.add_argument("--rescore", action="store_true", help="re-evaluar los WAV existentes sin generar")
    ap.add_argument("--describir", help="descripción libre de una voz nueva (reemplaza las personas predefinidas)")
    ap.add_argument("--nombre", default="nueva", help="nombre corto para la voz de --describir")
    a = ap.parse_args()
    if a.describir:
        PERSONAS.clear(); PERSONAS[a.nombre] = a.describir
    if a.rescore:
        return rescore(Path(a.out), a.whisper)

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    dev = pick_device(); wcfg = {**whisper_config(dev), "model": a.whisper}
    print("Hardware:", dev["info"], dev["device"], dev["dtype"], flush=True)
    model = load_design_model(dev)
    results = []
    report_path = out / "reporte.json"
    if report_path.exists():
        results = json.loads(report_path.read_text())
    done = {r["id"] for r in results}
    for name, instruct in PERSONAS.items():
        if a.personas and name not in a.personas:
            continue
        for seed in range(a.seeds):
            vid = f"{name}_s{seed}"
            if vid in done:
                continue
            torch.manual_seed(1000 + seed)
            t = time.time()
            wavs, sr = model.generate_voice_design(text=CASTING_TEXT, language="Spanish", instruct=instruct,
                                                   temperature=0.8, subtalker_temperature=0.8,
                                                   max_new_tokens=int(len(CASTING_TEXT) * 2) + 120)
            wav = np.asarray(wavs[0], dtype=np.float32)
            sf.write(out / f"{vid}.wav", wav, sr)
            rep = evaluate_take(wav, sr, CASTING_TEXT, wcfg)
            final, pitch_pen = _final(rep)
            row = {"id": vid, "persona": name, "seed": seed, "instruct": instruct,
                   **rep.to_dict(), "pitch_penalty": pitch_pen,
                   "final": final, "gen_seconds": round(time.time() - t, 1)}
            results.append(row)
            report_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
            print(f"{vid}: final={row['final']} cer={rep.cer:.3f} pesq={rep.pesq:.2f} f0={rep.f0_median:.0f}Hz "
                  f"var={rep.f0_st_std:.2f}st cps={rep.chars_per_sec:.1f} | {rep.transcript}", flush=True)
    results.sort(key=lambda r: r["final"], reverse=True)
    report_path.write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print("\nRANKING")
    for r in results:
        print(f"{r['final']:8.2f}  {r['id']}")


if __name__ == "__main__":
    main()

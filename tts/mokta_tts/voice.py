"""Construcción del paquete de voz MOKTA ("diseñar y luego clonar").

Por qué: VoiceDesign genera un timbre ligeramente distinto en cada llamada, lo que en
un video con 20 escenas se nota. La solución robusta es:
  1. Elegir la toma ganadora del casting como voz MAESTRA.
  2. Con VoiceDesign + la misma descripción, generar referencias cortas para cada
     emoción (neutral, tensión, sorpresa, énfasis) y quedarse con las que más se
     parecen a la maestra (similitud de hablante) y mejor se entienden (CER).
  3. En producción, el modelo Base clona esas referencias (modo ICL): el timbre queda
     fijo y la referencia de cada emoción arrastra su prosodia.

Uso:
    python -m mokta_tts.voice --master casting/ronda1/A_documental_en_s0.wav \
        --persona A_documental_en --name mokta_narrador --takes 4
"""
from __future__ import annotations
import argparse, gc, json, shutil, time
from pathlib import Path

import numpy as np
import soundfile as sf
import librosa
import torch

from .casting import PERSONAS, CASTING_TEXT, load_design_model
from .device import pick_device, whisper_config
from .evaluate import evaluate_take, cosine
from .paths import MODELS, VOICES
from . import audio as A

EMOTION_REFS = {
    "neutral": {
        "text": "Si analizamos los datos con calma, la conclusión es clara: el crecimiento no fue casual, "
                "sino el resultado de decisiones muy concretas.",
        "style": "Calm, analytical, measured and confident delivery, natural conversational documentary narration.",
    },
    "tension": {
        "text": "Hace tiempo que algo no encajaba. Los registros estaban incompletos, y cada pista nos conducía "
                "al mismo lugar… un lugar que nadie quería mirar.",
        "style": "Restrained, lower and slower delivery that builds suspense; tense, mysterious, quiet intensity.",
    },
    "sorpresa": {
        "text": "¿Y saben qué encontramos? Justo lo contrario de lo que todos decían. ¡Por primera vez, nadie conocía la verdad!",
        "style": "Genuine surprise and astonishment with lively rising intonation, building to a striking revelation.",
    },
    "enfasis": {
        "text": "Esto no es una opinión. Es un hecho. Y el precio de ignorarlo será cien veces mayor: "
                "necesitamos conciencia, y la necesitamos ahora.",
        "style": "Firm, emphatic and authoritative; strong stress on key words, decisive and powerful but controlled.",
    },
}


def load_base_model(dev):
    from qwen_tts import Qwen3TTSModel
    return Qwen3TTSModel.from_pretrained(str(MODELS / "Qwen3-TTS-12Hz-1.7B-Base"),
                                         device_map=dev["device"], dtype=dev["dtype"],
                                         attn_implementation=dev["attn"])


def speaker_embedding(base_model, wav: np.ndarray, sr: int) -> torch.Tensor:
    m = base_model.model
    w = wav.astype(np.float32)
    if sr != m.speaker_encoder_sample_rate:
        w = librosa.resample(w, orig_sr=sr, target_sr=m.speaker_encoder_sample_rate)
    with torch.no_grad():
        return m.extract_speaker_embedding(audio=w, sr=m.speaker_encoder_sample_rate).float().cpu()


def max_tokens_for(text: str) -> int:
    # 12.5 frames/s; ~13 letras/s -> ~1 frame por letra. Margen x2 + colchón: evita bucles sin EOS.
    return int(len(text) * 2.0) + 120


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--master", required=True, help="WAV ganador del casting")
    ap.add_argument("--master-text", default=CASTING_TEXT)
    ap.add_argument("--persona", required=True, help=f"clave en PERSONAS {list(PERSONAS)} o texto libre")
    ap.add_argument("--name", default="mokta_narrador")
    ap.add_argument("--takes", type=int, default=4, help="tomas por emoción")
    ap.add_argument("--whisper", default="large-v3-turbo")
    a = ap.parse_args()

    persona = PERSONAS.get(a.persona, a.persona)
    vdir = VOICES / a.name; (vdir / "refs").mkdir(parents=True, exist_ok=True)
    cand_dir = vdir / "candidatos"; cand_dir.mkdir(exist_ok=True)
    dev = pick_device(); wcfg = {**whisper_config(dev), "model": a.whisper}

    master_wav, msr = sf.read(a.master, dtype="float32")
    shutil.copy(a.master, vdir / "maestra.wav")

    # ---- 1) referencias emocionales con VoiceDesign
    state_path = cand_dir / "candidatos.json"
    cands = json.loads(state_path.read_text()) if state_path.exists() else []
    have = {c["file"] for c in cands}
    need = [(e, k) for e in EMOTION_REFS for k in range(a.takes) if f"{e}_{k}.wav" not in have]
    if need:
        design = load_design_model(dev)
        for emo, k in need:
            spec = EMOTION_REFS[emo]
            torch.manual_seed(7000 + k)
            t = time.time()
            wavs, sr = design.generate_voice_design(
                text=spec["text"], language="Spanish", instruct=f"{persona} {spec['style']}",
                temperature=0.8, subtalker_temperature=0.8, max_new_tokens=max_tokens_for(spec["text"]))
            w = A.trim(np.asarray(wavs[0], dtype=np.float32), sr)
            f = f"{emo}_{k}.wav"; sf.write(cand_dir / f, w, sr)
            rep = evaluate_take(w, sr, spec["text"], wcfg)
            cands.append({"emotion": emo, "take": k, "file": f, "sr": sr, **rep.to_dict()})
            state_path.write_text(json.dumps(cands, ensure_ascii=False, indent=2))
            print(f"[design] {f} cer={rep.cer:.3f} pesq={rep.pesq:.2f} f0={rep.f0_median:.0f} "
                  f"({time.time() - t:.0f}s) | {rep.transcript}", flush=True)
        del design; gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    # la propia maestra compite como referencia "neutral" (timbre exacto)
    if "neutral_master.wav" not in {c["file"] for c in cands}:
        mw = A.trim(master_wav, msr)
        sf.write(cand_dir / "neutral_master.wav", mw, msr)
        rep = evaluate_take(mw, msr, a.master_text, wcfg)
        cands.append({"emotion": "neutral", "take": -1, "file": "neutral_master.wav", "sr": msr,
                      "ref_text": a.master_text, **rep.to_dict()})

    # ---- 2) similitud de hablante con la maestra (codificador del modelo Base)
    base = load_base_model(dev)
    m_emb = speaker_embedding(base, master_wav, msr)
    torch.save(m_emb, vdir / "maestra_embedding.pt")
    for c in cands:
        w, sr = sf.read(cand_dir / c["file"], dtype="float32")
        c["spk_sim"] = cosine(speaker_embedding(base, w, sr), m_emb)
        from .evaluate import TakeReport, score
        fields = {k: c[k] for k in TakeReport.__dataclass_fields__ if k in c and k != "words"}
        c["score"] = score(TakeReport(**fields))
    state_path.write_text(json.dumps(cands, ensure_ascii=False, indent=2))

    # ---- 3) elegir la mejor referencia por emoción (la maestra compite en "neutral")
    chosen = {}
    master_rep = None
    for emo in EMOTION_REFS:
        pool = [c for c in cands if c["emotion"] == emo]
        # las referencias se propagan a toda la producción: exigimos seseo claro (>= -2 dB)
        strict = [c for c in pool if c.get("seseo_delta") is not None and c["seseo_delta"] >= -2.0]
        pool = strict or pool
        best = max(pool, key=lambda c: c["score"])
        chosen[emo] = best
        src = cand_dir / best["file"]
        shutil.copy(src, vdir / "refs" / f"{emo}.wav")
        print(f"[elegida] {emo}: {best['file']} score={best['score']} sim={best['spk_sim']:.3f} cer={best['cer']:.3f}")

    meta = {
        "name": a.name,
        "language": "Spanish",
        "persona_instruct": persona,
        "master": {"file": "maestra.wav", "text": a.master_text},
        "emotions": {e: {"file": f"refs/{e}.wav", "text": chosen[e].get("ref_text", EMOTION_REFS[e]["text"]),
                         "spk_sim": round(chosen[e]["spk_sim"], 4), "cer": round(chosen[e]["cer"], 4)}
                     for e in EMOTION_REFS},
        "created": time.strftime("%Y-%m-%d %H:%M"),
    }
    (vdir / "voice.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    print("Paquete de voz listo en", vdir)


if __name__ == "__main__":
    main()

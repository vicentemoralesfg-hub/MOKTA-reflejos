"""Generación de locuciones por escenas para Remotion.

    python -m mokta_tts.generate guiones/mi_video.md
    python -m mokta_tts.generate guiones/mi_video.md --takes 4 --fps 30 --out salida/mi_video

Para cada fragmento genera varias tomas con la voz MOKTA, las evalúa (Whisper CER,
similitud de timbre, limpieza, ritmo, expresividad) y se queda con la mejor. Une los
fragmentos con pausas naturales, normaliza el volumen de todo el proyecto con una sola
ganancia (respeta la dinámica entre escenas) y exporta WAV 48 kHz / 24 bit por escena,
la narración completa y un manifiesto JSON + TS listo para importar en Remotion.
Es incremental: sólo regenera los fragmentos cuyo texto/emoción cambió.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys, time
from pathlib import Path

import numpy as np
import soundfile as sf
import torch
import transformers

from . import audio as A

transformers.logging.set_verbosity_error()
from .device import pick_device, whisper_config
from .evaluate import evaluate_take, cosine, SESEO_MIN
from .paths import VOICES, ROOT
from .text import parse_script, Scene
from .voice import load_base_model, speaker_embedding, max_tokens_for

ENGINE_VERSION = "1"
EMOTION_LUFS_OFFSET = {"tension": -1.5, "neutral": 0.0, "sorpresa": 0.5, "enfasis": 1.0}


class Narrator:
    def __init__(self, voice: str, dev: dict, anchor_timbre: bool = True):
        self.vdir = VOICES / voice
        meta_p = self.vdir / "voice.json"
        if not meta_p.exists():
            sys.exit(f"No existe el paquete de voz {self.vdir}. Ejecuta primero mokta_tts.voice")
        self.meta = json.loads(meta_p.read_text())
        self.dev = dev
        t = time.time()
        self.model = load_base_model(dev)
        print(f"Modelo Base cargado en {time.time() - t:.0f}s ({dev['device']}, {dev['dtype']}, {dev['attn']})", flush=True)
        self.master_emb = torch.load(self.vdir / "maestra_embedding.pt")
        self.prompts = {}
        for emo, spec in self.meta["emotions"].items():
            item = self.model.create_voice_clone_prompt(ref_audio=str(self.vdir / spec["file"]),
                                                        ref_text=spec["text"], x_vector_only_mode=False)[0]
            if anchor_timbre:
                # timbre anclado a la voz maestra; la referencia emocional aporta la prosodia (ICL)
                item.ref_spk_embedding = self.master_emb.to(item.ref_spk_embedding.device,
                                                            item.ref_spk_embedding.dtype)
            self.prompts[emo] = item
        self.fingerprint = hashlib.sha1(json.dumps(self.meta, sort_keys=True).encode()
                                        + str(anchor_timbre).encode()).hexdigest()[:10]

    def synth(self, text: str, emotion: str, n: int, seed: int, temperature: float):
        item = self.prompts.get(emotion) or self.prompts["neutral"]
        torch.manual_seed(seed)
        wavs, sr = self.model.generate_voice_clone(
            text=[text] * n, language=["Spanish"] * n, voice_clone_prompt=[item] * n,
            temperature=temperature, subtalker_temperature=temperature, top_k=50, top_p=0.95,
            repetition_penalty=1.05, max_new_tokens=max_tokens_for(text))
        return [np.asarray(w, dtype=np.float32) for w in wavs], sr


def chunk_key(text, emotion, fp, temperature):
    return hashlib.sha1(f"{ENGINE_VERSION}|{fp}|{emotion}|{temperature}|{text}".encode()).hexdigest()[:16]


def best_take(nar: Narrator, text: str, emotion: str, wcfg: dict, takes: int, max_takes: int,
              temperature: float, cer_ok: float, batch: int, log) -> tuple[np.ndarray, int, dict, list]:
    reports, seed, best = [], 0, None
    while len(reports) < max_takes:
        want = takes if len(reports) < takes else min(batch, max_takes - len(reports))
        want = min(want, max_takes - len(reports))
        done_batch = 0
        while done_batch < want:
            nb = min(batch, want - done_batch)
            wavs, sr = nar.synth(text, emotion, nb, seed=1234 + seed * 97, temperature=temperature)
            seed += 1
            for w in wavs:
                w = A.trim(w, sr)
                if len(w) < sr * 0.2:
                    continue
                emb = speaker_embedding(nar.model, w, sr)
                rep = evaluate_take(w, sr, text, wcfg, spk_emb=emb, ref_emb=nar.master_emb)
                reports.append((rep, w, sr))
                log(f"      toma {len(reports)}: score={rep.score:6.2f} cer={rep.cer:.3f} sim={rep.spk_sim:.3f} "
                    f"pesq={rep.pesq:.2f} art={rep.chars_per_sec:.1f} var={rep.f0_st_std:.1f}st seseo={rep.seseo_delta}")
            done_batch += nb
        best = max(reports, key=lambda r: r[0].score)
        accent_ok = best[0].seseo_delta is None or best[0].seseo_delta >= SESEO_MIN
        if best[0].cer <= cer_ok and accent_ok and len(reports) >= takes:
            break
        if len(reports) >= takes:
            why = f"CER {best[0].cer:.3f} > {cer_ok}" if best[0].cer > cer_ok else f"acento (seseo {best[0].seseo_delta} dB)"
            log(f"      ↻ {why}: generando tomas extra")
    rep, w, sr = best
    return w, sr, rep.to_dict(with_words=True), [r[0].to_dict() for r in reports]


def render_scene(sc: Scene, nar: Narrator, cache: Path, wcfg: dict, args, log):
    """Devuelve (wav 24k, sr, palabras, info de fragmentos)."""
    parts, words, chunks_info, pos, sr_out = [], [], [], 0.0, 24000
    head = A.silence(args.head, sr_out); parts.append(head); pos += args.head
    segs = sc.segments
    for i, seg in enumerate(segs):
        if seg.kind == "pause":
            parts.append(A.silence(seg.seconds, sr_out)); pos += seg.seconds
            continue
        key = chunk_key(seg.text, seg.emotion, nar.fingerprint, args.temperature)
        wav_p, js_p = cache / f"{key}.wav", cache / f"{key}.json"
        if wav_p.exists() and js_p.exists() and not args.force:
            w, sr = sf.read(wav_p, dtype="float32"); info = json.loads(js_p.read_text())
            log(f"   · [{seg.emotion}] (caché) {seg.text[:70]}")
        else:
            log(f"   · [{seg.emotion}] {seg.text[:90]}")
            w, sr, best, allr = best_take(nar, seg.text, seg.emotion, wcfg, args.takes, args.max_takes,
                                          args.temperature, args.cer_ok, args.batch, log)
            info = {"text": seg.text, "emotion": seg.emotion, "best": best, "takes": allr}
            sf.write(wav_p, w, sr); js_p.write_text(json.dumps(info, ensure_ascii=False, indent=1))
        assert sr == sr_out
        w = A.fade(w, sr)
        for wd in info["best"]["words"]:
            words.append({"word": wd["word"], "start": round(pos + wd["start"], 3), "end": round(pos + wd["end"], 3)})
        chunks_info.append({"text": seg.text, "emotion": seg.emotion, "start": round(pos, 3),
                            "duration": round(len(w) / sr, 3),
                            "quality": {k: info["best"][k] for k in ("score", "cer", "spk_sim", "pesq", "transcript")}})
        parts.append(w); pos += len(w) / sr
        # pausa natural tras el fragmento (no al final de la escena: lo cubre la cola)
        nxt = segs[i + 1] if i + 1 < len(segs) else None
        if nxt is not None and nxt.kind == "speech":
            parts.append(A.silence(seg.pause_after, sr)); pos += seg.pause_after
    parts.append(A.silence(args.tail, sr_out))
    return np.concatenate(parts), sr_out, words, chunks_info


def main():
    ap = argparse.ArgumentParser(description="MOKTA TTS — locuciones por escenas")
    ap.add_argument("script", help="guion .md/.txt")
    ap.add_argument("--out", help="carpeta de salida (por defecto salida/<nombre-del-guion>)")
    ap.add_argument("--voice", default="mokta_narrador")
    ap.add_argument("--takes", type=int, default=3, help="tomas por fragmento (se elige la mejor)")
    ap.add_argument("--max-takes", type=int, default=6, help="máximo si ninguna toma es inteligible")
    ap.add_argument("--batch", type=int, default=0, help="tomas en paralelo (0=auto)")
    ap.add_argument("--cer-ok", type=float, default=0.03, help="CER aceptable")
    ap.add_argument("--temperature", type=float, default=0.75)
    ap.add_argument("--max-chars", type=int, default=240, help="tamaño máximo de fragmento")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--lufs", type=float, default=-16.0, help="loudness objetivo de la narración")
    ap.add_argument("--head", type=float, default=0.10, help="silencio inicial por escena (s)")
    ap.add_argument("--tail", type=float, default=0.40, help="silencio final por escena (s)")
    ap.add_argument("--scene-gap", type=float, default=0.6, help="silencio entre escenas en la pista completa")
    ap.add_argument("--whisper", default=None, help="modelo Whisper para QA (auto)")
    ap.add_argument("--no-anchor", action="store_true", help="no anclar timbre a la voz maestra")
    ap.add_argument("--only", nargs="*", help="generar sólo estas escenas (ids)")
    ap.add_argument("--force", action="store_true", help="ignorar caché")
    ap.add_argument("--device", default=None, help="cuda|mps|cpu (auto)")
    args = ap.parse_args()

    script = Path(args.script)
    out = Path(args.out) if args.out else ROOT / "salida" / script.stem
    (out / "escenas").mkdir(parents=True, exist_ok=True)
    cache = out / ".cache"; cache.mkdir(exist_ok=True)
    logf = open(out / "log.txt", "a", encoding="utf-8")

    def log(msg):
        print(msg, flush=True); logf.write(msg + "\n"); logf.flush()

    scenes = parse_script(script.read_text(encoding="utf-8"), max_chars=args.max_chars)
    if args.only:
        scenes = [s for s in scenes if s.id in args.only]
    if not scenes:
        sys.exit("El guion no contiene texto.")
    dev = pick_device(args.device)
    gpu = dev["device"].startswith("cuda")
    if args.batch <= 0:
        args.batch = args.takes if gpu or dev["device"] == "mps" else 1
    wcfg = {**whisper_config(dev), "model": args.whisper or "large-v3-turbo"}
    log(f"\n=== {time.strftime('%Y-%m-%d %H:%M')} · {script.name} · {len(scenes)} escenas · {dev['info']}")

    nar = Narrator(args.voice, dev, anchor_timbre=not args.no_anchor)
    t0 = time.time()
    rendered = []
    for sc in scenes:
        log(f"\n▶ {sc.id} [{sc.emotion}]")
        wav, sr, words, chunks = render_scene(sc, nar, cache, wcfg, args, log)
        rendered.append((sc, wav, sr, words, chunks))

    # volumen: cada escena al objetivo + un pequeño desplazamiento según la emoción
    # (la tensión algo más contenida, el énfasis algo más presente) -> coherente sin aplanar la dinámica
    import pyloudnorm as pyln
    meter = pyln.Meter(24000)

    manifest = {"version": 1, "script": script.name, "voice": args.voice, "fps": args.fps,
                "sampleRate": 48000, "lufs": args.lufs, "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "scenes": []}
    timeline, full_parts, frame_tl = 0.0, [], 0
    gap_frames = int(round(args.scene_gap * args.fps))
    for i, (sc, wav, sr, words, chunks) in enumerate(rendered):
        lufs = meter.integrated_loudness(wav)
        target = args.lufs + EMOTION_LUFS_OFFSET.get(sc.emotion, 0.0)
        gain = 10 ** ((target - lufs) / 20) if np.isfinite(lufs) else 1.0
        w = A.highpass(wav * gain, sr, 55)
        w = _limit(w, -1.0)
        fname = f"{sc.id}.wav"
        dur = A.export(out / "escenas" / fname, w, sr)
        frames = int(np.ceil(dur * args.fps))
        manifest["scenes"].append({
            "id": sc.id, "emotion": sc.emotion, "file": f"escenas/{fname}",
            "durationSec": round(dur, 3), "durationInFrames": frames,
            "startSec": round(frame_tl / args.fps, 3), "startFrame": frame_tl,
            "text": sc.raw, "words": words, "chunks": chunks})
        # la pista completa se construye en frames enteros: coincide exactamente con <Series> de Remotion
        seg_frames = frames + (gap_frames if i < len(rendered) - 1 else 0)
        full_parts.append(np.concatenate([w, A.silence(seg_frames / args.fps - len(w) / sr, sr)]))
        frame_tl += seg_frames
    full = np.concatenate(full_parts)
    total = A.export(out / "narracion_completa.wav", full, 24000)
    manifest["totalDurationSec"] = round(total, 3)
    manifest["totalDurationInFrames"] = frame_tl
    (out / "voiceover.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    write_ts(out, manifest)
    write_quality(out, manifest)
    log(f"\n✔ {len(rendered)} escenas · {total:.1f}s de audio · {time.time() - t0:.0f}s de proceso · {out}")


def _limit(w: np.ndarray, peak_db: float) -> np.ndarray:
    ceil = 10 ** (peak_db / 20); knee = ceil * 0.7
    a = np.abs(w); over = a > knee
    w = w.copy()
    w[over] = np.sign(w[over]) * (knee + (ceil - knee) * np.tanh((a[over] - knee) / (ceil - knee)))
    return w.astype(np.float32)


def write_ts(out: Path, man: dict):
    """Módulo TS para Remotion: copia la carpeta de salida a public/ y usa staticFile()."""
    folder = out.name
    scenes = [{k: s[k] for k in ("id", "emotion", "durationSec", "durationInFrames", "startSec", "startFrame")}
              | {"src": f"voiceover/{folder}/{s['file']}", "captions": to_captions(s["words"])} for s in man["scenes"]]
    (out / "captions").mkdir(exist_ok=True)
    for s in scenes:
        (out / "captions" / f"{s['id']}.json").write_text(json.dumps(s["captions"], ensure_ascii=False, indent=1), encoding="utf-8")
    body = json.dumps(scenes, ensure_ascii=False, indent=2)
    ts = f"""// Generado por MOKTA TTS — no editar a mano.
// Copia la carpeta `{folder}` dentro de `public/voiceover/` de tu proyecto Remotion.
// `captions` usa el tipo Caption de @remotion/captions (ms relativos al inicio de la escena).
import type {{Caption}} from "@remotion/captions";
export type VoiceoverScene = {{
  id: string; emotion: string; src: string;
  durationSec: number; durationInFrames: number;
  startSec: number; startFrame: number; captions: Caption[];
}};
export const VOICEOVER_FPS = {man['fps']};
export const VOICEOVER_TOTAL_FRAMES = {man['totalDurationInFrames']};
export const VOICEOVER_FULL_SRC = "voiceover/{folder}/narracion_completa.wav";
export const voiceover: VoiceoverScene[] = {body};
"""
    (out / "voiceover.ts").write_text(ts, encoding="utf-8")


def to_captions(words: list) -> list:
    return [{"text": (" " if i else "") + w["word"], "startMs": int(w["start"] * 1000), "endMs": int(w["end"] * 1000),
             "timestampMs": int((w["start"] + w["end"]) * 500), "confidence": None} for i, w in enumerate(words)]


def write_quality(out: Path, man: dict):
    rows = ["escena\tfragmento\tscore\tcer\tsim_timbre\tpesq\ttexto"]
    worst = []
    for s in man["scenes"]:
        for j, c in enumerate(s["chunks"]):
            q = c["quality"]
            rows.append(f"{s['id']}\t{j}\t{q['score']}\t{q['cer']:.3f}\t{q['spk_sim']:.3f}\t{q['pesq']:.2f}\t{c['text']}")
            if q["cer"] > 0.05:
                worst.append(f"{s['id']}#{j} (CER {q['cer']:.2f}): «{c['text']}» → «{q['transcript']}»")
    (out / "calidad.tsv").write_text("\n".join(rows), encoding="utf-8")
    if worst:
        print("\n⚠ Fragmentos a revisar (posible error de pronunciación):")
        for w in worst:
            print("  ", w)


if __name__ == "__main__":
    main()

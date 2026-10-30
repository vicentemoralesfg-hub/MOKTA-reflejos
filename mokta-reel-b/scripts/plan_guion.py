#!/usr/bin/env python3
"""
MOKTA · Reel B — el guion manda el ritmo.

Lee src/reel/guion.json (voz) y src/reel/escenas.json (velocidades y física) y:
  1. mide cada frase: grabación real en public/audio/voz/<id>.wav si existe; si no, voz guía sintetizada
     (espeak-ng + MBROLA) en public/audio/voz_guia/<id>.wav
  2. coloca las escenas alrededor de la voz:
       ronda = presentación hablada → silencio (distinto en cada ronda) → barrera → ventana sin voz
               → impacto → lectura hablada
     y escribe src/reel/timeline.json (lo leen Remotion, audio_reel.py y qa_reel.py)
  3. escribe src/reel/subtitulos.json (palabra por palabra) y public/audio/voz.wav (pista de voz completa)
  4. escribe GUION.md (guion con tiempos + guía de grabación)

Regla: nunca hay voz entre 1,2 s antes de la barrera y el impacto (la voz no puede anunciarla).
"""
import json
import math
import os
import re
import shutil
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, "src", "reel", "guion.json")))
B = json.load(open(os.path.join(ROOT, "src", "reel", "escenas.json")))
FPS = B["fps"]
SR = 48000
REAL = os.path.join(ROOT, "public", "audio", "voz")
GUIDE = os.path.join(ROOT, "public", "audio", "voz_guia")
os.makedirs(GUIDE, exist_ok=True)

TOKEN = re.compile(r"(\S+?)\{([^}]*)\}(\S*)|(\S+)")


def tokens(text):
    """[(mostrado, dicho)]: '120{ciento veinte}.' → ('120.', 'ciento veinte.')."""
    out = []
    for m in TOKEN.finditer(text):
        if m.group(4):
            out.append((m.group(4), m.group(4)))
        else:
            out.append((m.group(1) + m.group(3), m.group(2) + m.group(3)))
    return out


def spoken(text):
    return " ".join(s for _, s in tokens(text))


def display(text):
    return " ".join(d for d, _ in tokens(text))


def syllables(word):
    w = word.lower()
    groups = re.findall(r"[aeiouáéíóúü]+", w)
    n = 0
    for g in groups:
        # hiato entre vocales fuertes (a, e, o) o con tilde: cuenta dos
        n += 1 + len(re.findall(r"(?<=[aeoáéó])[aeoáéó]|[íú](?=[aeo])|(?<=[aeo])[íú]", g))
    return max(n, 1)


def load_trim(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    x /= 32768.0 if np.max(np.abs(x)) > 1.5 else 1.0
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    env = np.abs(x) > 0.02
    idx = np.nonzero(env)[0]
    if len(idx):
        x = x[max(0, idx[0] - int(0.01 * SR)): idx[-1] + int(0.04 * SR)]
    return x


def voice(line):
    real = os.path.join(REAL, f"{line['id']}.wav")
    if os.path.exists(real):
        return load_trim(real), "grabación"
    raw = os.path.join(GUIDE, f"{line['id']}_raw.wav")
    subprocess.run(["espeak-ng", "-v", G["voice"]["espeak"], "-s", str(G["voice"]["wpm"]), "-w", raw, spoken(line["text"])],
                   check=True, capture_output=True)
    x = load_trim(raw)
    os.remove(raw)
    wavfile.write(os.path.join(GUIDE, f"{line['id']}.wav"), SR, (x / max(1e-9, np.max(np.abs(x))) * 0.9 * 32767).astype(np.int16))
    return x, "voz guía"


placed = []  # líneas con tiempo absoluto


def lay(lines, block, t0_abs, t_rel=0.0):
    """Coloca las frases una tras otra desde t_rel (segundos relativos al bloque). Devuelve el final relativo."""
    cur = t_rel
    for ln in lines:
        audio, src = voice(ln)
        dur = len(audio) / SR
        start = cur + ln.get("gap", 0.3)
        placed.append(dict(id=ln["id"], block=block, start=t0_abs + start, dur=dur, text=ln["text"], em=ln.get("em", []), audio=audio, src=src, sub=not ln.get("noSub")))
        cur = start + dur
    return cur


def rel_start(line_id, t0_abs):
    ln = next(p for p in placed if p["id"] == line_id)
    return ln["start"] - t0_abs


fr = lambda s: int(round(s * FPS))  # noqa: E731

timeline = {"_comment": "GENERADO por scripts/plan_guion.py a partir de guion.json + escenas.json. No editar a mano.",
            **{k: B[k] for k in ("fps", "barrierDistanceM", "decelG", "rampFrames", "blackFrames")}}

# ---------------------------------------------------------------- gancho
end = lay(G["hook"]["lines"], "hook", 0.0)
hook_frames = math.ceil((end + G["hook"]["tail"]) * FPS)
timeline["hook"] = {"duration": hook_frames, "pausarAt": fr(rel_start("H2", 0)), "rondasAt": fr(rel_start("H3", 0))}

# ---------------------------------------------------------------- rondas
t_abs = hook_frames / FPS
rounds = []
D = B["barrierDistanceM"]
for base, g in zip(B["rounds"], G["rounds"]):
    A = t_abs
    intro_end = lay(g["intro"], base["id"], A)
    event = fr(intro_end + g["silenceBeforeBarrier"])
    v = base["speedKmh"] / 3.6
    impact = event + math.ceil(D / v * FPS - 1e-9)
    result = impact + B["blackFrames"]
    res_end = lay(g["result"], base["id"], A, result / FPS)
    duration = math.ceil((res_end + g["resultTail"]) * FPS)
    first_intro_end = next(p for p in placed if p["id"] == g["intro"][0]["id"])
    r = {**base, "eventAt": event, "resultFrames": duration - result,
         "titleOut": fr(first_intro_end["start"] - A + first_intro_end["dur"] + 0.3),
         "cardBigAt": fr(rel_start(g["card"]["bigWith"], A) - result / FPS),
         "cardSubAt": fr(rel_start(g["card"]["subWith"], A) - result / FPS),
         "cardScaleAt": fr(rel_start(g["card"]["scaleWith"], A) - result / FPS) + 6}
    if base["id"] == "r2":
        r["decoyPassAt"] = event - fr(1.9)
    # control: la voz calla desde 1,2 s antes de la barrera hasta el impacto
    for p in placed:
        if p["block"] == base["id"]:
            s0, s1 = p["start"] - A, p["start"] - A + p["dur"]
            assert s1 <= event / FPS - 1.2 or s0 >= impact / FPS, f"voz {p['id']} demasiado cerca de la barrera"
    rounds.append(r)
    t_abs = A + duration / FPS
timeline["rounds"] = rounds

# ---------------------------------------------------------------- cierre y CTA
A = t_abs
end = lay(G["reveal"]["lines"], "reveal", A)
rev_frames = math.ceil((end + G["reveal"]["tail"]) * FPS)
timeline["reveal"] = {"duration": rev_frames, "barsAt": fr(rel_start(G["reveal"]["sync"]["barsWith"], A)), "factAt": fr(rel_start(G["reveal"]["sync"]["factWith"], A))}
A2 = A + rev_frames / FPS
end = lay(G["cta"]["lines"], "cta", A2)
cta_frames = math.ceil((end + G["cta"]["tail"]) * FPS)
timeline["cta"] = {"duration": cta_frames, "titleAt": fr(rel_start(G["cta"]["sync"]["titleWith"], A2)), "commentAt": fr(rel_start(G["cta"]["sync"]["commentWith"], A2))}
total_frames = hook_frames + sum(r["eventAt"] + math.ceil(D / (r["speedKmh"] / 3.6) * FPS - 1e-9) + B["blackFrames"] + r["resultFrames"] for r in rounds) + rev_frames + cta_frames

json.dump(timeline, open(os.path.join(ROOT, "src", "reel", "timeline.json"), "w"), ensure_ascii=False, indent=2)

# ---------------------------------------------------------------- subtítulos (palabra por palabra)
MAXC = G["subtitleMaxChars"]
subs = []
for p in [q for q in placed if q["sub"]]:
    toks = tokens(p["text"])
    weights = []
    for d, s in toks:
        w = sum(syllables(x) for x in s.split())
        if re.search(r"[.?!…:]$", d):
            w += 2.0
        elif d.endswith(","):
            w += 1.2
        weights.append(w)
    total_w = sum(weights)
    t = p["start"]
    words = []
    for (d, _), w in zip(toks, weights):
        bare = re.sub(r"[¿?¡!.,:…]", "", d)
        words.append({"w": d, "f": fr(t), "em": d in p["em"] or bare in [re.sub(r"[¿?¡!.,:…]", "", e) for e in p["em"]]})
        t += p["dur"] * w / total_w
    # trozos legibles: primero por frases (puntuación); las cortas separadas por coma se unen si caben;
    # las largas se parten en dos mitades equilibradas (nunca queda una palabra sola si se puede evitar)
    txt = lambda ws: " ".join(x["w"] for x in ws)  # noqa: E731
    phrases, cur = [], []
    for wd in words:
        cur.append(wd)
        if re.search(r"[.?!…:,]$", wd["w"]):
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    merged = []
    for ph in phrases:
        if merged and merged[-1][-1]["w"].endswith(",") and len(txt(merged[-1] + ph)) <= MAXC:
            merged[-1] = merged[-1] + ph
        elif merged and len(ph) == 1 and len(txt(merged[-1] + ph)) <= MAXC + 4:
            merged[-1] = merged[-1] + ph
        else:
            merged.append(ph)
    chunks = []
    for ph in merged:
        while len(txt(ph)) > MAXC and len(ph) > 2:
            best = min(range(1, len(ph)), key=lambda i: abs(len(txt(ph[:i])) - len(txt(ph[i:]))))
            if len(txt(ph[:best])) <= MAXC:
                chunks.append(ph[:best])
                ph = ph[best:]
            else:
                cut = max(i for i in range(1, len(ph)) if len(txt(ph[:i])) <= MAXC) if len(txt(ph[:1])) <= MAXC else 1
                chunks.append(ph[:cut])
                ph = ph[cut:]
        chunks.append(ph)
    line_end = fr(p["start"] + p["dur"] + 0.25)
    for i, c in enumerate(chunks):
        end_f = chunks[i + 1][0]["f"] if i + 1 < len(chunks) else line_end
        subs.append({"line": p["id"], "from": c[0]["f"], "to": end_f, "words": c})
# que un trozo no se pise con el siguiente
for a, b in zip(subs, subs[1:]):
    a["to"] = min(a["to"], b["from"])
json.dump(subs, open(os.path.join(ROOT, "src", "reel", "subtitulos.json"), "w"), ensure_ascii=False)

# ---------------------------------------------------------------- pista de voz completa
N = int(round(total_frames / FPS * SR))
vox = np.zeros(N)
for p in placed:
    i = int(round(p["start"] * SR))
    a = p["audio"] / max(1e-9, np.max(np.abs(p["audio"]))) * 0.9
    j = min(N, i + len(a))
    vox[i:j] += a[: j - i]
wavfile.write(os.path.join(ROOT, "public", "audio", "voz.wav"), SR, (vox * 32767).astype(np.int16))
json.dump([{k: p[k] for k in ("id", "block", "start", "dur")} for p in placed], open(os.path.join(ROOT, "src", "reel", "voz_tiempos.json"), "w"))

# ---------------------------------------------------------------- GUION.md
def tc(s):
    return f"{int(s // 60):02d}:{s % 60:04.1f}"


blocks = {"hook": "GANCHO", "r1": "RONDA 1 · 120 km/h", "r2": "RONDA 2 · 160 km/h", "r3": "RONDA FINAL · 210 km/h", "reveal": "CIERRE · LA FÍSICA", "cta": "LLAMADO A LA ACCIÓN"}
starts = {"hook": 0.0}
acc = hook_frames
for r in rounds:
    starts[r["id"]] = acc / FPS
    acc += r["eventAt"] + math.ceil(D / (r["speedKmh"] / 3.6) * FPS - 1e-9) + B["blackFrames"] + r["resultFrames"]
starts["reveal"] = acc / FPS
starts["cta"] = (acc + rev_frames) / FPS
md = ["# MOKTA · Test de reflejos — Guion de la voz", "",
      f"Duración total: **{total_frames / FPS:.1f} s** ({total_frames} fotogramas a {FPS} fps). Tono: cercano, rápido y con intención; tuteo neutro.",
      "Regla de oro: la voz **calla** antes y durante cada barrera (el silencio es parte del juego) y nunca anuncia cuándo aparece.", ""]
for blk, name in blocks.items():
    md += [f"## {name} — desde {tc(starts[blk])}", "", "| Tiempo | Voz (se dice) | Subtítulo (se ve) | Máx. |", "|---|---|---|---|"]
    rows = [(p["start"], f"| {tc(p['start'])} | {spoken(p['text'])} | {display(p['text']) if p['sub'] else '*(ya escrito en pantalla)*'} | {p['dur']:.1f} s |") for p in placed if p["block"] == blk]
    if blk in ("r1", "r2", "r3"):
        r = next(x for x in rounds if x["id"] == blk)
        ev = starts[blk] + r["eventAt"] / FPS
        imp = ev + math.ceil(D / (r["speedKmh"] / 3.6) * FPS - 1e-9) / FPS
        rows.append((ev - 1e-3, f"| {tc(ev)} | *(silencio · aparece la barrera · solo motor y carretera)* | | |"))
        rows.append((imp, f"| {tc(imp)} | *(impacto · corte a negro)* | | |"))
    md += [row for _, row in sorted(rows)] + [""]
md += ["## Guía de grabación", "",
       "- Graba cada frase como archivo separado `public/audio/voz/<ID>.wav` (mono, 48 kHz, sin música, 0,1 s de aire al inicio y final).",
       "- La columna *Máx.* es la duración de la voz guía: puedes ir un poco más rápido; si vas más lento, `plan_guion.py` reacomoda todo solo.",
       "- Después de grabar: `python3 scripts/plan_guion.py` → `gen_seams_reel.py` → `audio_reel.py` → render (ver README).",
       f"- Fuente actual de cada frase: " + ", ".join(f"{p['id']} ({p['src']})" for p in placed) + "."]
open(os.path.join(ROOT, "GUION.md"), "w").write("\n".join(md) + "\n")

print(f"total {total_frames / FPS:.2f} s · gancho {hook_frames / FPS:.1f} s · " +
      " · ".join(f"{r['id']} barrera {r['eventAt'] / FPS:.1f} s" for r in rounds) +
      f" · cierre {rev_frames / FPS:.1f} s · CTA {cta_frames / FPS:.1f} s · {len(subs)} subtítulos")

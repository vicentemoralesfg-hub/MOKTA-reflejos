#!/usr/bin/env python3
"""
Tiempos reales de cada palabra para los subtítulos.

Entrada: la transcripción con marcas de tiempo de la locución completa (JSON de ElevenLabs Scribe:
lista de {"text", "type", "start", "end"}) y los segmentos que escribió importar_voz.py.
Salida: src/reel/voz_palabras.json → {ID de frase: [inicio de cada token del guion, en s desde el
inicio del archivo public/audio/voz/<ID>.wav]}. plan_guion.py lo usa en lugar de la estimación por sílabas.

  python3 scripts/alinear_palabras.py voz_elevenlabs/transcripcion.json
"""
import difflib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = json.load(open(os.path.join(ROOT, "src", "reel", "guion.json")))
SEG = json.load(open(os.path.join(ROOT, "public", "audio", "voz", "segmentos.json")))
TOKEN = re.compile(r"(\S+?)\{([^}]*)\}(\S*)|(\S+)")


def norm(w):
    return re.sub(r"[^a-záéíóúüñ0-9]", "", w.lower())


lines = G["hook"]["lines"] + [ln for r in G["rounds"] for ln in r["intro"] + r["result"]] + G["reveal"]["lines"] + G["cta"]["lines"]
# Unidades del guion: un número en pantalla ("120", "75%") se compara con la cifra que escribe la
# transcripción; el resto, palabra por palabra de lo dicho.
script = []  # (id de frase, índice de token, unidad normalizada)
ntok = {}
for ln in lines:
    toks = list(TOKEN.finditer(ln["text"]))
    ntok[ln["id"]] = len(toks)
    for k, m in enumerate(toks):
        shown = m.group(4) if m.group(4) else m.group(1) + m.group(3)
        said = m.group(4) if m.group(4) else m.group(2) + m.group(3)
        if re.fullmatch(r"[\d.,%]+", norm(shown) or "x") and not re.search(r"\d,\d", shown):
            script.append((ln["id"], k, norm(shown)))
        else:
            for w in said.split():
                script.append((ln["id"], k, norm(w)))

data = json.load(open(sys.argv[1]))
words = data["words"] if isinstance(data, dict) else data
words = [w for w in words if w.get("type", "word") == "word" and norm(w["text"])]
heard = [norm(w["text"]) for w in words]
sm = difflib.SequenceMatcher(a=[s[2] for s in script], b=heard, autojunk=False)
time_of = {}
for a, b, n in sm.get_matching_blocks():
    for i in range(n):
        time_of[a + i] = words[b + i]["start"]
matched = len(time_of)

tempo = SEG["tempo"]
out = {}
for idx, (lid, k, _) in enumerate(script):
    if idx not in time_of:
        continue
    t = time_of[idx] / tempo - SEG["lineas"][lid]["inicio"]
    out.setdefault(lid, {})
    out[lid].setdefault(str(k), round(max(0.0, t), 3))
# tokens sin coincidencia (p. ej. "0,58" dicho en palabras): interpolar entre vecinos de la misma frase
filled = 0
for lid, n in ntok.items():
    d = out.setdefault(lid, {})
    known = sorted((int(k), v) for k, v in d.items())
    if not known:
        continue
    for k in range(n):
        if str(k) in d:
            continue
        prev = max((x for x in known if x[0] < k), default=None)
        nxt = min((x for x in known if x[0] > k), default=None)
        if prev and nxt:
            d[str(k)] = round(prev[1] + (nxt[1] - prev[1]) * (k - prev[0]) / (nxt[0] - prev[0]), 3)
        elif prev:
            d[str(k)] = round(prev[1] + 0.25 * (k - prev[0]), 3)
        else:
            d[str(k)] = round(max(0.0, nxt[1] - 0.25 * (nxt[0] - k)), 3)
        filled += 1
json.dump(out, open(os.path.join(ROOT, "src", "reel", "voz_palabras.json"), "w"), ensure_ascii=False)
print(f"unidades del guion alineadas con la voz: {matched}/{len(script)} · tokens interpolados: {filled}")

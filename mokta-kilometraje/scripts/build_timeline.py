#!/usr/bin/env python3
"""
Fuente única de tiempos del reel.

Lee las marcas por palabra de la locución (voz/palabras_elevenlabs.json, alineación de ElevenLabs),
las ajusta a la velocidad final de la voz y escribe src/data/timeline.json, que leen:
  - Remotion (escenas, subtítulos, animaciones sincronizadas a palabras)
  - scripts/gen_audio.py (efectos de sonido en los mismos instantes)

Para cambiar dónde empieza una escena o qué palabra dispara una animación, edita SCENES / MARKERS
y vuelve a ejecutar:  python3 scripts/build_timeline.py && python3 scripts/gen_audio.py
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
VOICE_SPEED = 1.08   # la locución se acelera 8 % (sin cambiar el tono) para dar ritmo de reel
VOICE_OFFSET = 0.0   # la voz arranca en el fotograma 0: el gancho suena desde el primer instante
SCENE_LEAD = 0.12    # cada escena entra 0,12 s antes de su primera palabra
TAIL = 1.4           # cierre después de la última palabra

raw = json.load(open(os.path.join(ROOT, "voz", "palabras_elevenlabs.json")))["words"]
words = [w for w in raw if w["type"] == "word" and not w["text"].startswith("[")]


def t(sec):
    return round(VOICE_OFFSET + sec / VOICE_SPEED, 4)


# escena -> índice de la primera palabra
SCENES = [
    ("gancho", 0),
    ("comparacion", 17),     # Mismo modelo, mismo año…
    ("revelacion", 34),      # Porque el de 80 mil… está MUCHO más gastado
    ("odometro", 43),        # El odómetro cuenta vueltas de rueda…
    ("taco", 53),            # Este auto vivió en el taco… Ford…
    ("ciudad", 76),          # Trayectos cortos, frenos y embrague…
    ("habitos", 94),         # Además, su dueño…
    ("carretera", 111),      # El de 200 mil hizo carretera…
    ("veredicto", 129),      # Son los kilómetros que menos desgastan
    ("checklist", 135),      # Antes de comprar, revisa cuatro cosas…
    ("verdad", 161),         # Porque el kilometraje dice cuánto anduvo…
    ("cta", 173),            # Guarda este video…
]

# marcas con nombre -> índice de palabra (se usan en animaciones y sonido)
MARKERS = {
    "hookError": 15, "hookFinanciero": 16,
    "cmpModelo": 17, "cmpAnio": 19, "cmpA": 23, "cmpB": 29, "cmpCual": 31,
    "revMucho": 40, "revGastado": 42,
    "odoVueltas": 46, "odoNo": 49, "odoHoras": 50,
    "tacoTaco": 58, "tacoFord": 60, "tacoHora": 64, "tacoCincuenta": 70,
    "ciuCortos": 76, "ciuFrenos": 78, "ciuMotor": 86,
    "habFrio": 97, "habLomos": 100, "habMant": 107,
    "carCaliente": 117, "carVelocidad": 119, "carFrenar": 121, "carAceite": 125,
    "verMenos": 133,
    "chkCosas": 139, "chk1": 141, "chk2": 144, "chk3": 150, "chk4": 153,
    "verKm": 163, "verCuanto": 165, "verNo": 169, "verComo": 170,
    "ctaGuarda": 173,
}

# color de énfasis por palabra en los subtítulos
EMPH = {}
for i in [14, 15, 16, 40, 41, 42, 58, 88, 89, 97, 98, 99, 101, 108, 109, 110]:
    EMPH[i] = "red"
for i in [116, 117, 118, 119, 120, 133, 134]:
    EMPH[i] = "green"
for i in [9, 10, 23, 24, 29, 30, 37, 38, 50, 51, 52, 64, 66, 70, 71, 113, 114]:
    EMPH[i] = "yellow"

# escenas sin subtítulo (el texto ya está en pantalla como gráfica)
NO_CAPTIONS = {"checklist", "verdad", "cta"}

end_voice = t(words[-1]["end"])
total_s = end_voice + TAIL
total_frames = int(round(total_s * FPS))

scenes = []
for k, (sid, wi) in enumerate(SCENES):
    start_s = 0.0 if k == 0 else max(0.0, t(words[wi]["start"]) - SCENE_LEAD)
    scenes.append({"id": sid, "from": int(round(start_s * FPS)), "firstWord": wi})
for k, s in enumerate(scenes):
    nxt = scenes[k + 1]["from"] if k + 1 < len(scenes) else total_frames
    s["duration"] = nxt - s["from"]

scene_of_word = {}
for s in scenes:
    last = s["firstWord"]
for k, s in enumerate(scenes):
    hi = scenes[k + 1]["firstWord"] if k + 1 < len(scenes) else len(words)
    for i in range(s["firstWord"], hi):
        scene_of_word[i] = s["id"]

out_words = []
for i, w in enumerate(words):
    out_words.append({
        "i": i,
        "text": w["text"],
        "start": t(w["start"]),
        "end": t(w["end"]),
        "color": EMPH.get(i, "white"),
        "scene": scene_of_word[i],
    })


# páginas de subtítulos: máx. 3 palabras / 16 caracteres, corte en puntuación
def ends_phrase(txt):
    return bool(re.search(r"[,.…:?!]$", txt))


pages = []
cur = []
for w in out_words:
    if w["scene"] in NO_CAPTIONS:
        continue
    if cur and (cur[-1]["scene"] != w["scene"]):
        pages.append(cur)
        cur = []
    cand = cur + [w]
    chars = sum(len(x["text"]) for x in cand) + len(cand) - 1
    if cur and (len(cand) > 3 or chars > 16):
        pages.append(cur)
        cur = [w]
    else:
        cur = cand
    if ends_phrase(w["text"]):
        pages.append(cur)
        cur = []
if cur:
    pages.append(cur)

scene_end = {s["id"]: (s["from"] + s["duration"]) / FPS for s in scenes}
cap_pages = []
for k, p in enumerate(pages):
    start = 0.0 if k == 0 else p[0]["start"] - 0.05
    nxt = pages[k + 1][0]["start"] - 0.05 if k + 1 < len(pages) else p[-1]["end"] + 0.4
    end = min(nxt, p[-1]["end"] + 0.6, scene_end[p[0]["scene"]] - 0.5 / FPS)
    cap_pages.append({"start": round(start, 4), "end": round(end, 4), "words": [x["i"] for x in p]})

markers = {k: {"word": v, "t": t(words[v]["start"]), "frame": int(round(t(words[v]["start"]) * FPS))}
           for k, v in MARKERS.items()}

data = {
    "_comment": "Generado por scripts/build_timeline.py — no editar a mano.",
    "fps": FPS,
    "voiceSpeed": VOICE_SPEED,
    "voiceOffset": VOICE_OFFSET,
    "totalFrames": total_frames,
    "scenes": scenes,
    "markers": markers,
    "words": out_words,
    "captionPages": cap_pages,
}
os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
json.dump(data, open(os.path.join(ROOT, "src", "data", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print(f"total {total_s:.2f} s = {total_frames} fotogramas")
for s in scenes:
    print(f"  {s['id']:<12} desde {s['from']:>5}  dur {s['duration']:>4}  ({s['from']/FPS:5.2f} s)")
print(f"  {len(cap_pages)} páginas de subtítulos")

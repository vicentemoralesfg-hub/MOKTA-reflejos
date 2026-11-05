#!/usr/bin/env python3
"""Alinea el guion (texto exacto) con los tiempos por palabra de la locución procesada -> src/data/vo.json"""
import json, os, re, subprocess, unicodedata, difflib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = {
 "s01": "¿Por qué este auto chocado, que parece basura, vale más oro que uno que está impecable? La respuesta te va a volar la cabeza.",
 "s02": "Comprar autos chocados en remate para repararlos y revenderlos puede dejarte millones… o hundirte. Y el secreto no es cuánto daño se ve. Es DÓNDE está.",
 "s03": "Zona verde: puertas, parachoques, tapabarros y focos. Son piezas apernadas. Se cambian o se desabollan, hay repuestos usados en todos lados y la estructura queda intacta. Esto es plata.",
 "s04": "Zona amarilla: el choque frontal. Si el golpe murió en el parachoques, el radiador y los soportes, todavía hay negocio. Pero si llegó al larguero, la viga que sostiene el motor, necesitas bancada y medición. Y ahí el presupuesto explota.",
 "s05": "Zona roja. Levanta la alfombra del maletero: si el piso está arrugado, el golpe entró a la estructura. Y si un pilar está doblado, la jaula que te protege en un volcamiento ya no es la misma. Eso no se arregla bonito.",
 "s06": "Airbags desplegados: no es solo la bolsa. Son módulo, sensores, pretensores, tablero… y en un auto común, fácilmente entre 2 y 4 millones.",
 "s07": "Y el más traicionero: el inundado. Por fuera, impecable. Por dentro, agua en el cableado y en los módulos, y corrosión que aparece meses después. ¿Barro bajo la alfombra, olor a humedad, óxido en los rieles del asiento? Huye.",
 "s08": "Hagamos números. Dos autos, mismo precio: 4,5 millones. El feo: puertas y parachoques. Reparación: 1,9 millones. Lo vendes en 8,3 millones… y ganas más de 1,5 millones. El impecable: airbags y larguero. Reparación: 6 millones. Con daño estructural, nadie te paga más de 6,8 millones. Pierdes más de 4 millones.",
 "s09": "Antes de ofertar: pásale un escáner, cotiza repuestos reales, mide la carrocería y calcula la reventa con el descuento por choque.",
 "s10": "La regla es simple: si se aperna, es oportunidad. Si se suelda, se infla o se moja… es trampa. Guárdalo para tu próximo remate.",
}
# Los números del guion en pantalla se escriben en cifras; la voz los dice en palabras.
SPOKEN_NUM = {"4,5": "cuatro millones y medio", "1,9": "un millón novecientos mil", "8,3": "ocho millones trescientos mil",
              "1,5": "un millón y medio", "6": "seis millones", "6,8": "seis millones ochocientos mil", "4": "cuatro millones",
              "2": "dos", }

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)

wv = json.load(open(os.path.join(ROOT, "assets", "words_vo.json")))
out = {}
for sc, text in SCRIPT.items():
    W = wv[f"{sc}.wav"]
    # expandir palabras de whisper a letras con tiempo (interpolado dentro de cada palabra)
    letters, lt = [], []
    for w in W:
        n = norm(w["w"])
        for i, c in enumerate(n):
            letters.append(c)
            lt.append(w["s"] + (w["e"] - w["s"]) * (i / max(1, len(n))))
    wl = "".join(letters)
    toks = text.split()
    # letras habladas del guion (con números convertidos), recordando qué token las produce
    sl, owner = [], []
    for ti, t in enumerate(toks):
        core = t.strip("¿?¡!.,:;…")
        if sc == "s08" and core in SPOKEN_NUM and toks[ti + 1].startswith("millones"):
            spoken = SPOKEN_NUM[core].replace(" millones", "").replace(" millón", " millon") if False else SPOKEN_NUM[core]
            # el token siguiente "millones" ya está contenido en la versión hablada
            spoken = re.sub(r"\s*millones$", "", spoken) if spoken.endswith("millones") else spoken
            n = norm(spoken)
        elif core in ("2", "4") and sc == "s06":
            n = core
        else:
            n = norm(core)
        for c in n:
            sl.append(c); owner.append(ti)
    sm = difflib.SequenceMatcher(None, "".join(sl), wl, autojunk=False)
    t_of = [None] * len(sl)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            t_of[a + k] = lt[b + k]
    words = []
    for ti, t in enumerate(toks):
        idx = [i for i, o in enumerate(owner) if o == ti]
        ts = [t_of[i] for i in idx if t_of[i] is not None]
        words.append({"t": t, "s": min(ts) if ts else None, "e": max(ts) if ts else None})
    # interpolar faltantes
    for i, w in enumerate(words):
        if w["s"] is None:
            prev = next((words[j]["e"] for j in range(i - 1, -1, -1) if words[j]["e"] is not None), 0)
            nxt = next((words[j]["s"] for j in range(i + 1, len(words)) if words[j]["s"] is not None), prev + 0.3)
            w["s"], w["e"] = prev, nxt
    for i, w in enumerate(words):
        w["e"] = max(w["e"] + 0.06, w["s"] + 0.08)
        w["s"], w["e"] = round(w["s"], 3), round(w["e"], 3)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                os.path.join(ROOT, "public", "audio", "vo", f"{sc}.wav")], capture_output=True, text=True).stdout)
    out[sc] = {"duration": round(dur, 3), "words": words}
    miss = sum(1 for x in t_of if x is None)
    print(sc, f"{dur:.2f}s", f"letras sin alinear: {miss}/{len(sl)}")
json.dump(out, open(os.path.join(ROOT, "src", "data", "vo.json"), "w"), ensure_ascii=False, indent=1)

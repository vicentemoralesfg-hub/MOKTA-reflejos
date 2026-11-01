#!/usr/bin/env python3
"""
Guion v6 — fuente única del texto, la entonación de la voz y el montaje.

Estructura (pensada para quien lo ve por primera vez, sin contexto):
  1. Gancho:      te acaban de medir a 140… y no ves la patrulla.          (problema concreto)
  2. Pregunta:    ¿desde qué distancia? Piensa un número.                  (participación)
  3. Escalada:    ¿300 m? ¡Más lejos! ¿1 km? ¡Todavía más! ¡Casi 3 km!                     (sorpresa)
  4. Prueba:      ni siquiera es un punto · más de un minuto en llegar     (se entiende la magnitud)
  5. Cómo:        pistola láser · rayo del ancho de una puerta · ½ s       (explicación corta)
  6. Conclusión:  cuando la ves… ya te midieron.                           (frase para recordar)
  7. Giro:        la foto de tu patente necesita 200 m                     (dato nuevo)
  8. Debate:      ¿te pillaron a los 3 km o a los 200 m?                   (comentarios + loop)

Uso: python3 scripts/guion.py   → reescribe en cues.json los planos, golpes, realces y bloques del gancho.
     scripts/voz_edge.py importa LINES para generar la voz (una toma por línea, con su entonación).
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Tramos del guion: (texto, pausa después en s). Los planos, golpes y realces se anclan a (tramo, palabra).
LINES = [
    ("Te acaban de medir a ciento cuarenta…", 0.18),
    ("y todavía no ves la patrulla.", 0.4),
    ("¿Desde qué distancia te puede medir?", 0.25),
    ("Piensa un número.", 0.35),
    ("¿Trescientos metros?", 0.3),
    ("¡Más lejos!", 0.25),
    ("¿Un kilómetro?", 0.3),
    ("¡Todavía más!", 0.25),
    ("¡Hasta casi tres kilómetros!", 0.5),
    ("A esa distancia, la patrulla ni siquiera es un punto.", 0.3),
    ("A ciento cuarenta, tardarías más de un minuto en llegar.", 0.35),
    ("¿Cómo lo hace?", 0.2),
    ("Con una pistola láser.", 0.3),
    ("Un rayo del ancho de una puerta… que apunta a un solo auto: el tuyo.", 0.3),
    ("Y le basta menos de medio segundo.", 0.4),
    ("Por eso, cuando la ves…", 0.35),
    ("ya te midieron.", 0.55),
    ("Pero ojo: la pistola también saca una foto.", 0.35),
    ("Y para que se lea tu patente, necesita tenerte a unos doscientos metros.", 0.4),
    ("Entonces… ¿cuándo te pillaron?", 0.25),
    ("¿A los tres kilómetros… o a los doscientos metros?", 0.0),
]
# Tomas de voz: cada una agrupa tramos seguidos y se genera de una vez, para que la entonación fluya
# (una respuesta suelta sale plana; después de su pregunta sale como respuesta).
# (primer tramo, último tramo, velocidad, tono, volumen). Velocidad natural: solo baja en los momentos
# de peso; el tono sube en las preguntas y la escalada, y baja en las revelaciones.
TAKES = [
    (0, 1, "-3%", "-6Hz", "+0%"),      # gancho: tenso, grave
    (2, 3, "+0%", "+12Hz", "+0%"),     # pregunta: curiosidad
    (4, 7, "+0%", "+15Hz", "+15%"),    # juego: ¿300 m? ¡Más lejos! ¿1 km? ¡Todavía más!
    (8, 8, "-10%", "+10Hz", "+25%"),   # el reveal: más lento y fuerte
    (9, 10, "-5%", "-6Hz", "+0%"),     # la magnitud: asombro, más bajo
    (11, 12, "+0%", "+6Hz", "+5%"),    # ¿cómo? pistola láser
    (13, 14, "-3%", "-4Hz", "+0%"),    # explicación
    (15, 16, "-12%", "-12Hz", "+10%"), # la frase para recordar: lenta y grave
    (17, 18, "+0%", "+8Hz", "+0%"),    # el giro: complicidad
    (19, 20, "-5%", "+10Hz", "+0%"),   # la pregunta final
]
assert [t[0] for t in TAKES] == [0] + [t[1] + 1 for t in TAKES[:-1]] and TAKES[-1][1] == len(LINES) - 1
TOKENS = [w for line in LINES for w in line[0].split()]
_START = [sum(len(l[0].split()) for l in LINES[:i]) for i in range(len(LINES))]


def at(line, k=0):
    """Índice global de la palabra k de la línea."""
    assert k < len(LINES[line][0].split()), (line, k)
    return _START[line] + k


def segments():
    return [(at(i), at(i) + len(l[0].split()) - 1, l[1]) for i, l in enumerate(LINES)]


# Planos: (id, línea, palabra). Cada plano empieza 0,12 s antes de esa palabra.
SHOTS = [
    ("hook1", 0, 0),           # tu auto a 140: el punto láser cae encima → MEDIDO · 140 km/h
    ("hook2", 1, 0),           # subjetiva: carretera vacía, «¿LA VES?»
    ("desdeDistancia", 2, 0),  # el rayo sale de tu auto y se pierde en la noche
    ("piensaNumero", 3, 0),    # ¿300 m? ¿1 km?
    ("trescientos", 4, 0),
    ("mas1", 5, 0),
    ("kilometro", 6, 0),
    ("mas2", 7, 0),
    ("tresKm", 8, 2),          # «tres»: cámara lenta, destello rojo, 2,9 km
    ("aEsaDistancia", 9, 0),   # vuelve la subjetiva del gancho: «¿LA VES?»
    ("niUnPunto", 9, 3),       # zoom al horizonte → AQUÍ · 2,9 km
    ("cientoCuarenta", 10, 0),
    ("unMinuto", 10, 4),       # contador 0:00 → 1:15
    ("comoLoHace", 11, 0),     # aérea: MEDIDO · 140 km/h ¿cómo?
    ("laserPistola", 12, 0),   # el agente apunta: PISTOLA LÁSER
    ("laserPuerta", 13, 0),    # ≈ 1 m
    ("laserTuyo", 13, 7),      # entre todos los autos, TÚ
    ("medioSegundo", 14, 0),   # 0,40 s → 140 km/h
    ("cuandoLaVes", 15, 0),    # subjetiva: ahora sí ves la patrulla
    ("yaTeMidieron", 16, 0),   # destello + MEDIDO hace 1 min
    ("detalle", 17, 0),        # el agente de cerca
    ("detalleFoto", 17, 2),    # más cerca: flash de cámara, CÁMARA
    ("patenteFoto2", 18, 0),   # la foto de tu auto a 2,9 km: ILEGIBLE (en "patente")
    ("necesita", 18, 7),       # 2.900 m → 200 m
    ("doscientos", 18, 11),    # MIDE 2,9 km / FOTO 200 m
    ("entonces", 19, 0),       # aérea con las dos marcas
    ("teMide", 20, 0),         # el rayo cruza 2,9 km
    ("pillaron", 20, 4),       # aérea final con MIDE y FOTO (loop)
]
HITS = [
    (0, 0, "hookLock", None),
    (5, 0, "hit", 0.7),
    (7, 0, "hit", 0.85),
    (8, 2, "big", None),
    (9, 9, "hit", 0.45),
    (12, 3, "laser", None),
    (14, 6, "lock", None),
    (16, 0, "big", None),
    (17, 7, "hit", 0.5),
    (18, 11, "hit", 0.9),
    (19, 3, "hit", 0.5),
]
HIGHLIGHTS = {
    (0, 3): "red", (0, 5): "red", (0, 6): "red",
    (1, 2): "key", (1, 3): "key", (1, 5): "key",
    (2, 2): "key", (3, 2): "key", (4, 0): "key", (4, 1): "key", (5, 0): "key", (5, 1): "key", (6, 1): "key", (7, 0): "key", (7, 1): "key",
    (8, 2): "red", (8, 3): "red",
    (9, 9): "key", (10, 7): "key",
    (12, 2): "red", (12, 3): "red", (13, 6): "key", (13, 14): "red", (14, 5): "key", (14, 6): "key",
    (15, 4): "key", (16, 0): "red", (16, 1): "red", (16, 2): "red",
    (17, 1): "key", (17, 7): "key", (18, 6): "key", (18, 11): "key", (18, 12): "key",
    (19, 3): "key", (20, 2): "red", (20, 3): "red", (20, 7): "key", (20, 8): "key",
}
# Subtítulos: los números en cifras (se leen al instante en el celular); "" oculta la palabra
CAPTION_TEXT = {(0, 5): "140…", (0, 6): "", (4, 0): "¿300", (8, 2): "3", (10, 1): "140,", (10, 2): "",
                (18, 11): "200", (20, 2): "3", (20, 7): "200"}
# El gancho se lee completo desde el primer cuadro de cada plano
CAPTION_BLOCKS = [[at(0), at(0, 6)], [at(1), at(1, 5)]]


def main():
    path = os.path.join(ROOT, "src/data/cues.json")
    cues = json.load(open(path))
    cues["shots"] = [dict(id=i, word=at(l, k)) for i, l, k in SHOTS]
    cues["hits"] = [dict(word=at(l, k), kind=kind, **({"gain": g} if g is not None else {})) for l, k, kind, g in HITS]
    cues["highlights"] = {str(at(l, k)): tone for (l, k), tone in sorted(HIGHLIGHTS.items())}
    cues["captionBlocks"] = CAPTION_BLOCKS
    cues["captionText"] = {str(at(l, k)): txt for (l, k), txt in sorted(CAPTION_TEXT.items())}
    json.dump(cues, open(path, "w"), ensure_ascii=False, indent=2)
    print(f"{len(TOKENS)} palabras · {len(SHOTS)} planos · {len(HITS)} golpes")
    for i, l, k in SHOTS:
        print(f"  {i:15s} {at(l, k):3d} {LINES[l][0].split()[k]}")


if __name__ == "__main__":
    main()

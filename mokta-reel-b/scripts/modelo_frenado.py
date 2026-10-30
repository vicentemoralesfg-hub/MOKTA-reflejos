#!/usr/bin/env python3
"""
MOKTA · Propuesta B — verificación del modelo de frenado.

Modelo (estimación, no medición):
  - La barrera aparece a D metros. Desde ese instante corre el tiempo de reacción t (= momento de la pausa).
  - Durante t el auto sigue a velocidad constante v           → distancia de reacción  dr = v·t
  - Luego frena con desaceleración constante a = 0,8 g          → distancia de frenado   df = v² / (2a)
  - Distancia total de detención                               → dt = dr + df
  - Si dt ≤ D: se detiene, sobran D − dt metros.
  - Si dt > D: llega a la barrera con  v_imp = √(v² − 2a·(D − dr))   (si dr ≥ D: v_imp = v, no alcanzó a frenar)
No incluye: tiempo de respuesta del sistema de frenos (~0,1–0,3 s), pendiente, estado de neumáticos,
transferencia de carga ni la diferencia entre pausar un video y mover el pie al pedal.

Uso:  python3 scripts/modelo_frenado.py            → imprime las tablas
      python3 scripts/modelo_frenado.py --check    → compara con src/physics.ts (valores exportados)
"""
import json
import math
import os
import sys

G = 9.81
A_G = 0.8
A = A_G * G           # 7,848 m/s²
D = 90.0              # m
FPS = 30
SPEEDS = [120, 160, 210]
TIMES = [0.0, 0.3, 0.5, 0.58, 0.75, 1.0, 1.25, 1.5]


def ms(kmh):
    return kmh / 3.6


def outcome(kmh, t, d=D, a=A):
    v = ms(kmh)
    dr = v * t
    df = v * v / (2 * a)
    total = dr + df
    if total <= d:
        return dict(dr=dr, df=df, total=total, stop=True, margin=d - total, vimp=0.0)
    if dr >= d:
        return dict(dr=dr, df=df, total=total, stop=False, margin=0.0, vimp=kmh)
    vimp = math.sqrt(v * v - 2 * a * (d - dr)) * 3.6
    return dict(dr=dr, df=df, total=total, stop=False, margin=0.0, vimp=vimp)


def fmt(x, n=1):
    return f"{x:.{n}f}".replace(".", ",")


def main():
    print(f"Modelo: D = {fmt(D,0)} m · a = {fmt(A_G)} g = {fmt(A,3)} m/s² · {FPS} fps\n")

    print("## Constantes por velocidad\n")
    print("| km/h | m/s | m por fotograma | frenado df | tiempo hasta la barrera sin frenar | ventana (fotogramas) | último instante para detenerse |")
    print("|---|---|---|---|---|---|---|")
    for k in SPEEDS:
        v = ms(k)
        df = v * v / (2 * A)
        ttc = D / v
        tlim = (D - df) / v
        lim = f"{fmt(tlim,3)} s ({fmt(tlim*FPS,1)} fot.)" if tlim > 0 else f"imposible: df > {fmt(D,0)} m (faltan {fmt(df-D)} m con reacción 0)"
        print(f"| {k} | {fmt(v,2)} | {fmt(v/FPS,2)} m | {fmt(df)} m | {fmt(ttc,3)} s | {fmt(ttc*FPS,1)} | {lim} |")

    for k in SPEEDS:
        print(f"\n## {k} km/h\n")
        print("| reacción | dist. reacción | dist. frenado | dist. total | resultado |")
        print("|---|---|---|---|---|")
        for t in TIMES:
            o = outcome(k, t)
            res = f"se detiene, sobran {fmt(o['margin'])} m" if o["stop"] else f"impacto ≈ {fmt(o['vimp'],0)} km/h"
            print(f"| {fmt(t,2)} s | {fmt(o['dr'])} m | {fmt(o['df'])} m | {fmt(o['total'])} m | {res} |")

    print("\n## Sensibilidad (reacción 0,5 s)\n")
    print("| desaceleración | 120 | 160 | 210 |")
    print("|---|---|---|---|")
    for ag in (0.7, 0.8, 0.9, 1.0):
        cells = []
        for k in SPEEDS:
            o = outcome(k, 0.5, a=ag * G)
            cells.append(f"sobran {fmt(o['margin'])} m" if o["stop"] else f"≈ {fmt(o['vimp'],0)} km/h")
        print(f"| {fmt(ag)} g | " + " | ".join(cells) + " |")
    need = ms(160) ** 2 / (2 * D) / G
    print(f"\nDetenerse a 160 km/h en {fmt(D,0)} m con reacción 0 exige ≥ {fmt(need,2)} g.")
    print(f"Relación de distancias de frenado 210/120 = (210/120)² = {fmt((210/120)**2,3)} (independiente de a).")

    if "--check" in sys.argv:
        ref = json.load(open(os.path.join(os.path.dirname(__file__), "..", "out", "physics_check.json")))
        bad = 0
        for row in ref:
            o = outcome(row["kmh"], row["t"])
            exp = 0.0 if o["stop"] else o["vimp"]
            if row["stop"] != o["stop"] or abs(row["vimp"] - exp) > 0.01 or abs(row["margin"] - o["margin"]) > 0.01:
                bad += 1
                print("DIFERENCIA", row, o)
        print(f"\nComprobación TS vs Python: {len(ref)} casos, {bad} diferencias")
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()

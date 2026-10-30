// Exporta casos del modelo TS para que scripts/modelo_frenado.py --check los compare.
import { writeFileSync } from "node:fs";
import { brakeOutcome } from "../src/physics.ts";
const rows: object[] = [];
for (const kmh of [120, 160, 210])
  for (let f = 0; f <= 60; f++) {
    const t = f / 30;
    const o = brakeOutcome(kmh, t, 90, 0.8);
    rows.push({ kmh, t, stop: o.stops, vimp: o.impactKmh, margin: o.marginM });
  }
writeFileSync("out/physics_check.json", JSON.stringify(rows));

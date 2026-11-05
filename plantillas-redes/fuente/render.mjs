// Genera los PNG de las plantillas MOKTA.  Uso:  node fuente/render.mjs   (desde plantillas-redes/)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "..");
const html = pathToFileURL(path.join(aqui, "plantilla.html")).href;

const piezas = [
  ["story", "base"], ["story", "aviso"], ["story", "foto"],
  ["post", "base"], ["post", "aviso"], ["post", "foto"],
];
const nombre = { story: "historia", post: "publicacion" };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });

for (const ejemplo of [false, true]) {
  const carpeta = path.join(raiz, ejemplo ? "ejemplos" : "bases");
  fs.mkdirSync(carpeta, { recursive: true });
  for (const [formato, tipo] of piezas) {
    if (ejemplo && tipo === "base") continue; // la base no lleva texto de ejemplo
    for (const color of ["blanco", "negro"]) {
      await page.goto(`${html}?formato=${formato}&tipo=${tipo}&color=${color}&ejemplo=${ejemplo ? 1 : 0}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every((i) => i.complete));
      const archivo = path.join(carpeta, `${nombre[formato]}-${tipo}-${color}.png`);
      await page.locator(".lienzo").screenshot({ path: archivo, omitBackground: true });
      console.log(path.relative(raiz, archivo));
    }
  }
}
await browser.close();

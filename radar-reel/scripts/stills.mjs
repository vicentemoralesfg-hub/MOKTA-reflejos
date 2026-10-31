// Renderiza fotogramas sueltos del video completo para revisión.
// Uso: node scripts/stills.mjs <composición> <fotograma> [<fotograma> ...]  → out/stills/<comp>_<f>.jpg
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [comp, ...frames] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.join(root, "out/stills");
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.REMOTION_CHROME ?? null;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const chromiumOptions = { gl: "swangle" };
const composition = await selectComposition({ serveUrl, id: comp, inputProps: {}, browserExecutable, chromiumOptions });
for (const f of frames) {
  const output = path.join(outDir, `${comp}_${String(f).padStart(4, "0")}.jpg`);
  await renderStill({ composition, serveUrl, frame: Number(f), output, imageFormat: "jpeg", jpegQuality: 88, browserExecutable, chromiumOptions });
  console.log(output);
}

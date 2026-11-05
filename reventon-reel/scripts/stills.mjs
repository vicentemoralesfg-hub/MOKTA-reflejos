// Renderiza fotogramas sueltos para revisión: node scripts/stills.mjs 0 15 30 ...  (o segundos con sufijo s)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "out", "stills");
fs.mkdirSync(out, { recursive: true });
const frames = process.argv.slice(2).map((a) => (a.endsWith("s") ? Math.round(parseFloat(a) * 30) : parseInt(a, 10)));
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts"), publicDir: path.join(root, "public") });
const chrome = process.env.REMOTION_CHROME;
const comp = await selectComposition({ serveUrl, id: "Reventon", inputProps: { withAudio: false }, browserExecutable: chrome, chromiumOptions: { gl: "swangle" } });
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({
    serveUrl,
    composition: comp,
    frame: f,
    output: path.join(out, `f${String(f).padStart(4, "0")}.jpg`),
    imageFormat: "jpeg",
    jpegQuality: 85,
    inputProps: { withAudio: false },
    browserExecutable: chrome,
    chromiumOptions: { gl: "swangle" },
  });
  console.log(f, (f / 30).toFixed(2) + "s", Date.now() - t0, "ms");
}

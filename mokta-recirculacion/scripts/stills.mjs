// Uso: node scripts/stills.mjs out/stills 0 10 60 ...  (fotogramas globales de MoktaRecirculacion)
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = fs.existsSync("build/index.html") && process.env.REBUNDLE !== "1"
  ? path.resolve("build")
  : await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve("build"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_CHROME ?? null });
const inputProps = { withAudio: false };
const composition = await selectComposition({ serveUrl, id: "MoktaRecirculacion", inputProps, puppeteerInstance: browser });
for (const fr of frames.map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, output: path.join(outDir, `f${String(fr).padStart(4, "0")}.jpg`), frame: fr, imageFormat: "jpeg", jpegQuality: 85, inputProps, puppeteerInstance: browser, scale: 0.5 });
  console.log(`frame ${fr} ${Date.now() - t0} ms`);
}
await browser.close({ silent: true });

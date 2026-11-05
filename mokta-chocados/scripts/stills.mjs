// Renderiza fotogramas de control: node scripts/stills.mjs out/stills 0.4 f1 f2 ...
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [outDir, scale, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_CHROME ?? null });
const composition = await selectComposition({ serveUrl, id: "AutosChocados", inputProps: { withAudio: false }, puppeteerInstance: browser });
for (const fr of frames.map(Number)) {
  await renderStill({ composition, serveUrl, frame: fr, output: path.join(outDir, `f${String(fr).padStart(5, "0")}.jpg`), imageFormat: "jpeg", scale: Number(scale), inputProps: { withAudio: false }, puppeteerInstance: browser });
  process.stdout.write(fr + " ");
}
await browser.close({ silent: true });
console.log("\nok");

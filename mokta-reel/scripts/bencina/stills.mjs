#!/usr/bin/env node
/** Exporta fotogramas sueltos de MoktaBencina para revisión visual.
 *  Uso: node scripts/bencina/stills.mjs out/stills 0 120 300 ... */
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.REMOTION_CHROME || null,
  chromiumOptions: { gl: "swangle" },
});
const composition = await selectComposition({ serveUrl, id: "MoktaBencina", puppeteerInstance: browser, inputProps: { withAudio: false } });
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `f${String(f).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, frame: f, output, puppeteerInstance: browser, inputProps: { withAudio: false }, scale: 0.5, overwrite: true });
  console.log("ok", output);
}
await browser.close({ silent: true });

#!/usr/bin/env node
/** Renderiza todas las láminas (Still) cuyo id empiece con <prefijo> a <outDir> como PNG. */
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";

const [prefix, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_CHROME ?? null });
const comps = (await getCompositions(serveUrl, { puppeteerInstance: browser })).filter((c) => c.id.startsWith(prefix));
for (const composition of comps) {
  const output = path.join(outDir, `${composition.id}.png`);
  await renderStill({ composition, serveUrl, frame: 0, output, imageFormat: "png", puppeteerInstance: browser, overwrite: true });
  process.stdout.write(composition.id + " ");
}
await browser.close({ silent: true });
console.log("\nOK", comps.length);

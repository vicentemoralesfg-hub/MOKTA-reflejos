#!/usr/bin/env node
/**
 * QA: renderiza fotogramas sueltos de una composición (un solo bundle y un solo navegador).
 * Uso: node scripts/stills.mjs <compId> <outDir> <f1,f2,...|a-b:step> [--png] [--props '{"withAudio":false}']
 */
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";

const [id, outDir, spec, ...rest] = process.argv.slice(2);
const png = rest.includes("--png");
const pi = rest.indexOf("--props");
const props = pi >= 0 ? JSON.parse(rest[pi + 1]) : { withAudio: false };
const frames = [];
for (const part of spec.split(",")) {
  if (part.includes("-")) {
    const [ab, st] = part.split(":");
    const [a, b] = ab.split("-").map(Number);
    for (let f = a; f <= b; f += Number(st || 1)) frames.push(f);
  } else frames.push(Number(part));
}
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_CHROME ?? null });
const comps = await getCompositions(serveUrl, { puppeteerInstance: browser, inputProps: props });
const composition = comps.find((c) => c.id === id);
if (!composition) throw new Error("No existe " + id);
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.${png ? "png" : "jpeg"}`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: png ? "png" : "jpeg", jpegQuality: 88, puppeteerInstance: browser, inputProps: props, overwrite: true });
  process.stdout.write(`${frame} `);
}
await browser.close({ silent: true });
console.log("\nOK");

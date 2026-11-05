// Renderiza fotogramas de control: node scripts/stills.mjs 0 45 120 ...  (o "auto" = 3 por escena)
import fs from "node:fs";
import path from "node:path";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";

const serveUrl = path.resolve("build");
const out = path.resolve("out/stills");
fs.mkdirSync(out, { recursive: true });
const tl = JSON.parse(fs.readFileSync("src/data/timeline.json", "utf8"));
let frames = process.argv.slice(2).map(Number);
if (process.argv[2] === "auto") {
  frames = tl.scenes.flatMap((s) => [s.from + 6, s.from + Math.floor(s.duration / 2), s.from + s.duration - 3]);
}
const scale = Number(process.env.SCALE ?? 0.5);
const browser = await openBrowser("chrome", { browserExecutable: process.env.REMOTION_CHROME ?? null });
const inputProps = { withAudio: false };
const [comp] = (await getCompositions(serveUrl, { puppeteerInstance: browser, inputProps })).filter((c) => c.id === "MoktaKilometraje");
for (const frame of frames) {
  const file = path.join(out, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition: comp, serveUrl, output: file, frame, inputProps, puppeteerInstance: browser, scale, logLevel: "error" });
  console.log(file);
}
await browser.close({ silent: true });

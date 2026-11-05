// MOKTA · Protocolo de Inspección Pre-Compra — generador
// Uso:  node build.mjs            → dist/*.html + dist/*.pdf
//       node build.mjs --png DIR  → además exporta cada página como PNG (QA)
//
// Sintaxis especial dentro de src/partes/*.html
//   <ck>                         Tabla de chequeo. Una fila por línea:
//   Punto :: Cómo revisar :: Normal :: Alerta :: sev     (sev = y | r | k[STOP])
//   </ck>
//   <qs>                         Banco de preguntas. Una por línea:
//   Pregunta :: Por qué se pregunta :: Respuesta de alerta
//   </qs>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
// require() respeta NODE_PATH / instalaciones globales de Playwright
const require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, "src");
const DIST = path.join(here, "dist");
const FONTS = path.join(here, "..", "mokta-reel", "public", "fonts");
const NAME = "MOKTA_Protocolo_Inspeccion_PreCompra";

const SEV = {
  y: '<span class="pill y">Precaución</span>',
  r: '<span class="pill r">Alerta</span>',
  k: '<span class="pill k">STOP</span>',
};

let nChecks = 0;
let nQuestions = 0;

const renderCk = (body) => {
  const rows = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [punto, como, normal, alerta, sev = "y"] = line.split(" :: ").map((s) => s.trim());
      nChecks++;
      return `<tr><td class="cb"><span></span></td><td class="pt">${punto}</td><td>${como}</td><td class="ok">${normal}</td><td class="al">${SEV[sev] ?? ""} ${alerta}</td></tr>`;
    })
    .join("\n");
  return `<table class="ck"><thead><tr><th class="cb"></th><th>Punto de control</th><th>Cómo revisar</th><th>Normal / esperado</th><th>Señal de alerta</th></tr></thead><tbody>${rows}</tbody></table>`;
};

const renderQs = (body) => {
  const items = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, why, red] = line.split(" :: ").map((s) => s.trim());
      nQuestions++;
      return `<div class="q"><div class="q-n">${nQuestions}</div><div class="q-b"><p class="q-t">${q}</p><p class="q-w"><b>Por qué:</b> ${why}</p><p class="q-r"><b>Respuesta de alerta:</b> ${red}</p></div></div>`;
    })
    .join("\n");
  return `<div class="qs">${items}</div>`;
};

const fontFaces = fs
  .readdirSync(FONTS)
  .filter((f) => f.endsWith(".woff2"))
  .map((f) => {
    const family = f.startsWith("barlow") ? "Barlow Condensed" : "Inter";
    const weight = f.match(/-(\d00)-/)[1];
    const b64 = fs.readFileSync(path.join(FONTS, f)).toString("base64");
    return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
  })
  .join("\n");

const css = fs.readFileSync(path.join(SRC, "estilos.css"), "utf8");
let body = fs
  .readdirSync(path.join(SRC, "partes"))
  .filter((f) => f.endsWith(".html"))
  .sort()
  .map((f) => fs.readFileSync(path.join(SRC, "partes", f), "utf8"))
  .join("\n");

body = body.replace(/<ck>([\s\S]*?)<\/ck>/g, (_, b) => renderCk(b));
body = body.replace(/<qs>([\s\S]*?)<\/qs>/g, (_, b) => renderQs(b));
body = body.replaceAll("{{N_PUNTOS}}", String(nChecks)).replaceAll("{{N_PREGUNTAS}}", String(nQuestions));

const html = `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MOKTA · Protocolo de Inspección Pre-Compra</title>
<style>
${fontFaces}
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.mkdirSync(DIST, { recursive: true });
const htmlPath = path.join(DIST, `${NAME}.html`);
fs.writeFileSync(htmlPath, html);
console.log(`HTML  → ${path.relative(here, htmlPath)}  (${nChecks} puntos de control, ${nQuestions} preguntas)`);

const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + htmlPath, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const pdfPath = path.join(DIST, `${NAME}.pdf`);
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: `<div style="width:100%;font-family:Inter,Arial,sans-serif;font-size:7px;color:#7a8494;padding:0 12mm;display:flex;justify-content:space-between;">
    <span><b style="color:#0b0f17;letter-spacing:.08em">MOKTA</b> · Protocolo de Inspección Pre-Compra · v1.0</span>
    <span>Pág. <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
});
console.log(`PDF   → ${path.relative(here, pdfPath)}`);
await browser.close();

const pngIdx = process.argv.indexOf("--png");
if (pngIdx > -1) {
  const out = process.argv[pngIdx + 1];
  fs.mkdirSync(out, { recursive: true });
  const { execFileSync } = await import("node:child_process");
  execFileSync("pdftoppm", ["-png", "-r", "70", pdfPath, path.join(out, "p")]);
  console.log(`PNG   → ${out}`);
}

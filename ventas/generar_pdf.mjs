// Genera Guion_Venta_Autos_MOKTA.pdf a partir de Guion_Venta_Autos.md
// Uso: node ventas/generar_pdf.mjs
// Si existe ventas/logo-mokta.png (logo oficial), se usa en lugar del logotipo de texto.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const fonts = join(root, "mokta-reel/public/fonts");
const font = (f) => `data:font/woff2;base64,${readFileSync(join(fonts, f)).toString("base64")}`;

const C = { ink: "#05070B", accent: "#7FD3FF", yellow: "#FFC83D", green: "#2BE38A", red: "#FF3B3B" };

const fontFaces = `
@font-face{font-family:Barlow;font-weight:600;src:url(${font("barlow-condensed-latin-600-normal.woff2")})}
@font-face{font-family:Barlow;font-weight:700;src:url(${font("barlow-condensed-latin-700-normal.woff2")})}
@font-face{font-family:Barlow;font-weight:800;src:url(${font("barlow-condensed-latin-800-normal.woff2")})}
@font-face{font-family:Inter;font-weight:400;src:url(${font("inter-latin-400-normal.woff2")})}
@font-face{font-family:Inter;font-weight:600;src:url(${font("inter-latin-600-normal.woff2")})}
@font-face{font-family:Inter;font-weight:700;src:url(${font("inter-latin-700-normal.woff2")})}`;

const officialLogo = join(here, "logo-mokta.png");
const hasOfficial = existsSync(officialLogo);
const officialSrc = hasOfficial ? `data:image/png;base64,${readFileSync(officialLogo).toString("base64")}` : "";

// Logotipo de texto (estilo del cierre de los reels: Barlow Condensed, espaciado amplio)
const wordmark = (color, size) => `
<div class="wm" style="--c:${color};--s:${size}px">
  <span class="stripe"></span><span class="stripe s2"></span><span class="txt">MOKTA</span>
</div>`;
const wordmarkCss = `
.wm{display:inline-flex;align-items:center;gap:calc(var(--s)*.12);line-height:1}
.wm .stripe{width:calc(var(--s)*.16);height:calc(var(--s)*.78);background:${C.accent};transform:skewX(-18deg)}
.wm .stripe.s2{width:calc(var(--s)*.08);opacity:.55;margin-right:calc(var(--s)*.14)}
.wm .txt{font-family:Barlow;font-weight:800;font-size:var(--s);letter-spacing:.16em;color:var(--c);margin-right:-.16em}`;

const logo = (color, size) =>
  hasOfficial ? `<img src="${officialSrc}" style="height:${size * 1.1}px">` : wordmark(color, size);

// 1) Markdown -> HTML (gfm: mismos anclajes que en GitHub)
const md = readFileSync(join(here, "Guion_Venta_Autos.md"), "utf8")
  .replace(/^# .*\n/, "") // el título va en la portada
  .replace(/^> \*\*Regla de oro:\*\*[\s\S]*?\n\n/m, "");
const body = execFileSync("pandoc", ["-f", "gfm", "-t", "html5"], { input: md }).toString();

const browser = await chromium.launch();
const page = await browser.newPage();

// 2) Logo en PNG para encabezado (las plantillas de encabezado no cargan fuentes)
await page.setContent(`<style>${fontFaces}${wordmarkCss}body{margin:0;background:transparent}</style>
  <div id="l" style="display:inline-block;padding:4px">${logo(C.ink, 44)}</div>`);
await page.evaluate(() => document.fonts.ready);
const headerLogo = (await page.locator("#l").screenshot({ omitBackground: true })).toString("base64");

// 3) Documento
const head = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${fontFaces}${wordmarkCss}
@page{size:A4;margin:22mm 16mm 18mm}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,sans-serif;font-size:9.6pt;line-height:1.5;color:#1b1f27}
.cover{height:296.8mm;width:210mm;background:${C.ink};color:#F4F6F8;position:relative;padding:28mm 22mm;page-break-after:always;overflow:hidden}
.cover .bars{position:absolute;right:-48mm;top:0;bottom:0;width:80mm;display:flex;gap:9mm;transform:skewX(-18deg);opacity:.9}
.cover .bars i{display:block;height:100%}
.cover .kicker{font-family:Barlow;font-weight:700;letter-spacing:.3em;color:${C.accent};font-size:12pt;margin-top:58mm}
.cover h1{font-family:Barlow;font-weight:800;font-size:58pt;line-height:.95;margin:6mm 0 8mm;text-transform:uppercase;max-width:125mm}
.cover p.sub{font-size:12pt;color:rgba(244,246,248,.72);max-width:115mm;margin:0}
.cover .rule{position:absolute;left:22mm;right:22mm;bottom:40mm;border-top:1px solid rgba(244,246,248,.18);padding-top:6mm;font-size:10pt;color:rgba(244,246,248,.8);max-width:115mm}
.cover .rule b{color:${C.yellow}}
.cover .foot{position:absolute;left:22mm;bottom:22mm;font-size:8.5pt;color:rgba(244,246,248,.45);letter-spacing:.08em}
h2{font-family:Barlow;font-weight:800;font-size:22pt;text-transform:uppercase;color:${C.ink};margin:9mm 0 4mm;padding-bottom:2mm;border-bottom:3px solid ${C.accent};break-after:avoid}
h2:first-of-type{margin-top:0}
h2[id^="4-"],h2[id^="8-"],h2[id^="11-"]{break-before:page}
h2 + p,h3 + p,p:has(+ h3){break-after:avoid}
p:has(+ blockquote),p:has(+ table),p:has(+ ul),p:has(+ ol){break-after:avoid}
h3{font-family:Barlow;font-weight:700;font-size:14pt;color:${C.ink};margin:6mm 0 2mm;break-after:avoid}
p{margin:0 0 2.6mm}
a{color:#0b6aa0;text-decoration:none}
ul,ol{margin:0 0 3mm;padding-left:6mm}
li{margin:0 0 1.2mm}
ul:has(input){list-style:none;padding-left:1mm}
input[type=checkbox]{appearance:none;width:3.2mm;height:3.2mm;border:1.4px solid #5b6575;border-radius:.6mm;margin:0 2mm -.5mm 0}
blockquote{margin:2mm 0 4mm;padding:3mm 4mm;background:#eef7fd;border-left:4px solid ${C.accent};border-radius:0 2mm 2mm 0;break-inside:avoid}
blockquote p:last-child{margin:0}
table{width:100%;border-collapse:collapse;margin:2mm 0 5mm;font-size:8.8pt}
th{background:${C.ink};color:#fff;font-family:Barlow;font-weight:700;font-size:10.5pt;letter-spacing:.04em;text-align:left;padding:2mm 2.5mm}
td{padding:2mm 2.5mm;border-bottom:1px solid #dfe3ea;vertical-align:top}
tr{break-inside:avoid}
tbody tr:nth-child(even) td{background:#f6f8fa}
strong{color:#05070B}
hr{display:none}
</style></head><body>`;
const html = head + `${body}
</body></html>`;

const tmp = join(here, ".cover.tmp.pdf"), tmpBody = join(here, ".body.tmp.pdf");
await page.setContent(head.replace("@page{size:A4;margin:22mm 16mm 18mm}", "@page{size:A4;margin:0}") + `<section class="cover">
  <div class="bars"><i style="width:22mm;background:${C.accent}"></i><i style="width:10mm;background:${C.accent};opacity:.5"></i><i style="width:5mm;background:${C.accent};opacity:.25"></i></div>
  ${logo("#F4F6F8", 46)}
  <div class="kicker">GUÍA DE VENTAS</div>
  <h1>Guion de venta de autos</h1>
  <p class="sub">Para negociaciones presenciales, evaluaciones y conversaciones con clientes: guion por fases, preguntas clave, negociación, cierres y objeciones con respuestas.</p>
  <div class="rule"><b>Regla de oro:</b> el que más pregunta, dirige. Habla 30 % del tiempo y escucha el 70 %. Cada fase termina con una pregunta que avanza hacia el cierre.</div>
  <div class="foot">MOKTA · USO INTERNO</div>
</section></body></html>`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: tmp, format: "A4", printBackground: true, preferCSSPageSize: true });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const out = join(here, "Guion_Venta_Autos_MOKTA.pdf");
await page.pdf({
  path: tmpBody,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: `<div style="width:100%;padding:0 16mm;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;font-size:7.5pt;color:#7a8291">
    <img src="data:image/png;base64,${headerLogo}" style="height:5mm"><span>Guion de venta de autos</span></div>`,
  footerTemplate: `<div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;font-family:sans-serif;font-size:7.5pt;color:#7a8291">
    <span>MOKTA · Uso interno</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
});
await browser.close();
execFileSync("pdfunite", [tmp, tmpBody, out]);
for (const f of [tmp, tmpBody]) unlinkSync(f);
console.log("PDF:", out);

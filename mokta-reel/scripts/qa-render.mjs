#!/usr/bin/env node
/**
 * QA visual autónomo para composiciones Remotion.
 *
 * Para cada composición:
 *   1. Verifica en los metadatos que mida 1080x1920 (configurable).
 *   2. Exporta fotogramas de control (inicio, mitad, cierre) como PNG.
 *   3. Verifica en el PNG real que las dimensiones sean las esperadas.
 *   4. Verifica la presencia de capas de texto:
 *        - Señal DOM: cada <QAText> informa id, texto, caja y opacidad.
 *        - Señal de píxeles: dentro de cada caja de texto debe haber contraste
 *          (desviación estándar de luminancia), es decir, el texto se pintó.
 *        - Capas obligatorias por fotograma según qa.config.json.
 *   5. Solo si todo pasa, renderiza el MP4 final y vuelve a comprobar sus
 *      dimensiones con ffprobe.
 *
 * Uso:
 *   node scripts/qa-render.mjs [--entry src/index.ts] [--config qa.config.json]
 *        [--out out] [--compositions A,B] [--skip-final] [--concurrency 4]
 *        [--log-level error|info|verbose]
 *
 * Chromium: usa REMOTION_CHROME si está definido; si no, el de
 * Remotion (se descarga automáticamente la primera vez).
 *
 * Código de salida: 0 si todas aprueban, 1 si alguna falla, 2 si hay error fatal.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PNG} from 'pngjs';
import {bundle} from '@remotion/bundler';
import {
  getCompositions,
  openBrowser,
  renderMedia,
  renderStill,
} from '@remotion/renderer';

// ---------------------------------------------------------------- argumentos
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const ROOT = process.cwd();
const ENTRY = path.resolve(ROOT, arg('entry', 'src/index.ts'));
const OUT = path.resolve(ROOT, arg('out', 'out'));
const CONFIG_PATH = path.resolve(ROOT, arg('config', 'qa.config.json'));
const ONLY = arg('compositions', null)?.split(',').map((s) => s.trim());
const SKIP_FINAL = flag('skip-final');
const CONCURRENCY = Number(arg('concurrency', '0')) || null;
const LOG_LEVEL = arg('log-level', 'error'); // info | verbose para depurar

const config = {
  expectedWidth: 1080,
  expectedHeight: 1920,
  checkpoints: ['start', 'middle', 'end'],
  minTextLayersPerFrame: 1,
  minOpacity: 0.05,
  minPixelStdDevInTextBox: 8,
  compositions: {},
  ...(fs.existsSync(CONFIG_PATH)
    ? JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    : {}),
};

// Chromium: el de Remotion si está disponible, o uno indicado por entorno.
// Chromium: el mismo que usa remotion.config.ts (REMOTION_CHROME) o el de Remotion.
const BROWSER =
  process.env.REMOTION_CHROME || process.env.REMOTION_BROWSER_EXECUTABLE || null;

// ------------------------------------------------------------------ helpers
const log = (...m) => console.log(...m);
const checkpointFrame = (name, duration) => {
  switch (name) {
    case 'start':
      return 0;
    case 'middle':
      return Math.floor((duration - 1) / 2);
    case 'end':
      return duration - 1;
    default:
      throw new Error(`Checkpoint desconocido: ${name}`);
  }
};

/** Desviación estándar de luminancia en un rectángulo del PNG. */
const lumaStdDev = (png, box) => {
  const x0 = Math.max(0, Math.floor(box.x));
  const y0 = Math.max(0, Math.floor(box.y));
  const x1 = Math.min(png.width, Math.ceil(box.x + box.width));
  const y1 = Math.min(png.height, Math.ceil(box.y + box.height));
  let n = 0, sum = 0, sumSq = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
      sum += l;
      sumSq += l * l;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sumSq / n - mean * mean));
};

const ffprobeDims = (file) => {
  const out = execFileSync(
    'npx',
    ['remotion', 'ffprobe', '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'json', file],
    {cwd: ROOT, encoding: 'utf8'},
  );
  const s = JSON.parse(out.slice(out.indexOf('{'))).streams[0];
  return {width: s.width, height: s.height};
};

// --------------------------------------------------------- QA por composición
async function qaComposition({composition, serveUrl, browser}) {
  const {id, width, height, durationInFrames, fps} = composition;
  const compCfg = config.compositions[id] ?? {};
  const required = compCfg.requiredTextLayers ?? {};
  const W = compCfg.expectedWidth ?? config.expectedWidth;
  const H = compCfg.expectedHeight ?? config.expectedHeight;

  const result = {id, fps, durationInFrames, checks: [], frames: [], approved: false};
  const check = (name, ok, detail) => {
    result.checks.push({name, ok, detail});
    log(`   ${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
    return ok;
  };

  log(`\n▶ ${id} (${width}x${height}, ${durationInFrames} fr @ ${fps} fps)`);

  // 1) Dimensiones declaradas
  if (!check('Dimensiones de la composición', width === W && height === H,
    `${width}x${height} (esperado ${W}x${H})`)) {
    return result; // no tiene sentido renderizar un formato equivocado
  }

  const dir = path.join(OUT, 'qa', id);
  fs.mkdirSync(dir, {recursive: true});

  // 2) Fotogramas de control
  for (const cp of config.checkpoints) {
    const frame = checkpointFrame(cp, durationInFrames);
    const output = path.join(dir, `${cp}-f${String(frame).padStart(5, '0')}.png`);
    const layers = new Map();

    await renderStill({
      composition,
      serveUrl,
      frame,
      output,
      imageFormat: 'png',
      puppeteerInstance: browser,
      overwrite: true,
      logLevel: LOG_LEVEL,
      onBrowserLog: ({text}) => {
        if (!text.startsWith('[qa-text]')) return;
        try {
          const info = JSON.parse(text.slice('[qa-text]'.length));
          if (info.frame === frame) layers.set(info.id, info); // última medición gana
        } catch {/* log ajeno */}
      },
    });

    log(`  · ${cp} (frame ${frame}) → ${path.relative(ROOT, output)}`);
    const png = PNG.sync.read(fs.readFileSync(output));
    const frameRes = {checkpoint: cp, frame, file: path.relative(ROOT, output), textLayers: []};

    // 3) Dimensiones reales del PNG exportado
    check(`[${cp}] Dimensiones del PNG`, png.width === W && png.height === H,
      `${png.width}x${png.height}`);

    // Fotograma no vacío (todo de un color = fallo de render)
    const fullStd = lumaStdDev(png, {x: 0, y: 0, width: png.width, height: png.height});
    check(`[${cp}] Fotograma no vacío`, fullStd > 1, `σ luminancia = ${fullStd.toFixed(1)}`);

    // 4) Capas de texto
    const visible = [];
    for (const l of layers.values()) {
      const inside = l.x >= 0 && l.y >= 0 && l.x + l.width <= W && l.y + l.height <= H;
      const std = lumaStdDev(png, l);
      const isVisible =
        !l.hidden && l.opacity >= config.minOpacity && l.width > 0 && l.height > 0 &&
        l.text.length > 0 && std >= config.minPixelStdDevInTextBox;
      const entry = {...l, insideCanvas: inside, pixelStdDev: +std.toFixed(1), visible: isVisible};
      frameRes.textLayers.push(entry);
      if (isVisible) visible.push(entry);
      if (isVisible && !inside) {
        check(`[${cp}] Capa "${l.id}" dentro del lienzo`, false,
          `caja ${Math.round(l.x)},${Math.round(l.y)} ${Math.round(l.width)}x${Math.round(l.height)}`);
      }
    }

    check(`[${cp}] Capas de texto visibles ≥ ${config.minTextLayersPerFrame}`,
      visible.length >= config.minTextLayersPerFrame,
      visible.map((v) => `${v.id}(op ${v.opacity.toFixed(2)}, σ ${v.pixelStdDev})`).join(', ') || 'ninguna');

    for (const reqId of required[cp] ?? []) {
      const l = layers.get(reqId);
      const ok = Boolean(l && visible.some((v) => v.id === reqId));
      check(`[${cp}] Capa obligatoria "${reqId}"`, ok,
        !l ? 'no encontrada en el DOM'
          : ok ? `"${l.text}"`
            : `presente pero no visible (op ${l.opacity.toFixed(2)})`);
    }

    result.frames.push(frameRes);
  }

  result.approved = result.checks.every((c) => c.ok);
  return result;
}

// --------------------------------------------------------------------- main
async function main() {
  const t0 = Date.now();
  log(`Empaquetando ${path.relative(ROOT, ENTRY)}…`);
  const serveUrl = await bundle({entryPoint: ENTRY, rspack: true}); // igual que remotion.config.ts
  const browser = await openBrowser('chrome', {
    browserExecutable: BROWSER,
    chromiumOptions: {gl: 'swangle'},
    logLevel: LOG_LEVEL,
  });

  const report = {startedAt: new Date().toISOString(), config, results: []};
  try {
    const all = await getCompositions(serveUrl, {puppeteerInstance: browser, logLevel: LOG_LEVEL});
    const targets = ONLY ? all.filter((c) => ONLY.includes(c.id)) : all;
    if (targets.length === 0) throw new Error('No hay composiciones que revisar.');

    for (const composition of targets) {
      const res = await qaComposition({composition, serveUrl, browser});
      report.results.push(res);

      if (!res.approved) {
        log(`  ✘ ${composition.id} RECHAZADA: no se renderiza el video final.`);
        continue;
      }
      if (SKIP_FINAL) {
        log(`  ✔ ${composition.id} aprobada (render final omitido por --skip-final).`);
        continue;
      }

      // 5) Render final + verificación del archivo resultante
      const outputLocation = path.join(OUT, `${composition.id}.mp4`);
      log(`  ✔ ${composition.id} aprobada → renderizando ${path.relative(ROOT, outputLocation)}`);
      let last = -1;
      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation,
        puppeteerInstance: browser,
        concurrency: CONCURRENCY,
        overwrite: true,
        logLevel: LOG_LEVEL,
        onProgress: ({progress}) => {
          const p = Math.floor(progress * 10) * 10;
          if (p !== last) { last = p; process.stdout.write(`    ${p}%\r`); }
        },
      });
      process.stdout.write('\n');
      const dims = ffprobeDims(outputLocation);
      const ok = dims.width === composition.width && dims.height === composition.height;
      res.final = {file: path.relative(ROOT, outputLocation), ...dims, ok};
      res.approved = ok;
      log(`   ${ok ? '✔' : '✘'} MP4 final ${dims.width}x${dims.height}`);
    }
  } finally {
    await browser.close({silent: true});
  }

  report.finishedAt = new Date().toISOString();
  fs.mkdirSync(path.join(OUT, 'qa'), {recursive: true});
  const reportPath = path.join(OUT, 'qa', 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const failed = report.results.filter((r) => !r.approved);
  log(`\n══ Resumen (${((Date.now() - t0) / 1000).toFixed(1)} s) ══`);
  for (const r of report.results) log(`  ${r.approved ? 'APROBADA ' : 'RECHAZADA'}  ${r.id}`);
  log(`Informe: ${path.relative(ROOT, reportPath)}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error('Error fatal en QA:', err);
  process.exit(2);
});

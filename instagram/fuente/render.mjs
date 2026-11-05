// node render.mjs [filtro]  → out/<post>/<nn>.html + .png (2x, luego se reduce a 1080×1350)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.dirname(new URL(import.meta.url).pathname);
const filter = process.argv[2] || "";
// POSTS=posts-lote-02 OUT=out-lote-02 node render.mjs  → segundo lote
const POSTS = process.env.POSTS || "posts";
const OUT = process.env.OUT || "out";
const files = fs.readdirSync(path.join(root, POSTS)).filter((f) => f.endsWith(".mjs") && f.includes(filter)).sort();

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("  console:", m.text()); });
page.on("requestfailed", (r) => console.log("  FALTA:", r.url()));

for (const f of files) {
  const mod = await import(pathToFileURL(path.join(root, POSTS, f)).href + "?t=" + Date.now());
  const posts = Array.isArray(mod.default) ? mod.default : [mod.default];
  for (const post of posts) {
    const dir = path.join(root, OUT, post.id);
    fs.mkdirSync(dir, { recursive: true });
    for (const [i, html] of post.slides.entries()) {
      const n = String(i + 1).padStart(2, "0");
      const hp = path.join(dir, `${n}.html`);
      fs.writeFileSync(hp, html);
      await page.goto(pathToFileURL(hp).href, { waitUntil: "load" });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((im) => im.decode().catch(() => {}))); });
      // detecta desbordes de texto
      const over = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll(".s *")) {
          const r = el.getBoundingClientRect();
          if (el.closest("svg") || el.classList.contains("bleed") || el.closest(".bleed")) continue;
          if (r.width && (r.right > 1081 || r.left < -1 || r.bottom > 1351) && el.children.length === 0 && el.textContent.trim()) out.push(el.textContent.trim().slice(0, 40));
        }
        return out;
      });
      if (over.length) console.log(`  ⚠ desborde ${post.id}/${n}:`, over.slice(0, 4));
      await page.screenshot({ path: path.join(dir, `${n}@2x.png`) });
      console.log("ok", post.id, n);
    }
  }
}
await browser.close();

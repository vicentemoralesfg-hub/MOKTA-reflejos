import fs from "node:fs";
import path from "node:path";
const root = path.dirname(new URL(import.meta.url).pathname);
let data = {};
try { data = JSON.parse(fs.readFileSync(path.join(root, "credits.json"), "utf8")); } catch {}
const extra = JSON.parse(fs.readFileSync(path.join(root, "credits-extra.json"), "utf8"));
export const who = (k) => extra[k] || (data[k] && data[k].user) || "Wikimedia Commons";
export const credit = (...keys) => "Fotos: " + keys.map((k) => who(k)).join(" / ") + " · Wikimedia Commons (CC BY-SA)";

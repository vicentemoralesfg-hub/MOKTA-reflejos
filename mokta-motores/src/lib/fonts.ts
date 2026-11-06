import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const faces: [string, string, string][] = [
  ["Barlow Condensed", "barlow-condensed-latin-500-normal.woff2", "500"],
  ["Barlow Condensed", "barlow-condensed-latin-600-normal.woff2", "600"],
  ["Barlow Condensed", "barlow-condensed-latin-700-normal.woff2", "700"],
  ["Barlow Condensed", "barlow-condensed-latin-800-normal.woff2", "800"],
  ["Inter", "inter-latin-400-normal.woff2", "400"],
  ["Inter", "inter-latin-500-normal.woff2", "500"],
  ["Inter", "inter-latin-600-normal.woff2", "600"],
  ["Inter", "inter-latin-700-normal.woff2", "700"],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight, display: "block" }),
  ),
);

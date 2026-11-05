export const FONT_DISPLAY = "Barlow Condensed";
export const FONT_UI = "Inter";

export const C = {
  green: "#22F59B",
  greenDeep: "#00B86B",
  yellow: "#FFC63D",
  orange: "#FF8A1F",
  red: "#FF2E4D",
  redDeep: "#C4002B",
  cyan: "#3DF2FF",
  blue: "#2F6BFF",
  gold: "#FFD54A",
  white: "#F6F8FB",
  ink: "#060814",
  dim: "rgba(246,248,251,0.7)",
  water: "#1E9BFF",
  rust: "#C2621B",
};

export type Zone = "intro" | "green" | "yellow" | "red" | "water" | "money" | "rule";

/** Fondos vivos por zona: [centro, medio, borde] */
export const ZONE_BG: Record<Zone, [string, string, string]> = {
  intro: ["#5B2CFF", "#22106E", "#0A0624"],
  green: ["#00E08A", "#00664A", "#001F1A"],
  yellow: ["#FFB020", "#9A4A00", "#2A1200"],
  red: ["#FF2E4D", "#7A0020", "#22000A"],
  water: ["#1E9BFF", "#073F8A", "#020F2A"],
  money: ["#7A4DFF", "#2A1478", "#0A0626"],
  rule: ["#3D5BFF", "#18217A", "#060A2A"],
};

export const ZONE_ACCENT: Record<Zone, string> = {
  intro: C.gold,
  green: C.green,
  yellow: C.yellow,
  red: C.red,
  water: C.cyan,
  money: C.gold,
  rule: C.gold,
};

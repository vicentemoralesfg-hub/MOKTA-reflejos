export const FONT_DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif";
export const FONT_UI = "Inter, Arial, sans-serif";

export const C = {
  white: "#F4F7FB",
  dim: "rgba(220,232,250,0.66)",
  key: "#FFD23F",
  red: "#FF3B4E",
  blue: "#4FB3FF",
  pillBg: "rgba(7,16,34,0.72)",
  pillBorder: "rgba(190,215,255,0.28)",
};

export type Tone = "neutral" | "red" | "blue" | "key";
export const toneColor = (t: Tone) => (t === "red" ? C.red : t === "blue" ? C.blue : t === "key" ? C.key : C.white);

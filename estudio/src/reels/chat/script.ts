/**
 * Reel 01 · "El chat" — fuente única de tiempos (fotogramas a 30 fps).
 * La lee también scripts/audio_chat.py para que el sonido calce al fotograma.
 */
import t from "./timeline.json";

export type Msg = { at: number; from: "them" | "me"; text: string; typingFrom?: number };

export const T = t;
export const MSGS: Msg[] = t.msgs as Msg[];
export const SPEED_KMH = t.speedKmh;
export const CHAT_SECONDS = t.reveal / 30;
export const METERS = (SPEED_KMH / 3.6) * CHAT_SECONDS; // 194,4 m
export const FIELD_M = 105; // cancha FIFA recomendada: 105 × 68 m

import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

/** Inicio absoluto de la escena actual (las escenas se montan en <Sequence>). */
export const SceneStart = createContext(0);

/** Fotograma absoluto del reel, aunque estemos dentro de una <Sequence>. */
export const useAbsFrame = () => useCurrentFrame() + useContext(SceneStart);

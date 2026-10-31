import React from "react";
import { S01Hook } from "./S01Hook";
import { S02Para } from "./S02Para";
import { S03Teaser } from "./S03Teaser";
import { S04Carburador } from "./S04Carburador";
import { S05Inyeccion } from "./S05Inyeccion";
import { S06Bencina } from "./S06Bencina";
import { S07Lento } from "./S07Lento";
import { S08Horas } from "./S08Horas";
import { S09Correcto } from "./S09Correcto";
import { S10Suave } from "./S10Suave";
import { S11Escarcha } from "./S11Escarcha";
import { S12Cta } from "./S12Cta";

/** id de escena (timeline.json) → componente. */
export const SCENES: Record<string, React.FC> = {
  hook: S01Hook,
  para: S02Para,
  teaser: S03Teaser,
  carburador: S04Carburador,
  inyeccion: S05Inyeccion,
  bencina: S06Bencina,
  lento: S07Lento,
  horas: S08Horas,
  correcto: S09Correcto,
  suave: S10Suave,
  escarcha: S11Escarcha,
  cta: S12Cta,
};

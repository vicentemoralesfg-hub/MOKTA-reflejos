import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(1);
// Chrome headless local (en una máquina normal Remotion descarga el suyo: deja la variable sin definir)
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

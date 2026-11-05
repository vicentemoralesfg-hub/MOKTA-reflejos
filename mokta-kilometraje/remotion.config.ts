import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setOverwriteOutput(true);
// Chrome headless local opcional (servidores sin descarga de Chrome): REMOTION_CHROME=/ruta/al/headless_shell
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

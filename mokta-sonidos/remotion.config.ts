import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// Chrome headless local opcional (servidor sin descarga): REMOTION_CHROME=/ruta/al/chrome
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

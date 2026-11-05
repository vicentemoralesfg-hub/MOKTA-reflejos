import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(1);
// Chrome headless local (opcional): REMOTION_CHROME=/ruta/a/chrome
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

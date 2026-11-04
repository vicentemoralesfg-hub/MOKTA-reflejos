import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(1);
// Chrome headless local opcional (en una máquina normal Remotion descarga el suyo)
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

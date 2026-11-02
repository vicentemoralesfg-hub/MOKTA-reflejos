import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// Chrome headless local opcional (en un equipo normal Remotion descarga el suyo).
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

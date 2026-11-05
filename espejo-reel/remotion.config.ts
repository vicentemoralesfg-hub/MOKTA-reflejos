import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setOverwriteOutput(true);
// Chrome headless local si existe (contenedor sin descarga de Remotion)
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

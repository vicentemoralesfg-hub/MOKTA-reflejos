import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(1);
// WebGL por software (sin GPU en el contenedor de render)
Config.setChromiumOpenGlRenderer("swangle");
// Chrome headless local (comentar en una máquina con Remotion estándar)
Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? null);

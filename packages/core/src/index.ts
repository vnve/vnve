import log from "loglevel";

log.setLevel(import.meta.env.PROD ? "ERROR" : "DEBUG");

// creator
export * from "./Creator";
export * from "./Scene";
export * from "./Assets";
// editor
export * from "./Editor";
// Utils
export { Converter, isEnvSupported } from "./Utils";

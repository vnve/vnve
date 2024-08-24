import log from "loglevel";

log.setLevel(import.meta.env.PROD ? "ERROR" : "DEBUG");

export { log };

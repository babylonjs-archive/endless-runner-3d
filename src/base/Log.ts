import { options } from "../options.js";

export class Log {
    debug(data: string) {
        if (options.debugMode) {
            console.log("DEBUG LOG: " + data);
        }
    }

    debugWarning(data: string) {
        if (options.debugMode) {
            console.warn("DEBUG LOG: " + data);
        }
    }

    debugError(data: string) {
        if (options.debugMode) {
            console.error("DEBUG LOG: " + data);
        }
    }
}

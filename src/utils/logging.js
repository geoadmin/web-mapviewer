import { ENVIRONMENT } from '../config'

/**
 * A log level reference that can be passed as first parameter to the log function. The levels
 * correspond to the native console methods and their log level.
 *
 * @enum {String}
 * @readonly
 */
export const LogLevel = {
    ERROR: 'error',
    INFO: 'info',
    DEBUG: 'debug',
}

/**
 * Logs the provided parameters to the console. To set a different log level pass the desired
 * LogLevel as first parameter.
 *
 * In production builds only calls with LogLevel.ERROR will be logged!
 *
 * @param {LogLevel} level
 * @param {...any} message
 */
export default function log(level, ...message) {
    // In production we only log errors.
    if (ENVIRONMENT === 'production' && level !== LogLevel.ERROR) {
        return
    }

    /* eslint-disable no-console */
    switch (level) {
        case LogLevel.ERROR:
            console.error(...message)
            break
        case LogLevel.INFO:
            console.info(...message)
            break
        case LogLevel.DEBUG:
            console.debug(...message)
            break
        default:
            // We assume that the first parameter wasn't the level but part of the message.
            console.log(level, ...message)
    }
    /* eslint-enable  no-console */
}

/** Shorthand for log('error', ...message) */
log.error = (...message) => log(LogLevel.ERROR, ...message)
/** Shorthand for log('info', ...message) */
log.info = (...message) => log(LogLevel.INFO, ...message)
/** Shorthand for log('debug', ...message) */
log.debug = (...message) => log(LogLevel.DEBUG, ...message)

import { ENVIRONMENT } from '@/config/staging.config'

/**
 * A log level reference that can be passed as first parameter to the log function. The levels
 * correspond to the native console methods and their log level.
 *
 * @enum {String}
 * @readonly
 */
export const LogLevel = {
    ERROR: 'error',
    WARNING: 'warn',
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
const log = (level, ...message) => {
    // In production we don't log debug level and info level
    if (ENVIRONMENT === 'production' && ![LogLevel.ERROR, LogLevel.WARNING].includes(level)) {
        return
    }

    /* eslint-disable no-console */
    switch (level) {
        case LogLevel.ERROR:
            console.error(...message)
            break
        case LogLevel.WARNING:
            console.warn(...message)
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
/** Shorthand for log('warn', ...message) */
log.warn = (...message) => log(LogLevel.WARNING, ...message)
/** Shorthand for log('info', ...message) */
log.info = (...message) => log(LogLevel.INFO, ...message)
/** Shorthand for log('debug', ...message) */
log.debug = (...message) => log(LogLevel.DEBUG, ...message)

export default log

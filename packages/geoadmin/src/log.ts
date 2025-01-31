/** @module geoadmin/log */

/**
 * A log level reference that can be passed as first parameter to the log function. The levels
 * correspond to the native console methods and their log level.
 */
export enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

/**
 * Logs the provided parameters to the console. To set a different log level pass the desired
 * LogLevel as first parameter.
 *
 * By default, only calls with LogLevel.Error and LogLevel.Warn will be logged. If you want more
 * logging, set the variable `log.wantedLevels` to your desired list of LogLevel
 */
const log = (level: LogLevel, ...message: any[]) => {
    if (log.wantedLevels.includes(level)) {
        return
    }

    /* eslint-disable no-console */
    switch (level) {
        case LogLevel.Error:
            console.error(...message)
            break
        case LogLevel.Warn:
            console.warn(...message)
            break
        case LogLevel.Info:
            console.info(...message)
            break
        case LogLevel.Debug:
            console.debug(...message)
            break
        default:
            // We assume that the first parameter wasn't the level but part of the message.
            console.log(level, ...message)
    }
    /* eslint-enable  no-console */
}

log.wantedLevels = [LogLevel.Error, LogLevel.Warn]

/** Shorthand for log('error', ...message) */
log.error = (...message: any[]) => log(LogLevel.Error, ...message)
/** Shorthand for log('warn', ...message) */
log.warn = (...message: any[]) => log(LogLevel.Warn, ...message)
/** Shorthand for log('info', ...message) */
log.info = (...message: any[]) => log(LogLevel.Info, ...message)
/** Shorthand for log('debug', ...message) */
log.debug = (...message: any[]) => log(LogLevel.Debug, ...message)

export default log

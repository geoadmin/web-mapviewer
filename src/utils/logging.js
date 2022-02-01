import { DEBUG } from '../config'

/**
 * A logging level reference can be passed as first parameter to the log function. The levels
 * correspond to the nativr console methods.
 */
export const LOGLEVEL = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
}

/**
 * Logs something if the env is not PROD, otherwise does nothing.
 *
 * @param {String} [level]
 * @param {Boolean | String | Number | Object} message
 */
const log = function (level, ...message) {
    /* eslint-disable no-console */
    if (DEBUG) {
        switch (level) {
            case LOGLEVEL.ERROR:
                console.error(...message)
                break
            case LOGLEVEL.INFO:
                console.info(...message)
                break
            case LOGLEVEL.DEBUG:
                console.debug(...message)
                break
            default:
                console.log(level, ...message)
        }
    }
    /* eslint-enable  no-console */
}

/* eslint-disable no-console */
/** Same as console.error but doesn't log in production. */
log.error = (...message) => console.error(...message)
/** Same as console.info but doesn't log in production. */
log.info = (...message) => console.info(...message)
/** Same as console.debug but doesn't log in production. */
log.debug = (...message) => console.debug(...message)
/* eslint-enable  no-console */

export default log

import { DEBUG } from '@/config'

/**
 * Logs something if the env is not PROD, otherwise does nothing
 *
 * @param {String} level
 * @param {Boolean | String | Number | Object} message
 */
const log = function (level, ...message) {
    /* eslint-disable no-console */
    if (DEBUG) {
        switch (level) {
            case 'error':
                console.error(...message)
                break
            case 'info':
                console.info(...message)
                break
            case 'debug':
                console.debug(...message)
                break
            default:
                console.log(...message)
        }
    }
    /* eslint-enable  no-console */
}
export default log

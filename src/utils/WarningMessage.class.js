/** Warning message to display to the user */
export default class WarningMessage {
    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg, params = null) {
        this.msg = msg
        this.params = params
    }
}

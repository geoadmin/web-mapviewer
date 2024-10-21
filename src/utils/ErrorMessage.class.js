/** Error message to display to the user */
export default class ErrorMessage {
    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg, params = null) {
        this.msg = msg
        this.params = params
    }
    /**
     * Checks if two ErrorMessage instances are equal
     *
     * @param {ErrorMessage} other The other ErrorMessage instance to compare with
     * @returns {boolean} True if equal, otherwise false
     */
    equals(other) {
        if (!(other instanceof ErrorMessage)) {
            return false
        }
        return (
            this.msg === other.msg && JSON.stringify(this.params) === JSON.stringify(other.params)
        )
    }
}

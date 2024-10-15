/** Error message to display to the user */
export default class ErrorMessage {
    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg, params = null) {
        this.msg = msg
        this.params = params ?? {}
    }

    isEquals(object) {
        return (
            object instanceof ErrorMessage &&
            object.msg === this.msg &&
            Object.keys(this.params).length === Object.keys(object.params).length &&
            Object.keys(this.params).every((key) => this.params[key] === object.params[key])
        )
    }
}

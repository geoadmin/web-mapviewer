/** @module geoadmin/log */

export class Message {
    msg: string
    params: Record<string, unknown>

    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg: string, params?: Record<string, unknown>) {
        this.msg = msg
        this.params = params ?? {}
    }

    isEquals(object: Message): boolean {
        return (
            object.msg === this.msg &&
            Object.keys(this.params).length === Object.keys(object.params).length &&
            Object.keys(this.params).every((key) => this.params[key] === object.params[key])
        )
    }
}

export class ErrorMessage extends Message {}
export class WarningMessage extends Message {}

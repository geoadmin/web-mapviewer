/** @module geoadmin/log */

export class Message {
    msg: string
    params: Record<string, any>
    /**
     * Flag telling that the user has seen the error and closed it, to avoid seeing again
     */
    isAcknowledged: boolean
    sourceId? : string
    /**
     * @param {string} msg Translation key message
     * @param {any} params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg: string, params: Record<string, any> | null = null, sourceId? : string, isAcknowledged: boolean = false ) {
        this.msg = msg
        this.params = params ?? {}
        this.isAcknowledged = isAcknowledged
        this.sourceId = sourceId
    }

    // It is important that the Acknowledgement of the message is not part of the equality check.
    // As this is used to stop new errors that have the same source to be dispatched.
    isEquals(object: Message) {
        return (
            object instanceof Message &&
            object.msg === this.msg &&
            Object.keys(this.params).length === Object.keys(object.params).length &&
            Object.keys(this.params).every((key) => this.params[key] === object.params[key]) &&
            this.sourceId === object.sourceId
        )
    }
}

export class ErrorMessage extends Message {}
export class WarningMessage extends Message {}

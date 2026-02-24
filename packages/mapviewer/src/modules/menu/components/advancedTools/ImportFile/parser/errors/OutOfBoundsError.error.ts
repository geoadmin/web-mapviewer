/** Coordinates or extent out of bounds error */
export default class OutOfBoundsError extends Error {
    messageKey?: string

    constructor(message: string, messageKey?: string) {
        super(message)
        this.name = 'OutOfBoundsError'
        this.messageKey = messageKey
    }
}

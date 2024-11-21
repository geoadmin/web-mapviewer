/** Coordinates or extent out of bounds error */
export default class OutOfBoundsError extends Error {
    constructor(message, messageKey) {
        super(message)
        this.name = 'OutOfBoundsError'
        this.messageKey = messageKey
    }
}

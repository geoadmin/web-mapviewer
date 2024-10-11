/** Coordinates or extent out of bounds error */
export default class OutOfBoundsError extends Error {
    constructor(message) {
        super(message)
        this.name = 'OutOfBoundsError'
    }
}

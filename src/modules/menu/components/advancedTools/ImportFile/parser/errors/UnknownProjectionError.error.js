export default class UnknownProjectionError extends Error {
    constructor(message, epsg) {
        super(message)
        this.epsg = epsg
    }
}

export default class UnknownProjectionError extends Error {
    epsg: string

    constructor(message: string, epsg: string) {
        super(message)
        this.epsg = epsg
    }
}

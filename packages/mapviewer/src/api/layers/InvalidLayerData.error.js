export class InvalidLayerDataError extends Error {
    constructor(message, data) {
        super(message)
        this.data = data
        this.name = 'InvalidLayerDataError'
    }
}

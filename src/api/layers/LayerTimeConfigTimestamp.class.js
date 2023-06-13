export class LayerTimeConfigTimestamp {
    /** @param {Number} timestamp A full timestamp as YYYYYMMDD */
    constructor(timestamp) {
        this.timestamp = timestamp
        this.year = parseInt(timestamp.substring(0, 4)) || 9999
    }
}

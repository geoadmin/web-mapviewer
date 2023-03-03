export default class ElevationProfileSegment {
    /** @param {ElevationProfilePoint[]} points */
    constructor(points) {
        /** @type {ElevationProfilePoint[]} */
        this.points = [...points]
    }

    get hasData() {
        return this.points.length >= 2 && this.points[0].elevation !== null
    }
}

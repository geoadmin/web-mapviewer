export default class ElevationProfileSegment {
    /** @param {ElevationProfilePoint[]} points */
    constructor(points) {
        /** @type {ElevationProfilePoint[]} */
        this.points = [...points]
    }

    /** @returns {boolean} True if all points in this segment have elevation data */
    get hasElevationData() {
        return (
            this.points.length > 0 &&
            this.points.filter((point) => point.hasElevationData).length === this.points.length
        )
    }

    /**
     * @returns {ElevationProfilePoint | null} The last point of this segment, or null if there is
     *   no points
     */
    get lastPoint() {
        if (this.points.length === 0) {
            return null
        }
        return this.points.slice(-1)[0]
    }

    /** @returns {boolean} True if the last point of the segment has a distance of more than 0 meters */
    get hasDistanceData() {
        return this.points.length > 0 && this.lastPoint.dist !== 0
    }

    get maxDist() {
        if (!this.hasDistanceData) {
            return 0
        }
        return this.lastPoint.dist
    }
}

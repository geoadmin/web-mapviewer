import { LineString } from 'ol/geom'

/**
 * Representation of data coming from `service-alti`'s backend. Also encapsulate most business
 * calculation related to profile (hiking time, slop/distance, etc...)
 */
export default class ElevationProfile {
    /** @param {ElevationProfileSegment[]} segments */
    constructor(segments) {
        /** @type {ElevationProfileSegment[]} */
        this.segments = [...segments]
    }

    get points() {
        return this.segments.flatMap((segment) => segment.points)
    }

    /** @returns {Number} */
    get length() {
        return this.points.length
    }

    /** @returns {boolean} True if one segment is found to have elevation data */
    get hasElevationData() {
        return !!this.segments.find((segment) => segment.hasElevationData)
    }

    /** @returns {boolean} True if all segments have distance data */
    get hasDistanceData() {
        return (
            this.segments.filter((segment) => segment.hasDistanceData).length ===
            this.segments.length
        )
    }

    /** @returns {Number} */
    get maxDist() {
        if (!this.hasDistanceData) {
            return 0
        }
        return this.segments.slice(-1)[0].maxDist
    }

    /** @returns {Number} */
    get maxElevation() {
        if (!this.hasElevationData) {
            return 0
        }
        return Math.max(...this.points.map((point) => point.elevation))
    }

    /** @returns {Number} */
    get minElevation() {
        if (!this.hasElevationData) {
            return 0
        }
        return Math.min(
            ...this.points.filter((point) => point.hasElevationData).map((point) => point.elevation)
        )
    }

    /** @returns {Number} Elevation difference between starting and ending point, in meters */
    get elevationDifference() {
        if (!this.hasElevationData) {
            return 0
        }
        return this.points.slice(-1)[0].elevation - this.points[0].elevation
    }

    get totalAscent() {
        return this.segments.reduce((totalAscent, currentSegment) => {
            return totalAscent + currentSegment.totalAscent
        }, 0)
    }

    get totalDescent() {
        return this.segments.reduce((totalDescent, currentSegment) => {
            return totalDescent + currentSegment.totalDescent
        }, 0)
    }

    /** @returns {Number} Sum of slope/surface distances (distance on the ground) */
    get slopeDistance() {
        return this.segments.reduce((slopeDistance, currentSegment) => {
            return slopeDistance + currentSegment.slopeDistance
        }, 0)
    }

    get coordinates() {
        return this.points.map((point) => point.coordinate)
    }

    get lineString() {
        return new LineString(this.coordinates)
    }

    /**
     * Hiking time calculation for the profile
     *
     * Official formula: http://www.wandern.ch/download.php?id=4574_62003b89 Reference link:
     * http://www.wandern.ch
     *
     * But we use a slightly modified version from schweizmobil
     *
     * @returns {number} Estimation of hiking time for this profile
     */
    get hikingTime() {
        return this.segments.reduce((hikingTime, currentSegment) => {
            return hikingTime + currentSegment.hikingTime
        }, 0)
    }
}

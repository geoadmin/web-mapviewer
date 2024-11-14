import { LineString } from 'ol/geom'

/**
 * Representation of data coming from `service-alti`'s backend. Also encapsulate most business
 * calculation related to profile (hiking time, slop/distance, etc...)
 */
export default class ElevationProfile {
    /**
     * Creates an instance of ElevationProfile.
     *
     * @param {ElevationProfileSegment[]} segments - An array of elevation profile segments.
     * @param {number} _activeSegmentIndex - The index of the active segment.
     */
    constructor(segments) {
        this.segments = [...segments]
        this._activeSegmentIndex = 0
    }

    get points() {
        return this.segments.flatMap((segment) => segment.points)
    }

    get segmentPoints() {
        return this.segments[this._activeSegmentIndex].points
    }

    /** @returns {Number} */
    get segmentsCount() {
        return this.segments.length
    }

    /** @returns {Number} */
    get activeSegmentIndex() {
        return this._activeSegmentIndex
    }

    set activeSegmentIndex(index) {
        if (index < 0 || index >= this.segmentsCount) {
            return
        }
        this._activeSegmentIndex = index
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
            this.segments.length > 0 &&
            this.segments.filter((s) => s.hasDistanceData).length === this.segments.length
        )
    }

    /** @returns {Number} */
    get maxDist() {
        if (!this.hasDistanceData) {
            return 0
        }
        return this.segments[this._activeSegmentIndex].maxDist
    }

    /** @returns {Number} */
    get maxElevation() {
        if (!this.hasElevationData) {
            return 0
        }
        return Math.max(
            ...this.segments[this._activeSegmentIndex].points.map((point) => point.elevation)
        )
    }

    /** @returns {Number} */
    get minElevation() {
        if (!this.hasElevationData) {
            return 0
        }
        return Math.min(
            ...this.segments[this._activeSegmentIndex].points
                .filter((point) => point.hasElevationData)
                .map((point) => point.elevation)
        )
    }

    /** @returns {Number} Elevation difference between starting and ending point, in meters */
    get elevationDifference() {
        if (!this.hasElevationData) {
            return 0
        }
        return (
            this.segments[this._activeSegmentIndex].points.slice(-1)[0].elevation -
            this.segments[this._activeSegmentIndex].points[0].elevation
        )
    }

    get totalAscent() {
        return this.segments[this._activeSegmentIndex].totalAscent
    }

    get totalDescent() {
        return this.segments[this._activeSegmentIndex].totalDescent
    }

    /** @returns {Number} Sum of slope/surface distances (distance on the ground) */
    get slopeDistance() {
        return this.segments[this._activeSegmentIndex].slopeDistance
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
        return this.segments[this._activeSegmentIndex].hikingTime
    }
}

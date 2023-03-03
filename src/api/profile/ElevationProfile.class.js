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

    get hasData() {
        return !!this.segments.find((segment) => segment.hasData)
    }

    /** @returns {Number} */
    get maxDist() {
        return this.segments.slice(-1)[0].points.slice(-1)[0].dist
    }

    /** @returns {Number} */
    get maxElevation() {
        if (!this.hasData) {
            return 0
        }
        return Math.max(...this.points.map((point) => point.elevation))
    }

    /** @returns {Number} */
    get minElevation() {
        if (!this.hasData) {
            return 0
        }
        return Math.min(
            ...this.points.filter((point) => point.elevation > 0).map((point) => point.elevation)
        )
    }

    /** @returns {Number} Elevation difference between starting and ending point, in meters */
    get elevationDifference() {
        if (!this.hasData) {
            return 0
        }
        return this.points[this.points.length - 1].elevation - this.points[0].elevation
    }

    get totalAscent() {
        return this.points.reduce((totalAscent, currentPoint, currentIndex, points) => {
            if (currentIndex === 0) {
                // we skip the first element, as we can't calculate the ascent with only one point
                return totalAscent
            }
            // we only want positive ascent value, so if it's a descent we return 0
            return (
                totalAscent +
                Math.max(currentPoint.elevation - points[currentIndex - 1].elevation, 0)
            )
        }, 0)
    }

    get totalDescent() {
        return Math.abs(
            this.points.reduce((totalDescent, currentPoint, currentIndex, points) => {
                if (currentIndex === 0) {
                    // we skip the first element, as we can't calculate the descent with only one point
                    return totalDescent
                }
                // we only want descent value, so if it's an ascent we return 0
                return (
                    totalDescent -
                    Math.min(currentPoint.elevation - points[currentIndex - 1].elevation, 0)
                )
            }, 0)
        )
    }

    /** @returns {Number} Sum of slope/surface distances (distance on the ground) */
    get slopeDistance() {
        if (!this.hasData) {
            return 0
        }
        return this.points.reduce((sumSlopeDist, currentPoint, currentIndex, points) => {
            if (currentIndex === 0) {
                // we skip the first element, as we can't calculate slope/distance with only one point
                return sumSlopeDist
            }
            const previousPoint = points[currentIndex - 1]
            const elevationDelta = currentPoint.elevation - previousPoint.elevation
            const distanceDelta = currentPoint.dist - previousPoint.dist
            // Pythagorean theorem (hypotenuse: the slope/surface distance)
            return (
                sumSlopeDist + Math.sqrt(Math.pow(elevationDelta, 2) + Math.pow(distanceDelta, 2))
            )
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
        if (!this.hasData) {
            return 0
        }

        // Constants of the formula (schweizmobil)
        const arrConstants = [
            14.271, 3.6991, 2.5922, -1.4384, 0.32105, 0.81542, -0.090261, -0.20757, 0.010192,
            0.028588, -0.00057466, -0.0021842, 1.5176e-5, 8.6894e-5, -1.3584e-7, -1.4026e-6,
        ]

        return Math.round(
            this.points
                .map((currentPoint, index, points) => {
                    if (index < points.length - 2) {
                        const nextPoint = points[index + 1]

                        const distanceDelta = nextPoint.dist - currentPoint.dist
                        if (!distanceDelta) {
                            return 0
                        }
                        const elevationDelta = nextPoint.elevation - currentPoint.elevation

                        // Slope value between the 2 points
                        // 10ths (schweizmobil formula) instead of % (official formula)
                        const slope = (elevationDelta * 10.0) / distanceDelta

                        // The swiss hiking formula is used between -25% and +25%
                        // but schweiz mobil use -40% and +40%
                        let minutesPerKilometer = 0
                        if (slope > -4 && slope < 4) {
                            arrConstants.forEach((constants, i) => {
                                minutesPerKilometer += constants * Math.pow(slope, i)
                            })
                            // outside the -40% to +40% range, we use a linear formula
                        } else if (slope > 0) {
                            minutesPerKilometer = 17 * slope
                        } else {
                            minutesPerKilometer = -9 * slope
                        }
                        return (distanceDelta * minutesPerKilometer) / 1000
                    }
                    return 0
                })
                .reduce((a, b) => a + b)
        )
    }
}

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

    get totalAscent() {
        if (!this.hasElevationData) {
            return 0
        }
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
        if (!this.hasElevationData) {
            return 0
        }
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
        if (!this.hasElevationData) {
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
        if (!this.hasElevationData) {
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

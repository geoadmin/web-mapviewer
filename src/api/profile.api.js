import { API_SERVICE_ALTI_BASE_URL } from '@/config'
import { CoordinateSystems } from '@/utils/coordinateUtils'
import log from '@/utils/logging'
import axios from 'axios'
import { LineString } from 'ol/geom'

/**
 * @typedef GeoJSON A GeoJSON object
 * @property {string} type
 * @property {[[Number]]} coordinates
 */

export class ProfilePoint {
    /**
     * @param {Number} dist Distance from first to current point
     * @param {[Number, Number]} coordinate Coordinate of this point in EPSG:3857
     * @param {Number} elevation In the COMB elevation model
     */
    constructor(dist, coordinate, elevation) {
        this._dist = dist
        this._coordinate = coordinate
        this._elevation = elevation
    }

    get dist() {
        return this._dist
    }

    get coordinate() {
        return this._coordinate
    }

    /** @returns {Number} The COMB elevation */
    get elevation() {
        return this._elevation
    }

    // no setter
}

export class GeoAdminProfile {
    /** @param {ProfilePoint[]} points */
    constructor(points) {
        /** @type {ProfilePoint[]} */
        this.points = [...points]
    }

    /** @returns {Number} */
    get length() {
        return this.points.length
    }

    /** @returns {Boolean} */
    get hasData() {
        return this.length > 0
    }

    /** @returns {Number} */
    get maxDist() {
        return (this.hasData && this.points[this.length - 1].dist) || 0
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
        return Math.min(...this.points.map((point) => point.elevation))
    }

    /** @returns {Number} Elevation difference between starting and ending point, in meters */
    get elevationDifference() {
        if (!this.hasData) {
            return 0
        }
        return this.points[this.points.length - 1].elevation - this.points[0].elevation
    }

    /**
     * @returns {(number | number)[] | undefined} Up, down (abs) Total positive elevation & total
     *   negative elevation
     */
    get totalElevationDifference() {
        let sumDown = 0
        let sumUp = 0
        for (let i = 0; i < this.points.length - 1; i++) {
            const h1 = this.points[i].elevation || 0
            const h2 = this.points[i + 1].elevation || 0
            const dh = h2 - h1
            if (dh < 0) {
                sumDown += dh
            } else if (dh >= 0) {
                sumUp += dh
            }
        }
        return [sumUp, Math.abs(sumDown)]
    }

    /** @returns {Number} The highest elevation in this profile */
    get highestElevation() {
        if (this.hasData) {
            const highestPoint = this.points.reduce((previousPoint, currentPoint) => {
                if (currentPoint.elevation > previousPoint.elevation) {
                    return currentPoint
                }
                return previousPoint
            })
            return highestPoint.elevation
        }
        return 0
    }

    /** @returns {Number} The lowest elevation in this profile */
    get lowestElevation() {
        if (this.hasData) {
            const lowestPoint = this.points.reduce((previousPoint, currentPoint) => {
                if (currentPoint.elevation < previousPoint.elevation) {
                    return currentPoint
                }
                return previousPoint
            })
            return lowestPoint.elevation
        }
        return 0
    }

    /** @returns {Number} Sum of slope/surface distances (distance on the ground) */
    get slopeDistance() {
        if (!this.hasData) {
            return 0
        }
        let sumSlopeDist = 0
        for (let i = 0; i < this.points.length - 1; i++) {
            const elevationDelta = this.points[i + 1].elevation - this.points[i].elevation
            const distanceDelta = this.points[i + 1].dist - this.points[i].dist
            // Pythagorean theorem (hypotenuse: the slope/surface distance)
            sumSlopeDist += Math.sqrt(Math.pow(elevationDelta, 2) + Math.pow(distanceDelta, 2))
        }
        return sumSlopeDist
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

function parseProfileFromBackendResponse(backendResponse) {
    const points = []
    backendResponse.forEach((rawData) => {
        points.push(
            new ProfilePoint(rawData.dist, [rawData.easting, rawData.northing], rawData.alts.COMB)
        )
    })
    return new GeoAdminProfile(points)
}

/**
 * Gets profile from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {[Number, Number][]} coordinates Coordinates in LV95 from which we want the profile
 * @param {String} fileExtension .json (default) and .csv are possible file extensions
 * @returns {Promise<GeoAdminProfile>}
 */
const profile = (coordinates, fileExtension = '.json') => {
    return new Promise((resolve, reject) => {
        if (fileExtension !== '.json' && fileExtension !== '.csv') {
            const errorMessage = `Not supported file extension`
            log.error(errorMessage)
            reject(errorMessage)
        }
        if (!coordinates || coordinates.length === 0) {
            const errorMessage = `Coordinates not provided`
            log.error(errorMessage)
            reject(errorMessage)
        }
        axios({
            url: `${API_SERVICE_ALTI_BASE_URL}rest/services/profile${fileExtension}`,
            method: 'POST',
            params: {
                offset: 0,
                sr: CoordinateSystems.LV95.epsgNumber,
                distinct_points: true,
            },
            data: { type: 'LineString', coordinates: coordinates },
        })
            .then((response) => {
                if (response && response.data) {
                    if (fileExtension === '.json') {
                        resolve(parseProfileFromBackendResponse(response.data))
                    } else {
                        resolve(response.data)
                    }
                } else {
                    const msg = 'Incorrect response while getting profile'
                    log.error(msg, response)
                    reject(msg)
                }
            })
            .catch((error) => {
                log.error('Error while getting profile', coordinates)
                reject(error)
            })
    })
}

/**
 * Gets profile in json format from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {[Number, Number][]} coordinates Coordinates in LV95 from which we want the profile
 * @returns {Promise<ProfilePoint[]>}
 */
export const profileJson = (coordinates) => {
    return profile(coordinates, '.json')
}

/**
 * Gets profile in csv format from https://api3.geo.admin.ch/services/sdiservices.html#profile
 *
 * @param {[Number, Number][]} coordinates Coordinates in LV95 from which we want the profile
 * @returns {Promise<ProfilePoint[]>}
 */
export const profileCsv = (coordinates) => {
    return profile(coordinates, '.csv')
}

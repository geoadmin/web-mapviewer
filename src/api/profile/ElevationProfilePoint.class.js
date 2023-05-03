export default class ElevationProfilePoint {
    /**
     * @param {[Number, Number]} coordinate Coordinate of this point in EPSG:3857
     * @param {Number} dist Distance from first to current point
     * @param {Number | null} elevation In the COMB elevation model
     */
    constructor(coordinate, dist = 0, elevation = null) {
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

    get hasElevationData() {
        return this._elevation !== null
    }
    // no setter
}

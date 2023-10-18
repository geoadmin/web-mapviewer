import clip from 'liang-barsky'

/**
 * Representation of boundaries of a coordinate system (also sometime called extent)
 *
 * It is expressed by the most bottom left points possible / top right point possible,
 * meaning that a combination of these two gives us the area in which the coordinate
 * system can produce valid coordinates
 */
export default class CoordinateSystemBounds {
    /**
     * @param {Number} lowerX
     * @param {Number} upperX
     * @param {Number} lowerY
     * @param {Number} upperY
     */
    constructor(lowerX, upperX, lowerY, upperY) {
        this.lowerX = lowerX
        this.upperX = upperX
        this.lowerY = lowerY
        this.upperY = upperY
    }

    isInBounds(x, y) {
        return x >= this.lowerX && x <= this.upperX && y >= this.lowerY && y <= this.upperY
    }

    get bottomLeft() {
        return [this.lowerX, this.lowerY]
    }

    get topRight() {
        return [this.upperX, this.upperY]
    }

    get center() {
        return [(this.lowerX + this.upperX) / 2.0, (this.lowerY + this.upperY) / 2.0]
    }

    /**
     * Returns a flatten version of the bounds such as [lowerX, lowerY, upperX, upperY]
     *
     * @return {Number[]}
     */
    get flatten() {
        return [this.lowerX, this.lowerY, this.upperX, this.upperY]
    }

    /**
     * @typedef CoordinatesChunk
     * @type {object}
     * @property {[Number, Number][]} coordinates Coordinates of this chunk
     * @property {Boolean} isWithinBounds Will be true if this chunk contains coordinates that are
     *   located within bounds
     */

    /**
     * Will split the coordinates in chunks if some portion of the coordinates are outside bounds
     * (one chunk for the portion inside, one for the portion outside, rinse and repeat if necessary)
     *
     * Can be helpful when requesting information from our backends, but said backend doesn't support
     * world-wide coverage. Typical example is service-profile, if we give it coordinates outside LV95
     * bounds it will fill what it doesn't know with coordinates following LV95 extent instead of
     * returning null
     *
     * @param {[Number, Number][]} coordinates Coordinates
     *   `[[x1,y1],[x2,y2],...]` expressed in the same coordinate system (projection) as the bounds
     * @returns {null | CoordinatesChunk[]}
     */
    splitIfOutOfBounds(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length <= 1) {
            return null
        }
        // checking that all coordinates are well-formed
        if (coordinates.find((coordinate) => coordinate.length !== 2)) {
            return null
        }
        // checking if we require splitting
        if (coordinates.find((coordinate) => !this.isInBounds(coordinate[0], coordinate[1]))) {
            return splitIfOutOfBoundsRecurse(coordinates, this)
        }
        // no splitting needed, we return the coordinates as they were given
        return [
            {
                coordinates: coordinates,
                isWithinBounds: true,
            },
        ]
    }
}

/**
 * @param {[Number, Number][]} coordinates
 * @param {CoordinateSystemBounds} bounds
 * @param {[CoordinatesChunk]} previousChunks
 * @param {Boolean} isFirstChunk
 * @returns {[CoordinatesChunk]}
 */
function splitIfOutOfBoundsRecurse(coordinates, bounds, previousChunks = [], isFirstChunk = true) {
    // for the first chunk, we take the very first coordinate, after that as we add the junction
    // to the coordinates, we need to take the second to check if it is in bound
    const firstCoordinate = coordinates[isFirstChunk ? 0 : 1]
    const isFirstCoordinateInBounds = bounds.isInBounds(firstCoordinate[0], firstCoordinate[1])
    // searching for the next coordinates where the split will happen (omitting the first coordinate)
    const nextCoordinateWithoutSameBounds = coordinates
        .slice(1)
        .find(
            (coordinate) =>
                isFirstCoordinateInBounds !== bounds.isInBounds(coordinate[0], coordinate[1])
        )
    if (!nextCoordinateWithoutSameBounds) {
        // end of the recurse loop, nothing more to split, we add the last segment/chunk
        return [
            ...previousChunks,
            {
                coordinates,
                isWithinBounds: isFirstCoordinateInBounds,
            },
        ]
    }
    const indexOfNextCoord = coordinates.indexOf(nextCoordinateWithoutSameBounds)
    const lastCoordinateWithSameBounds = coordinates[indexOfNextCoord - 1]
    // adding the coordinate where the boundaries are crossed
    let crossing1 = lastCoordinateWithSameBounds.slice(),
        crossing2 = nextCoordinateWithoutSameBounds.slice()
    clip(
        lastCoordinateWithSameBounds,
        nextCoordinateWithoutSameBounds,
        bounds.flatten,
        crossing1,
        crossing2
    )
    // if first coordinate was in bound we have to use crossing2 as our intersection (crossing 1 will be a copy of firstCoordinate)
    // it's the opposite if firstCoordinate was out of bounds, we have to use crossing1 as the intersection
    const intersection = isFirstCoordinateInBounds ? crossing2 : crossing1
    const coordinateLeftToProcess = [intersection, ...coordinates.slice(indexOfNextCoord)]
    return splitIfOutOfBoundsRecurse(
        coordinateLeftToProcess,
        bounds,
        [
            ...previousChunks,
            {
                coordinates: [...coordinates.slice(0, indexOfNextCoord), intersection],
                isWithinBounds: isFirstCoordinateInBounds,
            },
        ],
        false
    )
}

import { bboxPolygon, booleanPointInPolygon, lineSplit, lineString, points } from '@turf/turf'

import type { CoordinatesChunk } from '@/proj/CoordinatesChunk'
import type { SingleCoordinate } from '@/utils/coordinates'

/**
 * Representation of boundaries of a coordinate system (also sometime called extent)
 *
 * It is expressed by the most bottom left points possible / top right point possible, meaning that
 * a combination of these two gives us the area in which the coordinate system can produce valid
 * coordinates
 */
export default class CoordinateSystemBounds {
    public readonly lowerX: number
    public readonly upperX: number
    public readonly lowerY: number
    public readonly upperY: number
    public readonly customCenter: SingleCoordinate | null

    public readonly bottomLeft: SingleCoordinate
    public readonly bottomRight: SingleCoordinate
    public readonly topLeft: SingleCoordinate
    public readonly topRight: SingleCoordinate

    public readonly center: SingleCoordinate
    /** A flattened version of the bounds such as [lowerX, lowerY, upperX, upperY] */
    public readonly flatten: [number, number, number, number]

    /**
     * @param {Number} lowerX
     * @param {Number} upperX
     * @param {Number} lowerY
     * @param {Number} upperY
     * @param {[Number, Number] | null} customCenter If this bounds must have a different center (if
     *   we want to offset the natural center of those bounds). If no custom center is given, the
     *   center will be calculated relative to the bounds.
     */
    constructor(
        lowerX: number,
        upperX: number,
        lowerY: number,
        upperY: number,
        customCenter: SingleCoordinate | null = null
    ) {
        this.lowerX = lowerX
        this.upperX = upperX
        this.lowerY = lowerY
        this.upperY = upperY
        this.customCenter = customCenter

        this.bottomLeft = [this.lowerX, this.lowerY]
        this.bottomRight = [this.upperX, this.lowerY]
        this.topLeft = [this.lowerX, this.upperY]
        this.topRight = [this.upperX, this.upperY]

        this.center = this.customCenter ?? [
            (this.lowerX + this.upperX) / 2,
            (this.lowerY + this.upperY) / 2,
        ]
        this.flatten = [this.lowerX, this.lowerY, this.upperX, this.upperY]
    }

    isInBounds(x: number, y: number): boolean {
        return x >= this.lowerX && x <= this.upperX && y >= this.lowerY && y <= this.upperY
    }

    /**
     * Will split the coordinates in chunks if some portion of the coordinates are outside bounds
     * (one chunk for the portion inside, one for the portion outside, rinse and repeat if
     * necessary)
     *
     * Can be helpful when requesting information from our backends, but said backend doesn't
     * support world-wide coverage. Typical example is service-profile, if we give it coordinates
     * outside LV95 bounds it will fill what it doesn't know with coordinates following LV95 extent
     * instead of returning null
     *
     * @param {[Number, Number][]} coordinates Coordinates `[[x1,y1],[x2,y2],...]` expressed in the
     *   same coordinate system (projection) as the bounds
     * @returns {null | CoordinatesChunk[]}
     */
    splitIfOutOfBounds(coordinates: SingleCoordinate[]): CoordinatesChunk[] | null {
        if (!Array.isArray(coordinates) || coordinates.length <= 1) {
            return null
        }
        // checking that all coordinates are well-formed
        if (coordinates.find((coordinate) => coordinate.length !== 2)) {
            return null
        }
        // checking if we require splitting
        if (coordinates.find((coordinate) => !this.isInBounds(coordinate[0], coordinate[1]))) {
            const boundsAsPolygon = bboxPolygon(this.flatten)
            return lineSplit(lineString(coordinates), boundsAsPolygon).features.map((chunk) => {
                return {
                    coordinates: chunk.geometry.coordinates,
                    isWithinBounds: points(chunk.geometry.coordinates).features.every((point) =>
                        booleanPointInPolygon(point, boundsAsPolygon)
                    ),
                } as CoordinatesChunk
            })
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

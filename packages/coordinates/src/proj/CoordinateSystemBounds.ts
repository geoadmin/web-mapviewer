import type { Coord } from '@turf/turf'
import type { Feature, FeatureCollection, GeoJsonProperties, LineString } from 'geojson'

import {
    bboxPolygon,
    booleanPointInPolygon,
    distance,
    lineSplit,
    lineString,
    points,
} from '@turf/turf'
import { sortBy } from 'lodash'

import type { SingleCoordinate } from '@/coordinatesUtils'
import type { CoordinatesChunk } from '@/proj/types'

interface CoordinateSystemBoundsProps {
    lowerX: number
    upperX: number
    lowerY: number
    upperY: number
    customCenter?: SingleCoordinate
}

/**
 * Turf's lineSplit function doesn't ensure split path will be ordered in its output.
 *
 * This code aims to reorder the result of this function in the correct order. Comes from a GitHub
 * issue (see link below)
 *
 * @see https://github.com/Turfjs/turf/issues/1989#issuecomment-753147919
 */
function reassembleLineSegments(
    origin: Coord,
    path: FeatureCollection<LineString, GeoJsonProperties>
): Feature<LineString>[] {
    let candidateFeatures = path.features
    const orderedFeatures: Feature<LineString, GeoJsonProperties>[] = []
    while (candidateFeatures.length > 0) {
        candidateFeatures = sortBy(candidateFeatures, (f) => {
            if (f.geometry && f.geometry.coordinates && f.geometry.coordinates[0]) {
                return distance(origin, f.geometry.coordinates[0])
            } else {
                throw new Error('Feature missing geometry')
            }
        })
        const closest = candidateFeatures.shift()
        const closestOrigin = closest.geometry.coordinates[closest.geometry.coordinates.length - 1]
        if (closestOrigin) {
            origin = closestOrigin
        }
        orderedFeatures.push(closest)
    }
    return orderedFeatures
}

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
    public readonly customCenter?: SingleCoordinate

    public readonly bottomLeft: SingleCoordinate
    public readonly bottomRight: SingleCoordinate
    public readonly topLeft: SingleCoordinate
    public readonly topRight: SingleCoordinate

    public readonly center: SingleCoordinate
    /** A flattened version of the bounds such as [lowerX, lowerY, upperX, upperY] */
    public readonly flatten: [number, number, number, number]

    /**
     * @param args.lowerX
     * @param args.upperX
     * @param args.lowerY
     * @param args.upperY
     * @param args.customCenter If this bounds must have a different center (if we want to offset
     *   the natural center of those bounds). If no custom center is given, the center will be
     *   calculated relative to the bounds.
     */
    constructor(args: CoordinateSystemBoundsProps) {
        const { lowerX, upperX, lowerY, upperY, customCenter } = args
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

    isInBounds(x: number, y: number): boolean
    isInBounds(coordinate: SingleCoordinate): boolean

    isInBounds(xOrCoordinate: number | SingleCoordinate, y?: number): boolean {
        if (typeof xOrCoordinate === 'number') {
            return (
                xOrCoordinate >= this.lowerX &&
                xOrCoordinate <= this.upperX &&
                y >= this.lowerY &&
                y <= this.upperY
            )
        }
        return this.isInBounds(xOrCoordinate[0], xOrCoordinate[1])
    }

    /**
     * Will split the coordinates in chunks if some portion of the coordinates are outside bounds
     * (one chunk for the portion inside, one for the portion outside, rinse and repeat if
     * necessary)
     *
     * Can be helpful when requesting information from our backends, but said backend doesn't
     * support world-wide coverage. Typical example is service-profile, if we give it coordinates
     * outside LV95 bounds it will fill what it doesn't know with coordinates following LV95 extent
     * instead of returning undefined
     *
     * @param {[Number, Number][]} coordinates Coordinates `[[x1,y1],[x2,y2],...]` expressed in the
     *   same coordinate system (projection) as the bounds
     * @returns {CoordinatesChunk[] | undefined}
     */
    splitIfOutOfBounds(coordinates: SingleCoordinate[]): CoordinatesChunk[] | undefined {
        if (!Array.isArray(coordinates) || coordinates.length <= 1) {
            return
        }
        // checking that all coordinates are well-formed
        if (coordinates.find((coordinate) => coordinate.length !== 2)) {
            return
        }
        // checking if we require splitting
        if (coordinates.find((coordinate) => !this.isInBounds(coordinate))) {
            const boundsAsPolygon = bboxPolygon(this.flatten)
            const paths = lineSplit(lineString(coordinates), boundsAsPolygon)
            if (coordinates[0]) {
                paths.features = reassembleLineSegments(coordinates[0], paths)
            }
            return paths.features.map((chunk) => {
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

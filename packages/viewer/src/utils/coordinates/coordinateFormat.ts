import type { CoordinateSystem, SingleCoordinate } from '@swissgeo/coordinates'

import { coordinatesUtils, LV03, LV95, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import { formatThousand } from '@swissgeo/numbers'
import { format as formatCoordinate, toStringHDMS } from 'ol/coordinate'
import proj4 from 'proj4'

import type { UTM } from '@/utils/militaryGridProjection'

import { latLonToMGRS, latLonToUTM } from '@/utils/militaryGridProjection'

type CoordinateFormatCallback = (coordinates: SingleCoordinate, withExtra?: boolean) => string

/** Representation of coordinates in a human-readable format */
export interface CoordinateFormat {
    /** Used in the code to identify this coordinate format */
    id: string
    /** Text shown to the user for this format */
    label: string
    /** Projection coordinates must be in so that it can be formated */
    requiredInputProjection: CoordinateSystem
    decimalPoints: number
    /** Function that formats coordinates into a human-readable string */
    formatCallback: CoordinateFormatCallback
}

const defaultCallback: CoordinateFormatCallback = (coordinates: SingleCoordinate): string =>
    coordinatesUtils.toRoundedString(coordinates, 2, true, true) ?? ''

export const LV95Format: CoordinateFormat = {
    id: 'LV95',
    label: 'CH1903+ / LV95',
    requiredInputProjection: LV95,
    decimalPoints: 2,
    formatCallback: defaultCallback,
}
export const LV03Format: CoordinateFormat = {
    id: 'LV03',
    label: 'CH1903 / LV03',
    requiredInputProjection: LV03,
    decimalPoints: 2,
    formatCallback: defaultCallback,
}
export const WGS84Format: CoordinateFormat = {
    id: 'WGS84',
    label: 'WGS 84 (lat/lon)',
    requiredInputProjection: WGS84,
    decimalPoints: 5,
    formatCallback: (coordinates: SingleCoordinate, withExtra?: boolean): string => {
        let output: string = `${toStringHDMS(coordinates, 2)}`
        if (withExtra) {
            output += ` (${formatCoordinate(coordinates, '{y}, {x}', 5)})`
        }
        return output
    },
}
export const MercatorFormat: CoordinateFormat = {
    id: 'Mercator',
    label: 'WebMercator',
    requiredInputProjection: WEBMERCATOR,
    decimalPoints: 2,
    formatCallback: defaultCallback,
}
export const UTMFormat: CoordinateFormat = {
    id: 'UTM',
    label: 'UTM',
    requiredInputProjection: WGS84,
    decimalPoints: 5,
    formatCallback: (coordinates: SingleCoordinate): string => {
        const c: UTM = latLonToUTM(coordinates[1], coordinates[0])
        return [
            formatThousand(c.easting),
            formatThousand(c.northing),
            `(${c.zoneNumber}${c.zoneLetter})`,
        ].join(' ')
    },
}
export const MGRSFormat: CoordinateFormat = {
    id: 'MGRS',
    label: 'MGRS',
    requiredInputProjection: WGS84,
    decimalPoints: 5,
    formatCallback: (coordinates: SingleCoordinate): string => {
        return latLonToMGRS(coordinates[1], coordinates[0], 6)
            .replace(/(.{5})/g, '$1 ')
            .trim()
    },
}

export const allFormats: CoordinateFormat[] = [
    LV95Format,
    LV03Format,
    WGS84Format,
    MercatorFormat,
    UTMFormat,
    MGRSFormat,
]

/**
 * Format the given coordinates (represented in the given projection) to a human-readable string
 *
 * @param format
 * @param coordinates Coordinates such as [x,y]
 * @param projection Projection used to express the coordinates
 * @param withExtra Flags that when set to true will output extra information if available
 * @returns Human-readable representation of the coordinates
 */
export default function coordinateFormat(
    format: CoordinateFormat,
    coordinates: SingleCoordinate,
    projection: CoordinateSystem,
    withExtra: boolean = false
): string {
    let reprojectedCoordinates = [...coordinates]
    if (projection && projection.epsg !== format.requiredInputProjection.epsg) {
        reprojectedCoordinates = proj4(
            projection.epsg,
            format.requiredInputProjection.epsg,
            coordinates
        )
    }
    return format.formatCallback(reprojectedCoordinates as SingleCoordinate, withExtra)
}

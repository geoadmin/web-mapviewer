import { EditableFeature } from '@/api/features.api'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { format } from '@/utils/numberUtils'
import { wrapX } from 'ol/coordinate'
import KML from 'ol/format/KML'
import { LineString, Point, Polygon } from 'ol/geom'
import { get as getProjection } from 'ol/proj'
import proj4 from 'proj4'

export function toLv95(input, epsg) {
    if (Array.isArray(input[0])) {
        return input.map((si) => toLv95(si, epsg))
    } else {
        return proj4(epsg, LV95.epsg, [input[0], input[1]])
    }
}

/**
 * Wraps the provided coordinates in the world extents (i.e. the coordinate range that if equivalent
 * to the wgs84 [-180, 180))
 *
 * @param {Array} coordinates The coordinates (or array of coordinates) to wrap
 * @param {CoordinateSystem} projection Projection of the coordinates
 * @param {boolean} inPlace If false, the original coordinates remain untouched and only a copy is
 *   modified
 * @returns If "inPlace", then the same reference as "coords", else a reference to the modified copy
 */
export function wrapXCoordinates(coordinates, projection, inPlace = false) {
    let wrappedCoords = coordinates
    if (!inPlace) {
        wrappedCoords = wrappedCoords.slice()
    }
    if (Array.isArray(wrappedCoords[0])) {
        return wrappedCoords.map((c) => wrapXCoordinates(c, projection, inPlace))
    }
    return wrapX(wrappedCoords, getProjection(projection.epsg))
}

/** @param {[number, number]} coo Coordinates */
export function formatPointCoordinates(coo) {
    return `${format(coo[0], 0)}, ${format(coo[1], 0)}`
}

export function formatMeters(value, { dim = 1, digits = 2, applyFormat = true } = {}) {
    const factor = Math.pow(1000, dim)
    let unit = dim === 1 ? 'm' : 'm²'
    if (value >= factor) {
        unit = dim === 1 ? 'km' : 'km²'
        value /= factor
    }
    value = applyFormat ? format(value, digits) : value.toFixed(digits)
    return `${value} ${unit}`
}

export function geometryInfo(type, coordinates, epsg) {
    const coos95 = toLv95(coordinates, epsg)
    const output = {
        type,
    }
    if (type === Point) {
        output.location = formatPointCoordinates(coos95)
    } else {
        if (type === Polygon) {
            const poly = new Polygon(coos95)
            output.area = formatMeters(poly.getArea(), { dim: 2 })
            const line = new LineString(coos95[0])
            output.perimeter = formatMeters(line.getLength())
        } else {
            const line = new LineString(coos95)
            output.length = formatMeters(line.getLength())
        }
    }
    return output
}

/**
 * Formats minutes to hours and minutes (if more than one hour) e.g. 1230 -> '20h 30min', 55 ->
 * '55min'
 *
 * @param {Number} minutes
 * @returns {string}
 */
export function formatTime(minutes) {
    if (isNaN(minutes) || minutes === null) {
        return '-'
    }
    let result = ''
    if (minutes >= 60) {
        let hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        result += `${hours}h`
        if (minutes > 0) {
            result += ` ${minutes}min`
        }
    } else {
        result += `${minutes}min`
    }
    return result
}

export function formatAngle(value, digits = 2) {
    return `${value.toFixed(digits)}°`
}

export function extractOlFeatureCoordinates(feature) {
    let coordinates = feature.getGeometry().getCoordinates()
    if (feature.getGeometry().getType() === 'Polygon') {
        // in case of a polygon, the coordinates structure is
        // [
        //   [ (poly1)
        //      [coord1],[coord2]
        //   ],
        //   [ (poly2) ...
        // ]
        // so as we will not have multipoly, we only keep what's defined as poly one
        // (we remove the wrapping array that would enable us to have a second polygon)
        coordinates = coordinates[0]
    }
    return coordinates
}

export function extractOlFeatureGeodesicCoordinates(feature) {
    return feature.geodesic?.getGeodesicGeom().getCoordinates()[0]
}

/**
 * Checks if point is at target within tolerance.
 *
 * @param {Number[]} point The point in question.
 * @param {Number[]} target The target to check against.
 * @param {Number} [tolerance=0] Distance from target that still counts. Default is `0`
 * @returns {Boolean} If the point is close enough to the target.
 */
export function pointWithinTolerance(point, target, tolerance = 0) {
    if (!point || !target) {
        return false
    }

    return (
        point[0] >= target[0] - tolerance &&
        point[0] <= target[0] + tolerance &&
        point[1] >= target[1] - tolerance &&
        point[1] <= target[1] + tolerance
    )
}

/**
 * Extracts and normalizes coordinates from LineStrings and Polygons.
 *
 * @param {ol.Feature} feature The feature to extract from.
 * @returns {Number[][]} An array of coordinates.
 */
export function getVertexCoordinates(feature) {
    let normalized = []
    const geometry = feature?.getGeometry()

    if (geometry) {
        const coordinates = geometry.getCoordinates()

        if (geometry instanceof LineString) {
            normalized = coordinates
        } else if (geometry instanceof Polygon) {
            normalized = coordinates[0]
        }
    }

    return normalized
}

/**
 * Parses a KML's data into OL Features, including deserialization of features
 *
 * @param {String} kmlData KML content to parse
 * @param {CoordinateSystem} projection Projection to use for the OL Feature
 * @param {DrawingIconSet[]} iconSets Icon sets to use for EditabeFeature deserialization
 * @returns {ol/Feature[]} List of OL Features
 */
export function parseKml(kmlData, projection, iconSets) {
    const features = new KML().readFeatures(kmlData, {
        dataProjection: WGS84.epsg, // KML files should always be in WGS84
        featureProjection: projection.epsg,
    })
    features.forEach((olFeature) => {
        EditableFeature.fromOlFeature(olFeature, iconSets, projection)
    })

    return features
}

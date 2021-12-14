import { LineString, Polygon } from 'ol/geom'
import proj4 from 'proj4'
import { format } from '@/utils/numberUtils'

export function toLv95(input, epsg) {
    if (Array.isArray(input[0])) {
        return input.map((si) => toLv95(si, epsg))
    } else {
        return proj4(epsg, 'EPSG:2056', [input[0], input[1]])
    }
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
    if (type === 'Point') {
        output.location = formatPointCoordinates(coos95)
    } else {
        if (type === 'Polygon') {
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
 * Formats minutes to hours and minutes (if more than one hour) e.g. 1230 -> '20h 30min', 55 -> '55min'
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

/**
 * Determine if the geometry can display azimuth circle or not
 *
 * @param {Geometry} geom
 * @returns {boolean}
 */
export function canShowAzimuthCircle(geom) {
    if (geom instanceof LineString) {
        const coords = geom.getCoordinates()
        if (
            coords.length === 2 ||
            (coords.length === 3 && coords[1][0] === coords[2][0] && coords[1][1] === coords[2][1])
        ) {
            return true
        }
    }
    return false
}

/**
 * @param {LineString} geom
 * @returns {number}
 */
export function getAzimuth(geom) {
    if (!(geom instanceof Polygon) && !(geom instanceof LineString)) {
        return 0
    }
    let coords = geom.getCoordinates()
    if (geom instanceof Polygon) {
        coords = coords[0]
    }
    let pt1 = coords[0]
    let pt2 = coords[1]

    if (!pt1 || !pt2) {
        return 0
    }
    const x = pt2[0] - pt1[0]
    const y = pt2[1] - pt1[1]
    const rad = Math.acos(y / Math.sqrt(x * x + y * y))
    const factor = x > 0 ? 1 : -1
    return (360 + (factor * rad * 180) / Math.PI) % 360
}

export function formatAngle(value, digits = 2) {
    return `${value.toFixed(digits)}°`
}

/**
 * Calculates frequency of intermediate tooltips on line
 *
 * @param {number} length Line length
 * @returns {number}
 */
export function getMeasureDelta(length) {
    let delta = 1
    if (length > 200000) {
        delta = 100000 / length
    } else if (length > 20000) {
        delta = 10000 / length
    } else if (length !== 0) {
        delta = 1000 / length
    }
    return delta
}

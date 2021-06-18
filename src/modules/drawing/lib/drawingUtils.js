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

export function formatMeters(value, { dim = 1, digits = 2 } = {}) {
    const factor = Math.pow(1000, dim)
    let unit = dim === 1 ? 'm' : 'm²'
    if (value >= factor) {
        unit = dim === 1 ? 'km' : 'km²'
        value /= factor
    }
    return `${format(value, digits)} ${unit}`
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

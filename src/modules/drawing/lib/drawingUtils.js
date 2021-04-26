import { LineString, Polygon } from 'ol/geom'
import proj4 from 'proj4'

export function wgs84ToLv95(input) {
    if (Array.isArray(input[0])) {
        return input.map((si) => wgs84ToLv95(si))
    } else {
        return proj4(proj4.WGS84, 'EPSG:2056', [input[1], input[0]])
    }
}

// format to 2'000'333
const nf = new Intl.NumberFormat('de-CH')

/** @param {[number, number]} coo Coordinates */
export function formatPointCoordinates(coo) {
    return `${nf.format(Math.round(coo[0]))}, ${nf.format(Math.round(coo[1]))}`
}

export function formatMeters(value, { dim = 1, digits = 2 } = {}) {
    const factor = Math.pow(1000, dim)
    let unit = dim === 1 ? 'm' : 'm²'
    if (value >= factor) {
        unit = dim === 1 ? 'km' : 'km²'
        value /= factor
    }
    const shift = Math.pow(10, digits)
    const nb = nf.format(Math.round(shift * value) / shift)
    return `${nb} ${unit}`
}

export function geometryInfo(geometry84) {
    const coos95 = wgs84ToLv95(geometry84.coordinates)
    const type = geometry84.type
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

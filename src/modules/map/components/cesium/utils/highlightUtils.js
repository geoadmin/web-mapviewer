import { Cartesian3, Color, Entity, HeightReference } from 'cesium'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinateSystems'
import proj4 from 'proj4'

let highlightedEntities = []
const highlightFill = Color.fromCssColorString('rgba(255, 255, 0, 0.75)')
const highlightedStroke = Color.fromCssColorString('rgba(255, 128, 0, 1)')
const highlightedStrokeWidth = 3

export function highlightSelectedArea(viewer, geometry) {
    if (!geometry) return
    let coordinates = geometry.coordinates
    let type = geometry.type
    switch (type) {
        case 'MultiPolygon':
        case 'Polygon':
            highlightPolygon(viewer, coordinates)
            break
        case 'LineString':
            highlightLine(viewer, coordinates)
            break
        case 'Point':
        case 'MultiPoint':
            highlightPoint(viewer, coordinates)
            break
        default:
            console.error(`Geometry "${geometry.type}" not handled`)
    }
    viewer.scene.requestRender()
}

export function highlightGroup(viewer, geometries) {
    unhighlightGroup(viewer)
    geometries.forEach((g) => highlightSelectedArea(viewer, g))
}

export function highlightPolygon(viewer, coordinates) {
    coordinates = coordinates[0]
    if (!coordinates.length) return
    let entity
    const createPolygon = (coords) => {
        const convertedCoords = coords.map((c) => {
            const degCoords = proj4(WEBMERCATOR.epsg, WGS84.epsg, c)
            return Cartesian3.fromDegrees(degCoords[0], degCoords[1])
        })
        return new Entity({
            polygon: {
                hierarchy: convertedCoords,
                material: highlightFill,
            },
        })
    }
    if (typeof coordinates[0][0] === 'number') {
        //for polygon
        entity = createPolygon(coordinates)
    } else {
        //for multipolygon
        entity = new Entity()
        coordinates.forEach((coords) => {
            entity.merge(createPolygon(coords))
        })
    }
    viewer.entities.add(entity)
    highlightedEntities.push(entity)
    viewer.scene.requestRender()
}

export function highlightLine(viewer, coordinates) {
    const convertedCoords = coordinates.map((c) => {
        const degCoords = proj4(WEBMERCATOR.epsg, WGS84.epsg, c)
        return Cartesian3.fromDegrees(degCoords[0], degCoords[1])
    })
    const entity = viewer.entities.add({
        polyline: {
            positions: convertedCoords,
            material: highlightFill,
            clampToGround: true,
            width: 5,
        },
    })
    highlightedEntities.push(entity)
    viewer.scene.requestRender()
}

export function highlightPoint(viewer, coordinates) {
    coordinates = typeof coordinates[0] === 'number' ? coordinates : coordinates[0]
    const degCoords = proj4(WEBMERCATOR.epsg, WGS84.epsg, coordinates)
    const convertedCoords = Cartesian3.fromDegrees(degCoords[0], degCoords[1])
    const entity = viewer.entities.add({
        position: convertedCoords,
        point: {
            color: highlightFill,
            pixelSize: 12,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            outlineWidth: highlightedStrokeWidth,
            outlineColor: highlightedStroke,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
    })
    highlightedEntities.push(entity)
    viewer.scene.requestRender()
}

export function unhighlightGroup(viewer) {
    if (highlightedEntities?.length && viewer) {
        highlightedEntities.forEach((e) => viewer.entities.remove(e))
        highlightedEntities = []
        viewer.scene.requestRender()
    }
}

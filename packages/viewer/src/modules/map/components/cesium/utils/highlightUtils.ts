import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { GeoJsonGeometryTypes } from 'geojson'

import { WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import log, { LogPreDefinedColor } from '@swissgeo/log'
import { Cartesian3, Color, Entity, HeightReference, Viewer } from 'cesium'
import proj4 from 'proj4'

let highlightedEntities: Entity[] = []
const highlightFill = Color.fromCssColorString('rgba(255, 255, 0, 0.75)')
const highlightedStroke = Color.fromCssColorString('rgba(255, 128, 0, 1)')

// based on the highlighted Stroke color with some transparency
export const hovered3DFeatureFill = Color.fromCssColorString('rgba(255, 128, 0, 0.75)')
// based on the $primary CSS variable with some transparency
export const clicked3DFeatureFill = Color.fromCssColorString('rgba(220, 0, 24, 0.6)')
const highlightedStrokeWidth = 3

export interface HighlightGeometry {
    type: GeoJsonGeometryTypes
    coordinates: SingleCoordinate[]
}

export function highlightSelectedArea(viewer: Viewer, geometry?: HighlightGeometry): void {
    if (!geometry) {
        return
    }
    const coordinates = geometry.coordinates
    const type = geometry.type
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
            highlightPoint(viewer, coordinates[0]!)
            break
        default:
            log.error({
                title: 'highlightUtils',
                titleColor: LogPreDefinedColor.Red,
                messages: [`Geometry "${geometry.type}" not handled`],
            })
    }
    viewer.scene.requestRender()
}

export function highlightGroup(viewer: Viewer, geometries: HighlightGeometry[]) {
    unhighlightGroup(viewer)
    geometries.forEach((g) => highlightSelectedArea(viewer, g))
}

// Create a Cesium Entity representing a polygon from an array of coordinates
function createPolygon(coords: SingleCoordinate[]): Entity {
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

// Recursively extract all polygon entities from coordinates of any nesting level (Polygon, MultiPolygon, etc.)
function getAllPolygonEntities(coords: SingleCoordinate[] | SingleCoordinate[][]): Entity[] {
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
        // Base case: polygon
        return [createPolygon(coords as SingleCoordinate[])]
    } else {
        // Recursive case: multipolygon or deeper
        return coords.flatMap((coord) => getAllPolygonEntities(coord as SingleCoordinate[]))
    }
}

// Highlight all polygons represented by the coordinates by adding each as a separate entity to the viewer
export function highlightPolygon(
    viewer: Viewer,
    coordinates: SingleCoordinate[] | SingleCoordinate[][]
): void {
    if (!coordinates.length) {
        return
    }
    // Add each polygon entity separately to the viewer
    const polygonEntities = getAllPolygonEntities(coordinates)
    polygonEntities.forEach((polyEntity) => {
        viewer.entities.add(polyEntity)
        highlightedEntities.push(polyEntity)
    })
    viewer.scene.requestRender()
}

export function highlightLine(viewer: Viewer, coordinates: SingleCoordinate[]) {
    const convertedCoords = coordinates.map((c) => {
        const degCoords = proj4(WEBMERCATOR.epsg, WGS84.epsg, c)
        return Cartesian3.fromDegrees(degCoords[0], degCoords[1])
    })
    const entity = viewer.entities.add({
        polyline: {
            positions: convertedCoords,
            material: highlightFill,
            clampToGround: true,
            width: 6,
        },
    })
    highlightedEntities.push(entity)
    viewer.scene.requestRender()
}

export function highlightPoint(viewer: Viewer, coordinates: SingleCoordinate) {
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

export function unhighlightGroup(viewer: Viewer) {
    if (highlightedEntities?.length) {
        highlightedEntities.forEach((e) => viewer.entities.remove(e))
        highlightedEntities = []
        viewer.scene.requestRender()
    }
}

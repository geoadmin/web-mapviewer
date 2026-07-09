import { VectorTile } from '@mapbox/vector-tile'
import {
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    Rectangle,
    WebMercatorProjection,
    WebMercatorTilingScheme,
} from 'cesium'
import Pbf from 'pbf'

const DEFAULT_FONT_SIZE = 13
const DEFAULT_MIN_ALT = 0
const MAX_VISIBLE_TILE_COUNT = 50000
const WEB_MERCATOR_TILING_SCHEME = new WebMercatorTilingScheme()
const WEB_MERCATOR_PROJECTION = WEB_MERCATOR_TILING_SCHEME.projection
const WEB_MERCATOR_MAX_LATITUDE = CesiumMath.toDegrees(WebMercatorProjection.MaximumLatitude)

function trimSlashes(value) {
    return `${value}`.replace(/^\/+|\/+$/g, '')
}

function joinUrlParts(...parts) {
    return parts
        .filter((part) => part !== null && part !== undefined && part !== '')
        .map((part, index) => {
            if (index === 0) {
                return `${part}`.replace(/\/+$/g, '')
            }
            return trimSlashes(part)
        })
        .join('/')
}

function assertFiniteNumber(value, fieldName) {
    if (!Number.isFinite(value)) {
        throw new TypeError(`Invalid Swissnames label ${fieldName}`)
    }
}

function assertPositiveNumber(value, fieldName) {
    assertFiniteNumber(value, fieldName)
    if (value <= 0) {
        throw new TypeError(`Invalid Swissnames label ${fieldName}`)
    }
}

function assertZoom(zoom) {
    assertFiniteNumber(zoom, 'zoom')
    if (!Number.isInteger(zoom) || zoom < 0) {
        throw new TypeError('Invalid Swissnames label zoom')
    }
}

function assertFiniteFields(value, fieldName, fields) {
    if (!value) {
        throw new TypeError(`Invalid Swissnames label ${fieldName}`)
    }
    for (const field of fields) {
        assertFiniteNumber(value[field], `${fieldName}.${field}`)
    }
}

function normalizeOptionalNumber(value, defaultValue, fieldName) {
    if (value === null || value === undefined) {
        return defaultValue
    }
    assertFiniteNumber(value, fieldName)
    return value
}

function clampLatitude(latitude) {
    return CesiumMath.clamp(latitude, -WEB_MERCATOR_MAX_LATITUDE, WEB_MERCATOR_MAX_LATITUDE)
}

function positionToTileXY(longitude, latitude, zoom) {
    return WEB_MERCATOR_TILING_SCHEME.positionToTileXY(
        Cartographic.fromDegrees(CesiumMath.clamp(longitude, -180, 180), clampLatitude(latitude)),
        zoom
    )
}

function clampTileCoordinate(value, zoom) {
    const maxTileCoordinate = 2 ** zoom - 1
    return Math.max(0, Math.min(maxTileCoordinate, value))
}

function pointInNativeBoundsToWgs84(point, extent, nativeBounds) {
    const xFraction = point.x / extent
    const yFraction = point.y / extent
    const xMercator = nativeBounds.west + xFraction * (nativeBounds.east - nativeBounds.west)
    const yMercator = nativeBounds.north + yFraction * (nativeBounds.south - nativeBounds.north)
    const cartographic = WEB_MERCATOR_PROJECTION.unproject(new Cartesian3(xMercator, yMercator, 0))
    return {
        lon: CesiumMath.toDegrees(cartographic.longitude),
        lat: CesiumMath.toDegrees(cartographic.latitude),
    }
}

function tileBoundsToNativeBounds(tileBounds) {
    return WEB_MERCATOR_TILING_SCHEME.rectangleToNativeRectangle(
        Rectangle.fromDegrees(tileBounds.west, tileBounds.south, tileBounds.east, tileBounds.north)
    )
}

function firstNonEmptyValue(...values) {
    return values.find((value) => value !== null && value !== undefined && value !== '') ?? ''
}

/**
 * Builds the Swissnames MBTiles config URL for a GeoAdmin 3D layer.
 *
 * @param {string} baseUrl 3D tiles base URL for the current environment
 * @param {string} layerId Swissnames 3D layer id
 * @returns {string}
 */
export function buildSwissnamesConfigUrl(baseUrl, layerId) {
    return joinUrlParts(baseUrl, layerId, 'v1', 'mbtiles-layers.json')
}

export function buildSwissnamesTileUrl(configBaseUrl, s3BaseUrl, layerFile, tile) {
    return `${joinUrlParts(configBaseUrl, s3BaseUrl, layerFile, tile.z, tile.x, tile.y)}.pbf`
}

export function normalizeSwissnamesConfig(config) {
    if (!config || !Array.isArray(config.layers)) {
        throw new TypeError('Invalid Swissnames labels config')
    }
    return {
        version: config.version,
        s3BaseUrl: config.s3BaseUrl ?? '',
        layers: config.layers.map((layer) => normalizeSwissnamesLayer(layer)),
    }
}

export function normalizeSwissnamesLayer(layer) {
    if (!layer?.file) {
        throw new TypeError('Invalid Swissnames label layer file')
    }
    assertZoom(layer.zoom)
    return {
        ...layer,
        fontSize: normalizeOptionalNumber(layer.fontSize, DEFAULT_FONT_SIZE, 'fontSize'),
        maxAlt: normalizeOptionalNumber(layer.maxAlt, Infinity, 'maxAlt'),
        minAlt: normalizeOptionalNumber(layer.minAlt, DEFAULT_MIN_ALT, 'minAlt'),
    }
}

export function isSwissnamesLayerVisibleAtAltitude(layer, altitude) {
    return altitude >= layer.minAlt && altitude < layer.maxAlt
}

export function buildSwissnamesTileKey(layerFile, tile) {
    return `${layerFile}/${tile.z}/${tile.x}/${tile.y}`
}

export function getSwissnamesTileBounds(tile) {
    const bounds = WEB_MERCATOR_TILING_SCHEME.tileXYToRectangle(tile.x, tile.y, tile.z)
    return {
        west: CesiumMath.toDegrees(bounds.west),
        east: CesiumMath.toDegrees(bounds.east),
        north: CesiumMath.toDegrees(bounds.north),
        south: CesiumMath.toDegrees(bounds.south),
    }
}

export function getVisibleSwissnamesTiles(rectangle, zoom, maxTileCount = MAX_VISIBLE_TILE_COUNT) {
    assertFiniteFields(rectangle, 'rectangle', ['west', 'east', 'north', 'south'])
    const northWestTile = positionToTileXY(rectangle.west, rectangle.north, zoom)
    const southEastTile = positionToTileXY(rectangle.east, rectangle.south, zoom)
    const xMin = clampTileCoordinate(northWestTile.x, zoom)
    const xMax = clampTileCoordinate(southEastTile.x, zoom)
    const yMin = clampTileCoordinate(northWestTile.y, zoom)
    const yMax = clampTileCoordinate(southEastTile.y, zoom)
    const xCount = xMax - xMin + 1
    const yCount = yMax - yMin + 1
    if (xCount <= 0 || yCount <= 0 || xCount * yCount > maxTileCount) {
        return []
    }
    const tiles = []
    for (let x = xMin; x <= xMax; x += 1) {
        for (let y = yMin; y <= yMax; y += 1) {
            tiles.push({ x, y, z: zoom })
        }
    }
    return tiles
}

export function mvtPointToWgs84(point, extent, tileBounds) {
    assertPositiveNumber(extent, 'extent')
    assertFiniteFields(point, 'point', ['x', 'y'])
    assertFiniteFields(tileBounds, 'tileBounds', ['west', 'east', 'north', 'south'])
    return pointInNativeBoundsToWgs84(point, extent, tileBoundsToNativeBounds(tileBounds))
}

export function extractSwissnamesFeatureProperties(properties = {}) {
    const props = properties ?? {}
    return {
        text: firstNonEmptyValue(props.name, props.Name, props.NAME, props.label, props.title),
        type: firstNonEmptyValue(props.type, props.Type, props.TYPE),
    }
}

export function decodeSwissnamesFeatures(buffer, tile, layerName = 'labels') {
    const vectorTile = new VectorTile(new Pbf(buffer))
    const mvtLayer = vectorTile.layers[layerName]
    if (!mvtLayer) {
        return []
    }
    const nativeBounds = WEB_MERCATOR_TILING_SCHEME.tileXYToNativeRectangle(tile.x, tile.y, tile.z)
    const features = []
    for (let index = 0; index < mvtLayer.length; index += 1) {
        const feature = mvtLayer.feature(index)
        const point = feature.loadGeometry()?.[0]?.[0]
        if (!point) {
            continue
        }
        const { text, type } = extractSwissnamesFeatureProperties(feature.properties)
        if (!text) {
            continue
        }
        features.push({
            ...pointInNativeBoundsToWgs84(point, mvtLayer.extent, nativeBounds),
            text,
            type,
        })
    }
    return features
}

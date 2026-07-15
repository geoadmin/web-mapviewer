import {
    Cartographic,
    Math as CesiumMath,
    WebMercatorProjection,
    WebMercatorTilingScheme,
} from 'cesium'

const MAX_VISIBLE_TILE_COUNT = 50000
const WEB_MERCATOR_TILING_SCHEME = new WebMercatorTilingScheme()
const WEB_MERCATOR_MAX_LATITUDE = CesiumMath.toDegrees(WebMercatorProjection.MaximumLatitude)

function assertFiniteNumber(value, fieldName) {
    if (!Number.isFinite(value)) {
        throw new TypeError(`Invalid Swissnames label ${fieldName}`)
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

export function isSwissnamesLayerVisibleAtAltitude(layer, altitude) {
    return altitude >= layer.minAlt && altitude < layer.maxAlt
}

export function buildSwissnamesTileKey(layerId, tile) {
    return `${layerId}/${tile.z}/${tile.x}/${tile.y}`
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

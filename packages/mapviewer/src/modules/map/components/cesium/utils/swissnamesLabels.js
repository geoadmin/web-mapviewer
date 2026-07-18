import {
    Cartographic,
    Math as CesiumMath,
    WebMercatorProjection,
    WebMercatorTilingScheme,
} from 'cesium'

const MAX_VISIBLE_TILE_COUNT = 50000
const WEB_MERCATOR_TILING_SCHEME = new WebMercatorTilingScheme()
const WEB_MERCATOR_MAX_LATITUDE = CesiumMath.toDegrees(WebMercatorProjection.MaximumLatitude)

function clampLatitude(latitude) {
    return CesiumMath.clamp(latitude, -WEB_MERCATOR_MAX_LATITUDE, WEB_MERCATOR_MAX_LATITUDE)
}

function positionToTileXY(longitude, latitude, zoom) {
    return WEB_MERCATOR_TILING_SCHEME.positionToTileXY(
        Cartographic.fromDegrees(CesiumMath.clamp(longitude, -180, 180), clampLatitude(latitude)),
        zoom
    )
}

export function isSwissnamesLayerVisibleAtAltitude(layer, altitude) {
    return altitude >= layer.minAlt && (layer.maxAlt === null || altitude < layer.maxAlt)
}

export function buildSwissnamesTileKey(layerId, tile) {
    return `${layerId}/${tile.z}/${tile.x}/${tile.y}`
}

export function getVisibleSwissnamesTiles(rectangle, zoom) {
    const northWestTile = positionToTileXY(rectangle.west, rectangle.north, zoom)
    const southEastTile = positionToTileXY(rectangle.east, rectangle.south, zoom)
    const xMin = northWestTile.x
    const xMax = southEastTile.x
    const yMin = northWestTile.y
    const yMax = southEastTile.y
    const xCount = xMax - xMin + 1
    const yCount = yMax - yMin + 1
    if (xCount * yCount > MAX_VISIBLE_TILE_COUNT) {
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

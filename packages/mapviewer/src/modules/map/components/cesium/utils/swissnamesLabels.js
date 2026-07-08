const DEFAULT_FONT_SIZE = 13
const DEFAULT_MIN_ALT = 0
const MAX_VISIBLE_TILE_COUNT = 50000
const WEB_MERCATOR_HALF_WORLD = Math.PI * 6378137
const WEB_MERCATOR_MAX_LATITUDE = 85.0511287798066

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
    assertFiniteNumber(latitude, 'latitude')
    return Math.max(-WEB_MERCATOR_MAX_LATITUDE, Math.min(WEB_MERCATOR_MAX_LATITUDE, latitude))
}

function longitudeToTileX(longitude, zoom) {
    const tileCount = 2 ** zoom
    return Math.floor(((longitude + 180) / 360) * tileCount)
}

function latitudeToTileY(latitude, zoom) {
    const clampedLatitude = clampLatitude(latitude)
    const latitudeRadians = (clampedLatitude * Math.PI) / 180
    const tileCount = 2 ** zoom
    return Math.floor(
        ((1 - Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) / Math.PI) / 2) *
            tileCount
    )
}

function clampTileCoordinate(value, zoom) {
    const maxTileCoordinate = 2 ** zoom - 1
    return Math.max(0, Math.min(maxTileCoordinate, value))
}

function mercatorYToLatitude(mercatorY) {
    return (
        (180 / Math.PI) *
        (2 * Math.atan(Math.exp((mercatorY / WEB_MERCATOR_HALF_WORLD) * Math.PI)) - Math.PI / 2)
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
    const tileCount = 2 ** tile.z
    return {
        west: (tile.x / tileCount) * 360 - 180,
        east: ((tile.x + 1) / tileCount) * 360 - 180,
        north: (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - (2 * tile.y) / tileCount))),
        south:
            (180 / Math.PI) * Math.atan(Math.sinh(Math.PI * (1 - (2 * (tile.y + 1)) / tileCount))),
    }
}

export function getVisibleSwissnamesTiles(rectangle, zoom, maxTileCount = MAX_VISIBLE_TILE_COUNT) {
    assertFiniteFields(rectangle, 'rectangle', ['west', 'east', 'north', 'south'])
    const xMin = clampTileCoordinate(longitudeToTileX(rectangle.west, zoom), zoom)
    const xMax = clampTileCoordinate(longitudeToTileX(rectangle.east, zoom), zoom)
    const yMin = clampTileCoordinate(latitudeToTileY(rectangle.north, zoom), zoom)
    const yMax = clampTileCoordinate(latitudeToTileY(rectangle.south, zoom), zoom)
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
    const xFraction = point.x / extent
    const yFraction = point.y / extent
    const westMercator = (tileBounds.west * WEB_MERCATOR_HALF_WORLD) / 180
    const eastMercator = (tileBounds.east * WEB_MERCATOR_HALF_WORLD) / 180
    const northMercator =
        (Math.log(Math.tan(((90 + tileBounds.north) * Math.PI) / 360)) / Math.PI) *
        WEB_MERCATOR_HALF_WORLD
    const southMercator =
        (Math.log(Math.tan(((90 + tileBounds.south) * Math.PI) / 360)) / Math.PI) *
        WEB_MERCATOR_HALF_WORLD
    const xMercator = westMercator + xFraction * (eastMercator - westMercator)
    const yMercator = northMercator + yFraction * (southMercator - northMercator)
    return {
        lon: (xMercator * 180) / WEB_MERCATOR_HALF_WORLD,
        lat: mercatorYToLatitude(yMercator),
    }
}

export function extractSwissnamesFeatureProperties(properties = {}) {
    const props = properties ?? {}
    return {
        text: firstNonEmptyValue(props.name, props.Name, props.NAME, props.label, props.title),
        type: firstNonEmptyValue(props.type, props.Type, props.TYPE),
    }
}

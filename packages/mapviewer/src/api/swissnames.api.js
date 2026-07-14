/**
 * Temporary adapter for the PB-2246 prototype publication.
 *
 * Producer hand-off:
 *
 * - Publish finite `fontSize` and `minAlt` values for every layer to remove client defaults.
 * - Publish an explicit open-ended altitude value to remove the `null` to `Infinity` mapping.
 *
 * This boundary owns only manifest transport and adaptation.
 */

const CONFIG_PATH = 'v1/mbtiles-layers.json'
const DEFAULT_FONT_SIZE = 13
const DEFAULT_MIN_ALT = 0

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

function assertZoom(zoom) {
    assertFiniteNumber(zoom, 'zoom')
    if (!Number.isInteger(zoom) || zoom < 0) {
        throw new TypeError('Invalid Swissnames label zoom')
    }
}

function normalizeOptionalNumber(value, defaultValue, fieldName) {
    if (value === null || value === undefined) {
        return defaultValue
    }
    assertFiniteNumber(value, fieldName)
    return value
}

function normalizeLayer(layer) {
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

function normalizeConfig(config) {
    if (!config || !Array.isArray(config.layers)) {
        throw new TypeError('Invalid Swissnames labels config')
    }
    return {
        version: config.version,
        s3BaseUrl: config.s3BaseUrl ?? '',
        layers: config.layers.map(normalizeLayer),
    }
}

/**
 * Creates the adapter for the temporary PB-2246 publication contract.
 *
 * @param {string} baseUrl 3D data base URL for the current environment
 * @param {string} layerId Swissnames layer ID
 * @param {typeof fetch} fetchData Fetch implementation
 * @returns {{ configBaseUrl: string; loadConfig: Function }}
 */
export function createSwissnamesLabelDataAdapter(baseUrl, layerId, fetchData = fetch) {
    const configUrl = joinUrlParts(baseUrl, layerId, CONFIG_PATH)

    async function loadConfig() {
        const response = await fetchData(configUrl)
        if (!response.ok) {
            throw new Error(`Swissnames labels config returned HTTP ${response.status}`)
        }
        return normalizeConfig(await response.json())
    }

    return {
        configBaseUrl: configUrl.replace(/\/mbtiles-layers\.json$/, ''),
        loadConfig,
    }
}

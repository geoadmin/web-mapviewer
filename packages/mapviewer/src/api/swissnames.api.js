import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'

/**
 * Temporary adapter for the PB-2246 prototype publication.
 *
 * Producer hand-off:
 *
 * - Publish manifest fields as `id` and `tileZoom` to remove the `file`/`zoom` mapping.
 * - Publish an explicit open-ended altitude contract to remove the `null` to `Infinity` mapping.
 * - Publish feature properties as `text` and `type` to remove the `Name`/`TYPE` mapping.
 * - Publish point labels only in their owning tile to remove the vector-tile buffer filter.
 *
 * PBF decoding and `toGeoJSON` are transport work. They remain until the publication changes to a
 * format that Cesium can render as tiled text labels directly.
 */

const CONFIG_PATH = 'v1/mbtiles-layers.json'
const VECTOR_LAYER_NAME = 'labels'

function assertFiniteNumber(value, fieldName) {
    if (!Number.isFinite(value)) {
        throw new TypeError(`Invalid Swissnames label ${fieldName}`)
    }
}

function adaptLayer(layer) {
    if (!layer?.file) {
        throw new TypeError('Invalid Swissnames label layer file')
    }
    if (!Number.isInteger(layer.zoom) || layer.zoom < 0) {
        throw new TypeError('Invalid Swissnames label zoom')
    }
    assertFiniteNumber(layer.minAlt, 'minAlt')
    assertFiniteNumber(layer.fontSize, 'fontSize')
    if (layer.maxAlt !== null) {
        assertFiniteNumber(layer.maxAlt, 'maxAlt')
    }
    return {
        id: layer.file,
        fontSize: layer.fontSize,
        maxAlt: layer.maxAlt ?? Infinity,
        minAlt: layer.minAlt,
        tileZoom: layer.zoom,
    }
}

function adaptConfig(config) {
    if (!config || typeof config.s3BaseUrl !== 'string' || !Array.isArray(config.layers)) {
        throw new TypeError('Invalid Swissnames labels config')
    }
    return {
        s3BaseUrl: config.s3BaseUrl,
        layers: config.layers.map(adaptLayer),
    }
}
function adaptFeature(feature, tile) {
    const point = feature.loadGeometry()?.[0]?.[0]
    // Tile buffers repeat edge labels in neighboring tiles; [0, extent) selects one copy.
    if (
        !point ||
        point.x < 0 ||
        point.x >= feature.extent ||
        point.y < 0 ||
        point.y >= feature.extent
    ) {
        return null
    }
    const { geometry } = feature.toGeoJSON(tile.x, tile.y, tile.z)
    const text = feature.properties.Name
    if (geometry?.type !== 'Point' || typeof text !== 'string' || !text) {
        return null
    }
    const [lon, lat] = geometry.coordinates
    return {
        lon,
        lat,
        text,
        type: typeof feature.properties.TYPE === 'string' ? feature.properties.TYPE : '',
    }
}

function decodeFeatures(buffer, tile) {
    const layer = new VectorTile(new Pbf(buffer)).layers[VECTOR_LAYER_NAME]
    if (!layer) {
        return []
    }
    const features = []
    for (let index = 0; index < layer.length; index += 1) {
        const feature = adaptFeature(layer.feature(index), tile)
        if (feature) {
            features.push(feature)
        }
    }
    return features
}

/**
 * Creates the PB-2246 publication adapter used by the Swissnames renderer.
 *
 * @param {string} baseUrl 3D data base URL for the current environment
 * @param {string} layerId Swissnames layer ID
 * @param {typeof fetch} fetchData Fetch implementation
 * @returns {{ loadFeatures: Function; loadLayers: Function }}
 */
export function createSwissnamesLabelDataAdapter(baseUrl, layerId, fetchData = fetch) {
    const configUrl = `${baseUrl}${layerId}/${CONFIG_PATH}`
    const configBaseUrl = configUrl.replace(/\/mbtiles-layers\.json$/, '')
    let tileBaseUrl = null

    async function loadLayers() {
        const response = await fetchData(configUrl)
        if (!response.ok) {
            throw new Error(`Swissnames labels config returned HTTP ${response.status}`)
        }
        const config = adaptConfig(await response.json())
        tileBaseUrl = `${configBaseUrl}${config.s3BaseUrl}`
        return config.layers
    }

    async function loadFeatures(layer, tile, signal) {
        if (!tileBaseUrl) {
            throw new Error('Swissnames labels config must be loaded before its tiles')
        }
        const key = `${layer.id}/${tile.z}/${tile.x}/${tile.y}`
        const response = await fetchData(`${tileBaseUrl}/${key}.pbf`, { signal })
        if (!response.ok) {
            // The prototype publication returns 403 for sparse tiles.
            if (response.status === 403) {
                return []
            }
            throw new Error(`Swissnames tile ${key} returned HTTP ${response.status}`)
        }
        return decodeFeatures(await response.arrayBuffer(), tile)
    }

    return {
        loadFeatures,
        loadLayers,
    }
}
